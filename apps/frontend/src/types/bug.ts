export type BugSeverity = 'Minor' | 'Major' | 'Critical';
export type BugImpact = 'Low' | 'Medium' | 'High';
export type BugReportTarget = 'github' | 'azure' | 'email' | 'webhook';

export interface TechnicalInfo {
  url: string;
  referrer: string;
  userAgent: string;
  language: string;
  timezone: string;
  viewport: {
    width: number;
    height: number;
  };
  deviceMemory?: number;
  platform: string;
  timestamp: string;
  consoleLogs?: string[];
}

export interface BugReportFormData {
  title: string;
  stepsToReproduce: string;
  expectedResult: string;
  actualResult: string;
  severity: BugSeverity;
  impact: BugImpact;
  consent: boolean;
}

export interface BugReportPayload extends BugReportFormData {
  technicalInfo?: TechnicalInfo;
  attachments?: File[];
}

export interface BugReportQueueItem {
  id: string;
  payload: BugReportPayload;
  timestamp: number;
  retryCount: number;
}

export interface BugReportResponse {
  success: boolean;
  message: string;
  issueId?: string;
  issueUrl?: string;
}

export interface BugReportConfig {
  target: BugReportTarget;
  apiEndpoint?: string;
  maxFiles: number;
  maxTotalSize: number;
  allowedExtensions: string[];
  autoRetryOnline: boolean;
}
