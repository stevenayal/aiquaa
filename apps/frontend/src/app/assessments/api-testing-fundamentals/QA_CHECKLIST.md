# QA Checklist - API Testing Fundamentals Challenge

## Acceso y auth

- [ ] Usuario no autenticado ve gate de acceso en `/assessments`.
- [ ] Usuario autenticado puede entrar al overview, start, sections y result.
- [ ] Un usuario no puede leer intentos de otro usuario.

## Seed y catálogo

- [ ] El primer acceso siembra assessment, sections y questions sin duplicados.
- [ ] Reingresar no crea duplicados en `assessment_*`.
- [ ] El assessment queda activo con 5 secciones y score total 100.

## Flujo del intento

- [ ] `start` crea intento nuevo si no existe `in_progress`.
- [ ] `start` reanuda intento existente si corresponde.
- [ ] Cada respuesta se guarda por autosave.
- [ ] Recargar la sección preserva respuestas previas.
- [ ] El usuario puede navegar hacia el nivel anterior sin perder datos.

## Scoring

- [ ] Nivel 1 corrige conceptos básicos correctamente.
- [ ] Nivel 2 corrige método, header, params, campos y tipos.
- [ ] Nivel 3 genera feedback heurístico coherente según cobertura y completitud.
- [ ] Nivel 4 detecta bugs y respuestas correctas según documentación esperada.
- [ ] Nivel 5 puntúa bug reports por calidad mínima y campos obligatorios.
- [ ] `assessment_scores` se guarda una sola vez por intento/sección.
- [ ] `assessment_attempts` consolida `total_score`, `percentage`, `candidate_level`, fortalezas y debilidades.

## Resultado final

- [ ] La pantalla final muestra score total y por nivel.
- [ ] El candidate level respeta bandas 0-39, 40-59, 60-74, 75-89, 90-100.
- [ ] Se muestran fortalezas, debilidades, recomendaciones y feedback por nivel.

## Integraciones

- [ ] Se inserta un resumen en `exam_results`.
- [ ] El resultado aparece en dashboard.
- [ ] El resultado aparece en perfil.
- [ ] El challenge puede seleccionarse en `employer/nuevo`.
- [ ] El challenge aparece correctamente etiquetado en vistas de hiring e invitaciones.

## UX y responsive

- [ ] Overview, start, sections y result son utilizables en mobile.
- [ ] El timer no rompe el autosave.
- [ ] Las cards de request/response permiten scroll horizontal.
- [ ] Los formularios largos de casos y bugs siguen siendo legibles y usables.

## Accesibilidad básica

- [ ] Inputs y textareas pueden usarse con teclado.
- [ ] El foco visible existe en campos interactivos.
- [ ] El contraste es suficiente en componentes principales.
