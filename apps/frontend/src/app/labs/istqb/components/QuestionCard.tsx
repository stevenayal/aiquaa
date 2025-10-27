'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, XCircle, Info } from 'lucide-react';
import type { ExamQuestion } from '../types';
import { checkAnswer } from '../utils';

interface QuestionCardProps {
  question: ExamQuestion;
  selectedAnswers: string[];
  onAnswerChange: (questionId: number, selectedAnswers: string[]) => void;
  isMarked: boolean;
  mode: 'exam' | 'training';
  showFeedback: boolean;
}

export default function QuestionCard({
  question,
  selectedAnswers,
  onAnswerChange,
  isMarked,
  mode,
  showFeedback,
}: QuestionCardProps) {
  const isMultiple = question.type === 'multiple';
  const hasAnswered = selectedAnswers.length > 0;
  const isCorrect =
    hasAnswered && checkAnswer(selectedAnswers, question.correctAnswer);

  const handleSingleAnswer = (value: string) => {
    onAnswerChange(question.id, [value]);
  };

  const handleMultipleAnswer = (label: string, checked: boolean) => {
    const newAnswers = checked
      ? [...selectedAnswers, label]
      : selectedAnswers.filter((a) => a !== label);
    onAnswerChange(question.id, newAnswers);
  };

  const getOptionFeedback = (label: string) => {
    if (!showFeedback || !hasAnswered) return null;

    const isSelected = selectedAnswers.includes(label);
    const isCorrectAnswer = question.correctAnswer.includes(label);

    if (isSelected && isCorrectAnswer) {
      return 'correct-selected';
    } else if (isSelected && !isCorrectAnswer) {
      return 'incorrect-selected';
    } else if (!isSelected && isCorrectAnswer) {
      return 'correct-not-selected';
    }
    return null;
  };

  const getOptionClassName = (feedback: string | null) => {
    const baseClass = 'flex items-start space-x-3 p-4 rounded-lg border-2 transition-colors';

    if (!feedback) {
      return `${baseClass} border-border hover:border-primary`;
    }

    switch (feedback) {
      case 'correct-selected':
        return `${baseClass} border-green-500 bg-green-50 dark:bg-green-950`;
      case 'incorrect-selected':
        return `${baseClass} border-destructive bg-red-50 dark:bg-red-950`;
      case 'correct-not-selected':
        return `${baseClass} border-green-500 bg-green-50 dark:bg-green-950 opacity-60`;
      default:
        return `${baseClass} border-border`;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">
            Pregunta {question.id}
            {isMarked && (
              <span className="ml-2 text-sm text-primary">(Marcada)</span>
            )}
          </CardTitle>
          <div className="flex gap-2 text-sm">
            <span className="px-2 py-1 bg-primary/10 rounded">
              {question.kLevel}
            </span>
            <span className="px-2 py-1 bg-secondary rounded">
              {question.learningObjective}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <p className="text-base mb-4">{question.questionText}</p>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>
                {isMultiple
                  ? 'Seleccionar DOS opciones'
                  : 'Seleccionar UNA opción'}
              </strong>
            </AlertDescription>
          </Alert>
        </div>

        <div className="space-y-3">
          {isMultiple ? (
            question.options.map((option) => {
              const feedback = getOptionFeedback(option.label);
              const isSelected = selectedAnswers.includes(option.label);

              return (
                <div
                  key={option.label}
                  className={getOptionClassName(feedback)}
                >
                  <Checkbox
                    id={`${question.id}-${option.label}`}
                    checked={isSelected}
                    onCheckedChange={(checked) =>
                      handleMultipleAnswer(option.label, checked === true)
                    }
                    disabled={showFeedback && hasAnswered}
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor={`${question.id}-${option.label}`}
                      className="cursor-pointer"
                    >
                      <span className="font-semibold">{option.label})</span>{' '}
                      {option.text}
                    </Label>
                    {showFeedback && hasAnswered && (
                      <div className="mt-2 text-sm">
                        {feedback === 'correct-selected' && (
                          <div className="flex items-start gap-2 text-green-700 dark:text-green-300">
                            <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <span>
                              <strong>Correcto:</strong>{' '}
                              {question.explanations[option.label]?.explanation}
                            </span>
                          </div>
                        )}
                        {feedback === 'incorrect-selected' && (
                          <div className="flex items-start gap-2 text-red-700 dark:text-red-300">
                            <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <span>
                              <strong>Incorrecto:</strong>{' '}
                              {question.explanations[option.label]?.explanation}
                            </span>
                          </div>
                        )}
                        {feedback === 'correct-not-selected' && (
                          <div className="flex items-start gap-2 text-green-700 dark:text-green-300">
                            <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <span>
                              <strong>Esta era correcta:</strong>{' '}
                              {question.explanations[option.label]?.explanation}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <RadioGroup
              value={selectedAnswers[0] || ''}
              onValueChange={handleSingleAnswer}
            >
              {question.options.map((option) => {
                const feedback = getOptionFeedback(option.label);
                const isSelected = selectedAnswers.includes(option.label);

                return (
                  <div
                    key={option.label}
                    className={getOptionClassName(feedback)}
                  >
                    <RadioGroupItem
                      value={option.label}
                      id={`${question.id}-${option.label}`}
                      disabled={showFeedback && hasAnswered}
                    />
                    <div className="flex-1">
                      <Label
                        htmlFor={`${question.id}-${option.label}`}
                        className="cursor-pointer"
                      >
                        <span className="font-semibold">{option.label})</span>{' '}
                        {option.text}
                      </Label>
                      {showFeedback && hasAnswered && (
                        <div className="mt-2 text-sm">
                          {feedback === 'correct-selected' && (
                            <div className="flex items-start gap-2 text-green-700 dark:text-green-300">
                              <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                              <span>
                                <strong>Correcto:</strong>{' '}
                                {question.explanations[option.label]?.explanation}
                              </span>
                            </div>
                          )}
                          {feedback === 'incorrect-selected' && (
                            <div className="flex items-start gap-2 text-red-700 dark:text-red-300">
                              <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                              <span>
                                <strong>Incorrecto:</strong>{' '}
                                {question.explanations[option.label]?.explanation}
                              </span>
                            </div>
                          )}
                          {feedback === 'correct-not-selected' && (
                            <div className="flex items-start gap-2 text-green-700 dark:text-green-300">
                              <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                              <span>
                                <strong>La respuesta correcta era:</strong>{' '}
                                {question.explanations[option.label]?.explanation}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </RadioGroup>
          )}
        </div>

        {showFeedback && hasAnswered && (
          <Alert variant={isCorrect ? 'default' : 'destructive'}>
            {isCorrect ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            <AlertDescription>
              {isCorrect ? (
                <strong>¡Respuesta Correcta!</strong>
              ) : (
                <strong>
                  Respuesta Incorrecta. La(s) respuesta(s) correcta(s):{' '}
                  {question.correctAnswer.join(', ')}
                </strong>
              )}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
