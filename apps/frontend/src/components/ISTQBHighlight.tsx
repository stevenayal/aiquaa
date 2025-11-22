'use client';

import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ISTQBHighlight() {
  const { isDarkMode } = useTheme();
  const { t } = useLanguage();

  const features = [
    t('istqb.simulator.features.1'),
    t('istqb.simulator.features.2'),
    t('istqb.simulator.features.3'),
    t('istqb.simulator.features.4'),
  ];

  return (
    <section className={`py-16 transition-colors duration-300 ${
      isDarkMode ? 'bg-slate-900' : 'bg-brand-light'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`rounded-2xl shadow-2xl overflow-hidden ${
          isDarkMode ? 'bg-gradient-to-br from-slate-800 to-slate-700' : 'bg-gradient-to-br from-white to-gray-50'
        }`}>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Left Column - Content */}
            <div className="p-8 md:p-12">
              <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 px-4 py-2 rounded-full mb-6">
                <span className="text-2xl">📝</span>
                <span className={`text-sm font-semibold ${
                  isDarkMode ? 'text-blue-300' : 'text-blue-700'
                }`}>
                  ISTQB CTFL v4.0
                </span>
              </div>

              <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${
                isDarkMode ? 'text-white' : 'text-brand-text'
              }`}>
                {t('istqb.simulator.title')}
              </h2>

              <p className={`text-lg mb-6 ${
                isDarkMode ? 'text-slate-300' : 'text-brand-muted'
              }`}>
                {t('istqb.simulator.description')}
              </p>

              {/* Features List */}
              <ul className="space-y-3 mb-8">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span className={isDarkMode ? 'text-slate-300' : 'text-brand-text'}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/recursos"
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                    isDarkMode
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  <span>📚</span>
                  {t('istqb.simulator.resources')}
                </Link>
                <a
                  href="https://www.youtube.com/@aiquaa/videos"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                    isDarkMode
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  <span>📺</span>
                  {t('istqb.simulator.videos')}
                </a>
              </div>
            </div>

            {/* Right Column - Visual */}
            <div className={`p-8 md:p-12 ${
              isDarkMode ? 'bg-slate-700/50' : 'bg-blue-50'
            }`}>
              <div className="relative">
                {/* Decorative Elements */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-500 rounded-full opacity-20 blur-2xl"></div>
                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-green-500 rounded-full opacity-20 blur-2xl"></div>

                {/* Main Icon/Illustration */}
                <div className="relative z-10 text-center">
                  <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full mb-6 ${
                    isDarkMode ? 'bg-slate-600' : 'bg-white'
                  }`}>
                    <span className="text-6xl">🎓</span>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mt-8">
                    <div className={`p-4 rounded-lg ${
                      isDarkMode ? 'bg-slate-600' : 'bg-white'
                    }`}>
                      <div className={`text-3xl font-bold mb-1 ${
                        isDarkMode ? 'text-blue-400' : 'text-blue-600'
                      }`}>
                        97
                      </div>
                      <div className={`text-sm ${
                        isDarkMode ? 'text-slate-400' : 'text-brand-muted'
                      }`}>
                        Páginas Syllabus
                      </div>
                    </div>
                    <div className={`p-4 rounded-lg ${
                      isDarkMode ? 'bg-slate-600' : 'bg-white'
                    }`}>
                      <div className={`text-3xl font-bold mb-1 ${
                        isDarkMode ? 'text-green-400' : 'text-green-600'
                      }`}>
                        80+
                      </div>
                      <div className={`text-sm ${
                        isDarkMode ? 'text-slate-400' : 'text-brand-muted'
                      }`}>
                        Preguntas
                      </div>
                    </div>
                    <div className={`p-4 rounded-lg col-span-2 ${
                      isDarkMode ? 'bg-slate-600' : 'bg-white'
                    }`}>
                      <div className={`text-3xl font-bold mb-1 ${
                        isDarkMode ? 'text-purple-400' : 'text-purple-600'
                      }`}>
                        100%
                      </div>
                      <div className={`text-sm ${
                        isDarkMode ? 'text-slate-400' : 'text-brand-muted'
                      }`}>
                        Gratis y en Español
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
