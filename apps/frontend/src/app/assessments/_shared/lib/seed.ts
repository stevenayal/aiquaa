import { createAdminClient } from '@/lib/supabase/admin';
import type { AssessmentSeedDefinition } from '../types';

// Siembra (o re-siembra) un assessment completo a partir de su definición.
// Idempotente: upsert por slug/order_index y poda de secciones y preguntas
// que ya no existen en la definición.
export async function ensureAssessmentSeeded(
  definition: AssessmentSeedDefinition,
  seedVersion: number
) {
  const supabase = createAdminClient();

  const assessmentPayload = {
    slug: definition.slug,
    title: definition.title,
    description: definition.description,
    level: definition.level,
    type: definition.type,
    duration_minutes: definition.duration_minutes,
    total_score: definition.total_score,
    is_active: definition.is_active,
    metadata: {
      ...(definition.metadata ?? {}),
      seedVersion,
    },
    updated_at: new Date().toISOString(),
  };

  const { data: assessment, error: assessmentError } = await supabase
    .from('assessments')
    .upsert(assessmentPayload, { onConflict: 'slug' })
    .select('id, slug')
    .single();

  if (assessmentError || !assessment) {
    throw new Error(
      assessmentError?.message ??
        'No se pudo sembrar el catálogo del assessment'
    );
  }

  const sectionPayload = definition.sections.map((section) => ({
    assessment_id: assessment.id,
    slug: section.slug,
    title: section.title,
    description: section.description,
    order_index: section.order_index,
    max_score: section.max_score,
    metadata: section.metadata ?? {},
  }));

  const { error: sectionsError } = await supabase
    .from('assessment_sections')
    .upsert(sectionPayload, { onConflict: 'assessment_id,order_index' });

  if (sectionsError) {
    throw new Error(sectionsError.message);
  }

  const { data: sections, error: fetchSectionsError } = await supabase
    .from('assessment_sections')
    .select('id, slug, order_index')
    .eq('assessment_id', assessment.id);

  if (fetchSectionsError || !sections) {
    throw new Error(
      fetchSectionsError?.message ??
        'No se pudieron leer las secciones del assessment'
    );
  }

  // Podar secciones que ya no existen en la definición (las FK en cascada
  // eliminan sus preguntas, respuestas y scores).
  const definedSlugs = new Set(
    definition.sections.map((section) => section.slug)
  );
  const staleSectionIds = sections
    .filter((section) => !definedSlugs.has(section.slug))
    .map((section) => section.id);

  if (staleSectionIds.length > 0) {
    const { error: pruneSectionsError } = await supabase
      .from('assessment_sections')
      .delete()
      .in('id', staleSectionIds);

    if (pruneSectionsError) {
      throw new Error(pruneSectionsError.message);
    }
  }

  for (const section of definition.sections) {
    const seededSection = sections.find((item) => item.slug === section.slug);

    if (!seededSection) {
      throw new Error(
        `No se encontró la sección ${section.slug} después del seed`
      );
    }

    const questionPayload = section.questions.map((question) => ({
      section_id: seededSection.id,
      question_type: question.question_type,
      prompt: question.prompt,
      description: question.description ?? null,
      options: question.options ?? [],
      correct_answer: question.correct_answer ?? null,
      expected_keywords: question.expected_keywords ?? [],
      explanation: question.explanation ?? null,
      metadata: question.metadata ?? {},
      scoring_rules: question.scoring_rules ?? {},
      rubric: question.rubric ?? {},
      points: question.points,
      order_index: question.order_index,
    }));

    const { error: questionsError } = await supabase
      .from('assessment_questions')
      .upsert(questionPayload, { onConflict: 'section_id,order_index' });

    if (questionsError) {
      throw new Error(questionsError.message);
    }

    // Podar preguntas sobrantes si la sección se achicó respecto al seed previo.
    const { error: pruneQuestionsError } = await supabase
      .from('assessment_questions')
      .delete()
      .eq('section_id', seededSection.id)
      .gt('order_index', section.questions.length);

    if (pruneQuestionsError) {
      throw new Error(pruneQuestionsError.message);
    }
  }

  return assessment;
}
