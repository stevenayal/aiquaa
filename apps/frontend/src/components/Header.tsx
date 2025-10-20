'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isDarkMode, toggleDarkMode } = useTheme();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className={`shadow-sm border-b relative transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-dark-primary border-dark-secondary' 
        : 'bg-brand-dark border-brand-accent'
    }`} role="banner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 sm:space-x-4 mr-4 sm:mr-8" onClick={closeMobileMenu}>
              <Image 
                src="/images/logo1.png" 
                alt="AIQUAA Logo" 
                width={112}
                height={112}
                className="h-16 sm:h-20 md:h-24 lg:h-28 w-auto"
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
              Inicio
            </Link>
            <Link
              href="/blog"
              className={`hover:text-brand-muted px-2 lg:px-3 py-2 text-sm lg:text-base font-medium transition-colors duration-200 flex items-center ${
                isDarkMode ? 'text-dark-text' : 'text-brand-light'
              }`}
            >
              <span className="mr-1">📝</span>
              Blog
            </Link>
            <Link
              href="/labs"
              className={`hover:text-brand-muted px-2 lg:px-3 py-2 text-sm lg:text-base font-medium transition-colors duration-200 flex items-center ${
                isDarkMode ? 'text-dark-text' : 'text-brand-light'
              }`}
            >
              <span className="mr-1">🧪</span>
              Labs
            </Link>
            <Link
              href="/comunidad"
              className={`hover:text-brand-muted px-2 lg:px-3 py-2 text-sm lg:text-base font-medium transition-colors duration-200 flex items-center ${
                isDarkMode ? 'text-dark-text' : 'text-brand-light'
              }`}
            >
              <span className="mr-1">💬</span>
              Comunidad
            </Link>
            <Link
              href="/about"
              className={`hover:text-brand-muted px-2 lg:px-3 py-2 text-sm lg:text-base font-medium transition-colors duration-200 ${
                isDarkMode ? 'text-dark-text' : 'text-brand-light'
              }`}
            >
              Acerca de
            </Link>
          </nav>

          {/* Desktop Theme Toggle */}
          <div className="hidden md:flex items-center space-x-3">
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
              <Link
                href="/"
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                  isDarkMode ? 'text-dark-text hover:bg-dark-secondary' : 'text-brand-light hover:bg-brand-accent/20'
                }`}
                onClick={closeMobileMenu}
              >
                Inicio
              </Link>
              <Link
                href="/blog"
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                  isDarkMode ? 'text-dark-text hover:bg-dark-secondary' : 'text-brand-light hover:bg-brand-accent/20'
                }`}
                onClick={closeMobileMenu}
              >
                <span className="mr-1">📝</span>
                Blog
              </Link>
              <Link
                href="/labs"
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                  isDarkMode ? 'text-dark-text hover:bg-dark-secondary' : 'text-brand-light hover:bg-brand-accent/20'
                }`}
                onClick={closeMobileMenu}
              >
                <span className="mr-1">🧪</span>
                Labs
              </Link>
              <Link
                href="/comunidad"
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                  isDarkMode ? 'text-dark-text hover:bg-dark-secondary' : 'text-brand-light hover:bg-brand-accent/20'
                }`}
                onClick={closeMobileMenu}
              >
                <span className="mr-1">💬</span>
                Comunidad
              </Link>
              <Link
                href="/about"
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                  isDarkMode ? 'text-dark-text hover:bg-dark-secondary' : 'text-brand-light hover:bg-brand-accent/20'
                }`}
                onClick={closeMobileMenu}
              >
                Acerca de
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
