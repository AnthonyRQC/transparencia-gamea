# Deuda Técnica y Riesgos

> **Propósito:** Registro vivo de deuda, riesgos y mejoras diferidas para trabajar a futuro. No es roadmap de sprints.
> **Actualizado:** 2026-09-09 (post Sprint 12.3). Stack: Laravel 13 / PHP 8.3. Suite 88 tests.

## P0 — Bloquea demo / dashboard

| # | Deuda / riesgo | Dónde | Impacto | Fix sugerido | Esfuerzo |
|---|---|---|---|---|---|
| 1 | Seeders con fechas fijas Feb-Jun 2026 → 100% mora hoy | `database/seeders/DenunciaSeeder.php:141-1073` | Dashboard KPIs 3/4 y urgentes inutilizables | Fechas relativas a `hoy` con `DiasHabiles::agregar()` (ver plan Sep 2026) | M |
| 2 | `escenario='anonima'` ≠ enum `'anonimo'` | `database/seeders/DenunciaMasivaSeeder.php:164` | Seed falla / datos inválidos | `anonima` → `anonimo` | S |
| 3 | `prueba tipo='archivo'` ≠ enum `fisica/testigo` | `database/seeders/DenunciaMasivaSeeder.php:250` | Seed falla (pruebas) | Quitar `archivo`, solo `fisica/testigo` (archivos van a `denuncias_archivos`) | S |
| 4 | `random_int` sin seed | `DenunciaMasivaSeeder.php:192,224,438` | Demo no reproducible | `srand(2026)` / faker seed | S |
| 5 | `backup-transparencia-*.sql` versionado | raíz | Repo pesado, confunde fuente (fuente = seeders) | `.gitignore` + mover a backup local | S |
| 6 | Alertas plazo no vivas (solo persistidas) | `HandleInertiaRequests.php:50`, `NotificacionController.php:16` | Campana no muestra “vence en N días” sin Time Machine + derivadas | Restaurar `AlertasPlazo` derivada (Sprint 9 → Eloquent) | M |

## Resuelto en Sprint 12.1 (Sep 2026)
- ✅ #1, #2, #3, #4: seeders relativos + fixes + `mt_srand(2026)` + volumen (124 casos).
- ✅ #6: `AlertasPlazo` derivada + Time Machine (`/dev/tiempo`, fix sesión) + enlace Sidebar dev-only.
- ✅ Paleta parcial: tokens institucionales en `app.css` + `helpers/tema.ts`.

## Resuelto en Sprint 12.2 — Rediseño Visual (8-sep-2026)
- ✅ Sistema de botones unificado: `PrimaryButton`/`SecondaryButton`/`DangerButton` → wrappers de `Button` Shadcn.
- ✅ Helper de fechas centralizado: `helpers/fechas.ts` (`formatearFechaCorta`, `formatearFechaLarga`, `formatearFechaHora`, `hoyISO`). Eliminadas 16 funciones inline.
- ✅ Empty state unificado: `ListaVacia` en todas las páginas principales.
- ✅ Login/Perfil fuera de Breeze legacy: tokens + dark mode. `AuthenticatedLayout` ya no se usa.
- ✅ Form components (`TextInput`, `InputLabel`, `InputError`, `Checkbox`): tokens semánticos en vez de grays/indigo hardcoded.
- ✅ 12 strings en inglés eliminados de la UI (UpdatePasswordForm, DeleteUserForm, perfil).
- ✅ `DeleteUserForm`: `Modal` Breeze → `Dialog` Shadcn (bundle: 32 kB → 2.38 kB).
- ✅ `DESIGN.md` formal actualizado con estado post-Sprint 12.2.

