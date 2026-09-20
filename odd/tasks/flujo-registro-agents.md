# Flow: Registro via Normative AGENTS.md

## Objective

Make the decision-registration flow always in context by creating a
normative repo-root `AGENTS.md` plus a 1–2 line pointer in `AI-CONTEXT.md`.

## Problem

Rules for ODD docs, decision logging, and verification currently live only
in `transparencia-proy/AI-CONTEXT.md` and the `decisiones/` registry. Agents
that skip those files repeat questions and re-do instructions every session.

## Why This Approach

- `AGENTS.md` is normative: it auto-loads as instructions, no extra read.
- `AI-CONTEXT.md` stays a lean index with a pointer TO `AGENTS.md`.
- Single source of truth avoids drift from duplicating the full flow twice.

## Scope

- NEW: repo-root `AGENTS.md` (normative work instructions, ~80–120 lines).
- EDIT: exactly 1–2 pointer lines in `transparencia-proy/AI-CONTEXT.md`.
- NOTHING else. No code, no other docs, no push, no PR.

## Constraints

- Preserve the pre-existing unstaged `M` in `AI-CONTEXT.md`: full read
  first, minimal exact-string pointer insertion only, never overwrite.
- Do NOT touch: old `Decisiones` log, `Plan de Desarrollo`,
  `Sprints Pendientes`, `Deuda`, `12.x` notes, `Guia` content, or the
  `decisiones/` index and template.
- One path per change; docs-only work unit; Conventional Commit.

## Checklist

- [ ] T1 — Verify branch, `AGENTS.md` absence, and read `AI-CONTEXT.md` fully
- [ ] T2 — Create this feature doc first, mirror it to Engram before writes
- [ ] T3 — Create repo-root `AGENTS.md` + 1–2 line `AI-CONTEXT.md` pointer
- [ ] T4 — Verify diff, read back, commit only the work-unit paths

## Authorized Scope (exact paths)

- `AGENTS.md` (create)
- `transparencia-proy/AI-CONTEXT.md` (pointer hunk only)
- `odd/tasks/flujo-registro-agents.md` (this file)

Registry reference (read-only): `transparencia-proy/decisiones/Indice.md`,
`transparencia-proy/decisiones/PLANTILLA-ADR.md`.

## Acceptance Criteria

- `AGENTS.md` exists at repo root, neutral Spanish, covers: startup,
  ODD default, decision registry, plan/closure placement, verification.
- `AI-CONTEXT.md` gains exactly 1–2 pointer lines; no other hunks staged.
- Commit message: `docs(flujo): AGENTS.md normativo con puntero en AI-CONTEXT`.
- No push, no PR. Unrelated `M` hunks stay uncommitted if intertwined.

## Applicable Checks

- Structural readback of new `AGENTS.md` + pointer region (no test suite).
- `git diff --stat` + `git diff` limited to the three authorized paths.
- Engram mirror of this doc before first write (ID recorded below).
- Tests: `N/A` — docs-only unit; verification is structural readback.

## Evidence

- Branch: `docs/flujo-registro-agents`
- Commit SHA: _pending_
- Diff stat: _pending_
- Engram mirror ID: _pending_
