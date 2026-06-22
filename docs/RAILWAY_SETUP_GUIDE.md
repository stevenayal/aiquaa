# 🚂 Guía de Configuración de Railway para AIQUAA Backend

## ✅ Preparación Completada

Los archivos ya están listos para Railway:

- ✅ Puerto configurado para usar `process.env.PORT`
- ✅ Escuchando en `0.0.0.0` (requerido por Railway)
- ✅ `railway.json` creado con configuración óptima
- ✅ Scripts de build y start configurados
- ✅ Archivos de Vercel eliminados

---

## 📋 Pasos para Desplegar en Railway

### **1. Crear Cuenta y Proyecto**

1. Ve a: **https://railway.app**
2. Click en **"Login"** y conecta tu cuenta de GitHub
3. Click en **"New Project"**
4. Selecciona **"Deploy from GitHub repo"**
5. Autoriza Railway a acceder a tus repositorios
6. Selecciona el repositorio **`aiquaa`**

### **2. Configurar el Servicio**

Railway detectará automáticamente que es un proyecto Node.js. Necesitas configurar:

**Root Directory:**

```
apps/backend
```

**Build Command:** (Ya está en railway.json, pero verifica)

```
npm run build
```

**Start Command:** (Ya está en railway.json, pero verifica)

```
npm run start:prod
```

### **3. Configurar Variables de Entorno**

Click en la pestaña **"Variables"** y agrega TODAS estas variables:

```bash
# Database - Prisma Accelerate
DATABASE_URL=prisma+postgres://accelerate.prisma-data.net/?api_key=<YOUR_PRISMA_ACCELERATE_API_KEY>
POSTGRES_URL=postgres://<user>:<password>@db.prisma.io:5432/postgres?sslmode=require

# JWT - ⚠️ CAMBIA ESTE SECRET EN PRODUCCIÓN
JWT_SECRET=production-super-secret-jwt-key-change-this-min-32-chars
JWT_ACCESS_TTL=900
JWT_REFRESH_TTL=2592000
REFRESH_COOKIE_NAME=aiq_rt

# Email Configuration
EMAIL_FROM=AIQUAA <no-reply@aiquaa.com>
SMTP_URL=smtp://user:pass@smtp.gmail.com:587

# OAuth - Google
GOOGLE_CLIENT_ID=<YOUR_GOOGLE_CLIENT_ID>
GOOGLE_CLIENT_SECRET=<YOUR_GOOGLE_CLIENT_SECRET>

# OAuth - GitHub
GITHUB_CLIENT_ID=<YOUR_GITHUB_CLIENT_ID>
GITHUB_CLIENT_SECRET=<YOUR_GITHUB_CLIENT_SECRET>

# Supabase (si lo usas)
SUPABASE_URL=https://<YOUR_SUPABASE_PROJECT_REF>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<YOUR_SUPABASE_SERVICE_ROLE_KEY>

# Node Environment
NODE_ENV=production
```

**⚠️ IMPORTANTE:**

- Railway asigna automáticamente la variable `PORT`, NO la agregues manualmente
- La variable `FRONT_ORIGIN` la agregarás después de desplegar el frontend

### **4. Deploy**

1. Click en **"Deploy"**
2. Railway ejecutará automáticamente:
   - `npm install` (con --legacy-peer-deps gracias al .npmrc)
   - `npm run build`
   - `npm run start:prod`

3. Espera 2-3 minutos mientras se despliega

### **5. Obtener la URL del Backend**

Una vez desplegado, Railway te asignará una URL como:

```
https://aiquaa-backend-production.up.railway.app
```

O similar. La encontrarás en:

- La pestaña **"Deployments"**
- O en **"Settings"** → **"Domains"**

---

## 🔧 Configurar el Frontend en Vercel

### **1. Actualizar Variables de Entorno**

Ve a tu proyecto frontend en Vercel:

1. **Settings** → **Environment Variables**
2. Actualiza o agrega:

```bash
NEXT_PUBLIC_API_URL=https://tu-backend.up.railway.app
NEXT_PUBLIC_BACKEND_URL=https://tu-backend.up.railway.app
```

3. Click en **"Save"**

### **2. Redeploy el Frontend**

1. Ve a la pestaña **"Deployments"**
2. Click en los 3 puntos del último deployment
3. Click en **"Redeploy"**

