# Sprint 16 — Plan (Rename + Roles y Permisos)

> **Estado:** 16.1 EJECUTADA ✅ (17-sep-2026, `1b68fcd`) · 16.2 pendiente · **Fecha plan:** 17-sep-2026 ·
> **Replan:** 17-sep-2026 (tarde) — D18–D25.
> **Decisiones:** D11–D25 en `Decisiones 12.5 - 13 (Log).md`.
> **Origen:** pasar de demo a sistema funcional: (a) unificar el lenguaje con el personal
> (licenciados/abogados, no "técnicos") y (b) cerrar la brecha de seguridad donde ~80%
> de las rutas mutantes solo se ocultan en UI (`useCan`), sin guard en backend.
> **Fases:** 16.1 Rename `técnico` → `investigador` · 16.2 Roles, permisos y protección backend.

## 1. Principios

1. **La app verifica permisos, nunca roles.** Los roles son grupos de permisos
   (`PermisosCatalogo::ROLES`); backend y frontend chequean `puede('x')` / `can('x')`.
   `User::puede()` / `PermisosEfectivos` hoy = catálogo del rol; 18C suma delegaciones
   sin tocar consumidores.
2. **Rename solo de la persona, no del proceso.** "Técnico" (persona) → "Investigador";
   "evaluación técnica previa" (proceso) se conserva.
3. **Sin migraciones de rename.** No hay producción: se editan las migraciones originales
   y `migrate:fresh --seed`.
4. **Redirects, no 403.** `AuthorizationException` → `/dashboard` + toast. Invitado → `/login`.
5. **Sin Policies por modelo.** Record-scoping vía `CasoAuth` (D19). Policies en Sprint 21
   (una línea que delega al helper).
6. **Sin `RoleMiddleware`.** `role:jefe` rompería al interino de 18C (D18).

---

## 2. Fase 16.1 — Rename completo

**Cuantificación real (medida):** 586 identificadores `tecnico` en 64 archivos (backend +
frontend), 49 strings de UI, 173 menciones en docs.

### 2.1 Base de datos (editar migraciones originales)

| Antes | Después | Dónde |
|---|---|---|
| `denuncias.tecnico_id` | `denuncias.investigador_id` | `create_denuncias_table` |
| `denuncias.tecnico_anterior_id` | `denuncias.investigador_anterior_id` | idem |
| `evaluaciones_tecnicas.tecnico_id` | `evaluaciones_tecnicas.investigador_id` | `create_evaluaciones_tecnicas_table` (persona, D20) |
| `users.rol = 'tecnico'` | `users.rol = 'investigador'` | string(20) |
| `RolUsuario::TECNICO` | `RolUsuario::INVESTIGADOR = 'investigador'` | `app/Enums/RolUsuario.php` |

> **No se renombran:** tabla `evaluaciones_tecnicas`, estado `evaluacion_tecnica`,
> `caso.evaluar`, `TabEvaluacionPrevia`, textos "evaluación técnica" (proceso). D13+D20.

### 2.2 Backend

- `PermisosCatalogo::ROLES['tecnico']` → `['investigador']`.
- `User`: `esTecnico()` → `esInvestigador()`, `scopeTecnicos()` → `scopeInvestigadores()`.
- Relación `EvaluacionTecnica::tecnico()` → `investigador()`.
- Controllers: `cargaTecnicos` → `cargaInvestigadores` (+ ruta `denuncias.carga-investigadores`),
  `MisCasosController`, `MiResumenController`, `EvaluacionController`, `DenunciaController`,
  `BandejaController`, `ArchivosCasoController`, `ConsultaCasosController`.
- Queries dashboard: `tecnico_id` / `rol='tecnico'` → `investigador_*`.
- Seeders y tests (usernames temporales `investigador1..N` en 16.1; 18A pasa a fórmula CI).
- `lang/es/validation.php`: atributo `tecnico_id` → `investigador_id`.

### 2.3 Frontend

- `TecnicoAvatar.tsx` → `InvestigadorAvatar.tsx`, `TecnicoCargaCard.tsx` → `InvestigadorCargaCard.tsx`.
- Props `tecnicoNombre` / `tecnicos` / `tecnicoId` → `investigador*`.
- `permissions.ts`: `Rol = 'registrador' | 'jefe' | 'investigador'` (+ `admin` en 16.2).
- 49 strings UI: "Técnico(s)" → "Investigador(es)" (concordancia de género).

