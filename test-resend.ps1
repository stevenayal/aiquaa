# Script de PowerShell para probar Resend
Write-Host "🧪 Probando funcionalidad de Resend..." -ForegroundColor Cyan

# Cambiar al directorio del backend
Set-Location "apps/backend"

# Verificar que Resend esté instalado
Write-Host "📦 Verificando dependencias..." -ForegroundColor Yellow
$resendInstalled = Test-Path "node_modules/resend"
if ($resendInstalled) {
    Write-Host "✅ Resend está instalado" -ForegroundColor Green
} else {
    Write-Host "❌ Resend no está instalado. Instalando..." -ForegroundColor Red
    npm install resend
}

# Ejecutar el script de prueba
Write-Host "🚀 Ejecutando prueba de Resend..." -ForegroundColor Yellow
node scripts/test-resend.js

Write-Host "✨ Prueba completada!" -ForegroundColor Green

