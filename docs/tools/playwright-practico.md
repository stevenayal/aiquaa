# Prueba Práctica de Playwright (`/labs/playwright-practico`)

Prueba técnica **práctica** de automatización E2E con Playwright para candidatos QA (nivel básico-intermedio). El candidato automatiza 4 escenarios contra la **Test App** de AIQUAA (e-commerce mock con bugs intencionales) y entrega su proyecto por Pull Request. La verificación inicial es automática vía GitHub API y se complementa con una rúbrica de revisión humana.

> La parte **teórica** de Playwright se implementará por separado como assessment (`assessments/_shared`). Este lab cubre solo la práctica.

---

## 🎯 Resumen

- **Modalidad:** práctica, contra app real desplegada (`/labs/test-app`)
- **Duración estimada:** 60–90 minutos
- **Puntuación automática:** 100 puntos (10 checks × 10 pts), aprueba con **≥ 70**
- **Entrega:** Pull Request al repositorio del proceso de contratación
- **Gate:** código de proceso (igual que `git-practico`); el proceso debe incluir `playwright-practico` en `exam_types` y tener `repository_url` configurado
- **Revisión:** el resultado queda `pending_correction` hasta que un evaluador lo revise (el score automático es heurístico)

---

## 📋 Consigna para el candidato

### Preparación

1. Cloná el repositorio del proceso y creá una **rama** nueva a partir de `main`.
2. Dentro de la carpeta `prueba_tecnica_playwright_<tu_usuario>/`, inicializá un proyecto de Playwright:

   ```bash
   mkdir prueba_tecnica_playwright_<tu_usuario>
   cd prueba_tecnica_playwright_<tu_usuario>
   npm init playwright@latest
   ```

3. Incluí tu `playwright.config.ts` y la carpeta `tests/`. **No subas `node_modules/` ni `test-results/`** — agregá un `.gitignore`:

   ```gitignore
   node_modules/
   test-results/
   playwright-report/
   ```

4. Configurá la `baseURL` apuntando a la Test App desplegada:

   ```ts
   // playwright.config.ts
   use: {
     baseURL: 'https://aiquaa.com/labs/test-app',
   },
   ```

5. Credenciales demo: `tester@aiquaa.com` / `Test1234!`.

### Escenarios a automatizar (mínimo 3 archivos `.spec.ts`)

| # | Escenario | Criterios de aceptación |
|---|-----------|------------------------|
| 1 | **Login** | a) Con credenciales válidas, verificás que llegás al catálogo (`toHaveURL`). b) Con contraseña incorrecta, verificás que se muestra un mensaje de error (`toBeVisible`). |
| 2 | **Búsqueda en catálogo** | Buscás un término y verificás que los resultados visibles corresponden a la búsqueda (cantidad de tarjetas o texto de los productos). |
| 3 | **Carrito** | Agregás un producto desde el catálogo o el detalle, vas al carrito y verificás que el producto aparece y que el **total** es coherente con precio × cantidad. |
| 4 | **Validación de checkout** | Intentás confirmar la compra con campos obligatorios vacíos o inválidos y verificás los mensajes de validación. |

### Se valora (nivel intermedio, opcional)

- Un `beforeEach` para navegar o loguearte.
- Un Page Object simple (por ejemplo `LoginPage`).
- Locators web-first: `getByRole`, `getByLabel`, `getByPlaceholder` (la Test App **no** tiene `data-testid`).
- Evitar `waitForTimeout` y selectores CSS/XPath frágiles.
- Tests independientes entre sí (cada uno arranca desde un estado conocido).

### ⚠️ Sobre los bugs intencionales

La Test App contiene **bugs intencionales** (ver `apps/frontend/src/app/labs/test-app/README.md`). Si un assert honesto tuyo falla por un comportamiento raro de la app, probablemente encontraste uno. **Documentalo en la descripción del PR** (pasos, esperado vs. real): no te penaliza en la verificación automática (que es estática) y suma en la evaluación humana.

### Entrega

1. Commit en tu rama y **Pull Request** hacia `main` del repo del proceso.
2. En `/labs/playwright-practico`, ingresá el código del proceso, tu usuario de GitHub y el link del PR, y presioná **Verificar mi entrega**.

---

## ✅ Verificación automática (10 checks × 10 pts, aprueba ≥ 70)

La verificación es **estática**: lista los archivos del PR y lee el contenido de los specs vía GitHub API. **No ejecuta los tests.**

