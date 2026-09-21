# Export columns contract and Denuncias barrels removal

## Objective

Remove two duplicated contracts that can drift silently:

1. The Excel export column catalog lives twice (backend constant map and a
   frontend copy inside `ModalExportar`). The backend becomes the single
   source of truth and the modal consumes it from the preview response.
2. `resources/js/Components/Denuncias/*.tsx` keeps 63 root-level compatibility
   barrels that re-export canonical files under `Card/`, `Form/`, `Sheet/`,
   `Shared/`, `Modales/`, `Tabs/`, `Solicitud/` and `Descargo/`. Every
   component gets two valid import paths. Barrels are removed and all
   consumers import canonical paths.

## Problem

Audit finding #4 (verified):

- `ReporteController::COLUMNAS_EXCEL` (18 entries, key => CAPS header) and the
  local `COLUMNAS_EXCEL` in `ModalExportar.tsx` (same 18 keys, Title Case
  labels, `fija` flags) must be edited together. A comment says so; nothing
  enforces it. `COLUMNAS_DEFAULT` is also duplicated (10 keys).
- The backend validates requested keys against `array_keys(COLUMNAS_EXCEL)`
  and drops unknown keys, but the frontend never knows the canonical catalog
  or the fixed-column rule. Fixed columns are a UI-only behavior today.
- 63 barrels under `Components/Denuncias/` create two import paths per
  component (76 root-level import lines). Drift appears when one path is
  updated and the other is not.

## Why

Export behavior must stay identical for users, but the column catalog must
have one authority: the backend. Removing barrels reduces navigation and
review ambiguity with no runtime change: imports resolve to the same modules.

## Scope

Backend:

- `app/Http/Controllers/ReporteController.php`
- `tests/Feature/ReporteTest.php`

Frontend:

- `resources/js/Components/Dashboard/ModalExportar.tsx`
- `resources/js/types/dashboard.ts`
- `resources/js/Components/Denuncias/*.tsx` (63 barrels deleted)
- Consumer imports rewritten to canonical paths (11 files):
  `Pages/Denuncias/{Bandeja,MisCasos,ConsultarCasos,Evaluaciones,MiResumen,RegistroDenuncia}.tsx`,
  `Pages/{Admin/Publicaciones,Notificaciones/Index,Reportes/Index}.tsx`,
  `Components/Publico/PanelInformativo.tsx`,
  `Components/Denuncias/Tabs/TabInformeCierre.tsx`.

Out of scope: DB schema, export column set/order/labels, Excel/PDF output,
`ModalDrillDown` (preview fields are additive), fixed-column server
enforcement, other `Components/Denuncias` refactors.

## Constraints

- Identical behavior: toggle, disabled fixed checkboxes, selected count,
  empty-selection validation, `descargar()` payload (`columnas[]` + `formato`),
  pagination without selection reset.
- Labels keep the institutional CAPS convention (now served by backend).
- Selected columns initialize from `columnas_default` only on the first
  preview load after opening; pagination must not reset user selection.
- Keys stay single-source in `ReporteController`; no schema or route changes.
- Rewritten imports must resolve to the same default/named exports; a barrel
  may only be deleted when its canonical module preserves everything its
  consumers use.

## Checklist

- [x] T1: feature doc created and mirrored in Engram before the first source write.
- [x] T2: `ReporteController` exposes `COLUMNAS_FIJAS` and a `preview` payload
      with ordered `columnas` (`key`/`label`/`fija`) and `columnas_default`.
- [x] T3: tests assert `columnas` keys/order/labels match `COLUMNAS_EXCEL`,
      `fija` equals `COLUMNAS_FIJAS`, `columnas_default` equals the const and
      `columnasPedidas` still filters unknown keys.
- [x] T4: `ModalExportar` removes local catalogs, consumes the contract and
      initializes selection only on first load; types added to `types/dashboard.ts`.
- [x] T5: barrel mapping generated from barrel contents, all 76 root-level
      imports rewritten, 63 barrels deleted; named exports preserved
      (`createDenunciadoItem`, `createPruebaItem`).
- [x] T6: evidence recorded (commands + results + SHAs + `git diff --stat`),
      Engram mirror updated, tree clean.

## Authorized scope

- The paths listed under Scope plus this document.

## Acceptance criteria

- [x] `preview()` returns the column contract; unknown requested keys are
      dropped and empty/invalid selection falls back to the default.
- [x] Modal renders checkboxes from the response (labels and `fija` included)
      and never resets selection on pagination.
- [x] Zero `from '@/Components/Denuncias/<RootName>'` matches remain; zero
      barrel files remain under `Components/Denuncias/` root.
- [x] Named exports consumed through barrels still resolve after deletion.
- [x] `artisan test --filter=Reporte`, full `artisan test` and `npm run build`
      pass.
- [x] `git status --short` is clean after the evidence commit.

## Applicable checks

- `& "C:\laragon\bin\php\php-8.3.30-Win32-vs16-x64\php.exe" artisan test --filter=Reporte`
- `& "C:\laragon\bin\php\php-8.3.30-Win32-vs16-x64\php.exe" artisan test`
- `npm run build`
- Root-import remnant scan and barrel count over `resources/js`
- `git status --short`, `git diff --stat`, `git log --oneline`

## Verification evidence

- `& "C:\laragon\bin\php\php-8.3.30-Win32-vs16-x64\php.exe" artisan test --filter=Reporte`:
  17 passed (101 assertions).
- `& "C:\laragon\bin\php\php-8.3.30-Win32-vs16-x64\php.exe" artisan test`:
  182 passed (1280 assertions).
- `npm run build`: passed (`tsc && vite build`, 4639 modules transformed,
  built in 9.07s).
- Remnant scan (root-level barrel imports over `resources/js` `*.ts`/`*.tsx`):
  76 before Unit 2 (11 files), 0 after. Barrel files: 63 before, 0 after.
- Named-export verification: 9 barrels re-exported extra names via `export *`;
  7 were no-ops (canonical modules export only default) and 2 carried
  `createDenunciadoItem` / `createPruebaItem`, migrated to canonical
  `Form/BloqueDenunciado` and `Form/BloquePrueba`; `tsc` and the build pass.
- Commits:
  - `f9c5961cf3ea6088334dc5163576170d59c852a1`
    `refactor(reportes): contrato unico de columnas de exportacion desde backend`
    — 5 files, +198/-33 (controller, modal, types, tests, this document).
  - `1f4048eb669e1b464f7c2a048f6b4a95ad57fc3a`
    `refactor(denuncias): eliminar barrels de compatibilidad e importar rutas canonicas`
    — 74 files, +76/-148 (11 imports rewritten, 63 barrels deleted).
  - `docs(odd): registrar evidencia de contrato-export-barrels` — this evidence
    update; its SHA is recorded in the Engram mirror (the committed copy lists
    it as pending, same pattern as prior units).
- `git status --short`: clean after the evidence commit.
- Manual browser checks (pending, user): export modal renders checkboxes from
  the contract and the Excel download works; Bandeja and MisCasos open with
  their modals (canonical imports).
