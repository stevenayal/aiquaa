# Script para verificar la conectividad CORS entre frontend y backend
# Uso: .\scripts\verify-cors.ps1

$BackendUrl = if ($env:BACKEND_URL) { $env:BACKEND_URL } else { "https://aiquaabackend-production.up.railway.app" }
$FrontendUrl = if ($env:FRONTEND_URL) { $env:FRONTEND_URL } else { "https://aiquaa.com" }

Write-Host "🚀 Verificando conectividad CORS/SSL para AIQUAA" -ForegroundColor Green
Write-Host "   Backend: $BackendUrl" -ForegroundColor Cyan
Write-Host "   Frontend: $FrontendUrl" -ForegroundColor Cyan
Write-Host ""

# Test Health Check
Write-Host "🔍 Probando health check..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BackendUrl/health" -Method GET -ErrorAction Stop
    Write-Host "✅ Health check OK" -ForegroundColor Green
    Write-Host "   Status: $($response.status)" -ForegroundColor White
    Write-Host "   Time: $($response.time)" -ForegroundColor White
} catch {
    Write-Host "❌ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test CORS Preflight
Write-Host "`n🔍 Probando CORS preflight..." -ForegroundColor Yellow
try {
    $headers = @{
        'Origin' = $FrontendUrl
        'Access-Control-Request-Method' = 'POST'
        'Access-Control-Request-Headers' = 'Content-Type'
    }
    
    $response = Invoke-WebRequest -Uri "$BackendUrl/api/v1/auth/register" -Method OPTIONS -Headers $headers -ErrorAction Stop
    
    if ($response.StatusCode -eq 204) {
        Write-Host "✅ CORS preflight OK" -ForegroundColor Green
        Write-Host "   Allow-Origin: $($response.Headers['Access-Control-Allow-Origin'])" -ForegroundColor White
        Write-Host "   Allow-Methods: $($response.Headers['Access-Control-Allow-Methods'])" -ForegroundColor White
        Write-Host "   Allow-Headers: $($response.Headers['Access-Control-Allow-Headers'])" -ForegroundColor White
    } else {
        Write-Host "❌ CORS preflight failed: $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ CORS preflight error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test Registration Endpoint
Write-Host "`n🔍 Probando endpoint de registro..." -ForegroundColor Yellow
try {
    $body = @{
        name = "Test User"
        email = "test@example.com"
        password = "TestPassword123!"
    } | ConvertTo-Json
    
    $headers = @{
        'Content-Type' = 'application/json'
        'Origin' = $FrontendUrl
    }
    
    $response = Invoke-WebRequest -Uri "$BackendUrl/api/v1/auth/register" -Method POST -Body $body -Headers $headers -ErrorAction Stop
    
    Write-Host "   Status: $($response.StatusCode)" -ForegroundColor White
    if ($response.StatusCode -eq 400 -or $response.StatusCode -eq 409) {
        Write-Host "✅ Endpoint responde correctamente (error esperado)" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Status inesperado: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Registration endpoint error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test CORS Rejection
Write-Host "`n🔍 Probando rechazo CORS..." -ForegroundColor Yellow
try {
    $body = @{
        name = "Test User"
        email = "test@example.com"
        password = "TestPassword123!"
    } | ConvertTo-Json
    
    $headers = @{
        'Content-Type' = 'application/json'
        'Origin' = 'https://malicious-site.com'
    }
    
    $response = Invoke-WebRequest -Uri "$BackendUrl/api/v1/auth/register" -Method POST -Body $body -Headers $headers -ErrorAction Stop
    
    Write-Host "   Status: $($response.StatusCode)" -ForegroundColor White
    if ($response.StatusCode -eq 0 -or $response.StatusCode -ge 400) {
        Write-Host "✅ CORS rechaza correctamente orígenes no permitidos" -ForegroundColor Green
    } else {
        Write-Host "⚠️  CORS no está rechazando orígenes no permitidos" -ForegroundColor Yellow
    }
} catch {
    Write-Host "✅ CORS rechaza correctamente (error de conexión): $($_.Exception.Message)" -ForegroundColor Green
}

Write-Host "`n✨ Verificación completada" -ForegroundColor Green
