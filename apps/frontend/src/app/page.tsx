'use client';

import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import FeaturedMember from '@/components/Team/FeaturedMember';
import FAQSection from '@/components/FAQSection';
import YouTubeSection from '@/components/YouTubeSection';
import ISTQBHighlight from '@/components/ISTQBHighlight';

export default function HomePage() {
  const { isDarkMode } = useTheme();
  const { t } = useLanguage();

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      {/* Hero Section - Optimized for Conversion */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-16 md:py-24 lg:py-28">
            <div className="grid lg:grid-cols-2 gap-12 items-center">

              {/* Left Column - Content */}
              <div className="text-center lg:text-left space-y-8">
                {/* Headline - Benefit-focused */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
                  {t('home.hero.title')}
                </h1>

                {/* Subtitle - 1-2 sentences explaining value */}
                <p className="text-lg sm:text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  {t('home.hero.subtitle')}
                </p>

                {/* CTA Buttons - Primary prominent, Secondary subtle */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  {/* Primary CTA - High contrast */}
                  <Link
                    href="/comunidad"
                    className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-2xl hover:shadow-indigo-500/50 transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-500/50"
                  >
                    <span className="relative z-10">{t('home.hero.cta.primary')}</span>
                    <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                  </Link>

                  {/* Secondary CTA - Less prominent */}
                  <Link
                    href="/labs"
                    className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-slate-300 border-2 border-slate-600 rounded-xl hover:bg-slate-800/50 hover:border-slate-500 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-slate-500/50"
                  >
                    {t('home.hero.cta.secondary')}
                  </Link>
                </div>

                {/* Trust Badges - Discrete */}
                <div className="flex flex-wrap justify-center lg:justify-start gap-6 pt-4">
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    <span>{t('home.hero.trust.free')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    <span>{t('home.hero.trust.opensource')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    <span>{t('home.hero.trust.spanish')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <span className="text-green-400">🇵🇾</span>
                    <span>{t('home.hero.trust.paraguay')}</span>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-6 pt-8 max-w-lg mx-auto lg:mx-0">
                  <div className="text-center lg:text-left">
                    <div className="text-3xl font-bold text-white">10+</div>
                    <div className="text-sm text-slate-400 mt-1">{t('home.hero.stats.tools')}</div>
                  </div>
                  <div className="text-center lg:text-left">
                    <div className="text-3xl font-bold text-white">50+</div>
                    <div className="text-sm text-slate-400 mt-1">{t('home.hero.stats.resources')}</div>
                  </div>
                  <div className="text-center lg:text-left">
                    <div className="text-3xl font-bold text-white">100+</div>
                    <div className="text-sm text-slate-400 mt-1">{t('home.hero.stats.community')}</div>
                  </div>
                </div>
              </div>

              {/* Right Column - Visual Support */}
              <div className="hidden lg:flex justify-center items-center">
                <div className="relative">
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/30 to-purple-500/30 rounded-full blur-3xl"></div>

                  {/* Main visual - Logo */}
                  <div className="relative bg-slate-800/50 backdrop-blur-sm rounded-2xl p-12 border border-slate-700/50 shadow-2xl">
                    <div className="relative z-10">
                      <img
                        src="/images/logo1.png"
                        alt="AIQUAA Logo"
                        className="w-64 h-64 object-contain"
                        loading="eager"
                      />
                    </div>

                    {/* Floating badges around logo */}
                    <div className="absolute -top-4 -right-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-bounce">
                      ISTQB Ready
                    </div>
                    <div className="absolute -bottom-4 -left-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-bounce" style={{animationDelay: '0.5s'}}>
                      JMeter Pro
                    </div>
                  </div>

                  {/* Decorative elements */}
                  <div className="absolute -top-8 -left-8 w-24 h-24 bg-indigo-500/20 rounded-full blur-2xl"></div>
                  <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl"></div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Bottom wave separator */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
      </section>

      {/* Community Banner */}
      <div className={`py-3 px-4 text-center text-sm font-semibold transition-colors duration-300 ${
        isDarkMode
          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
          : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
      }`}>
        <span className="inline-flex items-center gap-2">
          <span className="text-lg">🌟</span>
          <span>{t('home.banner')}</span>
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
        }`}>{t('home.what.title')}</h2>

        <p className={`text-lg md:text-xl max-w-3xl mx-auto mb-8 px-4 leading-relaxed ${
          isDarkMode ? 'text-slate-200' : 'text-brand-text'
        }`}>
          <strong className={isDarkMode ? 'text-white' : ''}>{t('home.what.description')}</strong>
        </p>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto px-4">
          <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-slate-700/50' : 'bg-white'}`}>
            <div className="text-4xl mb-4">🛠️</div>
            <h3 className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-brand-text'}`}>
              {t('home.what.resources.title')}
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>
              {t('home.what.resources.description')}
            </p>
          </div>

          <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-slate-700/50' : 'bg-white'}`}>
            <div className="text-4xl mb-4">🎓</div>
            <h3 className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-brand-text'}`}>
              {t('home.what.events.title')}
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>
              {t('home.what.events.description')}
            </p>
          </div>

          <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-slate-700/50' : 'bg-white'}`}>
            <div className="text-4xl mb-4">🤝</div>
            <h3 className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-brand-text'}`}>
              {t('home.what.opensource.title')}
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>
              {t('home.what.opensource.description')}
            </p>
          </div>
        </div>

        <p className={`text-sm md:text-base max-w-3xl mx-auto mt-8 px-4 italic ${
          isDarkMode ? 'text-slate-400' : 'text-gray-500'
        }`}>
          {t('home.what.mission')}
        </p>
      </section>

      {/* ISTQB Simulator Highlight */}
      <ISTQBHighlight />

      {/* YouTube Section */}
      <YouTubeSection />

      {/* Community Engagement Section */}
      <section className={`py-16 md:py-20 transition-colors duration-300 ${
        isDarkMode ? 'bg-slate-900' : 'bg-white'
      }`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${
              isDarkMode ? 'text-white' : 'text-brand-text'
            }`}>
              {t('home.grow.title')}
            </h2>
            <p className={`text-lg ${
              isDarkMode ? 'text-slate-300' : 'text-gray-600'
            }`}>
              {t('home.grow.subtitle')}
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
                {t('home.blog.title')}
              </h3>
              <p className={`mb-4 ${
                isDarkMode ? 'text-purple-200' : 'text-gray-700'
              }`}>
                {t('home.blog.description')}
              </p>
              <div className={`inline-flex items-center gap-2 font-semibold ${
                isDarkMode ? 'text-purple-300' : 'text-purple-700'
              }`}>
                {t('home.blog.action')}
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
                {t('home.what.opensource.title')}
              </h3>
              <p className={`mb-4 ${
                isDarkMode ? 'text-blue-200' : 'text-gray-700'
              }`}>
                {t('home.opensource.description')}
              </p>
              <div className={`inline-flex items-center gap-2 font-semibold ${
                isDarkMode ? 'text-blue-300' : 'text-blue-700'
              }`}>
                {t('home.opensource.action')}
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
                {t('home.mentoring.title')}
              </h3>
              <p className={`mb-4 ${
                isDarkMode ? 'text-green-200' : 'text-gray-700'
              }`}>
                {t('home.mentoring.description')}
              </p>
              <div className={`inline-flex items-center gap-2 font-semibold ${
                isDarkMode ? 'text-green-300' : 'text-green-700'
              }`}>
                {t('home.mentoring.action')}
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
              {t('home.cta.title')}
            </p>
            <p className={`text-base ${
              isDarkMode ? 'text-slate-300' : 'text-gray-600'
            }`}>
              {t('home.cta.description')}
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
              💡 {t('home.tools.title')}
            </h2>
            <p className={`text-base md:text-lg px-4 ${
              isDarkMode ? 'text-slate-300' : 'text-brand-text'
            }`}>
              {t('home.tools.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Validador de JSON */}
            <div className={`rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
              isDarkMode ? 'bg-slate-800' : 'bg-brand-light'
            }`}>
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 md:p-6 text-white">
                <div className="text-2xl md:text-3xl mb-2">🔍</div>
                <h3 className="text-lg md:text-xl font-bold">{t('home.tools.validator.title')}</h3>
                <p className="text-blue-100 text-sm">{t('home.tools.validator.subtitle')}</p>
              </div>
              <div className="p-4 md:p-6">
                <p className={`text-sm mb-4 ${
                  isDarkMode ? 'text-slate-300' : 'text-brand-text'
                }`}>
                  {t('home.tools.validator.description')}
                </p>
                <Link
                  href="/labs/json-validator"
                  className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                >
                  {t('home.tools.validator.action')} →
                </Link>
              </div>
            </div>

            {/* Generador de Datos */}
            <div className={`rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
              isDarkMode ? 'bg-slate-800' : 'bg-brand-light'
            }`}>
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 md:p-6 text-white">
                <div className="text-2xl md:text-3xl mb-2">🎲</div>
                <h3 className="text-lg md:text-xl font-bold">{t('home.tools.generator.title')}</h3>
                <p className="text-green-100 text-sm">{t('home.tools.generator.subtitle')}</p>
              </div>
              <div className="p-4 md:p-6">
                <p className={`text-sm mb-4 ${
                  isDarkMode ? 'text-slate-300' : 'text-brand-text'
                }`}>
                  {t('home.tools.generator.description')}
                </p>
                <Link
                  href="/labs/data-generator"
                  className="inline-block bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition"
                >
                  {t('home.tools.generator.action')} →
                </Link>
              </div>
            </div>

            {/* Checklist de Pruebas */}
            <div className={`rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
              isDarkMode ? 'bg-slate-800' : 'bg-brand-light'
            }`}>
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 md:p-6 text-white">
                <div className="text-2xl md:text-3xl mb-2">✅</div>
                <h3 className="text-lg md:text-xl font-bold">{t('home.tools.checklist.title')}</h3>
                <p className="text-purple-100 text-sm">{t('home.tools.checklist.subtitle')}</p>
              </div>
              <div className="p-4 md:p-6">
                <p className={`text-sm mb-4 ${
                  isDarkMode ? 'text-slate-300' : 'text-brand-text'
                }`}>
                  {t('home.tools.checklist.description')}
                </p>
                <Link
                  href="/labs/checklist"
                  className="inline-block bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition"
                >
                  {t('home.tools.checklist.action')} →
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
