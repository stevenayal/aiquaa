'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import type { ExamData, ExamQuestion } from '../types';
import { prepareExamQuestions, formatTime, generateExamResult } from '../utils';
import QuestionCard from './QuestionCard';
import ResultsScreen from './ResultsScreen';

interface ExamSimulatorProps {
  participantName: string;
  githubProfile: string;
  examPurpose: 'capacitacion' | 'postulacion' | 'practica' | 'otro';
  companyName?: string;
  mode: 'exam' | 'training';
  examData: ExamData;
  onExamComplete?: (result: ExamResult) => void;
}

export default function ExamSimulator({
  participantName,
  githubProfile,
  examPurpose,
  companyName,
  mode,
  examData,
  onExamComplete,
}: ExamSimulatorProps) {
  const onReset = () => {
    window.location.reload();
  };
  const language = 'es';
  const { isDarkMode } = useTheme();
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<number, string[]>>(new Map());
  const [markedForReview, setMarkedForReview] = useState<Set<number>>(new Set());
  const [timeRemaining, setTimeRemaining] = useState(
    mode === 'exam' ? examData.examInfo.timeLimit * 60 : 0,
  );
  const [isRunning, setIsRunning] = useState(mode === 'exam');
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [startTime] = useState(Date.now());

  const t = {
    es: {
      loading: 'Cargando preguntas...',
      title: 'AIQUAA | Simulacro CTFL v4.0',
      participant: 'Participante',
      timeRemaining: 'Tiempo Restante',
      question: 'Pregunta',
      of: 'de',
      answered: 'Respondidas',
      unanswered: 'Sin Responder',
      warningTitle: '¡Atención!',
      warningMessage: 'Quedan menos de 5 minutos para finalizar el examen.',
      previous: '← Anterior',
      next: 'Siguiente →',
      mark: 'Marcar',
      unmark: 'Desmarcar',
      submit: '✓ Enviar Examen',
      submitEarly: 'Enviar examen antes de tiempo',
      submitDialogTitle: '¿Enviar Examen?',
      submitDialogMessage: 'Está a punto de enviar su examen. Una vez enviado, no podrá realizar cambios.',
      summary: 'Resumen:',
      marked: 'Marcadas para revisar',
      unansweredWarning: (count: number) => `Tiene ${count} pregunta(s) sin responder.`,
      cancel: 'Cancelar',
      confirm: '✓ Confirmar Envío',
    },
    en: {
      loading: 'Loading questions...',
      title: 'AIQUAA | CTFL v4.0 Simulator',
      participant: 'Participant',
      timeRemaining: 'Time Remaining',
      question: 'Question',
      of: 'of',
      answered: 'Answered',
      unanswered: 'Unanswered',
      warningTitle: 'Warning!',
      warningMessage: 'Less than 5 minutes remaining.',
      previous: '← Previous',
      next: 'Next →',
      mark: 'Mark',
      unmark: 'Unmark',
      submit: '✓ Submit Exam',
      submitEarly: 'Submit exam early',
      submitDialogTitle: 'Submit Exam?',
      submitDialogMessage: 'You are about to submit your exam. Once submitted, you cannot make changes.',
      summary: 'Summary:',
      marked: 'Marked for review',
      unansweredWarning: (count: number) => `You have ${count} unanswered question(s).`,
      cancel: 'Cancel',
      confirm: '✓ Confirm Submit',
    },
  };

  const text = t[language as keyof typeof t];

  const handleSubmitExam = useCallback(
    (autoSubmit = false) => {
      if (!autoSubmit) {
        setShowSubmitDialog(true);
        return;
      }

      setIsRunning(false);
      setHasSubmitted(true);
    },
    [],
  );

  const confirmSubmit = useCallback(() => {
    setShowSubmitDialog(false);
    setIsRunning(false);
    setHasSubmitted(true);
  }, []);

  const handleAnswerChange = useCallback(
    (questionId: number, selectedAnswers: string[]) => {
      setAnswers((prev: Map<number, string[]>) => {
        const newAnswers = new Map(prev);
        newAnswers.set(questionId, selectedAnswers);
        return newAnswers;
      });
    },
    [],
  );

  const toggleMarkForReview = useCallback(() => {
    const questionId = questions[currentQuestionIndex]?.id;
    if (!questionId) return;

    setMarkedForReview((prev: Set<number>) => {
      const newMarked = new Set(prev);
      if (newMarked.has(questionId)) {
        newMarked.delete(questionId);
      } else {
        newMarked.add(questionId);
      }
      return newMarked;
    });
  }, [currentQuestionIndex, questions]);

  const goToNextQuestion = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev: number) => prev + 1);
    }
  }, [currentQuestionIndex, questions.length]);

  const goToPreviousQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev: number) => prev - 1);
    }
  }, [currentQuestionIndex]);

  useEffect(() => {
    const preparedQuestions = prepareExamQuestions(
      examData.questions,
      examData.examInfo.totalQuestions,
      true,
    );
    setQuestions(preparedQuestions);
  }, [examData]);

  useEffect(() => {
    if (mode !== 'exam' || !isRunning) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev: number) => {
        if (prev <= 1) {
          handleSubmitExam(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, mode, handleSubmitExam]);

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">{text.loading}</p>
      </div>
    );
  }

  if (hasSubmitted) {
    const timeSpent =
      mode === 'exam'
        ? examData.examInfo.timeLimit * 60 - timeRemaining
        : Math.floor((Date.now() - startTime) / 1000);

    const result = generateExamResult(
      participantName,
      githubProfile,
      examPurpose,
      companyName,
      questions,
      answers,
      timeSpent,
      examData.examInfo.passingScore,
    );

    onExamComplete?.(result);

    return (
      <ResultsScreen
        result={result}
        onReset={onReset}
        mode={mode}
        language={language}
        startTime={new Date(startTime)}
        endTime={new Date()}
      />
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = answers.size;
  const progress = (answeredCount / questions.length) * 100;
  const unansweredCount = questions.length - answeredCount;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const isMarked = markedForReview.has(currentQuestion.id);

  return (
    <div className={`min-h-screen py-8 transition-colors ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <div>
              <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {text.title}
              </h1>
              <p className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>
                {text.participant}: {participantName}
              </p>
            </div>

            {mode === 'exam' && (
              <div className={`p-4 rounded-lg shadow-lg border-2 ${timeRemaining < 300
                ? isDarkMode
                  ? 'bg-red-900/30 border-red-700'
                  : 'bg-red-50 border-red-300'
                : isDarkMode
                  ? 'bg-slate-800 border-slate-700'
                  : 'bg-white border-gray-200'
                }`}>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">⏱️</span>
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                      {text.timeRemaining}
                    </p>
                    <p className={`text-2xl font-bold ${timeRemaining < 300
                      ? isDarkMode ? 'text-red-300' : 'text-red-700'
                      : isDarkMode ? 'text-slate-100' : 'text-gray-900'
                      }`}>
                      {formatTime(timeRemaining)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className={`flex justify-between text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
              <span>
                📝 {text.question} {currentQuestionIndex + 1} {text.of} {questions.length}
              </span>
              <span>
                ✓ {text.answered}: <strong>{answeredCount}</strong> | ⏳ {text.unanswered}: <strong>{unansweredCount}</strong>
              </span>
            </div>
            <div className={`w-full rounded-full h-3 shadow-inner ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}`}>
              <div
                className={`h-3 rounded-full transition-all duration-300 ${progress === 100
                  ? isDarkMode ? 'bg-green-500' : 'bg-green-600'
                  : isDarkMode ? 'bg-amber-500' : 'bg-amber-600'
                  }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {mode === 'exam' && timeRemaining < 300 && (
            <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <span className="text-red-600 dark:text-red-400">⚠️</span>
                <p className="text-red-800 dark:text-red-200">
                  {text.warningTitle} {text.warningMessage}
                </p>
              </div>
            </div>
          )}
        </div>

        <QuestionCard
          question={currentQuestion}
          selectedAnswers={answers.get(currentQuestion.id) || []}
          onAnswerChange={handleAnswerChange}
          isMarked={isMarked}
          showFeedback={mode === 'training'}
          language={language}
        />

        <div className={`mt-6 rounded-lg shadow-lg border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
          <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <button
                onClick={goToPreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className={`px-5 py-3 rounded-lg font-semibold transition-all w-full md:w-auto ${currentQuestionIndex === 0
                  ? isDarkMode
                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed border-2 border-slate-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed border-2 border-gray-200'
                  : isDarkMode
                    ? 'bg-slate-700 hover:bg-slate-600 text-slate-100 border-2 border-slate-600 hover:border-slate-500'
                    : 'bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-300 hover:border-gray-400'
                  }`}
              >
                {text.previous}
              </button>

              <div className="flex gap-3 w-full md:w-auto">
                <button
                  onClick={toggleMarkForReview}
                  className={`px-5 py-3 rounded-lg font-semibold transition-all flex-1 md:flex-none ${isMarked
                    ? 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white shadow-lg'
                    : isDarkMode
                      ? 'bg-slate-700 hover:bg-slate-600 text-slate-100 border-2 border-slate-600'
                      : 'bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-300'
                    }`}
                >
                  🚩 {isMarked ? text.unmark : text.mark}
                </button>

                {isLastQuestion && (
                  <button
                    onClick={() => handleSubmitExam(false)}
                    className="px-5 py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white rounded-lg font-semibold transition-all flex-1 md:flex-none shadow-lg hover:shadow-xl"
                  >
                    {text.submit}
                  </button>
                )}
              </div>

              <button
                onClick={goToNextQuestion}
                disabled={isLastQuestion}
                className={`px-5 py-3 rounded-lg font-semibold transition-all w-full md:w-auto ${isLastQuestion
                  ? isDarkMode
                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed border-2 border-slate-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed border-2 border-gray-200'
                  : isDarkMode
                    ? 'bg-slate-700 hover:bg-slate-600 text-slate-100 border-2 border-slate-600 hover:border-slate-500'
                    : 'bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-300 hover:border-gray-400'
                  }`}
              >
                {text.next}
              </button>
            </div>

            {!isLastQuestion && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => handleSubmitExam(false)}
                  className={`text-sm font-medium underline decoration-dotted ${isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  {text.submitEarly}
                </button>
              </div>
            )}
          </div>
        </div>

        {showSubmitDialog && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className={`rounded-xl shadow-2xl max-w-md w-full border-2 ${isDarkMode
              ? 'bg-slate-800 border-slate-700'
              : 'bg-white border-gray-200'
              }`}>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">📤</span>
                  <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-slate-100' : 'text-gray-900'}`}>
                    {text.submitDialogTitle}
                  </h2>
                </div>
                <p className={`mb-4 text-base ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                  {text.submitDialogMessage}
                </p>
                <div className={`mb-6 p-4 rounded-lg border ${isDarkMode
                  ? 'bg-slate-700/50 border-slate-600'
                  : 'bg-gray-50 border-gray-200'
                  }`}>
                  <p className={`font-semibold mb-3 ${isDarkMode ? 'text-slate-200' : 'text-gray-900'}`}>{text.summary}</p>
                  <ul className={`space-y-2 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      {text.answered}: <strong>{answeredCount}</strong>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-gray-500">○</span>
                      {text.unanswered}: <strong>{unansweredCount}</strong>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-amber-500">🚩</span>
                      {text.marked}: <strong>{markedForReview.size}</strong>
                    </li>
                  </ul>
                  {unansweredCount > 0 && (
                    <div className={`mt-4 p-3 rounded-lg border-2 ${isDarkMode
                      ? 'bg-red-900/30 border-red-700 text-red-300'
                      : 'bg-red-50 border-red-300 text-red-800'
                      }`}>
                      <p className="font-semibold flex items-center gap-2">
                        <span>⚠️</span>
                        {text.unansweredWarning(unansweredCount)}
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowSubmitDialog(false)}
                    className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${isDarkMode
                      ? 'bg-slate-700 hover:bg-slate-600 text-slate-200 border-2 border-slate-600'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-800 border-2 border-gray-300'
                      }`}
                  >
                    {text.cancel}
                  </button>
                  <button
                    onClick={confirmSubmit}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl"
                  >
                    {text.confirm}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
