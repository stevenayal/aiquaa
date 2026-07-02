'use client';

import React, { useState, useRef, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import {
  updateProfileAction,
  uploadAvatarAction,
  changePasswordAction,
} from '@/actions/profile';
import {
  getExamResultsAction,
  getMyRankingAchievementsAction,
  getMyXpProfileAction,
} from '@/actions/exams';
import Avatar from '@/components/ui/Avatar';
import { xpForLevel, PY_TIMEZONE } from '@/lib/xp';
import {
  EXAM_META,
  EXAM_TYPES,
  formatExamScore,
  type ExamType,
} from '@/lib/exams';
import {
  AVAILABILITY_LABELS,
  QA_SKILL_OPTIONS,
  type CandidateAvailability,
} from '@/app/empresa/candidatos/candidateDirectory';

const EXAM_PAGE_SIZE = 20;

interface ExamResultRow {
  id: string;
  exam_type:
    | 'git'
    | 'git-practico'
    | 'istqb'
    | 'performance'
    | 'test-app'
    | 'api-testing-fundamentals'
    | 'api-banking'
    | 'database-fundamentals'
    | 'database-practice'
    | 'infrastructure-fundamentals';
  exam_mode: 'exam' | 'training';
  score: number;
  total_questions: number;
  max_possible_score?: number | null;
  passing_score: number;
  passed: boolean;
  percentage: number;
  time_spent: number;
  model?: string;
  language?: string;
  created_at: string;
}

interface RankingAchievementRow {
  id: string;
  rankingType: 'xp_global' | 'exam';
  rankingSlug: string;
  rankingLabel: string;
  position: number;
  score: number | null;
  scoreLabel: string | null;
  achievedAt: string;
  notifiedAt: string | null;
}

const formatTime = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
};

const ROLES: Record<string, { label: string; emoji: string }> = {
  estudiante: { label: 'Estudiante', emoji: '🎓' },
  qa_junior: { label: 'Tester QA Junior', emoji: '🌱' },
  qa_senior: { label: 'Tester QA Senior', emoji: '⭐' },
  qa_engineer: { label: 'QA Engineer', emoji: '⚙️' },
  analista_qa: { label: 'Analista QA', emoji: '🔍' },
  developer: { label: 'Developer', emoji: '💻' },
  otro: { label: 'Otro rol', emoji: '🙋' },
};

