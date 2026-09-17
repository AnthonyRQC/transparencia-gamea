# Deuda Técnica y Riesgos

> **Propósito:** Registro vivo de deuda, riesgos y mejoras diferidas para trabajar a futuro. No es roadmap de sprints.
> **Actualizado:** 2026-09-17 (post planificación Sprint 16/18A/18C). Stack: Laravel 13 / PHP 8.3. Suite 118 tests.

## Planificado 17-sep-2026 (Sprint 16 / 18A / 18C)

> Deuda que estos sprints cierran o mueven — ver planes en `Sprint 16 - Plan (Rename + Roles).md`,
> `Sprint 18A - Plan Panel Usuarios.md`, `Sprint 18C - Plan Delegaciones.md`.

- ✅ **Brecha de autorización backend** (P0 de seguridad): ~80% de rutas mutantes sin guard
  (solo ocultas en UI) → `RoleMiddleware` + `EnsureActive` + `can:` por ruta en **16.2**.
- ✅ **Login "case-sensitive"** (doc inexacto): confirmado que MySQL es ci y así se mantiene;
  doc corregido en 16.2 y validación de unicidad explícita en 18A (ojo SQLite de tests).
- ✅ **`routes/web.php` monolito (198 L)**: split planificado **dentro de 16.2** (era B3→21).
- ✅ **Sin gestión de usuarios**: `/admin/usuarios` (18A) + invariantes + relevo masivo.
- ✅ **Permisos personalizados v2 (Sprint 25)**: necesidad real cubierta por 18C (delegaciones
  temporales); el panel granular permanente sigue diferido.
- 🔀 **Sprint 17 (auditoría) fusionado en 21** — ver abajo.

## P0 — Bloquea producción (ex "Bloquea demo")

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

## Diferido a post-13/16 → 21 (decisión 09-sep-2026)

> Ver `Decisiones 12.5 - 13 (Log).md` (D1, D5, D6). R1 del plan 12.5 va pre-13;
> esto espera a que existan Roles (16) y Auditoría (17) para no invalidarse.

| # | Deuda | Cuándo | Nota |
|---|---|---|---|
| R2.1 | `Shared/FormDialog` (~20 modales) | Piloto post-16 | Admisión/Rechazo/Asignación primero; si diverge, queda fuera |
| R2.2 | `Shared/FiltrosCaso` + `useFiltroCasos` | Post-18C | Toca queries/filtros de 5 superficies; suite verde como red |
| B1 | N+1 + índices (`users.activo`, estados) | 21 | Skills revisores: `technical-debt`, `database-optimization` |
| B2 | God backend (`CatalogoController:527`, seeders) | 21 | Extraer Services/Queries |
| B3 | `43× as any` resto | 21 | Layouts ya hechos en 12.3; split `web.php` se adelanta a 16.2 |
| B4 | OWASP + E2E Playwright | 21 | `owasp-security`, `e2e-playwright-testing` |
| B5 | Avatar: color paleta oficial + hash fallback | 18A/18B | D7: hook `creating` + picker Perfil + migrar `bg-*` legacy; `InvestigadorAvatar` resuelve clave |
| B6 | Auditoría backend (`owen-it/laravel-auditing`) + UI | 21 | Fusionada del Sprint 17 (17-sep-2026). Incluye User y Delegacion |
| B7 | **Panel administrativo de auditoría** (consulta sin SQL directo) | 21 (sin confirmar) | Pedido por Sistemas GAMEA "por verse" (17-sep-2026). **No decidido**; si se confirma, entra junto a B6 |
| B8 | Seeds split prod/dev + `.env.production.example` + gitignore backups | 21 | `AdminInicialSeeder` con password por env; demo123 solo dev |

**Guardarraíl pre-13 (no arrastrar deuda contagiosa):** no nuevos wrappers
`formatDate`, no avatares manuales, importar de `constants/semantica.ts`,
`helpers/fechas.ts` y shared nuevos; chips/badges solo vía mapas semánticos.

## Pendientes cliente (no deuda, no tocar sin consulta)

- Archivar = ¿subestado `cerrada` o flujo propio?
- C7 destino Ministerio, C8 plazo reapertura, Panel usuarios Sprint 18.
