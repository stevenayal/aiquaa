# Verificación del Backend - API Aiquaa

## Objetivo

Confirmar que el subdominio `https://api.aiquaa.com` ya sirve correctamente el backend y puede recibir y retornar comentarios.

## Estado Actual

❌ **El backend NO está desplegado en `https://api.aiquaa.com`**

El dominio `api.aiquaa.com` no está resolviendo, lo que indica que:
1. El backend no está desplegado en Vercel
2. El subdominio no está configurado
3. El SSL no está generado

## Pasos para Solucionar

### 1. Desplegar el Backend a Vercel

```powershell
# Ejecutar el script de deployment
.\deploy-backend.ps1
```

**O manualmente:**

```bash
# Instalar Vercel CLI si no está instalado
npm install -g vercel

# Ir al directorio del backend
cd backend

# Compilar el backend
npm run build

# Desplegar a Vercel
vercel --prod
```

### 2. Configurar el Dominio Personalizado

1. Ir a [Vercel Dashboard](https://vercel.com/dashboard)
2. Seleccionar el proyecto del backend
3. Ir a "Settings" > "Domains"
4. Agregar `api.aiquaa.com`
5. Configurar los registros DNS según las instrucciones de Vercel

### 3. Esperar la Generación del SSL

- El SSL puede tardar hasta 24 horas en generarse
- El estado cambiará de "Generating SSL Certificate" a "Valid Configuration"

### 4. Verificar Variables de Entorno

Asegurarse de que las variables de entorno estén configuradas en Vercel:

```env
SUPABASE_URL=https://hxixxbiufyntcywajkrh.supabase.co
SUPABASE_JWT_SECRET=FyZDqNV48wYBIeQRtoS3mlYVSxcfbMu/bCQjhj9wZO4+VDElGHWuY/2OaVq8i1AJHBesEoorRZig0L2usoop4w==
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4aXh4Yml1ZnludGN5d2Fqa3JoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDQ3MjQwNCwiZXhwIjoyMDcwMDQ4NDA0fQ.vRoL7-BvfQbB08nrsdY_L2hvAirMNpnE1mVOK-2vexU
POSTGRES_URL=postgres://postgres.hxixxbiufyntcywajkrh:XEpZkv5QrqHEmYve@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x
POSTGRES_URL_NON_POOLING=postgres://postgres.hxixxbiufyntcywajkrh:XEpZkv5QrqHEmYve@aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require
POSTGRES_PRISMA_URL=postgres://postgres.hxixxbiufyntcywajkrh:XEpZkv5QrqHEmYve@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true
NODE_ENV=production
```

## Verificaciones Una Vez Desplegado

### 1. Pruebas desde Línea de Comandos

```bash
# Ejecutar pruebas completas
node test-api-endpoints.cjs

# O usar PowerShell
.\test-api-endpoints.ps1
```

### 2. Pruebas desde el Frontend

1. Ir a `https://aiquaa.com/api-test`
2. Ejecutar todas las pruebas
3. Verificar que todos los endpoints respondan correctamente

### 3. Verificaciones Manuales

#### Health Check
```bash
curl https://api.aiquaa.com/
# Debe responder: "API Aiquaa funcionando 🚀"
```

#### GET Comments
```bash
curl https://api.aiquaa.com/api/comments
# Debe responder con un array JSON de comentarios
```

#### POST Comment
```bash
curl -X POST https://api.aiquaa.com/api/comments \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","message":"Comentario de prueba","isAnonymous":false}'
# Debe responder con código 201 y el comentario creado
```

#### CORS Test
```bash
curl -X OPTIONS https://api.aiquaa.com/api/comments \
  -H "Origin: https://aiquaa.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type"
# Debe responder con headers CORS apropiados
```

## Resultado Esperado

✅ **Todos los endpoints funcionando:**

- `GET /` → `200` - Health check
- `GET /api/comments` → `200` - Lista de comentarios
- `POST /api/comments` → `201` - Comentario creado
- `GET /api/feedback` → `200` - Lista de feedback
- `POST /api/feedback` → `200` - Feedback creado
- `OPTIONS /api/comments` → `200/204` - CORS preflight

✅ **Sin errores de:**
- DNS (dominio resuelve correctamente)
- SSL (certificado válido)
- CORS (frontend puede comunicarse)
- Base de datos (Supabase conectado)

✅ **Frontend actualizado:**
- Los comentarios se muestran en tiempo real
- Los formularios envían datos correctamente
- No hay errores en la consola del navegador

## Troubleshooting

### Error: "getaddrinfo ENOTFOUND api.aiquaa.com"
- **Causa:** El dominio no está configurado o no resuelve
- **Solución:** Configurar el dominio en Vercel y esperar propagación DNS

### Error: "SSL Certificate Error"
- **Causa:** El certificado SSL aún no se ha generado
- **Solución:** Esperar hasta 24 horas para la generación automática

### Error: "CORS Error"
- **Causa:** Configuración CORS incorrecta
- **Solución:** Verificar que `https://aiquaa.com` esté en la lista de orígenes permitidos

### Error: "Database Connection Error"
- **Causa:** Variables de entorno incorrectas
- **Solución:** Verificar las credenciales de Supabase en Vercel

## Archivos de Prueba Creados

1. `test-api-endpoints.cjs` - Script de pruebas en Node.js
2. `test-api-endpoints.ps1` - Script de PowerShell
3. `deploy-backend.ps1` - Script de deployment
4. `src/components/ApiTestComponent.tsx` - Componente de pruebas React
5. `src/pages/ApiTest.tsx` - Página de pruebas
6. `backend/vercel.json` - Configuración de Vercel para el backend

## Próximos Pasos

1. **Desplegar el backend** usando el script proporcionado
2. **Configurar el dominio** en Vercel
3. **Esperar la generación del SSL**
4. **Ejecutar las pruebas** para verificar funcionamiento
5. **Actualizar el frontend** para usar la nueva URL
6. **Monitorear** que todo funcione correctamente en producción 