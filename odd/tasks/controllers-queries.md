# Controllers refactor: extract queries, services and form requests

## Objective

Reduce the three fattest controllers to thin, reviewable adapters. Every
moved line is a verbatim move: no behavior change is authorized or expected.

## Problem

Verified structural audit (finding #5): `CatalogoController` (715 lines),
`UsuarioController` (491) and `PublicacionController` (632) mix routing,
validation, transactions, query building and side effects in single classes.
Reviewing any one behavior means reading the whole file, and the query shapes
are not reusable or testable in isolation, unlike the `DashboardController`
and `app/Queries/Dashboard/*` pattern already adopted in September 2026.

## Why

The dashboard refactor proved the convention works: a thin controller plus
static query classes (`calcular`) keeps each responsibility independently
readable without touching the HTTP contract. These three controllers are the
remaining outliers, and `Bitacora::create` + `ConfiguracionSistema` catalog
read/write are duplicated shapes that should exist once.

## Scope

Unit 1 — `app/Http/Controllers/CatalogoController.php` (715 → target ~90):

- new `app/Queries/Catalogo/CatalogoIndexQuery.php`: index payload (32–134),
  `getFeriadosData` (579–604), `getUnidadesData` (606–621) and
  `buildPadreOptions` (623–643), exposed as static `construir()`.
- new `app/Services/CatalogoService.php`: `store`/`update`/`destroy`/
  `reactivar` bodies (141–379), `validarParentUnidad` (381–404), the 14
  per-type `desactivar*`/`reactivar*` helpers (406–549) and `upperData`
  (664–670).
- new `app/Services/CatalogoConfigStore.php`: `getConfigArray` (645) and
  `setConfigArray` (650–662).
- new `app/Support/CatalogoRules.php`: `rulesFor` (672–714) as a support
  class, not a FormRequest (the rules are dynamic per `tipo`).
- new `app/Services/BitacoraService.php`: catalogue `logBitacora` (551–577)
  as `registrarCatalogo`, plus a generic `registrar` that Unit 3 reuses.

Unit 2 — `app/Http/Controllers/UsuarioController.php` (491 → target ~150):
new `app/Queries/Usuario/UsuarioIndexQuery.php` (index 47–101, N+1 counts
kept identical), new `app/Services/UsuarioAdminService.php`
(`store`/`update`/`resetPassword`/`desactivar`/`reactivar`/`masivo` bodies
138–151, 184–207, 227–235, 254–298, 310–321, 336–387; `motivoBloqueo`
431–452; `hayOtroActivo` 454–460; `casosActivosDe` 462–468; `traspasarLote`
470–490; `rolesPermitidos` 34–41; `passwordRules` 26–29) and four
FormRequests: `UsuarioStoreRequest`, `UsuarioUpdateRequest`,
`UsuarioDesactivarRequest`, `UsuarioMasivoRequest` (validation arrays at
110–118, 169–175, 248–252, 327–334; callers updated at 102, 114, 174).

Unit 3 — `app/Http/Controllers/PublicacionController.php` (632 → target
~180): new `app/Queries/Publicacion/MuroQuery.php` (26–197, fulltext driver
branch at 171–174 verbatim), new `app/Queries/Publicacion/PublicacionAdminQuery.php`
(admin index 223–275), new `app/Services/PublicacionArchivoService.php`
(`guardarArchivo`/`tamanoLegible` 335–358, `quitarArchivo` 541–552,
downloads 554–587) and new `app/Http/Requests/PublicacionRequest.php`
(rule array 277–297 plus `normalizarCuerpo` 317–324).

Out of scope: schema, routes, middleware, frontend, `app/Models/*`, the
`Queries/Dashboard/*` classes and any behavior not listed above.

## Constraints

- Verbatim moves: Spanish strings, existing names, comments and formatting
  are copied unchanged. No new comments, no reformatting, no renaming of
  moved logic except the class/method homes required by the extraction.
- Tests stay UNCHANGED: `tests/Feature/CatalogoControllerTest.php`,
  `UsuarioAdminTest.php`, `PublicacionAdminTest.php`, `PublicacionMuroTest.php`
  and the rest of the suite are not edited. If a test needs editing to pass,
  STOP and report: that signals behavior drift.
- Response shapes and session keys stay identical: `success`, `error`,
  `credencialTemporal`, every `withErrors` key (`error`, `ci`, `rol`,
  `traspaso_a`, `justificacion`, `lote`, `cuerpo`, `evento`,
  `portada_archivo_id`, `archivos`) and the `impacto` JSON shape.
- Preserve exactly: `DB::beginTransaction` with early `return back()` +
  `DB::commit()` boundaries; `lockForUpdate`; the `desactivar` redirect
  INSIDE the transaction; `ValidationException` as control flow; `sessions`
  deletes; last admin/jefe invariant; delegation revocation; `traspaso_json`
  + bitácora; `impacto` read-only; the muro JSON consumed by `Welcome`; the
  update publish-state matrix; the 5-attachment cap; the duplicate-event
  guard routed to the `evento` key; portada ownership; `Storage::disk('public')`;
  `autorizado()`/`redirigirSinPermiso` stay as-is (not removed).
- Catalogue protected keys stay single-source: `TABLE_BASED`, `CONFIG_BASED`,
  `READ_ONLY_TYPES`, `PROTECTED_CLASIFICACIONES` and `PROTECTED_PRIORIDADES`
  live once (in `CatalogoService`) and are referenced, never duplicated.
- `PublicacionController::terminoFulltext` stays a declared method on the
  controller: `PublicacionMuroTest::test_termino_fulltext_exige_todas_las_palabras`
  reflects on it. It becomes a one-line delegation to
  `MuroQuery::terminoFulltext()` and returns the same values.
- `PublicacionController::muroData` stays public, and `new PublicacionController()`
  without constructor arguments keeps working (the reflection test relies on it).
- FormRequest validation runs before the controller body. The only observable
  precedence change is an invalid payload reaching validation before the
  in-body permission or level guards; route middleware blocks unauthorized
  actors first and no test covers that combination. Accepted and recorded.
- N+1 counts in `UsuarioIndexQuery` are kept identical: fixing them is not
  trivially safe without changing query shape.

## Checklist

- [ ] T1: feature doc created and mirrored in Engram before the first source write.
- [ ] T2: Unit 1 extracted; `--filter=CatalogoControllerTest` green; commit.
- [ ] T3: Unit 2 extracted; `--filter=UsuarioAdminTest` green; commit.
- [ ] T4: Unit 3 extracted; `--filter=Publicacion` green (admin + muro); commit.
- [ ] T5: full suite green; line counts before/after and new files recorded.
- [ ] T6: evidence commit with SHAs, diff stats and clean tree.
- [ ] T7: Engram mirror updated with the evidence; no push, no PR.

## Authorized scope

- The three controllers, the new classes listed under Scope, and this document.

## Acceptance criteria

- [ ] Each controller is a thin adapter under its target line count.
- [ ] No test file is modified; the full suite passes with the same assertions.
- [ ] Session keys, response shapes, JSON payloads and transaction boundaries
      are unchanged.
- [ ] `git status --short` is clean after the evidence commit.

## Applicable checks

- `& "C:\laragon\bin\php\php-8.3.30-Win32-vs16-x64\php.exe" artisan test --filter=CatalogoControllerTest`
- `& "C:\laragon\bin\php\php-8.3.30-Win32-vs16-x64\php.exe" artisan test --filter=UsuarioAdminTest`
- `& "C:\laragon\bin\php\php-8.3.30-Win32-vs16-x64\php.exe" artisan test --filter=Publicacion`
- `& "C:\laragon\bin\php\php-8.3.30-Win32-vs16-x64\php.exe" artisan test`
- `git status --short`, `git diff --stat`, `git log --oneline`
- Frontend build: N/A — no frontend change.

## Review workload note

The diff is move-heavy, so authored additions plus deletions exceed the
400-line advisory heuristic in `work-unit-commits`. The overage is accepted:
moved lines carry no new logic, each unit is independently reviewable and
reversible, and behavior is verified by the same tests after every unit.

## Verification evidence

- Baseline before Unit 1: `& "C:\laragon\bin\php\php-8.3.30-Win32-vs16-x64\php.exe" artisan test`:
  182 passed (1280 assertions).
- Pending: per-unit focused tests, final full suite, line counts, SHAs and
  diff stats, recorded here and in the Engram mirror by T6/T7.
