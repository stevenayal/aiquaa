'use server';

import { createClient } from '@/lib/supabase/server';

interface SaveExamResultPayload {
  exam_type: 'git' | 'istqb' | 'performance' | 'test-app';
  exam_mode: 'exam' | 'training';
  participant_name?: string;
  participant_email?: string;
  candidate_id?: string;
  score: number;
  total_questions: number;
  max_possible_score?: number;
  correct_answers: number;
  incorrect_answers: number;
  passing_score?: number;
  passed: boolean;
  percentage: number;
  time_spent: number;
  answers?: object;
  // Git & Performance
  github_profile?: string;
  exam_purpose?: string;
  company_name?: string;
  // ISTQB
  model?: string;
  language?: string;
  // Analysis
  learning_objectives?: object;
  // Hiring process
  process_code?: string;
  // Extra structured data (bugs, sections, etc.)
  metadata?: object;
}

export async function saveExamResultAction(payload: SaveExamResultPayload) {
  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return { error: 'No autenticado' };

  const resolvedName =
    payload.participant_name?.trim() ||
    user.user_metadata?.full_name?.trim() ||
    null;

  const resolvedEmail =
    payload.participant_email?.trim() || user.email || null;

  const { error } = await supabase.from('exam_results').insert({
    user_id: user.id,
    ...payload,
    participant_name: resolvedName,
    participant_email: resolvedEmail,
  });

  if (error) return { error: error.message };
  return { success: true };
}

export async function getLeaderboardAction(
  examType: 'git' | 'istqb' | 'performance',
  limit = 20
) {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('get_leaderboard', {
    p_exam_type: examType,
    p_limit: limit,
  });
  if (error) return { error: error.message, data: null };
  return { data };
}

export async function getXpRankingAction(page = 1, limit = 20) {
  const supabase = createClient();
  const offset = (page - 1) * limit;

  // ranking_candidatos view excludes audience='empresa' at DB level
  // and includes achievement_count via subquery in the view
  const { data, error, count } = await supabase
    .from('ranking_candidatos')
    .select(
      'total_xp, level, current_streak, last_activity_at, display_name, avatar_url, achievement_count, main_badge',
      { count: 'exact' }
    )
    .order('total_xp', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return { error: error.message, data: null, total: 0 };

  const entries = (data ?? []).map((row: any, i: number) => ({
    position: offset + i + 1,
    displayName: row.display_name ?? 'Anónimo',
    avatarUrl: row.avatar_url ?? null,
    totalXp: row.total_xp,
    level: row.level,
    currentStreak: row.current_streak,
    achievementCount: row.achievement_count ?? 0,
    lastActivityAt: row.last_activity_at,
    mainBadge: row.main_badge ?? null,
  }));

  return {
    data: entries,
    total: count ?? 0,
    page,
    totalPages: Math.ceil((count ?? 0) / limit),
  };
}

export async function getExamResultsAction() {
  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return { error: 'No autenticado', data: null };

  const { data, error } = await supabase
    .from('exam_results')
    .select(
      'id, exam_type, exam_mode, score, total_questions, passing_score, passed, percentage, time_spent, model, language, created_at'
    )
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) return { error: error.message, data: null };
  return { data };
}

export async function getMyXpProfileAction() {
  const supabase = createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return { data: null };

  const { data } = await supabase
    .from('user_xp')
    .select('total_xp, level, current_streak, longest_streak, last_activity_at, achievement_count')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!data) return { data: null };

  // Count users with more XP to get position
  const { count } = await supabase
    .from('user_xp')
    .select('*', { count: 'exact', head: true })
    .gt('total_xp', data.total_xp);

  return {
    data: {
      totalXp: data.total_xp ?? 0,
      level: data.level ?? 1,
      currentStreak: data.current_streak ?? 0,
      longestStreak: data.longest_streak ?? 0,
      lastActivityAt: data.last_activity_at ?? null,
      achievementCount: data.achievement_count ?? 0,
      position: (count ?? 0) + 1,
    },
  };
}
