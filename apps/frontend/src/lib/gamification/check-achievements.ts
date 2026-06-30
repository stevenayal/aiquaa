import 'server-only';

import { createAdminClient } from '@/lib/supabase/admin';

type AchievementRow = {
  id: string;
  key: string;
  name: string;
  criteria_type: string;
  criteria_value: number;
  xp_bonus: number;
};

async function qualifiesForAchievement(
  userId: string,
  achievement: AchievementRow,
  admin: ReturnType<typeof createAdminClient>
): Promise<boolean> {
  const { criteria_type, criteria_value } = achievement;

  switch (criteria_type) {
    case 'ISTQB_COMPLETED_COUNT': {
      const { count } = await admin
        .from('exam_results')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId);
      return (count ?? 0) >= criteria_value;
    }

    case 'ISTQB_PASSED_COUNT': {
      const { count } = await admin
        .from('exam_results')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('passed', true);
      return (count ?? 0) >= criteria_value;
    }

    case 'ALLPAIRS_COUNT':
    case 'ALLPAIRS_LARGE_COUNT': {
      const { count } = await admin
        .from('tool_usage')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('tool_slug', 'allpairs');
      return (count ?? 0) >= criteria_value;
    }

    case 'USER_LEVEL': {
      const { data } = await admin
        .from('user_xp')
        .select('level')
        .eq('user_id', userId)
        .maybeSingle();
      return (data?.level ?? 0) >= criteria_value;
    }

    case 'STREAK_DAYS': {
      const { data } = await admin
        .from('user_xp')
        .select('current_streak, longest_streak')
        .eq('user_id', userId)
        .maybeSingle();
      const best = Math.max(data?.current_streak ?? 0, data?.longest_streak ?? 0);
      return best >= criteria_value;
    }

    case 'DAILY_LOGIN_COUNT': {
      const { data } = await admin
        .from('xp_history')
        .select('created_at')
        .eq('user_id', userId);
      const distinctDays = new Set(
        (data ?? []).map((r) => String(r.created_at).substring(0, 10))
      );
      return distinctDays.size >= criteria_value;
    }

    default:
      return false;
  }
}

export async function checkAndAwardAchievements(userId: string): Promise<void> {
  const admin = createAdminClient();

  const { data: achievements, error: achError } = await admin
    .from('achievements')
    .select('id, key, name, criteria_type, criteria_value, xp_bonus')
    .eq('is_active', true);

  if (achError || !achievements || achievements.length === 0) return;

  const { data: earned } = await admin
    .from('user_achievements')
    .select('achievement_id')
    .eq('user_id', userId);

  const earnedIds = new Set((earned ?? []).map((e) => String(e.achievement_id)));

  for (const achievement of achievements as AchievementRow[]) {
    if (earnedIds.has(achievement.id)) continue;

    let qualified = false;
    try {
      qualified = await qualifiesForAchievement(userId, achievement, admin);
    } catch {
      continue;
    }
    if (!qualified) continue;

    await admin.from('user_achievements').insert({
      user_id: userId,
      achievement_id: achievement.id,
      unlocked_at: new Date().toISOString(),
      source: 'auto',
      xp_awarded: achievement.xp_bonus ?? 0,
    });
  }
}
