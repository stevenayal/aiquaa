# Configuración de Envío de Correos - Simulador ISTQB

## Resumen

El sistema de envío automático de resultados de exámenes ISTQB por correo electrónico a **admin@aiquaa.com** está completamente implementado y configurado.

## Variables de Entorno Configuradas

### Archivo: `apps/backend/.env`

```bash
# Email Configuration - Resend
RESEND_API_KEY=re_Vo8z4maQ_8ruYVtSYkU5Ye1ue2CPDPbcT
RESEND_FROM_EMAIL=onboarding@resend.dev
ADMIN_EMAIL=admin@aiquaa.com
```

### Descripción de Variables

- **`RESEND_API_KEY`**: API Key de Resend para envío de correos (actualmente usa una key de prueba)
- **`RESEND_FROM_EMAIL`**: Email remitente de los correos (actualmente usa el dominio de prueba de Resend)
- **`ADMIN_EMAIL`**: Email del administrador que recibirá los informes de exámenes (admin@aiquaa.com)

## Cómo Funciona

1. **Usuario completa un examen** en `/labs/istqb`
2. **Frontend envía los resultados** al endpoint `POST /api/v1/istqb/submit-exam`
3. **Backend procesa los datos**:
   - Guarda el resultado en la base de datos PostgreSQL (tabla `istqb_exam_results`)
   - Envía automáticamente un correo HTML detallado a `admin@aiquaa.com`
4. **Email recibido** contiene:
   - Estado del examen (APROBADO/NO APROBADO)
   - Puntaje y porcentaje
   - Información del participante
   - Tiempo empleado
   - Desglose por Learning Objectives
   - Top 3 preguntas incorrectas (si las hay)

## Configuración de Resend

### Opción 1: Usar Dominio de Prueba (Actual)

La configuración actual usa el dominio de prueba de Resend:
- **Email remitente**: `onboarding@resend.dev`
- **Limitaciones**: Solo puede enviar a emails verificados en la cuenta de Resend
- **Ventaja**: No requiere verificar un dominio propio

### Opción 2: Configurar Dominio Propio (Recomendado para Producción)

Para usar tu propio dominio (ej: `noreply@aiquaa.com`):

1. **Registrarse en Resend**: https://resend.com
2. **Verificar dominio**:
   - Ve a "Domains" en el dashboard
   - Agrega `aiquaa.com`
   - Agrega los registros DNS que te proporciona Resend
   - Espera la verificación (puede tardar hasta 48 horas)
3. **Obtener API Key**:
   - Ve a "API Keys" en el dashboard
   - Crea una nueva API Key
   - Copia la key y actualiza `RESEND_API_KEY` en `.env`
4. **Actualizar email remitente**:
   ```bash
   RESEND_FROM_EMAIL="AIQUAA <noreply@aiquaa.com>"
   ```

## Pruebas

### Opción 1: Ejecutar Script de Prueba (Recomendado)

```bash
# Asegúrate de que el backend esté corriendo
cd apps/backend
pnpm start:dev

# En otra terminal, ejecuta el script de prueba
node scripts/test-istqb-email.js
```

Este script:
- Envía datos de examen de prueba al backend
- Simula un examen completado por "Juan Pérez (PRUEBA)"
- El backend guardará el resultado y enviará el email a admin@aiquaa.com

### Opción 2: Completar un Examen Real

```bash
# 1. Iniciar el backend
cd apps/backend
pnpm start:dev

# 2. Iniciar el frontend
cd apps/frontend
pnpm dev

# 3. Abrir navegador
http://localhost:3001/labs/istqb

# 4. Completar un examen
# 5. El email se enviará automáticamente al finalizar
```

### Opción 3: Usar cURL

```bash
curl -X POST http://localhost:3001/api/v1/istqb/submit-exam \
  -H "Content-Type: application/json" \
  -d '{
    "participantName": "Test User",
    "participantEmail": "test@example.com",
    "startTime": "'$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")'",
    "endTime": "'$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")'",
    "timeSpent": 3600,
    "score": 32,
    "totalQuestions": 40,
    "correctAnswers": 32,
    "incorrectAnswers": 8,
    "percentage": 80.0,
    "passed": true,
    "mode": "EXAM",
    "answers": [],
    "learningObjectiveAnalysis": []
  }'
```

## Verificación de Envío

### 1. Logs del Backend

Al ejecutar cualquier prueba, verifica los logs del backend:

