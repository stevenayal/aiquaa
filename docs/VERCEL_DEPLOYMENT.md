# 🚀 Guía de Despliegue en Vercel

## 📋 Variables de Entorno para Frontend (Vercel)

Configura las siguientes variables de entorno en el dashboard de Vercel:

### **Autenticación - NextAuth**
```bash
NEXTAUTH_SECRET=your-production-secret-min-32-characters-long
NEXTAUTH_URL=https://your-app.vercel.app
```

### **API Backend**
```bash
NEXT_PUBLIC_API_URL=https://your-backend-url.com
NEXT_PUBLIC_BACKEND_URL=https://your-backend-url.com
```

### **OAuth Providers - Google**
```bash
GOOGLE_CLIENT_ID=91995874414-ivu60t764qt4gu4t8u5reiu9dnsnqm7h.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
```

### **OAuth Providers - GitHub**
```bash
GITHUB_CLIENT_ID=Ov23lictkb4l9L1uwTny
GITHUB_CLIENT_SECRET=a596ad4f1a8e0fc9fbe74b1d99316f95881b3f46
```

## 🔧 Configuración de Callback URLs OAuth

### **Google Cloud Console**
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto
3. Ve a **APIs & Services** > **Credentials**
4. Edita tu OAuth 2.0 Client ID
5. Agrega las siguientes URIs de redireccionamiento autorizadas:
   ```
   https://your-app.vercel.app/api/auth/callback/google
   http://localhost:3000/api/auth/callback/google (para desarrollo)
   ```

### **GitHub OAuth Apps**
1. Ve a [GitHub OAuth Apps](https://github.com/settings/developers)
2. Selecciona tu aplicación
3. Actualiza **Authorization callback URL**:
   ```
   https://your-app.vercel.app/api/auth/callback/github
   http://localhost:3000/api/auth/callback/github (para desarrollo)
   ```

## 🔐 Generar NEXTAUTH_SECRET

Ejecuta el siguiente comando para generar un secreto seguro:

```bash
openssl rand -base64 32
```

## ✅ Checklist Pre-Despliegue

- [ ] Todas las variables de entorno están configuradas en Vercel
- [ ] Las URLs de callback OAuth están actualizadas
- [ ] `NEXTAUTH_URL` apunta a la URL de producción de Vercel
- [ ] `NEXT_PUBLIC_API_URL` apunta al backend de producción
- [ ] Backend está desplegado y accesible
- [ ] Base de datos está configurada y accesible desde el backend

## 📝 Cambios Recientes Implementados

### **1. Guards de Passport Agregados** ✅
- Autenticación OAuth con Google y GitHub ahora funciona correctamente
- Guards agregados a `/api/v1/auth/google` y `/api/v1/auth/github`

### **2. Variables de Entorno** ✅
- Backend: `BACKEND_URL` agregado para OAuth callbacks
- Frontend: Variables de NextAuth agregadas (NEXTAUTH_SECRET, NEXTAUTH_URL)

### **3. Verificación de Email Opcional** ✅
- Los usuarios pueden iniciar sesión sin verificar email
- Mejora la experiencia de usuario en registro

### **4. Login Automático Deshabilitado** ✅
- Después del registro, los usuarios son redirigidos a login
- Evita problemas de sesión y mejora seguridad

### **5. Estructura de Respuesta Ajustada** ✅
- NextAuth ahora parsea correctamente las respuestas del backend
- Compatibilidad total entre frontend y backend

### **6. TypeScript Build Fixes** ✅
- Configuración de `tsconfig.json` ajustada
- `nest-cli.json` creado
- Backend compila correctamente

### **7. Sentry Profiling Temporal** ✅
- Profiling deshabilitado temporalmente por compatibilidad con Node.js v22
- Backend arranca sin errores

## 🐛 Troubleshooting

### Error: "NEXTAUTH_URL is not defined"
- Verifica que `NEXTAUTH_URL` esté configurada en las variables de entorno de Vercel
- El valor debe ser la URL completa de tu aplicación (ej: `https://aiquaa.vercel.app`)

### Error: "OAuth callback mismatch"
- Verifica que las URLs de callback en Google/GitHub coincidan exactamente
- Formato correcto: `https://your-domain.vercel.app/api/auth/callback/google`

### Error: "Cannot connect to backend"
- Verifica que `NEXT_PUBLIC_API_URL` apunte al backend correcto
- Asegúrate que el backend esté desplegado y accesible
- Verifica CORS en el backend incluya el dominio de Vercel

## 📦 Archivos Creados/Modificados

### Nuevos Archivos:
- `apps/backend/.env.example` - Template de variables del backend
- `apps/frontend/.env.local.example` - Template de variables del frontend
- `apps/backend/nest-cli.json` - Configuración de NestJS CLI
- `VERCEL_DEPLOYMENT.md` - Este archivo

### Archivos Modificados:
- `apps/backend/src/auth/auth.controller.ts` - Guards agregados
- `apps/backend/src/auth/auth.service.ts` - Verificación de email opcional
- `apps/frontend/src/auth.ts` - Parsing de respuesta corregido
- `apps/frontend/src/components/auth/RegisterForm.tsx` - Login automático removido
- `apps/backend/tsconfig.json` - Configuración de compilación
- `apps/backend/src/observability/sentry.service.ts` - Profiling deshabilitado

## 🔗 Links Útiles

- [Vercel Documentation](https://vercel.com/docs)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Google OAuth Setup](https://console.cloud.google.com/)
- [GitHub OAuth Apps](https://github.com/settings/developers)
