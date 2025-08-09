# Dashboard de KPIs - AIQUAA

## Métricas Clave de Rendimiento

### Performance

#### Tiempo de Respuesta
- **P50**: < 200ms
- **P95**: < 500ms  
- **P99**: < 1s

#### Throughput
- **RPS**: > 100 requests/second
- **RPM**: > 6000 requests/minute

#### Error Rate
- **4xx Errors**: < 5%
- **5xx Errors**: < 1%

### Disponibilidad

#### Uptime
- **Target**: 99.9%
- **Current**: 99.95%

#### Health Checks
- **Success Rate**: > 99%
- **Response Time**: < 100ms

### Recursos

#### CPU
- **Average**: < 60%
- **Peak**: < 80%

#### Memoria
- **Usage**: < 70%
- **Available**: > 30%

#### Disco
- **Usage**: < 80%
- **IOPS**: < 1000

## Queries de Prometheus

### Métricas de Performance

```promql
# P95 Response Time
histogram_quantile(0.95, rate(aiquaa_http_request_duration_seconds_bucket[5m]))

# Error Rate
rate(aiquaa_http_requests_total{status=~"5.."}[5m]) / rate(aiquaa_http_requests_total[5m]) * 100

# Requests per Second
rate(aiquaa_http_requests_total[1m])

# Average Response Time
rate(aiquaa_http_request_duration_seconds_sum[5m]) / rate(aiquaa_http_request_duration_seconds_count[5m])
```

### Métricas de Sistema

```promql
# CPU Usage
100 - (avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)

# Memory Usage
(node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100

# Disk Usage
(node_filesystem_size_bytes - node_filesystem_free_bytes) / node_filesystem_size_bytes * 100
```

### Métricas de Negocio

```promql
# Active Users
sum(rate(aiquaa_http_requests_total{path!="/health"}[5m])) by (user_id)

# Popular Endpoints
topk(10, sum by (path) (rate(aiquaa_http_requests_total[5m])))
```

## Alertas Recomendadas

### Critical Alerts

```yaml
# High Error Rate
- alert: HighErrorRate
  expr: rate(aiquaa_http_requests_total{status=~"5.."}[5m]) / rate(aiquaa_http_requests_total[5m]) > 0.05
  for: 2m
  labels:
    severity: critical
  annotations:
    summary: "High error rate detected"
    description: "Error rate is above 5% for the last 5 minutes"

# High Response Time
- alert: HighResponseTime
  expr: histogram_quantile(0.95, rate(aiquaa_http_request_duration_seconds_bucket[5m])) > 1
  for: 2m
  labels:
    severity: critical
  annotations:
    summary: "High response time detected"
    description: "P95 response time is above 1s"

# Service Down
- alert: ServiceDown
  expr: up == 0
  for: 1m
  labels:
    severity: critical
  annotations:
    summary: "Service is down"
    description: "Service has been down for more than 1 minute"
```

### Warning Alerts

```yaml
# High CPU Usage
- alert: HighCPUUsage
  expr: 100 - (avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: "High CPU usage"
    description: "CPU usage is above 80%"

# High Memory Usage
- alert: HighMemoryUsage
  expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100 > 85
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: "High memory usage"
    description: "Memory usage is above 85%"
```

## Dashboard de Grafana

### Paneles Recomendados

1. **Overview**
   - Response Time (P50, P95, P99)
   - Request Rate
   - Error Rate
   - Active Users

2. **Performance**
   - Response Time by Endpoint
   - Request Rate by Endpoint
   - Error Rate by Endpoint
   - Database Query Performance

3. **Infrastructure**
   - CPU Usage
   - Memory Usage
   - Disk Usage
   - Network I/O

4. **Business Metrics**
   - User Activity
   - Popular Features
   - Conversion Rates
   - Revenue Metrics

### Configuración de Grafana

1. **Data Sources**
   - Prometheus: `http://prometheus:9090`
   - Jaeger: `http://jaeger:16686`

2. **Dashboards**
   - Import dashboards from Grafana marketplace
   - Create custom dashboards for business metrics

3. **Variables**
   - `$environment`: production, staging, development
   - `$service`: backend, frontend
   - `$instance`: server instances

## Monitoreo Continuo

### Revisiones Diarias

1. **Performance Review**
   - Check P95 response times
   - Review error rates
   - Analyze slow queries

2. **Capacity Planning**
   - Monitor resource usage trends
   - Plan for scaling needs
   - Review cost optimization

3. **Incident Review**
   - Review any alerts triggered
   - Analyze root causes
   - Update runbooks

### Revisiones Semanales

1. **Trend Analysis**
   - Performance trends
   - Usage patterns
   - Business metrics

2. **Optimization**
   - Identify bottlenecks
   - Plan improvements
   - Update thresholds

### Revisiones Mensuales

1. **Comprehensive Review**
   - Full system health
   - Capacity planning
   - Technology decisions

2. **Documentation Updates**
   - Update runbooks
   - Review procedures
   - Plan training
