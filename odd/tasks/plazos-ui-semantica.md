# Feature: Plazos UI — Unified Thresholds, Explicit Business Days, Visible Due Date

## Objective
Make the deadline UI trustworthy and consistent: one color-threshold source (red ≤3 / yellow ≤8), explicit "días hábiles" copy everywhere, visible estimated due date for investigators, and fix the left stripe so yellow/green render (root cause: Tailwind scans only `.tsx`, so `semantica.ts` classes never compile).

## Problem (verified 22-sep-2026)
1. **Stripe bug (build)**: `tailwind.config.js:12` content = `./resources/js/**/*.tsx` only. Classes defined only in `.ts` files are never generated. Proof in built CSS (`public/build/assets/app-XC46r7Jk.css`): `border-l-yellow-500` absent, `border-l-teal-600` absent, `border-l-destructive` present (survives only because `DesignSystem.tsx:339` uses it literally). Hence red stripes render, yellow/green never do. Writer audit found a 5th real missing class: `dark:border-l-destructive` (same root cause).
2. **Threshold drift**: `Denuncia.php:118-123` red ≤3 / yellow ≤8; `SolicitudInformacion.php:82` and `Descargo.php:85` red <0 / yellow ≤5. Three copies, two scales.
3. **Copy ambiguity**: badge says "45 d en plazo" (`PlazoBadge.tsx:37`), tooltip "Queran 45 días" without "hábiles" (`:54-56`), `formatearDiasPlazo` "En 45 días" (`fechas.ts:50-59`), backend `texto` "Vence en 10d" (`Descargo.php:86`). Elsewhere the app already says "días hábiles" (modales, Welcome) — inconsistent.
4. **Due date hidden**: `plazo_info.fecha_vencimiento` exists (`Denuncia.php:129`) but for investigators it only shows in the card tooltip. Public tracking, solicitud detail and descargo cards already show it.

## Why
User review (screenshot): yellow/green stripes missing; asked to standardize thresholds, adopt explicit "días hábiles", and surface the estimated end date. Pre-defense quality item.

## Scope
- IN U1: `tailwind.config.js` content globs → `'./resources/js/**/*.{ts,tsx}'`; verify built CSS now contains the 4 missing border classes; report any other `.ts`-only class that was missing (`semantica.ts`, `bandeja/tipos.ts`).
- IN U2: single backend source `DiasHabiles::colorPlazo(int $dias): string` with `UMBRAL_ROJO=3`, `UMBRAL_AMARILLO=8` (≤3 red incl. vencidos; ≤8 yellow; else green). Use in `Denuncia::getPlazoAttribute`, `SolicitudInformacion::getPlazoInfoAttribute`, `Descargo::getPlazoInfoAttribute`. Update `texto` strings to "días hábiles" (singular-aware).
- IN U3: frontend copy — `PlazoBadge` (badge + tooltip), `formatearDiasPlazo` (`helpers/fechas.ts`), `PlazoProgress` (format date with helper instead of raw ISO).
- IN U4: visible estimated date — `DenunciaCard` inline "Vence el {fecha}" only when color yellow/red ("Venció el {fecha}" when overdue); `DenunciaSheet` line "Vencimiento estimado (sin nuevas ampliaciones): {fecha}".
- IN U5: verification (build + suite + focused test for `colorPlazo` boundaries).
- OUT: `KpiQuery.php:32` (≤5 "por vencer" KPI) stays — it is a labeled business metric ("Vencen en 5 días o menos"), not a color threshold. `AlertasPlazo` stays — user-configurable notification thresholds (0–10 prefs), different feature. No permission/state-machine changes. No other UI redesign.
- OUT: `PLAZO_BORDE.yellow` switches `yellow-500` → `amber-500` to match the badge palette (user approved color alignment).

## Constraints
- Non-destructive: suite green; threshold change for solicitud/descargo is intentional and must be reflected in any asserting test.
- `npm run build` = `tsc && vite build` (covers tsc). PHP: `C:\laragon\bin\php\php-8.3.30-Win32-vs16-x64\php.exe`.
- Conventional Commits, no Co-Authored-By, one work-unit commit per unit.
- Badge copy (singular-aware): >0 "Quedan N días hábiles" / "Queda 1 día hábil"; =0 "Vence hoy"; <0 "Vencido hace N días hábiles". Tooltip: "Vence el {fecha larga} — Quedan N días hábiles"; overdue: "Venció el {fecha larga} — Vencido hace N días hábiles". Keep color dot.

## Authorized scope
- Read/write: `tailwind.config.js`, `app/Helpers/DiasHabiles.php`, `app/Models/{Denuncia,SolicitudInformacion,Descargo}.php`, `resources/js/Components/Denuncias/{Card/PlazoBadge,Card/DenunciaCard,Card/PlazoProgress,Sheet/DenunciaSheet,Shared/semantica}.tsx|ts`, `resources/js/helpers/fechas.ts`, `tests/**`, `odd/tasks/plazos-ui-semantica.md`.
- Forbidden: push/merge; permission matrices; migrations; other pages.

## Acceptance criteria
- [x] Built CSS contains `border-l-yellow-500`, `dark:border-l-yellow-400`, `border-l-teal-600`, `dark:border-l-teal-400` — verified at U1 boundary (`aa1a324`): all 4 True. NOTE: U3 replaced yellow→amber by scope, so final CSS proves the same `.ts`-scanning fix via `border-l-teal-600`, `dark:border-l-teal-400`, `border-l-amber-500`, `dark:border-l-amber-400` (all True).
- [x] `colorPlazo` is the only color-threshold source in models; boundary test (≤3 red incl. 0/-1, 4–8 yellow, ≥9 green) — `tests/Unit/DiasHabilesTest.php`, 12 assertions.
- [x] Badge/tooltip/helpers/backend textos say "días hábiles" (singular-aware).
- [x] Card shows due date when yellow/red; Sheet shows estimated date with ampliaciones caveat.
- [x] Suite + build + tsc green; each unit its own commit with SHA recorded here.

