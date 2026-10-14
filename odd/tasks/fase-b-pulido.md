# Fase B Polish — Neutral Language, Ley 974 Declarant, Structured Accused, Attachments, Date Guards, Uppercase Audit

## Objective
Polish the Fase B legacy intake (`feat/fase-b-casos-legacy`, uncommitted base)
to institutional neutral Spanish, full Ley 974 declarant scenarios, a dynamic
accused repeater with hybrid dependencia picker, optional same-modal file
uploads, future-date guards, and a verified uppercase policy (TipTap excluded).

## Scope
- U1: 4 voseo strings in `ModalCargarLegacy.tsx` + `MisCasos.tsx` button label.
- U2: 3-scenario declarant (revelada/reservada/anonimo) with CI/phone;
  Request + Controller + modal + tests.
- U3: structured `denunciados[]` repeater (conoce_identidad toggle) replacing
  `denunciados_texto`; hybrid dependencia picker reusing the
  `ModalNuevaSolicitud` popover pattern over shared `dependencias` prop;
  Request + Controller + modal + rewrite `CargaLegacyTest` payloads.
- U4: optional attachments (max 5, `mimes:pdf,jpg,jpeg,png,docx`, `max:51200`
  each) uploaded post-commit to `archivos/{ticket}` with `denuncias_archivos`
  (`contexto='registro'`) + `archivo_subido` bitacora rows; frictionless when absent.
- U5: `max={today}` on reception/closure date inputs.
- U6: uppercase audit — tests locking exclusions (lowercase emails, intact
  passwords, TipTap content excluded).

## Out of scope
- Changing `conciliar-fechas` semantics; ticket rules; permission matrix;
  touching `ArchivosCasoController` (no refactor of the existing flow).

## Design decisions (authorized 2026-10-13)
1. Neutral texts: `${name} (Asignado automáticamente)`, `${name} (Tú)`,
   button "Cargar caso en curso"; tab "Mi caso en curso" kept (neutral).
2. Declarant block strictly Nombre (required) + CI + Teléfono (optional);
   no email (per spec).
3. Attachments post-commit to avoid orphan files on rollback; partial failure
   reports retry-from-viewer notice.
4. Max 5 files per legacy load (infra allows 2G/20 files; prudence cap).
5. TipTap (`EditorRico`, portal news/notices) strictly excluded from uppercase;
   passwords/emails untouched (verified: no code change needed).

## Acceptance criteria
- [ ] No voseo left in the legacy flow.
- [ ] Each declarant scenario persists correctly (incl. reserva badge).
- [ ] Repeater creates N accused with correct identidad/descripcion branches.
- [ ] Hybrid dependencia accepts catalog pick and free text.
- [ ] With/without attachments both succeed; invalid mime 422s.
- [ ] Future dates unselectable in UI and rejected by backend.
- [ ] Uppercase exclusions covered by tests.
- [ ] Full suite + build green.

## Verification
- `phpunit --filter=CargaLegacyTest`: OK (12 tests, 58 assertions) — 2026-10-13
- `phpunit --filter=EstandarizacionMayusculasTest`: OK (3 tests, 10 assertions) — 2026-10-13
- `phpunit` full suite: OK (238 tests, 1771 assertions) — 2026-10-13
- `npm run build`: clean (tsc + vite, 4653 modules, built in 1m26s) — 2026-10-13
- U7 `phpunit --filter=CargaLegacyTest`: OK (13 tests, 77 assertions) — 2026-10-13
- `phpunit` full suite: OK (239 tests, 1790 assertions) — 2026-10-13
- `npm run build` (U7): clean (tsc + vite, 4653 modules, built in 26.86s) — 2026-10-13
- Validación inline + adjuntos (`CargaLegacyTest|EstandarizacionMayusculasTest`): OK (16 tests, 87 assertions) — 2026-10-14
- `npm run build` (validación inline + adjuntos): clean (tsc + vite, 4650 modules, built in 1m38s) — 2026-10-14
- `phpunit` full suite: OK (239 tests, 1790 assertions) — 2026-10-14
- Fix desbordamiento `DependenciaHibrida` (trigger `min-w-0 max-w-full overflow-hidden`, span con `title`, chevron `ml-2`, items `truncate block` + `title`): `npm run build` clean (tsc + vite, 4650 modules, built in 1m05s) — 2026-10-14
- Ajuste multilínea + recorte 45 caracteres + `overflow-x-hidden` en diálogo: `npm run build` clean (tsc + vite, 4650 modules, built in 44.78s) — 2026-10-14

## Evidence
- Branch `feat/fase-b-pulido` (sobre base Fase B sin commitear); cambios sin
  commit en working tree para revisión en Lazygit.
