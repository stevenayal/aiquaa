'use client';

import { useTheme } from '@/contexts/ThemeContext';
import type { ExamQuestion } from '../types';
import { checkAnswer } from '../utils';

interface QuestionCardProps {
  question: ExamQuestion;
  selectedAnswers: string[];
  onAnswerChange: (questionId: number, selectedAnswers: string[]) => void;
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

  // Para preguntas múltiples, solo evaluar cuando se haya seleccionado el número correcto de opciones
  const isSelectionComplete = isMultiple
    ? selectedAnswers.length === question.correctAnswer.length
    : hasAnswered;

  const isCorrect =
    isSelectionComplete && checkAnswer(selectedAnswers, question.correctAnswer);

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
    // Para preguntas múltiples, solo mostrar feedback cuando la selección esté completa
    if (!showFeedback || !isSelectionComplete) return null;

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
      return `${baseClass} ${isDarkMode ? 'border-slate-600 bg-slate-800/50 hover:border-amber-500 hover:bg-slate-700/50' : 'border-gray-300 bg-white hover:border-amber-500 hover:bg-gray-50'}`;
    }

    switch (feedback) {
      case 'correct-selected':
        return `${baseClass} border-green-500 ${isDarkMode ? 'bg-green-900/40 text-green-100' : 'bg-green-50 text-green-900'}`;
      case 'incorrect-selected':
        return `${baseClass} border-red-500 ${isDarkMode ? 'bg-red-900/40 text-red-100' : 'bg-red-50 text-red-900'}`;
      case 'correct-not-selected':
        return `${baseClass} border-green-500 ${isDarkMode ? 'bg-green-900/30 text-green-200' : 'bg-green-50 text-green-800'} opacity-70`;
      default:
        return `${baseClass} ${isDarkMode ? 'border-slate-600 bg-slate-800/50' : 'border-gray-300 bg-white'}`;
    }
  };

  return (
    <div className={`rounded-lg shadow-lg ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
      <div className={`p-6 border-b ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
        <div className="flex justify-between items-start gap-4">
          <h2 className={`text-lg font-bold ${isDarkMode ? 'text-slate-100' : 'text-gray-900'}`}>
            Pregunta {question.id}
            {isMarked && (
              <span className={`ml-2 text-sm font-semibold ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>(Marcada 🚩)</span>
            )}
          </h2>
          <div className="flex gap-2 text-sm flex-shrink-0">
            <span className={`px-3 py-1 rounded-full font-semibold ${isDarkMode ? 'bg-amber-900/40 text-amber-300 border border-amber-700' : 'bg-amber-100 text-amber-800 border border-amber-200'}`}>
              {question.kLevel}
            </span>
            <span className={`px-3 py-1 rounded-full font-medium ${isDarkMode ? 'bg-blue-900/40 text-blue-300 border border-blue-700' : 'bg-blue-100 text-blue-800 border border-blue-200'}`}>
              {question.learningObjective}
            </span>
          </div>
        </div>
      </div>
      <div className="p-6 space-y-6">
        <div>
          <p className={`text-base mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{question.questionText}</p>
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'} border`}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-blue-600 dark:text-blue-400">ℹ️</span>
                <p className={`font-semibold ${isDarkMode ? 'text-blue-300' : 'text-blue-900'}`}>
                  {isMultiple
                    ? 'Seleccionar DOS opciones'
                    : 'Seleccionar UNA opción'}
                </p>
              </div>
              {isMultiple && hasAnswered && !showFeedback && (
                <span className={`text-sm font-medium px-3 py-1 rounded-full ${isSelectionComplete
                    ? isDarkMode ? 'bg-green-900/40 text-green-300 border border-green-700' : 'bg-green-100 text-green-800 border border-green-200'
                    : isDarkMode ? 'bg-amber-900/40 text-amber-300 border border-amber-700' : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}>
                  {selectedAnswers.length} de {question.correctAnswer.length} seleccionadas
                </span>
              )}
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
                    disabled={showFeedback && isSelectionComplete}
                    className={`mt-1 h-5 w-5 text-amber-600 focus:ring-amber-500 rounded transition-colors ${isDarkMode
                        ? 'bg-slate-700 border-slate-500 checked:bg-amber-600 checked:border-amber-600'
                        : 'bg-white border-gray-300'
                      }`}
                  />
                  <div className="flex-1">
                    <label
                      htmlFor={`${question.id}-${option.label}`}
                      className={`cursor-pointer ${isDarkMode ? 'text-slate-100' : 'text-gray-900'}`}
                    >
                      <span className="font-semibold">{option.label})</span>{' '}
                      {option.text}
                    </label>
                    {showFeedback && isSelectionComplete && (
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
                    disabled={showFeedback && isSelectionComplete}
                    className={`mt-1 h-5 w-5 text-amber-600 focus:ring-amber-500 transition-colors ${isDarkMode
                        ? 'bg-slate-700 border-slate-500 checked:bg-amber-600 checked:border-amber-600'
                        : 'bg-white border-gray-300'
                      }`}
                  />
                  <div className="flex-1">
                    <label
                      htmlFor={`${question.id}-${option.label}`}
                      className={`cursor-pointer ${isDarkMode ? 'text-slate-100' : 'text-gray-900'}`}
                    >
                      <span className="font-semibold">{option.label})</span>{' '}
                      {option.text}
                    </label>
                    {showFeedback && isSelectionComplete && (
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

        {showFeedback && isSelectionComplete && (
          <div className={`p-4 rounded-lg border-2 ${isCorrect
              ? isDarkMode
                ? 'bg-green-900/30 border-green-700'
                : 'bg-green-50 border-green-300'
              : isDarkMode
                ? 'bg-red-900/30 border-red-700'
                : 'bg-red-50 border-red-300'
            }`}>
            <div className="flex items-center gap-3">
              {isCorrect ? (
                <>
                  <span className={`text-2xl ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>✓</span>
                  <strong className={`text-base ${isDarkMode ? 'text-green-200' : 'text-green-900'}`}>¡Respuesta Correcta!</strong>
                </>
              ) : (
                <>
                  <span className={`text-2xl ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>✗</span>
                  <div className={isDarkMode ? 'text-red-200' : 'text-red-900'}>
                    <strong className="text-base block mb-1">Respuesta Incorrecta</strong>
                    <span className="text-sm">
                      La(s) respuesta(s) correcta(s): <strong>{question.correctAnswer.join(', ')}</strong>
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
