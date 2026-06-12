# Política de Seguridad

## Reporte de Vulnerabilidades

Si descubres una vulnerabilidad de seguridad en AIQUAA, por favor sigue estos pasos:

### Proceso de Reporte

1. **NO** crees un issue público en GitHub
2. Envía un email a `admin@aiquaa.com` con:
   - Descripción detallada de la vulnerabilidad
   - Pasos para reproducir el problema
   - Impacto potencial
   - Sugerencias de mitigación (si las tienes)

### SLA de Respuesta

- **Confirmación**: 24-48 horas
- **Evaluación inicial**: 3-5 días hábiles
- **Parche crítico**: 7 días hábiles
- **Parche de alta severidad**: 14 días hábiles
- **Parche de severidad media**: 30 días hábiles

### Clasificación de Severidad

- **Crítica**: Explotación remota sin autenticación
- **Alta**: Explotación con autenticación básica
- **Media**: Vulnerabilidades de información o DoS
- **Baja**: Mejoras de seguridad menores

## Prácticas de Seguridad

### Backend (NestJS)

#### Headers de Seguridad

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Content-Security-Policy`: Configurado según entorno

#### Rate Limiting

- **Auth endpoints**: 5 requests/15 minutos
- **POST endpoints**: 10 requests/minuto
- **General**: 100 requests/15 minutos

#### Sanitización

- XSS prevention con `xss` library
- SQL injection prevention con regex patterns
- HTML sanitization con `sanitize-html`
- Markdown sanitization con lista blanca de tags

#### Validación

- Class-validator para DTOs
- SanitizationPipe para payloads
- MarkdownSanitizerService para contenido del foro

### Frontend (Next.js)

#### Headers de Seguridad

- Headers de seguridad configurados en `next.config.mjs`
- CSP alineado con backend
- HSTS en producción

#### Renderizado Seguro

- `SafeMarkdownRenderer` para contenido Markdown
- Sanitización de HTML antes de renderizar
- Validación de URLs

### Autenticación y Autorización

#### JWT

- Tokens con expiración configurable
- Refresh tokens implementados
- Blacklisting de tokens revocados

#### Contraseñas

- Hashing con bcrypt (cost: 12)
- Requisitos mínimos de complejidad
- Rate limiting en intentos de login
- Supabase Auth debe mantener activada la protección contra contraseñas filtradas:
  Dashboard -> Authentication -> Password Security -> Leaked Password Protection.

### Base de Datos

#### Prisma

- Prepared statements automáticos
- Validación de esquemas
- Migraciones versionadas

#### Conexiones

- Connection pooling configurado
- Timeouts de conexión
- SSL/TLS en producción

## Monitoreo y Logging

### Logs de Seguridad

- Intentos de login fallidos
- Rate limit violations
- Errores de autenticación
- Accesos a endpoints sensibles

### Alertas

- Múltiples intentos de login fallidos
- Patrones de acceso anómalos
- Errores de seguridad críticos

## Desarrollo Seguro

### Code Review

- Revisión obligatoria para cambios de seguridad
- Checklist de seguridad en PRs
- Análisis estático de código

### Testing

- Tests de seguridad automatizados
- Penetration testing periódico
- Vulnerability scanning en CI/CD

### Dependencias

- Auditoría automática de dependencias
- Actualización regular de packages
- Monitoreo de vulnerabilidades conocidas

## Incidentes de Seguridad

### Proceso de Respuesta

1. **Detección**: Identificación del incidente
2. **Contención**: Aislamiento del problema
3. **Eradicación**: Eliminación de la causa
4. **Recuperación**: Restauración de servicios
5. **Lecciones aprendidas**: Documentación y mejora

### Comunicación

- Notificación interna inmediata
- Comunicación a usuarios afectados
- Reporte a autoridades si es necesario

## Cumplimiento

### GDPR

- Procesamiento de datos personales
- Derechos de los usuarios
- Notificación de brechas

### OWASP Top 10

- Prevención de vulnerabilidades comunes
- Testing regular
- Documentación de controles

## Contacto

- **Email de seguridad**: admin@aiquaa.com
- **Responsable de seguridad**: Steven Ayala
- **Horario de atención**: Lunes a Viernes, 9:00-18:00 UTC

## Historial de Vulnerabilidades

### 2024-01-15

- **Vulnerabilidad**: XSS en renderizado de Markdown
- **Estado**: Parcheado
- **CVE**: N/A
- **Impacto**: Bajo
- **Solución**: Implementación de SafeMarkdownRenderer
