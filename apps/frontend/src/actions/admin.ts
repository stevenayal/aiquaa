'use server';

import { createClient } from '@/lib/supabase/server';

async function requireAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'No autenticado', supabase: null };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') return { error: 'Acceso denegado', supabase: null };
  return { error: null, supabase };
}

export async function getAdminUsersAction() {
  const { error, supabase } = await requireAdmin();
  if (error || !supabase) return { error, data: null };

  const { data, error: dbError } = await supabase
    .from('profiles')
    .select('id, display_name, email, role, created_at')
    .order('created_at', { ascending: false });

  if (dbError) return { error: dbError.message, data: null };
  return { data };
}

export async function changeUserRoleAction(targetUserId: string, newRole: 'comunidad' | 'employer' | 'admin') {
  const { error, supabase } = await requireAdmin();
  if (error || !supabase) return { error };

  const { error: fnError } = await supabase.rpc('change_user_role', {
    target_user_id: targetUserId,
    new_role: newRole,
  });

  if (fnError) return { error: fnError.message };
  return { success: true };
}

export async function getAdminProcessesAction() {
  const { error, supabase } = await requireAdmin();
  if (error || !supabase) return { error, data: null };

  const { data, error: dbError } = await supabase
    .from('hiring_processes')
    .select(`
      id, code, company_name, position_name, status, created_at, expires_at,
      profiles!hiring_processes_created_by_fkey(display_name, email)
    `)
    .order('created_at', { ascending: false });

  if (dbError) return { error: dbError.message, data: null };
  return { data };
}

export async function getAdminStatsAction() {
  const { error, supabase } = await requireAdmin();
  if (error || !supabase) return { error, data: null };

  const [users, processes, results] = await Promise.all([
    supabase.from('profiles').select('role'),
    supabase.from('hiring_processes').select('status'),
    supabase.from('exam_results').select('passed'),
  ]);

  const userCounts = {
    total: users.data?.length ?? 0,
    admins: users.data?.filter(u => u.role === 'admin').length ?? 0,
    employers: users.data?.filter(u => u.role === 'employer').length ?? 0,
    comunidad: users.data?.filter(u => u.role === 'comunidad').length ?? 0,
  };

  const processCounts = {
    total: processes.data?.length ?? 0,
    active: processes.data?.filter(p => p.status === 'active').length ?? 0,
    closed: processes.data?.filter(p => p.status === 'closed').length ?? 0,
  };

  const resultCounts = {
    total: results.data?.length ?? 0,
    passed: results.data?.filter(r => r.passed).length ?? 0,
  };

  return { data: { userCounts, processCounts, resultCounts } };
}
