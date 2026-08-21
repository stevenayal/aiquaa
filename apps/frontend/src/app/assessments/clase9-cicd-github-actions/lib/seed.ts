import { ensureAssessmentSeeded } from '../../_shared/lib/seed';
import {
  CLASE9_CICD_GITHUB_ACTIONS_SEED_VERSION,
  clase9CicdGithubActionsDefinition,
} from '../data/assessment-definition';

export async function ensureClase9CicdGithubActionsSeeded() {
  return ensureAssessmentSeeded(
    clase9CicdGithubActionsDefinition,
    CLASE9_CICD_GITHUB_ACTIONS_SEED_VERSION
  );
}
