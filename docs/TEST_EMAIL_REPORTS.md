# Reportes de Pruebas por Email

Este sistema permite ejecutar todas las pruebas (unitarias, E2E, contrato) y recibir un reporte detallado por email en `admin@aiquaa.com`.

## 📋 Características

- ✅ Ejecuta pruebas unitarias (Jest para backend, Vitest para frontend)
- ✅ Ejecuta pruebas E2E (Playwright)
- ✅ Ejecuta pruebas de contrato
- ✅ Captura resultados y cobertura de código
- ✅ Genera reporte HTML profesional
- ✅ Envía email automáticamente a `admin@aiquaa.com`
- ✅ Soporte para ejecución individual o combinada

## 🚀 Uso

### Prerrequisitos

1. Asegúrate de que el backend esté corriendo:
   ```bash
   pnpm dev:back
   # o
   make dev-back
   ```

2. Verifica que tengas configurado `RESEND_API_KEY` en tu archivo `.env`:
   ```bash
   RESEND_API_KEY=re_your_api_key_here
   ADMIN_EMAIL=admin@aiquaa.com
   ```

### Comandos Disponibles

#### Ejecutar todas las pruebas y enviar reporte
```bash
pnpm test:email
```

Este comando ejecutará:
- Pruebas unitarias del backend (Jest)
- Pruebas unitarias del frontend (Vitest)
- Pruebas E2E (Playwright)
- Pruebas de contrato

Y enviará un reporte consolidado por email.

#### Ejecutar solo pruebas unitarias
```bash
pnpm test:email:unit
```

#### Ejecutar solo pruebas E2E
```bash
pnpm test:email:e2e
```

#### Ejecutar solo pruebas de contrato
```bash
pnpm test:email:contract
```

### Uso Directo del Script

También puedes ejecutar el script directamente:

```bash
# Todas las pruebas
node scripts/run-tests-with-email.js all

# Solo un tipo
node scripts/run-tests-with-email.js unit
node scripts/run-tests-with-email.js e2e
node scripts/run-tests-with-email.js contract
```

### Variables de Entorno

Puedes personalizar el comportamiento con estas variables:

```bash
# URL del backend (por defecto: http://localhost:3001)
BACKEND_URL=http://localhost:3001 pnpm test:email

# Ejemplo con backend en producción
BACKEND_URL=https://api.aiquaa.com pnpm test:email
```

## 📊 Contenido del Reporte

El email incluye:

### Información General
- ✅ Estado general (EXITOSO/FALLIDO)
- ⏱️ Duración total de las pruebas
- 📅 Fecha y hora de ejecución
- 🏷️ Tipo de pruebas ejecutadas

### Resumen de Resultados
- 📝 Total de pruebas ejecutadas
- ✅ Pruebas que pasaron
- ❌ Pruebas que fallaron
- ⊘ Pruebas omitidas

### Cobertura de Código (si aplica)
- Statements (%)
- Branches (%)
- Functions (%)
- Lines (%)

Con indicadores visuales:
- 🟢 Verde: ≥ 75%
- 🟡 Amarillo: 50-74%
- 🔴 Rojo: < 50%

### Detalles de Fallos
Para cada prueba fallida:
- Nombre del test
- Mensaje de error completo
- Stack trace (truncado a 500 caracteres)

## 🎨 Diseño del Email

El reporte HTML incluye:
- 🎨 Diseño responsive y profesional
- 🌈 Colores según el estado (verde para éxito, rojo para fallos)
- 📊 Tablas y gráficos visuales
- 📱 Compatible con clientes de email modernos

## 🔧 Integración con CI/CD

Puedes integrar este sistema en tu pipeline de CI/CD:

### GitHub Actions
```yaml
name: Tests with Email Report

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: pnpm install
      - name: Start backend
        run: pnpm dev:back &
      - name: Wait for backend
        run: sleep 10
      - name: Run tests and send email
        env:
          RESEND_API_KEY: ${{ secrets.RESEND_API_KEY }}
          ADMIN_EMAIL: admin@aiquaa.com
        run: pnpm test:email
```

