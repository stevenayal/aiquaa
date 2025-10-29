# Sistema de Informes por Email - Simulador ISTQB

## Descripción

Sistema automático que envía informes detallados por email a `admin@aiquaa.com` cada vez que un usuario completa un examen en el simulador ISTQB CTFL v4.0.

## Características

- ✅ Guardado automático de resultados en base de datos PostgreSQL
- 📧 Envío automático de informe HTML por email usando Resend
- 📊 Informe detallado con:
  - Estado de aprobación (APROBADO/NO APROBADO)
  - Puntaje y porcentaje
  - Información del participante
  - Tiempo empleado
  - Desglose por Learning Objectives
  - Top 3 preguntas incorrectas
- 🔄 Proceso asíncrono no bloqueante
- 📈 API de estadísticas disponible

## Arquitectura

### Backend (NestJS)

```
apps/backend/src/istqb/
├── dto/
│   └── submit-exam.dto.ts          # DTOs de validación
├── istqb.controller.ts             # Controlador con endpoints
├── istqb.service.ts                # Lógica de negocio
└── istqb.module.ts                 # Módulo NestJS

apps/backend/src/mailer/
└── resend.service.ts               # Servicio de email (extendido con ISTQB)

apps/backend/prisma/
└── schema.prisma                   # Schema con modelo IstqbExamResult
```

### Frontend (Next.js)

```
apps/frontend/src/app/labs/istqb/
├── hooks/
│   └── useSubmitResults.ts         # Hook personalizado para envío
└── components/
    └── ResultsScreen.tsx           # Componente que usa el hook
```

## Configuración

### Variables de Entorno

#### Backend (.env o .env.local)

```bash
# Base de datos
DATABASE_URL="postgresql://user:password@localhost:5432/aiquaa"
POSTGRES_URL="postgresql://user:password@localhost:5432/aiquaa"

# Email - Resend
RESEND_API_KEY="re_xxxxx"                    # API Key de Resend
RESEND_FROM_EMAIL="noreply@aiquaa.com"       # Email remitente
ADMIN_EMAIL="admin@aiquaa.com"               # Email destinatario de informes

# App
APP_URL="https://aiquaa.com"                 # URL de la aplicación
```

#### Frontend (.env.local)

```bash
NEXT_PUBLIC_API_URL="http://localhost:3001"  # URL del backend
```

### Obtener API Key de Resend