O simplemente haz un git push:

```bash
git add .
git commit -m "chore: update backend URL to Railway"
git push origin main
```

### **3. Actualizar FRONT_ORIGIN en Railway**

Una vez que tengas la URL del frontend en Vercel (ej: `https://aiquaa.vercel.app`):

1. Ve a Railway → Variables
2. Agrega:

```bash
FRONT_ORIGIN=https://tu-frontend.vercel.app
```

3. Railway redesplegará automáticamente

---

## 🔐 Actualizar OAuth Callbacks

### **Google Cloud Console:**

1. Ve a: https://console.cloud.google.com/apis/credentials
2. Edita tu OAuth 2.0 Client ID
3. En **"Authorized redirect URIs"**, agrega:

```
https://tu-backend.up.railway.app/api/v1/auth/google/callback
```

### **GitHub OAuth App:**

1. Ve a: https://github.com/settings/developers
2. Edita tu OAuth App
3. En **"Authorization callback URL"**, actualiza a:

```
https://tu-backend.up.railway.app/api/v1/auth/github/callback
```

---

## ✅ Verificación Post-Despliegue

### **1. Health Check del Backend**

```bash
curl https://tu-backend.up.railway.app/api/v1/health
```

Debe responder:

```json
{ "status": "ok", "timestamp": "..." }
```

### **2. Verificar CORS**

Abre tu frontend en Vercel y abre DevTools (F12):

1. Intenta registrarte o hacer login
2. Verifica que no haya errores de CORS en la consola
3. Verifica la pestaña Network que las requests lleguen al backend

### **3. Test de Autenticación Completo**

Prueba:

- ✅ Registro de usuario
- ✅ Login con credenciales
- ✅ OAuth con Google
- ✅ OAuth con GitHub

---

## 📊 Monitoreo en Railway

Railway te proporciona:

### **Logs en Tiempo Real:**

- Click en tu servicio
- Pestaña **"Logs"**
- Verás todos los console.log de tu aplicación

### **Métricas:**

- Pestaña **"Metrics"**
- CPU, Memoria, Network usage

### **Deployments:**

- Pestaña **"Deployments"**
- Historial de todos tus deploys
- Rollback fácil si algo falla

---

## 🐛 Troubleshooting

### **Error: "Build failed"**

Verifica los logs en Railway. Posibles causas:

- Dependencias no instaladas correctamente
- Error en el build de TypeScript
- Falta alguna variable de entorno

**Solución:**

```bash
# Localmente, verifica que el build funcione:
cd apps/backend
npm run build
npm run start:prod
```

### **Error: "Application failed to respond"**

El servidor no está escuchando en el puerto correcto.

**Verificación:**

- Asegúrate que `src/main.ts` use `process.env.PORT`
- Verifica que escuche en `0.0.0.0`, no `localhost`

### **Error: "Cannot connect to database"**

Las variables de entorno no están configuradas.

**Verificación:**

- Revisa que `DATABASE_URL` y `POSTGRES_URL` estén en Railway
- Verifica que no haya espacios extras o saltos de línea

### **Error de CORS en el frontend**

**Solución:**

1. Asegúrate que `FRONT_ORIGIN` en Railway tenga la URL correcta del frontend
2. Verifica que Railway haya redesplegado después de agregar la variable
3. Limpia caché del navegador (Ctrl + Shift + R)

---

## 💰 Costos de Railway

Railway tiene un plan gratuito muy generoso:

- **$5 USD de créditos gratis por mes**
- Tu aplicación consumirá aprox: **$1-3 USD/mes** (tráfico bajo/medio)
- Cuando se acaben los créditos gratuitos, la app se pausará
- Puedes agregar $5/mes para mantenerla activa 24/7

---

## 🎉 ¡Listo!

Una vez completados todos los pasos:

✅ Backend desplegado en Railway
✅ Frontend desplegado en Vercel
✅ CORS configurado correctamente
✅ OAuth funcionando
✅ Base de datos conectada
✅ Logs y métricas disponibles

**¡Tu aplicación AIQUAA está en producción!** 🚀

---

## 📞 Si Necesitas Ayuda

- **Railway Docs:** https://docs.railway.app
- **Railway Discord:** https://discord.gg/railway
- **Vercel Docs:** https://vercel.com/docs

¡Éxito con tu deployment! 🎊
