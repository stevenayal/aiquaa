#!/usr/bin/env pwsh
# Script de deployment para el backend en Railway

Write-Host "🚀 Desplegando backend en Railway..." -ForegroundColor Cyan

# Cambiar al directorio del backend
Set-Location "apps/backend"

try {
    # Verificar que estamos en el directorio correcto
    if (-not (Test-Path "package.json")) {
        throw "No se encontró package.json en el directorio actual"
    }

    # Instalar dependencias
    Write-Host "📦 Instalando dependencias..." -ForegroundColor Yellow
    pnpm install

    # Construir la aplicación
    Write-Host "🔨 Construyendo aplicación..." -ForegroundColor Yellow
    pnpm run build

    # Verificar que la construcción fue exitosa
    if (-not (Test-Path "dist/main.js")) {
        throw "La construcción falló - no se encontró dist/main.js"
    }

    Write-Host "✅ Construcción exitosa" -ForegroundColor Green

    # Si estamos en Railway, el deployment se hace automáticamente
    # Solo necesitamos verificar que el código esté listo
    Write-Host "📤 Código listo para deployment en Railway" -ForegroundColor Green
    Write-Host "   - Asegúrate de que las variables de entorno estén configuradas" -ForegroundColor Gray
    Write-Host "   - Verifica que el puerto esté configurado correctamente" -ForegroundColor Gray

} catch {
    Write-Host "❌ Error en el deployment: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
} finally {
    # Volver al directorio raíz
    Set-Location "../.."
}

Write-Host "`n🔍 Verificando configuración..." -ForegroundColor Cyan

# Verificar variables de entorno críticas
$envVars = @(
    "DATABASE_URL",
    "JWT_SECRET", 
    "JWT_REFRESH_SECRET",
    "NODE_ENV"
)

foreach ($var in $envVars) {
    if ([string]::IsNullOrEmpty([Environment]::GetEnvironmentVariable($var))) {
        Write-Host "⚠️  Variable de entorno $var no está configurada" -ForegroundColor Yellow
    } else {
        Write-Host "✅ $var configurada" -ForegroundColor Green
    }
}

Write-Host "`n🎉 Deployment completado!" -ForegroundColor Green
Write-Host "   - Backend: https://aiquaabackend-production.up.railway.app" -ForegroundColor Gray
Write-Host "   - Health: https://aiquaabackend-production.up.railway.app/health" -ForegroundColor Gray
Write-Host "   - Docs: https://aiquaabackend-production.up.railway.app/api/v1/docs" -ForegroundColor Gray
