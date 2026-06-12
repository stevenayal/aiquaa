import type { AssessmentSeedDefinition } from '../types';

export const API_TESTING_FUNDAMENTALS_SLUG = 'api-testing-fundamentals';

// Bumpear cuando cambie la definición (secciones/preguntas) para forzar re-seed.
export const API_TESTING_SEED_VERSION = 2;

export const apiTestingFundamentalsDefinition: AssessmentSeedDefinition = {
  slug: API_TESTING_FUNDAMENTALS_SLUG,
  title: 'API Testing Fundamentals Challenge',
  description:
    'Evaluación progresiva para validar fundamentos conceptuales, interpretación de documentación, diseño de casos, análisis de respuestas y reporte de bugs en APIs.',
  level: 'Junior a Semi Senior',
  type: 'QA API Testing',
  duration_minutes: 90,
  total_score: 100,
  is_active: true,
  metadata: {
    moduleName: 'AIQUAA Assessments / API Testing Fundamentals',
    passingScore: 60,
    candidateBands: [
      { min: 0, max: 39, label: 'Inicial' },
      { min: 40, max: 59, label: 'Junior en formación' },
      { min: 60, max: 74, label: 'Junior' },
      { min: 75, max: 89, label: 'Junior avanzado / Semi Senior inicial' },
      { min: 90, max: 100, label: 'Semi Senior' },
    ],
  },
  sections: [
    {
      slug: 'level-1-concepts',
      title: 'Nivel 1: Conceptos básicos de API',
      description:
        'Validá tu conocimiento teórico sobre APIs, HTTP, requests, responses, headers y status codes.',
      order_index: 1,
      max_score: 20,
      metadata: {
        instructions:
          'Combinación de selección múltiple, verdadero/falso y respuestas cortas.',
      },
      questions: [
        {
          question_type: 'multiple_choice',
          prompt: '¿Qué describe mejor a una API?',
          options: [
            {
              label:
                'Una interfaz que permite intercambiar información entre sistemas mediante reglas definidas',
              value: 'a',
            },
            {
              label: 'Una base de datos donde se guardan logs de la aplicación',
              value: 'b',
            },
            {
              label: 'Un lenguaje de programación para automatizar pruebas',
              value: 'c',
            },
            {
              label: 'Una pantalla visual donde el usuario final hace clic',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'Una API expone contratos para que otros clientes o sistemas consuman funcionalidades o datos.',
          points: 2,
          order_index: 1,
        },
        {
          question_type: 'short_text',
          prompt:
            'Explicá con tus palabras la diferencia entre request y response.',
          expected_keywords: ['request', 'response', 'cliente', 'servidor'],
          explanation:
            'La request la envía el cliente al servidor; la response es lo que devuelve el servidor.',
          scoring_rules: {
            type: 'automatic',
            requiredKeywords: ['cliente', 'servidor'],
          },
          points: 2,
          order_index: 2,
        },
        {
          question_type: 'multiple_choice',
          prompt: '¿Qué es un endpoint?',
          options: [
            {
              label:
                'La combinación de una ruta y un método para acceder a un recurso o acción de la API',
              value: 'a',
            },
            { label: 'Un entorno de pruebas', value: 'b' },
            { label: 'Un token JWT', value: 'c' },
            { label: 'Un navegador para probar APIs', value: 'd' },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'Un endpoint representa un punto de acceso concreto dentro de la API.',
          points: 1,
          order_index: 3,
        },
        {
          question_type: 'multiple_choice',
          prompt: '¿Para qué se usa normalmente el método HTTP GET?',
          options: [
            {
              label: 'Para obtener información sin modificar el recurso',
              value: 'a',
            },
            { label: 'Para crear un recurso nuevo', value: 'b' },
            { label: 'Para eliminar un recurso', value: 'c' },
            { label: 'Para autenticar usuarios automáticamente', value: 'd' },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'GET se usa para lectura de datos y no debería producir efectos de escritura.',
          points: 1,
          order_index: 4,
        },
        {
          question_type: 'multiple_choice',
          prompt: '¿Qué acción representa mejor un POST?',
          options: [
            { label: 'Crear un recurso nuevo', value: 'a' },
            { label: 'Consultar métricas', value: 'b' },
            { label: 'Borrar caché del navegador', value: 'c' },
            { label: 'Listar headers de una request', value: 'd' },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'POST suele utilizarse para crear recursos o ejecutar comandos.',
          points: 1,
          order_index: 5,
        },
        {
          question_type: 'true_false',
          prompt:
            'HTTP es el protocolo que define cómo viajan requests y responses entre cliente y servidor.',
          correct_answer: { value: true },
          explanation:
            'HTTP define estructura, métodos, headers y convenciones de comunicación web.',
          points: 1,
          order_index: 6,
        },
        {
          question_type: 'multiple_choice',
          prompt: '¿Qué significa normalmente un status code 200?',
          options: [
            { label: 'La operación fue exitosa', value: 'a' },
            { label: 'El cliente no tiene permisos', value: 'b' },
            { label: 'Falta autenticación', value: 'c' },
            { label: 'Hubo un error interno', value: 'd' },
          ],
          correct_answer: { value: 'a' },
          explanation: '200 indica éxito en la solicitud.',
          points: 1,
          order_index: 7,
        },
        {
          question_type: 'multiple_choice',
          prompt: '¿Qué significa normalmente un status code 400?',
          options: [
            {
              label: 'La request es inválida o tiene datos incorrectos',
              value: 'a',
            },
            { label: 'La sesión expiró obligatoriamente', value: 'b' },
            { label: 'El recurso fue creado', value: 'c' },
            { label: 'El servidor está apagado', value: 'd' },
          ],
          correct_answer: { value: 'a' },
          explanation:
            '400 representa errores del lado cliente en la solicitud.',
          points: 1,
          order_index: 8,
        },
        {
          question_type: 'multiple_choice',
          prompt: '¿Qué diferencia principal hay entre 401 y 403?',
          options: [
            {
              label:
                '401 suele indicar falta de autenticación válida y 403 falta de permisos',
              value: 'a',
            },
            {
              label: '401 es error del servidor y 403 del cliente',
              value: 'b',
            },
            {
              label: '401 y 403 significan exactamente lo mismo',
              value: 'c',
            },
            { label: '403 se usa solo en GraphQL', value: 'd' },
          ],
          correct_answer: { value: 'a' },
          explanation:
            '401 apunta a autenticación ausente/inválida; 403 a autorización insuficiente.',
          points: 2,
          order_index: 9,
        },
        {
          question_type: 'multiple_choice',
          prompt: '¿Qué significa un 404?',
          options: [
            { label: 'El recurso solicitado no existe', value: 'a' },
            { label: 'La red está saturada', value: 'b' },
            { label: 'Se creó un recurso duplicado', value: 'c' },
            { label: 'El body está mal formateado', value: 'd' },
          ],
          correct_answer: { value: 'a' },
          explanation:
            '404 indica que el recurso solicitado no fue encontrado.',
          points: 1,
          order_index: 10,
        },
        {
          question_type: 'multiple_choice',
          prompt: '¿Qué significa un 500?',
          options: [
            {
              label: 'Ocurrió un error inesperado del lado servidor',
              value: 'a',
            },
            { label: 'El cliente debe reintentar con otro token', value: 'b' },
            { label: 'La request es correcta pero vacía', value: 'c' },
            { label: 'No hay conectividad en internet', value: 'd' },
          ],
          correct_answer: { value: 'a' },
          explanation: '500 es un error interno del servidor.',
          points: 1,
          order_index: 11,
        },
        {
          question_type: 'short_text',
          prompt: '¿Qué es JSON y por qué es común en APIs?',
          expected_keywords: ['json', 'clave', 'valor', 'datos', 'estructura'],
          explanation:
            'JSON es un formato de intercambio de datos ligero y legible, muy usado en APIs.',
          points: 2,
          order_index: 12,
        },
        {
          question_type: 'short_text',
          prompt: '¿Qué es un header dentro de una request HTTP?',
          expected_keywords: ['header', 'metadata', 'información', 'request'],
          explanation:
            'Los headers transportan metadatos como autenticación, tipo de contenido o idioma.',
          points: 2,
          order_index: 13,
        },
        {
          question_type: 'short_text',
          prompt: '¿Qué es el body de una request o response?',
          expected_keywords: ['body', 'payload', 'datos', 'contenido'],
          explanation:
            'El body contiene los datos principales enviados o recibidos por la operación.',
          points: 2,
          order_index: 14,
        },
      ],
    },
    {
      slug: 'level-2-doc-interpretation',
      title: 'Nivel 2: Interpretación de documentación API',
      description:
        'Leé una documentación ficticia y respondé preguntas concretas sobre método, headers, tipos y errores esperados.',
      order_index: 2,
      max_score: 20,
      metadata: {
        apiDoc: {
          method: 'GET',
          endpoint: 'GET /api/products/{id}',
          description: 'Obtiene el detalle de un producto.',
          headers: ['Authorization: Bearer token'],
          pathParams: [{ name: 'id', type: 'string', required: true }],
          successResponse: {
            id: 'prod_001',
            name: 'Notebook',
            price: 5000000,
            stock: 10,
            active: true,
          },
          expectedErrors: [
            { status: 401, message: 'si no envía token' },
            { status: 404, message: 'si el producto no existe' },
            { status: 500, message: 'si ocurre error interno' },
          ],
        },
      },
      questions: [
        {
          question_type: 'doc_analysis',
          prompt: '¿Qué método HTTP usa este endpoint?',
          options: [
            { label: 'GET', value: 'GET' },
            { label: 'POST', value: 'POST' },
            { label: 'PATCH', value: 'PATCH' },
            { label: 'DELETE', value: 'DELETE' },
          ],
          correct_answer: { value: 'GET' },
          points: 2,
          order_index: 1,
        },
        {
          question_type: 'doc_analysis',
          prompt: '¿Qué parámetro es obligatorio?',
          correct_answer: { value: 'id' },
          expected_keywords: ['id'],
          points: 2,
          order_index: 2,
        },
        {
          question_type: 'doc_analysis',
          prompt: '¿Qué header necesita la request?',
          correct_answer: { value: 'Authorization: Bearer token' },
          expected_keywords: ['authorization', 'bearer', 'token'],
          points: 3,
          order_index: 3,
        },
        {
          question_type: 'doc_analysis',
          prompt: '¿Qué status code debería devolver si no enviás token?',
          options: [
            { label: '200', value: '200' },
            { label: '401', value: '401' },
            { label: '403', value: '403' },
            { label: '500', value: '500' },
          ],
          correct_answer: { value: '401' },
          points: 2,
          order_index: 4,
        },
        {
          question_type: 'doc_analysis',
          prompt: '¿Qué status code debería devolver si el producto no existe?',
          options: [
            { label: '200', value: '200' },
            { label: '400', value: '400' },
            { label: '404', value: '404' },
            { label: '500', value: '500' },
          ],
          correct_answer: { value: '404' },
          points: 2,
          order_index: 5,
        },
        {
          question_type: 'doc_analysis',
          prompt: '¿Qué campos debería tener la respuesta exitosa?',
          correct_answer: {
            values: ['id', 'name', 'price', 'stock', 'active'],
          },
          expected_keywords: ['id', 'name', 'price', 'stock', 'active'],
          points: 4,
          order_index: 6,
        },
        {
          question_type: 'doc_analysis',
          prompt: '¿Qué tipo de dato debería tener price?',
          options: [
            { label: 'string', value: 'string' },
            { label: 'number', value: 'number' },
            { label: 'boolean', value: 'boolean' },
            { label: 'array', value: 'array' },
          ],
          correct_answer: { value: 'number' },
          points: 2,
          order_index: 7,
        },
        {
          question_type: 'doc_analysis',
          prompt: '¿Qué tipo de dato debería tener active?',
          options: [
            { label: 'string', value: 'string' },
            { label: 'number', value: 'number' },
            { label: 'boolean', value: 'boolean' },
            { label: 'object', value: 'object' },
          ],
          correct_answer: { value: 'boolean' },
          points: 3,
          order_index: 8,
        },
      ],
    },
    {
      slug: 'level-3-test-design',
      title: 'Nivel 3: Diseño de casos de prueba',
      description:
        'Convertí documentación y reglas de negocio en casos de prueba funcionales, negativos, de borde, seguridad y contrato.',
      order_index: 3,
      max_score: 25,
      metadata: {
        businessRules: [
          'name es obligatorio.',
          'price debe ser mayor a 0.',
          'stock no puede ser negativo.',
          'active debe ser boolean.',
          'no se puede crear producto duplicado con el mismo nombre.',
          'solo usuarios autenticados pueden crear, editar o eliminar.',
          'usuarios sin rol admin no pueden eliminar productos.',
        ],
        testCaseTemplate: [
          'title',
          'endpoint',
          'method',
          'preconditions',
          'input',
          'steps',
          'expectedResult',
          'caseType',
          'priority',
        ],
      },
      questions: [
        {
          question_type: 'test_case_matrix',
          prompt:
            'Diseñá casos de prueba para GET /api/products/{id}. Incluí positivos, negativos, borde, seguridad y contrato.',
          description:
            'Creá al menos 4 casos y usá el template completo en cada uno.',
          metadata: {
            endpoint: '/api/products/{id}',
            method: 'GET',
            minimumCases: 4,
            recommendedTypes: [
              'positivo',
              'negativo',
              'borde',
              'seguridad',
              'contrato',
            ],
          },
          scoring_rules: {
            type: 'heuristic',
            checks: ['coverage', 'completeness', 'rules', 'clarity'],
          },
          rubric: {
            excellent:
              'Cubre recursos existentes/inexistentes, auth, tipos y contrato de respuesta.',
          },
          points: 6,
          order_index: 1,
        },
        {
          question_type: 'test_case_matrix',
          prompt:
            'Diseñá casos de prueba para POST /api/products. Cubrí validaciones funcionales, duplicados, seguridad y contrato.',
          description:
            'Creá al menos 5 casos y reflejá las reglas de name, price, stock, active y duplicados.',
          metadata: {
            endpoint: '/api/products',
            method: 'POST',
            minimumCases: 5,
            recommendedTypes: [
              'positivo',
              'negativo',
              'borde',
              'seguridad',
              'contrato',
            ],
          },
          scoring_rules: {
            type: 'heuristic',
            checks: ['coverage', 'completeness', 'rules', 'security'],
          },
          points: 6,
          order_index: 2,
        },
        {
          question_type: 'test_case_matrix',
          prompt:
            'Diseñá casos de prueba para PUT /api/products/{id}. Incluí actualizaciones válidas, inválidas y checks de autenticación/contrato.',
          description:
            'Creá al menos 4 casos y contemplá datos inválidos y recursos inexistentes.',
          metadata: {
            endpoint: '/api/products/{id}',
            method: 'PUT',
            minimumCases: 4,
            recommendedTypes: [
              'positivo',
              'negativo',
              'borde',
              'seguridad',
              'contrato',
            ],
          },
          scoring_rules: {
            type: 'heuristic',
            checks: ['coverage', 'completeness', 'rules'],
          },
          points: 6,
          order_index: 3,
        },
        {
          question_type: 'test_case_matrix',
          prompt:
            'Diseñá casos de prueba para DELETE /api/products/{id}. Prestá especial atención a autenticación, autorización admin y recursos inexistentes.',
          description:
            'Creá al menos 4 casos y diferenciá claramente 401, 403 y 404.',
          metadata: {
            endpoint: '/api/products/{id}',
            method: 'DELETE',
            minimumCases: 4,
            recommendedTypes: ['positivo', 'negativo', 'seguridad', 'contrato'],
          },
          scoring_rules: {
            type: 'heuristic',
            checks: ['coverage', 'completeness', 'auth', 'clarity'],
          },
          points: 7,
          order_index: 4,
        },
      ],
    },
    {
      slug: 'level-4-response-analysis',
      title: 'Nivel 4: Ejecución simulada de API',
      description:
        'Analizá requests/responses simulados y decidí si el comportamiento es correcto o si hay un bug.',
      order_index: 4,
      max_score: 20,
      questions: [
        {
          question_type: 'response_analysis',
          prompt: 'Caso 1: ¿La respuesta es correcta o hay bug?',
          metadata: {
            scenario: {
              id: 'case-1',
              title: 'GET producto existente',
              request: {
                method: 'GET',
                endpoint: '/api/products/prod_001',
                headers: ['Authorization: Bearer valid_token'],
              },
              response: {
                status: 200,
                body: {
                  id: 'prod_001',
                  name: 'Notebook',
                  price: 5000000,
                  stock: 10,
                  active: true,
                },
              },
              expectedVerdict: 'correct',
            },
          },
          correct_answer: { verdict: 'correct' },
          expected_keywords: ['correcto', 'válido', '200'],
          points: 2,
          order_index: 1,
        },
        {
          question_type: 'response_analysis',
          prompt: 'Caso 2: ¿La respuesta es correcta o hay bug?',
          metadata: {
            scenario: {
              id: 'case-2',
              title: 'GET producto inexistente',
              request: {
                method: 'GET',
                endpoint: '/api/products/prod_999',
                headers: ['Authorization: Bearer valid_token'],
              },
              response: {
                status: 200,
                body: { message: 'Product not found' },
              },
              expectedVerdict: 'bug',
              expectedBugReason: 'Debe devolver 404, no 200.',
            },
          },
          correct_answer: { verdict: 'bug', expectedStatus: 404 },
          expected_keywords: ['404', 'not found'],
          points: 3,
          order_index: 2,
        },
        {
          question_type: 'response_analysis',
          prompt: 'Caso 3: ¿La respuesta es correcta o hay bug?',
          metadata: {
            scenario: {
              id: 'case-3',
              title: 'POST con name vacío',
              request: {
                method: 'POST',
                endpoint: '/api/products',
                headers: ['Authorization: Bearer valid_token'],
                body: {
                  name: '',
                  price: 100000,
                  stock: 5,
                  active: true,
                },
              },
              response: {
                status: 201,
                body: {
                  id: 'prod_002',
                  name: '',
                  price: 100000,
                  stock: 5,
                  active: true,
                },
              },
              expectedVerdict: 'bug',
              expectedBugReason:
                'No debería permitir name vacío. Debe devolver 400.',
            },
          },
          correct_answer: { verdict: 'bug', expectedStatus: 400 },
          expected_keywords: ['400', 'name', 'vacío', 'obligatorio'],
          points: 2,
          order_index: 3,
        },
        {
          question_type: 'response_analysis',
          prompt: 'Caso 4: ¿La respuesta es correcta o hay bug?',
          metadata: {
            scenario: {
              id: 'case-4',
              title: 'POST con price negativo',
              request: {
                method: 'POST',
                endpoint: '/api/products',
                headers: ['Authorization: Bearer valid_token'],
                body: {
                  name: 'Mouse',
                  price: -50000,
                  stock: 3,
                  active: true,
                },
              },
              response: {
                status: 201,
              },
              expectedVerdict: 'bug',
              expectedBugReason:
                'No debería permitir price negativo. Debe devolver 400.',
            },
          },
          correct_answer: { verdict: 'bug', expectedStatus: 400 },
          expected_keywords: ['400', 'price', 'negativo'],
          points: 3,
          order_index: 4,
        },
        {
          question_type: 'response_analysis',
          prompt: 'Caso 5: ¿La respuesta es correcta o hay bug?',
          metadata: {
            scenario: {
              id: 'case-5',
              title: 'DELETE sin rol admin',
              request: {
                method: 'DELETE',
                endpoint: '/api/products/prod_001',
                headers: ['Authorization: Bearer user_token'],
              },
              response: {
                status: 204,
              },
              expectedVerdict: 'bug',
              expectedBugReason:
                'Usuario sin rol admin no debería eliminar. Debe devolver 403.',
            },
          },
          correct_answer: { verdict: 'bug', expectedStatus: 403 },
          expected_keywords: ['403', 'admin', 'autorización'],
          points: 2,
          order_index: 5,
        },
        {
          question_type: 'response_analysis',
          prompt: 'Caso 6: ¿La respuesta es correcta o hay bug?',
          metadata: {
            scenario: {
              id: 'case-6',
              title: 'GET sin Authorization',
              request: {
                method: 'GET',
                endpoint: '/api/products/prod_001',
              },
              response: {
                status: 200,
              },
              expectedVerdict: 'bug',
              expectedBugReason: 'Debe devolver 401.',
            },
          },
          correct_answer: { verdict: 'bug', expectedStatus: 401 },
          expected_keywords: ['401', 'token', 'authorization'],
          points: 3,
          order_index: 6,
        },
        {
          question_type: 'response_analysis',
          prompt: 'Caso 7: ¿La respuesta es correcta o hay bug?',
          metadata: {
            scenario: {
              id: 'case-7',
              title: 'POST con stock no numérico',
              request: {
                method: 'POST',
                endpoint: '/api/products',
                headers: ['Authorization: Bearer valid_token'],
                body: {
                  name: 'Keyboard',
                  price: 150000,
                  stock: 'ten',
                  active: true,
                },
              },
              response: {
                status: 201,
              },
              expectedVerdict: 'bug',
              expectedBugReason: 'stock debe ser numérico. Debe devolver 400.',
            },
          },
          correct_answer: { verdict: 'bug', expectedStatus: 400 },
          expected_keywords: ['400', 'stock', 'numérico'],
          points: 2,
          order_index: 7,
        },
        {
          question_type: 'response_analysis',
          prompt: 'Caso 8: ¿La respuesta es correcta o hay bug?',
          metadata: {
            scenario: {
              id: 'case-8',
              title: 'Inconsistencia de contrato/documentación',
              request: {
                method: 'GET',
                endpoint: '/api/products/prod_001',
                headers: ['Authorization: Bearer valid_token'],
              },
              response: {
                status: 200,
                body: { stock: 10 },
              },
              documentationNote:
                'La documentación dice que la respuesta debería traer availableStock.',
              expectedVerdict: 'bug',
              expectedBugReason:
                'Existe una inconsistencia de contrato/documentación entre availableStock y stock.',
            },
          },
          correct_answer: { verdict: 'bug', expectedStatus: 200 },
          expected_keywords: [
            'contrato',
            'documentación',
            'availableStock',
            'stock',
          ],
          points: 3,
          order_index: 8,
        },
      ],
    },
    {
      slug: 'level-5-bug-reporting',
      title: 'Nivel 5: Reporte de bugs',
      description:
        'Documentá defectos de API de forma clara, reproducible y accionable para el equipo.',
      order_index: 5,
      max_score: 15,
      metadata: {
        instructions:
          'Reportá al menos 3 bugs encontrados en el nivel 4 usando todos los campos obligatorios.',
      },
      questions: [
        {
          question_type: 'bug_report',
          prompt:
            'Reportá el bug del caso 2 (producto no encontrado devuelve 200).',
          metadata: {
            bugReference: 'case-2',
            endpoint: '/api/products/prod_999',
            method: 'GET',
            expectedStatus: 404,
            actualStatus: 200,
          },
          scoring_rules: {
            type: 'heuristic',
            checks: [
              'required_fields',
              'endpoint',
              'status_codes',
              'reproducibility',
            ],
          },
          points: 5,
          order_index: 1,
        },
        {
          question_type: 'bug_report',
          prompt:
            'Reportá el bug del caso 3 (POST crea producto con name vacío).',
          metadata: {
            bugReference: 'case-3',
            endpoint: '/api/products',
            method: 'POST',
            expectedStatus: 400,
            actualStatus: 201,
          },
          scoring_rules: {
            type: 'heuristic',
            checks: ['required_fields', 'endpoint', 'business_rule', 'clarity'],
          },
          points: 5,
          order_index: 2,
        },
        {
          question_type: 'bug_report',
          prompt: 'Reportá el bug del caso 5 (DELETE permitido sin rol admin).',
          metadata: {
            bugReference: 'case-5',
            endpoint: '/api/products/prod_001',
            method: 'DELETE',
            expectedStatus: 403,
            actualStatus: 204,
          },
          scoring_rules: {
            type: 'heuristic',
            checks: [
              'required_fields',
              'authorization',
              'severity_priority',
              'reproducibility',
            ],
          },
          points: 5,
          order_index: 3,
        },
      ],
    },
  ],
};
