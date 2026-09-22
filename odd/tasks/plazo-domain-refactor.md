# Feature: Plazo Domain Refactor + Cleanups (B1–B4, F1–F2)

## Objective
Close the remaining duplication and dead code found in the 22-sep-2026 inventory: unify the three plazo accessors, unify the frontend `PlazoInfo` type, remove the dead `esFeriadoEnFinDeSemana` stub, fix one raw-string comparison, fix stale AI-CONTEXT claim, and split `MisCasos.tsx` (603L) following the Bandeja precedent — without breaking functionality.

## Problem (verified inventory)
- **B2**: `Denuncia::getPlazoAttribute` (`Denuncia.php:100-131`), `SolicitudInformacion::getPlazoInfoAttribute` (`:75-90`) and `Descargo::getPlazoInfoAttribute` (`:78-93`) assemble the same shape (días → color → texto → fecha) three times. Denuncia adds an overdue fallback (`0 → -1`) that the other two lack: a case overdue across a weekend shows "Vence hoy" (yellow) instead of overdue (red). Accessor naming (`plazo` vs `plazo_info`) stays as-is (renaming touches many frontend consumers; documented out of scope).
- **F2**: `plazo_info` inline type re-declared in ~8-10 components instead of importing `PlazoInfo` from `types/denuncia.ts:17`.
- **B1**: `DiasHabiles::esFeriadoEnFinDeSemana` (`:60`) has ZERO consumers; the anti-double-count protection is structural (weekend check first, then feriado, in `agregar()` and `transcurridos()`), documented in the class docblock. Safe to remove (user approved; keep docblock comment as the record).
- **B3**: `DenunciaController.php:33` compares `$request->escenario !== 'anonimo'` with a raw string.
- **B4**: `AI-CONTEXT.md:152` claims a `UppercaseText` shim exists in `app/Helpers/` — `app/Helpers/` only has `DiasHabiles.php` + `RollUpDependencias.php`.
- **F1**: `MisCasos.tsx` = 603L (largest page; Bandeja precedent = 453L + `bandeja/` subcomponents).

## Scope
- IN U1: B1 remove stub + B3 enum value + B4 AI-CONTEXT fix.
- IN U2: B2 extract `DiasHabiles::plazoInfo(Carbon $vencimiento, ?Carbon $desde = null, bool $femenino = false): array` returning `dias_restantes, color, texto, fecha_vencimiento`; all three accessors use it. Include the overdue `0 → -1` fallback for ALL (intentional fix for solicitud/descargo weekend edge; denuncia behavior unchanged). Tests: boundaries + overdue-weekend edge.
- IN U3: F2 unify to shared `PlazoInfo` type (ensure it covers `texto` optional + `color` union; keep component-local interfaces only if they genuinely differ).
- IN U4: F1 split `MisCasos.tsx` into `Pages/Denuncias/mis-casos/` subcomponents (pure extraction, no behavior change), page < ~350L.
- OUT: renaming `plazo`/`plazo_info` accessors or payload keys (except additive `texto` on denuncia if the helper makes it natural — verify no test asserts exact array shape); no visual redesign; no permission/state changes.

## Constraints
- Non-destructive: full suite green; `tsc` + `npm run build` green; F1 is a pure move (no logic edits).
- PHP: `C:\laragon\bin\php\php-8.3.30-Win32-vs16-x64\php.exe`. Conventional Commits, no Co-Authored-By, one commit per unit.
- If a test asserts exact plazo array shape and adding `texto` breaks it, keep denuncia's payload unchanged (unset texto) and report.

## Authorized scope
- Write: `app/Helpers/DiasHabiles.php`, `app/Models/{Denuncia,SolicitudInformacion,Descargo}.php`, `app/Http/Controllers/Denuncia/DenunciaController.php`, `resources/js/types/denuncia.ts`, `resources/js/Pages/Denuncias/MisCasos.tsx` (+ new `mis-casos/` files), the ~8-10 components with inline `plazo_info` types, `transparencia-proy/AI-CONTEXT.md`, `tests/**`, this doc.
- Forbidden: push/merge; accessor renames; visual changes.

## Acceptance criteria
- [x] Stub removed; `grep esFeriadoEnFinDeSemana` = 0 in `app/`.
- [x] `plazoInfo()` is the only assembly point; 3 accessors delegate; overdue-weekend edge returns -1/red with test.
- [x] `PlazoInfo` single source; no inline re-declarations left.
- [x] MisCasos page < ~350L (241L), subcomponents under `mis-casos/`, tsc+build green.
- [x] AI-CONTEXT shim claim fixed.
- [x] Suite + tsc + build green; one commit per unit with SHA recorded.

## Applicable checks
- `php artisan test` full; focused `--filter="DiasHabiles|Plazo|DashboardPlazosSql|DenunciaFlow"`; `npm run build` (tsc+vite).

## Route declaration
- Delegated-direct: writer for 4 code units; parent closes.

## Tasks
- [x] U1 — Cleanups B1+B3+B4.
- [x] U2 — B2 `plazoInfo()` + fix + tests.
- [x] U3 — F2 shared `PlazoInfo`.
- [x] U4 — F1 MisCasos split.
- [ ] U5 — Verification + parent close (verification ejecutada por el writer; falta el cierre del parent).

