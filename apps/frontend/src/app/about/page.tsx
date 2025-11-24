'use client';

import Image from 'next/image';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import FAQSection from '@/components/FAQSection';
import { SuruFloating } from '@/components/Suru';

export default function AboutPage() {
  const { isDarkMode } = useTheme();
  const { t } = useLanguage();

  return (
    <div className={`min-h-screen py-12 md:py-16 transition-colors duration-300 ${
      isDarkMode ? 'bg-slate-900' : 'bg-brand-light'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className={`text-4xl md:text-5xl font-bold mb-6 ${
            isDarkMode ? 'text-white' : 'text-brand-text'
          }`}>
            {t('about.title')}
          </h1>
          <p className={`text-xl max-w-3xl mx-auto ${
            isDarkMode ? 'text-slate-300' : 'text-brand-muted'
          }`}>
            {t('about.tagline')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className={`text-3xl font-bold mb-6 ${
              isDarkMode ? 'text-white' : 'text-brand-text'
            }`}>
              {t('about.what.title')}
            </h2>
            <p className={`text-lg mb-4 ${
              isDarkMode ? 'text-slate-300' : 'text-brand-text'
            }`}>
              {t('about.what.desc1')}
            </p>
            <p className={`text-lg ${
              isDarkMode ? 'text-slate-300' : 'text-brand-text'
            }`}>
              {t('about.what.desc2')}
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
            }`}>{t('about.mission.title')}</h3>
            <p className={isDarkMode ? 'text-slate-400' : 'text-brand-muted'}>
              {t('about.mission.desc')}
            </p>
          </div>
          <div className={`text-center p-6 rounded-lg shadow-lg transition-colors duration-300 ${
            isDarkMode ? 'bg-slate-800' : 'bg-white'
          }`}>
            <div className="text-4xl mb-4">🌟</div>
            <h3 className={`text-xl font-bold mb-3 ${
              isDarkMode ? 'text-white' : 'text-brand-text'
            }`}>{t('about.vision.title')}</h3>
            <p className={isDarkMode ? 'text-slate-400' : 'text-brand-muted'}>
              {t('about.vision.desc')}
            </p>
          </div>
          <div className={`text-center p-6 rounded-lg shadow-lg transition-colors duration-300 ${
            isDarkMode ? 'bg-slate-800' : 'bg-white'
          }`}>
            <div className="text-4xl mb-4">💡</div>
            <h3 className={`text-xl font-bold mb-3 ${
              isDarkMode ? 'text-white' : 'text-brand-text'
            }`}>{t('about.values.title')}</h3>
            <p className={isDarkMode ? 'text-slate-400' : 'text-brand-muted'}>
              {t('about.values.desc')}
            </p>
          </div>
        </div>

        <div className={`rounded-lg shadow-lg p-8 transition-colors duration-300 ${
          isDarkMode ? 'bg-slate-800' : 'bg-white'
        }`}>
          <h2 className={`text-3xl font-bold mb-6 text-center ${
            isDarkMode ? 'text-white' : 'text-brand-text'
          }`}>
            {t('about.tools.title')}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4">
              <div className="text-3xl mb-2">🔍</div>
              <h4 className={`font-semibold ${
                isDarkMode ? 'text-white' : 'text-brand-text'
              }`}>{t('about.tools.validator')}</h4>
              <p className={`text-sm ${
                isDarkMode ? 'text-slate-400' : 'text-brand-muted'
              }`}>{t('about.tools.validator.desc')}</p>
            </div>
            <div className="text-center p-4">
              <div className="text-3xl mb-2">📊</div>
              <h4 className={`font-semibold ${
                isDarkMode ? 'text-white' : 'text-brand-text'
              }`}>{t('about.tools.generator')}</h4>
              <p className={`text-sm ${
                isDarkMode ? 'text-slate-400' : 'text-brand-muted'
              }`}>{t('about.tools.generator.desc')}</p>
            </div>
            <div className="text-center p-4">
              <div className="text-3xl mb-2">✅</div>
              <h4 className={`font-semibold ${
                isDarkMode ? 'text-white' : 'text-brand-text'
              }`}>{t('about.tools.checklist')}</h4>
              <p className={`text-sm ${
                isDarkMode ? 'text-slate-400' : 'text-brand-muted'
              }`}>{t('about.tools.checklist.desc')}</p>
            </div>
            <div className="text-center p-4">
              <div className="text-3xl mb-2">🔐</div>
              <h4 className={`font-semibold ${
                isDarkMode ? 'text-white' : 'text-brand-text'
              }`}>{t('about.tools.jwt')}</h4>
              <p className={`text-sm ${
                isDarkMode ? 'text-slate-400' : 'text-brand-muted'
              }`}>{t('about.tools.jwt.desc')}</p>
            </div>
          </div>
        </div>

        {/* Founder Section */}
        <div className={`mt-16 rounded-lg shadow-lg p-8 transition-colors duration-300 ${
          isDarkMode ? 'bg-slate-800' : 'bg-white'
        }`}>
          <h2 className={`text-3xl font-bold mb-8 text-center ${
            isDarkMode ? 'text-white' : 'text-brand-text'
          }`}>
            {t('about.founder.title')}
          </h2>

          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Founder Avatar/Info */}
            <div className="flex-shrink-0">
              <div className={`w-32 h-32 rounded-full flex items-center justify-center text-6xl ${
                isDarkMode ? 'bg-slate-700' : 'bg-brand-light'
              }`}>
                👨‍💻
              </div>
            </div>

            {/* Founder Description */}
            <div className="flex-1">
              <h3 className={`text-2xl font-bold mb-2 ${
                isDarkMode ? 'text-white' : 'text-brand-text'
              }`}>
                Steven Ayala
              </h3>
              <p className={`text-lg mb-4 ${
                isDarkMode ? 'text-slate-300' : 'text-brand-text'
              }`}>
                {t('about.founder.role')}
              </p>
              <p className={`mb-6 ${
                isDarkMode ? 'text-slate-400' : 'text-brand-muted'
              }`}>
                {t('about.founder.bio')}
              </p>

              {/* Social Links */}
              <div className="flex flex-wrap gap-4">
                <a
                  href="https://www.linkedin.com/in/stevenayal/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                    isDarkMode
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  LinkedIn
                </a>

                <a
                  href="https://github.com/stevenayal"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                    isDarkMode
                      ? 'bg-slate-700 hover:bg-slate-600 text-white'
                      : 'bg-slate-800 hover:bg-slate-700 text-white'
                  }`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                  GitHub
                </a>

                <a
                  href="https://dev.to/stevenayal"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                    isDarkMode
                      ? 'bg-slate-700 hover:bg-slate-600 text-white'
                      : 'bg-slate-800 hover:bg-slate-700 text-white'
                  }`}
                >
                  <span className="text-lg">📝</span>
                  Blog
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <FAQSection />
      </div>

      {/* Suru mascot explaining about AIQUAA */}
      <SuruFloating pose="explaining" position="bottom-right" />
    </div>
  );
}
