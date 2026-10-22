# Design

## Context

See `proposal.md` for motivation. Current state: `ArchivosCasoController::subir()`
writes `DenunciaArchivo` with no bitacora; CI validated with `digits_between:6,9`
in 3 spots (`DenunciaController::store/editar`, `StoreDenunciaRequest`);
`pruebas` has no `testigo_ci`; clipboard uses bare `navigator.clipboard`;
passwords are plain inputs; wall filtering already supports dedicated `ticket`
param (`MuroQuery::baseQuery` + `Welcome.filtros.ticket`); `ReporteExcel::valor()`
returns raw strings. `Denunciante` already uppercases `ci` via `UppercaseText`;
`denunciantes.ci` is already string-nullable.

## Goals / Non-Goals

**Goals:** 7 additive units, each with focused test; no flow/permission change;
reuse existing patterns (`bitacora()->create()`, `MuroQuery ticket`, fallback in
`ModalExito`).

**Non-Goals:** CI regex; required testigo CI; wall param rename; Excel column
changes; legacy data backfill.

## Decisions

- **Bitacora inline in `subir()`** over observer: matches `store()`/`editar()`
  pattern, keeps `detalle` with file name; only on success path after `create()`.
- **CI: change validation only** (`nullable|string|max:20`) in the 3 spots;
  no DB migration (column already string). Uppercase free via existing trait.
- **`testigo_ci`: single migration** `add_testigo_ci_to_pruebas` (string 20,
  nullable, after `testigo_telefono`); add to `Prueba` fillable (no uppercase —
  CI may carry lowercase complemento? Actually uppercase consistent: keep raw,
  model has no uppercaseFields for testigo fields; store as-given, validate
  max:20). Validation in both `DenunciaController::store` and
  `StoreDenunciaRequest` + persist in `store()` create loop.
- **Clipboard: shared `copiarTexto()` helper** (`resources/js/helpers/clipboard.ts`)
  with `navigator.clipboard` fast-path + textarea/`execCommand` fallback;
  `ModalCredencialTemporal` adopts it (same toasts).
- **Password: shared `PasswordInput` component** with Eye/EyeOff toggle; adopt in
  `Login` (TextInput→PasswordInput), `UpdatePasswordForm` (3 fields),
  `ModalCrearUsuario` (replaces `type=text`). Generator button in
  `ModalCrearUsuario`: `GAMEA-<ci>` else 8-char alphanumeric.
- **Wall link: `/?ticket=<TICKET>`** (existing dedicated param, not `buscar`);
  button in `DenunciaSheet` header area near avisos block using `Link`/`<a>`.
  Deviation from authorized `?busqueda=` documented: that param does not exist.
- **Excel: private `sanitizar()` in `ReporteExcel`** applied at the end of
  `valor()` to every returned string: `preg_match('/^[=+\-@]/', $v) ? "'".$v : $v`.
  Headings untouched (static labels).

## Risks / Trade-offs

- [Uppercase CI] Existing numeric CIs unaffected; mixed-case extensions
  normalized on next write only → accepted.
- [testigo_ci read paths] Case detail APIs serializing `pruebas` get a new key;
  frontend types updated in same unit → mitigated.
- [Excel `'` prefix] Visible leading `'` in some viewers for risky cells;
  standard OWASP CSV-injection defense → accepted.
- [Clipboard fallback] `execCommand` deprecated but still the only sync fallback
  on HTTP → accepted, isolated in helper.
