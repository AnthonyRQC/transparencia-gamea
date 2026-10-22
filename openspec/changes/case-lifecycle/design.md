# Design: Case Lifecycle and Statutory Deadlines Architecture

## Context

The complaint management system operates under Bolivia's Ley N° 974 (anticorruption units) and Ley N° 2341 (administrative procedure). The system model `app/Models/Denuncia.php` orchestrates case data, `app/Enums/EstadoDenuncia.php` enumerates state tokens, and `app/Helpers/DiasHabiles.php` provides statutory calendar calculation with holiday exclusions. See `proposal.md` for motivation.

## Goals / Non-Goals

**Goals:**
- Provide a rigorous, formal specification of the 8 case states, transitions, and substate `archivada`.
- Distinguish statutory terminality (cessation of deadline counting) from physical immutability (supervised reversal and reopening).
- Formalize business-day computation for base deadlines and statutory extension caps (45d/90d for corruption; 20d/30d for denial of information) integrating with holiday tables.
- Establish the allowed state window for controlled date reconciliation (`conciliarFechas`), freezing terminal states.
- Document invariants: pessimistic row locking (`lockForUpdate`), append-only audit tracking (`bitacora`), and two-mode legacy intake routing.
- Document codebase discrepancies and technical debt to establish a sound foundation for Phase D (due-date calendar and delay indicators).

**Non-Goals:**
- Visual calendar UI, Gantt views, or frontend interactive widgets (reserved for Phase D).
- Role-based authorization matrix and delegable permissions (governed by `PermisosCatalogo` and dedicated auth specs).
- Detailed audit projection filters and user agent capture (governed by ADR D29).

## Decisions

### 1. Business Days Computation Engine (`DiasHabiles`) and Holiday Integration
- **Decision**: Deadlines and extensions are computed strictly in business days using `DiasHabiles::agregar()` and `DiasHabiles::diasRestantes()`.
- **Legal Principle (Ley 2341)**: Day 1 starts on the first business day following the trigger event (`created_at` for intake, `fecha_admitida` for investigation). Saturdays, Sundays, and active holidays registered in the `feriados` database table are skipped. Weekend checks precede holiday checks to prevent double deduction.
- **Holiday Cache**: Employs a 1-hour cache TTL invalidated automatically on holiday catalogue mutations via `DiasHabiles::olvidarCache()`.

### 2. State Machine Topology, Terminality vs. Reversibility, and Legacy Ingestion
- **Decision**: Eight explicit states: `ingresada`, `evaluacion_tecnica`, `admitida`, `rechazada`, `asignada`, `investigacion`, `informe`, and `cerrada`.
- **Substate**: `archivada` is an orthogonal substate toggle exclusively on `cerrada` complaints (`toggleArchivar`).
- **Terminal for Deadlines vs. Immutability**:
  - `EstadoDenuncia::terminales()` defines `rechazada` and `cerrada`. In these states, active deadline computing ceases (`Denuncia::getPlazoAttribute()` returns `null`).
  - Terminal states are **not immutable dead ends**: controlled exits exist:
    1. **Case Reopening (`reabrir`)**: Transitions `rechazada` or `cerrada` back to `ingresada`. Requires permission `caso.reabrir`, mandatory justification ($\ge 20$ characters), a valid future limit date, clears `subestado`, resets investigator, and acquires an exclusive row lock (`lockForUpdate`).
    2. **Closure Reversal (`eliminarCierre`)**: Transitions `cerrada` back to `informe`. Requires permission `cierre.eliminar` and mandatory administrative justification ($\ge 20$ characters) audited in `bitacora`. Soft-deletes `cierre`, reverts state to `informe`, and reactivates deadline counting.
- **Note on Permissions vs Roles**: `PermisosCatalogo` defines capabilities such as `cierre.eliminar` (granted to both `jefe` and `investigador`), `caso.admitir`/`caso.rechazar`/`caso.reabrir` (granted to `jefe`), and `caso.iniciar` (granted to `investigador`). The case lifecycle specification defines state transitions and invariants in terms of effective permissions (`CasoAuth`), while exact role matrices are governed by the RBAC specification.
- **Transitions Matrix**:
  - `ingresada` → `evaluacion_tecnica` (delegarEvaluacion)
  - `evaluacion_tecnica` → `ingresada` (devolver / reasumir)
  - `ingresada` → `admitida` (admitir)
  - `ingresada` → `rechazada` (rechazar - terminal for deadlines)
  - `admitida` → `asignada` (asignar)
  - `asignada` → `asignada` (reasignar / traspasar)
  - `asignada` → `investigacion` (iniciarInvestigacion)
  - `investigacion` → `informe` (saltarFase / regular advance)
  - `informe` → `informe` (guardarInforme / editarInforme)
  - `informe` → `cerrada` (guardarCierre - terminal for deadlines)
  - `cerrada` → `informe` (eliminarCierre - closure reversal)
  - `rechazada` / `cerrada` → `ingresada` (reabrir - case reopening)
  - `cerrada (subestado: null)` ↔ `cerrada (subestado: 'archivada')` (toggleArchivar)
