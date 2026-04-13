'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { logoutAction } from '@/actions/auth';
import LanguageSelector from './LanguageSelector';

const navLinks = [
  { href: '/', label: 'nav.home' },
  { href: '/blog', label: 'nav.blog' },
  { href: '/labs', label: 'nav.labs' },
  { href: '/recursos', label: 'nav.resources' },
  { href: '/comunidad', label: 'nav.community' },
  { href: '/about', label: 'nav.about' },
];

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { t } = useLanguage();
  const { user, isAuthenticated, isLoading } = useSupabaseAuth();

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleLogout = async () => {
    await logoutAction();
    closeMobileMenu();
  };

  const linkClass = `text-sm font-medium transition-colors duration-200 ${
    isDarkMode ? 'text-dark-text hover:text-white' : 'text-brand-light/80 hover:text-white'
  }`;

  return (
    <header
      className={`shadow-md border-b relative transition-colors duration-300 ${
        isDarkMode ? 'bg-dark-primary border-dark-secondary' : 'bg-brand-dark border-brand-accent/30'
      }`}
      role="banner"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Row 1: Logo + Actions */}
        <div className="flex justify-between items-center h-20">

          {/* Logo */}
          <Link href="/" onClick={closeMobileMenu} className="flex items-center shrink-0">
            <Image
              src="/images/logo1.png"
              alt="AIQUAA Logo"
              width={140}
              height={56}
              className="h-12 sm:h-14 w-auto"
              priority
            />
          </Link>

          {/* Desktop: Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <span
                  className={`text-sm font-medium px-3 py-1.5 rounded-lg ${
                    isDarkMode ? 'bg-dark-secondary text-dark-text' : 'bg-white/10 text-brand-light'
                  }`}
                >
                  {user?.user_metadata?.full_name || user?.email}
                </span>
                <button
                  onClick={handleLogout}
                  disabled={isLoading}
                  className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors duration-200 disabled:opacity-60 ${
                    isDarkMode
                      ? 'text-red-200 hover:bg-dark-secondary'
                      : 'text-brand-light/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors duration-200 ${
                    isDarkMode ? 'text-dark-text hover:bg-dark-secondary' : 'text-brand-light/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/register"
                  className={`text-sm font-semibold px-4 py-1.5 rounded-lg border transition-colors duration-200 ${
                    isDarkMode
                      ? 'border-dark-accent text-dark-accent hover:bg-dark-accent hover:text-white'
                      : 'border-brand-light/50 text-white hover:bg-white hover:text-brand-dark'
                  }`}
                >
                  Registrarse
                </Link>
              </>
            )}

            <div className={`w-px h-5 mx-1 ${isDarkMode ? 'bg-dark-secondary' : 'bg-white/20'}`} />

            <LanguageSelector />

            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                isDarkMode ? 'text-dark-text hover:bg-dark-secondary' : 'text-brand-light/80 hover:bg-white/10'
              }`}
              title={isDarkMode ? 'Modo claro' : 'Modo oscuro'}
            >
              {isDarkMode ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>

          {/* Mobile: hamburger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden p-2 rounded-lg transition-colors duration-200 ${
              isDarkMode ? 'text-dark-text hover:bg-dark-secondary' : 'text-brand-light hover:bg-white/10'
            }`}
            aria-label="Abrir menú"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Row 2: Desktop Nav */}
        <nav
          className={`hidden md:flex justify-center items-center gap-1 py-2 border-t ${
            isDarkMode ? 'border-dark-secondary/50' : 'border-white/10'
          }`}
          role="navigation"
          aria-label="Navegación principal"
        >
          {navLinks.map((link, i) => (
            <span key={link.href} className="flex items-center">
              {i > 0 && (
                <span className={`mx-2 text-xs select-none ${isDarkMode ? 'text-dark-secondary' : 'text-white/20'}`}>
                  |
                </span>
              )}
              <Link href={link.href} className={linkClass}>
                {t(link.label)}
              </Link>
            </span>
          ))}
        </nav>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className={`md:hidden border-t ${isDarkMode ? 'border-dark-secondary' : 'border-white/10'}`}>
          <div className="max-w-7xl mx-auto px-4 py-3 space-y-1">

            <div className="pb-2">
              <LanguageSelector />
            </div>

            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMobileMenu}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                  isDarkMode ? 'text-dark-text hover:bg-dark-secondary' : 'text-brand-light hover:bg-white/10'
                }`}
              >
                {t(link.label)}
              </Link>
            ))}

            <div className={`border-t my-2 ${isDarkMode ? 'border-dark-secondary' : 'border-white/10'}`} />

            {isAuthenticated ? (
              <>
                <div
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isDarkMode ? 'text-dark-text bg-dark-secondary' : 'text-white bg-white/10'
                  }`}
                >
                  {user?.user_metadata?.full_name || user?.email}
                </div>
                <button
                  onClick={handleLogout}
                  disabled={isLoading}
                  className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 disabled:opacity-60 ${
                    isDarkMode ? 'text-red-200 hover:bg-dark-secondary' : 'text-white/80 hover:bg-white/10'
                  }`}
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={closeMobileMenu}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                    isDarkMode ? 'text-dark-text hover:bg-dark-secondary' : 'text-white/80 hover:bg-white/10'
                  }`}
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/register"
                  onClick={closeMobileMenu}
                  className={`block px-3 py-2 rounded-md text-base font-semibold border transition-colors duration-200 ${
                    isDarkMode ? 'border-dark-accent text-dark-accent' : 'border-white/40 text-white'
                  }`}
                >
                  Registrarse
                </Link>
              </>
            )}

            <button
              onClick={toggleDarkMode}
              className={`flex items-center gap-2 w-full px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                isDarkMode ? 'text-dark-text hover:bg-dark-secondary' : 'text-white/80 hover:bg-white/10'
              }`}
            >
              {isDarkMode ? '☀️ Modo claro' : '🌙 Modo oscuro'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
