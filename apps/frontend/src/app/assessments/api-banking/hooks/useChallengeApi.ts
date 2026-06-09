'use client';

import { useCallback } from 'react';
import { SESSION_KEYS } from '../types';

export function useChallengeApi() {
  const getToken = useCallback(() => {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem(SESSION_KEYS.challengeToken);
  }, []);

  const request = useCallback(
    async <T = any>(
      path: string,
      options: RequestInit = {}
    ): Promise<{ data: T | null; error: string | null }> => {
      const token = getToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      try {
        const res = await fetch(`/api/challenge${path}`, {
          ...options,
          headers,
        });
        const data = await res.json();
        if (!res.ok)
          return { data: null, error: data.message ?? data.error ?? 'Error' };
        return { data, error: null };
      } catch (e: any) {
        return { data: null, error: e.message ?? 'Network error' };
      }
    },
    [getToken]
  );

  return { request };
}
