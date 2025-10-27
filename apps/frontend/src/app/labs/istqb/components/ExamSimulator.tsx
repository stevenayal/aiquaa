'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Progress } from '@/components/ui/progress';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Flag,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
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
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<number, string[]>>(new Map());
  const [markedForReview, setMarkedForReview] = useState<Set<number>>(
    new Set(),
  );
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
  }, [isRunning, mode]);

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
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold">
              AIQUAA | Simulacro CTFL v4.0
            </h1>
            <p className="text-muted-foreground">
              Participante: {participantName}
            </p>
          </div>

          {mode === 'exam' && (
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <Clock
                  className={`h-5 w-5 ${timeRemaining < 300 ? 'text-destructive' : 'text-primary'}`}
                />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Tiempo Restante
                  </p>
                  <p
                    className={`text-2xl font-bold ${timeRemaining < 300 ? 'text-destructive' : ''}`}
                  >
                    {formatTime(timeRemaining)}
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>
              Pregunta {currentQuestionIndex + 1} de {questions.length}
            </span>
            <span>
              Respondidas: {answeredCount} | Sin Responder: {unansweredCount}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {mode === 'exam' && timeRemaining < 300 && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              ¡Atención! Quedan menos de 5 minutos para finalizar el examen.
            </AlertDescription>
          </Alert>
        )}
      </div>

      <QuestionCard
        question={currentQuestion}
        selectedAnswers={answers.get(currentQuestion.id) || []}
        onAnswerChange={handleAnswerChange}
        isMarked={isMarked}
        mode={mode}
        showFeedback={mode === 'training'}
      />

      <Card className="mt-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <Button
              variant="outline"
              onClick={goToPreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className="w-full md:w-auto"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>

            <div className="flex gap-2 w-full md:w-auto">
              <Button
                variant={isMarked ? 'default' : 'outline'}
                onClick={toggleMarkForReview}
                className="flex-1 md:flex-none"
              >
                <Flag className="h-4 w-4 mr-2" />
                {isMarked ? 'Desmarca' : 'Marcar para Revisar'}
              </Button>

              {isLastQuestion && (
                <Button
                  variant="default"
                  onClick={() => handleSubmitExam(false)}
                  className="flex-1 md:flex-none"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Enviar Examen
                </Button>
              )}
            </div>

            <Button
              variant="outline"
              onClick={goToNextQuestion}
              disabled={isLastQuestion}
              className="w-full md:w-auto"
            >
              Siguiente
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          {!isLastQuestion && (
            <div className="mt-4 text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSubmitExam(false)}
              >
                Enviar examen antes de tiempo
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Enviar Examen?</AlertDialogTitle>
            <AlertDialogDescription>
              Está a punto de enviar su examen. Una vez enviado, no podrá
              realizar cambios.
              <br />
              <br />
              <strong>Resumen:</strong>
              <ul className="mt-2 space-y-1">
                <li>• Preguntas respondidas: {answeredCount}</li>
                <li>• Preguntas sin responder: {unansweredCount}</li>
                <li>• Marcadas para revisar: {markedForReview.size}</li>
              </ul>
              {unansweredCount > 0 && (
                <p className="mt-4 text-destructive font-semibold">
                  Tiene {unansweredCount} pregunta(s) sin responder.
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSubmit}>
              Confirmar Envío
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
