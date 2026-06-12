import type { AssessmentSeedDefinition } from '../../_shared/types';

export const DATABASE_FUNDAMENTALS_SLUG = 'database-fundamentals';

// Bumpear cuando cambie la definición (secciones/preguntas) para forzar re-seed.
export const DATABASE_FUNDAMENTALS_SEED_VERSION = 1;

export const databaseFundamentalsDefinition: AssessmentSeedDefinition = {
  slug: DATABASE_FUNDAMENTALS_SLUG,
  title: 'Bases de Datos — Fundamentos',
  description:
    'Evaluación teórica para validar fundamentos de bases de datos relacionales: modelo relacional, claves, tipos de datos, consultas SELECT, JOINs y agregaciones.',
  level: 'Junior a Semi Senior',
  type: 'QA Database Testing',
  duration_minutes: 30,
  total_score: 100,
  is_active: true,
  metadata: {
    moduleName: 'AIQUAA Assessments / Database Fundamentals',
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
      slug: 'level-1-modelo-relacional',
      title: 'Nivel 1: Modelo relacional y claves',
      description:
        'Validá tu conocimiento sobre tablas, filas, columnas, claves primarias y foráneas, tipos de datos y NULL.',
      order_index: 1,
      max_score: 35,
      metadata: {
        instructions:
          'Combinación de selección múltiple, verdadero/falso y respuestas cortas.',
        suggestedMinutes: 10,
      },
      questions: [
        {
          question_type: 'multiple_choice',
          prompt: '¿Qué describe mejor a una base de datos relacional?',
          options: [
            {
              label:
                'Un sistema que organiza los datos en tablas relacionadas entre sí mediante claves',
              value: 'a',
            },
            {
              label: 'Un archivo de texto donde se guardan logs en orden',
              value: 'b',
            },
            {
              label: 'Una herramienta para diseñar pantallas de aplicaciones',
              value: 'c',
            },
            {
              label: 'Un lenguaje de programación orientado a objetos',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'El modelo relacional organiza la información en tablas (relaciones) vinculadas mediante claves primarias y foráneas.',
          points: 3,
          order_index: 1,
        },
        {
          question_type: 'multiple_choice',
          prompt: 'En una tabla, ¿qué representa una fila (registro)?',
          options: [
            {
              label: 'Un atributo o característica común a todos los datos',
              value: 'a',
            },
            {
              label: 'Una instancia concreta de la entidad, con sus valores',
              value: 'b',
            },
            { label: 'El nombre de la tabla y su esquema', value: 'c' },
            { label: 'Una restricción de integridad', value: 'd' },
          ],
          correct_answer: { value: 'b' },
          explanation:
            'Cada fila es un registro concreto: por ejemplo, un cliente específico con su nombre, email y ciudad.',
          points: 3,
          order_index: 2,
        },
        {
          question_type: 'multiple_choice',
          prompt: '¿Qué garantiza una clave primaria (PRIMARY KEY)?',
          options: [
            {
              label: 'Que la columna acepte solo números enteros',
              value: 'a',
            },
            {
              label: 'Que los valores se ordenen alfabéticamente',
              value: 'b',
            },
            {
              label:
                'Que cada fila tenga un identificador único y no nulo dentro de la tabla',
              value: 'c',
            },
            {
              label: 'Que la tabla se pueda borrar sin afectar otras tablas',
              value: 'd',
            },
          ],
          correct_answer: { value: 'c' },
          explanation:
            'La PK identifica de forma única cada registro: no admite duplicados ni valores NULL.',
          points: 3,
          order_index: 3,
        },
        {
          question_type: 'multiple_choice',
          prompt: '¿Para qué sirve una clave foránea (FOREIGN KEY)?',
          options: [
            {
              label:
                'Para vincular una fila con un registro de otra tabla y mantener integridad referencial',
              value: 'a',
            },
            {
              label: 'Para encriptar los datos sensibles de una columna',
              value: 'b',
            },
            { label: 'Para acelerar todas las consultas SELECT', value: 'c' },
            {
              label: 'Para definir el tipo de dato de una columna',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'La FK referencia la PK de otra tabla y asegura que la relación apunte a un registro existente.',
          points: 3,
          order_index: 4,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Qué tipo de dato es más adecuado para guardar el precio de un producto con centavos?',
          options: [
            { label: 'VARCHAR, porque acepta cualquier texto', value: 'a' },
            {
              label: 'DECIMAL/NUMERIC, porque maneja decimales con precisión',
              value: 'b',
            },
            { label: 'BOOLEAN, porque ocupa menos espacio', value: 'c' },
            {
              label: 'DATE, porque registra el momento del precio',
              value: 'd',
            },
          ],
          correct_answer: { value: 'b' },
          explanation:
            'Para montos monetarios se usa DECIMAL/NUMERIC: evita errores de redondeo y permite operar matemáticamente.',
          points: 3,
          order_index: 5,
        },
        {
          question_type: 'multiple_choice',
          prompt: '¿Qué significa NULL en una columna?',
          options: [
            { label: 'Que el valor es cero', value: 'a' },
            { label: 'Que el valor es una cadena vacía', value: 'b' },
            { label: 'Que la columna no existe en esa tabla', value: 'c' },
            {
              label: 'Que el valor es desconocido o no fue cargado',
              value: 'd',
            },
          ],
          correct_answer: { value: 'd' },
          explanation:
            'NULL representa ausencia de valor: no es cero ni cadena vacía, y se compara con IS NULL / IS NOT NULL.',
          points: 3,
          order_index: 6,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            'Una tabla "pedidos" tiene la columna cliente_id que referencia a "clientes". ¿Cómo se llama este tipo de relación si un cliente puede tener muchos pedidos?',
          options: [
            { label: 'Relación muchos a muchos', value: 'a' },
            { label: 'Relación uno a uno', value: 'b' },
            { label: 'Relación uno a muchos', value: 'c' },
            { label: 'Relación recursiva', value: 'd' },
          ],
          correct_answer: { value: 'c' },
          explanation:
            'Un cliente (lado uno) puede tener muchos pedidos (lado muchos): la FK vive en la tabla del lado "muchos".',
          points: 3,
          order_index: 7,
        },
        {
          question_type: 'true_false',
          prompt: 'Una tabla puede tener más de una clave primaria.',
          correct_answer: { value: false },
          explanation:
            'Una tabla tiene una sola PK, aunque esa PK puede estar compuesta por varias columnas (clave compuesta).',
          points: 2,
          order_index: 8,
        },
        {
          question_type: 'true_false',
          prompt:
            'Una columna con clave foránea puede contener NULL si la relación es opcional.',
          correct_answer: { value: true },
          explanation:
            'Si la FK admite NULL, la fila puede existir sin estar vinculada a un registro de la otra tabla.',
          points: 2,
          order_index: 9,
        },
        {
          question_type: 'true_false',
          prompt: 'NULL es equivalente a 0 o a una cadena vacía.',
          correct_answer: { value: false },
          explanation:
            'NULL significa ausencia de valor. 0 y la cadena vacía son valores concretos; NULL no es comparable con = .',
          points: 2,
          order_index: 10,
        },
        {
          question_type: 'short_text',
          prompt:
            'Explicá con tus palabras la diferencia entre clave primaria y clave foránea.',
          expected_keywords: [
            'primaria',
            'unica',
            'identifica',
            'foranea',
            'referencia',
            'otra tabla',
          ],
          explanation:
            'La PK identifica de forma única cada fila de su tabla; la FK referencia la PK de otra tabla para vincular registros.',
          scoring_rules: {
            type: 'automatic',
            requiredKeywords: ['identifica', 'referencia'],
          },
          points: 4,
          order_index: 11,
        },
        {
          question_type: 'short_text',
          prompt:
            '¿Qué pasa si intentás insertar un pedido con un cliente_id que no existe en la tabla clientes (con FK definida)? ¿Por qué es importante para QA?',
          expected_keywords: [
            'error',
            'rechaza',
            'integridad',
            'referencial',
            'no existe',
            'datos',
          ],
          explanation:
            'El motor rechaza el insert por violar la integridad referencial. Para QA es clave: evita datos huérfanos e inconsistencias.',
          scoring_rules: {
            type: 'automatic',
            requiredKeywords: ['error', 'integridad'],
          },
          points: 4,
          order_index: 12,
        },
      ],
    },
    {
      slug: 'level-2-consultas-select',
      title: 'Nivel 2: Consultas SELECT',
      description:
        'Demostrá que entendés cómo consultar datos: SELECT, WHERE, operadores, LIKE, ORDER BY y DISTINCT.',
      order_index: 2,
      max_score: 35,
      metadata: {
        instructions:
          'Preguntas conceptuales sobre consultas SQL de lectura. No necesitás ejecutar nada.',
        suggestedMinutes: 10,
      },
      questions: [
        {
          question_type: 'multiple_choice',
          prompt: '¿Qué devuelve la consulta SELECT * FROM clientes?',
          options: [
            {
              label:
                'Todas las columnas y todas las filas de la tabla clientes',
              value: 'a',
            },
            { label: 'Solo la primera fila de la tabla', value: 'b' },
            { label: 'Solo los nombres de las columnas', value: 'c' },
            { label: 'La cantidad de registros de la tabla', value: 'd' },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'El asterisco selecciona todas las columnas; sin WHERE, se devuelven todas las filas.',
          points: 3,
          order_index: 1,
        },
        {
          question_type: 'multiple_choice',
          prompt: '¿Cuál es la función de la cláusula WHERE?',
          options: [
            { label: 'Ordenar los resultados de la consulta', value: 'a' },
            { label: 'Agrupar filas con valores repetidos', value: 'b' },
            {
              label: 'Filtrar las filas que cumplen una condición',
              value: 'c',
            },
            { label: 'Limitar la cantidad de columnas devueltas', value: 'd' },
          ],
          correct_answer: { value: 'c' },
          explanation:
            'WHERE filtra fila por fila: solo pasan las que cumplen la condición lógica.',
          points: 3,
          order_index: 2,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            "¿Qué filas devuelve WHERE nombre LIKE 'Mar%' sobre una columna de texto?",
          options: [
            {
              label: "Las que contienen 'Mar' en cualquier posición",
              value: 'a',
            },
            { label: "Las que terminan en 'Mar'", value: 'b' },
            {
              label: "Las que empiezan con 'Mar' (María, Marcos, Mario...)",
              value: 'c',
            },
            { label: "Solo la fila cuyo valor exacto es 'Mar%'", value: 'd' },
          ],
          correct_answer: { value: 'c' },
          explanation:
            "El % es comodín de cero o más caracteres: 'Mar%' matchea todo lo que empiece con Mar.",
          points: 3,
          order_index: 3,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Cómo obtenés los productos ordenados del más caro al más barato?',
          options: [
            {
              label: 'SELECT * FROM productos ORDER BY precio ASC',
              value: 'a',
            },
            {
              label: 'SELECT * FROM productos ORDER BY precio DESC',
              value: 'b',
            },
            { label: 'SELECT * FROM productos GROUP BY precio', value: 'c' },
            { label: 'SELECT * FROM productos WHERE precio DESC', value: 'd' },
          ],
          correct_answer: { value: 'b' },
          explanation:
            'ORDER BY precio DESC ordena de mayor a menor. ASC (el default) ordena de menor a mayor.',
          points: 3,
          order_index: 4,
        },
        {
          question_type: 'multiple_choice',
          prompt: '¿Qué hace DISTINCT en una consulta SELECT?',
          options: [
            {
              label: 'Elimina filas duplicadas del resultado',
              value: 'a',
            },
            { label: 'Selecciona solo la primera columna', value: 'b' },
            { label: 'Cuenta la cantidad de filas distintas', value: 'c' },
            { label: 'Ordena los valores alfabéticamente', value: 'd' },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'DISTINCT devuelve cada combinación de valores una sola vez, sin repetidos.',
          points: 3,
          order_index: 5,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Qué consulta devuelve los pedidos con total entre 100 y 500 inclusive?',
          options: [
            {
              label: 'SELECT * FROM pedidos WHERE total IN (100, 500)',
              value: 'a',
            },
            {
              label: 'SELECT * FROM pedidos WHERE total LIKE 100-500',
              value: 'b',
            },
            {
              label: 'SELECT * FROM pedidos WHERE total > 100 AND total < 500',
              value: 'c',
            },
            {
              label: 'SELECT * FROM pedidos WHERE total BETWEEN 100 AND 500',
              value: 'd',
            },
          ],
          correct_answer: { value: 'd' },
          explanation:
            'BETWEEN incluye ambos extremos. La opción con > y < excluye 100 y 500; IN solo matchea esos dos valores exactos.',
          points: 3,
          order_index: 6,
        },
        {
          question_type: 'true_false',
          prompt:
            'Si una consulta no tiene ORDER BY, el motor garantiza que las filas siempre vuelven en el mismo orden.',
          correct_answer: { value: false },
          explanation:
            'Sin ORDER BY el orden no está garantizado: puede variar entre ejecuciones. Importante al automatizar validaciones.',
          points: 2,
          order_index: 7,
        },
        {
          question_type: 'true_false',
          prompt:
            'WHERE estado = NULL es la forma correcta de filtrar las filas cuyo estado es NULL.',
          correct_answer: { value: false },
          explanation:
            'NULL no se compara con = (siempre da desconocido). Se usa WHERE estado IS NULL.',
          points: 2,
          order_index: 8,
        },
        {
          question_type: 'short_text',
          prompt:
            'Escribí una consulta SQL que devuelva el nombre y email de los clientes de la ciudad "Asunción".',
          description:
            'Tabla: clientes(id, nombre, email, ciudad). Importa más que uses las cláusulas correctas que la sintaxis perfecta.',
          expected_keywords: [
            'select',
            'nombre',
            'email',
            'from',
            'clientes',
            'where',
            'ciudad',
          ],
          explanation:
            "SELECT nombre, email FROM clientes WHERE ciudad = 'Asunción';",
          scoring_rules: {
            type: 'automatic',
            requiredKeywords: ['select', 'where'],
          },
          points: 4,
          order_index: 9,
        },
        {
          question_type: 'short_text',
          prompt:
            '¿Por qué WHERE descuento = NULL no devuelve filas aunque existan registros con descuento NULL? ¿Cómo lo escribirías bien?',
          expected_keywords: [
            'null',
            'is null',
            'no se compara',
            'desconocido',
            'is',
          ],
          explanation:
            'Comparar con = NULL devuelve desconocido para toda fila; la forma correcta es WHERE descuento IS NULL.',
          scoring_rules: {
            type: 'automatic',
            requiredKeywords: ['is null'],
          },
          points: 4,
          order_index: 10,
        },
        {
          question_type: 'short_text',
          prompt:
            'Como QA necesitás validar que no haya emails duplicados en la tabla clientes. Explicá cómo usarías DISTINCT o COUNT para detectarlo.',
          expected_keywords: [
            'distinct',
            'count',
            'duplicados',
            'comparar',
            'group',
          ],
          explanation:
            'Comparar COUNT(email) contra COUNT(DISTINCT email), o agrupar por email con HAVING COUNT(*) > 1.',
          scoring_rules: {
            type: 'automatic',
            requiredKeywords: ['count'],
          },
          points: 5,
          order_index: 11,
        },
      ],
    },
    {
      slug: 'level-3-joins-agregaciones',
      title: 'Nivel 3: JOINs, agregaciones y constraints',
      description:
        'Demostrá criterio para combinar tablas con JOIN, agregar datos con GROUP BY y entender constraints.',
      order_index: 3,
      max_score: 30,
      metadata: {
        instructions:
          'Preguntas conceptuales sobre JOINs, funciones de agregación y restricciones de integridad.',
        suggestedMinutes: 10,
      },
      questions: [
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Qué devuelve un INNER JOIN entre clientes y pedidos por cliente_id?',
          options: [
            {
              label: 'Todos los clientes, tengan o no pedidos',
              value: 'a',
            },
            {
              label: 'Solo las filas donde hay coincidencia en ambas tablas',
              value: 'b',
            },
            { label: 'Todos los pedidos, incluso sin cliente', value: 'c' },
            {
              label: 'El producto cartesiano completo de ambas tablas',
              value: 'd',
            },
          ],
          correct_answer: { value: 'b' },
          explanation:
            'INNER JOIN devuelve únicamente las combinaciones donde la condición de join matchea en las dos tablas.',
          points: 3,
          order_index: 1,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Y qué devuelve un LEFT JOIN de clientes hacia pedidos por cliente_id?',
          options: [
            {
              label:
                'Todos los clientes; si un cliente no tiene pedidos, las columnas de pedidos salen NULL',
              value: 'a',
            },
            {
              label: 'Solo los clientes que tienen al menos un pedido',
              value: 'b',
            },
            {
              label: 'Todos los pedidos, incluso los que no tienen cliente',
              value: 'c',
            },
            { label: 'Un error, porque faltan columnas', value: 'd' },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'LEFT JOIN preserva todas las filas de la tabla izquierda; donde no hay match, completa con NULL.',
          points: 3,
          order_index: 2,
        },
        {
          question_type: 'multiple_choice',
          prompt: '¿Cuál es la diferencia entre COUNT(*) y COUNT(columna)?',
          options: [
            { label: 'Ninguna, devuelven siempre lo mismo', value: 'a' },
            {
              label: 'COUNT(*) cuenta columnas y COUNT(columna) cuenta filas',
              value: 'b',
            },
            {
              label:
                'COUNT(*) cuenta todas las filas; COUNT(columna) ignora las filas donde esa columna es NULL',
              value: 'c',
            },
            {
              label: 'COUNT(columna) es más rápido porque usa índices',
              value: 'd',
            },
          ],
          correct_answer: { value: 'c' },
          explanation:
            'COUNT(columna) excluye NULL. Diferencia clave al validar totales como QA.',
          points: 3,
          order_index: 3,
        },
        {
          question_type: 'multiple_choice',
          prompt: '¿Para qué se usa GROUP BY?',
          options: [
            {
              label:
                'Para agrupar filas por uno o más valores y aplicar funciones de agregación por grupo',
              value: 'a',
            },
            { label: 'Para ordenar los resultados por columna', value: 'b' },
            { label: 'Para unir dos tablas por una clave', value: 'c' },
            { label: 'Para eliminar duplicados del resultado', value: 'd' },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'GROUP BY agrupa por valores comunes y permite COUNT, SUM, AVG, MIN, MAX por cada grupo.',
          points: 3,
          order_index: 4,
        },
        {
          question_type: 'multiple_choice',
          prompt: '¿Cuál es la diferencia entre WHERE y HAVING?',
          options: [
            { label: 'Son sinónimos, se pueden intercambiar', value: 'a' },
            {
              label: 'HAVING filtra filas individuales y WHERE filtra grupos',
              value: 'b',
            },
            {
              label: 'WHERE solo funciona con columnas numéricas',
              value: 'c',
            },
            {
              label:
                'WHERE filtra filas antes de agrupar; HAVING filtra grupos después de agregar',
              value: 'd',
            },
          ],
          correct_answer: { value: 'd' },
          explanation:
            'WHERE actúa antes del GROUP BY (filas); HAVING actúa después, sobre los resultados agregados.',
          points: 3,
          order_index: 5,
        },
        {
          question_type: 'true_false',
          prompt:
            'Un INNER JOIN entre clientes y pedidos también devuelve los clientes que no tienen ningún pedido.',
          correct_answer: { value: false },
          explanation:
            'INNER JOIN exige coincidencia en ambas tablas: los clientes sin pedidos quedan fuera (para incluirlos se usa LEFT JOIN).',
          points: 2,
          order_index: 6,
        },
        {
          question_type: 'true_false',
          prompt:
            'Una constraint UNIQUE impide que se inserten dos filas con el mismo valor en esa columna.',
          correct_answer: { value: true },
          explanation:
            'UNIQUE garantiza unicidad. A diferencia de la PK, una tabla puede tener varias constraints UNIQUE y suelen admitir NULL.',
          points: 2,
          order_index: 7,
        },
        {
          question_type: 'short_text',
          prompt:
            'Explicá con tus palabras la diferencia entre INNER JOIN y LEFT JOIN, y cuándo usarías cada uno para validar datos como QA.',
          expected_keywords: [
            'inner',
            'coincid',
            'left',
            'todas',
            'null',
            'sin pedidos',
          ],
          explanation:
            'INNER devuelve solo coincidencias; LEFT preserva toda la tabla izquierda con NULL donde no hay match — útil para detectar registros sin relación (ej: clientes sin pedidos).',
          scoring_rules: {
            type: 'automatic',
            requiredKeywords: ['inner', 'left'],
          },
          points: 5,
          order_index: 8,
        },
        {
          question_type: 'short_text',
          prompt:
            'Nombrá al menos tres constraints (restricciones) de una tabla y explicá brevemente qué valida cada una.',
          expected_keywords: [
            'primary',
            'foreign',
            'unique',
            'not null',
            'check',
            'unica',
          ],
          explanation:
            'PRIMARY KEY (identidad única), FOREIGN KEY (integridad referencial), UNIQUE (sin duplicados), NOT NULL (valor obligatorio), CHECK (condición de negocio).',
          scoring_rules: {
            type: 'automatic',
            requiredKeywords: ['unique', 'not null'],
          },
          points: 6,
          order_index: 9,
        },
      ],
    },
  ],
};
