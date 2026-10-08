# Spec Delta

## Purpose

Let any citizen check the procedural status of their report with the
ticket+token printed on their voucher, without ever exposing identities or
case contents, and without allowing ticket enumeration — per Ley 974
Arts. 24 and 29.

## ADDED Requirements

### Requirement: Non-sensitive public contract

The lookup SHALL return only legible status, progress steps, progress message,
legible type, rejection summary, closure classification label, and ingress /
closure dates. It SHALL NEVER return denunciante or denunciado identities,
evidence, documents, requests, rejoinders, or full report detail.

#### Scenario: Full-contract lookup

- **WHEN** a valid ticket+token pair is submitted
- **THEN** the response contains exactly the contract fields and no
  `denunciante`, `denunciados`, `pruebas`, `archivos`, or `informe` detail

#### Scenario: Rejected case keeps its justification

- **WHEN** the case state is `rechazada`
- **THEN** the response includes the rejection summary per Art. 23-II and no
  other case content

#### Scenario: Open case hides classification

- **WHEN** the case is not closed
- **THEN** no classification value is present in the response

### Requirement: Date-only values

Ingress and closure dates SHALL be formatted as calendar date `Y-m-d` with no
hour, minutes, or seconds, to prevent temporal correlation.

#### Scenario: No time component leaks

- **WHEN** a valid lookup succeeds
- **THEN** every date value matches `^\d{4}-\d{2}-\d{2}$`

### Requirement: Single generic lookup error

Malformed input and unknown ticket+token pairs SHALL produce the same generic,
friendly Spanish error with no distinction between causes.

#### Scenario: Malformed ticket

- **WHEN** the submitted value does not match a ticket shape
- **THEN** the generic not-found message is shown

#### Scenario: Unknown pair

- **WHEN** the ticket shape is valid but the pair does not exist
- **THEN** the identical generic not-found message is shown

### Requirement: Lookup rate limit

`GET /seguimiento` SHALL allow at most 10 requests per minute per client, and
the 429 response SHALL be a friendly Spanish message inviting retry.

#### Scenario: Limit exceeded

- **WHEN** an 11th request arrives within one minute from the same client
- **THEN** the system answers 429 with the friendly retry message and no
  case data

### Requirement: Dual token formats

Newly issued tokens SHALL be 6 uppercase alphanumerics; previously issued
4-digit numeric tokens SHALL keep resolving; matching SHALL be case-insensitive.

#### Scenario: New token issued

- **WHEN** a report is registered after this change
- **THEN** its token matches `^[A-Z0-9]{6}$`

#### Scenario: Legacy token still works

- **WHEN** a pre-change 4-digit token pair is submitted in any letter case
- **THEN** the lookup succeeds exactly as before

#### Scenario: Mixed-case new token

- **WHEN** a 6-character token is typed in lowercase
- **THEN** it is normalized and the lookup succeeds

### Requirement: Business-day timeframes, no promised date

The UI SHALL express reference timeframes in business days (5 admission,
20 / 45 process, subject to legal extensions) and SHALL NOT display a promised
calendar closing date (`fecha_vencimiento` stays empty).

#### Scenario: No closing-date promise

- **WHEN** a valid lookup succeeds for an open case
- **THEN** no estimated closing date is shown and the copy references
  business-day timeframes

### Requirement: Accessible lookup flow

The lookup form SHALL expose dual-format help (legacy + new), announce results
and errors via a live region, keep a visible focus indicator, and render dates
without time in both light and dark themes.

#### Scenario: Screen-reader announcement

- **WHEN** a lookup completes with a result or an error
- **THEN** the outcome is announced through an `aria-live` region

#### Scenario: Dual-format guidance

- **WHEN** the empty form is shown
- **THEN** help text documents both `DEN-AAAA-NNNN-PPPP` shapes

### Requirement: Wall stays public by design

Filtering the public information wall by ticket SHALL remain available without
a token, showing only already-published notices and never case-status data.

#### Scenario: Wall ticket search

- **WHEN** a visitor filters the wall by ticket without a token
- **THEN** only published notices appear and no lookup-contract data is exposed
