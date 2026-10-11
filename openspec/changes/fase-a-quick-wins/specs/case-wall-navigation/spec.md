# Spec Delta

## Purpose

Let case operators jump from a case file to the public notices published for that case in one click.

## ADDED Requirements

### Requirement: Case-to-wall button

The case detail view SHALL provide a button that navigates to the public wall filtered by the case ticket through the existing dedicated `ticket` query param, showing only already-published notices.

#### Scenario: Navigate to filtered wall

- **WHEN** an operator opens a case and activates the wall button
- **THEN** the wall loads filtered by that ticket with no case-status data exposed
