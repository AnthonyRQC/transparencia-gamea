# Notas Migración Laravel 13 — Cierre

**Fecha:** 01-sep-2026
**Rama/merge:** `feature/laravel-13-upgrade` → `main` (squash `b91e404`)
**Tags:** `pre-laravel13: 01bcc42` → `laravel-13: b91e404`
**Tiempo:** ~2h · Riesgo: bajo · Estrategia: directo L11 → L13 (sin L12)

## Histórico

- **Sprint 0 → Sprint 11 inclusive:** `Laravel 11 / PHP 8.2.31` + `maatwebsite/excel ^3.1` + `phpunit ^10.5` + `collision ^8.0` + `tinker ^2.9`
- **Sprint 12 planeado en L11:** `31bcebd` *planeacion de sprint 12 finalizada*
- **Migración:** 01-sep-2026 antes de ejecutar Sprint 12, a `Laravel 13 / PHP 8.3.30`

> Para consultar diff exacto: `git diff pre-laravel13..laravel-13 --stat` y `git show laravel-13`

## Cambios

### composer.json

```diff
 "php": "^8.2" → "^8.3"
 "laravel/framework": "^11.0" → "^13.0"
 "laravel/tinker": "^2.9" → "^3.0"
 "maatwebsite/excel": "^3.1" → "^4.0"
 "nunomaduro/collision": "^8.0" → "^9.0"
 "phpunit/phpunit": "^10.5" → "^12.0"
 "branch-alias": "11.x-dev" → "13.x-dev"
```

`composer.lock` regenerado. `inertiajs/inertia-laravel ^2.0`, `barryvdh/laravel-dompdf ^3.1`, `tightenco/ziggy ^2.0` sin cambios (compatibles). Frontend npm intacto (React 18, Tailwind v3, Inertia React v2, shadcn 2.3.0).

### Archivos tocados

| Archivo | Cambio | Riesgo |
|---------|--------|--------|
| `app/Exports/ReporteExcel.php` | Revisado para excel v4 (phpspreadsheet 5.x tipado estricto, 1.8KB) — sin cambios de firma necesarios, solo verificación | Medio → resuelto |
| `phpunit.xml` | `<source>` ya moderno, compatible PHPUnit 12 | Bajo |
| `bootstrap/app.php` | Slim `Application::configure()` ya L11 moderno, sin cambios | Bajo |
| `config/*.php` | Sin cambios | Bajo |
| `Guia - Instalación Local.md:4` | `PHP 8.2+` → `PHP 8.3+` | Docs |

### Verificación

- `C:\laragon\bin\php\php-8.3.30-Win32-vs16-x64\php.exe -v` → PHP 8.3.30
- `composer update --with-all-dependencies` sin errores
- `php artisan test` → 63 tests verdes (AI-CONTEXT suite 63)
- `php artisan migrate:fresh --seed` OK
- `npm run build` OK
- Manual: Login case-sensitive, Bandeja, MisCasos, Dashboard, Catálogos árbol 185, Excel, Seguimiento token, Notificaciones

## Configuración Laragon

1. Systray Laragon → `PHP` → `Version` → `php-8.3.30-Win32-vs16-x64`
2. `Stop All` → `Start All`
3. Verificar con `Laragon Terminal`: `php -v` → 8.3.30

## Documentación actualizada

- `AI-CONTEXT.md:9` Stack → Laravel 13 / PHP 8.3.30 + nota histórico L11→L13 + tags
- `AI-CONTEXT.md:12` Estado Actual → bloque Migración Sep 2026
- `AI-CONTEXT.md:75` Documentación Esencial → añadido este archivo
- `Plan de Desarrollo.md:12` Stack 11.x → 13.x + nota histórica, `:28` Breeze
- `Plan de Desarrollo.md:52` Reestructuración → añadido bullet migración
- `Guia - Instalación Local.md:4` PHP 8.2+ → 8.3+
- `Proyecto - Transparencia Stack y Conceptos.md:40` + `:127` Reverb 11 → 13
- `Proyecto - Resumen General del Sistema.md:386` 11 → 13
- `Sprint 10 - Base de Datos Real (Eloquent + MySQL).md:22` 11 → 13

## Decisiones

- Directo a L13 (no L12) porque L12 ya sin bug fixes desde 13-ago-2026 y solo security hasta feb-2027, L13 activo hasta 2028 `analisis_migracion_laravel.md:8`
- Frontend intacto, no `npm install`, no Tailwind v4, no React 19 `analisis_migracion_laravel.md:56`
- Análisis previo `analisis_migracion_laravel.md` archivado en historial `6b66a20` y removido del HEAD `ad2f8ef` — no genera ruido en `main`

## Para IAs futuras

- Sprint 0-11: asumir L11/PHP 8.2 si lees `.md` histórico; no retroceder `composer.json`
- Sprint 12+: asumir L13/PHP 8.3
- No volver a proponer migración L11→L13
