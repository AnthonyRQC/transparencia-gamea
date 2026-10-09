# public-portal Specification

## Purpose
Define the editorial presentation contract of the public portal so the ticket-lookup hero stays dominant and the notice wall reads as a dense municipal gazette with Andean micro-accents, without changing any lookup or wall behavior.

## Requirements

### Requirement: Hero stays dominant above the fold

The portal SHALL keep the ticket-lookup and report-registration hero as the first viewport block above the wall, preserving its inputs, actions, and accessible flow unchanged.

#### Scenario: Hero first on load

- **WHEN** a visitor opens the portal on desktop or mobile
- **THEN** the lookup/registration hero is visible before any wall notice without scrolling past wall content

#### Scenario: Hero behavior unchanged

- **WHEN** a visitor submits a ticket lookup
- **THEN** the existing lookup contract, validation, and result flow behave exactly as before

### Requirement: Dense editorial wall grid

The wall SHALL render below the hero as a dense editorial grid where the first pinned notice spans full width as Lead Story with a rombos cenefa, and the remaining notices render in 2 columns on desktop.

#### Scenario: Lead Story plus grid

- **WHEN** the wall loads on desktop with at least one pinned notice
- **THEN** the first pinned notice spans the full content width and the rest flow in 2 columns

#### Scenario: No pinned notices

- **WHEN** no notice is pinned
- **THEN** all notices flow in the regular 2-column grid with no empty Lead Story slot

### Requirement: Responsive collapse with folded filters

The wall SHALL collapse to 1 column on mobile, with the documentary filter panel folded above the content so notices are the immediate protagonist.

#### Scenario: Mobile single column

- **WHEN** the viewport is a mobile width
- **THEN** notices stack in 1 column and filters render collapsed above the list

#### Scenario: Filters still fully usable

- **WHEN** a mobile visitor expands the folded filters
- **THEN** every desktop filter (search, type, advanced fields, dates, history) is available and applies identically

### Requirement: Typographic treatment for notices without cover

Avisos with null `portada_archivo_id` and no images SHALL render a typographic editorial header with an Andean rombos cenefa in official tokens, institutional CITE, and notice type, keeping the same grid rhythm as image cards.

#### Scenario: Null cover keeps rhythm

- **WHEN** a notice has no images
- **THEN** its card shows the cenefa header with CITE and type and aligns to the same row rhythm as image cards, with no grey box or broken-image icon

#### Scenario: Mixed wall stays aligned

- **WHEN** image and imageless notices share the grid
- **THEN** both variants keep consistent vertical rhythm and card heights per breakpoint

### Requirement: Server pagination stays intact with sober skin

The wall SHALL keep numeric server-side Inertia pagination with identical request semantics, re-skinned soberly with official tokens and without infinite scroll.

#### Scenario: Same request semantics

- **WHEN** a visitor changes page
- **THEN** the client issues the same paged request with preserved state, scroll, and `panel`-only updates and no case-status data leaks

#### Scenario: Numeric selector only

- **WHEN** the wall has multiple pages
- **THEN** a numeric page selector is shown and no infinite-scroll or auto-append behavior exists

### Requirement: Pinned curation without saturation

Only the first pinned notice SHALL take the Lead Story slot; secondary pinned notices SHALL render inside the regular grid carrying a gold `bg-secondary` "DESTACADO" badge.

#### Scenario: Single Lead Story

- **WHEN** several notices are pinned
- **THEN** exactly one Lead Story renders full-width and the other pinned notices render as grid cards with the DESTACADO badge

### Requirement: Tokens-only color rule

Wall and hero styling SHALL use only official tokens (`bg-primary/text-primary`, `bg-secondary/text-secondary`, `bg-destructive/text-destructive`, `text-foreground`, `bg-background`, `bg-card`, `border-border`, `bg-teal-600/text-teal-600`) with zero loose hex values in Tailwind classes.

#### Scenario: Audit passes

- **WHEN** the touched portal files are scanned for loose hex color literals in class strings
- **THEN** no match is found outside code comments

### Requirement: Accessibility and themes preserved

The redesign SHALL preserve the live-region announcements, visible focus indicator, keyboard operability, and light/dark theme parity of the lookup and wall flows.

#### Scenario: Announcement and focus intact

- **WHEN** a lookup or wall filter completes with a result or an error
- **THEN** the outcome is announced through the live region and focus remains visible and operable by keyboard in both themes
