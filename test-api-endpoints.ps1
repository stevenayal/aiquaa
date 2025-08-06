# Script de PowerShell para probar la API de Aiquaa
# Ejecutar: .\test-api-endpoints.ps1

Write-Host "🚀 Iniciando pruebas de la API de Aiquaa" -ForegroundColor Green
Write-Host "📍 URL base: https://api.aiquaa.com" -ForegroundColor Cyan
Write-Host ("=" * 60) -ForegroundColor Gray

# Verificar si Node.js está instalado
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js detectado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js no está instalado o no está en el PATH" -ForegroundColor Red
    Write-Host "Por favor, instala Node.js desde https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Verificar si el archivo de prueba existe
if (-not (Test-Path "test-api-endpoints.js")) {
    Write-Host "❌ No se encontró el archivo test-api-endpoints.js" -ForegroundColor Red
    Write-Host "Asegúrate de estar en el directorio correcto del proyecto" -ForegroundColor Yellow
    exit 1
}

# Ejecutar las pruebas
Write-Host "🔍 Ejecutando pruebas de la API..." -ForegroundColor Yellow
Write-Host ""

try {
    node test-api-endpoints.js
    $exitCode = $LASTEXITCODE
    
    Write-Host ""
    Write-Host ("=" * 60) -ForegroundColor Gray
    
    if ($exitCode -eq 0) {
        Write-Host "🎉 Pruebas completadas exitosamente!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Algunas pruebas fallaron. Revisa los logs anteriores." -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "❌ Error ejecutando las pruebas: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📋 Próximos pasos:" -ForegroundColor Cyan
Write-Host "1. Verifica que el SSL esté configurado correctamente" -ForegroundColor White
Write-Host "2. Confirma que no hay errores de CORS" -ForegroundColor White
Write-Host "3. Verifica que Supabase esté insertando registros" -ForegroundColor White
Write-Host "4. Prueba el frontend con el nuevo endpoint" -ForegroundColor White 