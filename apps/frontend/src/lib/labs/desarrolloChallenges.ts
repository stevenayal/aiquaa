// Catálogo de las pruebas técnicas de DESARROLLO del bootcamp.
//
// A diferencia de git-practico / playwright-practico, acá no hay verificación
// automática contra la GitHub API. El candidato entrega el link de su
// repositorio y el resultado queda en `pending_correction` hasta que el
// profesor le asigna un puntaje global desde /empresa/evaluar-desarrollo.
//
// `criteriosDeEvaluacion` es material de referencia: se le muestra al candidato
// para que sepa qué se mira, y al profesor como guía al puntuar. No produce
// puntaje por sí solo.

export type DesarrolloChallengeId = 'dev-proyecto-final';

export interface DesarrolloChallenge {
  id: DesarrolloChallengeId;
  /** Coincide con el id: es también el `exam_type` en `exam_results`. */
  examType: DesarrolloChallengeId;
  clase: string;
  title: string;
  emoji: string;
  objetivo: string;
  consigna: string[];
  entregables: string[];
  estructuraEsperada: string;
  criteriosDeEvaluacion: string[];
  duracionEstimadaMin: number;
}

export const DESARROLLO_CHALLENGES: Record<
  DesarrolloChallengeId,
  DesarrolloChallenge
> = {
  'dev-proyecto-final': {
    id: 'dev-proyecto-final',
    examType: 'dev-proyecto-final',
    clase: 'Proyecto final — Clases 3, 5, 6, 7-8 y 9',
    title: 'Proyecto final: API con persistencia, Kubernetes y CI/CD',
    emoji: '🏆',
    objetivo:
      'Construir e integrar en un solo repositorio todo lo visto en el bootcamp: una API .NET con persistencia en PostgreSQL, desplegada en Kubernetes con configuración externalizada, logging estructurado centralizado, y un pipeline de CI/CD que la valide y la despliegue.',
    consigna: [
      '(Persistencia) Creá una API .NET con al menos una entidad de dominio propia, usando Entity Framework Core con el proveedor Npgsql apuntando a PostgreSQL. Generá y versioná al menos una migración. Exponé un CRUD completo que reciba y devuelva DTOs, no las entidades internas, y validá la entrada con FluentValidation.',
      '(Kubernetes) Escribí los manifiestos para desplegar la API en un clúster local (Minikube o Kind): un Deployment con al menos 2 réplicas, resources y un readinessProbe; un Service que la exponga; y un StatefulSet con volumeClaimTemplates para la base de datos. Demostrá en el README la autorecuperación (borrar un Pod y ver que el ReplicaSet lo recrea) y el escalado declarativo.',
      '(Configuración) Sacá del código toda la configuración hardcodeada. Creá un ConfigMap para lo no sensible (nivel de log, entorno) y un Secret para lo sensible (credenciales de la base), inyectados con envFrom. Empaquetá todo en un chart de Helm con un values.yaml parametrizable y al menos un archivo de values por entorno (por ejemplo dev y qa).',
      '(Logging) Configurá Serilog desde el arranque del pipeline con al menos dos sinks: consola y HTTP hacia Seq. Emití logs estructurados con propiedades clave-valor (como mínimo un requestId) y usá los cuatro niveles de severidad con criterio. Desplegá Seq como Pod en el mismo clúster, con Service y volumen, y mostrá en el README una búsqueda por propiedad que correlacione eventos de más de una réplica de la API.',
      '(CI/CD) Creá un workflow de GitHub Actions con triggers push, pull_request y workflow_dispatch. El job de validación debe seguir el orden checkout → restore → build (--no-restore) → test (--no-build). Agregá un job de empaquetado que construya y publique la imagen Docker, dependiente del de validación con needs y limitado a la rama principal. Separá Variables (no sensible) de Secrets (credenciales), sin exponer ningún secreto en el código ni en los logs.',
      'Provocá un fallo a propósito en un Pull Request (por ejemplo, un test roto), documentá el check en rojo, arreglalo y documentá el check en verde.',
      'Escribí un README único que explique cómo levantar todo el proyecto de punta a punta: base de datos, clúster, configuración, logging y pipeline.',
    ],
    entregables: [
      'Un único repositorio público de GitHub con la API, los manifiestos de Kubernetes, el chart de Helm y los workflows de GitHub Actions.',
      'Carpeta `Migrations/` con al menos una migración de EF Core aplicada.',
      'Manifiestos o chart con Deployment, Service, StatefulSet, ConfigMap y Secret.',
      'Workflows en `.github/workflows/` con al menos una ejecución exitosa y una fallida visibles en la pestaña Actions.',
      'README único con instrucciones de punta a punta y evidencia (capturas o salidas de comandos) de autorecuperación, escalado y búsqueda en Seq.',
    ],
    estructuraEsperada: `mi-proyecto-final/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── cd.yml
├── README.md
├── src/
│   ├── Program.cs
│   ├── Data/AppDbContext.cs
│   ├── Domain/
│   ├── Dtos/
│   ├── Validators/
│   └── Migrations/
├── docs/
│   └── capturas/
├── k8s/
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── statefulset-postgres.yaml
│   └── seq-deployment.yaml
└── chart/
    ├── Chart.yaml
    ├── values.yaml
    ├── values-dev.yaml
    ├── values-qa.yaml
    └── templates/
        ├── deployment.yaml
        ├── configmap.yaml
        └── secret.yaml`,
    criteriosDeEvaluacion: [
      'Persistencia: el DbContext usa Npgsql, hay migraciones versionadas, los endpoints trabajan con DTOs y FluentValidation valida de verdad la entrada.',
      'Kubernetes: los manifiestos se aplican sin errores, el Deployment declara réplicas/recursos/probe, y hay evidencia real de autorecuperación y escalado.',
      'Configuración: no queda nada hardcodeado, el reparto ConfigMap/Secret respeta el criterio de sensibilidad, y el chart de Helm renderiza con cada archivo de values.',
      'Logging: Serilog reemplaza al logger por defecto, los logs son estructurados (no texto interpolado), y hay evidencia de una búsqueda en Seq que correlaciona varias réplicas.',
      'CI/CD: el workflow declara los tres triggers, respeta el orden restore→build→test, separa Variables de Secrets sin filtrar nada, y hay evidencia de un check fallando y luego pasando.',
      'Integración: el README permite a un tercero levantar el proyecto completo desde cero, sin conocimiento previo del candidato.',
    ],
    duracionEstimadaMin: 600,
  },
};

export const DESARROLLO_CHALLENGE_IDS = Object.keys(
  DESARROLLO_CHALLENGES
) as DesarrolloChallengeId[];

export function getDesarrolloChallenge(
  id: string
): DesarrolloChallenge | undefined {
  return DESARROLLO_CHALLENGES[id as DesarrolloChallengeId];
}

// El profesor abre este link desde el panel de corrección, así que sólo se
// aceptan repositorios de GitHub y no una URL arbitraria.
const GITHUB_REPO_URL = /^https:\/\/github\.com\/[^/\s]+\/[^/\s]+\/?$/;

export function isValidRepoUrl(value: string): boolean {
  return GITHUB_REPO_URL.test(value.trim());
}
