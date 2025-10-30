'use client';

import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';

export default function LabsPage() {
  const { isDarkMode } = useTheme();

  const toolCategories = [
    {
      id: 'formacion',
      name: '🎓 Formación y Certificación',
      description: 'Prepárate para certificaciones ISTQB',
      tools: [
        {
          id: 'istqb',
          name: 'Simulador ISTQB CTFL v4.0',
          description: 'Examen de práctica completo con 40 preguntas oficiales del syllabus v4.0',
          icon: '📚',
          color: 'from-amber-500 to-amber-600',
          href: '/labs/istqb',
          featured: true,
          implementedDate: 'Sep 2025'
        }
      ]
    },
    {
      id: 'evaluacion',
      name: '🐛 Testing & Evaluación',
      description: 'Aplicaciones para practicar y evaluar habilidades de testing',
      tools: [
        {
          id: 'test-app',
          name: 'AIQUAA Test App',
          description: 'App con bugs intencionales para Bug Hunting - Evaluación práctica de 30 min',
          icon: '🐞',
          color: 'from-red-500 to-rose-600',
          href: '/labs/test-app',
          featured: true,
          implementedDate: 'Oct 2025'
        }
      ]
    },
    {
      id: 'validadores',
      name: '🧩 Validadores y Verificadores',
      description: 'Herramientas para validar formatos y estructuras de datos',
      tools: [
        {
          id: 'json-validator',
          name: 'Validador de JSON',
          description: 'Valida sintaxis JSON, formatea y detecta errores en tiempo real',
          icon: '🔍',
          color: 'from-blue-500 to-blue-600',
          href: '/labs/json-validator',
          featured: true,
          implementedDate: 'Ago 2025'
        },
        {
          id: 'jwt-decoder',
          name: 'Decodificador JWT',
          description: 'Decodifica tokens JWT y verifica estructura de header, payload y firma',
          icon: '🔐',
          color: 'from-red-500 to-red-600',
          href: '/labs/jwt-decoder',
          implementedDate: 'Sep 2025'
        },
        {
          id: 'cron-validator',
          name: 'Validador de Cron',
          description: 'Valida expresiones cron y calcula próximas 10 ejecuciones programadas',
          icon: '⏰',
          color: 'from-indigo-500 to-indigo-600',
          href: '/labs/cron-validator',
          implementedDate: 'Sep 2025'
        }
      ]
    },
    {
      id: 'generadores',
      name: '🧪 Generadores de Datos',
      description: 'Crea datos sintéticos para pruebas funcionales y de cobertura',
      tools: [
        {
          id: 'data-generator',
          name: 'Generador de Datos',
          description: 'Genera nombres, emails, teléfonos y datos aleatorios para testing',
          icon: '📊',
          color: 'from-green-500 to-green-600',
          href: '/labs/data-generator',
          featured: true,
          implementedDate: 'Ago 2025'
        },
        {
          id: 'allpairs',
          name: 'All Pairs Generator',
          description: 'Reduce casos de prueba combinatorios con técnica pairwise (2-way coverage)',
          icon: '🔀',
          color: 'from-teal-500 to-teal-600',
          href: '/labs/allpairs',
          featured: true,
          implementedDate: 'Sep 2025'
        }
      ]
    },
    {
      id: 'utilidades',
      name: '🧾 Utilidades QA',
      description: 'Herramientas prácticas para el día a día del tester',
      tools: [
        {
          id: 'checklist',
          name: 'Checklist de Pruebas',
          description: 'Plantillas de verificación para testing funcional, regresión, humo y más',
          icon: '✅',
          color: 'from-purple-500 to-purple-600',
          href: '/labs/checklist',
          implementedDate: 'Ago 2025'
        },
        {
          id: 'json-to-testplans',
          name: 'JSON to Test Plans',
          description: 'Convierte análisis de IA (JSON/YAML) en planes CSV importables a TestRail/Zephyr',
          icon: '📋',
          color: 'from-cyan-500 to-cyan-600',
          href: '/labs/json-to-testplans',
          implementedDate: 'Sep 2025'
        },
        {
          id: 'req-lint',
          name: 'Análisis de Requisitos',
          description: 'Detecta ambigüedades, falta de testabilidad y problemas según heurísticas ISTQB',
          icon: '📝',
          color: 'from-blue-500 to-blue-600',
          href: '/labs/req-lint',
          implementedDate: 'Oct 2025'
        },
        {
          id: 'risk-matrix',
          name: 'Matriz de Riesgos',
          description: 'Evalúa y prioriza riesgos del proyecto con matriz de probabilidad vs impacto',
          icon: '🎯',
          color: 'from-pink-500 to-pink-600',
          href: '/labs/risk-matrix',
          implementedDate: 'Oct 2025'
        }
      ]
    },
    {
      id: 'conversores',
      name: '🔧 Conversores',
      description: 'Herramientas de codificación y transformación',
      tools: [
        {
          id: 'base64-converter',
          name: 'Convertidor Base64',
          description: 'Codifica texto a Base64 y decodifica de Base64 a texto plano',
          icon: '🔄',
          color: 'from-orange-500 to-orange-600',
          href: '/labs/base64-converter',
          implementedDate: 'Sep 2025'
        }
      ]
    }
  ];

  return (
    <div className={`min-h-screen py-12 md:py-16 transition-colors duration-300 ${
      isDarkMode ? 'bg-slate-900' : 'bg-brand-light'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className={`text-4xl md:text-5xl font-bold mb-6 ${
            isDarkMode ? 'text-white' : 'text-brand-text'
          }`}>
            🧪 AIQUAA Labs
          </h1>
          <p className={`text-xl max-w-3xl mx-auto ${
            isDarkMode ? 'text-slate-300' : 'text-brand-muted'
          }`}>
            Herramientas gratuitas para testers funcionales, automatizadores y QA manual.
            Todo en español y diseñado específicamente para la comunidad de testing en Paraguay.
          </p>
        </div>

        {/* Featured Tools of the Month */}
        <div className={`mb-12 rounded-lg shadow-lg p-8 ${
          isDarkMode
            ? 'bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-purple-700/50'
            : 'bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200'
        }`}>
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">🔥</span>
            <div>
              <h2 className={`text-2xl font-bold ${
                isDarkMode ? 'text-white' : 'text-brand-text'
              }`}>
                Destacadas del Mes
              </h2>
              <p className={`text-sm ${
                isDarkMode ? 'text-slate-300' : 'text-brand-muted'
              }`}>
                Las herramientas más utilizadas por la comunidad
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {toolCategories
              .flatMap(cat => cat.tools)
              .filter(tool => tool.featured)
              .slice(0, 3)
              .map((tool, index) => (
                <Link
                  key={tool.id}
                  href={tool.href}
                  className={`group p-4 rounded-lg transition-all duration-300 hover:scale-105 ${
                    isDarkMode
                      ? 'bg-slate-800/80 hover:bg-slate-700/80'
                      : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`text-2xl font-bold ${
                      index === 0
                        ? 'text-yellow-500'
                        : index === 1
                        ? 'text-gray-400'
                        : 'text-orange-600'
                    }`}>
                      #{index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">{tool.icon}</span>
                        <h3 className={`font-bold ${
                          isDarkMode ? 'text-white' : 'text-brand-text'
                        }`}>
                          {tool.name}
                        </h3>
                      </div>
                      <p className={`text-xs ${
                        isDarkMode ? 'text-slate-400' : 'text-brand-muted'
                      }`}>
                        {tool.description}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </div>

        {/* Tools by Category */}
        <div className="space-y-12">
          {toolCategories.map((category) => (
            <div key={category.id}>
              {/* Category Header */}
              <div className="mb-6">
                <h2 className={`text-2xl md:text-3xl font-bold mb-2 ${
                  isDarkMode ? 'text-white' : 'text-brand-text'
                }`}>
                  {category.name}
                </h2>
                <p className={`text-base ${
                  isDarkMode ? 'text-slate-400' : 'text-brand-muted'
                }`}>
                  {category.description}
                </p>
              </div>

              {/* Tools Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.tools.map((tool) => (
                  <Link
                    key={tool.id}
                    href={tool.href}
                    className={`group block rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
                      isDarkMode ? 'bg-slate-800' : 'bg-white'
                    }`}
                  >
                    <div className={`bg-gradient-to-r ${tool.color} p-6 text-white relative`}>
                      {/* Badges Container */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="text-3xl">{tool.icon}</div>
                        <div className="flex flex-col items-end gap-2">
                          {tool.featured && (
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              isDarkMode
                                ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/50'
                                : 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                            }`}>
                              ⭐ Destacada
                            </span>
                          )}
                          {tool.implementedDate && (
                            <span className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded text-xs font-medium">
                              📅 {tool.implementedDate}
                            </span>
                          )}
                        </div>
                      </div>
                      <h3 className="text-xl font-bold mb-2">{tool.name}</h3>
                      <p className="text-white/90 text-sm">{tool.description}</p>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${
                          isDarkMode ? 'text-slate-400' : 'text-brand-muted'
                        }`}>Hacer click para usar</span>
                        <svg
                          className={`w-5 h-5 transition-colors ${
                            isDarkMode
                              ? 'text-slate-400 group-hover:text-blue-400'
                              : 'text-brand-muted group-hover:text-brand-accent'
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Info Section */}
        <div className={`mt-16 rounded-lg shadow-lg p-8 transition-colors duration-300 ${
          isDarkMode ? 'bg-slate-800' : 'bg-white'
        }`}>
          <div className="text-center mb-8">
            <h2 className={`text-3xl font-bold mb-4 ${
              isDarkMode ? 'text-white' : 'text-brand-text'
            }`}>
              ¿Por qué usar AIQUAA Labs?
            </h2>
            <p className={`text-lg max-w-2xl mx-auto ${
              isDarkMode ? 'text-slate-300' : 'text-brand-muted'
            }`}>
              Nuestras herramientas están diseñadas específicamente para testers,
              con interfaz en español y funcionalidades que realmente necesitas en tu día a día.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className={`text-xl font-bold mb-3 ${
                isDarkMode ? 'text-white' : 'text-brand-text'
              }`}>Gratis y Abierto</h3>
              <p className={isDarkMode ? 'text-slate-400' : 'text-brand-muted'}>
                Todas las herramientas son completamente gratuitas y de código abierto.
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🇵🇾</div>
              <h3 className={`text-xl font-bold mb-3 ${
                isDarkMode ? 'text-white' : 'text-brand-text'
              }`}>Hecho en Paraguay</h3>
              <p className={isDarkMode ? 'text-slate-400' : 'text-brand-muted'}>
                Desarrollado por testers locales para testers locales.
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">💡</div>
              <h3 className={`text-xl font-bold mb-3 ${
                isDarkMode ? 'text-white' : 'text-brand-text'
              }`}>Siempre Actualizado</h3>
              <p className={isDarkMode ? 'text-slate-400' : 'text-brand-muted'}>
                Nuevas herramientas y mejoras constantes basadas en feedback real.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className={`rounded-lg p-8 text-white transition-colors duration-300 ${
            isDarkMode
              ? 'bg-gradient-to-r from-blue-600 to-indigo-700'
              : 'bg-gradient-to-r from-brand-accent to-brand-primary'
          }`}>
            <h2 className="text-3xl font-bold mb-4">
              ¿Tienes una idea para una nueva herramienta?
            </h2>
            <p className="text-xl mb-6 opacity-90">
              ¡Comparte tu feedback, reporta bugs o sugiere mejoras en nuestra página de comunidad!
            </p>
            <Link
              href="/comunidad"
              className={`inline-flex items-center gap-2 px-8 py-3 rounded-lg font-semibold transition-colors ${
                isDarkMode
                  ? 'bg-white text-blue-600 hover:bg-gray-100'
                  : 'bg-white text-brand-primary hover:bg-gray-100'
              }`}
            >
              <span className="text-xl">💬</span>
              Ir a Comunidad
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
