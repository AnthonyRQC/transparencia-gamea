# Sprint 18A — Plan: Panel de Administración de Usuarios

> **Estado:** PLANIFICADO (no ejecutado) · **Fecha plan:** 17-sep-2026 ·
> **Decisiones:** D11, D14, D16, D17 en `Decisiones 12.5 - 13 (Log).md` (bloque Sep-2026).
> **Origen:** decisión de cliente — el sistema necesita un rol administrador con control
> total de cuentas; el Jefe de Unidad crea jefes/técnicos(→investigadores)/registradores
> pero no admins. Escenario de relevo de gestión cada ~4 años con recambio casi total de
> personal. Nota abierta: alcance final del admin pendiente de consulta con el personal
> de Sistemas de la institución (ver §8).
> **Depende de:** Sprint 16 (RoleMiddleware, `usuario.*`, `PermisosEfectivos`).
> **Extiende:** perfil Breeze existente (18B trabaja el lado self-service).

## 1. Objetivo

Panel `/admin/usuarios` (Jefe + Admin según matriz) para crear, editar, desactivar/reactivar,
resetear contraseñas y ejecutar acciones masivas de relevo de personal, con invariantes de
seguridad e integridad que impidan quedarse sin administración o dejar casos huérfanos.

## 2. Matriz de jerarquía (quién administra a quién)

| Creador / Editor → | admin | jefe | investigador | registrador |
|---|---|---|---|---|
| **admin** | ✅ | ✅ | ✅ | ✅ |
| **jefe** | ❌ | ✅ (con guards) | ✅ | ✅ |
| investigador / registrador | ❌ | ❌ | ❌ | ❌ |

- El **admin** puede todo, pero no puede desactivarse ni degradarse a sí mismo.
- El **jefe** nunca ve ni toca cuentas de admin (ni en listado: el select de rol no ofrece
  `admin` y el backend rechaza la operación).
- Jefe editando a otro jefe: permitido con guards (D16); degradar a investigador/registrador
  pide confirmación explícita.

## 3. Funcionalidad

### 3.1 Listado

- Tabla con filtros: rol, estado (`activos`/`inactivos`/todos), búsqueda por nombre/username.
- Columnas: avatar (iniciales + color D7), nombre, username, rol, contacto, estado,
  "inactivo desde" (`desactivado_at`), acciones.
- Contadores de cabecera: admins/jefes activos (invariantes visibles).

### 3.2 Crear usuario

- Campos: `username` (único, case-insensitive, charset `[A-Za-z0-9._-]{3,30}`, sin espacios),
  nombre completo, rol (select filtrado por matriz del creador), email (opcional),
  teléfono (opcional), contraseña inicial.
- Automáticos: `iniciales` (del nombre) y `color` de paleta oficial (D7) vía hook `creating`.
- Contraseña: política `min:10 + mayúscula + minúscula + número` (símbolos permitidos);
  se muestra **una sola vez** al confirmar + `debe_cambiar_password = true`.
- Registra `creado_por_id`.

### 3.3 Editar

- Campos editables: nombre, email, teléfono, rol (matriz + guards), `activo`.
- Cambio de rol: revoca delegaciones activas del usuario (coherencia) y registra evento.

### 3.4 Reset de contraseña

- Genera temporal aleatoria (12+ chars) mostrada una sola vez + `debe_cambiar_password = true`
  + revoca sesiones activas y `remember_token`.

### 3.5 Desactivar / reactivar

Flujo de desactivación (el punto crítico del relevo de gestión):

1. Modal de **impacto**: lista casos activos asignados (`estado` activo y
   `investigador_id = user`) + delegaciones activas.
2. **Bloqueo duro** si hay casos activos → ofrece **traspaso en lote**: select de
   investigador destino (activo, no el mismo) que reasigna todos los casos con una
   justificación única (registra traspaso en cada denuncia + bitácora, reusa el patrón de
   `AsignacionController::traspasar`).
