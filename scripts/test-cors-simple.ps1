# Script simple para probar CORS
$backendUrl = "https://aiquaabackend-production.up.railway.app"
$frontendUrl = "https://aiquaa.com"

Write-Host "Testing CORS for aiquaa.com..." -ForegroundColor Cyan

# Test 1: Health endpoint
Write-Host "1. Testing health endpoint..." -ForegroundColor Green
try {
    $healthResponse = Invoke-WebRequest -Uri "$backendUrl/health" -UseBasicParsing
    Write-Host "   Health Status: $($healthResponse.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "   Health Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: OPTIONS preflight
Write-Host "2. Testing OPTIONS preflight..." -ForegroundColor Green
try {
    $preflightResponse = Invoke-WebRequest -Uri "$backendUrl/api/v1/auth/register" -Method OPTIONS -Headers @{
        "Origin" = $frontendUrl
        "Access-Control-Request-Method" = "POST"
    } -UseBasicParsing
    Write-Host "   Preflight Status: $($preflightResponse.StatusCode)" -ForegroundColor Green
    
    # Check CORS headers
    $corsHeaders = @("Access-Control-Allow-Origin", "Access-Control-Allow-Methods", "Access-Control-Allow-Headers")
    foreach ($header in $corsHeaders) {
        if ($preflightResponse.Headers.ContainsKey($header)) {
            Write-Host "   $header`: $($preflightResponse.Headers[$header])" -ForegroundColor Green
        } else {
            Write-Host "   $header`: Missing" -ForegroundColor Red
        }
    }
} catch {
    Write-Host "   Preflight Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: POST request
Write-Host "3. Testing POST request..." -ForegroundColor Green
try {
    $postBody = @{
        name = "Test User"
        email = "test@example.com"
        password = "TestPassword123"
    } | ConvertTo-Json

    $postResponse = Invoke-WebRequest -Uri "$backendUrl/api/v1/auth/register" -Method POST -Headers @{
        "Origin" = $frontendUrl
        "Content-Type" = "application/json"
    } -Body $postBody -UseBasicParsing
    Write-Host "   POST Status: $($postResponse.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "   POST Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "CORS test completed!" -ForegroundColor Cyan
