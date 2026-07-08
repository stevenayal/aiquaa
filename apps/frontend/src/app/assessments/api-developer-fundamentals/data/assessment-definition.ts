import type { AssessmentSeedDefinition } from '../../_shared/types';

export const API_DEVELOPER_FUNDAMENTALS_SLUG = 'api-developer-fundamentals';

// Bumpear cuando cambie la definición (secciones/preguntas) para forzar re-seed.
export const API_DEVELOPER_FUNDAMENTALS_SEED_VERSION = 1;

export const apiDeveloperFundamentalsDefinition: AssessmentSeedDefinition = {
  slug: API_DEVELOPER_FUNDAMENTALS_SLUG,
  title: 'APIs para Desarrolladores — Fundamentos',
  description:
    'Prueba técnica para desarrolladores sobre fundamentos de APIs REST: principios de arquitectura (Client–Server, Stateless, Cacheable, Uniform Interface), recursos y URIs, OpenAPI, request/response, query y route params, y verbos HTTP.',
  level: 'Trainee a Junior',
  type: 'Desarrollo APIs',
  duration_minutes: 30,
  total_score: 100,
  is_active: true,
  metadata: {
    moduleName: 'AIQUAA Assessments / API Developer Fundamentals',
    passingScore: 70,
    candidateBands: [
      { min: 0, max: 39, label: 'Inicial' },
      { min: 40, max: 69, label: 'Trainee' },
      { min: 70, max: 79, label: 'Junior' },
      { min: 80, max: 89, label: 'Junior avanzado' },
      { min: 90, max: 100, label: 'Semi Senior' },
    ],
  },
  sections: [
    {
      slug: 'fundamentos-rest',
      title: 'Fundamentos de APIs REST',
      description:
        'Principios de arquitectura REST, recursos y URIs, contrato OpenAPI, anatomía de request/response, parámetros y verbos HTTP.',
      order_index: 1,
      max_score: 100,
      metadata: {
        instructions:
          'Selección única. Elegí la opción que mejor responda cada pregunta.',
        suggestedMinutes: 30,
      },
      questions: [
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Cuál de las siguientes opciones describe mejor el principio Client–Server en REST?',
          options: [
            {
              label:
                'El cliente accede directamente a la base de datos para consultar información',
              value: 'a',
            },
            {
              label:
                'El cliente realiza solicitudes a través de una API y el servidor procesa y devuelve una respuesta',
              value: 'b',
            },
            {
              label:
                'El servidor ejecuta código dentro del navegador del cliente en cada request',
              value: 'c',
            },
            {
              label:
                'El cliente debe mantener una conexión permanente con el servidor',
              value: 'd',
            },
          ],
          correct_answer: { value: 'b' },
          explanation:
            'En Client–Server, el cliente y el servidor tienen responsabilidades separadas: el cliente solicita y el servidor procesa.',
          points: 9,
          order_index: 1,
        },
        {
          question_type: 'multiple_choice',
          prompt: '¿Qué significa que una API REST sea stateless?',
          options: [
            {
              label:
                'Que el servidor recuerda el estado de cada cliente entre requests',
              value: 'a',
            },
            {
              label:
                'Que cada petición debe llevar toda la información necesaria para ser procesada',
              value: 'b',
            },
            {
              label: 'Que la API solo puede usar el método GET',
              value: 'c',
            },
            {
              label: 'Que las respuestas nunca pueden ser cacheadas',
              value: 'd',
            },
          ],
          correct_answer: { value: 'b' },
          explanation:
            'Stateless significa que el servidor no depende de información guardada de requests anteriores para procesar una nueva petición.',
          points: 9,
          order_index: 2,
        },
        {
          question_type: 'multiple_choice',
          prompt: '¿Qué representa el concepto cacheable dentro de REST?',
          options: [
            {
              label:
                'Que todas las respuestas deben guardarse obligatoriamente en memoria',
              value: 'a',
            },
            {
              label:
                'Que las respuestas deben indicar si pueden almacenarse temporalmente o no',
              value: 'b',
            },
            {
              label: 'Que solo se pueden cachear errores HTTP 500',
              value: 'c',
            },
            {
              label:
                'Que el servidor debe guardar el estado del cliente en caché',
              value: 'd',
            },
          ],
          correct_answer: { value: 'b' },
          explanation:
            'Cacheable permite que ciertas respuestas puedan reutilizarse cuando corresponda, mejorando rendimiento y reduciendo llamadas innecesarias.',
          points: 9,
          order_index: 3,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            'En REST, ¿cuál de los siguientes ejemplos representa mejor un recurso identificado por URI?',
          options: [
            { label: 'GET_PRODUCT_BY_ID()', value: 'a' },
            { label: '/api/products/{id}', value: 'b' },
            { label: 'ProductService.Find()', value: 'c' },
            { label: 'SELECT * FROM Products', value: 'd' },
          ],
          correct_answer: { value: 'b' },
          explanation:
            'En REST, los recursos se exponen mediante URIs, por ejemplo /api/products/{id}.',
          points: 9,
          order_index: 4,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Cuál de las siguientes opciones forma parte de una Uniform Interface en REST?',
          options: [
            {
              label: 'Usar siempre POST para todas las operaciones',
              value: 'a',
            },
            {
              label:
                'Utilizar recursos con URIs, verbos HTTP, códigos de estado y cuerpos en JSON',
              value: 'b',
            },
            {
              label: 'Guardar la sesión del usuario en el servidor',
              value: 'c',
            },
            {
              label:
                'Acceder directamente desde el frontend a las tablas de base de datos',
              value: 'd',
            },
          ],
          correct_answer: { value: 'b' },
          explanation:
            'Uniform Interface busca una forma consistente en la forma de interactuar con los recursos usando URIs, métodos HTTP, status codes y representaciones como JSON.',
          points: 9,
          order_index: 5,
        },
        {
          question_type: 'multiple_choice',
          prompt: '¿A quién le sirve principalmente una definición OpenAPI?',
          options: [
            {
              label: 'Al usuario final que usa la pantalla de una aplicación',
              value: 'a',
            },
            {
              label:
                'Al motor de base de datos para crear tablas automáticamente',
              value: 'b',
            },
            {
              label:
                'A otros desarrolladores, clientes técnicos o herramientas que necesitan entender cómo consumir la API',
              value: 'c',
            },
            {
              label: 'Al sistema operativo para ejecutar la API más rápido',
              value: 'd',
            },
          ],
          correct_answer: { value: 'c' },
          explanation:
            'OpenAPI funciona como un contrato de la API. Sirve para que otros desarrolladores, consumidores técnicos o herramientas como Swagger/Postman entiendan qué endpoints existen, qué reciben y qué devuelven.',
          points: 9,
          order_index: 6,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Cuál es la diferencia correcta entre Request y Response en una API?',
          options: [
            {
              label:
                'Request es lo que devuelve el servidor y Response es lo que envía el cliente',
              value: 'a',
            },
            {
              label:
                'Request contiene body, headers y parámetros enviados por el cliente; Response contiene status code, headers y body devueltos por el servidor',
              value: 'b',
            },
            {
              label:
                'Request solo existe en métodos GET y Response solo existe en métodos POST',
              value: 'c',
            },
            {
              label: 'Request y Response significan exactamente lo mismo',
              value: 'd',
            },
          ],
          correct_answer: { value: 'b' },
          explanation:
            'El request representa la petición enviada por el cliente. El response representa la respuesta generada por el servidor.',
          points: 9,
          order_index: 7,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Cuál de las siguientes opciones representa mejor un recurso válido en una API REST?',
          options: [
            { label: '/api/getProductsById', value: 'a' },
            { label: '/api/products/{id}', value: 'b' },
            { label: '/api/create-new-product-now', value: 'c' },
            { label: '/api/products/delete/5', value: 'd' },
          ],
          correct_answer: { value: 'b' },
          explanation:
            'En REST, los recursos se representan normalmente con sustantivos y URIs claras. /api/products/{id} representa un producto específico. Las acciones como obtener, crear o eliminar deberían expresarse con verbos HTTP, no necesariamente en el nombre del endpoint.',
          points: 9,
          order_index: 8,
        },
        {
          question_type: 'multiple_choice',
          prompt: '¿Qué es un query param y para qué sirve?',
          options: [
            {
              label:
                'Es una parte obligatoria del path que identifica siempre un recurso único',
              value: 'a',
            },
            {
              label:
                'Es un parámetro enviado después del signo ? y suele servir para filtrar, ordenar, buscar o paginar resultados',
              value: 'b',
            },
            {
              label: 'Es el body completo que se envía en una petición POST',
              value: 'c',
            },
            {
              label: 'Es el código HTTP que devuelve el servidor',
              value: 'd',
            },
          ],
          correct_answer: { value: 'b' },
          explanation:
            'Un query param aparece después del ?, por ejemplo: /api/products?category=electronics. Sirve para enviar criterios adicionales sin cambiar el recurso principal.',
          points: 9,
          order_index: 9,
        },
        {
          question_type: 'multiple_choice',
          prompt: '¿Qué es un route param y para qué sirve?',
          options: [
            {
              label:
                'Es un valor dentro de la ruta que permite identificar un recurso específico',
              value: 'a',
            },
            {
              label: 'Es un parámetro que siempre se envía en el body',
              value: 'b',
            },
            {
              label: 'Es un header obligatorio para autenticar al usuario',
              value: 'c',
            },
            {
              label: 'Es el nombre interno del método en C#',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'Un route param forma parte del path. Por ejemplo, en /api/products/{id}, el {id} permite identificar un producto específico.',
          points: 9,
          order_index: 10,
        },
        {
          // Adaptada del banco original (selección múltiple) a selección única:
          // el motor compartido solo soporta multiple_choice de respuesta única.
          question_type: 'multiple_choice',
          prompt:
            '¿Cuál de los siguientes conjuntos contiene únicamente verbos HTTP válidos para diseñar endpoints REST?',
          options: [
            { label: 'GET, POST, PUT, DELETE', value: 'a' },
            { label: 'GET, POST, CREATE, DELETE', value: 'b' },
            { label: 'GET, SEARCH, PUT, DELETE', value: 'c' },
            { label: 'GET, POST, UPDATE, DELETE', value: 'd' },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'Los verbos HTTP válidos listados aquí para endpoints REST son GET, POST, PUT y DELETE. CREATE, SEARCH y UPDATE no son verbos HTTP estándar para este uso.',
          points: 10,
          order_index: 11,
        },
      ],
    },
  ],
};
