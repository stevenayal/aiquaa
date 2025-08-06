# Script para verificar el estado del DNS del subdominio api.aiquaa.com
# Ejecutar: powershell -ExecutionPolicy Bypass -File check-dns-simple.ps1

Write-Host "Verificando estado del DNS para api.aiquaa.com" -ForegroundColor Green
Write-Host ("=" * 60) -ForegroundColor Gray

$domain = "api.aiquaa.com"

# Verificar resolución DNS
Write-Host "Verificando resolucion DNS..." -ForegroundColor Yellow
try {
    $dnsResult = Resolve-DnsName -Name $domain -ErrorAction Stop
    Write-Host "OK - DNS resuelve correctamente:" -ForegroundColor Green
    foreach ($record in $dnsResult) {
        Write-Host "   Tipo: $($record.Type) | Valor: $($record.IPAddress)" -ForegroundColor Cyan
    }
} catch {
    Write-Host "ERROR - DNS no resuelve: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   El subdominio no esta configurado o no ha propagado aun" -ForegroundColor Yellow
}

Write-Host ""

# Verificar conectividad HTTP
Write-Host "Verificando conectividad HTTP..." -ForegroundColor Yellow
try {
    $httpResponse = Invoke-WebRequest -Uri "http://$domain" -TimeoutSec 10 -ErrorAction Stop
    Write-Host "OK - HTTP conecta correctamente (Status: $($httpResponse.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "ERROR - HTTP no conecta: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Verificar conectividad HTTPS
Write-Host "Verificando conectividad HTTPS..." -ForegroundColor Yellow
try {
    $httpsResponse = Invoke-WebRequest -Uri "https://$domain" -TimeoutSec 10 -ErrorAction Stop
    Write-Host "OK - HTTPS conecta correctamente (Status: $($httpsResponse.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "ERROR - HTTPS no conecta: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Posible causa: SSL aun no generado o dominio no configurado" -ForegroundColor Yellow
}

Write-Host ""
Write-Host ("=" * 60) -ForegroundColor Gray
Write-Host "Resumen del estado:" -ForegroundColor Cyan

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
    Write-Host "DNS: OK" -ForegroundColor Green
} else {
    Write-Host "DNS: ERROR" -ForegroundColor Red
}

if ($httpWorks) {
    Write-Host "HTTP: OK" -ForegroundColor Green
} else {
    Write-Host "HTTP: ERROR" -ForegroundColor Red
}

if ($httpsWorks) {
    Write-Host "HTTPS: OK" -ForegroundColor Green
} else {
    Write-Host "HTTPS: ERROR" -ForegroundColor Red
}

Write-Host ""

if ($dnsWorks -and $httpWorks -and $httpsWorks) {
    Write-Host "El subdominio esta completamente funcional!" -ForegroundColor Green
    Write-Host "   Puedes proceder con las pruebas de la API" -ForegroundColor Cyan
} elseif ($dnsWorks -and $httpWorks -and -not $httpsWorks) {
    Write-Host "El dominio funciona pero SSL aun no esta listo" -ForegroundColor Yellow
    Write-Host "   Espera hasta 24 horas para la generacion del certificado" -ForegroundColor Yellow
} elseif ($dnsWorks -and -not $httpWorks) {
    Write-Host "DNS resuelve pero el servidor no responde" -ForegroundColor Yellow
    Write-Host "   Verifica que el backend este desplegado en Vercel" -ForegroundColor Yellow
} else {
    Write-Host "El subdominio no esta configurado" -ForegroundColor Red
    Write-Host "   Necesitas configurar el dominio en Vercel" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Proximos pasos:" -ForegroundColor Cyan
if (-not $dnsWorks) {
    Write-Host "1. Configurar el dominio api.aiquaa.com en Vercel" -ForegroundColor White
    Write-Host "2. Agregar los registros DNS segun las instrucciones" -ForegroundColor White
    Write-Host "3. Esperar la propagacion DNS (puede tardar hasta 48 horas)" -ForegroundColor White
} elseif (-not $httpsWorks) {
    Write-Host "1. Esperar la generacion del certificado SSL" -ForegroundColor White
    Write-Host "2. Verificar en el dashboard de Vercel el estado del SSL" -ForegroundColor White
} else {
    Write-Host "1. Ejecutar: node test-api-endpoints.cjs" -ForegroundColor White
    Write-Host "2. Ir a: https://aiquaa.com/api-test" -ForegroundColor White
    Write-Host "3. Verificar que todos los endpoints funcionen" -ForegroundColor White
} 