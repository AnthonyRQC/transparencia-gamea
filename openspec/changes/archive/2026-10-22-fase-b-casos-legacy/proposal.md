# Proposal

## Why

The unit holds stacks of physical case files (ongoing and closed from past
gestiones) that will never be re-typed through the normal 5-day admission
flow. Without a fast legacy intake, adoption stalls: investigators keep
parallel paper folders and the system goes blind. Fase B adds a minimal,
no-bureaucracy loader with two modes — ongoing (`en curso`) and historical
(`historico`) — while keeping tickets collision-free and reports relational.

## What Changes

- `denuncias` gains nullable `investigador_referencia` (`string 150`) for
  the ex-lawyer/ex-official on historical records.
- `PermisosCatalogo` (+ `permissions.ts` mirror) gains
  `denuncia.cargar-legacy` (investigador, jefe) and
  `denuncia.cargar-historico` (jefe, registrador); admin excluded.
- `POST /denuncias/legacy` (`StoreLegacyDenunciaRequest` +
  `Denuncia/LegacyController@store`) creates the case with backdated dates,
  manual folder numbers in both modes (auto ticket only when omitted in
  ongoing mode), high-water-mark counter bump, forced investigator rules,
  `cierres`/`informes_finales` rows, and `bitacora(ingreso_legacy)`.
- `ModalCargarLegacy.tsx` mounted in MisCasos / Bandeja / ConsultarCasos.
- `ModalConciliarFechas` splits into Admision/Rechazo modals (same endpoint).

## Capabilities

### New Capabilities

- `legacy-case-loading`: two-mode legacy intake with ticket safety.

### Modified Capabilities

- None (existing `public-portal` / `public-consultation` untouched;
  `conciliar-fechas` endpoint unchanged).

## Impact

- Backend: migration, `Denuncia`, `PermisosCatalogo`, new Request +
  Controller, route, `Cierre`/`InformeFinal` writes, bitacora.
- Frontend: `ModalCargarLegacy`, `permissions.ts`, 3 mount pages, 2 new
  conciliacion modals (old one removed).
- Tests: `CargaLegacyTest` (auto-assign, historico null investigator,
  referencia+clasificacion, redirect on denied, duplicate ticket 422).
- No flow changes to admission/assignment/closure of normal cases.
