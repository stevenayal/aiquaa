'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Alert } from '@/components/common';
import ExamSimulator from './components/ExamSimulator';
import { loadExamData } from './utils';
import { SuruFloating } from '@/components/Suru';
import ExamAuthGate from '@/components/labs/ExamAuthGate';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { saveExamResultAction } from '@/actions/exams';
import type { ExamResult } from './types';

export default function ISTQBSimulatorPage() {
  const { isDarkMode } = useTheme();
  const { user } = useSupabaseAuth();
  const [participantName, setParticipantName] = useState('');
  const [examMode, setExamMode] = useState<'exam' | 'training' | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [error, setError] = useState('');
  const [language, setLanguage] = useState<'es' | 'en'>('es');
  const [model, setModel] = useState<'A' | 'B' | 'C'>('A');

  useEffect(() => {
    if (user?.user_metadata?.full_name && !participantName) {
      setParticipantName(user.user_metadata.full_name);
    }
  }, [user]);

  const handleExamComplete = async (result: ExamResult) => {
    await saveExamResultAction({
      exam_type: 'istqb',
      exam_mode: examMode as 'exam' | 'training',
      score: result.score,
      total_questions: result.totalQuestions,
      correct_answers: result.correctAnswers,
      incorrect_answers: result.incorrectAnswers,
      passing_score: 26,
      passed: result.passed,
      percentage: result.percentage,
      time_spent: result.timeSpent,
      model,
      language,
      learning_objectives: result.learningObjectiveAnalysis,
    });
  };

  const t = {
    es: {
      title: 'AIQUAA | Simulacro CTFL v4.0',
      subtitle: 'Certified Tester Foundation Level - Versión 4.0',
      configTitle: 'Configuración del Examen',
      languageLabel: 'Idioma / Language',
      modelLabel: 'Modelo de Examen',
      model: 'Modelo',
      totalQuestions: 'Total de Preguntas',
      timeLimit: 'Tiempo Límite',
      minutes: 'minutos',
      pointsPerQuestion: 'Puntos por Pregunta',
      passingScore: 'Puntaje Mínimo',
      rulesTitle: 'Reglas del Examen:',
      rules: [
        '40 preguntas seleccionadas aleatoriamente de un banco de preguntas',
        'Cada pregunta vale 1 punto, sin penalización por respuestas incorrectas',
        'Puntaje de aprobación: ≥ 26/40 (65%)',
        'Preguntas de selección única y múltiple (se indica en cada pregunta)',
        'Para preguntas de múltiple selección, todas las respuestas deben ser correctas',
        'Tiempo límite de 60 minutos con envío automático al terminar el tiempo',
        'Puede navegar entre preguntas y marcar para revisar',
      ],
      participantDataTitle: 'Datos del Participante',
      participantDataSubtitle: 'Complete la información antes de iniciar el simulacro',
      nameLabel: 'Nombre Completo *',
      namePlaceholder: 'Ej: Juan Pérez González',
      enterNameError: 'Por favor, ingrese su nombre completo',
      selectModeTitle: 'Seleccione el Modo:',
      examModeTitle: 'Modo Examen',
      examModeSubtitle: 'Simula el examen real sin feedback inmediato',
      examModeFeatures: [
        '• Timer de 60 minutos',
        '• 40 preguntas aleatorias',
        '• Sin retroalimentación durante el examen',
        '• Informe completo al finalizar',
      ],
      startExam: 'Iniciar Modo Examen',
      trainingModeTitle: 'Modo Entrenamiento',
      trainingModeSubtitle: 'Practica con feedback inmediato en cada pregunta',
      trainingModeFeatures: [
        '• Sin límite de tiempo',
        '• 40 preguntas aleatorias',
        '• Retroalimentación inmediata',
        '• Explicaciones detalladas',
      ],
      startTraining: 'Iniciar Modo Entrenamiento',
    },
    en: {
      title: 'AIQUAA | CTFL v4.0 Simulator',
      subtitle: 'Certified Tester Foundation Level - Version 4.0',
      configTitle: 'Exam Configuration',
      languageLabel: 'Language / Idioma',
      modelLabel: 'Exam Model',
      model: 'Model',
      totalQuestions: 'Total Questions',
      timeLimit: 'Time Limit',
      minutes: 'minutes',
      pointsPerQuestion: 'Points per Question',
      passingScore: 'Passing Score',
      rulesTitle: 'Exam Rules:',
      rules: [
        '40 questions randomly selected from a question bank',
        'Each question is worth 1 point, no penalty for incorrect answers',
        'Passing score: ≥ 26/40 (65%)',
        'Single and multiple choice questions (indicated on each question)',
        'For multiple choice questions, all answers must be correct',
        '60-minute time limit with automatic submission when time expires',
        'You can navigate between questions and mark for review',
      ],
      participantDataTitle: 'Participant Details',
      participantDataSubtitle: 'Complete the information before starting the simulation',
      nameLabel: 'Full Name *',
      namePlaceholder: 'Ex: John Doe',
      enterNameError: 'Please enter your full name',
      selectModeTitle: 'Select Mode:',
      examModeTitle: 'Exam Mode',
      examModeSubtitle: 'Simulates the real exam without immediate feedback',
      examModeFeatures: [
        '• 60-minute timer',
        '• 40 random questions',
        '• No feedback during the exam',
        '• Full report upon completion',
      ],
      startExam: 'Start Exam Mode',
      trainingModeTitle: 'Training Mode',
      trainingModeSubtitle: 'Practice with immediate feedback on each question',
      trainingModeFeatures: [
        '• No time limit',
        '• 40 random questions',
        '• Immediate feedback',
        '• Detailed explanations',
      ],
      startTraining: 'Start Training Mode',
    },
  };

  const text = t[language as keyof typeof t];

  const examId = `${language}-model-${model.toLowerCase()}`;
  // Handle legacy naming for Spanish Model A
  const finalExamId = examId === 'es-model-a' ? 'es-model-a' : examId;

  const examData = loadExamData(finalExamId);

  const handleStartExam = (mode: 'exam' | 'training') => {
    if (!participantName.trim()) {
      setError(text.enterNameError);
      return;
    }

    setError('');
    setExamMode(mode);
    setHasStarted(true);
  };

  const handleReset = () => {
    setHasStarted(false);
    setExamMode(null);
    setParticipantName('');
    setError('');
  };

  if (hasStarted && examMode) {
    return (
      <ExamSimulator
        participantName={participantName}
        mode={examMode}
        examData={examData}
        onReset={handleReset}
        language={language}
        model={model}
        onExamComplete={handleExamComplete}
      />
    );
  }

  return (
    <ExamAuthGate examName="Simulacro ISTQB CTFL v4.0" examEmoji="📋">
    <div className={`min-h-screen py-8 transition-colors ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className={`text-4xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {text.title}
          </h1>
          <p className={`${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
            {text.subtitle}
          </p>
        </div>

        <div className={`rounded-lg shadow-lg mb-6 ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {text.configTitle}
            </h2>
            <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
              {examData.examInfo.title} - {examData.examInfo.version}
            </p>
          </div>
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {text.languageLabel}
                </label>
                <div className="flex rounded-lg shadow-sm">
                  <button
                    onClick={() => setLanguage('es')}
                    className={`flex-1 px-4 py-2 text-sm font-medium rounded-l-lg border ${language === 'es'
                      ? 'bg-amber-600 text-white border-amber-600'
                      : isDarkMode
                        ? 'bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                  >
                    Español
                  </button>
                  <button
                    onClick={() => setLanguage('en')}
                    className={`flex-1 px-4 py-2 text-sm font-medium rounded-r-lg border-t border-r border-b ${language === 'en'
                      ? 'bg-amber-600 text-white border-amber-600'
                      : isDarkMode
                        ? 'bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                  >
                    English
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {text.modelLabel}
                </label>
                <div className="flex rounded-lg shadow-sm">
                  {['A', 'B', 'C'].map((m) => (
                    <button
                      key={m}
                      onClick={() => setModel(m as 'A' | 'B' | 'C')}
                      className={`flex-1 px-4 py-2 text-sm font-medium border-t border-b ${m === 'A' ? 'rounded-l-lg border-l' : ''
                        } ${m === 'C' ? 'rounded-r-lg border-r' : ''} ${m !== 'A' && m !== 'C' ? 'border-r' : ''
                        } ${model === m
                          ? 'bg-amber-600 text-white border-amber-600'
                          : isDarkMode
                            ? 'bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                      {text.model} {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">📚</span>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{text.totalQuestions}</p>
                  <p className="text-2xl font-bold">{examData.examInfo.totalQuestions}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-3xl">⏱️</span>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{text.timeLimit}</p>
                  <p className="text-2xl font-bold">{examData.examInfo.timeLimit} {text.minutes}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-3xl">🎯</span>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{text.pointsPerQuestion}</p>
                  <p className="text-2xl font-bold">{examData.examInfo.pointsPerQuestion}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-3xl">🏆</span>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{text.passingScore}</p>
                  <p className="text-2xl font-bold">{examData.examInfo.passingScore}/{examData.examInfo.totalQuestions}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{text.rulesTitle}</h3>
              <ul className={`list-disc list-inside space-y-2 text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                {text.rules.map((rule: string, index: number) => (
                  <li key={index}>{rule}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className={`rounded-lg shadow-lg ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {text.participantDataTitle}
            </h2>
            <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
              {text.participantDataSubtitle}
            </p>
          </div>
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <label htmlFor="participantName" className={`block text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {text.nameLabel}
              </label>
              <input
                id="participantName"
                type="text"
                placeholder={text.namePlaceholder}
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && participantName.trim()) {
                    handleStartExam('exam');
                  }
                }}
                className={`w-full px-4 py-2 rounded-lg border ${isDarkMode
                  ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                  } focus:outline-none focus:ring-2 focus:ring-amber-500`}
              />
            </div>

            {error && (
              <Alert type="error" message={error} onClose={() => setError('')} />
            )}

            <div className="space-y-3">
              <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{text.selectModeTitle}</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`rounded-lg border-2 transition-all hover:border-amber-500 ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-gray-200'
                  }`}>
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {text.examModeTitle}
                    </h3>
                    <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                      {text.examModeSubtitle}
                    </p>
                  </div>
                  <div className="p-4 space-y-4">
                    <ul className={`text-sm space-y-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                      {text.examModeFeatures.map((feature: string, index: number) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                    <button
                      onClick={() => handleStartExam('exam')}
                      className="w-full px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-colors"
                    >
                      {text.startExam}
                    </button>
                  </div>
                </div>

                <div className={`rounded-lg border-2 transition-all hover:border-amber-500 ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-gray-200'
                  }`}>
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {text.trainingModeTitle}
                    </h3>
                    <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                      {text.trainingModeSubtitle}
                    </p>
                  </div>
                  <div className="p-4 space-y-4">
                    <ul className={`text-sm space-y-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                      {text.trainingModeFeatures.map((feature: string, index: number) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                    <button
                      onClick={() => handleStartExam('training')}
                      className={`w-full px-4 py-3 font-semibold rounded-lg transition-colors ${isDarkMode
                        ? 'bg-slate-600 hover:bg-slate-500 text-white border-2 border-slate-500'
                        : 'bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-300'
                        }`}
                    >
                      {text.startTraining}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Suru mascot teaching ISTQB */}
      <SuruFloating pose="teacher" position="bottom-right" />
    </div>
    </ExamAuthGate>
  );
}
