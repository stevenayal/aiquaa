# Configuración de Variables de Entorno en Vercel

## Variables necesarias para el frontend

Configura estas variables en el dashboard de Vercel para el proyecto frontend:

### Variables de entorno para producción:

```bash
VITE_API_BASE_URL=https://aiquaa-backend.vercel.app
VITE_SUPABASE_URL=https://hxixxbiufyntcywajkrh.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4aXh4Yml1ZnludGN5d2Fqa3JoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0NzI0MDQsImV4cCI6MjA3MDA0ODQwNH0.0NJTbJopiZZWx3WCkeK-A0fCa7x-T6Tszo39tHpKFmY
```

## Cómo configurar en Vercel:

1. Ve al dashboard de Vercel
2. Selecciona el proyecto `aiquaa`
3. Ve a Settings > Environment Variables
4. Agrega cada variable con su valor correspondiente
5. Asegúrate de que estén configuradas para "Production" y "Preview"

## Variables para el backend (si es necesario):

```bash
SUPABASE_URL=https://hxixxbiufyntcywajkrh.supabase.co
SUPABASE_JWT_SECRET=FyZDqNV48wYBIeQRtoS3mlYVSxcfbMu/bCQjhj9wZO4+VDElGHWuY/2OaVq8i1AJHBesEoorRZig0L2usoop4w==
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4aXh4Yml1ZnludGN5d2Fqa3JoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDQ3MjQwNCwiZXhwIjoyMDcwMDQ4NDA0fQ.vRoL7-BvfQbB08nrsdY_L2hvAirMNpnE1mVOK-2vexU
POSTGRES_URL=postgres://postgres.hxixxbiufyntcywajkrh:XEpZkv5QrqHEmYve@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x
POSTGRES_URL_NON_POOLING=postgres://postgres.hxixxbiufyntcywajkrh:XEpZkv5QrqHEmYve@aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require
POSTGRES_PRISMA_URL=postgres://postgres.hxixxbiufyntcywajkrh:XEpZkv5QrqHEmYve@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true
```

## Verificación:

Después de configurar las variables:

1. Haz un nuevo deploy
2. Verifica que la comunidad funcione correctamente
3. Revisa los logs en Vercel para asegurarte de que no hay errores 