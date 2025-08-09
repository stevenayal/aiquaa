# Observabilidad y Trazabilidad

Este documento describe el sistema de observabilidad implementado en AIQUAA, que incluye logging estructurado, tracing con OpenTelemetry, métricas con Prometheus, y monitoreo de errores con Sentry.

## Arquitectura

### Componentes

1. **Logging Estructurado** - Pino con formateo JSON
2. **Tracing** - OpenTelemetry con exportadores OTLP
3. **Métricas** - Prometheus con endpoint `/metrics`
4. **Monitoreo de Errores** - Sentry para backend y frontend
5. **Correlación** - Request IDs propagados en headers y logs

## Configuración

### Variables de Entorno

#### Backend

```bash
# Logging
LOG_LEVEL=info  # debug, info, warn, error

# OpenTelemetry
OTLP_ENDPOINT=http://localhost:4318  # Endpoint para Jaeger/Tempo
SERVICE_NAME=aiquaa-backend

# Sentry
SENTRY_DSN=your-sentry-dsn

# Métricas
PROMETHEUS_ENABLED=true
```

#### Frontend

```bash
# Sentry
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

## Uso

### Logging

Los logs se generan automáticamente para todas las peticiones HTTP. Cada log incluye:

- Request ID para correlación
- Método HTTP y URL
- Código de estado
- Tiempo de respuesta
- Contexto adicional

#### Ejemplo de Log

```json
{
  "level": "info",
  "time": "2024-01-15T10:30:00.000Z",
  "requestId": "abc123def456",
  "method": "GET",
  "url": "/api/v1/health",
  "statusCode": 200,
  "responseTime": 15,
  "context": "HTTP"
}
```

### Tracing

El tracing se activa automáticamente con OpenTelemetry. Para ver las trazas:

1. **Desarrollo**: Las trazas se muestran en consola
2. **Producción**: Configura un endpoint OTLP (Jaeger/Tempo)

#### Configurar Jaeger Local

```yaml
# docker-compose.observability.yml
version: '3.8'
services:
  jaeger:
    image: jaegertracing/all-in-one:latest
    ports:
      - "16686:16686"  # UI
      - "4318:4318"    # OTLP HTTP
    environment:
      - COLLECTOR_OTLP_ENABLED=true

  tempo:
    image: grafana/tempo:latest
    command: [ "-config.file=/etc/tempo.yaml" ]
    volumes:
      - ./tempo.yaml:/etc/tempo.yaml
    ports:
      - "3200:3200"  # tempo
      - "4318:4318"  # otlp
```

### Métricas

Las métricas están disponibles en `/metrics` en formato Prometheus.

#### Métricas Disponibles

- `aiquaa_http_requests_total` - Total de peticiones HTTP
- `aiquaa_http_request_duration_seconds` - Duración de peticiones
- `aiquaa_app_info` - Información de la aplicación
- Métricas del sistema (CPU, memoria, etc.)

#### Ejemplo de Consulta Prometheus

```promql
# P95 de tiempo de respuesta
histogram_quantile(0.95, rate(aiquaa_http_request_duration_seconds_bucket[5m]))

# Tasa de errores
rate(aiquaa_http_requests_total{status=~"5.."}[5m]) / rate(aiquaa_http_requests_total[5m])
```

### Sentry

Sentry captura automáticamente errores no manejados y permite monitoreo de performance.

#### Configurar Sentry

1. Crea una cuenta en [Sentry](https://sentry.io)
2. Crea un proyecto para backend y frontend
3. Obtén el DSN y configúralo en las variables de entorno

## Desarrollo

### Activar Observabilidad Local

1. **Clona el repositorio**
```bash
git clone <repo-url>
cd aiquaa
```

2. **Instala dependencias**
```bash
pnpm install
```

3. **Configura variables de entorno**
```bash
cp env.example env.local
# Edita env.local con tus configuraciones
```

4. **Inicia servicios de observabilidad (opcional)**
```bash
docker-compose -f docker-compose.observability.yml up -d
```

5. **Inicia el backend**
```bash
cd apps/backend
pnpm start:dev
```

6. **Inicia el frontend**
```bash
cd apps/frontend
pnpm dev
```

### Ver Trazas

1. **Consola**: Las trazas se muestran en la consola del backend
2. **Jaeger**: http://localhost:16686
3. **Tempo**: http://localhost:3200

### Ver Métricas

- **Prometheus**: http://localhost:3000/metrics
- **Grafana**: Configura Prometheus como fuente de datos

## Troubleshooting

### Problemas Comunes

1. **Trazas no aparecen**
   - Verifica que `OTLP_ENDPOINT` esté configurado
   - Revisa la consola del backend para errores

2. **Sentry no captura errores**
   - Verifica que `SENTRY_DSN` esté configurado
   - Revisa la consola para mensajes de inicialización

3. **Métricas no disponibles**
   - Verifica que el endpoint `/metrics` responda
   - Revisa logs del backend para errores de Prometheus

### Logs de Debug

Para activar logs de debug:

```bash
LOG_LEVEL=debug pnpm start:dev
```

## Monitoreo en Producción

### KPIs Recomendados

1. **Performance**
   - P95 tiempo de respuesta < 500ms
   - Error rate < 1%
   - Throughput > 100 RPS

2. **Disponibilidad**
   - Uptime > 99.9%
   - Health check passing

3. **Recursos**
   - CPU < 80%
   - Memoria < 85%
   - Disco < 90%

### Alertas

Configura alertas para:

- Error rate > 5%
- P95 latency > 1s
- Health check failing
- Recursos críticos > 90%

## Contribución

Para añadir nuevas métricas o logs:

1. Usa el logger inyectado en servicios
2. Añade métricas personalizadas en `MetricsController`
3. Documenta nuevos KPIs aquí
4. Actualiza tests para incluir observabilidad
