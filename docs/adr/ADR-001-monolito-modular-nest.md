# ADR-001: Monolito modular Nest

## Estado
Aceptado

## Fecha
2024-12-08

## Contexto
Necesitamos decidir la arquitectura del backend para el proyecto AIQUAA. Tenemos varias opciones:
- Microservicios
- Monolito tradicional
- Monolito modular
- Serverless

## Decisión
Implementar un **monolito modular** usando NestJS como framework principal.

## Consecuencias
### Positivas
- Desarrollo más rápido y simple
- Menor complejidad de deployment
- Compartir código y tipos entre módulos
- Testing más sencillo
- Menor overhead de comunicación entre servicios
- Fácil debugging y profiling

### Negativas
- Acoplamiento entre módulos (mitigado por la modularidad)
- Escalabilidad limitada por módulo (solo vertical)
- Un solo punto de falla
- Deployment de todo el sistema cuando hay cambios

### Neutrales
- Puede evolucionar a microservicios en el futuro
- Requiere buena disciplina de desarrollo

## Alternativas Consideradas
- **Microservicios**: Demasiada complejidad para el tamaño actual del proyecto
- **Monolito tradicional**: Falta de estructura y modularidad
- **Serverless**: Limitaciones de cold start y debugging complejo

## Referencias
- [NestJS Documentation](https://docs.nestjs.com/)
- [Monolith First - Martin Fowler](https://martinfowler.com/bliki/MonolithFirst.html)
