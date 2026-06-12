import type {
  AssessmentSeedDefinition,
  SqlSchemaScenario,
} from '../../_shared/types';

export const DATABASE_PRACTICE_SLUG = 'database-practice';

// Bumpear cuando cambie la definición (secciones/preguntas) para forzar re-seed.
export const DATABASE_PRACTICE_SEED_VERSION = 1;

// Dataset compartido por los 3 niveles: una mini base de e-commerce.
const sqlSchema: SqlSchemaScenario = {
  note: 'Todos los niveles usan esta misma base. Los datos de ejemplo son el contenido completo de cada tabla.',
  tables: [
    {
      name: 'clientes',
      columns: [
        { name: 'id', type: 'INT', pk: true },
        { name: 'nombre', type: 'VARCHAR(100)' },
        { name: 'email', type: 'VARCHAR(100)' },
        { name: 'ciudad', type: 'VARCHAR(50)' },
      ],
      sampleRows: [
        {
          id: 1,
          nombre: 'Ana López',
          email: 'ana@mail.com',
          ciudad: 'Asunción',
        },
        {
          id: 2,
          nombre: 'Bruno Díaz',
          email: 'bruno@mail.com',
          ciudad: 'Luque',
        },
        {
          id: 3,
          nombre: 'Carla Ruiz',
          email: 'carla@mail.com',
          ciudad: 'Asunción',
        },
        { id: 4, nombre: 'Diego Vera', email: null, ciudad: 'Encarnación' },
      ],
    },
    {
      name: 'productos',
      columns: [
        { name: 'id', type: 'INT', pk: true },
        { name: 'nombre', type: 'VARCHAR(100)' },
        { name: 'precio', type: 'DECIMAL(12,2)' },
        { name: 'stock', type: 'INT' },
      ],
      sampleRows: [
        { id: 1, nombre: 'Teclado', precio: 150000, stock: 10 },
        { id: 2, nombre: 'Mouse', precio: 80000, stock: 25 },
        { id: 3, nombre: 'Monitor', precio: 950000, stock: 5 },
        { id: 4, nombre: 'Webcam', precio: 120000, stock: 0 },
      ],
    },
    {
      name: 'pedidos',
      columns: [
        { name: 'id', type: 'INT', pk: true },
        { name: 'cliente_id', type: 'INT', fk: 'clientes.id' },
        { name: 'producto_id', type: 'INT', fk: 'productos.id' },
        { name: 'cantidad', type: 'INT' },
        { name: 'total', type: 'DECIMAL(12,2)' },
        { name: 'estado', type: 'VARCHAR(20)' },
      ],
      sampleRows: [
        {
          id: 1,
          cliente_id: 1,
          producto_id: 1,
          cantidad: 1,
          total: 150000,
          estado: 'pagado',
        },
        {
          id: 2,
          cliente_id: 1,
          producto_id: 2,
          cantidad: 2,
          total: 160000,
          estado: 'pagado',
        },
        {
          id: 3,
          cliente_id: 2,
          producto_id: 3,
          cantidad: 1,
          total: 950000,
          estado: 'pendiente',
        },
        {
          id: 4,
          cliente_id: 3,
          producto_id: 2,
          cantidad: 1,
          total: 80000,
          estado: 'pagado',
        },
        {
          id: 5,
          cliente_id: 3,
          producto_id: 4,
          cantidad: 2,
          total: 240000,
          estado: 'cancelado',
        },
      ],
    },
  ],
};

