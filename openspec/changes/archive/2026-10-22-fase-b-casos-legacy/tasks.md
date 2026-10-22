# Tasks

## 1. Migration + model

- [x] 1.1 Add `investigador_referencia` migration (string 150, nullable, after `investigador_id`) + `Denuncia` fillable + uppercase with PHPUnit coverage and verify focused test passes
- [x] 1.2 Register `denuncia.cargar-legacy` / `denuncia.cargar-historico` in `PermisosCatalogo` ROLES + DELEGABLE(legacy only) + mirror in `permissions.ts` with PHPUnit coverage and verify focused test passes

## 2. Backend legacy intake

- [x] 2.1 Add `StoreLegacyDenunciaRequest` (common + per-mode rules, denunciados parsing in `prepareForValidation`) with PHPUnit coverage and verify focused test passes
- [x] 2.2 Add `Denuncia/LegacyController@store` + `POST /denuncias/legacy` route (transaction: ticket/high-water-mark, backdated dates, denunciante/denunciados, cierres/informes rows, `ingreso_legacy`, notifications for ongoing) with PHPUnit coverage and verify focused test passes
- [x] 2.3 Cover historico closed-without-ghost (`investigador_id=null`, `plazo=null`), referencia+clasificacion persistence, duplicate-ticket 422, unauthorized redirect `/dashboard` in `CargaLegacyTest` and verify focused test passes

## 3. Frontend

- [x] 3.1 Add `ModalCargarLegacy.tsx` (mode tabs by permission, investigator fixed-self, jefe selector, historico fields, conditional classification) + mount in MisCasos/Bandeja/ConsultarCasos and verify `npm run build` passes
- [x] 3.2 Split `ModalConciliarFechas` into `ModalConciliarAdmision.tsx` + `ModalConciliarRechazo.tsx` (same endpoint/payload shape), rewire `BandejaModales`, remove old file, and verify `npm run build` passes

## 4. Full verification

- [x] 4.1 Run full `php` phpunit suite green and `npm run build` clean and record results in `odd/tasks/fase-b-casos-legacy.md`
