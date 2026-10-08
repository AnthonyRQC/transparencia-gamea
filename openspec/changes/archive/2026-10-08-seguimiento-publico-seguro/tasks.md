# Tasks

## 1. Backend: contract, tokens, throttle, DDL

- [x] 1.1 Add `varchar(4)` → `varchar(6)` migration for `denuncias.token_consulta` and verify `php artisan migrate` + `migrate:fresh --seed` (dev DB) both succeed.
- [x] 1.2 Switch `Denuncia::generarToken()` to 6 uppercase alphanumerics from the unambiguous alphabet and verify a new `DenunciaFactory` row matches `^[A-Z0-9]{6}$`.
- [x] 1.3 Harden `SeguimientoController::buscar` (single generic error, `strtoupper(trim())` normalization, dual-shape validation, `toDateString()` dates, `fecha_vencimiento` null) and verify the new `SeguimientoSeguroTest` backend cases pass (contract fields only, no identities, date-only shape, identical error for bad shape vs unknown pair).
- [x] 1.4 Set `throttle:10,1` on `seguimiento.buscar` with friendly Spanish Inertia-aware 429 and verify the 11th request in a minute returns 429 with the retry message and no case data.

## 2. Frontend: dual input, generic states, accessible copy

- [x] 2.1 Extend `BuscadorTicket` to the dual regex (legacy 4-digit + new 6-char), uppercase normalization, dual-format helper text, and verify `npx tsc --noEmit` passes plus both voucher shapes submit.
- [x] 2.2 Collapse `Buscar.tsx` invalid/not-found into one generic block, update copy to business-day timeframes with no closing-date promise, add `aria-live` announcements, and verify all five visual states (initial, loading, result, generic error, 429) render in light + dark.
- [x] 2.3 Confirm `ResultadoSeguimiento` renders date-only values and the wall link unchanged, and verify no identity/document field is referenced in the public components.

## 3. Verification and evidence (STOP, no commit)

- [x] 3.1 Run `npm run build` clean and record `<comando>: <resultado observado>` in `odd/tasks/seguimiento-publico-seguro.md`.
- [x] 3.2 Run the full phpunit suite (206 tests green, incl. `SeguimientoSeguroTest`) and record `<comando>: <resultado observado>` in the task doc.
- [x] 3.3 Run `openspec validate --change seguimiento-publico-seguro` (or `openspec status --change seguimiento-publico-seguro`) green, list modified files for Lazygit review, and STOP without committing.

## Workflow follow-up

- Apply this change via `/opsx-apply` (or explicit request) before archiving.
- Archive the change after review requirements are satisfied.
