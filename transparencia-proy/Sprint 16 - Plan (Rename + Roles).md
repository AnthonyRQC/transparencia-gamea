# Sprint 16 — Plan (Rename + Roles y Permisos)

> **Estado:** PLANIFICADO (no ejecutado) · **Fecha plan:** 17-sep-2026 ·
> **Decisiones:** D11–D17 en `Decisiones 12.5 - 13 (Log).md` (bloque Sep-2026).
> **Origen:** pasar de demo a sistema funcional: (a) unificar el lenguaje con el personal
> (licenciados/abogados, no "técnicos") y (b) cerrar la brecha de seguridad donde ~80%
> de las rutas mutantes solo se ocultan en UI (`useCan`), sin guard en backend.
> **Reemplaza:** § Sprint 16 de `Sprints Pendientes - Contexto.md` (sin admin, sin
> permisos efectivos, sin rename) y la simulación multi-rol ya eliminada.
> **Fases:** 16.1 Rename `técnico` → `investigador` · 16.2 Roles, permisos y protección backend.

## 1. Principios

1. **La app verifica permisos, nunca roles.** Los roles son solo grupos de permisos
   (`PermisosCatalogo::ROLES`); backend y frontend chequean `puede('x')` / `can('x')`.
   Esto es lo que permitirá delegar funciones temporales (18C) sin tocar consumidores.
2. **Rename solo de la persona, no del proceso.** "Técnico" (persona) → "Investigador";
   "evaluación técnica previa" (proceso de la Ley 974 nombrado por el cliente) se conserva.
3. **Sin migraciones de rename.** No hay producción y la BD se regenera
   (`migrate:fresh --seed`): se editan las migraciones originales (evita cruft).
4. **Redirects, no 403.** Rol no autorizado → `/dashboard` + toast de error (coherente con
   `Bandeja`/`MisCasos` actuales). Invitado → `/login` (Breeze ya lo hace).
5. **Sin Policies por modelo todavía.** El record-scoping sigue donde ya vive
   (`MisCasos` filtra por `investigador_id`); Policies formales van a Sprint 21 si se
   justifican. Gates por capacidad (registrados en loop desde el catálogo) alcanza ahora.

---

## 2. Fase 16.1 — Rename completo

**Cuantificación real (medida):** 586 identificadores `tecnico` en 64 archivos (backend +
frontend), 49 strings de UI, 173 menciones en docs.

### 2.1 Base de datos (editar migraciones originales)

| Antes | Después | Dónde |
|---|---|---|
| `denuncias.tecnico_id` | `denuncias.investigador_id` | migración `create_denuncias_table` |
| `denuncias.tecnico_anterior_id` | `denuncias.investigador_anterior_id` | idem |
| `users.rol = 'tecnico'` | `users.rol = 'investigador'` | string(20), sin cambio estructural |
| `RolUsuario::TECNICO` | `RolUsuario::INVESTIGADOR = 'investigador'` | `app/Enums/RolUsuario.php` |

> **No se renombran:** `evaluaciones_tecnicas` (tabla), `caso.evaluar`,
> `TabEvaluacionPrevia`, textos "evaluación técnica" (proceso). Decisión D13.

### 2.2 Backend

- `PermisosCatalogo::ROLES['tecnico']` → `['investigador']`.
- `User`: `esTecnico()` → `esInvestigador()`, `scopeTecnicos()` → `scopeInvestigadores()`,
  casts/fillable sin cambio.
- Controllers: `AsignacionController::cargaTecnicos` → `cargaInvestigadores` (+ ruta
  `denuncias.carga-investigadores`), `MisCasosController`, `MiResumenController`,
  `EvaluacionController`, `DenunciaController` (notificación a jefes), `BandejaController`,
  `ArchivosCasoController`, `ConsultaCasosController` (filtro por investigador).
- Queries dashboard: `RendimientoQuery`, `OperativoQuery`, `KpiQuery`,
  `DashboardQueryBase` (`where('rol','tecnico')`, alias `tecnico_id`).
- Seeders (`UserSeeder`, `DenunciaSeeder`, `DenunciaMasivaSeeder`) y tests
  (nombres de usuario `investigador1..N`, columnas).
