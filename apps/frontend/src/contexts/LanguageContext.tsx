'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export type Language = 'es' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (_lang: Language) => void;
  t: (_key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

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
    'nav.resources': 'Recursos',
    'nav.community': 'Comunidad',
    'nav.about': 'Acerca de',
    'nav.dashboard': 'Dashboard',
    'nav.forum': 'Foro',
    'nav.courses': 'Cursos',
    'nav.profile': 'Perfil',
    'nav.ranking': 'Ranking',
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
    'labs.page.title': 'AIQUAA Labs',
    'labs.page.subtitle':
      'Herramientas gratuitas para testers funcionales, automatizadores y QA manual. Todo en español y diseñado específicamente para la comunidad de testing en Paraguay.',
    'labs.featured.title': 'Destacadas del Mes',
    'labs.featured.subtitle':
      'Las herramientas más utilizadas por la comunidad',
    'labs.why.title': '¿Por qué usar AIQUAA Labs?',
    'labs.why.subtitle':
      'Nuestras herramientas están diseñadas específicamente para testers, con interfaz en español y funcionalidades que realmente necesitas en tu día a día.',
    'labs.why.free': 'Gratis y Abierto',
    'labs.why.free.desc':
      'Todas las herramientas son completamente gratuitas y de código abierto.',
    'labs.why.local': 'Hecho en Paraguay',
    'labs.why.local.desc':
      'Desarrollado por testers locales para testers locales.',
    'labs.why.updated': 'Siempre Actualizado',
    'labs.why.updated.desc':
      'Nuevas herramientas y mejoras constantes basadas en feedback real.',
    'labs.cta.title': '¿Tienes una idea para una nueva herramienta?',
    'labs.cta.subtitle':
      '¡Comparte tu feedback, reporta bugs o sugiere mejoras en nuestra página de comunidad!',
    'labs.cta.button': 'Ir a Comunidad',
    'labs.action': 'Hacer click para usar',

    // Home page - Hero Section
    'home.hero.title': 'El ecosistema QA que te prepara para el mundo real',
    'home.hero.subtitle':
      'Practica con simuladores, laboratorios y evaluaciones técnicas, prepárate para certificaciones y demuestra tus habilidades. Las empresas pueden descubrir talento QA evaluado por AIQUAA.',
    'home.hero.cta.primary': 'Únete Gratis',
    'home.hero.cta.secondary': 'Explorar Herramientas',
    'home.hero.trust.free': '100% Gratis',
    'home.hero.trust.opensource': 'Potenciado con IA',
    'home.hero.trust.spanish': 'En Español',
    'home.hero.trust.paraguay': 'Hecho en Paraguay',
    'home.hero.stats.tools': 'herramientas gratuitas',
    'home.hero.stats.resources': 'recursos de estudio',
    'home.hero.stats.community': 'usuarios registrados',
    'home.hero.suru.message': '¡Hola! Soy Suru, tu guía en el mundo del QA',
    'home.banner':
      'Más que herramientas: una comunidad de QA que crece con vos',
    'home.what.title': '¿Qué es AIQUAA?',
    'home.what.description':
      'Una comunidad de testing y aseguramiento de calidad de software en Paraguay.',
    'home.what.resources.title': 'Recursos Gratuitos',
    'home.what.resources.description':
      'Herramientas web, generación de datos, checklists, blog y guías prácticas para testers.',
    'home.what.events.title': 'Eventos y Mentorías',
    'home.what.events.description':
      'Workshops, charlas y orientación experta sobre automatización y buenas prácticas de QA.',
    'home.what.opensource.title': 'Open Source',
    'home.what.opensource.description':
      'Todo el código es abierto. Hecho en Paraguay para testers de Latinoamérica.',
    'home.what.mission':
      'Inspirado en el término guaraní "aikuaa" (saber, conocer), AIQUAA combina inteligencia artificial (IA) con aseguramiento de calidad (QA) para transformar el testing en la región.',
    'home.grow.title': 'Aprendé, Colaborá y Crecé con AIQUAA',
    'home.grow.subtitle':
      'Un laboratorio de utilidades y una comunidad de aprendizaje y colaboración',
    'home.blog.title': 'Blog de QA',
    'home.blog.description':
      'Artículos sobre testing, automatización, IA y buenas prácticas. Casos reales de Paraguay y LATAM.',
    'home.blog.action': 'Leer artículos',
    'home.opensource.description':
      'Contribuí al código, reportá bugs, sugiere features. Todo es público y transparente.',
    'home.opensource.action': 'Ver en GitHub',
    'home.mentoring.title': 'Mentorías y Eventos',
    'home.mentoring.description':
      'Workshops, charlas, mentorías 1-on-1 y un espacio para compartir experiencias con otros testers.',
    'home.mentoring.action': 'Unirse ahora',
    'home.cta.title': '¿Listo para empezar?',
    'home.cta.description':
      'Explorá las herramientas, lee el blog, colabora en GitHub y únete a la comunidad',
    'home.tools.title': 'Herramientas Gratuitas para Testers',
    'home.tools.subtitle':
      'Explorá nuestras utilidades web para testers funcionales, automatizadores y QA manual',
    'home.tools.validator.title': 'Validador de JSON',
    'home.tools.validator.subtitle':
      'Valida y formatea JSON de forma instantánea',
    'home.tools.validator.description':
      'Herramienta esencial para validar respuestas de API, configuraciones y datos JSON.',
    'home.tools.validator.action': 'Usar Validador',
    'home.tools.generator.title': 'Generador de Datos',
    'home.tools.generator.subtitle': 'Genera datos de prueba realistas',
    'home.tools.generator.description':
      'Crea datos de prueba para formularios, APIs y bases de datos de forma rápida.',
    'home.tools.generator.action': 'Generar Datos',
    'home.tools.checklist.title': 'Checklist de Pruebas',
    'home.tools.checklist.subtitle': 'Organiza y gestiona tus pruebas',
    'home.tools.checklist.description':
      'Crea y gestiona listas de verificación para diferentes tipos de pruebas.',
    'home.tools.checklist.action': 'Crear Checklist',
    'home.founder.title': 'Conocé a Nuestro Fundador',
    'home.founder.name': 'Steven Ayala',
    'home.founder.role': 'QA Lead & Automation Engineer',
    'home.founder.specialty': 'Especialista en Calidad de Software',
    'home.founder.country': 'Paraguay',
    'home.founder.bio':
      'Tester certificado ISTQB con más de 6 años de experiencia en QA, automatización y mejora continua del software. Apasionado por la formación, automatización y la innovación tecnológica. Enfocado en construir herramientas que empoderen a la comunidad QA de Paraguay y Latinoamérica.',
    'home.founder.skills': 'Habilidades Principales',
    'home.founder.linkedin': 'Ver LinkedIn',
    'home.founder.tools': 'Ver Herramientas',
    'home.founder.experience': 'Años de Experiencia',
    'home.founder.certified': 'Certificado',
    'home.founder.founder': 'Fundador',
    'home.faq.title': 'Preguntas Frecuentes',
    'home.faq.subtitle': 'Resolvemos las dudas más comunes sobre AIQUAA',
    'home.faq.q1': '¿Qué es AIQUAA?',
    'home.faq.a1':
      'AIQUAA es una comunidad de testing y calidad de software en Paraguay. Brindamos recursos, herramientas gratuitas, mentorías y eventos para testers funcionales, automatizadores y QA manual.',
    'home.faq.q2': '¿Las herramientas son realmente gratuitas?',
    'home.faq.a2':
      'Sí, todas nuestras herramientas son 100% gratuitas. No hay costos ocultos ni limitaciones. Creemos en democratizar el acceso a herramientas de calidad para la comunidad de QA.',
    'home.faq.q3': '¿Puedo contribuir al proyecto?',
    'home.faq.a3':
      '¡Absolutamente! AIQUAA es un proyecto de código abierto. Podés contribuir reportando bugs, sugiriendo nuevas funcionalidades, o enviando pull requests en nuestro repositorio de GitHub.',
    'home.faq.q4': '¿Ofrecen capacitaciones o mentorías?',
    'home.faq.a4':
      'Sí, organizamos eventos, workshops y mentorías tanto presenciales como virtuales. Seguinos en nuestras redes sociales para estar al tanto de las próximas actividades.',
    'home.faq.q5': '¿Las herramientas funcionan en móviles?',
    'home.faq.a5':
      'Todas nuestras herramientas están optimizadas para funcionar en dispositivos móviles, tablets y desktop. La experiencia es responsive y se adapta a cualquier pantalla.',

    // YouTube Section
    'youtube.title': 'Aprende con Nuestros Videos',
    'youtube.subtitle':
      'Serie completa de tutoriales sobre testing, ISTQB, JMeter y más. Nuevos videos cada semana.',
    'youtube.subscribe': 'Suscribirse al Canal',
    'youtube.watch': 'Ver Video',
    'youtube.playlist': 'Ver Lista Completa',
    'youtube.chapter': 'Capítulo',
    'youtube.duration': 'Duración',
    'youtube.new': 'Nuevo',

    // Collaboration Section
    'collaboration.title': '¿Qué problema de testing te gustaría resolver?',
    'collaboration.description':
      '¿Qué problema de testing te gustaría resolver con una herramienta? Comparte tus ideas en la comunidad de AIQUAA y colabora con nosotros para crearla. Inspírate en los videos de nuestro canal y en las necesidades de tu día a día como tester. Tu propuesta puede convertirse en la próxima herramienta gratuita para la comunidad.',
    'collaboration.cta': 'Proponer Nueva Herramienta',
    'collaboration.examples.title': 'Ejemplos de ideas que buscamos',
    'collaboration.examples.1':
      'Generador de datos de prueba para formularios específicos',
    'collaboration.examples.2': 'Comparador de respuestas JSON entre ambientes',
    'collaboration.examples.3': 'Calculadora de cobertura de pruebas',
    'collaboration.examples.4': 'Validador de accesibilidad web',

    // ISTQB Simulator Highlight
    'istqb.simulator.title': 'Practica con el Simulador ISTQB',
    'istqb.simulator.description':
      'Prepárate para tu certificación ISTQB CTFL v4.0 con nuestros exámenes de práctica. Descarga el syllabus, practica con los modelos A y B, y refuerza lo aprendido con nuestros videos.',
    'istqb.simulator.practice': 'Practicar Ahora',
    'istqb.simulator.resources': 'Ver Recursos ISTQB',
    'istqb.simulator.videos': 'Ver Videos ISTQB',
    'istqb.simulator.features.1': 'Exámenes oficiales Modelo A y B',
    'istqb.simulator.features.2': 'Programa de estudio completo v4.0',
    'istqb.simulator.features.3': 'Videos explicativos de cada tema',
    'istqb.simulator.features.4': 'Respuestas con justificaciones detalladas',

    // Community
    'community.title': 'Comunidad AIQUAA',
    'community.subtitle':
      'Tu opinión es fundamental para mejorar AIQUAA. Comparte ideas, reporta bugs, sugiere nuevas herramientas o simplemente charla con la comunidad.',
    'community.timeline.title': 'Línea de Tiempo AIQUAA',
    'community.events.title': 'Eventos Pasados',
    'community.events.subtitle':
      'Revive las grabaciones de nuestros eventos anteriores',
    'community.events.watch': 'Ver Grabación',
    'community.events.none':
      'Próximamente agregaremos grabaciones de eventos pasados',
    'community.issues.title': 'Reportar Issues',
    'community.issues.desc':
      '¿Encontraste un bug? ¿Tenés una idea para una nueva feature? Creá un issue en GitHub.',
    'community.issues.button': 'Crear Issue',
    'community.discussions.title': 'GitHub Discussions',
    'community.discussions.desc':
      'Participa en conversaciones, comparte experiencias y conecta con la comunidad.',
    'community.discussions.button': 'Ver Discussions',
    'community.opensource.title': 'Proyecto Open Source',
    'community.opensource.desc':
      'AIQUAA es de código abierto. Todo el código está disponible en GitHub. ¡Las contribuciones son bienvenidas!',
    'community.comments.title': 'Comentarios de la Comunidad',
    'community.comments.subtitle':
      'Comparte tu experiencia, haz preguntas o simplemente saluda. Estos comentarios se sincronizan automáticamente con GitHub Discussions.',
    'community.guide.title': 'Guía para contribuir',
    'community.guide.issues':
      'Issues: Para bugs, features específicas o problemas técnicos',
    'community.guide.discussions':
      'Discussions: Para preguntas, ideas generales o conversaciones',
    'community.guide.comments':
      'Comentarios abajo: Para feedback rápido sobre la página o el proyecto',
    'community.guide.respect':
      'Sé respetuoso y constructivo. Este es un espacio para aprender y crecer juntos.',

    // Resources
    'resources.title': 'Recursos de QA',
    'resources.subtitle':
      'Material de estudio, guías técnicas y referencias bibliográficas para tu crecimiento profesional en QA',
    'resources.category.git': 'Git & Control de Versiones',
    'resources.category.git.desc':
      'Documentación y guías sobre Git y gestión de código',
    'resources.category.performance': 'Performance Testing',
    'resources.category.performance.desc':
      'Guías de JMeter, K6 y herramientas de testing de rendimiento',
    'resources.category.testing': 'Testing Fundamentals',
    'resources.category.testing.desc':
      'Fundamentos de testing, ISTQB y mejores prácticas',
    'resources.category.automation': 'Test Automation',
    'resources.category.automation.desc':
      'Automatización de pruebas con Selenium, Cypress y más',
    'resources.view': 'Ver Documento',
    'resources.download': 'Descargar PDF',
    'resources.pages': 'páginas',
    'resources.updated': 'Actualizado',
    'resources.featured': 'Destacado',
    'resources.new': 'Nuevo',

    // About
    'about.title': 'Acerca de AIQUAA',
    'about.tagline':
      'Saber es Calidad. Inspirados por el conocimiento, impulsados por la comunidad.',
    'about.what.title': '¿Qué es AIQUAA?',
    'about.what.desc1':
      'AIQUAA es una iniciativa paraguaya que fusiona conocimiento local con innovación global en testing de software. Inspirada en el término guaraní "aikuaa" —que significa saber o conocer—, nuestra misión es construir una comunidad comprometida con la calidad, la capacitación constante y la excelencia profesional.',
    'about.what.desc2':
      'Combinamos inteligencia artificial (AI) con aseguramiento de calidad (QA) para transformar el testing en Paraguay y en la región.',
    'about.mission.title': 'Misión',
    'about.mission.desc':
      'Construir la comunidad de QA más fuerte de Paraguay, brindando herramientas, recursos y capacitación de calidad.',
    'about.vision.title': 'Visión',
    'about.vision.desc':
      'Ser el referente en testing y calidad de software en Paraguay, impulsando la innovación y el desarrollo profesional.',
    'about.values.title': 'Valores',
    'about.values.desc':
      'Calidad, innovación, comunidad, aprendizaje continuo y excelencia en todo lo que hacemos.',
    'about.tools.title': 'Nuestras Herramientas',
    'about.tools.validator': 'Validador JSON',
    'about.tools.validator.desc': 'Valida y formatea JSON',
    'about.tools.generator': 'Generador de Datos',
    'about.tools.generator.desc': 'Crea datos de prueba',
    'about.tools.checklist': 'Checklist',
    'about.tools.checklist.desc': 'Listas de verificación',
    'about.tools.jwt': 'Decodificador JWT',
    'about.tools.jwt.desc': 'Analiza tokens JWT',

    // Team / Founders
    'about.founder.title': 'Equipo Fundador',
    'about.founder.role': 'Fundador y Creador de AIQUAA',
    'about.founder.bio':
      'QA Engineer apasionado por la educación, las pruebas de software y la comunidad tech en Paraguay. Creador de AIQUAA con la visión de democratizar el acceso a herramientas y conocimiento de QA en español.',
    'about.cofounder.name': 'Ana Duarte',
    'about.cofounder.role': 'Co-Fundadora & Analista de Datos',
    'about.cofounder.bio':
      'Analista de Datos con experiencia en inteligencia de negocios, visualización de datos y toma de decisiones basada en métricas. Co-fundadora de AIQUAA, impulsando la dimensión analítica y de datos de la plataforma para fortalecer la comunidad QA de Paraguay.',

    // Footer
    'footer.rights': 'Todos los derechos reservados',
    'footer.about': 'Acerca de',
    'footer.contact': 'Contacto',
    'footer.privacy': 'Privacidad',
    'footer.terms': 'Términos',

    // Suru Mascot
    'suru.welcome': '¡Hola! Soy Suru, tu guía en AIQUAA',
    'suru.onboarding.welcome':
      '¡Hola! Soy Suru, tu compañero en el mundo del QA. Estoy aquí para guiarte en tu camino hacia la excelencia en testing.',
    'suru.onboarding.explore':
      'AIQUAA tiene herramientas gratuitas, recursos de estudio y una comunidad activa. Explora todo lo que tenemos para ofrecerte.',
    'suru.onboarding.learn':
      'Prepárate para certificaciones ISTQB y JMeter, practica con exámenes técnicos y mejora tus habilidades de testing.',
    'suru.onboarding.ready':
      '¡Estás listo para comenzar! Recuerda que siempre estaré aquí si necesitas ayuda navegando por el sitio.',
    'suru.onboarding.next': 'Siguiente',
    'suru.onboarding.previous': 'Anterior',
    'suru.onboarding.skip': 'Saltar introducción',
    'suru.onboarding.start': '¡Empecemos!',
    'suru.tooltip.labs': 'Descubre nuestras herramientas de testing',
    'suru.tooltip.istqb': 'Practica para tu certificación ISTQB',
    'suru.tooltip.community': 'Únete a la comunidad QA',
    'suru.error.404':
      'Ups, parece que esta página se perdió en el río Paraguay...',
    'suru.error.500': 'Estoy trabajando en arreglar esto, dame un momento',
    'suru.loading': 'Nadando por los datos...',
    'suru.success': '¡Excelente trabajo! Test aprobado',

    // Suru - Motivational phrases
    'suru.intro':
      '¡Hola! Soy Suru, el personaje que va a apoyarte en la salida de tu zona de confort y aprendizaje',
    'suru.motivation.basicoite':
      'Básicamente, el testing es encontrar lo que otros no vieron',
    'suru.motivation.afallapa':
      'En ese sentido, afallapaite nomás, que de los errores se aprende',
    'suru.motivation.competition':
      'La única competencia que tenés que derrotar es a vos mismo',
    'suru.motivation.discipline':
      'La disciplina vence al solo talento, por consistencia y forma',
    'suru.motivation.growth':
      'Cada bug encontrado es un paso más hacia la excelencia',
    'suru.motivation.community':
      'Juntos crecemos más fuerte. La comunidad QA está aquí para vos',

    // Auth
    'auth.login.title': 'Iniciar sesión en tu cuenta',
    'auth.register.title': 'Crear tu cuenta',
    'auth.login.submit': 'Iniciar sesión',
    'auth.login.loading': 'Iniciando sesión...',
    'auth.register.submit': 'Crear cuenta',
    'auth.register.loading': 'Creando cuenta...',
    'auth.login.linkText': 'crea una nueva cuenta',
    'auth.register.linkText': 'inicia sesión si ya tienes una cuenta',
    'auth.field.name': 'Nombre completo',
    'auth.field.email': 'Email',
    'auth.field.password': 'Contraseña',
    'auth.field.confirmPassword': 'Confirmar contraseña',
    'auth.register.link': '¿No tienes cuenta? Regístrate',
    'auth.resend.button': '📧 Reenviar correo de confirmación',
    'auth.resend.loading': 'Reenviando...',
    'auth.error.oauth': 'Tu email ya está vinculado con otro proveedor.',
    'auth.error.registrationDisabled':
      'Registro deshabilitado. Contacta al administrador.',
    'auth.success.registration':
      'Registro exitoso. Ahora puedes iniciar sesión con tus credenciales.',

    // Forum
    'forum.title': '🗨️ Foro de la Comunidad',
    'forum.subtitle':
      'Conecta con otros profesionales, comparte conocimientos y resuelve dudas en nuestro foro comunitario.',
    'forum.stats.title': '📊 Estadísticas del Foro',
    'forum.stats.threads': 'Threads Creados',
    'forum.stats.replies': 'Respuestas',
    'forum.stats.members': 'Miembros',
    'forum.stats.activeToday': 'Activos Hoy',
    'forum.stats.avgReplies': 'Promedio de respuestas por thread:',
    'forum.stats.activity': 'Actividad de la comunidad:',
    'forum.stats.lastUpdate': 'Última actualización:',
    'forum.filters.title': 'Filtros',
    'forum.filters.search': '🔍 Buscar',
    'forum.filters.searchPlaceholder': 'Buscar en threads...',
    'forum.filters.categories': '📂 Categorías',
    'forum.filters.allCategories': 'Todas las categorías',
    'forum.filters.tags': '🏷️ Tags',
    'forum.filters.sortBy': '📊 Ordenar por',
    'forum.filters.newest': 'Más recientes',
    'forum.filters.oldest': 'Más antiguos',
    'forum.filters.mostViewed': 'Más vistos',
    'forum.filters.mostReplied': 'Más respondidos',
    'forum.filters.clear': '🗑️ Limpiar Filtros',
    'forum.filters.active': 'Filtros activos:',
    'forum.filters.showing': 'Mostrando 20 de {count} tags',
    'forum.thread.views': 'vistas',
    'forum.thread.replies': 'respuestas',
    'forum.thread.by': 'Por',
    'forum.thread.edited': 'editado',
    'forum.thread.view': 'Ver thread →',
    'forum.thread.edit': '✏️ Editar',
    'forum.thread.delete': '🗑️ Eliminar',
    'forum.thread.deleting': '🗑️ Eliminando...',
    'forum.empty.title': 'No hay threads disponibles',
    'forum.empty.auth': '¡Sé el primero en crear un thread!',
    'forum.empty.guest': 'Inicia sesión para crear el primer thread',
    'forum.create': '✏️ Crear Nuevo Thread',
    'forum.cancel': '❌ Cancelar',
    'forum.loading': 'Cargando threads...',
    'forum.pagination.prev': '← Anterior',
    'forum.pagination.next': 'Siguiente →',
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.blog': 'Blog',
    'nav.labs': 'Labs',
    'nav.resources': 'Resources',
    'nav.community': 'Community',
    'nav.about': 'About',
    'nav.dashboard': 'Dashboard',
    'nav.forum': 'Forum',
    'nav.courses': 'Courses',
    'nav.profile': 'Profile',
    'nav.ranking': 'Ranking',
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
    'labs.page.title': 'AIQUAA Labs',
    'labs.page.subtitle':
      'Free tools for functional testers, automation engineers and manual QA. Everything in Spanish and designed specifically for the testing community in Paraguay.',
    'labs.featured.title': 'Featured This Month',
    'labs.featured.subtitle': 'The most used tools by the community',
    'labs.why.title': 'Why use AIQUAA Labs?',
    'labs.why.subtitle':
      'Our tools are designed specifically for testers, with a Spanish interface and features you really need in your day-to-day work.',
    'labs.why.free': 'Free and Open',
    'labs.why.free.desc': 'All tools are completely free and open source.',
    'labs.why.local': 'Made in Paraguay',
    'labs.why.local.desc': 'Developed by local testers for local testers.',
    'labs.why.updated': 'Always Updated',
    'labs.why.updated.desc':
      'New tools and constant improvements based on real feedback.',
    'labs.cta.title': 'Have an idea for a new tool?',
    'labs.cta.subtitle':
      'Share your feedback, report bugs or suggest improvements on our community page!',
    'labs.cta.button': 'Go to Community',
    'labs.action': 'Click to use',

    // Home page - Hero Section
    'home.hero.title': 'The QA ecosystem that prepares you for the real world',
    'home.hero.subtitle':
      'Practice with simulators, labs and technical assessments, get ready for certifications and prove your skills. Companies can discover QA talent assessed by AIQUAA.',
    'home.hero.cta.primary': 'Join Free',
    'home.hero.cta.secondary': 'Explore Tools',
    'home.hero.trust.free': '100% Free',
    'home.hero.trust.opensource': 'Powered by AI',
    'home.hero.trust.spanish': 'In Spanish',
    'home.hero.trust.paraguay': 'Made in Paraguay',
    'home.hero.stats.tools': 'free tools',
    'home.hero.stats.resources': 'study resources',
    'home.hero.stats.community': 'registered users',
    'home.hero.suru.message': "Hi! I'm Suru, your guide in the QA world",
    'home.banner': 'More than tools: a QA community that grows with you',
    'home.what.title': 'What is AIQUAA?',
    'home.what.description':
      'A software testing and quality assurance community in Paraguay.',
    'home.what.resources.title': 'Free Resources',
    'home.what.resources.description':
      'Web tools, data generation, checklists, blog and practical guides for testers.',
    'home.what.events.title': 'Events and Mentoring',
    'home.what.events.description':
      'Workshops, talks and expert guidance on automation and QA best practices.',
    'home.what.opensource.title': 'Open Source',
    'home.what.opensource.description':
      'All code is open. Made in Paraguay for Latin American testers.',
    'home.what.mission':
      'Inspired by the Guarani term "aikuaa" (to know, to understand), AIQUAA combines artificial intelligence (AI) with quality assurance (QA) to transform testing in the region.',
    'home.grow.title': 'Learn, Collaborate and Grow with AIQUAA',
    'home.grow.subtitle':
      'A laboratory of utilities and a community for learning and collaboration',
    'home.blog.title': 'QA Blog',
    'home.blog.description':
      'Articles about testing, automation, AI and best practices. Real cases from Paraguay and LATAM.',
    'home.blog.action': 'Read articles',
    'home.opensource.description':
      'Contribute to the code, report bugs, suggest features. Everything is public and transparent.',
    'home.opensource.action': 'View on GitHub',
    'home.mentoring.title': 'Mentoring and Events',
    'home.mentoring.description':
      'Workshops, talks, 1-on-1 mentoring and a space to share experiences with other testers.',
    'home.mentoring.action': 'Join now',
    'home.cta.title': 'Ready to start?',
    'home.cta.description':
      'Explore the tools, read the blog, collaborate on GitHub and join the community',
    'home.tools.title': 'Free Tools for Testers',
    'home.tools.subtitle':
      'Explore our web utilities for functional testers, automation engineers and manual QA',
    'home.tools.validator.title': 'JSON Validator',
    'home.tools.validator.subtitle': 'Validate and format JSON instantly',
    'home.tools.validator.description':
      'Essential tool to validate API responses, configurations and JSON data.',
    'home.tools.validator.action': 'Use Validator',
    'home.tools.generator.title': 'Data Generator',
    'home.tools.generator.subtitle': 'Generate realistic test data',
    'home.tools.generator.description':
      'Create test data for forms, APIs and databases quickly.',
    'home.tools.generator.action': 'Generate Data',
    'home.tools.checklist.title': 'Test Checklist',
    'home.tools.checklist.subtitle': 'Organize and manage your tests',
    'home.tools.checklist.description':
      'Create and manage checklists for different types of tests.',
    'home.tools.checklist.action': 'Create Checklist',
    'home.founder.title': 'Meet Our Founder',
    'home.founder.name': 'Steven Ayala',
    'home.founder.role': 'QA Lead & Automation Engineer',
    'home.founder.specialty': 'Software Quality Specialist',
    'home.founder.country': 'Paraguay',
    'home.founder.bio':
      'ISTQB certified tester with over 6 years of experience in QA, automation and continuous software improvement. Passionate about training, automation and technological innovation. Focused on building tools that empower the QA community in Paraguay and Latin America.',
    'home.founder.skills': 'Key Skills',
    'home.founder.linkedin': 'View LinkedIn',
    'home.founder.tools': 'View Tools',
    'home.founder.experience': 'Years of Experience',
    'home.founder.certified': 'Certified',
    'home.founder.founder': 'Founder',
    'home.faq.title': 'Frequently Asked Questions',
    'home.faq.subtitle': 'We answer the most common questions about AIQUAA',
    'home.faq.q1': 'What is AIQUAA?',
    'home.faq.a1':
      'AIQUAA is a software testing and quality assurance community in Paraguay. We provide resources, free tools, mentoring and events for functional testers, automation engineers and manual QA.',
    'home.faq.q2': 'Are the tools really free?',
    'home.faq.a2':
      'Yes, all our tools are 100% free. There are no hidden costs or limitations. We believe in democratizing access to quality tools for the QA community.',
    'home.faq.q3': 'Can I contribute to the project?',
    'home.faq.a3':
      'Absolutely! AIQUAA is an open source project. You can contribute by reporting bugs, suggesting new features, or submitting pull requests on our GitHub repository.',
    'home.faq.q4': 'Do you offer training or mentoring?',
    'home.faq.a4':
      'Yes, we organize events, workshops and mentoring both in-person and virtual. Follow us on social media to stay informed about upcoming activities.',
    'home.faq.q5': 'Do the tools work on mobile devices?',
    'home.faq.a5':
      'All our tools are optimized to work on mobile devices, tablets and desktop. The experience is responsive and adapts to any screen size.',

    // YouTube Section
    'youtube.title': 'Learn with Our Videos',
    'youtube.subtitle':
      'Complete series of tutorials on testing, ISTQB, JMeter and more. New videos every week.',
    'youtube.subscribe': 'Subscribe to Channel',
    'youtube.watch': 'Watch Video',
    'youtube.playlist': 'View Full Playlist',
    'youtube.chapter': 'Chapter',
    'youtube.duration': 'Duration',
    'youtube.new': 'New',

    // Collaboration Section
    'collaboration.title': 'What testing problem would you like to solve?',
    'collaboration.description':
      'What testing problem would you like to solve with a tool? Share your ideas in the AIQUAA community and collaborate with us to create it. Get inspired by the videos on our channel and the needs of your daily work as a tester. Your proposal could become the next free tool for the community.',
    'collaboration.cta': 'Propose New Tool',
    'collaboration.examples.title': 'Examples of ideas we are looking for',
    'collaboration.examples.1': 'Test data generator for specific forms',
    'collaboration.examples.2': 'JSON response comparator between environments',
    'collaboration.examples.3': 'Test coverage calculator',
    'collaboration.examples.4': 'Web accessibility validator',

    // ISTQB Simulator Highlight
    'istqb.simulator.title': 'Practice with the ISTQB Simulator',
    'istqb.simulator.description':
      'Prepare for your ISTQB CTFL v4.0 certification with our practice exams. Download the syllabus, practice with models A and B, and reinforce what you learned with our videos.',
    'istqb.simulator.practice': 'Practice Now',
    'istqb.simulator.resources': 'View ISTQB Resources',
    'istqb.simulator.videos': 'Watch ISTQB Videos',
    'istqb.simulator.features.1': 'Official exams Model A and B',
    'istqb.simulator.features.2': 'Complete study program v4.0',
    'istqb.simulator.features.3': 'Explanatory videos for each topic',
    'istqb.simulator.features.4': 'Answers with detailed justifications',

    // Community
    'community.title': 'AIQUAA Community',
    'community.subtitle':
      'Your opinion is essential to improve AIQUAA. Share ideas, report bugs, suggest new tools or just chat with the community.',
    'community.timeline.title': 'AIQUAA Timeline',
    'community.events.title': 'Past Events',
    'community.events.subtitle': 'Relive the recordings of our previous events',
    'community.events.watch': 'Watch Recording',
    'community.events.none': 'We will soon add recordings of past events',
    'community.issues.title': 'Report Issues',
    'community.issues.desc':
      'Found a bug? Have an idea for a new feature? Create an issue on GitHub.',
    'community.issues.button': 'Create Issue',
    'community.discussions.title': 'GitHub Discussions',
    'community.discussions.desc':
      'Participate in conversations, share experiences and connect with the community.',
    'community.discussions.button': 'View Discussions',
    'community.opensource.title': 'Open Source Project',
    'community.opensource.desc':
      'AIQUAA is open source. All code is available on GitHub. Contributions are welcome!',
    'community.comments.title': 'Community Comments',
    'community.comments.subtitle':
      'Share your experience, ask questions or just say hello. These comments sync automatically with GitHub Discussions.',
    'community.guide.title': 'Contribution Guide',
    'community.guide.issues':
      'Issues: For bugs, specific features or technical problems',
    'community.guide.discussions':
      'Discussions: For questions, general ideas or conversations',
    'community.guide.comments':
      'Comments below: For quick feedback on the page or project',
    'community.guide.respect':
      'Be respectful and constructive. This is a space to learn and grow together.',

    // Resources
    'resources.title': 'QA Resources',
    'resources.subtitle':
      'Study materials, technical guides and bibliographic references for your professional growth in QA',
    'resources.category.git': 'Git & Version Control',
    'resources.category.git.desc':
      'Documentation and guides about Git and code management',
    'resources.category.performance': 'Performance Testing',
    'resources.category.performance.desc':
      'Guides for JMeter, K6 and performance testing tools',
    'resources.category.testing': 'Testing Fundamentals',
    'resources.category.testing.desc':
      'Testing fundamentals, ISTQB and best practices',
    'resources.category.automation': 'Test Automation',
    'resources.category.automation.desc':
      'Test automation with Selenium, Cypress and more',
    'resources.view': 'View Document',
    'resources.download': 'Download PDF',
    'resources.pages': 'pages',
    'resources.updated': 'Updated',
    'resources.featured': 'Featured',
    'resources.new': 'New',

    // About
    'about.title': 'About AIQUAA',
    'about.tagline':
      'Knowledge is Quality. Inspired by knowledge, driven by community.',
    'about.what.title': 'What is AIQUAA?',
    'about.what.desc1':
      'AIQUAA is a Paraguayan initiative that merges local knowledge with global innovation in software testing. Inspired by the Guarani term "aikuaa" —which means to know or to understand—, our mission is to build a community committed to quality, constant training and professional excellence.',
    'about.what.desc2':
      'We combine artificial intelligence (AI) with quality assurance (QA) to transform testing in Paraguay and the region.',
    'about.mission.title': 'Mission',
    'about.mission.desc':
      'Build the strongest QA community in Paraguay, providing quality tools, resources and training.',
    'about.vision.title': 'Vision',
    'about.vision.desc':
      'Be the reference in software testing and quality in Paraguay, driving innovation and professional development.',
    'about.values.title': 'Values',
    'about.values.desc':
      'Quality, innovation, community, continuous learning and excellence in everything we do.',
    'about.tools.title': 'Our Tools',
    'about.tools.validator': 'JSON Validator',
    'about.tools.validator.desc': 'Validate and format JSON',
    'about.tools.generator': 'Data Generator',
    'about.tools.generator.desc': 'Create test data',
    'about.tools.checklist': 'Checklist',
    'about.tools.checklist.desc': 'Verification lists',
    'about.tools.jwt': 'JWT Decoder',
    'about.tools.jwt.desc': 'Analyze JWT tokens',

    // Team / Founders
    'about.founder.title': 'Founding Team',
    'about.founder.role': 'Founder and Creator of AIQUAA',
    'about.founder.bio':
      'QA Engineer passionate about education, software testing, and the tech community in Paraguay. Creator of AIQUAA with the vision to democratize access to QA tools and knowledge in Spanish.',
    'about.cofounder.name': 'Ana Duarte',
    'about.cofounder.role': 'Co-Founder & Data Analyst',
    'about.cofounder.bio':
      'Data Analyst with experience in business intelligence, data visualization, and metrics-driven decision making. Co-founder of AIQUAA, driving the analytical and data dimension of the platform to strengthen the QA community in Paraguay.',

    // Footer
    'footer.rights': 'All rights reserved',
    'footer.about': 'About',
    'footer.contact': 'Contact',
    'footer.privacy': 'Privacy',
    'footer.terms': 'Terms',

    // Suru Mascot
    'suru.welcome': "Hi! I'm Suru, your guide at AIQUAA",
    'suru.onboarding.welcome':
      "Hi! I'm Suru, your companion in the QA world. I'm here to guide you on your path to testing excellence.",
    'suru.onboarding.explore':
      'AIQUAA has free tools, study resources, and an active community. Explore everything we have to offer.',
    'suru.onboarding.learn':
      'Prepare for ISTQB and JMeter certifications, practice with technical exams, and improve your testing skills.',
    'suru.onboarding.ready':
      "You're ready to start! Remember, I'll always be here if you need help navigating the site.",
    'suru.onboarding.next': 'Next',
    'suru.onboarding.previous': 'Previous',
    'suru.onboarding.skip': 'Skip intro',
    'suru.onboarding.start': "Let's go!",
    'suru.tooltip.labs': 'Discover our testing tools',
    'suru.tooltip.istqb': 'Practice for your ISTQB certification',
    'suru.tooltip.community': 'Join the QA community',
    'suru.error.404':
      'Oops, it seems this page got lost in the Paraguay River...',
    'suru.error.500': "I'm working on fixing this, give me a moment",
    'suru.loading': 'Swimming through the data...',
    'suru.success': 'Excellent work! Test passed',

    // Suru - Motivational phrases
    'suru.intro':
      "Hi! I'm Suru, the character that will support you in stepping out of your comfort zone and learning",
    'suru.motivation.basicoite':
      "Basically, testing is finding what others didn't see",
    'suru.motivation.afallapa':
      'In that sense, just go ahead and fail, you learn from mistakes',
    'suru.motivation.competition':
      'The only competition you have to beat is yourself',
    'suru.motivation.discipline':
      'Discipline beats talent alone, through consistency and form',
    'suru.motivation.growth':
      'Every bug found is one more step towards excellence',
    'suru.motivation.community':
      'Together we grow stronger. The QA community is here for you',

    // Auth
    'auth.login.title': 'Sign in to your account',
    'auth.register.title': 'Create your account',
    'auth.login.submit': 'Sign in',
    'auth.login.loading': 'Signing in...',
    'auth.register.submit': 'Create account',
    'auth.register.loading': 'Creating account...',
    'auth.login.linkText': 'create a new account',
    'auth.register.linkText': 'sign in if you already have an account',
    'auth.field.name': 'Full name',
    'auth.field.email': 'Email',
    'auth.field.password': 'Password',
    'auth.field.confirmPassword': 'Confirm password',
    'auth.register.link': "Don't have an account? Register",
    'auth.resend.button': '📧 Resend confirmation email',
    'auth.resend.loading': 'Resending...',
    'auth.error.oauth': 'Your email is already linked to another provider.',
    'auth.error.registrationDisabled':
      'Registration disabled. Contact the administrator.',
    'auth.success.registration':
      'Registration successful. You can now sign in with your credentials.',

    // Forum
    'forum.title': '🗨️ Community Forum',
    'forum.subtitle':
      'Connect with other professionals, share knowledge and resolve doubts in our community forum.',
    'forum.stats.title': '📊 Forum Statistics',
    'forum.stats.threads': 'Threads Created',
    'forum.stats.replies': 'Replies',
    'forum.stats.members': 'Members',
    'forum.stats.activeToday': 'Active Today',
    'forum.stats.avgReplies': 'Average replies per thread:',
    'forum.stats.activity': 'Community activity:',
    'forum.stats.lastUpdate': 'Last update:',
    'forum.filters.title': 'Filters',
    'forum.filters.search': '🔍 Search',
    'forum.filters.searchPlaceholder': 'Search threads...',
    'forum.filters.categories': '📂 Categories',
    'forum.filters.allCategories': 'All categories',
    'forum.filters.tags': '🏷️ Tags',
    'forum.filters.sortBy': '📊 Sort by',
    'forum.filters.newest': 'Newest',
    'forum.filters.oldest': 'Oldest',
    'forum.filters.mostViewed': 'Most viewed',
    'forum.filters.mostReplied': 'Most replied',
    'forum.filters.clear': '🗑️ Clear Filters',
    'forum.filters.active': 'Active filters:',
    'forum.filters.showing': 'Showing 20 of {count} tags',
    'forum.thread.views': 'views',
    'forum.thread.replies': 'replies',
    'forum.thread.by': 'By',
    'forum.thread.edited': 'edited',
    'forum.thread.view': 'View thread →',
    'forum.thread.edit': '✏️ Edit',
    'forum.thread.delete': '🗑️ Delete',
    'forum.thread.deleting': '🗑️ Deleting...',
    'forum.empty.title': 'No threads available',
    'forum.empty.auth': 'Be the first to create a thread!',
    'forum.empty.guest': 'Log in to create the first thread',
    'forum.create': '✏️ Create New Thread',
    'forum.cancel': '❌ Cancel',
    'forum.loading': 'Loading threads...',
    'forum.pagination.prev': '← Previous',
    'forum.pagination.next': 'Next →',
  },
};

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
}) => {
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
