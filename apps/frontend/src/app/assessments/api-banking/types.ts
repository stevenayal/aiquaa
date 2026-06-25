// ---------------------------------------------------------------
// Assessment domain types
// ---------------------------------------------------------------

export type AssessmentStatus = 'in_progress' | 'submitted' | 'evaluated';
export type TestCaseType =
  | 'positive'
  | 'negative'
  | 'boundary'
  | 'security'
  | 'contract';
export type PriorityLevel = 'low' | 'medium' | 'high' | 'critical';

export interface Assessment {
  id: number;
  slug: string;
  title: string;
  description: string;
  level: 'junior' | 'semi-senior' | 'senior';
  durationMinutes: number;
  type: string;
  isActive: boolean;
}

export interface AssessmentAttempt {
  id: number;
  assessmentId: number;
  aiquaaUserId?: string;
  candidateName: string;
  candidateEmail?: string;
  status: AssessmentStatus;
  startedAt: string;
  submittedAt?: string;
  totalScore?: number;
  summary?: string;
}

export interface TestCase {
  id: number;
  attemptId: number;
  title: string;
  preconditions?: string;
  steps: string;
  expectedResult: string;
  type: TestCaseType;
  priority: PriorityLevel;
  createdAt: string;
}

export interface BugReport {
  id: number;
  attemptId: number;
  title: string;
  description?: string;
  stepsToReproduce: string;
  actualResult: string;
  expectedResult: string;
  severity: PriorityLevel;
  priority: PriorityLevel;
  endpoint: string;
  evidence?: string;
  bugTag?: string;
  createdAt: string;
}

export interface AssessmentScore {
  id: number;
  attemptId: number;
  testDesignScore: number;
  apiValidationScore: number;
  securityScore: number;
  bugReportingScore: number;
  executiveSummaryScore: number;
  totalScore: number;
  bugsFound: number;
  bugsTotal: number;
  feedback?: string;
}

export interface AttemptWithRelations extends AssessmentAttempt {
  testCases: TestCase[];
  bugReports: BugReport[];
  score?: AssessmentScore;
}

// ---------------------------------------------------------------
// Forms (what the user submits)
// ---------------------------------------------------------------

export interface TestCaseInput {
  title: string;
  preconditions?: string;
  steps: string;
  expectedResult: string;
  type: TestCaseType;
  priority: PriorityLevel;
}

export interface BugReportInput {
  title: string;
  description?: string;
  stepsToReproduce: string;
  actualResult: string;
  expectedResult: string;
  severity: PriorityLevel;
  priority: PriorityLevel;
  endpoint: string;
  evidence?: string;
}

// ---------------------------------------------------------------
// Challenge simulation types (banking API)
// ---------------------------------------------------------------

export interface ChallengeUser {
  id: string;
  email: string;
  displayName: string;
  internalRiskScore: number; // intentional sensitive field (bug #6)
}

export interface ChallengeAccount {
  id: string;
  userId: string;
  accountNumber: string;
  currency: string;
  balance: number; // API field (bug #8: OpenAPI says availableBalance)
}

export interface ChallengeTransfer {
  id: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  currency: string;
  description?: string;
  idempotencyKey?: string;
  status: string;
  createdAt: string;
}

export interface ChallengeMovement {
  id: string;
  accountId: string;
  transferId?: string;
  type: 'debit' | 'credit';
  amount: number;
  currency: string;
  description?: string;
  createdAt: string;
}

// ---------------------------------------------------------------
// Session storage keys
// ---------------------------------------------------------------

export const SESSION_KEYS = {
  attemptId: 'aiquaa_challenge_attempt_id',
  challengeToken: 'aiquaa_challenge_token',
  candidateName: 'aiquaa_challenge_candidate_name',
  startedAt: 'aiquaa_challenge_started_at',
  apiTarget: 'aiquaa_challenge_api_target',
} as const;
