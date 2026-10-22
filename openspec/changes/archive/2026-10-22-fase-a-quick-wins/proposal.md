# Proposal

## Why

File uploads leave no audit trace, Bolivian CI formats with extensions are
rejected, witness traceability is missing, clipboard copy fails on plain HTTP,
password fields lack visibility toggles, case-to-wall navigation requires manual
ticket typing, and Excel exports are vulnerable to formula injection. Fase A
fixes all seven with minimal, reviewable units while keeping the suite green.

## What Changes

- `ArchivosCasoController::subir()` records `bitacora(accion='archivo_subido')`
  with file name after a successful upload.
- `denunciante.ci` validation becomes `nullable|string|max:20` (free, uppercase
  via existing `UppercaseText`) in `DenunciaController::store()/editar()` and
  `StoreDenunciaRequest`.
- `pruebas` gains optional `testigo_ci` (`nullable|string|max:20`): migration +
  model + validation + registration form + `types/denuncia.ts`.
- Clipboard copy in `ModalCredencialTemporal` gains a non-secure-context
  fallback (textarea + `execCommand`) with identical toasts.
- Password visibility toggle (Eye/EyeOff) on login, profile password form, and
  new-user modal; new-user modal gains a `GAMEA-<CI>` generator button
  (8-char fallback when CI is empty).
- Case detail sheet gains a button linking to the public wall filtered by the
  case ticket via the existing dedicated `?ticket=` param.
- `ReporteExcel` prefixes `'` to any string cell starting with `= + - @`.

## Capabilities

### New Capabilities

- `case-file-audit`: audit trail for case file uploads.
- `ci-alphanumeric`: Bolivian alphanumeric CI acceptance on reports.
- `witness-traceability`: optional witness CI on evidence records.
- `credential-clipboard`: reliable credential copy on any context.
- `password-ux`: password visibility toggles plus generator default.
- `case-wall-navigation`: one-click navigation from case to its wall notices.
- `excel-sanitization`: formula-injection guard on Excel exports.

### Modified Capabilities

- None (all additive; existing specs `public-portal` / `public-consultation`
  untouched).

## Impact

- Backend: `ArchivosCasoController`, `DenunciaController`, `StoreDenunciaRequest`,
  `Prueba` model + migration, `ReporteExcel`.
- Frontend: `ModalCredencialTemporal`, `ModalCrearUsuario`, `Login`,
  `UpdatePasswordForm`, `DenunciaSheet`, registration form, shared password/clipboard helpers.
- Tests: new PHPUnit coverage per unit (bitacora, CI, testigo_ci, Excel);
  clipboard/password/wall-link verified via `npm run build` + manual checks.
- No permission, flow, or DB-type changes (`denunciantes.ci` already string).
