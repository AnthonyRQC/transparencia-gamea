# UI Fixes — Unified Footer, 2-Line Selector, Mojibake

## Objective
Unify the case Sheet footer into one wrapping row, render reported-person
options on two wrapped lines without overflow, and purge mojibake from
user-visible strings.

## Scope
- `DenunciaSheet.tsx:~373-388` — single flex bar: case actions +
  files button same row on desktop, clean wrap on mobile (verbatim spec).
- `ModalNuevoDescargo.tsx` — `SelectContent` pinned to trigger width;
  `SelectItem` two-line stacked layout with forced wrap (verbatim spec).
- Mojibake: `SolicitudCard.tsx:66`, `DescargoCard.tsx:70`,
  `DescargoDetailModal.tsx:248-250`, `SolicitudDetailModal.tsx:244-246`,
  `FormInformeFinal.tsx:158,162` — clean `·`, `—`, `→`.

## Out of scope
- Behavior changes; new fields; PHPUnit changes.

## Acceptance criteria
- [ ] Footer actions coexist in one row, wrap clean on mobile.
- [ ] Long names wrap on two lines, no modal widening.
- [ ] No `Â` artifacts in the touched strings.

## Verification
- `npm run build`: clean (tsc + vite, 4648 modules, 8.11s)
