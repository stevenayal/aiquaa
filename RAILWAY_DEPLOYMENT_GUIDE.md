# Guía de Despliegue en Railway - Backend AIQUAA

## Configuración Completada

La base de datos PostgreSQL en Railway ha sido configurada y está lista para usar.

### ✅ Tareas Completadas

1. **Base de datos configurada:** PostgreSQL en Railway
2. **Schema sincronizado:** Todas las tablas creadas
3. **Usuarios de prueba creados:**
   - Admin: `admin@aiquaa.com` / `admin123`
   - Demo: `demo@aiquaa.com` / `demo123`
4. **Categorías creadas:** 4 categorías por defecto

---

## 📊 Información de la Base de Datos

### Conexión PostgreSQL Railway

**Host:** yamabiko.proxy.rlwy.net:53801
**Database:** railway
**Usuario:** postgres
**Password:** eBPaOpZlpKxyAbLUFllzPDSsuBannFlv

**URL de Conexión:**
```
postgresql://postgres:eBPaOpZlpKxyAbLUFllzPDSsuBannFlv@yamabiko.proxy.rlwy.net:53801/railway
```

---

## 🚀 Variables de Entorno para Railway

### Variables Obligatorias

Configura estas variables en el dashboard de Railway (Settings → Variables):

```bash
# Node Configuration
NODE_ENV=production
PORT=3001

# Database (Railway ya configura DATABASE_URL automáticamente)
DATABASE_URL=${{Postgres.DATABASE_URL}}
POSTGRES_URL=${{Postgres.DATABASE_URL}}

# JWT Configuration (¡CAMBIAR EN PRODUCCIÓN!)
JWT_SECRET=tu-secret-key-seguro-aqui-cambiar-en-produccion
JWT_ACCESS_TTL=3600
JWT_REFRESH_TTL=2592000
REFRESH_COOKIE_NAME=aiq_rt

# Frontend Origin (actualizar con tu dominio real)
FRONT_ORIGIN=https://aiquaa.com,https://www.aiquaa.com,https://aiquaa.vercel.app
BACKEND_URL=${{RAILWAY_PUBLIC_DOMAIN}}
APP_URL=${{RAILWAY_PUBLIC_DOMAIN}}

# Email - Resend (opcional, solo si tienes API key)
RESEND_API_KEY=re_tu_api_key_de_resend
RESEND_FROM_EMAIL="AIQUAA <noreply@aiquaa.com>"
ADMIN_EMAIL=admin@aiquaa.com

# Logging
LOG_LEVEL=info
```

### Variables Opcionales (OAuth)

```bash
# Google OAuth (configurar si vas a usar login con Google)
GOOGLE_CLIENT_ID=tu-google-client-id
GOOGLE_CLIENT_SECRET=tu-google-client-secret

# GitHub OAuth (configurar si vas a usar login con GitHub)
GITHUB_CLIENT_ID=tu-github-client-id
GITHUB_CLIENT_SECRET=tu-github-client-secret
```

---

## 🔧 Configuración en Railway

### Paso 1: Crear Servicio Backend

1. Ve a tu proyecto en Railway
2. Click en "New Service" → "Empty Service"
3. Conecta tu repositorio GitHub
4. Selecciona la rama `main`

### Paso 2: Configurar Variables de Entorno

1. Ve a Settings → Variables
2. Agrega las variables listadas arriba
3. Railway automáticamente provee `DATABASE_URL` si conectaste PostgreSQL

### Paso 3: Configurar Build

Railway usa el archivo `railway.toml` en la raíz del proyecto que ya está configurado:

```toml
[build]
builder = "NIXPACKS"
buildCommand = "pnpm install && cd apps/backend && npx prisma generate && npx prisma db push --accept-data-loss && cd ../.. && pnpm build:backend"

[deploy]
startCommand = "pnpm start:prod"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10

[env]
NODE_ENV = "production"
```

### Paso 4: Desplegar

1. Click en "Deploy" o haz push a `main`
2. Railway ejecutará:
   - Instalación de dependencias
   - Generación del cliente Prisma
   - Sincronización del schema con la base de datos
   - Build del backend
   - Start del servidor

---

## 🧪 Usuarios de Prueba (Ya Creados)

Los siguientes usuarios ya están en la base de datos Railway:

| Usuario | Email | Password | Rol |
|---------|-------|----------|-----|
| **Admin** | admin@aiquaa.com | admin123 | ADMIN |
| **Demo** | demo@aiquaa.com | demo123 | USER |

**IMPORTANTE:** Cambia las contraseñas en producción o elimina estos usuarios.

---

## 🔍 Verificar Despliegue

### Endpoints para Verificar

Una vez desplegado, verifica estos endpoints:

1. **Health Check:**
   ```bash
   curl https://tu-app.railway.app/health
   ```

