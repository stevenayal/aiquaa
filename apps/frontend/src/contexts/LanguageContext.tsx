'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export type Language = 'es' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

// Translation dictionary
const translations: Record<Language, Record<string, string>> = {
  es: {
    // Navigation
    'nav.home': 'Inicio',
    'nav.labs': 'Labs',
    'nav.dashboard': 'Dashboard',
    'nav.forum': 'Foro',
    'nav.courses': 'Cursos',
    'nav.profile': 'Perfil',
    'nav.login': 'Iniciar Sesión',
    'nav.logout': 'Cerrar Sesión',
    'nav.register': 'Registrarse',

    // Common
    'common.welcome': 'Bienvenido a AIQUAA',
    'common.loading': 'Cargando...',
    'common.error': 'Error',
    'common.success': 'Éxito',
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.delete': 'Eliminar',
    'common.edit': 'Editar',
    'common.search': 'Buscar',
    'common.filter': 'Filtrar',
    'common.export': 'Exportar',
    'common.import': 'Importar',
    'common.submit': 'Enviar',
    'common.close': 'Cerrar',

    // Labs
    'labs.title': 'Laboratorio de Herramientas QA',
    'labs.subtitle': 'Herramientas interactivas para testing y evaluación',
    'labs.allpairs': 'Generador All Pairs',
    'labs.git': 'Examen Técnico GIT',
    'labs.report': 'Generador de Informes',

    // Footer
    'footer.rights': 'Todos los derechos reservados',
    'footer.about': 'Acerca de',
    'footer.contact': 'Contacto',
    'footer.privacy': 'Privacidad',
    'footer.terms': 'Términos',
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.labs': 'Labs',
    'nav.dashboard': 'Dashboard',
    'nav.forum': 'Forum',
    'nav.courses': 'Courses',
    'nav.profile': 'Profile',
    'nav.login': 'Login',
    'nav.logout': 'Logout',
    'nav.register': 'Register',

    // Common
    'common.welcome': 'Welcome to AIQUAA',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.export': 'Export',
    'common.import': 'Import',
    'common.submit': 'Submit',
    'common.close': 'Close',

    // Labs
    'labs.title': 'QA Tools Laboratory',
    'labs.subtitle': 'Interactive tools for testing and evaluation',
    'labs.allpairs': 'All Pairs Generator',
    'labs.git': 'GIT Technical Exam',
    'labs.report': 'Report Generator',

    // Footer
    'footer.rights': 'All rights reserved',
    'footer.about': 'About',
    'footer.contact': 'Contact',
    'footer.privacy': 'Privacy',
    'footer.terms': 'Terms',
  },
};

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    // Check localStorage first, then browser language
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('language');
      if (saved === 'es' || saved === 'en') {
        return saved as Language;
      }
      // Detect browser language
      const browserLang = navigator.language.toLowerCase();
      if (browserLang.startsWith('es')) {
        return 'es';
      }
    }
    return 'es'; // Default to Spanish (Paraguay)
  });

  useEffect(() => {
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', language);

      // Apply language to document
      document.documentElement.lang = language;
    }
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
