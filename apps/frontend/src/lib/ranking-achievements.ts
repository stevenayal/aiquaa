import 'server-only';

import { createAdminClient } from '@/lib/supabase/admin';
import { EXAM_META, type ExamType } from '@/lib/exams';

export type RankingAchievement = {
  id: string;
  rankingType: 'xp_global' | 'exam';
  rankingSlug: string;
  rankingLabel: string;
  position: number;
  score: number | null;
  scoreLabel: string | null;
  achievedAt: string;
  notifiedAt: string | null;
};

type AchievementCandidate = {
  rankingType: 'xp_global' | 'exam';
  rankingSlug: string;
  rankingLabel: string;
  position: number;
  score: number | null;
  scoreLabel: string | null;
  achievedAt: string;
  metadata: Record<string, unknown>;
};

type ExistingAchievementRow = {
  id: string;
  user_id: string;
  ranking_type: 'xp_global' | 'exam';
  ranking_slug: string;
  position: number;
  notified_at: string | null;
};

const TOP_LIMIT = 3;

const RANKED_EXAM_TYPES: ExamType[] = [
  'git',
  'git-practico',
  'istqb',
  'performance',
  'api-testing-fundamentals',
  'api-banking',
  'database-fundamentals',
  'database-practice',
  'infrastructure-fundamentals',
  'api-developer-fundamentals',
  'api-dotnet-fundamentals',
  'docker-fundamentals',
  'kubernetes-helm-fundamentals',
  'kubernetes-orchestration-fundamentals',
  'observability-fundamentals',
  'cicd-fundamentals',
  'playwright-practico',
  'playwright-fundamentals',
  'gherkin-fundamentals',
];

const ASSESSMENT_RANKING_TYPES = new Set<ExamType>([
  'database-fundamentals',
  'database-practice',
  'infrastructure-fundamentals',
  'api-developer-fundamentals',
  'api-dotnet-fundamentals',
  'docker-fundamentals',
  'kubernetes-helm-fundamentals',
  'kubernetes-orchestration-fundamentals',
  'observability-fundamentals',
  'cicd-fundamentals',
  'playwright-fundamentals',
  'gherkin-fundamentals',
]);

function isMissingAchievementsTableError(error: { code?: string } | null) {
  return error?.code === '42P01';
}

function toAchievement(row: any): RankingAchievement {
  return {
    id: row.id,
    rankingType: row.ranking_type,
    rankingSlug: row.ranking_slug,
    rankingLabel: row.ranking_label,
    position: row.position,
    score:
      row.score === null || row.score === undefined ? null : Number(row.score),
    scoreLabel: row.score_label ?? null,
    achievedAt: row.achieved_at,
    notifiedAt: row.notified_at ?? null,
  };
}

function bestByUser<
  T extends { user_id: string; percentage: number; score: number },
>(rows: T[]) {
  const best = new Map<string, T>();

  for (const row of rows) {
    const current = best.get(row.user_id);
    if (
      !current ||
      row.percentage > current.percentage ||
      (row.percentage === current.percentage && row.score > current.score)
    ) {
      best.set(row.user_id, row);
    }
  }

  return Array.from(best.values()).sort((a, b) => {
    if (b.percentage !== a.percentage) return b.percentage - a.percentage;
    return b.score - a.score;
  });
}

async function getXpGlobalCandidate(
  admin: ReturnType<typeof createAdminClient>,
  userId: string
): Promise<AchievementCandidate | null> {
  const { data, error } = await admin
    .from('ranking_candidatos')
    .select('user_id, total_xp, level, last_activity_at')
    .order('total_xp', { ascending: false })
    .range(0, TOP_LIMIT - 1);

  if (error) return null;

  const index = (data ?? []).findIndex((row: any) => row.user_id === userId);
  if (index < 0) return null;

  const row = data![index] as any;
  const totalXp = Number(row.total_xp ?? 0);

  return {
    rankingType: 'xp_global',
    rankingSlug: 'xp',
    rankingLabel: 'Top XP Global AIQUAA',
    position: index + 1,
    score: totalXp,
    scoreLabel: `${totalXp.toLocaleString('es-PY')} XP`,
    achievedAt: row.last_activity_at ?? new Date().toISOString(),
    metadata: {
      level: row.level ?? null,
      totalXp,
    },
  };
}

async function getLegacyExamCandidate(
  admin: ReturnType<typeof createAdminClient>,
  userId: string,
  examType: ExamType
): Promise<AchievementCandidate | null> {
  const { data, error } = await admin
    .from('exam_results')
    .select(
      'user_id, score, total_questions, max_possible_score, percentage, passed, created_at'
    )
    .eq('exam_type', examType)
    .eq('exam_mode', 'exam')
    .not('user_id', 'is', null)
    .lte('percentage', 100)
    .gte('total_questions', 10)
    .order('percentage', { ascending: false })
    .order('score', { ascending: false })
    .limit(1000);

  if (error) return null;

  const validRows = (data ?? [])
    .filter((row: any) => {
      const maxScore = row.max_possible_score ?? row.total_questions;
      return Number(row.score ?? 0) <= Number(maxScore ?? 0);
    })
    .map((row: any) => ({
      user_id: row.user_id as string,
      score: Number(row.score ?? 0),
      total: Number(row.max_possible_score ?? row.total_questions ?? 0),
      percentage: Number(row.percentage ?? 0),
      passed: Boolean(row.passed),
      achievedAt: row.created_at as string,
    }));

  const top = bestByUser(validRows).slice(0, TOP_LIMIT);
  const index = top.findIndex((row) => row.user_id === userId);
  if (index < 0) return null;

  const row = top[index];
  const meta = EXAM_META[examType];

  return {
    rankingType: 'exam',
    rankingSlug: examType,
    rankingLabel: `Top ${meta.label}`,
    position: index + 1,
    score: row.score,
    scoreLabel: `${row.score}/${row.total}`,
    achievedAt: row.achievedAt,
    metadata: {
      percentage: row.percentage,
      passed: row.passed,
      examType,
    },
  };
}

