'use client';

import React from 'react';
import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { createClient } from '@/lib/supabase/client';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  buildFavoriteMap,
  buildTalentDirectory,
  type CandidateProfile,
  type CandidateResult,
  type FavoriteRow,
  type TalentCandidate,
} from './candidateDirectory';
import { createInvitacionAction } from '@/actions/empresa-invitaciones';

type SectionScore = {
  section: string;
  correct: number;
  total: number;
  percentage: number;
};

type ExamResult = {
  id: string;
  participant_name: string | null;
  participant_email: string | null;
  user_id: string | null;
  exam_type: string;
  score: number;
  percentage: number;
  passed: boolean;
  time_spent: number;
  created_at: string;
  process_code: string | null;
  section_scores: SectionScore[] | null;
  learning_objectives: unknown | null;
  profiles?: { display_name: string | null }[] | null;
};

type ViewMode = 'evaluados' | 'talento' | 'favoritos';

type HiringProcess = {
  id: string;
  code: string;
  position_name: string;
  status: string;
};

const EXAM_LABELS: Record<string, string> = {
  istqb: 'ISTQB CTFL',
  git: 'Git',
  'git-practico': 'Git Práctica',
  performance: 'Performance',
  'api-testing-fundamentals': 'API Testing Fundamentals',
  'api-banking': 'API Testing Challenge',
  'database-fundamentals': 'Bases de Datos — Fundamentos',
  'database-practice': 'Bases de Datos — Práctica SQL',
  'infrastructure-fundamentals': 'Infraestructura — Fundamentos',
};

const DATABASE_ASSESSMENT_SLUGS = [
  'database-fundamentals',
  'database-practice',
  'infrastructure-fundamentals',
];

const ISTQB_LEVEL_LABELS: Record<string, string> = {
  ctfl: 'Foundation Level (CTFL)',
  ctal_ta: 'Advanced Level — Test Analyst',
  ctal_tm: 'Advanced Level — Test Manager',
  ctal_tta: 'Advanced Level — Technical Test Analyst',
  expert: 'Expert Level',
  en_proceso: 'En proceso de certificación',
};

function getAttemptProcessCode(metadata: unknown) {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return '';
  }

  const value = (metadata as Record<string, unknown>).processCode;
  return typeof value === 'string' ? value : '';
}

function getAttemptTimeSpentSeconds(row: {
  started_at?: string | null;
  submitted_at?: string | null;
}) {
  if (!row.started_at || !row.submitted_at) return 0;

  const started = new Date(row.started_at).getTime();
  const submitted = new Date(row.submitted_at).getTime();
  if (!Number.isFinite(started) || !Number.isFinite(submitted)) return 0;

  return Math.max(0, Math.round((submitted - started) / 1000));
}

type SortKey = 'percentage' | 'created_at' | 'participant_name';
type SortDir = 'asc' | 'desc';

