import authService from './authService';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface PerformanceSubmitPayload {
  mode: 'exam' | 'training';
  percentage: number;
  passed: boolean;
  answers: object;
  timeSpent: number;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
}

export interface PerformanceResult {
  id: string;
  mode: string;
  percentage: number;
  passed: boolean;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  timeSpent: number;
  createdAt: string;
}

export interface PerformanceStats {
  totalExams: number;
  passedExams: number;
  averageScore: number;
  bestScore: number;
}

class PerformanceService {
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

  async submitExam(
    payload: PerformanceSubmitPayload
  ): Promise<PerformanceResult> {
    return this.request<PerformanceResult>('/performance/submit-exam', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getResults(): Promise<PerformanceResult[]> {
    return this.request<PerformanceResult[]>('/performance/results');
  }

  async getResult(id: string): Promise<PerformanceResult> {
    return this.request<PerformanceResult>(`/performance/results/${id}`);
  }

  async getStats(): Promise<PerformanceStats> {
    return this.request<PerformanceStats>('/performance/stats');
  }
}

export const performanceService = new PerformanceService();
export default performanceService;
