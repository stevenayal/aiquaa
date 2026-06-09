import authService from './authService';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface StartAttemptPayload {
  candidateName: string;
  email?: string;
  assessmentSlug?: string;
}

export interface StartAttemptResult {
  attemptId: number;
  assessmentId: number;
}

export interface TestCase {
  title: string;
  preconditions?: string;
  steps: string;
  expectedResult: string;
  type: 'positive' | 'negative' | 'boundary' | 'security' | 'contract';
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface BugReport {
  title: string;
  description?: string;
  stepsToReproduce: string;
  actualResult: string;
  expectedResult: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  priority: 'low' | 'medium' | 'high' | 'critical';
  endpoint: string;
  evidence?: string;
}

export interface AssessmentScore {
  testDesignScore: number;
  apiValidationScore: number;
  securityScore: number;
  bugReportingScore: number;
  executiveSummaryScore: number;
  totalScore: number;
  passed: boolean;
  bugsFound: number;
  totalBugs: number;
  feedback: string;
}

class AssessmentsService {
  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = (authService as any).accessToken;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
      credentials: 'include',
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`HTTP ${res.status}: ${text}`);
    }
    return res.json();
  }

  async startAttempt(
    payload: StartAttemptPayload
  ): Promise<StartAttemptResult> {
    return this.request<StartAttemptResult>('/assessments/start', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async saveTestCases(
    attemptId: number,
    testCases: TestCase[]
  ): Promise<{ success: boolean; count: number }> {
    return this.request(`/assessments/${attemptId}/test-cases`, {
      method: 'POST',
      body: JSON.stringify({ testCases }),
    });
  }

  async saveBugReports(
    attemptId: number,
    bugReports: BugReport[]
  ): Promise<{ success: boolean; count: number }> {
    return this.request(`/assessments/${attemptId}/bug-reports`, {
      method: 'POST',
      body: JSON.stringify({ bugReports }),
    });
  }

  async submitAttempt(
    attemptId: number,
    summary?: string
  ): Promise<{ success: boolean; attemptId: number; score: AssessmentScore }> {
    return this.request(`/assessments/${attemptId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ summary }),
    });
  }

  async getResult(attemptId: number): Promise<any> {
    return this.request(`/assessments/${attemptId}/result`);
  }
}

export const assessmentsService = new AssessmentsService();
