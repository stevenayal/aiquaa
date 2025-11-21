'use client';

import Image from 'next/image';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

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
      </div>
    </div>
  );
}
