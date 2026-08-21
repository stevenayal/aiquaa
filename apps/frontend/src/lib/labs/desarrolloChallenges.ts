// Catálogo de las pruebas técnicas de DESARROLLO del bootcamp: una por clase.
//
// A diferencia de git-practico / playwright-practico, acá no hay verificación
// automática contra la GitHub API. El candidato entrega el link de su
// repositorio y el resultado queda en `pending_correction` hasta que el
// profesor le asigna un puntaje global desde /empresa/evaluar-desarrollo.
//
// `criteriosDeEvaluacion` es material de referencia: se le muestra al candidato
// para que sepa qué se mira, y al profesor como guía al puntuar. No produce
// puntaje por sí solo.

export type DesarrolloChallengeId =
  | 'dev-persistencia'
  | 'dev-kubernetes'
  | 'dev-config-kubernetes'
  | 'dev-seq-logging'
  | 'dev-cicd-actions';

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
  'dev-persistencia': {
    id: 'dev-persistencia',
    examType: 'dev-persistencia',
    clase: 'Clase 3',
    title: 'Persistencia con EF Core y PostgreSQL',
    emoji: '🗃️',
    objetivo:
      'Construir una API .NET que persista datos en PostgreSQL usando Entity Framework Core, exponiendo DTOs en lugar de entidades de dominio y validando la entrada con FluentValidation.',
    consigna: [
      'Creá una API .NET (minimal API o controllers) con al menos una entidad de dominio propia — por ejemplo `Producto`, `Cliente` o similar — con 4 o más campos.',
      'Configurá Entity Framework Core con el proveedor Npgsql apuntando a PostgreSQL. La cadena de conexión debe leerse de configuración o de una variable de entorno, nunca hardcodeada en el código.',
      'Generá y versioná al menos una migración de EF Core. El repositorio tiene que incluir la carpeta `Migrations/`.',
      'Exponé un CRUD completo (GET lista, GET por id, POST, PUT y DELETE) que reciba y devuelva DTOs, no las entidades internas.',
      'Validá el payload de creación y actualización con FluentValidation: al menos una regla `NotEmpty()` y una regla de formato o de rango.',
      'Levantá PostgreSQL con Docker (`docker-compose.yml` o el comando `docker run` documentado), pasando la contraseña por variable de entorno.',
      'Documentá en el README cómo levantar la base, aplicar las migraciones y correr la API.',
    ],
    entregables: [
      'Repositorio público de GitHub con el código de la API.',
      'Carpeta `Migrations/` con al menos una migración aplicada.',
      '`docker-compose.yml` (o instrucciones equivalentes) para levantar PostgreSQL.',
      'README con los pasos de ejecución de punta a punta.',
    ],
    estructuraEsperada: `mi-api/
├── docker-compose.yml
├── README.md
└── src/
    ├── Program.cs
    ├── Data/AppDbContext.cs
    ├── Domain/Producto.cs
    ├── Dtos/ProductoDto.cs
    ├── Validators/ProductoValidator.cs
    └── Migrations/`,
    criteriosDeEvaluacion: [
      'El `DbContext` está configurado con Npgsql y la cadena de conexión sale de configuración o del entorno.',
      'Existen migraciones versionadas en el repositorio y el README explica cómo aplicarlas.',
      'Los endpoints reciben y devuelven DTOs; la entidad de dominio no se expone al exterior.',
      'FluentValidation está registrado en el pipeline y las reglas se ejecutan de verdad ante un payload inválido.',
      'No hay credenciales hardcodeadas en el código ni commiteadas al repositorio.',
      'El README permite a un tercero levantar el proyecto sin conocimiento previo.',
    ],
    duracionEstimadaMin: 180,
  },

  'dev-kubernetes': {
    id: 'dev-kubernetes',
    examType: 'dev-kubernetes',
    clase: 'Clase 5',
    title: 'Despliegue de una API en Kubernetes',
    emoji: '☸️',
    objetivo:
      'Desplegar una aplicación contenerizada en un clúster local de Kubernetes usando manifiestos declarativos, con un Deployment que se autorecupere y un Service que la exponga.',
    consigna: [
      'Partí de una API propia (puede ser la de la Clase 3) con su `Dockerfile`, o de una imagen pública si preferís enfocarte en los manifiestos.',
      'Escribí un manifiesto de `Deployment` con al menos 2 réplicas, `resources` declarados y un `readinessProbe`.',
      'Escribí un manifiesto de `Service` que exponga la aplicación dentro del clúster, más un `NodePort` (o `minikube service`) para poder acceder desde afuera.',
      'Agregá un `StatefulSet` para la base de datos con su `volumeClaimTemplates`, justificando en el README por qué acá corresponde StatefulSet y no Deployment.',
      'Demostrá la autorecuperación: borrá un Pod con `kubectl delete pod`, mostrá que el ReplicaSet lo recrea y dejá la evidencia (captura o salida de `kubectl get pods`) en el README.',
      'Demostrá el escalado: cambiá el número de réplicas de forma declarativa (editando el manifiesto y re-aplicando, no con `kubectl scale`) y documentá el resultado.',
      'Documentá en el README los comandos exactos para levantar todo desde cero en Minikube o Kind.',
    ],
    entregables: [
      'Repositorio público de GitHub con la carpeta `k8s/` de manifiestos.',
      'Manifiestos de Deployment, Service y StatefulSet.',
      'README con los comandos de despliegue y la evidencia de autorecuperación y escalado.',
    ],
    estructuraEsperada: `mi-app/
├── Dockerfile
├── README.md
└── k8s/
    ├── deployment.yaml
    ├── service.yaml
    ├── statefulset-postgres.yaml
    └── service-postgres.yaml`,
    criteriosDeEvaluacion: [
      'Los manifiestos son declarativos y se aplican sin errores con `kubectl apply -f k8s/`.',
      'El Deployment declara réplicas, recursos y al menos una probe.',
      'El Service enruta correctamente al Deployment mediante selectores coherentes con las labels.',
      'El StatefulSet usa `volumeClaimTemplates` y el README justifica la elección frente a Deployment.',
      'Hay evidencia real de la autorecuperación y del escalado declarativo.',
      'El README permite reproducir el despliegue completo en un clúster local limpio.',
    ],
    duracionEstimadaMin: 180,
  },

  'dev-config-kubernetes': {
    id: 'dev-config-kubernetes',
    examType: 'dev-config-kubernetes',
    clase: 'Clase 6',
    title: 'Configuración desacoplada con ConfigMaps, Secrets y Helm',
    emoji: '🔐',
    objetivo:
      'Externalizar toda la configuración de una aplicación siguiendo el principio de inmutabilidad: la misma imagen debe correr en dev y en prod cambiando únicamente la configuración.',
    consigna: [
      'Tomá una aplicación contenerizada y sacá del código toda la configuración que hoy esté hardcodeada.',
      'Creá un `ConfigMap` con la configuración no sensible: nivel de log, endpoints externos, nombre del entorno.',
      'Creá un `Secret` con los datos sensibles: contraseña de la base, connection string o tokens.',
      'Inyectá ambos en el Pod con `envFrom` y demostrá que la aplicación los consume como variables de entorno estándar, sin conocer Kubernetes.',
      'Demostrá el principio de inmutabilidad: desplegá la MISMA imagen en dos namespaces (por ejemplo `dev` y `qa`) con configuraciones distintas, y documentá la diferencia de comportamiento.',
      'Empaquetá todo en un chart de Helm con `values.yaml` parametrizable, más un `values-dev.yaml` y un `values-qa.yaml`.',
      'Explicá en el README por qué un Secret en Base64 no está cifrado y qué medidas adicionales tomarías en un entorno real.',
    ],
    entregables: [
      'Repositorio público de GitHub con el chart de Helm.',
      'Manifiestos o templates de ConfigMap y Secret.',
      '`values.yaml` más un archivo de values por entorno.',
      'README con la demostración de una imagen en dos entornos y la nota sobre Base64.',
    ],
    estructuraEsperada: `mi-app/
├── README.md
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
      'No queda configuración hardcodeada en el código ni en la imagen.',
      'El reparto entre ConfigMap y Secret respeta el criterio de sensibilidad del material.',
      'La inyección usa `envFrom` y la aplicación lee variables de entorno de forma estándar.',
      'Se demuestra la misma imagen corriendo con dos configuraciones distintas.',
      'El chart de Helm renderiza correctamente con cada archivo de values (`helm template` sin errores).',
      'El README explica la diferencia entre codificación Base64 y cifrado real.',
    ],
    duracionEstimadaMin: 180,
  },

  'dev-seq-logging': {
    id: 'dev-seq-logging',
    examType: 'dev-seq-logging',
    clase: 'Clases 7 y 8',
    title: 'Logging estructurado con Serilog y Seq',
    emoji: '📊',
    objetivo:
      'Reemplazar los logs de texto plano por logs estructurados centralizados, de modo que se pueda buscar por propiedades y correlacionar eventos entre varias instancias.',
    consigna: [
      'Configurá Serilog en una API .NET desde el arranque del pipeline, reemplazando el logger por defecto.',
      'Configurá al menos dos sinks: consola (para `kubectl logs`) y HTTP hacia Seq (para centralización y análisis).',
      'Emití logs estructurados con propiedades clave-valor — como mínimo `requestId` y algún identificador de negocio (`userId`, `pedidoId`) — nunca concatenando valores dentro del mensaje.',
      'Usá los cuatro niveles de severidad de forma correcta: Information para el flujo normal, Warning para situaciones anómalas, Error para fallos y Fatal para caídas. Incluí al menos un caso de cada uno.',
      'Enriquecé los logs con contexto de ejecución (nombre de la máquina, entorno, versión).',
      'Desplegá Seq como Pod en Minikube, con un Service para la recepción HTTP interna y un volumen para persistir entre reinicios.',
      'Escalá la API a 2 o más réplicas y demostrá en el README, con capturas del dashboard de Seq, una búsqueda filtrando por una propiedad que devuelva eventos de ambas instancias.',
    ],
    entregables: [
      'Repositorio público de GitHub con la configuración de Serilog.',
      'Manifiestos de despliegue de Seq (Deployment/Pod, Service y volumen).',
      'README con capturas del dashboard de Seq mostrando una búsqueda por propiedad.',
    ],
    estructuraEsperada: `mi-api/
├── README.md
├── src/
│   ├── Program.cs
│   └── appsettings.json
├── docs/
│   └── capturas-seq/
└── k8s/
    ├── api-deployment.yaml
    ├── seq-deployment.yaml
    └── seq-service.yaml`,
    criteriosDeEvaluacion: [
      'Serilog está integrado al arranque de la aplicación y reemplaza al logger por defecto.',
      'Los logs salen como propiedades estructuradas, no como texto interpolado dentro del mensaje.',
      'Los cuatro niveles de severidad se usan con el criterio del material (Warning ≠ Error).',
      'Seq corre dentro del clúster, recibe por Service HTTP interno y persiste con un volumen.',
      'Hay evidencia de una búsqueda por propiedad que correlaciona eventos de más de una réplica.',
      'La URL de Seq y cualquier API key salen de configuración, no del código.',
    ],
    duracionEstimadaMin: 180,
  },

  'dev-cicd-actions': {
    id: 'dev-cicd-actions',
    examType: 'dev-cicd-actions',
    clase: 'Clase 9',
    title: 'Pipeline CI/CD con GitHub Actions',
    emoji: '🔁',
    objetivo:
      'Automatizar la validación y la entrega de una aplicación con GitHub Actions, separando correctamente la configuración no sensible de los secretos.',
    consigna: [
      'Creá un workflow de CI en `.github/workflows/` que se dispare con `push`, con `pull_request` y con `workflow_dispatch`.',
      'El job de validación debe ejecutar los steps en el orden correcto: checkout, setup del runtime, restore, build (`--no-restore`) y test (`--no-build`).',
      'Agregá un job de empaquetado que construya la imagen Docker y la publique en un registry (GitHub Container Registry sirve).',
      'El job de empaquetado debe depender del de validación con `needs`, y ejecutarse solo en la rama principal.',
      'Usá Variables del repositorio para lo no sensible (nombre de la imagen, entorno, namespace) y Secrets para las credenciales. Ningún secreto puede aparecer en el código ni en la salida de los logs.',
      'Provocá un fallo a propósito en un Pull Request (por ejemplo, un test roto), mostrá el check en rojo y documentalo; después arreglalo y mostrá el check en verde.',
      'Documentá en el README el diagrama del pipeline y qué Variables y Secrets hay que configurar para reproducirlo.',
    ],
    entregables: [
      'Repositorio público de GitHub con los workflows en `.github/workflows/`.',
      'Al menos una ejecución exitosa y una fallida visibles en la pestaña Actions.',
      'README con el diagrama del pipeline y la lista de Variables y Secrets requeridos.',
    ],
    estructuraEsperada: `mi-app/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── cd.yml
├── Dockerfile
├── README.md
└── src/`,
    criteriosDeEvaluacion: [
      'El workflow declara los tres triggers pedidos y cada uno cumple su propósito.',
      'El orden restore → build → test es correcto y usa `--no-restore` / `--no-build`.',
      'El job de empaquetado usa `needs` y está condicionado a la rama principal.',
      'La separación Variables / Secrets respeta el criterio de sensibilidad; no hay secretos en el código ni filtrados en los logs.',
      'Hay evidencia del check fallando y después pasando sobre un Pull Request.',
      'El README documenta el pipeline y permite reproducirlo en otro repositorio.',
    ],
    duracionEstimadaMin: 180,
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
