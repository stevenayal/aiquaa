# Plan de trabajo UX — AIQUAA

**Marco de referencia:** las 30 leyes de [Laws of UX](https://lawsofux.com/es/) (versión en español).
**Alcance auditado:** `apps/frontend` — 292 archivos `.tsx`, 157 páginas, ~60.000 líneas.
**Fecha:** septiembre 2026 · **Rama:** `claude/ux-laws-audit-0bt0gz`

---

## 1. Por qué este documento

AIQUAA tiene un problema de UX que no es de gusto ni de estética: **es de sistema**. El producto creció por
adición de páginas (18 assessments, 35 labs, 21 pantallas de empresa) sin una capa compartida que
imponga consistencia. El resultado medible:

| Señal                                                | Valor                            |
| ---------------------------------------------------- | -------------------------------- |
| Archivos que usan las primitivas de `components/ui/` | **4 de 286** (1,4 %)             |
| Variantes únicas de botón escritas a mano            | **105** (82 usadas una sola vez) |
| Variantes únicas de card / badge / input             | **79 / 32 / 57**                 |
| Familias de color Tailwind en uso simultáneo         | **19**                           |
| Páginas con `loading.tsx`                            | **2 de 157**                     |
| Modales con `role="dialog"` + foco atrapado          | **2 de 10**                      |
| Atributos ARIA útiles vs. elementos interactivos     | 67 vs. ~844 (ratio **0,08**)     |

Las leyes de UX son el criterio que usamos para decidir **qué arreglar primero**: no todo lo inconsistente
duele igual. Este plan ordena el trabajo por el daño real al usuario, no por el tamaño del refactor.

---

## 2. Diagnóstico en una página

| Dimensión                            | Estado           | Ley principal en juego                           |
| ------------------------------------ | ---------------- | ------------------------------------------------ |
| Consistencia visual                  | 🔴 Crítico       | Ley de Jakob, Ley de la Semejanza, Prägnanz      |
| Accesibilidad                        | 🔴 Crítico       | Ley de Postel, Efecto Von Restorff               |
| Arquitectura de elección (catálogos) | 🔴 Crítico       | Ley de Hick, Sobrecarga de Opciones, Miller      |
| Feedback del sistema                 | 🟠 Alto          | Umbral de Doherty, Efecto Zeigarnik              |
| Prevención de errores                | 🟠 Alto          | Ley de Postel, Regla de Fin de Pico              |
| Onboarding y primer uso              | 🟠 Alto          | Paradoja del Usuario Activo, Modelo Mental       |
| Carga cognitiva en pantallas densas  | 🟡 Medio         | Carga Cognitiva, Fragmentación, Proximidad       |
| Motivación y progreso                | 🟢 Bien resuelto | Tendencia a la Meta, Zeigarnik (gamificación XP) |
| Persistencia de trabajo del usuario  | 🟢 Bien resuelto | Ley de Tesler (autosave + `beforeunload`)        |

---

## 3. Las 30 leyes aplicadas a AIQUAA

Cada ley, qué dice, y dónde se está incumpliendo o cumpliendo hoy.

### Grupo A — Cómo la gente elige (5 leyes)

| Ley                        | Qué dice                                                                | Estado en AIQUAA                                                                                                                                                                                     |
| -------------------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Ley de Hick**            | El tiempo de decisión crece con el número y la complejidad de opciones. | 🔴 `/assessments` muestra 15 tarjetas full-width en **una sola columna**, sin buscador, filtro ni agrupación. `page.tsx` no tiene un solo `useState` ni `input`. Estimado: 5.000–7.000 px de scroll. |
| **Sobrecarga de Opciones** | Demasiadas opciones abruman y empeoran la percepción general.           | 🔴 35 herramientas en `/labs` y 15 assessments sin comparación lado a lado ni "recomendado para vos".                                                                                                |
| **Ley de Miller**          | ~7 (±2) elementos en memoria de trabajo.                                | 🟠 Las tarjetas de assessment listan 4 chips + 3-5 subtarjetas de nivel cada una: el usuario no puede sostener la comparación.                                                                       |
| **Principio de Pareto**    | El 80 % del efecto viene del 20 % de las causas.                        | 🟡 No hay datos de uso por assessment/lab. Sin telemetría no se sabe qué 20 % destacar.                                                                                                              |
| **Ley de Parkinson**       | La tarea se estira hasta consumir el tiempo disponible.                 | 🟠 El cronómetro de sección (`AssessmentTimer.tsx:16`) usa `useState(0)` sin persistir: **se reinicia en cada recarga** y miente en la dirección peligrosa.                                          |

### Grupo B — Cómo la gente percibe y agrupa (7 leyes Gestalt)

| Ley                              | Qué dice                                                                   | Estado en AIQUAA                                                                                                                                                                            |
| -------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Ley de Proximidad**            | Lo cercano se percibe como agrupado.                                       | 🟡 Se aplica por intuición, sin escala de espaciado. `p-8`, `p-6`, `p-4` conviven sin regla.                                                                                                |
| **Ley de la Semejanza**          | Lo visualmente similar se percibe como relacionado y con la misma función. | 🔴 **105 variantes de botón**. El "botón primario" existe en indigo-600, amber-600, blue-600, purple-600, cyan-400, green-600 y `bg-brand-accent`. Lo que hace lo mismo no se ve igual.     |
| **Ley de Región Común**          | Un borde o fondo compartido agrupa.                                        | 🟠 79 variantes de card: la "región común" cambia de forma según la pantalla.                                                                                                               |
| **Ley de Conectividad Uniforme** | Los elementos conectados visualmente se perciben más relacionados.         | 🟡 Poco explotado: los niveles de un assessment no se leen como una secuencia conectada.                                                                                                    |
| **Ley de Prägnanz**              | El ojo simplifica lo complejo; se procesan mejor las formas simples.       | 🟠 19 familias de color y `gray`/`slate` mezclados (2.949 vs. 2.815 usos) — dos grises de temperatura distinta en la misma UI.                                                              |
| **Efecto Von Restorff**          | Se recuerda lo que se distingue del resto.                                 | 🔴 Con 105 estilos de botón compitiendo, **nada destaca**: el CTA principal no gana la mirada. Agravante: 756 emojis usados como iconos, `✓`/`✅` y `✗`/`❌`/`✕` para el mismo significado. |
| **Efecto de Posición en Serie**  | Se recuerda el primero y el último de una serie.                           | 🟡 El orden de `assessmentCards` es histórico, no intencional: lo más valioso queda en el medio.                                                                                            |

### Grupo C — Límites cognitivos (5 leyes)

| Ley                          | Qué dice                                                                                      | Estado en AIQUAA                                                                                                                                                     |
| ---------------------------- | --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Carga Cognitiva**          | Recursos mentales para entender la interfaz; la carga extrínseca es la que se puede eliminar. | 🟠 `/perfil` = 1.579 líneas, 8 secciones apiladas en una columna `max-w-2xl`; un usuario nuevo scrollea 5 tarjetas vacías antes de algo accionable.                  |
| **La Memoria de Trabajo**    | 4–7 fragmentos, se desvanecen en 20–30 s.                                                     | 🟠 Sin comparador entre assessments: hay que recordar el nivel y la duración de la tarjeta anterior.                                                                 |
| **Fragmentación (Chunking)** | Agrupar en bloques significativos con jerarquía clara.                                        | 🟢 `/labs` lo hace bien (7 categorías + destacados). 🔴 `/assessments` no lo hace en absoluto — el contraste entre ambas es la prueba de que el equipo ya sabe cómo. |
| **Atención Selectiva**       | Se filtra lo irrelevante; se ignora lo que parece publicidad.                                 | 🟡 El banner de registro para invitados en `/labs` está bien ubicado; revisar que no caiga en ceguera de banner.                                                     |
| **Sesgo Cognitivo**          | Atajos mentales que sesgan el juicio.                                                         | 🟡 Sin pruebas con usuarios reales, las decisiones de diseño se validan por sesgo de confirmación del equipo.                                                        |

### Grupo D — Expectativas y modelos mentales (4 leyes)

| Ley                             | Qué dice                                                            | Estado en AIQUAA                                                                                                                                                                                                                                                                                                                                                                                                      |
| ------------------------------- | ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Ley de Jakob**                | La gente espera que tu sitio funcione como los demás que ya conoce. | 🔴 El mismo tipo de pantalla se ve distinto según por dónde se entre: `api-testing-fundamentals/components/` es un **fork divergente** de `_shared/components/` (12 componentes, los 12 con drift). `QuestionCard`/`ResultsScreen`/`ExamSimulator` están **triplicados** en labs git/istqb/performance.                                                                                                               |
| **Modelo Mental**               | Alinear el diseño con lo que el usuario cree que va a pasar.        | 🟠 El registro pide el rol como campo **obligatorio** y luego lo descartaba (ver §6). El usuario cree que el sistema lo conoce; el sistema no lo conoce.                                                                                                                                                                                                                                                              |
| **Paradoja del Usuario Activo** | Nadie lee manuales; hay que integrar la guía en el flujo.           | 🟠 Existe `SuruOnboarding`, pero el usuario recién registrado aterriza en **`/ranking?welcome=1`** — una tabla de posiciones donde tiene 0 XP — en vez del dashboard, que sí tiene estados vacíos accionables.                                                                                                                                                                                                        |
| **Ley de Postel**               | Sé liberal en lo que aceptás, conservador en lo que enviás.         | ✅ Corregido. El diagnóstico inicial era impreciso: el email con espacios **nunca llegaba a Supabase**. Las regex anclan en `^`/`$`, así que la validación local lo cortaba antes con "Correo inválido" — no había "Credenciales inválidas" ni culpa a la contraseña. En el registro era más engañoso: `RegisterForm:58` ya enviaba con `.trim()`, pero `validateRegisterForm` validaba sin recortar y corre primero. |

### Grupo E — Tiempo, respuesta y memoria de la experiencia (5 leyes)

| Ley                               | Qué dice                                                                                 | Estado en AIQUAA                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| --------------------------------- | ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Umbral de Doherty**             | Feedback en <400 ms; usar rendimiento percibido.                                         | 🔴 **2 `loading.tsx` para 157 páginas.** 25 de 69 páginas cliente con fetch no tienen ningún indicador de carga, incluidas `/`, `/labs` y las 17 `assessments/*/start`. **93 de 157 páginas son `'use client'` completas** (la home son 674 líneas enviadas al navegador) y hay **0 usos de `next/dynamic`**.                                                                                                                                                           |
| **Efecto Zeigarnik**              | Se recuerdan las tareas incompletas; el progreso motiva.                                 | 🟢 Bien: barra de progreso por herramienta en `/labs`, XP, racha, check-in diario.                                                                                                                                                                                                                                                                                                                                                                                      |
| **Efecto de Tendencia a la Meta** | Cuanto más cerca de la meta, más empuje.                                                 | 🟢 Bien: `AssessmentProgress` muestra secciones completadas. 🟡 Falta cerrar el ciclo: no hay "te faltan 2 para el logro X".                                                                                                                                                                                                                                                                                                                                            |
| **Regla de Fin de Pico**          | Se juzga la experiencia por su pico y su final; lo negativo se recuerda más vívidamente. | 🔴 El **final** del flujo más importante es el peor momento: enviar una sección **corrige de forma irreversible sin confirmación ni chequeo de preguntas en blanco** (`AssessmentSectionScreen.tsx:482`). Un clic accidental quema el nivel.                                                                                                                                                                                                                            |
| **Fluir (Flow)**                  | Equilibrio entre desafío y habilidad, feedback claro, sin fricción.                      | 🟡 De 93 bloques `catch`, **33 en componentes cliente no informan nada al usuario**. Matiz importante: 16 están en `labs/test-app` (la app con bugs a propósito) y el flujo de assessments **sí** maneja bien sus errores (`setSavingMessage('No se pudo guardar')`, `setSubmitError`). El problema real son ~17 catches mudos en herramientas de labs (`json-to-testplans` ×5, `base64-converter` ×3, `allpairs` ×3): el usuario pega un JSON inválido y no pasa nada. |

### Grupo F — Simplicidad y estética (4 leyes)

| Ley                                                     | Qué dice                                                                 | Estado en AIQUAA                                                                                                                                                                                                                                              |
| ------------------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **La Navaja de Occam**                                  | Eliminar todo lo eliminable sin comprometer la función.                  | 🔴 ~2.500 líneas duplicadas en 18 páginas `start/`, ya divergidas (docker usa `useState`, api-testing usa `useTransition` y **omite el `slug`** al iniciar el intento).                                                                                       |
| **Ley de Tesler**                                       | Hay complejidad irreducible: la carga debe ir al sistema, no al usuario. | 🟢 Bien: autosave con debounce de 500 ms, recarga de respuestas guardadas, guard `beforeunload`, redirect automático si el intento ya está corregido. 🔴 Mal: el cronómetro deja la carga de recordar el tiempo en el usuario.                                |
| **Efecto de Estética-Usabilidad**                       | Lo bello se percibe como más usable; la estética puede tapar problemas.  | 🟠 Riesgo activo: el tema oscuro es atractivo y disimula que el **modo claro está roto** en las pantallas de assessment (`AssessmentSectionScreen.tsx:282` — tarjetas `bg-slate-900/80` fijas con texto que hereda `slate-900`: casi negro sobre casi negro). |
| **Efecto Zeigarnik / Von Restorff (aplicados a marca)** | —                                                                        | Ver arriba.                                                                                                                                                                                                                                                   |

---

## 4. Backlog priorizado

Prioridad = daño al usuario × frecuencia del camino afectado. El esfuerzo es orientativo, en días-persona.

### P0 — Bugs que rompen el uso (≈ 1 sprint)

| #    | Hallazgo                                                                                                                                                                                                                                            | Evidencia                                                              | Ley                           | Esf.     |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ----------------------------- | -------- |
| P0-1 | **Modo oscuro mixto.** `tailwind.config.js:8` usa `darkMode:'class'` pero `globals.css` definía los tokens oscuros solo bajo `@media (prefers-color-scheme: dark)`. El toggle aplicaba las utilidades `dark:` sobre tokens claros.                  | `globals.css:36`                                                       | Prägnanz, Estética-Usabilidad | ✅ hecho |
| P0-2 | **El rol del registro se descartaba.** `['comunidad','admin'].includes(role)` — ninguno de los 7 valores del selector pasa el filtro. Campo obligatorio tirado a la basura.                                                                         | `actions/auth.ts:44`                                                   | Modelo Mental                 | ✅ hecho |
| P0-3 | **3 assessments inalcanzables.** `cicd-fundamentals`, `kubernetes-helm-fundamentals`, `observability-fundamentals`: páginas, registry, seed y scoring completos, ausentes de todo catálogo. ~17 % del contenido construido.                         | `assessments/page.tsx:19`                                              | Hick, Pareto                  | ✅ hecho |
| P0-4 | **Modo claro ilegible en assessments.** Tarjetas de pregunta `bg-slate-900/80` fijas, enunciado hereda `text-slate-900`.                                                                                                                            | `AssessmentSectionScreen.tsx:282,287`; `AssessmentResultScreen.tsx:28` | Estética-Usabilidad           | ✅ hecho |
| P0-5 | **Envío irreversible sin confirmación.** Sin modal, sin contar preguntas en blanco, mismo tratamiento visual que "continuar".                                                                                                                       | `AssessmentSectionScreen.tsx:482`; `SectionNavigator.tsx:38`           | Fin de Pico, Postel           | ✅ hecho |
| P0-6 | **Login y registro rechazan emails con espacios.** La validación local corta con "Correo inválido" antes de autenticar (las regex anclan en `^`/`$`). En el registro, el `.trim()` del envío nunca se ejecutaba porque la validación corre primero. | `LoginForm.tsx:59`; `AuthForm.tsx:354`; `validateRegisterForm.ts:50`   | **Ley de Postel**             | ✅ hecho |

### P1 — Fricción alta en caminos frecuentes (≈ 2 sprints)

| #    | Hallazgo                                                                                                                                                                                                                                        | Ley                                         | Esf. |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ---- |
| P1-1 | **Rediseñar `/assessments` con el patrón de `/labs`**: categorías, destacados, badge "Aprobado", mejor puntaje, grilla multi-columna. El equipo ya resolvió esto una vez.                                                                       | Hick, Fragmentación, Sobrecarga de Opciones | 3    |
| P1-2 | **Buscador + filtros** en `/assessments` y `/labs` (por tecnología, nivel, estado).                                                                                                                                                             | Hick, Memoria de Trabajo                    | 2    |
| P1-3 | **Toast/diálogo único**: reemplazar 10 `alert()` y 9 `confirm()` nativos (bloquean el hilo, no respetan el tema, en móvil muestran el dominio). Hoy conviven 4 mecanismos de feedback.                                                          | Jakob, Semejanza, Doherty                   | 3    |
| P1-4 | **`loading.tsx` y `error.tsx` por sección** (`/empresa` son 21 páginas sin boundary propio) + skeletons en las 25 páginas con fetch sin indicador.                                                                                              | Umbral de Doherty                           | 3    |
| P1-5 | **Cronómetro persistente** (guardar `startedAt` del intento en vez de contar desde el montaje).                                                                                                                                                 | Parkinson, Tesler                           | 1    |
| P1-6 | **Redirigir el post-registro a `/dashboard`**, no a `/ranking?welcome=1`.                                                                                                                                                                       | Paradoja del Usuario Activo                 | 0,5  |
| P1-7 | **Errores de formulario accesibles**: `role="alert"`, `aria-invalid`, `aria-describedby`, foco al primer campo con error.                                                                                                                       | Postel, Atención Selectiva                  | 2    |
| P1-8 | **Barrido de los 33 `catch` mudos en componentes cliente** (excluyendo los 16 de `labs/test-app`, que son intencionales): cada uno informa al usuario o documenta por qué no. Empezar por `json-to-testplans`, `base64-converter` y `allpairs`. | Fluir                                       | 1,5  |

### P2 — Sistema de diseño (≈ 3 sprints, habilita todo lo demás)

| #    | Hallazgo                                                                                                                                                                                                                          | Ley                            | Esf. |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ | ---- |
| P2-1 | **Construir `Button`, `Card`, `Badge`, `Input`, `Modal` reales** y migrar por orden de frecuencia: los 158 `<button>` con estilos primero. Hoy `button.tsx` tiene un `cva` con 6 variantes que **no se renderiza en producción**. | Semejanza, Von Restorff, Jakob | 8    |
| P2-2 | **Unificar el neutro**: elegir `slate` o `gray` y migrar el otro (2.949 + 2.815 usos). Reducir de 19 familias de color a una paleta de ~6 roles semánticos.                                                                       | Prägnanz                       | 5    |
| P2-3 | **Escala tipográfica**: hoy `h1` tiene 6 tamaños distintos y hay `h2` en `text-3xl` sobre `h1` en `text-xl` — el h2 es más grande que el h1. Definir 5 niveles y migrar los 443 headings.                                         | Prägnanz, Fragmentación        | 4    |
| P2-4 | **Eliminar el sistema dual de tema**: 1.736 ternarios `isDarkMode ? … : …` en 100 archivos conviven con 1.162 variantes `dark:`; 38 archivos usan ambos. Migrar todo a `dark:`.                                                   | Prägnanz                       | 6    |
| P2-5 | **Iconografía única**: reemplazar los 756 emojis-como-icono por `lucide-react` (ya instalado, usado en 3 archivos). Resuelve tamaño, color y renderizado por plataforma.                                                          | Von Restorff, Semejanza        | 4    |
| P2-6 | **Deduplicar**: eliminar el fork `api-testing-fundamentals/components/`, unificar los triplicados de labs, migrar las 18 páginas `start/` a `_shared`.                                                                            | Navaja de Occam, Jakob         | 5    |
| P2-7 | **Sincronizar tokens**: `brand.primary #1e40af` vs. `--primary ≈ #3b82f6` son dos primarios distintos. Y `bg-card` tiene **0 usos**.                                                                                              | Prägnanz                       | 2    |

### P3 — Accesibilidad y rendimiento percibido (≈ 2 sprints, transversal)

| #    | Hallazgo                                                                                                                                                                                                         | Ley                | Esf. |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ | ---- |
| P3-1 | **8 de 10 modales sin `role="dialog"`, sin trampa de foco, sin `Escape`.** Bloqueante para teclado en todo el flujo B2B. Instalar `@radix-ui/react-dialog` (ya hay 3 paquetes Radix).                            | Postel             | 3    |
| P3-2 | **10 elementos no interactivos con `onClick`**, ninguno con `role` + `tabIndex` + `onKeyDown`. Incluye la fila de candidato (`empresa/candidatos:1348`), acción principal del listado B2B.                       | Postel             | 1    |
| P3-3 | **Contraste**: 186 usos de `text-gray-400` sin variante `dark:` sobre fondo claro = 2,85:1 (AA pide 4,5:1). 327 líneas combinan `text-xs` con gris claro. Incluye el botón mostrar/ocultar contraseña del login. | Von Restorff       | 3    |
| P3-4 | **Labels sin asociar**: 223 `<label>` para 50 `htmlFor`. ~78 % de 264 campos no se anuncian.                                                                                                                     | Postel             | 3    |
| P3-5 | **`aria-live` para estados asíncronos**: 54 archivos con spinner, 3 `aria-live` en total.                                                                                                                        | Doherty            | 2    |
| P3-6 | **`prefers-reduced-motion`**: 838 animaciones, 4 referencias. La mascota Suru y los carruseles siguen animando.                                                                                                  | Fluir (WCAG 2.3.3) | 1    |
| P3-7 | **Convertir a Server Components** las páginas más pesadas (`empresa/candidatos` 1.878 líneas, `perfil` 1.579, `ranking` 1.395, y la **home** 674) + `next/dynamic` para lo pesado.                               | Umbral de Doherty  | 5    |
| P3-8 | **Skip link + landmarks**: 30 landmarks para 157 páginas, ningún "saltar al contenido".                                                                                                                          | Postel             | 1    |

### P4 — Medición (continuo)

| #    | Acción                                                                                                                                | Ley                 |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| P4-1 | Telemetría por assessment y lab: aperturas, inicios, abandonos por sección, tasa de finalización. Sin esto, Pareto es una corazonada. | Principio de Pareto |
| P4-2 | 5 pruebas de usabilidad moderadas sobre el flujo "elegir assessment → completarlo → ver resultado".                                   | Sesgo Cognitivo     |
| P4-3 | Extender el _Definition of Done_ del repo con la checklist de §7.                                                                     | Todas               |

---

## 5. Plan por fases

```
Fase 0  ✅ HECHO      Bugs bloqueantes (P0-1, P0-2, P0-3)
Fase 1  ✅ HECHO      Resto de P0: modo claro en assessments, confirmación de envío, Postel en login
Fase 2  Sprints 2-3   P1: catálogo navegable, toasts, loading/error boundaries, onboarding
Fase 3  Sprints 4-6   P2: sistema de diseño y deduplicación  ← habilita todo lo posterior
Fase 4  Sprints 7-8   P3: accesibilidad y rendimiento percibido
Fase 5  Continuo      P4: medición y validación con usuarios
```

**Por qué este orden.** P0 y P1 son daño directo en los caminos que todo usuario recorre. P2 parece más
urgente por su tamaño, pero es un refactor: si se hace antes de arreglar el envío irreversible de una
sección, se estará puliendo la tipografía de una pantalla que le hace perder el examen a la gente.
Dicho eso, **P2 no se puede postergar indefinidamente**: cada assessment nuevo agrega ~500 líneas de
estilos a mano y la deuda crece más rápido de lo que se paga.

---

## 6. Ya corregido en esta rama

| Fix                                                                                                                                                                                                                                                                | Archivos                                                                                                              | Ley                               |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| **Modo oscuro coherente.** Tokens oscuros movidos a `.dark`; el `@media` queda como fallback guardado por `:root:not(.light)`. `ThemeContext` aplica ambas clases y `color-scheme`. Script anti-FOUC en `<head>` para que el tema se pinte antes del primer frame. | `app/globals.css`, `contexts/ThemeContext.tsx`, `app/layout.tsx`                                                      | Prägnanz, Doherty                 |
| **El rol elegido se guarda.** Nueva fuente de verdad `lib/auth/roles.ts` (`COMMUNITY_ROLES` + `isCommunityRole`), usada por el formulario y por la persistencia.                                                                                                   | `lib/auth/roles.ts` (nuevo), `actions/auth.ts`, `components/auth/AuthForm.tsx`                                        | Modelo Mental                     |
| **3 assessments visibles.** CI/CD, Kubernetes+Helm y Observabilidad agregados al catálogo.                                                                                                                                                                         | `app/assessments/page.tsx`                                                                                            | Hick, Pareto                      |
| **Modo claro legible en assessments.** 142 clases oscuras fijas en 17 componentes pasan a claro-por-defecto + variante `dark:`. De paso se sube el contraste del texto secundario a AA (`slate-400` → `slate-500` en claro).                                       | `_shared/components/*` (17)                                                                                           | Estética-Usabilidad, Von Restorff |
| **Confirmación antes de corregir.** `SubmitSectionDialog` avisa que el envío es irreversible y cuenta las preguntas en blanco. Accesible: `role="dialog"`, `aria-modal`, Escape, trampa de foco, foco inicial en la acción segura.                                 | `_shared/components/SubmitSectionDialog.tsx` (nuevo), `_shared/lib/answers.ts` (nuevo), `AssessmentSectionScreen.tsx` | Fin de Pico                       |
| **Login y registro aceptan emails con espacios.** `trim()` antes de validar y de enviar; el input pasa a `type="email"` (teclado con `@` en móvil) y el form a `noValidate`.                                                                                       | `LoginForm.tsx`, `AuthForm.tsx`, `validateRegisterForm.ts`                                                            | Postel                            |
| **El registro deshabilita su botón al enviar.** `isPending` de `useTransition` no sirve: en React 18 la transición termina en el primer `await`, así que el botón nunca se deshabilitaba y el alta era duplicable.                                                 | `RegisterForm.tsx`                                                                                                    | Doherty, Tesler                   |
| **Suite de tests en verde.** De 32 tests rojos a 0 (436 pasando). La causa mayor era `window.matchMedia` sin polyfill en jsdom; el resto, tests apuntando a módulos de la era NextAuth que ya no existen.                                                          | `test/setup.ts` + 8 archivos de test                                                                                  | —                                 |

> `role` en `user_metadata` es un dato declarativo de perfil, **no un permiso**. Verificado: solo se lee en
> `perfil/page.tsx:170` para mostrarlo. La autorización no depende de este valor.

---

## 7. Checklist de UX para PRs

Ampliación del _Definition of Done_ de `CLAUDE.md`. Un PR de frontend no se mergea sin esto:

- [ ] **Semejanza** — ¿usa las primitivas de `components/ui/` en vez de Tailwind crudo? Si no, ¿por qué?
- [ ] **Von Restorff** — ¿hay exactamente **un** CTA primario visible por pantalla?
- [ ] **Hick** — si la pantalla ofrece más de 7 opciones, ¿están agrupadas, filtrables o priorizadas?
- [ ] **Doherty** — ¿toda acción asíncrona tiene feedback en <400 ms (skeleton, spinner o estado optimista)?
- [ ] **Postel** — ¿los inputs toleran espacios, mayúsculas y formatos alternativos? ¿`type` correcto para el teclado móvil?
- [ ] **Fin de Pico** — ¿las acciones irreversibles piden confirmación y avisan qué se pierde?
- [ ] **Fluir** — ¿cada `catch` informa al usuario, o está documentado por qué no?
- [ ] **Tesler** — ¿la complejidad la absorbe el sistema (autosave, autocompletado) y no el usuario?
- [ ] **Accesibilidad** — labels asociados, foco visible, navegable por teclado, contraste AA, `prefers-reduced-motion`.
- [ ] **Ambos temas** — probado en claro **y** oscuro.

---

## 8. Métricas de éxito

| Métrica                                 | Hoy       | Objetivo Fase 3                      |
| --------------------------------------- | --------- | ------------------------------------ |
| Archivos usando primitivas UI           | 1,4 %     | > 70 %                               |
| Variantes únicas de botón               | 105       | ≤ 8                                  |
| Familias de color en uso                | 19        | ≤ 6 roles semánticos                 |
| Páginas con estado de carga             | 1,3 %     | > 90 % de las que hacen fetch        |
| Modales accesibles                      | 2/10      | 10/10                                |
| Violaciones críticas de axe-core en E2E | sin medir | 0                                    |
| Tasa de finalización de assessments     | sin medir | instrumentar y establecer línea base |
| Abandono en la primera sección          | sin medir | instrumentar                         |

---

## Fuentes

- [Laws of UX — versión en español](https://lawsofux.com/es/) — las 30 leyes, definiciones y puntos clave.
- Auditoría de código sobre `apps/frontend` en el commit base de la rama `claude/ux-laws-audit-0bt0gz`.
