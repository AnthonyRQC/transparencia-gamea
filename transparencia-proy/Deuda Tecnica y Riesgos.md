# Deuda Técnica y Riesgos

> **Propósito:** Registro vivo de deuda, riesgos y mejoras diferidas para trabajar a futuro. No es roadmap de sprints.
> **Actualizado:** 2026-09-04. Stack: Laravel 13 / PHP 8.3.

## P0 — Bloquea demo / dashboard

| # | Deuda / riesgo | Dónde | Impacto | Fix sugerido | Esfuerzo |
|---|---|---|---|---|---|
| 1 | Seeders con fechas fijas Feb-Jun 2026 → 100% mora hoy | `database/seeders/DenunciaSeeder.php:141-1073` | Dashboard KPIs 3/4 y urgentes inutilizables | Fechas relativas a `hoy` con `DiasHabiles::agregar()` (ver plan Sep 2026) | M |
| 2 | `escenario='anonima'` ≠ enum `'anonimo'` | `database/seeders/DenunciaMasivaSeeder.php:164` | Seed falla / datos inválidos | `anonima` → `anonimo` | S |
| 3 | `prueba tipo='archivo'` ≠ enum `fisica/testigo` | `database/seeders/DenunciaMasivaSeeder.php:250` | Seed falla (pruebas) | Quitar `archivo`, solo `fisica/testigo` (archivos van a `denuncias_archivos`) | S |
| 4 | `random_int` sin seed | `DenunciaMasivaSeeder.php:192,224,438` | Demo no reproducible | `srand(2026)` / faker seed | S |
| 5 | `backup-transparencia-*.sql` versionado | raíz | Repo pesado, confunde fuente (fuente = seeders) | `.gitignore` + mover a backup local | S |
| 6 | Alertas plazo no vivas (solo persistidas) | `HandleInertiaRequests.php:50`, `NotificacionController.php:16` | Campana no muestra “vence en N días” sin Time Machine + derivadas | Restaurar `AlertasPlazo` derivada (Sprint 9 → Eloquent) | M |

## P1 — Mantenibilidad

| # | Deuda | Dónde | Fix | Esfuerzo |
|---|---|---|---|---|
| 7 | God files frontend | `Bandeja.tsx:941`, `MisCasos.tsx:599`, `DenunciaSheet.tsx:587`, `TablaCatalogo.tsx:766`, `RegistroDenuncia.tsx:492` | Split por feature (patrón Bloque 2) | L |
| 8 | God backend | `CatalogoController.php:527`, `DenunciaSeeder.php:1044`, `DenunciaMasivaSeeder.php:538` | Extraer Services/Queries | M |
| 9 | Duplicados Card/Badge/Form | `Denuncias/DenunciaCard vs Card/`, `TipoDenunciaBadge`, `BloqueDenunciado/Prueba` + `Form/` | Quedarse con `Card/Form/Shared`, barrels solo compat | M |
| 10 | `UppercaseText` doble | `app/Traits/` + `app/Helpers/` (shim) | Eliminar shim, solo Trait | S |
| 11 | 43× `as any` + eslint-disable | `TablaCatalogo`, `ConsultarCasos`, `Bandeja`, `AppLayout/Header`, `TablaCatalogo.tsx:177`, `ModalExportar.tsx:60` | Tipar `PageProps`, quitar disables | M |
| 12 | `routes/web.php:198L` monolito | `routes/web.php` | Split `routes/denuncia.php`, `routes/reportes.php`, `routes/dev.php` | S |

## P2 — Higiene / seguridad demo

| # | Deuda | Dónde | Fix | Esfuerzo |
|---|---|---|---|---|
| 13 | `DesignSystem` expuesto sin auth | `routes/web.php:60`, `DesignSystem.tsx:527` | Gate `env(local)` o auth | S |
| 14 | `setup-demo-publica/` versionado | raíz | Mover a docs operativas / gitignore | S |
| 15 | Nombres dependencia legacy en seeder | `DenunciaMasivaSeeder.php:107-128` vs árbol 185 nodos | Resolver por `parent_id`/nombre hoja real | S |
| 16 | Sin índice `users.activo` en agregaciones | `Consultas - Dashboard` §1 | Verificar índice + toggle inactivos | S |

## Pendientes cliente (no deuda, no tocar sin consulta)

- Archivar = ¿subestado `cerrada` o flujo propio?
- C7 destino Ministerio, C8 plazo reapertura, Panel usuarios Sprint 18.
