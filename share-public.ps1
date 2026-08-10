# Levanta una demo publica temporal mediante Cloudflare Tunnel.
$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot

$cloudflaredCommand = Get-Command cloudflared -ErrorAction SilentlyContinue
$cloudflaredPath = if ($cloudflaredCommand) {
    $cloudflaredCommand.Path
} else {
    @(
        'C:\Program Files (x86)\cloudflared\cloudflared.exe',
        'C:\Program Files\cloudflared\cloudflared.exe'
    ) | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
}

if (-not $cloudflaredPath) {
    Write-Error 'No se encontro cloudflared. Instala con: winget install Cloudflare.cloudflared'
    exit 1
}

# Fuerza a Laravel Vite a usar los assets compilados, no el dev server local.
if (Test-Path -LiteralPath 'public\hot') {
    Remove-Item -LiteralPath 'public\hot'
}

Write-Host 'Compilando assets (npm run build)...'
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Error 'No se pudo compilar el frontend.'
    exit 1
}

Write-Host ''
Write-Host 'Levantando tunel. La URL aparecera en esta ventana y se copiara al portapapeles.'
Write-Host 'Presiona Ctrl+C para terminar la demo.'
Write-Host ''

$publicUrl = $null
$originHost = 'transparencia.test'
$previousErrorActionPreference = $ErrorActionPreference
$ErrorActionPreference = 'Continue'
try {
    # Mantiene el vhost de Laragon aunque el Host publico sea trycloudflare.com.
    & $cloudflaredPath tunnel --url http://127.0.0.1 --http-host-header $originHost 2>&1 | ForEach-Object {
        $line = $_.ToString()
        Write-Host $line

        if (-not $publicUrl -and $line -match '(https://[a-z0-9-]+\.trycloudflare\.com)') {
            $publicUrl = $matches[1]
            try {
                Set-Clipboard -Value $publicUrl
                Write-Host "`nURL PUBLICA (copiada al portapapeles): $publicUrl" -ForegroundColor Green
            } catch {
                Write-Host "`nURL PUBLICA: $publicUrl" -ForegroundColor Green
                Write-Host 'No se pudo copiar automaticamente al portapapeles.'
            }
        }
    }
}
finally {
    $ErrorActionPreference = $previousErrorActionPreference
    Write-Host ''
    Write-Host 'Tunel cerrado. Para volver a programar con hot reload ejecuta: npm run dev'
}
