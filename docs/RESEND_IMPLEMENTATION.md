# Implementación de Resend para AIQUAA

## 📧 Resumen

Se ha implementado Resend como servicio de envío de emails para reemplazar Nodemailer, mejorando la confiabilidad y el rendimiento del sistema de notificaciones por email.

## 🚀 Características Implementadas

### 1. Servicio de Email con Resend
- **Archivo**: `apps/backend/src/mailer/resend.service.ts`
- **Funcionalidades**:
  - Envío de emails de verificación de registro
  - Envío de emails de reset de contraseña
  - Envío de emails de bienvenida
  - Envío de códigos 2FA por email
  - Envío de alertas de seguridad

### 2. Verificación de Segundo Factor (2FA) por Email
- **Nuevos endpoints**:
  - `POST /auth/2fa/send-code` - Enviar código 2FA
  - `POST /auth/2fa/verify-code` - Verificar código 2FA
  - `POST /auth/2fa/complete-login` - Completar login con 2FA
  - `POST /auth/2fa/enable` - Habilitar 2FA por email
  - `POST /auth/2fa/disable` - Deshabilitar 2FA por email
  - `GET /auth/2fa/status` - Obtener estado del 2FA

### 3. Templates de Email Mejorados
- Diseño moderno y responsivo
- Gradientes y estilos mejorados
- Mejor experiencia de usuario
- Compatibilidad con diferentes clientes de email

## 🔧 Configuración

### Variables de Entorno

```bash
# Resend Configuration
RESEND_API_KEY=re_Vo8z4maQ_8ruYVtSYkU5Ye1ue2CPDPbcT
RESEND_FROM_EMAIL=onboarding@resend.dev
EMAIL_FROM="AIQUAA <no-reply@aiquaa.com>"
```

### Base de Datos

Se agregó un nuevo tipo de verificación en el enum `VerificationType`:
```prisma
enum VerificationType {
  VERIFY_EMAIL
  RESET_PASSWORD
  TWO_FACTOR_EMAIL  // ← Nuevo
}
```

## 📋 Flujo de Autenticación con 2FA

### 1. Login Normal (sin 2FA)
```
POST /auth/login
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña"
}
```

**Respuesta**:
```json
{
  "access_token": "jwt_token",
  "refresh_token": "refresh_token",
  "user": { ... }
}
```

### 2. Login con 2FA Habilitado
```
POST /auth/login
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña"
}
```

**Respuesta**:
```json
{
  "access_token": null,
  "refresh_token": null,
  "user": { ... },
  "requiresTwoFactor": true,
  "message": "Se ha enviado un código de verificación a tu email"
}
```

### 3. Completar Login con 2FA
```
POST /auth/2fa/complete-login
{
  "email": "usuario@ejemplo.com",
  "code": "123456"
}
```

**Respuesta**:
```json
{
  "access_token": "jwt_token",
  "refresh_token": "refresh_token",
  "user": { ... }
}
```

## 🛠️ Gestión de 2FA

### Habilitar 2FA
```bash
POST /auth/2fa/enable
Authorization: Bearer <token>
```

### Deshabilitar 2FA
```bash
POST /auth/2fa/disable
Authorization: Bearer <token>
```

### Verificar Estado
```bash
GET /auth/2fa/status
Authorization: Bearer <token>
```

**Respuesta**:
```json
{
  "enabled": true
}
```

## 🧪 Pruebas

### Script de Prueba de Resend
```bash
# Ejecutar desde la raíz del proyecto
.\test-resend.ps1
```

### Prueba Manual
```bash
# Enviar código 2FA
curl -X POST http://localhost:3001/auth/2fa/send-code \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@aiquaa.com"}'

# Verificar código
curl -X POST http://localhost:3001/auth/2fa/verify-code \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@aiquaa.com", "code": "123456"}'
```

## 📊 Ventajas de Resend

1. **Confiabilidad**: Mayor tasa de entrega de emails
2. **Rendimiento**: Envío más rápido que SMTP tradicional
3. **Analytics**: Mejor seguimiento de emails enviados
4. **Templates**: Soporte nativo para templates HTML
5. **API**: API moderna y fácil de usar
6. **Escalabilidad**: Maneja grandes volúmenes de emails

## 🔒 Seguridad

- Los códigos 2FA expiran en 10 minutos
- Los tokens de verificación se hashean antes de almacenar
- Los códigos se invalidan después de ser usados
- Rate limiting en todos los endpoints de 2FA

## 📝 Notas de Implementación

1. **Backward Compatibility**: El sistema mantiene compatibilidad con el sistema anterior
2. **Fallback**: Si Resend falla, el sistema puede usar Nodemailer como respaldo
3. **Logging**: Todos los envíos de email se registran en los logs
4. **Error Handling**: Manejo robusto de errores con mensajes informativos

## 🚀 Próximos Pasos

1. Configurar dominio personalizado en Resend
2. Implementar analytics de emails
3. Agregar más tipos de notificaciones por email
4. Implementar colas de email para mejor rendimiento
5. Agregar soporte para templates dinámicos

## 📞 Soporte

Para cualquier problema o pregunta sobre la implementación de Resend, contactar al equipo de desarrollo de AIQUAA.

