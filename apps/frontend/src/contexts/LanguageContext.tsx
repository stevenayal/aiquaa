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
    'nav.blog': 'Blog',
    'nav.labs': 'Labs',
    'nav.community': 'Comunidad',
    'nav.about': 'Acerca de',
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

    // Home page
    'home.hero.title': 'AIQUAA: Comunidad y Herramientas de QA en Paraguay',
    'home.hero.subtitle': 'Transformamos el testing en Paraguay con IA, herramientas y comunidad',
    'home.hero.description': 'Validá tus APIs y datos, genera casos de prueba y participá en workshops y mentorías. Únete a nuestra comunidad open-source de QA.',
    'home.hero.explore': 'Explorar Herramientas',
    'home.hero.join': 'Unirse a la Comunidad',
    'home.hero.free': '100% Gratis y Open Source',
    'home.hero.spanish': 'En Español',
    'home.hero.paraguay': 'Hecho en Paraguay',
    'home.banner': 'Más que herramientas: una comunidad de QA que crece con vos',
    'home.what.title': '¿Qué es AIQUAA?',

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
    'nav.blog': 'Blog',
    'nav.labs': 'Labs',
    'nav.community': 'Community',
    'nav.about': 'About',
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

    // Home page
    'home.hero.title': 'AIQUAA: QA Community and Tools in Paraguay',
    'home.hero.subtitle': 'We transform testing in Paraguay with AI, tools and community',
    'home.hero.description': 'Validate your APIs and data, generate test cases and participate in workshops and mentoring. Join our open-source QA community.',
    'home.hero.explore': 'Explore Tools',
    'home.hero.join': 'Join the Community',
    'home.hero.free': '100% Free and Open Source',
    'home.hero.spanish': 'In Spanish',
    'home.hero.paraguay': 'Made in Paraguay',
    'home.banner': 'More than tools: a QA community that grows with you',
    'home.what.title': 'What is AIQUAA?',

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
