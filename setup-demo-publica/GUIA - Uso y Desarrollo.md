# Guia de Uso: Demo Publica y Desarrollo Local

## Que se configuro

El proyecto puede trabajar en dos modos:

- **Desarrollo local:** Vite ofrece hot reload para programar.
- **Demo publica temporal:** Cloudflare crea una URL de internet para que varias personas prueben la aplicacion.

La demo utiliza el Apache y el MySQL de Laragon en tu PC. La base de datos no se publica directamente.

## Archivos importantes

| Archivo | Funcion |
| --- | --- |
| `share-public.bat` | Inicia la demo con doble clic. |
| `share-public.ps1` | Compila el frontend y levanta Cloudflare Tunnel. |
| `bootstrap/app.php` | Permite que Laravel respete el proxy del tunel. |
| `public/build/` | Assets compilados para la demo publica. Es una carpeta generada. |

## Modo normal: programar localmente

1. Abrir Laragon.
2. Iniciar Apache y MySQL.
3. Abrir una terminal en la raiz del proyecto:

```powershell
cd C:\laragon\www\transparencia
npm run dev
```

Tambien puedes abrir el proyecto desde el vhost de Laragon, normalmente:

```text
http://transparencia.test
```

La configuracion de Vite ya permite acceso por la red local. No es necesario agregar `--host`.

## Levantar la demo publica

Antes de compartir el proyecto:

1. Guardar o terminar los cambios actuales.
2. Detener `npm run dev` con `Ctrl+C`.
3. Confirmar que Apache y MySQL siguen activos en Laragon.
4. Hacer doble clic en:

```text
C:\laragon\www\transparencia\share-public.bat
```

5. Esperar a que termine `npm run build`.
6. Cloudflare mostrara una URL parecida a:

```text
https://memories-calling-santa-cause.trycloudflare.com
```

7. La URL aparece en la ventana de la demo en color verde y se copia automaticamente al portapapeles.
8. Compartir esa URL con las personas que haran las pruebas.

La ventana debe permanecer abierta durante toda la demostracion. Si se cierra, el enlace deja de funcionar.

## Terminar la demo y volver a programar

1. Volver a la ventana de `share-public.bat`.
2. Presionar `Ctrl+C`.
3. Cerrar la ventana cuando termine.
4. Volver a la terminal del proyecto y ejecutar:

```powershell
npm run dev
```

No es necesario modificar `.env` ni cambiar manualmente `APP_URL` entre ambos modos.

## Reglas importantes

- No ejecutar `npm run dev` mientras la demo publica esta activa.
- La demo compila los assets con `npm run build` y elimina `public/hot` para que los visitantes no intenten cargar Vite desde su propio computador.
- La URL es nueva en cada ejecucion porque se usa un Quick Tunnel sin cuenta Cloudflare.
- No compartir la URL si no quieres exponer la aplicacion y los datos de prueba de tu base local.
- Usar datos de demostracion, no informacion sensible o real.
- La URL deja de existir cuando se cierra el tunel.

## Problemas frecuentes

### Se abre un archivo de texto

No abrir `share-public.ps1` directamente. Abrir `share-public.bat` con doble clic.

### No aparece la URL

Esperar a que termine el build. Si el proceso se cierra, revisar el mensaje de error en la ventana y confirmar que Laragon, Apache y MySQL esten activos.

### Aparece la pagina inicial de Laragon

Cerrar el tunel y volver a ejecutar el `share-public.bat` actualizado. El script envia el Host `transparencia.test` para que Apache seleccione este proyecto y no el sitio predeterminado.

### No funciona el login o la sesion

Confirmar que MySQL esta activo y que la URL publica es la URL actual que acaba de imprimir Cloudflare. Cada ejecucion genera una URL diferente.

### El sistema pide permisos para ejecutar PowerShell

El archivo `.bat` ya usa `-ExecutionPolicy Bypass`. Si se ejecuta manualmente desde PowerShell:

```powershell
powershell.exe -ExecutionPolicy Bypass -File .\share-public.ps1
```

## Comandos utiles

| Necesidad | Comando |
| --- | --- |
| Desarrollo local | `npm run dev` |
| Compilar assets | `npm run build` |
| Limpiar cache Laravel | `php artisan optimize:clear` |
| Ejecutar pruebas | `php artisan test` |
| Ver version de Cloudflare | `cloudflared --version` |
