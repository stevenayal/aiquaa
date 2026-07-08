'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  getRankingAchievementsForUser,
  syncRankingAchievementsForUser,
} from '@/lib/ranking-achievements';

interface SaveExamResultPayload {
  exam_type:
    | 'git'
    | 'git-practico'
    | 'istqb'
    | 'performance'
    | 'test-app'
    | 'api-testing-fundamentals'
    | 'api-banking'
    | 'database-fundamentals'
    | 'database-practice'
    | 'infrastructure-fundamentals'
    | 'api-developer-fundamentals';
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
  // Per-section breakdown (standardized across exam types)
  section_scores?: Array<{
    section: string;
    correct: number;
    total: number;
    percentage: number;
  }>;
  // Hiring process
  process_code?: string;
  // Extra structured data (bugs, sections, etc.)
  metadata?: object;
}

// Exámenes cuyo score automático es heurístico (conteo/keywords, no validación
// real del contenido) y por eso arrancan marcados como pendientes de
// corrección manual hasta que un evaluador los revise.
const NEEDS_MANUAL_CORRECTION_EXAM_TYPES = new Set(['test-app']);

export async function saveExamResultAction(payload: SaveExamResultPayload) {
  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return { error: 'No autenticado' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', user.id)
    .single();

  const resolvedName =
    payload.participant_name?.trim() ||
    profile?.display_name?.trim() ||
    user.user_metadata?.full_name?.trim() ||
    null;

  const resolvedEmail = payload.participant_email?.trim() || user.email || null;

  // hiring_processes.code is stored with mixed case; match case-insensitively
  // and use the canonical stored value so it satisfies exam_results'
  // FK to hiring_processes(code) regardless of how the candidate typed it.
  const rawProcessCode = payload.process_code?.trim() || undefined;
  let resolvedProcessCode: string | undefined;
  if (rawProcessCode) {
    const { data: process } = await supabase
      .from('hiring_processes')
      .select('code')
      .ilike('code', rawProcessCode)
      .maybeSingle();

    if (!process) {
      return {
        error:
          'El código de proceso ingresado no existe o ya no está vigente. Verificá el código con la empresa antes de enviar el examen.',
      };
    }
    resolvedProcessCode = process.code;
  }

  const { error } = await supabase.from('exam_results').insert({
    user_id: user.id,
    ...payload,
    process_code: resolvedProcessCode,
    participant_name: resolvedName,
    participant_email: resolvedEmail,
    review_status: NEEDS_MANUAL_CORRECTION_EXAM_TYPES.has(payload.exam_type)
      ? 'pending_correction'
      : undefined,
  });

  if (error) return { error: error.message };

  // Mark empresa_invitacion as completada when exam is submitted with a process code
  if (resolvedProcessCode && resolvedEmail) {
    try {
      const { data: process } = await supabase
        .from('hiring_processes')
        .select('id')
        .eq('code', resolvedProcessCode)
        .maybeSingle();

      if (process?.id) {
        await supabase
          .from('empresa_invitaciones')
          .update({
            status: 'completada',
            completed_at: new Date().toISOString(),
          })
          .eq('candidate_email', resolvedEmail)
          .eq('process_id', process.id)
          .in('status', ['pendiente', 'vista']);
      }
    } catch (invErr) {
      console.warn(
        '[empresa-invitaciones] update to completada failed',
        invErr
      );
    }
  }

  try {
    await syncRankingAchievementsForUser(user.id);
  } catch (achievementError) {
    console.warn(
      '[ranking-achievements] sync after exam failed',
      achievementError
    );
  }
  return { success: true };
}

export async function getLeaderboardAction(
  examType:
    | 'git'
    | 'git-practico'
    | 'istqb'
    | 'performance'
    | 'api-testing-fundamentals'
    | 'api-banking'
    | 'database-fundamentals'
    | 'database-practice'
    | 'infrastructure-fundamentals'
    | 'api-developer-fundamentals',
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
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Uses SECURITY DEFINER RPC to bypass RLS on user_xp and profiles
  const { data, error } = await supabase.rpc('get_xp_ranking', {
    p_page: page,
    p_limit: limit,
  });

  if (error) return { error: error.message, data: null, total: 0 };

  const rows = (data ?? []) as any[];
  const total = rows.length > 0 ? Number(rows[0].total_count) : 0;
  const offset = (page - 1) * limit;

  const entries = rows.map((row: any, i: number) => ({
    position: offset + i + 1,
    displayName: row.display_name ?? 'Anónimo',
    avatarUrl: row.avatar_url ?? null,
    totalXp: Number(row.total_xp ?? 0),
    level: row.level ?? 1,
    currentStreak: row.current_streak ?? 0,
    achievementCount: Number(row.achievement_count ?? 0),
    lastActivityAt: row.last_activity_at ?? null,
    mainBadge: row.main_badge ?? null,
    isCurrentUser: Boolean(user?.id && row.user_id === user.id),
  }));

  return {
    data: entries,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getExamResultsAction(opts?: {
  examType?: string;
  limit?: number;
  offset?: number;
}) {
  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user)
    return { error: 'No autenticado', data: null, total: 0 };

  const limit = opts?.limit ?? 20;
  const offset = opts?.offset ?? 0;

  let query = supabase
    .from('exam_results')
    .select(
      'id, exam_type, exam_mode, score, total_questions, max_possible_score, passing_score, passed, percentage, time_spent, model, language, process_code, review_status, created_at',
      { count: 'exact' }
    )
    .eq('user_id', user.id);

  if (opts?.examType) {
    query = query.eq('exam_type', opts.examType);
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return { error: error.message, data: null, total: 0 };
  return { data, total: count ?? 0 };
}

export async function assignProcessCodeToExamAction(
  examResultId: string,
  processCode: string
) {
  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return { error: 'No autenticado' };

  // Validate the process code exists and is active
  const { data: process, error: procError } = await supabase
    .from('hiring_processes')
    .select('id, code, company_name, position_name, status, expires_at')
    .ilike('code', processCode.trim())
    .eq('status', 'active')
    .single();

  if (procError || !process) {
    return { error: 'Código de proceso no encontrado o inactivo' };
  }

  if (process.expires_at && new Date(process.expires_at) < new Date()) {
    return { error: 'El código de proceso ha expirado' };
  }

  // Verify the exam result belongs to the current user
  const { data: examRow, error: examError } = await supabase
    .from('exam_results')
    .select('id, user_id, participant_email, process_code')
    .eq('id', examResultId)
    .eq('user_id', user.id)
    .single();

  if (examError || !examRow) {
    return { error: 'Examen no encontrado o no te pertenece' };
  }

  if (examRow.process_code) {
    return { error: 'Este examen ya tiene un código de proceso asignado' };
  }

  // Update the exam result with the process code
  const { error: updateError } = await supabase
    .from('exam_results')
    .update({ process_code: process.code })
    .eq('id', examResultId)
    .eq('user_id', user.id);

  if (updateError) return { error: updateError.message };

  // Mark empresa_invitacion as completada if applicable
  const resolvedEmail = examRow.participant_email?.trim() || user.email?.trim();
  if (resolvedEmail) {
    try {
      await supabase
        .from('empresa_invitaciones')
        .update({
          status: 'completada',
          completed_at: new Date().toISOString(),
        })
        .eq('candidate_email', resolvedEmail)
        .eq('process_id', process.id)
        .in('status', ['pendiente', 'vista']);
    } catch {
      // Non-critical
    }
  }

  return {
    success: true,
    process_code: process.code,
    process: {
      company_name: process.company_name,
      position_name: process.position_name,
    },
  };
}

type LearningObjectiveRow = {
  learning_objectives: unknown;
};

type LatamLearningObjectiveAggregate = {
  totalPercentage: number;
  sampleSize: number;
};

function normalizeLearningObjectiveRows(
  value: unknown
): Array<{ learningObjective: string; percentage: number }> {
  if (!value) return [];

  const rows = Array.isArray(value)
    ? value
    : typeof value === 'object'
      ? Object.entries(value as Record<string, unknown>).map(
          ([learningObjective, item]) => ({
            learningObjective,
            ...(typeof item === 'object' && item !== null ? item : {}),
          })
        )
      : [];

  return rows
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const row = item as Record<string, unknown>;
      const learningObjective =
        typeof row.learningObjective === 'string'
          ? row.learningObjective
          : typeof row.learning_objective === 'string'
            ? row.learning_objective
            : null;
      const percentage =
        typeof row.percentage === 'number'
          ? row.percentage
          : typeof row.percentage === 'string'
            ? Number(row.percentage)
            : Number.NaN;

      if (!learningObjective || Number.isNaN(percentage)) return null;
      return { learningObjective, percentage };
    })
    .filter(
      (item): item is { learningObjective: string; percentage: number } =>
        item !== null
    );
}

export async function getIstqbLatamComparisonAction() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('exam_results')
    .select('learning_objectives')
    .eq('exam_type', 'istqb')
    .eq('exam_mode', 'exam')
    .not('learning_objectives', 'is', null)
    .limit(500);

  if (error) return { error: error.message, data: null };

  const aggregates = new Map<string, LatamLearningObjectiveAggregate>();

  for (const result of (data ?? []) as LearningObjectiveRow[]) {
    for (const row of normalizeLearningObjectiveRows(
      result.learning_objectives
    )) {
      const current = aggregates.get(row.learningObjective) ?? {
        totalPercentage: 0,
        sampleSize: 0,
      };
      current.totalPercentage += row.percentage;
      current.sampleSize += 1;
      aggregates.set(row.learningObjective, current);
    }
  }

  const comparison = Array.from(aggregates.entries())
    .map(([learningObjective, aggregate]) => ({
      learningObjective,
      averagePercentage: Math.round(
        aggregate.totalPercentage / aggregate.sampleSize
      ),
      sampleSize: aggregate.sampleSize,
    }))
    .sort((a, b) => a.learningObjective.localeCompare(b.learningObjective));

  return { data: comparison };
}

