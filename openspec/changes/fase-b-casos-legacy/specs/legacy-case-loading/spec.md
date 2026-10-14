# Spec Delta

## Purpose

Load pre-existing physical case files (ongoing and closed from past
gestiones) through a minimal fast form, without ghost investigators,
without ticket collisions, and keeping reports relational.

## ADDED Requirements

### Requirement: Two-mode legacy intake

The system SHALL accept `POST /denuncias/legacy` with `modo=en_curso`
(state `investigacion|informe`) or `modo=historico` (forced `cerrada`),
`es_legacy=true`, backdated `fecha_recepcion`, and record
`bitacora(accion='ingreso_legacy')`.

#### Scenario: Investigator loads own ongoing case

- **WHEN** an investigator posts `modo=en_curso` without `investigador_id`
- **THEN** the case is created with `investigador_id` = own id and a
  current-year ticket (manual folder number respected when given)

#### Scenario: Historical record has no ghost investigator

- **WHEN** an authorized user posts `modo=historico`
- **THEN** the case is `cerrada` with `investigador_id=null`,
  `ticket=DEN-{gestion}-{numero}`, a `cierres` row dated `fecha_cierre`,
  and `plazo` resolves to null

#### Scenario: Double booking a ticket fails

- **WHEN** `DEN-{gestion}-{numero}` already exists
- **THEN** the request is rejected with 422 and nothing is created

#### Scenario: Unauthorized loader is bounced

- **WHEN** a user without the mode permission posts via web
- **THEN** they are redirected to `/dashboard` and nothing is created

### Requirement: High-water-mark ticket counter

When `gestion` equals the current year and `numero` is at or above the
stored `siguiente_numero_ticket`, the system SHALL advance the counter to
`numero + 1` in the same transaction.

#### Scenario: Manual folder number advances counter

- **WHEN** a legacy load uses `DEN-<current-year>-0200` while the counter is 125
- **THEN** the next auto ticket is `DEN-<current-year>-0201` or higher
