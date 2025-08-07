# Script para verificar la configuración de la API
# Este script verifica que las URLs de la API estén configuradas correctamente

Write-Host "🔧 Verificando configuración de la API..." -ForegroundColor Cyan
Write-Host ""

# Verificar archivos de entorno
$envFiles = @("env.development", "env.production", ".env.local")

foreach ($file in $envFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file existe" -ForegroundColor Green
        $content = Get-Content $file -Raw
        if ($content -match "VITE_API_URL") {
            Write-Host "   📝 Contiene VITE_API_URL" -ForegroundColor Yellow
        } else {
            Write-Host "   ⚠️  No contiene VITE_API_URL" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ $file no existe" -ForegroundColor Red
    }
}

Write-Host ""

# Verificar archivos de configuración
$configFiles = @("src/config/apiConfig.ts", "src/config/api.ts", "src/services/apiService.ts")

foreach ($file in $configFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file existe" -ForegroundColor Green
        $content = Get-Content $file -Raw
        if ($content -match "api\.aiquaa\.com") {
            Write-Host "   🌐 Referencia a api.aiquaa.com encontrada" -ForegroundColor Yellow
        }
        if ($content -match "localhost:3001") {
            Write-Host "   🏠 Referencia a localhost:3001 encontrada" -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ $file no existe" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "📋 Resumen de configuración:" -ForegroundColor Cyan
Write-Host "   - Desarrollo: http://localhost:3001" -ForegroundColor White
Write-Host "   - Producción: https://api.aiquaa.com" -ForegroundColor White
Write-Host "   - Este endpoint está conectado al backend desplegado en https://api.aiquaa.com" -ForegroundColor White

Write-Host ""
Write-Host "✅ Verificación completada" -ForegroundColor Green
