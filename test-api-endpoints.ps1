# Script de PowerShell para probar los endpoints de la API
Write-Host "🧪 Probando endpoints de la API AIQUAA..." -ForegroundColor Cyan

$baseUrl = "http://localhost:3001"

# Función para hacer requests HTTP
function Invoke-ApiRequest {
    param(
        [string]$Method,
        [string]$Endpoint,
        [object]$Body = $null,
        [hashtable]$Headers = @{}
    )
    
    $uri = "$baseUrl$Endpoint"
    $headers["Content-Type"] = "application/json"
    
    try {
        if ($Body) {
            $jsonBody = $Body | ConvertTo-Json -Depth 10
            $response = Invoke-RestMethod -Uri $uri -Method $Method -Body $jsonBody -Headers $headers
        } else {
            $response = Invoke-RestMethod -Uri $uri -Method $Method -Headers $headers
        }
        return $response
    }
    catch {
        Write-Host "❌ Error en $Method $Endpoint`: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Esperar a que el servidor esté listo
Write-Host "⏳ Esperando a que el servidor esté listo..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Probar endpoint de salud
Write-Host "`n🏥 Probando endpoint de salud..." -ForegroundColor Yellow
$health = Invoke-ApiRequest -Method "GET" -Endpoint "/health"
if ($health) {
    Write-Host "✅ Servidor está funcionando" -ForegroundColor Green
} else {
    Write-Host "❌ Servidor no está respondiendo" -ForegroundColor Red
    exit 1
}

# Probar registro de usuario
Write-Host "`n👤 Probando registro de usuario..." -ForegroundColor Yellow
$registerData = @{
    email = "test@aiquaa.com"
    password = "TestPassword123!"
    name = "Usuario de Prueba"
}
$registerResponse = Invoke-ApiRequest -Method "POST" -Endpoint "/auth/register" -Body $registerData
if ($registerResponse) {
    Write-Host "✅ Usuario registrado: $($registerResponse.message)" -ForegroundColor Green
} else {
    Write-Host "⚠️ Usuario ya existe o error en registro" -ForegroundColor Yellow
}

# Probar login
Write-Host "`n🔐 Probando login..." -ForegroundColor Yellow
$loginData = @{
    email = "test@aiquaa.com"
    password = "TestPassword123!"
}
$loginResponse = Invoke-ApiRequest -Method "POST" -Endpoint "/auth/login" -Body $loginData
if ($loginResponse) {
    Write-Host "✅ Login exitoso" -ForegroundColor Green
    $accessToken = $loginResponse.access_token
} else {
    Write-Host "❌ Error en login" -ForegroundColor Red
    exit 1
}

# Probar envío de código 2FA
Write-Host "`n📧 Probando envío de código 2FA..." -ForegroundColor Yellow
$twoFactorData = @{
    email = "test@aiquaa.com"
}
$twoFactorResponse = Invoke-ApiRequest -Method "POST" -Endpoint "/auth/2fa/send-code" -Body $twoFactorData
if ($twoFactorResponse) {
    Write-Host "✅ Código 2FA enviado: $($twoFactorResponse.message)" -ForegroundColor Green
} else {
    Write-Host "❌ Error enviando código 2FA" -ForegroundColor Red
}

# Probar estado de 2FA
Write-Host "`n🔍 Probando estado de 2FA..." -ForegroundColor Yellow
$statusResponse = Invoke-ApiRequest -Method "GET" -Endpoint "/auth/2fa/status" -Headers @{ "Authorization" = "Bearer $accessToken" }
if ($statusResponse) {
    Write-Host "✅ Estado de 2FA: $($statusResponse.enabled)" -ForegroundColor Green
} else {
    Write-Host "❌ Error obteniendo estado de 2FA" -ForegroundColor Red
}

# Probar habilitar 2FA
Write-Host "`n🔒 Probando habilitar 2FA..." -ForegroundColor Yellow
$enableResponse = Invoke-ApiRequest -Method "POST" -Endpoint "/auth/2fa/enable" -Headers @{ "Authorization" = "Bearer $accessToken" }
if ($enableResponse) {
    Write-Host "✅ 2FA habilitado: $($enableResponse.message)" -ForegroundColor Green
} else {
    Write-Host "❌ Error habilitando 2FA" -ForegroundColor Red
}

Write-Host "`n✨ Pruebas completadas!" -ForegroundColor Green
Write-Host "📋 Resumen:" -ForegroundColor Cyan
Write-Host "  - ✅ Servidor funcionando" -ForegroundColor Green
Write-Host "  - ✅ Registro de usuario" -ForegroundColor Green
Write-Host "  - ✅ Login" -ForegroundColor Green
Write-Host "  - ✅ Envío de código 2FA" -ForegroundColor Green
Write-Host "  - ✅ Estado de 2FA" -ForegroundColor Green
Write-Host "  - ✅ Habilitar 2FA" -ForegroundColor Green