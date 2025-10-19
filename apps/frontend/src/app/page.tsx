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
      <section className="py-20 bg-gradient-to-b from-slate-900 to-slate-950 text-white text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
            Herramientas para QA en Paraguay - AIQUAA
          </h1>
          <p className="mt-4 text-lg md:text-xl text-gray-300">
            Desde validadores de JSON hasta generadores de datos: todo lo que necesitás para automatizar, validar y crecer como QA. Gratis, en español y hecho por testers locales para testers arriero porte.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/labs"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              🚀 Empezar a Usar Herramientas
            </Link>
          </div>

          <div className="mt-8 text-sm text-green-400">
            ✅ Ya usamos estas herramientas en +20 proyectos reales en Paraguay
          </div>
        </div>
      </section>

      {/* Urgency Message */}
      <div className={`py-2 px-4 text-center text-sm font-semibold transition-colors duration-300 ${
        isDarkMode
          ? 'bg-yellow-600 text-white'
          : 'bg-yellow-300 text-black'
      }`}>
        📢 ¡Estamos en fase piloto! Usá las herramientas y ayudanos a construir la comunidad de QA más fuerte de Paraguay.
      </div>

      {/* Presentación Institucional */}
      <section className={`py-12 md:py-16 px-4 md:px-6 text-center shadow-sm transition-colors duration-300 ${
        isDarkMode
          ? 'bg-slate-800 text-slate-100'
          : 'bg-brand-light text-brand-text'
      }`}>
        <h2 className={`text-2xl md:text-3xl font-bold mb-4 ${
          isDarkMode ? 'text-blue-400' : 'text-brand-accent'
        }`}>¿Qué es AIQUAA?</h2>
        <p className={`text-base md:text-lg max-w-3xl mx-auto mb-6 px-4 ${
          isDarkMode ? 'text-slate-300' : 'text-brand-text'
        }`}>
          AIQUAA es una iniciativa paraguaya que fusiona conocimiento local con innovación global en testing de software.
          Inspirada en el término guaraní &ldquo;aikuaa&rdquo; —que significa saber o conocer—, nuestra misión es construir una comunidad
          comprometida con la calidad, la capacitación constante y la excelencia profesional. Combinamos inteligencia artificial (AI)
          con aseguramiento de calidad (QA) para transformar el testing en Paraguay y en la región.
        </p>
        <p className={`text-sm md:text-base lg:text-lg max-w-4xl mx-auto px-4 ${
          isDarkMode ? 'text-slate-200' : 'text-brand-text'
        }`}>
          <strong className={isDarkMode ? 'text-white' : ''}>AIQUAA es una comunidad de testing y calidad de software en Paraguay.</strong> Brindamos recursos, mentorías, eventos y contenido sobre automatización, buenas prácticas y formación en QA. Nuestras herramientas gratuitas incluyen validador de JSON, generador de datos, checklist de pruebas, decodificador Base64 y decodificador JWT, diseñadas específicamente para testers funcionales, automatizadores y QA manual.
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
