# Spec Delta

## Purpose

Improve witness traceability on evidence records with an optional witness identity document field.

## ADDED Requirements

### Requirement: Optional witness CI persisted

Evidence of type `testigo` SHALL accept an optional `testigo_ci` (`nullable|string|max:20`) that is persisted with the evidence and visible wherever the evidence is read.

#### Scenario: Witness CI stored

- **WHEN** a report includes `pruebas.*.testigo_ci='7654321-2B'`
- **THEN** the evidence record stores that value

#### Scenario: Missing witness CI allowed

- **WHEN** a report omits `testigo_ci`
- **THEN** registration succeeds and the field stays empty
