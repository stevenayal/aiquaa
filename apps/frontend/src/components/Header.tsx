'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import LanguageSelector from './LanguageSelector';
import LogoMark from './LogoMark';
import Avatar from '@/components/ui/Avatar';

const navLinks = [
  { href: '/', label: 'nav.home', emoji: '' },
  { href: '/blog', label: 'nav.blog', emoji: '📝' },
  { href: '/labs', label: 'nav.labs', emoji: '🧪' },
  { href: '/ranking', label: 'nav.ranking', emoji: '🏆' },
  { href: '/recursos', label: 'nav.resources', emoji: '📚' },
  { href: '/comunidad', label: 'nav.community', emoji: '💬' },
  { href: '/about', label: 'nav.about', emoji: '' },
];

const empresaNavLinks = [
  { href: '/empresa', label: 'Panel', emoji: '🏢' },
  { href: '/empresa/procesos', label: 'Mis procesos', emoji: '📂' },
  { href: '/empresa/candidatos', label: 'Candidatos', emoji: '👥' },
  { href: '/empresa/admin/usuarios', label: 'Usuarios', emoji: '👤' },
  { href: '/ranking', label: 'Tops', emoji: '🏆' },
  { href: '/labs', label: 'Herramientas', emoji: '🧪' },
  { href: '/about', label: 'Nosotros', emoji: '' },
];

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { t } = useLanguage();
  const { user, isAuthenticated, isLoading, signOut } = useSupabaseAuth();
  const router = useRouter();
  const isEmpresa = user?.user_metadata?.audience === 'empresa';
  const activeNavLinks = isEmpresa ? empresaNavLinks : navLinks;

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleLogout = async () => {
    setIsUserMenuOpen(false);
    closeMobileMenu();
    await signOut();
    router.push('/login');
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const linkClass = `text-sm font-medium transition-colors duration-200 ${
    isDarkMode
      ? 'text-dark-text hover:text-white'
      : 'text-brand-light/80 hover:text-white'
  }`;

  return (
    <header
      className={`shadow-md border-b relative transition-colors duration-300 ${
        isDarkMode
          ? 'bg-dark-primary border-dark-secondary'
          : 'bg-brand-dark border-brand-accent/30'
      }`}
      role="banner"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Row 1: Logo + Actions */}
        <div className="flex justify-between items-center h-20">
          {/* Logo — circular avatar + wordmark */}
          <Link
            href="/"
            onClick={closeMobileMenu}
            className="flex items-center gap-3 shrink-0 group"
          >
            <div className="h-11 w-11 rounded-full bg-white/10 border border-white/20 grid place-items-center group-hover:bg-white/15 transition-colors">
              <LogoMark size={30} color="#ffffff" wordmark={false} />
            </div>
            <div className="hidden sm:flex flex-col leading-tight">
              <span
                className="text-white font-bold text-xl tracking-tight"
                style={{ fontFamily: 'Sora, system-ui, sans-serif' }}
              >
                aiquaa
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-white/50 font-semibold">
                Saber es calidad
              </span>
            </div>
          </Link>

          {/* Desktop: Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-transparent"
                  aria-label="Menú de usuario"
                >
                  <Avatar
                    name={user?.user_metadata?.full_name}
                    email={user?.email}
                    avatarUrl={user?.user_metadata?.avatar_url}
                    size="sm"
                  />
                </button>

                {isUserMenuOpen && (
                  <div
                    className={`absolute right-0 mt-2 w-52 rounded-xl shadow-xl border z-50 overflow-hidden ${
                      isDarkMode
                        ? 'bg-slate-800 border-slate-700'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <div
                      className={`px-4 py-3 border-b ${isDarkMode ? 'border-slate-700' : 'border-gray-100'}`}
                    >
                      <p
                        className={`text-sm font-semibold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                      >
                        {user?.user_metadata?.full_name || 'Sin nombre'}
                      </p>
                      <p
                        className={`text-xs truncate ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}
                      >
                        {user?.email}
                      </p>
                    </div>
                    {isEmpresa && (
                      <Link
                        href="/empresa"
                        onClick={() => setIsUserMenuOpen(false)}
                        className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                          isDarkMode
                            ? 'text-indigo-300 hover:bg-slate-700'
                            : 'text-indigo-600 hover:bg-indigo-50'
                        }`}
                      >
                        🏢 Panel de empresa
                      </Link>
                    )}
                    <Link
                      href="/perfil"
                      onClick={() => setIsUserMenuOpen(false)}
                      className={`flex items-center gap-2 px-4 py-2.5 text-sm transition-colors ${
                        isDarkMode
                          ? 'text-slate-200 hover:bg-slate-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      👤 Mi perfil
                    </Link>
                    {!isEmpresa && (
                      <Link
                        href="/forum"
                        onClick={() => setIsUserMenuOpen(false)}
                        className={`flex items-center gap-2 px-4 py-2.5 text-sm transition-colors ${
                          isDarkMode
                            ? 'text-slate-200 hover:bg-slate-700'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        💬 Foro
                      </Link>
                    )}
                    <div
                      className={`border-t ${isDarkMode ? 'border-slate-700' : 'border-gray-100'}`}
                    />
                    <button
                      onClick={handleLogout}
                      disabled={isLoading}
                      className={`flex items-center gap-2 w-full px-4 py-2.5 text-sm transition-colors disabled:opacity-50 ${
                        isDarkMode
                          ? 'text-red-400 hover:bg-slate-700'
                          : 'text-red-600 hover:bg-red-50'
                      }`}
                    >
                      🚪 Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors duration-200 ${
                    isDarkMode
                      ? 'text-dark-text hover:bg-dark-secondary'
                      : 'text-brand-light/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {t('nav.login')}
                </Link>
                <Link
                  href="/register"
                  className={`text-sm font-semibold px-4 py-1.5 rounded-lg border transition-colors duration-200 ${
                    isDarkMode
                      ? 'border-dark-accent text-dark-accent hover:bg-dark-accent hover:text-white'
                      : 'border-brand-light/50 text-white hover:bg-white hover:text-brand-dark'
                  }`}
                >
                  {t('nav.register')}
                </Link>
              </>
            )}

            <div
              className={`w-px h-5 mx-1 ${isDarkMode ? 'bg-dark-secondary' : 'bg-white/20'}`}
            />

            <LanguageSelector />

            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                isDarkMode
                  ? 'text-dark-text hover:bg-dark-secondary'
                  : 'text-brand-light/80 hover:bg-white/10'
              }`}
              title={isDarkMode ? 'Modo claro' : 'Modo oscuro'}
            >
              {isDarkMode ? (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              )}
            </button>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden p-2 rounded-lg transition-colors duration-200 ${
              isDarkMode
                ? 'text-dark-text hover:bg-dark-secondary'
                : 'text-brand-light hover:bg-white/10'
            }`}
            aria-label="Abrir menú"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
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
          {activeNavLinks.map((link, i) => (
            <span key={link.href} className="flex items-center">
              {i > 0 && (
                <span
                  className={`mx-2 text-xs select-none ${isDarkMode ? 'text-dark-secondary' : 'text-white/20'}`}
                >
                  |
                </span>
              )}
              <Link
                href={link.href}
                className={`${linkClass} flex items-center gap-1`}
              >
                {link.emoji && <span>{link.emoji}</span>}
                {link.label.startsWith('nav.') ? t(link.label) : link.label}
              </Link>
            </span>
          ))}
        </nav>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div
          className={`md:hidden border-t ${isDarkMode ? 'border-dark-secondary' : 'border-white/10'}`}
        >
          <div className="max-w-7xl mx-auto px-4 py-3 space-y-1">
            <div className="pb-2">
              <LanguageSelector />
            </div>

            {activeNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMobileMenu}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                  isDarkMode
                    ? 'text-dark-text hover:bg-dark-secondary'
                    : 'text-brand-light hover:bg-white/10'
                }`}
              >
                {link.emoji && <span>{link.emoji}</span>}
                {link.label.startsWith('nav.') ? t(link.label) : link.label}
              </Link>
            ))}

            <div
              className={`border-t my-2 ${isDarkMode ? 'border-dark-secondary' : 'border-white/10'}`}
            />

            {isAuthenticated ? (
              <>
                <div
                  className={`flex items-center gap-3 px-3 py-2 rounded-md ${isDarkMode ? 'bg-dark-secondary' : 'bg-white/10'}`}
                >
                  <Avatar
                    name={user?.user_metadata?.full_name}
                    email={user?.email}
                    avatarUrl={user?.user_metadata?.avatar_url}
                    size="sm"
                  />
                  <div className="min-w-0">
                    <p
                      className={`text-sm font-medium truncate ${isDarkMode ? 'text-white' : 'text-white'}`}
                    >
                      {user?.user_metadata?.full_name || 'Sin nombre'}
                    </p>
                    <p
                      className={`text-xs truncate ${isDarkMode ? 'text-slate-400' : 'text-white/60'}`}
                    >
                      {user?.email}
                    </p>
                  </div>
                </div>
                {isEmpresa && (
                  <Link
                    href="/empresa"
                    onClick={closeMobileMenu}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-base font-semibold transition-colors duration-200 ${
                      isDarkMode
                        ? 'text-indigo-300 hover:bg-dark-secondary'
                        : 'text-indigo-300 hover:bg-white/10'
                    }`}
                  >
                    🏢 Panel de empresa
                  </Link>
                )}
                <Link
                  href="/perfil"
                  onClick={closeMobileMenu}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                    isDarkMode
                      ? 'text-dark-text hover:bg-dark-secondary'
                      : 'text-white/80 hover:bg-white/10'
                  }`}
                >
                  👤 Mi perfil
                </Link>
                <button
                  onClick={handleLogout}
                  disabled={isLoading}
                  className={`flex items-center gap-2 w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 disabled:opacity-60 ${
                    isDarkMode
                      ? 'text-red-300 hover:bg-dark-secondary'
                      : 'text-white/80 hover:bg-white/10'
                  }`}
                >
                  🚪 Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={closeMobileMenu}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                    isDarkMode
                      ? 'text-dark-text hover:bg-dark-secondary'
                      : 'text-white/80 hover:bg-white/10'
                  }`}
                >
                  {t('nav.login')}
                </Link>
                <Link
                  href="/register"
                  onClick={closeMobileMenu}
                  className={`block px-3 py-2 rounded-md text-base font-semibold border transition-colors duration-200 ${
                    isDarkMode
                      ? 'border-dark-accent text-dark-accent'
                      : 'border-white/40 text-white'
                  }`}
                >
                  {t('nav.register')}
                </Link>
              </>
            )}

            <button
              onClick={toggleDarkMode}
              className={`flex items-center gap-2 w-full px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                isDarkMode
                  ? 'text-dark-text hover:bg-dark-secondary'
                  : 'text-white/80 hover:bg-white/10'
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
