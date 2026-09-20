# Create Decision Registry with Index and ADR Template

Status: committed (evidence recorded on disk; branch unpushed, no PR)
Branch: docs/decisiones-registro
Type: docs-only work unit (no code changes)

## Objective

Create `transparencia-proy/decisiones/` with an index and an ADR
template, and record the change as one reviewable work-unit commit.

## Problem

Project decisions live in `Decisiones 12.5 - 13 (Log).md`, a single
growing log. There is no canonical folder, no index of decision IDs,
and no template for new entries, which raises the cost of finding
a past decision and of recording the next one consistently.

## Why

- Give future decisions a single canonical location.
- Keep the old log untouched as historical reference.
- Make new decisions reviewable with a fixed 5-field shape.
- Keep the change bounded to one docs work unit.

## Quick path

1. Create this feature doc (`odd/tasks/decisiones-registro.md`).
2. Create `transparencia-proy/decisiones/Indice.md` (neutral Spanish).
3. Create `transparencia-proy/decisiones/PLANTILLA-ADR.md` (neutral Spanish).
4. Verify paths, commit once, record SHA and stat below.

## Scope

Only the 2 registry files plus this feature document.

In scope:

- Write this feature document in English.
- Create `Indice.md` linking D-historico to the old log (no copy).
- Create `PLANTILLA-ADR.md` with 5 fields plus a minimal example.
- Verify, commit once, save an Engram mirror.

Out of scope: all other files and folders.

## Constraints

- No code changes.
- No edits to AI-CONTEXT.md, AGENTS.md, Plan de Desarrollo.md,
  Sprints Pendientes, Deuda, the old log, or Sprint 12.x files.
- Leave `Decisiones 12.5 - 13 (Log).md` as historico; do NOT move it.
- Use correct Spanish spelling `decisiones` in all new paths.
- Do not invent new decisions; index starts with D-historico only.
- Do not push. Do not open a PR.

## Authorized scope (exact paths)

1. `odd/tasks/decisiones-registro.md`
2. `transparencia-proy/decisiones/Indice.md`
3. `transparencia-proy/decisiones/PLANTILLA-ADR.md`

## Task checklist

- [x] T1 — Feature doc: create this file in English (~80-110 lines).
- [x] T2 — Index: create `Indice.md` in neutral Spanish (~60-90 lines).
- [x] T3 — Template: create `PLANTILLA-ADR.md` in neutral Spanish (~40-60 lines).
- [x] T4 — Mirror + commit: save Engram mirror, one work-unit commit,
  record full SHA and stat in Evidence below.

## Acceptance criteria

- Both registry files exist under `transparencia-proy/decisiones/`.
- Old log file is unmodified and still at its original path.
- No file outside the 3 authorized paths is modified.
- This document records the commit SHA and diff stat.
- Engram mirror is saved, or marked pending with reason.
- Branch remains unpushed; no PR is opened.

## Applicable checks

- `git branch --show-current` (expected: `docs/decisiones-registro`).
- `Test-Path -LiteralPath` on each of the 3 authorized paths.
- Read back both registry files after creation.
- `git status --short` and `git diff --cached --stat` before commit.
- Structural readback only; no tests (N/A for docs).

## Evidence

- Commit SHA: 6f50d63ad8167556b33c02a767791df3fe8f3f10
- Commit message: `docs(decisiones): crear registro con índice y plantilla ADR`
- Diff stat: 3 files changed, 209 insertions(+)
  (odd/tasks/decisiones-registro.md 92, Indice.md 67,
  PLANTILLA-ADR.md 50; staged stat observed via
  `git diff --cached --stat` before commit).
- Mirror: updated post-commit as Engram observation ID pending-merge
  (topic `odd/decisiones-registro/tasks`, pre-commit ID 7).
- Inventory: all 3 authorized paths present (no missing items).
- Note: the SHA above was recorded in this document after the commit;
  the committed copy of this document lists it as pending.