export default function CandidatosPage() {
  const { isDarkMode } = useTheme();
  const [processes, setProcesses] = useState<HiringProcess[]>([]);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [talentCandidates, setTalentCandidates] = useState<TalentCandidate[]>(
    []
  );
  const [favorites, setFavorites] = useState<FavoriteRow[]>([]);
  const [empresaId, setEmpresaId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Filters
  const [viewMode, setViewMode] = useState<ViewMode>('evaluados');
  const [search, setSearch] = useState('');
  const [selectedCode, setSelectedCode] = useState<string>('all');
  const [filterExam, setFilterExam] = useState<string>('all');
  const [filterIstqbLevel, setFilterIstqbLevel] = useState<string>('all');
  const [filterPassed, setFilterPassed] = useState<'all' | 'passed' | 'failed'>(
    'all'
  );
  const [sortKey, setSortKey] = useState<SortKey>('percentage');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>(
    []
  );
  const [filterCountry, setFilterCountry] = useState<string>('all');
  const [inviteEmail, setInviteEmail] = useState<string | null>(null);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteSending, setInviteSending] = useState(false);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      let currentEmpresaId: string | null = null;
      if (user?.id) {
        const { data: currentProfile } = await supabase
          .from('profiles')
          .select('empresa_id')
          .eq('id', user.id)
          .maybeSingle();

        currentEmpresaId = currentProfile?.empresa_id ?? null;
        setEmpresaId(currentEmpresaId);
      }

      const { data: procs } = await supabase
        .from('hiring_processes')
        .select('id, code, position_name, status')
        .order('created_at', { ascending: false });

      const [favoritesRes, talentResultsRes] = await Promise.all([
        currentEmpresaId
          ? supabase
              .from('empresa_favoritos')
              .select('id, candidate_id, notes, created_at')
              .eq('empresa_id', currentEmpresaId)
          : Promise.resolve({ data: [], error: null }),
        supabase
          .from('exam_results')
          .select(
            'id, user_id, participant_name, participant_email, exam_type, percentage, passed, created_at'
          )
          .not('user_id', 'is', null)
          .lte('percentage', 100)
          .order('created_at', { ascending: false })
          .limit(500),
      ]);

      const favoriteRows = ((favoritesRes.data ?? []) as FavoriteRow[]).filter(
        (favorite) => Boolean(favorite.candidate_id)
      );
      setFavorites(favoriteRows);

      const talentResults = (talentResultsRes.data ?? []) as CandidateResult[];
      const talentUserIds = [
        ...new Set(talentResults.map((row) => row.user_id).filter(Boolean)),
      ] as string[];
      let visibleProfiles: CandidateProfile[] = [];

      if (talentUserIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select(
            'id, display_name, role, country, istqb_level, github_profile, qa_skills, disponibilidad, talent_visible_to_empresas'
          )
          .in('id', talentUserIds)
          .eq('audience', 'candidato')
          .eq('talent_visible_to_empresas', true);

        visibleProfiles = (profiles ?? []) as CandidateProfile[];
      }

      setTalentCandidates(
        buildTalentDirectory(talentResults, visibleProfiles, favoriteRows)
      );

      // Filtro server-side: solo traer exam_results de los procesos de esta
      // empresa (.in), en vez de cargar toda la plataforma y filtrar en cliente.
      // Sin procesos no hay resultados que cargar: se evita la query.
      const processCodes = (procs ?? [])
        .map((p) => p.code)
        .filter((c): c is string => Boolean(c));

      let myResults: ExamResult[] = [];
      if (processCodes.length > 0) {
        const [examResultsRes, assessmentAttemptsRes] = await Promise.all([
          supabase
            .from('exam_results')
            .select(
              'id, participant_name, participant_email, user_id, exam_type, score, percentage, passed, time_spent, created_at, process_code, section_scores, learning_objectives, profiles(display_name)'
            )
            .in('process_code', processCodes),
          supabase
            .from('assessment_attempts')
            .select(
              'id, user_id, total_score, percentage, passed, started_at, submitted_at, created_at, assessments!inner(slug), metadata'
            )
            .or(
              processCodes
                .map((code) => `metadata->>processCode.eq.${code}`)
                .join(',')
            )
            .in('assessments.slug', DATABASE_ASSESSMENT_SLUGS)
            .eq('status', 'graded'),
        ]);

        // Use current profile name when available; fall back to the snapshot stored at exam time
        const examResults = ((examResultsRes.data ?? []) as ExamResult[]).map(
          (r) => ({
            ...r,
            participant_name:
              r.profiles?.[0]?.display_name ?? r.participant_name,
          })
        );

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

          (profileRows ?? []).forEach((profile: any) => {
            profileMap[profile.id] = profile;
          });
        }

        // #205: section breakdown for assessment_attempts lives in
        // assessment_scores (one row per section). Fetch and group by attempt
        // so recruiters see per-area performance, not just the total score.
        const attemptIds = attemptRows.map((r: any) => r.id).filter(Boolean);
        const sectionScoresByAttempt: Record<string, SectionScore[]> = {};
        if (attemptIds.length > 0) {
          const { data: scoreRows } = await supabase
            .from('assessment_scores')
            .select(
              'attempt_id, score, max_score, assessment_sections!inner(title, order_index)'
            )
            .in('attempt_id', attemptIds);

          (scoreRows ?? []).forEach((sr: any) => {
            const section = (sr.assessment_sections as any)?.title;
            const total = Number(sr.max_score ?? 0);
            const correct = Number(sr.score ?? 0);
            if (!section || total <= 0) return;
            const list = sectionScoresByAttempt[sr.attempt_id] ?? [];
            list.push({
              section,
              correct,
              total,
              percentage: Math.round((correct / total) * 100),
            });
            sectionScoresByAttempt[sr.attempt_id] = list;
          });
        }

        const assessmentResults: ExamResult[] = attemptRows.map((row: any) => {
          const profile = profileMap[row.user_id] ?? null;
          return {
            id: row.id,
            participant_name:
              profile?.display_name || profile?.email || 'Sin nombre',
            participant_email: profile?.email ?? null,
            user_id: row.user_id ?? null,
            exam_type: (row.assessments as any)?.slug ?? 'unknown',
            score: Number(row.total_score ?? 0),
            percentage: Number(row.percentage ?? 0),
            passed: Boolean(row.passed),
            time_spent: getAttemptTimeSpentSeconds(row),
            created_at: row.submitted_at ?? row.created_at,
            process_code: getAttemptProcessCode(row.metadata),
            section_scores: sectionScoresByAttempt[row.id] ?? null,
            learning_objectives: null,
            profiles: null,
          };
        });

        myResults = [...examResults, ...assessmentResults].sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      }

      setProcesses(procs ?? []);
      setResults(myResults);
      setLoading(false);
    };
    load();
  }, []);

  const availableExamTypes = useMemo(
    () => [...new Set(results.map((r) => r.exam_type))],
    [results]
  );

  // For each result, compute its attempt index and total attempts for that candidate+exam combo
  const attemptInfo = useMemo(() => {
    const groups = new Map<string, ExamResult[]>();
    for (const r of results) {
      const key = `${r.participant_email ?? r.participant_name ?? r.id}|${r.exam_type}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(r);
    }
    const indexMap = new Map<string, number>(); // resultId -> attempt number (1-based)
    const totalMap = new Map<string, number>(); // resultId -> total attempts
    for (const group of groups.values()) {
      const sorted = [...group].sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      sorted.forEach((r, i) => {
        indexMap.set(r.id, i + 1);
        totalMap.set(r.id, sorted.length);
      });
    }
    return { indexMap, totalMap };
  }, [results]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return results
      .filter((r) => {
        const matchSearch =
          !q ||
          (r.participant_name?.toLowerCase().includes(q) ?? false) ||
          (r.participant_email?.toLowerCase().includes(q) ?? false);
        const matchCode =
          selectedCode === 'all' || r.process_code === selectedCode;
        const matchExam = filterExam === 'all' || r.exam_type === filterExam;
        const matchPassed =
          filterPassed === 'all' ||
          (filterPassed === 'passed' && r.passed) ||
          (filterPassed === 'failed' && !r.passed);
        return matchSearch && matchCode && matchExam && matchPassed;
      })
      .sort((a, b) => {
        let cmp = 0;
        if (sortKey === 'percentage') cmp = a.percentage - b.percentage;
        else if (sortKey === 'created_at')
          cmp =
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        else if (sortKey === 'participant_name') {
          cmp = (a.participant_name ?? '').localeCompare(
            b.participant_name ?? ''
          );
        }
        return sortDir === 'asc' ? cmp : -cmp;
      });
  }, [
    results,
    search,
    selectedCode,
    filterExam,
    filterPassed,
    sortKey,
    sortDir,
  ]);

  const favoriteMap = useMemo(() => buildFavoriteMap(favorites), [favorites]);

  const evaluatedCandidates = useMemo(() => {
    const groups = new Map<string, ExamResult[]>();
    for (const result of results) {
      if (!result.user_id) continue;
      const rows = groups.get(result.user_id) ?? [];
      rows.push(result);
      groups.set(result.user_id, rows);
    }

    return Array.from(groups.entries()).map(([userId, rows]) => {
      const sorted = [...rows].sort((a, b) => {
        if (b.percentage !== a.percentage) return b.percentage - a.percentage;
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      });
      const best = sorted[0];
      const favorite = favoriteMap.get(userId) ?? null;

      return {
        userId,
        name: best.participant_name || best.participant_email || 'Sin nombre',
        contactEmail: best.participant_email,
        role: null,
        country: null,
        istqbLevel: null,
        githubProfile: null,
        qaSkills: [],
        disponibilidad: 'no_disponible',
        visibleToEmpresas: false,
        bestScore: Number(best.percentage ?? 0),
        bestExamType: best.exam_type,
        passedAssessments: rows.filter((result) => result.passed).length,
        totalAssessments: rows.length,
        lastActivityAt: rows.reduce(
          (latest, result) =>
            new Date(result.created_at).getTime() > new Date(latest).getTime()
              ? result.created_at
              : latest,
          best.created_at
        ),
        favoriteId: favorite?.id ?? null,
        favoriteCreatedAt: favorite?.created_at ?? null,
        favoriteNotes: favorite?.notes ?? null,
      } satisfies TalentCandidate;
    });
  }, [favoriteMap, results]);

  const filteredTalentCandidates = useMemo(() => {
    const q = search.toLowerCase();
    return talentCandidates.filter((candidate) => {
      const matchesLevel =
        filterIstqbLevel === 'all' || candidate.istqbLevel === filterIstqbLevel;
      const matchesCountry =
        filterCountry === 'all' || candidate.country === filterCountry;
      const matchesSearch =
        !q ||
        candidate.name.toLowerCase().includes(q) ||
        (candidate.contactEmail?.toLowerCase().includes(q) ?? false) ||
        (candidate.role?.toLowerCase().includes(q) ?? false) ||
        (candidate.country?.toLowerCase().includes(q) ?? false) ||
        (candidate.istqbLevel
          ? (ISTQB_LEVEL_LABELS[candidate.istqbLevel] ?? candidate.istqbLevel)
              .toLowerCase()
              .includes(q)
          : false);

      return matchesLevel && matchesCountry && matchesSearch;
    });
  }, [filterIstqbLevel, filterCountry, talentCandidates, search]);

  const favoriteCandidates = useMemo(
    () =>
      Array.from(
        new Map(
          [
            ...filteredTalentCandidates,
            ...evaluatedCandidates.filter(
              (candidate) =>
                filterIstqbLevel === 'all' ||
                candidate.istqbLevel === filterIstqbLevel
            ),
          ]
            .filter((candidate) => favoriteMap.has(candidate.userId))
            .map((candidate) => [candidate.userId, candidate])
        ).values()
      ),
    [
      evaluatedCandidates,
      favoriteMap,
      filterIstqbLevel,
      filteredTalentCandidates,
    ]
  );

  const selectedForComparison = useMemo(() => {
    const byId = new Map(
      [...talentCandidates, ...evaluatedCandidates].map((candidate) => [
        candidate.userId,
        candidate,
      ])
    );
    return selectedCandidateIds
      .map((id) => byId.get(id))
      .filter((candidate): candidate is TalentCandidate => Boolean(candidate));
  }, [evaluatedCandidates, selectedCandidateIds, talentCandidates]);

  // --- Chart data (all based on `filtered` so they respect active filters) ---

  const topCandidatesData = useMemo(() => {
    const best = new Map<
      string,
      { label: string; percentage: number; passed: boolean }
    >();
    for (const r of filtered) {
      const key = r.participant_email ?? r.participant_name ?? r.id;
      const label = r.participant_name || r.participant_email || 'Sin nombre';
      const cur = best.get(key);
      if (!cur || r.percentage > cur.percentage) {
        best.set(key, { label, percentage: r.percentage, passed: r.passed });
      }
    }
    return [...best.values()]
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 10)
      .map((c) => ({
        name: c.label.length > 22 ? c.label.slice(0, 20) + '…' : c.label,
        puntaje: c.percentage,
        passed: c.passed,
      }));
  }, [filtered]);

  const byWeekData = useMemo(() => {
    function isoWeek(date: Date): string {
      const d = new Date(date.getTime());
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
      const jan4 = new Date(d.getFullYear(), 0, 4);
      const week =
        1 +
        Math.round(
          ((d.getTime() - jan4.getTime()) / 86400000 -
            3 +
            ((jan4.getDay() + 6) % 7)) /
            7
        );
      return `${d.getFullYear()}-W${String(week).padStart(2, '0')}`;
    }
    const groups = new Map<string, { total: number; aprobados: number }>();
    for (const r of filtered) {
      const w = isoWeek(new Date(r.created_at));
      const cur = groups.get(w) ?? { total: 0, aprobados: 0 };
      groups.set(w, {
        total: cur.total + 1,
        aprobados: cur.aprobados + (r.passed ? 1 : 0),
      });
    }
    return [...groups.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([w, d]) => ({
        semana: w.replace(/^\d{4}-/, ''),
        total: d.total,
        aprobados: d.aprobados,
      }));
  }, [filtered]);

  const byHourData = useMemo(() => {
    const counts = new Array(24).fill(0) as number[];
    const fmt = new Intl.DateTimeFormat('es-PY', {
      hour: 'numeric',
      hour12: false,
      timeZone: 'America/Asuncion',
    });
    for (const r of filtered) {
      const h = parseInt(fmt.format(new Date(r.created_at)), 10) % 24;
      counts[h] += 1;
    }
    return counts.map((cnt, h) => ({
      hora: `${String(h).padStart(2, '0')}h`,
      examenes: cnt,
    }));
  }, [filtered]);

  const getSectionScores = (r: ExamResult): SectionScore[] | null => {
    if (r.section_scores && r.section_scores.length > 0)
      return r.section_scores;
    if (r.learning_objectives) {
      const raw = Array.isArray(r.learning_objectives)
        ? r.learning_objectives
        : [];
      const mapped = (raw as Record<string, unknown>[])
        .map((lo) => {
          const section =
            typeof lo.learningObjective === 'string'
              ? lo.learningObjective
              : null;
          const correct =
            typeof lo.correctAnswers === 'number' ? lo.correctAnswers : null;
          const total =
            typeof lo.totalQuestions === 'number' ? lo.totalQuestions : null;
          const pct =
            typeof lo.percentage === 'number'
              ? Math.round(lo.percentage)
              : null;
          if (!section || correct === null || total === null || pct === null)
            return null;
          return { section, correct, total, percentage: pct };
        })
        .filter((x): x is SectionScore => x !== null);
      return mapped.length > 0 ? mapped : null;
    }
    return null;
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const toggleFavorite = async (candidateId: string) => {
    setActionMessage(null);
    if (!empresaId) {
      setActionMessage('No se pudo identificar la empresa activa.');
      return;
    }

    const supabase = createClient();
    const existing = favoriteMap.get(candidateId);

    if (existing) {
      const { error } = await supabase
        .from('empresa_favoritos')
        .delete()
        .eq('id', existing.id);

      if (error) {
        setActionMessage(error.message);
        return;
      }

      setFavorites((prev) => prev.filter((item) => item.id !== existing.id));
      setTalentCandidates((prev) =>
        prev.map((candidate) =>
          candidate.userId === candidateId
            ? {
                ...candidate,
                favoriteId: null,
                favoriteCreatedAt: null,
                favoriteNotes: null,
              }
            : candidate
        )
      );
      setActionMessage('Candidato quitado de favoritos.');
      return;
    }

    const { data, error } = await supabase
      .from('empresa_favoritos')
      .insert({ empresa_id: empresaId, candidate_id: candidateId })
      .select('id, candidate_id, notes, created_at')
      .single();

    if (error) {
      setActionMessage(error.message);
      return;
    }

    const favorite = data as FavoriteRow;
    setFavorites((prev) => [...prev, favorite]);
    setTalentCandidates((prev) =>
      prev.map((candidate) =>
        candidate.userId === candidateId
          ? {
              ...candidate,
              favoriteId: favorite.id,
              favoriteCreatedAt: favorite.created_at,
              favoriteNotes: favorite.notes,
            }
          : candidate
      )
    );
    setActionMessage('Candidato guardado en favoritos.');
  };

  const toggleCompare = (candidateId: string) => {
    setSelectedCandidateIds((prev) => {
      if (prev.includes(candidateId)) {
        return prev.filter((id) => id !== candidateId);
      }
      if (prev.length >= 4) return prev;
      return [...prev, candidateId];
    });
  };

  const availableCountries = useMemo(
    () =>
      [
        ...new Set(talentCandidates.map((c) => c.country).filter(Boolean)),
      ].sort() as string[],
    [talentCandidates]
  );

  const COUNTRY_LABELS: Record<string, string> = {
    PY: '🇵🇾 Paraguay',
    AR: '🇦🇷 Argentina',
    BO: '🇧🇴 Bolivia',
    BR: '🇧🇷 Brasil',
    CL: '🇨🇱 Chile',
    CO: '🇨🇴 Colombia',
    EC: '🇪🇨 Ecuador',
    MX: '🇲🇽 México',
    PE: '🇵🇪 Perú',
    UY: '🇺🇾 Uruguay',
    VE: '🇻🇪 Venezuela',
  };

  const exportCSV = () => {
    const rows = [
      [
        'Nombre',
        'Email',
        'Examen',
        'Puntaje',
        'Estado',
        'Código proceso',
        'Fecha',
      ],
      ...filtered.map((r) => [
        r.participant_name ?? '',
        r.participant_email ?? '',
        EXAM_LABELS[r.exam_type] ?? r.exam_type,
        String(r.percentage),
        r.passed ? 'Aprobado' : 'No aprobado',
        r.process_code ?? '',
        new Date(r.created_at).toLocaleDateString('es-PY'),
      ]),
    ];
    const csv = rows
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      )
      .join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `candidatos-evaluados-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const openInviteModal = (email: string) => {
    setInviteEmail(email);
    setInviteModalOpen(true);
  };

  const sendInvite = async () => {
    if (!inviteEmail) return;
    setInviteSending(true);
    const { error } = await createInvitacionAction({
      candidate_email: inviteEmail,
    });
    setInviteSending(false);
    setInviteModalOpen(false);
    setInviteEmail(null);
    if (error) {
      setActionMessage(`Error al invitar: ${error}`);
    } else {
      setActionMessage(`Invitación enviada a ${inviteEmail}`);
    }
  };

  const passCount = filtered.filter((r) => r.passed).length;
  const avgScore = filtered.length
    ? Math.round(
        filtered.reduce((a, r) => a + r.percentage, 0) / filtered.length
      )
    : null;

  const mins = (s: number) => `${Math.floor(s / 60)}m ${s % 60}s`;

  const card = isDarkMode
    ? 'bg-dark-secondary border-slate-700'
    : 'bg-white border-gray-200';
  const inputClass = `rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:ring-2 focus:ring-indigo-500 ${
    isDarkMode
      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
  }`;

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey !== k ? (
      <span className="opacity-30 ml-1">↕</span>
    ) : sortDir === 'desc' ? (
      <span className="ml-1">↓</span>
    ) : (
      <span className="ml-1">↑</span>
    );

  const renderTalentTable = (
    candidates: TalentCandidate[],
    emptyTitle: string,
    emptyDescription: string
  ) => {
    if (candidates.length === 0) {
      return (
        <div
          className={`text-center py-14 rounded-xl border-2 border-dashed ${isDarkMode ? 'border-slate-700 text-slate-500' : 'border-gray-200 text-gray-400'}`}
        >
          <p className="font-medium mb-1">{emptyTitle}</p>
          <p className="text-sm">{emptyDescription}</p>
        </div>
      );
    }

    return (
      <div className={`rounded-xl border overflow-hidden ${card}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className={isDarkMode ? 'bg-slate-800/60' : 'bg-gray-50'}>
                <th
                  className={`px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
                >
                  Talento
                </th>
                <th
                  className={`px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
                >
                  Mejor resultado
                </th>
                <th
                  className={`px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
                >
                  Evidencia
                </th>
                <th
                  className={`px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((candidate) => {
                const isFavorite = favoriteMap.has(candidate.userId);
                const isSelected = selectedCandidateIds.includes(
                  candidate.userId
                );

                return (
                  <tr
                    key={candidate.userId}
                    className={`border-t ${isDarkMode ? 'border-slate-700' : 'border-gray-100'}`}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleCompare(candidate.userId)}
                          className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          aria-label={`Comparar ${candidate.name}`}
                        />
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Link
                              href={`/talento/${candidate.userId}`}
                              className={`font-semibold hover:underline ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                            >
                              {candidate.name}
                            </Link>
                            {candidate.disponibilidad === 'activo' && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                                Disponible
                              </span>
                            )}
                            {isFavorite && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                                Shortlist
                              </span>
                            )}
                          </div>
                          <p
                            className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
                          >
                            {[candidate.role, candidate.country]
                              .filter(Boolean)
                              .join(' · ') || 'Perfil QA'}
                            {candidate.istqbLevel
                              ? ` · ${ISTQB_LEVEL_LABELS[candidate.istqbLevel] ?? candidate.istqbLevel}`
                              : ''}
                          </p>
                          {candidate.contactEmail && (
                            <p
                              className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}
                            >
                              {candidate.contactEmail}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-lg font-bold text-indigo-500">
                        {candidate.bestScore}%
                      </p>
                      <p
                        className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
                      >
                        {EXAM_LABELS[candidate.bestExamType] ??
                          candidate.bestExamType}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <p
                        className={`text-xs ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}
                      >
                        {candidate.passedAssessments}/
                        {candidate.totalAssessments} aprobados
                      </p>
                      <p
                        className={`text-xs mt-1 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}
                      >
                        Última actividad{' '}
                        {new Date(candidate.lastActivityAt).toLocaleDateString(
                          'es-PY'
                        )}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => toggleFavorite(candidate.userId)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                            isFavorite
                              ? isDarkMode
                                ? 'bg-amber-900/40 text-amber-200 hover:bg-amber-900/60'
                                : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                              : 'bg-indigo-600 text-white hover:bg-indigo-700'
                          }`}
                        >
                          {isFavorite ? 'Quitar' : 'Guardar'}
                        </button>
                        {candidate.contactEmail && (
                          <a
                            href={`mailto:${candidate.contactEmail}`}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${isDarkMode ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                          >
                            Contactar
                          </a>
                        )}
                        {candidate.contactEmail && (
                          <button
                            type="button"
                            onClick={() =>
                              openInviteModal(candidate.contactEmail!)
                            }
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                          >
                            Invitar
                          </button>
                        )}
                        <Link
                          href={`/talento/${candidate.userId}`}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${isDarkMode ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                        >
                          Perfil
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-dark-bg' : 'bg-gray-50'}`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        {/* Header */}
        <div>
          <h1
            className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
          >
            Candidatos y talento QA
          </h1>
          <p
            className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
          >
            Revisá resultados por proceso, descubrí talento opt-in y armá una
            shortlist para contactar.
          </p>
        </div>

        <div className={`rounded-xl border p-1 flex flex-wrap gap-1 ${card}`}>
          {[
            {
              key: 'evaluados' as const,
              label: 'Evaluados',
              count: results.length,
            },
            {
              key: 'talento' as const,
              label: 'Talento QA',
              count: talentCandidates.length,
            },
            {
              key: 'favoritos' as const,
              label: 'Shortlist',
              count: favorites.length,
            },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setViewMode(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                viewMode === tab.key
                  ? 'bg-indigo-600 text-white'
                  : isDarkMode
                    ? 'text-slate-300 hover:bg-slate-700'
                    : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label}
              <span className="ml-2 text-xs opacity-75">{tab.count}</span>
            </button>
          ))}
        </div>

        {actionMessage && (
          <div
            className={`rounded-lg border px-4 py-3 text-sm ${isDarkMode ? 'border-slate-700 bg-slate-800 text-slate-200' : 'border-indigo-100 bg-indigo-50 text-indigo-700'}`}
          >
            {actionMessage}
          </div>
        )}

        {selectedForComparison.length >= 2 && (
          <div className={`rounded-xl border p-4 ${card}`}>
            <div className="flex items-center justify-between gap-3 mb-3">
              <p
                className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
              >
                Comparación rápida
              </p>
              <button
                type="button"
                onClick={() => setSelectedCandidateIds([])}
                className={`text-xs ${isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Limpiar selección
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {selectedForComparison.map((candidate) => (
                <div
                  key={candidate.userId}
                  className={`rounded-lg border p-3 ${isDarkMode ? 'border-slate-700 bg-slate-800/60' : 'border-gray-200 bg-gray-50'}`}
                >
                  <p
                    className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                  >
                    {candidate.name}
                  </p>
                  <p className="text-xl font-bold text-indigo-500 mt-2">
                    {candidate.bestScore}%
                  </p>
                  <p
                    className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
                  >
                    {EXAM_LABELS[candidate.bestExamType] ??
                      candidate.bestExamType}{' '}
                    · {candidate.passedAssessments}/{candidate.totalAssessments}{' '}
                    aprobados
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        {!loading && results.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total resultados', value: results.length.toString() },
              { label: 'Mostrando', value: filtered.length.toString() },
              {
                label: 'Aprobados (vista)',
                value: filtered.length
                  ? `${passCount} (${Math.round((passCount / filtered.length) * 100)}%)`
                  : '—',
              },
              {
                label: 'Puntaje promedio',
                value: avgScore != null ? `${avgScore}%` : '—',
              },
            ].map(({ label, value }) => (
              <div key={label} className={`rounded-xl border p-4 ${card}`}>
                <p
                  className={`text-xs font-semibold uppercase tracking-wide ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
                >
                  {label}
                </p>
                <p
                  className={`text-lg font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                >
                  {value}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Search + Filters */}
        <div className={`rounded-xl border p-5 space-y-4 ${card}`}>
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-56">
              <span
                className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`}
              >
                🔍
              </span>
              <input
                type="text"
                placeholder="Buscar por nombre o email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`${inputClass} w-full pl-8`}
              />
            </div>
            <select
              value={selectedCode}
              onChange={(e) => setSelectedCode(e.target.value)}
              className={inputClass}
            >
              <option value="all">Todos los procesos</option>
              {processes.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.position_name} ({p.code})
                </option>
              ))}
            </select>
            <select
              value={filterExam}
              onChange={(e) => setFilterExam(e.target.value)}
              className={inputClass}
            >
              <option value="all">Todos los exámenes</option>
              {availableExamTypes.map((e) => (
                <option key={e} value={e}>
                  {EXAM_LABELS[e] ?? e}
                </option>
              ))}
            </select>
            {viewMode !== 'evaluados' && (
              <select
                value={filterIstqbLevel}
                onChange={(e) => setFilterIstqbLevel(e.target.value)}
                className={inputClass}
              >
                <option value="all">Todos los niveles ISTQB</option>
                {Object.entries(ISTQB_LEVEL_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            )}
            {viewMode !== 'evaluados' && availableCountries.length > 0 && (
              <select
                value={filterCountry}
                onChange={(e) => setFilterCountry(e.target.value)}
                className={inputClass}
              >
                <option value="all">Todos los países</option>
                {availableCountries.map((c) => (
                  <option key={c} value={c}>
                    {COUNTRY_LABELS[c] ?? c}
                  </option>
                ))}
              </select>
            )}
            <select
              value={filterPassed}
              onChange={(e) =>
                setFilterPassed(e.target.value as typeof filterPassed)
              }
              className={inputClass}
            >
              <option value="all">Todos</option>
              <option value="passed">✓ Aprobados</option>
              <option value="failed">✗ No aprobados</option>
            </select>
            {viewMode === 'evaluados' && filtered.length > 0 && (
              <button
                type="button"
                onClick={exportCSV}
                className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${isDarkMode ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
              >
                📥 Exportar CSV
              </button>
            )}
          </div>

          {(search ||
            selectedCode !== 'all' ||
            filterExam !== 'all' ||
            filterIstqbLevel !== 'all' ||
            filterCountry !== 'all' ||
            filterPassed !== 'all') && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedCode('all');
                setFilterExam('all');
                setFilterIstqbLevel('all');
                setFilterCountry('all');
                setFilterPassed('all');
              }}
              className={`text-xs ${isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-gray-400 hover:text-gray-600'} transition-colors`}
            >
              ✕ Limpiar filtros
            </button>
          )}
        </div>

        {viewMode === 'talento' &&
          renderTalentTable(
            filteredTalentCandidates,
            'Sin talento visible todavía',
            'Los candidatos aparecerán cuando activen la visibilidad para empresas desde su perfil.'
          )}

        {viewMode === 'favoritos' &&
          renderTalentTable(
            favoriteCandidates,
            'Tu shortlist está vacía',
            'Guardá candidatos desde el directorio o desde la tabla de resultados para compararlos y contactarlos después.'
          )}

        {/* Table */}
        {viewMode === 'evaluados' &&
          (loading ? (
            <div
              className={`text-center py-16 ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`}
            >
              Cargando...
            </div>
          ) : results.length === 0 ? (
            <div
              className={`text-center py-16 rounded-xl border-2 border-dashed ${isDarkMode ? 'border-slate-700 text-slate-500' : 'border-gray-200 text-gray-400'}`}
            >
              <p className="text-4xl mb-3">👥</p>
              <p className="font-medium mb-1">Sin resultados todavía</p>
              <p className="text-sm mb-5">
                Compartí el código de un proceso con tus candidatos
              </p>
              <Link
                href="/empresa/procesos"
                className="text-sm text-indigo-400 hover:underline"
              >
                Ver mis procesos →
              </Link>
            </div>
          ) : filtered.length === 0 ? (
            <div className={`text-center py-12 rounded-xl border ${card}`}>
              <p
                className={`text-sm ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}
              >
                Sin resultados para los filtros aplicados
              </p>
            </div>
          ) : (
            <div className={`rounded-xl border overflow-hidden ${card}`}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr
                      className={isDarkMode ? 'bg-slate-800/60' : 'bg-gray-50'}
                    >
                      <th
                        className={`px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide cursor-pointer select-none ${isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => toggleSort('participant_name')}
                      >
                        Candidato <SortIcon k="participant_name" />
                      </th>
                      <th
                        className={`px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
                      >
                        Examen
                      </th>
                      <th
                        className={`px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
                      >
                        Proceso
                      </th>
                      <th
                        className={`px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide cursor-pointer select-none ${isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => toggleSort('percentage')}
                      >
                        Puntaje <SortIcon k="percentage" />
                      </th>
                      <th
                        className={`px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
                      >
                        Tiempo
                      </th>
                      <th
                        className={`px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide cursor-pointer select-none ${isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => toggleSort('created_at')}
                      >
                        Fecha <SortIcon k="created_at" />
                      </th>
                      <th
                        className={`px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
                      >
                        Acciones
                      </th>
                      <th className="px-5 py-3 w-8" />
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((r, i) => {
                      const proc = processes.find(
                        (p) => p.code === r.process_code
                      );
                      return (
                        <React.Fragment key={r.id}>
                          <tr
                            className={`border-t ${isDarkMode ? 'border-slate-700' : 'border-gray-100'} ${
                              i % 2 === 0
                                ? isDarkMode
                                  ? 'bg-dark-secondary'
                                  : 'bg-white'
                                : isDarkMode
                                  ? 'bg-slate-800/30'
                                  : 'bg-gray-50/50'
                            } cursor-pointer`}
                            onClick={() =>
                              setExpandedId((prev) =>
                                prev === r.id ? null : r.id
                              )
                            }
                          >
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span
                                  className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                                >
                                  {r.participant_name || (
                                    <span
                                      className={`italic ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}
                                    >
                                      Sin nombre
                                    </span>
                                  )}
                                </span>
                                {(attemptInfo.totalMap.get(r.id) ?? 1) > 1 && (
                                  <span
                                    className={`text-xs px-1.5 py-0.5 rounded font-mono ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-500'}`}
                                  >
                                    intento {attemptInfo.indexMap.get(r.id)}/
                                    {attemptInfo.totalMap.get(r.id)}
                                  </span>
                                )}
                              </div>
                              {r.participant_email && (
                                <div
                                  className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
                                >
                                  {r.participant_email}
                                </div>
                              )}
                            </td>
                            <td className="px-5 py-3">
                              <span
                                className={`font-mono text-xs px-2 py-0.5 rounded ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-600'}`}
                              >
                                {EXAM_LABELS[r.exam_type] ?? r.exam_type}
                              </span>
                            </td>
                            <td className="px-5 py-3">
                              {proc ? (
                                <Link
                                  href={`/empresa/procesos/${proc.id}`}
                                  className={`text-xs hover:underline ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}
                                >
                                  {proc.position_name}
                                </Link>
                              ) : (
                                <span
                                  className={`text-xs font-mono ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
                                >
                                  {r.process_code}
                                </span>
                              )}
                            </td>
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`font-bold text-base ${r.passed ? 'text-green-500' : 'text-red-500'}`}
                                >
                                  {r.percentage}%
                                </span>
                                <span
                                  className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                                    r.passed
                                      ? isDarkMode
                                        ? 'bg-green-900/40 text-green-300'
                                        : 'bg-green-50 text-green-700'
                                      : isDarkMode
                                        ? 'bg-red-900/40 text-red-300'
                                        : 'bg-red-50 text-red-700'
                                  }`}
                                >
                                  {r.passed ? '✓' : '✗'}
                                </span>
                              </div>
                            </td>
                            <td
                              className={`px-5 py-3 text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
                            >
                              {mins(r.time_spent)}
                            </td>
                            <td
                              className={`px-5 py-3 text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
                            >
                              {new Date(r.created_at).toLocaleDateString(
                                'es-PY'
                              )}
                            </td>
                            <td className="px-5 py-3">
                              {r.user_id ? (
                                <div
                                  className="flex flex-wrap gap-2 items-center"
                                  onClick={(event) => event.stopPropagation()}
                                >
                                  <input
                                    type="checkbox"
                                    checked={selectedCandidateIds.includes(
                                      r.user_id
                                    )}
                                    onChange={() => toggleCompare(r.user_id!)}
                                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    aria-label={`Comparar ${r.participant_name ?? r.participant_email ?? 'candidato'}`}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => toggleFavorite(r.user_id!)}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                                      favoriteMap.has(r.user_id)
                                        ? isDarkMode
                                          ? 'bg-amber-900/40 text-amber-200 hover:bg-amber-900/60'
                                          : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                    }`}
                                  >
                                    {favoriteMap.has(r.user_id)
                                      ? 'Guardado'
                                      : 'Guardar'}
                                  </button>
                                  {r.participant_email && (
                                    <a
                                      href={`mailto:${r.participant_email}`}
                                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ${isDarkMode ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                                    >
                                      Contactar
                                    </a>
                                  )}
                                  {r.exam_type === 'test-app' && (
                                    <Link
                                      href={`/empresa/evaluar/${r.id}`}
                                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                                        isDarkMode
                                          ? 'bg-amber-900/40 text-amber-200 hover:bg-amber-900/60'
                                          : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                                      }`}
                                    >
                                      Revisar
                                    </Link>
                                  )}
                                  <Link
                                    href={`/talento/${r.user_id}`}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ${isDarkMode ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                                  >
                                    Perfil
                                  </Link>
                                </div>
                              ) : (
                                <span
                                  className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}
                                >
                                  Sin usuario
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-3 text-center">
                              <span
                                className={`text-xs transition-transform inline-block ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`}
                                style={{
                                  transform:
                                    expandedId === r.id
                                      ? 'rotate(90deg)'
                                      : 'rotate(0deg)',
                                }}
                              >
                                ▶
                              </span>
                            </td>
                          </tr>
                          {expandedId === r.id &&
                            (() => {
                              const scores = getSectionScores(r);
                              return (
                                <tr
                                  key={`${r.id}-detail`}
                                  className={`border-t ${isDarkMode ? 'border-slate-700 bg-slate-800/50' : 'border-gray-100 bg-gray-50'}`}
                                >
                                  <td colSpan={8} className="px-6 py-4">
                                    {scores && scores.length > 0 ? (
                                      <div className="space-y-2">
                                        <p
                                          className={`text-xs font-semibold uppercase tracking-wide mb-3 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
                                        >
                                          Desglose por área
                                        </p>
                                        {scores.map((s) => (
                                          <div
                                            key={s.section}
                                            className="flex items-center gap-3"
                                          >
                                            <span
                                              className={`text-xs w-48 shrink-0 truncate ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}
                                              title={s.section}
                                            >
                                              {s.section}
                                            </span>
                                            <div
                                              className={`flex-1 rounded-full h-2 ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}`}
                                            >
                                              <div
                                                className={`h-2 rounded-full transition-all ${s.percentage >= 60 ? 'bg-green-500' : 'bg-red-400'}`}
                                                style={{
                                                  width: `${s.percentage}%`,
                                                }}
                                              />
                                            </div>
                                            <span
                                              className={`text-xs w-20 shrink-0 text-right font-mono ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
                                            >
                                              {s.correct}/{s.total} (
                                              {s.percentage}%)
                                            </span>
                                            <span className="text-xs w-4 shrink-0">
                                              {s.percentage >= 60 ? (
                                                <span className="text-green-500">
                                                  ✓
                                                </span>
                                              ) : (
                                                <span className="text-red-400">
                                                  ✗
                                                </span>
                                              )}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <p
                                        className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}
                                      >
                                        Sin desglose disponible para este tipo
                                        de examen
                                      </p>
                                    )}
                                  </td>
                                </tr>
                              );
                            })()}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

        {/* Charts */}
        {viewMode === 'evaluados' && !loading && filtered.length > 0 && (
          <div className="space-y-6">
            <h2
              className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
            >
              Análisis visual
            </h2>

            {/* Top candidates */}
            <div className={`rounded-xl border p-5 ${card}`}>
              <p
                className={`text-sm font-semibold mb-4 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}
              >
                Mejores candidatos (puntaje más alto)
              </p>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={topCandidatesData}
                  margin={{ top: 4, right: 16, bottom: 48, left: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDarkMode ? '#334155' : '#e5e7eb'}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{
                      fill: isDarkMode ? '#94a3b8' : '#6b7280',
                      fontSize: 11,
                    }}
                    angle={-35}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{
                      fill: isDarkMode ? '#94a3b8' : '#6b7280',
                      fontSize: 11,
                    }}
                    unit="%"
                    width={36}
                  />
                  <Tooltip
                    contentStyle={{
                      background: isDarkMode ? '#1e293b' : '#fff',
                      border: `1px solid ${isDarkMode ? '#475569' : '#e5e7eb'}`,
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    labelStyle={{
                      color: isDarkMode ? '#e2e8f0' : '#374151',
                      fontWeight: 600,
                    }}
                    formatter={(v: unknown) => [`${v}%`, 'Puntaje']}
                  />
                  <Bar dataKey="puntaje" radius={[4, 4, 0, 0]} maxBarSize={40}>
                    {topCandidatesData.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={entry.passed ? '#22c55e' : '#ef4444'}
                        fillOpacity={0.82}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p
                className={`text-xs mt-1 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}
              >
                Verde = aprobado · Rojo = no aprobado
              </p>
            </div>

            {/* By week */}
            {byWeekData.length > 1 && (
              <div className={`rounded-xl border p-5 ${card}`}>
                <p
                  className={`text-sm font-semibold mb-4 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}
                >
                  Actividad por semana
                </p>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart
                    data={byWeekData}
                    margin={{ top: 4, right: 16, bottom: 16, left: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={isDarkMode ? '#334155' : '#e5e7eb'}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="semana"
                      tick={{
                        fill: isDarkMode ? '#94a3b8' : '#6b7280',
                        fontSize: 11,
                      }}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{
                        fill: isDarkMode ? '#94a3b8' : '#6b7280',
                        fontSize: 11,
                      }}
                      width={28}
                    />
                    <Tooltip
                      contentStyle={{
                        background: isDarkMode ? '#1e293b' : '#fff',
                        border: `1px solid ${isDarkMode ? '#475569' : '#e5e7eb'}`,
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                      labelStyle={{
                        color: isDarkMode ? '#e2e8f0' : '#374151',
                        fontWeight: 600,
                      }}
                    />
                    <Legend
                      wrapperStyle={{
                        fontSize: 12,
                        color: isDarkMode ? '#94a3b8' : '#6b7280',
                      }}
                    />
                    <Bar
                      dataKey="total"
                      name="Total"
                      fill="#6366f1"
                      fillOpacity={0.8}
                      radius={[3, 3, 0, 0]}
                      maxBarSize={32}
                    />
                    <Bar
                      dataKey="aprobados"
                      name="Aprobados"
                      fill="#22c55e"
                      fillOpacity={0.8}
                      radius={[3, 3, 0, 0]}
                      maxBarSize={32}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* By hour */}
            <div className={`rounded-xl border p-5 ${card}`}>
              <p
                className={`text-sm font-semibold mb-4 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}
              >
                Distribución por hora del día
              </p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={byHourData}
                  margin={{ top: 4, right: 16, bottom: 0, left: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDarkMode ? '#334155' : '#e5e7eb'}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="hora"
                    tick={{
                      fill: isDarkMode ? '#94a3b8' : '#6b7280',
                      fontSize: 10,
                    }}
                    interval={3}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{
                      fill: isDarkMode ? '#94a3b8' : '#6b7280',
                      fontSize: 11,
                    }}
                    width={28}
                  />
                  <Tooltip
                    contentStyle={{
                      background: isDarkMode ? '#1e293b' : '#fff',
                      border: `1px solid ${isDarkMode ? '#475569' : '#e5e7eb'}`,
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    labelStyle={{
                      color: isDarkMode ? '#e2e8f0' : '#374151',
                      fontWeight: 600,
                    }}
                    formatter={(v: number | string) => [v, 'Exámenes']}
                  />
                  <Bar
                    dataKey="examenes"
                    fill="#6366f1"
                    fillOpacity={0.72}
                    radius={[3, 3, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
              <p
                className={`text-xs mt-1 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}
              >
                Hora en zona horaria Paraguay (UTC−4)
              </p>
            </div>
          </div>
        )}

        <div>
          <Link
            href="/empresa"
            className={`text-sm ${isDarkMode ? 'text-slate-500 hover:text-slate-300' : 'text-gray-400 hover:text-gray-600'} transition-colors`}
          >
            ← Volver al panel
          </Link>
        </div>
      </div>

      {/* Invite modal */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div
            className={`w-full max-w-sm rounded-2xl border p-6 space-y-4 shadow-xl ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}
          >
            <h3
              className={`font-bold text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
            >
              Invitar a evaluación
            </h3>
            <p
              className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}
            >
              Se enviará una invitación por email a{' '}
              <span className="font-semibold">{inviteEmail}</span> con el link
              para acceder a la evaluación.
            </p>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={sendInvite}
                disabled={inviteSending}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {inviteSending ? 'Enviando...' : 'Enviar invitación'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setInviteModalOpen(false);
                  setInviteEmail(null);
                }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold border transition-colors ${isDarkMode ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