export async function getIstqbAttemptHistoryAction(limit = 6) {
  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return { error: 'No autenticado', data: null };

  const { data, error } = await supabase
    .from('exam_results')
    .select(
      'id, score, total_questions, max_possible_score, passed, percentage, time_spent, model, language, created_at'
    )
    .eq('user_id', user.id)
    .eq('exam_type', 'istqb')
    .eq('exam_mode', 'exam')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) return { error: error.message, data: null };

  return {
    data: (data ?? []).sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    ),
  };
}

export async function getMyXpProfileAction() {
  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return { data: null };

  // #195: user_xp has no achievement_count column (it is computed in the
  // ranking_candidatos view via subquery). Selecting it from user_xp returns a
  // 400 and blanks the dashboard/profile XP widget, so read base XP from
  // user_xp and pull achievement_count from the view separately.
  const { data } = await supabase
    .from('user_xp')
    .select('total_xp, level, current_streak, longest_streak, last_activity_at')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!data) return { data: null };

  const { data: rankingRow } = await supabase
    .from('ranking_candidatos')
    .select('achievement_count')
    .eq('user_id', user.id)
    .maybeSingle();

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
      achievementCount: rankingRow?.achievement_count ?? 0,
      position: (count ?? 0) + 1,
    },
  };
}

export async function getMyRankingAchievementsAction() {
  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return { data: [], error: 'No autenticado' };

  try {
    await syncRankingAchievementsForUser(user.id);
    const achievements = await getRankingAchievementsForUser(user.id);
    return { data: achievements };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'No se pudieron cargar logros';
    return { data: [], error: message };
  }
}
