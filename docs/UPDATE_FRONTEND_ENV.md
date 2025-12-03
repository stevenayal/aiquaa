# 🔄 Actualizar Variables de Entorno del Frontend

## 📋 Backend Desplegado Exitosamente

✅ **URL del Backend:** `https://backend-kiiqr0z3z-stevenayals-projects.vercel.app`

---

## 🚨 Paso 1: Desactivar Vercel Authentication

**⚠️ IMPORTANTE:** El backend tiene protección de autenticación activada. Debes desactivarla:

1. Ve a: https://vercel.com/stevenayals-projects/backend/settings/deployment-protection
2. Busca "Deployment Protection"
3. **Opción A:** Desactiva completamente "Vercel Authentication"
4. **Opción B:** Cambia de "All Deployments" a "Standard Protection" (solo protege previews)

---

## 🔧 Paso 2: Actualizar Variables de Entorno del Frontend en Vercel

### **Método A: Desde Vercel Dashboard (Recomendado)**

1. Ve a tu proyecto frontend en Vercel
2. Click en **Settings** → **Environment Variables**
3. Actualiza o agrega estas variables:

```bash
NEXT_PUBLIC_API_URL=https://backend-kiiqr0z3z-stevenayals-projects.vercel.app
NEXT_PUBLIC_BACKEND_URL=https://backend-kiiqr0z3z-stevenayals-projects.vercel.app
```

4. **Importante:** Marca que se apliquen a **Production, Preview y Development**
5. Click en **Save**

### **Método B: Desde la Terminal**

```bash
cd apps/frontend

# Agregar la variable de API URL
vercel env add NEXT_PUBLIC_API_URL production
# Cuando pregunte el valor, pega: https://backend-kiiqr0z3z-stevenayals-projects.vercel.app

# Agregar la variable de Backend URL
vercel env add NEXT_PUBLIC_BACKEND_URL production
# Cuando pregunte el valor, pega: https://backend-kiiqr0z3z-stevenayals-projects.vercel.app
```

---

## 🚀 Paso 3: Redeploy del Frontend

Después de actualizar las variables de entorno, debes redesplegar el frontend para que tome los nuevos valores:

### **Opción A: Desde Dashboard**
1. Ve al proyecto frontend en Vercel
2. Click en la pestaña **Deployments**
3. Click en los 3 puntos (...) del último deployment
4. Click en **Redeploy**
5. Marca **Use existing Build Cache** (opcional, más rápido)
6. Click en **Redeploy**

### **Opción B: Desde Terminal**
```bash
cd apps/frontend
vercel --prod --yes
```

### **Opción C: Git Push (Automático)**
```bash
git add .
git commit -m "chore: update backend URL to production"
git push origin main
```

---

## 🔐 Paso 4: Actualizar OAuth Callbacks (Si usas OAuth)

Si tu backend maneja OAuth (Google/GitHub), actualiza los callback URLs:

### **Google Cloud Console:**
1. Ve a: https://console.cloud.google.com/apis/credentials
2. Edita tu OAuth 2.0 Client ID
3. En "Authorized redirect URIs", agrega:
```
https://backend-kiiqr0z3z-stevenayals-projects.vercel.app/api/v1/auth/google/callback
```

### **GitHub OAuth App:**
1. Ve a: https://github.com/settings/developers
2. Edita tu OAuth App
3. En "Authorization callback URL", actualiza a:
```
https://backend-kiiqr0z3z-stevenayals-projects.vercel.app/api/v1/auth/github/callback
```

---

## ✅ Paso 5: Verificar que Todo Funciona

### **1. Verificar el Backend:**
```bash
curl https://backend-kiiqr0z3z-stevenayals-projects.vercel.app/api/v1/health
```

Debe responder:
```json
{"status":"ok","timestamp":"..."}
```

### **2. Verificar el Frontend:**
1. Abre tu frontend en Vercel: `https://tu-app.vercel.app`
2. Prueba:
   - ✅ Registro de usuario
   - ✅ Login con credenciales
   - ✅ OAuth con Google (si está configurado)
   - ✅ OAuth con GitHub (si está configurado)

### **3. Verificar CORS:**
Abre DevTools (F12) en el navegador y verifica que no haya errores de CORS en la consola.

---

## 🐛 Troubleshooting

### **Error: "Failed to fetch" o "Network Error"**
- Verifica que `NEXT_PUBLIC_API_URL` esté configurada correctamente
- Asegúrate de haber redesp loyado el frontend después de cambiar las variables

### **Error: "Not allowed by CORS"**
- Verifica que el backend esté configurado con la URL correcta del frontend en `FRONT_ORIGIN`
- El código ya acepta subdominios de `.vercel.app`, pero verifica los logs del backend

### **Error: "Authentication Required" en el backend**
- Desactiva "Vercel Authentication" en el dashboard del backend
- O configura "Protection Bypass" para tu dominio

### **Error: "OAuth callback mismatch"**
- Actualiza los callback URLs en Google Cloud Console y GitHub
- Asegúrate que apunten al backend de producción

---

## 📊 Resumen de URLs

| Servicio | URL |
|----------|-----|
| **Backend** | `https://backend-kiiqr0z3z-stevenayals-projects.vercel.app` |
| **Frontend** | `https://tu-app.vercel.app` (tu URL de Vercel) |
| **API Docs** | `https://backend-kiiqr0z3z-stevenayals-projects.vercel.app/api/v1/docs` |
| **Health Check** | `https://backend-kiiqr0z3z-stevenayals-projects.vercel.app/api/v1/health` |

---

## 🎉 ¡Listo!

Una vez completados estos pasos:

✅ Backend desplegado y accesible
✅ Frontend conectado al backend de producción
✅ CORS configurado correctamente
✅ OAuth funcionando (si está configurado)
✅ Sistema listo para producción

**¡Tu aplicación AIQUAA está en producción!** 🚀
