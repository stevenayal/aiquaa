import { ensureAssessmentSeeded } from '../../_shared/lib/seed';
import {
  CLASE3_DATA_PERSISTENCIA_SEED_VERSION,
  clase3DataPersistenciaDefinition,
} from '../data/assessment-definition';

export async function ensureClase3DataPersistenciaSeeded() {
  return ensureAssessmentSeeded(
    clase3DataPersistenciaDefinition,
    CLASE3_DATA_PERSISTENCIA_SEED_VERSION
  );
}
