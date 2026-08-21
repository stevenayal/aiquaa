import type { AssessmentSeedDefinition } from '../../_shared/types';

export const CLASE7_8_SEQ_LOGGING_SLUG = 'clase7-8-seq-logging';

// Bumpear cuando cambie la definición (secciones/preguntas) para forzar re-seed.
export const CLASE7_8_SEQ_LOGGING_SEED_VERSION = 1;

// Preguntas, opciones, claves y justificaciones transcritas literalmente del
// banco de preguntas del bootcamp (Clases 7 y 8 SEQ Structured Logging.xlsx).
// La trazabilidad al PDF de origen vive en metadata.paginasPdf de cada pregunta.
export const clase78SeqLoggingDefinition: AssessmentSeedDefinition = {
  slug: CLASE7_8_SEQ_LOGGING_SLUG,
  title: 'Clases 7 y 8 — SEQ Structured Logging',
  description:
    'Evaluación teórica de las Clases 7 y 8 del bootcamp: diagnóstico en sistemas distribuidos, límites de kubectl logs, efimeridad de los logs del Pod, logs estructurados, Serilog y su pipeline de sinks, niveles de severidad, Seq como receptor central y su despliegue en Kubernetes.',
  level: 'Trainee a Junior',
  type: 'Observabilidad',
  duration_minutes: 20,
  total_score: 100,
  is_active: true,
  metadata: {
    moduleName: 'AIQUAA Assessments / Clases 7 y 8 SEQ Structured Logging',
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
      slug: 'diagnostico-y-limites',
      title: 'Diagnóstico en producción y límites de kubectl logs',
      description:
        'Por qué el logging centralizado es indispensable, qué no permite kubectl logs, la efimeridad del log del Pod y el diseño de logs estructurados.',
      order_index: 1,
      max_score: 40,
      metadata: {
        instructions:
          'Selección múltiple sobre las limitaciones del diagnóstico local y el cambio de paradigma hacia logs como datos.',
        suggestedMinutes: 8,
      },
      questions: [
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Qué conclusión presenta el material sobre el diagnóstico de un sistema distribuido bajo estrés o con un error crítico?',
          options: [
            {
              label:
                'Los logs locales de un único pod permiten reconstruir siempre todo el incidente.',
              value: 'a',
            },
            {
              label:
                'Sin logging centralizado, el diagnóstico resulta imposible.',
              value: 'b',
            },
            {
              label:
                'La correlación entre servicios deja de ser necesaria cuando existen varios pods.',
              value: 'c',
            },
            {
              label:
                'Registrar únicamente los errores críticos resuelve todos los desafíos de observabilidad.',
              value: 'd',
            },
          ],
          correct_answer: { value: 'b' },
          explanation:
            'La diapositiva vincula el escenario real de producción con múltiples pods, requests fallidas, errores específicos y correlación entre servicios, y concluye que sin logging centralizado el diagnóstico es imposible.',
          points: 10,
          order_index: 1,
          metadata: {
            tema: 'Diagnóstico en producción',
            dificultad: 'Media',
            conceptoEvaluado:
              'Necesidad de logging centralizado en sistemas distribuidos',
            paginasPdf: '2',
          },
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Cuál conjunto de actividades aparece como posibles bloqueantes o no permitido al depender únicamente de kubectl logs?',
          options: [
            {
              label:
                'Acceder a un pod específico y a un contenedor específico.',
              value: 'a',
            },
            {
              label:
                'Visualizar stdout de un contenedor y hacer debugging puntual.',
              value: 'b',
            },
            {
              label:
                'Consultar los logs de una instancia concreta durante su ejecución.',
              value: 'c',
            },
            {
              label:
                'Realizar búsquedas globales, filtrar por request, usuario o error y correlacionar eventos.',
              value: 'd',
            },
          ],
          correct_answer: { value: 'd' },
          explanation:
            'El material permite consultar un pod o contenedor específico, pero marca como bloqueadas las búsquedas globales, los filtros por request, usuario o error y la correlación entre eventos.',
          points: 10,
          order_index: 2,
          metadata: {
            tema: 'Límites de kubectl logs',
            dificultad: 'Media',
            conceptoEvaluado: 'Alcance operativo de kubectl logs',
            paginasPdf: '3',
          },
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Por qué los logs de los pods son efímeros por naturaleza según el PDF?',
          options: [
            {
              label:
                'Porque se almacenan en el contenedor y se pierden cuando el pod se reinicia o es eliminado.',
              value: 'a',
            },
            {
              label:
                'Porque Kubernetes los convierte automáticamente en métricas y elimina el texto original.',
              value: 'b',
            },
            {
              label:
                'Porque cada nodo centraliza de forma permanente todos los logs del clúster.',
              value: 'c',
            },
            {
              label:
                'Porque los logs solo existen cuando se consulta el dashboard web de Seq.',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'La diapositiva explica que los logs son temporales y locales, se almacenan en el contenedor y se pierden al reiniciarse o eliminarse el pod.',
          points: 10,
          order_index: 3,
          metadata: {
            tema: 'Efimeridad de los logs',
            dificultad: 'Media',
            conceptoEvaluado: 'Temporalidad y pérdida de logs locales',
            paginasPdf: '4',
          },
        },
        {
          question_type: 'multiple_choice',
          prompt:
            'Si se quiere buscar en el futuro por transactionId o userId y analizar eventos de varios pods, ¿qué diseño sigue completamente la recomendación del material?',
          options: [
            {
              label:
                'Escribir texto libre orientado a lectura humana y conservarlo solamente dentro de cada pod.',
              value: 'a',
            },
            {
              label:
                'Generar mensajes JSON, pero colocar todos los datos dentro de una única cadena de texto y mantenerlos localmente.',
              value: 'b',
            },
            {
              label:
                'Registrar eventos en JSON con propiedades clave-valor y centralizarlos fuera del pod para análisis automático.',
              value: 'c',
            },
            {
              label:
                'Usar propiedades clave-valor, pero descartar la centralización porque kubectl logs ofrece búsquedas globales.',
              value: 'd',
            },
          ],
          correct_answer: { value: 'c' },
          explanation:
            'El cambio de paradigma propone JSON con pares clave-valor, pensado para análisis automático, y recomienda diseñar los logs como datos, prever búsquedas futuras y centralizarlos fuera del pod.',
          points: 10,
          order_index: 4,
          metadata: {
            tema: 'Logs estructurados',
            dificultad: 'Extra',
            conceptoEvaluado: 'Diseño de logs como datos estructurados',
            paginasPdf: '5',
            motivoDificultadExtra:
              'Es Extra porque los distractores combinan rasgos parcialmente correctos —JSON, propiedades o lectura humana— con errores comunes como encapsular los datos en texto libre, mantenerlos solo en el pod o asumir búsquedas globales en kubectl logs.',
          },
        },
      ],
    },
    {
      slug: 'serilog-sinks-y-severidad',
      title: 'Serilog: sinks, enriquecimiento y severidad',
      description:
        'Las capacidades de Serilog, el destino de cada sink y la clasificación correcta de los niveles de severidad.',
      order_index: 2,
      max_score: 30,
      metadata: {
        instructions:
          'Selección múltiple y selección de varias respuestas sobre la biblioteca de logging y sus niveles.',
        suggestedMinutes: 6,
      },
      questions: [
        {
          question_type: 'multiple_select',
          prompt:
            '¿Cuáles características de Serilog se mencionan explícitamente en el material?',
          options: [
            {
              label: 'Se integra al pipeline de ASP.NET Core desde el inicio.',
              value: 'a',
            },
            {
              label:
                'Restringe el envío de logs a archivos almacenados dentro del contenedor.',
              value: 'b',
            },
            {
              label: 'Permite enriquecer los logs con contexto de ejecución.',
              value: 'c',
            },
            {
              label:
                'Admite múltiples destinos y está diseñado para stdout y Kubernetes.',
              value: 'd',
            },
          ],
          correct_answer: { values: ['a', 'c', 'd'] },
          explanation:
            'La diapositiva presenta integración nativa con ASP.NET Core, enriquecimiento con contexto, múltiples destinos y compatibilidad con contenedores mediante stdout y Kubernetes. No limita los logs a archivos locales.',
          points: 10,
          order_index: 1,
          metadata: {
            tema: 'Capacidades de Serilog',
            dificultad: 'Media',
            conceptoEvaluado:
              'Integración, enriquecimiento y destinos de Serilog',
            paginasPdf: '6',
          },
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Qué sink se asocia en el PDF con centralización y análisis avanzado?',
          options: [
            { label: 'HTTP (Seq).', value: 'a' },
            { label: 'Archivo local.', value: 'b' },
            { label: 'Consola (stdout).', value: 'c' },
            { label: 'kubectl logs como repositorio permanente.', value: 'd' },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'El pipeline de sinks asigna la consola a la visualización con kubectl logs, el archivo a persistencia local y HTTP (Seq) a centralización y análisis avanzado.',
          points: 10,
          order_index: 2,
          metadata: {
            tema: 'Pipeline de sinks',
            dificultad: 'Media',
            conceptoEvaluado: 'Destino y propósito de los sinks',
            paginasPdf: '7',
          },
        },
        {
          question_type: 'multiple_choice',
          prompt:
            'La aplicación continúa funcionando, pero ocurre una situación anómala que debe quedar registrada. ¿Qué nivel corresponde según el termómetro de severidad?',
          options: [
            {
              label:
                'Fatal, porque toda anomalía implica la caída de la aplicación.',
              value: 'a',
            },
            {
              label:
                'Error, porque cualquier comportamiento no normal debe clasificarse como fallo.',
              value: 'b',
            },
            {
              label:
                'Warning, porque el material lo reserva para situaciones anómalas.',
              value: 'c',
            },
            {
              label:
                'Information, porque la aplicación todavía mantiene su flujo normal.',
              value: 'd',
            },
          ],
          correct_answer: { value: 'c' },
          explanation:
            'El termómetro clasifica Fatal como caída de la aplicación, Error como fallos, Warning como situaciones anómalas e Information como flujo normal.',
          points: 10,
          order_index: 3,
          metadata: {
            tema: 'Niveles de severidad',
            dificultad: 'Extra',
            conceptoEvaluado: 'Clasificación correcta de severidad',
            paginasPdf: '8',
            motivoDificultadExtra:
              'Es Extra porque obliga a distinguir entre tres niveles cercanos. Los distractores aprovechan asociaciones intuitivas pero incorrectas: equiparar toda anomalía con un fallo, una caída o un flujo normal por el solo hecho de que la aplicación siga activa.',
          },
        },
      ],
    },
    {
      slug: 'seq-y-observabilidad',
      title: 'Seq y arquitectura de observabilidad',
      description:
        'Seq como servidor central de logs, el flujo completo desde la API hasta el dashboard y su despliegue persistente en el clúster.',
      order_index: 3,
      max_score: 30,
      metadata: {
        instructions:
          'Selección múltiple sobre centralización, arquitectura y despliegue de Seq.',
        suggestedMinutes: 6,
      },
      questions: [
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Qué beneficio de Seq destaca el material frente a los logs planos?',
          options: [
            {
              label:
                'Convierte todos los eventos en texto libre sin propiedades para simplificar la lectura.',
              value: 'a',
            },
            {
              label:
                'Centraliza datos estructurados y permite búsquedas por dimensiones, filtros avanzados y propiedades.',
              value: 'b',
            },
            {
              label:
                'Sustituye a Serilog y recibe únicamente archivos locales de cada pod.',
              value: 'c',
            },
            {
              label:
                'Elimina la necesidad de correlacionar eventos en sistemas distribuidos.',
              value: 'd',
            },
          ],
          correct_answer: { value: 'b' },
          explanation:
            'Seq se presenta como servidor central de logs para sistemas distribuidos; trabaja con datos estructurados y ofrece búsquedas por dimensiones, filtros avanzados y propiedades.',
          points: 10,
          order_index: 1,
          metadata: {
            tema: 'Seq como receptor central',
            dificultad: 'Media',
            conceptoEvaluado: 'Centralización y análisis dinámico con Seq',
            paginasPdf: '9',
          },
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Cuál secuencia representa la arquitectura conceptual de observabilidad mostrada?',
          options: [
            {
              label: 'Dashboard web → Seq → Serilog → pods de la API .NET.',
              value: 'a',
            },
            {
              label:
                'Pods de la API .NET → Serilog → Seq mediante HTTP → dashboard web.',
              value: 'b',
            },
            {
              label:
                'Pods de la API .NET → dashboard web → archivo local → Seq.',
              value: 'c',
            },
            {
              label: 'Serilog → dashboard web → pods de la API .NET → Seq.',
              value: 'd',
            },
          ],
          correct_answer: { value: 'b' },
          explanation:
            'El diagrama muestra múltiples instancias de la API .NET emitiendo logs estructurados mediante Serilog, Seq recibiéndolos por HTTP y el dashboard web permitiendo su análisis y visualización.',
          points: 10,
          order_index: 2,
          metadata: {
            tema: 'Arquitectura de observabilidad',
            dificultad: 'Media',
            conceptoEvaluado:
              'Flujo de logs desde la API hasta la visualización',
            paginasPdf: '10',
          },
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Qué configuración reúne el blueprint de despliegue y el desafío práctico propuestos?',
          options: [
            {
              label:
                'Ejecutar Seq fuera de Kubernetes, exponerlo públicamente y guardar los logs solo en el contenedor.',
              value: 'a',
            },
            {
              label:
                'Desplegar Seq en Minikube sin Service, conectar la API por archivos y omitir la persistencia.',
              value: 'b',
            },
            {
              label:
                'Usar kubectl logs como almacenamiento central y analizar los eventos sin Seq ni Serilog.',
              value: 'c',
            },
            {
              label:
                'Desplegar Seq como pod en Minikube, recibir por un Service HTTP interno, persistir con volumen y conectar la API mediante Serilog.',
              value: 'd',
            },
          ],
          correct_answer: { value: 'd' },
          explanation:
            'El blueprint indica Seq como pod, un Service para recepción HTTP interna y un volumen para persistir entre reinicios; el desafío práctico añade su despliegue en Minikube y la conexión de la API .NET mediante Serilog.',
          points: 10,
          order_index: 3,
          metadata: {
            tema: 'Despliegue y práctica en Kubernetes',
            dificultad: 'Media',
            conceptoEvaluado: 'Despliegue interno y persistente de Seq',
            paginasPdf: '11-12',
          },
        },
      ],
    },
  ],
};
