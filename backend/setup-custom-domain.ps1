# Script para configurar dominio personalizado
Write-Host "🌐 Configurando dominio personalizado para el backend..." -ForegroundColor Cyan

Write-Host ""
Write-Host "📋 Pasos para configurar el dominio personalizado:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Ve a https://vercel.com/dashboard" -ForegroundColor Cyan
Write-Host "2. Selecciona el proyecto 'aiquaa'" -ForegroundColor Cyan
Write-Host "3. Ve a Settings > Domains" -ForegroundColor Cyan
Write-Host "4. Agrega el dominio: api.aiquaa.com" -ForegroundColor Cyan
Write-Host "5. Configura los registros DNS según las instrucciones de Vercel" -ForegroundColor Cyan
Write-Host ""

Write-Host "🔧 Configuración DNS sugerida:" -ForegroundColor Yellow
Write-Host "   Tipo: CNAME" -ForegroundColor White
Write-Host "   Nombre: api" -ForegroundColor White
Write-Host "   Valor: aiquaa-6aro3mfgg-stevenayals-projects.vercel.app" -ForegroundColor White
Write-Host ""

Write-Host "⏳ Después de configurar el DNS:" -ForegroundColor Yellow
Write-Host "   - Espera 5-10 minutos para la propagación DNS" -ForegroundColor White
Write-Host "   - Vercel generará automáticamente el certificado SSL" -ForegroundColor White
Write-Host "   - El estado cambiará de 'Generating SSL Certificate' a 'Valid Configuration'" -ForegroundColor White
Write-Host ""

Write-Host "✅ Una vez configurado, actualiza la URL en el frontend:" -ForegroundColor Green
Write-Host "   https://api.aiquaa.com" -ForegroundColor Cyan
Write-Host ""

Write-Host "🔗 URL actual del backend:" -ForegroundColor Yellow
Write-Host "   https://aiquaa-6aro3mfgg-stevenayals-projects.vercel.app" -ForegroundColor White 