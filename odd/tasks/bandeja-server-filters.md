# Bandeja server-side filters with pagination (Slice 1)

## Objective

Give `Bandeja` (jefe de unidad, `GET /denuncias`) server-side filtering and server pagination, reusing the `ConsultarCasos` + `DashboardRequest` patterns. Slice 1 covers only Bandeja; `MisCasos` reuses the same backend in a later slice.

## Problem

`BandejaController@index` runs 4x `->get()` with no `where` and no pagination. `BandejaFiltros` filters 100% in client (`filterAndSort` over `ticket + denunciante.nombres`, `tipo`, `sortBy plazo/fecha/investigador`, `pageSize=10` slice). As the board grows, initial payload grows, search misses `hechos/denunciados/dependencia`, and there is no date range, multi-estado, categoria/clasificacion, escenario, or investigador filter.

## Why

`ConsultarCasosController` already implements 8-key server filtering (`busqueda`, `ticket` exact, multi-`estado`, `tipo/escenario`, `fecha_desde/hasta`, `investigador_id`) with `filters` echo + `router.get preserveState`. `DashboardRequest + DashboardQueryBase::denuncias()` already validate and apply `investigador/tipo/categoria/estado/clasificacion`. Reusing them keeps one filter contract instead of a third parallel implementation.

## Scope

Backend (new, Slice 1 only):
- `app/Http/Requests/DenunciaFilterRequest.php` — merge `DashboardRequest::filtros()` + 8 params from `ConsultaCasos` + `categoria_id/clasificacion_id/plazo`; rules for `search/ticket/estado[]/tipo/escenario/fecha_desde/fecha_hasta/investigador_id/categoria_id/clasificacion_id/plazo`.
- `app/Queries/Denuncia/DenunciaListQuery.php` — single query builder used by Bandeja (later MisCasos); `when()` filters, `paginate()` server-side, preserves current tab scoping (`porAsignar/enCurso/historial`).
- `app/Http/Controllers/BandejaController.php` — thin: accept FilterRequest, call query per tab (or one paginated query + tab counts), pass `filters` echo to Inertia.
- Feature test: `tests/Feature/Denuncia/BandejaFilterTest.php` — search, ticket exact, estado multi, dates, investigador, pagination shape.

Frontend (Slice 1 only):
- `resources/js/Pages/Denuncias/bandeja/useDenunciaFilters.ts` (new) — unifies `FiltrosBandeja + sortItems`, adds `fecha_desde/hasta`, `categoria_id`, `estado` multi, `plazo`; resets `pagina` on change.
- `resources/js/Components/Denuncias/Shared/FiltrosDenuncia.tsx` (new, or extend `BandejaFiltros.tsx`) — collapsible panel in `ConsultarCasos` style + chips/Sheet in `FiltrosDashboard` style; `aplicarFiltros` via `router.get(route('denuncias.bandeja'), params, {preserveState:true})` + `restablecer`.
- `resources/js/Pages/Denuncias/Bandeja.tsx` + `bandeja/BandejaFiltros.tsx` + `bandeja/BandejaLista.tsx` — consume server `filters` prop as init, drop client `filterAndSort+slice` for server fields (keep client `sortBy plazo` as display sort until plazo-SQL is decided).

Out of scope: `MisCasos`, `MiResumen`, plazo-SQL filtering (only display sort), `SelectItem value=" "` fix (opportunistic only if touched), SDD artifacts, auditoria.

## Constraints

- No new filter vocabulary: reuse `types/denuncia.ts`, `constants/estados.ts`, `helpers/fechas.ts`, `presetsFecha.ts`, `Shared/{Paginacion,TabsDenuncias,ListaVacia}`, `Card/{DenunciaCard,PlazoBadge,TipoDenunciaBadge}`.
- Uppercase convention stays (`UppercaseText` backend, `uppercase` frontend); `busqueda` normalized with `mb_strtoupper` like `ConsultaCasos`.
- `plazo` stays display-only in Slice 1 (computed in PHP `$d->plazo`); no `where` on accessor. If a `plazo=vencidos/por-vencer` param ships, it must be documented as post-filter on the paginated set, not SQL.
- Inertia contract: `filters` echo back, `preserveState:true`, `preserveScroll:true` on filter change; `destacar` query param keeps working.
- Paginated response shape must keep `porAsignar/enCurso/historial` tab counts working (counts via separate `count()` or query clone, not by paginating each tab independently unless agreed with writer).

## Checklist

- [x] T1: feature doc created and mirrored in Engram before the first source write; branch created.
- [x] T2: backend FilterRequest + DenunciaListQuery + BandejaController paginate + `BandejaFilterTest` green (delegated writer).
- [x] T3: frontend useDenunciaFilters + BandejaFiltros extendido + Bandeja integration with preserveState + chips/reset (delegated writer).
- [x] T4: `npm run build` clean + full phpunit 199 green + evidence commit with SHA/diff-stat; doc closed.

## Authorized scope

- This document, new backend `Requests/DenunciaFilterRequest.php`, `Queries/Denuncia/DenunciaListQuery.php`, modified `BandejaController.php`, new test `BandejaFilterTest.php`, new frontend `useDenunciaFilters.ts` + `FiltrosDenuncia.tsx`, modified `Bandeja.tsx` + `bandeja/BandejaFiltros.tsx` + `bandeja/BandejaLista.tsx`.

## Acceptance criteria

