# Notas Datos Demo + Time Machine (Sept 2026) — Cierre

**Fecha:** 04-sep-2026
**Stack:** Laravel 13 / PHP 8.3.30
**Motivo:** el mock tenía fechas fijas Feb-Jun 2026 (100% mora en septiembre, dashboard inutilizable) y no se podían probar plazos de 45/10 días sin esperar días reales. Se necesitaban datos realistas (~90% en plazo) para pulir el Sprint 12.

## Qué cambió

### 1. Seeders con fechas relativas a hoy
- `database/seeders/DenunciaSeeder.php` — helpers `hace()`/`haceFecha()` (zona `America/La_Paz`); 12 canónicos (tickets `DEN-2026-0001…0012`, tokens `1001…1012`) reubicados: ingresadas hace 1-4d, admitidas/asignadas hace 4-8d, investigación hace 9-14d, informe hace 2d, cerradas hace 3-5d (cumplidas).
- `database/seeders/DenunciaMasivaSeeder.php`:
  - fixes: `anonima` → `anonimo`, fuera `prueba tipo='archivo'`, `mt_srand(2026)` determinista.
  - distribución: casos de negación (plazo 20d) creados hace ≤16d; corrupción hace ≤30d; solo **1 mora intencional** (`DEN-2026-0036` asignada) para probar badges rojos.
- Resultado verificado: **84 casos** — 60 activos (44 en plazo + 15 próximos ≤5d + 1 vencido), 18 cerradas (16 cumplidas ≈89%), 6 rechazadas.
- `database/seeders/NotificacionSeeder.php` — sin cambios (avisos estáticos legacy).

### 2. Time Machine (solo `local`)
- `app/Http/Middleware/SimularFecha.php` (nuevo, primero del grupo `web` en `bootstrap/app.php`) — lee `session('dev_sim_fecha')` o `?sim_fecha=` y aplica `Carbon::setTestNow()`. Todo plazo (`DiasHabiles`, `Denuncia::calcularVencimiento()`, `plazo_info`, KPIs) responde sin tocar BD.
- `app/Http/Controllers/DevTiempoController.php` + `resources/js/Pages/Dev/Tiempo.tsx` — rutas `GET/POST /dev/tiempo`, `POST /dev/tiempo/limpiar` (`routes/web.php`); date picker + atajos +7/+10/+30/+45. Gate 404 fuera de local.
- Banner ámbar en `AppLayout.tsx` vía `simFecha` compartida en `HandleInertiaRequests.php`.
- Uso: crear denuncia (45d verde) → `/dev/tiempo` +40d → amarilla/roja + KPIs + campana → botón Hoy.

### 3. Alertas derivadas vivas
- Hallazgo: los avisos de plazo no eran vivos (Sprint 9 mock → Sprint 10 solo tabla persistida).
- `app/Services/AlertasPlazo.php` (nuevo) — calcula por request sin persistir: plazo total/informe ≤3d, solicitud/descargo ≤2d (+ vencidos). Scoping: técnico solo lo suyo, jefe todo, registrador nada. Respeta fecha simulada.
- `HandleInertiaRequests.php` fusiona derivadas (id negativo, `efimera`) + persistentes en campana; `PanelNotificaciones.tsx` no marca leídas las efímeras.
- Verificado: tec1 1 aviso hoy / 2 en +30d; jefe 10 hoy; registrador 0.

### 4. Deuda y backup
- `transparencia-proy/Deuda Tecnica y Riesgos.md` (nuevo, vivo) — P0/P1/P2.
- Backup: `backup-transparencia-2026-09-04.sql` (0.4 MB, 84 casos). Restaurar: `mysql -h 127.0.0.1 -u root transparencia < backup-transparencia-2026-09-04.sql`.

## Verificación
- `migrate:fresh --seed` OK · `php artisan test` **77 passed** · `npm run build` OK · rutas `dev.tiempo*` registradas.

## Para Sprint 12 (pulido con mock realista)
- Presets de fecha + drill-down en gráficos (backlog `Sprint 12 - Dashboard y Reportes.md` §11/§18).
- La página `/dev/tiempo` sirve para demo ante el Jefe: viajar +30d muestra mora/urgentes sin ensuciar datos.
