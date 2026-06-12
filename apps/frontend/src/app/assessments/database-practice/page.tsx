import { databasePracticeDefinition } from './data/assessment-definition';
import AssessmentWelcome from '../_shared/components/AssessmentWelcome';

export default function DatabasePracticePage() {
  const overview = {
    assessment: {
      id: 'static-database-practice',
      slug: databasePracticeDefinition.slug,
      title: databasePracticeDefinition.title,
      description: databasePracticeDefinition.description,
      level: databasePracticeDefinition.level,
      type: databasePracticeDefinition.type,
      duration_minutes: databasePracticeDefinition.duration_minutes,
      total_score: databasePracticeDefinition.total_score,
      is_active: databasePracticeDefinition.is_active,
      metadata: databasePracticeDefinition.metadata,
    },
    sections: databasePracticeDefinition.sections.map((section, index) => ({
      id: `static-section-${index + 1}`,
      assessment_id: 'static-database-practice',
      slug: section.slug,
      title: section.title,
      description: section.description,
      order_index: section.order_index,
      max_score: section.max_score,
      metadata: section.metadata,
    })),
  };

  return (
    <AssessmentWelcome
      overview={overview}
      startHref="/assessments/database-practice/start"
      evaluatesCopy="Lectura de esquemas y datos, predicción de resultados de queries, detección de bugs en SQL y escritura de consultas de validación."
      scoringCopy="Automático en los 3 niveles: predicción, veredicto correcto/bug con justificación y escritura SQL por keywords."
      resultCopy="Score total, score por nivel, fortalezas, debilidades y temas a reforzar."
    />
  );
}