- [x] Bandeja filters hit the server (network shows query params, response is paginated, no full `get()` of all cases).
- [x] Search covers `ticket/hechos/denunciante/denunciados/dependencia`; `ticket` exact still works; multi-`estado`, dates, `investigador_id`, `categoria_id` work.
- [x] `npm run build` passes clean.
- [x] Full phpunit suite passes (199 tests green: 191 base + 8 new).
- [x] `git status --short` clean after evidence commit (only pre-existing unrelated files excluded); SHA + `diff --stat` recorded below.

## Applicable checks

- `npm run build`
- `C:\laragon\bin\php\php-8.3.30-Win32-vs16-x64\php.exe vendor/phpunit/phpunit/phpunit` (full suite; focused ` --filter BandejaFilterTest` before commit)
- `git status --short`, `git diff --stat`, `git log --oneline -5`

## Route declaration

- T1 inline (mechanical doc, no research, 1 file).
- T2+T3 delegated direct writer (Writer trigger: 2+ non-trivial files; Preparation trigger: reading prepares the write). Single bounded writer, no parallel writers in one worktree.
- T4 parent spot-check (re-run one reported command before delivery).
- TDD resolved: off (no strict_tdd flag in project/session config; phpunit exists but strict mode not enabled). Source: project default. Runner: `C:\laragon\bin\php\php-8.3.30-Win32-vs16-x64\php.exe vendor/phpunit/phpunit/phpunit`. Ordinary functional checks apply, not no checks.
- Delivery strategy: `ask-on-risk` (default). Forecast ~300-450 authored lines (backend ~150 + frontend ~200 + test ~100). If forecast or running count exceeds ~400, apply strategy before next commit (ask once for chain strategy). Skill `work-unit-commits` applies; `chained-pr` only if split is chosen.

## Verification evidence

- Partial (writer, Slice 1, sin commit — el commit de evidencia lo hace el padre en T4):
  - `npm run build`: compilación limpia (tsc + vite build, 4604 módulos, built in ~38s).
  - `php vendor/phpunit/phpunit/phpunit --filter BandejaFilterTest`: OK (8 tests, 113 assertions).
  - `php vendor/phpunit/phpunit/phpunit` (completa): OK (199 tests, 1482 assertions).
- Decisiones del writer: se extendió `bandeja/BandejaFiltros.tsx` en lugar de crear `Shared/FiltrosDenuncia.tsx` (sin duplicar); el paginador Inertia serializa en forma plana (`denuncias.data/total/current_page/last_page`, sin wrapper `meta`); `AvisoCasoTest::test_bandeja_expone_avisos_por_ticket` ahora pide `?tab=historial` (contrato nuevo: una sola página del tab activo por respuesta).
- Final (padre, T4 spot-check sobre `feature/bandeja-server-filters`):
  - `& "C:\laragon\bin\php\php-8.3.30-Win32-vs16-x64\php.exe" vendor/phpunit/phpunit/phpunit --filter BandejaFilterTest`: OK (8 tests, 113 assertions, 00:00.916).
  - `& "C:\laragon\bin\php\php-8.3.30-Win32-vs16-x64\php.exe" vendor/phpunit/phpunit/phpunit`: OK (199 tests, 1482 assertions, 00:08.032).
  - `npm run build`: passed (tsc + vite build, 4604 modules transformed, built in 6.78s).
  - Commits:
    - `481f4c7` `feat(bandeja): filtrado en servidor y paginado backend` — 5 files, +529/-48 (Requests, Queries, Controller, BandejaFilterTest, AvisoCasoTest).
    - `2fd63e6` `feat(bandeja): filtros avanzados y paginacion servidor en UI` — 6 files, +569/-166 (Bandeja.tsx, BandejaFiltros, BandejaLista, helpers, tipos, useDenunciaFilters).
  - `git diff --stat docs/readme-refresh...HEAD -- .` (11 files, +1098/-214):
    - `app/Http/Controllers/BandejaController.php` | 124 +++++---
    - `app/Http/Requests/DenunciaFilterRequest.php` | 82 ++++++
    - `app/Queries/Denuncia/DenunciaListQuery.php` | 127 +++++++++
    - `resources/js/Pages/Denuncias/Bandeja.tsx` | 95 ++++---
    - `resources/js/Pages/Denuncias/bandeja/BandejaFiltros.tsx` | 315 ++++++++++++++++++---
    - `resources/js/Pages/Denuncias/bandeja/BandejaLista.tsx` | 99 +++----
    - `resources/js/Pages/Denuncias/bandeja/helpers.ts` | 27 +-
    - `resources/js/Pages/Denuncias/bandeja/tipos.ts` | 44 ++-
    - `resources/js/Pages/Denuncias/bandeja/useDenunciaFilters.ts` | 155 ++++++++++
    - `tests/Feature/AvisoCasoTest.php` | 4 +-
    - `tests/Feature/Denuncia/BandejaFilterTest.php` | 240 ++++++++++++++++
  - Advisory 400-line note: el slice supera el heurístico por ser backend+frontend+tests en una unidad revisable mínima (11 files, +1098/-214); sin rework cosmético, sin borrar espacios/comentarios, sin omitir tests. Aceptado explícitamente como dos work-units + evidencia.
  - Excluidos del commit (pre-existentes, no del slice): `M transparencia-proy/pre-defensa/05-Matriz-Perfil-Transparencia.md`, `?? odd/tasks/herdr-*` (5 files).

## Progress

- T1 done (doc + Engram mirror + branch `feature/bandeja-server-filters`).
- T2+T3 done por writer único (dos work-unit commits).
- T4 done (spot-check padre + evidencia + cierre).

## Next step

- Slice 2 (MisCasos reutilizando `DenunciaListQuery`) queda pendiente para la siguiente sesión; esta tarea está cerrada.
