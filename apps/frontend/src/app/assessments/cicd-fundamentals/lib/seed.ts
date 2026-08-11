import { ensureAssessmentSeeded } from '../../_shared/lib/seed';
import {
  CICD_FUNDAMENTALS_SEED_VERSION,
  cicdFundamentalsDefinition,
} from '../data/assessment-definition';

export async function ensureCicdFundamentalsSeeded() {
  return ensureAssessmentSeeded(
    cicdFundamentalsDefinition,
    CICD_FUNDAMENTALS_SEED_VERSION
  );
}
