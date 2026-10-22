# Spec Delta: Case Lifecycle and Statutory Deadlines (Ley 974)

## Purpose

Defines the behavioral contract for the complaint case lifecycle state machine, statutory deadline calculations under Bolivia's Ley N° 974 and Ley N° 2341, business-day extension limits, date reconciliation state windows, terminal closure semantics, and pessimistic locking invariants.

## ADDED Requirements

### Requirement: Case Initial State and Intake Modes
Every complaint registered through internal intake SHALL initialize in the `ingresada` state with a unique annual ticket format (`DEN-YYYY-NNNN`) and an active 5-business-day qualification deadline. Pre-existing legacy intake SHALL follow the two-mode contract defined in `legacy-case-loading`.

#### Scenario: Standard complaint registration
- **WHEN** a complaint is registered through the internal intake workflow
- **THEN** its state is set to `ingresada`, its `subestado` is null, and its initial qualification deadline is calculated as 5 business days from intake.

#### Scenario: Pre-existing ongoing legacy complaint intake
- **WHEN** an ongoing legacy complaint is imported via `POST /denuncias/legacy` with `modo=en_curso`
- **THEN** its state initializes directly in `investigacion` or `informe` (as specified in the request), `es_legacy` is true, `created_at` and `fecha_admitida` reflect the historic reception date, bypassing the initial `ingresada` qualification deadline, and calculating remaining investigation deadline from `fecha_admitida`.

#### Scenario: Pre-existing historical closed complaint intake
- **WHEN** a historical closed legacy complaint is imported via `POST /denuncias/legacy` with `modo=historico`
- **THEN** its state initializes directly in `cerrada`, `es_legacy` is true, `investigador_id` is null (with optional reference name in `investigador_referencia`), a historical `cierres` record dated `fecha_cierre` is created, and statutory deadlines are nullified.

### Requirement: Preliminary Technical Evaluation Sub-flow
The system SHALL allow a supervisor to delegate preliminary technical evaluation on an `ingresada` complaint, transitioning it to `evaluacion_tecnica` and returning it to `ingresada` upon completion or reassumption.

#### Scenario: Delegating preliminary evaluation
- **WHEN** an authorized supervisor delegates preliminary evaluation to an active investigator
- **THEN** the complaint state transitions to `evaluacion_tecnica`, an evaluation record is created, and the 5-business-day qualification deadline continues computing from intake.

#### Scenario: Returning preliminary evaluation with recommendation
- **WHEN** the assigned investigator submits the evaluation with a recommendation (`admitir` or `rechazar`)
- **THEN** the complaint state transitions back to `ingresada` with evaluation text and recommendation recorded, ready for supervisory qualification.

#### Scenario: Reassuming preliminary evaluation
- **WHEN** a supervisor reassumes a delegated evaluation before submission
- **THEN** the complaint state transitions back to `ingresada` and the evaluation is cancelled.

### Requirement: Case Admission and Qualification Deadline
An authorized supervisor SHALL be able to admit an `ingresada` complaint within the statutory 5-business-day qualification deadline, transitioning it to `admitida`.

#### Scenario: Successful case admission
- **WHEN** a supervisor admits an `ingresada` complaint with optional justification
- **THEN** the state transitions to `admitida`, `fecha_admitida` is stamped with current timestamp, and the investigation deadline begins computation.

#### Scenario: Concurrency collision during admission
- **WHEN** two supervisors attempt to admit the same `ingresada` complaint concurrently
- **THEN** the database transaction acquires an exclusive row lock (`lockForUpdate`), the first transaction transitions the complaint, and the second transaction is safely rejected with a race condition notice without duplicating bitacora entries.

### Requirement: Case Rejection and Terminal Settlement
An authorized supervisor SHALL be able to reject an `ingresada` complaint with mandatory justification, transitioning it to the terminal state `rechazada`.

#### Scenario: Justified case rejection
- **WHEN** a supervisor rejects an `ingresada` complaint providing a justification of at least 5 characters
- **THEN** the state transitions to `rechazada`, `fecha_rechazada` is stamped, and active deadline calculation ceases (`plazo` returns null).

#### Scenario: Rejection without justification
- **WHEN** a user attempts to reject a complaint without providing justification
- **THEN** the transition is blocked with validation error and the complaint remains in `ingresada`.

### Requirement: Case Assignment and Investigation Initiation
An admitted complaint SHALL be assignable to an active investigator transitioning to `asignada`, and subsequent formal initiation SHALL transition the state to `investigacion`.

#### Scenario: Investigator assignment
- **WHEN** a supervisor assigns an active investigator to an `admitida` complaint
- **THEN** the state transitions to `asignada`, `investigador_id` is updated, and `fecha_asignada` is stamped.

#### Scenario: Formal investigation start
- **WHEN** the assigned investigator initiates formal investigation on an `asignada` complaint
- **THEN** the state transitions to `investigacion`, maintaining the active investigation deadline.

### Requirement: Investigation Statutory Deadlines and Business Day Computation
The system SHALL calculate investigation deadlines strictly in business days from `fecha_admitida`: 45 business days for corruption and 20 business days for denial of information.

#### Scenario: Corruption case deadline calculation
- **WHEN** a complaint of type `corrupcion` is admitted
- **THEN** its base deadline is 45 business days computed starting from the next business day after `fecha_admitida`.

#### Scenario: Denial of information deadline calculation
- **WHEN** a complaint of type `negacion` is admitted
- **THEN** its base deadline is 20 business days computed starting from the next business day after `fecha_admitida`.

