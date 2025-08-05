export const SEO_CONFIG = {
  site: {
    name: 'AIQUAA',
    url: 'https://aiquaa.com',
    description: 'Comunidad de QA en Paraguay. Accedé a herramientas de validación, datos, pruebas y recursos gratuitos para testers funcionales y automatizadores.',
    keywords: 'testing, QA, Paraguay, automatización, herramientas QA, validación JSON, base64, comunidad testers, AIQUAA',
    author: 'AIQUAA - Steven Ayala',
    language: 'es',
    locale: 'es_PY',
  },
  
  social: {
    twitter: {
      handle: '@stevenayaal',
      site: '@stevenayaal',
    },
    facebook: {
      appId: '', // Agregar si tienes Facebook App ID
    },
    linkedin: {
      profile: 'https://linkedin.com/in/stevenayal',
    },
    github: {
      profile: 'https://github.com/stevenayal',
    },
  },
  
  analytics: {
    googleAnalytics: {
      measurementId: 'G-XXXXXXXXXX', // Reemplazar con tu ID real
    },
    googleSearchConsole: {
      verificationCode: '', // Agregar tu código de verificación
    },
  },
  
  pages: {
    home: {
      title: 'AIQUAA | Herramientas Gratuitas para Testers de Paraguay',
      description: 'Comunidad de QA en Paraguay. Accedé a herramientas de validación, datos, pruebas y recursos gratuitos para testers funcionales y automatizadores.',
      keywords: 'testing, QA, Paraguay, automatización, herramientas QA, validación JSON, base64, comunidad testers, AIQUAA',
    },
    labs: {
      title: 'Herramientas QA - AIQUAA',
      description: 'Herramientas gratuitas para testers: validador JSON, generador de datos, checklist, decodificador Base64, JWT y más.',
      keywords: 'herramientas QA, validador JSON, generador datos, checklist testing, decodificador base64, JWT decoder',
    },
    about: {
      title: 'Acerca de AIQUAA - Comunidad de Testing en Paraguay',
      description: 'Conocé más sobre AIQUAA, nuestra misión de construir la comunidad de QA más fuerte de Paraguay y nuestro compromiso con la calidad.',
      keywords: 'AIQUAA, comunidad testing Paraguay, Steven Ayala, calidad software, automatización testing',
    },
    contact: {
      title: 'Contacto - AIQUAA',
      description: 'Contactá con AIQUAA. Tenemos consultas, sugerencias o querés unirte a nuestra comunidad de QA en Paraguay.',
      keywords: 'contacto AIQUAA, consultas testing, comunidad QA Paraguay, soporte herramientas',
    },
  },
  
  schema: {
    organization: {
      name: 'AIQUAA',
      url: 'https://aiquaa.com',
      logo: 'https://aiquaa.com/images/aiquaa-logo.png',
      description: 'Herramientas gratuitas para testers y comunidad QA en Paraguay.',
      founder: {
        name: 'Steven Ayala',
        type: 'Person',
      },
      sameAs: [
        'https://linkedin.com/in/stevenayal',
        'https://x.com/stevenayaal',
        'https://github.com/stevenayal',
      ],
    },
  },
};

export const getPageSEO = (page: keyof typeof SEO_CONFIG.pages) => {
  return SEO_CONFIG.pages[page];
};

export const getSchemaOrg = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SEO_CONFIG.schema.organization.name,
    url: SEO_CONFIG.schema.organization.url,
    logo: SEO_CONFIG.schema.organization.logo,
    sameAs: SEO_CONFIG.schema.organization.sameAs,
    description: SEO_CONFIG.schema.organization.description,
    founder: {
      '@type': SEO_CONFIG.schema.organization.founder.type,
      name: SEO_CONFIG.schema.organization.founder.name,
    },
  };
}; 