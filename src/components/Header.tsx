import { Link } from 'react-router-dom';
import { useState } from 'react';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-brand-dark shadow-sm border-b border-brand-accent relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 sm:space-x-4 mr-4 sm:mr-8" onClick={closeMobileMenu}>
              <img 
                src="/images/logo1.png" 
                alt="AIQUAA Logo" 
                className="h-16 sm:h-20 md:h-24 lg:h-28 w-auto"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-4 lg:space-x-6 xl:space-x-8">
            <Link
              to="/"
              className="text-brand-light hover:text-brand-muted px-2 lg:px-3 py-2 text-sm lg:text-base font-medium transition-colors duration-200"
            >
              Inicio
            </Link>
            <Link
              to="/about"
              className="text-brand-light hover:text-brand-muted px-2 lg:px-3 py-2 text-sm lg:text-base font-medium transition-colors duration-200"
            >
              Acerca de
            </Link>
            <Link
              to="/unite"
              className="text-brand-light hover:text-brand-muted px-2 lg:px-3 py-2 text-sm lg:text-base font-medium transition-colors duration-200"
            >
              Unite
            </Link>
            <Link
              to="/contact"
              className="text-brand-light hover:text-brand-muted px-2 lg:px-3 py-2 text-sm lg:text-base font-medium transition-colors duration-200"
            >
              Contacto
            </Link>
            <Link
              to="/labs"
              className="text-brand-light hover:text-brand-muted px-2 lg:px-3 py-2 text-sm lg:text-base font-medium transition-colors duration-200"
            >
              Labs
            </Link>
          </nav>

          {/* Desktop Login Button */}
          <div className="hidden md:flex items-center">
            <button
              className="bg-brand text-brand-light hover:bg-brand-accent px-3 lg:px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 opacity-50 cursor-not-allowed"
              disabled
              title="Funcionalidad en desarrollo"
            >
              Ingresar
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="text-brand-light hover:text-brand-muted p-2 rounded-md transition-colors duration-200"
              aria-label="Toggle menu"
              onClick={toggleMobileMenu}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
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
        </div>

        {/* Mobile Navigation Menu */}
        <div className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${
          isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="py-4 space-y-2 border-t border-brand-accent/20">
            <Link
              to="/"
              className="block text-brand-light hover:text-brand-muted px-4 py-3 text-base font-medium transition-colors duration-200 rounded-lg hover:bg-brand-accent/10"
              onClick={closeMobileMenu}
            >
              Inicio
            </Link>
            <Link
              to="/about"
              className="block text-brand-light hover:text-brand-muted px-4 py-3 text-base font-medium transition-colors duration-200 rounded-lg hover:bg-brand-accent/10"
              onClick={closeMobileMenu}
            >
              Acerca de
            </Link>
            <Link
              to="/unite"
              className="block text-brand-light hover:text-brand-muted px-4 py-3 text-base font-medium transition-colors duration-200 rounded-lg hover:bg-brand-accent/10"
              onClick={closeMobileMenu}
            >
              Unite
            </Link>
            <Link
              to="/contact"
              className="block text-brand-light hover:text-brand-muted px-4 py-3 text-base font-medium transition-colors duration-200 rounded-lg hover:bg-brand-accent/10"
              onClick={closeMobileMenu}
            >
              Contacto
            </Link>
            <Link
              to="/labs"
              className="block text-brand-light hover:text-brand-muted px-4 py-3 text-base font-medium transition-colors duration-200 rounded-lg hover:bg-brand-accent/10"
              onClick={closeMobileMenu}
            >
              Labs
            </Link>
            <div className="px-4 py-3">
              <button
                className="w-full bg-brand text-brand-light hover:bg-brand-accent px-4 py-3 rounded-lg text-base font-medium transition-colors duration-200 opacity-50 cursor-not-allowed"
                disabled
                title="Funcionalidad en desarrollo"
              >
                Ingresar
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 