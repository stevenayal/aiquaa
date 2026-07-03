'use server';

import { createClient } from '@/lib/supabase/server';

const ASSESSMENT_SLUGS = [
  'database-fundamentals',
  'database-practice',
  'infrastructure-fundamentals',
];

export interface MyEventResult {
  examType: string;
  processCode: string;
  percentage: number;
  passed: boolean;
}

export interface MyEventProgress {
  groupId: string;
  eventName: string;
  totalExamTypes: number;
  completedCount: number;
  completionRate: number;
  results: MyEventResult[];
  missingExamTypes: string[];
}

function getAttemptProcessCode(metadata: unknown) {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return '';
  }
  const value = (metadata as Record<string, unknown>).processCode;
  return typeof value === 'string' ? value : '';
}

/**
 * Returns, for every "evento" (hiring_process_group) the current candidate has
 * rendered at least one exam in, their completion % against the union of exam
 * types required by that event's processes, plus which ones are still missing.
 */
export async function getMyEventProgressAction(): Promise<{
  data: MyEventProgress[] | null;
  error: string | null;
}> {
  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return { error: 'No autenticado', data: null };

  const [{ data: examResults, error: examResultsError }, assessmentRes] =
    await Promise.all([
      supabase
        .from('exam_results')
        .select('exam_type, process_code, percentage, passed')
        .eq('user_id', user.id)
        .not('process_code', 'is', null),
      supabase
        .from('assessment_attempts')
        .select(
          'percentage, passed, metadata, assessments!inner(slug)'
        )
        .eq('user_id', user.id)
        .eq('status', 'graded')
        .in('assessments.slug', ASSESSMENT_SLUGS),
    ]);

  if (examResultsError) return { error: examResultsError.message, data: null };
  if (assessmentRes.error) return { error: assessmentRes.error.message, data: null };

  type MyResultRow = {
    examType: string;
    processCode: string;
    percentage: number;
    passed: boolean;
  };

  const myResults: MyResultRow[] = [
    ...(examResults ?? []).map((r: any) => ({
      examType: r.exam_type,
      processCode: r.process_code as string,
      percentage: Number(r.percentage ?? 0),
      passed: Boolean(r.passed),
    })),
    ...(assessmentRes.data ?? [])
      .map((r: any) => ({
        examType: (r.assessments as any)?.slug ?? 'unknown',
        processCode: getAttemptProcessCode(r.metadata),
        percentage: Number(r.percentage ?? 0),
        passed: Boolean(r.passed),
      }))
      .filter((r) => r.processCode),
  ];

  if (myResults.length === 0) return { data: [], error: null };

  const processCodes = [...new Set(myResults.map((r) => r.processCode))];

  const { data: myProcesses, error: procError } = await supabase
    .from('hiring_processes')
    .select('code, group_id, exam_types')
    .in('code', processCodes)
    .not('group_id', 'is', null);

  if (procError) return { error: procError.message, data: null };

  const processRows = myProcesses ?? [];
  const groupIds = [...new Set(processRows.map((p) => p.group_id as string))];
  if (groupIds.length === 0) return { data: [], error: null };

  const { data: groups, error: groupsError } = await supabase
    .from('hiring_process_groups')
    .select('id, name')
    .in('id', groupIds);

  if (groupsError) return { error: groupsError.message, data: null };

  const groupNameById = new Map(
    (groups ?? []).map((g: any) => [g.id, g.name as string])
  );

  // For every event, union the exam_types of all its processes the candidate
  // has visibility into (required set), then intersect with their own results
  // limited to that event's processes.
  const examTypesByGroup = new Map<string, Set<string>>();
  const processCodesByGroup = new Map<string, Set<string>>();
  for (const p of processRows) {
    const gid = p.group_id as string;
    const types = examTypesByGroup.get(gid) ?? new Set<string>();
    (p.exam_types ?? []).forEach((t: string) => types.add(t));
    examTypesByGroup.set(gid, types);

    const codes = processCodesByGroup.get(gid) ?? new Set<string>();
    codes.add(p.code);
    processCodesByGroup.set(gid, codes);
  }

  const progress: MyEventProgress[] = Array.from(examTypesByGroup.entries())
    .filter(([groupId]) => groupNameById.has(groupId))
    .map(([groupId, requiredTypes]) => {
      const myCodes = processCodesByGroup.get(groupId) ?? new Set<string>();
      const resultsInGroup = myResults.filter((r) =>
        myCodes.has(r.processCode)
      );

      // Best attempt per distinct exam type
      const bestByType = new Map<string, MyResultRow>();
      for (const r of resultsInGroup) {
        const existing = bestByType.get(r.examType);
        if (!existing || r.percentage > existing.percentage) {
          bestByType.set(r.examType, r);
        }
      }

      const results: MyEventResult[] = Array.from(bestByType.values())
        .map((r) => ({
          examType: r.examType,
          processCode: r.processCode,
          percentage: r.percentage,
          passed: r.passed,
        }))
        .sort((a, b) => b.percentage - a.percentage);

      const missingExamTypes = Array.from(requiredTypes).filter(
        (t) => !bestByType.has(t)
      );

      const totalExamTypes = requiredTypes.size;
      const completedCount = results.length;

      return {
        groupId,
        eventName: groupNameById.get(groupId) ?? 'Evento',
        totalExamTypes,
        completedCount,
        completionRate:
          totalExamTypes > 0
            ? Math.round((completedCount / totalExamTypes) * 100)
            : 0,
        results,
        missingExamTypes,
      };
    })
    .sort((a, b) => b.completionRate - a.completionRate);

  return { data: progress, error: null };
}
