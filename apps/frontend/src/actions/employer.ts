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
  repository_url?: string | null;
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
  repository_url?: string;
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
    .select(
      'code, company_name, position_name, status, expires_at, exam_types, repository_url'
    )
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

export interface EventCandidate {
  name: string;
  email: string | null;
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
  /** All candidates sorted by percentage DESC (use .slice(0,10) for chart) */
  allCandidates: EventCandidate[];
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
        allCandidates: [],
        byExamType: [],
        totals: { candidates: 0, passed: 0, passRate: 0, avgScore: null },
      },
      error: null,
    };
  }

  // Fetch from exam_results (istqb, git, performance, api-testing-fundamentals, api-banking)
  const [examResultsRes, assessmentAttemptsRes] = await Promise.all([
    supabase
      .from('exam_results')
      .select(
        'participant_name, participant_email, exam_type, percentage, passed, process_code'
      )
      .in('process_code', codes),
    // database-fundamentals and database-practice live in assessment_attempts
    supabase
      .from('assessment_attempts')
      .select(
        'user_id, total_score, percentage, passed, created_at, assessments!inner(slug), metadata'
      )
      .or(codes.map((c) => `metadata->>processCode.eq.${c}`).join(','))
      .eq('status', 'graded'),
  ]);

  if (examResultsRes.error)
    return { error: examResultsRes.error.message, data: null };

  const examRows = examResultsRes.data ?? [];

  // Resolve user_ids from assessment_attempts to names/emails
  const attemptRows = assessmentAttemptsRes.data ?? [];
  const userIds = [
    ...new Set(attemptRows.map((r: any) => r.user_id).filter(Boolean)),
  ];
  const profileMap: Record<
    string,
    { display_name: string | null; email: string | null }
  > = {};
  if (userIds.length > 0) {
    const { data: profileRows } = await supabase
      .from('profiles')
      .select('id, display_name, email')
      .in('id', userIds);
    (profileRows ?? []).forEach((p: any) => {
      profileMap[p.id] = p;
    });
  }

  // Normalise assessment_attempts into the same shape
  const mappedAttempts: EventCandidate[] = attemptRows.map((r: any) => {
    const profile = profileMap[r.user_id];
    const processCode =
      typeof r.metadata === 'object' && r.metadata !== null
        ? ((r.metadata as Record<string, string>).processCode ?? '')
        : '';
    return {
      name: profile?.display_name || profile?.email || 'Sin nombre',
      email: profile?.email ?? null,
      examType: (r.assessments as any)?.slug ?? 'unknown',
      processCode,
      percentage: r.percentage ?? 0,
      passed: r.passed ?? false,
    };
  });

  // Normalise exam_results
  const mappedExams: EventCandidate[] = examRows.map((r) => ({
    name: r.participant_name || r.participant_email || 'Sin nombre',
    email: r.participant_email ?? null,
    examType: r.exam_type,
    processCode: r.process_code ?? '',
    percentage: r.percentage ?? 0,
    passed: r.passed ?? false,
  }));

  const allRaw = [...mappedExams, ...mappedAttempts];

  // Per-process stats (across both sources)
  const processStats: EventProcessStat[] = processes.map((p) => {
    const rows = allRaw.filter((r) => r.processCode === p.code);
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

  // Deduplicate by identity key (email ?? name), keeping best score per person
  const bestByKey = new Map<string, EventCandidate>();
  for (const r of allRaw) {
    const key = (r.email || r.name || '').toLowerCase().trim();
    if (!key) continue;
    const existing = bestByKey.get(key);
    if (!existing || r.percentage > existing.percentage) {
      bestByKey.set(key, r);
    }
  }
  const allCandidates = Array.from(bestByKey.values()).sort(
    (a, b) => b.percentage - a.percentage
  );

  // By exam type (across both sources, all rows not deduplicated)
  const examTypeMap = new Map<string, { total: number; passed: number }>();
  for (const r of allRaw) {
    const et = r.examType;
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

  const totalCandidates = allCandidates.length;
  const totalPassed = allCandidates.filter((r) => r.passed).length;
  const avgScore =
    totalCandidates > 0
      ? Math.round(
          allCandidates.reduce((sum, r) => sum + r.percentage, 0) /
            totalCandidates
        )
      : null;

  return {
    data: {
      group,
      processes: processStats,
      allCandidates,
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
