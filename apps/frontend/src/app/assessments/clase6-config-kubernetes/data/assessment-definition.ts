import type { AssessmentSeedDefinition } from '../../_shared/types';

export const CLASE6_CONFIG_KUBERNETES_SLUG = 'clase6-config-kubernetes';

// Bumpear cuando cambie la definición (secciones/preguntas) para forzar re-seed.
export const CLASE6_CONFIG_KUBERNETES_SEED_VERSION = 1;

// Preguntas, opciones, claves y justificaciones transcritas literalmente del
// banco de preguntas del bootcamp (Clase 6 Configuración en Kubernetes.xlsx).
// La trazabilidad al PDF de origen vive en metadata.paginasPdf de cada pregunta.
export const clase6ConfigKubernetesDefinition: AssessmentSeedDefinition = {
  slug: CLASE6_CONFIG_KUBERNETES_SLUG,
  title: 'Clase 6 — Configuración en Kubernetes',
  description:
    'Evaluación teórica de la Clase 6 del bootcamp: principio de inmutabilidad de la imagen, configuración desacoplada, ConfigMaps, inyección con envFrom, variables de entorno en .NET, Secrets y la ilusión Base64, Helm y el flujo CI/CD de configuración.',
  level: 'Trainee a Junior',
  type: 'Infraestructura',
  duration_minutes: 20,
  total_score: 100,
  is_active: true,
  metadata: {
    moduleName: 'AIQUAA Assessments / Clase 6 Configuración en Kubernetes',
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
      slug: 'inmutabilidad-y-configmaps',
      title: 'Inmutabilidad y ConfigMaps',
      description:
        'Una imagen para todos los entornos, configuración externa al contenedor y qué guarda realmente un ConfigMap.',
      order_index: 1,
      max_score: 40,
      metadata: {
        instructions:
          'Selección múltiple y selección de varias respuestas sobre inmutabilidad y casos de uso de ConfigMap.',
        suggestedMinutes: 8,
      },
      questions: [
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Qué combinación respeta el principio de inmutabilidad presentado?',
          options: [
            {
              label:
                'Usar la misma imagen Docker entre entornos, cambiar la configuración según dev/QA/prod y evitar recompilar por cambios de variables.',
              value: 'a',
            },
            {
              label:
                'Crear una imagen diferente por cada valor de configuración y recompilar ante cualquier cambio.',
              value: 'b',
            },
            {
              label:
                'Mantener idéntica la configuración y modificar el código para distinguir los entornos.',
              value: 'c',
            },
            {
              label:
                'Incluir todas las variables de producción dentro de la imagen de desarrollo.',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'El material establece que la imagen no cambia entre entornos, la configuración sí cambia y no debe recompilarse la imagen por cambios de variables.',
          points: 10,
          order_index: 1,
          metadata: {
            tema: 'Principio de inmutabilidad',
            dificultad: 'Media',
            conceptoEvaluado:
              'Separación entre imagen inmutable y configuración variable',
            paginasPdf: '2',
          },
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Qué caracteriza al paradigma de configuración desacoplada en Kubernetes?',
          options: [
            {
              label:
                'La configuración queda incorporada permanentemente dentro del código de la aplicación.',
              value: 'a',
            },
            {
              label:
                'La configuración es externa al contenedor y Kubernetes la proporciona en tiempo de ejecución.',
              value: 'b',
            },
            {
              label:
                'Cada entorno requiere modificar y recompilar la aplicación.',
              value: 'c',
            },
            {
              label:
                'Los manifiestos sustituyen por completo a la imagen Docker.',
              value: 'd',
            },
          ],
          correct_answer: { value: 'b' },
          explanation:
            'La diapositiva indica que Kubernetes desacopla la aplicación de la configuración y mantiene esta última completamente externa al contenedor.',
          points: 10,
          order_index: 2,
          metadata: {
            tema: 'Configuración desacoplada',
            dificultad: 'Media',
            conceptoEvaluado: 'Externalización de la configuración',
            paginasPdf: '3',
          },
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Para qué tipo de información debe utilizarse un ConfigMap según el material?',
          options: [
            {
              label: 'Exclusivamente para passwords y tokens de autenticación.',
              value: 'a',
            },
            {
              label:
                'Para información no confidencial almacenada como pares clave-valor.',
              value: 'b',
            },
            {
              label:
                'Para cifrar automáticamente credenciales dentro de la imagen.',
              value: 'c',
            },
            {
              label: 'Para reemplazar el código fuente del contenedor.',
              value: 'd',
            },
          ],
          correct_answer: { value: 'b' },
          explanation:
            'El ConfigMap se define como un diccionario de pares clave-valor dentro del clúster y su propósito se limita a información no confidencial.',
          points: 10,
          order_index: 3,
          metadata: {
            tema: 'ConfigMap',
            dificultad: 'Media',
            conceptoEvaluado: 'Propósito y estructura de ConfigMap',
            paginasPdf: '4',
          },
        },
        {
          question_type: 'multiple_select',
          prompt:
            '¿Cuáles de los siguientes son casos de uso reales de ConfigMap mencionados?',
          options: [
            {
              label: 'Cambiar un string sin volver a desplegar la imagen.',
              value: 'a',
            },
            { label: 'Ajustar niveles de log en producción.', value: 'b' },
            { label: 'Configurar endpoints externos.', value: 'c' },
            { label: 'Guardar passwords y variables sensibles.', value: 'd' },
          ],
          correct_answer: { values: ['a', 'b', 'c'] },
          explanation:
            'La diapositiva enumera connection strings, niveles de log y endpoints externos como usos reales; señala como error utilizar ConfigMap para passwords o variables sensibles.',
          points: 10,
          order_index: 4,
          metadata: {
            tema: 'Casos de uso de ConfigMap',
            dificultad: 'Media',
            conceptoEvaluado: 'Aplicaciones prácticas y límites de ConfigMap',
            paginasPdf: '5',
          },
        },
      ],
    },
    {
      slug: 'inyeccion-y-secrets',
      title: 'Inyección de variables y Secrets',
      description:
        'La secuencia de envFrom, el consumo estándar de variables de entorno desde .NET y la ilusión Base64 de los Secrets.',
      order_index: 2,
      max_score: 30,
      metadata: {
        instructions:
          'Selección múltiple sobre inyección de configuración y protección de datos sensibles.',
        suggestedMinutes: 6,
      },
      questions: [
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Cuál secuencia reproduce correctamente el motor de inyección con envFrom? Ten encuenta las clases prácticas de como se aplicó',
          options: [
            {
              label:
                'Se crea el ConfigMap; el Pod recibe la configuración al iniciar; el contenedor se ejecuta con las variables inyectadas, sin modificar la imagen.',
              value: 'a',
            },
            {
              label:
                'El contenedor modifica la imagen; después crea el ConfigMap y finalmente inicia el Pod.',
              value: 'b',
            },
            {
              label:
                'El Pod inicia sin configuración; Kubernetes recompila la imagen y luego crea variables locales.',
              value: 'c',
            },
            {
              label:
                'envFrom cifra las variables, construye una imagen nueva y elimina el ConfigMap.',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'El diagrama muestra tres pasos: crear el ConfigMap, entregar la configuración al Pod durante el inicio y ejecutar el contenedor con las variables inyectadas; Kubernetes no modifica la imagen.',
          points: 10,
          order_index: 1,
          metadata: {
            tema: 'Inyección con envFrom',
            dificultad: 'Extra',
            conceptoEvaluado: 'Secuencia de inyección de variables',
            paginasPdf: '6',
            motivoDificultadExtra:
              'Es Extra porque los distractores alteran el orden y atribuyen a envFrom tareas intuitivas pero incorrectas, como recompilar o modificar la imagen. Exige comprender todo el flujo.',
          },
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Cómo consume una API .NET la configuración inyectada por Kubernetes según el ejemplo?',
          options: [
            {
              label:
                'Mediante variables de entorno incorporadas a la configuración estándar de la aplicación.',
              value: 'a',
            },
            {
              label:
                'Leyendo directamente la API interna de Kubernetes desde cada controlador.',
              value: 'b',
            },
            {
              label:
                'Modificando la imagen Docker cada vez que cambia un ConfigMap.',
              value: 'c',
            },
            {
              label:
                'Convirtiendo automáticamente envFrom en un archivo de código fuente, Program.cs.',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'El material explica que el contenedor no necesita conocer Kubernetes; la API consume variables de entorno de forma estándar mediante AddEnvironmentVariables().',
          points: 10,
          order_index: 2,
          metadata: {
            tema: 'Configuración en API .NET',
            dificultad: 'Media',
            conceptoEvaluado: 'Integración de variables de entorno con .NET',
            paginasPdf: '7',
          },
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Qué afirmación describe correctamente la denominada “ilusión Base64” de los Secrets?',
          options: [
            {
              label:
                'Base64 cifra los datos y los vuelve ilegibles incluso para quien accede al Secret.',
              value: 'a',
            },
            {
              label:
                'Todo Secret está cifrado por defecto y no requiere protección adicional.',
              value: 'b',
            },
            {
              label:
                'Base64 reemplaza la necesidad de aplicar el principio de menor exposición.',
              value: 'c',
            },
            {
              label:
                'Los datos están codificados en Base64, pero no cifrados por defecto; es una capa mínima de protección.',
              value: 'd',
            },
          ],
          correct_answer: { value: 'd' },
          explanation:
            'La diapositiva advierte expresamente que los Secrets se almacenan codificados en Base64, pero no están cifrados por defecto.',
          points: 10,
          order_index: 3,
          metadata: {
            tema: 'Secrets y Base64',
            dificultad: 'Extra',
            conceptoEvaluado: 'Diferencia entre codificación y cifrado',
            paginasPdf: '8',
            motivoDificultadExtra:
              'Es Extra porque aprovecha la interpretación común pero incorrecta de que Base64 equivale a cifrado. Los distractores son plausibles si no se distingue codificación de protección criptográfica.',
          },
        },
      ],
    },
    {
      slug: 'matriz-helm-y-cicd',
      title: 'Matriz de configuración, Helm y CI/CD',
      description:
        'Cuándo elegir ConfigMap o Secret, Helm como plantilla parametrizable y la entrega automatizada de configuración.',
      order_index: 3,
      max_score: 30,
      metadata: {
        instructions:
          'Selección múltiple sobre criterios de elección, charts y arquitectura CI/CD.',
        suggestedMinutes: 6,
      },
      questions: [
        {
          question_type: 'multiple_choice',
          prompt: '¿Cuál comparación coincide con la matriz de configuración?',
          options: [
            {
              label:
                'ConfigMaps: datos críticos en Base64; Secrets: métricas en texto plano.',
              value: 'a',
            },
            {
              label:
                'ConfigMaps: configuración no sensible en texto plano; Secrets: credenciales y datos críticos codificados en Base64.',
              value: 'b',
            },
            {
              label:
                'ConfigMaps y Secrets almacenan exclusivamente contraseñas cifradas.',
              value: 'c',
            },
            {
              label:
                'ConfigMaps y Secrets tienen el mismo rol y el mismo comando de inspección.',
              value: 'd',
            },
          ],
          correct_answer: { value: 'b' },
          explanation:
            'La matriz asocia ConfigMaps con comportamiento, métricas y configuración no sensible en texto plano; Secrets con credenciales y datos críticos codificados en Base64.',
          points: 10,
          order_index: 1,
          metadata: {
            tema: 'ConfigMaps vs. Secrets',
            dificultad: 'Media',
            conceptoEvaluado: 'Criterios para elegir ConfigMap o Secret',
            paginasPdf: '9-10',
          },
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Qué papel cumple Helm en la gestión de configuración presentada?',
          options: [
            {
              label:
                'Centraliza y versiona la configuración, convirtiendo YAML estático en plantillas parametrizables.',
              value: 'a',
            },
            {
              label:
                'Elimina la necesidad de ConfigMaps, Secrets y values.yaml.',
              value: 'b',
            },
            {
              label: 'Obliga a crear una imagen distinta por cada entorno.',
              value: 'c',
            },
            {
              label:
                'Guarda toda la lógica de negocio dentro de los templates.',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'Helm centraliza y versiona la configuración; mediante templates y .Values genera ConfigMaps y Secrets adaptables por entorno desde values.yaml.',
          points: 10,
          order_index: 2,
          metadata: {
            tema: 'Helm y configuración dinámica',
            dificultad: 'Media',
            conceptoEvaluado: 'Charts, values.yaml y renderizado',
            paginasPdf: '11-13',
          },
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Cuál flujo representa la arquitectura final CI/CD mostrada?',
          options: [
            {
              label:
                'El código y el Helm Chart pasan por el servidor de pipeline, que despliega ConfigMaps y Secrets usados por el Pod en el clúster.',
              value: 'a',
            },
            {
              label:
                'El Pod modifica el repositorio y genera manualmente el pipeline después del despliegue.',
              value: 'b',
            },
            {
              label:
                'La configuración se copia dentro de la imagen y evita el uso de Helm.',
              value: 'c',
            },
            {
              label:
                'El pipeline solo almacena logs y no participa en la entrega de configuración.',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'El diagrama muestra el código y Helm Chart pasando por el servidor CI/CD hacia el clúster, donde ConfigMaps y Secrets alimentan al Pod de forma automatizada.',
          points: 10,
          order_index: 3,
          metadata: {
            tema: 'Flujo CI/CD de configuración',
            dificultad: 'Media',
            conceptoEvaluado: 'Entrega automatizada de configuración',
            paginasPdf: '14',
          },
        },
      ],
    },
  ],
};
