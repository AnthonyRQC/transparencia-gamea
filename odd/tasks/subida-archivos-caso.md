# Case Files: Real Upload and Download

## Objective

Make the case-files flow store and serve real files: `subir()` persists
the uploaded binary on the `local` disk with real path/size/mime, a
download route is exposed, the modal sends a real `File`, and the table
offers a download action with human-readable size.

## Problem

The `denuncias_archivos` flow is a stub:

- `ArchivosCasoController::subir()` validates metadata only, never calls
  `$request->file()`, and fabricates `archivos/demo/{ticket}/{nombre}`.
  `tamano` and `mime_type` are stored as `null`.
- `download()` exists but has no route, so nothing can be downloaded.
- `ModalArchivosDelCaso.tsx` posts metadata only (no file input) and
  fetches the list from a hardcoded `/transparencia/public/...` URL.
- `TablaArchivosCaso.tsx` shows raw size values and has no download action.

Legacy rows created by the stub (`path` starting with `archivos/demo/`)
will fail download with "Archivo no encontrado en el almacenamiento."
This is expected and is not a regression.

## Why

The database schema (`denuncias_archivos`: nombre, path, tamano,
mime_type, contexto, fechas) is already ready, so a bounded fix closes a
real Phase 1 gap without migrations. This basic fix is also a
prerequisite for the deferred large-files sprint (chunked/resumable
upload), which can later mount on the same disk abstraction.

## Scope

Files that change:

- `app/Http/Controllers/ArchivosCasoController.php` (subir, download)
- `routes/denuncias.php` (add `archivos.descargar`)
- `tests/Feature/ArchivosCasoSubidaTest.php` (new)
- `tests/Feature/ArchivosCasoTest.php` (minimal update: the existing
  `test_can_subir_archivo` posts no file and must follow the new contract)
- `resources/js/Components/Denuncias/Modales/General/ModalArchivosDelCaso.tsx`
- `resources/js/Components/Denuncias/Shared/TablaArchivosCaso.tsx`
- `odd/tasks/subida-archivos-caso.md` (this document)

Out of scope: schema/migrations, seeders, packages, any other file.
`ModalSubirArchivo.tsx` stays untouched (orphaned; follow-up cleanup).

## Constraints

- Keep existing file conventions: Spanish user-facing messages, existing
  naming, no new decorative comments.
- Reuse the permission pattern: route `can:<permiso>` plus a case-level
  `CasoAuth::puedeOperar()` check in the controller.
- `listar()` behavior is unchanged; it has no case-level check
  (pre-existing, follow-up).
- `download()` mirrors `eliminar()` with `archivo.ver`. Resolution
  (commit `0ca0764`): `archivo.ver` was added to
  `CasoAuth::PERMISOS_SUPERVISOR`, so a jefe with `caso.asignar`
  downloads any case file, exactly like subir/eliminar; owner access
  is unchanged.
- Accepted types and 50MB cap must match the orphaned modal constants.
- No push, no PR. Two work-unit commits plus one small evidence commit.

## Checklist

- [x] T1: Controller real upload (validation, store, path/tamano/mime)
  and download case-level check.
- [x] T2: Route `denuncias.archivos.descargar` after line 84.
- [x] T3: Feature tests with `Storage::fake('local')` + update of the
  stale existing upload test.
- [x] T4: Modal real file selection, client validation, chip, FormData
  submit, route-based list fetch.
- [x] T5: Table download action + human-readable size formatting.
- [x] T6: Verification evidence recorded (commands + SHAs + stats) and
  Engram mirror updated.

## Authorized scope

- `app/Http/Controllers/ArchivosCasoController.php`
- `routes/denuncias.php`
- `tests/Feature/ArchivosCasoSubidaTest.php`
- `tests/Feature/ArchivosCasoTest.php`
- `resources/js/Components/Denuncias/Modales/General/ModalArchivosDelCaso.tsx`
- `resources/js/Components/Denuncias/Shared/TablaArchivosCaso.tsx`
- `odd/tasks/subida-archivos-caso.md`

## Acceptance criteria

- [x] `subir()` requires `archivo` (`file`, mimes pdf/jpg/jpeg/png/docx,
  max 51200 KB) and stores it via `$file->store("archivos/{$ticket}", 'local')`.
- [x] Persisted row has real `path`, `tamano` (bytes string) and
  `mime_type`; metadata mapping and `CasoAuth` check unchanged.
- [x] `GET /denuncias/archivos/{id}/descargar` (named
  `denuncias.archivos.descargar`, `can:archivo.ver`) returns the stored
  file or the existing error redirect.
- [x] Modal submits the real file with `forceFormData: true` and resets
  state after success; list fetch uses `route('denuncias.archivos.listar')`.
- [x] Table shows a download link and formats size as B/KB/MB, `—` when null.
- [x] Focused and full backend suites green; typecheck + build green.

## Applicable checks

- `php artisan test --filter=ArchivosCaso`
- `php artisan test`
- `npx tsc --noEmit`
- `npm run build`
- `git status --short`, `git diff --stat`, `git log --oneline -3`

## Verification evidence

- `php artisan test --filter=ArchivosCaso`: 12 passed (30 assertions).
- `php artisan test` (full suite): 177 passed (1179 assertions).
- `npm run build` (`tsc && vite build`): built successfully in 7.22s.
- Commits:
  - `a5ff11a` feat(archivos): subida real de archivos del caso con
    almacenamiento y descarga — 5 files, +295/-3 (controller, route,
    new tests, stale test update, this doc).
  - `d18d4de` feat(archivos): selector de archivo real y descarga en
    la UI del caso — 2 files, +132/-9 (modal, table).
  - `0ca0764` fix(archivos): alinear descarga con supervisor como
    subir y eliminar — 2 files, +19/-0 (CasoAuth, test).
  - `docs(odd): registrar evidencia de subida de archivos` — this
    evidence update; its SHA is recorded in the Engram mirror (the
    committed copy lists it as pending, same pattern as prior units).
- Manual browser check pending: upload a PDF and download it from
  Bandeja/MisCasos with a real session (`npm run dev`).
