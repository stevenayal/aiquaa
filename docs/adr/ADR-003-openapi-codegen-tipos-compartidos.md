# ADR-003: OpenAPI + codegen tipos compartidos

## Estado
Aceptado

## Fecha
2024-12-08

## Contexto
Necesitamos una estrategia para compartir tipos entre frontend y backend, y documentar la API. Opciones:
- OpenAPI + codegen
- GraphQL
- TypeScript interfaces manuales
- Swagger solo para documentación

## Decisión
Usar **OpenAPI + codegen** para generar tipos TypeScript compartidos automáticamente.

## Consecuencias
### Positivas
- Tipos siempre sincronizados entre frontend y backend
- Documentación automática de la API
- Reducción de errores de tipos
- Mejor DX con autocompletado
- Single source of truth para la API
- Fácil testing con tipos generados

### Negativas
- Overhead de generación de código
- Dependencia del esquema OpenAPI
- Curva de aprendizaje para OpenAPI
- Posibles conflictos de versiones

### Neutrales
- Requiere disciplina para mantener el esquema actualizado
- Puede migrar a GraphQL en el futuro

## Alternativas Consideradas
- **GraphQL**: Excelente pero complejidad adicional innecesaria para el proyecto actual
- **TypeScript interfaces manuales**: Propenso a errores y desincronización
- **Swagger solo**: Solo documentación, sin tipos compartidos

## Referencias
- [OpenAPI Specification](https://swagger.io/specification/)
- [OpenAPI Generator](https://openapi-generator.tech/)
- [NestJS Swagger](https://docs.nestjs.com/openapi/introduction)
