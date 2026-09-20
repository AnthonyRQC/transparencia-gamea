# Sprint 18A — Plan: Panel de Administración de Usuarios

> **Estado:** ✅ EJECUTADO (17-sep-2026) · **Fecha plan:** 17-sep-2026 ·
> **Replan:** 17-sep-2026 (tarde) — D21, D22.
> **Decisiones:** D11, D14, D16, D17, D21, D22 en `Decisiones 12.5 - 13 (Log).md`.
> **Origen:** Sistemas (GAMEA) tendrá usuarios `admin` para soporte; el Jefe administra
> jefes/investigadores/registradores (no admins) para no llamar a Sistemas en el día a día.
> Recambio de personal cada ~4 años y vacaciones de Sistemas (varios admins, nunca un login
> compartido).
> **Depende de:** Sprint 16 (`can:`, `EnsureActive`, `usuario.*`, `PermisosEfectivos`).
> **Extiende:** perfil Breeze (18B = self-service). Middleware `debe_cambiar_password` va
> en **18B**, no aquí (evita redirect loop sin pantalla de cambio).

## 1. Objetivo

Panel `/admin/usuarios` (Jefe + Admin según matriz) para crear, editar, desactivar/reactivar,
resetear contraseñas y acciones masivas de relevo, con invariantes que impidan quedarse
sin administración o dejar casos huérfanos. **Un humano = un CI = una cuenta.**

## 2. Matriz de jerarquía

| Creador / Editor → | admin | jefe | investigador | registrador |
|---|---|---|---|---|
| **admin** (Sistemas) | ✅ (otros, no a sí mismo) | ✅ | ✅ | ✅ |
| **jefe** | ❌ (ni verlos) | ✅ (con guards) | ✅ | ✅ |
| investigador / registrador | ❌ | ❌ | ❌ | ❌ |

- Admin crea otros admins (vacaciones / recambio de Sistemas). Cada persona de Sistemas
  con **su** usuario; nunca un login `admin` compartido.
- Jefe administra **otros jefes**, investigadores y registradores (crear, editar, reset,
  desactivar, bajar de rol). Queda a su responsabilidad; Sistemas solo en emergencia.
- Degradar jefe → investigador/registrador pide confirmación explícita.
- No existe «admin interino» ni cambio temporal de rol a `admin`/`jefe`: o se crea el
  usuario con el rol, o se usa 18C (funciones de unidad sin `usuario.*`).

## 3. Identidad (D21)

| Campo | Regla |
|---|---|
| `nombres` | obligatorio, uno o más tokens (`JUAN CARLOS`), MAYÚSCULAS |
| `apellidos` | obligatorio, uno o más tokens (`GARCÍA LÓPEZ` o solo `MAMANI`), MAYÚSCULAS |
| `name` | generado: `NOMBRES APELLIDOS` (compat Breeze / bitácora) |
| `ci` | único **también inactivos**, `varchar(20)`, no solo dígitos (`123456-1A`). Normalizar: trim, mayúsculas, sin espacios |
| `username` | **autogenerado e inmutable:** 1ª letra del 1er nombre + 1ª del 1er apellido + CI (`AQ997788878`). `varchar(30)`. Login case-insensitive |
| `email` | opcional; **único si existe** |
| `telefono` | opcional |
| `iniciales` | 2 letras del username (o de nombres+apellidos) |
| `color` | paleta oficial D7, hook `creating` (clave, no clase CSS) |

Alta: preview del username al tipear nombres+CI. Mostrar username + password **una vez**
con copiar. Si el CI ya existe **inactivo** → no crear; ofrecer reactivar.

## 4. Funcionalidad

### 4.1 Listado

- Filtros: rol, estado (activos / inactivos / todos), búsqueda nombre / username / CI.
- Columnas: avatar, nombre, username, CI, rol, contacto, estado, inactivo desde, acciones.
- Contadores: admins/jefes activos (invariantes visibles).
- Jefe: el listado **omite** filas `rol=admin`.

### 4.2 Crear

- Campos de identidad (§3) + rol (select filtrado por matriz) + contraseña inicial.
- Username no se edita: se genera al guardar.
- Contraseña: `min:10 + mayúscula + minúscula + número` + `debe_cambiar_password = true`.
- `creado_por_id`.

