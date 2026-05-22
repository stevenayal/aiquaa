export type EvaluationStatus = 'PASSED' | 'FAILED' | 'PENDING_REVIEW';
export type EvaluationType = 'ISTQB' | 'PERFORMANCE';

export interface AiquaaTalentWebhookPayload {
  eventId: string;
  eventType: 'candidate.evaluation.completed';
  occurredAt: string;
  source: 'aiquaa';
  tenant: {
    companyId: string;
  };
  candidate: {
    email: string;
    externalId?: string;
  };
  process: {
    processId: string;
    applicationId?: string;
    publicLinkToken?: string;
  };
  evaluation: {
    evaluationId: string;
    evaluationType: EvaluationType;
    score: number;
    maxScore: number;
    status: EvaluationStatus;
    summary?: string;
  };
}

export interface SendWebhookInput {
  evaluationId: string;
  evaluationType: EvaluationType;
  candidateEmail: string;
  candidateExternalId?: string;
  companyId: string;
  processId?: string;
  applicationId?: string;
  publicLinkToken?: string;
  score: number;
  maxScore: number;
  passed: boolean;
  pendingReview?: boolean;
  summary?: string;
}

export interface WebhookSendResult {
  sent: boolean;
  skipped?: boolean;
  skipReason?: string;
  eventId?: string;
  attempts?: number;
  lastStatusCode?: number;
  error?: string;
}
