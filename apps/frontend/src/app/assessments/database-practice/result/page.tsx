'use client';

import AssessmentResultClient from '../../_shared/components/AssessmentResultClient';

export default function DatabasePracticeResultPage() {
  return (
    <AssessmentResultClient
      startHref="/assessments/database-practice/start"
      fallbackRecommendation="Seguí practicando queries de validación de datos sobre esquemas reales."
    />
  );
}
