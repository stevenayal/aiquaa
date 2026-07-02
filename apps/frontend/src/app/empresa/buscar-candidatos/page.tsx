'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, Send, Star, StarOff, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useTheme } from '@/contexts/ThemeContext';
import { createInvitacionToCandidateAction } from '@/actions/empresa-invitaciones';
import {
  AVAILABILITY_LABELS,
  QA_SKILL_OPTIONS,
  filterTalentCandidates,
  type CandidateAvailability,
  type TalentCandidate,
} from '@/app/empresa/candidatos/candidateDirectory';

const ISTQB_LEVEL_LABELS: Record<string, string> = {
  ctfl: 'Foundation Level (CTFL)',
  ctal_ta: 'Advanced Level - Test Analyst',
  ctal_tm: 'Advanced Level - Test Manager',
  ctal_tta: 'Advanced Level - Technical Test Analyst',
  expert: 'Expert Level',
  en_proceso: 'En proceso de certificacion',
};

const EXAM_LABELS: Record<string, string> = {
  istqb: 'ISTQB CTFL',
  git: 'Git',
  'git-practico': 'Git Practica',
  performance: 'Performance',
  'api-testing-fundamentals': 'API Testing Fundamentals',
  'api-banking': 'API Testing Challenge',
  'database-fundamentals': 'Bases de Datos - Fundamentos',
  'database-practice': 'Bases de Datos - Practica SQL',
  'infrastructure-fundamentals': 'Infraestructura - Fundamentos',
  sin_evaluacion: 'Sin evaluacion visible',
};

type SourcingRow = {
  user_id: string;
  name: string;
  role: string | null;
  country: string | null;
  istqb_level: string | null;
  github_profile: string | null;
  qa_skills: string[] | null;
  disponibilidad: CandidateAvailability;
  best_score: number | null;
  best_exam_type: string | null;
  passed_assessments: number;
  total_assessments: number;
  last_activity_at: string;
  favorite_id: string | null;
  favorite_created_at: string | null;
  favorite_notes: string | null;
};

type HiringProcessOption = {
  id: string;
  code: string;
  position_name: string;
  status: string;
};

function mapSourcingRow(row: SourcingRow): TalentCandidate {
  return {
    userId: row.user_id,
    name: row.name,
    role: row.role,
    country: row.country,
    istqbLevel: row.istqb_level,
    githubProfile: row.github_profile,
    qaSkills: row.qa_skills ?? [],
    disponibilidad: row.disponibilidad,
    visibleToEmpresas: true,
    bestScore: Number(row.best_score ?? 0),
    bestExamType: row.best_exam_type ?? 'sin_evaluacion',
    passedAssessments: Number(row.passed_assessments ?? 0),
    totalAssessments: Number(row.total_assessments ?? 0),
    lastActivityAt: row.last_activity_at,
    favoriteId: row.favorite_id,
    favoriteCreatedAt: row.favorite_created_at,
    favoriteNotes: row.favorite_notes,
  };
}

