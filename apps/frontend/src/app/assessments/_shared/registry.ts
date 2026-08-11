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
  PLAYWRIGHT_FUNDAMENTALS_SEED_VERSION,
  PLAYWRIGHT_FUNDAMENTALS_SLUG,
} from '../playwright-fundamentals/data/assessment-definition';
import {
  PLAYWRIGHT_FUNDAMENTALS_GAMIFICATION_RULES,
  buildPlaywrightFundamentalsGamificationEvents,
} from '../playwright-fundamentals/lib/gamification';
import { ensurePlaywrightFundamentalsSeeded } from '../playwright-fundamentals/lib/seed';
import type {
  AssessmentGamificationEvent,
  AssessmentGamificationRule,
} from './lib/gamification';

export type AssessmentExamType =
  | 'api-developer-fundamentals'
  | 'api-dotnet-fundamentals'
  | 'api-testing-fundamentals'
  | 'docker-fundamentals'
  | 'database-fundamentals'
  | 'database-practice'
  | 'gherkin-fundamentals'
  | 'infrastructure-fundamentals'
  | 'kubernetes-helm-fundamentals'
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
