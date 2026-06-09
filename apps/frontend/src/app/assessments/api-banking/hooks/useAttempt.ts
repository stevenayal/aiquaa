'use client';

import { useState, useEffect, useCallback } from 'react';
import type {
  TestCase,
  BugReport,
  TestCaseInput,
  BugReportInput,
} from '../types';
import { SESSION_KEYS } from '../types';

interface AttemptState {
  attemptId: number | null;
  candidateName: string;
  startedAt: string | null;
  testCases: TestCase[];
  bugReports: BugReport[];
  summary: string;
  isSubmitting: boolean;
}

export function useAttempt() {
  const [state, setState] = useState<AttemptState>({
    attemptId: null,
    candidateName: '',
    startedAt: null,
    testCases: [],
    bugReports: [],
    summary: '',
    isSubmitting: false,
  });

  // Load from sessionStorage on mount
  useEffect(() => {
    const attemptId = sessionStorage.getItem(SESSION_KEYS.attemptId);
    const candidateName =
      sessionStorage.getItem(SESSION_KEYS.candidateName) ?? '';
    const startedAt = sessionStorage.getItem(SESSION_KEYS.startedAt);

    if (attemptId) {
      setState((prev) => ({
        ...prev,
        attemptId: Number(attemptId),
        candidateName,
        startedAt,
      }));

      // Fetch existing test cases + bug reports
      fetch(`/api/assessments/${attemptId}/test-cases`)
        .then((r) => r.json())
        .then((data) => setState((prev) => ({ ...prev, testCases: data })))
        .catch(() => {});

      fetch(`/api/assessments/${attemptId}/bug-reports`)
        .then((r) => r.json())
        .then((data) => setState((prev) => ({ ...prev, bugReports: data })))
        .catch(() => {});
    }
  }, []);

  const addTestCase = useCallback(
    async (input: TestCaseInput): Promise<{ error: string | null }> => {
      if (!state.attemptId) return { error: 'No active attempt' };

      const res = await fetch(
        `/api/assessments/${state.attemptId}/test-cases`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        return { error: data.error ?? 'Failed to save test case' };
      }

      const [saved] = await res.json();
      setState((prev) => ({ ...prev, testCases: [...prev.testCases, saved] }));
      return { error: null };
    },
    [state.attemptId]
  );

  const removeTestCase = useCallback(
    async (id: number) => {
      if (!state.attemptId) return;
      await fetch(`/api/assessments/${state.attemptId}/test-cases?id=${id}`, {
        method: 'DELETE',
      });
      setState((prev) => ({
        ...prev,
        testCases: prev.testCases.filter((tc) => tc.id !== id),
      }));
    },
    [state.attemptId]
  );

  const addBugReport = useCallback(
    async (input: BugReportInput): Promise<{ error: string | null }> => {
      if (!state.attemptId) return { error: 'No active attempt' };

      const res = await fetch(
        `/api/assessments/${state.attemptId}/bug-reports`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        return { error: data.error ?? 'Failed to save bug report' };
      }

      const [saved] = await res.json();
      setState((prev) => ({
        ...prev,
        bugReports: [...prev.bugReports, saved],
      }));
      return { error: null };
    },
    [state.attemptId]
  );

  const removeBugReport = useCallback(
    async (id: number) => {
      if (!state.attemptId) return;
      await fetch(`/api/assessments/${state.attemptId}/bug-reports?id=${id}`, {
        method: 'DELETE',
      });
      setState((prev) => ({
        ...prev,
        bugReports: prev.bugReports.filter((r) => r.id !== id),
      }));
    },
    [state.attemptId]
  );

  const setSummary = useCallback((summary: string) => {
    setState((prev) => ({ ...prev, summary }));
  }, []);

  const submit = useCallback(async (): Promise<{
    score: any;
    error: string | null;
  }> => {
    if (!state.attemptId) return { score: null, error: 'No active attempt' };

    setState((prev) => ({ ...prev, isSubmitting: true }));
    try {
      const res = await fetch(`/api/assessments/${state.attemptId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summary: state.summary }),
      });

      if (!res.ok) {
        const data = await res.json();
        return { score: null, error: data.error ?? 'Submission failed' };
      }

      const data = await res.json();
      return { score: data.score, error: null };
    } finally {
      setState((prev) => ({ ...prev, isSubmitting: false }));
    }
  }, [state.attemptId, state.summary]);

  return {
    ...state,
    addTestCase,
    removeTestCase,
    addBugReport,
    removeBugReport,
    setSummary,
    submit,
  };
}
