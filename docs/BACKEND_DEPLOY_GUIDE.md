# 🚀 Guía para Desplegar el Backend en Vercel

## 📋 Problema Actual

El frontend desplegado en Vercel está intentando conectarse a `http://localhost:3001`, pero localhost no es accesible desde la nube. Necesitas desplegar el backend en producción.

---

## ✅ Solución: Desplegar Backend en Vercel

### **Paso 1: Preparar el Backend**

Ya tienes todo configurado:

- ✅ `vercel.json` creado
- ✅ Script `vercel-build` en package.json
- ✅ CORS actualizado para aceptar subdominios de Vercel

### **Paso 2: Compilar el Backend Localmente (Verificación)**

```bash
cd apps/backend
npm run build
```

Esto debe crear la carpeta `dist/` con el código compilado.

### **Paso 3: Desplegar a Vercel**

#### **Opción A: Desde la Terminal (Recomendado)**

```bash
cd apps/backend
vercel --prod
```

El CLI te preguntará:

1. **Link to existing project?** → No (primera vez) o Yes (si ya existe)
2. **Project name?** → `aiquaa-backend` (o el nombre que prefieras)
3. **In which directory is your code located?** → `./` (presiona Enter)

#### **Opción B: Desde Vercel Dashboard**

1. Ve a https://vercel.com/dashboard
2. Click en "Add New" → "Project"
3. Importa tu repositorio de GitHub
4. Configura:
   - **Framework Preset:** Other
   - **Root Directory:** `apps/backend`
   - **Build Command:** `npm run vercel-build`
   - **Output Directory:** `dist`

### **Paso 4: Configurar Variables de Entorno en Vercel**

En el dashboard de Vercel (Settings → Environment Variables), agrega:

```bash
# Database
DATABASE_URL=prisma+postgres://accelerate.prisma-data.net/?api_key=<YOUR_PRISMA_ACCELERATE_API_KEY>
POSTGRES_URL=postgres://<user>:<password>@db.prisma.io:5432/postgres?sslmode=require

# JWT
JWT_SECRET=production-super-secret-jwt-key-change-this-to-a-secure-random-string-min-32-chars
JWT_ACCESS_TTL=900
JWT_REFRESH_TTL=2592000
REFRESH_COOKIE_NAME=aiq_rt

# Email (configurar con tu servicio SMTP real)
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

# Frontend Origin (la URL de tu frontend en Vercel)
FRONT_ORIGIN=https://tu-app.vercel.app
```

**⚠️ IMPORTANTE:**

- Cambia `FRONT_ORIGIN` a la URL real de tu frontend en Vercel
- Genera un nuevo `JWT_SECRET` para producción: `openssl rand -base64 32`

---

## 📝 Paso 5: Actualizar Frontend para Usar el Backend de Producción

Una vez desplegado el backend, obtendrás una URL como:

```
https://aiquaa-backend.vercel.app
```

### **Actualizar Variables de Entorno del Frontend en Vercel:**

1. Ve al proyecto del frontend en Vercel
2. Settings → Environment Variables
3. Actualiza:

```bash
NEXT_PUBLIC_API_URL=https://aiquaa-backend.vercel.app
NEXT_PUBLIC_BACKEND_URL=https://aiquaa-backend.vercel.app
```

4. **Redeploy el frontend** para que tome las nuevas variables

---

## 🔄 Actualizar Callback URLs de OAuth

Después de desplegar el backend, actualiza las URLs de callback en los proveedores OAuth:

### **Google Cloud Console:**

```
https://aiquaa-backend.vercel.app/api/v1/auth/google/callback
```

### **GitHub OAuth App:**

```
https://aiquaa-backend.vercel.app/api/v1/auth/github/callback
```

---

## ✅ Verificación Post-Despliegue

### **1. Health Check del Backend:**

```bash
curl https://aiquaa-backend.vercel.app/api/v1/health
```

Debe responder:

```json
{ "status": "ok", "timestamp": "..." }
```

### **2. Probar Registro:**

```bash
curl -X POST https://aiquaa-backend.vercel.app/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "password": "Test123456"
  }'
```

### **3. Verificar CORS:**

Abre el frontend en Vercel y prueba:

- Registro de usuario
- Login
- OAuth con Google/GitHub

---

## 🐛 Troubleshooting

### **Error: "Not allowed by CORS"**

- Verifica que `FRONT_ORIGIN` en el backend apunte a tu frontend en Vercel
- El código ya acepta subdominios de `.vercel.app`

### **Error: "Cannot connect to database"**

- Verifica que `DATABASE_URL` y `POSTGRES_URL` estén configurados en Vercel
- Ejecuta `npx prisma generate` durante el build

### **Error: "Module not found"**

- Verifica que `vercel-build` compile correctamente
- Revisa que `vercel.json` apunte a `dist/main.js`

### **Backend no responde:**

- Verifica los logs en Vercel: `Settings → Deployments → [deployment] → Logs`
- Asegúrate que el puerto no esté hardcodeado (usa `process.env.PORT || 3001`)

---

## 📊 Comandos Útiles

```bash
# Ver logs del backend en Vercel
vercel logs [deployment-url]

# Redeploy el backend
cd apps/backend
vercel --prod

# Redeploy el frontend
cd apps/frontend
vercel --prod
```

---

## 🎉 ¡Listo!

Una vez completados estos pasos:

✅ Backend desplegado en Vercel
✅ Frontend conectándose al backend de producción
✅ CORS configurado correctamente
✅ OAuth funcionando con Google y GitHub
✅ Base de datos Prisma Accelerate configurada

**¡Tu aplicación está lista para producción!** 🚀
