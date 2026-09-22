# Feature: Enum Hardening — ADMIN Role + Rule::enum + Parity Test

## Objective
Close the 3 gaps from the enums-vs-catalogs audit (22-sep-2026) without breaking existing behavior: complete `RolUsuario` with the real `admin` role, convert validation to `Rule::enum()` as single source (model casts deferred by decision D27), and lock the triple-copy (PHP enum ↔ catalog seeds ↔ TS consts) with a parity test.

## Problem
- `RolUsuario` declares 3 cases but `admin` is a live 4th role (DB, `User::esAdmin`, seeders, TS, permission packages). Any `RolUsuario::from('admin')` throws `ValueError` — latent crash on the exact role that administers users.
- `Denuncia` has no enum casts and validation uses `Rule::in(Enum::valores())` or hardcoded literals — three copies of the same knowledge, zero compiler help.
- Estados/tipos exist as PHP enum + `catalogo_*` seeds + TS consts, hand-synced, with zero parity tests; an `activo=false` toggle on read-only catalogs may be unenforced.

## Why
User explicitly ordered the 3 fixes after joint review, demanding a prior blast-radius check on roles/permissions so fix 1 is provably non-destructive.

## Scope
- IN: T1 impact analysis (read-only) of adding `ADMIN` to `RolUsuario`: every consumer (`from/tryFrom/valores`, `rolesPermitidos`, `esAdmin`, policies/middleware, `PermisosCatalogo`, admin UI, seeders, tests, TS). Fixes only what the analysis clears.
- IN: T2 `ADMIN` case + `User::esAdmin()` wired to `RolUsuario::ADMIN->value` (behavior-identical, test-covered).
- IN: T3 `Rule::enum()` replacing `Rule::in(Enum::valores())` + hardcoded tipo/escenario literals (validation-only, behavior-identical).
- IN: T4 parity test (PHPUnit): enum values ↔ `catalogo_estados`/`catalogo_tipos_denuncia` claves ↔ TS consts + fix stale TS `RolUsuario` union in `types/denuncia.ts:15` (3→4 roles).
- OUT: no state-machine changes, no new permissions, no catalog-UI behavior changes, no archivar-subestado decision (client TODO), no migration needed (string columns already fit).
- OUT (T1 finding): **model enum casts DEFERRED** — evidence: 41 string comparisons on Denuncia `estado/tipo/subestado` across ~20 files (`AdmisionController:24,33,78,86`, `CierreController:36,95,149,178,182`, `InvestigacionController:18,30,61,72`, `DelegacionController:25,33,82,90`, `AsignacionController:24,38,108`, `DenunciaController:33,158,234`, `Denuncia.php:86`, `AlertasPlazo:82`, `OperativoQuery:38`, `ReporteExcel:54,57`, `AmpliacionController:21-22`, `MisCasosController:36`, `SeguimientoController:102,107`; note `Descargo/Eval/Solicitud.estado` are NOT EstadoDenuncia). Adding a cast flips `$d->estado` to enum and breaks every `===` comparison atomically; not acceptable pre-defense. Decision recorded as ADR in T5.

## Constraints
- Non-destructive: every existing test stays green; admin keeps (and only) its current 17 zero-`caso.*` permissions; jefe/investigador/registrador matrices unchanged.
- Conventional Commits, no Co-Authored-By, no AI attribution. One work-unit commit per fix.
- Docs for thesis live on `docs/pre-defensa-tecnica` (unpushed); this branch touches source + tests only.

## Authorized scope
- Read: `app/Enums/*`, `app/Models/*`, `app/Services/UsuarioAdminService.php`, `app/Support/CatalogoRules.php`, `app/Http/Requests/**`, `app/Data/PermisosCatalogo.php`, `app/Services/PermisosEfectivos.php`, `app/Services/CasoAuth.php`, `resources/js/constants/estados.ts`, `resources/js/permissions.ts`, `database/seeders/*`, `tests/**`, `transparencia-proy/decisiones/`.
- Write: `odd/tasks/enums-roles-paridad.md`, source files listed above (only via T2-T4 after T1 clears them), new test file(s) under `tests/`.
- Forbidden: migrations altering column types, permission-matrix changes, push/merge without explicit user order.

## Acceptance criteria
- [x] T1 report lists every `RolUsuario`/`'admin'` consumer with file:line + verdict (safe/affected) before any edit.
- [x] `RolUsuario::from('admin')` works; `User` role helpers unified against `RolUsuario` values.
- [x] `Rule::enum()` replaces enum-derived `Rule::in()` + hardcoded tipo/escenario literals; model casts deferred per D27 with inventory.
- [x] New parity test fails if any of the 3 copies drifts; focused suite green, full suite green.
- [x] Each fix is its own work-unit commit with SHA recorded here.

## Applicable checks
- Focused: `php artisan test --filter=<Enum|Roles|Catalogo|Usuario>` (exact filter from worker env); full `php artisan test` before close. PHP via Laragon path if not on PATH — worker resolves, else records N/A with reason.
- `tsc` only if TS consts touched (not planned). Doc edits: direct read + diff.

## Route declaration
- Delegated-direct. Mapping trigger fired (enums span Enums/Models/Requests/Services/seeders/TS/tests); writer trigger fires (3 fixes across 2+ files). No SDD.

## Tasks
- [x] T1 — Impact analysis (delegated explorer, read-only): blast radius + test plan.
- [x] T2 — Fix 1 ADMIN (delegated writer, unit 1).
- [x] T3 — Fix 2 `Rule::enum` + literals (delegated writer, unit 2; casts deferred).
- [x] T4 — Fix 3 parity test + TS union fix (delegated writer, unit 3).
- [x] T5 — Parent spot-check, ADR cast-deferral, commits, close.