```
[IstqbService] Resultado de examen guardado: 1 - Juan Pérez (PRUEBA)
[IstqbService] Email de informe enviado al admin para examen ID: 1
```

Si hay errores, aparecerán como:
```
[IstqbService] Error enviando email de informe: [mensaje de error]
```

### 2. Dashboard de Resend

1. Inicia sesión en https://resend.com
2. Ve a "Logs" en el menú lateral
3. Busca los emails enviados recientemente
4. Verifica el estado:
   - ✅ **Delivered**: Email entregado exitosamente
   - ⏳ **Queued**: En cola para envío
   - ❌ **Bounced**: Rebotó (email inválido o no existe)
   - ❌ **Failed**: Falló el envío

### 3. Bandeja de Entrada

Revisa la bandeja de entrada de **admin@aiquaa.com** para verificar que llegó el email.

## Estructura del Email Enviado

El email HTML incluye:

### Header
- Logo AIQUAA con gradiente
- Título "Simulador ISTQB CTFL v4.0"

### Sección de Estado
- Badge de APROBADO (verde) o NO APROBADO (rojo)
- Puntaje total (ej: 32/40)
- Porcentaje (ej: 80.00%)

### Información del Participante
- Nombre completo
- Email (si está disponible)
- Fecha y hora del examen
- Tiempo empleado (formato: 1h 0m 0s)
- Modo (EXAMEN o ENTRENAMIENTO)
- ID del resultado en la base de datos

### Resumen de Resultados
- 3 tarjetas con iconos:
  - 🏆 Puntaje
  - ✓ Respuestas Correctas
  - ✗ Respuestas Incorrectas

### Desglose por Learning Objectives
Tabla detallada con:
- Nombre del Learning Objective
- Resultado (X/Y preguntas)
- Porcentaje con badge de color:
  - Verde: ≥70%
  - Amarillo: 50-69%
  - Rojo: <50%

### Top Preguntas Incorrectas
- Muestra las primeras 3 preguntas incorrectas
- Incluye:
  - Número de pregunta
  - Learning Objective y K-Level
  - Texto de la pregunta (primeros 150 caracteres)
  - Respuesta del usuario vs. respuesta correcta

## Solución de Problemas

### Email no se envía

1. **Verificar API Key**:
   ```bash
   cd apps/backend
   cat .env | grep RESEND_API_KEY
   ```

2. **Verificar logs del backend**:
   - Busca errores relacionados con Resend
   - Si dice "RESEND_API_KEY no configurada", verifica el archivo `.env`

3. **Verificar que admin@aiquaa.com esté en la lista de destinatarios permitidos**:
   - Si usas dominio de prueba, agrega el email en Resend dashboard
   - O configura tu propio dominio verificado

4. **Revisar límites de Resend**:
   - Plan gratuito: 100 emails/día
   - Si excedes el límite, los emails se rechazarán

### Backend no se conecta

```bash
# Verificar que PostgreSQL esté corriendo
docker ps | grep postgres

# Si no está corriendo, iniciarlo
make db-up
# o
docker-compose up -d postgres
```

### Error en Prisma

```bash
cd apps/backend
pnpm prisma:generate
pnpm prisma migrate dev
```

## Archivos Modificados/Creados

### Modificados
- `apps/backend/.env` - Agregada variable `ADMIN_EMAIL=admin@aiquaa.com`
- `apps/backend/.env.example` - Actualizadas variables de Resend
- `apps/backend/src/mailer/resend.service.ts` - Agregado método `sendTestResultsReport` (para futuras pruebas de código)

### Ya Existentes (No Modificados)
- `apps/backend/src/istqb/istqb.service.ts` - Ya implementado el envío de correos
- `apps/backend/src/mailer/resend.service.ts` - Ya tiene método `sendIstqbExamReport`
- `scripts/test-istqb-email.js` - Script de prueba ya existente

## Próximos Pasos (Opcional)

1. **Configurar dominio propio** en Resend para usar `noreply@aiquaa.com`
2. **Agregar campo de email** en el formulario inicial del simulador para enviar copia al usuario
3. **Configurar API Key de producción** cuando el sistema esté listo para producción
4. **Monitorear logs de Resend** para verificar entregas exitosas

## Soporte

- **Documentación completa**: `docs/ISTQB_EMAIL_REPORTS.md`
- **Documentación de Resend**: https://resend.com/docs
- **Dashboard de Resend**: https://resend.com/emails

---

**Configurado por**: Claude Code
**Fecha**: 2 de Noviembre de 2025
**Estado**: ✅ Completamente funcional
