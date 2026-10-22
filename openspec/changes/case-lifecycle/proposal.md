# Proposal: Case Lifecycle and Statutory Deadlines (Ley 974)

## Why

The complaint handling process at UTLCC is strictly governed by Bolivia's Ley N° 974, which imposes statutory deadlines (5 business days for qualification, 45/20 business days for investigation) and strict non-impugnable closures. Although the lifecycle was incrementally implemented across Sprints 1–8 and stabilized through Phase C, it lacked a canonical OpenSpec contract, leaving state transitions, race-condition defenses (`lockForUpdate`), date reconciliations, and deadline calculations under implicit "code + tests" rules. Formalizing this core contract is required by ADR D31 as the legal prerequisite before implementing Phase D (due-date calendar and explicit delay indicators).

## What Changes

- **Formal Case State Machine**: Specifies explicit transitions across all 8 states (`ingresada`, `evaluacion_tecnica`, `admitida`, `rechazada`, `asignada`, `investigacion`, `informe`, `cerrada`), substate (`archivada`), and legacy intake entry modes.
- **Statutory Deadlines Specification**: Formalizes calculation of business-day deadlines pursuant to Ley 974 (Arts. 23, 25, 30) and Ley 2341 (day 1 begins the next business day, excluding weekends and official municipal/national holidays).
- **Extension Ceilings in Business Days**: Formalizes maximum extension limits strictly in business days (up to +45 business days for corruption, total 90; up to +10 business days for denial of information, total 30).
- **Controlled Date Reconciliation State Window**: Formalizes `conciliarFechas` state window constraints (active pre-closure or rejection only; blocked on closed cases), requiring mandatory 20+ character justification, audited `conciliacion_json`, and immutable `bitacora` entry.
- **Reopening & Reversal Transitions**: Formalizes rules for supervisory case reopening (`rechazada`/`cerrada` to `ingresada`) and closure deletion (`cerrada` to `informe`).
- **Pessimistic Concurrency & Audit Invariants**: Mandates `lockForUpdate()` within database transactions for state-mutating operations and non-repudiation logging in `bitacora`.

## Capabilities

### New Capabilities

- `case-lifecycle`: Formal state machine, statutory deadline computation under Ley 974, business-day extension limits, date reconciliation state windows, reopening rules, and pessimistic locking invariants for complaint cases.

### Modified Capabilities

None. (Existing specs cover `public-consultation`, `public-portal`, and archived Phase A/B changes).

## Impact

- **Affected Backend**: `app/Models/Denuncia.php`, `app/Enums/EstadoDenuncia.php`, `app/Enums/TipoDenuncia.php`, `app/Helpers/DiasHabiles.php`, and `app/Http/Controllers/Denuncia/*`.
- **Affected Queries & Dashboards**: `app/Queries/Dashboard/KpiQuery.php` (compliance percentage based on deadline fulfillment).
- **Dependencies**: No external library additions. Relies on existing Laravel database transactions, Carbon, and `DiasHabiles` holiday caching.
