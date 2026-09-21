# Feature: Technical Pre-Defense Preparation (Transparencia / Ley 974)

## Objective
Prepare defensible preparation material for the technical pre-defense of the Transparencia system (Ley 974, GAMEA/UTLCC) before institutional systems engineers, reusable for the author's degree project.

## Problem
The system is functionally complete (Sprints 0-13 + hallazgos program closed, 182 tests green per AI-CONTEXT) but there is no single verified, citation-backed preparation package: full system examination, technology justification, Q&A prep, and exposition script. Unverified claims from memory would fail under engineer questioning.

## Why
- Pre-delivery technical review requires every claim traceable to code, tests, or recorded decisions.
- Same material doubles as thesis defense evidence; it must live in the repo.
- Prior session plan (`plan/pre-defensa-tecnica`) already scoped the sources; this doc executes it under ODD.

## Scope
- IN: 4 preparation documents under `transparencia-proy/pre-defensa/`:
  1. `01-Examinacion-Sistema.md` — modules, complaint lifecycle, business-day deadlines, permissions/delegations, notifications, real backend/frontend architecture, DB.
  2. `02-Tecnologias-Justificacion.md` — every stack item + key libs, why chosen, which alternatives existed and why rejected.
  3. `03-Preguntas-Respuestas.md` — foreseeable engineer questions (security, permissions, scalability, audit, data integrity, deploy, performance) with solid code/test-backed answers.
  4. `04-Guion-Exposicion.md` — technical presentation script with timing and live-demo checkpoints.
- IN: prior code verification of all numbers, permissions, and flows before writing.
- OUT: no source-code changes; no new runtime behavior; no SDD phases.

## Constraints
- Defendability rule: every technical affirmation cites file path + (symbol | test | ADR | commit). No invented data.
- Docs in Spanish (neutral/professional), code identifiers in English untouched.
- Cognitive-doc-design shape: lead with answer, progressive disclosure, tables/checklists.
- Conventional Commits, no Co-Authored-By, no AI attribution.
- Route: delegated-direct (mapping trigger fired: 4+ files; writer trigger for 4 docs). No SDD artifacts.

## Authorized scope
- Read: `transparencia-proy/**`, `odd/tasks/*.md`, `app/**`, `routes/**`, `database/**`, `resources/js/**`, `composer.json`, `package.json`, `tests/**`, `config/**`.
- Write: `odd/tasks/pre-defensa-tecnica.md`, `transparencia-proy/pre-defensa/*.md`, Engram mirror `odd/pre-defensa-tecnica/tasks`.
- Forbidden: `app/`, `database/`, `resources/` source edits; push/merge without explicit user order.

## Acceptance criteria
- [ ] All numbers (versions, table counts, permission counts, test counts) verified against code before writing.
- [ ] Each of the 4 docs cites its evidence (path + symbol/test/ADR/commit).
- [ ] Uncertain or contradictory data is marked as pending, not asserted.
- [ ] `tsc`/build/test evidence recorded where applicable; doc-only changes verified by direct read + diff.
- [ ] Commits are work-unit commits on `docs/pre-defensa-tecnica` with SHA + diff-stat recorded here.

## Applicable checks
- Doc changes: direct file read + `git diff --stat` review (no executable harness).
- Code verification reads: `rg` counts + targeted file reads by delegated workers; parent spot-checks 1-2 claims per worker.
- TDD: N/A (no runtime code change; mode not resolved — docs only).

## Route declaration
- Chosen route: delegated-direct. Trigger evidence: system examination spans backend (8 Denuncia controllers + Queries/Services/Requests), frontend (Pages/Components), DB (22+ tables), tests — far beyond 4 files, so mapping + writing are delegated; parent keeps thin orchestration thread.

## Tasks
- [ ] T1 — Code verification (delegated mappers): backend flows, frontend stack, DB schema, tests/permissions/decisions. Record observed `<command>: <result>` per unit.
- [ ] T2 — Write `01-Examinacion-Sistema.md` (delegated writer) from verified findings only.
- [ ] T3 — Write `02-Tecnologias-Justificacion.md` (same writer, second unit).
- [ ] T4 — Write `03-Preguntas-Respuestas.md` + `04-Guion-Exposicion.md` (same writer, third unit).
- [ ] T5 — Parent spot-check, work-unit commits, close with SHAs and next step.

## Progress
- 2026-09-21: doc created on branch `docs/pre-defensa-tecnica`; Engram mirror pending; verification not yet run.

## Verification evidence
- (pending)

## Next step
- Launch T1 verification workers, then write units T2-T4 only from their observed evidence.
