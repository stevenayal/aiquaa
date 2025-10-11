# 🚂 Deploy AIQUAA Backend con Swagger a Railway
# Este script automatiza el deployment del backend con Swagger a Railway

Write-Host "🚀 Iniciando deployment de AIQUAA Backend con Swagger a Railway..." -ForegroundColor Green

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "apps/backend")) {
    Write-Host "❌ Error: No se encontró el directorio apps/backend" -ForegroundColor Red
    Write-Host "   Asegúrate de ejecutar este script desde la raíz del proyecto" -ForegroundColor Yellow
    exit 1
}

# Verificar que Railway CLI esté instalado
try {
    $railwayVersion = railway --version 2>$null
    Write-Host "✅ Railway CLI encontrado: $railwayVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Railway CLI no está instalado" -ForegroundColor Red
    Write-Host "   Instala Railway CLI: npm install -g @railway/cli" -ForegroundColor Yellow
    exit 1
}

# Verificar que estemos logueados en Railway
try {
    $user = railway whoami 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ No estás logueado en Railway" -ForegroundColor Red
        Write-Host "   Ejecuta: railway login" -ForegroundColor Yellow
        exit 1
    }
    Write-Host "✅ Logueado en Railway como: $user" -ForegroundColor Green
} catch {
    Write-Host "❌ Error verificando login de Railway" -ForegroundColor Red
    exit 1
}

# Navegar al directorio del backend
Set-Location "apps/backend"

Write-Host "📦 Preparando el backend para deployment..." -ForegroundColor Blue

# Instalar dependencias
Write-Host "   Instalando dependencias..." -ForegroundColor Gray
pnpm install

# Generar Prisma client
Write-Host "   Generando Prisma client..." -ForegroundColor Gray
pnpm prisma:generate

# Build del proyecto
Write-Host "   Compilando proyecto..." -ForegroundColor Gray
pnpm build

# Verificar que el build fue exitoso
if (-not (Test-Path "dist/main.js")) {
    Write-Host "❌ Error: El build falló - no se encontró dist/main.js" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build completado exitosamente" -ForegroundColor Green

# Verificar variables de entorno
Write-Host "🔧 Verificando variables de entorno..." -ForegroundColor Blue

$requiredVars = @(
    "DATABASE_URL",
    "JWT_SECRET"
)

$missingVars = @()
foreach ($var in $requiredVars) {
    $value = railway variables get $var 2>$null
    if ($LASTEXITCODE -ne 0) {
        $missingVars += $var
    }
}

if ($missingVars.Count -gt 0) {
    Write-Host "⚠️  Variables de entorno faltantes:" -ForegroundColor Yellow
    foreach ($var in $missingVars) {
        Write-Host "   - $var" -ForegroundColor Yellow
    }
    Write-Host "   Configúralas en Railway Dashboard o con: railway variables set $var=valor" -ForegroundColor Yellow
}

# Deploy a Railway
Write-Host "🚀 Desplegando a Railway..." -ForegroundColor Blue

try {
    railway up --detach
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Deployment exitoso!" -ForegroundColor Green

        # Obtener URL del servicio
        $serviceUrl = railway domain 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "🎉 ¡AIQUAA Backend desplegado exitosamente!" -ForegroundColor Green
            Write-Host ""
            Write-Host "📚 Swagger UI: https://$serviceUrl/api/v1/docs" -ForegroundColor Cyan
            Write-Host "📄 OpenAPI JSON: https://$serviceUrl/api/v1/docs-json" -ForegroundColor Cyan
            Write-Host "❤️  Health Check: https://$serviceUrl/health" -ForegroundColor Cyan
            Write-Host ""
            Write-Host "🧪 Para probar Swagger:" -ForegroundColor Yellow
            Write-Host "   pnpm test:swagger https://$serviceUrl" -ForegroundColor Gray
        } else {
            Write-Host "✅ Deployment completado (no se pudo obtener URL automáticamente)" -ForegroundColor Green
            Write-Host "   Verifica la URL en Railway Dashboard" -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ Error en el deployment" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Error durante el deployment: $_" -ForegroundColor Red
    exit 1
} finally {
    # Volver al directorio raíz
    Set-Location "../.."
}

Write-Host ""
Write-Host "🎯 Próximos pasos:" -ForegroundColor Blue
Write-Host "   1. Verifica que el servicio esté funcionando en Railway Dashboard" -ForegroundColor Gray
Write-Host "   2. Prueba los endpoints de Swagger" -ForegroundColor Gray
Write-Host "   3. Configura el dominio personalizado si es necesario" -ForegroundColor Gray
Write-Host "   4. Actualiza las variables de entorno del frontend" -ForegroundColor Gray
