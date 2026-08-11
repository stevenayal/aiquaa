import type { AssessmentSeedDefinition } from '../../_shared/types';

export const OBSERVABILITY_FUNDAMENTALS_SLUG = 'observability-fundamentals';

// Bumpear cuando cambie la definición (secciones/preguntas) para forzar re-seed.
export const OBSERVABILITY_FUNDAMENTALS_SEED_VERSION = 1;

export const observabilityFundamentalsDefinition: AssessmentSeedDefinition = {
  slug: OBSERVABILITY_FUNDAMENTALS_SLUG,
  title: 'Observabilidad — Fundamentos',
  description:
    'Evaluación teórica de observabilidad para bootcamp de desarrollo backend: logging estructurado con Serilog, centralización de logs en Seq sobre Kubernetes, uso correcto de niveles de log, y visualización/consulta de logs para diagnosticar problemas en producción.',
  level: 'Trainee a Junior',
  type: 'Desarrollo DevOps',
  duration_minutes: 40,
  total_score: 100,
  is_active: true,
  metadata: {
    moduleName: 'AIQUAA Assessments / Observability Fundamentals',
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
      slug: 'logging-estructurado',
      title: 'Logging estructurado',
      description:
        'Qué es el logging estructurado, cómo lo implementa Serilog con templates y properties, y por qué es superior al texto libre.',
      order_index: 1,
      max_score: 32,
      metadata: {
        instructions:
          'Selección múltiple y verdadero/falso sobre logging estructurado con Serilog en aplicaciones .NET.',
        suggestedMinutes: 13,
      },
      questions: [
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Qué es "logging estructurado" y en qué se diferencia de simplemente escribir texto libre en el log?',
          options: [
            {
              label:
                'El logging estructurado adjunta a cada evento propiedades como pares clave-valor (por ejemplo UserId, StatusCode) en vez de solo un mensaje de texto plano, permitiendo buscar y filtrar por esos campos en el sistema de logs',
              value: 'a',
            },
            {
              label: 'Es simplemente escribir los logs en mayúsculas',
              value: 'b',
            },
            {
              label:
                'Es un sinónimo de guardar los logs en una base de datos SQL',
              value: 'c',
            },
            {
              label: 'No existe ninguna diferencia real con el texto libre',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'La diferencia clave es que el dato queda como campo consultable (UserId=123), no enterrado dentro de una cadena de texto que hay que parsear con expresiones regulares para extraer información.',
          points: 4,
          order_index: 1,
        },
        {
          question_type: 'multiple_choice',
          prompt: '¿Qué es Serilog?',
          options: [
            {
              label:
                'Una librería de logging para .NET orientada a logging estructurado, que soporta múltiples destinos (sinks) configurables para enviar los eventos de log',
              value: 'a',
            },
            {
              label: 'Un servicio en la nube exclusivo de Microsoft Azure',
              value: 'b',
            },
            { label: 'Un ORM para acceso a bases de datos', value: 'c' },
            { label: 'Un framework de testing unitario', value: 'd' },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'Serilog es una de las librerías de logging más usadas en el ecosistema .NET precisamente por su soporte de primera clase para eventos estructurados y su ecosistema de sinks (Console, File, Seq, Elasticsearch, etc.).',
          points: 4,
          order_index: 2,
        },
        {
          question_type: 'multiple_choice',
          prompt: 'En Serilog, ¿qué es un "sink"?',
          options: [
            {
              label:
                'El destino al que se escriben los eventos de log (por ejemplo consola, archivo, Seq, Elasticsearch); una aplicación puede configurar varios sinks al mismo tiempo',
              value: 'a',
            },
            { label: 'Un tipo de excepción especial de .NET', value: 'b' },
            { label: 'El nivel mínimo de severidad de un log', value: 'c' },
            { label: 'Un middleware de autenticación', value: 'd' },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'Es común configurar múltiples sinks a la vez, por ejemplo Console para ver logs en desarrollo local y Seq para centralizarlos en un ambiente compartido, todo desde la misma configuración de Serilog.',
          points: 4,
          order_index: 3,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Qué ventaja tiene escribir `Log.Information("Usuario {UserId} inició sesión", userId)` en vez de `Log.Information($"Usuario {userId} inició sesión")`?',
          options: [
            {
              label:
                'La primera forma preserva UserId como una propiedad estructurada y buscable en el backend de logs; la segunda ya interpoló el valor dentro del string, perdiendo esa estructura',
              value: 'a',
            },
            {
              label:
                'No hay ninguna diferencia, ambas producen el mismo resultado',
              value: 'b',
            },
            {
              label:
                'La segunda forma es más rápida en tiempo de ejecución siempre',
              value: 'c',
            },
            {
              label: 'La primera forma solo funciona con niveles Error',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'Con el template de mensaje ({UserId}), Serilog captura el valor como propiedad estructurada además de renderizarlo en el texto. La interpolación de C# ($"...") solo produce un string final, sin metadata para el sink.',
          points: 4,
          order_index: 4,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Qué es el "enrichment" (enriquecimiento) de logs en Serilog?',
          options: [
            {
              label:
                'Agregar automáticamente propiedades contextuales a cada evento de log (por ejemplo ambiente, nombre de máquina, o un correlation/request id) sin tener que pasarlas manualmente en cada llamado a Log.Information',
              value: 'a',
            },
            {
              label: 'Traducir los mensajes de log a otros idiomas',
              value: 'b',
            },
            {
              label: 'Comprimir los archivos de log para ahorrar espacio',
              value: 'c',
            },
            {
              label: 'Cifrar el contenido de los logs automáticamente',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'Los enrichers se configuran una vez (por ejemplo con middlewares o `.Enrich.With...`) y agregan contexto a todos los logs generados durante ese scope, evitando repetir código en cada punto de logging.',
          points: 4,
          order_index: 5,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Por qué es valioso incluir un correlationId (o requestId) en cada log generado durante una request HTTP?',
          options: [
            {
              label:
                'Permite reconstruir toda la secuencia de eventos de log relacionados a una request específica, incluso a través de múltiples servicios, facilitando enormemente el debugging',
              value: 'a',
            },
            {
              label:
                'Es un requisito obligatorio de ASP.NET Core sin el cual la app no arranca',
              value: 'b',
            },
            {
              label: 'Reemplaza la necesidad de tener niveles de log',
              value: 'c',
            },
            { label: 'Sirve únicamente para cumplir con GDPR', value: 'd' },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'Sin un identificador común, los logs de una misma request quedan mezclados entre sí y con los de otras requests concurrentes. El correlationId permite filtrar "todo lo que pasó durante esta request" con una sola búsqueda.',
          points: 4,
          order_index: 6,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Qué problema genera loggear información sensible (contraseñas, tokens completos, números de tarjeta) como propiedad estructurada?',
          options: [
            {
              label:
                'Esa información queda almacenada en el sistema de logs, a veces durante meses, expuesta a cualquiera con acceso a esos logs; los datos sensibles deben enmascararse u omitirse antes de loggear',
              value: 'a',
            },
            {
              label:
                'Serilog rechaza automáticamente loggear cualquier dato sensible',
              value: 'b',
            },
            {
              label: 'No hay ningún problema, para eso existen los logs',
              value: 'c',
            },
            {
              label:
                'Solo afecta el rendimiento de la aplicación, no la seguridad',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'Los logs suelen tener retención larga y ser accedidos por más personas que la base de datos de producción. Loggear un dato sensible es, en la práctica, otra forma de exponerlo, igual de grave que hardcodearlo en el código.',
          points: 4,
          order_index: 7,
        },
        {
          question_type: 'true_false',
          prompt:
            'El logging estructurado permite realizar consultas como "todos los logs donde UserId=123 y StatusCode>=500" directamente sobre las propiedades, sin depender de expresiones regulares sobre texto libre.',
          correct_answer: { value: true },
          explanation:
            'Esa es la ventaja central: como UserId y StatusCode son propiedades reales del evento (no texto embebido), un backend de logs estructurado puede indexarlas y consultarlas como si fueran columnas de una base de datos.',
          points: 4,
          order_index: 8,
        },
      ],
    },
    {
      slug: 'centralizacion-de-logs',
      title: 'Centralización de logs',
      description:
        'Por qué centralizar logs de múltiples réplicas en Kubernetes y cómo Serilog envía eventos a un servidor Seq.',
      order_index: 2,
      max_score: 24,
      metadata: {
        instructions:
          'Preguntas sobre centralización de logs con Seq en un entorno con múltiples réplicas/Pods.',
        suggestedMinutes: 10,
      },
      questions: [
        {
          question_type: 'multiple_choice',
          prompt:
            'Una API corre replicada en varios Pods de Kubernetes. ¿Qué problema resuelve centralizar sus logs en un sistema como Seq en vez de dejarlos solo en la salida estándar de cada Pod?',
          options: [
            {
              label:
                'Sin centralización, cada Pod tiene sus propios logs aislados y efímeros; hay que revisar contenedor por contenedor. Centralizar permite buscar y correlacionar logs de todas las réplicas en un solo lugar',
              value: 'a',
            },
            { label: 'Reduce el tiempo de arranque de los Pods', value: 'b' },
            {
              label: 'Elimina la necesidad de manejar excepciones en el código',
              value: 'c',
            },
            {
              label: 'No aporta ninguna ventaja real sobre logs locales',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'Con varias réplicas atendiendo tráfico, cualquier request puede haber sido servida por cualquier Pod. Sin centralización, encontrar los logs relevantes implicaría revisar cada Pod manualmente, algo inviable en producción.',
          points: 4,
          order_index: 1,
        },
        {
          question_type: 'multiple_choice',
          prompt: '¿Qué es Seq?',
          options: [
            {
              label:
                'Un servidor centralizado que recibe, almacena e indexa eventos de log estructurados, con una interfaz web para consultarlos',
              value: 'a',
            },
            { label: 'Un proveedor de Kubernetes administrado', value: 'b' },
            { label: 'Una librería de testing para .NET', value: 'c' },
            { label: 'Un tipo de base de datos relacional', value: 'd' },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'Seq está diseñado específicamente para recibir eventos de log estructurados (como los que produce Serilog) e indexar sus propiedades, habilitando búsquedas rápidas y precisas.',
          points: 4,
          order_index: 2,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Cómo suele enviar Serilog los eventos de log a un servidor Seq?',
          options: [
            {
              label:
                'Mediante el sink de Seq configurado con la URL del servidor (por ejemplo `.WriteTo.Seq("http://seq:5341")`), que envía cada evento estructurado por HTTP',
              value: 'a',
            },
            {
              label:
                'Copiando manualmente archivos de texto al servidor cada noche',
              value: 'b',
            },
            {
              label: 'Seq lee directamente la memoria del proceso .NET',
              value: 'c',
            },
            { label: 'No es posible integrar Serilog con Seq', value: 'd' },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'El sink de Seq es un paquete NuGet (Serilog.Sinks.Seq) que, una vez configurado con la URL del servidor, envía automáticamente cada evento de log generado por la aplicación.',
          points: 4,
          order_index: 3,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Qué ventaja concreta tiene que los logs sobrevivan aunque el Pod que los generó se reinicie o sea eliminado?',
          options: [
            {
              label:
                'Permite investigar un incidente después de que el Pod problemático ya no exista; los logs locales de un contenedor se pierden si el Pod es destruido (por ejemplo, en un crash o un reescalado)',
              value: 'a',
            },
            {
              label: 'Hace que el Pod arranque más rápido la próxima vez',
              value: 'b',
            },
            { label: 'Reduce el consumo de CPU del Pod', value: 'c' },
            { label: 'No tiene ninguna ventaja real', value: 'd' },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'Un Pod que crasheó por el mismo error que se quiere investigar puede ya no existir para cuando alguien revisa el problema. Sin centralización, esa evidencia se pierde junto con el Pod.',
          points: 4,
          order_index: 4,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            'Con múltiples réplicas de la misma API corriendo en Kubernetes, ¿por qué es importante que todas envíen logs al mismo servidor Seq centralizado, en vez de cada una a su propio archivo local?',
          options: [
            {
              label:
                'Para poder correlacionar y buscar eventos relacionados sin importar qué réplica específica atendió cada request, viendo el comportamiento del sistema como un todo',
              value: 'a',
            },
            {
              label: 'Porque Kubernetes lo exige por configuración',
              value: 'b',
            },
            {
              label:
                'Porque cada réplica solo puede escribir logs si hay un servidor central',
              value: 'c',
            },
            { label: 'No hay ninguna razón real para hacerlo', value: 'd' },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'Un balanceador de carga distribuye requests entre réplicas de forma que el usuario/desarrollador no controla. Si los logs quedaran separados por réplica, reconstruir el comportamiento de un flujo completo sería mucho más difícil.',
          points: 4,
          order_index: 5,
        },
        {
          question_type: 'true_false',
          prompt:
            'Enviar logs a un servidor centralizado como Seq reemplaza la necesidad de tener niveles de log (Information/Warning/Error), porque después todo se puede filtrar en la UI.',
          correct_answer: { value: false },
          explanation:
            'Los niveles de log siguen siendo esenciales: determinan qué se loggea en primer lugar (volumen, costo, ruido) y permiten configurar alertas por severidad. La centralización ayuda a consultarlos, no a decidir qué merece ser un log.',
          points: 4,
          order_index: 6,
        },
      ],
    },
    {
      slug: 'niveles-y-tipos-de-log',
      title: 'Niveles y tipos de log',
      description:
        'Uso correcto de Information, Warning, Error y Debug, y por qué el nivel elegido importa tanto como el mensaje.',
      order_index: 3,
      max_score: 24,
      metadata: {
        instructions:
          'Preguntas sobre el uso correcto de los niveles de severidad de log.',
        suggestedMinutes: 10,
      },
      questions: [
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Cuál es la diferencia de propósito entre los niveles Information, Warning y Error?',
          options: [
            {
              label:
                'Information registra eventos normales del funcionamiento de la aplicación; Warning indica algo inesperado que no interrumpió el flujo; Error indica que algo falló y requiere atención',
              value: 'a',
            },
            {
              label: 'Son sinónimos, cualquiera puede usarse indistintamente',
              value: 'b',
            },
            {
              label:
                'Information es solo para desarrollo y Error solo para producción',
              value: 'c',
            },
            { label: 'Warning es más grave que Error', value: 'd' },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'La jerarquía de severidad existe justamente para que herramientas de monitoreo y personas puedan priorizar: un Error merece atención inmediata, un Warning se revisa cuando hay tiempo, un Information es contexto normal.',
          points: 4,
          order_index: 1,
        },
        {
          question_type: 'multiple_choice',
          prompt: '¿Cuándo es apropiado usar el nivel Warning en vez de Error?',
          options: [
            {
              label:
                'Cuando ocurre algo anómalo que la aplicación pudo manejar o recuperar sin interrumpir el flujo (por ejemplo, un reintento que funcionó, o un valor por defecto usado porque faltaba una configuración opcional)',
              value: 'a',
            },
            {
              label: 'Cuando el sistema completo dejó de funcionar',
              value: 'b',
            },
            {
              label: 'Nunca, Warning está deprecado y no debería usarse',
              value: 'c',
            },
            {
              label: 'Solo para logs generados los fines de semana',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'Warning comunica "esto merece que alguien lo revise, pero el sistema siguió funcionando correctamente". Confundirlo con Error genera ruido en las alertas de severidad alta.',
          points: 4,
          order_index: 2,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Por qué loggear cada request HTTP exitosa con nivel Error sería un anti-patrón?',
          options: [
            {
              label:
                'Error debería reservarse para fallos reales; usarlo indiscriminadamente genera ruido, hace que las alertas basadas en ese nivel pierdan valor (fatiga de alertas) y dificulta encontrar los errores reales entre el volumen',
              value: 'a',
            },
            {
              label: 'Error consume más CPU que Information al escribirse',
              value: 'b',
            },
            {
              label: 'ASP.NET Core bloquea las requests si se usa Error',
              value: 'c',
            },
            { label: 'No genera ningún problema real', value: 'd' },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'Si el equipo recibe una alerta cada vez que hay un log Error y el 99% son requests exitosas mal clasificadas, terminan ignorando las alertas, incluyendo las que sí importan.',
          points: 4,
          order_index: 3,
        },
        {
          question_type: 'multiple_choice',
          prompt: '¿Qué es el nivel Debug/Verbose y cuándo suele habilitarse?',
          options: [
            {
              label:
                'Es el nivel más detallado, usado para diagnóstico fino durante desarrollo o troubleshooting; normalmente se deja deshabilitado en producción por el volumen que genera, y se habilita temporalmente para investigar un problema puntual',
              value: 'a',
            },
            {
              label:
                'Es el nivel usado exclusivamente para errores de seguridad',
              value: 'b',
            },
            { label: 'Reemplaza a Information en producción', value: 'c' },
            { label: 'Solo existe en versiones antiguas de .NET', value: 'd' },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'Debug/Verbose registra detalles internos (valores intermedios, flujo de ejecución fino) que son ruido en operación normal pero valiosos cuando hay que reproducir un bug específico paso a paso.',
          points: 4,
          order_index: 4,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Qué información mínima debería incluir un log de nivel Error para ser útil al investigar un incidente en producción?',
          options: [
            {
              label:
                'El mensaje/excepción completa con su stack trace, contexto relevante (usuario, request, operación que se estaba ejecutando) y timestamp — suficiente para entender qué pasó sin tener que reproducir el bug en vivo',
              value: 'a',
            },
            {
              label:
                'Solo la palabra "Error" sin más detalle, para no saturar el log',
              value: 'b',
            },
            {
              label: 'Únicamente el código de la línea donde ocurrió',
              value: 'c',
            },
            {
              label:
                'La contraseña del usuario afectado, para poder contactarlo',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'Un Error sin contexto suficiente obliga a reproducir el problema manualmente, perdiendo tiempo valioso. El objetivo del logging es justamente evitar esa reproducción manual siempre que sea posible.',
          points: 4,
          order_index: 5,
        },
        {
          question_type: 'true_false',
          prompt:
            'Configurar niveles de log distintos por ambiente (por ejemplo Debug en desarrollo, Information en producción) es una práctica común para controlar el volumen y el ruido de logs sin tener que cambiar el código de la aplicación.',
          correct_answer: { value: true },
          explanation:
            'El nivel mínimo de log suele configurarse externamente (appsettings.json, variable de entorno), no hardcodeado, precisamente para poder ajustar el volumen por ambiente sin recompilar la aplicación.',
          points: 4,
          order_index: 6,
        },
      ],
    },
    {
      slug: 'visualizacion-en-seq',
      title: 'Visualización en Seq',
      description:
        'Consultar, filtrar y usar los logs centralizados en Seq para diagnosticar el comportamiento de la aplicación.',
      order_index: 4,
      max_score: 20,
      metadata: {
        instructions:
          'Preguntas sobre la consulta y visualización de logs en la UI de Seq.',
        suggestedMinutes: 8,
      },
      questions: [
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Qué permite hacer la interfaz web de Seq con los logs estructurados recibidos?',
          options: [
            {
              label:
                'Buscar y filtrar por propiedades específicas (por ejemplo UserId, StatusCode) usando un lenguaje de consulta similar a SQL, y visualizar la evolución de eventos en el tiempo',
              value: 'a',
            },
            {
              label: 'Solo permite descargar los logs como un archivo .zip',
              value: 'b',
            },
            {
              label: 'Únicamente muestra el último log recibido, sin historial',
              value: 'c',
            },
            {
              label:
                'Sirve exclusivamente para editar el código fuente de la aplicación',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'La UI de Seq expone las propiedades estructuradas como columnas consultables, lo que la hace mucho más potente que revisar archivos de texto plano para encontrar patrones o eventos específicos.',
          points: 4,
          order_index: 1,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Para qué sirve guardar una consulta filtrada como "signal" en Seq?',
          options: [
            {
              label:
                'Para reutilizar rápidamente una vista o filtro frecuente (por ejemplo, "todos los errores del módulo de pagos") sin tener que reescribir la consulta cada vez que se necesita',
              value: 'a',
            },
            {
              label: 'Para borrar automáticamente los logs antiguos',
              value: 'b',
            },
            { label: 'Para encriptar los logs almacenados', value: 'c' },
            {
              label:
                'Es un requisito obligatorio para poder loggear con Serilog',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'Guardar consultas frecuentes ahorra tiempo y estandariza cómo el equipo mira ciertos problemas recurrentes, en vez de que cada persona reconstruya el filtro desde cero.',
          points: 4,
          order_index: 2,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Por qué visualizar los logs en una herramienta como Seq es generalmente más efectivo que revisar archivos de texto plano manualmente?',
          options: [
            {
              label:
                'Permite filtrar, ordenar y correlacionar grandes volúmenes de eventos estructurados en segundos, algo poco práctico haciendo búsquedas de texto sobre archivos dispersos entre múltiples Pods',
              value: 'a',
            },
            {
              label:
                'Los archivos de texto plano no pueden contener logs de error',
              value: 'b',
            },
            {
              label: 'No hay ninguna diferencia real en la práctica',
              value: 'c',
            },
            {
              label: 'Seq elimina automáticamente todos los bugs del código',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'Con múltiples réplicas generando miles de líneas de log, grep-ear archivos manualmente escala muy mal comparado con consultas indexadas sobre propiedades estructuradas.',
          points: 4,
          order_index: 3,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            'Después de desplegar un cambio en producción, querés verificar rápidamente si aumentaron los errores. ¿Qué acción en Seq sería la más directa?',
          options: [
            {
              label:
                'Filtrar por nivel Error acotado al rango de tiempo posterior al despliegue, y comparar el volumen contra el período previo al deploy',
              value: 'a',
            },
            {
              label: 'Esperar a que un usuario reporte manualmente un problema',
              value: 'b',
            },
            {
              label: 'Revisar el código fuente línea por línea buscando bugs',
              value: 'c',
            },
            {
              label: 'Reiniciar todos los Pods para "limpiar" los errores',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'Esta es exactamente la clase de verificación rápida post-deploy que la observabilidad habilita: comparar el comportamiento antes/después sin depender de que alguien externo reporte el problema primero.',
          points: 4,
          order_index: 4,
        },
        {
          question_type: 'true_false',
          prompt:
            'Revisar el dashboard de Seq después de un despliegue es una forma válida de detectar rápidamente si el cambio introdujo nuevos errores, sin necesidad de esperar a que un usuario reporte un problema.',
          correct_answer: { value: true },
          explanation:
            'Esta es una de las razones principales por las que se invierte en observabilidad: detectar problemas de forma proactiva (monitoreo activo) en vez de reactiva (esperar reportes de usuarios).',
          points: 4,
          order_index: 5,
        },
      ],
    },
  ],
};
