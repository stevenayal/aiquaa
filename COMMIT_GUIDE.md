# 🚀 Guía para Commitear y Desplegar los Cambios

## 📋 Resumen de Cambios

Se han implementado **9 fixes críticos** al sistema de autenticación:

1. ✅ Guards de Passport agregados a rutas OAuth
2. ✅ Variables de entorno configuradas (backend y frontend)
3. ✅ Estructura de respuesta NextAuth corregida
4. ✅ Verificación de email hecha opcional
5. ✅ Login automático post-registro eliminado
6. ✅ Credenciales OAuth actualizadas
7. ✅ Problemas de compilación TypeScript resueltos
8. ✅ Sentry profiling deshabilitado (Node.js v22)
9. ✅ Documentación completa creada

---

## 🔍 Archivos a Commitear

### **Nuevos Archivos:**
```
apps/backend/.env.example
apps/backend/nest-cli.json
apps/frontend/.env.local.example
VERCEL_DEPLOYMENT.md
AUTH_FIXES_SUMMARY.md
COMMIT_GUIDE.md (este archivo)
```

### **Archivos Modificados:**
```
apps/backend/src/auth/auth.controller.ts
apps/backend/src/auth/auth.service.ts
apps/backend/src/observability/sentry.service.ts
apps/backend/tsconfig.json
apps/backend/.env
apps/frontend/src/auth.ts
apps/frontend/src/components/auth/RegisterForm.tsx
apps/frontend/.env.local
```

---

## ⚠️ Archivos a NO Commitear

**IMPORTANTE:** Los archivos con secretos reales NO deben ir al repositorio:

```bash
# Verificar que estén en .gitignore:
.env
.env.local
.env*.local
*.key
*.pem
```

---

## 🔐 Antes de Commitear

### 1. **Verificar .gitignore**
```bash
# Asegúrate que estos archivos estén en .gitignore:
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
echo ".env*.local" >> .gitignore
```

### 2. **Limpiar archivos con secretos**

**OPCIÓN A: Reemplazar con variables de ejemplo**
```bash
# Backend
cp apps/backend/.env apps/backend/.env.local
cp apps/backend/.env.example apps/backend/.env

# Frontend
cp apps/frontend/.env.local apps/frontend/.env.local.backup
cp apps/frontend/.env.local.example apps/frontend/.env.local
```

**OPCIÓN B: Unstage los archivos .env**
```bash
git reset apps/backend/.env
git reset apps/frontend/.env.local
```

---

## 📝 Comandos para Commitear

### **Opción 1: Commit Único**
```bash
git add .
git commit -m "fix(auth): implement OAuth guards and fix authentication flow

- Add Passport guards to Google and GitHub OAuth routes
- Configure missing NextAuth environment variables
- Fix login response structure parsing
- Make email verification optional
- Remove automatic login after registration
- Update OAuth credentials (Google and GitHub)
- Fix TypeScript compilation issues
- Disable Sentry profiling (Node.js v22 compatibility)
- Add comprehensive deployment documentation

Closes #[issue-number]"
```

### **Opción 2: Commits Separados (Recomendado)**

```bash
# 1. OAuth Guards
git add apps/backend/src/auth/auth.controller.ts
git commit -m "fix(auth): add Passport guards to OAuth routes

- Add @UseGuards(AuthGuard('google')) to /auth/google endpoints
- Add @UseGuards(AuthGuard('github')) to /auth/github endpoints
- Import AuthGuard from @nestjs/passport"

# 2. Variables de Entorno
git add apps/backend/.env.example apps/frontend/.env.local.example
git commit -m "feat(config): add environment variable templates

- Create .env.example for backend with all required variables
- Create .env.local.example for frontend with NextAuth config
- Document OAuth credentials and API endpoints"

# 3. NextAuth Integration
git add apps/frontend/src/auth.ts
git commit -m "fix(auth): correct NextAuth response parsing

- Fix login response structure (data.user instead of data.success.data.user)
- Update API endpoint to /api/v1/auth/login
- Convert user ID to string for NextAuth compatibility"

# 4. Email Verification
git add apps/backend/src/auth/auth.service.ts
git commit -m "feat(auth): make email verification optional

- Remove blocking email verification check on login
- Allow users to login without verified email
- Add explanatory comment for optional verification"

# 5. Registration Flow
git add apps/frontend/src/components/auth/RegisterForm.tsx
git commit -m "fix(auth): remove automatic login after registration

- Redirect to login page after successful registration
- Remove signIn import from next-auth/react
- Simplify post-registration flow"

# 6. TypeScript Configuration
git add apps/backend/tsconfig.json apps/backend/nest-cli.json
git commit -m "fix(build): resolve TypeScript compilation issues

- Change module to commonjs for NestJS compatibility
- Add noEmit: false to override base config
- Disable allowImportingTsExtensions
- Create nest-cli.json with proper configuration"

# 7. Sentry Profiling
git add apps/backend/src/observability/sentry.service.ts
git commit -m "fix(observability): disable Sentry profiling for Node.js v22

- Comment out ProfilingIntegration due to compatibility issues
- Disable profilesSampleRate configuration
- Add explanatory comments"

# 8. Documentación
git add VERCEL_DEPLOYMENT.md AUTH_FIXES_SUMMARY.md COMMIT_GUIDE.md
git commit -m "docs: add comprehensive authentication and deployment guides

- Create VERCEL_DEPLOYMENT.md with deployment instructions
- Create AUTH_FIXES_SUMMARY.md documenting all fixes
- Create COMMIT_GUIDE.md for commit workflow
- Include environment variables, OAuth setup, and troubleshooting"
```

