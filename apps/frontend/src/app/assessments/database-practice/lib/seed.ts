import { ensureAssessmentSeeded } from '../../_shared/lib/seed';
import {
  DATABASE_PRACTICE_SEED_VERSION,
  databasePracticeDefinition,
} from '../data/assessment-definition';

export async function ensureDatabasePracticeSeeded() {
  return ensureAssessmentSeeded(
    databasePracticeDefinition,
    DATABASE_PRACTICE_SEED_VERSION
  );
}
