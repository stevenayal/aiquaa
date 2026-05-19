import authService from './authService';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface IstqbSubmitPayload {
  mode: 'exam' | 'training';
  percentage: number;
  passed: boolean;
  answers: object;
  timeSpent: number;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  learningObjectives?: object;
}

export interface IstqbResult {
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

export interface IstqbStats {
  totalExams: number;
  passedExams: number;
  averageScore: number;
  bestScore: number;
}

class IstqbService {
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

  async submitExam(payload: IstqbSubmitPayload): Promise<IstqbResult> {
    return this.request<IstqbResult>('/istqb/submit-exam', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getResults(): Promise<IstqbResult[]> {
    return this.request<IstqbResult[]>('/istqb/results');
  }

  async getResult(id: string): Promise<IstqbResult> {
    return this.request<IstqbResult>(`/istqb/results/${id}`);
  }

  async getStats(): Promise<IstqbStats> {
    return this.request<IstqbStats>('/istqb/stats');
  }
}

export const istqbService = new IstqbService();
export default istqbService;
