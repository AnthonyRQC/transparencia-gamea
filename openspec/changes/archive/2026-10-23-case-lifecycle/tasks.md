# Tasks

## 1. State Machine Transitions and Concurrency

- [x] 1.1 Verify standard complaint initialization in `ingresada` and two-mode legacy intake (`cerrada` for historical, `investigacion`/`informe` for ongoing) and run `php artisan test tests/Feature/DenunciaFlowTest.php --filter=test_registrador_can_create_denuncia` and `tests/Feature/CargaLegacyTest.php` — Evidencia: `php artisan test tests/Feature/DenunciaFlowTest.php`: 18 passed (92 assertions); `php artisan test tests/Feature/CargaLegacyTest.php tests/Unit/DiasHabilesTest.php tests/Feature/DiasHabilesCacheTest.php`: 24 passed (145 assertions).
- [x] 1.2 Add tests for preliminary evaluation delegation, return with recommendation, and reassumption sub-flow in `tests/Feature/DenunciaFlowTest.php` and verify tests pass — Evidencia: `php artisan test tests/Feature/DenunciaFlowTest.php`: 18 passed (92 assertions); producción: `reasumirEvaluacion` deja evaluación en `cancelada`, `delegarEvaluacion` rechaza investigador inactivo.
- [x] 1.3 Add tests for admission and terminal rejection transitions with pessimistic locking (`lockForUpdate`) verification and run `php artisan test tests/Feature/DenunciaFlowTest.php` — Evidencia: `php artisan test tests/Feature/DenunciaFlowTest.php`: 18 passed (92 assertions).
- [x] 1.4 Verify investigator assignment and formal investigation initiation transitions and run `php artisan test tests/Feature/DenunciaFlowTest.php --filter=test_denuncia_full_flow` — Evidencia: `php artisan test tests/Feature/DenunciaFlowTest.php`: 18 passed (92 assertions).

## 2. Statutory Deadlines and Holiday Exclusions (Ley 974 / Ley 2341)

- [x] 2.1 Verify business-day computation in `DiasHabiles` with holiday caching, weekend exclusions, and run `php artisan test tests/Unit/DiasHabilesTest.php` — Evidencia: `php artisan test tests/Unit/DiasHabilesTest.php tests/Feature/DiasHabilesCacheTest.php` (en grupo de 24 passed, 145 assertions).
- [x] 2.2 Add unit/feature tests for 5-business-day qualification deadline and statutory investigation limits (45 business days for corruption, 20 for denial of information) in `tests/Feature/DashboardPlazosSqlTest.php` and verify tests pass — Evidencia: `php artisan test tests/Feature/DashboardPlazosSqlTest.php tests/Feature/ReaperturaTest.php`: 8 passed (106 assertions).
- [x] 2.3 Add tests for investigation extension approval in business days and legal ceiling enforcement (max +45 business days corruption, max +10 business days denial) and run `php artisan test tests/Feature/DenunciaFlowTest.php --filter=test_jefe_can_approve_ampliacion` — Evidencia: `php artisan test tests/Feature/DenunciaFlowTest.php`: 18 passed (92 assertions).
- [x] 2.4 Verify semaphore tier thresholds (`red` <= 3 days, `yellow` 4-8 days, `green` > 8 days) conforming to ADR D28 in `tests/Unit/DiasHabilesTest.php` — Evidencia: `php artisan test tests/Unit/DiasHabilesTest.php`: 10 tests verdes (bordes 3/4/8/9 cubiertos, sin cambios necesarios).

## 3. Terminal States, Reversals, and Reopening

- [x] 3.1 Verify case closure in `CierreController`, draft publication generation, terminal deadline nullification (`plazo` is null), add `lockForUpdate` inside `DB::transaction()`, and run `php artisan test tests/Feature/DenunciaFlowTest.php`
- [x] 3.2 Add tests for `archivada` substate toggle on closed complaints, enforce mandatory justification (>= 20 characters) with `bitacora` audit on closure deletion (`eliminarCierre`), add `lockForUpdate` inside `DB::transaction()` to `eliminarCierre` and `toggleArchivar`, and verify concurrency tests pass
- [x] 3.3 Align `Denuncia::calcularVencimiento()` to evaluate `reapertura_json['plazo']` for reopened cases and add regression test verifying reopened expiration computation
- [x] 3.4 Add feature tests for case reopening in `tests/Feature/ReaperturaTest.php` verifying 20+ character justification, authorized permission check (`caso.reabrir`), and audit log in `bitacora` — Evidencia: `php artisan test tests/Feature/ReaperturaTest.php` (en grupo con DashboardPlazosSqlTest: 8 passed, 106 assertions).

## 4. Controlled Date Reconciliation and Audit Invariants

- [x] 4.1 Implement state-window guard in `DenunciaController::conciliarFechas` (strictly allowing active pre-closure states; rejecting terminal `rechazada` and `cerrada` cases), reject `fecha_rechazada` in payload limiting reconciliation strictly to `created_at`, `fecha_admitida`, and `fecha_asignada`, with >= 20 characters justification, permission check (`caso.conciliar`), `conciliacion_json` audit, and test coverage
- [x] 4.2 Verify append-only non-repudiation logging across all state mutations without user IP persistence and run `php artisan test tests/Feature/BitacoraEnriquecidaTest.php` — Evidencia: `php artisan test tests/Feature/BitacoraEnriquecidaTest.php tests/Feature/CierreContratoTest.php tests/Feature/RolesAccesoTest.php`: 38 passed (378 assertions).

## 5. Integration Verification

- [x] 5.1 Run full PHPUnit test suite (`php artisan test`) and verify green baseline across all tests
- [x] 5.2 Validate OpenSpec change integrity with `cmd /c openspec validate case-lifecycle`

## Workflow follow-up

- Use this specification as the foundational contract for Phase D (due-date calendar and delay indicators).
- Mark all tasks as completed upon Phase D implementation before executing `openspec archive case-lifecycle`.
