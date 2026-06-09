import { createAdminClient } from '@/lib/supabase/admin';
import { apiTestingFundamentalsDefinition } from '../data/assessment-definition';

export async function ensureApiTestingFundamentalsSeeded() {
  const supabase = createAdminClient();

  const assessmentPayload = {
    slug: apiTestingFundamentalsDefinition.slug,
    title: apiTestingFundamentalsDefinition.title,
    description: apiTestingFundamentalsDefinition.description,
    level: apiTestingFundamentalsDefinition.level,
    type: apiTestingFundamentalsDefinition.type,
    duration_minutes: apiTestingFundamentalsDefinition.duration_minutes,
    total_score: apiTestingFundamentalsDefinition.total_score,
    is_active: apiTestingFundamentalsDefinition.is_active,
    metadata: apiTestingFundamentalsDefinition.metadata ?? {},
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

  const sectionPayload = apiTestingFundamentalsDefinition.sections.map(
    (section) => ({
      assessment_id: assessment.id,
      slug: section.slug,
      title: section.title,
      description: section.description,
      order_index: section.order_index,
      max_score: section.max_score,
      metadata: section.metadata ?? {},
    })
  );

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

  for (const section of apiTestingFundamentalsDefinition.sections) {
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
  }

  return assessment;
}