## Applicable checks
- `npm run build` (tsc+vite) + grep CSS evidence; `php artisan test` full; focused `--filter="DiasHabiles|Plazo|DashboardPlazosSql|DenunciaFlow"` (writer adapts to real test names).

## Route declaration
- Delegated-direct: mapping trigger (7+ files) already satisfied by parent exploration; writer trigger for 4 code units. No SDD.

## Tasks
- [x] U1 — Tailwind `.ts` glob fix + CSS verification (`aa1a324`).
- [x] U2 — `colorPlazo` single source + textos + boundary test (`37403d0`).
- [x] U3 — Frontend copy (badge/tooltip/helpers/PlazoProgress) (`7a29c94`).
- [x] U4 — Visible estimated date (card + sheet) (`b81cfcc`).
- [x] U5 — Verification (build + suite + boundary test); ADR D28 y cierre del feature doc (padre).

## Progress
- 2026-09-22: doc created on branch `fix/plazos-ui-semantica` (from main@f6afd90); root cause + threshold inventory verified by parent.
- 2026-09-22: writer implemented U1–U4 as four work-unit commits; full verification run once with all units in place. `transparencia-proy/pre-defensa/01-Examinacion-Sistema.md` had a pre-existing unstaged modification and was deliberately left untouched/unstaged.

## Verification evidence
- SHAs: `aa1a324` fix(tailwind): escanear archivos .ts para compilar semantica | `37403d0` refactor(plazos): unificar umbrales de color y textos en dias habiles | `7a29c94` fix(plazos): textos explicitos en dias habiles | `b81cfcc` feat(plazos): mostrar vencimiento estimado en tarjeta y ficha.
- U1 BEFORE (old `public/build/assets/app-XC46r7Jk.css`, 101,585 B): grep `border-l-yellow-500` = False, `border-l-teal-600` = False, `border-l-destructive` = True. Token audit (temp script, string literals of `semantica.ts` + `bandeja/tipos.ts`): semantica 39/44 present, missing = `border-l-teal-600`, `border-l-yellow-500`, `dark:border-l-destructive`, `dark:border-l-teal-400`, `dark:border-l-yellow-400`; tipos 15/16 (only false positive `lucide-react`, an import path, not a class).
- U1 AFTER: `npm run build` → tsc OK, vite OK; new `app-B4i0hxM1.css` (102,185 B): all 4 target classes True + extra `dark:border-l-destructive` True; audit semantica 44/44 present, tipos 15/16 (`lucide-react` only).
- U2 focused: `php artisan test --filter="DiasHabiles"` → PASS, 2 passed (12 assertions). Full: `php artisan test` → 187 passed (1325 assertions), 25.80s. No test asserted the old solicitud/descargo 0/5 scale, so none required updating.
- U3 build: `npm run build` → OK; CSS `app-t6cTY7-v.css` (102,184 B): `border-l-amber-500`, `dark:border-l-amber-400`, `border-l-teal-600`, `dark:border-l-teal-400` all True; `border-l-yellow-500`/`dark:border-l-yellow-400` now absent BY DESIGN (U3 replaced them; grep confirmed no remaining `border-l-yellow` reference). Runtime harness (Node 24 `--experimental-strip-types`): `formatearDiasPlazo(-2/-1/0/1/2/12)` → "Vencido hace 2 días hábiles" / "Vencido ayer" / "Vence hoy" / "Vence mañana" / "En 2 días hábiles" / "En 12 días hábiles" (short: "Vencido (2 d hábiles)", "2 d hábiles").
- U4 build: `npm run build` → OK; bundle grep: `ClasificacionBadge-*.js` holds PlazoBadge copy (`Queda 1 día hábil`, `Venció el`, `hoy es el último día`), `DenunciaCard-*.js` holds `Vence el`/`Venció el`, `DenunciaSheet-*.js` holds `Vencimiento estimado`.
- FINAL (all units in place): `npm run build` → `✓ built in 8.53s`, CSS `app-t6cTY7-v.css`; audit semantica 44/44 + tipos 15/16 (`lucide-react` false positive); `php artisan test` → 187 passed (1325 assertions), 8.06s.
- Padre (spot-check, 22-sep-2026): suite completa re-ejecutada → **187 passed (1325 assertions)**; `PlazoBadge` con textos singular-aware ("Queda 1 día hábil" / "Quedan N días hábiles" / "Venció el …"); `DiasHabiles::colorPlazo` con umbrales `UMBRAL_ROJO=3` / `UMBRAL_AMARILLO=8` y docblock de fuente única.
- ADR: `transparencia-proy/decisiones/D28-plazos-ui-unificados.md` + fila en `Indice.md`.
- Deviations: (1) backend `texto` for solicitud keeps feminine "Vencida hace N días hábiles" for grammar agreement (descargo stays "Vencido…"); (2) beyond the 4 listed classes the audit found `dark:border-l-destructive` missing pre-fix, now compiled; (3) U3's amber swap makes the literal yellow classes vanish from the final CSS, so the U1 acceptance criterion is evidenced at the U1 commit boundary plus equivalent `.ts`-only classes in the final state.

## Next step
- Rama `fix/plazos-ui-semantica` lista para merge/push cuando el usuario lo ordene (no mergeada a main).
- Revisión visual sugerida: abrir MisCasos y confirmar franjas amarilla/verde visibles y fecha en tarjetas amarillas/rojas; la ficha del caso muestra "Vencimiento estimado (sin nuevas ampliaciones)".
