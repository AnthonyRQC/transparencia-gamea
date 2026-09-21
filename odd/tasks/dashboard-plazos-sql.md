# Dashboard plazos: SQL aggregates and single-pass classification

## Objective

Remove in-memory plazo computation from `KpiQuery` and `RendimientoQuery`:
ampliacion sums come from a SQL aggregate, each row is classified exactly
once, and investigator workload is grouped in a single pass, keeping every
dashboard output identical.

## Problem

Verified audit (finding #2) of the dashboard queries:

- `app/Queries/Dashboard/KpiQuery.php` hydrates every active denuncia with
  `with('ampliaciones')->get()` and then walks the collection twice
  (`proximosAVencer`, `vencidos`), calling the `plazo` accessor once per row
  per filter. It also hydrates closed denuncias with
  `with(['ampliaciones', 'cierre'])->get()` and compares `cerrado_at` against
  `calcularVencimiento()` per row.
- `app/Queries/Dashboard/RendimientoQuery.php` hydrates active assigned
  denuncias with `with('ampliaciones')->get()`, rescans the whole collection
  per investigator (`$activas->where('investigador_id', $t->id)`, O(n*m)) and
  calls `plazo` three times per row per investigator. `casosUrgentes`
  hydrates full models with `with(['investigador', 'ampliaciones'])` and
  calls `plazo` twice per row.
- `Denuncia::calcularVencimiento()` sums `ampliaciones.dias` from the loaded
  relation and otherwise runs one SQL query per row (N+1).

The cost grows with the number of active/closed denuncias and investigators,
not with the fixed dashboard payload.

## Why

The dashboard is the entry point for the jefe and investigators; its query
cost must stay bounded as the case volume grows. The business logic (business
days, base deadline, colors) is already correct and must not change.

## Scope

Files that change:

- `app/Queries/Dashboard/KpiQuery.php`
- `app/Queries/Dashboard/RendimientoQuery.php`
- `app/Models/Denuncia.php` (aggregate-aware branch in `calcularVencimiento`)
- `tests/Feature/DashboardPlazosSqlTest.php` (new)
- `odd/tasks/dashboard-plazos-sql.md` (this document)

Out of scope: schema/migrations, frontend, `DiasHabiles`, `plazo` accessor
output, API/Inertia shape, `OperativoQuery`, `ResultadosQuery`,
`DashboardController`.

## Constraints

- Every output stays identical: KPI numbers, cumplimiento %, rechazadas,
  split, carga (names, enPlazo/proximos/vencidos, order, zero-row filter),
  urgentes (ticket, 'SIN ASIGNAR', diasRestantes, color, estado, asc, top 10).
- Ampliaciones come from `withSum` only: no `ampliaciones` models hydrated and
  no per-row ampliaciones queries.
- Select only the columns each computation needs.
- `plazo` is computed at most once per row; investigator workload in one pass.
- No schema change, no public API change, no `DiasHabiles` change, no frontend
  change, no change to `getPlazoAttribute` output.
- `tests/Feature/DashboardTest.php` stays green and unchanged.

## Checklist

- [ ] T1: `KpiQuery` active/closed paths use `withSum` + partial selects.
- [ ] T2: `KpiQuery` classifies active rows in a single pass.
- [ ] T3: `RendimientoQuery` carga groups counts in a single pass; urgentes
  uses `withSum` + partial selects and one `plazo` read per row.
- [ ] T4: `Denuncia::calcularVencimiento` consumes the aggregate attribute
  without changing its output for existing callers.
- [ ] T5: query-count regression + ampliaciones correctness tests; evidence
  recorded; Engram mirror updated; tree clean.

## Authorized scope

- The five paths listed under Scope plus this document.

## Acceptance criteria

- [ ] No `with('ampliaciones')` / `with(['...ampliaciones...'])` remains in
  `KpiQuery` or `RendimientoQuery`.
- [ ] No `$activas->where('investigador_id', ...)` rescan remains in
  `RendimientoQuery`.
- [ ] Query count for the dashboard request is the same with 5 and 40 active
  denuncias (observed value recorded).
- [ ] KPI numbers are correct in both scenarios.
- [ ] Ampliaciones summed from SQL change active classification and closed
  cumplimiento as expected.
- [ ] `php artisan test --filter=Dashboard` and the full suite pass.
- [ ] `git status --short` is clean after the evidence commit.

## Applicable checks

- `& "C:\laragon\bin\php\php-8.3.30-Win32-vs16-x64\php.exe" artisan test --filter=Dashboard`
- `& "C:\laragon\bin\php\php-8.3.30-Win32-vs16-x64\php.exe" artisan test`
- `git status --short`, `git diff --stat`, `git log --oneline`

## Verification evidence

Pending: filled by the evidence commit.
