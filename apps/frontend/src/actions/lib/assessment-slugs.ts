/**
 * Assessment slugs (from `assessments.slug`) counted as part of a hiring
 * process's exam requirements. Shared between the candidate-facing
 * (`candidate-events.ts`) and empresa-facing (`employer.ts`) progress
 * queries so the two views can't drift out of sync with each other.
 */
export const PROCESS_ASSESSMENT_SLUGS = [
  'database-fundamentals',
  'database-practice',
  'infrastructure-fundamentals',
  'api-developer-fundamentals',
  'gherkin-fundamentals',
  'api-dotnet-fundamentals',
  'docker-fundamentals',
  'kubernetes-helm-fundamentals',
  'kubernetes-orchestration-fundamentals',
  'observability-fundamentals',
  'cicd-fundamentals',
];