- **Legacy Ingestion Entry Points** (governed by `openspec/specs/legacy-case-loading`):
  - Pre-existing complaints do not initialize in `ingresada`:
    - `modo=historico`: Initialized directly in `cerrada` (`investigador_id` null, deadline null).
    - `modo=en_curso`: Initialized directly in `investigacion` or `informe` (`created_at` and `fecha_admitida` backdated, bypassing intake qualification deadline).

### 3. Statutory Deadline Extensions in Business Days and Ceilings
- **Decision**: All extension units approved via `AmpliacionController` are strictly **business days** (`días hábiles`).
- **Calculation**: In `Denuncia::calcularVencimiento()`, accumulated extension days are added to base business days:
  `DiasHabiles::agregar($diasBase + $diasAmpliados, $baseFecha)`.
- **Ceilings**:
  - `corrupcion`: Base 45 business days + maximum 45 business days extension = statutory maximum 90 business days.
  - `negacion`: Base 20 business days + maximum 10 business days extension = statutory maximum 30 business days.

### 4. Date Reconciliation State Window (`conciliarFechas`)
- **Decision**: Date reconciliation allows authorized users with permission `caso.conciliar` to rectify operational timestamps (`created_at`, `fecha_admitida`, `fecha_asignada`) with mandatory $\ge 20$ character justification audited in `conciliacion_json` and `bitacora`.
- **State Window Invariant**:
  - Permitted strictly on active pre-closure states (`ingresada`, `evaluacion_tecnica`, `admitida`, `asignada`, `investigacion`, `informe`).
  - **Prohibited on terminal states (`rechazada` and `cerrada`)**: Modifying operational dates on terminal cases alters settled historical facts and corrupts compliance KPI indicators. La reapertura formal crea un ciclo activo nuevo; las fechas de rechazo/cierre previas quedan como registro historico inmutable. La conciliacion posterior solo alcanza `created_at`, `fecha_admitida` y `fecha_asignada`.

### 5. Concurrency Protection with Pessimistic Locking
- **Decision**: All state and substate mutating endpoints (`admitir`, `rechazar`, `asignar`, `iniciarInvestigacion`, `saltarFase`, `guardarCierre`, `eliminarCierre`, `toggleArchivar`, `reabrir`) MUST execute inside `DB::transaction()` acquiring an exclusive row lock: `Denuncia::where('ticket', $ticket)->lockForUpdate()->first()`.
- **Rationale**: Prevents Time-of-Check to Time-of-Use (TOCTOU) race conditions between concurrent users (e.g., simultaneous closure and report edits, concurrent archive toggles, or race conditions during closure reversal).

### 6. Unified Semaphore Semantics (ADR D28)
- **Decision**: Three standard visual tiers based on remaining business days:
  - `red`: $\le 3$ business days remaining (or overdue $< 0$)
  - `yellow`: $4$ to $8$ business days remaining
  - `green`: $> 8$ business days remaining

### 7. Identified Code Discrepancies and Debt for Phase D
- **Reopened Case Deadline Discrepancy**: `ReaperturaController::reabrir` stores `nueva_fecha_limite` into `reapertura_json['plazo']`, but `Denuncia::calcularVencimiento()` ignores it and calculates from `fecha_admitida`. Phase D must align calculation to respect reopened deadlines.
- **Unjustified Closure Deletion**: `CierreController::eliminarCierre` currently requires no justification parameter in the HTTP request. As an administrative correction under Ley 974, it should require mandatory justification ($\ge 20$ characters) audited in `bitacora`.
- **Missing Date Reconciliation State Guard**: `DenunciaController::conciliarFechas` currently lacks state validation, permitting date edits on `cerrada` and `rechazada` cases. Phase D must add a guard restricting reconciliation strictly to active pre-closure states.
- **Missing Pessimistic Locking on Closure & Archive Endpoints**: `CierreController::guardarCierre`, `CierreController::eliminarCierre`, and `CierreController::toggleArchivar` currently lack `lockForUpdate()` (and `toggleArchivar` lacks `DB::transaction()`). Phase D must enforce the universal locking invariant across these methods.

## Risks / Trade-offs

- **[Risk: Holiday cache staleness]** → **Mitigation**: `DiasHabiles` utilizes a 1-hour cache TTL and provides `olvidarCache()` triggered whenever holidays are added or updated in `CatalogoService`.
- **[Risk: Concurrency lock exhaustion]** → **Mitigation**: Slow I/O operations (emails, notifications, file storage) are executed outside of the `lockForUpdate` database transaction boundary.
- **[Risk: Historical KPI distortion]** → **Mitigation**: Date reconciliation on `rechazada` and `cerrada` cases is barred; historical metrics remain stable unless formal reopening occurs.
