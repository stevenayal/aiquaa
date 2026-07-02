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
  INFRASTRUCTURE_FUNDAMENTALS_SEED_VERSION,
  INFRASTRUCTURE_FUNDAMENTALS_SLUG,
} from '../infrastructure-fundamentals/data/assessment-definition';
import {
  INFRASTRUCTURE_FUNDAMENTALS_GAMIFICATION_RULES,
  buildInfrastructureFundamentalsGamificationEvents,
} from '../infrastructure-fundamentals/lib/gamification';
import { ensureInfrastructureFundamentalsSeeded } from '../infrastructure-fundamentals/lib/seed';
import type {
  AssessmentGamificationEvent,
  AssessmentGamificationRule,
} from './lib/gamification';

export type AssessmentExamType =
  | 'api-testing-fundamentals'
  | 'database-fundamentals'
  | 'database-practice'
  | 'infrastructure-fundamentals';

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
  [API_TESTING_FUNDAMENTALS_SLUG]: {
    slug: API_TESTING_FUNDAMENTALS_SLUG,
    seedVersion: API_TESTING_SEED_VERSION,
    ensureSeeded: ensureApiTestingFundamentalsSeeded,
    examType: 'api-testing-fundamentals',
    gamificationSource: 'API_TESTING_FUNDAMENTALS',
    gamificationRules: API_TESTING_GAMIFICATION_RULES,
    buildGamificationEvents: buildApiTestingGamificationEvents,
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
  [INFRASTRUCTURE_FUNDAMENTALS_SLUG]: {
    slug: INFRASTRUCTURE_FUNDAMENTALS_SLUG,
    seedVersion: INFRASTRUCTURE_FUNDAMENTALS_SEED_VERSION,
    ensureSeeded: ensureInfrastructureFundamentalsSeeded,
    examType: 'infrastructure-fundamentals',
    gamificationSource: 'INFRASTRUCTURE_FUNDAMENTALS',
    gamificationRules: INFRASTRUCTURE_FUNDAMENTALS_GAMIFICATION_RULES,
    buildGamificationEvents: buildInfrastructureFundamentalsGamificationEvents,
  },
};
