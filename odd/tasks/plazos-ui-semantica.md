# Feature: Plazos UI — Unified Thresholds, Explicit Business Days, Visible Due Date

## Objective
Make the deadline UI trustworthy and consistent: one color-threshold source (red ≤3 / yellow ≤8), explicit "días hábiles" copy everywhere, visible estimated due date for investigators, and fix the left stripe so yellow/green render (root cause: Tailwind scans only `.tsx`, so `semantica.ts` classes never compile).

## Problem (verified 22-sep-2026)
1. **Stripe bug (build)**: `tailwind.config.js:12` content = `./resources/js/**/*.tsx` only. Classes defined only in `.ts` files are never generated. Proof in built CSS (`public/build/assets/app-XC46r7k.css`): `border-l-yellow-500` absent, `border-l-teal-600` absent, `border-l-destructive` present (survives only because `DesignSystem.tsx:339` uses it literally). Hence red stripes render, yellow/green never do.
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
- [ ] Built CSS contains `border-l-yellow-500`, `dark:border-l-yellow-400`, `border-l-teal-600`, `dark:border-l-teal-400` (evidence: grep on `public/build/assets/*.css`).
- [ ] `colorPlazo` is the only color-threshold source in models; boundary test (≤3 red incl. 0/-1, 4–8 yellow, ≥9 green).
- [ ] Badge/tooltip/helpers/backend textos say "días hábiles" (singular-aware).
- [ ] Card shows due date when yellow/red; Sheet shows estimated date with ampliaciones caveat.
- [ ] Suite + build + tsc green; each unit its own commit with SHA recorded here.

## Applicable checks
- `npm run build` (tsc+vite) + grep CSS evidence; `php artisan test` full; focused `--filter="DiasHabiles|Plazo|DashboardPlazosSql|DenunciaFlow"` (writer adapts to real test names).

## Route declaration
- Delegated-direct: mapping trigger (7+ files) already satisfied by parent exploration; writer trigger for 4 code units. No SDD.

## Tasks
- [ ] U1 — Tailwind `.ts` glob fix + CSS verification.
- [ ] U2 — `colorPlazo` single source + textos + boundary test.
- [ ] U3 — Frontend copy (badge/tooltip/helpers/PlazoProgress).
- [ ] U4 — Visible estimated date (card + sheet).
- [ ] U5 — Verification + close (parent: ADR D28 + feature doc).

## Progress
- 2026-09-22: doc created on branch `fix/plazos-ui-semantica` (from main@f6afd90); root cause + threshold inventory verified by parent.

## Verification evidence
- (pending)

## Next step
- Launch writer for U1–U4; parent closes with ADR D28 + suite evidence.
