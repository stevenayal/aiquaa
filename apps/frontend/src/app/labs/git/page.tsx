'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Alert } from '@/components/common';
import ExamSimulator from './components/ExamSimulator';
import { loadExamData } from './utils';
import ExamAuthGate from '@/components/labs/ExamAuthGate';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { saveExamResultAction } from '@/actions/exams';
import type { ExamResult } from './types';

export default function GitExamPage() {
  const { isDarkMode } = useTheme();
  const { user } = useSupabaseAuth();
  const [participantName, setParticipantName] = useState('');
  const [githubProfile, setGithubProfile] = useState('');
  const [examPurpose, setExamPurpose] = useState<'capacitacion' | 'postulacion' | 'practica' | 'otro'>('capacitacion');
  const [companyName, setCompanyName] = useState('');
  const [examMode, setExamMode] = useState<'exam' | 'training' | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [error, setError] = useState('');

  // Pre-fill name from user profile
  useEffect(() => {
    if (user?.user_metadata?.full_name && !participantName) {
      setParticipantName(user.user_metadata.full_name);
    }
  }, [user]);

  const handleExamComplete = async (result: ExamResult) => {
    await saveExamResultAction({
      exam_type: 'git',
      exam_mode: examMode as 'exam' | 'training',
      score: result.score,
      total_questions: result.totalQuestions,
      correct_answers: result.correctAnswers,
      incorrect_answers: result.incorrectAnswers,
      passing_score: 26,
      passed: result.passed,
      percentage: result.percentage,
      time_spent: result.timeSpent,
      github_profile: result.githubProfile,
      exam_purpose: result.examPurpose,
      company_name: result.companyName,
      learning_objectives: result.learningObjectiveAnalysis,
    });
  };

  const examData = loadExamData();

  const handleStartExam = (mode: 'exam' | 'training') => {
    if (!participantName.trim()) {
      setError('Por favor, ingrese su nombre completo');
      return;
    }

    if (!githubProfile.trim()) {
      setError('Por favor, ingrese su perfil de GitHub');
      return;
    }

    // Validate GitHub profile URL
    const githubUrlPattern = /^(https?:\/\/)?(www\.)?github\.com\/[\w-]+\/?$/;
    if (!githubUrlPattern.test(githubProfile.trim())) {
      setError('Por favor, ingrese una URL válida de GitHub (ejemplo: https://github.com/usuario)');
      return;
    }

    // Validate company name when purpose is "postulacion"
    if (examPurpose === 'postulacion' && !companyName.trim()) {
      setError('Por favor, ingrese el nombre de la empresa a la que se postula');
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
    setGithubProfile('');
    setExamPurpose('capacitacion');
    setCompanyName('');
    setError('');
  };

  if (hasStarted && examMode) {
    return (
      <ExamSimulator
        participantName={participantName}
        githubProfile={githubProfile}
        examPurpose={examPurpose}
        companyName={companyName}
        mode={examMode}
        examData={examData}
        onReset={handleReset}
        onExamComplete={handleExamComplete}
      />
    );
  }

  return (
    <ExamAuthGate examName="Examen Técnico GIT" examEmoji="🌿">
    <div className={`min-h-screen py-8 transition-colors ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className={`text-4xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            AIQUAA | Examen Técnico GIT
          </h1>
          <p className={`${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
            Fundamentos de Control de Versiones con Git
          </p>
        </div>

        <div className={`rounded-lg shadow-lg mb-6 ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Información del Examen
            </h2>
            <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
              {examData.examInfo.title} - {examData.examInfo.version}
            </p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">📚</span>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Preguntas</p>
                  <p className="text-2xl font-bold">{examData.examInfo.totalQuestions}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-3xl">⏱️</span>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tiempo Límite</p>
                  <p className="text-2xl font-bold">{examData.examInfo.timeLimit} minutos</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-3xl">🎯</span>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Puntos por Pregunta</p>
                  <p className="text-2xl font-bold">{examData.examInfo.pointsPerQuestion}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-3xl">🏆</span>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Puntaje Mínimo</p>
                  <p className="text-2xl font-bold">{examData.examInfo.passingScore}/{examData.examInfo.totalQuestions}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Reglas del Examen:</h3>
              <ul className={`list-disc list-inside space-y-2 text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                <li>40 preguntas seleccionadas aleatoriamente de un banco de preguntas</li>
                <li>Cada pregunta vale 1 punto, sin penalización por respuestas incorrectas</li>
                <li>Puntaje de aprobación: ≥ 26/40 (65%)</li>
                <li>Preguntas de selección única y múltiple (se indica en cada pregunta)</li>
                <li>Para preguntas de múltiple selección, todas las respuestas deben ser correctas</li>
                <li>Tiempo límite de 60 minutos con envío automático al terminar el tiempo</li>
                <li>Puede navegar entre preguntas y marcar para revisar</li>
              </ul>
            </div>
          </div>
        </div>

        <div className={`rounded-lg shadow-lg ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Datos del Participante
            </h2>
            <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
              Complete la información antes de iniciar el examen
            </p>
          </div>
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <label htmlFor="participantName" className={`block text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Nombre Completo *
              </label>
              <input
                id="participantName"
                type="text"
                placeholder="Ej: Juan Pérez González"
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDarkMode
                    ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                } focus:outline-none focus:ring-2 focus:ring-amber-500`}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="githubProfile" className={`block text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Perfil de GitHub *
              </label>
              <input
                id="githubProfile"
                type="text"
                placeholder="https://github.com/tu-usuario"
                value={githubProfile}
                onChange={(e) => setGithubProfile(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDarkMode
                    ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                } focus:outline-none focus:ring-2 focus:ring-amber-500`}
              />
              <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                Ingresa la URL de tu perfil de GitHub para identificarte
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="examPurpose" className={`block text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Motivo de la Prueba *
              </label>
              <select
                id="examPurpose"
                value={examPurpose}
                onChange={(e) => {
                  setExamPurpose(e.target.value as 'capacitacion' | 'postulacion' | 'practica' | 'otro');
                  if (e.target.value !== 'postulacion') {
                    setCompanyName('');
                  }
                }}
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDarkMode
                    ? 'bg-slate-700 border-slate-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-amber-500`}
              >
                <option value="capacitacion">Capacitación</option>
                <option value="postulacion">Postulación / Proceso de Selección</option>
                <option value="practica">Práctica</option>
                <option value="otro">Otro</option>
              </select>
              <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                Selecciona el motivo por el cual estás realizando esta prueba
              </p>
            </div>

            {examPurpose === 'postulacion' && (
              <div className="space-y-2">
                <label htmlFor="companyName" className={`block text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Nombre de la Empresa *
                </label>
                <input
                  id="companyName"
                  type="text"
                  placeholder="Ej: AIQUAA, Google, Microsoft"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDarkMode
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                  } focus:outline-none focus:ring-2 focus:ring-amber-500`}
                />
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                  Ingresa el nombre de la empresa a la que te estás postulando
                </p>
              </div>
            )}

            {error && (
              <Alert type="error" message={error} onClose={() => setError('')} />
            )}

            <div className="space-y-3">
              <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Seleccione el Modo:</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`rounded-lg border-2 transition-all hover:border-amber-500 ${
                  isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-gray-200'
                }`}>
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Modo Examen
                    </h3>
                    <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                      Simula el examen real sin feedback inmediato
                    </p>
                  </div>
                  <div className="p-4 space-y-4">
                    <ul className={`text-sm space-y-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                      <li>• Timer de 60 minutos</li>
                      <li>• 40 preguntas aleatorias</li>
                      <li>• Sin retroalimentación durante el examen</li>
                      <li>• Informe completo al finalizar</li>
                    </ul>
                    <button
                      onClick={() => handleStartExam('exam')}
                      className="w-full px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-colors"
                    >
                      Iniciar Modo Examen
                    </button>
                  </div>
                </div>

                <div className={`rounded-lg border-2 transition-all hover:border-amber-500 ${
                  isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-gray-200'
                }`}>
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Modo Entrenamiento
                    </h3>
                    <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                      Practica con feedback inmediato en cada pregunta
                    </p>
                  </div>
                  <div className="p-4 space-y-4">
                    <ul className={`text-sm space-y-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                      <li>• Sin límite de tiempo</li>
                      <li>• 40 preguntas aleatorias</li>
                      <li>• Retroalimentación inmediata</li>
                      <li>• Explicaciones detalladas</li>
                    </ul>
                    <button
                      onClick={() => handleStartExam('training')}
                      className={`w-full px-4 py-3 font-semibold rounded-lg transition-colors ${
                        isDarkMode
                          ? 'bg-slate-600 hover:bg-slate-500 text-white border-2 border-slate-500'
                          : 'bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-300'
                      }`}
                    >
                      Iniciar Modo Entrenamiento
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </ExamAuthGate>
  );
}
