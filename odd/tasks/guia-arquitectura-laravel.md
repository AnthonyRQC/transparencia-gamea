# Feature: Architecture Study Guide (Laravel for a Django/Python background)

## Objective
One study companion doc (`transparencia-proy/pre-defensa/06-Estructura-y-Arquitectura.md`) that walks the whole repo structure and explains what each section/module does, with explicit Django↔Laravel comparisons, so the author can study it alongside the defense docs and answer architecture questions confidently.

## Problem
Author comes from Django/Python (Laravel knowledge = simple CRUDs) and built this project AI-assisted. The defense requires explaining the real architecture (thin controllers, Queries/Services/Requests, enums, permissions, Inertia flow) without hand-waving. No such guide exists; `01-Examinacion-Sistema.md` is a fact sheet, not a teaching walkthrough.

## Why
User request (22-sep-2026): "repasar toda la estructura del proyecto y cómo está ordenado, qué función cumplen esas secciones... otro .md para estudiar junto a los de defensa", using the app/ folder screenshot (Data, Enums, Exports, Helpers, Http, Models, Providers, Queries, Services, Support, Traits, bootstrap) as the starting point.

## Scope
- IN: root layout (`app/ bootstrap/ config/ database/ public/ resources/ routes/ storage/ tests/`), every `app/*` subfolder, request lifecycle (public/index.php → bootstrap/app.php → routes → middleware → FormRequest → Controller → Service/Query → Model → Inertia → React), the project's 5 patterns, a "how to study this repo" path, and a Django↔Laravel glossary.
- IN: evidence per claim (path:symbol) and honest notes where the project deviates from stock Laravel.
- OUT: no code changes; no new ADRs; does not replace `01-Examinacion-Sistema.md`.

## Constraints
- Spanish neutral/professional; code identifiers in English untouched; Django parallels must be accurate (e.g., Eloquent≈ORM, Blade≈templates, FormRequest≈forms/DRF serializer validation, Middleware≈middleware, Providers≈AppConfig+DI, Artisan≈manage.py, Gates≈permissions, Inertia has no Django equivalent — explain it as the protocol).
- Every structural claim cites a real path; counts must be re-verified by the explorer, not copied from memory.
- cognitive-doc-design shape (lead with answer, tables, progressive disclosure). Target ≤ ~350 lines.

## Authorized scope
- Read: whole repo (structure-level; no deep dumps).
- Write: `transparencia-proy/pre-defensa/06-Estructura-y-Arquitectura.md`, `odd/tasks/guia-arquitectura-laravel.md`.
- Forbidden: source edits, push/merge without order.

## Acceptance criteria
- [ ] Every folder in `app/` + root explained with real files as examples.
- [ ] Request lifecycle traced with one real flow (admitir denuncia) and real paths.
- [ ] Django↔Laravel table accurate; Inertia explained as protocol (not compiler).
- [ ] Counts verified (controllers/requests/services/queries/models/migrations/routes files) by explorer.
- [ ] Cross-links to 01–05 defense docs; doc committed with evidence.

## Applicable checks
- Explorer re-verifies counts and unseen areas (Providers, bootstrap/app.php, routes files, config, factories, Exports, Support, RollUpDependencias).
- Parent spot-check: 1–2 cited paths + line counts; doc read-back + diff.

## Route declaration
- Delegated-direct: explorer (structure map) + writer (doc). No SDD.

## Tasks
- [ ] E1 — Explorer: full structure inventory (counts, purposes, unseen areas).
- [ ] W1 — Writer: `06-Estructura-y-Arquitectura.md` from E1 + verified session evidence.
- [ ] V1 — Parent spot-check + close.

## Progress
- 2026-09-22: doc created on branch `docs/guia-arquitectura-laravel` (from main@0d2cf29).

## Verification evidence
- (pending)

## Next step
- Launch E1 explorer; then W1 writer.
