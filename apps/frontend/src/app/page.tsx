'use client';

import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
import FeaturedMember from '@/components/Team/FeaturedMember';
import FAQSection from '@/components/FAQSection';

export default function HomePage() {
  const { isDarkMode } = useTheme();

  return (
    <div className={isDarkMode ? 'dark' : ''}>
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
