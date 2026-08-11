import { ensureAssessmentSeeded } from '../../_shared/lib/seed';
import {
  OBSERVABILITY_FUNDAMENTALS_SEED_VERSION,
  observabilityFundamentalsDefinition,
} from '../data/assessment-definition';

export async function ensureObservabilityFundamentalsSeeded() {
  return ensureAssessmentSeeded(
    observabilityFundamentalsDefinition,
    OBSERVABILITY_FUNDAMENTALS_SEED_VERSION
  );
}