## Progress
- 2026-09-22: doc created on branch `fix/enums-roles-paridad` (from main@fb3740c).
- 2026-09-22: T1 COMPLETE (delegated explorer). Verdict: **fix 1 non-destructive**. `RolUsuario` has ZERO symbol consumers (no `::from/::tryFrom/::valores/::cases/`type-hints/match); only docs + an independent TS union reference it. Privilege-escalation check **PASS**: role assignment is gated by `UsuarioAdminService::rolesPermitidos()` (hardcoded actor-scoped list, `UsuarioStoreRequest.php:22`, `UsuarioUpdateRequest.php:23`), not the enum; `test_jefe_no_crea_admin` (`UsuarioAdminTest.php:101-108`) guards it. Casts DEFERRED with 41-comparison evidence (see OUT above).
- T1 caveats for T3: (a) never replace `rolesPermitidos` with plain `Rule::enum(RolUsuario::class)` — jefe could assign admin; (b) no `User.rol` cast (breaks ~15 strict string comparisons).
- T1 test plan: existing green guards = RolesAccesoTest (gates por rol, admin no opera, registrador sin campana, catalogo sincronizado con TS), UsuarioAdminTest (jefe no crea admin, ultimo admin bloqueado), DelegacionTest (no a admin). New: parity test (T4).
- 2026-09-22: parity-test precedent found: `RolesAccesoTest::test_catalogo_sincronizado_con_ts` (`tests/Feature/RolesAccesoTest.php:204-218`) already locks `PermisosCatalogo::PERMISOS` ↔ `permissions.ts`; T4 follows the same pattern for enums ↔ catalogs ↔ TS.
- PHP path for tests (Laragon): `C:\laragon\bin\php\php-8.3.30-Win32-vs16-x64\php.exe artisan test`.

## Verification evidence
- Baseline previo a T2 (`--filter="UsuarioAdminTest|RolesAccesoTest|DelegacionTest|MiCuentaTest"`): 52 passed (488 assertions).
- T2 (`--filter="UsuarioAdminTest|RolesAccesoTest|DelegacionTest|MiCuentaTest"`): 52 passed (488 assertions).
- T2 (`php -r` sobre el enum): `RolUsuario::valores() = ['jefe','investigador','registrador','admin']`; `from('admin')` y `tryFrom('admin')` OK.
- T3 (`--filter="DashboardTest|DenunciaFlowTest|CatalogoControllerTest|DashboardPlazosSqlTest"`): 55 passed (374 assertions).
- T3 (equivalencia `Rule::in` vs `Rule::enum`, Laravel 13.30.0, validador real): 5 pares de reglas × 29 valores candidatos = 0 discrepancias. `EstadoDenuncia::valores()` ya incluye `archivada`; `[...valores(), 'archivada']` no agregaba nada. En Laravel 13 `validateIn` compara `in_array((string) $value, $parameters, true)`, así que los conjuntos aceptados son idénticos para todo input escalar.
- T4 (`--filter="EnumsParidadTest|RolesAccesoTest"`): 20 passed (285 assertions).
- Suite completa (`artisan test`): **185 passed (1310 assertions), 0 failed** (21 archivos de test).
- T5 padre — `npx tsc --noEmit`: sin salida (limpio) tras extender `ROLES` en `estados.ts`.
- T5 padre — re-ejecución propia de la suite completa: **185 passed (1310 assertions)**.
- T5 padre — focus `--filter="EnumsParidadTest|UsuarioAdminTest|RolesAccesoTest"`: 40 passed (358 assertions).
- T5 padre — spot-check: `RolUsuario.php` con `ADMIN` último; `User::esAdmin()` contra `RolUsuario::ADMIN->value`; `ROLES` de `estados.ts` con `admin` y cubierto por el test de paridad.

### Commits de unidad
- `49af91f` fix(enums): agregar rol admin a RolUsuario y unificar esAdmin — 2 files, +3/-1 (`app/Enums/RolUsuario.php`, `app/Models/User.php`).
- `e52c562` refactor(validaciones): derivar reglas de enum como fuente unica — 3 files, +11/-5 (`DashboardRequest.php`, `Denuncia/StoreDenunciaRequest.php`, `CatalogoRules.php`).
- `9dd7822` test(enums): verificar paridad enum-catalogo-ts y completar tipo RolUsuario — 2 files, +138/-1 (`resources/js/types/denuncia.ts`, `tests/Feature/EnumsParidadTest.php`).
- `96209f1` refactor(usuarios): unificar helpers de rol con RolUsuario — 1 file, +3/-3 (`app/Models/User.php`).
- `b52d29a` chore(enums): completar ROLES en estados.ts y cubrirlo en paridad — 2 files, +9 (`resources/js/constants/estados.ts`, `tests/Feature/EnumsParidadTest.php`).
- `9c64e34` docs(decisiones): registrar D27 enums sin casts — 2 files, +70 (`D27-enums-sin-casts.md`, `Indice.md`).

### Resuelto en T5 (detectado por el writer, fuera del alcance original)
- `resources/js/constants/estados.ts` `ROLES` completado con `admin` y cubierto por `EnumsParidadTest` (b52d29a); los 4 helpers de rol de `User` unificados contra el enum (96209f1).

### Deuda registrada (no bloquea)
- Casts de modelo: diferidos con inventario (D27).
- `activo=false` en `catalogo_estados`/`catalogo_tipos_denuncia` no se aplica en validación — pendiente de decisión.

## Next step
- Rama `fix/enums-roles-paridad` cerrada y verde: lista para revisión/push cuando el usuario lo ordene (no mergeada a main).
- Si se retoma la deuda de casts: seguir el requisito bloqueante de D27 (migración atómica de las 41 comparaciones + suite completa).
