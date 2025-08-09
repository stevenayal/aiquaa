# ADR-004: Redis cache con invalidación por tags

## Estado
Aceptado

## Fecha
2024-12-08

## Contexto
Necesitamos implementar un sistema de cache para mejorar el rendimiento de la aplicación. Opciones:
- Redis con invalidación por tags
- In-memory cache
- CDN
- Sin cache

## Decisión
Implementar **Redis cache con invalidación por tags** usando cache-manager y ioredis.

## Consecuencias
### Positivas
- Mejor rendimiento para consultas frecuentes
- Reducción de carga en la base de datos
- Invalidación granular por tags
- Persistencia del cache
- Escalabilidad horizontal
- Monitoreo y métricas disponibles

### Negativas
- Complejidad adicional
- Dependencia de Redis
- Posible inconsistencia de datos
- Overhead de mantenimiento

### Neutrales
- Requiere configuración de Redis
- Puede migrar a otros sistemas de cache

## Alternativas Consideradas
- **In-memory cache**: No persiste entre reinicios y no escala
- **CDN**: Solo para contenido estático
- **Sin cache**: Rendimiento pobre para consultas frecuentes

## Referencias
- [Redis Documentation](https://redis.io/documentation)
- [cache-manager](https://github.com/node-cache-manager/node-cache-manager)
- [ioredis](https://github.com/luin/ioredis)