| # | Check | Qué valida |
|---|-------|-----------|
| 1 | `pr` | El PR fue abierto por el usuario de GitHub declarado |
| 2 | `folder` | Existe la carpeta `prueba_tecnica_playwright_<usuario>/` |
| 3 | `config` | Hay un `playwright.config.(ts\|js)` dentro de la carpeta |
| 4 | `specs` | Al menos 3 archivos `*.spec.*` / `*.test.*` |
| 5 | `locators` | Usa locators web-first (`getByRole`, `getByLabel`, …) |
| 6 | `target` | Los tests apuntan a `/labs/test-app` |
| 7 | `esc_login` | Cubre el escenario de login |
| 8 | `esc_catalogo` | Cubre la búsqueda en catálogo |
| 9 | `esc_carrito` | Cubre carrito y total |
| 10 | `esc_checkout` | Cubre la validación de checkout |

Los checks 7–10 son heurísticas por palabras clave sobre el contenido de los specs: son **señales, no prueba de un test funcionando**. El umbral de 70 tolera hasta 3 falsos negativos; la revisión humana define la nota final.

---

## 🧑‍⚖️ Rúbrica de evaluación humana (complementaria)

El resultado queda marcado como **pendiente de corrección** (`review_status: pending_correction`). El evaluador revisa el PR y puntúa:

| Dimensión | Puntos | Qué mirar |
|-----------|--------|-----------|
| **Calidad de código** | 0–10 | Nombres descriptivos, sin duplicación, `beforeEach`/fixtures bien usados, Page Object si aplica, estructura clara del proyecto |
| **Robustez / anti-flakiness** | 0–10 | Aserciones web-first con auto-wait, sin `waitForTimeout`, sin selectores CSS/XPath frágiles, tests independientes entre sí |
| **Calidad de asserts** | 0–10 | Asertan comportamiento observable (URL, textos, totales calculados), no solo "el elemento existe"; el caso negativo del login está bien cubierto |
| **Bonus** | +5 | Documentó bugs intencionales de la Test App encontrados por sus propios tests (pasos, esperado vs. real, en la descripción del PR) |

### Guía del evaluador

1. **Ver el resultado automático:** el intento aparece en el dashboard del proceso (`/empresa/procesos/[id]`) vía `process_code`; el detalle de checks está en `metadata.checks` del registro en `exam_results`.
2. **Correr los tests localmente:**

   ```bash
   git fetch origin pull/<N>/head:candidato && git checkout candidato
   cd prueba_tecnica_playwright_<usuario>
   npm install && npx playwright install chromium
   npx playwright test
   ```

3. **Importante:** la Test App tiene bugs intencionales por diseño — algunos asserts "correctos" pueden fallar legítimamente (por ejemplo el total del carrito con cambios rápidos de cantidad). Un test que falla exponiendo un bug real es una **señal positiva**, no un error del candidato.
4. Cargar la corrección manual desde el flujo de revisión de exámenes.

---

## ⚙️ Requisitos de operación

- **`GITHUB_TOKEN`** (env del backend/Vercel): token con permiso de lectura sobre el repositorio del proceso. Sin token, el rate limit anónimo de GitHub (60 req/h) hace inviable la verificación. Es el mismo token que usa `git-practico`.
- El proceso de contratación debe tener:
  - `playwright-practico` dentro de `exam_types` (se selecciona al crear el proceso en `/empresa/procesos/nuevo`).
  - `repository_url` apuntando al repo donde los candidatos suben su carpeta.
- Migración requerida: `supabase/migrations/20260714_000000_playwright_practico.sql` (amplía el CHECK de `exam_results.exam_type` — solo redefine la restricción, **no toca datos existentes**).

---

## 🧩 Arquitectura

Clona el patrón de `git-practico`:

| Pieza | Ubicación |
|-------|-----------|
| Página del lab | `apps/frontend/src/app/labs/playwright-practico/{page.tsx,PlaywrightPracticoClient.tsx}` |
| API de verificación | `apps/frontend/src/app/api/labs/playwright-practico/verify/route.ts` |
| Helpers puros (testeados) | `apps/frontend/src/lib/labs/playwrightPractico.ts` |
| Tests unitarios | `apps/frontend/src/lib/labs/__tests__/playwrightPractico.test.ts` |
| Sistema bajo prueba | `apps/frontend/src/app/labs/test-app/` |
| Migración | `supabase/migrations/20260714_000000_playwright_practico.sql` |

```bash
# Correr los tests unitarios de los helpers
pnpm --filter @aiquaa/frontend test -- --run src/lib/labs/__tests__/playwrightPractico.test.ts
```
