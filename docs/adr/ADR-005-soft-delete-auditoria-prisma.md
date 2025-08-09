# ADR-005: Soft delete + auditoría con Prisma

## Estado
Aceptado

## Fecha
2024-12-08

## Contexto
Necesitamos implementar un sistema de soft delete y auditoría para mantener la integridad de los datos y cumplir con requisitos de compliance. Opciones:
- Soft delete + auditoría con Prisma
- Hard delete
- Auditoría manual
- Sin auditoría

## Decisión
Implementar **soft delete + auditoría con Prisma** usando middlewares y una tabla de audit_log.

## Consecuencias
### Positivas
- Recuperación de datos eliminados
- Trazabilidad completa de cambios
- Cumplimiento de requisitos de compliance
- Integridad referencial mantenida
- Auditoría automática sin intervención manual

### Negativas
- Complejidad adicional en consultas
- Mayor uso de almacenamiento
- Overhead de performance
- Necesidad de limpieza periódica

### Neutrales
- Requiere configuración inicial
- Puede migrar a hard delete en el futuro

## Alternativas Consideradas
- **Hard delete**: Pérdida permanente de datos
- **Auditoría manual**: Propenso a errores y olvidos
- **Sin auditoría**: No cumple requisitos de compliance

## Referencias
- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma Middleware](https://www.prisma.io/docs/concepts/components/prisma-client/middleware)
- [Soft Delete Pattern](https://martinfowler.com/eaaCatalog/softDelete.html)
