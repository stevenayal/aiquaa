import type { AssessmentSeedDefinition } from '../../_shared/types';

export const CLASE9_CICD_GITHUB_ACTIONS_SLUG = 'clase9-cicd-github-actions';

// Bumpear cuando cambie la definición (secciones/preguntas) para forzar re-seed.
export const CLASE9_CICD_GITHUB_ACTIONS_SEED_VERSION = 1;

// Preguntas, opciones, claves y justificaciones transcritas literalmente del
// banco de preguntas del bootcamp (Clase 9 CI CD con GitHub Actions.xlsx).
// La trazabilidad al PDF de origen vive en metadata.paginasPdf de cada pregunta.
export const clase9CicdGithubActionsDefinition: AssessmentSeedDefinition = {
  slug: CLASE9_CICD_GITHUB_ACTIONS_SLUG,
  title: 'Clase 9 — CI/CD con GitHub Actions',
  description:
    'Evaluación teórica de la Clase 9 del bootcamp: propósito de CI/CD, impacto de la automatización, integración continua, Continuous Delivery frente a Continuous Deployment, arquitectura y conceptos del pipeline, ecosistemas CI/CD, workflows de GitHub Actions, Variables y Secrets.',
  level: 'Trainee a Junior',
  type: 'Desarrollo DevOps',
  duration_minutes: 20,
  total_score: 100,
  is_active: true,
  metadata: {
    moduleName: 'AIQUAA Assessments / Clase 9 CI/CD con GitHub Actions',
    passingScore: 70,
    candidateBands: [
      { min: 0, max: 39, label: 'Inicial' },
      { min: 40, max: 59, label: 'En formación' },
      { min: 60, max: 74, label: 'Trainee' },
      { min: 75, max: 89, label: 'Junior' },
      { min: 90, max: 100, label: 'Junior avanzado' },
    ],
  },
  sections: [
    {
      slug: 'proposito-y-integracion-continua',
      title: 'Propósito, automatización e integración continua',
      description:
        'Qué resuelve CI/CD, los beneficios de automatizar, la práctica que arranca el ciclo de feedback y la diferencia Delivery/Deployment.',
      order_index: 1,
      max_score: 40,
      metadata: {
        instructions:
          'Selección múltiple sobre los fundamentos de la integración y la entrega continua.',
        suggestedMinutes: 8,
      },
      questions: [
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Qué objetivo atribuye el material a CI/CD para los cambios realizados en una API?',
          options: [
            {
              label:
                'Reservar la validación de calidad para el momento posterior al despliegue.',
              value: 'a',
            },
            {
              label:
                'Asegurar calidad automática y llegada repetible y confiable a un entorno.',
              value: 'b',
            },
            {
              label:
                'Reemplazar todos los cambios pequeños por entregas manuales de gran tamaño.',
              value: 'c',
            },
            {
              label:
                'Eliminar los despliegues frecuentes para reducir el uso de automatización.',
              value: 'd',
            },
          ],
          correct_answer: { value: 'b' },
          explanation:
            'La diapositiva define CI/CD como la forma de asegurar que cada cambio en una API pase por calidad automática y llegue a un entorno de manera repetible y confiable.',
          points: 10,
          order_index: 1,
          metadata: {
            tema: 'Propósito de CI/CD',
            dificultad: 'Media',
            conceptoEvaluado:
              'Cambio de procesos manuales a un flujo repetible',
            paginasPdf: '2',
          },
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Cuál combinación corresponde a beneficios futuros de la automatización señalados en el PDF?',
          options: [
            {
              label:
                'Builds manuales inconsistentes, cambios grandes y tests tardíos.',
              value: 'a',
            },
            {
              label:
                "Mayor cantidad de errores humanos y dependencia del 'funciona en mi máquina'.",
              value: 'b',
            },
            {
              label:
                'Trazabilidad completa, feedback rápido en PRs y menor time-to-market.',
              value: 'c',
            },
            {
              label:
                'Despliegues manuales, costos operativos mayores y menor capacidad de respuesta.',
              value: 'd',
            },
          ],
          correct_answer: { value: 'c' },
          explanation:
            'Entre los beneficios clave se enumeran trazabilidad completa, confianza en cambios pequeños, feedback rápido en PRs, time-to-market más rápido, reducción de costos y mayor calidad.',
          points: 10,
          order_index: 2,
          metadata: {
            tema: 'Impacto de la automatización',
            dificultad: 'Media',
            conceptoEvaluado:
              'Beneficios técnicos y de negocio de la automatización',
            paginasPdf: '3',
          },
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Qué práctica inicia el ciclo de feedback rápido de Continuous Integration mostrado?',
          options: [
            { label: 'Integrar cambios al repositorio', value: 'a' },
            {
              label: 'Esperar a reunir cambios grandes antes de incorporarlos.',
              value: 'b',
            },
            {
              label:
                'Ejecutar validaciones únicamente después de llegar a producción.',
              value: 'c',
            },
            {
              label:
                'Sustituir el feedback inmediato por revisiones manuales al final del proyecto.',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'El ciclo comienza con integración frecuente: incorporar cambios al repositorio varias veces al día. Luego se ejecutan validaciones automáticas, feedback inmediato y detección temprana.',
          points: 10,
          order_index: 3,
          metadata: {
            tema: 'Continuous Integration',
            dificultad: 'Media',
            conceptoEvaluado: 'Integración frecuente y feedback rápido',
            paginasPdf: '4',
          },
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Qué comparación distingue correctamente Continuous Delivery de Continuous Deployment sin confundir los pasos que ambos comparten?',
          options: [
            {
              label:
                'Delivery despliega automáticamente sin intervención; Deployment exige aprobación manual para producción.',
              value: 'a',
            },
            {
              label:
                'Delivery construye imágenes Docker, mientras que Deployment es el único que usa registry, Kubernetes y health checks.',
              value: 'b',
            },
            {
              label:
                'Delivery y Deployment requieren siempre aprobación manual; solo cambia la frecuencia de los commits.',
              value: 'c',
            },
            {
              label:
                'Delivery mantiene el código desplegable y exige aprobación para producción; Deployment despliega automáticamente cada cambio validado. Ambos incluyen imagen, registry, Kubernetes y health checks.',
              value: 'd',
            },
          ],
          correct_answer: { value: 'd' },
          explanation:
            'El material define Delivery como control con aprobación manual explícita para producción y Deployment como despliegue automático sin intervención humana. También aclara que ambos caminos construyen imágenes, publican al registry, despliegan en Kubernetes y ejecutan health checks.',
          points: 10,
          order_index: 4,
          metadata: {
            tema: 'Delivery vs. Deployment',
            dificultad: 'Extra',
            conceptoEvaluado:
              'Diferencia operativa entre Continuous Delivery y Deployment',
            paginasPdf: '5',
            motivoDificultadExtra:
              'Es Extra porque los distractores intercambian la aprobación manual y la automatización, o presentan como exclusivos pasos que el PDF declara comunes a ambos enfoques. Exige separar la diferencia central del flujo compartido.',
          },
        },
      ],
    },
    {
      slug: 'pipeline-y-ecosistemas',
      title: 'Arquitectura del pipeline y ecosistemas',
      description:
        'La secuencia completa de etapas, los conceptos de Pipeline/Jobs/Steps/Triggers/Runners y la comparación entre plataformas CI/CD.',
      order_index: 2,
      max_score: 30,
      metadata: {
        instructions:
          'Selección múltiple y selección de varias respuestas sobre la anatomía de un pipeline.',
        suggestedMinutes: 6,
      },
      questions: [
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Cuál es la secuencia completa del pipeline desde el cambio de código hasta la comprobación final?',
          options: [
            {
              label:
                'Entrada → empaquetado → validación → despliegue → publicación → verificación.',
              value: 'a',
            },
            {
              label:
                'Entrada → validación → empaquetado → publicación → despliegue → verificación.',
              value: 'b',
            },
            {
              label:
                'Validación → entrada → publicación → empaquetado → verificación → despliegue.',
              value: 'c',
            },
            {
              label:
                'Entrada → despliegue → validación → publicación → empaquetado → verificación.',
              value: 'd',
            },
          ],
          correct_answer: { value: 'b' },
          explanation:
            'La arquitectura presentada sigue seis etapas: entrada por commit o PR, validación con compilación y tests, empaquetado de imagen Docker, publicación al registry, despliegue a Kubernetes y verificación mediante health checks.',
          points: 10,
          order_index: 1,
          metadata: {
            tema: 'Arquitectura del pipeline',
            dificultad: 'Media',
            conceptoEvaluado: 'Secuencia automatizada de código a producción',
            paginasPdf: '6',
          },
        },
        {
          question_type: 'multiple_select',
          prompt:
            '¿Cuáles son los conceptos claves una arquitectura de un pipeline indicados en el material?',
          options: [
            { label: 'Pipeline: el flujo total.', value: 'a' },
            { label: 'Jobs: los servidores de ejecución.', value: 'b' },
            { label: 'Steps: las tareas.', value: 'c' },
            { label: 'Triggers: los disparadores.', value: 'd' },
          ],
          correct_answer: { values: ['a', 'c', 'd'] },
          explanation:
            'El PDF asocia Pipeline con el flujo total, Jobs con agrupaciones, Steps con tareas, Triggers con disparadores y Runners con servidores de ejecución. Por eso la opción B atribuye a Jobs la definición de Runners.',
          points: 10,
          order_index: 2,
          metadata: {
            tema: 'Conceptos del pipeline',
            dificultad: 'Media',
            conceptoEvaluado: 'Pipeline, Jobs, Steps, Triggers y Runners',
            paginasPdf: '6',
          },
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Qué descripción de las plataformas CI/CD coincide con la comparación presentada?',
          options: [
            {
              label:
                'GitHub Actions requiere siempre operación propia y solo admite runners on-premise.',
              value: 'a',
            },
            {
              label:
                'Jenkins está integrado al repositorio con YAML simple y no necesita administración propia.',
              value: 'b',
            },
            {
              label:
                'GitHub Actions se integra al repositorio y admite runners hosted o self-hosted; Jenkins ofrece control total on-premise; Azure DevOps se integra fuertemente con Microsoft.',
              value: 'c',
            },
            {
              label:
                'Azure DevOps está orientado exclusivamente a entornos legacy sin herramientas DevOps integradas.',
              value: 'd',
            },
          ],
          correct_answer: { value: 'c' },
          explanation:
            'La comparación describe GitHub Actions como integrado al repo con YAML simple y runners hosted o self-hosted; Jenkins como flexible, on-premise y de operación propia; Azure DevOps como un conjunto completo con fuerte integración Microsoft.',
          points: 10,
          order_index: 3,
          metadata: {
            tema: 'Ecosistemas CI/CD',
            dificultad: 'Media',
            conceptoEvaluado:
              'Características de GitHub Actions, Jenkins y Azure DevOps',
            paginasPdf: '7',
          },
        },
      ],
    },
    {
      slug: 'workflows-secrets-y-flujo',
      title: 'GitHub Actions, Secrets y flujo del desarrollador',
      description:
        'Triggers y orden de steps en un workflow, la separación entre Variables y Secrets, y el valor de CI/CD como infraestructura de ingeniería.',
      order_index: 3,
      max_score: 30,
      metadata: {
        instructions:
          'Selección múltiple sobre workflows, seguridad del pipeline y cierre conceptual.',
        suggestedMinutes: 6,
      },
      questions: [
        {
          question_type: 'multiple_choice',
          prompt:
            'Si se necesita validar antes del merge, permitir ejecución manual o validar por commit. ¿Cuáles son los triggers comunes?',
          options: [
            {
              label: 'Usar pull_request o workflow_dispatch o push.',
              value: 'a',
            },
            {
              label:
                'Usar solo push; ejecutar test, restore y build, todos sin dependencias previas.',
              value: 'b',
            },
            {
              label:
                'Usar pull_request; ejecutar build --no-restore antes de restore y finalizar con checkout.',
              value: 'c',
            },
            {
              label:
                'Usar solo workflow_dispatch; ejecutar restore, test --no-build y luego build.',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'La diapositiva identifica pull_request para validar antes del merge y workflow_dispatch para ejecución manual. El ejemplo ordena checkout, setup .NET, restore, build --no-restore y test --no-build.',
          points: 10,
          order_index: 1,
          metadata: {
            tema: 'Workflow de GitHub Actions',
            dificultad: 'Extra',
            conceptoEvaluado: 'Triggers y orden de steps en GitHub Actions',
            paginasPdf: '8',
            motivoDificultadExtra:
              'Es Extra porque los distractores usan triggers y comandos reales del ejemplo, pero alteran su propósito o su dependencia lógica. La respuesta requiere relacionar el evento correcto con el orden Restore → Build → Test y sus opciones --no-restore y --no-build.',
          },
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Cuál clasificación entre Variables y Secrets respeta el criterio de seguridad presentado?',
          options: [
            {
              label:
                'Los tokens y passwords son Variables porque describen la estructura del despliegue.',
              value: 'a',
            },
            {
              label:
                'Los nombres de entorno y namespaces pueden ser Variables; las credenciales y connection strings deben ser Secrets y no exponerse en código ni logs.',
              value: 'b',
            },
            {
              label:
                'Los nombres de imágenes Docker deben ser Secrets, mientras que las llaves de acceso pueden quedar en logs.',
              value: 'c',
            },
            {
              label:
                'Variables y Secrets son equivalentes porque ambos tipos se muestran siempre en texto plano.',
              value: 'd',
            },
          ],
          correct_answer: { value: 'b' },
          explanation:
            'El material reserva Variables para valores no sensibles, como entornos, flags, imágenes y namespaces. Los Secrets almacenan credenciales, tokens, passwords y connection strings; están cifrados y no deben exponerse en código ni logs.',
          points: 10,
          order_index: 2,
          metadata: {
            tema: 'Seguridad del pipeline',
            dificultad: 'Media',
            conceptoEvaluado:
              'Separación de configuración sensible y no sensible',
            paginasPdf: '9',
          },
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Qué idea resume el cierre del material sobre el valor de CI/CD?',
          options: [
            {
              label:
                'Es principalmente un conjunto de comandos para reemplazar la colaboración del equipo.',
              value: 'a',
            },
            {
              label:
                'Su objetivo es conservar procesos manuales para que cada entrega dependa del conocimiento individual.',
              value: 'b',
            },
            {
              label:
                'Solo aporta velocidad, aunque los cambios dejen de ser medibles y seguros.',
              value: 'c',
            },
            {
              label:
                'Es infraestructura para escalar, eliminar incidentes evitables y lograr entregas seguras, medibles y sin fricción.',
              value: 'd',
            },
          ],
          correct_answer: { value: 'd' },
          explanation:
            'La última diapositiva presenta CI/CD como infraestructura que permite escalar el talento de ingeniería y transformar procesos manuales frágiles en planos automatizados, con cambios seguros y entregas medibles.',
          points: 10,
          order_index: 3,
          metadata: {
            tema: 'Flujo del desarrollador',
            dificultad: 'Media',
            conceptoEvaluado: 'CI/CD como infraestructura de ingeniería',
            paginasPdf: '10',
          },
        },
      ],
    },
  ],
};