## Resuelto en Sprint 12.3 — Pulido pre-13 (9-sep-2026)
- ✅ Re-critique oficial: **25/40** (diseño) + detector limpio. Snapshot en `.impeccable/critique/2026-09-09*`. P0/P1 (card clicable, tabs/contadores, 0 PageHeader, auto-preset) a backlog.
- ✅ Limpieza Breeze final: eliminados `AuthenticatedLayout.tsx`, `Modal.tsx`, shim `Helpers/UppercaseText` (19 modelos → `Traits`).
- ✅ `routes/dev.php` (Time Machine fuera de `web.php`); `/design-system` solo-local (404 en producción).
- ✅ `SharedPageProps`: sin `as any` en `AppLayout/Header/Sidebar/InstitutionalLogo`.
- ✅ Sidebar/header morado casi negro `#1E0A33` fijo light+dark; iconos colapsados centrados (`gap-0 px-0`).
- ✅ Logo UTLCC (`LOGO-UTLCC.svg` vector + fallback PNG) en footer sidebar + login, regla de jerarquía en `DESIGN.md` (GAMEA principal).
- ⚠️ `LOGO-UTLCC.png` sigue recortado (subtítulo sin aire) — reemplazar sin tocar código cuando esté listo.

## P1 — Mantenibilidad

| # | Deuda | Dónde | Fix | Esfuerzo |
|---|---|---|---|---|
| 7 | God files frontend | `Bandeja.tsx:941`, `MisCasos.tsx:599`, `DenunciaSheet.tsx:587`, `TablaCatalogo.tsx:766`, `RegistroDenuncia.tsx:492` | Split por feature (patrón Bloque 2) | L |
| 8 | God backend | `CatalogoController.php:527`, `DenunciaSeeder.php:1044`, `DenunciaMasivaSeeder.php:538` | Extraer Services/Queries | M |
| 9 | Duplicados Card/Badge/Form | `Denuncias/DenunciaCard vs Card/`, `TipoDenunciaBadge`, `BloqueDenunciado/Prueba` + `Form/` | Quedarse con `Card/Form/Shared`, barrels solo compat | M |
| ~~10~~ | ~~`UppercaseText` doble~~ | — | ✅ Resuelto Sprint 12.3 (19 modelos → `Traits`, shim eliminado) | — |
| 11 | 43× `as any` + eslint-disable | `TablaCatalogo`, `ConsultarCasos`, `Bandeja`, `AppLayout/Header`, `TablaCatalogo.tsx:177`, `ModalExportar.tsx:60` | Tipar `PageProps`, quitar disables (Layouts hechos en 12.3 con `SharedPageProps`; resto pendiente) | M |
| 12 | `routes/web.php:198L` monolito | `routes/web.php` | Split `routes/denuncia.php`, `routes/reportes.php` (hecho `routes/dev.php` en 12.3) | S |

## P2 — Higiene / seguridad demo

| # | Deuda | Dónde | Fix | Esfuerzo |
|---|---|---|---|---|
| 13 | `DesignSystem` expuesto sin auth | `routes/web.php:60`, `DesignSystem.tsx:527` | ✅ Gateado a local en 12.3 (`abort_unless`); enlace Sidebar dev-only ya existía | S |
| 14 | `setup-demo-publica/` versionado | raíz | Mover a docs operativas / gitignore | S |
| 15 | Nombres dependencia legacy en seeder | `DenunciaMasivaSeeder.php:107-128` vs árbol 185 nodos | Resolver por `parent_id`/nombre hoja real | S |
| 16 | Sin índice `users.activo` en agregaciones | `Consultas - Dashboard` §1 | Verificar índice + toggle inactivos | S |
| 17 | Teclado en barras Recharts | `GraficoEmbudo/Barras/Carga/Evolucion` (solo `onClick`) | `tabIndex`+`role`+alternativa tabular (badge ya focuseable) | S |
| ~~18~~ | ~~Chips con fechas crudas + Reset→Limpiar~~ | ~~`FiltrosDashboard.tsx`~~ | ✅ Resuelto Sprint 12.2 | — |
| ~~19~~ | ~~`AuthenticatedLayout.tsx` y `Modal.tsx` Breeze sin consumers~~ | — | ✅ Eliminados en Sprint 12.3 | — |

## Pendientes cliente (no deuda, no tocar sin consulta)

- Archivar = ¿subestado `cerrada` o flujo propio?
- C7 destino Ministerio, C8 plazo reapertura, Panel usuarios Sprint 18.
