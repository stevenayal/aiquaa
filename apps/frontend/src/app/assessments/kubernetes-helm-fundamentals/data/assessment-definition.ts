import type { AssessmentSeedDefinition } from '../../_shared/types';

export const KUBERNETES_HELM_FUNDAMENTALS_SLUG = 'kubernetes-helm-fundamentals';

// Bumpear cuando cambie la definición (secciones/preguntas) para forzar re-seed.
export const KUBERNETES_HELM_FUNDAMENTALS_SEED_VERSION = 1;

export const kubernetesHelmFundamentalsDefinition: AssessmentSeedDefinition = {
  slug: KUBERNETES_HELM_FUNDAMENTALS_SLUG,
  title: 'Kubernetes + Helm — Fundamentos',
  description:
    'Evaluación teórica de Kubernetes y Helm para bootcamp de desarrollo backend: manifiestos Deployment/Service, ConfigMaps y Secrets, empaquetado de charts con Helm, y despliegue funcional en Minikube.',
  level: 'Trainee a Junior',
  type: 'Desarrollo DevOps',
  duration_minutes: 40,
  total_score: 100,
  is_active: true,
  metadata: {
    moduleName: 'AIQUAA Assessments / Kubernetes + Helm Fundamentals',
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
      slug: 'manifiestos-kubernetes',
      title: 'Manifiestos Kubernetes',
      description:
        'Deployment y Service: qué declaran, cómo se relacionan y cómo se actualizan sin downtime.',
      order_index: 1,
      max_score: 28,
      metadata: {
        instructions:
          'Selección múltiple y verdadero/falso sobre manifiestos Deployment y Service en Kubernetes.',
        suggestedMinutes: 12,
      },
      questions: [
        {
          question_type: 'multiple_choice',
          prompt: '¿Qué declara un objeto Deployment en Kubernetes?',
          options: [
            {
              label:
                'El estado deseado de un conjunto de Pods (imagen, número de réplicas, estrategia de actualización); Kubernetes crea y gestiona un ReplicaSet para mantener ese estado',
              value: 'a',
            },
            {
              label: 'Únicamente la configuración de red del clúster',
              value: 'b',
            },
            {
              label: 'Las credenciales de acceso al registry de imágenes',
              value: 'c',
            },
            { label: 'El almacenamiento persistente del nodo', value: 'd' },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'Un Deployment es un controlador de más alto nivel: describe cómo deberían verse los Pods y cuántas réplicas debe haber, y Kubernetes se encarga de reconciliar la realidad con esa declaración.',
          points: 4,
          order_index: 1,
        },
        {
          question_type: 'multiple_choice',
          prompt: '¿Qué controla el campo `replicas` de un Deployment?',
          options: [
            {
              label:
                'Cuántas instancias idénticas del Pod deben mantenerse corriendo en simultáneo; si una falla o el nodo se cae, Kubernetes crea una nueva para mantener ese número',
              value: 'a',
            },
            {
              label: 'Cuántas veces se reintenta el build de la imagen',
              value: 'b',
            },
            { label: 'La cantidad de nodos del clúster', value: 'c' },
            { label: 'El tiempo máximo de vida de un Pod', value: 'd' },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'replicas es la cantidad deseada de Pods. El controlador del Deployment compara constantemente el estado real contra este número y crea o elimina Pods para converger hacia él.',
          points: 4,
          order_index: 2,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Cuál es la diferencia principal entre un Service tipo ClusterIP y uno tipo NodePort?',
          options: [
            {
              label:
                'ClusterIP expone el Service solo dentro del clúster con una IP interna estable; NodePort además abre un puerto fijo en cada nodo del clúster, permitiendo acceso desde fuera',
              value: 'a',
            },
            {
              label: 'Son exactamente lo mismo con nombres distintos',
              value: 'b',
            },
            {
              label:
                'ClusterIP solo funciona en Minikube, NodePort solo en la nube',
              value: 'c',
            },
            {
              label:
                'NodePort es para bases de datos y ClusterIP solo para APIs',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'ClusterIP es el tipo por defecto, pensado para comunicación interna entre servicios del clúster. NodePort agrega exposición externa básica reservando un puerto (30000-32767 por defecto) en cada nodo.',
          points: 4,
          order_index: 3,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Cómo determina un Service a qué Pods enviarles el tráfico que recibe?',
          options: [
            {
              label:
                'Mediante un selector de labels: el Service enruta tráfico a todos los Pods cuyos labels coincidan con el selector definido, sin importar en qué nodo estén',
              value: 'a',
            },
            {
              label: 'Por el orden en que los Pods fueron creados',
              value: 'b',
            },
            { label: 'Por la dirección IP fija de cada Pod', value: 'c' },
            {
              label:
                'El Service se conecta manualmente a cada Pod por su nombre',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'El selector es la pieza clave: si los labels del template de Pods del Deployment no coinciden con el selector del Service, el Service no tiene a quién enviar tráfico aunque los Pods estén corriendo perfectamente.',
          points: 4,
          order_index: 4,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Qué estrategia usa un Deployment por defecto para actualizar la versión de la imagen sin causar downtime?',
          options: [
            {
              label:
                'RollingUpdate: reemplaza los Pods viejos por nuevos de forma gradual, manteniendo siempre una cantidad mínima de Pods disponibles sirviendo tráfico',
              value: 'a',
            },
            {
              label:
                'Recreate: apaga todos los Pods viejos antes de crear los nuevos',
              value: 'b',
            },
            {
              label: 'No existe forma de actualizar un Deployment sin downtime',
              value: 'c',
            },
            {
              label: 'Blue/Green automático sin configuración adicional',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'RollingUpdate es la estrategia por defecto: crea Pods nuevos e va apagando los viejos progresivamente, respetando maxUnavailable/maxSurge, para que siempre haya capacidad sirviendo tráfico.',
          points: 4,
          order_index: 5,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Qué comando permite ver el estado actual de los Pods gestionados por un Deployment?',
          options: [
            {
              label:
                'kubectl get pods (opcionalmente con -l para filtrar por label)',
              value: 'a',
            },
            { label: 'docker ps -a', value: 'b' },
            { label: 'helm status', value: 'c' },
            { label: 'kubectl get nodes', value: 'd' },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'kubectl get pods lista los Pods del namespace actual con su estado (Running, Pending, CrashLoopBackOff, etc.); es el primer comando para verificar si un Deployment logró desplegarse correctamente.',
          points: 4,
          order_index: 6,
        },
        {
          question_type: 'true_false',
          prompt:
            'Editar directamente un Pod administrado por un Deployment es la forma recomendada de aplicar un cambio permanente, en vez de modificar el manifiesto del Deployment.',
          correct_answer: { value: false },
          explanation:
            'Los Pods creados por un Deployment son efímeros y están bajo control del ReplicaSet: un cambio manual se pierde en cuanto el Pod se recrea. Los cambios permanentes deben aplicarse al manifiesto del Deployment (y reaplicarse con kubectl apply o Helm).',
          points: 4,
          order_index: 7,
        },
      ],
    },
    {
      slug: 'configmaps-secrets',
      title: 'ConfigMaps & Secrets',
      description:
        'Separación de configuración y datos sensibles del código de la aplicación, y cómo consumirlos desde un Pod.',
      order_index: 2,
      max_score: 24,
      metadata: {
        instructions:
          'Preguntas sobre el uso correcto de ConfigMaps y Secrets en Kubernetes.',
        suggestedMinutes: 10,
      },
      questions: [
        {
          question_type: 'multiple_choice',
          prompt: '¿Para qué sirve un ConfigMap en Kubernetes?',
          options: [
            {
              label:
                'Almacenar configuración no sensible (variables, archivos de configuración) desacoplada de la imagen del contenedor, para poder cambiarla sin reconstruir ni redeployar la imagen',
              value: 'a',
            },
            { label: 'Guardar el código fuente de la aplicación', value: 'b' },
            { label: 'Definir las reglas de firewall del clúster', value: 'c' },
            { label: 'Almacenar imágenes Docker', value: 'd' },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'ConfigMap externaliza configuración de la imagen: la misma imagen puede correr con distinta configuración en distintos ambientes simplemente cambiando el ConfigMap que se le monta o inyecta.',
          points: 4,
          order_index: 1,
        },
        {
          question_type: 'multiple_choice',
          prompt: '¿En qué se diferencia un Secret de un ConfigMap?',
          options: [
            {
              label:
                'Secret está pensado para datos sensibles (contraseñas, tokens, claves); sus valores se almacenan codificados en base64 (no encriptados por defecto) y Kubernetes los trata con más cuidado, por ejemplo no mostrándolos en texto plano en kubectl describe',
              value: 'a',
            },
            { label: 'No hay ninguna diferencia real entre ambos', value: 'b' },
            { label: 'Secret solo puede usarse en Minikube', value: 'c' },
            { label: 'ConfigMap encripta los datos y Secret no', value: 'd' },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'Base64 es codificación, no encriptación: cualquiera con acceso al Secret puede decodificarlo trivialmente. Kubernetes le da un tratamiento distinto (menos exposición en logs/describe), pero para protección real hace falta encriptación en reposo o un secret manager externo.',
          points: 4,
          order_index: 2,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Cuáles son las dos formas principales en que un Pod puede consumir un ConfigMap o Secret?',
          options: [
            {
              label:
                'Como variables de entorno inyectadas al contenedor, o montados como archivos dentro de un volumen',
              value: 'a',
            },
            {
              label:
                'Solo se pueden leer manualmente con kubectl desde fuera del Pod',
              value: 'b',
            },
            {
              label:
                'Únicamente escribiendo el valor directamente en la imagen',
              value: 'c',
            },
            { label: 'Solo a través de una base de datos externa', value: 'd' },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'envFrom/valueFrom inyecta las claves como variables de entorno del contenedor; montarlo como volumen expone cada clave como un archivo. La elección depende de si la app espera env vars o archivos de configuración.',
          points: 4,
          order_index: 3,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Por qué NO conviene escribir el valor real de un Secret directamente en el manifiesto YAML que se versiona en el repositorio de Git?',
          options: [
            {
              label:
                'Queda expuesto en el historial del repositorio en un formato (base64) trivialmente reversible, accesible para cualquiera con acceso al repo',
              value: 'a',
            },
            {
              label:
                'Kubernetes rechaza aplicar manifiestos que contengan Secrets',
              value: 'b',
            },
            { label: 'YAML no soporta el tipo Secret', value: 'c' },
            {
              label: 'No hay ningún problema en hacerlo si el repo es privado',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'Igual que con cualquier credencial hardcodeada, versionar un Secret en texto (aunque esté en base64) lo expone permanentemente en el historial de git. La práctica recomendada es generarlo fuera del control de versiones o usar herramientas de secret management/encriptación (ej. Sealed Secrets, External Secrets).',
          points: 4,
          order_index: 4,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            'Si actualizás el valor de un ConfigMap que está montado como volumen en un Pod que ya está corriendo, ¿qué es lo más probable que ocurra?',
          options: [
            {
              label:
                'El archivo montado eventualmente se actualiza, pero la aplicación normalmente no relee el archivo por sí sola; en la práctica suele necesitarse reiniciar el Pod para que tome el nuevo valor, salvo que la app implemente watch de archivos',
              value: 'a',
            },
            {
              label:
                'La aplicación se reinicia automáticamente y aplica el cambio sin ninguna configuración adicional',
              value: 'b',
            },
            { label: 'El clúster entero se reinicia', value: 'c' },
            {
              label: 'El cambio se ignora completamente y nunca llega al Pod',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'Kubernetes actualiza el contenido del volumen, pero la mayoría de las aplicaciones leen la configuración una sola vez al arrancar. Por eso muchos equipos disparan un rollout (reinicio de Pods) cuando cambia un ConfigMap crítico.',
          points: 4,
          order_index: 5,
        },
        {
          question_type: 'true_false',
          prompt:
            'Es una buena práctica que la aplicación reciba la cadena de conexión a la base de datos vía ConfigMap/Secret externo en vez de tenerla hardcodeada dentro de la imagen del contenedor.',
          correct_answer: { value: true },
          explanation:
            'Es la misma idea de separar configuración de la imagen que en Docker: la imagen debe ser la misma en todos los ambientes, y lo que cambia (URLs, credenciales) se inyecta externamente vía ConfigMap/Secret.',
          points: 4,
          order_index: 6,
        },
      ],
    },
    {
      slug: 'helm',
      title: 'Helm',
      description:
        'Empaquetado de manifiestos como charts reutilizables, values.yaml y el ciclo de vida de un release con Helm.',
      order_index: 3,
      max_score: 24,
      metadata: {
        instructions:
          'Preguntas sobre Helm como gestor de paquetes para Kubernetes.',
        suggestedMinutes: 9,
      },
      questions: [
        {
          question_type: 'multiple_choice',
          prompt: '¿Qué es Helm en el contexto de Kubernetes?',
          options: [
            {
              label:
                'Un gestor de paquetes para Kubernetes: empaqueta un conjunto de manifiestos como un "chart" reutilizable y parametrizable, y gestiona su ciclo de vida como una unidad (install, upgrade, rollback, uninstall)',
              value: 'a',
            },
            {
              label: 'Un reemplazo de Docker para construir imágenes',
              value: 'b',
            },
            {
              label: 'Un tipo de base de datos usada dentro de Kubernetes',
              value: 'c',
            },
            {
              label: 'Un proveedor de nube alternativo a AWS/Azure/GCP',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'Helm resuelve el problema de mantener a mano decenas de manifiestos YAML casi idénticos entre ambientes: un chart parametrizado se puede desplegar en cualquier ambiente cambiando solo los valores.',
          points: 4,
          order_index: 1,
        },
        {
          question_type: 'multiple_choice',
          prompt: '¿Para qué sirve el archivo values.yaml en un chart de Helm?',
          options: [
            {
              label:
                'Define los valores por defecto (parámetros) que los templates del chart usan, permitiendo personalizar el despliegue (réplicas, imagen, recursos, etc.) sin modificar los templates',
              value: 'a',
            },
            {
              label: 'Contiene el código fuente compilado de la aplicación',
              value: 'b',
            },
            {
              label: 'Define los usuarios que tienen acceso al clúster',
              value: 'c',
            },
            { label: 'Es un archivo de logs generado por Helm', value: 'd' },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'values.yaml es la capa de configuración del chart. Los templates quedan genéricos y reutilizables; lo que cambia por ambiente o despliegue son los valores, no la estructura de los manifiestos.',
          points: 4,
          order_index: 2,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            'Dentro de un template de Helm (por ejemplo templates/deployment.yaml), ¿cómo se referencia un valor definido en values.yaml?',
          options: [
            {
              label: 'Con la sintaxis {{ .Values.nombreDelValor }}',
              value: 'a',
            },
            { label: 'Con la sintaxis $ENV{nombreDelValor}', value: 'b' },
            {
              label: 'Escribiendo directamente #include values.yaml',
              value: 'c',
            },
            {
              label: 'No es posible referenciar values.yaml desde un template',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'Helm usa el motor de templates de Go. `.Values` es el objeto raíz que expone todo lo definido en values.yaml (y lo sobreescrito por -f o --set) dentro de los templates.',
          points: 4,
          order_index: 3,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Qué comando instala un chart como un nuevo release en el clúster, o lo actualiza si ya existe?',
          options: [
            {
              label: 'helm upgrade --install <release> <chart> -f values.yaml',
              value: 'a',
            },
            { label: 'kubectl create chart <chart>', value: 'b' },
            { label: 'docker helm run <chart>', value: 'c' },
            { label: 'helm delete --install <chart>', value: 'd' },
          ],
          correct_answer: { value: 'a' },
          explanation:
            '`helm upgrade --install` es el patrón idempotente típico en CI/CD: instala el release si no existe, o lo actualiza si ya está desplegado, sin tener que distinguir manualmente entre install y upgrade.',
          points: 4,
          order_index: 4,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Cuál es la principal ventaja de usar Helm en vez de aplicar manifiestos YAML sueltos con `kubectl apply -f`?',
          options: [
            {
              label:
                'Helm versiona cada release, permite hacer rollback a una versión anterior, reutiliza templates entre ambientes cambiando solo los values, y gestiona el conjunto de recursos como una sola unidad desplegable',
              value: 'a',
            },
            {
              label:
                'kubectl apply no funciona con Deployments, solo Helm puede crearlos',
              value: 'b',
            },
            {
              label: 'Helm es más rápido en todos los casos sin excepción',
              value: 'c',
            },
            {
              label: 'No hay ninguna ventaja real, son intercambiables siempre',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'kubectl apply funciona perfectamente para manifiestos sueltos, pero no versiona releases ni ofrece rollback nativo, ni resuelve la reutilización entre ambientes tan bien como un chart parametrizado.',
          points: 4,
          order_index: 5,
        },
        {
          question_type: 'true_false',
          prompt:
            'Un mismo chart de Helm puede desplegarse en distintos ambientes (dev/staging/prod) usando distintos archivos de values (por ejemplo values-dev.yaml y values-prod.yaml) sin modificar los templates del chart.',
          correct_answer: { value: true },
          explanation:
            'Esa es justamente la idea central de Helm: los templates definen la estructura, y los distintos archivos values solo cambian los parámetros (réplicas, recursos, nombres de host, etc.) por ambiente.',
          points: 4,
          order_index: 6,
        },
      ],
    },
    {
      slug: 'despliegue-funcional',
      title: 'Despliegue funcional en Minikube',
      description:
        'Levantar y verificar un despliegue real en un clúster local con Minikube, y diagnosticar Pods que no llegan a Running.',
      order_index: 4,
      max_score: 24,
      metadata: {
        instructions:
          'Preguntas sobre el flujo práctico de desplegar y depurar una aplicación en Minikube.',
        suggestedMinutes: 9,
      },
      questions: [
        {
          question_type: 'multiple_choice',
          prompt: '¿Qué es Minikube?',
          options: [
            {
              label:
                'Una herramienta que levanta un clúster de Kubernetes de un solo nodo de forma local, pensada para desarrollo y pruebas sin necesitar infraestructura en la nube',
              value: 'a',
            },
            {
              label: 'Un proveedor de Kubernetes administrado en la nube',
              value: 'b',
            },
            { label: 'Un registry privado de imágenes Docker', value: 'c' },
            {
              label: 'Una alternativa a Docker para construir imágenes',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'Minikube corre un clúster completo (control plane + nodo) dentro de una VM o contenedor local, permitiendo practicar manifiestos y Helm charts reales sin costo de infraestructura en la nube.',
          points: 4,
          order_index: 1,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            'Construiste una imagen Docker localmente y querés usarla en un Deployment de Minikube sin subirla a un registry externo. ¿Qué paso adicional suele hacer falta?',
          options: [
            {
              label:
                'Apuntar el build al daemon de Docker de Minikube (`eval $(minikube docker-env)`) o cargar la imagen ya construida con `minikube image load`, para que el clúster la encuentre localmente sin necesitar hacer pull de un registry',
              value: 'a',
            },
            {
              label:
                'Ningún paso adicional, Minikube siempre ve las imágenes locales del host automáticamente',
              value: 'b',
            },
            {
              label: 'Hace falta reinstalar Kubernetes desde cero',
              value: 'c',
            },
            {
              label: 'Hay que convertir la imagen a un formato .helm',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'Por defecto, el clúster de Minikube corre en un entorno Docker separado del host. Sin ese paso, Kubernetes intenta hacer pull de la imagen desde un registry externo y falla con ImagePullBackOff aunque la imagen exista localmente en el host.',
          points: 4,
          order_index: 2,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Qué comando permite abrir en el navegador, de forma rápida, un Service que está corriendo en Minikube?',
          options: [
            { label: 'minikube service <nombre-del-service>', value: 'a' },
            { label: 'docker open <service>', value: 'b' },
            { label: 'helm browse <service>', value: 'c' },
            { label: 'kubectl open service', value: 'd' },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'minikube service resuelve automáticamente la URL accesible del Service (incluyendo el túnel necesario para tipos NodePort/LoadBalancer en Minikube) y puede abrirla directamente en el navegador.',
          points: 4,
          order_index: 3,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            'Un Pod queda en estado CrashLoopBackOff. ¿Cuál es el primer comando recomendado para empezar a diagnosticar la causa?',
          options: [
            {
              label:
                'kubectl logs <pod> (y kubectl describe pod <pod> para ver eventos recientes, como fallas de liveness probe o errores de arranque)',
              value: 'a',
            },
            {
              label: 'kubectl delete pod <pod> --force inmediatamente',
              value: 'b',
            },
            { label: 'helm uninstall del release completo', value: 'c' },
            { label: 'Reiniciar Minikube desde cero', value: 'd' },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'CrashLoopBackOff significa que el contenedor arranca y falla repetidamente. Los logs del proceso (y los eventos del Pod) casi siempre muestran directamente la excepción o el motivo del crash, antes de tomar medidas más drásticas.',
          points: 4,
          order_index: 4,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            'Un Pod queda indefinidamente en estado "Pending" y nunca pasa a Running. ¿Qué indica típicamente ese estado?',
          options: [
            {
              label:
                'El scheduler no pudo asignar el Pod a ningún nodo, por ejemplo por falta de recursos (CPU/memoria) disponibles, o por un problema con un volumen, ConfigMap o Secret referenciado que no existe',
              value: 'a',
            },
            {
              label: 'El Pod ya terminó su ejecución exitosamente',
              value: 'b',
            },
            {
              label:
                'La imagen se descargó pero el contenedor decidió no arrancar',
              value: 'c',
            },
            {
              label:
                'Pending es el estado normal y esperado de un Pod saludable',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            '"Pending" significa que el Pod fue aceptado por la API pero todavía no se pudo programar/arrancar en ningún nodo. kubectl describe pod suele mostrar el motivo exacto en la sección de Events.',
          points: 4,
          order_index: 5,
        },
        {
          question_type: 'true_false',
          prompt:
            'Un despliegue se considera funcional cuando el manifiesto (o el chart de Helm) se aplica sin errores de sintaxis, aunque los Pods resultantes no lleguen nunca al estado Running.',
          correct_answer: { value: false },
          explanation:
            'Que kubectl apply o helm install no devuelvan un error de sintaxis solo confirma que el YAML es válido, no que la aplicación esté sirviendo tráfico. Un despliegue funcional requiere Pods en estado Running/Ready y el Service respondiendo correctamente.',
          points: 4,
          order_index: 6,
        },
      ],
    },
  ],
};
