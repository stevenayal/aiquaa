'use client';

import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
import FeaturedMember from '@/components/Team/FeaturedMember';
import FAQSection from '@/components/FAQSection';

export default function HomePage() {
  const { isDarkMode } = useTheme();

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      {/* Event Announcement Banner */}
      <Link
        href="/comunidad"
        className="block bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 transition-all duration-300"
      >
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-white">
            <span className="text-xl sm:text-2xl animate-bounce">🎉</span>
            <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2">
              <span className="text-sm sm:text-base md:text-lg font-bold whitespace-nowrap">
                <span className="hidden sm:inline">¡Próximo Evento! </span>
                <span className="font-extrabold">PY TESTING FEST 2025</span>
              </span>
              <span className="hidden md:inline text-sm sm:text-base md:text-lg font-bold whitespace-nowrap">
                - 25 de octubre
              </span>
              <span className="px-2 py-1 bg-white/20 rounded text-xs sm:text-sm font-bold whitespace-nowrap inline-flex items-center gap-1">
                Inscripción Gratis
                <span className="text-base">→</span>
              </span>
            </div>
            <span className="text-xl sm:text-2xl animate-bounce">🚀</span>
          </div>
        </div>
      </Link>

      {/* Hero Section - Redesigned */}
      <section className="py-20 bg-gradient-to-b from-slate-900 via-slate-950 to-indigo-950 text-white text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
            AIQUAA: Comunidad y Herramientas de QA en Paraguay
          </h1>
          <p className="mt-4 text-xl md:text-2xl text-gray-200 font-medium mb-4">
            Transformamos el testing en Paraguay con IA, herramientas y comunidad
          </p>
          <p className="text-base md:text-lg text-gray-300 max-w-3xl mx-auto">
            Validá tus APIs y datos, genera casos de prueba y participá en workshops y mentorías.
            Únete a nuestra comunidad open-source de QA.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/labs"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition shadow-lg hover:shadow-xl"
            >
              🧪 Explorar Herramientas
            </Link>
            <Link
              href="/comunidad"
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition shadow-lg hover:shadow-xl"
            >
              💬 Unirse a la Comunidad
            </Link>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-6 text-sm text-gray-300">
            <div className="flex items-center gap-2">
              <span className="text-green-400 text-xl">✓</span>
              <span>100% Gratis y Open Source</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400 text-xl">✓</span>
              <span>En Español</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400 text-xl">✓</span>
              <span>Hecho en Paraguay 🇵🇾</span>
            </div>
          </div>
        </div>
      </section>

      {/* Community Banner */}
      <div className={`py-3 px-4 text-center text-sm font-semibold transition-colors duration-300 ${
        isDarkMode
          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
          : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
      }`}>
        <span className="inline-flex items-center gap-2">
          <span className="text-lg">🌟</span>
          <span>Más que herramientas: una comunidad de QA que crece con vos</span>
        </span>
      </div>

      {/* Presentación Institucional */}
      <section className={`py-12 md:py-16 px-4 md:px-6 text-center shadow-sm transition-colors duration-300 ${
        isDarkMode
          ? 'bg-slate-800 text-slate-100'
          : 'bg-brand-light text-brand-text'
      }`}>
        <h2 className={`text-2xl md:text-3xl font-bold mb-6 ${
          isDarkMode ? 'text-blue-400' : 'text-brand-accent'
        }`}>¿Qué es AIQUAA?</h2>

        <p className={`text-lg md:text-xl max-w-3xl mx-auto mb-8 px-4 leading-relaxed ${
          isDarkMode ? 'text-slate-200' : 'text-brand-text'
        }`}>
          <strong className={isDarkMode ? 'text-white' : ''}>Una comunidad de testing y calidad de software en Paraguay.</strong>
        </p>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto px-4">
          <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-slate-700/50' : 'bg-white'}`}>
            <div className="text-4xl mb-4">🛠️</div>
            <h3 className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-brand-text'}`}>
              Recursos Gratuitos
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>
              Herramientas web, generación de datos, checklist, blog y guías prácticas para testers.
            </p>
          </div>

          <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-slate-700/50' : 'bg-white'}`}>
            <div className="text-4xl mb-4">🎓</div>
            <h3 className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-brand-text'}`}>
              Eventos y Mentorías
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>
              Workshops, charlas y guía de expertos sobre automatización y buenas prácticas de QA.
            </p>
          </div>

          <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-slate-700/50' : 'bg-white'}`}>
            <div className="text-4xl mb-4">🤝</div>
            <h3 className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-brand-text'}`}>
              Open Source
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>
              Todo el código es abierto. Hecho en Paraguay para testers latinoamericanos.
            </p>
          </div>
        </div>

        <p className={`text-sm md:text-base max-w-3xl mx-auto mt-8 px-4 italic ${
          isDarkMode ? 'text-slate-400' : 'text-gray-500'
        }`}>
          Inspirada en el término guaraní <strong>&ldquo;aikuaa&rdquo;</strong> (saber, conocer),
          AIQUAA combina inteligencia artificial (AI) con aseguramiento de calidad (QA)
          para transformar el testing en la región.
        </p>
      </section>

      {/* Community Engagement Section */}
      <section className={`py-16 md:py-20 transition-colors duration-300 ${
        isDarkMode ? 'bg-slate-900' : 'bg-white'
      }`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${
              isDarkMode ? 'text-white' : 'text-brand-text'
            }`}>
              Aprendé, Colaborá y Crecé con AIQUAA
            </h2>
            <p className={`text-lg ${
              isDarkMode ? 'text-slate-300' : 'text-gray-600'
            }`}>
              Un laboratorio de utilidades y una comunidad de aprendizaje y colaboración
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Blog */}
            <Link
              href="/blog"
              className={`group rounded-xl p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${
                isDarkMode
                  ? 'bg-gradient-to-br from-purple-900/50 to-purple-800/50 hover:from-purple-800 hover:to-purple-700'
                  : 'bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200'
              }`}
            >
              <div className="text-5xl mb-4">📝</div>
              <h3 className={`text-2xl font-bold mb-3 ${
                isDarkMode ? 'text-white' : 'text-brand-text'
              }`}>
                Blog de QA
              </h3>
              <p className={`mb-4 ${
                isDarkMode ? 'text-purple-200' : 'text-gray-700'
              }`}>
                Artículos sobre testing, automatización, IA y buenas prácticas. Casos reales de Paraguay y LATAM.
              </p>
              <div className={`inline-flex items-center gap-2 font-semibold ${
                isDarkMode ? 'text-purple-300' : 'text-purple-700'
              }`}>
                Leer artículos
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </Link>

            {/* GitHub */}
            <a
              href="https://github.com/stevenayal/aiquaa"
              target="_blank"
              rel="noopener noreferrer"
              className={`group rounded-xl p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${
                isDarkMode
                  ? 'bg-gradient-to-br from-blue-900/50 to-blue-800/50 hover:from-blue-800 hover:to-blue-700'
                  : 'bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200'
              }`}
            >
              <div className="text-5xl mb-4">
                <svg className="w-12 h-12 inline-block" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className={`text-2xl font-bold mb-3 ${
                isDarkMode ? 'text-white' : 'text-brand-text'
              }`}>
                Open Source
              </h3>
              <p className={`mb-4 ${
                isDarkMode ? 'text-blue-200' : 'text-gray-700'
              }`}>
                Contribuí al código, reportá bugs, sugiere features. Todo es público y transparente.
              </p>
              <div className={`inline-flex items-center gap-2 font-semibold ${
                isDarkMode ? 'text-blue-300' : 'text-blue-700'
              }`}>
                Ver en GitHub
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </a>

            {/* Comunidad */}
            <Link
              href="/comunidad"
              className={`group rounded-xl p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${
                isDarkMode
                  ? 'bg-gradient-to-br from-green-900/50 to-green-800/50 hover:from-green-800 hover:to-green-700'
                  : 'bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200'
              }`}
            >
              <div className="text-5xl mb-4">🎓</div>
              <h3 className={`text-2xl font-bold mb-3 ${
                isDarkMode ? 'text-white' : 'text-brand-text'
              }`}>
                Mentorías y Eventos
              </h3>
              <p className={`mb-4 ${
                isDarkMode ? 'text-green-200' : 'text-gray-700'
              }`}>
                Workshops, charlas, mentorías 1-on-1 y un espacio para compartir experiencias con otros testers.
              </p>
              <div className={`inline-flex items-center gap-2 font-semibold ${
                isDarkMode ? 'text-green-300' : 'text-green-700'
              }`}>
                Unirse ahora
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </Link>
          </div>

          {/* Call to Action */}
          <div className={`mt-12 text-center p-8 rounded-2xl ${
            isDarkMode
              ? 'bg-gradient-to-r from-indigo-900/30 to-purple-900/30 border border-indigo-700/50'
              : 'bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200'
          }`}>
            <p className={`text-xl md:text-2xl font-semibold mb-2 ${
              isDarkMode ? 'text-white' : 'text-brand-text'
            }`}>
              ¿Listo para empezar?
            </p>
            <p className={`text-base ${
              isDarkMode ? 'text-slate-300' : 'text-gray-600'
            }`}>
              Explorá las herramientas, lee el blog, colabora en GitHub y únete a la comunidad
            </p>
          </div>
        </div>
      </section>

      {/* Herramientas Labs Section */}
      <section className={`py-12 md:py-16 transition-colors duration-300 ${
        isDarkMode ? 'bg-slate-900' : 'bg-white'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 md:mb-12">
            <h2 className={`text-2xl md:text-3xl font-bold mb-4 ${
              isDarkMode ? 'text-white' : 'text-brand-text'
            }`}>
              💡 Herramientas Gratuitas para Testers
            </h2>
            <p className={`text-base md:text-lg px-4 ${
              isDarkMode ? 'text-slate-300' : 'text-brand-text'
            }`}>
              Explorá nuestras utilidades web para testers funcionales, automatizadores y QA manual
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Validador de JSON */}
            <div className={`rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
              isDarkMode ? 'bg-slate-800' : 'bg-brand-light'
            }`}>
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 md:p-6 text-white">
                <div className="text-2xl md:text-3xl mb-2">🔍</div>
                <h3 className="text-lg md:text-xl font-bold">Validador de JSON</h3>
                <p className="text-blue-100 text-sm">Valida y formatea JSON de forma instantánea</p>
              </div>
              <div className="p-4 md:p-6">
                <p className={`text-sm mb-4 ${
                  isDarkMode ? 'text-slate-300' : 'text-brand-text'
                }`}>
                  Herramienta esencial para validar respuestas de API, configuraciones y datos JSON.
                </p>
                <Link
                  href="/labs/json-validator"
                  className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                >
                  Usar Validador →
                </Link>
              </div>
            </div>

            {/* Generador de Datos */}
            <div className={`rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
              isDarkMode ? 'bg-slate-800' : 'bg-brand-light'
            }`}>
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 md:p-6 text-white">
                <div className="text-2xl md:text-3xl mb-2">🎲</div>
                <h3 className="text-lg md:text-xl font-bold">Generador de Datos</h3>
                <p className="text-green-100 text-sm">Genera datos de prueba realistas</p>
              </div>
              <div className="p-4 md:p-6">
                <p className={`text-sm mb-4 ${
                  isDarkMode ? 'text-slate-300' : 'text-brand-text'
                }`}>
                  Crea datos de prueba para formularios, APIs y bases de datos de forma rápida.
                </p>
                <Link
                  href="/labs/data-generator"
                  className="inline-block bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition"
                >
                  Generar Datos →
                </Link>
              </div>
            </div>

            {/* Checklist de Pruebas */}
            <div className={`rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
              isDarkMode ? 'bg-slate-800' : 'bg-brand-light'
            }`}>
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 md:p-6 text-white">
                <div className="text-2xl md:text-3xl mb-2">✅</div>
                <h3 className="text-lg md:text-xl font-bold">Checklist de Pruebas</h3>
                <p className="text-purple-100 text-sm">Organiza y gestiona tus pruebas</p>
              </div>
              <div className="p-4 md:p-6">
                <p className={`text-sm mb-4 ${
                  isDarkMode ? 'text-slate-300' : 'text-brand-text'
                }`}>
                  Crea y gestiona listas de verificación para diferentes tipos de pruebas.
                </p>
                <Link
                  href="/labs/checklist"
                  className="inline-block bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition"
                >
                  Crear Checklist →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Member */}
      <FeaturedMember />

      {/* FAQ Section */}
      <FAQSection />
    </div>
  );
}
