'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import {
  finalizeAssessmentAttemptAction,
  getAssessmentSectionAction,
  saveAssessmentAnswerAction,
  submitAssessmentSectionAction,
} from '@/actions/assessments';
import ApiDocCard from './ApiDocCard';
import AssessmentProgress from './AssessmentProgress';
import AssessmentTimer from './AssessmentTimer';
import MultipleChoiceQuestion from './MultipleChoiceQuestion';
import MultipleSelectQuestion from './MultipleSelectQuestion';
import PlaywrightCodeBlock from './PlaywrightCodeBlock';
import RequestResponseBlock from './RequestResponseBlock';
import SectionNavigator from './SectionNavigator';
import SubmitSectionDialog from './SubmitSectionDialog';
import { isAnswerEmpty } from '../lib/answers';
import SectionSummaryCard from './SectionSummaryCard';
import ShortAnswerQuestion from './ShortAnswerQuestion';
import SqlScenarioBlock from './SqlScenarioBlock';
import SqlSchemaCard from './SqlSchemaCard';
import TrueFalseQuestion from './TrueFalseQuestion';
import type {
  ApiDocScenario,
  AssessmentSectionPayload,
  PlaywrightCodeScenario,
  SqlQueryScenario,
  SqlSchemaScenario,
} from '../types';

type AnswerMap = Record<string, unknown>;

