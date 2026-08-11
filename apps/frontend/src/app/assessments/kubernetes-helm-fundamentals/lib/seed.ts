import { ensureAssessmentSeeded } from '../../_shared/lib/seed';
import {
  KUBERNETES_HELM_FUNDAMENTALS_SEED_VERSION,
  kubernetesHelmFundamentalsDefinition,
} from '../data/assessment-definition';

export async function ensureKubernetesHelmFundamentalsSeeded() {
  return ensureAssessmentSeeded(
    kubernetesHelmFundamentalsDefinition,
    KUBERNETES_HELM_FUNDAMENTALS_SEED_VERSION
  );
}
