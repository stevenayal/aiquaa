'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { getExamResultsAction } from '@/actions/exams';
import BugReportWidget from '@/components/BugReportWidget';
import { SuruFloating } from '@/components/Suru';
import { toolCategories } from '@/lib/labsCatalog';

interface ExamProgressResult {
  exam_type: string;
  exam_mode: string;
  score: number;
  total_questions: number;
  max_possible_score: number | null;
  passed: boolean;
  percentage: number;
  created_at: string;
}

interface ToolProgress {
  passed: boolean;
  bestScore: number;
  maxScore: number;
  bestPercentage: number;
  lastAttemptAt: string;
}

function formatProgressDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-PY', {
    day: '2-digit',
    month: 'short',
  });
}

export default function LabsPage() {
  const { isDarkMode } = useTheme();
  const { t } = useLanguage();
  const { user } = useSupabaseAuth();
  const [examResults, setExamResults] = useState<ExamProgressResult[]>([]);

  useEffect(() => {
    let active = true;

    if (!user) {
      setExamResults([]);
      return () => {
        active = false;
      };
    }

    getExamResultsAction()
      .then((res) => {
        if (!active) return;
        setExamResults((res.data as ExamProgressResult[] | null) ?? []);
      })
      .catch(() => {
        if (active) setExamResults([]);
      });

    return () => {
      active = false;
    };
  }, [user]);

  const progressByTool = useMemo(() => {
    const progress = new Map<string, ToolProgress>();

    for (const result of examResults) {
      const maxScore =
        result.max_possible_score ?? result.total_questions ?? result.score;
      const current = progress.get(result.exam_type);
      const currentBest = current?.bestPercentage ?? -1;
      const isBetter = result.percentage > currentBest;

      progress.set(result.exam_type, {
        passed:
          Boolean(current?.passed) ||
          (result.exam_mode === 'exam' && result.passed),
        bestScore: isBetter
          ? result.score
          : (current?.bestScore ?? result.score),
        maxScore: isBetter ? maxScore : (current?.maxScore ?? maxScore),
        bestPercentage: isBetter
          ? result.percentage
          : (current?.bestPercentage ?? result.percentage),
        lastAttemptAt:
          !current ||
          new Date(result.created_at).getTime() >
            new Date(current.lastAttemptAt).getTime()
            ? result.created_at
            : current.lastAttemptAt,
      });
    }

    return progress;
  }, [examResults]);

  return (
    <div
      className={`min-h-screen py-12 md:py-16 transition-colors duration-300 ${
        isDarkMode ? 'bg-slate-900' : 'bg-brand-light'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Login/Register Banner — only for guests */}
        {!user && (
          <div
            className={`mb-8 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 ${
              isDarkMode
                ? 'bg-slate-800 border border-slate-700'
                : 'bg-white border border-gray-200 shadow-sm'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">📝</span>
              <div>
                <p
                  className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                >
                  ¿Quieres guardar tu progreso?
                </p>
                <p
                  className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
                >
                  Regístrate gratis para acceder a simuladores, generar informes
                  y más.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link
                href="/login"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/register"
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                  isDarkMode
                    ? 'border-slate-600 text-slate-300 hover:bg-slate-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Crear cuenta
              </Link>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-12">
          <h1
            className={`text-4xl md:text-5xl font-bold mb-6 ${
              isDarkMode ? 'text-white' : 'text-brand-text'
            }`}
          >
            🧪 {t('labs.page.title')}
          </h1>
          <p
            className={`text-xl max-w-3xl mx-auto ${
              isDarkMode ? 'text-slate-300' : 'text-brand-muted'
            }`}
          >
            {t('labs.page.subtitle')}
          </p>
        </div>

        {/* Featured Tools of the Month */}
        <div
          className={`mb-12 rounded-lg shadow-lg p-8 ${
            isDarkMode
              ? 'bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-purple-700/50'
              : 'bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200'
          }`}
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">🔥</span>
            <div>
              <h2
                className={`text-2xl font-bold ${
                  isDarkMode ? 'text-white' : 'text-brand-text'
                }`}
              >
                {t('labs.featured.title')}
              </h2>
              <p
                className={`text-sm ${
                  isDarkMode ? 'text-slate-300' : 'text-brand-muted'
                }`}
              >
                {t('labs.featured.subtitle')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {toolCategories
              .flatMap((cat) => cat.tools)
              .filter((tool) => tool.featured)
              .slice(0, 3)
              .map((tool, index) => {
                const progress = progressByTool.get(tool.id);

                return (
                  <Link
                    key={tool.id}
                    href={tool.href}
                    className={`group p-4 rounded-lg transition-all duration-300 hover:scale-105 ${
                      isDarkMode
                        ? 'bg-slate-800/80 hover:bg-slate-700/80'
                        : 'bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`text-2xl font-bold ${
                          index === 0
                            ? 'text-yellow-500'
                            : index === 1
                              ? 'text-gray-400'
                              : 'text-orange-600'
                        }`}
                      >
                        #{index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xl">{tool.icon}</span>
                          <h3
                            className={`font-bold ${
                              isDarkMode ? 'text-white' : 'text-brand-text'
                            }`}
                          >
                            {tool.name}
                          </h3>
                          {progress?.passed && (
                            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-400">
                              Aprobado
                            </span>
                          )}
                        </div>
                        <p
                          className={`text-xs ${
                            isDarkMode ? 'text-slate-400' : 'text-brand-muted'
                          }`}
                        >
                          {tool.description}
                        </p>
                        {progress && (
                          <p
                            className={`mt-2 text-xs font-semibold ${
                              isDarkMode
                                ? 'text-emerald-300'
                                : 'text-emerald-700'
                            }`}
                          >
                            Mejor: {progress.bestScore}/{progress.maxScore} (
                            {Math.round(progress.bestPercentage)}%)
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
          </div>
        </div>

        {/* Tools by Category */}
        <div className="space-y-12">
          {toolCategories.map((category) => (
            <div key={category.id}>
              {/* Category Header */}
              <div className="mb-6">
                <h2
                  className={`text-2xl md:text-3xl font-bold mb-2 ${
                    isDarkMode ? 'text-white' : 'text-brand-text'
                  }`}
                >
                  {category.name}
                </h2>
                <p
                  className={`text-base ${
                    isDarkMode ? 'text-slate-400' : 'text-brand-muted'
                  }`}
                >
                  {category.description}
                </p>
              </div>

              {/* Tools Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.tools.map((tool) => {
                  const progress = progressByTool.get(tool.id);

                  return (
                    <Link
                      key={tool.id}
                      href={tool.href}
                      className={`group flex flex-col rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
                        isDarkMode ? 'bg-slate-800' : 'bg-white'
                      }`}
                    >
                      <div
                        className={`bg-gradient-to-r ${tool.color} p-6 text-white relative flex-1`}
                      >
                        {/* Badges Container */}
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="text-3xl">{tool.icon}</div>
                          <div className="flex flex-col items-end gap-2">
                            {progress?.passed && (
                              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                Aprobado
                              </span>
                            )}
                            {tool.featured && (
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                  isDarkMode
                                    ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/50'
                                    : 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                                }`}
                              >
                                ⭐ Destacada
                              </span>
                            )}
                            {tool.implementedDate && (
                              <span className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded text-xs font-medium">
                                📅 {tool.implementedDate}
                              </span>
                            )}
                          </div>
                        </div>
                        <h3 className="text-xl font-bold mb-2">{tool.name}</h3>
                        <p className="text-white/90 text-sm">
                          {tool.description}
                        </p>
                        {progress && (
                          <div className="mt-4 rounded-lg bg-white/15 p-3 text-sm backdrop-blur-sm">
                            <div className="flex items-center justify-between gap-3 font-semibold">
                              <span>Mejor puntaje</span>
                              <span>
                                {progress.bestScore}/{progress.maxScore}
                              </span>
                            </div>
                            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/25">
                              <div
                                className="h-full rounded-full bg-white"
                                style={{
                                  width: `${Math.min(100, Math.max(0, progress.bestPercentage))}%`,
                                }}
                              />
                            </div>
                            <p className="mt-2 text-xs text-white/85">
                              Último intento:{' '}
                              {formatProgressDate(progress.lastAttemptAt)}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="p-6 shrink-0">
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-sm ${
                              isDarkMode ? 'text-slate-400' : 'text-brand-muted'
                            }`}
                          >
                            {progress?.passed
                              ? 'Mejorar puntaje'
                              : progress
                                ? 'Reintentar'
                                : t('labs.action')}
                          </span>
                          <svg
                            className={`w-5 h-5 transition-colors ${
                              isDarkMode
                                ? 'text-slate-400 group-hover:text-blue-400'
                                : 'text-brand-muted group-hover:text-brand-accent'
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Info Section */}
        <div
          className={`mt-16 rounded-lg shadow-lg p-8 transition-colors duration-300 ${
            isDarkMode ? 'bg-slate-800' : 'bg-white'
          }`}
        >
          <div className="text-center mb-8">
            <h2
              className={`text-3xl font-bold mb-4 ${
                isDarkMode ? 'text-white' : 'text-brand-text'
              }`}
            >
              {t('labs.why.title')}
            </h2>
            <p
              className={`text-lg max-w-2xl mx-auto ${
                isDarkMode ? 'text-slate-300' : 'text-brand-muted'
              }`}
            >
              {t('labs.why.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">🚀</div>
              <h3
                className={`text-xl font-bold mb-3 ${
                  isDarkMode ? 'text-white' : 'text-brand-text'
                }`}
              >
                {t('labs.why.free')}
              </h3>
              <p className={isDarkMode ? 'text-slate-400' : 'text-brand-muted'}>
                {t('labs.why.free.desc')}
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🇵🇾</div>
              <h3
                className={`text-xl font-bold mb-3 ${
                  isDarkMode ? 'text-white' : 'text-brand-text'
                }`}
              >
                {t('labs.why.local')}
              </h3>
              <p className={isDarkMode ? 'text-slate-400' : 'text-brand-muted'}>
                {t('labs.why.local.desc')}
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">💡</div>
              <h3
                className={`text-xl font-bold mb-3 ${
                  isDarkMode ? 'text-white' : 'text-brand-text'
                }`}
              >
                {t('labs.why.updated')}
              </h3>
              <p className={isDarkMode ? 'text-slate-400' : 'text-brand-muted'}>
                {t('labs.why.updated.desc')}
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div
            className={`rounded-lg p-8 text-white transition-colors duration-300 ${
              isDarkMode
                ? 'bg-gradient-to-r from-blue-600 to-indigo-700'
                : 'bg-gradient-to-r from-brand-accent to-brand-primary'
            }`}
          >
            <h2 className="text-3xl font-bold mb-4">{t('labs.cta.title')}</h2>
            <p className="text-xl mb-6 opacity-90">{t('labs.cta.subtitle')}</p>
            <Link
              href="/comunidad"
              className={`inline-flex items-center gap-2 px-8 py-3 rounded-lg font-semibold transition-colors ${
                isDarkMode
                  ? 'bg-white text-blue-600 hover:bg-gray-100'
                  : 'bg-white text-brand-primary hover:bg-gray-100'
              }`}
            >
              <span className="text-xl">💬</span>
              {t('labs.cta.button')}
            </Link>
          </div>
        </div>
      </div>

      {/* Bug Report Widget */}
      <BugReportWidget />

      {/* Suru mascot working on labs */}
      <SuruFloating pose="working" position="bottom-right" />
    </div>
  );
}