2. **API Docs (Swagger):**
   ```
   https://tu-app.railway.app/api/v1/docs
   ```

3. **Test de Login:**
   ```bash
   curl -X POST https://tu-app.railway.app/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"demo@aiquaa.com","password":"demo123"}'
   ```

   Respuesta esperada:
   ```json
   {
     "access_token": "eyJhbGci...",
     "user": {
       "id": 2,
       "email": "demo@aiquaa.com",
       "name": "Demo User",
       "role": "USER"
     }
   }
   ```

---

## 📝 Comandos Útiles

### Ejecutar Migraciones Manualmente

Si necesitas ejecutar migraciones después del despliegue:

```bash
# En tu máquina local con las variables de entorno de Railway
cd apps/backend
npx prisma db push
```

### Ejecutar Seed Manualmente

Si necesitas recrear los usuarios de prueba:

```bash
cd apps/backend
npx prisma db seed
```

### Ver Logs en Railway

1. Ve a tu servicio en Railway
2. Click en "Deployments"
3. Selecciona el deployment actual
4. Click en "View Logs"

---

## 🔐 Seguridad en Producción

### ⚠️ Tareas Importantes Antes de Producción

- [ ] **Cambiar JWT_SECRET** a un valor aleatorio seguro
- [ ] **Cambiar/eliminar usuarios de prueba** (admin@aiquaa.com, demo@aiquaa.com)
- [ ] **Configurar CORS** con tu dominio real en `FRONT_ORIGIN`
- [ ] **Habilitar HTTPS** (Railway lo hace automáticamente)
- [ ] **Configurar rate limiting** para endpoints de autenticación
- [ ] **Configurar monitoreo** (Sentry, LogDNA, etc.)
- [ ] **Backup de base de datos** (Railway ofrece backups automáticos)

### Generar JWT_SECRET Seguro

```bash
# En tu terminal local
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

Copia el resultado y úsalo como `JWT_SECRET` en Railway.

---

## 🐛 Troubleshooting

### Error: "Can't reach database server"

**Causa:** Las credenciales de la base de datos son incorrectas o Railway no puede conectarse.

**Solución:**
1. Verifica que `DATABASE_URL` esté configurado correctamente
2. Verifica que el servicio PostgreSQL esté corriendo en Railway
3. Verifica que la URL incluya `sslmode=require` si Railway lo requiere

### Error: "Prisma Client not generated"

**Causa:** El cliente de Prisma no se generó durante el build.

**Solución:**
1. Verifica que el `buildCommand` en `railway.toml` incluya `npx prisma generate`
2. Redeploy el servicio

### Error: "Migration failed"

**Causa:** El schema cambió pero las migraciones no se aplicaron.

**Solución:**
1. Ejecuta `npx prisma db push` localmente con las credenciales de Railway
2. O usa `npx prisma migrate deploy` si tienes migraciones pendientes

### El login no funciona desde el frontend

**Causa:** CORS no está configurado correctamente.

**Solución:**
1. Verifica que `FRONT_ORIGIN` en Railway incluya tu dominio de Vercel
2. Ejemplo: `FRONT_ORIGIN=https://aiquaa.com,https://aiquaa.vercel.app`

---

## 🔄 Actualizar el Schema de Base de Datos

Si haces cambios al schema de Prisma:

1. **Actualiza `apps/backend/prisma/schema.prisma`**
2. **Genera una migración (local):**
   ```bash
   cd apps/backend
   npx prisma migrate dev --name nombre_de_la_migracion
   ```
3. **Commit y push** los archivos de migración
4. **Railway ejecutará automáticamente** las migraciones en el siguiente deploy

O simplemente usa `npx prisma db push` para sincronizar directamente (no recomendado para producción).

---

## 📊 Estado Actual

✅ Base de datos PostgreSQL configurada en Railway
✅ Schema sincronizado (todas las tablas creadas)
✅ Usuarios de prueba creados
✅ Categorías iniciales creadas
✅ Archivo `.env` configurado localmente
✅ Archivo `railway.toml` actualizado
✅ Variables de entorno documentadas

---

## 🎯 Próximos Pasos

1. **Configurar variables de entorno en Railway** usando la lista de arriba
2. **Desplegar el backend** haciendo push a `main`
3. **Verificar endpoints** (health, swagger, login)
4. **Conectar frontend** actualizando `NEXT_PUBLIC_API_URL` en Vercel
5. **Probar login end-to-end** desde el frontend desplegado

---

## 📞 Soporte

Si tienes problemas durante el despliegue:

1. Revisa los logs en Railway (Deployments → View Logs)
2. Verifica las variables de entorno
3. Verifica que la base de datos esté corriendo
4. Consulta la documentación oficial de Railway: https://docs.railway.app

---

**Última actualización:** Noviembre 30, 2025
**Autor:** Claude Code
**Estado:** ✅ Configuración completada y verificada
