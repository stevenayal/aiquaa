# Script para verificar env vars configuradas en un proyecto Vercel
# Uso: .\scripts\check-vercel-token.ps1 -ApiToken "vcp_xxx..."

param(
    [Parameter(Mandatory=$true)]
    [string]$ApiToken,
    [string]$ProjectId = "prj_utOkqNUA0dIJ7QNPE5w7yyARb7KL",
    [string]$TeamId    = "team_7rcy7zJm77OjBWuekvVMIN5G"
)

$headers = @{ Authorization = "Bearer $ApiToken" }

$r = Invoke-RestMethod -Uri "https://api.vercel.com/v10/projects/$ProjectId/env?teamId=$TeamId" -Headers $headers
Write-Host "Env vars en Vercel ($($r.envs.Count) total):" -ForegroundColor Cyan
foreach ($e in $r.envs) {
    Write-Host "  [$($e.target -join ',')] $($e.key) ($($e.type))"
}
