'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import type { ExamData, ExamQuestion } from '../types';
import { prepareExamQuestions, formatTime, generateExamResult } from '../utils';
import QuestionCard from './QuestionCard';
import ResultsScreen from './ResultsScreen';

interface ExamSimulatorProps {
  participantName: string;
  mode: 'exam' | 'training';
  examData: ExamData;
  onReset: () => void;
}

export default function ExamSimulator({
  participantName,
  mode,
  examData,
  onReset,
}: ExamSimulatorProps) {
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
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleSubmitExam(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, mode, handleSubmitExam]);

  const handleAnswerChange = useCallback(
    (questionId: number, selectedAnswers: string[]) => {
      setAnswers((prev) => {
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

    setMarkedForReview((prev) => {
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
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  }, [currentQuestionIndex, questions.length]);

  const goToPreviousQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  }, [currentQuestionIndex]);

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

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Cargando preguntas...</p>
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
      questions,
      answers,
      timeSpent,
      examData.examInfo.passingScore,
    );

    return <ResultsScreen result={result} onReset={onReset} mode={mode} />;
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
                AIQUAA | Simulacro CTFL v4.0
              </h1>
              <p className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>
                Participante: {participantName}
              </p>
            </div>

            {mode === 'exam' && (
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-white'} shadow`}>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⏱️</span>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Tiempo Restante
                    </p>
                    <p className={`text-2xl font-bold ${timeRemaining < 300 ? 'text-red-600' : isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatTime(timeRemaining)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className={`flex justify-between text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
              <span>
                Pregunta {currentQuestionIndex + 1} de {questions.length}
              </span>
              <span>
                Respondidas: {answeredCount} | Sin Responder: {unansweredCount}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-amber-600 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {mode === 'exam' && timeRemaining < 300 && (
            <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <span className="text-red-600 dark:text-red-400">⚠️</span>
                <p className="text-red-800 dark:text-red-200">
                  ¡Atención! Quedan menos de 5 minutos para finalizar el examen.
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
        />

        <div className={`mt-6 rounded-lg shadow ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
          <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <button
                onClick={goToPreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className={`px-4 py-2 rounded-lg font-medium transition-colors w-full md:w-auto ${
                  currentQuestionIndex === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : isDarkMode
                    ? 'bg-slate-700 hover:bg-slate-600 text-white border border-slate-600'
                    : 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-300'
                }`}
              >
                ← Anterior
              </button>

              <div className="flex gap-2 w-full md:w-auto">
                <button
                  onClick={toggleMarkForReview}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex-1 md:flex-none ${
                    isMarked
                      ? 'bg-amber-600 hover:bg-amber-700 text-white'
                      : isDarkMode
                      ? 'bg-slate-700 hover:bg-slate-600 text-white border border-slate-600'
                      : 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-300'
                  }`}
                >
                  🚩 {isMarked ? 'Desmarcar' : 'Marcar para Revisar'}
                </button>

                {isLastQuestion && (
                  <button
                    onClick={() => handleSubmitExam(false)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex-1 md:flex-none"
                  >
                    ✓ Enviar Examen
                  </button>
                )}
              </div>

              <button
                onClick={goToNextQuestion}
                disabled={isLastQuestion}
                className={`px-4 py-2 rounded-lg font-medium transition-colors w-full md:w-auto ${
                  isLastQuestion
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : isDarkMode
                    ? 'bg-slate-700 hover:bg-slate-600 text-white border border-slate-600'
                    : 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-300'
                }`}
              >
                Siguiente →
              </button>
            </div>

            {!isLastQuestion && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => handleSubmitExam(false)}
                  className={`text-sm ${isDarkMode ? 'text-slate-400 hover:text-slate-300' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  Enviar examen antes de tiempo
                </button>
              </div>
            )}
          </div>
        </div>

        {showSubmitDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`rounded-lg shadow-xl max-w-md w-full ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
              <div className="p-6">
                <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  ¿Enviar Examen?
                </h2>
                <p className={`mb-4 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                  Está a punto de enviar su examen. Una vez enviado, no podrá realizar cambios.
                </p>
                <div className={`mb-4 p-4 rounded-lg ${isDarkMode ? 'bg-slate-700' : 'bg-gray-50'}`}>
                  <p className="font-semibold mb-2">Resumen:</p>
                  <ul className="space-y-1 text-sm">
                    <li>• Preguntas respondidas: {answeredCount}</li>
                    <li>• Preguntas sin responder: {unansweredCount}</li>
                    <li>• Marcadas para revisar: {markedForReview.size}</li>
                  </ul>
                  {unansweredCount > 0 && (
                    <p className="mt-3 text-red-600 dark:text-red-400 font-semibold">
                      Tiene {unansweredCount} pregunta(s) sin responder.
                    </p>
                  )}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowSubmitDialog(false)}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                      isDarkMode
                        ? 'bg-slate-700 hover:bg-slate-600 text-white'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                    }`}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmSubmit}
                    className="flex-1 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Confirmar Envío
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
