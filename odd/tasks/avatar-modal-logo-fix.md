# Crash Avatar, Credential Overflow, Logo Size

## Objective
Harden avatar against null names, stop credential-modal overflow at the
source, and give the GAMEA shield proper presence on login.

## Scope
- `InvestigadorAvatar.tsx:38` — null-safe initial
  `(nombre?.trim()?.charAt(0) || '?').toUpperCase()`; `title`/`aria-label`
  fall back to `'Usuario'`.
- `ModalCredencialTemporal.tsx` — `DialogContent` gains `overflow-hidden`;
  footer replaced with plain `div.flex.flex-col.gap-2.w-full.pt-3.border-t`
  (DialogFooter injects `sm:flex-row`).
- `GuestLayout.tsx:16` — shield `h-20 w-20 sm:h-24 sm:w-24 object-contain
  drop-shadow-md brightness-110`.

## Out of scope
- Behavior changes; new fields; PHPUnit changes.

## Acceptance criteria
- [ ] Null/undefined nombre renders `?` with no crash.
- [ ] Credential buttons never overflow; footer stacks on all breakpoints.
- [ ] Shield visibly larger on login.

## Verification
- `npm run build`: clean (tsc + vite, 4648 modules, 11.77s)
