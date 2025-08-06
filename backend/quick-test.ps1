Write-Host "Testing backend endpoints..." -ForegroundColor Green

# Test GET comments
try {
    Write-Host "Testing GET /api/comments..." -ForegroundColor Yellow
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/comments" -Method GET
    Write-Host "✅ GET comments successful. Found $($response.Count) comments" -ForegroundColor Green
} catch {
    Write-Host "❌ GET comments failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test POST comment
try {
    Write-Host "Testing POST /api/comments..." -ForegroundColor Yellow
    $body = @{
        name = "Test User"
        message = "Test comment from PowerShell"
        isAnonymous = $false
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/comments" -Method POST -Body $body -ContentType "application/json"
    Write-Host "✅ POST comment successful. Comment ID: $($response.id)" -ForegroundColor Green
} catch {
    Write-Host "❌ POST comment failed: $($_.Exception.Message)" -ForegroundColor Red
} 