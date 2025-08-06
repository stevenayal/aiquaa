# Script para verificar el estado del DNS del subdominio api.aiquaa.com
# Ejecutar: .\check-dns.ps1

Write-Host "🔍 Verificando estado del DNS para api.aiquaa.com" -ForegroundColor Green
Write-Host ("=" * 60) -ForegroundColor Gray

$domain = "api.aiquaa.com"

# Verificar resolución DNS
Write-Host "📡 Verificando resolución DNS..." -ForegroundColor Yellow
try {
    $dnsResult = Resolve-DnsName -Name $domain -ErrorAction Stop
    Write-Host "✅ DNS resuelve correctamente:" -ForegroundColor Green
    foreach ($record in $dnsResult) {
        Write-Host "   Tipo: $($record.Type) | Valor: $($record.IPAddress)" -ForegroundColor Cyan
    }
} catch {
    Write-Host "❌ DNS no resuelve: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   El subdominio no está configurado o no ha propagado aún" -ForegroundColor Yellow
}

Write-Host ""

# Verificar conectividad HTTP
Write-Host "🌐 Verificando conectividad HTTP..." -ForegroundColor Yellow
try {
    $httpResponse = Invoke-WebRequest -Uri "http://$domain" -TimeoutSec 10 -ErrorAction Stop
    Write-Host "✅ HTTP conecta correctamente (Status: $($httpResponse.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "❌ HTTP no conecta: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Verificar conectividad HTTPS
Write-Host "🔒 Verificando conectividad HTTPS..." -ForegroundColor Yellow
try {
    $httpsResponse = Invoke-WebRequest -Uri "https://$domain" -TimeoutSec 10 -ErrorAction Stop
    Write-Host "✅ HTTPS conecta correctamente (Status: $($httpsResponse.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "❌ HTTPS no conecta: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Posible causa: SSL aún no generado o dominio no configurado" -ForegroundColor Yellow
}

Write-Host ""

# Verificar ping
Write-Host "🏓 Verificando ping..." -ForegroundColor Yellow
try {
    $pingResult = Test-Connection -ComputerName $domain -Count 1 -Quiet
    if ($pingResult) {
        Write-Host "✅ Ping exitoso" -ForegroundColor Green
    } else {
        Write-Host "❌ Ping falló" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error en ping: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host ("=" * 60) -ForegroundColor Gray
Write-Host "📋 Resumen del estado:" -ForegroundColor Cyan

# Determinar estado general
$dnsWorks = $false
$httpWorks = $false
$httpsWorks = $false

try {
    Resolve-DnsName -Name $domain -ErrorAction Stop | Out-Null
    $dnsWorks = $true
} catch { }

try {
    Invoke-WebRequest -Uri "http://$domain" -TimeoutSec 5 -ErrorAction Stop | Out-Null
    $httpWorks = $true
} catch { }

try {
    Invoke-WebRequest -Uri "https://$domain" -TimeoutSec 5 -ErrorAction Stop | Out-Null
    $httpsWorks = $true
} catch { }

if ($dnsWorks) {
    Write-Host "DNS: ✅" -ForegroundColor Green
} else {
    Write-Host "DNS: ❌" -ForegroundColor Red
}

if ($httpWorks) {
    Write-Host "HTTP: ✅" -ForegroundColor Green
} else {
    Write-Host "HTTP: ❌" -ForegroundColor Red
}

if ($httpsWorks) {
    Write-Host "HTTPS: ✅" -ForegroundColor Green
} else {
    Write-Host "HTTPS: ❌" -ForegroundColor Red
}

Write-Host ""

if ($dnsWorks -and $httpWorks -and $httpsWorks) {
    Write-Host "🎉 ¡El subdominio está completamente funcional!" -ForegroundColor Green
    Write-Host "   Puedes proceder con las pruebas de la API" -ForegroundColor Cyan
} elseif ($dnsWorks -and $httpWorks -and -not $httpsWorks) {
    Write-Host "⚠️  El dominio funciona pero SSL aún no está listo" -ForegroundColor Yellow
    Write-Host "   Espera hasta 24 horas para la generación del certificado" -ForegroundColor Yellow
} elseif ($dnsWorks -and -not $httpWorks) {
    Write-Host "⚠️  DNS resuelve pero el servidor no responde" -ForegroundColor Yellow
    Write-Host "   Verifica que el backend esté desplegado en Vercel" -ForegroundColor Yellow
} else {
    Write-Host "❌ El subdominio no está configurado" -ForegroundColor Red
    Write-Host "   Necesitas configurar el dominio en Vercel" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📋 Próximos pasos:" -ForegroundColor Cyan
if (-not $dnsWorks) {
    Write-Host "1. Configurar el dominio api.aiquaa.com en Vercel" -ForegroundColor White
    Write-Host "2. Agregar los registros DNS según las instrucciones" -ForegroundColor White
    Write-Host "3. Esperar la propagación DNS (puede tardar hasta 48 horas)" -ForegroundColor White
} elseif (-not $httpsWorks) {
    Write-Host "1. Esperar la generación del certificado SSL" -ForegroundColor White
    Write-Host "2. Verificar en el dashboard de Vercel el estado del SSL" -ForegroundColor White
} else {
    Write-Host "1. Ejecutar: node test-api-endpoints.cjs" -ForegroundColor White
    Write-Host "2. Ir a: https://aiquaa.com/api-test" -ForegroundColor White
    Write-Host "3. Verificar que todos los endpoints funcionen" -ForegroundColor White
} 