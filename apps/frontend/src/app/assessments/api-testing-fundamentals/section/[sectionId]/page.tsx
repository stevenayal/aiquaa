'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import {
  finalizeAssessmentAttemptAction,
  getAssessmentSectionAction,
  saveAssessmentAnswerAction,
  submitAssessmentSectionAction,
} from '@/actions/assessments';
import ApiDocCard from '../../components/ApiDocCard';
import AssessmentProgress from '../../components/AssessmentProgress';
import AssessmentTimer from '../../components/AssessmentTimer';
import BugReportForm from '../../components/BugReportForm';
import MultipleChoiceQuestion from '../../components/MultipleChoiceQuestion';
import RequestResponseBlock from '../../components/RequestResponseBlock';
import SectionNavigator from '../../components/SectionNavigator';
import SectionSummaryCard from '../../components/SectionSummaryCard';
import ShortAnswerQuestion from '../../components/ShortAnswerQuestion';
import TestCaseForm from '../../components/TestCaseForm';
import TrueFalseQuestion from '../../components/TrueFalseQuestion';
import type {
  ApiDocScenario,
  AssessmentQuestion,
  AssessmentSectionPayload,
  BugReportDraft,
  TestCaseDraft,
} from '../../types';

type AnswerMap = Record<string, unknown>;

function emptyBugReport(question: AssessmentQuestion): BugReportDraft {
  return {
    title: '',
    endpoint: String(question.metadata?.endpoint ?? ''),
    method: String(question.metadata?.method ?? ''),
    description: '',
    stepsToReproduce: '',
    actualResult: '',
    expectedResult: '',
    severity: 'Media',
    priority: 'Media',
    evidence: '',
    environment: 'QA / Staging',
  };
}

export default function AssessmentSectionPage() {
  const params = useParams<{ sectionId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const attemptId = searchParams.get('attempt');
  const sectionSlug = params.sectionId;
  const [payload, setPayload] = useState<AssessmentSectionPayload | null>(null);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [loading, setLoading] = useState(true);
  const [savingMessage, setSavingMessage] = useState('Autosave activo');
  const [error, setError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isPending, startTransition] = useTransition();
  const saveTimers = useRef<Record<string, number>>({});

  useEffect(() => {
    if (!attemptId) {
      router.push('/assessments/api-testing-fundamentals/start');
      return;
    }

    let cancelled = false;

    async function loadSection() {
      if (!attemptId) return;
      try {
        setLoading(true);
        const data = await getAssessmentSectionAction(attemptId, sectionSlug);
        if (cancelled) return;
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
      Object.values(saveTimers.current).forEach((timer) =>
        window.clearTimeout(timer)
      );
    };
  }, [attemptId, router, sectionSlug]);

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

  async function handleSubmitSection(expired?: boolean) {
    if (!attemptId || !payload) return;

    setSubmitError('');
    startTransition(async () => {
      try {
        const { nextSectionSlug } = await submitAssessmentSectionAction({
          attemptId,
          sectionSlug: payload.section.slug,
        });

        if (nextSectionSlug) {
          router.push(
            `/assessments/api-testing-fundamentals/section/${nextSectionSlug}?attempt=${attemptId}`
          );
          return;
        }

        await finalizeAssessmentAttemptAction(attemptId);
        router.push(
          `/assessments/api-testing-fundamentals/result?attempt=${attemptId}${
            expired ? '&expired=1' : ''
          }`
        );
      } catch (submitSectionError) {
        setSubmitError(
          submitSectionError instanceof Error
            ? submitSectionError.message
            : 'No se pudo enviar la sección.'
        );
      }
    });
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
  const sectionScore = payload.scores.find(
    (score) => score.section_id === payload.section.id
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
            <p className="mt-3 text-sm text-slate-400">{savingMessage}</p>
          </div>
          <AssessmentTimer
            startedAt={payload.attempt.started_at}
            durationMinutes={payload.attempt.max_score > 0 ? 90 : 90}
            onExpire={() => void handleSubmitSection(true)}
          />
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

        {payload.section.slug === 'level-2-doc-interpretation' &&
        payload.section.metadata?.apiDoc ? (
          <div className="mt-6">
            <ApiDocCard
              scenario={payload.section.metadata.apiDoc as ApiDocScenario}
            />
          </div>
        ) : null}

        <div className="mt-8 space-y-6">
          {payload.questions.map((question) => {
            const answer = answers[question.id];
            const scenario = question.metadata?.scenario as
              | {
                  title: string;
                  request: {
                    method: string;
                    endpoint: string;
                    headers?: string[];
                    body?: Record<string, unknown>;
                  };
                  response: {
                    status: number;
                    body?: Record<string, unknown>;
                  };
                  documentationNote?: string;
                }
              | undefined;

            return (
              <div
                key={question.id}
                className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Pregunta {question.order_index} · {question.points} pts
                </p>
                <h2 className="mt-3 text-xl font-semibold">
                  {question.prompt}
                </h2>
                {question.description ? (
                  <p className="mt-2 text-sm text-slate-400">
                    {question.description}
                  </p>
                ) : null}

                {scenario ? (
                  <div className="mt-5">
                    <RequestResponseBlock scenario={scenario} />
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
                                  : 'border border-slate-700 text-slate-200 hover:bg-slate-800'
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
                                  : 'border border-slate-700 text-slate-200 hover:bg-slate-800'
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

                  {question.question_type === 'test_case_matrix' ? (
                    <TestCaseForm
                      question={question}
                      value={(answer as TestCaseDraft[] | undefined) ?? []}
                      onChange={(value) => updateAnswer(question.id, value)}
                    />
                  ) : null}

                  {question.question_type === 'bug_report' ? (
                    <BugReportForm
                      question={question}
                      value={
                        (answer as BugReportDraft | undefined) ??
                        emptyBugReport(question)
                      }
                      onChange={(value) => updateAnswer(question.id, value)}
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
                ? `/assessments/api-testing-fundamentals/section/${previousSection.slug}?attempt=${attemptId}`
                : '/assessments/api-testing-fundamentals/start'
            }
            submitLabel={
              currentIndex === payload.sections.length
                ? 'Finalizar assessment'
                : 'Enviar nivel y continuar'
            }
            isSubmitting={isPending}
            onSubmit={() => void handleSubmitSection(false)}
          />
        </div>
      </div>
    </div>
  );
}
