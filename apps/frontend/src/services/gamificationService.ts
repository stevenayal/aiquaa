import authService from './authService';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface UserXpProfile {
  userId: number;
  totalXp: number;
  level: number;
  currentStreak: number;
  lastActivityAt: string | null;
  achievements: Achievement[];
}

export interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string;
}

export interface RankingEntry {
  position: number;
  userId: number;
  displayName: string;
  avatarUrl: string | null;
  totalXp: number;
  level: number;
  currentStreak: number;
  achievementCount: number;
  lastActivityAt: string | null;
}

export interface RankingResponse {
  data: RankingEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DailyCheckinResponse {
  message: string;
  xpGranted?: number;
  currentStreak?: number;
}

class GamificationService {
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

  async getMyProfile(): Promise<UserXpProfile> {
    return this.request<UserXpProfile>('/api/v1/gamification/me');
  }

  async getRanking(page = 1, limit = 20): Promise<RankingResponse> {
    return this.request<RankingResponse>(
      `/api/v1/gamification/ranking?page=${page}&limit=${limit}`
    );
  }

  async dailyCheckin(): Promise<DailyCheckinResponse> {
    return this.request<DailyCheckinResponse>(
      '/api/v1/gamification/daily-checkin',
      {
        method: 'POST',
      }
    );
  }
}

export const gamificationService = new GamificationService();
export default gamificationService;
