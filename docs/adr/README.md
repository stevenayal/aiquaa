# Architecture Decision Records (ADRs)

Este directorio contiene los Architecture Decision Records (ADRs) del proyecto AIQUAA.

## ¿Qué son los ADRs?

Los ADRs son documentos que capturan decisiones arquitectónicas importantes, incluyendo el contexto, las alternativas consideradas y las consecuencias de la decisión tomada.

## Estructura de un ADR

Cada ADR sigue esta estructura:

```markdown
# ADR-XXX: Título de la decisión

## Estado
[Propuesto | Aceptado | Deprecado | Reemplazado]

## Contexto
Descripción del problema o situación que requiere una decisión.

## Decisión
La decisión tomada.

## Consecuencias
### Positivas
- Beneficios de la decisión

### Negativas
- Desventajas o riesgos

### Neutrales
- Aspectos neutros

## Alternativas Consideradas
- Alternativa 1: Descripción y por qué no se eligió
- Alternativa 2: Descripción y por qué no se eligió

## Referencias
- Enlaces a documentación, RFCs, etc.
```

## ADRs Existentes

- [ADR-001: Monolito modular Nest](./ADR-001-monolito-modular-nest.md)
- [ADR-002: Next vs Nuxt](./ADR-002-next-vs-nuxt.md)
- [ADR-003: OpenAPI + codegen tipos compartidos](./ADR-003-openapi-codegen-tipos-compartidos.md)
- [ADR-004: Redis cache con invalidación por tags](./ADR-004-redis-cache-invalidacion-tags.md)
- [ADR-005: Soft delete + auditoría con Prisma](./ADR-005-soft-delete-auditoria-prisma.md)

## Cómo crear un nuevo ADR

1. Usa el script: `pnpm adr:new "Título del ADR"`
2. O crea manualmente un archivo `ADR-XXX-titulo-en-kebab.md`
3. Sigue la estructura estándar
4. Actualiza este README con el nuevo ADR
