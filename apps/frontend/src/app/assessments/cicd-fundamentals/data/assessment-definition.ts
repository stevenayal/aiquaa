import type { AssessmentSeedDefinition } from '../../_shared/types';

export const CICD_FUNDAMENTALS_SLUG = 'cicd-fundamentals';

// Bumpear cuando cambie la definición (secciones/preguntas) para forzar re-seed.
export const CICD_FUNDAMENTALS_SEED_VERSION = 1;

export const cicdFundamentalsDefinition: AssessmentSeedDefinition = {
  slug: CICD_FUNDAMENTALS_SLUG,
  title: 'CI/CD — Fundamentos',
  description:
    'Evaluación teórica de CI/CD para bootcamp de desarrollo backend: pipelines de integración continua (restore/build/test), despliegue continuo automatizado, y buenas prácticas DevOps de versionado y organización del repositorio.',
  level: 'Trainee a Junior',
  type: 'Desarrollo DevOps',
  duration_minutes: 35,
  total_score: 100,
  is_active: true,
  metadata: {
    moduleName: 'AIQUAA Assessments / CI/CD Fundamentals',
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
      slug: 'pipeline-ci',
      title: 'Pipeline CI',
      description:
        'Integración continua: restore, build y tests automáticos disparados en cada cambio para detectar problemas temprano.',
      order_index: 1,
      max_score: 36,
      metadata: {
        instructions:
          'Selección múltiple y verdadero/falso sobre integración continua (CI) en pipelines de desarrollo.',
        suggestedMinutes: 13,
      },
      questions: [
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Qué es CI (Integración Continua) en el contexto de un pipeline de desarrollo?',
          options: [
            {
              label:
                'La práctica de integrar cambios de código frecuentemente a una rama compartida, ejecutando automáticamente build y tests en cada cambio para detectar problemas lo antes posible',
              value: 'a',
            },
            {
              label: 'Un servidor donde se guarda el código fuente',
              value: 'b',
            },
            { label: 'Un tipo de base de datos distribuida', value: 'c' },
            {
              label: 'Un reemplazo de Git para el control de versiones',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'CI busca reducir el costo de integrar cambios: mientras más seguido se integran y validan cambios pequeños, más fácil es detectar y aislar un problema, en vez de descubrirlo semanas después con cambios acumulados.',
          points: 4,
          order_index: 1,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Cuál es el objetivo principal del step de "restore" en un pipeline CI de un proyecto .NET o Node.js?',
          options: [
            {
              label:
                'Descargar e instalar las dependencias declaradas (paquetes NuGet, paquetes npm) necesarias para compilar y ejecutar el proyecto, de forma reproducible según el archivo de lock',
              value: 'a',
            },
            {
              label: 'Restaurar una copia de seguridad de la base de datos',
              value: 'b',
            },
            { label: 'Deshacer el último commit realizado', value: 'c' },
            { label: 'Reiniciar el servidor de producción', value: 'd' },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'Sin este paso, el build fallaría por falta de dependencias. Es el primer paso típico de cualquier pipeline: asegurarse de que el entorno de build tenga exactamente lo que el proyecto necesita.',
          points: 4,
          order_index: 2,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Por qué es importante que el pipeline CI se dispare automáticamente en cada push o Pull Request, en vez de ejecutarse manualmente "cuando alguien se acuerda"?',
          options: [
            {
              label:
                'Garantiza que cada cambio se valide de forma consistente sin depender de que una persona recuerde ejecutar los checks, detectando regresiones antes de que lleguen a la rama principal',
              value: 'a',
            },
            {
              label: 'Los pipelines manuales están prohibidos por Git',
              value: 'b',
            },
            {
              label: 'Es más lento pero más seguro ejecutarlo manualmente',
              value: 'c',
            },
            {
              label: 'No hay ninguna diferencia real entre ambos enfoques',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'La automatización elimina el factor humano como punto único de falla del proceso de calidad: el pipeline corre siempre, sin excepciones ni "me olvidé de correr los tests".',
          points: 4,
          order_index: 3,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Qué debería ocurrir si el step de "build" falla en el pipeline CI ejecutado sobre un Pull Request?',
          options: [
            {
              label:
                'El pipeline debe marcar el check como fallido y, idealmente, bloquear el merge del Pull Request hasta que el problema se corrija',
              value: 'a',
            },
            {
              label: 'El pipeline debería ignorar el error y continuar igual',
              value: 'b',
            },
            {
              label: 'El PR se mergea automáticamente de todas formas',
              value: 'c',
            },
            {
              label: 'Se debe eliminar la rama del PR inmediatamente',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'Un build roto que se mergea a la rama principal rompe el trabajo de todo el equipo. Bloquear el merge hasta que el pipeline esté en verde es la protección más básica y efectiva contra eso.',
          points: 4,
          order_index: 4,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Por qué correr los tests automatizados como parte del pipeline CI, y no conformarse solo con que el proyecto compile (build)?',
          options: [
            {
              label:
                'Un build exitoso solo confirma que el código compila; los tests validan que el comportamiento sigue siendo el esperado, atrapando regresiones funcionales que el compilador no puede detectar',
              value: 'a',
            },
            {
              label: 'El build y los tests son exactamente lo mismo',
              value: 'b',
            },
            {
              label: 'Correr tests hace que el build sea más rápido',
              value: 'c',
            },
            {
              label: 'No aporta ningún valor adicional correr los tests en CI',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'El compilador solo verifica que el código sea sintácticamente válido y tipado correctamente; no sabe si la lógica de negocio sigue haciendo lo correcto. Eso es exactamente lo que los tests verifican.',
          points: 4,
          order_index: 5,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Qué ventaja tiene cachear las dependencias restauradas entre ejecuciones sucesivas del pipeline CI?',
          options: [
            {
              label:
                'Reduce significativamente el tiempo de cada ejecución del pipeline, evitando descargar/instalar las mismas dependencias en cada build cuando no cambiaron',
              value: 'a',
            },
            {
              label: 'Hace que los tests pasen automáticamente sin ejecutarse',
              value: 'b',
            },
            {
              label:
                'Elimina la necesidad de tener un archivo de lock de dependencias',
              value: 'c',
            },
            {
              label: 'No tiene ningún impacto real en el tiempo de ejecución',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'Descargar decenas o cientos de paquetes en cada ejecución puede consumir buena parte del tiempo total del pipeline; cachear esa capa (cuando el lockfile no cambió) acelera notablemente el feedback.',
          points: 4,
          order_index: 6,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            'En un pipeline con varios jobs independientes (por ejemplo lint, tests unitarios, build), ¿por qué conviene que corran en paralelo cuando no dependen entre sí?',
          options: [
            {
              label:
                'Reduce el tiempo total de feedback para el desarrollador: no hay razón para esperar a que un job termine antes de empezar otro si no existe una dependencia real entre ellos',
              value: 'a',
            },
            {
              label: 'Es un requisito técnico obligatorio de todo pipeline',
              value: 'b',
            },
            {
              label: 'Corriendo en paralelo se consume menos memoria total',
              value: 'c',
            },
            {
              label: 'No cambia nada respecto a correrlos en secuencia',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'Si lint, tests y build son independientes entre sí, ejecutarlos en secuencia solo suma tiempos de espera innecesarios; en paralelo, el tiempo total del pipeline se acerca al del job más lento, no a la suma de todos.',
          points: 4,
          order_index: 7,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Qué es un "pipeline verde" y por qué es una señal de calidad valorada por el equipo?',
          options: [
            {
              label:
                'Indica que todos los checks automatizados (build, tests, lint) pasaron correctamente; da confianza de que el código en esa rama está en un estado desplegable o mergeable',
              value: 'a',
            },
            {
              label:
                'Significa que el pipeline usa un tema visual de color verde',
              value: 'b',
            },
            {
              label: 'Indica que no se ejecutó ningún test todavía',
              value: 'c',
            },
            {
              label:
                'Es simplemente una etiqueta decorativa sin significado técnico',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'El color (verde/rojo) es solo la representación visual; lo que importa es que representa una señal objetiva y automatizada sobre el estado real del código, algo que un humano no podría verificar tan rápido ni consistentemente.',
          points: 4,
          order_index: 8,
        },
        {
          question_type: 'true_false',
          prompt:
            'Un pipeline CI que solo verifica que el código compila, sin ejecutar ningún test automatizado, ofrece el mismo nivel de confianza que uno que además corre la suite de tests.',
          correct_answer: { value: false },
          explanation:
            'Compilar exitosamente no garantiza que el comportamiento sea correcto. Un pipeline sin tests puede dejar pasar regresiones funcionales graves mientras muestra un check verde, dando una falsa sensación de seguridad.',
          points: 4,
          order_index: 9,
        },
      ],
    },
    {
      slug: 'cd',
      title: 'CD',
      description:
        'Despliegue continuo: artefactos versionados, promoción entre ambientes, idempotencia y rollback.',
      order_index: 2,
      max_score: 32,
      metadata: {
        instructions:
          'Preguntas sobre despliegue continuo (CD), artefactos y promoción entre ambientes.',
        suggestedMinutes: 11,
      },
      questions: [
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Cuál es la diferencia entre Continuous Delivery y Continuous Deployment?',
          options: [
            {
              label:
                'Continuous Delivery deja el artefacto listo para desplegar, requiriendo un paso manual de aprobación final; Continuous Deployment despliega automáticamente a producción en cuanto el pipeline pasa, sin intervención humana',
              value: 'a',
            },
            {
              label: 'Son exactamente lo mismo, solo cambia el nombre',
              value: 'b',
            },
            {
              label: 'Delivery es para frontend y Deployment solo para backend',
              value: 'c',
            },
            {
              label: 'Deployment nunca automatiza nada, siempre es manual',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'Ambas automatizan hasta tener un artefacto listo; la diferencia está en el último paso hacia producción: con aprobación humana (Delivery) o completamente automático (Deployment).',
          points: 4,
          order_index: 1,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Qué es un "artefacto" en el contexto de un pipeline CD para una API .NET, por ejemplo?',
          options: [
            {
              label:
                'El resultado empaquetado y versionado del build (por ejemplo, una imagen Docker o un paquete publicado) que se promueve entre ambientes sin volver a compilarse cada vez',
              value: 'a',
            },
            { label: 'El código fuente sin compilar del proyecto', value: 'b' },
            { label: 'Un archivo de configuración de Git', value: 'c' },
            {
              label: 'La documentación del proyecto en formato PDF',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'El artefacto es el producto final del proceso de build (binario, imagen de contenedor, paquete), identificado con una versión o tag, listo para ejecutarse en cualquier ambiente compatible.',
          points: 4,
          order_index: 2,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Por qué es preferible desplegar el mismo artefacto ya construido y testeado a distintos ambientes (staging, producción), en vez de reconstruirlo específicamente para cada uno?',
          options: [
            {
              label:
                'Garantiza que lo que se testeó es exactamente lo que se despliega, eliminando la posibilidad de que una reconstrucción para producción introduzca diferencias respecto a lo validado en staging',
              value: 'a',
            },
            {
              label:
                'Reconstruir el artefacto por ambiente siempre es obligatorio',
              value: 'b',
            },
            {
              label: 'No hay ninguna diferencia real entre ambos enfoques',
              value: 'c',
            },
            { label: 'Es más rápido reconstruir en cada ambiente', value: 'd' },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'Este principio ("build once, deploy many") evita el clásico "funcionaba en staging pero no en producción" causado por diferencias sutiles entre dos builds distintos del mismo código.',
          points: 4,
          order_index: 3,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Qué rol cumple un ambiente de staging (o un despliegue simulado en local) antes de promover un cambio a producción?',
          options: [
            {
              label:
                'Permite validar el despliegue y el comportamiento de la aplicación en condiciones similares a producción, detectando problemas antes de que afecten a usuarios reales',
              value: 'a',
            },
            {
              label: 'Es un ambiente decorativo sin ningún propósito técnico',
              value: 'b',
            },
            {
              label: 'Reemplaza completamente la necesidad de tener producción',
              value: 'c',
            },
            { label: 'Solo sirve para almacenar backups', value: 'd' },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'Staging actúa como una red de seguridad: problemas de configuración, integración o infraestructura que no aparecen en el entorno local del desarrollador suelen salir a la luz ahí, antes de impactar usuarios reales.',
          points: 4,
          order_index: 4,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            'Si un despliegue automatizado a producción falla a mitad de camino, ¿qué característica del pipeline CD ayuda a minimizar el impacto en los usuarios?',
          options: [
            {
              label:
                'La capacidad de hacer rollback: volver automáticamente, o con un solo comando, a la última versión conocida como buena',
              value: 'a',
            },
            {
              label: 'Aumentar manualmente el tamaño del servidor',
              value: 'b',
            },
            { label: 'Reiniciar la base de datos completa', value: 'c' },
            {
              label:
                'Esperar a que el equipo llegue a la oficina al día siguiente',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'Un rollback rápido y confiable es lo que convierte un despliegue fallido en un incidente menor (unos minutos de downtime) en vez de uno grave (horas debuggeando en producción bajo presión).',
          points: 4,
          order_index: 5,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Qué significa que un proceso de despliegue sea "idempotente"?',
          options: [
            {
              label:
                'Que ejecutar el mismo proceso de despliegue varias veces produce el mismo resultado final, sin efectos secundarios acumulativos por repetirlo',
              value: 'a',
            },
            {
              label:
                'Que el despliegue solo puede ejecutarse una única vez en la vida del proyecto',
              value: 'b',
            },
            {
              label:
                'Que el despliegue siempre falla la segunda vez que se ejecuta',
              value: 'c',
            },
            {
              label: 'Que requiere aprobación manual cada vez que se corre',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'La idempotencia en despliegues es clave para poder reintentar con confianza: si algo falla a mitad de camino, volver a correr el mismo proceso no debería dejar el sistema en un estado peor o inconsistente.',
          points: 4,
          order_index: 6,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Por qué automatizar el despliegue (en vez de conectarse manualmente al servidor a ejecutar comandos) reduce el riesgo de errores humanos?',
          options: [
            {
              label:
                'El proceso queda definido como código versionado y repetible, eliminando pasos manuales propensos a olvidos, errores de tipeo o inconsistencias entre un despliegue y el siguiente',
              value: 'a',
            },
            {
              label: 'Los despliegues manuales son técnicamente imposibles',
              value: 'b',
            },
            {
              label:
                'La automatización elimina por completo la necesidad de monitoreo',
              value: 'c',
            },
            {
              label: 'No hay diferencia real en el riesgo entre ambos enfoques',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'Un despliegue manual depende de que una persona recuerde cada paso exacto, en el orden correcto, cada vez. Un script o pipeline versionado ejecuta siempre la misma secuencia, eliminando esa variabilidad.',
          points: 4,
          order_index: 7,
        },
        {
          question_type: 'true_false',
          prompt:
            'En un pipeline CD bien diseñado, desplegar a producción no debería requerir que una persona ejecute comandos manuales conectada directamente al servidor de destino.',
          correct_answer: { value: true },
          explanation:
            'Ese es justamente el objetivo de CD: todo el proceso de despliegue queda automatizado y repetible desde el pipeline, sin pasos manuales ad-hoc que dependan de la memoria o disponibilidad de una persona específica.',
          points: 4,
          order_index: 8,
        },
      ],
    },
    {
      slug: 'buenas-practicas',
      title: 'Buenas prácticas DevOps',
      description:
        'Versionado con Conventional Commits, repositorio limpio, .gitignore y documentación mínima necesaria en el README.',
      order_index: 3,
      max_score: 32,
      metadata: {
        instructions:
          'Preguntas sobre versionado, organización del repositorio y documentación mínima de un proyecto.',
        suggestedMinutes: 11,
      },
      questions: [
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Qué ventaja aporta seguir una convención como Conventional Commits (feat:, fix:, chore:, etc.) en los mensajes de commit?',
          options: [
            {
              label:
                'Facilita generar changelogs automáticos, entender el historial de cambios de un vistazo, y en algunos flujos determinar automáticamente el próximo número de versión (versionado semántico)',
              value: 'a',
            },
            { label: 'Hace que Git compile el código más rápido', value: 'b' },
            { label: 'Es un requisito técnico obligatorio de Git', value: 'c' },
            {
              label: 'No aporta ningún beneficio real, es solo estética',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'Un historial con mensajes consistentes y categorizados (feat/fix/chore) puede procesarse con herramientas automáticas para generar releases y changelogs, y es mucho más fácil de navegar para cualquier persona del equipo.',
          points: 4,
          order_index: 1,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Qué tipo de archivos NO deberían versionarse en el repositorio Git de un proyecto backend?',
          options: [
            {
              label:
                'Archivos con secretos o credenciales reales (por ejemplo un .env con valores de producción), artefactos de build (bin/, obj/, node_modules/) y archivos generados localmente que no aportan al código fuente',
              value: 'a',
            },
            { label: 'El código fuente de la aplicación', value: 'b' },
            {
              label:
                'Los archivos de configuración de CI (por ejemplo el pipeline YAML)',
              value: 'c',
            },
            { label: 'El README del proyecto', value: 'd' },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'Commitear secretos los expone permanentemente en el historial; commitear artefactos de build genera diffs enormes e inútiles y desincroniza fácilmente con el código fuente real.',
          points: 4,
          order_index: 2,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Para qué sirve un archivo .gitignore bien configurado en un proyecto?',
          options: [
            {
              label:
                'Evitar que archivos generados automáticamente, dependencias descargadas o configuración local/sensible terminen commiteados por error al repositorio',
              value: 'a',
            },
            {
              label:
                'Bloquear el acceso de otros desarrolladores al repositorio',
              value: 'b',
            },
            {
              label: 'Eliminar archivos del disco duro del servidor',
              value: 'c',
            },
            {
              label: 'Encriptar automáticamente el contenido del repositorio',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            '.gitignore es una lista de patrones que Git ignora al hacer `git add`, funcionando como una primera línea de defensa contra commits accidentales de archivos que no deberían estar versionados.',
          points: 4,
          order_index: 3,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Qué información mínima debería tener un buen README para que otra persona del equipo pueda levantar el proyecto localmente sin tener que preguntar?',
          options: [
            {
              label:
                'Cómo instalar las dependencias, cómo configurar las variables de entorno necesarias, y el comando exacto para correr el proyecto (y correr los tests) localmente',
              value: 'a',
            },
            {
              label: 'Solo el nombre del proyecto y el nombre del autor',
              value: 'b',
            },
            {
              label: 'Una lista de todos los commits realizados hasta la fecha',
              value: 'c',
            },
            {
              label:
                'No hace falta ninguna información, el código se explica solo',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'El README es la primera puerta de entrada al proyecto para cualquier persona nueva (incluido el "yo" de dentro de seis meses); sin esos pasos básicos, cada onboarding depende de preguntar a alguien más.',
          points: 4,
          order_index: 4,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Por qué es una buena práctica trabajar en ramas de feature (feature branches) en vez de commitear directamente sobre la rama principal?',
          options: [
            {
              label:
                'Aísla los cambios en progreso, permite que el pipeline CI valide el cambio dentro de un Pull Request antes de integrarlo, y facilita el code review previo al merge',
              value: 'a',
            },
            {
              label:
                'Git no permite hacer commits directos sobre la rama principal',
              value: 'b',
            },
            {
              label:
                'Las ramas de feature son obligatorias para que el código compile',
              value: 'c',
            },
            {
              label:
                'No aporta ninguna ventaja real sobre commitear directo a main',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'Trabajar en una rama separada da la oportunidad de validar el cambio (CI + review humano) antes de que impacte a todo el equipo a través de la rama principal, reduciendo el riesgo de romper el trabajo de otros.',
          points: 4,
          order_index: 5,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Qué problema genera dejar acumular código comentado, archivos de prueba temporales y TODOs sin resolver en el repositorio a lo largo del tiempo?',
          options: [
            {
              label:
                'Genera ruido que dificulta entender qué código está realmente en uso, aumenta la carga cognitiva para futuros lectores del código, y puede esconder deuda técnica real sin que nadie la vea',
              value: 'a',
            },
            {
              label: 'Mejora el rendimiento de la aplicación en producción',
              value: 'b',
            },
            {
              label: 'No genera ningún problema real a largo plazo',
              value: 'c',
            },
            { label: 'Hace que el pipeline CI corra más rápido', value: 'd' },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'Un repositorio con mucho "ruido" (código muerto, archivos sueltos, TODOs olvidados) hace que sea más difícil distinguir lo intencional de lo accidental, y esconde problemas reales entre el desorden.',
          points: 4,
          order_index: 6,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Por qué es importante que el historial de commits sea legible (mensajes claros, commits de tamaño razonable), en vez de un único commit gigante titulado "cambios varios"?',
          options: [
            {
              label:
                'Facilita hacer code review, entender por qué se hizo un cambio específico (usando git blame/log), y revertir selectivamente una parte del trabajo si algo sale mal, sin tener que deshacer todo junto',
              value: 'a',
            },
            {
              label: 'Git rechaza directamente los commits grandes',
              value: 'b',
            },
            {
              label:
                'Los commits pequeños ocupan menos espacio en disco de forma significativa',
              value: 'c',
            },
            {
              label:
                'No hay ninguna ventaja real en tener un historial legible',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'Un historial granular y bien descrito convierte a git log/blame en una herramienta de diagnóstico útil; un solo commit gigante obliga a revisar todo el diff junto para entender cualquier cambio puntual.',
          points: 4,
          order_index: 7,
        },
        {
          question_type: 'true_false',
          prompt:
            'Un repositorio se considera "limpio" únicamente si el código compila sin errores, sin importar si contiene archivos innecesarios, secretos hardcodeados o un README desactualizado.',
          correct_answer: { value: false },
          explanation:
            'Que compile es una condición necesaria pero no suficiente. Un repositorio limpio también implica ausencia de secretos expuestos, archivos irrelevantes versionados y documentación que refleje el estado real del proyecto.',
          points: 4,
          order_index: 8,
        },
      ],
    },
  ],
};
