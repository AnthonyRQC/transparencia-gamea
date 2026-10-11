# Fase A Quick Wins — Auditoria, CI, UX y Excel

## Objective
Implement 7 low-risk quick wins (audit hardening, Bolivian CI support,
clipboard/password UX, case-to-wall navigation, Excel injection guard)
keeping the 217-test PHPUnit suite green and `npm run build` clean.

## Scope
- `app/Http/Controllers/ArchivosCasoController::subir()` — bitacora `archivo_subido`.
- `DenunciaController::store()/editar()` + `StoreDenunciaRequest` — `denunciante.ci`
  `nullable|string|max:20` (free, uppercase via existing `UppercaseText`).
- `pruebas` — new nullable `testigo_ci` (`string|max:20`): migration + model +
  validation + frontend form + `types/denuncia.ts`.
- `ModalCredencialTemporal` — clipboard fallback for non-secure contexts.
- Password UX — Eye/EyeOff toggle in login / perfil / nuevo usuario +
  `GAMEA-<CI tal cual>` generator button (8 random chars if CI empty).
- Case detail (`DenunciaSheet`) — button to wall filtered by ticket.
  NOTE: authorized param was `?busqueda=` but the wall (`MuroQuery` +
  `Welcome.tsx`) actually exposes `buscar` (general) + `ticket` (dedicated).
  Implementation uses the existing dedicated `?ticket=` param.
- `ReporteExcel::valor()` — formula-injection guard: prefix `'` when a string
  starts with `= + - @`.

## Out of scope
- CI regex restriction (per authorization: free string).
- Required testigo CI (per authorization: always optional).
- Flow/permission changes, legacy CI migration.

## Design decisions (authorized 2026-10-10)
1. CI free `nullable|string|max:20`, uppercase via `UppercaseText`
   (already in `Denunciante::$uppercaseFields`). DB `denunciantes.ci` is
   already `string nullable` — no type migration needed.
2. `testigo_ci` always optional.
3. Generator overwrites field with `GAMEA-<CI>` or 8-char fallback.
4. Wall link uses existing `ticket` param (deviation from `busqueda` documented).

## Acceptance criteria
- [ ] Upload creates `bitacora(archivo_subido)` with file name; denied upload creates none.
- [ ] `1234567-1E` accepted on store/editar; >20 chars rejected; digits still pass.
- [ ] `pruebas.*.testigo_ci` persisted and readable; null when absent.
- [ ] Copy works on http (non-secure) with success/error toast.
- [ ] Toggles work on 3 password surfaces; generator fills expected value.
- [ ] Case button links to `/?ticket=<TICKET>` (wall shows only published notices).
- [ ] Excel cells starting with `= + - @` are `'`-prefixed; normal cells untouched.
- [ ] `php artisan test` green (217+new) + `npm run build` clean.

## Verification
- `php artisan test --filter=ArchivosCasoSubidaTest`: 10 passed (27 assertions)
- `php artisan test --filter` CI/testigo/Excel focused: green per unit
- `php artisan test`: 223 passed (1694 assertions) — baseline 217 + 6 new
- `npm run build`: clean (tsc + vite, 4652 modules, built in 1m40s)

## Evidence
- Commit `14b741b` (single unit per explicit user order covering Fase A +
  stacked UI fixes), fast-forward merged into `main`, branch
  `feature/fase-a-quick-wins` deleted.
- `diff --stat`: 56 files, 1089 insertions, 135 deletions.
