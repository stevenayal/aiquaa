export type CandidateLevel =
  | 'Inicial'
  | 'Junior en formación'
  | 'Junior'
  | 'Junior avanzado / Semi Senior inicial'
  | 'Semi Senior';

export interface CandidateBand {
  min: number;
  max: number;
  label: string;
}

export type AssessmentQuestionType =
  | 'multiple_choice'
  | 'true_false'
  | 'short_text'
  | 'doc_analysis'
  | 'response_analysis';

export type AssessmentAttemptStatus = 'in_progress' | 'submitted' | 'graded';
export type AssessmentScoringMode = 'automatic';

export interface Assessment {
  id: string;
  slug: string;
  title: string;
  description: string;
  level: string;
  type: string;
  duration_minutes: number;
  total_score: number;
  is_active: boolean;
  metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

export interface AssessmentSection {
  id: string;
  assessment_id: string;
  slug: string;
  title: string;
  description: string;
  order_index: number;
  max_score: number;
  metadata?: Record<string, unknown>;
  created_at?: string;
}

export interface AssessmentQuestion {
  id: string;
  section_id: string;
  question_type: AssessmentQuestionType;
  prompt: string;
  description?: string | null;
  options?: Array<{ label: string; value: string }>;
  correct_answer?: unknown;
  expected_keywords?: string[];
  explanation?: string | null;
  metadata?: Record<string, unknown>;
  scoring_rules?: Record<string, unknown>;
  rubric?: Record<string, unknown>;
  points: number;
  order_index: number;
  created_at?: string;
}

export interface AssessmentAttempt {
  id: string;
  assessment_id: string;
  user_id: string;
  status: AssessmentAttemptStatus;
  current_section_slug?: string | null;
  started_at: string;
  submitted_at?: string | null;
  total_score?: number | null;
  max_score: number;
  percentage?: number | null;
  passed?: boolean | null;
  candidate_level?: CandidateLevel | null;
  strengths?: string[];
  weaknesses?: string[];
  recommendations?: string[];
  metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

export interface AssessmentAnswer {
  id: string;
  attempt_id: string;
  question_id: string;
  answer: unknown;
  is_correct?: boolean | null;
  score: number;
  feedback?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface AssessmentSectionScore {
  id: string;
  attempt_id: string;
  section_id: string;
  score: number;
  max_score: number;
  scoring_mode: AssessmentScoringMode;
  feedback?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface AssessmentFeedback {
  id: string;
  attempt_id: string;
  level: number;
  message: string;
  recommendations: string[];
  created_at?: string;
}

export interface ApiDocScenario {
  endpoint: string;
  method: string;
  description: string;
  headers: string[];
  pathParams: Array<{ name: string; type: string; required: boolean }>;
  successResponse: Record<string, unknown>;
  expectedErrors: Array<{ status: number; message: string }>;
}

export interface ResponseAnalysisScenario {
  id: string;
  title: string;
  request?: {
    method: string;
    endpoint: string;
    headers?: string[];
    body?: Record<string, unknown> | null;
  };
  response?: {
    status: number;
    body?: Record<string, unknown> | null;
  };
  documentationNote?: string;
  expectedVerdict: 'correct' | 'bug';
  expectedBugReason?: string;
}

export interface SqlTableSchema {
  name: string;
  columns: Array<{ name: string; type: string; pk?: boolean; fk?: string }>;
  sampleRows?: Array<Record<string, unknown>>;
}

export interface SqlSchemaScenario {
  tables: SqlTableSchema[];
  note?: string;
}

export interface SqlQueryScenario {
  query: string;
  result?: { columns: string[]; rows: Array<Array<unknown>> } | null;
  errorMessage?: string;
  note?: string;
}

export interface ScoringRule {
  type: AssessmentScoringMode;
  checks: string[];
  minimumItems?: number;
  requiredKeywords?: string[];
}

export interface AssessmentOverview {
  assessment: Assessment;
  sections: AssessmentSection[];
}

export interface AssessmentSectionPayload {
  attempt: AssessmentAttempt;
  section: AssessmentSection;
  questions: AssessmentQuestion[];
  answers: AssessmentAnswer[];
  scores: AssessmentSectionScore[];
  sections: AssessmentSection[];
}

export interface AssessmentResultSummary {
  attempt: AssessmentAttempt;
  assessment: Assessment;
  sections: Array<
    AssessmentSection & {
      score: number;
      feedback: string;
    }
  >;
  feedback: AssessmentFeedback[];
}

export interface AssessmentSeedQuestionInput
  extends Omit<AssessmentQuestion, 'id' | 'section_id' | 'created_at'> {}

export interface AssessmentSeedSectionInput
  extends Omit<AssessmentSection, 'id' | 'assessment_id' | 'created_at'> {
  questions: AssessmentSeedQuestionInput[];
}

export interface AssessmentSeedDefinition
  extends Omit<Assessment, 'id' | 'created_at' | 'updated_at'> {
  sections: AssessmentSeedSectionInput[];
}
