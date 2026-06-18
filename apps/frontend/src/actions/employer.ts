'use server';

import { createClient } from '@/lib/supabase/server';

export interface HiringProcess {
  id: string;
  code: string;
  created_by: string;
  company_name: string;
  position_name: string;
  description?: string;
  exam_types: string[];
  status: 'draft' | 'active' | 'closed';
  expires_at?: string;
  created_at: string;
  group_id?: string | null;
}

export interface ProcessGroup {
  id: string;
  empresa_id: string;
  name: string;
  description?: string | null;
  created_at: string;
}

export interface ProcessCandidate {
  id: string;
  user_id: string;
  participant_name?: string;
  exam_type: string;
  score: number;
  percentage: number;
  passed: boolean;
  time_spent: number;
  created_at: string;
  profiles?: { display_name?: string; email?: string };
}

export interface EmpresaDashboardStats {
  totalProcesses: number;
  activeProcesses: number;
  closedProcesses: number;
  totalCandidates: number;
  passedCandidates: number;
  passRate: number;
  avgTimeSpentMinutes: number | null;
  pendingProspects: number;
  pendingInvitaciones: number;
  monthlyProcesses: Array<{ month: string; value: number }>;
  monthlyCandidates: Array<{ month: string; value: number }>;
}

function generateCode(company: string): string {
  const slug = company
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 6);
  const year = new Date().getFullYear();
  const rand = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${slug}-${year}-${rand}`;
}

export async function getMyProcessGroupsAction(): Promise<{
  data: ProcessGroup[] | null;
  error: string | null;
}> {
  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return { error: 'No autenticado', data: null };

  const { data, error } = await supabase
    .from('hiring_process_groups')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) return { error: error.message, data: null };
  return { data: data ?? [], error: null };
}

export async function createProcessGroupAction(payload: {
  name: string;
  description?: string;
}): Promise<{ data: ProcessGroup | null; error: string | null }> {
  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return { error: 'No autenticado', data: null };

  const { data: profile } = await supabase
    .from('profiles')
    .select('empresa_id')
    .eq('id', user.id)
    .single();

  if (!profile?.empresa_id)
    return { error: 'No pertenecés a ninguna empresa', data: null };

  const { data, error } = await supabase
    .from('hiring_process_groups')
    .insert({
      empresa_id: profile.empresa_id,
      name: payload.name.trim(),
      description: payload.description?.trim() || null,
    })
    .select()
    .single();

  if (error) return { error: error.message, data: null };
  return { data, error: null };
}

export async function deleteProcessGroupAction(
  groupId: string
): Promise<{ error: string | null }> {
  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return { error: 'No autenticado' };

  const { error } = await supabase
    .from('hiring_process_groups')
    .delete()
    .eq('id', groupId);

  if (error) return { error: error.message };
  return { error: null };
}

export async function assignProcessToGroupAction(
  processId: string,
  groupId: string | null
): Promise<{ error: string | null }> {
  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return { error: 'No autenticado' };

  const { error } = await supabase
    .from('hiring_processes')
    .update({ group_id: groupId })
    .eq('id', processId);

  if (error) return { error: error.message };
  return { error: null };
}

export async function createHiringProcessAction(payload: {
  company_name: string;
  position_name: string;
  description?: string;
  exam_types: string[];
  expires_at?: string;
  group_id?: string | null;
}) {
  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return { error: 'No autenticado' };

  const code = generateCode(payload.company_name);

  // Attach empresa_id so all empresa members can access this process
  const { data: profile } = await supabase
    .from('profiles')
    .select('empresa_id')
    .eq('id', user.id)
    .single();

  const { group_id, ...rest } = payload;
  const { data, error } = await supabase
    .from('hiring_processes')
    .insert({
      ...rest,
      code,
      created_by: user.id,
      status: 'active',
      ...(profile?.empresa_id ? { empresa_id: profile.empresa_id } : {}),
      ...(group_id ? { group_id } : {}),
    })
    .select()
    .single();

  if (error) return { error: error.message };
  return { data };
}

export async function getMyProcessesAction() {
  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return { error: 'No autenticado', data: null };

  // RLS already filters to empresa members + own processes — no extra filter needed
  const { data, error } = await supabase
    .from('hiring_processes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return { error: error.message, data: null };
  return { data };
}

export async function getProcessCandidatesAction(code: string) {
  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user)
    return { error: 'No autenticado', data: null, process: null };

  // RLS already enforces empresa membership — remove created_by filter
  const { data: process, error: procError } = await supabase
    .from('hiring_processes')
    .select('*')
    .eq('code', code)
    .single();

  if (procError || !process)
    return { error: 'Proceso no encontrado', data: null, process: null };

  const { data, error } = await supabase
    .from('exam_results')
    .select(
      'id, user_id, participant_name, exam_type, score, percentage, passed, time_spent, created_at'
    )
    .eq('process_code', code)
    .order('percentage', { ascending: false });

  if (error) return { error: error.message, data: null, process };
  return { data, process };
}

export async function validateProcessCodeAction(code: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('hiring_processes')
    .select('code, company_name, position_name, status, expires_at')
    .ilike('code', code.trim())
    .eq('status', 'active')
    .single();

  if (error || !data)
    return { valid: false, process: null, reason: 'not_found' as const };
  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return { valid: false, process: null, reason: 'expired' as const };
  }
  return { valid: true, process: data, reason: null };
}

export async function updateProcessStatusAction(
  code: string,
  status: 'active' | 'closed'
) {
  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return { error: 'No autenticado' };

  // RLS enforces empresa membership access
  const { error } = await supabase
    .from('hiring_processes')
    .update({ status })
    .eq('code', code);

  if (error) return { error: error.message };
  return { success: true };
}

function monthKey(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function buildMonthlyBuckets(months = 6) {
  const now = new Date();
  const buckets: { key: string; month: string; value: number }[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    buckets.push({
      key,
      month: d.toLocaleDateString('es-PY', { month: 'short' }),
      value: 0,
    });
  }
  return buckets;
}

export async function getEmpresaDashboardStatsAction(): Promise<{
  data: EmpresaDashboardStats | null;
  error: string | null;
}> {
  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return { error: 'No autenticado', data: null };

  // Get empresa_id from membership
  const { data: membership } = await supabase
    .from('empresa_miembros')
    .select('empresa_id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single();

  const empresaId = membership?.empresa_id;

  const { data: processes, error: processError } = await supabase
    .from('hiring_processes')
    .select('id, code, status, created_at')
    .order('created_at', { ascending: false });

  if (processError) return { error: processError.message, data: null };

  const processIds = (processes ?? []).map((p) => p.id);
  const processCodes = (processes ?? []).map((p) => p.code);

  let results: Array<{
    process_code: string;
    passed: boolean;
    created_at: string;
    time_spent: number;
  }> = [];
  let pendingProspects = 0;
  let pendingInvitaciones = 0;

  const fetchExamResults =
    processCodes.length > 0
      ? supabase
          .from('exam_results')
          .select('process_code, passed, created_at, time_spent')
          .in('process_code', processCodes)
      : Promise.resolve({ data: [] as typeof results, error: null });

  const fetchPendingProspects =
    processIds.length > 0
      ? supabase
          .from('prospects')
          .select('*', { count: 'exact', head: true })
          .in('process_id', processIds)
          .eq('status', 'pendiente')
      : Promise.resolve({ count: 0, data: null, error: null });

  const fetchPendingInvitaciones = empresaId
    ? supabase
        .from('empresa_invitaciones')
        .select('*', { count: 'exact', head: true })
        .eq('empresa_id', empresaId)
        .in('status', ['pendiente', 'vista'])
    : Promise.resolve({ count: 0, data: null, error: null });

  const [examResp, prospectsResp, invitacionesResp] = await Promise.all([
    fetchExamResults,
    fetchPendingProspects,
    fetchPendingInvitaciones,
  ]);

  results = (examResp.data as typeof results) ?? [];
  pendingProspects = prospectsResp.count ?? 0;
  pendingInvitaciones = invitacionesResp.count ?? 0;

  const monthlyProcessesBuckets = buildMonthlyBuckets(6);
  const monthlyCandidatesBuckets = buildMonthlyBuckets(6);
  const monthlyProcessesIndex = new Map(
    monthlyProcessesBuckets.map((bucket, idx) => [bucket.key, idx])
  );
  const monthlyCandidatesIndex = new Map(
    monthlyCandidatesBuckets.map((bucket, idx) => [bucket.key, idx])
  );

  (processes ?? []).forEach((processItem) => {
    const idx = monthlyProcessesIndex.get(monthKey(processItem.created_at));
    if (idx !== undefined) monthlyProcessesBuckets[idx].value += 1;
  });

  results.forEach((candidate) => {
    const idx = monthlyCandidatesIndex.get(monthKey(candidate.created_at));
    if (idx !== undefined) monthlyCandidatesBuckets[idx].value += 1;
  });

  const totalCandidates = results.length;
  const passedCandidates = results.filter((r) => r.passed).length;
  const avgTimeSpentMinutes =
    totalCandidates > 0
      ? Math.round(
          results.reduce((acc, r) => acc + (r.time_spent ?? 0), 0) /
            totalCandidates /
            60
        )
      : null;

  return {
    data: {
      totalProcesses: processes?.length ?? 0,
      activeProcesses:
        processes?.filter((processItem) => processItem.status === 'active')
          .length ?? 0,
      closedProcesses:
        processes?.filter((processItem) => processItem.status === 'closed')
          .length ?? 0,
      totalCandidates,
      passedCandidates,
      passRate:
        totalCandidates > 0
          ? Math.round((passedCandidates / totalCandidates) * 100)
          : 0,
      avgTimeSpentMinutes,
      pendingProspects,
      pendingInvitaciones,
      monthlyProcesses: monthlyProcessesBuckets.map(({ month, value }) => ({
        month,
        value,
      })),
      monthlyCandidates: monthlyCandidatesBuckets.map(({ month, value }) => ({
        month,
        value,
      })),
    },
    error: null,
  };
}

export interface EventProcessStat {
  id: string;
  code: string;
  position_name: string;
  status: 'draft' | 'active' | 'closed';
  expires_at: string | null;
  candidateCount: number;
  passedCount: number;
  passRate: number;
  topScore: number | null;
}

export interface EventTopCandidate {
  name: string;
  examType: string;
  processCode: string;
  percentage: number;
  passed: boolean;
}

export interface EventExamTypeStat {
  examType: string;
  total: number;
  passed: number;
  passRate: number;
}

export interface EventStats {
  group: ProcessGroup;
  processes: EventProcessStat[];
  topCandidates: EventTopCandidate[];
  byExamType: EventExamTypeStat[];
  totals: {
    candidates: number;
    passed: number;
    passRate: number;
    avgScore: number | null;
  };
}

export async function getEventStatsAction(groupId: string): Promise<{
  data: EventStats | null;
  error: string | null;
}> {
  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return { error: 'No autenticado', data: null };

  const { data: group, error: groupError } = await supabase
    .from('hiring_process_groups')
    .select('*')
    .eq('id', groupId)
    .single();

  if (groupError || !group)
    return { error: 'Evento no encontrado', data: null };

  const { data: procs, error: procsError } = await supabase
    .from('hiring_processes')
    .select('id, code, position_name, status, expires_at')
    .eq('group_id', groupId)
    .order('created_at', { ascending: true });

  if (procsError) return { error: procsError.message, data: null };
  const processes = procs ?? [];

  const codes = processes.map((p) => p.code);
  if (codes.length === 0) {
    return {
      data: {
        group,
        processes: [],
        topCandidates: [],
        byExamType: [],
        totals: { candidates: 0, passed: 0, passRate: 0, avgScore: null },
      },
      error: null,
    };
  }

  const { data: results, error: resultsError } = await supabase
    .from('exam_results')
    .select(
      'participant_name, participant_email, exam_type, percentage, passed, process_code'
    )
    .in('process_code', codes);

  if (resultsError) return { error: resultsError.message, data: null };
  const allResults = results ?? [];

  // Per-process stats
  const processStats: EventProcessStat[] = processes.map((p) => {
    const rows = allResults.filter((r) => r.process_code === p.code);
    const passed = rows.filter((r) => r.passed).length;
    const scores = rows.map((r) => r.percentage);
    return {
      id: p.id,
      code: p.code,
      position_name: p.position_name,
      status: p.status,
      expires_at: p.expires_at,
      candidateCount: rows.length,
      passedCount: passed,
      passRate: rows.length > 0 ? Math.round((passed / rows.length) * 100) : 0,
      topScore: scores.length > 0 ? Math.max(...scores) : null,
    };
  });

  // Top 10 candidates: best attempt per (email OR name) across all processes
  const bestByKey = new Map<
    string,
    {
      name: string;
      examType: string;
      processCode: string;
      percentage: number;
      passed: boolean;
    }
  >();
  for (const r of allResults) {
    const key = (r.participant_email || r.participant_name || '').toLowerCase();
    if (!key) continue;
    const existing = bestByKey.get(key);
    if (!existing || r.percentage > existing.percentage) {
      bestByKey.set(key, {
        name: r.participant_name || r.participant_email || 'Sin nombre',
        examType: r.exam_type,
        processCode: r.process_code ?? '',
        percentage: r.percentage,
        passed: r.passed,
      });
    }
  }
  const topCandidates = Array.from(bestByKey.values())
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 10);

  // By exam type
  const examTypeMap = new Map<string, { total: number; passed: number }>();
  for (const r of allResults) {
    const et = r.exam_type;
    const cur = examTypeMap.get(et) ?? { total: 0, passed: 0 };
    examTypeMap.set(et, {
      total: cur.total + 1,
      passed: cur.passed + (r.passed ? 1 : 0),
    });
  }
  const byExamType: EventExamTypeStat[] = Array.from(examTypeMap.entries()).map(
    ([examType, { total, passed }]) => ({
      examType,
      total,
      passed,
      passRate: total > 0 ? Math.round((passed / total) * 100) : 0,
    })
  );

  const totalCandidates = allResults.length;
  const totalPassed = allResults.filter((r) => r.passed).length;
  const avgScore =
    totalCandidates > 0
      ? Math.round(
          allResults.reduce((sum, r) => sum + r.percentage, 0) / totalCandidates
        )
      : null;

  return {
    data: {
      group,
      processes: processStats,
      topCandidates,
      byExamType,
      totals: {
        candidates: totalCandidates,
        passed: totalPassed,
        passRate:
          totalCandidates > 0
            ? Math.round((totalPassed / totalCandidates) * 100)
            : 0,
        avgScore,
      },
    },
    error: null,
  };
}
