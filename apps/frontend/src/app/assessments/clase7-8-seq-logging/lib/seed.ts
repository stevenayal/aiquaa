import { ensureAssessmentSeeded } from '../../_shared/lib/seed';
import {
  CLASE7_8_SEQ_LOGGING_SEED_VERSION,
  clase78SeqLoggingDefinition,
} from '../data/assessment-definition';

export async function ensureClase78SeqLoggingSeeded() {
  return ensureAssessmentSeeded(
    clase78SeqLoggingDefinition,
    CLASE7_8_SEQ_LOGGING_SEED_VERSION
  );
}
