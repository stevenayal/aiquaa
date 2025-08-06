# =====================================================
# SCRIPT PARA INSERTAR DATOS DE PRUEBA EN SUPABASE
# =====================================================

Write-Host "🚀 Iniciando inserción de datos de prueba en Supabase..." -ForegroundColor Green

# Verificar si existe el archivo de configuración
if (-not (Test-Path "backend/.env")) {
    Write-Host "❌ Error: No se encontró el archivo .env en el directorio backend" -ForegroundColor Red
    Write-Host "Por favor, asegúrate de tener configuradas las variables de entorno de Supabase" -ForegroundColor Yellow
    exit 1
}

# Leer las variables de entorno
$envContent = Get-Content "backend/.env" | Where-Object { $_ -match "=" }
$envVars = @{}
foreach ($line in $envContent) {
    $parts = $line -split "=", 2
    if ($parts.Length -eq 2) {
        $envVars[$parts[0]] = $parts[1]
    }
}

# Verificar que tenemos la URL de Supabase
if (-not $envVars["POSTGRES_PRISMA_URL"]) {
    Write-Host "❌ Error: No se encontró POSTGRES_PRISMA_URL en el archivo .env" -ForegroundColor Red
    exit 1
}

$supabaseUrl = $envVars["POSTGRES_PRISMA_URL"]

Write-Host "✅ URL de Supabase encontrada" -ForegroundColor Green

# Función para ejecutar consultas SQL
function Invoke-SupabaseQuery {
    param(
        [string]$Query,
        [string]$Description
    )
    
    Write-Host "📝 Ejecutando: $Description" -ForegroundColor Cyan
    
    try {
        # Usar psql si está disponible
        $psqlPath = Get-Command psql -ErrorAction SilentlyContinue
        if ($psqlPath) {
            $result = $Query | psql $supabaseUrl 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ $Description completado exitosamente" -ForegroundColor Green
                return $result
            } else {
                Write-Host "❌ Error ejecutando $Description" -ForegroundColor Red
                Write-Host $result -ForegroundColor Red
                return $null
            }
        } else {
            Write-Host "⚠️  psql no está disponible, intentando con curl..." -ForegroundColor Yellow
            
            # Alternativa usando curl (requiere configuración adicional)
            $headers = @{
                "Content-Type" = "application/json"
                "Authorization" = "Bearer $($envVars["SUPABASE_ANON_KEY"])"
            }
            
            $body = @{
                query = $Query
            } | ConvertTo-Json
            
            $result = Invoke-RestMethod -Uri "$($envVars["SUPABASE_URL"])/rest/v1/rpc/exec_sql" -Method POST -Headers $headers -Body $body
            Write-Host "✅ $Description completado exitosamente" -ForegroundColor Green
            return $result
        }
    } catch {
        Write-Host "❌ Error ejecutando $Description`: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Leer el archivo SQL
$sqlContent = Get-Content "test-inserts.sql" -Raw

# Separar las consultas (asumiendo que están separadas por punto y coma)
$queries = $sqlContent -split ";" | Where-Object { $_.Trim() -ne "" }

$successCount = 0
$totalQueries = $queries.Count

foreach ($query in $queries) {
    $trimmedQuery = $query.Trim()
    if ($trimmedQuery -ne "") {
        $description = if ($trimmedQuery -match "INSERT INTO") {
            if ($trimmedQuery -match "Comment") { "Insertando comentarios de prueba" }
            elseif ($trimmedQuery -match "Feedback") { "Insertando feedback de prueba" }
            else { "Ejecutando consulta SQL" }
        } elseif ($trimmedQuery -match "SELECT") {
            "Verificando datos insertados"
        } else {
            "Ejecutando consulta SQL"
        }
        
        $result = Invoke-SupabaseQuery -Query $trimmedQuery -Description $description
        if ($result -ne $null) {
            $successCount++
        }
    }
}

Write-Host "`n📊 Resumen de ejecución:" -ForegroundColor Magenta
Write-Host "   Total de consultas: $totalQueries" -ForegroundColor White
Write-Host "   Exitosas: $successCount" -ForegroundColor Green
Write-Host "   Fallidas: $($totalQueries - $successCount)" -ForegroundColor Red

if ($successCount -eq $totalQueries) {
    Write-Host "`n🎉 ¡Todos los datos de prueba se insertaron correctamente!" -ForegroundColor Green
    Write-Host "Ahora puedes verificar los comentarios y feedback en tu aplicación." -ForegroundColor Cyan
} else {
    Write-Host "`n⚠️  Algunas consultas fallaron. Revisa los errores arriba." -ForegroundColor Yellow
}

Write-Host "`n💡 Para verificar manualmente, puedes:" -ForegroundColor Cyan
Write-Host "   1. Ir al dashboard de Supabase" -ForegroundColor White
Write-Host "   2. Navegar a la tabla 'Comment' y 'Feedback'" -ForegroundColor White
Write-Host "   3. Verificar que los registros aparezcan" -ForegroundColor White
Write-Host "   4. Probar la funcionalidad en tu aplicación" -ForegroundColor White 