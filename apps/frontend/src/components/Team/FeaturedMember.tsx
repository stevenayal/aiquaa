'use client';

import { useTheme } from '@/contexts/ThemeContext';

const FeaturedMember = () => {
  const { isDarkMode } = useTheme();

  return (
    <section className={`py-12 md:py-16 transition-colors duration-300 ${
      isDarkMode ? 'bg-slate-800' : 'bg-brand-light'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className={`text-2xl md:text-3xl font-bold mb-4 ${
            isDarkMode ? 'text-white' : 'text-brand-text'
          }`}>
            👨‍💻 Conocé a Nuestro Fundador
          </h2>
        </div>

        {/* Profile Card */}
        <div className={`rounded-2xl shadow-2xl p-8 max-w-5xl mx-auto text-white transition-colors duration-300 ${
          isDarkMode
            ? 'bg-gradient-to-br from-slate-700 to-slate-800'
            : 'bg-gradient-to-br from-slate-800 to-slate-900'
        }`}>
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Left Section - Detailed Information */}
            <div className="flex-1 space-y-6">
              {/* Name and Title */}
              <div>
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  Steven Ayala
                </h3>
                <p className="text-emerald-400 text-xl font-semibold mb-1">
                  QA Lead & Automation Engineer
                </p>
                <p className="text-gray-300 text-lg">
                  Especialista en Calidad de Software
                </p>
              </div>
              
              {/* Location */}
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-300">Paraguay</span>
              </div>
              
              {/* Biography */}
              <p className="text-gray-200 text-lg leading-relaxed">
                Tester certificado ISTQB con más de 6 años de experiencia en QA, 
                automatización y mejora continua del software. Apasionado por la 
                formación, automatización y la innovación tecnológica. Enfocado en 
                construir herramientas que empoderen a la comunidad QA de Paraguay 
                y Latinoamérica.
              </p>
              
              {/* Skills Section */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                  </svg>
                  <h4 className="text-xl font-bold text-white">Habilidades Principales</h4>
                </div>
                <div className="flex flex-wrap gap-3">
                  <span className="border border-emerald-400 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-emerald-400 hover:text-slate-900 transition-colors">
                    QA Manual y Automatizado
                  </span>
                  <span className="border border-emerald-400 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-emerald-400 hover:text-slate-900 transition-colors">
                    Selenium / Cypress
                  </span>
                  <span className="border border-emerald-400 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-emerald-400 hover:text-slate-900 transition-colors">
                    API Testing
                  </span>
                  <span className="border border-emerald-400 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-emerald-400 hover:text-slate-900 transition-colors">
                    CI/CD Pipelines
                  </span>
                  <span className="border border-emerald-400 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-emerald-400 hover:text-slate-900 transition-colors">
                    Liderazgo de Equipos
                  </span>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  Ver LinkedIn
                </button>
                <button className="border-2 border-white text-white hover:bg-white hover:text-slate-900 px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Ver Herramientas
                </button>
              </div>
            </div>
            
            {/* Right Section - Summary Information */}
            <div className="lg:w-48 space-y-6">
              {/* Avatar */}
              <div className="flex justify-center lg:justify-start">
                <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">SA</span>
                </div>
              </div>
              
              {/* Experience */}
              <div className="text-center lg:text-left">
                <div className="text-3xl font-bold text-white">8+</div>
                <div className="text-sm text-gray-300">Años de Experiencia</div>
              </div>
              
              {/* Certifications */}
              <div className="text-center lg:text-left">
                <div className="text-lg font-bold text-white">ISTQB</div>
                <div className="text-sm text-gray-300">Certificado</div>
              </div>
              
              {/* Role */}
              <div className="text-center lg:text-left">
                <div className="text-lg font-bold text-white">AIQUAA</div>
                <div className="text-sm text-gray-300">Fundador</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedMember;