export default function PerfilPage() {
  const { user, isLoading, refreshUser } = useSupabaseAuth();
  const { isDarkMode } = useTheme();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [isPwPending, startPwTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const [alert, setAlert] = useState<{
    type: 'success' | 'error';
    msg: string;
  } | null>(null);
  const [pwAlert, setPwAlert] = useState<{
    type: 'success' | 'error';
    msg: string;
  } | null>(null);
  const [pwForm, setPwForm] = useState({
    new_password: '',
    confirm_password: '',
  });
  const [showPw, setShowPw] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [examResults, setExamResults] = useState<ExamResultRow[]>([]);
  const [examResultsLoading, setExamResultsLoading] = useState(true);
  const [examTotal, setExamTotal] = useState(0);
  const [examFilter, setExamFilter] = useState<ExamType | 'all'>('all');
  const [examLoadingMore, setExamLoadingMore] = useState(false);
  const [rankingAchievements, setRankingAchievements] = useState<
    RankingAchievementRow[]
  >([]);
  const [rankingAchievementsLoading, setRankingAchievementsLoading] =
    useState(true);

  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    bio: '',
    role: '',
    country: '',
    github_profile: '',
    istqb_level: '',
    disponibilidad: 'no_disponible' as CandidateAvailability,
    qa_skills: [] as string[],
    talent_visible_to_empresas: false,
  });
  const [initialized, setInitialized] = useState(false);
  const [xpProfile, setXpProfile] = useState<{
    totalXp: number;
    level: number;
    currentStreak: number;
    longestStreak: number;
    achievementCount: number;
    position: number;
  } | null>(null);

  // Initialize form from user metadata once loaded
  React.useEffect(() => {
    if (!isLoading && user && !initialized) {
      setFormData({
        full_name: user.user_metadata?.full_name || '',
        username: user.user_metadata?.username || '',
        bio: user.user_metadata?.bio || '',
        role: user.user_metadata?.role || '',
        country: user.user_metadata?.country || '',
        github_profile: user.user_metadata?.github_profile || '',
        istqb_level: user.user_metadata?.istqb_level || '',
        disponibilidad:
          user.user_metadata?.disponibilidad ||
          (user.user_metadata?.open_to_work ? 'activo' : 'no_disponible'),
        qa_skills: Array.isArray(user.user_metadata?.qa_skills)
          ? user.user_metadata.qa_skills
          : [],
        talent_visible_to_empresas: Boolean(
          user.user_metadata?.talent_visible_to_empresas
        ),
      });
      setInitialized(true);
    }
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [user, isLoading, initialized, router]);

  // Carga inicial / al cambiar el filtro: reemplaza la lista desde offset 0.
  useEffect(() => {
    if (!user) return;
    setExamResultsLoading(true);
    getExamResultsAction({
      examType: examFilter === 'all' ? undefined : examFilter,
      limit: EXAM_PAGE_SIZE,
      offset: 0,
    }).then(({ data, total }) => {
      setExamResults((data as ExamResultRow[]) || []);
      setExamTotal(total ?? 0);
      setExamResultsLoading(false);
    });
  }, [user, examFilter]);

  const loadMoreExams = () => {
    setExamLoadingMore(true);
    getExamResultsAction({
      examType: examFilter === 'all' ? undefined : examFilter,
      limit: EXAM_PAGE_SIZE,
      offset: examResults.length,
    }).then(({ data, total }) => {
      setExamResults((prev) => [...prev, ...((data as ExamResultRow[]) || [])]);
      setExamTotal(total ?? 0);
      setExamLoadingMore(false);
    });
  };

  useEffect(() => {
    if (!user) return;
    getMyXpProfileAction().then(({ data }) => {
      if (data) setXpProfile(data);
    });
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setRankingAchievementsLoading(true);
    getMyRankingAchievementsAction()
      .then(({ data }) => {
        setRankingAchievements((data as RankingAchievementRow[]) || []);
      })
      .finally(() => setRankingAchievementsLoading(false));
  }, [user]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reject SVG and any non-raster format: SVGs can embed scripts (XSS vector).
    const ALLOWED_TYPES = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
    ];
    if (!ALLOWED_TYPES.includes(file.type)) {
      setAlert({
        type: 'error',
        msg: 'Formato no permitido. Usá JPG, PNG, WebP o GIF.',
      });
      e.target.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setAlert({ type: 'error', msg: 'El archivo debe pesar menos de 5MB' });
      e.target.value = '';
      return;
    }
    setPreviewUrl(URL.createObjectURL(file));
    handleUpload(file);
  };

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    setAlert(null);
    const fd = new FormData();
    fd.set('avatar', file);
    const result = await uploadAvatarAction(fd);
    setIsUploading(false);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    if (result.error) {
      setAlert({ type: 'error', msg: result.error });
    } else {
      await refreshUser();
      setAlert({ type: 'success', msg: 'Foto actualizada correctamente' });
    }
  };

  const handlePasswordSave = (e: React.FormEvent) => {
    e.preventDefault();
    setPwAlert(null);
    const fd = new FormData();
    fd.set('new_password', pwForm.new_password);
    fd.set('confirm_password', pwForm.confirm_password);
    startPwTransition(async () => {
      const result = await changePasswordAction(fd);
      if (result.error) {
        setPwAlert({ type: 'error', msg: result.error });
      } else {
        setPwAlert({
          type: 'success',
          msg: 'Contraseña actualizada correctamente',
        });
        setPwForm({ new_password: '', confirm_password: '' });
      }
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);
    const fd = new FormData();
    fd.set('full_name', formData.full_name);
    fd.set('username', formData.username);
    fd.set('bio', formData.bio);
    fd.set('role', formData.role);
    fd.set('country', formData.country);
    fd.set('github_profile', formData.github_profile);
    fd.set('istqb_level', formData.istqb_level);
    fd.set('disponibilidad', formData.disponibilidad);
    fd.set('qa_skills', JSON.stringify(formData.qa_skills));
    fd.set('open_to_work', String(formData.disponibilidad === 'activo'));
    fd.set(
      'talent_visible_to_empresas',
      String(formData.talent_visible_to_empresas)
    );
    startTransition(async () => {
      const result = await updateProfileAction(fd);
      if (result.error) {
        setAlert({ type: 'error', msg: result.error });
      } else {
        await refreshUser();
        setAlert({ type: 'success', msg: 'Perfil guardado correctamente' });
      }
    });
  };

  const card = isDarkMode
    ? 'bg-slate-800 border border-slate-700'
    : 'bg-white border border-gray-200 shadow-sm';
  const labelClass = `block text-sm font-medium mb-1 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`;
  const inputClass = `w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
    isDarkMode
      ? 'bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
  }`;

  const isEmpresa = user?.user_metadata?.audience === 'empresa';
  const currentAvatarUrl =
    previewUrl || user?.user_metadata?.avatar_url || null;

  if (isLoading || !user) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}
      >
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-indigo-500" />
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen py-10 px-4 ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1
            className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
          >
            Mi Perfil
          </h1>
          <p
            className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
          >
            {isEmpresa
              ? 'Actualizá los datos de tu empresa'
              : 'Completá tu información para que la comunidad te conozca'}
          </p>
        </div>

        {/* Alert */}
        {alert && (
          <div
            className={`px-4 py-3 rounded-lg text-sm font-medium flex items-center justify-between ${
              alert.type === 'success'
                ? isDarkMode
                  ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-700'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : isDarkMode
                  ? 'bg-red-900/40 text-red-300 border border-red-700'
                  : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            <span>
              {alert.type === 'success' ? '✅' : '❌'} {alert.msg}
            </span>
            <button
              onClick={() => setAlert(null)}
              className="ml-4 opacity-60 hover:opacity-100"
            >
              ✕
            </button>
          </div>
        )}

        {/* Avatar Card */}
        <div className={`${card} rounded-xl p-6`}>
          <h2
            className={`text-base font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
          >
            Foto de perfil
          </h2>
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar
                name={formData.full_name || user.user_metadata?.full_name}
                email={user.email}
                avatarUrl={currentAvatarUrl}
                size="xl"
              />
              {isUploading && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white" />
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? 'Subiendo...' : '📷 Cambiar foto'}
              </button>
              <p
                className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}
              >
                JPG, PNG, WebP o GIF · Máx 5MB
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <form
          onSubmit={handleSave}
          className={`${card} rounded-xl p-6 space-y-5`}
        >
          <h2
            className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
          >
            Información personal
          </h2>

          {/* Email (read-only) */}
          <div>
            <label className={labelClass}>Email</label>
            <input
              type="text"
              value={user.email || ''}
              disabled
              className={`${inputClass} opacity-60 cursor-not-allowed`}
            />
            <p
              className={`text-xs mt-1 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}
            >
              El email no se puede cambiar desde aquí
            </p>
          </div>

          {/* Full Name */}
          <div>
            <label className={labelClass}>Nombre completo</label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) =>
                setFormData((p) => ({ ...p, full_name: e.target.value }))
              }
              placeholder="Tu nombre completo"
              className={inputClass}
              maxLength={60}
            />
            <p
              className={`text-xs mt-1 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}
            >
              👁️ Visible en el ranking público
            </p>
          </div>

          {/* Username */}
          <div>
            <label className={labelClass}>Nombre de usuario</label>
            <div className="relative">
              <span
                className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`}
              >
                @
              </span>
              <input
                type="text"
                value={formData.username}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    username: e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9_]/g, ''),
                  }))
                }
                placeholder="tu_usuario"
                className={`${inputClass} pl-7`}
                maxLength={30}
              />
            </div>
            <p
              className={`text-xs mt-1 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}
            >
              Solo letras, números y guión bajo
            </p>
          </div>

          {/* Bio */}
          <div>
            <label className={labelClass}>Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) =>
                setFormData((p) => ({ ...p, bio: e.target.value }))
              }
              placeholder="Contale a la comunidad sobre vos — tu experiencia en QA, herramientas favoritas..."
              rows={3}
              maxLength={200}
              className={`${inputClass} resize-none`}
            />
            <p
              className={`text-xs mt-1 text-right ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}
            >
              {formData.bio.length}/200
            </p>
          </div>

          {/* Country */}
          <div>
            <label className={labelClass}>País</label>
            <select
              value={formData.country}
              onChange={(e) =>
                setFormData((p) => ({ ...p, country: e.target.value }))
              }
              className={inputClass}
            >
              <option value="">Seleccioná tu país</option>
              {[
                'Argentina',
                'Bolivia',
                'Brasil',
                'Chile',
                'Colombia',
                'Costa Rica',
                'Cuba',
                'Ecuador',
                'El Salvador',
                'Guatemala',
                'Honduras',
                'México',
                'Nicaragua',
                'Panamá',
                'Paraguay',
                'Perú',
                'República Dominicana',
                'Uruguay',
                'Venezuela',
                'Otro',
              ].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* GitHub Profile */}
          {!isEmpresa && (
            <div>
              <label className={labelClass}>Perfil de GitHub</label>
              <input
                type="text"
                value={formData.github_profile}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, github_profile: e.target.value }))
                }
                placeholder="https://github.com/tu-usuario"
                className={inputClass}
                maxLength={100}
              />
              <p
                className={`text-xs mt-1 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}
              >
                Se usa para pre-completar tus datos en los exámenes
              </p>
            </div>
          )}

          {/* Nivel ISTQB */}
          {!isEmpresa && (
            <div>
              <label className={labelClass}>Certificación ISTQB</label>
              <select
                value={formData.istqb_level}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, istqb_level: e.target.value }))
                }
                className={inputClass}
              >
                <option value="">Sin certificación aún</option>
                <option value="ctfl">Foundation Level (CTFL)</option>
                <option value="ctal_ta">Advanced Level — Test Analyst</option>
                <option value="ctal_tm">Advanced Level — Test Manager</option>
                <option value="ctal_tta">
                  Advanced Level — Technical Test Analyst
                </option>
                <option value="expert">Expert Level</option>
                <option value="en_proceso">En proceso de certificación</option>
              </select>
            </div>
          )}

          {/* Role — candidatos only */}
          {!isEmpresa && (
            <div>
              <div
                className={`rounded-lg border p-4 mb-5 space-y-3 ${isDarkMode ? 'border-slate-700 bg-slate-900/40' : 'border-indigo-100 bg-indigo-50/60'}`}
              >
                <div>
                  <p
                    className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                  >
                    Visibilidad para empresas
                  </p>
                  <p
                    className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}
                  >
                    Permití que recruiters de empresas registradas encuentren tu
                    perfil cuando busquen talento QA en AIQUAA.
                  </p>
                </div>
                <label className="flex gap-3 items-start text-sm">
                  <input
                    type="checkbox"
                    checked={formData.talent_visible_to_empresas}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        talent_visible_to_empresas: e.target.checked,
                      }))
                    }
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span
                    className={isDarkMode ? 'text-slate-300' : 'text-gray-700'}
                  >
                    Mostrar mi perfil en el directorio de talento para empresas
                  </span>
                </label>
                <div>
                  <label className={labelClass}>Disponibilidad</label>
                  <select
                    value={formData.disponibilidad}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        disponibilidad: e.target.value as CandidateAvailability,
                      }))
                    }
                    className={inputClass}
                  >
                    {Object.entries(AVAILABILITY_LABELS).map(
                      ([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      )
                    )}
                  </select>
                </div>
                <div>
                  <p className={labelClass}>Skills QA</p>
                  <div className="flex flex-wrap gap-2">
                    {QA_SKILL_OPTIONS.map((skill) => {
                      const selected = formData.qa_skills.includes(skill);
                      return (
                        <button
                          key={skill}
                          type="button"
                          onClick={() =>
                            setFormData((p) => ({
                              ...p,
                              qa_skills: selected
                                ? p.qa_skills.filter((item) => item !== skill)
                                : [...p.qa_skills, skill],
                            }))
                          }
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
                </div>
              </div>
              <label className={labelClass}>Tu rol en QA</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(ROLES).map(([value, { label, emoji }]) => {
                  const selected = formData.role === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() =>
                        setFormData((p) => ({ ...p, role: value }))
                      }
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                        selected
                          ? 'border-indigo-500 bg-indigo-600 text-white shadow-sm'
                          : isDarkMode
                            ? 'border-slate-600 bg-slate-700 text-slate-300 hover:border-indigo-400 hover:bg-slate-600'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-indigo-400 hover:bg-indigo-50'
                      }`}
                    >
                      <span>{emoji}</span>
                      <span className="truncate">{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Member since */}
          <div
            className={`text-xs pt-2 border-t ${isDarkMode ? 'border-slate-700 text-slate-500' : 'border-gray-100 text-gray-400'}`}
          >
            Miembro desde{' '}
            {new Date(user.created_at).toLocaleDateString('es-PY', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              timeZone: PY_TIMEZONE,
            })}
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Guardando...' : '💾 Guardar cambios'}
          </button>
        </form>

        {/* Change Password */}
        <form
          onSubmit={handlePasswordSave}
          className={`${card} rounded-xl p-6 space-y-5`}
        >
          <h2
            className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
          >
            🔐 Cambiar contraseña
          </h2>

          {pwAlert && (
            <div
              className={`px-4 py-3 rounded-lg text-sm font-medium flex items-center justify-between ${
                pwAlert.type === 'success'
                  ? isDarkMode
                    ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-700'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : isDarkMode
                    ? 'bg-red-900/40 text-red-300 border border-red-700'
                    : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              <span>
                {pwAlert.type === 'success' ? '✅' : '❌'} {pwAlert.msg}
              </span>
              <button
                type="button"
                onClick={() => setPwAlert(null)}
                className="ml-4 opacity-60 hover:opacity-100"
              >
                ✕
              </button>
            </div>
          )}

          <div>
            <label className={labelClass}>Nueva contraseña</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={pwForm.new_password}
                onChange={(e) =>
                  setPwForm((p) => ({ ...p, new_password: e.target.value }))
                }
                placeholder="Mínimo 8 caracteres"
                className={`${inputClass} pr-10`}
                minLength={8}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm ${isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {showPw ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div>
            <label className={labelClass}>Confirmar nueva contraseña</label>
            <input
              type={showPw ? 'text' : 'password'}
              value={pwForm.confirm_password}
              onChange={(e) =>
                setPwForm((p) => ({ ...p, confirm_password: e.target.value }))
              }
              placeholder="Repetí la contraseña"
              className={inputClass}
              minLength={8}
              autoComplete="new-password"
            />
            {pwForm.confirm_password &&
              pwForm.new_password !== pwForm.confirm_password && (
                <p className="text-xs mt-1 text-red-500">
                  Las contraseñas no coinciden
                </p>
              )}
          </div>

          <p
            className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}
          >
            La contraseña es gestionada por Supabase. Si te registraste con
            email podés cambiarla acá. Si usás un proveedor externo (Google,
            GitHub) esta opción no aplica.
          </p>

          <button
            type="submit"
            disabled={
              isPwPending || !pwForm.new_password || !pwForm.confirm_password
            }
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPwPending ? 'Actualizando...' : '🔑 Actualizar contraseña'}
          </button>
        </form>

        {/* XP / Streak Widget */}
        <div className={`${card} rounded-xl p-6`}>
          <h2
            className={`text-base font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
          >
            ⚡ Mi progreso en AIQUAA
          </h2>
          {xpProfile ? (
            <>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div
                  className={`rounded-lg p-3 text-center ${isDarkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}
                >
                  <p
                    className={`text-xs mb-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
                  >
                    🏅 Nivel
                  </p>
                  <p
                    className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                  >
                    {xpProfile.level}
                  </p>
                </div>
                <div
                  className={`rounded-lg p-3 text-center ${isDarkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}
                >
                  <p
                    className={`text-xs mb-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
                  >
                    💎 XP Total
                  </p>
                  <p
                    className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                  >
                    {xpProfile.totalXp.toLocaleString()}
                  </p>
                </div>
                <div
                  className={`rounded-lg p-3 text-center ${isDarkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}
                >
                  <p
                    className={`text-xs mb-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
                  >
                    🔥 Racha actual
                  </p>
                  <p
                    className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                  >
                    {xpProfile.currentStreak} días
                  </p>
                </div>
                <div
                  className={`rounded-lg p-3 text-center ${isDarkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}
                >
                  <p
                    className={`text-xs mb-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
                  >
                    #️⃣ Posición
                  </p>
                  <p
                    className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                  >
                    #{xpProfile.position}
                  </p>
                </div>
              </div>
              {(() => {
                const { level, totalXp } = xpProfile;
                const current = xpForLevel(level);
                const next = xpForLevel(level + 1);
                const pct = Math.min(
                  100,
                  Math.round(((totalXp - current) / (next - current)) * 100)
                );
                return (
                  <>
                    <div
                      className={`w-full h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}`}
                    >
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-green-400 to-emerald-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p
                      className={`text-xs mt-1 text-center ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
                    >
                      {totalXp.toLocaleString()} / {next.toLocaleString()} XP
                      hacia Nivel {level + 1}
                    </p>
                  </>
                );
              })()}
            </>
          ) : (
            <div
              className={`text-center py-6 rounded-lg ${isDarkMode ? 'bg-slate-700/40' : 'bg-gray-50'}`}
            >
              <p
                className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
              >
                Completá un simulacro o generá casos All Pairs para ganar tu
                primer XP 🚀
              </p>
              <a
                href="/labs"
                className="inline-block mt-3 text-xs text-indigo-400 hover:underline"
              >
                Ir a Labs →
              </a>
            </div>
          )}
        </div>

        {/* Ranking Achievements */}
        {!isEmpresa && (
          <div id="logros-ranking" className={`${card} rounded-xl p-6`}>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2
                  className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                >
                  Logros de ranking
                </h2>
                <p
                  className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
                >
                  Reconocimientos por llegar al Top 3 de AIQUAA.
                </p>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                  isDarkMode
                    ? 'bg-amber-900/40 text-amber-300'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                {rankingAchievements.length}
              </span>
            </div>

            {rankingAchievementsLoading ? (
              <div className="flex justify-center py-6">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-amber-500" />
              </div>
            ) : rankingAchievements.length === 0 ? (
              <div
                className={`rounded-lg px-4 py-5 text-center ${isDarkMode ? 'bg-slate-700/40' : 'bg-gray-50'}`}
              >
                <p
                  className={`text-sm font-medium ${isDarkMode ? 'text-slate-200' : 'text-gray-700'}`}
                >
                  Todavia no tenes logros de ranking.
                </p>
                <p
                  className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
                >
                  Cuando llegues al Top 3 global de XP o de un ranking de
                  examen, se va a guardar aca con la fecha.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {rankingAchievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`rounded-lg p-4 flex items-start justify-between gap-4 ${
                      isDarkMode ? 'bg-slate-700/50' : 'bg-gray-50'
                    }`}
                  >
                    <div className="min-w-0">
                      <p
                        className={`text-sm font-semibold ${isDarkMode ? 'text-slate-100' : 'text-gray-800'}`}
                      >
                        #{achievement.position} {achievement.rankingLabel}
                      </p>
                      <p
                        className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
                      >
                        Logro obtenido el{' '}
                        {new Date(achievement.achievedAt).toLocaleDateString(
                          'es-PY',
                          {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            timeZone: PY_TIMEZONE,
                          }
                        )}
                      </p>
                    </div>
                    {achievement.scoreLabel && (
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${
                          isDarkMode
                            ? 'bg-slate-800 text-slate-200'
                            : 'bg-white text-gray-700 border border-gray-200'
                        }`}
                      >
                        {achievement.scoreLabel}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Exam History */}
        <div className={`${card} rounded-xl p-6`}>
          <h2
            className={`text-base font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
          >
            📊 Historial de exámenes
          </h2>

          {/* Filtro por tipo de examen */}
          {(examResults.length > 0 || examFilter !== 'all') && (
            <div className="flex flex-wrap gap-2 mb-4">
              {(['all', ...EXAM_TYPES] as const).map((t) => {
                const selected = examFilter === t;
                const label = t === 'all' ? '🗂️ Todos' : EXAM_META[t].emoji;
                const text =
                  t === 'all'
                    ? 'Todos'
                    : `${EXAM_META[t].emoji} ${EXAM_META[t].label}`;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setExamFilter(t)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      selected
                        ? 'border-indigo-500 bg-indigo-600 text-white'
                        : isDarkMode
                          ? 'border-slate-600 bg-slate-700 text-slate-300 hover:border-indigo-400'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-indigo-400'
                    }`}
                    aria-label={t === 'all' ? 'Todos' : EXAM_META[t].label}
                    title={t === 'all' ? 'Todos' : EXAM_META[t].label}
                  >
                    {t === 'all' ? label : text}
                  </button>
                );
              })}
            </div>
          )}

          {examResultsLoading ? (
            <div className="flex justify-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-indigo-500" />
            </div>
          ) : examResults.length === 0 ? (
            <div
              className={`text-center py-8 rounded-lg ${isDarkMode ? 'bg-slate-700/40' : 'bg-gray-50'}`}
            >
              <p className="text-3xl mb-2">📝</p>
              <p
                className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
              >
                {examFilter === 'all'
                  ? 'Todavía no rendiste ningún examen.'
                  : 'No tenés intentos de este tipo de examen todavía.'}
              </p>
              <div className="flex justify-center gap-x-3 gap-y-2 mt-4 flex-wrap">
                {EXAM_TYPES.map((t) => (
                  <a
                    key={t}
                    href={EXAM_META[t].href}
                    className="text-xs text-indigo-400 hover:underline"
                  >
                    {EXAM_META[t].emoji} {EXAM_META[t].label}
                  </a>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {examResults.map((r) => (
                  <div
                    key={r.id}
                    className={`flex items-center justify-between px-4 py-3 rounded-lg ${isDarkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-lg shrink-0">
                        {EXAM_META[r.exam_type]?.emoji ?? '📋'}
                      </span>
                      <div className="min-w-0">
                        <p
                          className={`text-sm font-medium ${isDarkMode ? 'text-slate-200' : 'text-gray-800'}`}
                        >
                          {EXAM_META[r.exam_type]?.label ?? r.exam_type}
                          {r.exam_type === 'istqb' && r.model
                            ? ` · Modelo ${r.model}`
                            : ''}
                          {' · '}
                          <span
                            className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
                          >
                            {r.exam_mode === 'exam'
                              ? 'Examen'
                              : 'Entrenamiento'}
                          </span>
                        </p>
                        <p
                          className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}
                        >
                          {new Date(r.created_at).toLocaleDateString('es-PY', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            timeZone: PY_TIMEZONE,
                          })}
                          {' · '}
                          {formatTime(r.time_spent)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <p
                          className={`text-sm font-bold ${isDarkMode ? 'text-slate-200' : 'text-gray-800'}`}
                        >
                          {formatExamScore(r)}
                        </p>
                        <p
                          className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}
                        >
                          {r.percentage.toFixed(0)}%
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          r.passed
                            ? isDarkMode
                              ? 'bg-emerald-900/40 text-emerald-300'
                              : 'bg-emerald-100 text-emerald-700'
                            : isDarkMode
                              ? 'bg-red-900/40 text-red-300'
                              : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {r.passed ? '✓ Aprobado' : '✗ No aprobado'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {examResults.length < examTotal && (
                <div className="flex justify-center mt-4">
                  <button
                    type="button"
                    onClick={loadMoreExams}
                    disabled={examLoadingMore}
                    className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-colors disabled:opacity-50 ${
                      isDarkMode
                        ? 'border-slate-600 text-slate-300 hover:bg-slate-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {examLoadingMore
                      ? 'Cargando...'
                      : `Ver más (${examTotal - examResults.length})`}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
