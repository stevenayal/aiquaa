# Guía de Prueba - Envío de Email del Examen GIT

## Estado de la Implementación ✅

Todos los componentes están correctamente implementados:

1. ✅ **Frontend**: Formulario con motivo y empresa (condicional)
2. ✅ **API Endpoint**: `POST /api/v1/labs/git/send-result`
3. ✅ **Backend Service**: LabsService y MailerService configurados
4. ✅ **Template de Email**: HTML con motivo y empresa incluidos
5. ✅ **Logs de Depuración**: Agregados en el frontend

## Pasos para Probar el Envío de Email

### 1. Iniciar los Servidores

```bash
# Terminal 1: Backend
cd Z:\Proyectos\aiquaa
pnpm dev:back

# Terminal 2: Frontend
cd Z:\Proyectos\aiquaa
pnpm dev:front
```

### 2. Verificar que el Backend está Corriendo

Abre en tu navegador: http://localhost:3001/api/v1/health

Deberías ver algo como:
```json
{
  "status": "ok",
  "timestamp": "2025-11-20T..."
}
```

### 3. Realizar un Examen de Prueba

1. Abre: http://localhost:3001/labs/git
2. Completa el formulario:
   - **Nombre**: Tu Nombre
   - **GitHub**: https://github.com/tu-usuario
   - **Motivo**: Postulación / Proceso de Selección
   - **Empresa**: Google (o cualquier empresa)
3. Inicia el examen
4. Responde algunas preguntas
5. Finaliza el examen
6. En la pantalla de resultados, presiona **"📧 Enviar al Admin"**

### 4. Verificar los Logs

#### Frontend (Consola del Navegador - F12)
Deberías ver:
```
Enviando resultado al endpoint: http://localhost:3001/api/v1/labs/git/send-result
Datos a enviar: { examResult: {...} }
Respuesta del servidor: 200 OK
Correo enviado exitosamente: { message: "Resultado enviado exitosamente a admin@aiquaa.com" }
```

#### Backend (Terminal)
Deberías ver:
```
[LabsService] Enviando resultado de examen Git a admin@aiquaa.com - Estudiante: Tu Nombre
[ResendService] Resultado de examen Git enviado a admin@aiquaa.com: re_...
```

### 5. Verificar el Email

El correo se envía a: **admin@aiquaa.com**

El email incluye:
- ✅ Nombre del participante
- ✅ Perfil de GitHub (clickable)
- ✅ **Motivo del examen** (con badge de color)
- ✅ **Empresa** (si el motivo es "Postulación")
- ✅ Fecha y hora
- ✅ Tiempo empleado
- ✅ Resultado (Aprobado/No Aprobado)
- ✅ Desglose por áreas de conocimiento
- ✅ Top 3 preguntas incorrectas

## Problemas Comunes y Soluciones

### Error: "Failed to fetch"
**Causa**: El backend no está corriendo
**Solución**: Verifica que `pnpm dev:back` esté ejecutándose

### Error: "CORS policy"
**Causa**: Configuración de CORS incorrecta
**Solución**: El CORS ya está configurado para localhost:3001, pero verifica en `apps/backend/src/main.ts`

### Error: "Error de Resend"
**Causa**: API key de Resend inválida o no configurada
**Solución**:
1. Verifica que `RESEND_API_KEY` esté en `.env` del backend
2. La clave actual es: `re_Vo8z4maQ_8ruYVtSYkU5Ye1ue2CPDPbcT`
3. Si no está configurada, el servicio usa esta clave como fallback

### El correo no llega
**Posibles causas**:
1. La API key de Resend no es válida
2. El email `admin@aiquaa.com` no está verificado en Resend
3. El email está en spam

**Solución**:
1. Ve a https://resend.com/domains
2. Verifica que el dominio esté configurado
3. Verifica que `admin@aiquaa.com` esté en la lista de emails permitidos

## Prueba Manual con cURL

Si quieres probar el endpoint directamente sin usar el frontend:

```bash
curl -X POST http://localhost:3001/api/v1/labs/git/send-result \
  -H "Content-Type: application/json" \
  -d '{
    "examResult": {
      "participantName": "Juan Pérez",
      "githubProfile": "https://github.com/juanperez",
      "examPurpose": "postulacion",
      "companyName": "Google",
      "score": 32,
      "totalQuestions": 40,
      "correctAnswers": 32,
      "incorrectAnswers": 8,
      "passed": true,
      "percentage": 80,
      "timeSpent": 2400,
      "answers": [],
      "learningObjectiveAnalysis": [
        {
          "learningObjective": "Git Básico",
          "totalQuestions": 10,
          "correctAnswers": 8,
          "percentage": 80
        }
      ]
    }
  }'
```

Respuesta esperada:
```json
{
  "message": "Resultado enviado exitosamente a admin@aiquaa.com"
}
```

## Verificar Variables de Entorno

### Backend (.env)
```bash
# Verifica que estas variables existan
RESEND_API_KEY=re_Vo8z4maQ_8ruYVtSYkU5Ye1ue2CPDPbcT
RESEND_FROM_EMAIL=onboarding@resend.dev
ADMIN_EMAIL=admin@aiquaa.com
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Checklist de Verificación

- [ ] Backend corriendo en http://localhost:3001
- [ ] Frontend corriendo en http://localhost:3001
- [ ] Endpoint de health responde: http://localhost:3001/api/v1/health
- [ ] Variables de entorno configuradas
- [ ] RESEND_API_KEY válida
- [ ] Completar examen y ver pantalla de resultados
- [ ] Presionar botón "📧 Enviar al Admin"
- [ ] Ver logs en consola del navegador (F12)
- [ ] Ver logs en terminal del backend
- [ ] Verificar email en admin@aiquaa.com

## Siguiente Paso

Ejecuta los servidores y realiza una prueba completa siguiendo estos pasos. Si encuentras algún error específico, compártelo y lo solucionaremos.
