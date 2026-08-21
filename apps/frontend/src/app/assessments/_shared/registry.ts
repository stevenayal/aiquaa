import {
  API_DEVELOPER_FUNDAMENTALS_SEED_VERSION,
  API_DEVELOPER_FUNDAMENTALS_SLUG,
} from '../api-developer-fundamentals/data/assessment-definition';
import {
  API_DEVELOPER_FUNDAMENTALS_GAMIFICATION_RULES,
  buildApiDeveloperFundamentalsGamificationEvents,
} from '../api-developer-fundamentals/lib/gamification';
import { ensureApiDeveloperFundamentalsSeeded } from '../api-developer-fundamentals/lib/seed';
import {
  API_DOTNET_FUNDAMENTALS_SEED_VERSION,
  API_DOTNET_FUNDAMENTALS_SLUG,
} from '../api-dotnet-fundamentals/data/assessment-definition';
import {
  CICD_FUNDAMENTALS_SEED_VERSION,
  CICD_FUNDAMENTALS_SLUG,
} from '../cicd-fundamentals/data/assessment-definition';
import {
  CICD_FUNDAMENTALS_GAMIFICATION_RULES,
  buildCicdFundamentalsGamificationEvents,
} from '../cicd-fundamentals/lib/gamification';
import { ensureCicdFundamentalsSeeded } from '../cicd-fundamentals/lib/seed';
import {
  API_DOTNET_FUNDAMENTALS_GAMIFICATION_RULES,
  buildApiDotnetFundamentalsGamificationEvents,
} from '../api-dotnet-fundamentals/lib/gamification';
import { ensureApiDotnetFundamentalsSeeded } from '../api-dotnet-fundamentals/lib/seed';
import {
  API_TESTING_FUNDAMENTALS_SLUG,
  API_TESTING_SEED_VERSION,
} from '../api-testing-fundamentals/data/assessment-definition';
import {
  API_TESTING_GAMIFICATION_RULES,
  buildApiTestingGamificationEvents,
} from '../api-testing-fundamentals/lib/gamification';
import { ensureApiTestingFundamentalsSeeded } from '../api-testing-fundamentals/lib/seed';
import {
  DOCKER_FUNDAMENTALS_SEED_VERSION,
  DOCKER_FUNDAMENTALS_SLUG,
} from '../docker-fundamentals/data/assessment-definition';
import {
  DOCKER_FUNDAMENTALS_GAMIFICATION_RULES,
  buildDockerFundamentalsGamificationEvents,
} from '../docker-fundamentals/lib/gamification';
import { ensureDockerFundamentalsSeeded } from '../docker-fundamentals/lib/seed';
import {
  DATABASE_FUNDAMENTALS_SEED_VERSION,
  DATABASE_FUNDAMENTALS_SLUG,
} from '../database-fundamentals/data/assessment-definition';
import {
  DATABASE_FUNDAMENTALS_GAMIFICATION_RULES,
  buildDatabaseFundamentalsGamificationEvents,
} from '../database-fundamentals/lib/gamification';
import { ensureDatabaseFundamentalsSeeded } from '../database-fundamentals/lib/seed';
import {
  DATABASE_PRACTICE_SEED_VERSION,
  DATABASE_PRACTICE_SLUG,
} from '../database-practice/data/assessment-definition';
import {
  DATABASE_PRACTICE_GAMIFICATION_RULES,
  buildDatabasePracticeGamificationEvents,
} from '../database-practice/lib/gamification';
import { ensureDatabasePracticeSeeded } from '../database-practice/lib/seed';
import {
  GHERKIN_FUNDAMENTALS_SEED_VERSION,
  GHERKIN_FUNDAMENTALS_SLUG,
} from '../gherkin-fundamentals/data/assessment-definition';
import {
  GHERKIN_FUNDAMENTALS_GAMIFICATION_RULES,
  buildGherkinFundamentalsGamificationEvents,
} from '../gherkin-fundamentals/lib/gamification';
import { ensureGherkinFundamentalsSeeded } from '../gherkin-fundamentals/lib/seed';
import {
  INFRASTRUCTURE_FUNDAMENTALS_SEED_VERSION,
  INFRASTRUCTURE_FUNDAMENTALS_SLUG,
} from '../infrastructure-fundamentals/data/assessment-definition';
import {
  INFRASTRUCTURE_FUNDAMENTALS_GAMIFICATION_RULES,
  buildInfrastructureFundamentalsGamificationEvents,
} from '../infrastructure-fundamentals/lib/gamification';
import { ensureInfrastructureFundamentalsSeeded } from '../infrastructure-fundamentals/lib/seed';
import {
  KUBERNETES_HELM_FUNDAMENTALS_SEED_VERSION,
  KUBERNETES_HELM_FUNDAMENTALS_SLUG,
} from '../kubernetes-helm-fundamentals/data/assessment-definition';
import {
  KUBERNETES_HELM_FUNDAMENTALS_GAMIFICATION_RULES,
  buildKubernetesHelmFundamentalsGamificationEvents,
} from '../kubernetes-helm-fundamentals/lib/gamification';
import { ensureKubernetesHelmFundamentalsSeeded } from '../kubernetes-helm-fundamentals/lib/seed';
import {
  OBSERVABILITY_FUNDAMENTALS_SEED_VERSION,
  OBSERVABILITY_FUNDAMENTALS_SLUG,
} from '../observability-fundamentals/data/assessment-definition';
import {
  OBSERVABILITY_FUNDAMENTALS_GAMIFICATION_RULES,
  buildObservabilityFundamentalsGamificationEvents,
} from '../observability-fundamentals/lib/gamification';
import { ensureObservabilityFundamentalsSeeded } from '../observability-fundamentals/lib/seed';
import {
  PLAYWRIGHT_FUNDAMENTALS_SEED_VERSION,
  PLAYWRIGHT_FUNDAMENTALS_SLUG,
} from '../playwright-fundamentals/data/assessment-definition';
import {
  PLAYWRIGHT_FUNDAMENTALS_GAMIFICATION_RULES,
  buildPlaywrightFundamentalsGamificationEvents,
} from '../playwright-fundamentals/lib/gamification';
import { ensurePlaywrightFundamentalsSeeded } from '../playwright-fundamentals/lib/seed';
import {
  CLASE3_DATA_PERSISTENCIA_SEED_VERSION,
  CLASE3_DATA_PERSISTENCIA_SLUG,
} from '../clase3-data-persistencia/data/assessment-definition';
import {
  CLASE3_DATA_PERSISTENCIA_GAMIFICATION_RULES,
  buildClase3DataPersistenciaGamificationEvents,
} from '../clase3-data-persistencia/lib/gamification';
import { ensureClase3DataPersistenciaSeeded } from '../clase3-data-persistencia/lib/seed';
import {
  CLASE5_KUBERNETES_SEED_VERSION,
  CLASE5_KUBERNETES_SLUG,
} from '../clase5-kubernetes/data/assessment-definition';
import {
  CLASE5_KUBERNETES_GAMIFICATION_RULES,
  buildClase5KubernetesGamificationEvents,
} from '../clase5-kubernetes/lib/gamification';
import { ensureClase5KubernetesSeeded } from '../clase5-kubernetes/lib/seed';
import {
  CLASE6_CONFIG_KUBERNETES_SEED_VERSION,
  CLASE6_CONFIG_KUBERNETES_SLUG,
} from '../clase6-config-kubernetes/data/assessment-definition';
import {
  CLASE6_CONFIG_KUBERNETES_GAMIFICATION_RULES,
  buildClase6ConfigKubernetesGamificationEvents,
} from '../clase6-config-kubernetes/lib/gamification';
import { ensureClase6ConfigKubernetesSeeded } from '../clase6-config-kubernetes/lib/seed';
import {
  CLASE7_8_SEQ_LOGGING_SEED_VERSION,
  CLASE7_8_SEQ_LOGGING_SLUG,
} from '../clase7-8-seq-logging/data/assessment-definition';
import {
  CLASE7_8_SEQ_LOGGING_GAMIFICATION_RULES,
  buildClase78SeqLoggingGamificationEvents,
} from '../clase7-8-seq-logging/lib/gamification';
import { ensureClase78SeqLoggingSeeded } from '../clase7-8-seq-logging/lib/seed';
import {
  CLASE9_CICD_GITHUB_ACTIONS_SEED_VERSION,
  CLASE9_CICD_GITHUB_ACTIONS_SLUG,
} from '../clase9-cicd-github-actions/data/assessment-definition';
import {
  CLASE9_CICD_GITHUB_ACTIONS_GAMIFICATION_RULES,
  buildClase9CicdGithubActionsGamificationEvents,
} from '../clase9-cicd-github-actions/lib/gamification';
import { ensureClase9CicdGithubActionsSeeded } from '../clase9-cicd-github-actions/lib/seed';
import type {
  AssessmentGamificationEvent,
  AssessmentGamificationRule,
} from './lib/gamification';

