# Notas Reestructuración — Bloques 0-2 (Sept 2026) — Cierre

**Fecha:** 02-sep-2026
**Stack:** Laravel 13 / PHP 8.3.30 (tags `laravel-13: b91e404` + `refactor/bloque0+1: deb6b4c` + `refactor/bloque2: f3775e0`)
**Alcance:** Bloque 0 Fundación + Bloque 1 Dashboard pulido + Bloque 2 Denuncia split + Docs archivo

## Por qué
Proyecto de 11 sprints acumuló God Controller 1021L, 63 archivos planos en `Components/Denuncias`, `DiasHabiles` sin feriados (mostraba `10 habiles → 15 dias`), y `transparencia-proy/` con 39 archivos saturando contexto IA. Sin validación con Jefe hasta terminar todo, se decidió fundar primero para evitar doble trabajo en Sprint 12.

## Qué cambió

### Bloque 0 — Fundación transversal
- `app/Helpers/DiasHabiles.php` blindado: `lun-vie && !feriado`, cache global `feriados:fechas` 1h (TTL), `olvidarCache()` en `CatalogoController`, deduplica sáb/dom (feriado en sábado no descuenta doble), `día 1 = mañana` (Ley 2341), `Carbon::now('America/La_Paz')`, helpers `esHabil()`/`diasRestantes()`
- `.env:5` `APP_TIMEZONE=America/La_Paz` + `Denuncia.php:103` usa esa zona
- `config/plantilla_feriados.php` 14 refs neutra (7 fijos nacionales + 3 móviles + 16-jul dept La Paz + 06-mar mun El Alto) — solo guía, anticipa traslados `jue→vie` tipo `DS 5521` sin automático; banner no usado
- `app/Enums/{EstadoDenuncia,TipoDenuncia,EscenarioDenuncia,RolUsuario}.php` + `resources/js/constants/estados.ts` + `resources/js/types/denuncia.ts` + `resources/js/helpers/diasHabiles.ts`
- `app/Traits/UppercaseText.php` creado, `Helpers/UppercaseText` queda shim
- `CatalogoController.php:12` invalida cache al crear/desactivar/restaurar feriado; `ModalEditarItem.tsx:151` warning finde
- Tests `10 habiles desde mar 02-sep → mié 16-sep`, feriado lunes → 17-sep, feriado sábado → 16-sep (PASS)

### Bloque 1 — Sprint 12 pulido
- `DashboardController.php` 591→116L vía `DashboardRequest.php` (valida `tipo/estado` con Enums + fechas) + `Queries/Dashboard/{Kpi,Operativo,Resultados,Rendimiento}Query.php` + `DashboardQueryBase.php`
- `SolicitudController.php:42` y `DescargoController.php:71` usan `DiasHabiles::agregar()` base `fecha_envio`/`fecha_notificacion`, ampliaciones `DiasHabiles::agregar(dias, venc)`
- `SolicitudInformacion.php:28` y `Descargo.php:28` `getPlazoInfoAttribute()` hábil + `Bandeja/MisCasos` exponen, `SolicitudCard/DescargoCard/SolicitudeDetailModal/DescargoDetailModal` eliminan fallback `Math.ceil` natural
- `DenunciaMasivaSeeder.php:355/:392` usa `DiasHabiles`
- `ModalExportar.tsx:49` usa `route('reportes.preview')` y `route('reportes.exportar')` corrige 404 sin `/transparencia/public`, `.env APP_URL` → `192.168.1.9`, `ziggy.js` regenerado

### Bloque 2 — Denuncia split + Frontend
- `DenunciaController.php` 1021L → `Denuncia/{Denuncia(303),Admision(76),Asignacion(126),Investigacion(68),Informe(146),Cierre(189),Ampliacion(60),Delegacion(101),Reapertura(49)}` + `Requests/Denuncia/{Store,GuardarInforme,GuardarCierre}` + `routes/web.php:7` remapeado
- `Components/Denuncias` 63 planos → `Card/ (7)`, `Form/ (9)`, `Sheet/`, `Modales/{Admision(2),Flujo(7),Investigacion(8),InformeCierre(3),General(7)}`, `Tabs/ (4)`, `Solicitud/ (2)`, `Descargo/ (2)`, `Shared/ (8)` + barrels `DenunciaCard.tsx` etc. para compatibilidad hacia atrás; internos corregidos (`Sheet/DenunciaSheet → ../Card/`, `Tabs/TabSolicitudes → ../Solicitud/`, `Modales/Flujo → ../../Card`...)
- `77 tests` verdes, `npm run build` OK

### Docs — Archivo
- `transparencia-proy/archivo/sprints-cerrados/` 23 archivos (Sprint 1-10 + Notas 10/11/Reestruct BD) + `archivo/referencia/` 5 archivos (Prototipo/Resumen/Stack/Vistas/Preguntas) movidos vía `git mv`, banners históricos añadidos
- `AI-CONTEXT.md` actualizado: raíz 10 archivos, `archivo/` en NO LEER, arquitectura nueva, Sprint 12 base completada
- Este archivo nuevo como bitácora de cierre

## Próximos pasos
- Bloque 3 opcional: `web.php` split en `routes/denuncia.php` etc., `DesignSystem` behind `env(local)`, `archivar sprints` ya hecho
- Sprint 13 Tablero Público, 14 Tiempos entre Fases sobre base limpia

## Verificación
- `php artisan test` 77 passed, `npm run build` ✓, `10 habiles` cálculo PASS
