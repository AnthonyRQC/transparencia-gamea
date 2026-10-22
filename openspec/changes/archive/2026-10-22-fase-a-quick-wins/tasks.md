# Tasks

## 1. Bitacora archivo_subido

- [x] 1.1 Record `bitacora(archivo_subido)` in `ArchivosCasoController::subir()` with PHPUnit coverage and verify focused test passes
- [x] 1.2 Verify denied/failed upload creates no entry and verify focused test passes

## 2. CI alfanumerico + testigo_ci

- [x] 2.1 Switch `denunciante.ci` to `nullable|string|max:20` in store/editar/`StoreDenunciaRequest` with PHPUnit coverage (accepts `1234567-1E`, rejects >20) and verify focused test passes
- [x] 2.2 Add `testigo_ci` migration + `Prueba` fillable + validation/persist/read path with PHPUnit coverage and verify focused test passes
- [x] 2.3 Expose `testigo_ci` in registration form and `types/denuncia.ts` and verify `npm run build` passes

## 3. Clipboard + password UX

- [x] 3.1 Add shared clipboard helper with fallback, adopt in `ModalCredencialTemporal`, and verify `npm run build` passes
- [x] 3.2 Add shared password input with Eye/EyeOff, adopt in Login/perfil/nuevo-usuario plus `GAMEA-<CI>` generator, and verify `npm run build` passes

## 4. Avisos por caso

- [x] 4.1 Add case-detail button linking to `/?ticket=<TICKET>` and verify `npm run build` passes

## 5. Excel sanitization + full verification

- [x] 5.1 Prefix `'` on risky cells in `ReporteExcel` with PHPUnit coverage and verify focused test passes
- [x] 5.2 Run full `php artisan test` green and `npm run build` clean and record results in `odd/tasks/fase-a-quick-wins.md`
