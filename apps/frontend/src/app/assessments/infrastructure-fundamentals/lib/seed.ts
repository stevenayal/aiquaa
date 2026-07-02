import { ensureAssessmentSeeded } from '../../_shared/lib/seed';
import {
  INFRASTRUCTURE_FUNDAMENTALS_SEED_VERSION,
  infrastructureFundamentalsDefinition,
} from '../data/assessment-definition';

export async function ensureInfrastructureFundamentalsSeeded() {
  return ensureAssessmentSeeded(
    infrastructureFundamentalsDefinition,
    INFRASTRUCTURE_FUNDAMENTALS_SEED_VERSION
  );
}
