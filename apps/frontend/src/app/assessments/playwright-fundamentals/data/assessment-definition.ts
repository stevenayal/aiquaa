import type { AssessmentSeedDefinition } from '../../_shared/types';

export const PLAYWRIGHT_FUNDAMENTALS_SLUG = 'playwright-fundamentals';

// Bumpear cuando cambie la definición (secciones/preguntas) para forzar re-seed.
export const PLAYWRIGHT_FUNDAMENTALS_SEED_VERSION = 1;

export const playwrightFundamentalsDefinition: AssessmentSeedDefinition = {
  slug: PLAYWRIGHT_FUNDAMENTALS_SLUG,
  title: 'Playwright — Fundamentos',
  description:
    'Evaluación teórica basada en código real de Playwright y en su documentación oficial: CLI y configuración, locators web-first, assertions con auto-retry, y fixtures/hooks/debugging.',
  level: 'Junior a Semi Senior',
  type: 'QA Automatización Web',
  duration_minutes: 30,
  total_score: 100,
  is_active: true,
  metadata: {
    moduleName: 'AIQUAA Assessments / Playwright Fundamentals',
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
      slug: 'nivel-1-cli-configuracion',
      title: 'Nivel 1: Test CLI & Configuración',
      description:
        'Comandos del Playwright Test CLI y estructura básica de playwright.config.ts (proyectos, reporters).',
      order_index: 1,
      max_score: 25,
      metadata: {
        instructions:
          'Preguntas basadas en la documentación oficial: https://playwright.dev/docs/test-cli',
        suggestedMinutes: 7,
      },
      questions: [
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Qué comando de la CLI ejecuta la suite de tests de Playwright?',
          options: [
            { label: 'npx playwright test', value: 'a' },
            { label: 'npm run playwright', value: 'b' },
            { label: 'playwright run', value: 'c' },
            { label: 'npx playwright start', value: 'd' },
          ],
          correct_answer: { value: 'a' },
          explanation:
            '`npx playwright test` es el comando estándar del Test CLI para correr los tests (con o sin filtros adicionales).',
          points: 5,
          order_index: 1,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            'Dado este fragmento de playwright.config.ts y el comando ejecutado, ¿qué hace el flag --project?',
          metadata: {
            codeScenario: {
              title: 'playwright.config.ts (fragmento)',
              language: 'typescript',
              code: `export default defineConfig({
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});`,
              expectedOutput: '$ npx playwright test --project=firefox',
            },
          },
          options: [
            {
              label:
                'Ejecuta solo los tests contra el proyecto llamado "firefox" definido en la config, ignorando los demás',
              value: 'a',
            },
            {
              label: 'Instala el navegador Firefox si no está presente',
              value: 'b',
            },
            {
              label: 'Ejecuta todos los proyectos, pero reporta solo Firefox',
              value: 'c',
            },
            {
              label: 'Cambia el navegador por defecto para todos los tests',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            '--project filtra la corrida a los proyectos indicados por --name en playwright.config.ts; el resto de los proyectos configurados no se ejecutan.',
          points: 5,
          order_index: 2,
        },
        {
          question_type: 'true_false',
          prompt:
            'El flag --headed ejecuta los tests mostrando el navegador en pantalla en vez de en modo headless.',
          correct_answer: { value: true },
          explanation:
            'Por defecto Playwright corre en modo headless; --headed fuerza a que el navegador sea visible, útil para depurar visualmente.',
          points: 5,
          order_index: 3,
        },
        {
          question_type: 'multiple_choice',
          prompt: '¿Qué hace el comando "npx playwright test --debug"?',
          options: [
            {
              label:
                'Abre el Playwright Inspector para pausar la ejecución y avanzar paso a paso por el test',
              value: 'a',
            },
            {
              label: 'Genera automáticamente un reporte de cobertura',
              value: 'b',
            },
            {
              label: 'Ejecuta los tests en paralelo con más workers',
              value: 'c',
            },
            {
              label: 'Solo valida la sintaxis de los tests sin ejecutarlos',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            '--debug abre el Playwright Inspector: permite pausar, avanzar acción por acción e inspeccionar selectores mientras corre el test.',
          points: 5,
          order_index: 4,
        },
        {
          question_type: 'short_text',
          prompt:
            '¿Qué comando de la CLI abre el reporte HTML generado por la última corrida de tests?',
          expected_keywords: ['show-report'],
          explanation:
            '`npx playwright show-report` abre en el navegador el último reporte HTML generado por el reporter "html".',
          scoring_rules: {
            type: 'automatic',
            requiredKeywords: ['show-report'],
          },
          points: 5,
          order_index: 5,
        },
      ],
    },
    {
      slug: 'nivel-2-locators-acciones',
      title: 'Nivel 2: Locators & Acciones (Web-First)',
      description:
        'Locators web-first (getByRole, getByLabel, getByTestId) y su comportamiento de auto-waiting antes de actuar.',
      order_index: 2,
      max_score: 25,
      metadata: {
        instructions:
          'Preguntas basadas en la documentación oficial de locators: https://playwright.dev/docs/locators',
        suggestedMinutes: 8,
      },
      questions: [
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Por qué Playwright recomienda getByRole como locator principal en vez de selectores CSS/XPath genéricos?',
          metadata: {
            codeScenario: {
              title: 'Ejemplo de test',
              language: 'typescript',
              code: `await page.getByRole('button', { name: 'Enviar' }).click();`,
            },
          },
          options: [
            {
              label:
                'Porque refleja cómo perciben la página los usuarios y las tecnologías asistivas, en vez de depender de la estructura interna del DOM',
              value: 'a',
            },
            {
              label: 'Porque es más corto de escribir que un selector CSS',
              value: 'b',
            },
            {
              label: 'Porque no requiere que la página tenga HTML semántico',
              value: 'c',
            },
            {
              label: 'Porque solo funciona en Chromium',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'Los locators por rol/accesibilidad son más resilientes a cambios de implementación (clases, estructura) y validan que la UI sea accesible, algo que un selector CSS frágil no garantiza.',
          points: 5,
          order_index: 1,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Cuál es la diferencia principal entre getByLabel() y getByTestId()?',
          options: [
            {
              label:
                'getByLabel() ubica un control de formulario por su <label> asociado; getByTestId() ubica un elemento por su atributo data-testid, sin depender de texto ni accesibilidad',
              value: 'a',
            },
            {
              label: 'Son sinónimos, hacen exactamente lo mismo',
              value: 'b',
            },
            {
              label: 'getByTestId() solo funciona con elementos <button>',
              value: 'c',
            },
            {
              label: 'getByLabel() ignora el idioma del contenido de la página',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'getByLabel() busca inputs/controles asociados a un <label>; getByTestId() usa un atributo dedicado (por defecto data-testid) como último recurso cuando no hay un rol o texto estable.',
          points: 5,
          order_index: 2,
        },
        {
          question_type: 'true_false',
          prompt:
            'page.locator(\'#submit\') es equivalente a un locator "web-first" semántico como getByRole, ya que ambos generan el mismo tipo de selector.',
          metadata: {
            codeScenario: {
              title: 'Ejemplo de test',
              language: 'typescript',
              code: `await page.locator('#submit').click();`,
            },
          },
          correct_answer: { value: false },
          explanation:
            "page.locator('#submit') es un selector CSS genérico, frágil ante cambios de markup. getByRole/getByLabel/getByTestId son locators semánticos recomendados por sobre CSS/XPath cuando es posible.",
          points: 5,
          order_index: 3,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Qué hacen los locators web-first de Playwright automáticamente antes de ejecutar una acción como .click()?',
          options: [
            {
              label:
                'Auto-esperan (auto-waiting) a que el elemento esté adjunto al DOM, visible, habilitado y estable, reintentando hasta el timeout configurado',
              value: 'a',
            },
            {
              label: 'Recargan la página automáticamente',
              value: 'b',
            },
            {
              label:
                'Ejecutan la acción inmediatamente sin ninguna espera adicional',
              value: 'c',
            },
            {
              label: 'Toman una captura de pantalla antes de cada acción',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'El auto-waiting es central en Playwright: los locators reintentan la búsqueda del elemento y validan condiciones de "actionability" antes de interactuar, sin necesidad de sleeps manuales.',
          points: 5,
          order_index: 4,
        },
        {
          question_type: 'short_text',
          prompt:
            '¿Qué atributo HTML usa por defecto getByTestId() para ubicar un elemento?',
          expected_keywords: ['data-testid'],
          explanation:
            'Por defecto getByTestId() busca el atributo data-testid; puede reconfigurarse con testIdAttribute en playwright.config.ts.',
          scoring_rules: {
            type: 'automatic',
            requiredKeywords: ['data-testid'],
          },
          points: 5,
          order_index: 5,
        },
      ],
    },
    {
      slug: 'nivel-3-assertions',
      title: 'Nivel 3: Assertions & Auto-waiting',
      description:
        'Aserciones auto-retrying de Playwright (expect(locator)...) frente a aserciones genéricas sobre valores ya resueltos.',
      order_index: 3,
      max_score: 25,
      metadata: {
        instructions:
          'Preguntas basadas en la documentación oficial de assertions: https://playwright.dev/docs/test-assertions',
        suggestedMinutes: 8,
      },
      questions: [
        {
          question_type: 'multiple_choice',
          prompt:
            'En este código, si el texto "Bienvenido" todavía no apareció en el DOM cuando corre la línea, ¿qué hace Playwright?',
          metadata: {
            codeScenario: {
              title: 'Ejemplo de test',
              language: 'typescript',
              code: `await expect(page.getByText('Bienvenido')).toBeVisible();`,
            },
          },
          options: [
            {
              label:
                'Reintenta automáticamente la aserción hasta que el texto sea visible o se cumpla el timeout, en vez de fallar de inmediato',
              value: 'a',
            },
            {
              label: 'Falla inmediatamente sin reintentar',
              value: 'b',
            },
            {
              label: 'Recarga la página y vuelve a intentar desde cero',
              value: 'c',
            },
            {
              label: 'Ignora la aserción si el elemento no existe todavía',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'toBeVisible() (como la mayoría de los matchers de expect(locator)) es auto-retrying: reintenta hasta cumplirse la condición o vencer el timeout, evitando falsos negativos por timing.',
          points: 5,
          order_index: 1,
        },
        {
          question_type: 'true_false',
          prompt:
            "expect(locator).toHaveText('foo') es una aserción auto-retrying: reintenta hasta que el contenido coincida o venza el timeout.",
          correct_answer: { value: true },
          explanation:
            'Los matchers que reciben un Locator (toHaveText, toBeVisible, toHaveValue, etc.) son auto-retrying por diseño.',
          points: 5,
          order_index: 2,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Por qué esta aserción NO es auto-retrying aunque use expect()?',
          metadata: {
            codeScenario: {
              title: 'Ejemplo de test',
              language: 'typescript',
              code: `const items = await page.getByRole('listitem').all();
expect(items.length).toBe(3);`,
            },
          },
          options: [
            {
              label:
                'Porque expect() recibe un número ya resuelto por .all(), no un Locator: expect(valor).toBe() es una aserción genérica sin reintentos automáticos',
              value: 'a',
            },
            {
              label: 'Porque toBe() nunca existe en Playwright',
              value: 'b',
            },
            {
              label: 'Porque getByRole no soporta listitem',
              value: 'c',
            },
            {
              label: 'Porque .all() lanza una excepción si hay 3 elementos',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            '.all() resuelve la lista de elementos en ese instante; a partir de ahí expect(items.length).toBe(3) es una aserción "de valor" común de Jest/Vitest, no una aserción de Playwright sobre un Locator.',
          points: 5,
          order_index: 3,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Cuál es la forma recomendada de esperar a que un elemento desaparezca de la pantalla?',
          options: [
            {
              label:
                'await expect(locator).toBeHidden() (o toBeVisible con negación), en vez de un sleep/wait manual con tiempo fijo',
              value: 'a',
            },
            {
              label: 'await page.waitForTimeout(5000)',
              value: 'b',
            },
            {
              label: 'Recargar la página hasta que el elemento no aparezca',
              value: 'c',
            },
            {
              label: 'No hay forma de esperar eso en Playwright',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'toBeHidden()/not.toBeVisible() son auto-retrying y evitan sleeps arbitrarios, que son frágiles y hacen los tests más lentos o flaky.',
          points: 5,
          order_index: 4,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Qué helper de Playwright permite reintentar un bloque de código arbitrario (no solo una aserción sobre un Locator) hasta que no lance error o venza el timeout?',
          metadata: {
            codeScenario: {
              title: 'Ejemplo de test',
              language: 'typescript',
              code: `await expect(async () => {
  const response = await page.request.get('/api/status');
  expect(response.status()).toBe(200);
}).toPass();`,
            },
          },
          options: [
            {
              label:
                'Envolver el bloque en una función async y encadenar .toPass() sobre expect(fn)',
              value: 'a',
            },
            { label: 'page.retry(fn)', value: 'b' },
            { label: 'test.repeat(fn)', value: 'c' },
            { label: 'No existe ese mecanismo en Playwright', value: 'd' },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'expect(async () => { ... }).toPass() reintenta todo el bloque hasta que no lance ninguna excepción o se agote el timeout, útil para lógica de reintento que no depende de un Locator.',
          points: 5,
          order_index: 5,
        },
      ],
    },
    {
      slug: 'nivel-4-fixtures-hooks-debugging',
      title: 'Nivel 4: Fixtures, Hooks & Debugging',
      description:
        'Fixtures built-in y custom, hooks de test.beforeEach/afterEach y herramientas de debugging (Inspector, Trace Viewer, UI mode).',
      order_index: 4,
      max_score: 25,
      metadata: {
        instructions:
          'Preguntas basadas en la documentación oficial de fixtures: https://playwright.dev/docs/test-fixtures',
        suggestedMinutes: 7,
      },
      questions: [
        {
          question_type: 'multiple_choice',
          prompt: '¿Qué hace test.beforeEach en este ejemplo?',
          metadata: {
            codeScenario: {
              title: 'Ejemplo de test',
              language: 'typescript',
              code: `test.beforeEach(async ({ page }) => {
  await page.goto('https://example.com');
});

test('el título es correcto', async ({ page }) => {
  await expect(page).toHaveTitle(/Example/);
});`,
            },
          },
          options: [
            {
              label:
                'Se ejecuta antes de cada test del archivo (o describe), recibiendo fixtures como page para preparar el estado inicial',
              value: 'a',
            },
            {
              label:
                'Se ejecuta una sola vez antes de todos los archivos de test',
              value: 'b',
            },
            {
              label: 'Reemplaza al test y nunca corre el bloque test()',
              value: 'c',
            },
            {
              label: 'Solo corre si el test anterior falló',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'test.beforeEach corre antes de cada test dentro de su mismo archivo o describe, y puede recibir fixtures (como page) igual que un test.',
          points: 5,
          order_index: 1,
        },
        {
          question_type: 'true_false',
          prompt:
            'Las fixtures built-in como page, context y browser se crean automáticamente para cada test y se limpian al finalizar, sin que el test tenga que gestionarlas manualmente.',
          correct_answer: { value: true },
          explanation:
            'Playwright Test gestiona el ciclo de vida de las fixtures built-in: las crea antes del test y las libera después, aislando cada test.',
          points: 5,
          order_index: 2,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Qué representa la llamada a use(page) dentro de esta fixture custom?',
          metadata: {
            codeScenario: {
              title: 'Fixture custom',
              language: 'typescript',
              code: `export const test = base.extend({
  loggedInPage: async ({ page }, use) => {
    await page.goto('/login');
    await page.getByLabel('Usuario').fill('demo');
    await page.getByRole('button', { name: 'Ingresar' }).click();
    await use(page);
    // (opcional) código de teardown después de esta línea
  },
});`,
            },
          },
          options: [
            {
              label:
                'Es el punto donde se entrega el valor de la fixture al test; la ejecución se pausa ahí hasta que el test termina, y luego continúa el código de teardown posterior',
              value: 'a',
            },
            {
              label: 'Finaliza la fixture inmediatamente y no ejecuta el test',
              value: 'b',
            },
            {
              label: 'Solo sirve para loguear mensajes en consola',
              value: 'c',
            },
            {
              label: 'Es obligatorio pero no tiene ningún efecto en el test',
              value: 'd',
            },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'use() entrega el valor de la fixture (en este caso, la page ya logueada) al test que la solicitó; cualquier código después de use() corre como teardown una vez que el test terminó.',
          points: 5,
          order_index: 3,
        },
        {
          question_type: 'multiple_choice',
          prompt:
            '¿Qué comando de la CLI abre el Trace Viewer para inspeccionar una corrida fallida?',
          options: [
            { label: 'npx playwright show-trace trace.zip', value: 'a' },
            { label: 'npx playwright open-trace', value: 'b' },
            { label: 'npx playwright test --trace-only', value: 'c' },
            { label: 'npx playwright inspect trace.zip', value: 'd' },
          ],
          correct_answer: { value: 'a' },
          explanation:
            'npx playwright show-trace trace.zip abre el Trace Viewer, con la línea de tiempo, DOM snapshots, red y consola de esa corrida.',
          points: 5,
          order_index: 4,
        },
        {
          question_type: 'short_text',
          prompt:
            '¿Qué flag de la CLI abre el modo interactivo (UI mode) para ver y depurar los tests con una línea de tiempo visual?',
          expected_keywords: ['--ui'],
          explanation:
            'npx playwright test --ui abre el UI mode: una interfaz gráfica para explorar, correr y depurar tests con timeline y watch mode.',
          scoring_rules: {
            type: 'automatic',
            requiredKeywords: ['--ui'],
          },
          points: 5,
          order_index: 5,
        },
      ],
    },
  ],
};
