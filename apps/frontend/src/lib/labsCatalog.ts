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
        id: 'git-practico',
        name: 'Prueba Práctica de GitHub',
        description:
          'Flujo real en un repo: creá issue, rama, subí una carpeta y abrí un PR que cierre el issue — verificación automática vía GitHub API',
        icon: '🐙',
        color: 'from-slate-600 to-slate-800',
        href: '/labs/git-practico',
        implementedDate: 'Jun 2026',
      },
      {
        id: 'playwright-practico',
        name: 'Prueba Práctica de Playwright',
        description:
          'Automatizá 4 escenarios E2E contra la Test App (login, catálogo, carrito, checkout) y entregalos por PR — verificación automática vía GitHub API',
        icon: '🎭',
        color: 'from-emerald-600 to-teal-700',
        href: '/labs/playwright-practico',
        implementedDate: 'Jul 2026',
      },
      {
        id: 'playwright-fundamentals',
        name: 'Playwright — Fundamentos',
        description:
          'Prueba técnica teórica sobre Test CLI, locators web-first, assertions con auto-retry y fixtures/hooks/debugging, con snippets reales de código — auto-corregido, 100 pts',
        icon: '🎬',
        color: 'from-fuchsia-500 to-purple-700',
        href: '/assessments/playwright-fundamentals',
        featured: true,
        implementedDate: 'Jul 2026',
      },
      {
        id: 'gherkin-fundamentals',
        name: 'Gherkin y BDD — Fundamentos',
        description:
          'Prueba técnica teórica sobre BDD (3 amigos, discovery, documentación viva), sintaxis Gherkin Dado/Cuando/Entonces y escenarios avanzados con Scenario Outline y tags — auto-corregido, 100 pts',
        icon: '🥒',
        color: 'from-lime-500 to-green-600',
        href: '/assessments/gherkin-fundamentals',
        featured: true,
        implementedDate: 'Jul 2026',
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
      {
        id: 'infrastructure-fundamentals',
        name: 'Infraestructura — Fundamentos',
        description:
          'Prueba técnica teórica sobre contenedores Docker, conceptos de Kubernetes y arquitectura de clúster: control plane, nodos y pods',
        icon: '🐳',
        color: 'from-blue-500 to-indigo-600',
        href: '/assessments/infrastructure-fundamentals',
        featured: true,
        implementedDate: 'Jul 2026',
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
        name: 'API Testing - Challenge practico',
        description:
          'Prueba tecnica flexible con APIs publicas: elegi Chuck Norris, NASA o Rick and Morty, disena casos y reporta hallazgos con score automatico de 100 pts',
        icon: '🌐',
        color: 'from-blue-500 to-indigo-600',
        href: '/assessments/api-banking',
        featured: true,
        implementedDate: 'Jun 2026',
      },
    ],
  },
  {
    id: 'desarrollo',
    name: '💻 Desarrollo',
    description:
      'Pruebas técnicas para desarrolladores: evaluá fundamentos y criterio de diseño',
    tools: [
      {
        id: 'api-developer-fundamentals',
        name: 'APIs para Desarrolladores — Fundamentos',
        description:
          'Prueba técnica de fundamentos REST: principios de arquitectura, recursos y URIs, OpenAPI, request/response, params y verbos HTTP — auto-corregido, 100 pts',
        icon: '🔌',
        color: 'from-indigo-500 to-violet-600',
        href: '/assessments/api-developer-fundamentals',
        featured: true,
        implementedDate: 'Jul 2026',
      },
      {
        id: 'api-dotnet-fundamentals',
        name: 'API .NET — Fundamentos',
        description:
          'Prueba técnica para bootcamp de desarrollo backend: diseño REST y versionado, contrato OpenAPI/Swagger, Clean Architecture y manejo de errores en .NET — auto-corregido, 100 pts',
        icon: '🟣',
        color: 'from-violet-500 to-purple-600',
        href: '/assessments/api-dotnet-fundamentals',
        featured: true,
        implementedDate: 'Ago 2026',
      },
      {
        id: 'docker-fundamentals',
        name: 'Docker — Fundamentos',
        description:
          'Prueba técnica para bootcamp de desarrollo: Dockerfiles multistage e imágenes livianas, variables de entorno sin hardcode y ejecución/reproducibilidad local — auto-corregido, 100 pts',
        icon: '🐋',
        color: 'from-blue-500 to-cyan-600',
        href: '/assessments/docker-fundamentals',
        featured: true,
        implementedDate: 'Ago 2026',
      },
      {
        id: 'kubernetes-helm-fundamentals',
        name: 'Kubernetes + Helm — Fundamentos',
        description:
          'Prueba técnica para bootcamp de desarrollo: manifiestos Deployment/Service, ConfigMaps y Secrets, charts de Helm y despliegue funcional en Minikube — auto-corregido, 100 pts',
        icon: '☸️',
        color: 'from-sky-500 to-blue-700',
        href: '/assessments/kubernetes-helm-fundamentals',
        featured: true,
        implementedDate: 'Ago 2026',
      },
      {
        id: 'kubernetes-orchestration-fundamentals',
        name: 'Kubernetes — Fundamentos de Orquestación',
        description:
          'Prueba técnica para el grupo de desarrollo: propósito y pilares de la orquestación, arquitectura Scheduler/Kubelet, Pods, paradigma declarativo, Deployment/ReplicaSet, StatefulSet y ecosistema — auto-corregido, 100 pts',
        icon: '⚙️',
        color: 'from-cyan-500 to-sky-700',
        href: '/assessments/kubernetes-orchestration-fundamentals',
        featured: true,
        implementedDate: 'Ago 2026',
      },
      {
        id: 'observability-fundamentals',
        name: 'Observabilidad — Fundamentos',
        description:
          'Prueba técnica para bootcamp de desarrollo: logging estructurado con Serilog, centralización en Seq, niveles de log y visualización — auto-corregido, 100 pts',
        icon: '📈',
        color: 'from-teal-500 to-emerald-600',
        href: '/assessments/observability-fundamentals',
        featured: true,
        implementedDate: 'Ago 2026',
      },
      {
        id: 'cicd-fundamentals',
        name: 'CI/CD — Fundamentos',
        description:
          'Prueba técnica para bootcamp de desarrollo: pipelines de integración continua, despliegue continuo automatizado y buenas prácticas de versionado — auto-corregido, 100 pts',
        icon: '🔁',
        color: 'from-orange-500 to-red-600',
        href: '/assessments/cicd-fundamentals',
        featured: true,
        implementedDate: 'Ago 2026',
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
