# UI Polish — Clipboard Root Fix, Credential Footer, Selects, Login Logo

## Objective
Harden modal clipboard to spec, stop credential-modal overflow, truncate
long institutional names in modal selects, and replace the Laravel logo on
login with the GAMEA shield.

## Scope
- `helpers/clipboard.ts` — fallback appends to `[role="dialog"] || body`,
  exact sequence focus/preventScroll → select → setSelectionRange(0, len) →
  execCommand → removeChild.
- `ModalCredencialTemporal.tsx` — footer `flex flex-col gap-2 w-full pt-2`,
  both buttons `w-full justify-center`.
- Selects `max-w-full` on Trigger + `truncate` on Value: user modals (rol),
  TraspasoModal, ModalImpactoDesactivar, ModalNuevoDescargo,
  PublicacionFormModal (tipo/prioridad), ModalAmpliacionPlazo.
- `GuestLayout.tsx` — GAMEA shield `img` via shared `logo_url` (+PNG
  fallback), drop `ApplicationLogo` import.
- Validation inline (crear/editar) already done prior turn — verify intact.

## Out of scope
- Rule changes; new fields; PHPUnit changes.

## Acceptance criteria
- [ ] Clipboard sequence verbatim per spec.
- [ ] Credential buttons stack full-width, no overflow.
- [ ] Long names truncate, modals keep width.
- [ ] Login shows GAMEA shield, no unused imports.
- [ ] `npm run build` clean + full `php artisan test` green.

## Verification
- `npm run build`: clean (tsc + vite, 4651 modules, 8.43s)
- `php artisan test`: 223 passed (1695 assertions), cero regresiones
