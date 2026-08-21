import type { AssessmentSeedDefinition } from '../../_shared/types';

export const CLASE3_DATA_PERSISTENCIA_SLUG = 'clase3-data-persistencia';

// Bumpear cuando cambie la definición (secciones/preguntas) para forzar re-seed.
export const CLASE3_DATA_PERSISTENCIA_SEED_VERSION = 1;

// Preguntas, opciones, claves y justificaciones transcritas literalmente del
// banco de preguntas del bootcamp (Clase 3 Data Persistencia.xlsx).
// La trazabilidad al PDF de origen vive en metadata.paginasPdf de cada pregunta.
export const clase3DataPersistenciaDefinition: AssessmentSeedDefinition = {
  slug: CLASE3_DATA_PERSISTENCIA_SLUG,
  title: 'Clase 3 — Data Persistencia',
  description:
    'Evaluación teórica de la Clase 3 del bootcamp: persistencia de datos, ADO.NET frente a Entity Framework Core, migraciones, PostgreSQL con Npgsql, despliegue en contenedor, DTOs y validación con FluentValidation.',
  level: 'Trainee a Junior',
  type: 'Desarrollo backend',
  duration_minutes: 20,
  total_score: 100,
  is_active: true,
  metadata: {
    moduleName: 'AIQUAA Assessments / Clase 3 Data Persistencia',
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
      slug: 'persistencia-y-acceso-a-datos',
      title: 'Persistencia y acceso a datos',
      description:
        'Qué es la persistencia, el paradigma de ADO.NET frente a Entity Framework Core y la seguridad integrada del ORM.',
      order_index: 1,
      max_score: 40,
      metadata: {
        instructions:
          'Selección múltiple sobre los fundamentos de la persistencia y las dos formas de acceder a los datos desde .NET.',
        suggestedMinutes: 8,
      },
      questions: [
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Qué característica define la persistencia según el material?',
          options: [
            {
              label:
                'Los datos permanecen únicamente mientras la aplicación está en ejecución.',
              value: 'a',
            },
            {
              label:
                'Los datos sobreviven al ciclo de vida de la aplicación y quedan disponibles entre ejecuciones.',
              value: 'b',
            },
            {
              label:
                'Los datos se convierten automáticamente en copias de seguridad externas.',
              value: 'c',
            },
            {
              label:
                'Los datos solo pueden almacenarse en la memoria volátil del proceso.',
              value: 'd',
            },
          ],
          correct_answer: { value: 'b' },
          explanation:
            'La diapositiva distingue el tiempo de ejecución volátil de la continuidad permanente y afirma que la persistencia conserva los datos entre ejecuciones.',
          points: 10,
          order_index: 1,
          metadata: {
            tema: 'Fundamento de la persistencia',
            dificultad: 'Media',
            conceptoEvaluado: 'Persistencia y continuidad de los datos',
            paginasPdf: '2',
          },
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Qué paradigma de acceso a datos atribuye el material a ADO.NET?',
          options: [
            {
              label:
                'Mapeo objeto-relacional basado exclusivamente en entidades de dominio.',
              value: 'a',
            },
            {
              label:
                'Migraciones automáticas y consultas LINQ como mecanismo principal.',
              value: 'b',
            },
            { label: 'SQL directo y manual.', value: 'c' },
            { label: 'Persistencia sin gestión de conexiones.', value: 'd' },
          ],
          correct_answer: { value: 'c' },
          explanation:
            'La tabla comparativa describe el paradigma de ADO.NET como acceso mediante SQL directo y manual.',
          points: 10,
          order_index: 2,
          metadata: {
            tema: 'ADO.NET',
            dificultad: 'Media',
            conceptoEvaluado: 'Acceso directo con ADO.NET',
            paginasPdf: '3',
          },
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Cuál comparación reproduce correctamente las características asignadas a ADO.NET y Entity Framework Core?',
          options: [
            {
              label:
                'ADO.NET: SQL directo, gestión manual de conexiones y control total; EF Core: mapeo objeto-relacional, migraciones y LINQ.',
              value: 'a',
            },
            {
              label:
                'ADO.NET: mapeo objeto-relacional y migraciones; EF Core: SQL directo y gestión manual de conexiones.',
              value: 'b',
            },
            {
              label:
                'ADO.NET: abstracción mediante objetos y desarrollo multiplataforma; EF Core: alto volumen de código repetitivo y control manual.',
              value: 'c',
            },
            {
              label:
                'ADO.NET y EF Core: ambos requieren el mismo volumen de código y la misma gestión manual de conexiones.',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'La tabla asigna a ADO.NET SQL directo, código repetitivo, gestión manual y control total; a EF Core le asigna mapeo objeto-relacional, abstracción mediante objetos, migraciones, LINQ y desarrollo ágil multiplataforma.',
          points: 10,
          order_index: 3,
          metadata: {
            tema: 'ADO.NET vs. Entity Framework Core',
            dificultad: 'Extra',
            conceptoEvaluado: 'Diferencias entre acceso directo y ORM',
            paginasPdf: '3',
            motivoDificultadExtra:
              'Es Extra porque los distractores intercambian rasgos reales de ambas tecnologías; exige relacionar correctamente paradigma, mantenimiento y forma de acceso, no solo reconocer términos aislados.',
          },
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Qué combinación presenta el material como parte de la seguridad integrada de Entity Framework Core?',
          options: [
            {
              label:
                'Exposición pública de la base y desactivación de transacciones.',
              value: 'a',
            },
            {
              label:
                'Parametrización contra inyección SQL y soporte nativo para transacciones ACID.',
              value: 'b',
            },
            {
              label:
                'Construcción manual obligatoria de cada consulta y conexión.',
              value: 'c',
            },
            {
              label:
                'Sustitución de la validación de datos por el seguimiento de cambios.',
              value: 'd',
            },
          ],
          correct_answer: { value: 'b' },
          explanation:
            'La sección Seguridad Integrada menciona protección automática contra inyección SQL mediante parametrización y soporte nativo para transacciones ACID.',
          points: 10,
          order_index: 4,
          metadata: {
            tema: 'Seguridad en Entity Framework Core',
            dificultad: 'Media',
            conceptoEvaluado: 'Parametrización y transacciones ACID',
            paginasPdf: '4',
          },
        },
      ],
    },
    {
      slug: 'ef-core-y-postgresql',
      title: 'EF Core y PostgreSQL en producción',
      description:
        'Migraciones de Entity Framework Core, el proveedor Npgsql con connection pooling y el endurecimiento básico de PostgreSQL.',
      order_index: 2,
      max_score: 30,
      metadata: {
        instructions:
          'Selección múltiple y selección de varias respuestas sobre migraciones, rendimiento y seguridad del motor.',
        suggestedMinutes: 6,
      },
      questions: [
        {
          question_type: 'multiple_choice',
          prompt: '¿Qué comando aparece asociado al pilar de Migraciones?',
          options: [
            { label: 'sudo apt-get install postgresql', value: 'a' },
            { label: 'services.AddValidatorsFromAssembly()', value: 'b' },
            { label: 'Install-Package FluentValidation', value: 'c' },
            { label: 'dotnet ef database update', value: 'd' },
          ],
          correct_answer: { value: 'd' },
          explanation:
            'En el esquema de los cuatro pilares, el bloque Migraciones muestra el comando dotnet ef database update.',
          points: 10,
          order_index: 1,
          metadata: {
            tema: 'Migraciones en EF Core',
            dificultad: 'Media',
            conceptoEvaluado: 'Aplicación de migraciones',
            paginasPdf: '5',
          },
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Qué mecanismo utiliza Npgsql para maximizar el rendimiento en producción según el material?',
          options: [
            { label: 'Deshabilitar las conexiones simultáneas.', value: 'a' },
            {
              label: 'Crear una base de datos nueva por cada petición.',
              value: 'b',
            },
            { label: 'Connection Pooling.', value: 'c' },
            { label: 'Exponer el motor a todas las redes.', value: 'd' },
          ],
          correct_answer: { value: 'c' },
          explanation:
            'La diapositiva indica que Npgsql gestiona la comunicación eficientemente mediante Connection Pooling para maximizar el rendimiento en producción.',
          points: 10,
          order_index: 2,
          metadata: {
            tema: 'PostgreSQL y Npgsql',
            dificultad: 'Media',
            conceptoEvaluado: 'Proveedor Npgsql y pool de conexiones',
            paginasPdf: '6',
          },
        },
        {
          question_type: 'multiple_select',
          prompt:
            '¿Cuáles de las siguientes prácticas forman parte de la seguridad fundamental de PostgreSQL indicada en el material?',
          options: [
            {
              label: 'Usar obligatoriamente contraseñas robustas.',
              value: 'a',
            },
            { label: 'Limitar la exposición de red.', value: 'b' },
            {
              label: 'Realizar actualizaciones regulares del motor.',
              value: 'c',
            },
            {
              label:
                'Publicar el servicio sin restricciones para simplificar el acceso.',
              value: 'd',
            },
          ],
          correct_answer: { values: ['a', 'b', 'c'] },
          explanation:
            'El material enumera expresamente contraseñas robustas, exposición de red limitada y actualizaciones regulares del motor como medidas de seguridad fundamental.',
          points: 10,
          order_index: 3,
          metadata: {
            tema: 'Seguridad de PostgreSQL',
            dificultad: 'Media',
            conceptoEvaluado: 'Endurecimiento básico de PostgreSQL',
            paginasPdf: '6',
          },
        },
      ],
    },
    {
      slug: 'despliegue-dtos-y-validacion',
      title: 'Despliegue, DTOs y validación',
      description:
        'PostgreSQL en Docker con credenciales por variables, el viaje del dato a través de los DTOs y las reglas de FluentValidation.',
      order_index: 3,
      max_score: 30,
      metadata: {
        instructions:
          'Selección múltiple sobre despliegue del motor, frontera de la aplicación y validación de entrada.',
        suggestedMinutes: 6,
      },
      questions: [
        {
          question_type: 'multiple_choice',
          prompt:
            'Se busca un entorno aislado para PostgreSQL y que las credenciales se proporcionen mediante variables. ¿Qué alternativa coincide con la presentada en el material?',
          options: [
            {
              label:
                'Instalar PostgreSQL directamente con apt-get, porque así se eliminan los posibles conflictos de versión del anfitrión.',
              value: 'a',
            },
            {
              label:
                'Usar únicamente una cadena JDBC, porque una cadena de conexión crea por sí sola un entorno aislado.',
              value: 'b',
            },
            {
              label:
                'Instalar FluentValidation, porque sus reglas administran las credenciales del motor.',
              value: 'c',
            },
            {
              label:
                'Ejecutar PostgreSQL en Docker con POSTGRES_PASSWORD como variable de entorno.',
              value: 'd',
            },
          ],
          correct_answer: { value: 'd' },
          explanation:
            'La diapositiva muestra un contenedor Docker con POSTGRES_PASSWORD y señala como ventajas el entorno aislado y el uso de variables para proteger credenciales; la instalación local presenta riesgo de conflictos de versión.',
          points: 10,
          order_index: 1,
          metadata: {
            tema: 'Despliegue de PostgreSQL',
            dificultad: 'Extra',
            conceptoEvaluado: 'Instalación local frente a contenedor Docker',
            paginasPdf: '7',
            motivoDificultadExtra:
              'Es Extra porque los distractores usan elementos reales del material (instalación local, cadena JDBC y validación) pero les atribuyen efectos que no cumplen el escenario; exige relacionar necesidad, riesgo y mecanismo de despliegue.',
          },
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Qué función cumplen los DTOs en el viaje del dato presentado?',
          options: [
            {
              label:
                'Reemplazan a la base de datos y almacenan los registros permanentemente.',
              value: 'a',
            },
            {
              label:
                'Exponen directamente las entidades internas para evitar transformaciones.',
              value: 'b',
            },
            {
              label:
                'Evitan exponer entidades internas y permiten una transformación segura.',
              value: 'c',
            },
            {
              label:
                'Sustituyen a las entidades de dominio y contienen toda la lógica de negocio.',
              value: 'd',
            },
          ],
          correct_answer: { value: 'c' },
          explanation:
            'El diagrama explica que los DTOs evitan exponer entidades internas y permiten una transformación segura en la frontera de la aplicación.',
          points: 10,
          order_index: 2,
          metadata: {
            tema: 'Viaje del dato en la API',
            dificultad: 'Media',
            conceptoEvaluado: 'Separación entre DTOs y entidades internas',
            paginasPdf: '8',
          },
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Cuál combinación corresponde a la estructura base y a una regla mostradas para FluentValidation?',
          options: [
            {
              label:
                'UserValidator hereda de DbContext y la regla usa database update.',
              value: 'a',
            },
            {
              label:
                'UserValidator hereda de AbstractValidator<User> y el email se valida con NotEmpty() y EmailAddress().',
              value: 'b',
            },
            {
              label:
                'UserValidator hereda de DbSet<User> y la regla configura Connection Pooling.',
              value: 'c',
            },
            {
              label:
                'UserValidator hereda de Npgsql y la regla registra migraciones automáticas.',
              value: 'd',
            },
          ],
          correct_answer: { value: 'b' },
          explanation:
            'La diapositiva muestra public class UserValidator : AbstractValidator<User> y la regla RuleFor(x => x.Email).NotEmpty().EmailAddress().',
          points: 10,
          order_index: 3,
          metadata: {
            tema: 'FluentValidation',
            dificultad: 'Media',
            conceptoEvaluado: 'Validador y definición de reglas',
            paginasPdf: '9',
          },
        },
      ],
    },
  ],
};
