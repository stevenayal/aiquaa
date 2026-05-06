import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const svcKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!svcKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY not set');

  return createSupabaseClient(url, svcKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
