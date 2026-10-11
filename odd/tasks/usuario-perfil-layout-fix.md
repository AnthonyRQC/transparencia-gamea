# User Form, Profile & Layout Corrections

## Objective
Align password generation to `Gamea-` mixed case, harden clipboard fallback,
expose profile fields on shared `auth.user`, and kill the external browser
scrollbar in the authenticated layout.

## Scope
- `ModalCrearUsuario.tsx:32` — generator `Gamea-${ci}` (fallback 8 chars).
- `UsuarioAdminService.php:109` — reset generates `Gamea-{$target->ci}`.
- `helpers/clipboard.ts` — fallback without readonly, `ta.focus()` +
  `ta.setSelectionRange()`; `ModalCredencialTemporal.tsx` gains
  "Copiar credenciales completas" button.
- `HandleInertiaRequests.php:33-43` — share `email, telefono, ci, nombres,
  apellidos` in `auth.user` (+ `SharedPageProps` Pick type).
- `AppLayout.tsx:76` — root `fixed inset-0` so body has no external scrollbar;
  inner `main` keeps its own scroll. No global `body{overflow:hidden}` (would
  break public Welcome scroll).

## Out of scope
- Password policy changes; new fields; PHPUnit changes.

## Acceptance criteria
- [ ] New-user generator and reset both yield `Gamea-<CI tal cual>`.
- [ ] Copy works on http; full-credential copy copies both lines.
- [ ] Profile page reads email/telefono/ci/nombres/apellidos from `auth.user` typed.
- [ ] Authenticated pages show only the inner main scrollbar, no body scrollbar.

## Verification
- `php artisan test --filter="test_reset_password_revocay_muestra_una_vez|test_reset_propio_bloqueado"`: 2 passed (7 assertions)
- `npm run build`: clean (tsc + vite, 4649 modules, 26.31s)
