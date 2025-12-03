'use client';

import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Alert } from '@/components/common';
import ExamSimulator from './components/ExamSimulator';
import { loadExamData } from './utils';
import { SuruFloating } from '@/components/Suru';

export default function PerformanceExamPage() {
  const { isDarkMode } = useTheme();
  const [participantName, setParticipantName] = useState('');
  const [githubProfile, setGithubProfile] = useState('');
  const [examPurpose, setExamPurpose] = useState<'capacitacion' | 'postulacion' | 'practica' | 'otro'>('practica');
  const [companyName, setCompanyName] = useState('');
  const [examMode, setExamMode] = useState<'exam' | 'training' | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [error, setError] = useState('');

  const handleStartExam = (mode: 'exam' | 'training') => {
    if (!participantName.trim()) {
      setError('Por favor, ingrese su nombre completo');
      return;
    }
    if (!githubProfile.trim()) {
      setError('Por favor, ingrese su perfil de GitHub');
      return;
    }
    if (examPurpose === 'postulacion' && !companyName.trim()) {
      setError('Por favor, ingrese el nombre de la empresa');
      return;
    }

    setError('');
    setExamMode(mode);
    setHasStarted(true);
  };

  // Si el examen ha iniciado, mostrar el simulador
  if (hasStarted && examMode) {
    return (
      <ExamSimulator
        participantName={participantName}
        githubProfile={githubProfile}
        examPurpose={examPurpose}
        companyName={companyName}
        mode={examMode}
        examData={loadExamData()}
      />
    );
  }

  const examSections = [
    {
      title: 'Parte 1: Fundamentos de Performance Testing',
      weight: '35%',
      topics: [
        'Tipos de pruebas (Load, Stress, Spike, Endurance)',
        'Usuarios virtuales y Think Time',
        'Ramp-up Period y configuración de carga',
        'Objetivos y alcance del performance testing'
      ]
    },
    {
      title: 'Parte 2: Métricas y KPIs',
      weight: '35%',
      topics: [
        'Response Time y Throughput',
        'Percentiles (p90, p95, p99)',
        'Error Rate y SLAs',
        'Métricas de servidor (CPU, RAM, Disk I/O)',
        'Apdex Score'
      ]
    },
    {
      title: 'Parte 3: Herramientas y Mejores Prácticas',
      weight: '30%',
      topics: [
        'Herramientas (JMeter, Gatling, k6, Locust)',
        'Baseline y análisis de regresiones',
        'Identificación de bottlenecks',
        'APM y monitoreo',
        'Shift-Left Performance Testing'
      ]
    }
  ];

  const studyMaterials = [
    {
      title: 'PtU CPTJM Syllabus (Español)',
      filename: 'PtU_Certified_Performance_Tester_with_JMeter_Syllabus_SPN_Ver.1.1.pdf',
      icon: '📘'
    },
    {
      title: 'PtU CPTJM Syllabus (English)',
      filename: 'PtU_Certified_Performance_Tester_with_JMeter_Syllabus_ENG_Ver.1.1.pdf',
      icon: '📗'
    },
    {
      title: 'PtU Sample Exam',
      filename: 'PtU_sample_exam.pdf',
      icon: '📝'
    }
  ];

  return (
    <div className={`min-h-screen py-12 md:py-16 transition-colors duration-300 ${
      isDarkMode ? 'bg-slate-900' : 'bg-brand-light'
    }`}>
      <SuruFloating />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white mb-6 text-4xl">
            ⚡
          </div>
          <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${
            isDarkMode ? 'text-white' : 'text-brand-text'
          }`}>
            Simulacro de Performance Testing
          </h1>
          <p className={`text-xl max-w-3xl mx-auto ${
            isDarkMode ? 'text-slate-300' : 'text-brand-muted'
          }`}>
            Evaluación técnica completa sobre fundamentos, métricas y herramientas de pruebas de rendimiento
          </p>
        </div>

        {/* Exam Info */}
        <div className={`rounded-lg shadow-lg p-8 mb-8 ${
          isDarkMode ? 'bg-slate-800' : 'bg-white'
        }`}>
          <h2 className={`text-2xl font-bold mb-6 ${
            isDarkMode ? 'text-white' : 'text-brand-text'
          }`}>
            📋 Información del Examen
          </h2>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className={`p-4 rounded-lg ${
              isDarkMode ? 'bg-slate-700/50' : 'bg-gray-50'
            }`}>
              <div className="text-3xl mb-2">📝</div>
              <div className={`text-sm font-semibold mb-1 ${
                isDarkMode ? 'text-slate-400' : 'text-gray-600'
              }`}>
                Total de Preguntas
              </div>
              <div className={`text-2xl font-bold ${
                isDarkMode ? 'text-white' : 'text-brand-text'
              }`}>
                30 preguntas
              </div>
            </div>

            <div className={`p-4 rounded-lg ${
              isDarkMode ? 'bg-slate-700/50' : 'bg-gray-50'
            }`}>
              <div className="text-3xl mb-2">⏱️</div>
              <div className={`text-sm font-semibold mb-1 ${
                isDarkMode ? 'text-slate-400' : 'text-gray-600'
              }`}>
                Duración Estimada
              </div>
              <div className={`text-2xl font-bold ${
                isDarkMode ? 'text-white' : 'text-brand-text'
              }`}>
                60 minutos
              </div>
            </div>

            <div className={`p-4 rounded-lg ${
              isDarkMode ? 'bg-slate-700/50' : 'bg-gray-50'
            }`}>
              <div className="text-3xl mb-2">🎯</div>
              <div className={`text-sm font-semibold mb-1 ${
                isDarkMode ? 'text-slate-400' : 'text-gray-600'
              }`}>
                Puntaje de Aprobación
              </div>
              <div className={`text-2xl font-bold ${
                isDarkMode ? 'text-white' : 'text-brand-text'
              }`}>
                70%
              </div>
            </div>

            <div className={`p-4 rounded-lg ${
              isDarkMode ? 'bg-slate-700/50' : 'bg-gray-50'
            }`}>
              <div className="text-3xl mb-2">📊</div>
              <div className={`text-sm font-semibold mb-1 ${
                isDarkMode ? 'text-slate-400' : 'text-gray-600'
              }`}>
                Nivel
              </div>
              <div className={`text-2xl font-bold ${
                isDarkMode ? 'text-white' : 'text-brand-text'
              }`}>
                Intermedio
              </div>
            </div>
          </div>
        </div>

        {/* Exam Sections */}
        <div className={`rounded-lg shadow-lg p-8 mb-8 ${
          isDarkMode ? 'bg-slate-800' : 'bg-white'
        }`}>
          <h2 className={`text-2xl font-bold mb-6 ${
            isDarkMode ? 'text-white' : 'text-brand-text'
          }`}>
            📚 Contenido del Examen
          </h2>

          <div className="space-y-6">
            {examSections.map((section, index) => (
              <div key={index} className={`border-l-4 border-cyan-500 pl-6 py-4 ${
                isDarkMode ? 'bg-slate-700/30' : 'bg-gray-50'
              }`}>
                <div className="flex items-start justify-between mb-3">
                  <h3 className={`text-lg font-bold ${
                    isDarkMode ? 'text-white' : 'text-brand-text'
                  }`}>
                    {section.title}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    isDarkMode
                      ? 'bg-cyan-900/50 text-cyan-300'
                      : 'bg-cyan-100 text-cyan-800'
                  }`}>
                    {section.weight}
                  </span>
                </div>
                <ul className={`space-y-2 ${
                  isDarkMode ? 'text-slate-300' : 'text-gray-700'
                }`}>
                  {section.topics.map((topic, topicIndex) => (
                    <li key={topicIndex} className="flex items-start gap-2">
                      <span className="text-cyan-500 mt-1">•</span>
                      <span>{topic}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Study Materials */}
        <div className={`rounded-lg shadow-lg p-8 mb-8 ${
          isDarkMode ? 'bg-slate-800' : 'bg-white'
        }`}>
          <h2 className={`text-2xl font-bold mb-6 ${
            isDarkMode ? 'text-white' : 'text-brand-text'
          }`}>
            📖 Material de Estudio
          </h2>

          <p className={`mb-6 ${
            isDarkMode ? 'text-slate-300' : 'text-gray-700'
          }`}>
            Te recomendamos estudiar los siguientes materiales oficiales antes de realizar el examen:
          </p>

          <div className="grid md:grid-cols-3 gap-4">
            {studyMaterials.map((material, index) => (
              <a
                key={index}
                href={`/resources/performance/${material.filename}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`p-4 rounded-lg transition-all hover:scale-105 ${
                  isDarkMode
                    ? 'bg-slate-700/50 hover:bg-slate-700'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="text-3xl mb-2">{material.icon}</div>
                <h3 className={`text-sm font-semibold ${
                  isDarkMode ? 'text-white' : 'text-brand-text'
                }`}>
                  {material.title}
                </h3>
              </a>
            ))}
          </div>
        </div>

        {/* Participant Data Form */}
        <div className={`rounded-lg shadow-lg p-8 mb-8 ${
          isDarkMode ? 'bg-slate-800' : 'bg-white'
        }`}>
          <h2 className={`text-2xl font-bold mb-4 ${
            isDarkMode ? 'text-white' : 'text-brand-text'
          }`}>
            📝 Datos del Participante
          </h2>
          <p className={`mb-6 ${
            isDarkMode ? 'text-slate-300' : 'text-gray-700'
          }`}>
            Complete la información antes de iniciar el simulacro
          </p>

          {error && (
            <Alert type="error" title="Error" message={error} className="mb-4" />
          )}

          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-semibold mb-2 ${
                isDarkMode ? 'text-slate-300' : 'text-gray-700'
              }`}>
                Nombre Completo *
              </label>
              <input
                type="text"
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                placeholder="Ej: Juan Pérez González"
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDarkMode
                    ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                } focus:outline-none focus:ring-2 focus:ring-cyan-500`}
              />
            </div>

            <div>
              <label className={`block text-sm font-semibold mb-2 ${
                isDarkMode ? 'text-slate-300' : 'text-gray-700'
              }`}>
                GitHub Profile *
              </label>
              <input
                type="text"
                value={githubProfile}
                onChange={(e) => setGithubProfile(e.target.value)}
                placeholder="Ej: @tuusuario"
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDarkMode
                    ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                } focus:outline-none focus:ring-2 focus:ring-cyan-500`}
              />
            </div>

            <div>
              <label className={`block text-sm font-semibold mb-2 ${
                isDarkMode ? 'text-slate-300' : 'text-gray-700'
              }`}>
                Motivo del Examen *
              </label>
              <select
                value={examPurpose}
                onChange={(e) => setExamPurpose(e.target.value as any)}
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDarkMode
                    ? 'bg-slate-700 border-slate-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-cyan-500`}
              >
                <option value="practica">Práctica</option>
                <option value="capacitacion">Capacitación</option>
                <option value="postulacion">Postulación / Proceso de Selección</option>
                <option value="otro">Otro</option>
              </select>
            </div>

            {examPurpose === 'postulacion' && (
              <div>
                <label className={`block text-sm font-semibold mb-2 ${
                  isDarkMode ? 'text-slate-300' : 'text-gray-700'
                }`}>
                  Nombre de la Empresa *
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Ej: ACME Corp"
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDarkMode
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                  } focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                />
              </div>
            )}
          </div>
        </div>

        {/* Mode Selection */}
        <div className={`rounded-lg shadow-lg p-8 mb-8 ${
          isDarkMode ? 'bg-slate-800' : 'bg-white'
        }`}>
          <h2 className={`text-2xl font-bold mb-6 ${
            isDarkMode ? 'text-white' : 'text-brand-text'
          }`}>
            🎯 Seleccione el Modo:
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Exam Mode */}
            <div className={`p-6 rounded-lg border-2 transition-all cursor-pointer hover:scale-105 ${
              isDarkMode
                ? 'border-cyan-700 bg-slate-700/50 hover:bg-slate-700'
                : 'border-cyan-300 bg-cyan-50 hover:bg-cyan-100'
            }`}
            onClick={() => handleStartExam('exam')}>
              <div className="text-4xl mb-4">📝</div>
              <h3 className={`text-xl font-bold mb-2 ${
                isDarkMode ? 'text-white' : 'text-brand-text'
              }`}>
                Modo Examen
              </h3>
              <p className={`text-sm mb-4 ${
                isDarkMode ? 'text-slate-300' : 'text-gray-600'
              }`}>
                Simula el examen real sin feedback inmediato
              </p>
              <ul className={`text-sm space-y-2 mb-4 ${
                isDarkMode ? 'text-slate-400' : 'text-gray-600'
              }`}>
                <li>• Timer de 60 minutos</li>
                <li>• 26 preguntas de selección</li>
                <li>• Sin retroalimentación durante el examen</li>
                <li>• Informe completo al finalizar</li>
              </ul>
              <button className={`w-full px-4 py-2 rounded-lg font-semibold transition-colors ${
                isDarkMode
                  ? 'bg-cyan-600 hover:bg-cyan-700 text-white'
                  : 'bg-cyan-500 hover:bg-cyan-600 text-white'
              }`}>
                Iniciar Modo Examen
              </button>
            </div>

            {/* Training Mode */}
            <div className={`p-6 rounded-lg border-2 transition-all cursor-pointer hover:scale-105 ${
              isDarkMode
                ? 'border-green-700 bg-slate-700/50 hover:bg-slate-700'
                : 'border-green-300 bg-green-50 hover:bg-green-100'
            }`}
            onClick={() => handleStartExam('training')}>
              <div className="text-4xl mb-4">🎓</div>
              <h3 className={`text-xl font-bold mb-2 ${
                isDarkMode ? 'text-white' : 'text-brand-text'
              }`}>
                Modo Entrenamiento
              </h3>
              <p className={`text-sm mb-4 ${
                isDarkMode ? 'text-slate-300' : 'text-gray-600'
              }`}>
                Practica con feedback inmediato en cada pregunta
              </p>
              <ul className={`text-sm space-y-2 mb-4 ${
                isDarkMode ? 'text-slate-400' : 'text-gray-600'
              }`}>
                <li>• Sin límite de tiempo</li>
                <li>• 26 preguntas de selección</li>
                <li>• Retroalimentación inmediata</li>
                <li>• Explicaciones detalladas</li>
              </ul>
              <button className={`w-full px-4 py-2 rounded-lg font-semibold transition-colors ${
                isDarkMode
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}>
                Iniciar Modo Entrenamiento
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
