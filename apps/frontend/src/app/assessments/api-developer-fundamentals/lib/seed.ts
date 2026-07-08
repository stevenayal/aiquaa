import { ensureAssessmentSeeded } from '../../_shared/lib/seed';
import {
  API_DEVELOPER_FUNDAMENTALS_SEED_VERSION,
  apiDeveloperFundamentalsDefinition,
} from '../data/assessment-definition';

export async function ensureApiDeveloperFundamentalsSeeded() {
  return ensureAssessmentSeeded(
    apiDeveloperFundamentalsDefinition,
    API_DEVELOPER_FUNDAMENTALS_SEED_VERSION
  );
}
