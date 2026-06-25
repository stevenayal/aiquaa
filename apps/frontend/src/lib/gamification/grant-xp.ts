import { createAdminClient } from '@/lib/supabase/admin';
import { calculateXpLevel } from '@/app/assessments/api-testing-fundamentals/lib/gamification';
import { syncRankingAchievementsForUser } from '@/lib/ranking-achievements';

export type XpRuleDefinition = {
  eventType: string;
  xpAmount: number;
  description: string;
  dailyLimit: number | null;
};

type XpRuleRow = {
  id: string | number;
  event_type: string;
  xp_amount: number;
  description: string;
  daily_limit: number | null;
  is_active: boolean;
};

type UserXpRow = {
  id: string;
  user_id: string;
  total_xp: number;
  level: number;
  current_streak: number | null;
  longest_streak: number | null;
};

export async function ensureXpRules(rules: XpRuleDefinition[]) {
  const admin = createAdminClient();

  const payload = rules.map((rule) => ({
    event_type: rule.eventType,
    xp_amount: rule.xpAmount,
    description: rule.description,
    daily_limit: rule.dailyLimit,
    is_active: true,
  }));

  const { error } = await admin
    .from('xp_rules')
    .upsert(payload, { onConflict: 'event_type' });

  if (error) {
    throw new Error(error.message);
  }
}

export async function grantGamificationXpEvent(input: {
  userId: string;
  eventType: string;
  source: string;
  sourceId: string;
  metadata: Record<string, unknown>;
}) {
  const admin = createAdminClient();
  const deduplicationKey = `${input.eventType}:${input.sourceId}`;

  const [
    { data: rule, error: ruleError },
    { data: existing, error: existingError },
  ] = await Promise.all([
    admin
      .from('xp_rules')
      .select('id, event_type, xp_amount, description, daily_limit, is_active')
      .eq('event_type', input.eventType)
      .eq('is_active', true)
      .maybeSingle<XpRuleRow>(),
    admin
      .from('xp_history')
      .select('id')
      .eq('user_id', input.userId)
      .eq('deduplication_key', deduplicationKey)
      .maybeSingle(),
  ]);

  if (ruleError) throw new Error(ruleError.message);
  if (existingError) throw new Error(existingError.message);
  if (!rule || existing) return;

  if (rule.daily_limit !== null && rule.daily_limit !== undefined) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);

    const { count, error: countError } = await admin
      .from('xp_history')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', input.userId)
      .eq('event_type', input.eventType)
      .gte('created_at', todayStart.toISOString())
      .lt('created_at', tomorrowStart.toISOString());

    if (countError) throw new Error(countError.message);
    if ((count ?? 0) >= rule.daily_limit) return;
  }

  const { data: currentXp, error: currentXpError } = await admin
    .from('user_xp')
    .select('id, user_id, total_xp, level, current_streak, longest_streak')
    .eq('user_id', input.userId)
    .maybeSingle<UserXpRow>();

  if (currentXpError) throw new Error(currentXpError.message);

  const nextTotalXp = (currentXp?.total_xp ?? 0) + rule.xp_amount;
  const nextLevel = calculateXpLevel(nextTotalXp);
  const now = new Date().toISOString();

  const { error: historyError } = await admin.from('xp_history').insert({
    user_id: input.userId,
    xp_rule_id: rule.id,
    event_type: input.eventType,
    xp_amount: rule.xp_amount,
    source: input.source,
    source_id: input.sourceId,
    deduplication_key: deduplicationKey,
    metadata: input.metadata,
  });

  if (historyError) throw new Error(historyError.message);

  const { error: userXpError } = await admin.from('user_xp').upsert(
    {
      user_id: input.userId,
      total_xp: nextTotalXp,
      level: nextLevel,
      current_streak: currentXp?.current_streak ?? 0,
      longest_streak: currentXp?.longest_streak ?? 0,
      last_activity_at: now,
      updated_at: now,
    },
    { onConflict: 'user_id' }
  );

  if (userXpError) throw new Error(userXpError.message);

  try {
    await syncRankingAchievementsForUser(input.userId);
  } catch (achievementError) {
    console.warn(
      '[ranking-achievements] sync after xp failed',
      achievementError
    );
  }
}
