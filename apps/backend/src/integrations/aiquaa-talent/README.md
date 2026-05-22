# Integración AIQUAA → Aiquaa Talent

Cuando un postulante finaliza su evaluación en AIQUAA, este módulo envía automáticamente el resultado a **Aiquaa Talent** para actualizar el estado del candidato en el proceso de selección.

---

## Variables de entorno

| Variable                           | Requerida       | Default | Descripción                                   |
| ---------------------------------- | --------------- | ------- | --------------------------------------------- |
| `AIQUAA_TALENT_WEBHOOK_URL`        | Sí (si enabled) | —       | URL base de Aiquaa Talent, sin trailing slash |
| `AIQUAA_TALENT_WEBHOOK_SECRET`     | Sí (si enabled) | —       | Secreto compartido HMAC-SHA256, mín 32 chars  |
| `AIQUAA_TALENT_WEBHOOK_ENABLED`    | No              | `false` | `true` para activar envíos reales             |
| `AIQUAA_TALENT_WEBHOOK_TIMEOUT_MS` | No              | `8000`  | Timeout por request en ms                     |

Agregar en `apps/backend/.env.local`:

```env
AIQUAA_TALENT_WEBHOOK_URL=https://talent.aiquaa.com
AIQUAA_TALENT_WEBHOOK_SECRET=<secreto-min-32-chars>
AIQUAA_TALENT_WEBHOOK_ENABLED=true
AIQUAA_TALENT_WEBHOOK_TIMEOUT_MS=8000
```

---

## Cómo activar por evaluación

### Examen de Performance (postulación)

El webhook se dispara **solo** cuando `examPurpose === 'postulacion'`. El frontend debe enviar al menos uno de los campos de proceso:

```json
{
  "examPurpose": "postulacion",
  "candidateEmail": "candidato@correo.com",
  "talentProcessId": "proc-abc-123",
  "talentApplicationId": "app-xyz-456", // opcional
  "talentPublicLinkToken": "tok-abc" // opcional
}
```

### Examen ISTQB

El webhook se dispara cuando el body incluye al menos uno de:

```json
{
  "talentProcessId": "proc-abc-123",
  "talentApplicationId": "app-xyz-456",
  "talentPublicLinkToken": "tok-abc"
}
```

Si ninguno está presente, no se envía (se loggea en WARN).

---

## Endpoint destino

```
POST ${AIQUAA_TALENT_WEBHOOK_URL}/api/integrations/aiquaa/evaluation-result
```

### Headers

| Header               | Valor                 |
| -------------------- | --------------------- |
| `Content-Type`       | `application/json`    |
| `X-Aiquaa-Event-Id`  | UUID único del evento |
| `X-Aiquaa-Timestamp` | Unix timestamp en ms  |
| `X-Aiquaa-Signature` | `sha256=<hmac-hex>`   |

### Firma HMAC

```
message  = timestamp_ms + "." + raw_body_json
signature = HMAC_SHA256(AIQUAA_TALENT_WEBHOOK_SECRET, message)
header   = "sha256=" + hex(signature)
```

### Payload de ejemplo

```json
{
  "eventId": "550e8400-e29b-41d4-a716-446655440000",
  "eventType": "candidate.evaluation.completed",
  "occurredAt": "2026-01-15T10:30:00.000Z",
  "source": "aiquaa",
  "tenant": {
    "companyId": "acme-corp"
  },
  "candidate": {
    "email": "candidato@correo.com",
    "externalId": "@github-handle"
  },
  "process": {
    "processId": "proc-abc-123",
    "applicationId": "app-xyz-456"
  },
  "evaluation": {
    "evaluationId": "42",
    "evaluationType": "PERFORMANCE",
    "score": 22,
    "maxScore": 26,
    "status": "PASSED",
    "summary": "Juan Pérez — 84.6%"
  }
}
```

---

## Confiabilidad

- **Reintentos**: hasta 3 intentos con backoff exponencial (1s → 3s → 9s)
- **Timeout**: configurable via `AIQUAA_TALENT_WEBHOOK_TIMEOUT_MS` (default 8s)
- **Non-blocking**: fallos del webhook no afectan la respuesta al postulante
- **Idempotente**: `eventId` UUID único por evento; el receptor puede desduplicar

---

## Cómo probar localmente

### 1. Levantar mock receiver

```bash
# Con npx json-server o cualquier echo server, ej:
npx -y @hoppscotch/cli run collection.json

# O simple con Node:
node -e "
const http = require('http');
http.createServer((req, res) => {
  let body = '';
  req.on('data', d => body += d);
  req.on('end', () => {
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Body:', body);
    res.writeHead(200); res.end('ok');
  });
}).listen(4000, () => console.log('Mock receiver on :4000'));
"
```

### 2. Configurar env

```env
AIQUAA_TALENT_WEBHOOK_URL=http://localhost:4000
AIQUAA_TALENT_WEBHOOK_SECRET=dev-secret-min-32-chars-xxxxxxxxxxx
AIQUAA_TALENT_WEBHOOK_ENABLED=true
```

### 3. Enviar examen desde el frontend

Marcar `examPurpose: "postulacion"` + incluir `talentProcessId`.

### 4. Verificar logs

```
[AiquaaTalent] Sending eventId=... candidate=ca***@empresa.com processId=proc-7 attempt=1
[AiquaaTalent] Sent OK eventId=... status=200 attempt=1
```

---

## Tests

```bash
cd apps/backend
pnpm test -- --testPathPattern=aiquaa-talent
```

Cubre: construcción de payload, firma HMAC, envío 2xx, reintentos en 5xx/timeout, skip por flag desactivado, skip por falta de processId, ausencia de datos sensibles en payload.
