import { ensureAssessmentSeeded } from '../../_shared/lib/seed';
import {
  CLASE5_KUBERNETES_SEED_VERSION,
  clase5KubernetesDefinition,
} from '../data/assessment-definition';

export async function ensureClase5KubernetesSeeded() {
  return ensureAssessmentSeeded(
    clase5KubernetesDefinition,
    CLASE5_KUBERNETES_SEED_VERSION
  );
}
