# Spec Delta

## Purpose

Let admins reliably copy one-time credentials regardless of secure-context restrictions on the deployment network.

## ADDED Requirements

### Requirement: Clipboard copy with fallback

The credential modal SHALL copy username and password to the clipboard on both secure and non-secure contexts, showing a success toast on copy and an error toast when copying is impossible.

#### Scenario: Copy on plain HTTP

- **WHEN** an admin clicks Copiar on plain HTTP
- **THEN** the value lands on the clipboard via the fallback and a success toast appears

#### Scenario: Copy failure surfaces error

- **WHEN** neither the Clipboard API nor the fallback can write
- **THEN** an error toast is shown and no success message appears
