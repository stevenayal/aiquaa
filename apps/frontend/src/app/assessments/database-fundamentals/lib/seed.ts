import { ensureAssessmentSeeded } from '../../_shared/lib/seed';
import {
  DATABASE_FUNDAMENTALS_SEED_VERSION,
  databaseFundamentalsDefinition,
} from '../data/assessment-definition';

export async function ensureDatabaseFundamentalsSeeded() {
  return ensureAssessmentSeeded(
    databaseFundamentalsDefinition,
    DATABASE_FUNDAMENTALS_SEED_VERSION
  );
}