3. Al confirmar: `activo = false`, `desactivado_at = now()`, `desactivado_por_id`,
   `motivo_baja` (**opcional**), revocación de delegaciones activas, revocación de sesiones
   y `remember_token`.
4. Reactivar: `activo = true` + limpieza de `desactivado_*` (el histórico queda en el log de
   auditoría de 21).

### 3.6 Acciones masivas (relevo de gestión)

- Multi-select en listado → desactivar/reactivar lote con el mismo flujo de guards
  (si algún usuario tiene casos activos, el lote se detiene y muestra los pendientes de
  traspaso).

## 4. Invariantes (validados en transacción con `lockForUpdate`)

1. Siempre ≥1 admin activo y ≥1 jefe activo (no lockout institucional).
2. Nadie se desactiva ni se degrada a sí mismo.
3. Nadie administra cuentas de nivel superior (jefe ↛ admin).
4. Un usuario no puede crear/asignar un rol que no está en su matriz.
5. Nunca delete físico: solo `activo = false` (FKs, bitácora y agregaciones preservan historia).
6. Toda mutación se envuelve en `DB::transaction` (crear + iniciales/color; desactivar +
   revocar delegaciones/sesiones).

## 5. Modelo BD

`users` (+4 columnas, migración aditiva 18A):

```
creado_por_id        FK → users, nullable
desactivado_por_id   FK → users, nullable
desactivado_at       timestamp, nullable
motivo_baja          texto, nullable        (opcional, MAYÚSCULAS)
debe_cambiar_password boolean default false (usado por 18A y 18B)
```

## 6. Frontend

- `resources/js/Pages/Admin/Usuarios.tsx` + `Components/Admin/`:
  `TablaUsuarios`, `ModalCrearUsuario`, `ModalEditarUsuario`, `ModalResetPassword`,
  `ModalImpactoDesactivar` (casos + delegaciones + traspaso en lote), `ModalCredencialTemporal`
  (password mostrada una vez con botón copiar).
- Ítem Sidebar "Usuarios" con `can('menu.usuarios')`.
- Patrón `TablaResponsive` + `ConfirmDialog` + `Paginacion` (DESIGN.md, R1).

## 7. Validaciones y tests

- Backend: `StoreUsuarioRequest` / `UpdateUsuarioRequest` con matriz de roles permitidos por
  actor (`Rule::in` calculado), unicidad case-insensitive explícita
  (`whereRaw('lower(username) = ?')` — **SQLite de tests es case-sensitive, MySQL no**).
- Tests: matriz completa (admin/jefe × crear/editar cada rol), invariantes (último admin,
  auto-desactivación, jefe→admin denegado), desactivación con casos (bloqueo + traspaso en
  lote), reset (flag + revocación), masivo.

## 8. Pendiente de cliente/Sistemas (no bloquea 18A base)

- **Alcance final del admin** y posible **panel de auditoría administrativa** (consulta fácil
  de auditoría sin SQL directo): mencionado por Sistemas "por verse". Si se confirma, se
  planifica como corte de Sprint 21 (junto con `owen-it/laravel-auditing` + UI de consulta).
  Registrado en `Deuda Tecnica y Riesgos.md` y `AI-CONTEXT.md`.

## 9. Fuera de alcance

- Mi Cuenta self-service / picker de color / preferencias → 18B.
- Delegaciones temporales → 18C.
- Auditoría detallada (`audits`) y su UI → Sprint 21.
- Seeds split prod/dev y `AdminInicialSeeder` → Sprint 21.

## 10. Referencias

- `Sprint 16 - Plan (Rename + Roles).md` (matriz de permisos, middleware e invariantes base).
- `Sprint 18C - Plan Delegaciones.md` (whitelist y revocación en cascada).
- `Esquema BD - Librerías.md` (users) · `DESIGN.md` (tablas, modales, no-duplicación).