### 4.3 Editar

- Editables: nombres, apellidos, email, teléfono, rol (matriz + guards), `activo`.
- **No editables:** username, CI (salvo corrección por admin/jefe; el username **no** se
  regenera).
- Cambio de rol: revoca delegaciones **recibidas** (18C) y registra evento.

### 4.4 Reset de contraseña

- Temporal 12+ chars, una vez, `debe_cambiar_password = true`, revoca sesiones y
  `remember_token`. El force-change en login es **18B**.

### 4.5 Desactivar / reactivar

1. Modal de impacto: casos activos (`investigador_id`) + delegaciones recibidas.
2. **Bloqueo duro** si hay casos activos → **traspaso en lote** a otro investigador
   (reusa `AsignacionController::traspasar`).
3. Confirmar: `activo = false`, `desactivado_at`, `desactivado_por_id`, `motivo_baja`
   (opcional), revocar delegaciones **recibidas**, revocar sesiones.
4. Reactivar: `activo = true` + limpiar `desactivado_*` (histórico en audits de 21).
   Si se intenta crear un CI que ya existe inactivo → este flujo, no un segundo usuario.

### 4.6 Acciones masivas

- Multi-select → desactivar/reactivar con los mismos guards. Si alguno tiene casos
  activos, el lote se detiene y lista los pendientes de traspaso.

## 5. Invariantes (`lockForUpdate` en transacción)

1. ≥1 admin activo y ≥1 jefe activo.
2. Nadie se desactiva ni se degrada a sí mismo.
3. Jefe ↛ admin (ni ver, ni crear, ni editar).
4. Nadie asigna un rol fuera de su matriz.
5. Nunca delete físico.
6. CI único incluyendo inactivos.
7. Email único si no es null.

## 6. Modelo BD (migración aditiva 18A)

```
nombres              varchar, NOT NULL
apellidos            varchar, NOT NULL
ci                   varchar(20), UNIQUE  (índice unique; app compara lower/normalizado)
creado_por_id        FK → users, nullable
desactivado_por_id   FK → users, nullable
desactivado_at       timestamp, nullable
motivo_baja          texto, nullable
debe_cambiar_password boolean default false
```

`users.username` → `varchar(30)` si hace falta. `name` se sigue persistiendo compuesto.

Seeds dev: partir nombres actuales; CI demo únicos; username según fórmula.
`demo123` solo seeds. Prod: `AdminInicialSeeder` en 21.

## 7. Frontend

- `Pages/Admin/Usuarios.tsx` + `Components/Admin/`: `TablaUsuarios`, `ModalCrearUsuario`
  (preview username), `ModalEditarUsuario`, `ModalResetPassword`, `ModalImpactoDesactivar`,
  `ModalCredencialTemporal` (username + password, copiar).
- Sidebar "Usuarios" con `can('menu.usuarios')`.
- `TablaResponsive` + `ConfirmDialog` + `Paginacion` (DESIGN.md).

## 8. Validaciones y tests

- `StoreUsuarioRequest` / `UpdateUsuarioRequest`: matriz de roles, CI normalizado único,
  email unique nullable, nombres/apellidos required.
- Tests: matriz admin/jefe × cada rol; invariantes (último admin, auto-baja, jefe→admin
  denegado); CI duplicado activo e inactivo; username fórmula; desactivación con casos;
  reset; masivo; SQLite `lower()`.

## 9. Pendiente Sistemas (no bloquea 18A)

- Panel de auditoría administrativa (D17 / B7) e impersonation
  (`Notas - Admin simulacion (futuro).md`).

## 10. Fuera de alcance

- Force-change password en login → 18B.
- Picker de color / preferencias / Mi Cuenta → 18B.
- Delegaciones → 18C.
- Audits campo a campo → 21.
- `AdminInicialSeeder` prod → 21.

## 11. Referencias

- `Sprint 16 - Plan (Rename + Roles).md`
- `Sprint 18C - Plan Delegaciones.md`
- `Esquema BD - Librerías.md` · `DESIGN.md`
