# Clipboard in Modal + Inline Validation + Toaster Z

## Objective
Make clipboard fallback work inside Radix modals, show server validation
errors inline under each user-form field, and keep global toasts above all
backdrops.

## Scope
- `helpers/clipboard.ts` — fallback appends textarea to the active modal
  (`document.querySelector('[role="dialog"]') || document.body`); sequence
  `ta.focus({ preventScroll: true })`, `ta.select()`,
  `ta.setSelectionRange(0, texto.length)`, `execCommand('copy')`, remove.
- `ModalCrearUsuario.tsx` + `ModalEditarUsuario.tsx` — `errors` state,
  cleared on save start, set in `onError`; drop `toast.error` on submit;
  `<InputError message={errors.<campo>} className="mt-1" />` under every
  Input / Select / PasswordInput (`@/Components/Form/InputError`).
- `AppLayout.tsx:82` — `<Toaster>` with `z-[9999]` so no toast hides behind
  backdrops.

## Out of scope
- Validation rule changes; new fields; PHPUnit changes.

## Acceptance criteria
- [ ] Copy works from inside the credential modal on http.
- [ ] Failed create/edit shows per-field messages, no error toast.
- [ ] Toasts render above dialogs and overlays.

## Verification
- `npm run build`: clean (tsc + vite, 4652 modules, 7.62s)
