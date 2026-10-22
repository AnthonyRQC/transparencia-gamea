# password-ux Specification

## Purpose
Reduce password entry errors and speed up account creation with visibility toggles and a sensible generated default.

## Requirements

### Requirement: Password visibility toggle

Login, profile password change, and new-user creation password inputs SHALL offer an Eye/EyeOff toggle that switches between masked and plain text without clearing the value.

#### Scenario: Toggle reveals value

- **WHEN** a user activates the toggle on any password input
- **THEN** the current value becomes readable and toggling again masks it

### Requirement: Generator default on user creation

The new-user form SHALL offer a button that fills the password with `GAMEA-<CI tal cual>`, or an 8-character fallback when CI is empty.

#### Scenario: Generate from CI

- **WHEN** CI is `123456-1A` and the generator is pressed
- **THEN** the password field becomes `GAMEA-123456-1A`

#### Scenario: Generate without CI

- **WHEN** CI is empty and the generator is pressed
- **THEN** the password field becomes an 8-character value
