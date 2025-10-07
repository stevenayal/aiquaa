#!/usr/bin/env pwsh
# Script de verificación CORS para aiquaa.com
# Verifica que el backend responda correctamente a requests CORS

param(
    [string]$BackendUrl = "https://aiquaabackend-production.up.railway.app",
    [string]$FrontendUrl = "https://aiquaa.com"
)

Write-Host "🔍 Verificando CORS para aiquaa.com..." -ForegroundColor Cyan
Write-Host "Backend: $BackendUrl" -ForegroundColor Yellow
Write-Host "Frontend: $FrontendUrl" -ForegroundColor Yellow
Write-Host ""

# Función para hacer requests con manejo de errores
function Test-CorsRequest {
    param(
        [string]$Url,
        [string]$Method = "GET",
        [hashtable]$Headers = @{},
        [string]$Body = $null
    )
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            Headers = $Headers
            UseBasicParsing = $true
        }
        
        if ($Body) {
            $params.Body = $Body
            $params.ContentType = "application/json"
        }
        
        $response = Invoke-WebRequest @params
        return @{
            Success = $true
            StatusCode = $response.StatusCode
            Headers = $response.Headers
            Content = $response.Content
        }
    }
    catch {
        return @{
            Success = $false
            Error = $_.Exception.Message
            StatusCode = $_.Exception.Response.StatusCode.value__
        }
    }
}

# 1. Verificar endpoint de health
Write-Host "1️⃣ Verificando endpoint de health..." -ForegroundColor Green
$healthResult = Test-CorsRequest -Url "$BackendUrl/health"
if ($healthResult.Success) {
    Write-Host "✅ Health endpoint responde correctamente" -ForegroundColor Green
    Write-Host "   Status: $($healthResult.StatusCode)" -ForegroundColor Gray
} else {
    Write-Host "❌ Health endpoint falló: $($healthResult.Error)" -ForegroundColor Red
    Write-Host "   Status: $($healthResult.StatusCode)" -ForegroundColor Gray
}

# 2. Verificar preflight OPTIONS
Write-Host "`n2️⃣ Verificando preflight OPTIONS..." -ForegroundColor Green
$preflightHeaders = @{
    "Origin" = $FrontendUrl
    "Access-Control-Request-Method" = "POST"
    "Access-Control-Request-Headers" = "Content-Type"
}
$preflightResult = Test-CorsRequest -Url "$BackendUrl/api/v1/auth/register" -Method "OPTIONS" -Headers $preflightHeaders

if ($preflightResult.Success) {
    Write-Host "✅ Preflight OPTIONS responde correctamente" -ForegroundColor Green
    Write-Host "   Status: $($preflightResult.StatusCode)" -ForegroundColor Gray
    
    # Verificar headers CORS
    $corsHeaders = @(
        "Access-Control-Allow-Origin",
        "Access-Control-Allow-Methods", 
        "Access-Control-Allow-Headers",
        "Access-Control-Allow-Credentials"
    )
    
    foreach ($header in $corsHeaders) {
        if ($preflightResult.Headers.ContainsKey($header)) {
            Write-Host "   ✅ $header`: $($preflightResult.Headers[$header])" -ForegroundColor Green
        } else {
            Write-Host "   ❌ $header`: No encontrado" -ForegroundColor Red
        }
    }
} else {
    Write-Host "❌ Preflight OPTIONS falló: $($preflightResult.Error)" -ForegroundColor Red
    Write-Host "   Status: $($preflightResult.StatusCode)" -ForegroundColor Gray
}

# 3. Verificar POST de registro
Write-Host "`n3️⃣ Verificando POST de registro..." -ForegroundColor Green
$registerHeaders = @{
    "Origin" = $FrontendUrl
    "Content-Type" = "application/json"
}
$registerBody = @{
    name = "Test User"
    email = "test@example.com"
    password = "TestPassword123"
} | ConvertTo-Json

$registerResult = Test-CorsRequest -Url "$BackendUrl/api/v1/auth/register" -Method "POST" -Headers $registerHeaders -Body $registerBody

if ($registerResult.Success) {
    Write-Host "✅ POST de registro responde correctamente" -ForegroundColor Green
    Write-Host "   Status: $($registerResult.StatusCode)" -ForegroundColor Gray
} else {
    Write-Host "❌ POST de registro falló: $($registerResult.Error)" -ForegroundColor Red
    Write-Host "   Status: $($registerResult.StatusCode)" -ForegroundColor Gray
}

# 4. Resumen
Write-Host "`n📊 Resumen de verificación CORS:" -ForegroundColor Cyan
Write-Host "   Health: $(if ($healthResult.Success) { '✅' } else { '❌' })" -ForegroundColor $(if ($healthResult.Success) { 'Green' } else { 'Red' })
Write-Host "   Preflight: $(if ($preflightResult.Success) { '✅' } else { '❌' })" -ForegroundColor $(if ($preflightResult.Success) { 'Green' } else { 'Red' })
Write-Host "   POST: $(if ($registerResult.Success) { '✅' } else { '❌' })" -ForegroundColor $(if ($registerResult.Success) { 'Green' } else { 'Red' })

if ($healthResult.Success -and $preflightResult.Success -and $registerResult.Success) {
    Write-Host "`n🎉 ¡CORS configurado correctamente!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "`n⚠️  Hay problemas con la configuración CORS" -ForegroundColor Yellow
    exit 1
}