---

## 🚢 Push a GitHub

```bash
# Verificar el estado
git status

# Push a main
git push origin main

# O crear una rama específica
git checkout -b fix/auth-oauth-integration
git push origin fix/auth-oauth-integration
```

---

## 🔄 Despliegue en Vercel

### **Automático (Recomendado)**
1. Hacer push a GitHub
2. Vercel detectará los cambios automáticamente
3. Configurar variables de entorno en Vercel Dashboard
4. El despliegue se ejecutará automáticamente

### **Manual**
```bash
cd apps/frontend
vercel --prod
```

---

## ✅ Checklist Post-Commit

### **GitHub:**
- [ ] Todos los commits están en el repositorio
- [ ] No hay archivos `.env` reales commiteados
- [ ] Los archivos `.example` están presentes

### **Vercel:**
- [ ] Variables de entorno configuradas (ver `VERCEL_DEPLOYMENT.md`)
- [ ] `NEXTAUTH_SECRET` generado y configurado
- [ ] `NEXTAUTH_URL` apunta a la URL de producción
- [ ] Credenciales OAuth configuradas

### **OAuth Providers:**
- [ ] Google Cloud Console: Callback URLs actualizadas
- [ ] GitHub OAuth App: Callback URL actualizada
- [ ] URLs incluyen tanto desarrollo como producción

---

## 🐛 Si el Despliegue Falla

### **Revisar Logs de Vercel:**
```bash
vercel logs [deployment-url]
```

### **Errores Comunes:**

**1. "NEXTAUTH_URL is missing"**
```bash
# En Vercel Dashboard > Settings > Environment Variables
# Agregar: NEXTAUTH_URL=https://your-app.vercel.app
```

**2. "OAuth callback mismatch"**
```bash
# Google Cloud Console:
https://your-app.vercel.app/api/auth/callback/google

# GitHub OAuth App:
https://your-app.vercel.app/api/auth/callback/github
```

**3. "Cannot connect to backend"**
```bash
# Verificar NEXT_PUBLIC_API_URL en Vercel
# Debe apuntar al backend de producción
```

---

## 📊 Verificación Post-Despliegue

### **1. Health Check Backend:**
```bash
curl https://your-backend.com/api/v1/health
```

### **2. Health Check Frontend:**
```bash
curl https://your-app.vercel.app/api/auth/signin
```

### **3. Probar Flujos:**
1. Registro de nuevo usuario ✓
2. Login con credenciales ✓
3. Login con Google ✓
4. Login con GitHub ✓

---

## 📞 Soporte

Si encuentras problemas durante el despliegue:

1. **Revisar logs de Vercel** en el dashboard
2. **Consultar `AUTH_FIXES_SUMMARY.md`** para detalles técnicos
3. **Revisar `VERCEL_DEPLOYMENT.md`** para configuración
4. **Verificar variables de entorno** en Vercel Dashboard

---

## 🎉 ¡Listo para Producción!

Una vez completados todos los pasos, tu aplicación estará desplegada con:

✅ Autenticación con credenciales
✅ OAuth con Google
✅ OAuth con GitHub
✅ Verificación de email opcional
✅ Refresh tokens
✅ Sesiones seguras con NextAuth

**¡Éxito en tu despliegue!** 🚀
