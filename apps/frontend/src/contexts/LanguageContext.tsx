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
    'home.grow.title': 'Aprendé, Colaborá y Crecé con AIQUAA',
    'home.grow.subtitle': 'Un laboratorio de utilidades y una comunidad de aprendizaje y colaboración',
    'home.blog.title': 'Blog de QA',
    'home.blog.description': 'Artículos sobre testing, automatización, IA y buenas prácticas. Casos reales de Paraguay y LATAM.',
    'home.blog.action': 'Leer artículos',
    'home.opensource.description': 'Contribuí al código, reportá bugs, sugiere features. Todo es público y transparente.',
    'home.opensource.action': 'Ver en GitHub',
    'home.mentoring.title': 'Mentorías y Eventos',
    'home.mentoring.description': 'Workshops, charlas, mentorías 1-on-1 y un espacio para compartir experiencias con otros testers.',
    'home.mentoring.action': 'Unirse ahora',
    'home.cta.title': '¿Listo para empezar?',
    'home.cta.description': 'Explorá las herramientas, lee el blog, colabora en GitHub y únete a la comunidad',
    'home.tools.title': 'Herramientas Gratuitas para Testers',
    'home.tools.subtitle': 'Explorá nuestras utilidades web para testers funcionales, automatizadores y QA manual',
    'home.tools.validator.title': 'Validador de JSON',
    'home.tools.validator.subtitle': 'Valida y formatea JSON de forma instantánea',
    'home.tools.validator.description': 'Herramienta esencial para validar respuestas de API, configuraciones y datos JSON.',
    'home.tools.validator.action': 'Usar Validador',
    'home.tools.generator.title': 'Generador de Datos',
    'home.tools.generator.subtitle': 'Genera datos de prueba realistas',
    'home.tools.generator.description': 'Crea datos de prueba para formularios, APIs y bases de datos de forma rápida.',
    'home.tools.generator.action': 'Generar Datos',
    'home.tools.checklist.title': 'Checklist de Pruebas',
    'home.tools.checklist.subtitle': 'Organiza y gestiona tus pruebas',
    'home.tools.checklist.description': 'Crea y gestiona listas de verificación para diferentes tipos de pruebas.',
    'home.tools.checklist.action': 'Crear Checklist',
    'home.founder.title': 'Conocé a Nuestro Fundador',
    'home.founder.name': 'Steven Ayala',
    'home.founder.role': 'QA Lead & Automation Engineer',
    'home.founder.specialty': 'Especialista en Calidad de Software',
    'home.founder.country': 'Paraguay',
    'home.founder.bio': 'Tester certificado ISTQB con más de 6 años de experiencia en QA, automatización y mejora continua del software. Apasionado por la formación, automatización y la innovación tecnológica. Enfocado en construir herramientas que empoderen a la comunidad QA de Paraguay y Latinoamérica.',
    'home.founder.skills': 'Habilidades Principales',
    'home.founder.linkedin': 'Ver LinkedIn',
    'home.founder.tools': 'Ver Herramientas',
    'home.founder.experience': 'Años de Experiencia',
    'home.founder.certified': 'Certificado',
    'home.founder.founder': 'Fundador',
    'home.faq.title': 'Preguntas Frecuentes',
    'home.faq.subtitle': 'Resolvemos las dudas más comunes sobre AIQUAA',
    'home.faq.q1': '¿Qué es AIQUAA?',
    'home.faq.a1': 'AIQUAA es una comunidad de testing y calidad de software en Paraguay. Brindamos recursos, herramientas gratuitas, mentorías y eventos para testers funcionales, automatizadores y QA manual.',
    'home.faq.q2': '¿Las herramientas son realmente gratuitas?',
    'home.faq.a2': 'Sí, todas nuestras herramientas son 100% gratuitas. No hay costos ocultos ni limitaciones. Creemos en democratizar el acceso a herramientas de calidad para la comunidad de QA.',
    'home.faq.q3': '¿Puedo contribuir al proyecto?',
    'home.faq.a3': '¡Absolutamente! AIQUAA es un proyecto de código abierto. Podés contribuir reportando bugs, sugiriendo nuevas funcionalidades, o enviando pull requests en nuestro repositorio de GitHub.',
    'home.faq.q4': '¿Ofrecen capacitaciones o mentorías?',
    'home.faq.a4': 'Sí, organizamos eventos, workshops y mentorías tanto presenciales como virtuales. Seguinos en nuestras redes sociales para estar al tanto de las próximas actividades.',
    'home.faq.q5': '¿Las herramientas funcionan en móviles?',
    'home.faq.a5': 'Todas nuestras herramientas están optimizadas para funcionar en dispositivos móviles, tablets y desktop. La experiencia es responsive y se adapta a cualquier pantalla.',

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
    'home.what.description': 'A software testing and quality assurance community in Paraguay.',
    'home.what.resources.title': 'Free Resources',
    'home.what.resources.description': 'Web tools, data generation, checklists, blog and practical guides for testers.',
    'home.what.events.title': 'Events and Mentoring',
    'home.what.events.description': 'Workshops, talks and expert guidance on automation and QA best practices.',
    'home.what.opensource.title': 'Open Source',
    'home.what.opensource.description': 'All code is open. Made in Paraguay for Latin American testers.',
    'home.what.mission': 'Inspired by the Guarani term "aikuaa" (to know, to understand), AIQUAA combines artificial intelligence (AI) with quality assurance (QA) to transform testing in the region.',
    'home.grow.title': 'Learn, Collaborate and Grow with AIQUAA',
    'home.grow.subtitle': 'A laboratory of utilities and a community for learning and collaboration',
    'home.blog.title': 'QA Blog',
    'home.blog.description': 'Articles about testing, automation, AI and best practices. Real cases from Paraguay and LATAM.',
    'home.blog.action': 'Read articles',
    'home.opensource.description': 'Contribute to the code, report bugs, suggest features. Everything is public and transparent.',
    'home.opensource.action': 'View on GitHub',
    'home.mentoring.title': 'Mentoring and Events',
    'home.mentoring.description': 'Workshops, talks, 1-on-1 mentoring and a space to share experiences with other testers.',
    'home.mentoring.action': 'Join now',
    'home.cta.title': 'Ready to start?',
    'home.cta.description': 'Explore the tools, read the blog, collaborate on GitHub and join the community',
    'home.tools.title': 'Free Tools for Testers',
    'home.tools.subtitle': 'Explore our web utilities for functional testers, automation engineers and manual QA',
    'home.tools.validator.title': 'JSON Validator',
    'home.tools.validator.subtitle': 'Validate and format JSON instantly',
    'home.tools.validator.description': 'Essential tool to validate API responses, configurations and JSON data.',
    'home.tools.validator.action': 'Use Validator',
    'home.tools.generator.title': 'Data Generator',
    'home.tools.generator.subtitle': 'Generate realistic test data',
    'home.tools.generator.description': 'Create test data for forms, APIs and databases quickly.',
    'home.tools.generator.action': 'Generate Data',
    'home.tools.checklist.title': 'Test Checklist',
    'home.tools.checklist.subtitle': 'Organize and manage your tests',
    'home.tools.checklist.description': 'Create and manage checklists for different types of tests.',
    'home.tools.checklist.action': 'Create Checklist',
    'home.founder.title': 'Meet Our Founder',
    'home.founder.name': 'Steven Ayala',
    'home.founder.role': 'QA Lead & Automation Engineer',
    'home.founder.specialty': 'Software Quality Specialist',
    'home.founder.country': 'Paraguay',
    'home.founder.bio': 'ISTQB certified tester with over 6 years of experience in QA, automation and continuous software improvement. Passionate about training, automation and technological innovation. Focused on building tools that empower the QA community in Paraguay and Latin America.',
    'home.founder.skills': 'Key Skills',
    'home.founder.linkedin': 'View LinkedIn',
    'home.founder.tools': 'View Tools',
    'home.founder.experience': 'Years of Experience',
    'home.founder.certified': 'Certified',
    'home.founder.founder': 'Founder',
    'home.faq.title': 'Frequently Asked Questions',
    'home.faq.subtitle': 'We answer the most common questions about AIQUAA',
    'home.faq.q1': 'What is AIQUAA?',
    'home.faq.a1': 'AIQUAA is a software testing and quality assurance community in Paraguay. We provide resources, free tools, mentoring and events for functional testers, automation engineers and manual QA.',
    'home.faq.q2': 'Are the tools really free?',
    'home.faq.a2': 'Yes, all our tools are 100% free. There are no hidden costs or limitations. We believe in democratizing access to quality tools for the QA community.',
    'home.faq.q3': 'Can I contribute to the project?',
    'home.faq.a3': 'Absolutely! AIQUAA is an open source project. You can contribute by reporting bugs, suggesting new features, or submitting pull requests on our GitHub repository.',
    'home.faq.q4': 'Do you offer training or mentoring?',
    'home.faq.a4': 'Yes, we organize events, workshops and mentoring both in-person and virtual. Follow us on social media to stay informed about upcoming activities.',
    'home.faq.q5': 'Do the tools work on mobile devices?',
    'home.faq.a5': 'All our tools are optimized to work on mobile devices, tablets and desktop. The experience is responsive and adapts to any screen size.',

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
