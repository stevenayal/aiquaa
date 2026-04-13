# Script para configurar env vars de Supabase en Vercel
# Requiere: API Token con acceso al team (vercel.com/account/tokens)
# Uso: .\scripts\set-vercel-env.ps1 -ApiToken "vcp_xxx..."

param(
    [Parameter(Mandatory=$true)]
    [string]$ApiToken,
    [string]$ProjectId = "prj_utOkqNUA0dIJ7QNPE5w7yyARb7KL",
    [string]$TeamId    = "team_7rcy7zJm77OjBWuekvVMIN5G"
)

$apiUrl  = "https://api.vercel.com/v10/projects/$ProjectId/env?teamId=$TeamId&upsert=true"
$headers = @{ Authorization = "Bearer $ApiToken"; "Content-Type" = "application/json" }

# Cargá los valores desde tu .env.local o pasalos como parámetros
$envVars = @(
    @{ key = "NEXT_PUBLIC_SUPABASE_URL";             value = $env:NEXT_PUBLIC_SUPABASE_URL;             type = "plain";     target = @("production","preview","development") },
    @{ key = "NEXT_PUBLIC_SUPABASE_ANON_KEY";        value = $env:NEXT_PUBLIC_SUPABASE_ANON_KEY;        type = "plain";     target = @("production","preview","development") },
    @{ key = "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"; value = $env:NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY; type = "plain";     target = @("production","preview","development") },
    @{ key = "NEXT_PUBLIC_SITE_URL";                 value = $env:NEXT_PUBLIC_SITE_URL;                 type = "plain";     target = @("production","preview","development") },
    @{ key = "SUPABASE_SERVICE_ROLE_KEY";            value = $env:SUPABASE_SERVICE_ROLE_KEY;            type = "sensitive"; target = @("production","preview","development") },
    @{ key = "SUPABASE_JWT_SECRET";                  value = $env:SUPABASE_JWT_SECRET;                  type = "sensitive"; target = @("production","preview","development") },
    @{ key = "SUPABASE_SECRET_KEY";                  value = $env:SUPABASE_SECRET_KEY;                  type = "sensitive"; target = @("production","preview","development") }
) | Where-Object { $_.value }  # ignora vars vacías

$body = $envVars | ConvertTo-Json -Depth 4
Write-Host "Subiendo $($envVars.Count) env vars a Vercel..." -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri $apiUrl -Method POST -Headers $headers -Body $body -ErrorAction Stop
    Write-Host "OK - Env vars configuradas correctamente." -ForegroundColor Green
} catch {
    $msg = if ($_.ErrorDetails.Message) { ($_.ErrorDetails.Message | ConvertFrom-Json).error.message } else { $_.Exception.Message }
    Write-Host "ERROR: $msg" -ForegroundColor Red
}