- `HandleInertiaRequests`: share de técnicos si aplica.

### 2.3 Frontend

- Renames: `TecnicoAvatar.tsx` → `InvestigadorAvatar.tsx`,
  `TecnicoCargaCard.tsx` → `InvestigadorCargaCard.tsx`, `cargaTecnicos` → `cargaInvestigadores`,
  props `tecnicoNombre`/`tecnicos`/`tecnicoId` → `investigador*`, `types/denuncia.ts`,
  `types/dashboard.ts`.
- `permissions.ts`: `Rol = 'registrador' | 'jefe' | 'investigador'` (+ `admin` en 16.2).
- 49 strings de UI: "Técnico(s)" → "Investigador(es)" revisando concordancia de género en
  textos largos (usar "el investigador asignado", "investigación a cargo de" donde aplique).

### 2.4 Gates de la fase

`php artisan migrate:fresh --seed` sin errores · `php artisan test` verde (base 118) ·
`tsc --noEmit` exit 0 · `npm run build` OK · grep de control: 0 `tecnico` visibles en UI.
Docs (173 menciones) se actualizan **al cierre** de la fase, no antes.
**Commit único** de la fase tras revisión visual.

---

## 3. Fase 16.2 — Roles, permisos y protección backend

### 3.1 Catálogo (fuente única: `app/Data/PermisosCatalogo.php` + mirror `resources/js/permissions.ts`)

**Permisos nuevos:**
- `menu.usuarios`, `usuario.crear`, `usuario.editar`, `usuario.desactivar`,
  `usuario.reset-password` (gestión de cuentas).
- `reporte.exportar` (separado de `reporte.ver`; "extraer informes" de la delegación).
- `caso.archivar` (hoy `denuncias.archivar` no tiene permiso).

**Limpieza:**
- `denuncia.eliminar` fuera de `registrador` (regla: solo Jefe elimina; el Registrador edita).
- `menu.feriados` huérfano (no hay ítem de Sidebar; vive dentro de catálogos) → se elimina,
  queda `admin.catalogo` cubriendo la pestaña.

**Rol `admin`** (solo gestiona + oversight, NO opera casos):
`menu.dashboard`, `menu.reportes`, `reporte.ver`, `reporte.exportar`,
`menu.usuarios` + 5 `usuario.*`, `menu.catalogos` + `admin.catalogo` + `admin.feriados`,
`menu.publicaciones` + `publicacion.*`, `notificacion.ver`.
**NO recibe:** ningún `caso.*`, `denuncia.*`, `menu.bandeja`, `menu.mis-casos`,
`menu.consultar-casos`, `archivo.*` de caso.

**Rol `jefe`** conserva todo lo actual + los 5 `usuario.*` (crea todo excepto admins, D11).

### 3.2 Permisos efectivos (seam de 18C)

Nuevo `app/Services/PermisosEfectivos.php`:

```php
// Efectivo = base del rol ∪ permisos de delegaciones activas (D12)
PermisosEfectivos::de($user): array   // memoizado por request
PermisosEfectivos::puede($user, $permiso): bool
```

`HandleInertiaRequests:39` pasa a `PermisosEfectivos::de($user)` — **único punto de
entrada al frontend** (Sidebar, `Can`, `useCan` funcionan sin cambios).

### 3.3 Gates + middleware

- `AppServiceProvider::boot()`: registrar `Gate::define($permiso, fn(User $u) => ...)` en loop
  desde `PermisosCatalogo::PERMISOS`.
- Nuevo `app/Http/Middleware/RoleMiddleware.php`: `role:jefe` (o combinaciones) →
  redirect `/dashboard` + `flash('error', 'NO TIENES PERMISO PARA ESA SECCIÓN.')`.
- Nuevo `app/Http/Middleware/EnsureActive.php`: si `!$user->activo` → logout + invalidar
  sesión + redirect login (evita sesiones válidas de usuarios desactivados).
- `bootstrap/app.php`: registrar aliases (`role`, `active`) y prepend de `EnsureActive` en web.

### 3.4 Rutas (split + `can:`)

Dividir `routes/web.php` (222 L) en:

```
routes/web.php          → entry + públicas (home, seguimiento, panel descarga)
routes/denuncias.php    → denuncias.* agrupadas con can:<permiso> por ruta
routes/reportes.php     → reportes.* (jefe/admin vía can:reporte.ver)
routes/admin.php        → catálogos, publicaciones (18A añade usuarios, 18C delegaciones)
routes/cuenta.php       → perfil, notificaciones, SSE
routes/dev.php          → Time Machine (ya existe, solo local)
```

Regla: cada ruta mutante con `can:` (o `role:` puntual donde el rol sea más claro que el
permiso). Fin del bypass por `curl` (D15).

### 3.5 Refactor de rol→permiso (12 puntos)

| Archivo | Hoy | Después |
|---|---|---|
| `BandejaController:16` | redirect si rol≠jefe | `can:menu.bandeja` |
| `MisCasosController:16,76` | rol≠tecnico | `can:menu.mis-casos` |
| `MiResumenController:14` | rol≠tecnico | `can:menu.mi-resumen` |
| `ConsultaCasosController:16` | abort 403 | redirect + `can:consulta.ver` |
| `ReporteController:63` | abort 403 jefe | redirect + `can:reporte.ver` |
| `PublicacionController:215` | in_array(jefe,registrador) | `can:menu.publicaciones` |
| `DashboardController:38` | `esJefe` por rol | `esAdmin`/`esJefe`/`esInvestigador`/`esRegistrador` por permisos + `modoVista()` |
| `AlertasPlazo:37` | rol==='jefe' | `puede('caso.admitir')` |
| `Notificacion:48` | reescribe destino para jefe | `puede('menu.bandeja')` |
| `DenunciaController:127` | notifica a `rol='jefe'` | notifica a quienes `puede('caso.admitir')` (jefes + interinos de 18C) |
| `EvaluacionController:57` | fallback `rol='jefe'` | idem anterior |
| `User.php:42-55` | `esJefe/esTecnico/esRegistrador` | conservar helpers + `puede()` nuevo |

### 3.6 Seeds dev

`UserSeeder` suma `admin` (password `demo123`, solo dev). Nombres de usuarios renombrados a
`investigador1..N`. Prod (Sprint 21) tendrá `AdminInicialSeeder` con password por env.

## 4. Matriz de acceso resultante

| Capacidad | admin | jefe | investigador | registrador |
|---|---|---|---|---|
| Casos (bandeja, admitir, asignar, informes, cierres) | — | ✅ | solo sus casos | — |
| Registro + consulta de casos | — | — | — | ✅ |
| Dashboard | global (oversight) | global | personal | general |
| Reportes + export | ✅ | ✅ | — | — |
| Catálogos + feriados | ✅ | ✅ | — | — |
| Avisos/portal | ✅ | ✅ | — | ✅ |
| Usuarios (18A) | todos | todos menos admin | — | — |
| Delegaciones (18C) | todas | whitelist (D12) | — | — |

## 5. Gates del sprint

Igual que 12.5/13: `php artisan test` verde + `tsc --noEmit` exit 0 + `npm run build` OK +
visual light/dark 1280×720 + **tests nuevos de matriz de acceso** (por cada rol: 200 /
redirect / login) + test de `EnsureActive` + test de sync catálogo PHP↔TS.
Commit por fase (16.1 rename, 16.2 roles+rutas).

## 6. Fuera de alcance

- Policies por modelo → Sprint 21 (evaluar con auditoría).
- UI de usuarios (`/admin/usuarios`) → 18A; delegaciones → 18C; Mi Cuenta → 18B.
- `owen-it/laravel-auditing` y panel de auditoría → Sprint 21.
- Seeds split prod/dev, `.env` producción, narrativa docs demo→funcional → Sprint 21
  (excepto el rename de docs, que se cierra con 16.1).

## 7. Referencias

- `Decisiones 12.5 - 13 (Log).md` → D11–D17 (bloque Sep-2026).
- `Sprint 18A - Plan Panel Usuarios.md` · `Sprint 18C - Plan Delegaciones.md`.
- `Deuda Tecnica y Riesgos.md` (diferidos a 21) · `AI-CONTEXT.md` (comandos y convenciones).