export const databasePracticeDefinition: AssessmentSeedDefinition = {
  slug: DATABASE_PRACTICE_SLUG,
  title: 'Bases de Datos — Práctica SQL',
  description:
    'Challenge práctico sobre una base real simulada: predecí resultados de queries, detectá bugs en consultas y escribí SQL para validar datos como QA.',
  level: 'Junior a Semi Senior',
  type: 'QA Database Testing',
  duration_minutes: 40,
  total_score: 100,
  is_active: true,
  metadata: {
    moduleName: 'AIQUAA Assessments / Database Practice',
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
      slug: 'level-1-prediccion-resultados',
      title: 'Nivel 1: Predicción de resultados',
      description:
        'Leé cada query sobre el esquema y predecí exactamente qué devuelve, usando los datos de ejemplo.',
      order_index: 1,
      max_score: 30,
      metadata: {
        instructions:
          'Analizá el esquema y los datos de ejemplo. Cada query se ejecuta sobre esos datos exactos.',
        suggestedMinutes: 12,
        sqlSchema,
      },
      questions: [
        {
          question_type: 'multiple_choice',
          prompt: '¿Qué valor devuelve esta query?',
          metadata: {
            sqlScenario: {
              query: "SELECT COUNT(*) FROM pedidos WHERE estado = 'pagado';",
              result: null,
            },
          },
          options: [
            { label: '5', value: 'a' },
            { label: '2', value: 'b' },
            { label: '3', value: 'c' },
            { label: '4', value: 'd' },
          ],
          correct_answer: { value: 'c' },
          explanation:
            "Los pedidos 1, 2 y 4 tienen estado 'pagado': COUNT(*) devuelve 3.",
          points: 4,
          order_index: 1,
        },
        {
          question_type: 'multiple_choice',
          prompt: '¿Qué filas devuelve esta query y en qué orden?',
          metadata: {
            sqlScenario: {
              query:
                "SELECT nombre FROM clientes WHERE ciudad = 'Asunción' ORDER BY nombre;",
              result: null,
            },
          },
          options: [
            { label: 'Carla Ruiz, Ana López', value: 'a' },
            { label: 'Ana López, Carla Ruiz', value: 'b' },
            { label: 'Ana López, Bruno Díaz, Carla Ruiz', value: 'c' },
            { label: 'Solo Ana López', value: 'd' },
          ],
          correct_answer: { value: 'b' },
          explanation:
            'Filtra las dos clientas de Asunción y ORDER BY nombre las ordena alfabéticamente: Ana primero, Carla después.',
          points: 4,
          order_index: 2,
        },
        {
          question_type: 'multiple_choice',
          prompt: '¿Qué valor devuelve esta query?',
          metadata: {
            sqlScenario: {
              query: 'SELECT COUNT(email) FROM clientes;',
              result: null,
            },
          },
          options: [
            { label: '4', value: 'a' },
            { label: '0', value: 'b' },
            { label: 'Error de sintaxis', value: 'c' },
            { label: '3', value: 'd' },
          ],
          correct_answer: { value: 'd' },
          explanation:
            'COUNT(columna) ignora los NULL: Diego Vera tiene email NULL, así que cuenta 3.',
          points: 4,
          order_index: 3,
        },
        {
          question_type: 'multiple_choice',
          prompt: '¿Qué devuelve esta query?',
          metadata: {
            sqlScenario: {
              query:
                'SELECT c.nombre\nFROM clientes c\nLEFT JOIN pedidos p ON p.cliente_id = c.id\nWHERE p.id IS NULL;',
              result: null,
            },
          },
          options: [
            { label: 'Todos los clientes', value: 'a' },
            { label: 'Diego Vera', value: 'b' },
            { label: 'Ninguna fila', value: 'c' },
            { label: 'Ana López, porque tiene más pedidos', value: 'd' },
          ],
          correct_answer: { value: 'b' },
          explanation:
            'Patrón clásico para encontrar registros sin relación: el LEFT JOIN deja NULL en pedidos para Diego Vera, el único cliente sin pedidos.',
          points: 4,
          order_index: 4,
        },
        {
          question_type: 'multiple_choice',
          prompt: '¿Cuántas filas devuelve esta query?',
          metadata: {
            sqlScenario: {
              query:
                'SELECT estado, COUNT(*) AS cantidad\nFROM pedidos\nGROUP BY estado;',
              result: null,
            },
          },
          options: [
            { label: '5 filas, una por pedido', value: 'a' },
            { label: '1 fila con el total general', value: 'b' },
            {
              label: '3 filas: pagado (3), pendiente (1), cancelado (1)',
              value: 'c',
            },
            { label: '2 filas: pagado y pendiente', value: 'd' },
          ],
          correct_answer: { value: 'c' },
          explanation:
            'GROUP BY estado genera un grupo por cada valor distinto: pagado, pendiente y cancelado.',
          points: 3,
          order_index: 5,
        },
        {
          question_type: 'short_text',
          prompt:
            '¿Qué valor devuelve esta query? Escribí el número y explicá brevemente cómo lo calculaste.',
          metadata: {
            sqlScenario: {
              query: 'SELECT SUM(total) FROM pedidos WHERE cliente_id = 1;',
              result: null,
            },
          },
          expected_keywords: ['310', '000', 'suma'],
          explanation:
            'Ana López (cliente 1) tiene los pedidos 1 (150000) y 2 (160000): la suma es 310000.',
          scoring_rules: {
            type: 'automatic',
            requiredKeywords: ['310'],
          },
          points: 4,
          order_index: 6,
        },
        {
          question_type: 'short_text',
          prompt:
            '¿Cuántas filas devuelve esta query y qué valores trae cada una?',
          metadata: {
            sqlScenario: {
              query: 'SELECT DISTINCT ciudad FROM clientes;',
              result: null,
            },
          },
          expected_keywords: ['3', 'asuncion', 'luque', 'encarnacion'],
          explanation:
            'DISTINCT colapsa las dos filas de Asunción: devuelve 3 filas (Asunción, Luque, Encarnación).',
          scoring_rules: {
            type: 'automatic',
            requiredKeywords: ['3'],
          },
          points: 4,
          order_index: 7,
        },
        {
          question_type: 'short_text',
          prompt: '¿Qué producto devuelve esta query y por qué?',
          metadata: {
            sqlScenario: {
              query: 'SELECT nombre, precio FROM productos WHERE stock = 0;',
              result: null,
            },
          },
          expected_keywords: ['webcam', 'stock', 'cero'],
          explanation:
            'La Webcam es el único producto con stock 0. Útil como validación QA de disponibilidad.',
          scoring_rules: {
            type: 'automatic',
            requiredKeywords: ['webcam'],
          },
          points: 3,
          order_index: 8,
        },
      ],
    },
    {
      slug: 'level-2-deteccion-bugs',
      title: 'Nivel 2: Detección de bugs en queries',
      description:
        'Cada escenario muestra la intención del desarrollador, la query y el resultado obtenido. Decidí si es correcto o hay bug, y justificá.',
      order_index: 2,
      max_score: 35,
      metadata: {
        instructions:
          'Compará la intención declarada con la query y el resultado. Si hay bug, explicá la causa con precisión.',
        suggestedMinutes: 15,
        sqlSchema,
      },
      questions: [
        {
          question_type: 'response_analysis',
          prompt:
            'Intención: obtener los pedidos pendientes. ¿La query es correcta o tiene un bug?',
          metadata: {
            scenario: {
              id: 'db-bug-1',
              title: 'Pedidos pendientes',
              expectedVerdict: 'correct',
            },
            sqlScenario: {
              note: 'Intención del dev: listar todos los pedidos con estado pendiente.',
              query: "SELECT * FROM pedidos WHERE estado = 'pendiente';",
              result: {
                columns: [
                  'id',
                  'cliente_id',
                  'producto_id',
                  'cantidad',
                  'total',
                  'estado',
                ],
                rows: [[3, 2, 3, 1, 950000, 'pendiente']],
              },
            },
          },
          explanation:
            'La query filtra correctamente por estado y el único pedido pendiente es el 3.',
          points: 5,
          order_index: 1,
        },
        {
          question_type: 'response_analysis',
          prompt:
            'Intención: encontrar los clientes que no tienen email cargado. ¿Correcta o bug?',
          metadata: {
            scenario: {
              id: 'db-bug-2',
              title: 'Clientes sin email',
              expectedVerdict: 'bug',
              expectedBugReason:
                'NULL no se compara con el operador igual, hay que usar IS NULL para filtrar email nulo',
            },
            sqlScenario: {
              note: 'Intención del dev: listar los clientes cuyo email es NULL. Diego Vera no tiene email.',
              query: 'SELECT nombre FROM clientes WHERE email = NULL;',
              result: {
                columns: ['nombre'],
                rows: [],
              },
            },
          },
          explanation:
            'Comparar con = NULL siempre da desconocido: la query devuelve 0 filas aunque Diego Vera tiene email NULL. Corresponde IS NULL.',
          points: 5,
          order_index: 2,
        },
        {
          question_type: 'response_analysis',
          prompt:
            'Intención: listar TODOS los clientes con su cantidad de pedidos (incluyendo los que tienen cero). ¿Correcta o bug?',
          metadata: {
            scenario: {
              id: 'db-bug-3',
              title: 'Pedidos por cliente',
              expectedVerdict: 'bug',
              expectedBugReason:
                'el INNER JOIN excluye los clientes sin pedidos, falta usar LEFT JOIN para incluir a Diego Vera con cero',
            },
            sqlScenario: {
              note: 'Intención del dev: una fila por cliente con su cantidad de pedidos, incluso si es 0.',
              query:
                'SELECT c.nombre, COUNT(p.id) AS pedidos\nFROM clientes c\nINNER JOIN pedidos p ON p.cliente_id = c.id\nGROUP BY c.nombre;',
              result: {
                columns: ['nombre', 'pedidos'],
                rows: [
                  ['Ana López', 2],
                  ['Bruno Díaz', 1],
                  ['Carla Ruiz', 2],
                ],
              },
            },
          },
          explanation:
            'Diego Vera desaparece del resultado: INNER JOIN exige coincidencia. Con LEFT JOIN aparecería con COUNT 0.',
          points: 5,
          order_index: 3,
        },
        {
          question_type: 'response_analysis',
          prompt:
            'Intención: total facturado por cliente (suma de total de sus pedidos). ¿Correcta o bug?',
          metadata: {
            scenario: {
              id: 'db-bug-4',
              title: 'Total por cliente',
              expectedVerdict: 'correct',
            },
            sqlScenario: {
              note: 'Intención del dev: una fila por cliente con la suma de los totales de sus pedidos.',
              query:
                'SELECT cliente_id, SUM(total) AS facturado\nFROM pedidos\nGROUP BY cliente_id;',
              result: {
                columns: ['cliente_id', 'facturado'],
                rows: [
                  [1, 310000],
                  [2, 950000],
                  [3, 320000],
                ],
              },
            },
          },
          explanation:
            'Los montos coinciden con los datos: 150000+160000=310000, 950000 y 80000+240000=320000.',
          points: 5,
          order_index: 4,
        },
        {
          question_type: 'response_analysis',
          prompt:
            'Intención: obtener los pedidos PAGADOS de los clientes 2 o 3. ¿Correcta o bug?',
          metadata: {
            scenario: {
              id: 'db-bug-5',
              title: 'Precedencia AND/OR',
              expectedVerdict: 'bug',
              expectedBugReason:
                'faltan paréntesis: AND tiene precedencia sobre OR y el filtro de estado pagado no aplica al cliente 2',
            },
            sqlScenario: {
              note: 'Intención del dev: pedidos con estado pagado que pertenezcan al cliente 2 o al cliente 3.',
              query:
                "SELECT id, cliente_id, estado\nFROM pedidos\nWHERE cliente_id = 2 OR cliente_id = 3 AND estado = 'pagado';",
              result: {
                columns: ['id', 'cliente_id', 'estado'],
                rows: [
                  [3, 2, 'pendiente'],
                  [4, 3, 'pagado'],
                ],
              },
            },
          },
          explanation:
            "AND se evalúa antes que OR: la condición queda 'cliente 2 (cualquier estado) O (cliente 3 pagado)' y se cuela el pedido 3 pendiente. Faltan paréntesis.",
          points: 5,
          order_index: 5,
        },
        {
          question_type: 'response_analysis',
          prompt:
            'Intención: contar cuántos clientes tienen email cargado. ¿Correcta o bug?',
          metadata: {
            scenario: {
              id: 'db-bug-6',
              title: 'Conteo de emails',
              expectedVerdict: 'bug',
              expectedBugReason:
                'COUNT(*) cuenta todas las filas incluyendo email NULL, corresponde COUNT(email) o filtrar IS NOT NULL',
            },
            sqlScenario: {
              note: 'Intención del dev: cantidad de clientes que tienen email (no NULL). Diego Vera no tiene.',
              query: 'SELECT COUNT(*) AS con_email FROM clientes;',
              result: {
                columns: ['con_email'],
                rows: [[4]],
              },
            },
          },
          explanation:
            'COUNT(*) devuelve 4 porque cuenta también a Diego Vera (email NULL). COUNT(email) o WHERE email IS NOT NULL daría 3.',
          points: 5,
          order_index: 6,
        },
        {
          question_type: 'response_analysis',
          prompt:
            'Intención: productos con precio entre 100.000 y 200.000 inclusive. ¿Correcta o bug?',
          metadata: {
            scenario: {
              id: 'db-bug-7',
              title: 'Rango de precios',
              expectedVerdict: 'correct',
            },
            sqlScenario: {
              note: 'Intención del dev: listar los productos cuyo precio está entre 100000 y 200000, ambos incluidos.',
              query:
                'SELECT nombre, precio\nFROM productos\nWHERE precio BETWEEN 100000 AND 200000;',
              result: {
                columns: ['nombre', 'precio'],
                rows: [
                  ['Teclado', 150000],
                  ['Webcam', 120000],
                ],
              },
            },
          },
          explanation:
            'BETWEEN es inclusivo y los dos productos en rango son Teclado (150000) y Webcam (120000).',
          points: 5,
          order_index: 7,
        },
      ],
    },
    {
      slug: 'level-3-escritura-sql',
      title: 'Nivel 3: Escritura de queries',
      description:
        'Escribí las queries SQL que un QA necesita para validar datos. Importa más que uses las cláusulas correctas que la sintaxis perfecta.',
      order_index: 3,
      max_score: 35,
      metadata: {
        instructions:
          'Escribí cada query sobre el esquema de arriba. El scoring detecta cláusulas, tablas y columnas clave.',
        suggestedMinutes: 13,
        sqlSchema,
      },
      questions: [
        {
          question_type: 'short_text',
          prompt:
            'Escribí una query que devuelva nombre y precio de los productos con stock mayor a 0, ordenados del más caro al más barato.',
          expected_keywords: [
            'select',
            'nombre',
            'precio',
            'from',
            'productos',
            'where',
            'stock',
            'order by',
            'desc',
          ],
          explanation:
            'SELECT nombre, precio FROM productos WHERE stock > 0 ORDER BY precio DESC;',
          scoring_rules: {
            type: 'automatic',
            requiredKeywords: ['select', 'where', 'order by'],
          },
          points: 6,
          order_index: 1,
        },
        {
          question_type: 'short_text',
          prompt:
            'Escribí una query que devuelva el total facturado (suma de total) de los pedidos pagados.',
          expected_keywords: [
            'select',
            'sum',
            'total',
            'from',
            'pedidos',
            'where',
            'estado',
            'pagado',
          ],
          explanation:
            "SELECT SUM(total) FROM pedidos WHERE estado = 'pagado';",
          scoring_rules: {
            type: 'automatic',
            requiredKeywords: ['sum', 'where'],
          },
          points: 6,
          order_index: 2,
        },
        {
          question_type: 'short_text',
          prompt:
            'Escribí una query que devuelva la cantidad de pedidos por estado (una fila por estado).',
          expected_keywords: [
            'select',
            'estado',
            'count',
            'from',
            'pedidos',
            'group by',
          ],
          explanation: 'SELECT estado, COUNT(*) FROM pedidos GROUP BY estado;',
          scoring_rules: {
            type: 'automatic',
            requiredKeywords: ['count', 'group by'],
          },
          points: 6,
          order_index: 3,
        },
        {
          question_type: 'short_text',
          prompt:
            'Escribí una query que devuelva el nombre del cliente y el total de cada pedido (combinando ambas tablas).',
          expected_keywords: [
            'select',
            'nombre',
            'total',
            'from',
            'pedidos',
            'join',
            'clientes',
            'on',
            'cliente_id',
          ],
          explanation:
            'SELECT c.nombre, p.total FROM pedidos p JOIN clientes c ON c.id = p.cliente_id;',
          scoring_rules: {
            type: 'automatic',
            requiredKeywords: ['join', 'on'],
          },
          points: 6,
          order_index: 4,
        },
        {
          question_type: 'short_text',
          prompt:
            'Escribí una query que devuelva los clientes que NO tienen ningún pedido.',
          expected_keywords: [
            'select',
            'from',
            'clientes',
            'left join',
            'pedidos',
            'is null',
          ],
          explanation:
            'SELECT c.* FROM clientes c LEFT JOIN pedidos p ON p.cliente_id = c.id WHERE p.id IS NULL; (también vale NOT IN / NOT EXISTS)',
          scoring_rules: {
            type: 'automatic',
            requiredKeywords: ['clientes', 'pedidos'],
          },
          points: 6,
          order_index: 5,
        },
        {
          question_type: 'short_text',
          prompt:
            'Escribí una query que devuelva los clientes cuyo email no está cargado (es NULL).',
          expected_keywords: [
            'select',
            'from',
            'clientes',
            'where',
            'email',
            'is null',
          ],
          explanation: 'SELECT * FROM clientes WHERE email IS NULL;',
          scoring_rules: {
            type: 'automatic',
            requiredKeywords: ['is null'],
          },
          points: 5,
          order_index: 6,
        },
      ],
    },
  ],
};
