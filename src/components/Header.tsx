import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-brand-dark shadow-sm border-b border-brand-accent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-4 mr-8">
              <img 
                src="/images/logo1.png" 
                alt="AIQUAA Logo" 
                className="h-20 w-auto"
              />
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link
              to="/"
              className="text-brand-light hover:text-brand-muted px-3 py-2 text-sm font-medium transition-colors duration-200"
            >
              Inicio
            </Link>
            {/* Blog temporarily hidden until content is ready
            <Link
              to="/blog"
              className="text-brand-light hover:text-brand-muted px-3 py-2 text-sm font-medium transition-colors duration-200"
            >
              Blog
            </Link>
            */}
            <Link
              to="/about"
              className="text-brand-light hover:text-brand-muted px-3 py-2 text-sm font-medium transition-colors duration-200"
            >
              Acerca de
            </Link>
            <Link
              to="/unite"
              className="text-brand-light hover:text-brand-muted px-3 py-2 text-sm font-medium transition-colors duration-200"
            >
              Unite
            </Link>
            <Link
              to="/contact"
              className="text-brand-light hover:text-brand-muted px-3 py-2 text-sm font-medium transition-colors duration-200"
            >
              Contacto
            </Link>
            <Link
              to="/labs"
              className="text-brand-light hover:text-brand-muted px-3 py-2 text-sm font-medium transition-colors duration-200"
            >
              Labs
            </Link>
          </nav>

          {/* Login Button */}
          <div className="hidden md:flex items-center">
            <button
              className="bg-brand text-brand-light hover:bg-brand-accent px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 opacity-50 cursor-not-allowed"
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
              className="text-brand-light hover:text-brand-muted p-2"
              aria-label="Toggle menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 