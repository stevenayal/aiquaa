# Script para desplegar el backend a Vercel
# Ejecutar: .\deploy-backend.ps1

Write-Host "🚀 Desplegando backend a Vercel..." -ForegroundColor Green
Write-Host ("=" * 60) -ForegroundColor Gray

# Verificar si Vercel CLI está instalado
try {
    $vercelVersion = vercel --version
    Write-Host "✅ Vercel CLI detectado: $vercelVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Vercel CLI no está instalado" -ForegroundColor Red
    Write-Host "Instalando Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
}

# Verificar si estamos en el directorio correcto
if (-not (Test-Path "backend")) {
    Write-Host "❌ No se encontró el directorio 'backend'" -ForegroundColor Red
    Write-Host "Asegúrate de estar en el directorio raíz del proyecto" -ForegroundColor Yellow
    exit 1
}

# Cambiar al directorio del backend
Set-Location backend

Write-Host "📁 Directorio actual: $(Get-Location)" -ForegroundColor Cyan

# Verificar si el backend está compilado
if (-not (Test-Path "dist/index.js")) {
    Write-Host "🔨 Compilando el backend..." -ForegroundColor Yellow
    npm run build
}

# Verificar si hay variables de entorno
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  No se encontró archivo .env" -ForegroundColor Yellow
    Write-Host "Copiando desde env.example..." -ForegroundColor Yellow
    Copy-Item "env.example" ".env"
    Write-Host "⚠️  IMPORTANTE: Edita el archivo .env con las credenciales correctas" -ForegroundColor Red
}

# Desplegar a Vercel
Write-Host "🚀 Iniciando deployment a Vercel..." -ForegroundColor Yellow
Write-Host ""

try {
    vercel --prod
    $exitCode = $LASTEXITCODE
    
    if ($exitCode -eq 0) {
        Write-Host ""
        Write-Host "🎉 ¡Backend desplegado exitosamente!" -ForegroundColor Green
        Write-Host "📍 URL del backend: https://api.aiquaa.com" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "📋 Próximos pasos:" -ForegroundColor Cyan
        Write-Host "1. Configura el dominio personalizado en Vercel" -ForegroundColor White
        Write-Host "2. Espera a que el SSL se genere" -ForegroundColor White
        Write-Host "3. Ejecuta las pruebas: node test-api-endpoints.cjs" -ForegroundColor White
        Write-Host "4. Verifica que el frontend pueda conectarse" -ForegroundColor White
    } else {
        Write-Host "❌ Error en el deployment" -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ Error durante el deployment: $($_.Exception.Message)" -ForegroundColor Red
}

# Volver al directorio raíz
Set-Location .. 