# case-file-audit Specification

## Purpose
Provide an audit trail for every file attached to a case so uploads are attributable and reviewable.

## Requirements

### Requirement: Upload records bitacora entry

After a successful file upload the system SHALL create a `bitacora` entry with `accion='archivo_subido'`, the file name in `detalle`, the acting user, and the current timestamp.

#### Scenario: Successful upload is audited

- **WHEN** an authorized user uploads a file to a case
- **THEN** a `bitacora` row with `accion='archivo_subido'` exists for that case with the file name and uploader

#### Scenario: Denied upload records nothing

- **WHEN** an upload fails validation or permission
- **THEN** no `archivo_subido` entry is created