### GitLab CI
```yaml
test-with-email:
  stage: test
  script:
    - pnpm install
    - pnpm dev:back &
    - sleep 10
    - pnpm test:email
  variables:
    RESEND_API_KEY: $RESEND_API_KEY
    ADMIN_EMAIL: admin@aiquaa.com
```

## 📝 Endpoint de la API

El script usa el siguiente endpoint para enviar los reportes:

**Endpoint**: `POST /api/v1/mailer/test-results`

**Body**:
```json
{
  "success": true,
  "timestamp": "2025-01-15T10:30:00Z",
  "duration": 45000,
  "summary": {
    "total": 150,
    "passed": 148,
    "failed": 2,
    "skipped": 0
  },
  "coverage": {
    "statements": 82.5,
    "branches": 78.3,
    "functions": 85.1,
    "lines": 82.8
  },
  "failures": [
    {
      "test": "UserService › createUser › should validate email",
      "error": "Expected email to be valid but received invalid format"
    }
  ],
  "type": "unit"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Reporte de pruebas enviado exitosamente a admin@aiquaa.com"
}
```

## 🐛 Troubleshooting

### El email no se envía

1. **Verifica que el backend esté corriendo**:
   ```bash
   curl http://localhost:3001/health
   ```

2. **Verifica la configuración de Resend**:
   ```bash
   # Revisa tu .env
   cat apps/backend/.env | grep RESEND
   ```

3. **Prueba el endpoint manualmente**:
   ```bash
   curl -X POST http://localhost:3001/api/v1/mailer/test-results \
     -H "Content-Type: application/json" \
     -d '{
       "success": true,
       "timestamp": "2025-01-15T10:00:00Z",
       "duration": 5000,
       "summary": {"total": 10, "passed": 10, "failed": 0, "skipped": 0},
       "type": "unit"
     }'
   ```

### Las pruebas fallan pero el email no muestra detalles

El script captura automáticamente los errores de:
- Jest (backend unit tests)
- Vitest (frontend unit tests)
- Playwright (E2E tests)

Si no ves detalles, verifica que la salida de las pruebas contenga los mensajes de error estándar.

### Timeout al ejecutar todas las pruebas

Si tienes muchas pruebas, puede tardar varios minutos. El script esperará a que todas terminen antes de enviar el email.

Para pruebas muy largas, considera ejecutarlas por separado:
```bash
pnpm test:email:unit   # Más rápido
pnpm test:email:e2e    # Puede tardar más
```

## 📚 Ejemplos de Uso

### Desarrollo Local

```bash
# Ejecutar todas las pruebas y recibir email
pnpm test:email
```

### Antes de hacer commit

```bash
# Verifica que todo pase antes de commitear
pnpm test:email:unit
```

### Despliegue en Staging

```bash
# Ejecuta E2E en staging y recibe reporte
BACKEND_URL=https://staging-api.aiquaa.com pnpm test:email:e2e
```

### Verificación Nocturna

Configura un cron job para recibir reportes diarios:

```bash
# crontab -e
0 2 * * * cd /path/to/aiquaa && pnpm test:email
```

## 🔐 Seguridad

- ⚠️ **Importante**: No compartas tu `RESEND_API_KEY` públicamente
- 🔒 Usa variables de entorno para keys sensibles
- 👤 El email solo se envía a `admin@aiquaa.com` (configurable en `.env`)

## 📞 Soporte

Si tienes problemas:

1. Revisa los logs del backend: `tail -f apps/backend/logs/combined.log`
2. Verifica la documentación de Resend: https://resend.com/docs
3. Revisa el código del script: `scripts/run-tests-with-email.js`

## 🎯 Próximas Mejoras

- [ ] Soporte para múltiples destinatarios
- [ ] Gráficos de tendencia de cobertura
- [ ] Comparación con ejecuciones anteriores
- [ ] Slack/Discord webhooks
- [ ] Almacenamiento de histórico en base de datos
