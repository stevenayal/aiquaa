'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

export default function CollaborationSection() {
  const { isDarkMode } = useTheme();
  const { t } = useLanguage();

  const examples = [
    t('collaboration.examples.1'),
    t('collaboration.examples.2'),
    t('collaboration.examples.3'),
    t('collaboration.examples.4'),
  ];

  return (
    <section className={`py-12 transition-colors duration-300 ${
      isDarkMode ? 'bg-slate-800' : 'bg-white'
    }`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`rounded-xl p-8 md:p-12 border-2 ${
          isDarkMode
            ? 'bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/30'
            : 'bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200'
        }`}>
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-4 bg-purple-100 dark:bg-purple-900/40 rounded-full mb-4">
              <span className="text-4xl">💡</span>
            </div>
            <h2 className={`text-2xl md:text-3xl font-bold mb-4 ${
              isDarkMode ? 'text-white' : 'text-brand-text'
            }`}>
              {t('collaboration.title')}
            </h2>
            <p className={`text-lg ${
              isDarkMode ? 'text-slate-300' : 'text-brand-muted'
            }`}>
              {t('collaboration.description')}
            </p>
          </div>

          {/* Examples */}
          <div className={`rounded-lg p-6 mb-8 ${
            isDarkMode ? 'bg-slate-700/50' : 'bg-white/80'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 ${
              isDarkMode ? 'text-white' : 'text-brand-text'
            }`}>
              {t('collaboration.examples.title')}
            </h3>
            <ul className="space-y-2">
              {examples.map((example, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="flex-shrink-0 mt-1">💡</span>
                  <span className={isDarkMode ? 'text-slate-300' : 'text-brand-text'}>
                    {example}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA Button */}
          <div className="text-center">
            <a
              href="https://github.com/stevenayal/aiquaa/discussions/new?category=ideas"
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl ${
                isDarkMode
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white'
                  : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white'
              }`}
            >
              <span>🚀</span>
              {t('collaboration.cta')}
            </a>
          </div>

          {/* Sub-text */}
          <p className={`text-center mt-6 text-sm ${
            isDarkMode ? 'text-slate-400' : 'text-brand-muted'
          }`}>
            📺 Inspírate en los <a
              href="https://www.youtube.com/@aiquaa/videos"
              target="_blank"
              rel="noopener noreferrer"
              className={`underline ${
                isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
              }`}
            >
              videos de nuestro canal
            </a> y en tus necesidades diarias como tester
          </p>
        </div>
      </div>
    </section>
  );
}
