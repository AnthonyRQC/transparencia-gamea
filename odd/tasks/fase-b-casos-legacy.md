# Fase B Legacy Cases — Carga Legacy e Historica (Adoption Lifeline)

## Objective
Let investigators, chiefs (jefes) and registrars bulk-load pre-existing
physical case files into the system, so the unit can adopt the app without
re-typing history or losing the folders already on their desks. Two modes:
ongoing cases (`en curso`, states `investigacion|informe`, current-year
ticket) and closed historical records (`historico`, state `cerrada`,
`DEN-{gestion}-{numero}` ticket, no ghost investigator).

## Scope
- Migration: `investigador_referencia` (`string(150)`, nullable,
  `after('investigador_id')`) on `denuncias`; fillable + uppercase.
- `PermisosCatalogo`: `denuncia.cargar-legacy`, `denuncia.cargar-historico`;
  investigador → legacy; jefe → both; registrador → historico; admin → none
  (least privilege, admin never handles Ley 974 cases). Legacy delegable,
  historico not; mirror in `resources/js/permissions.ts`.
- Backend: `POST /denuncias/legacy` + `StoreLegacyDenunciaRequest` +
  `Denuncia/LegacyController@store`. Minimal common fields (tipo, hechos,
  denunciante_nombre/anonimo, denunciados_texto `NOMBRE | DEPENDENCIA` lines
  min 1, fecha_recepcion past). Both modes accept optional manual
  `gestion`+`numero_ticket` (physical folder number); auto ticket only when
  omitted in ongoing mode. High-water mark: `gestion == current year` and
  `numero >= siguiente_numero_ticket` bumps the counter to `numero + 1`.
  Investigator: forced `Auth::id()`; jefe: selector (self or active
  investigator). Historico: `investigador_id = null`, forced `cerrada`,
  `fecha_cierre`, optional `investigador_referencia`. Optional
  `clasificacion_id` when state is `informe|cerrada` → creates
  `informes_finales` row; historico always creates `cierres` row. Category
  derived by tipo (`otra_corrupcion`/`otra_negacion`) when absent. Token via
  `Denuncia::generarToken()`. `es_legacy = true` forced server-side.
  `created_at`/`fecha_admitida` backdated via `forceFill`;
  `fecha_asignada = now()` in ongoing mode. Bitacora `ingreso_legacy`.
  Ongoing mode notifies `caso.admitir` holders; historico notifies nobody.
- Frontend: `ModalCargarLegacy.tsx` mounted in MisCasos (investigador,
  ongoing self-assigned), Bandeja (jefe, both modes + investigator selector),
  ConsultarCasos (registrador, historico). Conditional final-classification
  dropdown (global `clasificaciones` page prop) only for `informe|cerrada`.
- Split `ModalConciliarFechas` → `ModalConciliarAdmision.tsx`
  (`fecha_admitida` only) + `ModalConciliarRechazo.tsx` (`fecha_rechazada`
  only); same `conciliar-fechas` endpoint, `justificacion` min 20 stored in
  `conciliacion_json.motivo`; never touches `justificacion_rechazo`.

## Out of scope
- Admin loading cases; legacy file uploads; editing legacy payload after
  creation (normal edit flow applies); ticket format changes; report query
  changes (relational rows already feed KpiQuery).

## Design decisions (authorized 2026-10-11)
1. Admin excluded (least privilege).
2. Manual folder number allowed in both modes + high-water-mark counter bump.
3. Mount points: MisCasos / Bandeja / ConsultarCasos.
4. Category derived by tipo when absent.
5. Denunciados: `NOMBRE | DEPENDENCIA` per line, min 1, parsed in
   `prepareForValidation()`.
6. Rechazo modal only conciliates `fecha_rechazada` + justificacion.
7. Unauthorized web access asserts `assertRedirect('/dashboard')` (403 is
   converted to redirect+toast by `bootstrap/app.php`).
8. Token generation, forceFill backdate, cierres+informes rows, uppercase
   reference, strict permissions.ts mirror — all approved.

## Acceptance criteria
- [x] Investigator ongoing load self-assigns (`investigador_id = Auth::id()`).
- [x] Historico is `cerrada` with `investigador_id = null` and `plazo === null`.
- [x] `investigador_referencia` + `clasificacion_id` persisted (informe row).
- [x] Manual folder number respected; counter bumped per high-water mark.
- [x] Unauthorized roles redirect to `/dashboard`.
- [x] `phpunit` suite green + `npm run build` clean.

## Verification
- `phpunit --filter=CargaLegacyTest`: OK (8 tests, 38 assertions) — 2026-10-11
- `npm run build`: clean (tsc + vite, 4650 modules, built in 1m04s) — 2026-10-11
- `phpunit` full suite: OK (231 tests, 1741 assertions) — 2026-10-11 (baseline 223 + 8 new)
- `phpunit` full suite final: OK (239 tests, 1790 assertions) — 2026-10-14

## Evidence
- Branch `feat/fase-b-casos-legacy` and `feat/fase-b-pulido` merged to `main` via fast-forward.
- Commits:
  - `4036846` feat(denuncias): agregar soporte para carga de casos preexistentes y legado institucional
  - `a85643b` feat(ui): implementar modal de carga legacy con dependencias hibridas y validacion inline
  - `28f11d5` feat(sheet): exhibir trazabilidad legacy, responsable historico y digitalizador
