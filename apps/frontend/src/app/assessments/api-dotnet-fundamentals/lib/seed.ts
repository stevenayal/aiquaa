import { ensureAssessmentSeeded } from '../../_shared/lib/seed';
import {
  API_DOTNET_FUNDAMENTALS_SEED_VERSION,
  apiDotnetFundamentalsDefinition,
} from '../data/assessment-definition';

export async function ensureApiDotnetFundamentalsSeeded() {
  return ensureAssessmentSeeded(
    apiDotnetFundamentalsDefinition,
    API_DOTNET_FUNDAMENTALS_SEED_VERSION
  );
}
