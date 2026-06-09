'use client';

import { useState, useCallback } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import type { ChallengeSession } from '../page';
import type { TestCase, BugReport } from '@/services/assessmentsService';
import { assessmentsService } from '@/services/assessmentsService';
import Timer from './Timer';
import TestCaseForm from './TestCaseForm';
import BugReportForm from './BugReportForm';

type LeftTab = 'overview' | 'docs';
type RightTab = 'testcases' | 'bugs' | 'summary' | 'submit';

interface Props {
  session: ChallengeSession;
  onSubmitComplete: (score: any) => void;
}

const ENDPOINTS = [
  {
    method: 'POST',
    path: '/auth/login',
    desc: 'Autenticarse con email y contraseña',
    tag: 'Auth',
  },
  {
    method: 'GET',
    path: '/users/me',
    desc: 'Obtener perfil del usuario autenticado',
    tag: 'Users',
  },
  {
    method: 'GET',
    path: '/accounts',
    desc: 'Listar cuentas propias',
    tag: 'Accounts',
  },
  {
    method: 'GET',
    path: '/accounts/{accountId}',
    desc: 'Detalle de una cuenta por ID',
    tag: 'Accounts',
  },
  {
    method: 'GET',
    path: '/accounts/{accountId}/movements',
    desc: 'Movimientos de una cuenta',
    tag: 'Accounts',
  },
  {
    method: 'POST',
    path: '/transfers',
    desc: 'Crear una transferencia bancaria',
    tag: 'Transfers',
  },
  {
    method: 'GET',
    path: '/transfers/{transferId}',
    desc: 'Detalle de una transferencia',
    tag: 'Transfers',
  },
];

const METHOD_COLORS: Record<string, string> = {
  GET: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  POST: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  PUT: 'bg-yellow-100 text-yellow-700',
  DELETE: 'bg-red-100 text-red-700',
};

