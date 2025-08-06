Write-Host "🧪 Probando endpoints de comentarios..." -ForegroundColor Green
Write-Host ""

try {
    # Test 1: Crear un comentario
    Write-Host "1. Probando crear comentario..." -ForegroundColor Yellow
    $body = @{
        name = "Test User"
        message = "Este es un comentario de prueba para verificar que funciona correctamente."
        isAnonymous = $false
    } | ConvertTo-Json

    $createResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/comments" -Method POST -Body $body -ContentType "application/json"
    Write-Host "✅ Comentario creado:" -ForegroundColor Green
    $createResponse | ConvertTo-Json -Depth 3

    # Test 2: Obtener todos los comentarios
    Write-Host "`n2. Probando obtener comentarios..." -ForegroundColor Yellow
    $getResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/comments" -Method GET
    Write-Host "✅ Comentarios obtenidos: $($getResponse.Count) registros" -ForegroundColor Green
    if ($getResponse.Count -gt 0) {
        Write-Host "Primer comentario:" -ForegroundColor Cyan
        $getResponse[0] | ConvertTo-Json -Depth 3
    }

    # Test 3: Crear comentario anónimo
    Write-Host "`n3. Probando crear comentario anónimo..." -ForegroundColor Yellow
    $anonymousBody = @{
        name = ""
        message = "Este es un comentario anónimo de prueba."
        isAnonymous = $true
    } | ConvertTo-Json

    $anonymousResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/comments" -Method POST -Body $anonymousBody -ContentType "application/json"
    Write-Host "✅ Comentario anónimo creado:" -ForegroundColor Green
    $anonymousResponse | ConvertTo-Json -Depth 3

    Write-Host "`n🎉 ¡Todas las pruebas de comentarios pasaron exitosamente!" -ForegroundColor Green

} catch {
    Write-Host "❌ Error en las pruebas: $($_.Exception.Message)" -ForegroundColor Red
} 