# ADR-002: Next vs Nuxt

## Estado
Aceptado

## Fecha
2024-12-08

## Contexto
Necesitamos elegir el framework de frontend para AIQUAA. Las opciones principales son:
- Next.js (React)
- Nuxt.js (Vue)
- SvelteKit
- Astro

## Decisión
Usar **Next.js 15** con React como framework de frontend.

## Consecuencias
### Positivas
- Ecosistema React maduro y amplio
- Excelente soporte para TypeScript
- App Router moderno y eficiente
- Server Components para mejor rendimiento
- Integración nativa con Vercel
- Comunidad grande y activa
- Documentación excelente

### Negativas
- Curva de aprendizaje para React
- Bundle size más grande que alternativas
- Menos "baterías incluidas" que Nuxt

### Neutrales
- Puede migrar a otros frameworks en el futuro
- Requiere configuración adicional para algunas funcionalidades

## Alternativas Consideradas
- **Nuxt.js**: Excelente framework pero equipo más familiarizado con React
- **SvelteKit**: Muy prometedor pero ecosistema más pequeño
- **Astro**: Excelente para contenido estático pero menos ideal para aplicaciones dinámicas

## Referencias
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [Nuxt.js Documentation](https://nuxt.com/docs)
