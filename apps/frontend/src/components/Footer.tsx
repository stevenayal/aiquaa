'use client';

import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
import LogoMark from '@/components/LogoMark';

const Footer = () => {
  const { isDarkMode } = useTheme();
  
  return (
    <footer className={`${
      isDarkMode 
        ? 'bg-dark-background text-dark-text border-t border-dark-secondary' 
        : 'bg-brand-dark text-brand-light'
    }`} role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-9 w-9 rounded-full bg-white/10 border border-white/20 grid place-items-center">
                <LogoMark size={24} color="#ffffff" wordmark={false} />
              </div>
              <span className="text-white font-bold text-lg tracking-tight" style={{ fontFamily: 'Sora, system-ui, sans-serif' }}>
                aiquaa
              </span>
            </div>
            <p className={`mb-4 max-w-md ${
              isDarkMode ? 'text-dark-muted' : 'text-brand-muted'
            }`}>
              AIQUAA: Saber es Calidad. Inspirados por el conocimiento, impulsados por la comunidad.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://x.com/stevenayaal"
                className={`transition-colors duration-200 ${
                  isDarkMode 
                    ? 'text-dark-muted hover:text-dark-accent' 
                    : 'text-brand-muted hover:text-brand'
                }`}
                aria-label="X (Twitter)"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/in/stevenayal/"
                className={`transition-colors duration-200 ${
                  isDarkMode 
                    ? 'text-dark-muted hover:text-dark-accent' 
                    : 'text-brand-muted hover:text-brand'
                }`}
                aria-label="LinkedIn"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a
                href="https://github.com/stevenayal"
                className={`transition-colors duration-200 ${
                  isDarkMode
                    ? 'text-dark-muted hover:text-dark-accent'
                    : 'text-brand-muted hover:text-brand'
                }`}
                aria-label="GitHub"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
              <a
                href="https://www.youtube.com/@aiquaa"
                className={`transition-colors duration-200 ${
                  isDarkMode
                    ? 'text-dark-muted hover:text-dark-accent'
                    : 'text-brand-muted hover:text-brand'
                }`}
                aria-label="YouTube"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className={`text-lg font-semibold mb-4 ${
              isDarkMode ? 'text-dark-text' : 'text-brand-light'
            }`}>Enlaces Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className={`transition-colors duration-200 ${
                    isDarkMode 
                      ? 'text-dark-muted hover:text-dark-text' 
                      : 'text-brand-muted hover:text-brand-light'
                  }`}
                >
                  Inicio
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className={`transition-colors duration-200 ${
                    isDarkMode 
                      ? 'text-dark-muted hover:text-dark-text' 
                      : 'text-brand-muted hover:text-brand-light'
                  }`}
                >
                  Acerca de
                </Link>
              </li>
              <li>
                <Link
                  href="/labs"
                  className={`transition-colors duration-200 ${
                    isDarkMode 
                      ? 'text-dark-muted hover:text-dark-text' 
                      : 'text-brand-muted hover:text-brand-light'
                  }`}
                >
                  Labs
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className={`text-lg font-semibold mb-4 ${
              isDarkMode ? 'text-dark-text' : 'text-brand-light'
            }`}>Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/privacy"
                  className={`transition-colors duration-200 ${
                    isDarkMode 
                      ? 'text-dark-muted hover:text-dark-text' 
                      : 'text-brand-muted hover:text-brand-light'
                  }`}
                >
                  Privacidad
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className={`transition-colors duration-200 ${
                    isDarkMode 
                      ? 'text-dark-muted hover:text-dark-text' 
                      : 'text-brand-muted hover:text-brand-light'
                  }`}
                >
                  Términos
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Sección de licencia Creative Commons */}
        <div className={`border-t mt-8 pt-8 ${
          isDarkMode ? 'border-dark-secondary' : 'border-brand-accent'
        }`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Copyright */}
            <div className={`text-center md:text-left ${
              isDarkMode ? 'text-dark-muted' : 'text-brand-muted'
            }`}>
              <p>&copy; {new Date().getFullYear()} AIQUAA. Todos los derechos reservados.</p>
            </div>
            
            {/* Licencia Creative Commons */}
            <div className={`text-center md:text-right ${
              isDarkMode ? 'text-dark-muted' : 'text-brand-muted'
            }`}>
              <p className="mb-2">
                El contenido de AIQUAA está licenciado bajo{' '}
                <a
                  href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`underline hover:no-underline transition-all duration-200 ${
                    isDarkMode 
                      ? 'text-dark-accent hover:text-dark-text' 
                      : 'text-brand-accent hover:text-brand-light'
                  }`}
                  aria-label="Licencia Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International"
                >
                  CC BY-NC-SA 4.0
                </a>
              </p>
              <p className="text-sm opacity-80">
                Atribución • No Comercial • Compartir Igual
              </p>
            </div>
          </div>
          
          {/* Información adicional de la licencia */}
          <div className={`mt-6 pt-6 border-t text-center text-sm ${
            isDarkMode ? 'border-dark-secondary text-dark-muted' : 'border-gray-300 text-brand-muted'
          }`}>
            <p>
              Puedes compartir, adaptar y usar este contenido para fines no comerciales, 
              siempre que proporciones atribución a AIQUAA y distribuyas tu trabajo bajo la misma licencia.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
