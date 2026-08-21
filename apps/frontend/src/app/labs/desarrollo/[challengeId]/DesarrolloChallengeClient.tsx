'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
import { useToolUsage } from '@/hooks/useToolUsage';
import { validateProcessCodeAction } from '@/actions/employer';
import { saveExamResultAction } from '@/actions/exams';
import {
  isValidRepoUrl,
  type DesarrolloChallenge,
} from '@/lib/labs/desarrolloChallenges';

interface ResolvedProcess {
  code: string;
  position_name: string;
  company_name: string;
}

export default function DesarrolloChallengeClient({
  challenge,
}: {
  challenge: DesarrolloChallenge;
}) {
  const { isDarkMode } = useTheme();
  const { logUsage, logError } = useToolUsage(challenge.id);

  const [code, setCode] = useState('');
  const [validating, setValidating] = useState(false);
  const [process, setProcess] = useState<ResolvedProcess | null>(null);
  const [gateError, setGateError] = useState<string | null>(null);

  const [github, setGithub] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setValidating(true);
    setGateError(null);
    try {
      const {
        valid,
        process: p,
        reason,
      } = await validateProcessCodeAction(code.trim());
      if (!valid || !p) {
        setGateError(
          reason === 'expired'
            ? 'El proceso está vencido.'
            : 'Código inválido. Revisá el código que te dio la empresa.'
        );
        return;
      }
      if (!(p.exam_types ?? []).includes(challenge.examType)) {
        setGateError(`Este código no incluye la prueba "${challenge.title}".`);
        return;
      }
      setProcess({
        code: p.code,
        position_name: p.position_name,
        company_name: p.company_name,
      });
      void logUsage('start');
    } catch (err) {
      setGateError('No se pudo validar el código. Intentá de nuevo.');
      void logError(err, 'validate');
    } finally {
      setValidating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!process) return;

    const trimmedRepo = repoUrl.trim();
    if (!isValidRepoUrl(trimmedRepo)) {
      setFormError(
        'La URL debe ser la raíz de un repositorio público de GitHub, con la forma https://github.com/usuario/repositorio'
      );
      return;
    }

    setSubmitting(true);
    setFormError(null);
    try {
      // Score 0 a propósito: el examen entra como `pending_correction` y el
      // puntaje real lo carga el profesor desde /empresa/evaluar-desarrollo.
      const result = await saveExamResultAction({
        exam_type: challenge.examType,
        exam_mode: 'exam',
        process_code: process.code,
        github_profile: github.trim() || undefined,
        company_name: process.company_name,
        score: 0,
        total_questions: 1,
        max_possible_score: 100,
        correct_answers: 0,
        incorrect_answers: 0,
        passing_score: 70,
        passed: false,
        percentage: 0,
        time_spent: 0,
        metadata: {
          challengeId: challenge.id,
          repoUrl: trimmedRepo,
          githubUser: github.trim(),
          notes: notes.trim(),
          submittedAt: new Date().toISOString(),
        },
      });

      if ('error' in result && result.error) {
        setFormError(result.error);
        return;
      }

      setSubmitted(true);
      void logUsage('submit');
    } catch (err) {
      setFormError('No se pudo registrar la entrega. Intentá de nuevo.');
      void logError(err, 'submit');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = `w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:ring-2 focus:ring-indigo-500 ${
    isDarkMode
      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
  }`;
  const labelClass = `block text-sm font-medium mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`;
  const cardClass = `rounded-xl border p-6 ${isDarkMode ? 'bg-dark-secondary border-slate-700' : 'bg-white border-gray-200'}`;
  const mutedClass = isDarkMode ? 'text-slate-400' : 'text-gray-500';

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-dark-bg' : 'bg-gray-50'}`}
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <header>
          <p
            className={`text-xs font-semibold uppercase tracking-[0.18em] ${mutedClass}`}
          >
            {challenge.clase} · Prueba de desarrollo
          </p>
          <h1
            className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
          >
            {challenge.emoji} {challenge.title}
          </h1>
          <p className={`text-sm mt-2 ${mutedClass}`}>{challenge.objetivo}</p>
          <p className={`text-xs mt-3 ${mutedClass}`}>
            Duración estimada: ~{Math.round(challenge.duracionEstimadaMin / 60)}{' '}
            horas · Entrega: link del repositorio · Corrección manual del
            evaluador sobre 100 puntos.
          </p>
        </header>

        {/* Step 0 — gate por código */}
        {!process && (
          <form onSubmit={handleValidate} className={`${cardClass} space-y-4`}>
            <div>
              <label className={labelClass}>Código del proceso *</label>
              <input
                type="text"
                className={`${inputClass} font-mono tracking-wider`}
                placeholder="ej. AIQUAA-2026-X7K"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                required
              />
              <p className={`text-xs mt-1 ${mutedClass}`}>
                Es el código que te compartió la empresa para esta prueba.
              </p>
            </div>
            {gateError && (
              <div className="rounded-lg border border-red-300 bg-red-50 text-red-700 px-4 py-3 text-sm dark:border-red-700/50 dark:bg-red-900/20 dark:text-red-300">
                {gateError}
              </div>
            )}
            <button
              type="submit"
              disabled={validating || !code.trim()}
              className="w-full py-2.5 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {validating ? 'Validando...' : 'Continuar'}
            </button>
          </form>
        )}

        {process && (
          <>
            <div className={`${cardClass} space-y-1`}>
              <p
                className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
              >
                {process.position_name}
              </p>
              <p className={`text-xs ${mutedClass}`}>
                {process.company_name} · código{' '}
                <span className="font-mono">{process.code}</span>
              </p>
            </div>

            <section className={`${cardClass} space-y-4`}>
              <h2
                className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
              >
                Consigna
              </h2>
              <ol
                className={`list-decimal space-y-2 pl-5 text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}
              >
                {challenge.consigna.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ol>
            </section>

            <section className={`${cardClass} space-y-4`}>
              <h2
                className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
              >
                Entregables
              </h2>
              <ul
                className={`list-disc space-y-2 pl-5 text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}
              >
                {challenge.entregables.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>

              <div>
                <p className={`${labelClass} mb-2`}>Estructura sugerida</p>
                <pre
                  className={`overflow-x-auto rounded-lg border p-4 text-xs font-mono ${
                    isDarkMode
                      ? 'border-slate-700 bg-slate-900 text-slate-300'
                      : 'border-gray-200 bg-gray-50 text-gray-700'
                  }`}
                >
                  {challenge.estructuraEsperada}
                </pre>
              </div>
            </section>

            <section className={`${cardClass} space-y-3`}>
              <h2
                className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
              >
                Cómo se evalúa
              </h2>
              <p className={`text-sm ${mutedClass}`}>
                Un evaluador revisa tu repositorio después de la entrega y
                asigna un puntaje de 0 a 100. Se aprueba con 70.
              </p>
              <ul
                className={`list-disc space-y-2 pl-5 text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}
              >
                {challenge.criteriosDeEvaluacion.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>

            {/* Entrega */}
            {submitted ? (
              <div className={`${cardClass} space-y-3`}>
                <h2 className="text-lg font-semibold text-emerald-500">
                  ✅ Entrega registrada
                </h2>
                <p
                  className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}
                >
                  Tu repositorio quedó registrado y está pendiente de
                  corrección. Cuando el evaluador cargue el puntaje vas a verlo
                  en tu perfil.
                </p>
                <p className={`text-xs font-mono break-all ${mutedClass}`}>
                  {repoUrl.trim()}
                </p>
                <Link
                  href="/perfil"
                  className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
                >
                  Ir a mi perfil
                </Link>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className={`${cardClass} space-y-4`}
              >
                <h2
                  className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                >
                  Entregar
                </h2>

                <div>
                  <label className={labelClass}>Usuario de GitHub</label>
                  <input
                    type="text"
                    className={inputClass}
                    placeholder="ej. stevenayal"
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                  />
                </div>

                <div>
                  <label className={labelClass}>URL del repositorio *</label>
                  <input
                    type="url"
                    className={inputClass}
                    placeholder="https://github.com/usuario/repositorio"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    required
                  />
                  <p className={`text-xs mt-1 ${mutedClass}`}>
                    Tiene que ser la raíz de un repositorio público de GitHub, y
                    debe seguir accesible hasta que el evaluador lo revise.
                  </p>
                </div>

                <div>
                  <label className={labelClass}>Notas para el evaluador</label>
                  <textarea
                    className={`${inputClass} min-h-28`}
                    placeholder="Decisiones de diseño, qué quedó pendiente, cómo levantar el proyecto..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                {formError && (
                  <div className="rounded-lg border border-red-300 bg-red-50 text-red-700 px-4 py-3 text-sm dark:border-red-700/50 dark:bg-red-900/20 dark:text-red-300">
                    {formError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting || !repoUrl.trim()}
                  className="w-full py-2.5 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  {submitting
                    ? 'Registrando entrega...'
                    : 'Entregar repositorio'}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
