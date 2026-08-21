'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import {
  getPruebaByTokenAction,
  startIntentoAction,
  submitIntentoAction,
  type PublicPregunta,
} from '@/actions/empresa-pruebas-candidato';

type Stage = 'loading' | 'error' | 'welcome' | 'taking' | 'submitting' | 'done';

const ERROR_MESSAGES: Record<string, string> = {
  not_found: 'Este link de invitación no es válido.',
  revoked: 'Esta invitación fue revocada.',
  expired: 'Esta invitación expiró.',
  no_attempts_left:
    'Ya se agotaron los intentos disponibles para esta invitación.',
};

export default function TomarPruebaPage() {
  const { isDarkMode } = useTheme();
  const params = useParams<{ token: string }>();
  const token = params.token;

  const [stage, setStage] = useState<Stage>('loading');
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [pruebaTitle, setPruebaTitle] = useState('');
  const [pruebaDescription, setPruebaDescription] = useState<string | null>(
    null
  );
  const [durationMinutes, setDurationMinutes] = useState<number | null>(null);
  const [preguntas, setPreguntas] = useState<PublicPregunta[]>([]);
  const [candidateName, setCandidateName] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');
  const [needsCandidateInfo, setNeedsCandidateInfo] = useState(false);
  const [intentoId, setIntentoId] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);

  useEffect(() => {
    getPruebaByTokenAction(token).then(({ data, error }) => {
      if (error || !data) {
        setErrorCode(error);
        setStage('error');
        return;
      }
      setPruebaTitle(data.prueba.title);
      setPruebaDescription(data.prueba.description);
      setDurationMinutes(data.prueba.duration_minutes);
      setPreguntas(data.preguntas);
      setCandidateName(data.candidate_name ?? '');
      setCandidateEmail(data.candidate_email ?? '');
      setNeedsCandidateInfo(!data.candidate_name && !data.candidate_email);
      setStage('welcome');
    });
  }, [token]);

  useEffect(() => {
    if (stage !== 'taking' || !startedAt || !durationMinutes) return;
    const deadline = startedAt + durationMinutes * 60 * 1000;

    const tick = () => {
      const secondsLeft = Math.max(
        0,
        Math.round((deadline - Date.now()) / 1000)
      );
      setRemainingSeconds(secondsLeft);
      if (secondsLeft === 0) handleSubmit();
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, startedAt, durationMinutes]);

  const inputClass = `w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:ring-2 focus:ring-indigo-500 ${
    isDarkMode
      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
  }`;
  const cardClass = `rounded-2xl border p-8 ${isDarkMode ? 'bg-dark-secondary border-slate-700' : 'bg-white border-gray-200'}`;

  const handleStart = async () => {
    if (needsCandidateInfo && !candidateName.trim() && !candidateEmail.trim())
      return;
    const { data, error } = await startIntentoAction(token, {
      candidate_name: candidateName.trim() || undefined,
      candidate_email: candidateEmail.trim() || undefined,
    });
    if (error || !data) {
      setErrorCode(error);
      setStage('error');
      return;
    }
    setIntentoId(data.intentoId);
    setStartedAt(Date.now());
    setStage('taking');
  };

  const handleSubmit = async () => {
    if (!intentoId) return;
    setStage('submitting');
    const { error } = await submitIntentoAction(token, intentoId, answers);
    if (error && error !== 'time_expired') {
      setErrorCode(error);
      setStage('error');
      return;
    }
    setStage('done');
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  if (stage === 'loading') {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-dark-bg' : 'bg-gray-50'}`}
      >
        <p className={isDarkMode ? 'text-slate-400' : 'text-gray-500'}>
          Cargando...
        </p>
      </div>
    );
  }

  if (stage === 'error') {
    return (
      <div
        className={`min-h-screen flex items-center justify-center px-4 ${isDarkMode ? 'bg-dark-bg' : 'bg-gray-50'}`}
      >
        <div className={`${cardClass} max-w-md text-center`}>
          <p className="text-4xl mb-4">⚠️</p>
          <h1
            className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
          >
            No se pudo abrir la prueba
          </h1>
          <p
            className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
          >
            {ERROR_MESSAGES[errorCode ?? ''] ?? 'Ocurrió un error inesperado.'}
          </p>
        </div>
      </div>
    );
  }

  if (stage === 'done') {
    return (
      <div
        className={`min-h-screen flex items-center justify-center px-4 ${isDarkMode ? 'bg-dark-bg' : 'bg-gray-50'}`}
      >
        <div className={`${cardClass} max-w-md text-center`}>
          <p className="text-5xl mb-4">✅</p>
          <h1
            className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
          >
            ¡Gracias por completar la prueba!
          </h1>
          <p
            className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
          >
            Tus respuestas fueron enviadas. La empresa se pondrá en contacto con
            vos.
          </p>
        </div>
      </div>
    );
  }

  if (stage === 'welcome') {
    return (
      <div
        className={`min-h-screen flex items-center justify-center px-4 ${isDarkMode ? 'bg-dark-bg' : 'bg-gray-50'}`}
      >
        <div className={`${cardClass} max-w-md w-full`}>
          <h1
            className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
          >
            {pruebaTitle}
          </h1>
          {pruebaDescription && (
            <p
              className={`text-sm mb-4 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
            >
              {pruebaDescription}
            </p>
          )}
          <p
            className={`text-sm mb-6 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
          >
            {preguntas.length} pregunta{preguntas.length === 1 ? '' : 's'}
            {durationMinutes ? ` · ${durationMinutes} minutos` : ''}
          </p>

          {needsCandidateInfo && (
            <div className="space-y-3 mb-6">
              <input
                type="text"
                className={inputClass}
                placeholder="Tu nombre"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
              />
              <input
                type="email"
                className={inputClass}
                placeholder="Tu email"
                value={candidateEmail}
                onChange={(e) => setCandidateEmail(e.target.value)}
              />
            </div>
          )}

          <button
            onClick={handleStart}
            disabled={
              needsCandidateInfo &&
              !candidateName.trim() &&
              !candidateEmail.trim()
            }
            className="w-full py-2.5 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            Comenzar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-dark-bg' : 'bg-gray-50'}`}
    >
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <h1
            className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
          >
            {pruebaTitle}
          </h1>
          {remainingSeconds !== null && (
            <span
              className={`text-sm font-mono px-3 py-1 rounded-full ${
                remainingSeconds < 60
                  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                  : isDarkMode
                    ? 'bg-slate-700 text-slate-300'
                    : 'bg-gray-100 text-gray-600'
              }`}
            >
              ⏱ {formatTime(remainingSeconds)}
            </span>
          )}
        </div>

        <div className="space-y-4">
          {preguntas.map((pregunta, index) => (
            <div key={pregunta.id} className={cardClass}>
              <p
                className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-slate-200' : 'text-gray-800'}`}
              >
                {index + 1}. {pregunta.prompt}
              </p>

              {pregunta.question_type === 'multiple_choice' && (
                <div className="space-y-2">
                  {((pregunta.options as string[]) ?? []).map((option) => (
                    <label
                      key={option}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm ${
                        isDarkMode ? 'border-slate-600' : 'border-gray-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name={pregunta.id}
                        checked={
                          (
                            answers[pregunta.id] as
                              | { value?: string }
                              | undefined
                          )?.value === option
                        }
                        onChange={() =>
                          setAnswers({
                            ...answers,
                            [pregunta.id]: { value: option },
                          })
                        }
                      />
                      <span
                        className={
                          isDarkMode ? 'text-slate-300' : 'text-gray-700'
                        }
                      >
                        {option}
                      </span>
                    </label>
                  ))}
                </div>
              )}

              {pregunta.question_type === 'multi_select' && (
                <div className="space-y-2">
                  <p
                    className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}
                  >
                    Marcá todas las opciones correctas
                  </p>
                  {((pregunta.options as string[]) ?? []).map((option) => {
                    const current =
                      (
                        answers[pregunta.id] as
                          | { values?: string[] }
                          | undefined
                      )?.values ?? [];
                    const checked = current.includes(option);
                    return (
                      <label
                        key={option}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm ${
                          isDarkMode ? 'border-slate-600' : 'border-gray-200'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            setAnswers({
                              ...answers,
                              [pregunta.id]: {
                                values: checked
                                  ? current.filter((v) => v !== option)
                                  : [...current, option],
                              },
                            })
                          }
                        />
                        <span
                          className={
                            isDarkMode ? 'text-slate-300' : 'text-gray-700'
                          }
                        >
                          {option}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}

              {pregunta.question_type === 'true_false' && (
                <div className="flex gap-3">
                  {[true, false].map((value) => (
                    <button
                      key={String(value)}
                      type="button"
                      onClick={() =>
                        setAnswers({ ...answers, [pregunta.id]: { value } })
                      }
                      className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                        (
                          answers[pregunta.id] as
                            | { value?: boolean }
                            | undefined
                        )?.value === value
                          ? 'border-indigo-500 bg-indigo-600 text-white'
                          : isDarkMode
                            ? 'border-slate-600 text-slate-300'
                            : 'border-gray-300 text-gray-700'
                      }`}
                    >
                      {value ? 'Verdadero' : 'Falso'}
                    </button>
                  ))}
                </div>
              )}

              {pregunta.question_type === 'short_text' && (
                <textarea
                  className={`${inputClass} resize-none`}
                  rows={3}
                  value={(answers[pregunta.id] as string) ?? ''}
                  onChange={(e) =>
                    setAnswers({ ...answers, [pregunta.id]: e.target.value })
                  }
                />
              )}
            </div>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={stage === 'submitting'}
          className="w-full mt-6 py-2.5 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {stage === 'submitting' ? 'Enviando...' : 'Enviar respuestas'}
        </button>
      </div>
    </div>
  );
}
