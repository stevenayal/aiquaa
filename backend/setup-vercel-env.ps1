# Script para configurar variables de entorno en Vercel
Write-Host "🔧 Configurando variables de entorno en Vercel..." -ForegroundColor Cyan

# Variables de entorno necesarias
$envVars = @{
    "SUPABASE_URL" = "https://hxixxbiufyntcywajkrh.supabase.co"
    "SUPABASE_JWT_SECRET" = "FyZDqNV48wYBIeQRtoS3mlYVSxcfbMu/bCQjhj9wZO4+VDElGHWuY/2OaVq8i1AJHBesEoorRZig0L2usoop4w=="
    "SUPABASE_SERVICE_ROLE_KEY" = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4aXh4Yml1ZnludGN5d2Fqa3JoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDQ3MjQwNCwiZXhwIjoyMDcwMDQ4NDA0fQ.vRoL7-BvfQbB08nrsdY_L2hvAirMNpnE1mVOK-2vexU"
    "POSTGRES_URL" = "postgres://postgres.hxixxbiufyntcywajkrh:XEpZkv5QrqHEmYve@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require`&supa=base-pooler.x"
    "POSTGRES_URL_NON_POOLING" = "postgres://postgres.hxixxbiufyntcywajkrh:XEpZkv5QrqHEmYve@aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require"
    "POSTGRES_PRISMA_URL" = "postgres://postgres.hxixxbiufyntcywajkrh:XEpZkv5QrqHEmYve@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require`&pgbouncer=true"
    "NODE_ENV" = "production"
}

Write-Host "📋 Variables a configurar:" -ForegroundColor Yellow
foreach ($key in $envVars.Keys) {
    Write-Host "  $key" -ForegroundColor White
}

Write-Host ""
Write-Host "⚠️  IMPORTANTE: Debes configurar estas variables manualmente en el dashboard de Vercel:" -ForegroundColor Red
Write-Host ""
Write-Host "1. Ve a https://vercel.com/dashboard" -ForegroundColor Cyan
Write-Host "2. Selecciona el proyecto 'aiquaa'" -ForegroundColor Cyan
Write-Host "3. Ve a Settings > Environment Variables" -ForegroundColor Cyan
Write-Host "4. Agrega cada variable con su valor correspondiente" -ForegroundColor Cyan
Write-Host "5. Asegúrate de que estén configuradas para 'Production' y 'Preview'" -ForegroundColor Cyan
Write-Host ""

Write-Host "🔗 URL del proyecto: https://vercel.com/dashboard" -ForegroundColor Green
Write-Host ""

# Mostrar las variables en formato fácil de copiar
Write-Host "📝 Variables para copiar:" -ForegroundColor Yellow
foreach ($key in $envVars.Keys) {
    Write-Host "$key=$($envVars[$key])" -ForegroundColor White
}

Write-Host ""
Write-Host "✅ Una vez configuradas las variables, haz un nuevo deploy:" -ForegroundColor Green
Write-Host "   vercel --prod" -ForegroundColor Cyan 