#### Scenario: Holiday and weekend exclusion
- **WHEN** deadline computation encounters Saturdays, Sundays, or active registered municipal and national holidays
- **THEN** those calendar days are skipped without double deduction, and the expiration date advances to the next valid business day.

### Requirement: Statutory Deadline Extensions in Business Days and Ceilings
The system SHALL allow extending active investigation deadlines strictly in business days up to statutory ceilings: maximum +45 business days (total 90 business days) for corruption and maximum +10 business days (total 30 business days) for denial of information.

#### Scenario: Approving valid extension
- **WHEN** a supervisor approves an extension of $N$ business days with justification within permissible remaining limits
- **THEN** an extension record is created, the $N$ business days are added to the statutory base date skipping holidays and weekends via `DiasHabiles::agregar`, and an audit entry is logged.

#### Scenario: Rejecting extension exceeding legal ceiling
- **WHEN** a user attempts to extend a corruption case beyond 45 cumulative extension business days (90 total) or a denial case beyond 10 cumulative extension business days (30 total)
- **THEN** the request is rejected with a validation error indicating that the legal ceiling has been reached.

### Requirement: Advancing to Final Report Phase
An authorized investigator or supervisor SHALL be able to transition a case from `investigacion` to `informe` upon completing investigation or by skipping phase with justification.

#### Scenario: Phase advance to final report
- **WHEN** a user transitions a case from `investigacion` to `informe`
- **THEN** the state becomes `informe`, enabling creation of the final report (`InformeFinal`).

#### Scenario: Skipping phase with pending requests
- **WHEN** a user invokes `saltarFase` with justification while pending information requests or defenses exist
- **THEN** the state advances to `informe`, the justification is audited in bitacora, and user is warned of remaining pending items.

### Requirement: Case Closure, Substate Archiving, and Reversal
A case in `informe` state SHALL transition to `cerrada` upon registering closure notification details, an authorized user SHALL be able to toggle the `archivada` substate, and an authorized supervisor SHALL be able to revert closure back to `informe`.

#### Scenario: Final case closure
- **WHEN** an authorized user submits valid closure details on a case in `informe`
- **THEN** a `Cierre` record is created, the state transitions to `cerrada`, active deadline calculation ceases (`plazo` returns null), and a draft publication notice is created.

#### Scenario: Toggling archived substate
- **WHEN** an authorized user toggles archive on a `cerrada` case
- **THEN** `subestado` toggles between `archivada` and null without altering the closure state.

#### Scenario: Reverting closure with administrative trace
- **WHEN** an authorized supervisor with permission `cierre.eliminar` deletes closure on an un-archived `cerrada` case providing a mandatory justification of at least 20 characters
- **THEN** the closure record is soft-deleted, the state reverts back to `informe`, an audit entry `cierre_eliminado` containing the justification is logged in `bitacora`, and active deadline calculation resumes.

#### Scenario: Reverting closure without justification rejected
- **WHEN** a user attempts to delete closure without providing a justification of at least 20 characters
- **THEN** the reversal request is rejected with a validation error and the case remains `cerrada`.

### Requirement: Case Reopening with Preserved Audit
An authorized supervisor SHALL be able to reopen a `rechazada` or `cerrada` case back to `ingresada` with mandatory justification of at least 20 characters and a specified deadline.

#### Scenario: Reopening rejected or closed case
- **WHEN** a supervisor submits a reopening request with justification of at least 20 characters and a new limit date
- **THEN** the complaint state transitions to `ingresada`, `subestado` is cleared, `investigador_id` and `investigador_anterior_id` are reset to null, reopening details are stored in `reapertura_json`, and an audit entry is logged in `bitacora`.

### Requirement: Controlled Date Reconciliation State Window
The system SHALL permit reconciling legal case dates (`created_at`, `fecha_admitida`, `fecha_asignada`, `fecha_rechazada`) only within permissible state windows, requiring mandatory 20+ character justification and structured audit logging.

#### Scenario: Reconciling admission date on active case
- **WHEN** an authorized user with permission `caso.conciliar` submits updated dates and justification on an active pre-closure complaint (`ingresada`, `evaluacion_tecnica`, `admitida`, `asignada`, `investigacion`, `informe`)
- **THEN** the specified date fields are updated, the reason and actor are recorded in `conciliacion_json`, an immutable `bitacora` record is logged, and downstream deadline calculations reflect the reconciled dates.

#### Scenario: Reconciling rejection date on rejected case
- **WHEN** an authorized user with permission `caso.conciliar` submits an updated rejection date and justification on a `rechazada` complaint
- **THEN** `fecha_rechazada` is updated, and the reason and actor are recorded in `conciliacion_json` and `bitacora`.

#### Scenario: Rejecting date reconciliation on closed case
- **WHEN** a user attempts to conciliate dates on a `cerrada` complaint without prior formal reopening
- **THEN** the operation is rejected to protect historical settlement integrity.

### Requirement: Pessimistic Concurrency and State Audit Invariant
State transitions SHALL be protected by pessimistic row-level locking (`lockForUpdate`) within database transactions, and every state mutation SHALL generate an immutable `bitacora` record.

#### Scenario: Concurrency protection across transitions
- **WHEN** any state-mutating transition (admit, reject, assign, start, saltar-fase, reopen) executes
- **THEN** the row is locked with `lockForUpdate()`, the current state is verified before updating, and upon commit, an append-only entry is created in `bitacora`.
