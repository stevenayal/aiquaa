# graphify
- **graphify** (`.claude/skills/graphify/SKILL.md`) - any input to knowledge graph. Trigger: `/graphify`
When the user types `/graphify`, use the installed graphify skill or instructions before doing anything else.

# modern-web-guidance
- **modern-web-guidance** (`.claude/skills/modern-web-guidance/SKILL.md`) - buenas prácticas modernas de HTML/CSS/JS del lado del cliente (diálogos, popovers, formularios, accesibilidad, dark mode, CWV, etc.), mantenida por los equipos de Chrome, Edge, Firefox y MDN. Copiada de `stevenayal/modern-web-guidance` (v1.0.1, licencia Apache-2.0).
Úsala antes de tocar UI en `apps/frontend/`. Las guías están en `.claude/skills/modern-web-guidance/guides/` y se pueden leer directo del disco aunque no haya red para `npx modern-web-guidance`.
No aplica a backend (NestJS, Prisma, SQL), infraestructura ni tooling.

**Browser Support:** Baseline Widely available sin fallback; features Newly available / Limited sólo como mejora progresiva (sin polyfills pesados).
