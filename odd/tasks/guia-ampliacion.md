# Guide Expansion: Slash Commands and Newcomer Sections

## Objective

Expand `transparencia-proy/Guia - Flujo Gentle.md` with a slash-command
table (auto vs manual) and newcomer sections, keeping the existing
93 lines verbatim and the total file under ~250 lines.

## Problem

The guide covers the opencode-vs-Warp quick path and work-unit rules,
but newcomers still ask: which `/sdd-*` commands run automatically,
which ones to type manually, what to do on day one, what ODD/SDD/RDD
mean, how Warp menus behave, and where to look first.

## Why

A single scannable guide section answers these recurring questions at
the entry point, instead of scattering the same answers across plans,
closures, and chat history.

## Scope

Only one file changes:

- `transparencia-proy/Guia - Flujo Gentle.md` (append new sections)

Out of scope: AGENTS.md, `decisiones/Indice.md`, AI-CONTEXT, any code,
any other docs file, push, PR.

## Constraints

- Preserve all existing 93 lines verbatim; insert after existing
  sections unless a clearly better spot exists.
- Link, do not duplicate: AGENTS.md (§§ arranque, documento de tarea,
  registro decisiones, plan/cierre, verificación) and
  `transparencia-proy/decisiones/Indice.md` + `PLANTILLA-ADR.md`
  are referenced by path + heading only.
- Keep additions scannable: tables + checklists, short lines.
- Total file max ~250 lines.
- No push, no PR. Commit both files in one work-unit commit.

## Checklist

- [ ] T1: Feature doc created before edits + mirrored in Engram.
- [ ] T2: Guide expanded with slash table, checklist, glossary,
  Warp troubleshooting, and where-to-look-first map.
- [ ] T3: Full guide read back; links resolve by path; diff stat
  recorded; docs-only commit created, no push, no PR.
- [ ] T4: SHA + stat recorded in this doc + mirror updated.

## Authorized scope

- `transparencia-proy/Guia - Flujo Gentle.md` (expand only)
- `odd/tasks/guia-ampliacion.md` (this document)

## Acceptance criteria

- [ ] Existing 93 lines unchanged.
- [ ] New sections present: slash table, first-day checklist,
  5-line glossary, Warp troubleshooting, where-to-look-first map.
- [ ] Normative sources linked by path, not copied.
- [ ] File total <= ~250 lines.
- [ ] One commit `docs(guia): ampliar con slash y secciones de recién llegado`.
- [ ] No other files staged or committed; no push; no PR.

## Applicable checks

- `git branch --show-current`: observed result recorded below.
- `git status --short`: only the two in-scope files present.
- `git diff --cached --stat`: large addition expected (file untracked).
- Full readback of the guide: structural verification only.
- Tests: N/A (docs-only change, no executable boundary).

## Verification evidence

- Branch: `docs/guia-ampliacion` (created from `docs/flujo-registro-agents`,
  verified via `git branch --show-current`)
- Reads: full `transparencia-proy/Guia - Flujo Gentle.md` (93 lines pre,
  170 lines post) + AGENTS.md headings (§§ 1-5 + Siguiente paso, for
  linking only) + link targets confirmed
  (`transparencia-proy/AI-CONTEXT.md`,
  `transparencia-proy/decisiones/Indice.md`,
  `transparencia-proy/decisiones/PLANTILLA-ADR.md`)
- Line count pre/post: 93 / 170 (existing 93 lines verbatim, +77 new)
- Diff stat: `odd/tasks/guia-ampliacion.md | 82 ++++`,
  `"transparencia-proy/Guia - Flujo Gentle.md" | 170 ++++`,
  2 files changed, 252 insertions(+) (whole guide file added: untracked)
- Commit SHA: 6ceed8d6033660066e7e6f3a6bbccae205a7a29c
  (work-unit commit; amended to include this evidence line,
  final SHA re-recorded below and in Engram mirror)
- Final SHA: a5955856110723f003d9d27f2ed90a0468f7914b
  (evidence-carrying commit; this line added the final amend —
  true HEAD recorded in Engram mirror)
- Engram mirror: obs-7d2bb51cfe724680 (`odd/guia-ampliacion/tasks`)
