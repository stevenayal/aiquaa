import { ensureAssessmentSeeded } from '../../_shared/lib/seed';
import {
  PLAYWRIGHT_FUNDAMENTALS_SEED_VERSION,
  playwrightFundamentalsDefinition,
} from '../data/assessment-definition';

export async function ensurePlaywrightFundamentalsSeeded() {
  return ensureAssessmentSeeded(
    playwrightFundamentalsDefinition,
    PLAYWRIGHT_FUNDAMENTALS_SEED_VERSION
  );
}
