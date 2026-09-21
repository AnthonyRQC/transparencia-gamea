# Dropdown and aria-hidden band-aid removal

## Objective

Restore standard shadcn/ui behavior in `SelectContent`, `DialogContent`
and `SheetContent`, and remove the blur/observer band-aids that commit
`43edcc2` added to four app modals, so dropdowns render correctly inside
modals stacked over sheets.

## Problem

`43edcc2` ("modales sin colision aria-hidden", Sep 8) added band-aids to
suppress a Chrome console warning about `aria-hidden` on an ancestor
with focus. They do not suppress it (the observer is asynchronous and
the warning is already logged) and they cause a real bug:

- `SelectContent` keeps a `container` state and an effect that runs
  `document.querySelector('[role="dialog"][data-state="open"]')` and
  portals into the first open dialog. In Bandeja/MisCasos the file
  modal opens on top of the DenunciaSheet, so the selector picks the
  sheet (mounted first) and dropdown options render inside it,
  clipped/invisible. Even with the right dialog, `max-h` +
  `overflow-y-auto` + transform clips the popper. This breaks the
  "Contexto" dropdown and dropdowns in other modals.
- `dialog.tsx` / `sheet.tsx` observe `data-state` / `aria-hidden` and
  blur the active element on close; four modals repeat the blur on
  `onOpenChange`/`onCloseAutoFocus`.

The warning itself (Radix Select `hideOthers` vs Chrome protection) is
benign: Chrome blocks the harmful part. It must NOT be re-suppressed.

## Why

Standard shadcn behavior is the contract. A functional regression in
dropdowns is worse than console noise, so the band-aids are reverted
and the benign warning is accepted if it reappears.

## Scope

Files that change (exactly 7):

- `resources/js/Components/ui/select.tsx`
- `resources/js/Components/ui/dialog.tsx`
- `resources/js/Components/ui/sheet.tsx`
- `resources/js/Components/Denuncias/Modales/General/ModalArchivosDelCaso.tsx`
- `resources/js/Components/Denuncias/Modales/Flujo/TraspasoModal.tsx`
- `resources/js/Components/Denuncias/Modales/Flujo/ModalDelegarEvaluacion.tsx`
- `resources/js/Components/Denuncias/Modales/Flujo/AsignacionModal.tsx`
- `odd/tasks/dropdown-aria-hidden.md` (this document)

The same-named files at `resources/js/Components/Denuncias/` root are
one-line re-export barrels; they hold no band-aid and stay untouched.

Out of scope: re-suppressing the warning, new dependencies, backend
changes, any other file.

## Constraints

- Remove hacks only: no new comments, no new code beyond the revert.
- Keep functional guards (`if (!processing)` around `onOpenChange`) and
  every other prop, className, and behavior intact.
- No push, no PR. Two work-unit commits plus one evidence commit.

## Checklist

- [ ] T1: `SelectContent` back to standard portal (no container state,
  effect, or `container={container}`).
- [ ] T2: `DialogContent` / `SheetContent` back to standard refs (no
  `contentRef`, observer, `handleRef`, or `onCloseAutoFocus` wrapper).
- [ ] T3: remove blur band-aids from the 4 modals, keeping their
  functional guards and remaining props.
- [ ] T4: verification evidence (build, grep, SHAs, stats) recorded.
- [ ] T5: Engram mirror updated; tree clean.

## Authorized scope

- The 7 source paths listed under Scope plus this document.

## Acceptance criteria

- [ ] `SelectContent` has no `container` state, effect, or querySelector.
- [ ] `dialog.tsx` and `sheet.tsx` contain no `MutationObserver`,
  `contentRef`, `handleRef`, or blur logic.
- [ ] The 4 modals contain no `document.activeElement.blur()` call and
  no `onCloseAutoFocus` blur handler; functional guards preserved.
- [ ] `npm run build` (`tsc && vite build`) passes.
- [ ] `Select-String -Path resources/js -Include *.tsx -Recurse -Pattern
  "openDialog|MutationObserver|\.blur\(\)"` returns zero matches.
- [ ] `git status --short` is clean after the evidence commit.

## Applicable checks

- `npx tsc --noEmit` (focused per work unit)
- `npm run build`
- `Select-String ...` remnant scan
- `php artisan test` — N/A, no backend change
- `git status --short`, `git diff --stat`, `git log --oneline`

## Verification evidence

Pending (filled by the evidence commit).
