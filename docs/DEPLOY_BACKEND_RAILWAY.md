# 🚂 Desplegar Backend en Railway (Recomendado)

## ⚠️ Problema con Vercel

Vercel está diseñado para funciones serverless, no para aplicaciones NestJS completas. NestJS requiere un servidor HTTP persistente, lo cual es incompatible con la arquitectura serverless de Vercel.

**Railway** es perfecto para NestJS porque:

- ✅ Soporta servidores Node.js persistentes
- ✅ Gratis para empezar ($5 créditos mensuales)
- ✅ Deploy automático desde Git
- ✅ Variables de entorno fáciles
- ✅ Logs en tiempo real
- ✅ No requiere configuración especial

---

## 🚀 Pasos para Desplegar en Railway

### **Paso 1: Crear cuenta en Railway**

1. Ve a: https://railway.app
2. Click en "Start a New Project"
3. Conecta tu cuenta de GitHub

### **Paso 2: Crear nuevo proyecto desde GitHub**

1. Click en "Deploy from GitHub repo"
2. Selecciona tu repositorio `aiquaa`
3. Railway detectará automáticamente que es un proyecto Node.js

### **Paso 3: Configurar el proyecto**

Railway te permitirá configurar:

**Root Directory:** `apps/backend`

**Build Command:** `npm run build`

**Start Command:** `npm run start:prod`

**Port:** `3001` (o el puerto que uses en `process.env.PORT`)

### **Paso 4: Configurar Variables de Entorno**

En Railway Dashboard → Variables, agrega:

```bash
# Database - Prisma Accelerate
DATABASE_URL=prisma+postgres://accelerate.prisma-data.net/?api_key=<YOUR_PRISMA_ACCELERATE_API_KEY>
POSTGRES_URL=postgres://<user>:<password>@db.prisma.io:5432/postgres?sslmode=require

# JWT
JWT_SECRET=production-super-secret-jwt-key-min-32-characters-long
JWT_ACCESS_TTL=900
JWT_REFRESH_TTL=2592000
REFRESH_COOKIE_NAME=aiq_rt

# Email
EMAIL_FROM=AIQUAA <no-reply@aiquaa.com>
SMTP_URL=smtp://user:pass@smtp.gmail.com:587

# OAuth - Google
GOOGLE_CLIENT_ID=<YOUR_GOOGLE_CLIENT_ID>
GOOGLE_CLIENT_SECRET=<YOUR_GOOGLE_CLIENT_SECRET>

# OAuth - GitHub
GITHUB_CLIENT_ID=<YOUR_GITHUB_CLIENT_ID>
GITHUB_CLIENT_SECRET=<YOUR_GITHUB_CLIENT_SECRET>

# Backend Config
BACKEND_PORT=3001
NODE_ENV=production

# IMPORTANTE: La URL del frontend en Vercel
FRONT_ORIGIN=https://tu-frontend.vercel.app
```

### **Paso 5: Generar Dominio**

1. Railway te asignará automáticamente una URL como:

   ```
   https://aiquaa-backend-production.up.railway.app
   ```

2. O puedes configurar un dominio personalizado en Settings → Domains

### **Paso 6: Deploy**

1. Click en "Deploy"
2. Railway hará:
   - `npm install`
   - `npm run build`
   - `npm run start:prod`

3. Verifica el deploy en la pestaña **Deployments**

---

## ✅ Verificación Post-Despliegue

### **1. Health Check**

```bash
curl https://tu-backend.up.railway.app/api/v1/health
```

Debe responder:

```json
{ "status": "ok", "timestamp": "..." }
```

### **2. Logs en Tiempo Real**

Railway muestra logs en tiempo real en el dashboard, perfecto para debugging.

### **3. Actualizar Frontend**

Una vez que el backend esté en Railway, actualiza las variables del frontend en Vercel:

```bash
NEXT_PUBLIC_API_URL=https://tu-backend.up.railway.app
NEXT_PUBLIC_BACKEND_URL=https://tu-backend.up.railway.app
```

Luego redeploy el frontend en Vercel.

---

## 🔄 Actualizar OAuth Callbacks

### **Google Cloud Console:**

```
https://tu-backend.up.railway.app/api/v1/auth/google/callback
```

### **GitHub OAuth App:**

```
https://tu-backend.up.railway.app/api/v1/auth/github/callback
```

---

## 💰 Costos de Railway

- **Plan Free:**
  - $5 de créditos gratis por mes
  - Suficiente para proyectos pequeños/medianos
  - ~$0.02 por hora de compute

- **Plan Hobby ($5/mes):**
  - $5 de créditos incluidos
  - Ideal para producción pequeña

- **Railway consume ~$0.50-2 por mes** para una API con tráfico bajo/medio

---

## 🐛 Troubleshooting

### **Build falla en Railway:**

- Verifica que `apps/backend/package.json` tenga:
  ```json
  "scripts": {
    "build": "nest build",
    "start:prod": "node dist/main"
  }
  ```

### **App no inicia:**

- Verifica los logs en Railway Dashboard
- Asegúrate que el puerto esté configurado correctamente:
  ```typescript
  const port = process.env.PORT || 3001;
  ```

### **Error de conexión a DB:**

- Verifica que `DATABASE_URL` y `POSTGRES_URL` estén configurados
- Ejecuta `prisma generate` antes del build (ya está en scripts)

---

## 🎉 Ventajas de Railway vs Vercel para NestJS

| Feature                  | Railway            | Vercel                       |
| ------------------------ | ------------------ | ---------------------------- |
| **NestJS nativo**        | ✅ Sí              | ❌ No (requiere adaptadores) |
| **Servidor persistente** | ✅ Sí              | ❌ Serverless                |
| **WebSockets**           | ✅ Sí              | ❌ No                        |
| **Logs en tiempo real**  | ✅ Sí              | ⚠️ Limitados                 |
| **Cron jobs**            | ✅ Sí              | ❌ No                        |
| **Deploy automático**    | ✅ Desde Git       | ✅ Desde Git                 |
| **Precio**               | $5 créditos gratis | Gratis (serverless)          |

---

## 🚀 Alternativas a Railway

Si Railway no te funciona, otras opciones excelentes para NestJS:

1. **Render** (https://render.com)
   - Gratis para empezar
   - Muy similar a Railway

2. **Fly.io** (https://fly.io)
   - Gratis hasta 3 VMs pequeñas

3. **Heroku** (https://heroku.com)
   - Requiere tarjeta de crédito
   - $7/mes mínimo

---

## 📝 Resumen

1. ✅ Railway es la mejor opción para NestJS
2. ✅ Deploy en <5 minutos
3. ✅ Gratis para empezar
4. ✅ Sin configuración especial de serverless
5. ✅ Logs y debugging fáciles

**¡Desplegar en Railway resolverá todos los problemas de CORS y compatibilidad!** 🎉