export type AssessmentExamType =
  | 'clase3-data-persistencia'
  | 'clase5-kubernetes'
  | 'clase6-config-kubernetes'
  | 'clase7-8-seq-logging'
  | 'clase9-cicd-github-actions'
  | 'api-developer-fundamentals'
  | 'api-dotnet-fundamentals'
  | 'api-testing-fundamentals'
  | 'cicd-fundamentals'
  | 'docker-fundamentals'
  | 'database-fundamentals'
  | 'database-practice'
  | 'gherkin-fundamentals'
  | 'infrastructure-fundamentals'
  | 'kubernetes-helm-fundamentals'
  | 'observability-fundamentals'
  | 'playwright-fundamentals';

export interface AssessmentGamificationEventInput {
  attemptId: string;
  assessmentSlug: string;
  passed: boolean;
  percentage: number;
  score: number;
  candidateLevel: string;
}

export interface AssessmentRegistryEntry {
  slug: string;
  seedVersion: number;
  ensureSeeded: () => Promise<unknown>;
  examType: AssessmentExamType;
  gamificationSource: string;
  gamificationRules: AssessmentGamificationRule[];
  buildGamificationEvents: (
    input: AssessmentGamificationEventInput
  ) => AssessmentGamificationEvent[];
}

export const DEFAULT_ASSESSMENT_SLUG = API_TESTING_FUNDAMENTALS_SLUG;

