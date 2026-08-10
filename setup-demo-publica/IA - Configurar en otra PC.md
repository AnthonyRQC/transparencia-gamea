# Configurar Demo Publica en Otra PC

## Objetivo

Configurar este proyecto Laravel para que, en otra PC Windows con Laragon, pueda:

- Continuar funcionando normalmente en desarrollo local.
- Levantar ocasionalmente un enlace publico temporal por internet.
- Permitir que varias personas prueben la aplicacion desde ese enlace.

El enlace se crea con Cloudflare Tunnel sin cuenta. Es aleatorio y solo funciona mientras el proceso del tunel permanezca abierto.

## Contexto de la PC destino

- Windows.
- Laragon instalado.
- Apache y MySQL administrados por Laragon.
- Proyecto Laravel con Inertia, React y Vite.
- Ruta parecida a `C:\laragon\www\transparencia`.
- Vhost automatico de Laragon con formato `nombre-del-proyecto.test`.

## Reglas para la IA

1. Determinar primero la ruta real del proyecto. No asumir que siempre es `C:\laragon\www\transparencia`.
2. Revisar cambios existentes antes de editar. No revertir cambios del usuario.
3. Detectar el nombre del vhost de Laragon y usarlo como `ORIGIN_HOST`.
4. No cambiar `APP_KEY`, credenciales de base de datos ni migraciones.
5. No cambiar `.env` para esta configuracion. El host publico se obtiene de la peticion y `trustProxies` permite respetar el proxy.
6. No dejar un tunel publico ejecutandose sin autorizacion explicita del usuario.
7. No leer esta carpeta como contexto normal del proyecto. Es documentacion operativa de un solo uso.

## 1. Detectar el proyecto y el vhost

Confirmar que Apache y MySQL esten activos en Laragon. Abrir primero el proyecto localmente.

Buscar el vhost automatico de Laragon en el archivo de hosts de Windows:

```powershell
Get-Content 'C:\Windows\System32\drivers\etc\hosts' |
    Where-Object { $_ -match 'laragon magic|\.test' }
```

Identificar la linea que apunta a `127.0.0.1` y corresponde a este proyecto. Ejemplo:

```text
127.0.0.1 transparencia.test #laragon magic!
```

En ese ejemplo:

```text
ORIGIN_HOST=transparencia.test
```

Verificar que el vhost carga la aplicacion y no la pagina inicial de Laragon:

```powershell
Invoke-WebRequest -Uri 'http://transparencia.test' -UseBasicParsing
```

Si el nombre es otro, sustituir `transparencia.test` por el nombre detectado en todos los pasos siguientes.

## 2. Configurar trusted proxies de Laravel

Abrir `bootstrap/app.php` y buscar:

```php
->withMiddleware(function (Middleware $middleware) {
```

Dentro de ese bloque, agregar esta linea si aun no existe:

```php
$middleware->trustProxies(at: '*');
```

El resultado debe verse parecido a:

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->trustProxies(at: '*');

    $middleware->web(append: [
```

Limpiar la cache de Laravel:

```powershell
php artisan optimize:clear
```

Si `php` no esta disponible en PATH, usar el PHP seleccionado por Laragon o su ruta completa, por ejemplo:

```powershell
C:\laragon\bin\php\php-8.3.30-Win32-vs16-x64\php.exe artisan optimize:clear
```

La version exacta puede ser diferente. Usar la version activa en Laragon.

## 3. Instalar Cloudflare Tunnel

Abrir PowerShell y ejecutar:

```powershell
winget install --id Cloudflare.cloudflared --exact --accept-source-agreements --accept-package-agreements
```

Verificar la instalacion:

```powershell
cloudflared --version
```

La instalacion MSI normalmente deja el ejecutable en:

```text
C:\Program Files (x86)\cloudflared\cloudflared.exe
```

Si la terminal ya estaba abierta antes de instalarlo, abrir una nueva terminal. El script tambien busca esa ruta directamente si el PATH no se actualizo.

## 4. Crear `share-public.ps1`

Crear este archivo en la raiz del proyecto. Reemplazar solamente el valor de `$originHost` por el vhost detectado en el paso 1.

```powershell
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
```

## 5. Crear `share-public.bat`

Crear este archivo en la misma raiz del proyecto:

```bat
@echo off
title Transparencia - Demo publica
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0share-public.ps1"
echo.
pause
```

El archivo `.bat` existe para que una persona pueda iniciar la demo con doble clic. No usar doble clic directamente sobre el `.ps1`, porque Windows puede abrirlo como texto.

## 6. Verificacion

Antes de probar el enlace publico:

1. Confirmar que Apache y MySQL estan activos en Laragon.
2. Confirmar que la URL local del vhost muestra la aplicacion.
3. Detener `npm run dev` si esta ejecutandose.
4. Ejecutar `share-public.bat`.
5. Esperar a que termine `npm run build`.
6. Confirmar que Cloudflare imprime una URL `https://...trycloudflare.com`.
7. Abrir esa URL desde un navegador de prueba o una ventana de incognito.
8. Confirmar que se muestra la aplicacion, no la pagina de bienvenida de Laragon.
9. Probar login, sesiones y una ruta publica.

La URL solo permanece activa mientras la ventana del tunel este abierta. Para terminar, presionar `Ctrl+C`.

## Problemas conocidos

### Se abre el `.ps1` como Bloc de notas

Usar `share-public.bat` con doble clic, o ejecutar desde PowerShell:

```powershell
powershell.exe -ExecutionPolicy Bypass -File .\share-public.ps1
```

### `cloudflared` no se encuentra

Abrir una terminal nueva y comprobar:

```powershell
cloudflared --version
```

El script tambien busca estas rutas:

```text
C:\Program Files (x86)\cloudflared\cloudflared.exe
C:\Program Files\cloudflared\cloudflared.exe
```

### Aparece la pagina de Laragon

El vhost detectado es incorrecto o `$originHost` no fue actualizado. Confirmar la entrada `#laragon magic!` en el archivo hosts y cambiar el valor de `$originHost`.

### El tunel se cierra al mostrar avisos de Cloudflare

Usar el script completo de esta guia. El bloque temporal con `$ErrorActionPreference = 'Continue'` evita que los avisos enviados por `cloudflared` sean tratados como errores fatales por PowerShell.
