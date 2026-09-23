# Deuda Técnica y Riesgos

> **Propósito:** Registro vivo de deuda, riesgos y mejoras diferidas para trabajar a futuro. No es roadmap de sprints.
> **Actualizado:** 2026-09-23. Stack: Laravel 13 / PHP 8.3. Suite 191 tests (1369 aserciones).

## Planificado 17-sep-2026 (Sprint 16 / 18A / 18C)

> Deuda que estos sprints cierran o mueven — D18–D25. Planes `Sprint 16`, `18A`, `18C`.

- ✅ **Brecha de autorización backend:** `can:` + `EnsureActive` + handler 403→redirect
  (**sin** `RoleMiddleware`) + `CasoAuth` (unidad vs expediente) en **16.2**.
- ✅ **Carreras 2–3 jefes:** `lockForUpdate` + toast «ya fue admitida por X» en **16.2**.
- ✅ **Login case-insensitive:** `lower(username)` + `Auth::login` en 16.2; fórmula username
  en 18A. SQLite tests con `lower()`.
- ✅ **`DELETE /profile`:** delete físico → se quita en **16.2**.
- ✅ **`routes/web.php` monolito** + `/panel/archivos/.../descargar` mal metida en `auth`:
  split en **16.2**, descarga a públicas.
- ✅ **Gestión de usuarios:** 18A (CI único, username autogenerado, jefe administra jefes).
- ✅ **Dos funciones / una cuenta:** 18C recortado (preset `jefe_interino`, sin `usuario.*`).
- 🔀 **Sprint 17 (auditoría forense) fusionado en 21**.
- 📝 **Dashboard 2 modos** (unidad/personal) y **impersonation**: no 16; ver D25 y
  `Notas - Admin simulacion (futuro).md`.

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

> Actualización 23-sep-2026: `Bandeja.tsx` (941→453L) y `MisCasos.tsx` (599→225L) ya divididos; `CatalogoController` (527→38L) y `UsuarioController` (491→126L) adelgazados a Queries/Services/Requests. El resto de la tabla queda sin re-verificar.

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

## Rendimiento (medido 23-sep-2026)

> Medición local con demo seed (124 casos), Laragon + MySQL, `APP_DEBUG=true`, sin caches.

| Escenario | Tiempo |
|---|---|
| Página de login (invitado) vía localhost | 0.32 s |
| Página de login vía `transparencia.test` | 0.55 s |
| Página de login vía LAN (192.168.1.10) | 0.85 s |
| `AlertasPlazo::paraUsuario(jefe)` — corre en **cada** request autenticado (`HandleInertiaRequests::share()`) | **376 ms** |

- **Hotspot**: `AlertasPlazo` (`app/Services/AlertasPlazo.php`) consulta hasta 100 denuncias + 50 solicitudes + 50 descargos y calcula plazos con `DiasHabiles` (bucles día a día). Es la **única causa que persistiría en producción**.
- Opciones a evaluar con medición antes/después: (a) cachear el resultado por usuario 30–60 s (los avisos toleran ese lag); (b) calcular plazos en SQL como el dashboard (`app/Queries/Dashboard/*`); (c) bajar límites / consultar solo vencidos.
- Factores **solo-dev** (no afectan producción): Vite en modo dev por LAN (`public/hot` → `192.168.1.10:5173`, assets sin empaquetar) y `APP_DEBUG=true` sin cache de config/rutas.
- Receta producción: `npm run build` + `APP_DEBUG=false` + `php artisan optimize` + OPcache. Pasos operativos de demo en `pre-defensa/07-Demo-Kit.md`.

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
| B5 | Avatar: color paleta oficial + hash fallback | ✅ 18A/18B | Hook `creating` + picker Perfil + safelist + seeds a paleta. `InvestigadorAvatar` recibe clase; hash fallback sigue pendiente menor |
| B6 | Auditoría backend (`owen-it/laravel-auditing`) + UI | 21 | Fusionada del Sprint 17 (17-sep-2026). Incluye User y Delegacion |
| B7 | **Panel administrativo de auditoría** (consulta sin SQL directo) | 21 (sin confirmar) | Pedido por Sistemas. **No decidido**; si se confirma, entra junto a B6 |
| B8 | Seeds split prod/dev + `.env.production.example` + gitignore backups | 21 | `AdminInicialSeeder` con password por env; demo123 solo dev |
| B9 | Dashboard 2 modos (unidad / personal); registrador ve unidad | Futuro, no 16 | D25. Hoy 4 ramas por rol |
| B10 | Impersonation / simular páginas como otro rol | No Fase 1 | `Notas - Admin simulacion (futuro).md`. Consultar Sistemas |
| B11 | `AlertasPlazo` en `share()`: 376 ms medidos por request autenticado | 21 o pre-producción | Cache por usuario / plazos SQL-side; ver sección **Rendimiento** |

**Guardarraíl pre-13 (no arrastrar deuda contagiosa):** no nuevos wrappers
`formatDate`, no avatares manuales, importar de `constants/semantica.ts`,
`helpers/fechas.ts` y shared nuevos; chips/badges solo vía mapas semánticos.

## Pendientes cliente (no deuda, no tocar sin consulta)

- Archivar = ¿subestado `cerrada` o flujo propio?
- C7 destino Ministerio, C8 plazo reapertura.
- Panel usuarios → 18A (planificado). Impersonation / panel auditoría → consulta Sistemas.
