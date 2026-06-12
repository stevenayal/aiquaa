'use client';

import AssessmentResultClient from '../../_shared/components/AssessmentResultClient';

export default function DatabaseFundamentalsResultPage() {
  return (
    <AssessmentResultClient
      startHref="/assessments/database-fundamentals/start"
      fallbackRecommendation="Seguí practicando consultas SQL y modelado relacional con casos reales."
    />
  );
}
