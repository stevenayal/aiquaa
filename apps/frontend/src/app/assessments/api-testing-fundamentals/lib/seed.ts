import { ensureAssessmentSeeded } from '../../_shared/lib/seed';
import {
  API_TESTING_SEED_VERSION,
  apiTestingFundamentalsDefinition,
} from '../data/assessment-definition';

export async function ensureApiTestingFundamentalsSeeded() {
  return ensureAssessmentSeeded(
    apiTestingFundamentalsDefinition,
    API_TESTING_SEED_VERSION
  );
}
