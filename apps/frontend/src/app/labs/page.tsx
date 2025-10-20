'use client';

import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
import Comments from '@/components/Comments';

export default function LabsPage() {
  const { isDarkMode } = useTheme();

  const tools = [
    {
      id: 'json-validator',
      name: 'Validador de JSON',
      description: 'Valida y formatea JSON de forma instantánea',
      icon: '🔍',
      color: 'from-blue-500 to-blue-600',
      href: '/labs/json-validator'
    },
    {
      id: 'data-generator',
      name: 'Generador de Datos',
      description: 'Crea datos de prueba para tus tests',
      icon: '📊',
      color: 'from-green-500 to-green-600',
      href: '/labs/data-generator'
    },
    {
      id: 'checklist',
      name: 'Checklist de Pruebas',
      description: 'Listas de verificación para diferentes tipos de testing',
      icon: '✅',
      color: 'from-purple-500 to-purple-600',
      href: '/labs/checklist'
    },
    {
      id: 'base64-converter',
      name: 'Convertidor Base64',
      description: 'Codifica y decodifica texto en Base64',
      icon: '🔄',
      color: 'from-orange-500 to-orange-600',
      href: '/labs/base64-converter'
    },
    {
      id: 'jwt-decoder',
      name: 'Decodificador JWT',
      description: 'Analiza y decodifica tokens JWT',
      icon: '🔐',
      color: 'from-red-500 to-red-600',
      href: '/labs/jwt-decoder'
    },
    {
      id: 'cron-validator',
      name: 'Validador de Cron',
      description: 'Valida expresiones cron y muestra próximas ejecuciones',
      icon: '⏰',
      color: 'from-indigo-500 to-indigo-600',
      href: '/labs/cron-validator'
    },
    {
      id: 'allpairs',
      name: 'All Pairs Generator',
      description: 'Genera casos de prueba pairwise para testing combinatorio',
      icon: '🔀',
      color: 'from-teal-500 to-teal-600',
      href: '/labs/allpairs'
    },
    {
      id: 'risk-matrix',
      name: 'Matriz de Riesgos',
      description: 'Crea y gestiona matrices de riesgos para proyectos QA/IT',
      icon: '🎯',
      color: 'from-pink-500 to-pink-600',
      href: '/labs/risk-matrix'
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

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tools.map((tool) => (
            <Link
              key={tool.id}
              href={tool.href}
              className={`group block rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
                isDarkMode ? 'bg-slate-800' : 'bg-white'
              }`}
            >
              <div className={`bg-gradient-to-r ${tool.color} p-6 text-white`}>
                <div className="text-3xl mb-3">{tool.icon}</div>
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

        {/* Feedback Section */}
        <div className="mt-16">
          <div className={`rounded-lg p-8 text-center mb-8 transition-colors duration-300 ${
            isDarkMode
              ? 'bg-gradient-to-r from-blue-600 to-indigo-700'
              : 'bg-gradient-to-r from-brand-accent to-brand-primary'
          }`}>
            <h2 className="text-3xl font-bold mb-4 text-white">
              ¿Tienes una idea para una nueva herramienta?
            </h2>
            <p className="text-xl mb-6 text-white/90">
              ¡Comparte tu feedback, reporta bugs o sugiere mejoras!
            </p>
            <a
              href="https://github.com/stevenayal/aiquaa/issues/new"
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 px-8 py-3 rounded-lg font-semibold transition-colors ${
                isDarkMode
                  ? 'bg-white text-blue-600 hover:bg-gray-100'
                  : 'bg-white text-brand-primary hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              Crear Issue en GitHub
            </a>
          </div>

          {/* Comments Section */}
          <div className={`rounded-lg p-8 transition-colors duration-300 ${
            isDarkMode ? 'bg-slate-800' : 'bg-white'
          }`}>
            <h2 className={`text-2xl font-bold mb-4 text-center ${
              isDarkMode ? 'text-white' : 'text-brand-text'
            }`}>
              Comentarios y Sugerencias
            </h2>
            <p className={`text-center mb-6 ${
              isDarkMode ? 'text-slate-300' : 'text-brand-muted'
            }`}>
              Comparte tu experiencia con AIQUAA Labs, sugiere nuevas herramientas o reporta problemas.
              Los comentarios se sincronizan con GitHub Discussions.
            </p>
            <Comments />
          </div>
        </div>
      </div>
    </div>
  );
}
