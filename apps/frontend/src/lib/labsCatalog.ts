// Central catalog of Labs tools.
// Single source of truth shared by the Labs index page and the home page stats,
// so the "herramientas gratuitas" counter always reflects the real catalog.

export interface LabTool {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  href: string;
  featured?: boolean;
  implementedDate?: string;
}

export interface LabCategory {
  id: string;
  name: string;
  description: string;
  tools: LabTool[];
}

export const toolCategories: LabCategory[] = [
  {
    id: 'formacion',
    name: '🎓 Formación y Certificación',
    description:
      'Prepárate para certificaciones y evalúa tus conocimientos técnicos',
    tools: [
      {
        id: 'istqb',
        name: 'Simulador ISTQB CTFL v4.0',
        description:
          'Examen de práctica completo con 40 preguntas oficiales del syllabus v4.0',
        icon: '📚',
        color: 'from-amber-500 to-amber-600',
        href: '/labs/istqb',
        featured: true,
        implementedDate: 'Sep 2025',
      },
      {
        id: 'git',
        name: 'Examen Técnico GIT',
        description:
          'Evalúa tus conocimientos de Git con 40 preguntas de fundamentos de control de versiones',
        icon: '🔀',
        color: 'from-orange-500 to-orange-600',
        href: '/labs/git',
        featured: true,
        implementedDate: 'Nov 2025',
      },
      {
        id: 'performance',
        name: 'Examen de Performance Testing',
        description:
          'Prueba técnica de 27 preguntas sobre fundamentos, métricas y herramientas de pruebas de rendimiento',
        icon: '⚡',
        color: 'from-cyan-500 to-blue-600',
        href: '/labs/performance',
        featured: true,
        implementedDate: 'Nov 2025',
      },
      {
        id: 'database-fundamentals',
        name: 'Base de Datos — Fundamentos',
        description:
          'Prueba técnica teórica sobre modelo relacional, SQL básico, joins, agregaciones y constraints',
        icon: '🗄️',
        color: 'from-violet-500 to-fuchsia-600',
        href: '/assessments/database-fundamentals',
        featured: true,
        implementedDate: 'Jun 2026',
      },
      {
        id: 'database-practice',
        name: 'Base de Datos — Práctica SQL',
        description:
          'Challenge práctico con una mini base e-commerce: predecí resultados, detectá bugs y escribí SQL',
        icon: '🧮',
        color: 'from-lime-500 to-emerald-600',
        href: '/assessments/database-practice',
        featured: true,
        implementedDate: 'Jun 2026',
      },
    ],
  },
  {
    id: 'apis',
    name: '🔌 APIs',
    description:
      'Evaluá tus habilidades de API testing: teoría y práctica con corrección automática',
    tools: [
      {
        id: 'api-testing-fundamentals',
        name: 'API Testing — Fundamentos (Examen teórico)',
        description:
          'Conceptos de API, lectura de documentación, diseño de casos y análisis de respuestas en 5 niveles progresivos — auto-corregido, 100 pts',
        icon: '🌐',
        color: 'from-emerald-500 to-teal-600',
        href: '/labs/api-testing-fundamentals',
        featured: true,
        implementedDate: 'Jun 2026',
      },
      {
        id: 'api-banking-challenge',
        name: 'API Banking — Challenge práctico',
        description:
          'Testeá una API bancaria simulada: encontrá 12 bugs intencionales, diseñá casos, reportá bugs y recibí un score automático de 100 pts',
        icon: '🏦',
        color: 'from-blue-500 to-indigo-600',
        href: '/assessments/api-banking',
        featured: true,
        implementedDate: 'Jun 2026',
      },
    ],
  },
  {
    id: 'evaluacion',
    name: '🐛 Testing & Evaluación',
    description: 'Aplicaciones para practicar y evaluar habilidades de testing',
    tools: [
      {
        id: 'test-app',
        name: 'AIQUAA Test App',
        description:
          'App con bugs intencionales para Bug Hunting - Evaluación práctica de 30 min',
        icon: '🐞',
        color: 'from-red-500 to-rose-600',
        href: '/labs/test-app',
        featured: true,
        implementedDate: 'Oct 2025',
      },
      {
        id: 'test-report',
        name: 'Generador de Informe Técnico',
        description:
          'Crea informes profesionales en PDF de pruebas de Bug Hunting con puntuación automática',
        icon: '📋',
        color: 'from-purple-500 to-purple-600',
        href: '/labs/test-app/report',
        featured: true,
        implementedDate: 'Nov 2025',
      },
    ],
  },
  {
    id: 'validadores',
    name: '🧩 Validadores y Verificadores',
    description: 'Herramientas para validar formatos y estructuras de datos',
    tools: [
      {
        id: 'json-validator',
        name: 'Validador de JSON',
        description:
          'Valida sintaxis JSON, formatea y detecta errores en tiempo real',
        icon: '🔍',
        color: 'from-blue-500 to-blue-600',
        href: '/labs/json-validator',
        featured: true,
        implementedDate: 'Ago 2025',
      },
      {
        id: 'jwt-decoder',
        name: 'Decodificador JWT',
        description:
          'Decodifica tokens JWT y verifica estructura de header, payload y firma',
        icon: '🔐',
        color: 'from-red-500 to-red-600',
        href: '/labs/jwt-decoder',
        implementedDate: 'Sep 2025',
      },
      {
        id: 'cron-validator',
        name: 'Validador de Cron',
        description:
          'Valida expresiones cron y calcula próximas 10 ejecuciones programadas',
        icon: '⏰',
        color: 'from-indigo-500 to-indigo-600',
        href: '/labs/cron-validator',
        implementedDate: 'Sep 2025',
      },
      {
        id: 'yaml-validator',
        name: 'Validador de YAML',
        description:
          'Valida sintaxis YAML, formatea código y convierte entre YAML y JSON',
        icon: '📝',
        color: 'from-purple-500 to-purple-600',
        href: '/labs/yaml-validator',
        featured: true,
        implementedDate: 'Nov 2025',
      },
    ],
  },
  {
    id: 'generadores',
    name: '🧪 Generadores de Datos',
    description:
      'Crea datos sintéticos para pruebas funcionales y de cobertura',
    tools: [
      {
        id: 'data-generator',
        name: 'Generador de Datos',
        description:
          'Genera nombres, emails, teléfonos y datos aleatorios para testing',
        icon: '📊',
        color: 'from-green-500 to-green-600',
        href: '/labs/data-generator',
        featured: true,
        implementedDate: 'Ago 2025',
      },
      {
        id: 'allpairs',
        name: 'All Pairs Generator',
        description:
          'Reduce casos de prueba combinatorios con técnica pairwise (2-way coverage)',
        icon: '🔀',
        color: 'from-teal-500 to-teal-600',
        href: '/labs/allpairs',
        featured: true,
        implementedDate: 'Sep 2025',
      },
    ],
  },
  {
    id: 'utilidades',
    name: '🧾 Utilidades QA',
    description: 'Herramientas prácticas para el día a día del tester',
    tools: [
      {
        id: 'checklist',
        name: 'Checklist de Pruebas',
        description:
          'Plantillas de verificación para testing funcional, regresión, humo y más',
        icon: '✅',
        color: 'from-purple-500 to-purple-600',
        href: '/labs/checklist',
        implementedDate: 'Ago 2025',
      },
      {
        id: 'json-to-testplans',
        name: 'JSON to Test Plans',
        description:
          'Convierte análisis de IA (JSON/YAML) en planes CSV importables a TestRail/Zephyr',
        icon: '📋',
        color: 'from-cyan-500 to-cyan-600',
        href: '/labs/json-to-testplans',
        implementedDate: 'Sep 2025',
      },
      {
        id: 'req-lint',
        name: 'Análisis de Requisitos',
        description:
          'Detecta ambigüedades, falta de testabilidad y problemas según heurísticas ISTQB',
        icon: '📝',
        color: 'from-blue-500 to-blue-600',
        href: '/labs/req-lint',
        implementedDate: 'Oct 2025',
      },
      {
        id: 'risk-matrix',
        name: 'Matriz de Riesgos',
        description:
          'Evalúa y prioriza riesgos del proyecto con matriz de probabilidad vs impacto',
        icon: '🎯',
        color: 'from-pink-500 to-pink-600',
        href: '/labs/risk-matrix',
        implementedDate: 'Oct 2025',
      },
    ],
  },
  {
    id: 'conversores',
    name: '🔧 Conversores',
    description: 'Herramientas de codificación y transformación',
    tools: [
      {
        id: 'base64-converter',
        name: 'Convertidor Base64',
        description:
          'Codifica texto a Base64 y decodifica de Base64 a texto plano',
        icon: '🔄',
        color: 'from-orange-500 to-orange-600',
        href: '/labs/base64-converter',
        implementedDate: 'Sep 2025',
      },
    ],
  },
];

/** Total number of tools across all categories — real count for the home hero stat. */
export const LABS_TOOL_COUNT = toolCategories.reduce(
  (total, category) => total + category.tools.length,
  0
);
