import { databaseFundamentalsDefinition } from './data/assessment-definition';
import AssessmentWelcome from '../_shared/components/AssessmentWelcome';

export default function DatabaseFundamentalsPage() {
  const overview = {
    assessment: {
      id: 'static-database-fundamentals',
      slug: databaseFundamentalsDefinition.slug,
      title: databaseFundamentalsDefinition.title,
      description: databaseFundamentalsDefinition.description,
      level: databaseFundamentalsDefinition.level,
      type: databaseFundamentalsDefinition.type,
      duration_minutes: databaseFundamentalsDefinition.duration_minutes,
      total_score: databaseFundamentalsDefinition.total_score,
      is_active: databaseFundamentalsDefinition.is_active,
      metadata: databaseFundamentalsDefinition.metadata,
    },
    sections: databaseFundamentalsDefinition.sections.map((section, index) => ({
      id: `static-section-${index + 1}`,
      assessment_id: 'static-database-fundamentals',
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
      startHref="/assessments/database-fundamentals/start"
      evaluatesCopy="Modelo relacional, claves primarias y foráneas, tipos de datos, consultas SELECT, JOINs, agregaciones y constraints."
      scoringCopy="Automático en los 3 niveles: selección múltiple, verdadero/falso y respuestas cortas por keywords."
      resultCopy="Score total, score por nivel, fortalezas, debilidades y temas a reforzar."
    />
  );
}
