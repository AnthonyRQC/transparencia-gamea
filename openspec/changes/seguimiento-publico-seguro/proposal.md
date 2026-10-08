# Proposal

## Why

The public case lookup by ticket (`GET /seguimiento` + landing CTA) leaks an
enumeration oracle (distinct `invalido` vs `no_encontrado` errors), runs on a
4-digit numeric token (~10k combos over a predictable sequential ticket), and
exposes timestamps with hour precision — all against Ley 974 Arts. 24 (identity
reserve) and 29 (strict confidentiality). Hardening is due now, before the
pre-defensa técnica, while printed vouchers must keep working.

## What Changes

- Public response contract fixed to non-sensitive fields only: legible status +
  progress steps + progress message + legible type + rejection summary
  (Art. 23-II) + closure classification label; dates as `Y-m-d` with no time;
  `fecha_vencimiento` stays `null`.
- Single generic error for malformed and not-found lookups (oracle closed),
  with friendly Spanish copy stating reference timeframes in business days.
- `GET /seguimiento` throttled to 10 req/min per IP with a friendly Spanish
  429 response.
- New `token_consulta` generation: 6 uppercase alphanumerics; legacy 4-digit
  numeric tokens remain valid; case-insensitive matching (`strtoupper` both ends).
- Minimal accessible UI polish on the lookup flow: dual-format helper text,
  `aria-live` result/error regions, visible focus, date-only rendering.
- New feature test `SeguimientoSeguroTest` covering contract, generic error,
  throttle, dual tokens, date shape, and identity-leak absence.

Out of scope: landing/`Welcome` redesign, `PanelInformativo` wall changes,
restricting the public wall ticket filter (public by design), expiry-date
estimates, token rotation for existing cases.

## Capabilities

### New Capabilities

- `public-consultation`: public, unauthenticated case-status lookup by
  ticket+token — allowed response contract, error semantics, anti-enumeration
  limits, token formats, and accessibility of the lookup flow.

### Modified Capabilities

(none — first spec in this project)

## Impact

- Affected code: `app/Http/Controllers/SeguimientoController.php`
  (`buscar`, `mapPublicData`), `app/Models/Denuncia.php::generarToken`,
  `routes/web.php` (`seguimiento.buscar` throttle), `BuscadorTicket.tsx`,
  `Pages/Seguimiento/Buscar.tsx`, `ResultadoSeguimiento.tsx`.
- One DDL migration: `token_consulta` `varchar(4)` → `varchar(6)`; no data change,
  legacy values untouched.
- No API/version break for voucher holders; legacy tokens keep resolving.
- Dependencies: none new (Laravel `throttle`, existing `helpers/fechas.ts`).
