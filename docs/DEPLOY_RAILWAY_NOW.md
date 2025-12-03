# 🚀 DEPLOYMENT EN RAILWAY - GUÍA RÁPIDA

**Fecha:** Noviembre 30, 2025
**Estado:** Listo para deployment

---

## 🎯 OPCIÓN 1: DEPLOYMENT VÍA WEB (RECOMENDADO - MÁS FÁCIL)

### Paso 1: Crear Cuenta y Proyecto en Railway

1. **Ve a Railway:**
   ```
   https://railway.app
   ```

2. **Regístrate/Inicia sesión:**
   - Puedes usar tu cuenta de GitHub

3. **Crea nuevo proyecto:**
   - Click en "New Project"
   - Selecciona "Deploy from GitHub repo"
   - Autoriza a Railway para acceder a tu GitHub
   - Busca y selecciona: `stevenayal/aiquaa`

### Paso 2: Agregar PostgreSQL

1. **En tu proyecto, click en "New"**
2. **Selecciona "Database" → "Add PostgreSQL"**
3. **Railway creará automáticamente:**
   - Una instancia de PostgreSQL
   - Variable `DATABASE_URL` (se conectará automáticamente)

### Paso 3: Configurar Variables de Entorno

1. **Click en tu servicio (aiquaa)**
2. **Ve a "Variables"**
3. **Agrega las siguientes variables:**

#### Variables OBLIGATORIAS:

```bash
# Node Environment
NODE_ENV=production

# JWT (genera un valor seguro con el comando de abajo)
JWT_SECRET=<pega-el-valor-generado>
JWT_ACCESS_TTL=3600
JWT_REFRESH_TTL=2592000
REFRESH_COOKIE_NAME=aiq_rt

# CORS - URL de tu frontend
FRONT_ORIGIN=https://tu-app.vercel.app

# Logging
LOG_LEVEL=info
```

**Generar JWT_SECRET seguro:**

En tu terminal local, ejecuta:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

Copia el resultado y úsalo como `JWT_SECRET`.

#### Variables OPCIONALES (si tienes las API keys):

```bash
# Email - Resend (opcional)
RESEND_API_KEY=tu_api_key_de_resend

# OAuth Google (opcional)
GOOGLE_CLIENT_ID=tu_google_client_id
GOOGLE_CLIENT_SECRET=tu_google_client_secret

# OAuth GitHub (opcional)
GITHUB_CLIENT_ID=tu_github_client_id
GITHUB_CLIENT_SECRET=tu_github_client_secret
```

### Paso 4: Configurar Dominio y Deployment

1. **Ve a "Settings" de tu servicio**
2. **En "Domains", click "Generate Domain"**
3. **Railway generará una URL tipo:**
   ```
   https://aiquaa-backend-production.up.railway.app
   ```
4. **Copia esta URL** (la necesitarás para conectar el frontend)

### Paso 5: Deploy

1. **Railway detectará automáticamente `railway.toml`**
2. **El deployment se iniciará automáticamente**
3. **Ve a "Deployments" para ver el progreso**

**El proceso tomará unos 3-5 minutos:**
- Instalará dependencias
- Ejecutará el script de auto-inicialización
- Creará todas las tablas en PostgreSQL
- Insertará usuarios demo
- Iniciará el servidor

### Paso 6: Verificar Deployment

Una vez que el deployment complete:

1. **Ve a "Logs" para verificar:**
   ```
   ✅ INICIALIZACIÓN COMPLETADA EXITOSAMENTE
   📊 Tablas: 16
   👤 Usuarios: 2
   📁 Categorías: 4
   ```

2. **Prueba el backend:**
   ```bash
   # Health check
   curl https://tu-app.up.railway.app/health

   # API Docs
   https://tu-app.up.railway.app/api/v1/docs
   ```

---

## 🎯 OPCIÓN 2: DEPLOYMENT VÍA CLI

### Instalación de Railway CLI

```bash
# Windows (PowerShell)
iwr https://railway.app/install.ps1 | iex

# Mac/Linux
npm install -g @railway/cli
```

### Deployment con CLI

```bash
# 1. Login
railway login

# 2. Crear proyecto
railway init

# 3. Agregar PostgreSQL
railway add --plugin postgresql

# 4. Generar JWT_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"

# 5. Configurar variables (una por una)
railway variables set NODE_ENV=production
railway variables set JWT_SECRET="<tu-secret-generado>"
railway variables set JWT_ACCESS_TTL=3600
railway variables set JWT_REFRESH_TTL=2592000
railway variables set REFRESH_COOKIE_NAME=aiq_rt
railway variables set FRONT_ORIGIN="https://tu-app.vercel.app"
railway variables set LOG_LEVEL=info

# 6. Deploy
railway up

# 7. Ver logs
railway logs

# 8. Abrir dashboard
railway open
```