### 2.4 Gates de la fase

`php artisan migrate:fresh --seed` · `php artisan test` verde (base 118) · `tsc --noEmit` ·
`npm run build` · grep: 0 `tecnico` visibles en UI (excepto proceso "evaluación técnica").
Docs (173 menciones) se actualizan **al cierre** de la fase.
**Commit único** de la fase tras revisión visual.

---

## 3. Fase 16.2 — Roles, permisos y protección backend

### 3.1 Catálogo (`PermisosCatalogo.php` + mirror `permissions.ts`)

**Permisos nuevos:**
- `menu.usuarios`, `usuario.crear`, `usuario.editar`, `usuario.desactivar`,
  `usuario.reset-password` (**4** `usuario.*` + menú; reactivar = `desactivar`).
- `reporte.exportar` (separado de `reporte.ver`).
- `caso.archivar`.

**Limpieza:**
- `denuncia.eliminar` fuera de `registrador` (solo Jefe elimina; el Registrador edita).
- `menu.feriados` huérfano → se elimina; `admin.catalogo` cubre la pestaña.
- Registrador **sin** `menu.notificaciones` ni `notificacion.ver` (D24). 18C se las
  devuelve con el paquete bandeja.

**Rol `admin`** (Sistemas: gestiona, NO opera casos):
`menu.dashboard`, `menu.reportes`, `reporte.ver`, `reporte.exportar`,
`menu.usuarios` + 4 `usuario.*`, `menu.catalogos` + `admin.catalogo` + `admin.feriados`,
`menu.publicaciones` + `publicacion.*`.
**NO recibe:** `caso.*`, `denuncia.*`, `menu.bandeja`, `menu.mis-casos`,
`menu.consultar-casos`, `archivo.*` de caso, `notificacion.ver` (no opera).

**Rol `jefe`:** lo actual + 4 `usuario.*` + `menu.usuarios` + `reporte.exportar` + `caso.archivar`.
Crea/edita/desactiva jefes, investigadores y registradores; **no** admins (D22).

### 3.2 Permisos efectivos (seam de 18C)

`app/Services/PermisosEfectivos.php` (delgado):

```php
// Hoy = catálogo del rol. 18C: rol ∪ delegaciones activas.
PermisosEfectivos::de($user): array   // memoizado por request
PermisosEfectivos::puede($user, $permiso): bool
```

`User::puede($permiso)` delega aquí. `HandleInertiaRequests` comparte
`PermisosEfectivos::de($user)` — único punto al frontend.

### 3.3 Gates + middleware (sin RoleMiddleware)

- `AppServiceProvider::boot()`: `Gate::define` en loop desde `PermisosCatalogo::PERMISOS`
  usando `PermisosEfectivos::puede`.
- `EnsureActive`: `!$user->activo` → logout + invalidar sesión + redirect login.
- `bootstrap/app.php`: alias `active`; `EnsureActive` en el grupo web (skip si no hay user).
- **Handler 403:** `AuthorizationException` → redirect `/dashboard` +
  `flash('error', 'NO TIENES PERMISO PARA ESA SECCIÓN.')`.

### 3.4 Rutas (split + `can:`)

```
routes/web.php          → entry + públicas (home, seguimiento,
                          panel.descargar ← HOY está dentro de auth, D25)
routes/denuncias.php    → denuncias.* con can:<permiso>
routes/reportes.php     → can:reporte.ver
routes/admin.php        → catálogos, publicaciones (18A usuarios, 18C delegaciones)
routes/cuenta.php       → perfil, notificaciones, SSE
routes/dev.php          → Time Machine (ya existe, solo local)
```

Cada ruta mutante con `can:`. **No** `role:`. Quitar `DELETE /profile`.

### 3.5 CasoAuth (D19)

Helper usado en controllers de mutación (no Policies):

| Familia | Permisos | ¿De qué caso? |
|---|---|---|
| Unidad | admitir, rechazar, asignar, traspasar, reabrir, ampliar, conciliar, delegar/reasumir evaluación, saltar-fase, archivar, denuncia.editar/eliminar | cualquiera |
| Expediente | iniciar, solicitud.*, descargo.*, informe.*, cierre.*, caso.evaluar | dueño (`investigador_id`) o evaluación asignada |

