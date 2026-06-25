import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { consumeLoginRankingAchievementNotifications } from '@/lib/ranking-achievements';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function getAuthenticatedUserId(req: NextRequest) {
  const bearer = req.headers.get('authorization');

  if (bearer?.startsWith('Bearer ')) {
    const token = bearer.slice('Bearer '.length);
    const admin = createAdminClient();
    const {
      data: { user },
    } = await admin.auth.getUser(token);
    return user?.id ?? null;
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user?.id ?? null;
}

export async function POST(req: NextRequest) {
  const userId = await getAuthenticatedUserId(req);

  if (!userId) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  try {
    const achievements =
      await consumeLoginRankingAchievementNotifications(userId);

    return NextResponse.json({ achievements });
  } catch (error) {
    console.warn('[ranking-achievements] login notification failed', error);
    return NextResponse.json({ achievements: [] });
  }
}