---

## ✅ POST-DEPLOYMENT: VERIFICACIÓN

### 1. Verificar Health Check

```bash
curl https://tu-app.up.railway.app/health
```

**Respuesta esperada:**
```json
{
  "status": "ok",
  "time": "2025-11-30T...",
  "uptime": 123.45,
  "environment": "production"
}
```

### 2. Verificar Swagger Docs

Abre en el navegador:
```
https://tu-app.up.railway.app/api/v1/docs
```

Deberías ver la documentación de la API con todos los endpoints.

### 3. Test de Login

```bash
curl -X POST https://tu-app.up.railway.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@aiquaa.com","password":"Demo123!"}'
```

**Respuesta esperada:**
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

### 4. Ejecutar Pruebas E2E

```bash
BACKEND_URL="https://tu-app.up.railway.app" \
node scripts/e2e-post-deployment.js
```

---

## 🔗 CONECTAR FRONTEND (VERCEL)

Una vez que el backend esté desplegado:

### 1. Ve a tu proyecto en Vercel

```
https://vercel.com/tu-usuario/aiquaa
```

### 2. Agrega Variable de Entorno

1. Ve a "Settings" → "Environment Variables"
2. Agrega:
   ```
   NEXT_PUBLIC_API_URL=https://tu-app.up.railway.app
   ```

### 3. Redeploy Frontend

1. Ve a "Deployments"
2. Click en el último deployment
3. Click en "⋯" → "Redeploy"

---

## 🐛 TROUBLESHOOTING

### Deployment Falla

**Ver logs en Railway:**
1. Ve a "Deployments"
2. Click en el deployment fallido
3. Revisa los logs

**Errores comunes:**

1. **Error: "DATABASE_URL not found"**
   - Solución: Asegúrate de haber agregado PostgreSQL al proyecto

2. **Error: "JWT_SECRET not configured"**
   - Solución: Agrega `JWT_SECRET` a las variables de entorno

3. **Error: "CORS blocked"**
   - Solución: Verifica que `FRONT_ORIGIN` incluya la URL de tu frontend

### Login No Funciona desde Frontend

1. **Verifica CORS:**
   ```bash
   curl -H "Origin: https://tu-frontend.vercel.app" \
        https://tu-backend.railway.app/health -v
   ```

   Busca: `access-control-allow-origin`

2. **Verifica que NEXT_PUBLIC_API_URL esté configurado:**
   - En Vercel → Settings → Environment Variables

### Base de Datos Vacía

El sistema debería crear todo automáticamente. Si no:

1. **Ve a Railway → PostgreSQL**
2. **Click en "Data"** para ver las tablas
3. **Si no hay tablas, revisa los logs** del deployment

---

## 📊 MONITOREO

### Ver Logs en Tiempo Real

**Vía Web:**
1. Railway Dashboard → Tu servicio → "Logs"

**Vía CLI:**
```bash
railway logs
```

### Métricas

Railway muestra automáticamente:
- CPU usage
- Memory usage
- Request count
- Response times

Accede desde el dashboard.

---

## 💰 COSTOS

### Plan Gratuito de Railway:

- $5 de crédito gratis por mes
- Suficiente para desarrollo/testing
- PostgreSQL incluido

### Para Producción:

- Considera el plan "Hobby" ($5/mes)
- PostgreSQL: ~$5/mes adicional

---

## 🎉 RESULTADO ESPERADO

Una vez completado, tendrás:

✅ Backend desplegado en Railway
✅ PostgreSQL configurado y conectado
✅ 16 tablas creadas automáticamente
✅ 2 usuarios de prueba (admin + demo)
✅ 4 categorías iniciales
✅ Swagger API docs disponibles
✅ Sistema de login funcionando
✅ CORS configurado para tu frontend

---

## 📚 RECURSOS ÚTILES

- **Railway Docs:** https://docs.railway.app
- **Railway Status:** https://status.railway.app
- **Guía de deployment:** `RAILWAY_DEPLOYMENT_GUIDE.md`
- **Pruebas E2E:** `E2E_TEST_RESULTS.md`
- **Auto-inicialización:** `apps/backend/DATABASE_AUTO_INIT.md`

---

## 🆘 NECESITAS AYUDA?

Si encuentras problemas:

1. Revisa los logs en Railway
2. Ejecuta las pruebas E2E
3. Consulta `RAILWAY_DEPLOYMENT_GUIDE.md`
4. Verifica las variables de entorno

---

**¡Listo para deployment! Sigue los pasos arriba y en 10 minutos tendrás tu backend en producción.**
