import { apiTestingFundamentalsDefinition } from './data/assessment-definition';
import AssessmentWelcome from './components/AssessmentWelcome';

export default function ApiTestingFundamentalsPage() {
  const overview = {
    assessment: {
      id: 'static-api-testing-fundamentals',
      slug: apiTestingFundamentalsDefinition.slug,
      title: apiTestingFundamentalsDefinition.title,
      description: apiTestingFundamentalsDefinition.description,
      level: apiTestingFundamentalsDefinition.level,
      type: apiTestingFundamentalsDefinition.type,
      duration_minutes: apiTestingFundamentalsDefinition.duration_minutes,
      total_score: apiTestingFundamentalsDefinition.total_score,
      is_active: apiTestingFundamentalsDefinition.is_active,
      metadata: apiTestingFundamentalsDefinition.metadata,
    },
    sections: apiTestingFundamentalsDefinition.sections.map(
      (section, index) => ({
        id: `static-section-${index + 1}`,
        assessment_id: 'static-api-testing-fundamentals',
        slug: section.slug,
        title: section.title,
        description: section.description,
        order_index: section.order_index,
        max_score: section.max_score,
        metadata: section.metadata,
      })
    ),
  };

  return <AssessmentWelcome overview={overview} />;
}