export default function AssessmentSectionScreen({
  basePath,
}: {
  basePath: string;
}) {
  const params = useParams<{ sectionId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const attemptId = searchParams.get('attempt');
  const sectionSlug = params.sectionId;
  const [payload, setPayload] = useState<AssessmentSectionPayload | null>(null);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingMessage, setSavingMessage] = useState('Autosave activo');
  const [error, setError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const saveTimers = useRef<Record<string, number>>({});

  useEffect(() => {
    if (!attemptId) {
      router.push(`${basePath}/start`);
      return;
    }

    let cancelled = false;
    const timers = saveTimers.current;

    async function loadSection() {
      if (!attemptId) return;
      try {
        setLoading(true);
        const data = await getAssessmentSectionAction(attemptId, sectionSlug);
        if (cancelled) return;
        if (data.attempt.status === 'graded') {
          router.replace(`${basePath}/result?attempt=${attemptId}`);
          return;
        }
        setPayload(data);
        const nextAnswers: AnswerMap = {};
        data.answers.forEach((answer) => {
          nextAnswers[answer.question_id] = answer.answer;
        });
        setAnswers(nextAnswers);
        setError('');
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'No se pudo cargar la sección.'
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadSection();

    return () => {
      cancelled = true;
      Object.values(timers).forEach((timer) => window.clearTimeout(timer));
    };
  }, [attemptId, basePath, router, sectionSlug]);

  useEffect(() => {
    if (!payload || payload.attempt.status === 'graded') return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [payload]);

  function scheduleAutosave(questionId: string, value: unknown) {
    if (!attemptId) return;

    if (saveTimers.current[questionId]) {
      window.clearTimeout(saveTimers.current[questionId]);
    }

    setSavingMessage('Guardando...');
    saveTimers.current[questionId] = window.setTimeout(async () => {
      try {
        await saveAssessmentAnswerAction({
          attemptId,
          questionId,
          answer: value,
          currentSectionSlug: sectionSlug,
        });
        setSavingMessage('Guardado');
      } catch (saveError) {
        setSavingMessage('No se pudo guardar');
        setSubmitError(
          saveError instanceof Error
            ? saveError.message
            : 'Error guardando respuesta'
        );
      }
    }, 500);
  }

  function updateAnswer(questionId: string, value: unknown) {
    setAnswers((current) => ({ ...current, [questionId]: value }));
    scheduleAutosave(questionId, value);
  }

  async function handleSubmitSection() {
    if (!attemptId || !payload) return;

    setSubmitError('');
    setIsSubmitting(true);
    setShowSubmitDialog(false);

    try {
      const { nextSectionSlug } = await submitAssessmentSectionAction({
        attemptId,
        sectionSlug: payload.section.slug,
      });

      if (nextSectionSlug) {
        setIsSubmitting(false);
        router.push(
          `${basePath}/section/${nextSectionSlug}?attempt=${attemptId}`
        );
        return;
      }

      await finalizeAssessmentAttemptAction(attemptId);
      setIsSubmitting(false);
      router.replace(`${basePath}/result?attempt=${attemptId}`);
    } catch (submitSectionError) {
      setIsSubmitting(false);
      setSubmitError(
        submitSectionError instanceof Error
          ? submitSectionError.message
          : 'No se pudo enviar la sección.'
      );
    }
  }

  if (loading || !payload) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'
        }`}
      >
        <div className="h-10 w-10 animate-spin rounded-full border-t-2 border-cyan-400" />
      </div>
    );
  }

  const currentIndex =
    payload.sections.findIndex((item) => item.slug === payload.section.slug) +
    1;
  const previousSection = payload.sections[currentIndex - 2];
  const unansweredCount = payload.questions.filter((question) =>
    isAnswerEmpty(answers[question.id])
  ).length;
  const sectionScore = payload.scores.find(
    (score) => score.section_id === payload.section.id
  );
  const sectionApiDoc = payload.section.metadata?.apiDoc as
    | ApiDocScenario
    | undefined;
  const sectionSqlSchema = payload.section.metadata?.sqlSchema as
    | SqlSchemaScenario
    | undefined;
  const suggestedMinutes = Number(
    payload.section.metadata?.suggestedMinutes ?? 10
  );

  return (
    <div
      className={`min-h-screen px-4 py-8 ${
        isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'
      }`}
    >
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">
              {payload.section.title}
            </p>
            <h1 className="mt-2 text-3xl font-bold">
              {payload.section.description}
            </h1>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              {savingMessage}
            </p>
          </div>
          <AssessmentTimer suggestedMinutes={suggestedMinutes} />
        </div>

        <AssessmentProgress
          sections={payload.sections}
          currentSectionSlug={payload.section.slug}
          scores={payload.scores}
        />

        {error ? (
          <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        {sectionApiDoc ? (
          <div className="mt-6">
            <ApiDocCard scenario={sectionApiDoc} />
          </div>
        ) : null}

        {sectionSqlSchema ? (
          <div className="mt-6">
            <SqlSchemaCard scenario={sectionSqlSchema} />
          </div>
        ) : null}

        <div className="mt-8 space-y-6">
          {payload.questions.map((question) => {
            const answer = answers[question.id];
            const scenario = question.metadata?.scenario as
              | {
                  title: string;
                  request?: {
                    method: string;
                    endpoint: string;
                    headers?: string[];
                    body?: Record<string, unknown>;
                  };
                  response?: {
                    status: number;
                    body?: Record<string, unknown>;
                  };
                  documentationNote?: string;
                }
              | undefined;
            const sqlScenario = question.metadata?.sqlScenario as
              | SqlQueryScenario
              | undefined;
            const codeScenario = question.metadata?.codeScenario as
              | PlaywrightCodeScenario
              | undefined;

            return (
              <div
                key={question.id}
                className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-6"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  Pregunta {question.order_index} · {question.points} pts
                </p>
                <h2 className="mt-3 text-xl font-semibold">
                  {question.prompt}
                </h2>
                {question.description ? (
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    {question.description}
                  </p>
                ) : null}

                {scenario?.request && scenario?.response ? (
                  <div className="mt-5">
                    <RequestResponseBlock
                      scenario={{
                        title: scenario.title,
                        request: scenario.request,
                        response: scenario.response,
                        documentationNote: scenario.documentationNote,
                      }}
                    />
                  </div>
                ) : null}

                {sqlScenario ? (
                  <div className="mt-5">
                    <SqlScenarioBlock scenario={sqlScenario} />
                  </div>
                ) : null}

                {codeScenario ? (
                  <div className="mt-5">
                    <PlaywrightCodeBlock scenario={codeScenario} />
                  </div>
                ) : null}

                <div className="mt-5">
                  {question.question_type === 'multiple_choice' ||
                  (question.question_type === 'doc_analysis' &&
                    question.options &&
                    question.options.length > 0) ? (
                    <MultipleChoiceQuestion
                      question={question}
                      value={String(
                        (answer as { value?: string } | undefined)?.value ?? ''
                      )}
                      onChange={(value) => updateAnswer(question.id, { value })}
                    />
                  ) : null}

                  {question.question_type === 'multiple_select' ? (
                    <MultipleSelectQuestion
                      question={question}
                      value={
                        (answer as { values?: string[] } | undefined)?.values ??
                        []
                      }
                      onChange={(values) =>
                        updateAnswer(question.id, { values })
                      }
                    />
                  ) : null}

                  {question.question_type === 'true_false' ? (
                    <TrueFalseQuestion
                      question={question}
                      value={Boolean(
                        (answer as { value?: boolean } | undefined)?.value ??
                          false
                      )}
                      onChange={(value) => updateAnswer(question.id, { value })}
                    />
                  ) : null}

                  {question.question_type === 'short_text' ||
                  (question.question_type === 'doc_analysis' &&
                    (!question.options || question.options.length === 0)) ||
                  question.question_type === 'response_analysis' ? (
                    <ShortAnswerQuestion
                      question={question}
                      value={
                        question.question_type === 'response_analysis'
                          ? String(
                              (answer as { reason?: string } | undefined)
                                ?.reason ?? ''
                            )
                          : String(
                              (answer as { value?: string } | undefined)
                                ?.value ?? ''
                            )
                      }
                      label={
                        question.question_type === 'response_analysis'
                          ? 'Justificá tu decisión'
                          : 'Tu respuesta'
                      }
                      extraControl={
                        question.question_type === 'response_analysis' ? (
                          <div className="mb-4 flex flex-wrap gap-3">
                            <button
                              type="button"
                              onClick={() =>
                                updateAnswer(question.id, {
                                  ...(answer as Record<string, unknown>),
                                  verdict: 'correct',
                                  reason: String(
                                    (answer as { reason?: string } | undefined)
                                      ?.reason ?? ''
                                  ),
                                })
                              }
                              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                                (answer as { verdict?: string } | undefined)
                                  ?.verdict === 'correct'
                                  ? 'bg-emerald-400 text-slate-950'
                                  : 'border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                              }`}
                            >
                              Respuesta correcta
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                updateAnswer(question.id, {
                                  ...(answer as Record<string, unknown>),
                                  verdict: 'bug',
                                  reason: String(
                                    (answer as { reason?: string } | undefined)
                                      ?.reason ?? ''
                                  ),
                                })
                              }
                              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                                (answer as { verdict?: string } | undefined)
                                  ?.verdict === 'bug'
                                  ? 'bg-amber-300 text-slate-950'
                                  : 'border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                              }`}
                            >
                              Hay bug
                            </button>
                          </div>
                        ) : null
                      }
                      onChange={(value) =>
                        updateAnswer(
                          question.id,
                          question.question_type === 'response_analysis'
                            ? {
                                verdict:
                                  (answer as { verdict?: string } | undefined)
                                    ?.verdict ?? '',
                                reason: value,
                              }
                            : { value }
                        )
                      }
                    />
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>

        {sectionScore ? (
          <div className="mt-8">
            <SectionSummaryCard
              title={payload.section.title}
              score={sectionScore.score}
              maxScore={sectionScore.max_score}
              feedback={sectionScore.feedback ?? ''}
            />
          </div>
        ) : null}

        {submitError ? (
          <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {submitError}
          </div>
        ) : null}

        <div className="mt-8">
          <SectionNavigator
            currentIndex={currentIndex}
            total={payload.sections.length}
            previousHref={
              previousSection
                ? `${basePath}/section/${previousSection.slug}?attempt=${attemptId}`
                : `${basePath}/start`
            }
            submitLabel={
              currentIndex === payload.sections.length
                ? 'Finalizar assessment'
                : 'Enviar nivel y continuar'
            }
            isSubmitting={isSubmitting}
            onSubmit={() => setShowSubmitDialog(true)}
          />
        </div>
      </div>

      <SubmitSectionDialog
        open={showSubmitDialog}
        unansweredCount={unansweredCount}
        totalQuestions={payload.questions.length}
        isLastSection={currentIndex === payload.sections.length}
        isSubmitting={isSubmitting}
        onConfirm={() => void handleSubmitSection()}
        onCancel={() => setShowSubmitDialog(false)}
      />
    </div>
  );
}
