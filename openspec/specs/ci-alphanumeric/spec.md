# ci-alphanumeric Specification

## Purpose
Accept real Bolivian CI formats with extensions and complements on citizen reports without blocking registration.

## Requirements

### Requirement: Alphanumeric CI accepted

The report registration and edit flows SHALL accept `denunciante.ci` as free text (`nullable|string|max:20`), normalized to uppercase, including values like `1234567-1E`.

#### Scenario: CI with extension accepted

- **WHEN** a report is submitted with `ci='1234567-1E'`
- **THEN** validation passes and the stored value is uppercase

#### Scenario: Overlong CI rejected

- **WHEN** a report is submitted with a `ci` longer than 20 characters
- **THEN** validation fails with a CI error

#### Scenario: Legacy numeric CI still passes

- **WHEN** a report is submitted with a digits-only `ci`
- **THEN** validation passes as before
