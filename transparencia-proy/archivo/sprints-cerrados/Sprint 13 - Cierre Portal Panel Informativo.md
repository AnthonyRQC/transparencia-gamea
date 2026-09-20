# Sprint 13 — Cierre: Portal Panel Informativo

> **Fecha:** 14-sep-2026 · **Rama:** `main`
> **Commits:** `8cca773` (13.1) · `45d667c` (13.2 + fix useCan) · `280279d` (13.3) ·
> `5511691` (13.x editor/portada/lightbox/admin-pack) + cierre (este).
> **Spec congelado:** D8 + deltas en `Sprint 13 - Portal Panel Informativo (Plan).md`.
> Decisiones D1–D10 en `Decisiones 12.5 - 13 (Log).md`. QA en
> `Sprint 13 - Guía de Pruebas (QA).md` (cero hallazgos pendientes: todo lo
> reportado se corrigió en el camino).

## Gates

| Check | Resultado |
|---|---|
| `php artisan test` | 118 passed |
| `tsc --noEmit` | exit 0 |
| `npm run build` | OK 28s |
| `impeccable detect` (superficies 13.x) | 2 findings `side-tab border-l-4` pre-existentes (aceptados en R1) |
| Visual light/dark + móvil | Verificado por usuario por frente (guía QA A/B/C) |

## Por corte

- **13.1 muro + catálogos** (`8cca773`): sección en Welcome bajo consulta
  (info/preguntas al final), grid 2 col (aside 25% sticky + feed 1 col),
  filtros server-side (tipo radial, texto, fechas, avanzada en acordeón),
  `Paginacion server` (10/pág), default últimos 12 meses + historial,
  FULLTEXT MySQL (LIKE en SQLite/cortos), botón seguimiento sin PIN.
  4 migraciones + 4 modelos + 2 catálogos (7 tipos, 3 prioridades) + seeds.
- **13.2 admin** (`45d667c` + pack): `/admin/publicaciones` (Jefe+Registrador):
  tabla + tabs Borradores/Publicados + buscador no-reactivo + avanzada +
  orden fecha-doc + `TablaResponsive` + ticket→bandeja; form email con
  `EditorRico` (TipTap limitado), multi-archivo (PDF/JPG/PNG/webp, tope 5),
  warning sin-PDF, portada elegible, historial de adjuntos (soft-delete,
  físicos preservados + Bitacora), descarga pública solo publicadas.
  Fix `useCan` → `auth.user.permisos` (bug Sprint 7.5 expuesto por esta página).
- **13.3 avisos de caso** (`280279d` + fixes): triggers (admisión OFF,
  rechazo ON, cierre auto) + `AvisoCaso` idempotente + badge/banner "Sin aviso"
  solo finales + botón Crear aviso → borrador + `?aviso=` + SITPRECO heredado.
- **UX cierre** (`5511691` + fixes): `AvisoDetailModal` (HTML sanitizado) +
  `Lightbox` (fix Radix `stopPropagation`) + card 2-col con portada +
  `showPicker` nativo + copy ciudadano + `DESIGN.md` (§ Tablas, no-duplicación).

## Bugs cazados en el camino

`through()` pierde paginador · props no anidadas bajo `panel` ·
`historial=true` vs regla boolean (→ `$request->boolean()`) ·
ONLY_FULL_GROUP_BY en conteos (→ se eliminaron) · `portada_archivo_id`
ausente = migrar dev · update-500 por clave validada ausente ·
`useCan` a prop inexistente · SQLite sin FULLTEXT (migración por driver).

## Queda fuera (a 18 / 21 / v2)

R2.1/R2.2, backend full, avatar-color (18, D7), suscripción de alertas,
validador hash, ranking por relevancia, Catálogos → `TablaResponsive`,
Office como adjunto. Ver `Deuda Tecnica y Riesgos.md` § diferidos.
