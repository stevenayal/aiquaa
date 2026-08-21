import type { AssessmentSeedDefinition } from '../../_shared/types';

export const KUBERNETES_ORCHESTRATION_FUNDAMENTALS_SLUG =
  'kubernetes-orchestration-fundamentals';

// Bumpear cuando cambie la definición (secciones/preguntas) para forzar re-seed.
export const KUBERNETES_ORCHESTRATION_FUNDAMENTALS_SEED_VERSION = 1;

export const kubernetesOrchestrationFundamentalsDefinition: AssessmentSeedDefinition =
  {
    slug: KUBERNETES_ORCHESTRATION_FUNDAMENTALS_SLUG,
    title: 'Kubernetes — Fundamentos de Orquestación',
    description:
      'Evaluación teórica de Kubernetes para el grupo de desarrollo: propósito de la plataforma, pilares de la orquestación (alta disponibilidad, escalado, autorecuperación), arquitectura Scheduler/Kubelet, entorno local vs. producción, ciclo de vida de los Pods, el paradigma declarativo, y las responsabilidades de Deployment, ReplicaSet, StatefulSet, Service y el resto del ecosistema.',
    level: 'Trainee a Junior',
    type: 'Desarrollo DevOps',
    duration_minutes: 20,
    total_score: 100,
    is_active: true,
    metadata: {
      moduleName: 'AIQUAA Assessments / Kubernetes Orchestration Fundamentals',
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
        slug: 'fundamentos-y-arquitectura',
        title: 'Fundamentos y arquitectura',
        description:
          'Qué es Kubernetes, los tres pilares de la orquestación, cómo se reparten responsabilidades el Scheduler y el Kubelet, y la diferencia entre un entorno local (Minikube/Kind) y producción.',
        order_index: 1,
        max_score: 42,
        metadata: {
          instructions:
            'Selección múltiple (una o varias respuestas correctas según se indique) basada en "Clase 5 - Kubernetes.pdf".',
          suggestedMinutes: 8,
        },
        questions: [
          {
            question_type: 'multiple_choice',
            prompt: '¿Cómo define el material a Kubernetes?',
            options: [
              {
                label:
                  'Como una plataforma de código abierto para automatizar el despliegue, escalado y gestión de aplicaciones en contenedores.',
                value: 'a',
              },
              {
                label:
                  'Como una herramienta destinada exclusivamente a crear imágenes de contenedores.',
                value: 'b',
              },
              {
                label:
                  'Como un sistema operativo completo para reemplazar servidores físicos.',
                value: 'c',
              },
              {
                label: 'Como un lenguaje para programar APIs y microservicios.',
                value: 'd',
              },
            ],
            correct_answer: { value: 'a' },
            explanation:
              'La diapositiva define Kubernetes como una plataforma de código abierto que automatiza el despliegue, el escalado y la gestión de aplicaciones en contenedores.',
            points: 8,
            order_index: 1,
          },
          {
            question_type: 'multi_select',
            prompt:
              '¿Cuáles de las siguientes capacidades forman parte de los tres pilares de la orquestación presentados?',
            options: [
              {
                label:
                  'Alta disponibilidad mediante replicación y balanceo constante.',
                value: 'a',
              },
              {
                label:
                  'Escalado dinámico que agrega o reduce réplicas de Pods según la demanda.',
                value: 'b',
              },
              {
                label:
                  'Autorecuperación que detecta Pods fallidos y reinicia contenedores.',
                value: 'c',
              },
              {
                label:
                  'Recuperación exclusivamente manual ante cualquier fallo.',
                value: 'd',
              },
            ],
            correct_answer: { values: ['a', 'b', 'c'] },
            explanation:
              'El material identifica como pilares la alta disponibilidad, el escalado dinámico y la autorecuperación; la intervención exclusivamente manual contradice esas capacidades.',
            points: 8,
            order_index: 2,
          },
          {
            question_type: 'multiple_choice',
            prompt:
              '¿Cuál asignación de responsabilidades coincide con la arquitectura base mostrada?',
            options: [
              {
                label:
                  'El Kubelet decide el nodo de ejecución y el Scheduler mantiene los contenedores en funcionamiento.',
                value: 'a',
              },
              {
                label:
                  'El Scheduler decide en qué nodo se ejecuta la aplicación y el Kubelet asegura que los contenedores sigan corriendo.',
                value: 'b',
              },
              {
                label:
                  'El Scheduler almacena volúmenes y el Kubelet expone servicios externos.',
                value: 'c',
              },
              {
                label:
                  'El Scheduler y el Kubelet son dos tipos de Pod con la misma función.',
                value: 'd',
              },
            ],
            correct_answer: { value: 'b' },
            explanation:
              'El Scheduler evalúa y decide el nodo exacto de ejecución; el Kubelet es el agente del nodo que se comunica con el plano de control y asegura que los contenedores continúen corriendo.',
            points: 8,
            order_index: 3,
          },
          {
            question_type: 'multiple_choice',
            prompt:
              '¿Cuál comparación reproduce correctamente el uso de Minikube/Kind y el entorno de producción?',
            options: [
              {
                label:
                  'Minikube/Kind: entorno local de un solo nodo para aprendizaje y pruebas; producción: múltiples nodos distribuidos para alta disponibilidad y escalado masivo.',
                value: 'a',
              },
              {
                label:
                  'Minikube/Kind: múltiples nodos físicos para alta disponibilidad; producción: una máquina virtual local para pruebas.',
                value: 'b',
              },
              {
                label:
                  'Minikube/Kind y producción: ambos se limitan a un único nodo y persiguen exclusivamente fines educativos.',
                value: 'c',
              },
              {
                label:
                  'Minikube/Kind: entorno cloud obligatorio; producción: laptop local sin nodos distribuidos.',
                value: 'd',
              },
            ],
            correct_answer: { value: 'a' },
            explanation:
              'Minikube/Kind es un entorno local de un solo nodo para aprendizaje, desarrollo y pruebas, mientras producción utiliza múltiples nodos físicos o cloud para alta disponibilidad y escalado masivo. Es Extra porque los distractores intercambian entorno, cantidad de nodos y propósito: exige relacionar correctamente las tres dimensiones, no solo reconocer los nombres.',
            points: 18,
            order_index: 4,
          },
        ],
      },
      {
        slug: 'ciclo-de-vida-y-paradigma-declarativo',
        title: 'Ciclo de vida y paradigma declarativo',
        description:
          'Por qué un Pod suelto no alcanza en producción, qué significa el paradigma declarativo, cómo se reparten Deployment y ReplicaSet el trabajo, y cuándo conviene un StatefulSet.',
        order_index: 2,
        max_score: 42,
        metadata: {
          instructions:
            'Selección múltiple basada en "Clase 5 - Kubernetes.pdf".',
          suggestedMinutes: 8,
        },
        questions: [
          {
            question_type: 'multiple_choice',
            prompt:
              '¿Por qué el material indica que un Pod suelto no debe utilizarse solo en producción?',
            options: [
              {
                label: 'Porque un Pod no puede contener más de un contenedor.',
                value: 'a',
              },
              {
                label:
                  'Porque los contenedores de un mismo Pod no pueden comunicarse.',
                value: 'b',
              },
              {
                label:
                  'Porque un Pod suelto no se recrea automáticamente si falla.',
                value: 'c',
              },
              {
                label:
                  'Porque Kubernetes administra contenedores directamente y no reconoce Pods.',
                value: 'd',
              },
            ],
            correct_answer: { value: 'c' },
            explanation:
              'El material señala como limitación crítica que los Pods sueltos no se recrean automáticamente cuando fallan y, por ello, no deben usarse solos en producción.',
            points: 8,
            order_index: 1,
          },
          {
            question_type: 'multiple_choice',
            prompt: '¿Qué describe el paradigma declarativo presentado?',
            options: [
              {
                label:
                  'El manifiesto explica paso a paso cómo ejecutar cada operación manual.',
                value: 'a',
              },
              {
                label:
                  'El manifiesto describe el estado deseado y Kubernetes ajusta la realidad para que coincida con esa intención.',
                value: 'b',
              },
              {
                label:
                  'El manifiesto solo documenta el estado actual sin provocar cambios.',
                value: 'c',
              },
              {
                label:
                  'Kubernetes ignora el manifiesto y conserva siempre el estado existente.',
                value: 'd',
              },
            ],
            correct_answer: { value: 'b' },
            explanation:
              'El manifiesto YAML describe el qué, no el cómo; el orquestador compara el estado actual con la intención declarada y realiza los cambios necesarios.',
            points: 8,
            order_index: 2,
          },
          {
            question_type: 'multiple_choice',
            prompt:
              '¿Cuál relación entre Deployment y ReplicaSet coincide con el bucle de autorecuperación y escalado?',
            options: [
              {
                label:
                  'ReplicaSet gestiona versiones y rollbacks; Deployment solo documenta el número de réplicas.',
                value: 'a',
              },
              {
                label:
                  'Deployment y ReplicaSet son Services usados para exponer Pods.',
                value: 'b',
              },
              {
                label:
                  'Deployment se limita a crear un único Pod y ReplicaSet administra nodos físicos.',
                value: 'c',
              },
              {
                label:
                  'Deployment define el estado deseado, versiones, rollbacks y rolling updates; ReplicaSet asegura el número exacto de réplicas de Pods.',
                value: 'd',
              },
            ],
            correct_answer: { value: 'd' },
            explanation:
              'El Deployment gestiona el estado deseado, versiones, rollbacks y rolling updates; el ReplicaSet es su motor interno y mantiene el número exacto de réplicas. Es Extra porque los distractores trasladan funciones reales entre Deployment, ReplicaSet, Service y nodo: la respuesta requiere distinguir coordinación de versiones frente a mantenimiento de réplicas.',
            points: 18,
            order_index: 3,
          },
          {
            question_type: 'multiple_choice',
            prompt:
              '¿Qué controlador recomienda la matriz para bases de datos que necesitan identidad predecible y volúmenes estables?',
            options: [
              { label: 'Deployment', value: 'a' },
              { label: 'StatefulSet', value: 'b' },
              { label: 'DaemonSet', value: 'c' },
              { label: 'NodePort', value: 'd' },
            ],
            correct_answer: { value: 'b' },
            explanation:
              'La matriz asocia StatefulSet con identidad única y predecible, volúmenes estables entre reinicios y casos como PostgreSQL, MongoDB y Kafka.',
            points: 8,
            order_index: 4,
          },
        ],
      },
      {
        slug: 'red-y-ecosistema',
        title: 'Red y ecosistema',
        description:
          'Cómo resuelve un Service la naturaleza efímera de los Pods, y cómo se integran Service, Deployment, StatefulSet, DaemonSet y NodePort en el ecosistema de Kubernetes.',
        order_index: 3,
        max_score: 16,
        metadata: {
          instructions:
            'Selección múltiple basada en "Clase 5 - Kubernetes.pdf".',
          suggestedMinutes: 4,
        },
        questions: [
          {
            question_type: 'multiple_choice',
            prompt:
              '¿Qué problema resuelve un Service frente a la naturaleza efímera de los Pods?',
            options: [
              {
                label: 'Convierte cada Pod en un nodo físico independiente.',
                value: 'a',
              },
              {
                label:
                  'Proporciona una IP estable y balanceo interno aunque cambien las IPs de los Pods.',
                value: 'b',
              },
              {
                label:
                  'Reemplaza todos los controladores y mantiene volúmenes persistentes.',
                value: 'c',
              },
              {
                label: 'Evita que los Pods puedan escalar o reiniciarse.',
                value: 'd',
              },
            ],
            correct_answer: { value: 'b' },
            explanation:
              'Las IPs de los Pods cambian por ser efímeras, mientras el Service aporta una IP estable y balanceo interno.',
            points: 8,
            order_index: 1,
          },
          {
            question_type: 'multiple_choice',
            prompt:
              '¿Cuál conjunto de asociaciones coincide con la síntesis del ecosistema?',
            options: [
              {
                label:
                  'NodePort para tráfico externo; Service para enrutamiento estable; Deployment para escalabilidad sin estado; StatefulSet para persistencia e identidad; DaemonSet para monitoreo global.',
                value: 'a',
              },
              {
                label:
                  'StatefulSet para tráfico externo; NodePort para persistencia; DaemonSet para escalado sin estado.',
                value: 'b',
              },
              {
                label:
                  'Deployment para identidad estable; Service para un Pod por nodo; DaemonSet para bases de datos.',
                value: 'c',
              },
              {
                label:
                  'Todos los componentes cumplen la misma función y pueden intercambiarse sin efectos.',
                value: 'd',
              },
            ],
            correct_answer: { value: 'a' },
            explanation:
              'La síntesis rotula NodePort como entrada de tráfico externo, Service como enrutamiento estable, Deployment como escalabilidad sin estado, StatefulSet como persistencia e identidad y DaemonSet como monitoreo global.',
            points: 8,
            order_index: 2,
          },
        ],
      },
    ],
  };
