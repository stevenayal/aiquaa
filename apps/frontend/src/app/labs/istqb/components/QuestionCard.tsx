'use client';

import { useTheme } from '@/contexts/ThemeContext';
import type { ExamQuestion } from '../types';
import { checkAnswer } from '../utils';

interface QuestionCardProps {
  question: ExamQuestion;
  selectedAnswers: string[];
  onAnswerChange: (_questionId: number, _selectedAnswers: string[]) => void;
  isMarked: boolean;
  showFeedback: boolean;
}

export default function QuestionCard({
  question,
  selectedAnswers,
  onAnswerChange,
  isMarked,
  showFeedback,
}: QuestionCardProps) {
  const { isDarkMode } = useTheme();
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
      return `${baseClass} ${isDarkMode ? 'border-slate-600 hover:border-amber-500' : 'border-gray-300 hover:border-amber-500'}`;
    }

    switch (feedback) {
      case 'correct-selected':
        return `${baseClass} border-green-500 ${isDarkMode ? 'bg-green-900/30' : 'bg-green-50'}`;
      case 'incorrect-selected':
        return `${baseClass} border-red-500 ${isDarkMode ? 'bg-red-900/30' : 'bg-red-50'}`;
      case 'correct-not-selected':
        return `${baseClass} border-green-500 ${isDarkMode ? 'bg-green-900/20' : 'bg-green-50'} opacity-60`;
      default:
        return `${baseClass} ${isDarkMode ? 'border-slate-600' : 'border-gray-300'}`;
    }
  };

  return (
    <div className={`rounded-lg shadow-lg ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-start">
          <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Pregunta {question.id}
            {isMarked && (
              <span className="ml-2 text-sm text-amber-600">(Marcada)</span>
            )}
          </h2>
          <div className="flex gap-2 text-sm">
            <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 rounded">
              {question.kLevel}
            </span>
            <span className={`px-2 py-1 rounded ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-gray-200 text-gray-700'}`}>
              {question.learningObjective}
            </span>
          </div>
        </div>
      </div>
      <div className="p-6 space-y-6">
        <div>
          <p className={`text-base mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{question.questionText}</p>
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'} border`}>
            <div className="flex items-center gap-2">
              <span className="text-blue-600 dark:text-blue-400">ℹ️</span>
              <p className={`font-semibold ${isDarkMode ? 'text-blue-300' : 'text-blue-900'}`}>
                {isMultiple
                  ? 'Seleccionar DOS opciones'
                  : 'Seleccionar UNA opción'}
              </p>
            </div>
          </div>
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
                  <input
                    type="checkbox"
                    id={`${question.id}-${option.label}`}
                    checked={isSelected}
                    onChange={(e) => handleMultipleAnswer(option.label, e.target.checked)}
                    disabled={showFeedback && hasAnswered}
                    className="mt-1 h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                  />
                  <div className="flex-1">
                    <label
                      htmlFor={`${question.id}-${option.label}`}
                      className={`cursor-pointer ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                    >
                      <span className="font-semibold">{option.label})</span>{' '}
                      {option.text}
                    </label>
                    {showFeedback && hasAnswered && (
                      <div className="mt-2 text-sm">
                        {feedback === 'correct-selected' && (
                          <div className="flex items-start gap-2 text-green-700 dark:text-green-300">
                            <span className="flex-shrink-0">✓</span>
                            <span>
                              <strong>Correcto:</strong>{' '}
                              {question.explanations[option.label]?.explanation}
                            </span>
                          </div>
                        )}
                        {feedback === 'incorrect-selected' && (
                          <div className="flex items-start gap-2 text-red-700 dark:text-red-300">
                            <span className="flex-shrink-0">✗</span>
                            <span>
                              <strong>Incorrecto:</strong>{' '}
                              {question.explanations[option.label]?.explanation}
                            </span>
                          </div>
                        )}
                        {feedback === 'correct-not-selected' && (
                          <div className="flex items-start gap-2 text-green-700 dark:text-green-300">
                            <span className="flex-shrink-0">ℹ️</span>
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
            question.options.map((option) => {
              const feedback = getOptionFeedback(option.label);
              const isSelected = selectedAnswers.includes(option.label);

              return (
                <div
                  key={option.label}
                  className={getOptionClassName(feedback)}
                >
                  <input
                    type="radio"
                    id={`${question.id}-${option.label}`}
                    name={`question-${question.id}`}
                    value={option.label}
                    checked={isSelected}
                    onChange={() => handleSingleAnswer(option.label)}
                    disabled={showFeedback && hasAnswered}
                    className="mt-1 h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300"
                  />
                  <div className="flex-1">
                    <label
                      htmlFor={`${question.id}-${option.label}`}
                      className={`cursor-pointer ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                    >
                      <span className="font-semibold">{option.label})</span>{' '}
                      {option.text}
                    </label>
                    {showFeedback && hasAnswered && (
                      <div className="mt-2 text-sm">
                        {feedback === 'correct-selected' && (
                          <div className="flex items-start gap-2 text-green-700 dark:text-green-300">
                            <span className="flex-shrink-0">✓</span>
                            <span>
                              <strong>Correcto:</strong>{' '}
                              {question.explanations[option.label]?.explanation}
                            </span>
                          </div>
                        )}
                        {feedback === 'incorrect-selected' && (
                          <div className="flex items-start gap-2 text-red-700 dark:text-red-300">
                            <span className="flex-shrink-0">✗</span>
                            <span>
                              <strong>Incorrecto:</strong>{' '}
                              {question.explanations[option.label]?.explanation}
                            </span>
                          </div>
                        )}
                        {feedback === 'correct-not-selected' && (
                          <div className="flex items-start gap-2 text-green-700 dark:text-green-300">
                            <span className="flex-shrink-0">ℹ️</span>
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
            })
          )}
        </div>

        {showFeedback && hasAnswered && (
          <div className={`p-4 rounded-lg border ${
            isCorrect
              ? isDarkMode
                ? 'bg-green-900/20 border-green-800'
                : 'bg-green-50 border-green-200'
              : isDarkMode
              ? 'bg-red-900/20 border-red-800'
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center gap-2">
              {isCorrect ? (
                <>
                  <span className="text-green-600 dark:text-green-400">✓</span>
                  <strong className={isDarkMode ? 'text-green-300' : 'text-green-900'}>¡Respuesta Correcta!</strong>
                </>
              ) : (
                <>
                  <span className="text-red-600 dark:text-red-400">✗</span>
                  <strong className={isDarkMode ? 'text-red-300' : 'text-red-900'}>
                    Respuesta Incorrecta. La(s) respuesta(s) correcta(s):{' '}
                    {question.correctAnswer.join(', ')}
                  </strong>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
