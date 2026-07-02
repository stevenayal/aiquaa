import type { AssessmentSeedDefinition } from '../../_shared/types';

export const INFRASTRUCTURE_FUNDAMENTALS_SLUG = 'infrastructure-fundamentals';

// Bumpear cuando cambie la definición (secciones/preguntas) para forzar re-seed.
export const INFRASTRUCTURE_FUNDAMENTALS_SEED_VERSION = 1;

export const infrastructureFundamentalsDefinition: AssessmentSeedDefinition = {
  slug: INFRASTRUCTURE_FUNDAMENTALS_SLUG,
  title: 'Infraestructura — Fundamentos',
  description:
    'Evaluación teórica de infraestructura para QA: contenedores e imágenes Docker, conceptos de Kubernetes y diferencias con otras tecnologías, y arquitectura de un clúster (control plane, nodos y pods).',
  level: 'Junior a Semi Senior',
  type: 'QA Infraestructura',
  duration_minutes: 35,
  total_score: 100,
  is_active: true,
  metadata: {
    moduleName: 'AIQUAA Assessments / Infrastructure Fundamentals',
    passingScore: 70,
    candidateBands: [
      { min: 0, max: 39, label: 'Inicial' },
      { min: 40, max: 69, label: 'Junior en formación' },
      { min: 70, max: 79, label: 'Junior' },
      { min: 80, max: 89, label: 'Junior avanzado' },
      { min: 90, max: 100, label: 'Semi Senior' },
    ],
  },
  sections: [
    {
      slug: 'nivel-1-docker-basicos',
      title: 'Nivel 1: Fundamentos de Docker',
      description:
        'Validá tu conocimiento sobre contenedores, imágenes, aislamiento, registries y las diferencias con las máquinas virtuales.',
      order_index: 1,
      max_score: 36,
      metadata: {
        instructions:
          'Combinación de selección múltiple y verdadero/falso basada en la documentación oficial de Docker.',
        suggestedMinutes: 12,
      },
      questions: [
        {
          question_type: 'multiple_choice',
          prompt: '¿Qué describe mejor a un contenedor?',
          options: [
            {
              label:
                'Un proceso aislado con su propio sistema de archivos, que incluye todo lo necesario para ejecutar la aplicación',
              value: 'a',
            },
            {
              label:
                'Una máquina virtual liviana con su propio sistema operativo completo',
              value: 'b',
            },
            {
              label: 'Un servidor físico dedicado a una sola aplicación',
              value: 'c',
            },
            {
              label: 'Un lenguaje de scripting para automatizar despliegues',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'Un contenedor es un proceso aislado del host, con su propio filesystem y dependencias empaquetadas. No es una VM: no virtualiza hardware ni trae un SO completo.',
          points: 4,
          order_index: 1,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Cuál es la diferencia principal entre un contenedor y una máquina virtual?',
          options: [
            {
              label:
                'La VM virtualiza el hardware y corre un sistema operativo invitado completo; el contenedor comparte el kernel del host',
              value: 'a',
            },
            {
              label: 'El contenedor es más lento porque emula todo el hardware',
              value: 'b',
            },
            {
              label:
                'La VM solo puede correr en la nube; el contenedor solo en local',
              value: 'c',
            },
            {
              label: 'No hay diferencia: contenedor y VM son sinónimos',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'Las VMs virtualizan una máquina completa con su propio SO. Los contenedores comparten el kernel del host y aíslan solo el proceso, por eso son más livianos y arrancan más rápido.',
          points: 4,
          order_index: 2,
        },
        {
          question_type: 'multiple_choice',
          prompt: '¿Qué es una imagen Docker?',
          options: [
            {
              label: 'Una captura de pantalla del estado del contenedor',
              value: 'a',
            },
            {
              label:
                'Una plantilla de solo lectura con el filesystem, dependencias y configuración necesarios para crear contenedores',
              value: 'b',
            },
            {
              label: 'Un archivo de log generado al detener un contenedor',
              value: 'c',
            },
            {
              label: 'El disco duro virtual de una máquina virtual',
              value: 'd',
            },
          ],
          correct_answer: { value: 'b' },
          explanation:
            'La imagen es un paquete estandarizado e inmutable: incluye archivos, binarios, librerías y configuración. A partir de ella se crean los contenedores.',
          points: 4,
          order_index: 3,
        },
        {
          question_type: 'multiple_choice',
          prompt: '¿Cuál es la relación entre una imagen y un contenedor?',
          options: [
            {
              label: 'Son lo mismo: imagen y contenedor son intercambiables',
              value: 'a',
            },
            {
              label:
                'La imagen se genera automáticamente al borrar el contenedor',
              value: 'b',
            },
            {
              label:
                'El contenedor es una instancia en ejecución de una imagen; de una misma imagen pueden crearse varios contenedores',
              value: 'c',
            },
            {
              label: 'Cada contenedor solo puede ejecutarse una vez por imagen',
              value: 'd',
            },
          ],
          correct_answer: { value: 'c' },
          explanation:
            'La imagen es la plantilla; el contenedor es la instancia corriendo. Podés levantar múltiples contenedores desde la misma imagen, cada uno aislado.',
          points: 4,
          order_index: 4,
        },
        {
          question_type: 'multiple_choice',
          prompt: '¿Qué es un registry (por ejemplo, Docker Hub)?',
          options: [
            {
              label:
                'Un repositorio centralizado para almacenar, versionar y distribuir imágenes de contenedores',
              value: 'a',
            },
            {
              label:
                'Una base de datos donde los contenedores guardan sus logs',
              value: 'b',
            },
            {
              label: 'Un registro del kernel con los procesos aislados',
              value: 'c',
            },
            {
              label: 'El archivo de configuración principal de Docker',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'Un registry almacena y distribuye imágenes. Docker Hub es el registry público más usado; también existen registries privados para equipos y empresas.',
          points: 4,
          order_index: 5,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            'Por defecto, ¿qué puede "ver" un contenedor del host donde se ejecuta?',
          options: [
            {
              label: 'Todos los procesos y archivos del host',
              value: 'a',
            },
            {
              label:
                'Nada del host: está aislado y no ve otros procesos ni archivos fuera de su propio filesystem',
              value: 'b',
            },
            {
              label: 'Solo los archivos del usuario que lo ejecutó',
              value: 'c',
            },
            {
              label: 'Los procesos de otros contenedores, pero no los del host',
              value: 'd',
            },
          ],
          correct_answer: { value: 'b' },
          explanation:
            'El aislamiento es la característica central: el contenedor no interactúa con procesos ni archivos del host salvo que se lo configure explícitamente (volúmenes, redes).',
          points: 4,
          order_index: 6,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Por qué los contenedores resuelven el clásico problema de "en mi máquina funciona"?',
          options: [
            {
              label:
                'Porque obligan a todos los devs a usar el mismo sistema operativo',
              value: 'a',
            },
            {
              label: 'Porque eliminan la necesidad de dependencias externas',
              value: 'b',
            },
            {
              label: 'Porque solo se ejecutan en servidores de producción',
              value: 'c',
            },
            {
              label:
                'Porque son autosuficientes y portables: incluyen todas sus dependencias y corren igual en cualquier entorno',
              value: 'd',
            },
          ],
          correct_answer: { value: 'd' },
          explanation:
            'El contenedor empaqueta la app con todas sus dependencias, sin depender de lo instalado en el host. La misma imagen corre igual en desarrollo, testing y producción.',
          points: 4,
          order_index: 7,
        },
        {
          question_type: 'true_false',
          prompt:
            'Un contenedor incluye su propio kernel de sistema operativo.',
          correct_answer: { value: false },
          explanation:
            'Los contenedores comparten el kernel del host. Solo empaquetan filesystem, librerías y binarios; por eso son mucho más livianos que una VM.',
          points: 4,
          order_index: 8,
        },
        {
          question_type: 'true_false',
          prompt:
            'Las imágenes Docker son inmutables: para cambiar su contenido hay que construir una imagen nueva.',
          correct_answer: { value: true },
          explanation:
            'Una imagen no se modifica en caliente: cualquier cambio implica un nuevo build (y normalmente un nuevo tag). Esto garantiza despliegues reproducibles.',
          points: 4,
          order_index: 9,
        },
      ],
    },
    {
      slug: 'nivel-2-kubernetes-conceptos',
      title: 'Nivel 2: Conceptos de Kubernetes',
      description:
        'Demostrá que entendés qué es Kubernetes, qué problemas resuelve, qué provee (y qué no), y en qué se diferencia de otras tecnologías.',
      order_index: 2,
      max_score: 32,
      metadata: {
        instructions:
          'Preguntas conceptuales basadas en el overview oficial de Kubernetes: evolución del despliegue, capacidades y límites de la plataforma.',
        suggestedMinutes: 11,
      },
      questions: [
        {
          question_type: 'multiple_choice',
          prompt: '¿Qué es Kubernetes?',
          options: [
            {
              label:
                'Una plataforma portable y extensible para orquestar cargas de trabajo en contenedores, automatizando su despliegue y operación',
              value: 'a',
            },
            {
              label: 'Un hipervisor para crear máquinas virtuales',
              value: 'b',
            },
            {
              label: 'Un lenguaje de programación para microservicios',
              value: 'c',
            },
            {
              label: 'Una herramienta para construir imágenes de contenedores',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'Kubernetes orquesta contenedores: automatiza despliegue, escalado y operación de aplicaciones contenerizadas sobre un clúster de máquinas.',
          points: 4,
          order_index: 1,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            'En la evolución del despliegue de aplicaciones (era tradicional → virtualización → contenedores), ¿qué problema resolvió la virtualización?',
          options: [
            {
              label: 'Eliminó por completo la necesidad de servidores físicos',
              value: 'a',
            },
            {
              label:
                'Permitió correr varias VMs aisladas sobre un mismo servidor físico, mejorando el uso de recursos frente a una app por servidor',
              value: 'b',
            },
            {
              label: 'Hizo que las aplicaciones compartieran el mismo kernel',
              value: 'c',
            },
            {
              label: 'Introdujo los registries de imágenes',
              value: 'd',
            },
          ],
          correct_answer: { value: 'b' },
          explanation:
            'En la era tradicional, una app acaparaba un servidor físico y los recursos se desperdiciaban. La virtualización permitió múltiples VMs aisladas por servidor, con mejor utilización y escalabilidad.',
          points: 4,
          order_index: 2,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Por qué los contenedores se volvieron el estándar para desplegar aplicaciones frente a las VMs?',
          options: [
            {
              label:
                'Porque ofrecen mayor aislamiento de seguridad que las VMs',
              value: 'a',
            },
            {
              label:
                'Porque cada contenedor incluye su propio sistema operativo',
              value: 'b',
            },
            {
              label:
                'Porque son más livianos, arrancan rápido, usan imágenes inmutables y desacoplan la app de la infraestructura',
              value: 'c',
            },
            {
              label: 'Porque solo funcionan en la nube pública',
              value: 'd',
            },
          ],
          correct_answer: { value: 'c' },
          explanation:
            'Los contenedores comparten el kernel del host: son livianos, con builds e imágenes inmutables, despliegues consistentes entre entornos y mayor densidad de aplicaciones por máquina.',
          points: 4,
          order_index: 3,
        },
        {
          question_type: 'multiple_choice',
          prompt: '¿Cuál de estas capacidades provee Kubernetes?',
          options: [
            {
              label: 'Compilación y build automático del código fuente (CI/CD)',
              value: 'a',
            },
            {
              label:
                'Service discovery, balanceo de carga, self-healing, rollouts/rollbacks automatizados y gestión de secrets y configuración',
              value: 'b',
            },
            {
              label: 'Bases de datos y middleware como servicios integrados',
              value: 'c',
            },
            {
              label: 'Un editor visual para diseñar interfaces de usuario',
              value: 'd',
            },
          ],
          correct_answer: { value: 'b' },
          explanation:
            'Kubernetes provee service discovery y load balancing, orquestación de almacenamiento, rollouts/rollbacks automatizados, bin packing, self-healing, gestión de secrets/config y escalado horizontal.',
          points: 4,
          order_index: 4,
        },
        {
          question_type: 'multiple_choice',
          prompt: '¿Qué NO es Kubernetes?',
          options: [
            {
              label: 'Una plataforma extensible mediante APIs declarativas',
              value: 'a',
            },
            {
              label: 'Un orquestador de contenedores multi-nodo',
              value: 'b',
            },
            {
              label: 'Un sistema con self-healing para cargas contenerizadas',
              value: 'c',
            },
            {
              label:
                'Un PaaS tradicional todo-en-uno: no hace CI/CD, ni provee middleware o bases de datos como servicios integrados',
              value: 'd',
            },
          ],
          correct_answer: { value: 'd' },
          explanation:
            'Kubernetes no es un PaaS clásico: no despliega código fuente ni buildea la app, no provee middleware, bases de datos ni pipelines de CI/CD integrados, y no limita los tipos de aplicaciones soportadas.',
          points: 4,
          order_index: 5,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Cuál es la diferencia entre usar Docker solo y usar Kubernetes?',
          options: [
            {
              label:
                'Docker crea y corre contenedores en un host; Kubernetes orquesta contenedores a través de un clúster de nodos: scheduling, escalado y recuperación ante fallos',
              value: 'a',
            },
            {
              label: 'Kubernetes reemplaza a los contenedores por VMs',
              value: 'b',
            },
            {
              label:
                'Docker es para producción y Kubernetes solo para desarrollo local',
              value: 'c',
            },
            {
              label: 'Son productos idénticos de empresas distintas',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'Docker resuelve el empaquetado y ejecución de contenedores en una máquina. Kubernetes opera a nivel clúster: decide dónde corre cada contenedor, escala réplicas y reemplaza instancias caídas.',
          points: 4,
          order_index: 6,
        },
        {
          question_type: 'true_false',
          prompt:
            'Kubernetes reemplaza a los contenedores: con Kubernetes ya no se usan tecnologías como Docker o containerd.',
          correct_answer: { value: false },
          explanation:
            'Kubernetes orquesta contenedores, no los reemplaza: necesita un container runtime (como containerd) en cada nodo para ejecutarlos.',
          points: 4,
          order_index: 7,
        },
        {
          question_type: 'true_false',
          prompt:
            'Si un contenedor falla, Kubernetes puede reiniciarlo o reemplazarlo automáticamente (self-healing).',
          correct_answer: { value: true },
          explanation:
            'El self-healing es una capacidad central: Kubernetes reinicia contenedores que fallan, reemplaza Pods y no enruta tráfico hacia instancias que no están listas.',
          points: 4,
          order_index: 8,
        },
      ],
    },
    {
      slug: 'nivel-3-kubernetes-arquitectura',
      title: 'Nivel 3: Arquitectura de Kubernetes',
      description:
        'Demostrá que conocés los componentes de un clúster: control plane, nodos, kubelet, kube-proxy, container runtime y Pods.',
      order_index: 3,
      max_score: 32,
      metadata: {
        instructions:
          'Preguntas conceptuales basadas en la documentación oficial de arquitectura de clúster de Kubernetes.',
        suggestedMinutes: 12,
      },
      questions: [
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Cuáles son los componentes principales del control plane de Kubernetes?',
          options: [
            {
              label: 'kubelet, kube-proxy y container runtime',
              value: 'a',
            },
            {
              label:
                'kube-apiserver, etcd, kube-scheduler y kube-controller-manager',
              value: 'b',
            },
            {
              label: 'Docker Hub, containerd y CoreDNS',
              value: 'c',
            },
            {
              label: 'Ingress, Service y Deployment',
              value: 'd',
            },
          ],
          correct_answer: { value: 'b' },
          explanation:
            'El control plane gestiona el estado global del clúster: kube-apiserver (API), etcd (almacenamiento), kube-scheduler (asignación de Pods) y kube-controller-manager (controladores). kubelet y kube-proxy corren en los nodos.',
          points: 4,
          order_index: 1,
        },
        {
          question_type: 'multiple_choice',
          prompt: '¿Cuál es el rol del kube-apiserver?',
          options: [
            {
              label:
                'Es el frontend del control plane: expone la API de Kubernetes por la que pasa toda la comunicación del clúster',
              value: 'a',
            },
            {
              label: 'Ejecuta los contenedores en los worker nodes',
              value: 'b',
            },
            {
              label: 'Almacena los datos persistentes de las aplicaciones',
              value: 'c',
            },
            {
              label: 'Distribuye imágenes a los registries',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'El kube-apiserver expone la API HTTP del clúster. kubectl, los nodos y los controladores interactúan con el clúster a través de él; está diseñado para escalar horizontalmente.',
          points: 4,
          order_index: 2,
        },
        {
          question_type: 'multiple_choice',
          prompt: '¿Qué es etcd dentro de un clúster de Kubernetes?',
          options: [
            {
              label: 'El agente que corre en cada nodo worker',
              value: 'a',
            },
            {
              label: 'El componente que balancea el tráfico entre Pods',
              value: 'b',
            },
            {
              label:
                'Un almacén clave-valor consistente y de alta disponibilidad que guarda todo el estado del clúster',
              value: 'c',
            },
            {
              label: 'El sistema de logs centralizado del control plane',
              value: 'd',
            },
          ],
          correct_answer: { value: 'c' },
          explanation:
            'etcd es la fuente de verdad del clúster: un key-value store consistente donde Kubernetes persiste toda su configuración y estado. Por eso requiere backups.',
          points: 4,
          order_index: 3,
        },
        {
          question_type: 'multiple_choice',
          prompt: '¿Qué hace el kube-scheduler?',
          options: [
            {
              label: 'Programa tareas cron dentro de los contenedores',
              value: 'a',
            },
            {
              label:
                'Detecta Pods recién creados sin nodo asignado y elige en qué nodo deben ejecutarse según recursos y restricciones',
              value: 'b',
            },
            {
              label: 'Reinicia los contenedores que fallan en cada nodo',
              value: 'c',
            },
            {
              label: 'Define los horarios de mantenimiento del clúster',
              value: 'd',
            },
          ],
          correct_answer: { value: 'b' },
          explanation:
            'El scheduler decide la asignación Pod → nodo considerando recursos disponibles, afinidades, taints/tolerations y otras restricciones. No ejecuta los contenedores.',
          points: 4,
          order_index: 4,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Qué componentes corren en cada nodo worker y cuál es su función?',
          options: [
            {
              label:
                'etcd para guardar el estado y kube-scheduler para asignar Pods',
              value: 'a',
            },
            {
              label:
                'Solo el container runtime: los nodos no necesitan agentes',
              value: 'b',
            },
            {
              label:
                'kube-controller-manager para reconciliar el estado y kube-apiserver para exponer la API',
              value: 'c',
            },
            {
              label:
                'kubelet (garantiza que los contenedores de los Pods estén corriendo) y kube-proxy (reglas de red para los Services)',
              value: 'd',
            },
          ],
          correct_answer: { value: 'd' },
          explanation:
            'Cada nodo corre kubelet (agente que asegura que los contenedores descritos en los PodSpecs estén sanos y corriendo), kube-proxy (reglas de red para Services) y un container runtime.',
          points: 4,
          order_index: 5,
        },
        {
          question_type: 'multiple_choice',
          prompt: '¿Qué es un Pod?',
          options: [
            {
              label: 'Un nodo físico del clúster',
              value: 'a',
            },
            {
              label:
                'La unidad mínima desplegable en Kubernetes: uno o más contenedores que comparten red y almacenamiento',
              value: 'b',
            },
            {
              label: 'Una copia de seguridad de etcd',
              value: 'c',
            },
            {
              label: 'El archivo YAML donde se define un Deployment',
              value: 'd',
            },
          ],
          correct_answer: { value: 'b' },
          explanation:
            'El Pod es la unidad mínima que Kubernetes despliega y gestiona. Sus contenedores comparten IP, red y volúmenes, y se programan juntos en el mismo nodo.',
          points: 4,
          order_index: 6,
        },
        {
          question_type: 'true_false',
          prompt:
            'El container runtime (por ejemplo, containerd) corre en cada worker node del clúster.',
          correct_answer: { value: true },
          explanation:
            'Cada nodo necesita un container runtime para ejecutar los contenedores de los Pods. Kubernetes se integra con runtimes compatibles con CRI, como containerd o CRI-O.',
          points: 4,
          order_index: 7,
        },
        {
          question_type: 'true_false',
          prompt:
            'El kube-scheduler ejecuta directamente los contenedores en los nodos.',
          correct_answer: { value: false },
          explanation:
            'El scheduler solo decide en qué nodo va cada Pod. La ejecución la realizan el kubelet y el container runtime de ese nodo.',
          points: 4,
          order_index: 8,
        },
      ],
    },
  ],
};
