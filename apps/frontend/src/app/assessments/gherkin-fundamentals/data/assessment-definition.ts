import type { AssessmentSeedDefinition } from '../../_shared/types';

export const GHERKIN_FUNDAMENTALS_SLUG = 'gherkin-fundamentals';

// Bumpear cuando cambie la definición (secciones/preguntas) para forzar re-seed.
export const GHERKIN_FUNDAMENTALS_SEED_VERSION = 1;

export const gherkinFundamentalsDefinition: AssessmentSeedDefinition = {
  slug: GHERKIN_FUNDAMENTALS_SLUG,
  title: 'Gherkin y BDD — Fundamentos',
  description:
    'Evaluación teórica de Gherkin y BDD para QA: fundamentos de Behavior-Driven Development (los 3 amigos, discovery y documentación viva), sintaxis Gherkin (Dado/Cuando/Entonces, Antecedentes) y escenarios avanzados con Scenario Outline, tags y buenas prácticas aplicadas al testing.',
  level: 'Junior a Semi Senior',
  type: 'QA BDD',
  duration_minutes: 35,
  total_score: 100,
  is_active: true,
  metadata: {
    moduleName: 'AIQUAA Assessments / Gherkin Fundamentals',
    passingScore: 70,
    candidateBands: [
      { min: 0, max: 39, label: 'Inicial' },
      { min: 40, max: 69, label: 'Junior en formación' },
      { min: 70, max: 79, label: 'Junior' },
      { min: 80, max: 89, label: 'Junior avanzado' },
      { min: 90, max: 100, label: 'Semi Senior' },
    ],
  },
  sections: [
    {
      slug: 'nivel-1-fundamentos-bdd',
      title: 'Nivel 1: Fundamentos de BDD',
      description:
        'Validá tu comprensión de Behavior-Driven Development: qué es, los 3 amigos, las fases discovery/formulation/automation, la relación con TDD y la documentación viva.',
      order_index: 1,
      max_score: 36,
      metadata: {
        instructions:
          'Combinación de selección múltiple y verdadero/falso basada en la documentación oficial de Cucumber y la práctica BDD.',
        suggestedMinutes: 12,
      },
      questions: [
        {
          question_type: 'multiple_choice',
          prompt: '¿Qué describe mejor a BDD (Behavior-Driven Development)?',
          options: [
            {
              label:
                'Una práctica colaborativa donde negocio, desarrollo y testing definen el comportamiento esperado mediante ejemplos concretos en lenguaje natural',
              value: 'a',
            },
            {
              label:
                'Una herramienta para ejecutar tests unitarios más rápido en el pipeline de CI',
              value: 'b',
            },
            {
              label:
                'Un framework de automatización de UI que reemplaza a Selenium y Playwright',
              value: 'c',
            },
            {
              label:
                'Una metodología de gestión de proyectos que reemplaza a Scrum',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'BDD es ante todo una práctica de colaboración: el equipo describe el comportamiento del sistema con ejemplos concretos y compartidos antes de implementarlo. La automatización es una consecuencia, no el punto de partida.',
          points: 4,
          order_index: 1,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            'En BDD, ¿quiénes son los "3 amigos" (three amigos) que participan en las conversaciones de descubrimiento?',
          options: [
            {
              label: 'El tester, el diseñador UX y el gerente de proyecto',
              value: 'a',
            },
            {
              label:
                'La perspectiva de negocio (PO/BA), la de desarrollo y la de testing/QA',
              value: 'b',
            },
            {
              label: 'El cliente final, el CEO y el equipo de soporte',
              value: 'c',
            },
            {
              label: 'Tres desarrolladores que revisan el código entre sí',
              value: 'd',
            },
          ],
          correct_answer: { value: 'b' },
          explanation:
            'Los 3 amigos representan tres perspectivas: negocio (qué problema resolver), desarrollo (cómo construirlo) y testing (qué podría salir mal). Juntas producen ejemplos más completos que cualquiera por separado.',
          points: 4,
          order_index: 2,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Cuáles son las tres fases del ciclo BDD según la documentación de Cucumber?',
          options: [
            {
              label: 'Planificación, ejecución y reporte',
              value: 'a',
            },
            {
              label: 'Análisis, codificación y despliegue',
              value: 'b',
            },
            {
              label:
                'Discovery (descubrir con ejemplos), Formulation (formular en Gherkin) y Automation (automatizar los escenarios)',
              value: 'c',
            },
            {
              label: 'Red, Green y Refactor',
              value: 'd',
            },
          ],
          correct_answer: { value: 'c' },
          explanation:
            'Primero se descubre el comportamiento conversando con ejemplos (discovery), luego se formulan esos ejemplos como escenarios Gherkin (formulation) y finalmente se automatizan para guiar el desarrollo (automation).',
          points: 4,
          order_index: 3,
        },
        {
          question_type: 'multiple_choice',
          prompt: '¿Cuál es la relación entre BDD y TDD?',
          options: [
            {
              label: 'Son enfoques opuestos: si usás BDD no podés usar TDD',
              value: 'a',
            },
            {
              label:
                'BDD evolucionó a partir de TDD: lleva la idea de "primero el test" al nivel del comportamiento de negocio, con un lenguaje que todo el equipo entiende',
              value: 'b',
            },
            {
              label: 'TDD es la versión moderna de BDD',
              value: 'c',
            },
            {
              label:
                'No tienen relación: TDD es para backend y BDD para frontend',
              value: 'd',
            },
          ],
          correct_answer: { value: 'b' },
          explanation:
            'BDD nació como una evolución de TDD (Dan North): en lugar de pensar en "tests" técnicos, se piensa en "comportamientos" descritos en lenguaje de negocio, manteniendo el ciclo de escribir la especificación antes del código.',
          points: 4,
          order_index: 4,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Qué significa que los escenarios BDD funcionen como "documentación viva" (living documentation)?',
          options: [
            {
              label:
                'Que se actualizan automáticamente con inteligencia artificial',
              value: 'a',
            },
            {
              label: 'Que están escritos en una wiki editable por cualquiera',
              value: 'b',
            },
            {
              label:
                'Que la documentación se imprime y se archiva al final de cada sprint',
              value: 'c',
            },
            {
              label:
                'Que al ser ejecutables contra el sistema, los escenarios no pueden quedar desactualizados sin que la suite falle: describen el comportamiento real',
              value: 'd',
            },
          ],
          correct_answer: { value: 'd' },
          explanation:
            'A diferencia de un documento estático, un escenario automatizado se ejecuta contra el sistema: si el comportamiento cambia y el escenario no, la suite falla. Eso obliga a mantener la especificación sincronizada con la realidad.',
          points: 4,
          order_index: 5,
        },
        {
          question_type: 'multiple_choice',
          prompt: '¿Qué es Gherkin?',
          options: [
            {
              label:
                'Un lenguaje de programación para escribir step definitions',
              value: 'a',
            },
            {
              label:
                'Un lenguaje estructurado de texto plano, legible por negocio, para describir comportamiento mediante escenarios que además pueden automatizarse',
              value: 'b',
            },
            {
              label: 'Una base de datos donde Cucumber guarda los resultados',
              value: 'c',
            },
            {
              label: 'Un plugin de Jira para gestionar criterios de aceptación',
              value: 'd',
            },
          ],
          correct_answer: { value: 'b' },
          explanation:
            'Gherkin es la sintaxis que usan Cucumber y herramientas similares: texto plano con keywords (Feature, Scenario, Given/When/Then) que una persona de negocio puede leer y una herramienta puede ejecutar.',
          points: 4,
          order_index: 6,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Cuál es el principal beneficio de BDD para el rol de QA en un equipo?',
          options: [
            {
              label:
                'Los criterios de aceptación quedan definidos como ejemplos claros y verificables antes de escribir código, permitiendo detectar ambigüedades temprano (shift-left)',
              value: 'a',
            },
            {
              label:
                'QA deja de participar en las reuniones porque todo queda automatizado',
              value: 'b',
            },
            {
              label: 'Se elimina la necesidad de hacer testing exploratorio',
              value: 'c',
            },
            {
              label:
                'Los bugs de producción se corrigen solos al correr la suite',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'BDD mueve la detección de defectos hacia la izquierda: al discutir ejemplos concretos antes del desarrollo, QA encuentra ambigüedades y casos borde cuando corregirlos es más barato. El testing exploratorio sigue siendo necesario.',
          points: 4,
          order_index: 7,
        },
        {
          question_type: 'true_false',
          prompt:
            'BDD es principalmente una herramienta de automatización cuyo objetivo es reemplazar a los testers manuales.',
          correct_answer: { value: false },
          explanation:
            'BDD es una práctica de colaboración y comunicación. La automatización de escenarios es solo una de sus fases, y el criterio de QA (elegir buenos ejemplos, detectar casos borde) es justamente lo que la hace valiosa.',
          points: 4,
          order_index: 8,
        },
        {
          question_type: 'true_false',
          prompt:
            'En BDD, los ejemplos concretos del comportamiento se conversan y acuerdan entre negocio, desarrollo y QA antes de implementar la funcionalidad.',
          correct_answer: { value: true },
          explanation:
            'Esa es la fase de discovery: los ejemplos se definen en conversación (por ejemplo en sesiones de example mapping) antes del desarrollo, y se convierten en la especificación compartida del equipo.',
          points: 4,
          order_index: 9,
        },
      ],
    },
    {
      slug: 'nivel-2-sintaxis-gherkin',
      title: 'Nivel 2: Sintaxis Gherkin',
      description:
        'Demostrá que dominás las keywords de Gherkin: Feature, Scenario, Given/When/Then (Dado/Cuando/Entonces), And/But, Background y la localización en español.',
      order_index: 2,
      max_score: 32,
      metadata: {
        instructions:
          'Preguntas sobre el rol semántico de cada keyword y la estructura de un archivo .feature, según la referencia oficial de Gherkin.',
        suggestedMinutes: 11,
      },
      questions: [
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Cuál es el rol del paso Given (Dado) en un escenario Gherkin?',
          options: [
            {
              label: 'Describir la acción principal que realiza el usuario',
              value: 'a',
            },
            {
              label:
                'Establecer el contexto o estado inicial del sistema antes de que ocurra la acción',
              value: 'b',
            },
            {
              label: 'Verificar el resultado final del escenario',
              value: 'c',
            },
            {
              label: 'Definir los datos de la tabla de ejemplos',
              value: 'd',
            },
          ],
          correct_answer: { value: 'b' },
          explanation:
            'Given/Dado pone al sistema en un estado conocido: precondiciones, datos existentes, sesión iniciada. Es la "foto inicial" sobre la que actúa el escenario.',
          points: 4,
          order_index: 1,
        },
        {
          question_type: 'multiple_choice',
          prompt: '¿Qué representa el paso When (Cuando) en un escenario?',
          options: [
            {
              label: 'Las precondiciones del sistema',
              value: 'a',
            },
            {
              label: 'El resultado esperado de la prueba',
              value: 'b',
            },
            {
              label:
                'La acción o evento que dispara el comportamiento que se está especificando',
              value: 'c',
            },
            {
              label: 'Un comentario que documenta el escenario',
              value: 'd',
            },
          ],
          correct_answer: { value: 'c' },
          explanation:
            'When/Cuando es el evento bajo prueba: la acción del usuario o del sistema que provoca el comportamiento. Idealmente hay un solo When por escenario, porque se especifica un solo comportamiento.',
          points: 4,
          order_index: 2,
        },
        {
          question_type: 'multiple_choice',
          prompt: '¿Qué expresa el paso Then (Entonces)?',
          options: [
            {
              label:
                'El resultado esperado y observable que debe verificarse tras la acción',
              value: 'a',
            },
            {
              label: 'El estado inicial de la base de datos',
              value: 'b',
            },
            {
              label: 'El tiempo máximo de ejecución del escenario',
              value: 'c',
            },
            {
              label: 'La configuración del entorno de pruebas',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'Then/Entonces declara el resultado esperado: algo observable desde afuera (un mensaje, un estado, una respuesta). Ahí es donde la automatización hace las aserciones.',
          points: 4,
          order_index: 3,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Para qué sirven las keywords And (Y) y But (Pero) en Gherkin?',
          options: [
            {
              label: 'Para ejecutar pasos en paralelo y acelerar la suite',
              value: 'a',
            },
            {
              label:
                'Para marcar pasos opcionales que pueden fallar sin romper el escenario',
              value: 'b',
            },
            {
              label: 'Para declarar variables que se usan en los Examples',
              value: 'c',
            },
            {
              label:
                'Para encadenar pasos adicionales del mismo tipo que el paso anterior (Given/When/Then), mejorando la legibilidad',
              value: 'd',
            },
          ],
          correct_answer: { value: 'd' },
          explanation:
            'And/But heredan el tipo del paso anterior: "Dado... Y..." son dos Given. Evitan repetir la misma keyword y hacen el escenario más natural de leer. Para la herramienta son equivalentes al keyword que continúan.',
          points: 4,
          order_index: 4,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Qué hace la sección Background (Antecedentes) en un archivo .feature?',
          options: [
            {
              label:
                'Define pasos comunes que se ejecutan antes de cada escenario de la feature, evitando repetir el mismo contexto',
              value: 'a',
            },
            {
              label: 'Documenta la historia de usuario sin ejecutarse nunca',
              value: 'b',
            },
            {
              label:
                'Agrupa los escenarios que solo corren en el ambiente de staging',
              value: 'c',
            },
            {
              label: 'Define el color de fondo del reporte HTML',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'Background agrupa los Given compartidos por todos los escenarios de la feature y se ejecuta antes de cada uno. Conviene mantenerlo corto: si crece demasiado, los escenarios se vuelven difíciles de entender.',
          points: 4,
          order_index: 5,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Qué permite la directiva `# language: es` al inicio de un archivo .feature?',
          options: [
            {
              label: 'Traducir automáticamente los reportes al español',
              value: 'a',
            },
            {
              label:
                'Escribir las keywords de Gherkin en español: Característica, Escenario, Dado, Cuando, Entonces, Y, Pero',
              value: 'b',
            },
            {
              label: 'Definir el idioma de la aplicación bajo prueba',
              value: 'c',
            },
            {
              label: 'Ejecutar los steps con datos localizados en español',
              value: 'd',
            },
          ],
          correct_answer: { value: 'b' },
          explanation:
            'Gherkin soporta más de 70 idiomas. Con `# language: es` el parser acepta las keywords en español, lo que permite que los escenarios se lean naturalmente con el equipo de negocio hispanohablante.',
          points: 4,
          order_index: 6,
        },
        {
          question_type: 'true_false',
          prompt:
            'Un archivo .feature puede contener varias secciones Feature (Característica) para agrupar funcionalidades relacionadas.',
          correct_answer: { value: false },
          explanation:
            'Cada archivo .feature contiene exactamente una Feature. Si necesitás describir otra funcionalidad, va en otro archivo: eso mantiene la especificación organizada y navegable.',
          points: 4,
          order_index: 7,
        },
        {
          question_type: 'true_false',
          prompt:
            'Si dentro de un mismo escenario después de un Then aparece otro When, suele ser señal de que el escenario está especificando más de un comportamiento y conviene dividirlo.',
          correct_answer: { value: true },
          explanation:
            'El flujo recomendado es Given → When → Then. Encadenar Then → When → Then indica que hay dos comportamientos en un solo escenario; dividirlo produce especificaciones más claras y fallas más fáciles de diagnosticar.',
          points: 4,
          order_index: 8,
        },
      ],
    },
    {
      slug: 'nivel-3-escenarios-avanzados',
      title: 'Nivel 3: Escenarios avanzados y aplicación en testing',
      description:
        'Aplicá Gherkin como se usa en proyectos reales: Scenario Outline con Examples, data tables, tags, estilo declarativo vs imperativo, step definitions y escenarios independientes.',
      order_index: 3,
      max_score: 32,
      metadata: {
        instructions:
          'Preguntas sobre parametrización, organización de suites y buenas prácticas de escritura, con foco en cómo se conecta Gherkin con la automatización.',
        suggestedMinutes: 12,
      },
      questions: [
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Para qué sirve un Scenario Outline (Esquema del escenario) junto con su tabla Examples (Ejemplos)?',
          options: [
            {
              label:
                'Para ejecutar el mismo escenario varias veces con distintos datos, reemplazando placeholders como <email> por cada fila de la tabla',
              value: 'a',
            },
            {
              label:
                'Para dibujar el diagrama de flujo del escenario en el reporte',
              value: 'b',
            },
            {
              label:
                'Para definir un borrador de escenario que todavía no se ejecuta',
              value: 'c',
            },
            {
              label: 'Para agrupar escenarios de features distintas',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'Scenario Outline parametriza un escenario: los placeholders entre <> se sustituyen con cada fila de Examples, generando una ejecución por fila. Es la forma Gherkin de hacer pruebas data-driven sin duplicar texto.',
          points: 4,
          order_index: 1,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Cuál es la diferencia entre una data table (tabla de datos) y la tabla Examples de un Scenario Outline?',
          options: [
            {
              label:
                'Son exactamente lo mismo, solo cambia el nombre según la herramienta',
              value: 'a',
            },
            {
              label:
                'La data table pasa datos estructurados a un único paso; Examples genera una ejecución completa del escenario por cada fila',
              value: 'b',
            },
            {
              label:
                'Las data tables solo aceptan números y Examples solo texto',
              value: 'c',
            },
            {
              label: 'Examples se usa en Given y las data tables solo en Then',
              value: 'd',
            },
          ],
          correct_answer: { value: 'b' },
          explanation:
            'Una data table acompaña a un paso concreto (por ejemplo, "Dado los siguientes usuarios:" seguido de una tabla) y llega como argumento al step definition. Examples, en cambio, multiplica la ejecución del escenario entero.',
          points: 4,
          order_index: 2,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Para qué se usan los tags (como @smoke o @regression) en Gherkin?',
          options: [
            {
              label: 'Para asignar el escenario a un tester específico',
              value: 'a',
            },
            {
              label:
                'Para definir la prioridad con la que se corrigen los bugs',
              value: 'b',
            },
            {
              label:
                'Para organizar features y escenarios, y filtrar cuáles ejecutar (por ejemplo, correr solo @smoke en cada deploy) o engancharles hooks',
              value: 'c',
            },
            {
              label: 'Para versionar los archivos .feature en Git',
              value: 'd',
            },
          ],
          correct_answer: { value: 'c' },
          explanation:
            'Los tags permiten seleccionar subconjuntos de la suite en la ejecución (smoke, regresión, WIP) y asociar hooks condicionales. Son clave para integrar Gherkin en pipelines de CI con distintos niveles de profundidad.',
          points: 4,
          order_index: 3,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Cuál es la diferencia entre el estilo declarativo y el imperativo al escribir escenarios?',
          options: [
            {
              label:
                'El declarativo describe la intención de negocio ("Cuando el usuario inicia sesión"); el imperativo detalla interacciones de bajo nivel con la UI ("Cuando hace clic en el botón azul") y es considerado un anti-patrón',
              value: 'a',
            },
            {
              label:
                'El imperativo es más moderno y reemplazó al declarativo en Gherkin 6',
              value: 'b',
            },
            {
              label:
                'El declarativo solo sirve para APIs y el imperativo solo para web',
              value: 'c',
            },
            {
              label:
                'No hay diferencia práctica: ambos generan los mismos step definitions',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'El estilo declarativo mantiene los escenarios en el nivel del negocio y los hace resistentes a cambios de UI. El imperativo acopla la especificación a detalles de implementación: cualquier rediseño rompe decenas de escenarios.',
          points: 4,
          order_index: 4,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            "Un escenario dice: \"Cuando hago clic en el campo email / Y escribo 'ana@test.com' / Y hago clic en el campo contraseña / Y escribo '1234' / Y hago clic en el botón Ingresar\". ¿Cuál es el principal problema?",
          options: [
            {
              label: 'Le faltan tags para poder ejecutarlo en CI',
              value: 'a',
            },
            {
              label: 'Usa comillas simples en lugar de dobles para los datos',
              value: 'b',
            },
            {
              label: 'Tiene más de tres pasos, lo cual es inválido en Gherkin',
              value: 'c',
            },
            {
              label:
                'Es imperativo y está acoplado a la UI: describe clics y campos en lugar de la intención ("Cuando inicia sesión con credenciales válidas")',
              value: 'd',
            },
          ],
          correct_answer: { value: 'd' },
          explanation:
            'El escenario describe el "cómo" (clics, campos) en vez del "qué" (iniciar sesión). Un solo paso declarativo comunica la intención, se lee con negocio y sobrevive a los cambios de diseño de la pantalla.',
          points: 4,
          order_index: 5,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            'En Cucumber (o herramientas similares), ¿qué es un step definition?',
          options: [
            {
              label:
                'Un archivo de configuración que define el orden de ejecución de las features',
              value: 'a',
            },
            {
              label:
                'La función de código que se enlaza a un paso Gherkin mediante una expresión, y que ejecuta la acción o aserción correspondiente',
              value: 'b',
            },
            {
              label: 'El glosario de términos de negocio del proyecto',
              value: 'c',
            },
            {
              label: 'Un paso especial que solo existe en los reportes',
              value: 'd',
            },
          ],
          correct_answer: { value: 'b' },
          explanation:
            'Cada paso del escenario se matchea (por cucumber expressions o regex) con un step definition: la función que automatiza ese paso. Así el texto de negocio queda conectado con el código que lo verifica.',
          points: 4,
          order_index: 6,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Por qué cada escenario debe poder ejecutarse de forma independiente de los demás?',
          options: [
            {
              label:
                'Porque Gherkin no permite más de un escenario por archivo',
              value: 'a',
            },
            {
              label:
                'Porque los tags dejan de funcionar si los escenarios comparten estado',
              value: 'b',
            },
            {
              label:
                'Si un escenario depende del estado que dejó otro, no se puede ejecutar solo ni en paralelo, y una falla en cadena vuelve el diagnóstico confuso',
              value: 'c',
            },
            {
              label:
                'Para que los reportes HTML se generen en orden alfabético',
              value: 'd',
            },
          ],
          correct_answer: { value: 'c' },
          explanation:
            'Los escenarios acoplados son un anti-patrón clásico: impiden filtrar por tags, paralelizar y reintentar, y cuando uno falla arrastra a los siguientes. Cada escenario debe preparar su propio contexto en los Given.',
          points: 4,
          order_index: 7,
        },
        {
          question_type: 'true_false',
          prompt:
            'Un buen escenario Gherkin debería especificar y validar un solo comportamiento del sistema.',
          correct_answer: { value: true },
          explanation:
            'Un escenario = un comportamiento. Escenarios enfocados fallan por una sola razón, se leen como documentación clara y evitan los mega-flujos frágiles que mezclan varios objetivos de prueba.',
          points: 4,
          order_index: 8,
        },
      ],
    },
  ],
};
