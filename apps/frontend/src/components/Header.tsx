'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNextAuth } from '@/contexts/NextAuthContext';
import LanguageSelector from './LanguageSelector';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { t } = useLanguage();
  const { user, isAuthenticated, logout, isLoading } = useNextAuth();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    closeMobileMenu();
  };

  return (
    <header className={`shadow-sm border-b relative transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-dark-primary border-dark-secondary' 
        : 'bg-brand-dark border-brand-accent'
    }`} role="banner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 md:h-24">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 sm:space-x-4 mr-4 sm:mr-8" onClick={closeMobileMenu}>
              <Image
                src="/images/logo1.png"
                alt="AIQUAA Logo"
                width={112}
                height={112}
                className="h-14 sm:h-16 md:h-18 lg:h-20 w-auto"
                priority
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-4 lg:space-x-6 xl:space-x-8" role="navigation" aria-label="Navegación principal">
            <Link
              href="/"
              className={`hover:text-brand-muted px-2 lg:px-3 py-2 text-sm lg:text-base font-medium transition-colors duration-200 ${
                isDarkMode ? 'text-dark-text' : 'text-brand-light'
              }`}
            >
              {t('nav.home')}
            </Link>
            <Link
              href="/blog"
              className={`hover:text-brand-muted px-2 lg:px-3 py-2 text-sm lg:text-base font-medium transition-colors duration-200 flex items-center ${
                isDarkMode ? 'text-dark-text' : 'text-brand-light'
              }`}
            >
              <span className="mr-1">📝</span>
              {t('nav.blog')}
            </Link>
            <Link
              href="/labs"
              className={`hover:text-brand-muted px-2 lg:px-3 py-2 text-sm lg:text-base font-medium transition-colors duration-200 flex items-center ${
                isDarkMode ? 'text-dark-text' : 'text-brand-light'
              }`}
            >
              <span className="mr-1">🧪</span>
              {t('nav.labs')}
            </Link>
            <Link
              href="/recursos"
              className={`hover:text-brand-muted px-2 lg:px-3 py-2 text-sm lg:text-base font-medium transition-colors duration-200 flex items-center ${
                isDarkMode ? 'text-dark-text' : 'text-brand-light'
              }`}
            >
              <span className="mr-1">📚</span>
              {t('nav.resources')}
            </Link>
            <Link
              href="/comunidad"
              className={`hover:text-brand-muted px-2 lg:px-3 py-2 text-sm lg:text-base font-medium transition-colors duration-200 flex items-center ${
                isDarkMode ? 'text-dark-text' : 'text-brand-light'
              }`}
            >
              <span className="mr-1">💬</span>
              {t('nav.community')}
            </Link>
            <Link
              href="/about"
              className={`hover:text-brand-muted px-2 lg:px-3 py-2 text-sm lg:text-base font-medium transition-colors duration-200 ${
                isDarkMode ? 'text-dark-text' : 'text-brand-light'
              }`}
            >
              {t('nav.about')}
            </Link>
          </nav>

          {/* Desktop Language Selector & Theme Toggle */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                <div
                  className={`px-3 py-2 rounded-lg text-sm font-medium ${
                    isDarkMode ? 'bg-dark-secondary text-dark-text' : 'bg-brand-accent/20 text-brand-light'
                  }`}
                >
                  {user?.name || user?.email}
                </div>
                <button
                  onClick={handleLogout}
                  disabled={isLoading}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-200 ${
                    isDarkMode
                      ? 'bg-red-900/40 text-red-100 hover:bg-red-900/60'
                      : 'bg-white text-brand-dark hover:bg-brand-light'
                  } disabled:opacity-60`}
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              null
            )}
            <LanguageSelector />
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                isDarkMode
                  ? 'text-dark-text hover:bg-dark-secondary'
                  : 'text-brand-light hover:bg-brand-accent/20'
              }`}
              title={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
              {isDarkMode ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                isDarkMode 
                  ? 'text-dark-text hover:bg-dark-secondary' 
                  : 'text-brand-light hover:bg-brand-accent/20'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* Language Selector Mobile */}
              <div className="px-3 py-2">
                <LanguageSelector />
              </div>

              <Link
                href="/"
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                  isDarkMode ? 'text-dark-text hover:bg-dark-secondary' : 'text-brand-light hover:bg-brand-accent/20'
                }`}
                onClick={closeMobileMenu}
              >
                {t('nav.home')}
              </Link>
              <Link
                href="/blog"
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                  isDarkMode ? 'text-dark-text hover:bg-dark-secondary' : 'text-brand-light hover:bg-brand-accent/20'
                }`}
                onClick={closeMobileMenu}
              >
                <span className="mr-1">📝</span>
                {t('nav.blog')}
              </Link>
              <Link
                href="/labs"
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                  isDarkMode ? 'text-dark-text hover:bg-dark-secondary' : 'text-brand-light hover:bg-brand-accent/20'
                }`}
                onClick={closeMobileMenu}
              >
                <span className="mr-1">🧪</span>
                {t('nav.labs')}
              </Link>
              <Link
                href="/recursos"
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                  isDarkMode ? 'text-dark-text hover:bg-dark-secondary' : 'text-brand-light hover:bg-brand-accent/20'
                }`}
                onClick={closeMobileMenu}
              >
                <span className="mr-1">📚</span>
                {t('nav.resources')}
              </Link>
              <Link
                href="/comunidad"
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                  isDarkMode ? 'text-dark-text hover:bg-dark-secondary' : 'text-brand-light hover:bg-brand-accent/20'
                }`}
                onClick={closeMobileMenu}
              >
                <span className="mr-1">💬</span>
                {t('nav.community')}
              </Link>
              <Link
                href="/about"
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                  isDarkMode ? 'text-dark-text hover:bg-dark-secondary' : 'text-brand-light hover:bg-brand-accent/20'
                }`}
                onClick={closeMobileMenu}
              >
                {t('nav.about')}
              </Link>

              <div className="border-t border-white/10 my-2" />

              {isAuthenticated ? (
                <>
                  <div
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      isDarkMode ? 'text-dark-text bg-dark-secondary' : 'text-brand-light bg-brand-accent/20'
                    }`}
                  >
                    {user?.name || user?.email}
                  </div>
                  <button
                    onClick={handleLogout}
                    disabled={isLoading}
                    className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                      isDarkMode ? 'text-red-200 hover:bg-dark-secondary' : 'text-white hover:bg-brand-accent/20'
                    } disabled:opacity-60`}
                  >
                    Cerrar sesión
                  </button>
                </>
              ) : (
                null
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
