import { ensureAssessmentSeeded } from '../../_shared/lib/seed';
import {
  GHERKIN_FUNDAMENTALS_SEED_VERSION,
  gherkinFundamentalsDefinition,
} from '../data/assessment-definition';

export async function ensureGherkinFundamentalsSeeded() {
  return ensureAssessmentSeeded(
    gherkinFundamentalsDefinition,
    GHERKIN_FUNDAMENTALS_SEED_VERSION
  );
}
