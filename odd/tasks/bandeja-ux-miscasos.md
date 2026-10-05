# Bandeja UX labels + investigador visible + MisCasos server filters (Slice 2)

## Objective

Three UX fixes in Bandeja plus server-side filtering for `/mis-casos`, reusing the Slice 1 `DenunciaListQuery` backend.

## Problem

1. The two top-bar dropdowns have no labels: users cannot tell that `Todos` filters by `tipo` (todos/corrupcion/negacion) and `Plazo` only sorts the current page (`plazo` = dias_restantes asc, `fecha` = created_at desc, `investigador` = alphabetical). Sort semantics confirmed in `bandeja/helpers.ts sortItems` (plazo default, except `por-admitir` tab which forces fecha).
2. `DenunciaCard` already renders `Asignado a:` + avatar when `investigadores[denuncia.investigador]` resolves, but assigned cases (e.g. DEN-2026-0050, estado asignada) show no investigador. Suspected payload-shape mismatch: `sortItems` handles `investigador` as object OR string id, while the card only does a string-key map lookup — an object payload (or a key-type mismatch) silently hides the row.
3. The case details sheet does not surface the current investigador either.
4. `/mis-casos` (investigador) still filters 100% in client (`sortItems` only, no search at all) with `MisCasosController` ignoring every query param.

## Why

Labels remove the ambiguity without changing filter vocabulary. The investigador is already fetched (`investigadores` map reaches `BandejaLista`, `DenunciaSheet`, `BandejaModales`, `MisCasosLista`) — showing it is a lookup fix, not new data fetching. MisCasos reuses the exact Slice 1 backend (`DenunciaFilterRequest` + `DenunciaListQuery`), scoping by `investigador_id = Auth::id()`.

## Scope

Writer 1 (frontend, Bandeja):
- `bandeja/BandejaFiltros.tsx` — visible labels above (or sr + tiny caps above) the `Tipo` and `Ordenar` selects; clearer option labels keeping stable values (`plazo` -> e.g. `Plazo (por vencer)`, `fecha` -> `Más recientes`, `investigador` -> `Investigador A–Z`). Values must NOT change (hook + tests depend on them).
- `Components/Denuncias/Card/DenunciaCard.tsx` — first inspect the real prop shape (`denuncia.investigador`: string id vs object; map key types) and fix the lookup so an assigned case always shows `Asignado a:` + avatar + name; no layout break when unassigned (row stays hidden as today).
- Case details sheet (`DenunciaSheet` used by Bandeja) — surface the current investigador (same map/lookup, one row reusing `InvestigadorAvatar`).
- Out of scope for Writer 1: backend, MisCasos, routes, DB.

