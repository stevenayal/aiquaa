import type { AssessmentSeedDefinition } from '../../_shared/types';

export const DOCKER_FUNDAMENTALS_SLUG = 'docker-fundamentals';

// Bumpear cuando cambie la definición (secciones/preguntas) para forzar re-seed.
export const DOCKER_FUNDAMENTALS_SEED_VERSION = 1;

export const dockerFundamentalsDefinition: AssessmentSeedDefinition = {
  slug: DOCKER_FUNDAMENTALS_SLUG,
  title: 'Docker — Fundamentos',
  description:
    'Evaluación teórica de Docker para bootcamp de desarrollo backend: construcción correcta de Dockerfiles (multistage, imágenes livianas), manejo de variables de entorno sin hardcodear configuración, y ejecución/reproducibilidad local de contenedores.',
  level: 'Trainee a Junior',
  type: 'Desarrollo DevOps',
  duration_minutes: 35,
  total_score: 100,
  is_active: true,
  metadata: {
    moduleName: 'AIQUAA Assessments / Docker Fundamentals',
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
      slug: 'dockerfile-correcto',
      title: 'Dockerfile correcto',
      description:
        'Multistage builds, imágenes livianas, orden de capas, .dockerignore y buenas prácticas de construcción de una imagen productiva.',
      order_index: 1,
      max_score: 36,
      metadata: {
        instructions:
          'Selección múltiple y verdadero/falso sobre construcción de Dockerfiles para aplicaciones backend.',
        suggestedMinutes: 13,
      },
      questions: [
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Qué es un multi-stage build en Docker y para qué sirve principalmente?',
          options: [
            {
              label:
                'Usar múltiples instrucciones FROM en un mismo Dockerfile para separar la etapa de compilación de la etapa final, copiando solo los artefactos necesarios y dejando afuera el SDK y el código fuente',
              value: 'a',
            },
            {
              label:
                'Ejecutar el mismo contenedor en varios servidores a la vez',
              value: 'b',
            },
            {
              label:
                'Construir varias imágenes completamente independientes en paralelo sin relación entre sí',
              value: 'c',
            },
            {
              label:
                'Una forma de versionar el Dockerfile en distintas ramas de Git',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'Cada FROM abre una nueva "stage". Una etapa temprana compila con el SDK completo; la etapa final parte de una imagen liviana y usa COPY --from para traer solo el resultado compilado, sin las herramientas de build.',
          points: 4,
          order_index: 1,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Por qué conviene usar una imagen base liviana (por ejemplo una variante "slim" o "alpine", o la imagen de runtime en vez de la de SDK) para la etapa final de runtime?',
          options: [
            {
              label:
                'Reduce el tamaño final de la imagen y la superficie de ataque: la imagen de SDK trae compiladores y herramientas que no hacen falta para ejecutar la app en producción',
              value: 'a',
            },
            {
              label: 'Porque las imágenes livianas corren más rápido el código',
              value: 'b',
            },
            {
              label:
                'Porque Docker no permite usar imágenes grandes en producción',
              value: 'c',
            },
            {
              label: 'No hay ninguna diferencia real, es solo preferencia',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'Una imagen de runtime liviana descarga más rápido, ocupa menos espacio y expone menos herramientas/paquetes que un atacante podría aprovechar si compromete el contenedor.',
          points: 4,
          order_index: 2,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Qué hace la instrucción `COPY --from=build /app/publish .` en la etapa final de un Dockerfile multistage?',
          options: [
            {
              label:
                'Copia los artefactos ya compilados/publicados desde la etapa llamada "build" hacia la imagen final, sin traer el código fuente ni las dependencias de compilación',
              value: 'a',
            },
            {
              label: 'Descarga el proyecto directamente desde GitHub',
              value: 'b',
            },
            {
              label: 'Copia toda la imagen "build" completa, incluyendo el SDK',
              value: 'c',
            },
            {
              label:
                'Ejecuta los tests del proyecto dentro del contenedor final',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'COPY --from referencia una stage anterior por su nombre (definido con `FROM ... AS build`) y copia solo la ruta indicada, que típicamente son los binarios o artefactos ya listos para ejecutar.',
          points: 4,
          order_index: 3,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            'En un Dockerfile de una API, ¿por qué conviene copiar primero el archivo de dependencias (por ejemplo el .csproj o package.json) y correr el restore/install, antes de copiar el resto del código fuente?',
          options: [
            {
              label:
                'Porque Docker cachea cada capa: si el código fuente cambia pero las dependencias no, la capa de restore se reutiliza desde cache y el build es mucho más rápido',
              value: 'a',
            },
            {
              label:
                'Porque Docker exige ese orden específico o falla el build',
              value: 'b',
            },
            {
              label:
                'Porque así el archivo de dependencias queda oculto en la imagen final',
              value: 'c',
            },
            {
              label: 'No influye en nada, es solo una convención estética',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'Cada instrucción genera una capa cacheable. Si se copia todo el código junto con el archivo de dependencias, cualquier cambio en el código invalida también la capa de restore, forzando a reinstalar dependencias en cada build.',
          points: 4,
          order_index: 4,
        },
        {
          question_type: 'multiple_choice',
          prompt: '¿Para qué sirve el archivo .dockerignore?',
          options: [
            {
              label:
                'Excluir archivos y carpetas (como bin/, obj/, node_modules/, .git/) del contexto que se envía al build, reduciendo el tamaño del contexto y evitando copiar artefactos locales o información sensible',
              value: 'a',
            },
            {
              label: 'Definir qué contenedores se ignoran al hacer docker ps',
              value: 'b',
            },
            {
              label: 'Bloquear el acceso a internet del contenedor',
              value: 'c',
            },
            {
              label: 'Configurar qué puertos quedan cerrados por firewall',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'Funciona igual que .gitignore pero para el contexto de build de Docker: evita que carpetas pesadas o irrelevantes (y potencialmente archivos con secretos locales) terminen dentro de la imagen o ralenticen el build.',
          points: 4,
          order_index: 5,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Por qué es una buena práctica correr el proceso final del contenedor con un usuario no-root (por ejemplo, agregando `USER appuser` al final del Dockerfile)?',
          options: [
            {
              label:
                'Aplica el principio de menor privilegio: si un atacante compromete el proceso dentro del contenedor, no obtiene privilegios de root sobre el sistema de archivos del contenedor',
              value: 'a',
            },
            {
              label: 'Porque los contenedores root consumen más memoria',
              value: 'b',
            },
            {
              label: 'Porque Docker no permite ejecutar procesos como root',
              value: 'c',
            },
            {
              label: 'Es solo una preferencia estética sin impacto real',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'Por defecto los contenedores corren como root si no se especifica lo contrario. Definir un usuario sin privilegios reduce el impacto de una eventual explotación del proceso dentro del contenedor.',
          points: 4,
          order_index: 6,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Qué problema genera usar `FROM node:latest` (o cualquier imagen base con tag "latest") en el Dockerfile de un proyecto que se va a mantener en el tiempo?',
          options: [
            {
              label:
                'El build deja de ser reproducible: "latest" apunta a una versión distinta según cuándo se construya la imagen, por lo que el mismo Dockerfile puede producir resultados diferentes en distintos momentos',
              value: 'a',
            },
            {
              label: 'Docker no permite usar la tag "latest" en producción',
              value: 'b',
            },
            {
              label: 'La imagen queda encriptada y no se puede correr',
              value: 'c',
            },
            {
              label: 'No genera ningún problema, es la práctica recomendada',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'Pinear una versión específica (por ejemplo node:20.11-slim) garantiza que reconstruir la imagen hoy o dentro de seis meses parta de la misma base, evitando sorpresas por cambios en la imagen "latest".',
          points: 4,
          order_index: 7,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Cuál es la diferencia principal entre CMD y ENTRYPOINT en un Dockerfile?',
          options: [
            {
              label:
                'ENTRYPOINT define el ejecutable fijo del contenedor; CMD define argumentos por defecto que se pueden sobreescribir al ejecutar `docker run <imagen> <otro-comando>`',
              value: 'a',
            },
            {
              label: 'Son exactamente lo mismo, se usan indistintamente',
              value: 'b',
            },
            {
              label: 'CMD solo funciona en Linux y ENTRYPOINT solo en Windows',
              value: 'c',
            },
            {
              label: 'ENTRYPOINT se ejecuta en build-time y CMD en runtime',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'ENTRYPOINT fija el proceso principal del contenedor; CMD aporta argumentos por defecto para ese proceso (o el comando completo si no hay ENTRYPOINT), y es lo primero que se reemplaza si se pasan argumentos extra a docker run.',
          points: 4,
          order_index: 8,
        },
        {
          question_type: 'true_false',
          prompt:
            'Combinar varias instrucciones RUN relacionadas en una sola (por ejemplo, `RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*`) ayuda a reducir la cantidad de capas y el tamaño final de la imagen.',
          correct_answer: { value: true },
          explanation:
            'Cada RUN crea una capa nueva. Encadenar comandos relacionados en una sola instrucción evita capas intermedias con archivos temporales que después no se pueden limpiar sin agregar aún más capas.',
          points: 4,
          order_index: 9,
        },
      ],
    },
    {
      slug: 'variables-de-entorno',
      title: 'Variables de entorno',
      description:
        'Uso correcto de ARG y ENV, por qué no hardcodear configuración sensible en la imagen, y cómo inyectar configuración por ambiente.',
      order_index: 2,
      max_score: 32,
      metadata: {
        instructions:
          'Preguntas sobre manejo de configuración y secretos en Dockerfiles, docker run y docker-compose.',
        suggestedMinutes: 11,
      },
      questions: [
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Cuál es la diferencia principal entre ARG y ENV en un Dockerfile?',
          options: [
            {
              label:
                'ARG solo existe durante el proceso de build (no queda disponible en el contenedor en runtime); ENV define una variable que persiste y está disponible cuando el contenedor está corriendo',
              value: 'a',
            },
            {
              label: 'Son sinónimos, ambos hacen exactamente lo mismo',
              value: 'b',
            },
            {
              label: 'ARG es para strings y ENV solo para números',
              value: 'c',
            },
            {
              label:
                'ENV solo funciona dentro de docker-compose, nunca en un Dockerfile',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'ARG se usa para parametrizar el build (por ejemplo, una versión a instalar) y no queda accesible en el contenedor final salvo que se copie explícitamente a un ENV. ENV sí persiste como variable de entorno del proceso en runtime.',
          points: 4,
          order_index: 1,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Por qué NO es buena práctica escribir `ENV DB_PASSWORD=superSecreto123` directamente en el Dockerfile de un proyecto real?',
          options: [
            {
              label:
                'El valor queda embebido en la imagen (visible con `docker history` o inspeccionando las capas) y no puede cambiar por ambiente sin reconstruir la imagen; además suele terminar versionado en el repositorio',
              value: 'a',
            },
            {
              label: 'Docker no permite usar ENV para contraseñas',
              value: 'b',
            },
            { label: 'ENV solo acepta valores numéricos', value: 'c' },
            {
              label: 'No hay ningún problema, es la forma recomendada',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'Cualquiera con acceso a la imagen (o al Dockerfile en el repo) puede leer ese secreto. La configuración sensible debe inyectarse en runtime (variables de entorno externas, secret manager, Secrets de Kubernetes), nunca hardcodeada en la imagen.',
          points: 4,
          order_index: 2,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Cuál es la forma correcta de pasarle a un contenedor la URL de la base de datos, sabiendo que va a ser distinta en desarrollo, staging y producción?',
          options: [
            {
              label:
                'Inyectarla en runtime como variable de entorno (`docker run -e DB_URL=... ` / `--env-file` / o vía Secrets/ConfigMaps si corre en Kubernetes), no hardcodeada en el Dockerfile',
              value: 'a',
            },
            {
              label:
                'Escribir tres Dockerfiles distintos, uno por ambiente, cada uno con su URL fija',
              value: 'b',
            },
            {
              label: 'Hardcodearla en el código fuente de la aplicación',
              value: 'c',
            },
            {
              label:
                'No es necesario configurarla, Docker la detecta automáticamente',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'La misma imagen debe poder correr en cualquier ambiente; lo que cambia es la configuración externa que se le inyecta en runtime, no el contenido de la imagen (principio de 12-factor app).',
          points: 4,
          order_index: 3,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Qué comando permite inspeccionar el historial de capas de una imagen, lo que puede revelar secretos hardcodeados por error en instrucciones RUN o ENV?',
          options: [
            { label: 'docker history <imagen>', value: 'a' },
            { label: 'docker ps -a', value: 'b' },
            { label: 'docker network ls', value: 'c' },
            { label: 'docker volume prune', value: 'd' },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'docker history muestra cada capa y el comando que la generó. Si un secreto se escribió en una instrucción ENV o RUN, suele quedar visible ahí (o extraíble de la capa) aunque se haya "borrado" en una instrucción posterior.',
          points: 4,
          order_index: 4,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            'En un docker-compose.yml, ¿para qué sirve la clave `env_file`?',
          options: [
            {
              label:
                'Cargar variables de entorno desde un archivo externo (ej. .env, que no se versiona) en vez de escribir los valores directamente en el compose file que sí queda en el repositorio',
              value: 'a',
            },
            { label: 'Definir el nombre del contenedor', value: 'b' },
            { label: 'Especificar qué imagen base usar', value: 'c' },
            { label: 'Configurar el healthcheck del servicio', value: 'd' },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'env_file apunta a un archivo (típicamente ignorado por git) con los valores reales, mientras que el docker-compose.yml versionado solo referencia el archivo, sin exponer los secretos en el control de versiones.',
          points: 4,
          order_index: 5,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Por qué es preferible que una misma imagen Docker sea configurable por variables de entorno en vez de tener el ambiente "quemado" en el build?',
          options: [
            {
              label:
                'Permite construir la imagen una sola vez y promoverla sin cambios entre dev, staging y producción, cambiando solo la configuración externa en cada ambiente',
              value: 'a',
            },
            {
              label: 'Porque así la imagen ocupa menos espacio en disco',
              value: 'b',
            },
            {
              label: 'Porque Docker Hub lo exige para publicar imágenes',
              value: 'c',
            },
            { label: 'No hay ninguna ventaja real en hacerlo así', value: 'd' },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'Si cada ambiente requiere reconstruir la imagen con su propia configuración, se pierde la garantía de que "lo que se testeó es lo que se despliega". Separar build de configuración es central en el enfoque 12-factor.',
          points: 4,
          order_index: 6,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Qué riesgo concreto tiene commitear al repositorio un archivo .env con credenciales reales de producción?',
          options: [
            {
              label:
                'Las credenciales quedan expuestas en el historial de Git de forma permanente, accesibles para cualquiera con acceso al repositorio (incluso si después se borra el archivo)',
              value: 'a',
            },
            { label: 'El proyecto deja de compilar', value: 'b' },
            { label: 'Docker rechaza construir la imagen', value: 'c' },
            {
              label: 'No hay ningún riesgo real si el repositorio es privado',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'Borrar el archivo en un commit posterior no elimina el secreto del historial de Git; sigue siendo recuperable. Por eso .env (y cualquier archivo con secretos reales) debe estar en .gitignore desde el principio.',
          points: 4,
          order_index: 7,
        },
        {
          question_type: 'true_false',
          prompt:
            'Las variables definidas con ENV en el Dockerfile pueden sobreescribirse al correr el contenedor con `docker run -e VARIABLE=nuevo_valor`.',
          correct_answer: { value: true },
          explanation:
            'ENV en el Dockerfile define un valor por defecto; `docker run -e` (o `--env-file`) lo sobreescribe en runtime sin necesidad de reconstruir la imagen.',
          points: 4,
          order_index: 8,
        },
      ],
    },
    {
      slug: 'ejecucion-local',
      title: 'Ejecución local',
      description:
        'Construcción y ejecución de contenedores, mapeo de puertos, healthchecks, docker-compose y herramientas básicas de debugging.',
      order_index: 3,
      max_score: 32,
      metadata: {
        instructions:
          'Preguntas sobre el ciclo de build/run local y reproducibilidad del entorno de desarrollo con Docker.',
        suggestedMinutes: 11,
      },
      questions: [
        {
          question_type: 'multiple_choice',
          prompt: '¿Qué hace el comando `docker build -t myapp:1.0 .`?',
          options: [
            {
              label:
                'Construye una imagen a partir del Dockerfile encontrado en el directorio actual (usado como contexto de build) y la etiqueta como myapp:1.0',
              value: 'a',
            },
            {
              label: 'Ejecuta el contenedor myapp:1.0 en modo detached',
              value: 'b',
            },
            {
              label: 'Descarga la imagen myapp:1.0 desde Docker Hub',
              value: 'c',
            },
            {
              label: 'Elimina todas las imágenes locales llamadas myapp',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'El punto final (.) indica el contexto de build (el directorio que se envía al daemon de Docker), -t asigna nombre y tag a la imagen resultante. Todavía no ejecuta nada, solo construye la imagen.',
          points: 4,
          order_index: 1,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Qué logra la opción `-p 8080:80` al ejecutar `docker run -p 8080:80 myapp`?',
          options: [
            {
              label:
                'Mapea el puerto 80 dentro del contenedor al puerto 8080 del host, permitiendo acceder a la app desde http://localhost:8080',
              value: 'a',
            },
            {
              label: 'Limita el contenedor a usar máximo 8080 MB de memoria',
              value: 'b',
            },
            {
              label: 'Define el número de réplicas del contenedor',
              value: 'c',
            },
            { label: 'Establece un timeout de 8080 milisegundos', value: 'd' },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'La sintaxis es `-p <puerto_host>:<puerto_contenedor>`. Sin este mapeo, el puerto 80 solo sería accesible dentro de la red interna de Docker, no desde el host.',
          points: 4,
          order_index: 2,
        },
        {
          question_type: 'multiple_choice',
          prompt: '¿Qué es y para qué sirve un HEALTHCHECK en un Dockerfile?',
          options: [
            {
              label:
                'Define un comando que Docker ejecuta periódicamente dentro del contenedor para determinar si está "healthy" o "unhealthy", información que puede usar un orquestador para reiniciar o dejar de enrutar tráfico a ese contenedor',
              value: 'a',
            },
            {
              label:
                'Verifica automáticamente si hay vulnerabilidades de seguridad en la imagen',
              value: 'b',
            },
            {
              label: 'Corre los tests unitarios del proyecto antes del build',
              value: 'c',
            },
            { label: 'Genera un reporte de cobertura de código', value: 'd' },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'HEALTHCHECK no reemplaza al monitoreo de la aplicación, pero le da a Docker (y a orquestadores como Kubernetes vía probes análogas) una señal simple de si el proceso interno responde correctamente.',
          points: 4,
          order_index: 3,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Por qué conviene usar docker-compose para levantar en desarrollo local la API junto con sus dependencias (por ejemplo, una base de datos y un cache)?',
          options: [
            {
              label:
                'Reproducibilidad: un solo archivo versionado y un solo comando (`docker-compose up`) levantan todo el stack con la misma configuración de red y volúmenes para cualquier persona del equipo',
              value: 'a',
            },
            {
              label: 'Porque docker run no permite correr más de un contenedor',
              value: 'b',
            },
            {
              label:
                'Porque es la única forma de conectar dos contenedores entre sí',
              value: 'c',
            },
            {
              label: 'Porque mejora el rendimiento de la CPU del host',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'Sin docker-compose también se pueden conectar contenedores manualmente (redes, docker run individuales), pero compose declara todo el stack en un archivo versionado, eliminando pasos manuales propensos a error y diferencias entre máquinas.',
          points: 4,
          order_index: 4,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Qué comando permite ver los logs de un contenedor que ya está corriendo?',
          options: [
            {
              label:
                'docker logs <container> (agregando -f para seguirlos en tiempo real)',
              value: 'a',
            },
            { label: 'docker inspect <container> --logs', value: 'b' },
            { label: 'docker top <container>', value: 'c' },
            { label: 'docker stats <container>', value: 'd' },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'docker logs muestra la salida estándar/error del proceso principal del contenedor (PID 1). Es el primer lugar donde buscar cuando algo falla, antes de asumir que hace falta reconstruir la imagen.',
          points: 4,
          order_index: 5,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Qué comando permite abrir una shell interactiva dentro de un contenedor que ya está corriendo, para inspeccionar archivos o procesos en vivo?',
          options: [
            { label: 'docker exec -it <container> /bin/sh', value: 'a' },
            { label: 'docker create <container> --shell', value: 'b' },
            { label: 'docker pull <container> --interactive', value: 'c' },
            { label: 'docker commit <container>', value: 'd' },
          ],
          correct_answer: { value: 'a' },
          explanation:
            '-it habilita modo interactivo con una terminal asignada, y `/bin/sh` (o `/bin/bash` si la imagen lo tiene) abre una shell dentro del contenedor en ejecución, útil para debugging sin detenerlo.',
          points: 4,
          order_index: 6,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Por qué pinear la versión exacta de la imagen base (por ejemplo `FROM node:20.11-slim` en vez de `FROM node`) ayuda a que el build sea reproducible entre distintas máquinas y momentos en el tiempo?',
          options: [
            {
              label:
                'Garantiza que el mismo Dockerfile parta siempre de la misma base, evitando que un build de hoy y otro de dentro de unos meses (o en la máquina de otro desarrollador) usen versiones distintas de la imagen base sin que nadie lo haya decidido',
              value: 'a',
            },
            { label: 'Hace que el build sea más rápido siempre', value: 'b' },
            {
              label:
                'Es un requisito obligatorio de Docker Hub para publicar imágenes',
              value: 'c',
            },
            {
              label: 'No tiene relación con la reproducibilidad del build',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'Sin una versión fija, "la imagen base" es un blanco móvil: el clásico "funciona en mi máquina" muchas veces se origina en que dos builds partieron de versiones distintas de la misma imagen "genérica".',
          points: 4,
          order_index: 7,
        },
        {
          question_type: 'true_false',
          prompt:
            'Si un contenedor se detiene inesperadamente con un exit code distinto de 0, revisar `docker logs` del contenedor es un buen primer paso antes de asumir que hay que reescribir el Dockerfile.',
          correct_answer: { value: true },
          explanation:
            'La mayoría de las veces el motivo está en la salida del proceso (una excepción no manejada, una variable de entorno faltante, un puerto ocupado). Los logs suelen apuntar directamente a la causa antes de tocar la imagen.',
          points: 4,
          order_index: 8,
        },
      ],
    },
  ],
};