`caso.admitir` **no** abre expediente ajeno (investigador-interino).

### 3.6 Carreras (D24)

`admitir` / `rechazar` / `asignar` / `traspasar` (y equivalentes de estado):
dentro de `DB::transaction`, `lockForUpdate`, re-leer estado, si ya cambió → toast
`ESTA DENUNCIA YA FUE ADMITIDA POR {NOMBRE}.`

### 3.7 Refactor de rol→permiso

| Archivo | Hoy | Después |
|---|---|---|
| `BandejaController` | rol≠jefe | `can:menu.bandeja` |
| `MisCasosController` | rol≠tecnico | `can:menu.mis-casos` |
| `MiResumenController` | rol≠tecnico | `can:menu.mi-resumen` |
| `ConsultaCasosController` | abort 403 | `can:consulta.ver` |
| `ReporteController` | abort 403 jefe | `can:reporte.ver` |
| `PublicacionController` | in_array(jefe,registrador) | `can:menu.publicaciones` |
| `DashboardController` | `esJefe` por rol | **no rediseñar modos en 16** (D25). Mínimo: no romper; `esInvestigador` tras rename |
| `AlertasPlazo` | rol registrador → `[]`; rol jefe | registrador sin permiso notif.; `puede('caso.admitir')` para destino unidad |
| `Notificacion` | reescribe URL por rol | **dejar de reescribir**; URL fija al crear (D24) |
| `DenunciaController` | notifica `rol='jefe'` | todos los que `puede('caso.admitir')` |
| `EvaluacionController` | un jefe (`delegada_por` ?? first) | quien delegó; si no, todos con `caso.admitir` |
| `User` | `esJefe/esTecnico/esRegistrador` | + `esInvestigador`, `esAdmin`, `puede()` |
| `ProfileController` | `destroy` borra fila | **eliminar** método, ruta y `DeleteUserForm` |

### 3.8 Seeds dev

`UserSeeder` suma `admin` (`demo123`, solo dev). Usernames 16.1: `investigador1..N`
(18A pasará a fórmula iniciales+CI). Prod: `AdminInicialSeeder` en Sprint 21.

## 4. Matriz de acceso resultante

| Capacidad | admin | jefe | investigador | registrador |
|---|---|---|---|---|
| Casos (bandeja, admitir, asignar) | — | ✅ | — | — (18C puede sumar) |
| Informes / cierres / solicitudes | — | — | solo sus casos | — |
| Registro + consulta | — | — | — | ✅ |
| Dashboard | sin rediseño en 16 (D25) | global | personal | global acotado (hoy) |
| Reportes + export | ✅ | ✅ | — | — |
| Catálogos + feriados | ✅ | ✅ | — | — |
| Avisos/portal | ✅ | ✅ | — | ✅ |
| Campana notificaciones | — | ✅ | ✅ | — (18C paquete bandeja) |
| Usuarios (18A) | todos | todos menos admin | — | — |
| Delegaciones (18C) | whitelist+ | whitelist | — | — |

## 5. Gates del sprint

`php artisan test` verde + `tsc --noEmit` + `npm run build` + visual light/dark 1280×720 +
tests de matriz de acceso (por rol: 200 / redirect / login) + `EnsureActive` +
`AuthorizationException` → redirect + sync catálogo PHP↔TS + `CasoAuth` (unidad vs
expediente) + carrera admitir (segundo request → toast) + `DELETE /profile` → 404/redirect.
Commit por fase (16.1 rename, 16.2 roles+rutas+CasoAuth).

## 6. Fuera de alcance

- Policies por modelo → 21.
- UI usuarios → 18A; delegaciones → 18C; Mi Cuenta / `debe_cambiar_password` force → 18B.
- Rediseño dashboard (2 modos unidad/personal) → futuro, D25.
- Impersonation / simular páginas → `Notas - Admin simulacion (futuro).md`.
- `owen-it/laravel-auditing` → 21.
- Seeds split prod/dev → 21 (excepto rename de docs, cierre 16.1).

## 7. Referencias

- `Decisiones 12.5 - 13 (Log).md` → D11–D25.
- `Sprint 18A - Plan Panel Usuarios.md` · `Sprint 18C - Plan Delegaciones.md`.
- `Deuda Tecnica y Riesgos.md` · `AI-CONTEXT.md`.
