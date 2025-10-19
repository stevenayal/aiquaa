'use client';

import Image from 'next/image';
import { useTheme } from '@/contexts/ThemeContext';

export default function AboutPage() {
  const { isDarkMode } = useTheme();

  return (
    <div className={`min-h-screen py-12 md:py-16 transition-colors duration-300 ${
      isDarkMode ? 'bg-slate-900' : 'bg-brand-light'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className={`text-4xl md:text-5xl font-bold mb-6 ${
            isDarkMode ? 'text-white' : 'text-brand-text'
          }`}>
            Acerca de AIQUAA
          </h1>
          <p className={`text-xl max-w-3xl mx-auto ${
            isDarkMode ? 'text-slate-300' : 'text-brand-muted'
          }`}>
            Saber es Calidad. Inspirados por el conocimiento, impulsados por la comunidad.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className={`text-3xl font-bold mb-6 ${
              isDarkMode ? 'text-white' : 'text-brand-text'
            }`}>
              ¿Qué es AIQUAA?
            </h2>
            <p className={`text-lg mb-4 ${
              isDarkMode ? 'text-slate-300' : 'text-brand-text'
            }`}>
              AIQUAA es una iniciativa paraguaya que fusiona conocimiento local con innovación global
              en testing de software. Inspirada en el término guaraní &ldquo;aikuaa&rdquo; —que significa
              saber o conocer—, nuestra misión es construir una comunidad comprometida con la calidad,
              la capacitación constante y la excelencia profesional.
            </p>
            <p className={`text-lg ${
              isDarkMode ? 'text-slate-300' : 'text-brand-text'
            }`}>
              Combinamos inteligencia artificial (AI) con aseguramiento de calidad (QA) para transformar
              el testing en Paraguay y en la región.
            </p>
          </div>
          <div className="text-center">
            <div className={`inline-flex items-center justify-center p-6 rounded-lg shadow-lg transition-colors duration-300 ${
              isDarkMode ? 'bg-slate-800' : 'bg-brand-dark'
            }`}>
              <Image
                src="/images/logo1.png"
                alt="AIQUAA Logo"
                width={256}
                height={256}
                className="w-64 h-64 object-contain"
                priority
              />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className={`text-center p-6 rounded-lg shadow-lg transition-colors duration-300 ${
            isDarkMode ? 'bg-slate-800' : 'bg-white'
          }`}>
            <div className="text-4xl mb-4">🎯</div>
            <h3 className={`text-xl font-bold mb-3 ${
              isDarkMode ? 'text-white' : 'text-brand-text'
            }`}>Misión</h3>
            <p className={isDarkMode ? 'text-slate-400' : 'text-brand-muted'}>
              Construir la comunidad de QA más fuerte de Paraguay, brindando herramientas,
              recursos y capacitación de calidad.
            </p>
          </div>
          <div className={`text-center p-6 rounded-lg shadow-lg transition-colors duration-300 ${
            isDarkMode ? 'bg-slate-800' : 'bg-white'
          }`}>
            <div className="text-4xl mb-4">🌟</div>
            <h3 className={`text-xl font-bold mb-3 ${
              isDarkMode ? 'text-white' : 'text-brand-text'
            }`}>Visión</h3>
            <p className={isDarkMode ? 'text-slate-400' : 'text-brand-muted'}>
              Ser el referente en testing y calidad de software en Paraguay,
              impulsando la innovación y el desarrollo profesional.
            </p>
          </div>
          <div className={`text-center p-6 rounded-lg shadow-lg transition-colors duration-300 ${
            isDarkMode ? 'bg-slate-800' : 'bg-white'
          }`}>
            <div className="text-4xl mb-4">💡</div>
            <h3 className={`text-xl font-bold mb-3 ${
              isDarkMode ? 'text-white' : 'text-brand-text'
            }`}>Valores</h3>
            <p className={isDarkMode ? 'text-slate-400' : 'text-brand-muted'}>
              Calidad, innovación, comunidad, aprendizaje continuo y excelencia
              en todo lo que hacemos.
            </p>
          </div>
        </div>

        <div className={`rounded-lg shadow-lg p-8 transition-colors duration-300 ${
          isDarkMode ? 'bg-slate-800' : 'bg-white'
        }`}>
          <h2 className={`text-3xl font-bold mb-6 text-center ${
            isDarkMode ? 'text-white' : 'text-brand-text'
          }`}>
            Nuestras Herramientas
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4">
              <div className="text-3xl mb-2">🔍</div>
              <h4 className={`font-semibold ${
                isDarkMode ? 'text-white' : 'text-brand-text'
              }`}>Validador JSON</h4>
              <p className={`text-sm ${
                isDarkMode ? 'text-slate-400' : 'text-brand-muted'
              }`}>Valida y formatea JSON</p>
            </div>
            <div className="text-center p-4">
              <div className="text-3xl mb-2">📊</div>
              <h4 className={`font-semibold ${
                isDarkMode ? 'text-white' : 'text-brand-text'
              }`}>Generador de Datos</h4>
              <p className={`text-sm ${
                isDarkMode ? 'text-slate-400' : 'text-brand-muted'
              }`}>Crea datos de prueba</p>
            </div>
            <div className="text-center p-4">
              <div className="text-3xl mb-2">✅</div>
              <h4 className={`font-semibold ${
                isDarkMode ? 'text-white' : 'text-brand-text'
              }`}>Checklist</h4>
              <p className={`text-sm ${
                isDarkMode ? 'text-slate-400' : 'text-brand-muted'
              }`}>Listas de verificación</p>
            </div>
            <div className="text-center p-4">
              <div className="text-3xl mb-2">🔐</div>
              <h4 className={`font-semibold ${
                isDarkMode ? 'text-white' : 'text-brand-text'
              }`}>Decodificador JWT</h4>
              <p className={`text-sm ${
                isDarkMode ? 'text-slate-400' : 'text-brand-muted'
              }`}>Analiza tokens JWT</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