export default function Workspace({ session, onSubmitComplete }: Props) {
  const { isDarkMode } = useTheme();
  const [leftTab, setLeftTab] = useState<LeftTab>('overview');
  const [rightTab, setRightTab] = useState<RightTab>('testcases');
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [bugReports, setBugReports] = useState<BugReport[]>([]);
  const [summary, setSummary] = useState('');
  const [showTcForm, setShowTcForm] = useState(false);
  const [showBrForm, setShowBrForm] = useState(false);
  const [editingTcIdx, setEditingTcIdx] = useState<number | null>(null);
  const [editingBrIdx, setEditingBrIdx] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const saveProgress = useCallback(
    async (tcs: TestCase[], brs: BugReport[]) => {
      setIsSaving(true);
      try {
        await Promise.all([
          assessmentsService.saveTestCases(session.attemptId, tcs),
          assessmentsService.saveBugReports(session.attemptId, brs),
        ]);
      } catch {
        // Non-blocking save failure
      } finally {
        setIsSaving(false);
      }
    },
    [session.attemptId]
  );

  const addTestCase = (tc: TestCase) => {
    const updated = [...testCases, tc];
    setTestCases(updated);
    setShowTcForm(false);
    saveProgress(updated, bugReports);
  };

  const updateTestCase = (idx: number, tc: TestCase) => {
    const updated = testCases.map((t, i) => (i === idx ? tc : t));
    setTestCases(updated);
    setEditingTcIdx(null);
    saveProgress(updated, bugReports);
  };

  const deleteTestCase = (idx: number) => {
    const updated = testCases.filter((_, i) => i !== idx);
    setTestCases(updated);
    saveProgress(updated, bugReports);
  };

  const addBugReport = (br: BugReport) => {
    const updated = [...bugReports, br];
    setBugReports(updated);
    setShowBrForm(false);
    saveProgress(testCases, updated);
  };

  const updateBugReport = (idx: number, br: BugReport) => {
    const updated = bugReports.map((b, i) => (i === idx ? br : b));
    setBugReports(updated);
    setEditingBrIdx(null);
    saveProgress(testCases, updated);
  };

  const deleteBugReport = (idx: number) => {
    const updated = bugReports.filter((_, i) => i !== idx);
    setBugReports(updated);
    saveProgress(testCases, updated);
  };

  const handleSubmit = async () => {
    if (testCases.length === 0) {
      setSubmitError(
        'Debes agregar al menos un caso de prueba antes de enviar.'
      );
      return;
    }
    setSubmitError('');
    setIsSubmitting(true);

    try {
      await assessmentsService.saveTestCases(session.attemptId, testCases);
      await assessmentsService.saveBugReports(session.attemptId, bugReports);
      const result = await assessmentsService.submitAttempt(
        session.attemptId,
        summary
      );
      onSubmitComplete(result.score);
    } catch (err: unknown) {
      setSubmitError('Error al enviar. Intenta de nuevo.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const base = isDarkMode
    ? 'bg-gray-900 text-white'
    : 'bg-gray-50 text-gray-900';
  const panel = isDarkMode
    ? 'bg-gray-800 border-gray-700'
    : 'bg-white border-gray-200';
  const tab = (active: boolean) =>
    `px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
      active
        ? 'border-blue-500 text-blue-500'
        : `border-transparent ${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`
    }`;

  return (
    <div className={`min-h-screen flex flex-col ${base}`}>
      {/* Header */}
      <header
        className={`flex items-center justify-between px-6 py-3 border-b ${panel}`}
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">🏦</span>
          <div>
            <span className="font-semibold text-sm">API Banking Challenge</span>
            <span
              className={`ml-3 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
            >
              {session.candidateName}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {isSaving && (
            <span className="text-xs text-gray-400">Guardando...</span>
          )}
          <div
            className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}
          >
            <span>⏱</span>
            <Timer startedAt={session.startedAt} />
          </div>
          <div
            className={`flex items-center gap-3 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
          >
            <span>🧪 {testCases.length} casos</span>
            <span>🐛 {bugReports.length} bugs</span>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel */}
        <div className={`w-2/5 flex flex-col border-r ${panel}`}>
          <div
            className={`flex border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
          >
            {(['overview', 'docs'] as LeftTab[]).map((t) => (
              <button
                key={t}
                onClick={() => setLeftTab(t)}
                className={tab(leftTab === t)}
              >
                {t === 'overview' ? '📋 Overview' : '📖 API Docs'}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4 text-sm">
            {leftTab === 'overview' && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Contexto</h3>
                  <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                    Eres QA Engineer de <strong>Banca Digital AIQUAA</strong>.
                    La API de transferencias está en staging y debes encontrar
                    bugs antes del lanzamiento.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Credenciales de prueba</h3>
                  <div
                    className={`rounded-lg p-3 font-mono text-xs space-y-1 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}
                  >
                    <div>
                      <strong>URL base:</strong> /api/challenge
                    </div>
                    <div className="border-t border-gray-600 mt-2 pt-2">
                      <div>
                        <strong>Usuario A:</strong>
                      </div>
                      <div>Email: user.a@aiquaa.test</div>
                      <div>Pass: Test1234!</div>
                      <div>Cuenta: acc_001 (5,000,000 PYG)</div>
                    </div>
                    <div className="border-t border-gray-600 mt-2 pt-2">
                      <div>
                        <strong>Usuario B:</strong>
                      </div>
                      <div>Email: user.b@aiquaa.test</div>
                      <div>Pass: Test1234!</div>
                      <div>Cuenta: acc_002 (2,500,000 PYG)</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">
                    Tu token activo (Usuario A)
                  </h3>
                  <div
                    className={`rounded-lg p-2 font-mono text-xs break-all ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}
                  >
                    {session.challengeToken ? (
                      session.challengeToken.slice(0, 60) + '...'
                    ) : (
                      <span className="text-red-400">
                        No se pudo obtener token
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Entregables</h3>
                  <ul
                    className={`space-y-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}
                  >
                    <li
                      className={testCases.length >= 5 ? 'text-green-500' : ''}
                    >
                      {testCases.length >= 5 ? '✅' : '⬜'} Mínimo 5 casos de
                      prueba
                    </li>
                    <li
                      className={bugReports.length >= 3 ? 'text-green-500' : ''}
                    >
                      {bugReports.length >= 3 ? '✅' : '⬜'} Mínimo 3 reportes
                      de bugs
                    </li>
                    <li
                      className={summary.length >= 100 ? 'text-green-500' : ''}
                    >
                      {summary.length >= 100 ? '✅' : '⬜'} Resumen ejecutivo
                      (≥100 chars)
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {leftTab === 'docs' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Endpoints</h3>
                  <a
                    href="/api/challenge/openapi.json"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-400 hover:underline"
                  >
                    OpenAPI JSON ↗
                  </a>
                </div>
                {ENDPOINTS.map((ep) => (
                  <div
                    key={`${ep.method}-${ep.path}`}
                    className={`rounded-lg p-3 border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-bold ${METHOD_COLORS[ep.method]}`}
                      >
                        {ep.method}
                      </span>
                      <code className="text-xs font-mono">{ep.path}</code>
                      <span
                        className={`ml-auto text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}
                      >
                        {ep.tag}
                      </span>
                    </div>
                    <p
                      className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                    >
                      {ep.desc}
                    </p>
                  </div>
                ))}
                <p
                  className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}
                >
                  Auth: <code>Authorization: Bearer &lt;token&gt;</code>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right panel */}
        <div className="w-3/5 flex flex-col">
          <div
            className={`flex border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
          >
            {(
              [
                { id: 'testcases', label: `🧪 Casos (${testCases.length})` },
                { id: 'bugs', label: `🐛 Bugs (${bugReports.length})` },
                { id: 'summary', label: '📋 Resumen' },
                { id: 'submit', label: '🚀 Enviar' },
              ] as { id: RightTab; label: string }[]
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => setRightTab(t.id)}
                className={tab(rightTab === t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {/* Test Cases Tab */}
            {rightTab === 'testcases' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">Casos de prueba</h3>
                  {!showTcForm && (
                    <button
                      onClick={() => setShowTcForm(true)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg"
                    >
                      + Agregar caso
                    </button>
                  )}
                </div>

                {showTcForm && (
                  <TestCaseForm
                    onSave={addTestCase}
                    onCancel={() => setShowTcForm(false)}
                  />
                )}

                {testCases.length === 0 && !showTcForm && (
                  <p
                    className={`text-sm text-center py-8 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}
                  >
                    Sin casos de prueba todavía. Agrega el primero.
                  </p>
                )}

                {testCases.map((tc, idx) =>
                  editingTcIdx === idx ? (
                    <TestCaseForm
                      key={idx}
                      initial={tc}
                      onSave={(updated) => updateTestCase(idx, updated)}
                      onCancel={() => setEditingTcIdx(null)}
                    />
                  ) : (
                    <div
                      key={idx}
                      className={`rounded-lg border p-3 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-medium ${
                                tc.type === 'security'
                                  ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                                  : tc.type === 'negative'
                                    ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
                                    : tc.type === 'boundary'
                                      ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                                      : tc.type === 'contract'
                                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                                        : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                              }`}
                            >
                              {tc.type}
                            </span>
                            <span
                              className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                            >
                              {tc.priority}
                            </span>
                          </div>
                          <p className="text-sm font-medium truncate">
                            {tc.title}
                          </p>
                          <p
                            className={`text-xs mt-1 line-clamp-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                          >
                            {tc.steps}
                          </p>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button
                            onClick={() => setEditingTcIdx(idx)}
                            className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                            title="Editar"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => deleteTestCase(idx)}
                            className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                            title="Eliminar"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}

            {/* Bug Reports Tab */}
            {rightTab === 'bugs' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">Reportes de bugs</h3>
                  {!showBrForm && (
                    <button
                      onClick={() => setShowBrForm(true)}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg"
                    >
                      + Reportar bug
                    </button>
                  )}
                </div>

                {showBrForm && (
                  <BugReportForm
                    onSave={addBugReport}
                    onCancel={() => setShowBrForm(false)}
                  />
                )}

                {bugReports.length === 0 && !showBrForm && (
                  <p
                    className={`text-sm text-center py-8 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}
                  >
                    Sin bugs reportados todavía. ¡Explora la API!
                  </p>
                )}

                {bugReports.map((br, idx) =>
                  editingBrIdx === idx ? (
                    <BugReportForm
                      key={idx}
                      initial={br}
                      onSave={(updated) => updateBugReport(idx, updated)}
                      onCancel={() => setEditingBrIdx(null)}
                    />
                  ) : (
                    <div
                      key={idx}
                      className={`rounded-lg border p-3 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-medium ${
                                br.severity === 'critical'
                                  ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                                  : br.severity === 'high'
                                    ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
                                    : br.severity === 'medium'
                                      ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                              }`}
                            >
                              {br.severity}
                            </span>
                            <code className="text-xs font-mono truncate">
                              {br.endpoint}
                            </code>
                          </div>
                          <p className="text-sm font-medium truncate">
                            {br.title}
                          </p>
                          <p
                            className={`text-xs mt-1 line-clamp-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                          >
                            {br.actualResult}
                          </p>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button
                            onClick={() => setEditingBrIdx(idx)}
                            className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => deleteBugReport(idx)}
                            className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}

            {/* Summary Tab */}
            {rightTab === 'summary' && (
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-sm mb-1">
                    Resumen ejecutivo
                  </h3>
                  <p
                    className={`text-xs mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                  >
                    Describe los hallazgos principales, riesgos identificados y
                    recomendaciones. Mínimo 100 caracteres para puntaje
                    completo.
                  </p>
                  <textarea
                    className={`w-full px-3 py-2 rounded-lg border text-sm resize-none ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    rows={12}
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="Resumen de la evaluación de la API de Banca Digital AIQUAA..."
                  />
                  <p
                    className={`text-xs mt-1 ${summary.length >= 100 ? 'text-green-500' : isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                  >
                    {summary.length} caracteres{' '}
                    {summary.length >= 100
                      ? '✓'
                      : `(${100 - summary.length} más para puntaje completo)`}
                  </p>
                </div>
              </div>
            )}

            {/* Submit Tab */}
            {rightTab === 'submit' && (
              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Enviar evaluación</h3>

                <div
                  className={`rounded-lg p-4 space-y-3 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}
                >
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Checklist de entregables
                  </h4>
                  {[
                    {
                      done: testCases.length >= 5,
                      label: `Casos de prueba: ${testCases.length}/5 mínimo`,
                    },
                    {
                      done: bugReports.length >= 3,
                      label: `Reportes de bugs: ${bugReports.length}/3 mínimo`,
                    },
                    {
                      done: summary.length >= 100,
                      label: `Resumen ejecutivo: ${summary.length}/100 chars mínimo`,
                    },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span
                        className={
                          item.done ? 'text-green-500' : 'text-gray-400'
                        }
                      >
                        {item.done ? '✅' : '⬜'}
                      </span>
                      <span
                        className={`text-sm ${item.done ? (isDarkMode ? 'text-white' : 'text-gray-900') : isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                      >
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>

                <p
                  className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                >
                  Al enviar, el sistema puntuará automáticamente tu trabajo.
                  Recibirás retroalimentación detallada.
                </p>

                {submitError && (
                  <p className="text-sm text-red-500">{submitError}</p>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors"
                >
                  {isSubmitting
                    ? 'Enviando y puntuando...'
                    : '🚀 Enviar evaluación'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
