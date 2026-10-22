# Design: Case Lifecycle and Statutory Deadlines Architecture

## Context

The complaint management system operates under Bolivia's Ley N° 974 (anticorruption units) and Ley N° 2341 (administrative procedure). The system model `app/Models/Denuncia.php` orchestrates case data, `app/Enums/EstadoDenuncia.php` enumerates state tokens, and `app/Helpers/DiasHabiles.php` provides statutory calendar calculation with holiday exclusions. See `proposal.md` for motivation.

## Goals / Non-Goals

**Goals:**
- Provide a rigorous, formal specification of the 8 case states, transitions, and substate `archivada`.
- Formalize business-day computation, statutory extension caps (45d/90d for corruption; 20d/30d for denial of information), and semaphore color thresholds (ADR D28).
- Document invariants: pessimistic row locking (`lockForUpdate`), append-only audit tracking (`bitacora`), and controlled date reconciliation (`conciliarFechas`).
- Document existing codebase discrepancies and edge cases to establish a sound foundation for Phase D (due-date calendar and delay indicators).

**Non-Goals:**
- Visual calendar UI, Gantt views, or frontend interactive widgets (reserved for Phase D).
- Role-based authorization matrix and delegable permissions (governed by `PermisosCatalogo` and dedicated auth specs).
- Detailed audit projection filters and user agent capture (governed by ADR D29).

## Decisions

### 1. Business Days Computation Engine (`DiasHabiles`)
- **Decision**: Deadlines are computed strictly using `DiasHabiles::agregar()` and `DiasHabiles::diasRestantes()`.
- **Legal Principle (Ley 2341)**: Day 1 starts on the first business day following the trigger event (intake or admission). Saturdays, Sundays, and active holidays in `feriados` table are skipped. Weekend checks precede holiday checks to prevent double deduction.
- **Alternatives Considered**: Calendar day arithmetic (violates statutory norms of Ley 974) and on-the-fly un-cached SQL holiday lookups (causes severe N+1 query amplification).

### 2. State Machine Topology and Terminal State Definition
- **Decision**: Eight explicit states: `ingresada`, `evaluacion_tecnica`, `admitida`, `rechazada`, `asignada`, `investigacion`, `informe`, and `cerrada`.
- **Transitions Matrix**:
  - `ingresada` → `evaluacion_tecnica` (delegarEvaluacion)
  - `evaluacion_tecnica` → `ingresada` (devolver / reasumir)
  - `ingresada` → `admitida` (admitir)
  - `ingresada` → `rechazada` (rechazar - terminal)
  - `admitida` → `asignada` (asignar)
  - `asignada` → `investigacion` (iniciarInvestigacion)
  - `investigacion` → `informe` (saltarFase / regular advance)
  - `informe` → `cerrada` (guardarCierre - terminal)
  - `cerrada` → `informe` (eliminarCierre - closure reversal)
  - `rechazada` / `cerrada` → `ingresada` (reabrir - supervisory reopening)
- **Substate**: `archivada` is an orthogonal substate toggle on `cerrada` complaints (`toggleArchivar`).
- **Terminal States**: `EstadoDenuncia::terminales()` defines `rechazada` and `cerrada`. In terminal states, active deadline computing ceases (`plazo` returns `null`).

### 3. Concurrency Protection with Pessimistic Locking
- **Decision**: All state-mutating endpoints (`admitir`, `rechazar`, `asignar`, `iniciarInvestigacion`, `saltarFase`, `reabrir`) wrap logic inside `DB::transaction()` with `Denuncia::where('ticket', $ticket)->lockForUpdate()->first()`.
- **Rationale**: Prevents Time-of-Check to Time-of-Use (TOCTOU) race conditions between multiple concurrent supervisors (e.g., two supervisors admitting or rejecting the same case simultaneously).

### 4. Unified Semaphore Semantics (ADR D28)
- **Decision**: Three standard visual tiers based on business days remaining:
  - `red`: $\le 3$ business days remaining (or overdue $< 0$)
  - `yellow`: $4$ to $8$ business days remaining
  - `green`: $> 8$ business days remaining
- **Rationale**: Replaced fragmented controller-specific thresholds with a unified, predictable scale.

### 5. Identified Code Discrepancies and Clarifications
- **Reopening Base Date & Plazo**: `ReaperturaController::reabrir` records `'nueva_fecha_limite'` into `reapertura_json`, but `Denuncia::calcularVencimiento()` does not reference `reapertura_json` and continues checking `fecha_admitida ? ... : created_at`. When Phase D implements explicit expiration tracking, reopened case calculation will need a consolidated calculation path.
- **Final Report State**: Calling `InformeController::guardarInforme()` records the report model but does not mutate `denuncia.estado` (the case remains in `informe`). The state only advances to `cerrada` upon `CierreController::guardarCierre()`.

## Risks / Trade-offs

- **[Risk: Holiday cache staleness]** → **Mitigation**: `DiasHabiles` utilizes a 1-hour cache TTL and provides `olvidarCache()` triggered whenever holidays are added or updated in `CatalogoService`.
- **[Risk: Concurrency lock exhaustion]** → **Mitigation**: Slow I/O operations (emails, notifications, file storage) are executed outside of the `lockForUpdate` database transaction boundary.
- **[Risk: Reopened case deadline discrepancy]** → **Mitigation**: The specification documents `reapertura_json` behavior and tasks Phase D with aligning `calcularVencimiento()` to evaluate reopened limits.
