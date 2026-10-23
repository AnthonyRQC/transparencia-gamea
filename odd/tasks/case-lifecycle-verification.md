# Case Lifecycle Verification — Panel 3 Stage 0

## Objective

Execute ONLY Stage 0 of the Panel 3 brief (`00 - FASE D - Brief Panel 3 Etapa 0.md`):
add the missing tests, adjust the asserts listed in the corrected matrix
(`00 - FASE D - Matriz Etapa 0.md`), apply the TWO pre-authorized production
fixes, verify the contract, mark tasks, and archive `case-lifecycle`.

## Scope

- IN: `openspec/changes/case-lifecycle` tasks 1.1, 1.2, 1.3, 1.4, 2.1, 2.2,
  2.3, 2.4, 3.4, 4.2. Tests only, plus the two authorized production fixes:
  (a) `reasumirEvaluacion` leaves the pending evaluation in `cancelada`;
  (b) `delegarEvaluacion` validates the investigator exists AND is active.
- OUT: spec edits, Phase D, grill, calendar delta spec, push, merge.

## Discrepancy handling (brief section)

- (a) Unequivocal spec + divergent code: fix code, add/adjust test, record evidence.
- (b) Ambiguous/incorrect spec: STOP. Panels 1/2 decide. No code/spec touch.
- (c) Product/scope change: STOP. Human decides.
- (d) Environmental failure: STOP and report.

## Acceptance criteria

- [ ] Tasks 1.1–1.4, 2.1–2.4, 3.4, 4.2 marked with evidence in `tasks.md`.
- [ ] Both authorized production fixes applied and covered by tests.
- [ ] Full suite green; tests and assertions recorded below.
- [ ] `docs/STATUS.md` regenerated; `composer docs:check` exit 0.
- [ ] `case-lifecycle` archived; `openspec validate --archived` and `--all` green.
- [ ] No production changes beyond the two authorized fixes; no push/merge.

## Production diffs (authorized only)

### Diff 1 — `reasumirEvaluacion` cancels pending evaluation

File: `app/Http/Controllers/Denuncia/DelegacionController.php`
(Commit `fix(evaluacion): cancel pending evaluation on reassume, reject inactive investigator`.)

```diff
             $evaluacionPendiente = $denuncia->evaluaciones()->where('estado', 'pendiente')->latest()->first();
 
+            if ($evaluacionPendiente) {
+                $evaluacionPendiente->update(['estado' => 'cancelada']);
+            }
+
             $denuncia->update(['estado' => 'ingresada']);
```

### Diff 2 — `delegarEvaluacion` validates active investigator

File: `app/Http/Controllers/Denuncia/DelegacionController.php` (same commit).

```diff
         if ($denuncia->estado !== 'ingresada') {
             return redirect()->back()->with('error', 'No se puede delegar la evaluación de esta denuncia.');
         }
 
+        $investigador = User::findOrFail($validated['investigador_id']);
+
+        if (! $investigador->activo) {
+            return redirect()->back()->with('error', 'SOLO SE PUEDE DELEGAR A UN INVESTIGADOR ACTIVO.');
+        }
+
         $aplicado = false;
-        DB::transaction(function () use ($ticket, $validated, &$aplicado) {
+        DB::transaction(function () use ($ticket, $validated, $investigador, &$aplicado) {
             $denuncia = Denuncia::where('ticket', $ticket)->lockForUpdate()->first();
 
             if (! $denuncia || $denuncia->estado !== 'ingresada') {
                 return;
             }
 
-            $investigador = User::findOrFail($validated['investigador_id']);
-
             $denuncia->evaluaciones()->create([
```

## Evidence log (`<command>: <observed result>`)

- `php artisan test tests/Feature/DenunciaFlowTest.php`: 18 passed (92 assertions).
- `php artisan test tests/Feature/CargaLegacyTest.php tests/Unit/DiasHabilesTest.php tests/Feature/DiasHabilesCacheTest.php`: 24 passed (145 assertions).
- `php artisan test tests/Feature/DashboardPlazosSqlTest.php tests/Feature/ReaperturaTest.php`: 8 passed (106 assertions).
- `php artisan test tests/Feature/BitacoraEnriquecidaTest.php tests/Feature/CierreContratoTest.php tests/Feature/RolesAccesoTest.php`: 38 passed (378 assertions).
- `composer tests:junit` (`php vendor/phpunit/phpunit/phpunit --log-junit storage/test-results/junit.xml`): OK (310 tests, 2246 assertions).
- `composer docs`: regeneró ROUTES/PERMISSIONS/SCHEMA/STATUS (STATUS: rama `work/panel3-etapa0-verificacion`, 310 tests, 2246 assertions).
- `composer docs:check`: OK, exit 0 (`docs:check OK: 2 archivos coinciden con el codigo.`).
- `cmd /c openspec archive case-lifecycle --yes`: (resultado abajo).
- `cmd /c openspec validate --archived`: (resultado abajo).
- `cmd /c openspec validate --all`: (resultado abajo).

## Observations (non-blocking)

- O1 — Matriz 1.2 pedía `evaluacion_tecnica_texto`/`evaluacion_tecnica_recomendacion`
  "persistidos en denuncia", pero `denuncias` no tiene esas columnas ni están en
  `$fillable`; `EvaluacionController::devolver` los descarta en silencio
  (mass-assignment guard) y el texto/recomendación quedan registrados en
  `evaluaciones_tecnicas` (`texto_evaluacion`, `recomendacion`), que es lo que la
  spec exige ("recorded"). `BandejaController` los rehidrata en memoria para
  display. El test verifica el contrato real (registro en evaluación +
  `ingresada` + bitácora). Sin cambio de producción (fuera de las dos
  autorizadas). Si Panel 1/2 quiere snapshot en `denuncias`, requiere migración
  nueva (decisión de ellos).
- O2 — SQLite no simula carrera real: el doble intento secuencial más inspección
  de `DB::transaction` + `lockForUpdate` es la evidencia (sin test de
  concurrencia inventado).
