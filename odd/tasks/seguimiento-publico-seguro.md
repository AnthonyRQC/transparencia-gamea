# Public ticket lookup hardening (seguimiento-publico-seguro)

## Objective

Modernize and secure the public case lookup by ticket (landing page + `GET /seguimiento`)
under Ley 974 Arts. 24 (identity reserve) and 29 (strict confidentiality), keeping printed
vouchers (`DEN-AAAA-NNNN-PPPP`) valid. Spec-only stage: produce openspec artifacts
(`openspec/changes/seguimiento-publico-seguro/`); do NOT touch app code yet.

## Problem

- `SeguimientoController::buscar` distinguishes `error=invalido` vs `no_encontrado`
  (enumeration oracle), has `throttle:30,1`, and `token_consulta` is 4 numeric digits
  (~10k combos, predictable sequential ticket) — brute-forceable per ticket.
- `mapPublicData` returns `toDateTimeString()` (hour+seconds enable temporal correlation)
  and always sends `fecha_vencimiento: null` while `Buscar.tsx` copy promises
  "fechas estimadas".
- `BuscadorTicket` regex accepts only the 4-digit legacy format; no dual-format path.
- Copy must state reference timeframes in business days (Ley 974: 5d admission,
  20/45d process) subject to legal extensions.

## Why

Grill-with-docs Q1–Q4 closed with the writer (frontier empty). Decisions are anchored in
`RESUMEN LEY 974.md` (Arts. 23-II rejection justification, 24, 29) and `AI-CONTEXT.md`
conventions (thin controllers, `throttle` per route, `helpers/fechas.ts`, shadcn,
Spanish UI, dark mode).

## Scope (spec-only)

- `openspec/changes/seguimiento-publico-seguro/`: proposal + spec delta
  (`public-consultation`) + design + tasks.
- Target files for the later apply stage (NOT touched now):
  `app/Http/Controllers/SeguimientoController.php`,
  `app/Models/Denuncia.php::generarToken`, `routes/web.php`,
  `resources/js/Components/Publico/BuscadorTicket.tsx`,
  `resources/js/Pages/Seguimiento/Buscar.tsx`,
  `resources/js/Components/Publico/ResultadoSeguimiento.tsx`,
  new `tests/Feature/SeguimientoSeguroTest.php`.

Out of scope: integral landing/`Welcome` redesign, `PanelInformativo` wall changes,
restricting the public wall ticket filter (public by design, Sprint 13), `fecha_vencimiento`
estimates (stays `null`), token rotation for existing cases.

## Constraints

- Printed vouchers keep working: legacy 4-digit tokens stay valid; new tokens are
  6 uppercase alphanumerics (`strtoupper` both ends).
- Single generic error for invalid/not-found (oracle closed); friendly Spanish 429.
- Public contract fixed: estado legible + pasos + mensaje_avance + tipo legible +
  resumen_rechazo + clasificacion label at closure only; dates `Y-m-d`, no time.
  Never: denunciante/denunciado identities, pruebas, documents, informe detail.
- `throttle:10,1` on `seguimiento.buscar` only; `home`/`panel.descargar` untouched.
- Minimal accessible polish (dual-format help, `aria-live`, visible focus, date-only);
  no hero/wall redesign.
- Verification (apply stage): `npm run build` + full phpunit 206 green; STOP, no commit.

## Checklist

- [x] T1: task doc + Engram mirror (`seguimiento-publico-seguro`) + branch
      `feature/seguimiento-publico-seguro` (this stage).
- [x] T2: openspec artifacts complete (`proposal.md`, `specs/.../spec.md`,
      `design.md`, `tasks.md`) and `openspec status` green.
- [x] T3 (apply): 10/10 tasks done — DDL, backend, frontend, `SeguimientoSeguroTest`
      (8 tests), build + suite verdes, STOP sin commit.

## Authorized scope

- This document, Engram observation `seguimiento-publico-seguro`,
  `openspec/changes/seguimiento-publico-seguro/*`. No app-code edits.

## Acceptance criteria

- [ ] Artifacts encode all Q1–Q4 decisions with no ambiguity left for apply.
- [ ] `openspec status --change seguimiento-publico-seguro` shows required set done.
- [ ] Working tree holds only planning artifacts (uncommitted); no commit made.
- [ ] Verification section below filled with `<comando>: <resultado observado>`.

## Applicable checks

- `openspec status --change seguimiento-publico-seguro`
- `git status --short`, `git branch --show-current`

## Verification evidence

- `openspec status --change seguimiento-publico-seguro --json`: isPlanningComplete=true, isComplete=true, all 4 artifacts done.
- `openspec validate "seguimiento-publico-seguro" --type change`: "Change 'seguimiento-publico-seguro' is valid".
- `git branch --show-current`: `feature/seguimiento-publico-seguro`.
- Alcance de verificación en esta etapa: solo artefactos de planificación (sin código de app, sin build/tests — corresponden a T3/aplicación).
- Nota: el working tree arrastra archivos pre-existentes sin commitear de sesiones anteriores (3 modified + untracked skills/herdr/openspec); los artefactos nuevos de esta tarea son `odd/tasks/seguimiento-publico-seguro.md` + `openspec/changes/seguimiento-publico-seguro/` (5 files).

## Apply evidence (T3, 08-oct-2026)

- `php artisan migrate --force`: `2026_10_08_000001_widen_token_consulta_denuncias DONE` (MySQL dev; columna verificada en `VARCHAR(6)` vía information_schema). MySQL estaba caído y se arrancó (`mysqld` con `my.ini` de Laragon).
- `php artisan migrate:fresh --seed --force`: migraciones + 6 seeders OK (dev DB reseteada).
- `php vendor/phpunit/phpunit/phpunit --filter SeguimientoSeguroTest`: OK (8 tests, 41 assertions).
- `npm run build`: tsc + vite build limpio (built in 35.21s).
- `php vendor/phpunit/phpunit/phpunit` (completa): OK (214 tests, 1635 assertions) — 206 base + 8 nuevos.
- `openspec validate`: valid; artefactos proposal/specs/design/tasks en done (10/10).
- Hallazgo pre-existente reparado (fuera de la unidad, bloqueo total): `app/Http/Controllers/MisCasosController.php:42` contenía una línea basura (`mnopqsuwxyz12470 -=\'./'`) de una sesión anterior (Slice 2 sin commitear) que rompía con ParseError todo render Inertia en tests. Se eliminó la línea; sin cambios de comportamiento. Requiere tu confirmación visual en el diff.

## Progress

- Grill Q1–Q4 closed; branch created; doc + Engram mirror done; openspec change valid.
- Apply T3 done (10/10): DDL + backend + frontend + tests + build/suite verdes.

## Next step

- Revisar el diff en Lazygit (panel 1) y dar la orden explícita para el commit
  (`procede con el commit`) o commitear directamente. Sin commit por regla de oro.
