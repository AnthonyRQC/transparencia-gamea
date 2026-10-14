# Design

## Context

See `proposal.md`. Current state: `denuncias` has `es_legacy` (default false)
but no reference column; `PermisosCatalogo::ROLES` has no legacy perms and
`permissions.ts` mirrors it by hand; `Denuncia::generarSiguienteTicket()`
bumps `siguiente_numero_ticket` per current year; `store()` requires
`detalles.categoria`, `denunciados min:1`, generates token, notifies
`caso.admitir` holders; `plazo` returns null for `cerrada`; 403 on web
becomes redirect `/dashboard` + toast; `clasificaciones` ride global page
props; `categoria_id` is nullable; ticket is unique(20).

## Goals / Non-Goals

**Goals:** minimal fast form; no ghost investigators on historico; tickets
never collide (high-water mark); reports keep working via real `cierres` /
`informes_finales` rows; unauthorized web access redirects.
**Non-Goals:** admin loading; file uploads on intake; post-creation legacy
edit flow; ticket format change; altering `conciliar-fechas` semantics.

## Decisions

- **Single `POST /denuncias/legacy`, no `->can()` on route**: two alternative
  permissions cannot be expressed with one `can:`; the controller enforces
  mode-vs-permission by throwing `AuthorizationException` (redirect + toast on
  web). `authorize()` only requires an authenticated user: denying in the
  FormRequest, like `abort(403)`, returns a raw 403 that bypasses the
  `AccessDeniedHttpException` redirect handler (verified by test).
- **Manual `gestion`+`numero_ticket` in both modes** (physical folder number);
  auto `generarSiguienteTicket()` only when omitted in ongoing mode.
  Historico ticket `sprintf('DEN-%04d-%04d')`, `unique:denuncias,ticket`,
  never touches the counter — except high-water mark: `gestion == now()->year
  && numero >= counter` → counter = `numero + 1` in the same transaction.
- **Investigator forcing server-side**: `rol === 'investigador'` →
  `investigador_id = Auth::id()` (request value ignored); otherwise
  `investigador_id: required|exists:users,id` + active user that is either an
  investigator or oneself (self-assignment; `MisCasos` scopes by `Auth::id()`
  with no role check). Historico forces null.
- **Dates via `forceFill`** (`created_at` not fillable):
  `created_at = fecha_recepcion`, `fecha_admitida = fecha_recepcion` (both
  modes, keeps `calcularVencimiento()` consistent for closed-case KPIs),
  `fecha_asignada = now()` in ongoing mode.
- **Relational rows in-transaction**: historico always creates `cierres`
  (`notificado_denunciante=false`, `cerrado_at=fecha_cierre`,
  `concluido_por=referencia ?? loader name`, `cerrado_por_id=Auth::id()`);
  `clasificacion_id` present + state `informe|cerrada` creates
  `informes_finales` (`redactado_at=fecha_cierre ?? now()`,
  `clasificado_por_id=Auth::id()`). `es_legacy=true` never taken from input.
- **Category fallback** `otra_corrupcion`/`otra_negacion` by tipo (both seeded).
- **Denunciante**: `anonimo=true` → `escenario='anonimo'`, no name row data;
  else `escenario='revelada'` + `denunciante` row with name (or empty row when
  name omitted, mirroring `store()` behaviour of optional row).
- **Denunciados**: `prepareForValidation()` splits text/line array on newlines
  into `NOMBRE | DEPENDENCIA` pairs (`conoce_identidad=true`, `orden` kept).
- **Frontend**: one modal, mode tabs gated by `useCan`; investigator sees
  ongoing-only with fixed "Vos"; jefe sees both + investigator `<select>`
  (needs investigators list — new `carga-investigadores`-style prop or reuse
  endpoint; decided during implementation); registrador sees historico-only.
  Classification `<select>` from global `clasificaciones` prop, shown only for
  `informe|cerrada`.
- **Conciliacion split is view-only**: both modals post the same payload shape
  (`fecha_admitida` xor `fecha_rechazada` + `justificacion` min 20).

## Risks / Trade-offs

- [Ongoing born overdue] Backdated `fecha_recepcion` shows red/mora at once —
  correct, warn the client.
- [Historico without clasificacion] Invisible in `GROUP BY clasificacion`
  reports — accepted (field optional by design).
- [Manual numbers in current year] High-water mark prevents future collisions;
  concurrent loads serialize on the config row via `generarSiguienteTicket()`
  transaction only for auto mode; manual mode locks config row with
  `lockForUpdate` before compare-and-bump.
- [Legacy implies informe/cierre writes] `cargar-historico` implicitly
  authorizes those rows (no separate `informe.crear` check) — documented.
