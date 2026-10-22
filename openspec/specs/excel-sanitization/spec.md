# excel-sanitization Specification

## Purpose
Prevent spreadsheet formula injection from free-text case data in exported Excel reports.

## Requirements

### Requirement: Risky cells neutralized

Every string cell in the Excel export whose first character is `=`, `+`, `-`, or `@` SHALL be prefixed with a single quote (`'`) so spreadsheet apps treat it as text.

#### Scenario: Formula-like text neutralized

- **WHEN** a free-text field starts with `=`, `+`, `-`, or `@`
- **THEN** the exported cell starts with `'` followed by the original text

#### Scenario: Normal text untouched

- **WHEN** a cell does not start with a risky character
- **THEN** the exported value is byte-identical to today