Writer 2 (Slice 2, MisCasos):
- `app/Http/Controllers/MisCasosController.php` — thin: accept `DenunciaFilterRequest`, scope `investigador_id = Auth::id()` (force, ignore the param), call `DenunciaListQuery`, paginate, `filters` echo.
- `resources/js/Pages/Denuncias/MisCasos.tsx` + `mis-casos/` — consume server `filters` prop, reuse `useDenunciaFilters` (hide the investigador filter: a researcher only sees their own cases) + extended `BandejaFiltros` or a shared extraction if trivial; drop client-only slicing for server fields, keep `sortBy plazo` as visual sort.
- Feature test: extend or add `tests/Feature/Denuncia/MisCasosFilterTest.php` (search, dates, pagination scoped to own cases; another researcher's cases never leak).
- Out of scope: `MiResumen` stub, backend plazo-SQL.

## Constraints

- No new filter vocabulary; reuse `types/denuncia.ts`, `constants/estados.ts`, `helpers/fechas.ts`, shadcn `Select`/`Button`, existing badges/avatar.
- Stable select values (`all/corrupcion/negacion`, `plazo/fecha/investigador`); only user-facing labels change.
- Uppercase convention stays; Spanish neutral UI with tú.
- `plazo` stays display-only (no SQL where on accessor).
- Inertia contract: `filters` echo, `preserveState:true`, `preserveScroll:true`; `?destacar` keeps working in Bandeja.
- Accessibility: real `<label>` or `aria-label` on the two selects; keyboard path of the card unchanged.

## Checklist

- [x] T1: feature doc created and mirrored in Engram before the first source write; branch created.
- [x] T2 (Writer 1): labels + investigador in card + investigador in details; `npm run build` passes.
- [x] T3 (Writer 2): MisCasos server-filter + paginate + test green; `npm run build` passes.
- [x] T4: parent spot-check (`npm run build` + full phpunit green) + work-unit commits with SHA/diff-stat; doc closed.

## Authorized scope

- This document; `bandeja/BandejaFiltros.tsx`, `Card/DenunciaCard.tsx`, details sheet, `Bandeja.tsx` (prop threading only if needed); `MisCasosController.php`, `MisCasos.tsx` + `mis-casos/*`, `DenunciaListQuery.php` (only if a scope param is needed), new `MisCasosFilterTest.php`.

## Acceptance criteria

- [x] The two dropdowns carry visible labels and self-explanatory option names.
- [x] An assigned case shows its investigador on the card and in the details sheet; unassigned cases look as today.
- [x] `/mis-casos` filters hit the server (paginated, scoped to own cases, no leak).
- [x] `npm run build` passes clean; full phpunit suite passes (206 tests).
- [x] `git status --short` clean after evidence commits (only pre-existing unrelated files excluded); SHAs + `diff --stat` recorded below.

## Applicable checks

- `npm run build`
- `C:\laragon\bin\php\php-8.3.30-Win32-vs16-x64\php.exe vendor/phpunit/phpunit/phpunit` (full suite; focused `--filter MisCasosFilterTest` before commit)
- `git status --short`, `git diff --stat`, `git log --oneline -5`

## Route declaration

- T1 inline (mechanical doc, 1 file).
- T2+T3 delegated direct writers, strictly sequential (Writer trigger: 2+ non-trivial files; no parallel writers in one worktree).
- T4 parent spot-check (re-run one reported command) + Conventional Commits work-units (backend+test with behavior, frontend+doc alongside).
- TDD resolved: off (ordinary functional checks). Runner: `C:\laragon\bin\php\php-8.3.30-Win32-vs16-x64\php.exe vendor/phpunit/phpunit/phpunit`.
- Delivery strategy: `ask-on-risk` (default). Forecast ~250-400 authored lines. 400-line heuristic is advisory only.

## Verification evidence

- Writer 1 (T2, partial, frontend-only, uncommitted):
  - `npm run build`: limpio (tsc + vite, 4605 módulos, built in 6.70s).
  - `php vendor/phpunit/phpunit/phpunit`: OK (199 tests, 1482 assertions).
  - Archivos: `bandeja/BandejaFiltros.tsx` (labels + option labels), `Components/Denuncias/Shared/resolverInvestigador.ts` (nuevo), `Components/Denuncias/Card/DenunciaCard.tsx` (lookup fix), `Components/Denuncias/Sheet/DenunciaSheet.tsx` (fila Investigador actual + Sin asignar).
  - `Bandeja.tsx` sin cambios (prop threading ya tolera objeto: línea 179/225).
- Writer 2 (T3, partial, backend+frontend+test, uncommitted):
  - `phpunit --filter MisCasosFilterTest`: OK (7 tests, 112 assertions).
  - `npm run build`: limpio (tsc + vite, 4606 módulos, built in 7.14s).
  - `phpunit` full: OK (206 tests, 1594 assertions).
  - Archivos: `MisCasosController.php` (FilterRequest + fuerza investigador propio + default scope asignada/admitida + paginate(10) + filters/opciones/contadores/destacarDenuncia), `mis-casos/useMisCasosFilters.ts` (nuevo, ruta `denuncias.mis-casos`, sin tab/investigador_id en params), `MisCasos.tsx` (filtros init servidor + tabs con contadores + paginado servidor), `mis-casos/MisCasosLista.tsx` (consume página servidor + Paginacion), `mis-casos/helpers.ts` (TAB_ESTADOS/tabDesdeEstado/esScopeDeTab/esDelTab), `mis-casos/tipos.ts` (Paginado/FiltrosEcho/Opciones/contadores), `tests/Feature/Denuncia/MisCasosFilterTest.php` (nuevo).
  - `DenunciaListQuery.php` sin cambios (base() ya cubre; forzado en controller). `DenunciaFilterRequest.php`, Bandeja*, rutas, MiResumen intactos.
- Pending T4 (parent spot-check + work-unit commits con SHA/diff-stat).
- Final (padre, T4 spot-check sobre `feature/bandeja-ux-miscasos`):
  - `npm run build` (tras Writer 1): passed (tsc + vite, 4605 módulos, 6.46s).
  - `phpunit` full (tras Writer 2): OK (206 tests, 1594 assertions, 00:08.625).
  - Commits:
    - `a1c45c5` `feat(bandeja): labels en filtros e investigador visible` — 4 files, +139/-70 (BandejaFiltros, DenunciaCard, DenunciaSheet, resolverInvestigador nuevo).
    - `3fc8045` `feat(mis-casos): filtros en servidor y paginado acotado` — 2 files, +266/-10 (MisCasosController, MisCasosFilterTest nuevo).
    - `c61da28` `feat(mis-casos): UI de filtros servidor con paginacion` — 5 files, +335/-81 (MisCasos.tsx, MisCasosLista, helpers, tipos, useMisCasosFilters nuevo).
  - Suite: 199 base + 7 nuevos (MisCasosFilterTest) = 206 verdes. Build final 4606 módulos.
  - Excluidos (pre-existentes, no del slice): `M transparencia-proy/pre-defensa/05-Matriz-Perfil-Transparencia.md`, `?? odd/tasks/herdr-*` (5 files).

## Progress

- T1 done (doc + Engram mirror + branch `feature/bandeja-ux-miscasos`).
- T2 done (Writer 1, commit `a1c45c5`).
- T3 done (Writer 2, commits `3fc8045` + `c61da28`).
- T4 done (spot-check padre + evidencia + cierre).

## Next step

- Ninguno en este doc: verificar visualmente en navegador (labels, tarjeta con investigador, sheet, /mis-casos) y luego merge a main según política del repo.
