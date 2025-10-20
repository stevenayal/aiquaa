'use client';

import { useTheme } from '@/contexts/ThemeContext';
import Comments from '@/components/Comments';

export default function ComunidadPage() {
  const { isDarkMode } = useTheme();

  return (
    <div className={`min-h-screen py-12 md:py-16 transition-colors duration-300 ${
      isDarkMode ? 'bg-slate-900' : 'bg-brand-light'
    }`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className={`text-4xl md:text-5xl font-bold mb-6 ${
            isDarkMode ? 'text-white' : 'text-brand-text'
          }`}>
            💬 Feedback y Comunidad
          </h1>
          <p className={`text-xl max-w-3xl mx-auto ${
            isDarkMode ? 'text-slate-300' : 'text-brand-muted'
          }`}>
            Tu opinión es fundamental para mejorar AIQUAA. Comparte ideas, reporta bugs,
            sugiere nuevas herramientas o simplemente charla con la comunidad.
          </p>
        </div>

        {/* Próximo Evento - PY TESTING FEST 2025 */}
        <div className={`mb-12 rounded-2xl overflow-hidden shadow-2xl ${
          isDarkMode
            ? 'bg-gradient-to-br from-purple-900 via-pink-900 to-orange-900'
            : 'bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500'
        }`}>
          <div className="p-8 md:p-12 text-white">
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="text-4xl animate-pulse">🎉</span>
              <h2 className="text-3xl md:text-4xl font-bold text-center">
                Próximo Evento
              </h2>
              <span className="text-4xl animate-pulse">🚀</span>
            </div>

            <div className="max-w-3xl mx-auto">
              <h3 className="text-2xl md:text-3xl font-extrabold mb-4 text-center">
                PY TESTING FEST 2025
              </h3>

              <p className="text-lg md:text-xl mb-6 text-center leading-relaxed">
                Gracias a nuestros nuevos sponsors, este evento virtual de QA e innovación tecnológica
                viene con más sorpresas, premios y experiencias únicas.
              </p>

              {/* Event Details */}
              <div className="grid md:grid-cols-2 gap-4 mb-6 text-center md:text-left">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                    <span className="text-2xl">📅</span>
                    <span className="font-bold text-lg">Fecha</span>
                  </div>
                  <p className="text-white/90">Sábado 25 de octubre</p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                    <span className="text-2xl">🕘</span>
                    <span className="font-bold text-lg">Horario</span>
                  </div>
                  <p className="text-white/90">09:00 a 13:00</p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                    <span className="text-2xl">💻</span>
                    <span className="font-bold text-lg">Modalidad</span>
                  </div>
                  <p className="text-white/90">Virtual (Zoom)</p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                    <span className="text-2xl">🎟️</span>
                    <span className="font-bold text-lg">Entrada</span>
                  </div>
                  <p className="text-white/90">Gratuita</p>
                </div>
              </div>

              {/* What to Expect */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-6">
                <h4 className="font-bold text-xl mb-4 flex items-center gap-2">
                  <span className="text-2xl">💡</span>
                  ¿Qué te espera?
                </h4>
                <ul className="space-y-2 text-white/90">
                  <li className="flex items-start gap-2">
                    <span className="text-green-300 mt-1">✓</span>
                    <span>Charlas con speakers nacionales e internacionales</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-300 mt-1">✓</span>
                    <span>Tendencias en QA, automatización e IA aplicada</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-300 mt-1">✓</span>
                    <span>Premios y sorpresas exclusivas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-300 mt-1">✓</span>
                    <span>Networking con la comunidad QA de Paraguay y LATAM</span>
                  </li>
                </ul>
              </div>

              {/* CTA Button */}
              <div className="text-center">
                <a
                  href="https://lnkd.in/dsJeGPRn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-white text-purple-900 font-bold text-lg rounded-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-xl"
                >
                  <span className="text-2xl">🎟️</span>
                  Inscribite Ahora - ¡Gratis!
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
                <p className="mt-4 text-sm text-white/80">
                  🎁 No te pierdas una mañana llena de aprendizaje, premios y comunidad
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* GitHub Integration Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Issues Card */}
          <div className={`rounded-lg p-8 shadow-lg transition-colors duration-300 ${
            isDarkMode ? 'bg-slate-800' : 'bg-white'
          }`}>
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500 text-white mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className={`text-2xl font-bold mb-3 ${
                isDarkMode ? 'text-white' : 'text-brand-text'
              }`}>
                Reportar Issues
              </h2>
              <p className={`mb-6 ${
                isDarkMode ? 'text-slate-300' : 'text-brand-muted'
              }`}>
                ¿Encontraste un bug? ¿Tenés una idea para una nueva feature? Creá un issue en GitHub.
              </p>
            </div>

            <div className={`space-y-3 mb-6 text-sm ${
              isDarkMode ? 'text-slate-400' : 'text-gray-600'
            }`}>
              <div className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Bugs y errores técnicos</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Solicitudes de nuevas features</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Mejoras de rendimiento</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Problemas de UX/UI</span>
              </div>
            </div>

            <a
              href="https://github.com/stevenayal/aiquaa/issues/new"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors"
            >
              Crear Issue
            </a>
          </div>

          {/* Discussions Card */}
          <div className={`rounded-lg p-8 shadow-lg transition-colors duration-300 ${
            isDarkMode ? 'bg-slate-800' : 'bg-white'
          }`}>
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500 text-white mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
              <h2 className={`text-2xl font-bold mb-3 ${
                isDarkMode ? 'text-white' : 'text-brand-text'
              }`}>
                GitHub Discussions
              </h2>
              <p className={`mb-6 ${
                isDarkMode ? 'text-slate-300' : 'text-brand-muted'
              }`}>
                Participa en conversaciones, comparte experiencias y conecta con la comunidad.
              </p>
            </div>

            <div className={`space-y-3 mb-6 text-sm ${
              isDarkMode ? 'text-slate-400' : 'text-gray-600'
            }`}>
              <div className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Preguntas generales</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Compartir casos de uso</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Ideas y sugerencias</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Anuncios y actualizaciones</span>
              </div>
            </div>

            <a
              href="https://github.com/stevenayal/aiquaa/discussions"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
            >
              Ver Discussions
            </a>
          </div>
        </div>

        {/* Stats Section */}
        <div className={`rounded-lg p-6 mb-12 transition-colors duration-300 ${
          isDarkMode
            ? 'bg-gradient-to-r from-purple-900/50 to-blue-900/50 border border-purple-700/30'
            : 'bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200'
        }`}>
          <div className="text-center">
            <h3 className={`text-lg font-semibold mb-2 ${
              isDarkMode ? 'text-purple-200' : 'text-purple-900'
            }`}>
              🌟 Proyecto Open Source
            </h3>
            <p className={`text-sm ${
              isDarkMode ? 'text-purple-300' : 'text-purple-700'
            }`}>
              AIQUAA es de código abierto. Todo el código está disponible en{' '}
              <a
                href="https://github.com/stevenayal/aiquaa"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold underline hover:no-underline"
              >
                GitHub
              </a>
              . ¡Las contribuciones son bienvenidas!
            </p>
          </div>
        </div>

        {/* Comments Section */}
        <div className={`rounded-lg p-8 shadow-lg transition-colors duration-300 ${
          isDarkMode ? 'bg-slate-800' : 'bg-white'
        }`}>
          <div className="text-center mb-8">
            <h2 className={`text-3xl font-bold mb-4 ${
              isDarkMode ? 'text-white' : 'text-brand-text'
            }`}>
              Comentarios de la Comunidad
            </h2>
            <p className={`text-lg ${
              isDarkMode ? 'text-slate-300' : 'text-brand-muted'
            }`}>
              Comparte tu experiencia, haz preguntas o simplemente saluda.
              Estos comentarios se sincronizan automáticamente con GitHub Discussions.
            </p>
          </div>

          <Comments />
        </div>

        {/* Guidelines Section */}
        <div className={`mt-12 rounded-lg p-6 transition-colors duration-300 ${
          isDarkMode ? 'bg-slate-800/50' : 'bg-gray-50'
        }`}>
          <h3 className={`text-lg font-semibold mb-3 ${
            isDarkMode ? 'text-white' : 'text-brand-text'
          }`}>
            📋 Guía para contribuir
          </h3>
          <ul className={`space-y-2 text-sm ${
            isDarkMode ? 'text-slate-300' : 'text-gray-600'
          }`}>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 font-bold">•</span>
              <span><strong>Issues</strong>: Para bugs, features específicas o problemas técnicos</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 font-bold">•</span>
              <span><strong>Discussions</strong>: Para preguntas, ideas generales o conversaciones</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 font-bold">•</span>
              <span><strong>Comentarios abajo</strong>: Para feedback rápido sobre la página o el proyecto</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 font-bold">•</span>
              <span>Sé respetuoso y constructivo. Este es un espacio para aprender y crecer juntos.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
