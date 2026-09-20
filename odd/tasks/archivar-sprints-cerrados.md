# Archive Executed Sprints 13 / 16 / 18A / 18C

Status: in progress
Branch: docs/archivar-sprints-cerrados
Type: docs-only work unit (no code changes)

## Objective

Move 7 closed-executed sprint documents from `transparencia-proy/`
into `transparencia-proy/archivo/sprints-cerrados/`, preserving
git history, and record the change as one reviewable work-unit commit.

## Problem

Sprints 13, 16, 18A, and 18C are executed and closed, but their
planning, closure, and QA documents remain at the top level of
`transparencia-proy/`. The top-level listing mixes active planning
with historical records, which increases search friction and the
risk of editing a closed record by mistake.

## Why

- Keep the top level reserved for active and reference documents.
- Give closed sprint records a single canonical location.
- Preserve file history via `git mv` so prior reviews remain traceable.
- Keep the change reviewable as one bounded docs move.

## Scope

Only the 7 files listed under "Authorized scope" below.

In scope:

- Inventory the 7 source files (Test-Path each).
- Move them via `git mv` to `archivo/sprints-cerrados/`.
- Verify destinations, branch, and staged diff stat.
- Record the commit SHA and diff stat in this document.
- Save an Engram mirror of this document.

Out of scope: all other files and folders.

## Constraints

- No code changes.
- No edits to AI-CONTEXT.md, Plan de Desarrollo.md, Sprints Pendientes,
  Decisiones log, or Deuda documents.
- No renames; keep exact file names, only the directory changes.
- Do not move Sprint 12.x files (deferred to a follow-up).
- Do not push. Do not open a PR.
- Moves only via `git mv` (history preserving).
- If a source file is missing: skip it, report it, do not invent it.

## Authorized scope (exact paths)

1. `transparencia-proy/Sprint 13 - Portal Panel Informativo (Plan).md`
2. `transparencia-proy/Sprint 13 - Cierre Portal Panel Informativo.md`
3. `transparencia-proy/Sprint 13 - Guía de Pruebas (QA).md`
4. `transparencia-proy/Sprint 16 - Plan (Rename + Roles).md`
5. `transparencia-proy/Sprint 18A - Plan Panel Usuarios.md`
6. `transparencia-proy/Sprint 18C - Plan Delegaciones.md`
7. `transparencia-proy/Sprint 16-18C - Guía de Pruebas (QA).md`

Destination directory: `transparencia-proy/archivo/sprints-cerrados/`

## Task checklist

- [x] T1 — Inventory: Test-Path each of the 7 source files; record missing items.
- [x] T2 — Move: `git mv` each present file to `archivo/sprints-cerrados/`.
- [x] T3 — Verify: Test-Path destinations, `git status --short`,
  `git diff --cached --stat`, Read back this document.
- [ ] T4 — Commit: one work-unit commit
  `docs(archivo): archivar sprints 13/16/18A/18C ejecutados`;
  record full SHA and diff stat below.
- [ ] T5 — Mirror: save/update Engram mirror
  (topic `odd/archivar-sprints-cerrados/tasks`); mark pending on failure.

## Acceptance criteria

- All present files from the authorized 7 exist under
  `archivo/sprints-cerrados/` after `git mv` (history preserved).
- This feature document is updated with the commit SHA and diff stat.
- Engram mirror is saved, or explicitly marked pending with reason.
- No other file is modified, moved, or renamed.
- Branch remains unpushed; no PR is opened.

## Applicable checks

- `Test-Path -LiteralPath` on each source and destination path.
- `git branch --show-current` (expected: `docs/archivar-sprints-cerrados`).
- `git status --short` before and after the moves.
- `git diff --cached --stat` before commit.
- Read back this feature document after the commit.

## Evidence

- Commit SHA: _pending (recorded after commit)_
- Diff stat: 7 files changed, 0 insertions(+), 0 deletions(-)
  (pure renames via `git mv`, history preserved).
- Staged stat observed via `git diff --cached --stat` before commit.
- Mirror: saved pre-move as Engram observation ID 4
  (topic `odd/archivar-sprints-cerrados/tasks`); update pending after commit.
- Inventory: all 7 source files present (no missing items).
