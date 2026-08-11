import { ensureAssessmentSeeded } from '../../_shared/lib/seed';
import {
  DOCKER_FUNDAMENTALS_SEED_VERSION,
  dockerFundamentalsDefinition,
} from '../data/assessment-definition';

export async function ensureDockerFundamentalsSeeded() {
  return ensureAssessmentSeeded(
    dockerFundamentalsDefinition,
    DOCKER_FUNDAMENTALS_SEED_VERSION
  );
}