export default function BuscarCandidatosPage() {
  const { isDarkMode } = useTheme();
  const [candidates, setCandidates] = useState<TalentCandidate[]>([]);
  const [processes, setProcesses] = useState<HiringProcessOption[]>([]);
  const [empresaId, setEmpresaId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterIstqbLevel, setFilterIstqbLevel] = useState('all');
  const [filterCountry, setFilterCountry] = useState('all');
  const [filterAvailability, setFilterAvailability] = useState<
    CandidateAvailability | 'all'
  >('all');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [inviteCandidate, setInviteCandidate] =
    useState<TalentCandidate | null>(null);
  const [inviteProcessId, setInviteProcessId] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [inviteSending, setInviteSending] = useState(false);

  const card = isDarkMode
    ? 'bg-dark-secondary border-slate-700'
    : 'bg-white border-gray-200';
  const inputClass = `rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:ring-2 focus:ring-indigo-500 ${
    isDarkMode
      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
  }`;

  const loadDirectory = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user?.id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('empresa_id')
        .eq('id', user.id)
        .maybeSingle();
      setEmpresaId(profile?.empresa_id ?? null);
    }

    const [{ data: rows, error }, { data: processRows }] = await Promise.all([
      supabase.rpc('get_empresa_candidate_sourcing'),
      supabase
        .from('hiring_processes')
        .select('id, code, position_name, status')
        .eq('status', 'active')
        .order('created_at', { ascending: false }),
    ]);

    if (error) {
      setActionMessage(error.message);
      setCandidates([]);
    } else {
      setCandidates(((rows ?? []) as SourcingRow[]).map(mapSourcingRow));
    }
    setProcesses((processRows ?? []) as HiringProcessOption[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadDirectory();
  }, [loadDirectory]);

  const availableCountries = useMemo(
    () =>
      [
        ...new Set(
          candidates.map((candidate) => candidate.country).filter(Boolean)
        ),
      ].sort() as string[],
    [candidates]
  );

  const filteredCandidates = useMemo(
    () =>
      filterTalentCandidates(candidates, {
        search,
        istqbLevel: filterIstqbLevel,
        country: filterCountry,
        availability: filterAvailability,
        skills: selectedSkills,
      }),
    [
      candidates,
      filterAvailability,
      filterCountry,
      filterIstqbLevel,
      search,
      selectedSkills,
    ]
  );

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill)
        ? prev.filter((item) => item !== skill)
        : [...prev, skill]
    );
  };

  const toggleFavorite = async (candidate: TalentCandidate) => {
    setActionMessage(null);
    if (!empresaId) {
      setActionMessage('No se pudo identificar la empresa activa.');
      return;
    }

    const supabase = createClient();
    if (candidate.favoriteId) {
      const { error } = await supabase
        .from('empresa_favoritos')
        .delete()
        .eq('id', candidate.favoriteId);
      if (error) {
        setActionMessage(error.message);
        return;
      }
      setCandidates((prev) =>
        prev.map((item) =>
          item.userId === candidate.userId
            ? {
                ...item,
                favoriteId: null,
                favoriteCreatedAt: null,
                favoriteNotes: null,
              }
            : item
        )
      );
      setActionMessage('Candidato quitado de favoritos.');
      return;
    }

    const { data, error } = await supabase
      .from('empresa_favoritos')
      .insert({ empresa_id: empresaId, candidate_id: candidate.userId })
      .select('id, created_at, notes')
      .single();

    if (error) {
      setActionMessage(error.message);
      return;
    }

    setCandidates((prev) =>
      prev.map((item) =>
        item.userId === candidate.userId
          ? {
              ...item,
              favoriteId: data.id,
              favoriteCreatedAt: data.created_at,
              favoriteNotes: data.notes,
            }
          : item
      )
    );
    setActionMessage('Candidato guardado en favoritos.');
  };

  const sendInvite = async () => {
    if (!inviteCandidate) return;
    setInviteSending(true);
    const { error } = await createInvitacionToCandidateAction({
      candidate_id: inviteCandidate.userId,
      process_id: inviteProcessId || undefined,
      message: inviteMessage || undefined,
    });
    setInviteSending(false);
    if (error) {
      setActionMessage(`Error al invitar: ${error}`);
      return;
    }
    setActionMessage(`Invitacion enviada a ${inviteCandidate.name}.`);
    setInviteCandidate(null);
    setInviteProcessId('');
    setInviteMessage('');
  };

  const clearFilters = () => {
    setSearch('');
    setFilterIstqbLevel('all');
    setFilterCountry('all');
    setFilterAvailability('all');
    setSelectedSkills([]);
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDarkMode ? 'bg-dark-bg' : 'bg-gray-50'
      }`}
    >
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p
              className={`text-sm font-semibold ${
                isDarkMode ? 'text-indigo-300' : 'text-indigo-600'
              }`}
            >
              Sourcing B2B
            </p>
            <h1
              className={`mt-1 text-2xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              Buscar candidatos QA
            </h1>
            <p
              className={`mt-2 max-w-2xl text-sm ${
                isDarkMode ? 'text-slate-400' : 'text-gray-500'
              }`}
            >
              Explora perfiles opt-in, filtra por disponibilidad y skills, y
              arma tu shortlist sin exponer emails.
            </p>
          </div>
          <Link
            href="/empresa/candidatos"
            className={`rounded-lg border px-4 py-2 text-sm font-semibold transition-colors ${
              isDarkMode
                ? 'border-slate-600 text-slate-300 hover:bg-slate-700'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Ver evaluados
          </Link>
        </div>

        {actionMessage && (
          <div
            className={`rounded-lg border px-4 py-3 text-sm ${
              isDarkMode
                ? 'border-indigo-700 bg-indigo-900/30 text-indigo-200'
                : 'border-indigo-200 bg-indigo-50 text-indigo-800'
            }`}
          >
            {actionMessage}
          </div>
        )}

        <section className={`rounded-lg border p-4 ${card}`}>
          <div className="flex flex-wrap gap-3">
            <div className="relative min-w-64 flex-1">
              <Search
                className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${
                  isDarkMode ? 'text-slate-400' : 'text-gray-400'
                }`}
              />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por nombre, rol, pais o skill"
                className={`${inputClass} w-full pl-9`}
              />
            </div>
            <select
              value={filterAvailability}
              onChange={(event) =>
                setFilterAvailability(
                  event.target.value as CandidateAvailability | 'all'
                )
              }
              className={inputClass}
            >
              <option value="all">Toda disponibilidad</option>
              {Object.entries(AVAILABILITY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <select
              value={filterIstqbLevel}
              onChange={(event) => setFilterIstqbLevel(event.target.value)}
              className={inputClass}
            >
              <option value="all">Todos los niveles ISTQB</option>
              {Object.entries(ISTQB_LEVEL_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <select
              value={filterCountry}
              onChange={(event) => setFilterCountry(event.target.value)}
              className={inputClass}
            >
              <option value="all">Todos los paises</option>
              {availableCountries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={clearFilters}
              className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
                isDarkMode
                  ? 'border-slate-600 text-slate-300 hover:bg-slate-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <X className="h-4 w-4" />
              Limpiar
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {QA_SKILL_OPTIONS.map((skill) => {
              const selected = selectedSkills.includes(skill);
              return (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                    selected
                      ? 'border-indigo-600 bg-indigo-600 text-white'
                      : isDarkMode
                        ? 'border-slate-600 text-slate-300 hover:bg-slate-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {skill}
                </button>
              );
            })}
          </div>
        </section>

        <section className={`rounded-lg border ${card}`}>
          <div
            className={`flex items-center justify-between border-b px-5 py-4 ${
              isDarkMode ? 'border-slate-700' : 'border-gray-100'
            }`}
          >
            <div>
              <h2
                className={`text-sm font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                Talento disponible
              </h2>
              <p
                className={`text-xs ${
                  isDarkMode ? 'text-slate-400' : 'text-gray-500'
                }`}
              >
                {filteredCandidates.length} de {candidates.length} perfiles
              </p>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-sm text-gray-500">
              Cargando candidatos...
            </div>
          ) : filteredCandidates.length === 0 ? (
            <div className="p-8 text-center">
              <p
                className={`font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                Sin candidatos para estos filtros
              </p>
              <p
                className={`mt-1 text-sm ${
                  isDarkMode ? 'text-slate-400' : 'text-gray-500'
                }`}
              >
                Ajusta la busqueda o limpia los filtros para ampliar el pool.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className={isDarkMode ? 'bg-slate-800/60' : 'bg-gray-50'}>
                    {[
                      'Candidato',
                      'Disponibilidad',
                      'Score',
                      'Skills',
                      'Acciones',
                    ].map((header) => (
                      <th
                        key={header}
                        className={`px-5 py-3 text-left text-xs font-semibold uppercase ${
                          isDarkMode ? 'text-slate-400' : 'text-gray-500'
                        }`}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredCandidates.map((candidate) => (
                    <tr
                      key={candidate.userId}
                      className={`border-t ${
                        isDarkMode ? 'border-slate-700' : 'border-gray-100'
                      }`}
                    >
                      <td className="px-5 py-4">
                        <Link
                          href={`/talento/${candidate.userId}`}
                          className={`font-semibold hover:underline ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}
                        >
                          {candidate.name}
                        </Link>
                        <p
                          className={`mt-1 text-xs ${
                            isDarkMode ? 'text-slate-400' : 'text-gray-500'
                          }`}
                        >
                          {[candidate.role, candidate.country]
                            .filter(Boolean)
                            .join(' - ') || 'Perfil QA'}
                        </p>
                        {candidate.istqbLevel && (
                          <p className="mt-0.5 text-xs text-indigo-500">
                            {ISTQB_LEVEL_LABELS[candidate.istqbLevel] ??
                              candidate.istqbLevel}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-semibold ${
                            candidate.disponibilidad === 'activo'
                              ? 'bg-emerald-100 text-emerald-700'
                              : candidate.disponibilidad === 'pasivo'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {AVAILABILITY_LABELS[candidate.disponibilidad]}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-lg font-bold text-indigo-500">
                          {candidate.bestScore}%
                        </p>
                        <p
                          className={`text-xs ${
                            isDarkMode ? 'text-slate-400' : 'text-gray-500'
                          }`}
                        >
                          {EXAM_LABELS[candidate.bestExamType] ??
                            candidate.bestExamType}
                        </p>
                        <p
                          className={`mt-1 text-xs ${
                            isDarkMode ? 'text-slate-500' : 'text-gray-400'
                          }`}
                        >
                          {candidate.passedAssessments}/
                          {candidate.totalAssessments} aprobados
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex max-w-xs flex-wrap gap-1.5">
                          {candidate.qaSkills.length > 0 ? (
                            candidate.qaSkills.map((skill) => (
                              <span
                                key={skill}
                                className={`rounded-full px-2 py-0.5 text-xs ${
                                  isDarkMode
                                    ? 'bg-slate-700 text-slate-300'
                                    : 'bg-gray-100 text-gray-700'
                                }`}
                              >
                                {skill}
                              </span>
                            ))
                          ) : (
                            <span
                              className={`text-xs ${
                                isDarkMode ? 'text-slate-500' : 'text-gray-400'
                              }`}
                            >
                              Sin skills cargadas
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => toggleFavorite(candidate)}
                            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                              candidate.favoriteId
                                ? isDarkMode
                                  ? 'bg-amber-900/40 text-amber-200 hover:bg-amber-900/60'
                                  : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                                : 'bg-indigo-600 text-white hover:bg-indigo-700'
                            }`}
                          >
                            {candidate.favoriteId ? (
                              <StarOff className="h-3.5 w-3.5" />
                            ) : (
                              <Star className="h-3.5 w-3.5" />
                            )}
                            {candidate.favoriteId ? 'Quitar' : 'Guardar'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setInviteCandidate(candidate)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-700"
                          >
                            <Send className="h-3.5 w-3.5" />
                            Invitar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {inviteCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            className={`w-full max-w-md space-y-4 rounded-lg border p-6 shadow-xl ${card}`}
          >
            <div>
              <h3
                className={`text-base font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                Invitar a {inviteCandidate.name}
              </h3>
              <p
                className={`mt-1 text-sm ${
                  isDarkMode ? 'text-slate-400' : 'text-gray-500'
                }`}
              >
                AIQUAA enviara la invitacion por email sin revelar el correo en
                el directorio.
              </p>
            </div>
            <select
              value={inviteProcessId}
              onChange={(event) => setInviteProcessId(event.target.value)}
              className={`${inputClass} w-full`}
            >
              <option value="">Sin proceso especifico</option>
              {processes.map((process) => (
                <option key={process.id} value={process.id}>
                  {process.position_name} ({process.code})
                </option>
              ))}
            </select>
            <textarea
              value={inviteMessage}
              onChange={(event) => setInviteMessage(event.target.value)}
              rows={3}
              maxLength={300}
              placeholder="Mensaje opcional para el candidato"
              className={`${inputClass} w-full resize-none`}
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={sendInvite}
                disabled={inviteSending}
                className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
              >
                {inviteSending ? 'Enviando...' : 'Enviar invitacion'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setInviteCandidate(null);
                  setInviteProcessId('');
                  setInviteMessage('');
                }}
                className={`flex-1 rounded-lg border px-4 py-2 text-sm font-semibold transition-colors ${
                  isDarkMode
                    ? 'border-slate-600 text-slate-300 hover:bg-slate-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
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
