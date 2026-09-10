# Sprint 12.5 — Cierre R1: Refactor de Mantenibilidad (fase segura)

> **Fecha:** 10-sep-2026 · **Rama:** `main`
> **Commits:** `c166966` (R1.2) · `bf0cf7a` (R1.1) · `535275f` (R1.3) ·
> `e096947` (R1.4) · `ba442e5` (R1.5 + DESIGN.md)
> **Alcance:** solo R1 del plan (`Sprint 12.5 - Plan Refactor Mantenibilidad.md`).
> R2 (`FormDialog`, `FiltrosCaso`) + auditoría backend → Sprint 21 (ver D1/D6 en
> `Decisiones 12.5 - 13 (Log).md`).

## Gates

| Check | Resultado |
|---|---|
| `tsc --noEmit` | exit 0 (por frente) |
| `npm run build` | OK 46.34s |
| `php artisan test` | 88 passed, 438 assertions |
| `impeccable detect` (9 targets R1) | 3 findings `side-tab border-l-4`, todos pre-existentes (idioma movido verbatim a `PLAZO_BORDE`; rediseño = decisión de producto, fuera de R1) |
| Visual light/dark 1280×720 | Verificado por usuario por frente |

## Por frente

- **R1.2 fechas** (`c166966`): 12 wrappers `formatDate` → helper directo con fallback
  original (`—` vs `''`); `formatDateTime` unificado a `formatearFechaHora`
  (cambio visual aceptado en Descargo: mes largo → numérico). Hallazgo: wrapper de
  `SolicitudCard` estaba muerto. −43 líneas netas.
- **R1.1 semántica** (`bf0cf7a`): nuevo `Denuncias/Shared/semantica.ts` (Plazo,
  Clasificación, Solicitud, Descargo, Escenario, Recomendación, Etiquetas cortas,
  botones Cancelar, borde plazo, contadores). `pink-600 → destructive` (17 sitios,
  un knob). Fix bug `Evaluaciones`: recomendación nula ya no pinta `Rechazar`.
  `ResultadoSeguimiento` suma `evaluacion_tecnica`. `ETIQUETAS_TIPO` unificado a
  `constants/estados.ts`. Excluidos: barra `PlazoProgress`, tabs `MisCasos`,
  `ETIQUETAS_ESTADO` mayúsculas. −105 líneas netas.
- **R1.3 avatar** (`535275f`): nuevo `Denuncias/Shared/TecnicoAvatar.tsx`
  (1 letra, sizes xs/sm/md, `color`+`colorHex`+`tone`, sin wrapper button/tooltip).
  6 avatares migrados, 2 `getInitials` eliminados. Header/modal −4px a validar.
  Decisión D7: color oficial de paleta → Sprint 18.
- **R1.4 paginación** (`e096947`): `Paginacion` único (`mode client|server` +
  `itemLabel`); Notificaciones migrada + `preserveState/Scroll` (sin salto de scroll).
- **R1.5 diálogos** (`ba442e5`): nuevo `Denuncias/Shared/ConfirmDialog.tsx`
  (`confirm|delete|deactivate`, copies verbatim); 3 modales eliminados, barrels
  reconectados, 7 consumidores migrados; muerto de ConsultarCasos fuera
  (import, states, handler, `toast`/`Trash2` huérfanos). Cambio a validar: Admin
  sale de `AlertDialog` (Esc/overlay cierra si no hay `processing`).
- **Docs:** `DESIGN.md` con estándar R1 (§ Badges/Avatares/Paginación/Diálogos +
  6 reglas de no-duplicación) + tabla de fechas corregida a formatos reales.

## Deuda que NO se tocó (a 21 / 18)

R2.1/R2.2, N+1/índices, god backend, `as any` resto, split `web.php`, OWASP/E2E,
avatar-color (18, D7). Ver `Deuda Tecnica y Riesgos.md` § diferidos.