async function getAssessmentExamCandidate(
  admin: ReturnType<typeof createAdminClient>,
  userId: string,
  examType: ExamType
): Promise<AchievementCandidate | null> {
  const { data: assessment } = await admin
    .from('assessments')
    .select('id')
    .eq('slug', examType)
    .maybeSingle();

  if (!assessment?.id) return null;

  const { data, error } = await admin
    .from('assessment_attempts')
    .select('user_id, total_score, max_score, percentage, passed, submitted_at')
    .eq('assessment_id', assessment.id)
    .eq('status', 'graded')
    .not('user_id', 'is', null)
    .lte('percentage', 100)
    .order('percentage', { ascending: false })
    .order('total_score', { ascending: false })
    .limit(1000);

  if (error) return null;

  const rows = (data ?? []).map((row: any) => ({
    user_id: row.user_id as string,
    score: Number(row.total_score ?? 0),
    total: Number(row.max_score ?? 0),
    percentage: Number(row.percentage ?? 0),
    passed: Boolean(row.passed),
    achievedAt: row.submitted_at as string,
  }));

  const top = bestByUser(rows).slice(0, TOP_LIMIT);
  const index = top.findIndex((row) => row.user_id === userId);
  if (index < 0) return null;

  const row = top[index];
  const meta = EXAM_META[examType];

  return {
    rankingType: 'exam',
    rankingSlug: examType,
    rankingLabel: `Top ${meta.label}`,
    position: index + 1,
    score: row.score,
    scoreLabel: `${row.score}/${row.total} pts`,
    achievedAt: row.achievedAt ?? new Date().toISOString(),
    metadata: {
      percentage: row.percentage,
      passed: row.passed,
      examType,
    },
  };
}

async function collectAchievementCandidates(userId: string) {
  const admin = createAdminClient();
  const candidates: AchievementCandidate[] = [];
  const xpCandidate = await getXpGlobalCandidate(admin, userId);
  if (xpCandidate) candidates.push(xpCandidate);

  for (const examType of RANKED_EXAM_TYPES) {
    const candidate = ASSESSMENT_RANKING_TYPES.has(examType)
      ? await getAssessmentExamCandidate(admin, userId, examType)
      : await getLegacyExamCandidate(admin, userId, examType);

    if (candidate) candidates.push(candidate);
  }

  return candidates;
}

export async function syncRankingAchievementsForUser(userId: string) {
  const admin = createAdminClient();
  const candidates = await collectAchievementCandidates(userId);
  const changed: RankingAchievement[] = [];

  for (const candidate of candidates) {
    const { data: existing, error: existingError } = await admin
      .from('ranking_achievements')
      .select('id, user_id, ranking_type, ranking_slug, position, notified_at')
      .eq('user_id', userId)
      .eq('ranking_type', candidate.rankingType)
      .eq('ranking_slug', candidate.rankingSlug)
      .maybeSingle<ExistingAchievementRow>();

    if (isMissingAchievementsTableError(existingError)) return changed;
    if (existingError) continue;

    if (!existing) {
      const { data, error } = await admin
        .from('ranking_achievements')
        .insert({
          user_id: userId,
          ranking_type: candidate.rankingType,
          ranking_slug: candidate.rankingSlug,
          ranking_label: candidate.rankingLabel,
          position: candidate.position,
          score: candidate.score,
          score_label: candidate.scoreLabel,
          achieved_at: candidate.achievedAt,
          metadata: candidate.metadata,
        })
        .select('*')
        .single();

      if (!error && data) changed.push(toAchievement(data));
      continue;
    }

    if (candidate.position < existing.position) {
      const { data, error } = await admin
        .from('ranking_achievements')
        .update({
          ranking_label: candidate.rankingLabel,
          position: candidate.position,
          score: candidate.score,
          score_label: candidate.scoreLabel,
          achieved_at: candidate.achievedAt,
          notified_at: null,
          metadata: candidate.metadata,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select('*')
        .single();

      if (!error && data) changed.push(toAchievement(data));
    }
  }

  return changed;
}

export async function getRankingAchievementsForUser(userId: string) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('ranking_achievements')
    .select('*')
    .eq('user_id', userId)
    .order('achieved_at', { ascending: false });

  if (isMissingAchievementsTableError(error)) return [];
  if (error) throw new Error(error.message);

  return (data ?? []).map(toAchievement);
}

export async function consumeLoginRankingAchievementNotifications(
  userId: string
) {
  const admin = createAdminClient();
  await syncRankingAchievementsForUser(userId);

  const { data, error } = await admin
    .from('ranking_achievements')
    .select('*')
    .eq('user_id', userId)
    .is('notified_at', null)
    .order('achieved_at', { ascending: false });

  if (isMissingAchievementsTableError(error)) return [];
  if (error) throw new Error(error.message);

  const achievements = (data ?? []).map(toAchievement);
  if (achievements.length === 0) return achievements;

  await admin
    .from('ranking_achievements')
    .update({ notified_at: new Date().toISOString() })
    .in(
      'id',
      achievements.map((achievement) => achievement.id)
    );

  return achievements;
}