## Progress
- 2026-09-22: doc created on branch `refactor/plazo-domain-limpieza` (from main@039e8b0); inventory verified by parent.
- 2026-09-22: U1–U4 implementados y commiteados (5 commits, ver evidencia). Suite y build verdes al cierre del writer.

## Verification evidence
- Baseline (antes de U1): `php artisan test` → 187 passed (1325 assertions); `npm run build` → OK.
- U1 `62396bf` — `chore(limpieza): quitar stub redundante y unificar comparacion de escenario`
  - Files: `app/Helpers/DiasHabiles.php`, `app/Http/Controllers/Denuncia/DenunciaController.php` (2 files, +5/−7).
  - `php -l` ambos: sin errores. `grep esFeriadoEnFinDeSemana` en `app/`: 0 coincidencias.
  - `php artisan test --filter="DiasHabiles|Plazo|DashboardPlazosSql|DenunciaFlow"` → 12 passed (125 assertions).
  - Rollback: restaurar el stub y la comparación literal; aislado de U2–U4.
- U1b `a43e679` — `docs(contexto): corregir referencia a shim inexistente`
  - Files: `transparencia-proy/AI-CONTEXT.md` (1 file, +1/−1).
  - Verificación: lectura directa del diff + `app/Helpers/` solo contiene `DiasHabiles.php` y `RollUpDependencias.php`.
- U2 `2dd43d3` — `refactor(plazos): unificar accessores en DiasHabiles::plazoInfo`
  - Files: `app/Helpers/DiasHabiles.php`, `app/Models/{Denuncia,SolicitudInformacion,Descargo}.php`, `tests/Unit/DiasHabilesTest.php` (5 files, +132/−43).
  - `php -l` en los 5 archivos: sin errores.
  - `php artisan test --filter="DiasHabiles|Plazo|DashboardPlazosSql|DenunciaFlow"` → 16 passed (169 assertions); 4 tests nuevos: límites color/texto, vencido en fin de semana, femenino+feriados, estructura/formato de fecha.
  - Edge intencional verificado: vencido vie 18-09 consultado sáb 19-09 → `-1`/`red`/"Vencido hace 1 día hábil" (antes "Vence hoy" amarillo en solicitud/descargo).
  - Denuncia: sin cambios de comportamiento; `texto` agregado aditivo (ningún test afirma la forma exacta del array, no hizo falta `unset`).
  - Rollback: restaurar los 3 accessores y borrar `plazoInfo()`/tests; aislado de U1/U3/U4.
- U3 `72238f0` — `refactor(types): unificar PlazoInfo en types/denuncia.ts`
  - Files: 16 (`types/denuncia.ts` + 15 consumidores), +31/−50.
  - `npx tsc --noEmit` → sin errores. `grep "interface PlazoInfo|PlazoInfoResult|plazo_info?: {"` en `resources/js` → solo la declaración compartida.
  - Rollback: restaurar tipos inline; sin impacto en runtime (solo tipos).
- U4 `1fb7a06` — `refactor(mis-casos): dividir pagina en subcomponentes`
  - Files: `MisCasos.tsx` (639→241L) + 5 nuevos en `mis-casos/` (6 files, +673/−472): `tipos.ts` 106L, `helpers.ts` 30L, `MisCasosLista.tsx` 198L, `MisCasosModales.tsx` 146L, `MisCasosSheet.tsx` 114L.
  - `npx tsc --noEmit` sin errores; `npm run build` OK.
  - Auditoría de pureza (todas las líneas del original presentes en el nuevo conjunto salvo): imports reubicados + 2 imports muertos eliminados (`Search`, `CircleArrowRight`), renames de borde (`handleIniciar→onIniciar`, `handleToggleArchivar→onToggleArchivar`, `selectedDenuncia→denuncia` en Sheet), firmas movidas (`sortItems`, `countPendientes`, `isNewHours`) y `export` agregado a constantes.
  - Rollback: eliminar `mis-casos/` y restaurar la página monolítica; no toca otros archivos.
- Cierre (rama completa, HEAD 1fb7a06): `php artisan test` → 191 passed (1369 assertions); `npm run build` → OK (tsc + vite, 7.02s). Diff vs `main`: 29 files, +898/−571.

### Desviaciones
- `plazoInfo()` recibió un 4º parámetro opcional `?array $feriadosSet = null` para inyectar feriados en tests sin BD/cache, consistente con `esHabil/agregar/transcurridos/diasRestantes`. Los accessores lo llaman con ≤3 argumentos; la firma mandatada no cambia.
- `PlazoInfo` conserva `'gray'` en la unión de `color` (contrato preexistente en `types/denuncia.ts`, superset del mínimo; encogerlo no aportaba y arriesgaba fricción de tipos).
- `TablaCasosUrgentes.tsx` no tenía re-declaración inline: usa `Urgente` de `types/dashboard` (`camelCase`, `color: string`); se dejó intacto.
- `PlazoProgress.tsx` conserva `PlazoProgressProps` local (props parciales descompuestas + `maxDias`); el spread desde `PlazoInfo` compila.
- `handleInvestigadorChange` en `MisCasos.tsx` sigue sin consumidores (código muerto preexistente); se preservó para no cambiar comportamiento.

## Next step
- Parent cierra U5 con la evidencia anterior (suite 191/1369, build OK) y decide si la rama pasa a revisión.

