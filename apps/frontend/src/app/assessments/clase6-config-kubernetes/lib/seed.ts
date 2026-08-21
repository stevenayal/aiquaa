import { ensureAssessmentSeeded } from '../../_shared/lib/seed';
import {
  CLASE6_CONFIG_KUBERNETES_SEED_VERSION,
  clase6ConfigKubernetesDefinition,
} from '../data/assessment-definition';

export async function ensureClase6ConfigKubernetesSeeded() {
  return ensureAssessmentSeeded(
    clase6ConfigKubernetesDefinition,
    CLASE6_CONFIG_KUBERNETES_SEED_VERSION
  );
}
