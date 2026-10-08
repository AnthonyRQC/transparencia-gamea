# Design

## Context

See `proposal.md` (Why) and `specs/public-consultation/spec.md` (contract).
Current state (verified in code): `SeguimientoController::buscar`
(`app/Http/Controllers/SeguimientoController.php:14`) validates
`/^DEN-\d{4}-\d{4}-\d{4}$/`, splits ticket vs 4-digit token, queries
`where('ticket', …)->where('token_consulta', …)`, and returns distinct
`invalido` / `no_encontrado` errors. Route has `throttle:30,1`
(`routes/web.php:26`). `Denuncia::generarToken(4)` emits `random_int` digits;
column is `varchar(4)` (`2026_07_26_165000_create_denuncias_table.php:14`).
`mapPublicData` emits `toDateTimeString()` + constant `fecha_vencimiento: null`.
Frontend: `BuscadorTicket` (strict regex, uppercase, `maxLength={19}`),
`Buscar.tsx` (5 states), `ResultadoSeguimiento` (`formatearFechaLarga`, already
date-only capable), wall ticket filter without token (`MuroQuery:127,145`).

## Goals / Non-Goals

**Goals:** close the enumeration oracle, raise token entropy for new cases,
strip time precision, lock the public contract, ship friendly Spanish copy +
minimal accessible polish — all without breaking printed vouchers.

**Non-Goals:** voucher reissue, token rotation, wall redesign, expiry estimates,
per-user attempt tracking (IP throttle suffices at this scale).

## Decisions

1. **Single server error, keep client format hint.** Controller returns one
   `error` value for malformed and unknown pairs; `Buscar.tsx` renders one
   generic block. Client-side regex stays as input help (it reveals nothing
   about existence). *Alternative rejected:* POST body — breaks shareable
   voucher flow and the `home?buscar=` convenience link.
2. **Throttle 10/min on the route only.** `throttle:10,1` replaces `30,1` on
   `seguimiento.buscar`; 429 rendered friendly-Spanish via the exception
   handler scoped to the route name (Inertia-aware), fallback plain text.
   *Alternative rejected:* custom middleware — `throttle` is already the
   project idiom (`home`, `panel.descargar`).
3. **New tokens: 6 chars, unambiguous alphabet.** `generarToken(6)` from
   `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` (no `0/O/1/I` → fewer voucher misreads);
   stored uppercase. Lookup applies `strtoupper(trim())` explicitly so SQLite
   tests and MySQL behave identically regardless of collation.
   *Alternative rejected:* longer numeric PIN — less entropy per printed char.
4. **DDL `varchar(4)` → `varchar(6)`, no data change.** New migration altering
   the column; legacy values untouched; factory switches to `generarToken()`
   while tests pin legacy `1001`-style values explicitly where needed.
5. **Date-only at the source.** `mapPublicData` emits `toDateString()` for
   ingress/closure; frontend keeps `formatearFechaLarga` (already ignores time).
   `fecha_vencimiento` stays `null`; copy references business-day timeframes.
6. **Wall untouched.** `MuroQuery` ticket filter remains tokenless (public by
   design); the change guarantees wall payloads carry no contract data.

## Risks / Trade-offs

- [Risk] Legitimate user hits 429 on shared NAT/cybercafé IP → Mitigation:
  friendly message states the wait; limit is per-minute, self-clearing.
- [Risk] `varchar` widening on large prod table locks writes → Mitigation:
  single instant widening DDL on MySQL 8 (`ALGORITHM=INPLACE` for widening);
  run in low-traffic window.
- [Risk] Users misread new ambiguous-free alphabet against old vouchers →
  Mitigation: dual regex + helper text showing both shapes; lookup normalizes
  case and trims whitespace/dashes.
- [Trade-off] Keeping GET in query string leaves tickets in access logs —
  accepted: voucher usability outweighs; no new server-side ticket logging added.

## Migration Plan

1. Deploy DDL + code together (widening is backward-compatible with 4-digit reads/writes).
2. Rollback: revert code; column stays `varchar(6)` harmlessly (no down-migration data loss).
3. No seeder refresh required; existing vouchers keep resolving.

## Open Questions

None — Q1–Q4 closed the frontier; remaining details (exact 429 wording,
helper-text phrasing) are copy-level and settled at apply time within the
Spanish-only, institutional-tone constraint.
