# Bandeja split: extract types, helpers, filters, modals and case list

## Objective

Reduce `resources/js/Pages/Denuncias/Bandeja.tsx` (1061 lines) to a page
shell. Pure types, pure helpers, the filter bar, the modal block and the
tab/list branches move into a new `resources/js/Pages/Denuncias/bandeja/`
folder. State and effects stay in the page component, and every moved line
is a verbatim move: no behavior change is authorized or expected.

## Problem

Audit finding #3 (verified): `Bandeja.tsx` is a 1061-line orchestrator that
mixes nine interface declarations, one config array, 29 `useState` calls, a
ref, six effects, four derived helpers and roughly 700 lines of JSX across
the filter bar, five tab branches, the `DenunciaSheet` action menu and 21
modal instances. Reviewing any single behavior means reading the whole file,
and the JSX blocks are not reusable or testable in isolation.

## Why

The page renders as `Denuncias/Bandeja` through Inertia, so the page path
and default export are a hard contract. Extracting the moving parts into a
feature-local folder keeps that contract intact while giving each section a
named, explicitly typed boundary. Behavior must stay byte-identical: users
see the same tabs, filters, cards, sheet and modals.

## Scope

New files under `resources/js/Pages/Denuncias/bandeja/`:

- `tipos.ts` — interfaces (Bandeja.tsx lines 46–171) plus `contadorConfig`
  (lines 173–181). Pure, exported types and config.
- `helpers.ts` — `isNewHours` (293–297) and `filterAndSort` (299–323) as
  pure exported functions.
- `BandejaFiltros.tsx` — filter bar (359–391) with an explicit props
  interface.
- `BandejaModales.tsx` — modal block (866–1058) with an explicit props
  interface for the states, setters and support data it consumes.
- `BandejaLista.tsx` — `TabsDenuncias` wrapper and tab branches (393–651:
  cards plus empty states) with an explicit props interface.

Modified: `resources/js/Pages/Denuncias/Bandeja.tsx` (imports, derived,
composition; state and effects untouched).

Out of scope: hooks/state extraction, effects, the `DenunciaSheet` block
(653–864 stays in the parent), `tabs`/`renderEmptyState`/`pageSize` (stay in
the parent), backend, routes, database and `MisCasos.tsx`.

## Constraints

- Verbatim moves: JSX, class strings, handler bodies and Spanish strings are
  copied unchanged. No reformatting of moved code and no new comments.
- No memoization: no `useMemo`/`useCallback` is added (none exists today).
- The page keeps its path and default export; `route('denuncias.bandeja')`
  and Inertia resolution must not change.
- State stays in the parent; setters are passed as props so extracted JSX
  keeps the exact call sites (`setModalAdmisionTicket(d.ticket)`, etc.).
- `filterAndSort` becomes pure: `search`, `filterTipo`, `sortBy` and
  `activeTab` arrive as an options argument instead of closure state. Same
  predicates, same comparator chain, same output.
- Dual-purpose modal instances keep their union conditions and fallback
  `ticket` expressions (`modalEditarSol`, `modalEditarDesc`, `modalConciliarDenuncia`).
- The sheet→modal `denunciados` coupling (`selectedDenuncia?.denunciados || []`)
  and the Traspaso `investigadorActualId` lookup across all four lists are
  preserved exactly.
- `preserveScroll` asymmetry is preserved: eliminar denuncia uses
  `preserveScroll: false` plus `router.reload()`; the other confirmations use
  `preserveScroll: true`.
- The currently unused `Tooltip` import in `Bandeja.tsx` is left untouched.

## Checklist

- [ ] T1: feature doc created and mirrored in Engram before the first source write.
- [ ] T2: `tipos.ts`, `helpers.ts` and `BandejaFiltros.tsx` extracted and consumed
      by `Bandeja.tsx`; `npm run build` passes.
- [ ] T3: `BandejaModales.tsx` extracted with the full modal surface
      (states+setters, `investigadores`, `cargaInvestigadores`,
      `selectedDenuncia`, `investigadorActualId`); `npm run build` passes.
- [ ] T4: `BandejaLista.tsx` extracted with the tab branches and empty states;
      `npm run build` passes.
- [ ] T5: verification recorded (`npm run build` per unit and final, line counts
      before/after per file, `git status --short`, SHAs, `git diff --stat`).
- [ ] T6: evidence commit and Engram mirror update; tree clean.

## Authorized scope

- The five new files under `resources/js/Pages/Denuncias/bandeja/`, the
  modified `Bandeja.tsx` and this document.

## Acceptance criteria

- [ ] `Bandeja.tsx` keeps its path and default export, stays under 600 lines
      (target ≈350–450; the 212-line `DenunciaSheet` block stays by design),
      and each extracted file exists, compiles and is independently readable.
- [ ] `npm run build` passes after each work-unit commit and at the end.
- [ ] No `useMemo`/`useCallback` introduced; no behavior, string or class
      change inside moved code; no PHP tests affected (frontend-only).
- [ ] `git status --short` is clean after the evidence commit.

## Applicable checks

- `npm run build`
- Line counts of `Bandeja.tsx` and of each new file
- `git status --short`, `git diff --stat`, `git log --oneline`
- PHP tests: N/A — no PHP/backend file is touched; the change is frontend-only
  and the PHP suite cannot observe it.

## Review workload note

The diff is move-heavy, so authored additions plus deletions will exceed the
400-line advisory heuristic in `work-unit-commits`. The overage is accepted
explicitly: moved lines carry no new logic, each commit is an independently
reviewable and reversible unit, and the behavior contract is verified by the
same build after every unit. The split is bounded at three source units plus
one evidence commit; no further slicing is warranted.

## Verification evidence

- Pending: recorded at close with commands, observed results, SHAs and
  diff stats for each work-unit commit.
