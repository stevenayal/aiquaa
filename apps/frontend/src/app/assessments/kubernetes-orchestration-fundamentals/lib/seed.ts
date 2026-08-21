import { ensureAssessmentSeeded } from '../../_shared/lib/seed';
import {
  KUBERNETES_ORCHESTRATION_FUNDAMENTALS_SEED_VERSION,
  kubernetesOrchestrationFundamentalsDefinition,
} from '../data/assessment-definition';

export async function ensureKubernetesOrchestrationFundamentalsSeeded() {
  return ensureAssessmentSeeded(
    kubernetesOrchestrationFundamentalsDefinition,
    KUBERNETES_ORCHESTRATION_FUNDAMENTALS_SEED_VERSION
  );
}
