'use client';

import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import ISTQBHighlight from '@/components/ISTQBHighlight';
import { SuruMascot } from '@/components/Suru';

export default function HomePage() {
  const { isDarkMode } = useTheme();
  const { t } = useLanguage();

  // Herramientas destacadas más importantes
  const featuredTools = [
    {
      id: 'istqb',
      icon: '📚',
      title: 'Simulador ISTQB',
      subtitle: 'Certificación CTFL v4.0',
      description: 'Practica con 40 preguntas del syllabus oficial',
      color: 'from-amber-500 to-amber-600',
      href: '/labs/istqb',
      badge: '🔥 Más Popular'
    },
    {
      id: 'allpairs',
      icon: '🔀',
      title: 'All Pairs Generator',
      subtitle: 'Pairwise Testing',
      description: 'Reduce casos de prueba combinatorios optimizando cobertura',
      color: 'from-teal-500 to-teal-600',
      href: '/labs/allpairs',
      badge: '⭐ Destacada'
    },
    {
      id: 'test-app',
      icon: '🐞',
      title: 'AIQUAA Test App',
      subtitle: 'Bug Hunting',
      description: 'Aplicación con bugs intencionales para evaluar tus habilidades',
      color: 'from-red-500 to-rose-600',
      href: '/labs/test-app',
      badge: '🎯 Práctica'
    }
  ];

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
                    href="/labs"
                    className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-2xl hover:shadow-indigo-500/50 transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-500/50"
                  >
                    <span className="relative z-10">{t('home.hero.cta.secondary')}</span>
                    <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                  </Link>

                  {/* Secondary CTA - Less prominent */}
                  <Link
                    href="/comunidad"
                    className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-slate-300 border-2 border-slate-600 rounded-xl hover:bg-slate-800/50 hover:border-slate-500 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-slate-500/50"
                  >
                    {t('home.hero.cta.primary')}
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
                    <div className="text-3xl font-bold text-white">15+</div>
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

              {/* Right Column - Visual Support with Suru */}
              <div className="hidden lg:flex justify-center items-center">
                <div className="relative">
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/30 to-emerald-500/30 rounded-full blur-3xl"></div>

                  {/* Main visual - Suru Mascot with white background for visibility */}
                  <div className="relative bg-white rounded-2xl p-8 border-2 border-cyan-500 shadow-2xl">
                    <div className="relative z-10 flex justify-center">
                      <SuruMascot
                        pose="welcome"
                        size="large"
                        animated
                        message={t('home.hero.suru.message')}
                      />
                    </div>

                    {/* Floating badges around Suru */}
                    <div className="absolute -top-4 -right-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-bounce">
                      ISTQB Ready
                    </div>
                    <div className="absolute -bottom-4 -left-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-bounce" style={{animationDelay: '0.5s'}}>
                      JMeter Pro
                    </div>
                  </div>

                  {/* Decorative elements */}
                  <div className="absolute -top-8 -left-8 w-24 h-24 bg-cyan-500/20 rounded-full blur-2xl"></div>
                  <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl"></div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Bottom wave separator */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
      </section>

      {/* ISTQB Simulator Highlight */}
      <ISTQBHighlight />

      {/* Featured Tools Section - Minimal & Focused */}
      <section className={`py-16 md:py-20 transition-colors duration-300 ${
        isDarkMode ? 'bg-slate-900' : 'bg-white'
      }`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${
              isDarkMode ? 'text-white' : 'text-brand-text'
            }`}>
              🧪 {t('home.tools.title')}
            </h2>
            <p className={`text-lg max-w-2xl mx-auto ${
              isDarkMode ? 'text-slate-300' : 'text-gray-600'
            }`}>
              {t('home.tools.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {featuredTools.map((tool) => (
              <Link
                key={tool.id}
                href={tool.href}
                className={`group block rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 ${
                  isDarkMode ? 'bg-slate-800' : 'bg-white'
                }`}
              >
                <div className={`bg-gradient-to-r ${tool.color} p-6 text-white relative`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-4xl">{tool.icon}</div>
                    <span className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded text-xs font-medium">
                      {tool.badge}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-1">{tool.title}</h3>
                  <p className="text-white/90 text-sm">{tool.subtitle}</p>
                </div>
                <div className="p-6">
                  <p className={`text-sm mb-4 ${
                    isDarkMode ? 'text-slate-300' : 'text-gray-600'
                  }`}>
                    {tool.description}
                  </p>
                  <div className={`inline-flex items-center gap-2 font-semibold text-sm ${
                    isDarkMode ? 'text-indigo-400' : 'text-indigo-600'
                  }`}>
                    Explorar
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* View All Tools Link */}
          <div className="text-center mt-12">
            <Link
              href="/labs"
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                isDarkMode
                  ? 'bg-slate-800 hover:bg-slate-700 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
              }`}
            >
              Ver todas las herramientas
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className={`py-16 transition-colors duration-300 ${
        isDarkMode ? 'bg-slate-800' : 'bg-brand-light'
      }`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-5xl mb-6">🚀</div>
          <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${
            isDarkMode ? 'text-white' : 'text-brand-text'
          }`}>
            {t('home.cta.title')}
          </h2>
          <p className={`text-lg mb-8 max-w-2xl mx-auto ${
            isDarkMode ? 'text-slate-300' : 'text-gray-600'
          }`}>
            {t('home.cta.description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/comunidad"
              className={`inline-flex items-center gap-2 px-8 py-3 rounded-lg font-bold text-lg transition-all ${
                isDarkMode
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  : 'bg-indigo-500 hover:bg-indigo-600 text-white'
              }`}
            >
              <span>💬</span>
              Unirse a la Comunidad
            </Link>
            <Link
              href="/about"
              className={`inline-flex items-center gap-2 px-8 py-3 rounded-lg font-semibold text-lg transition-all ${
                isDarkMode
                  ? 'bg-slate-700 hover:bg-slate-600 text-white'
                  : 'bg-white hover:bg-gray-50 text-gray-800 border-2 border-gray-200'
              }`}
            >
              <span>📖</span>
              Conocer Más
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
