'use client';

import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';

export default function PerformanceExamPage() {
  const { isDarkMode } = useTheme();

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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white mb-6 text-4xl">
            ⚡
          </div>
          <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${
            isDarkMode ? 'text-white' : 'text-brand-text'
          }`}>
            Examen de Performance Testing
          </h1>
          <p className={`text-xl max-w-3xl mx-auto ${
            isDarkMode ? 'text-slate-300' : 'text-brand-muted'
          }`}>
            Evalúa tus conocimientos en pruebas de rendimiento con esta prueba técnica completa
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

        {/* Coming Soon Notice */}
        <div className={`rounded-lg shadow-lg p-8 text-center ${
          isDarkMode
            ? 'bg-gradient-to-r from-yellow-900/30 to-amber-900/30 border border-yellow-700/50'
            : 'bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200'
        }`}>
          <div className="text-5xl mb-4">🚧</div>
          <h2 className={`text-2xl font-bold mb-3 ${
            isDarkMode ? 'text-yellow-300' : 'text-yellow-800'
          }`}>
            Próximamente Disponible
          </h2>
          <p className={`text-lg mb-6 ${
            isDarkMode ? 'text-yellow-200' : 'text-yellow-700'
          }`}>
            El examen interactivo estará disponible pronto. Mientras tanto, puedes estudiar el material de referencia.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/recursos"
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
                isDarkMode
                  ? 'bg-cyan-600 hover:bg-cyan-700 text-white'
                  : 'bg-cyan-500 hover:bg-cyan-600 text-white'
              }`}>
              <span>📚</span>
              Ver Recursos
            </Link>

            <Link
              href="/labs"
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
                isDarkMode
                  ? 'bg-slate-700 hover:bg-slate-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
              }`}
            >
              <span>🧪</span>
              Volver a Labs
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
