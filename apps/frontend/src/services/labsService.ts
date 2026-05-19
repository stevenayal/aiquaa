import authService from './authService';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface AllPairsTrackPayload {
  sessionId: string;
  combinationsCount: number;
}

export interface GitResultPayload {
  githubProfile: string;
  examPurpose?: string;
  companyName?: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  passed: boolean;
  percentage: number;
  timeSpent: number;
  answers?: object;
}

class LabsService {
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

  async trackAllPairs(
    payload: AllPairsTrackPayload
  ): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>('/api/v1/labs/allpairs/track', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async sendGitResult(
    payload: GitResultPayload
  ): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>('/api/v1/labs/git/send-result', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
}

export const labsService = new LabsService();
export default labsService;
