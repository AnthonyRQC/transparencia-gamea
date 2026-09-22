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
- [ ] Stub removed; `grep esFeriadoEnFinDeSemana` = 0 in `app/`.
- [ ] `plazoInfo()` is the only assembly point; 3 accessors delegate; overdue-weekend edge returns -1/red with test.
- [ ] `PlazoInfo` single source; no inline re-declarations left.
- [ ] MisCasos page < ~350L, subcomponents under `mis-casos/`, tsc+build green.
- [ ] AI-CONTEXT shim claim fixed.
- [ ] Suite + tsc + build green; one commit per unit with SHA recorded.

## Applicable checks
- `php artisan test` full; focused `--filter="DiasHabiles|Plazo|DashboardPlazosSql|DenunciaFlow"`; `npm run build` (tsc+vite).

## Route declaration
- Delegated-direct: writer for 4 code units; parent closes.

## Tasks
- [ ] U1 — Cleanups B1+B3+B4.
- [ ] U2 — B2 `plazoInfo()` + fix + tests.
- [ ] U3 — F2 shared `PlazoInfo`.
- [ ] U4 — F1 MisCasos split.
- [ ] U5 — Verification + parent close.

## Progress
- 2026-09-22: doc created on branch `refactor/plazo-domain-limpieza` (from main@039e8b0); inventory verified by parent.

## Verification evidence
- (pending)

## Next step
- Launch writer U1–U4; parent closes with suite evidence.