1. Regístrate en [resend.com](https://resend.com)
2. Verifica tu dominio (o usa el dominio de prueba)
3. Ve a **API Keys** en el dashboard
4. Crea una nueva API Key
5. Copia la key y agrégala a `RESEND_API_KEY` en el `.env`

## Instalación

### 1. Ejecutar Migraciones de Base de Datos

```bash
cd apps/backend
pnpm prisma:migrate
# o alternativamente
pnpm prisma migrate dev --name add-istqb-exam-results
```

Esto creará la tabla `istqb_exam_results` en PostgreSQL con el siguiente schema:

```sql
CREATE TABLE "istqb_exam_results" (
  "id" SERIAL PRIMARY KEY,
  "participant_name" VARCHAR(255) NOT NULL,
  "participant_email" VARCHAR(255),
  "start_time" TIMESTAMP NOT NULL,
  "end_time" TIMESTAMP NOT NULL,
  "time_spent_seconds" INTEGER NOT NULL,
  "score" INTEGER NOT NULL,
  "total_questions" INTEGER NOT NULL,
  "percentage" DECIMAL(5,2) NOT NULL,
  "passed" BOOLEAN NOT NULL,
  "mode" "ExamMode" NOT NULL DEFAULT 'EXAM',
  "answers" JSONB NOT NULL,
  "learning_objectives" JSONB NOT NULL,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE "ExamMode" AS ENUM ('EXAM', 'TRAINING');
```

### 2. Generar Cliente de Prisma

```bash
cd apps/backend
pnpm prisma:generate
```

### 3. Verificar Compilación

```bash
# Backend
cd apps/backend
pnpm build

# Frontend
cd apps/frontend
pnpm build
```

## Uso

### Envío Automático desde el Simulador

El sistema funciona automáticamente cuando un usuario completa un examen:

1. Usuario finaliza el examen
2. `ResultsScreen` se monta y muestra los resultados
3. El hook `useSubmitResults` se ejecuta automáticamente
4. Se envía un POST a `/api/v1/istqb/submit-exam`
5. El backend:
   - Guarda los resultados en la base de datos
   - Envía un email asíncrono al administrador
   - Retorna confirmación al frontend

### Testing Manual

#### Opción 1: Script de Prueba

```bash
# Desde la raíz del proyecto
API_URL="http://localhost:3001" node scripts/test-istqb-email.js
```

#### Opción 2: cURL

```bash
curl -X POST http://localhost:3001/api/v1/istqb/submit-exam \
  -H "Content-Type: application/json" \
  -d '{
    "participantName": "Test User",
    "participantEmail": "test@example.com",
    "startTime": "2025-01-20T10:00:00.000Z",
    "endTime": "2025-01-20T11:00:00.000Z",
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

#### Opción 3: Postman/Thunder Client

1. Import la colección de API desde `http://localhost:3001/api/v1/docs-json`
2. Busca el endpoint `POST /istqb/submit-exam`
3. Ejecuta con datos de prueba

## Endpoints de API

### POST /api/v1/istqb/submit-exam

Envía resultados de un examen completado.

**Request Body:**
```json
{
  "participantName": "string",
  "participantEmail": "string (opcional)",
  "startTime": "ISO 8601 date",
  "endTime": "ISO 8601 date",
  "timeSpent": "number (segundos)",
  "score": "number",
  "totalQuestions": "number",
  "correctAnswers": "number",
  "incorrectAnswers": "number",
  "percentage": "number (0-100)",
  "passed": "boolean",
  "mode": "EXAM | TRAINING",
  "answers": "AnswerDetail[]",
  "learningObjectiveAnalysis": "LearningObjectiveResult[]"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Resultado guardado exitosamente",
  "id": 123
}
```

### GET /api/v1/istqb/results

Obtiene todos los resultados con filtros opcionales.

**Query Params:**
- `email` - Filtrar por email del participante
- `passed` - Filtrar por estado (true/false)

### GET /api/v1/istqb/results/:id

Obtiene un resultado específico por ID.

### GET /api/v1/istqb/stats

Obtiene estadísticas generales.

**Response:**
```json
{
  "total": 150,
  "passed": 95,
  "failed": 55,
  "passRate": "63.33",
  "averageScore": 28.5,
  "averagePercentage": "71.25"
}
```

## Estructura del Email

El email enviado incluye:

### Header
- Logo AIQUAA
- Título: "Simulador ISTQB CTFL v4.0"
- Subtítulo: "Informe de Examen Completado"

### Estado del Examen
- Badge visual de APROBADO/NO APROBADO
- Puntaje total y porcentaje
- Color verde para aprobados, rojo para reprobados

### Información del Participante
- Nombre
- Email (si está disponible)
- Fecha y hora del examen
- Tiempo empleado
- Modo (EXAMEN o ENTRENAMIENTO)
- ID del resultado en la BD

### Resumen de Resultados
- 3 cards con iconos:
  - 🏆 Puntaje
  - ✓ Correctas
  - ✗ Incorrectas

### Desglose por Learning Objectives
- Tabla con todos los LOs
- Resultado (X/Y)
- Porcentaje con badge de color:
  - Verde: ≥70%
  - Amarillo: 50-69%
  - Rojo: <50%

### Top 3 Preguntas Incorrectas
- Número de pregunta
- Learning Objective y K-Level
- Texto de la pregunta (primeros 150 caracteres)
- Respuesta del usuario vs. Correcta

### Footer
- Copyright
- Nota: Email sin respuesta

## Formato del Email (HTML)

El email usa:
- HTML moderno con inline CSS
- Diseño responsive
- Gradientes y colores de marca AIQUAA
- Tipografía system-font para mejor compatibilidad
- Compatible con todos los clientes de email principales

## Troubleshooting

### Email no se envía

1. **Verificar API Key de Resend:**
   ```bash
   echo $RESEND_API_KEY
   ```

2. **Ver logs del backend:**
   ```bash
   # El backend debería mostrar:
   # "Email de informe enviado al admin para examen ID: X"
   # o
   # "Error enviando email de informe: [mensaje]"
   ```

3. **Verificar dominio en Resend:**
   - El dominio debe estar verificado en Resend
   - O usar el dominio de prueba: `onboarding@resend.dev`

4. **Revisar cuota de Resend:**
   - Plan gratuito: 100 emails/día
   - Plan pro: 50,000 emails/mes

### Error de compilación de Prisma

```bash
# Regenerar cliente
cd apps/backend
pnpm prisma:generate

# Re-ejecutar migraciones
pnpm prisma migrate dev
```

### Error de CORS en frontend

Verificar que `NEXT_PUBLIC_API_URL` esté correctamente configurado y que el backend permita requests desde ese origen.

### Base de datos no conecta

```bash
# Verificar que PostgreSQL esté corriendo
make db-up

# O manualmente con Docker
docker-compose up -d postgres
```

## Monitoreo y Logs

### Ver resultados guardados

```bash
# Usando Prisma Studio
cd apps/backend
pnpm prisma:studio
```

### Logs del backend

```bash
# El servicio registra eventos importantes:
# - "Resultado de examen guardado: {id} - {nombre}"
# - "Email de informe enviado al admin para examen ID: {id}"
# - "Error guardando resultado de examen: {error}"
# - "Error enviando email de informe: {error}"
```

### Verificar emails enviados en Resend

1. Login en [resend.com](https://resend.com)
2. Ve a **Logs** en el dashboard
3. Busca emails enviados a `admin@aiquaa.com`
4. Revisa estado (delivered/bounced/failed)

## Mejoras Futuras

- [ ] Agregar campo de email en el formulario inicial del simulador
- [ ] Permitir al usuario recibir una copia del informe
- [ ] Dashboard de analytics con gráficos
- [ ] Export de resultados a Excel/PDF
- [ ] Filtros avanzados en la API
- [ ] Webhooks para integración con otros sistemas
- [ ] Retry automático con exponential backoff si falla el email
- [ ] Notificaciones en tiempo real (WebSockets)
- [ ] Soporte para múltiples destinatarios
- [ ] Plantillas de email personalizables

## Soporte

Para problemas o preguntas:
- Revisa los logs del backend
- Consulta la documentación de [Resend](https://resend.com/docs)
- Abre un issue en el repositorio
- Contacta al equipo de desarrollo

## License

© 2024 AIQUAA. Todos los derechos reservados.
