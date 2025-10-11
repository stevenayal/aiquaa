# 🚂 Swagger en Railway - AIQUAA API

## 📋 Configuración Actual

### ✅ Swagger Implementado
- **Ruta**: `/api/v1/docs`
- **JSON Spec**: `/api/v1/docs-json`
- **Framework**: NestJS + Swagger
- **UI**: Swagger UI personalizada

### 🔧 Configuración de Railway

#### Variables de Entorno Requeridas
```bash
# Database
DATABASE_URL=tu_database_url
POSTGRES_URL=tu_postgres_url

# JWT
JWT_SECRET=tu_jwt_secret_min_32_chars

# CORS (opcional)
CORS_ORIGIN=https://aiquaa.com,https://*.vercel.app

# Environment
NODE_ENV=production
PORT=3001
```

#### Configuración de Build
```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "pnpm install && pnpm --filter @aiquaa/backend exec prisma generate && pnpm --filter @aiquaa/backend build"
  },
  "deploy": {
    "startCommand": "pnpm --filter @aiquaa/backend start:prod",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

## 🌐 URLs de Acceso

### Desarrollo Local
- **Swagger UI**: http://localhost:3001/api/v1/docs
- **OpenAPI JSON**: http://localhost:3001/api/v1/docs-json
- **Health Check**: http://localhost:3001/health

### Producción (Railway)
- **Swagger UI**: https://tu-dominio-railway.up.railway.app/api/v1/docs
- **OpenAPI JSON**: https://tu-dominio-railway.up.railway.app/api/v1/docs-json
- **Health Check**: https://tu-dominio-railway.up.railway.app/health

## 📚 Documentación Disponible

### Tags Organizados
- **Auth**: Autenticación y autorización
- **Users**: Gestión de usuarios
- **Forum**: Sistema de foro
- **Billing**: Pagos y suscripciones
- **Health**: Monitoreo del sistema

### Características
- ✅ Interfaz interactiva para probar endpoints
- ✅ Autenticación JWT integrada
- ✅ Documentación detallada de respuestas
- ✅ Ejemplos de request/response
- ✅ Filtros y búsqueda
- ✅ Persistencia de autorización

## 🚀 Comandos Útiles

### Generar OpenAPI Spec
```bash
cd apps/backend
pnpm run openapi:print
```

### Iniciar en desarrollo
```bash
pnpm dev:back
```

### Build para producción
```bash
pnpm build:backend
```

## 🔍 Verificación

### 1. Verificar que Swagger esté funcionando
```bash
curl https://tu-dominio-railway.up.railway.app/api/v1/docs-json
```

### 2. Verificar Health Check
```bash
curl https://tu-dominio-railway.up.railway.app/health
```

### 3. Acceder a Swagger UI
Abre en el navegador: `https://tu-dominio-railway.up.railway.app/api/v1/docs`

## 🛠️ Troubleshooting

### Problema: Swagger no carga
- Verificar que el backend esté corriendo
- Verificar variables de entorno
- Revisar logs de Railway

### Problema: CORS errors
- Verificar configuración de CORS en main.ts
- Agregar dominio de Railway a la allowlist

### Problema: 404 en /api/v1/docs
- Verificar que el global prefix esté configurado
- Verificar que SwaggerModule.setup esté configurado correctamente