export const ASSESSMENT_REGISTRY: Record<string, AssessmentRegistryEntry> = {
  [CLASE3_DATA_PERSISTENCIA_SLUG]: {
    slug: CLASE3_DATA_PERSISTENCIA_SLUG,
    seedVersion: CLASE3_DATA_PERSISTENCIA_SEED_VERSION,
    ensureSeeded: ensureClase3DataPersistenciaSeeded,
    examType: 'clase3-data-persistencia',
    gamificationSource: 'CLASE3_DATA_PERSISTENCIA',
    gamificationRules: CLASE3_DATA_PERSISTENCIA_GAMIFICATION_RULES,
    buildGamificationEvents: buildClase3DataPersistenciaGamificationEvents,
  },
  [CLASE5_KUBERNETES_SLUG]: {
    slug: CLASE5_KUBERNETES_SLUG,
    seedVersion: CLASE5_KUBERNETES_SEED_VERSION,
    ensureSeeded: ensureClase5KubernetesSeeded,
    examType: 'clase5-kubernetes',
    gamificationSource: 'CLASE5_KUBERNETES',
    gamificationRules: CLASE5_KUBERNETES_GAMIFICATION_RULES,
    buildGamificationEvents: buildClase5KubernetesGamificationEvents,
  },
  [CLASE6_CONFIG_KUBERNETES_SLUG]: {
    slug: CLASE6_CONFIG_KUBERNETES_SLUG,
    seedVersion: CLASE6_CONFIG_KUBERNETES_SEED_VERSION,
    ensureSeeded: ensureClase6ConfigKubernetesSeeded,
    examType: 'clase6-config-kubernetes',
    gamificationSource: 'CLASE6_CONFIG_KUBERNETES',
    gamificationRules: CLASE6_CONFIG_KUBERNETES_GAMIFICATION_RULES,
    buildGamificationEvents: buildClase6ConfigKubernetesGamificationEvents,
  },
  [CLASE7_8_SEQ_LOGGING_SLUG]: {
    slug: CLASE7_8_SEQ_LOGGING_SLUG,
    seedVersion: CLASE7_8_SEQ_LOGGING_SEED_VERSION,
    ensureSeeded: ensureClase78SeqLoggingSeeded,
    examType: 'clase7-8-seq-logging',
    gamificationSource: 'CLASE7_8_SEQ_LOGGING',
    gamificationRules: CLASE7_8_SEQ_LOGGING_GAMIFICATION_RULES,
    buildGamificationEvents: buildClase78SeqLoggingGamificationEvents,
  },
  [CLASE9_CICD_GITHUB_ACTIONS_SLUG]: {
    slug: CLASE9_CICD_GITHUB_ACTIONS_SLUG,
    seedVersion: CLASE9_CICD_GITHUB_ACTIONS_SEED_VERSION,
    ensureSeeded: ensureClase9CicdGithubActionsSeeded,
    examType: 'clase9-cicd-github-actions',
    gamificationSource: 'CLASE9_CICD_GITHUB_ACTIONS',
    gamificationRules: CLASE9_CICD_GITHUB_ACTIONS_GAMIFICATION_RULES,
    buildGamificationEvents: buildClase9CicdGithubActionsGamificationEvents,
  },
  [API_DEVELOPER_FUNDAMENTALS_SLUG]: {
    slug: API_DEVELOPER_FUNDAMENTALS_SLUG,
    seedVersion: API_DEVELOPER_FUNDAMENTALS_SEED_VERSION,
    ensureSeeded: ensureApiDeveloperFundamentalsSeeded,
    examType: 'api-developer-fundamentals',
    gamificationSource: 'API_DEVELOPER_FUNDAMENTALS',
    gamificationRules: API_DEVELOPER_FUNDAMENTALS_GAMIFICATION_RULES,
    buildGamificationEvents: buildApiDeveloperFundamentalsGamificationEvents,
  },
  [API_DOTNET_FUNDAMENTALS_SLUG]: {
    slug: API_DOTNET_FUNDAMENTALS_SLUG,
    seedVersion: API_DOTNET_FUNDAMENTALS_SEED_VERSION,
    ensureSeeded: ensureApiDotnetFundamentalsSeeded,
    examType: 'api-dotnet-fundamentals',
    gamificationSource: 'API_DOTNET_FUNDAMENTALS',
    gamificationRules: API_DOTNET_FUNDAMENTALS_GAMIFICATION_RULES,
    buildGamificationEvents: buildApiDotnetFundamentalsGamificationEvents,
  },
  [CICD_FUNDAMENTALS_SLUG]: {
    slug: CICD_FUNDAMENTALS_SLUG,
    seedVersion: CICD_FUNDAMENTALS_SEED_VERSION,
    ensureSeeded: ensureCicdFundamentalsSeeded,
    examType: 'cicd-fundamentals',
    gamificationSource: 'CICD_FUNDAMENTALS',
    gamificationRules: CICD_FUNDAMENTALS_GAMIFICATION_RULES,
    buildGamificationEvents: buildCicdFundamentalsGamificationEvents,
  },
  [API_TESTING_FUNDAMENTALS_SLUG]: {
    slug: API_TESTING_FUNDAMENTALS_SLUG,
    seedVersion: API_TESTING_SEED_VERSION,
    ensureSeeded: ensureApiTestingFundamentalsSeeded,
    examType: 'api-testing-fundamentals',
    gamificationSource: 'API_TESTING_FUNDAMENTALS',
    gamificationRules: API_TESTING_GAMIFICATION_RULES,
    buildGamificationEvents: buildApiTestingGamificationEvents,
  },
  [DOCKER_FUNDAMENTALS_SLUG]: {
    slug: DOCKER_FUNDAMENTALS_SLUG,
    seedVersion: DOCKER_FUNDAMENTALS_SEED_VERSION,
    ensureSeeded: ensureDockerFundamentalsSeeded,
    examType: 'docker-fundamentals',
    gamificationSource: 'DOCKER_FUNDAMENTALS',
    gamificationRules: DOCKER_FUNDAMENTALS_GAMIFICATION_RULES,
    buildGamificationEvents: buildDockerFundamentalsGamificationEvents,
  },
  [DATABASE_FUNDAMENTALS_SLUG]: {
    slug: DATABASE_FUNDAMENTALS_SLUG,
    seedVersion: DATABASE_FUNDAMENTALS_SEED_VERSION,
    ensureSeeded: ensureDatabaseFundamentalsSeeded,
    examType: 'database-fundamentals',
    gamificationSource: 'DATABASE_FUNDAMENTALS',
    gamificationRules: DATABASE_FUNDAMENTALS_GAMIFICATION_RULES,
    buildGamificationEvents: buildDatabaseFundamentalsGamificationEvents,
  },
  [DATABASE_PRACTICE_SLUG]: {
    slug: DATABASE_PRACTICE_SLUG,
    seedVersion: DATABASE_PRACTICE_SEED_VERSION,
    ensureSeeded: ensureDatabasePracticeSeeded,
    examType: 'database-practice',
    gamificationSource: 'DATABASE_PRACTICE',
    gamificationRules: DATABASE_PRACTICE_GAMIFICATION_RULES,
    buildGamificationEvents: buildDatabasePracticeGamificationEvents,
  },
  [GHERKIN_FUNDAMENTALS_SLUG]: {
    slug: GHERKIN_FUNDAMENTALS_SLUG,
    seedVersion: GHERKIN_FUNDAMENTALS_SEED_VERSION,
    ensureSeeded: ensureGherkinFundamentalsSeeded,
    examType: 'gherkin-fundamentals',
    gamificationSource: 'GHERKIN_FUNDAMENTALS',
    gamificationRules: GHERKIN_FUNDAMENTALS_GAMIFICATION_RULES,
    buildGamificationEvents: buildGherkinFundamentalsGamificationEvents,
  },
  [INFRASTRUCTURE_FUNDAMENTALS_SLUG]: {
    slug: INFRASTRUCTURE_FUNDAMENTALS_SLUG,
    seedVersion: INFRASTRUCTURE_FUNDAMENTALS_SEED_VERSION,
    ensureSeeded: ensureInfrastructureFundamentalsSeeded,
    examType: 'infrastructure-fundamentals',
    gamificationSource: 'INFRASTRUCTURE_FUNDAMENTALS',
    gamificationRules: INFRASTRUCTURE_FUNDAMENTALS_GAMIFICATION_RULES,
    buildGamificationEvents: buildInfrastructureFundamentalsGamificationEvents,
  },
  [KUBERNETES_HELM_FUNDAMENTALS_SLUG]: {
    slug: KUBERNETES_HELM_FUNDAMENTALS_SLUG,
    seedVersion: KUBERNETES_HELM_FUNDAMENTALS_SEED_VERSION,
    ensureSeeded: ensureKubernetesHelmFundamentalsSeeded,
    examType: 'kubernetes-helm-fundamentals',
    gamificationSource: 'KUBERNETES_HELM_FUNDAMENTALS',
    gamificationRules: KUBERNETES_HELM_FUNDAMENTALS_GAMIFICATION_RULES,
    buildGamificationEvents: buildKubernetesHelmFundamentalsGamificationEvents,
  },
  [OBSERVABILITY_FUNDAMENTALS_SLUG]: {
    slug: OBSERVABILITY_FUNDAMENTALS_SLUG,
    seedVersion: OBSERVABILITY_FUNDAMENTALS_SEED_VERSION,
    ensureSeeded: ensureObservabilityFundamentalsSeeded,
    examType: 'observability-fundamentals',
    gamificationSource: 'OBSERVABILITY_FUNDAMENTALS',
    gamificationRules: OBSERVABILITY_FUNDAMENTALS_GAMIFICATION_RULES,
    buildGamificationEvents: buildObservabilityFundamentalsGamificationEvents,
  },
  [PLAYWRIGHT_FUNDAMENTALS_SLUG]: {
    slug: PLAYWRIGHT_FUNDAMENTALS_SLUG,
    seedVersion: PLAYWRIGHT_FUNDAMENTALS_SEED_VERSION,
    ensureSeeded: ensurePlaywrightFundamentalsSeeded,
    examType: 'playwright-fundamentals',
    gamificationSource: 'PLAYWRIGHT_FUNDAMENTALS',
    gamificationRules: PLAYWRIGHT_FUNDAMENTALS_GAMIFICATION_RULES,
    buildGamificationEvents: buildPlaywrightFundamentalsGamificationEvents,
  },
};
