# Sprint 18C — Plan: Delegaciones Temporales de Funciones

> **Estado:** ✅ EJECUTADO (17-sep-2026, recortado D23) · **Fecha plan:** 17-sep-2026 ·
> **Replan:** 17-sep-2026 (tarde) — D23, D24. Recortado (ya no «Jefe completo» con `usuario.*`).
> **Decisiones:** D12 (enmendada por D23), D18, D19, D22, D23, D24.
> **Origen:** un humano = un CI = una cuenta. Si el jefe titular se ausenta una semana y
> no hay otro jefe disponible, un registrador o investigador debe cubrir bandeja **sin
> segunda cuenta y sin subir de rol** (subir a `jefe` le daría `usuario.*` y le quitaría
> su función). Con 2–3 jefes, la bandeja la cubre otro jefe; 18C cubre el hueco.
> **Depende de:** Sprint 16 (`PermisosEfectivos`, Gates, `CasoAuth`, `can:`) y 18A (usuarios).
> **Adelanta parcialmente:** Sprint 25 (permisos permanentes) — solo la forma temporal.

## 1. Principios

1. **Aditivo.** Efectivo = rol ∪ delegaciones activas. Sin denials.
2. **Misma cuenta.** El cubre opera con SU usuario (CI único). Bitácora = persona real
   (Ley 974 Art. 29). No hay admin/jefe «interino» como rol.
3. **Constrained.** El jefe solo otorga whitelist. **Nunca** `usuario.*`, `menu.usuarios`,
   `admin.*`. Crear cuentas se hace en 18A, no por delegación.
4. **Titular sigue activo.** Vacaciones ≠ desactivar al jefe. Puede revisar; otra persona
   está a cargo. 2–3 jefes a la vez es lo normal.
5. **Caducidad perezosa.** `hasta IS NULL OR hasta >= now()`. Sin cron. Time Machine OK.

## 2. Modelo BD

```
delegaciones
  id                PK
  user_id           FK → users          (beneficiario)
  permisos          JSON
  desde             timestamp           (default now; futura = programada)
  hasta             timestamp nullable  (null = hasta revocar)
  motivo            texto               (MAYÚSCULAS, obligatorio)
  otorgado_por_id   FK → users
  revocado_at       timestamp nullable
  revocado_por_id   FK → users nullable

Índice: (user_id, revocado_at, hasta)
```

Presets = constantes `PermisosCatalogo::PAQUETES`, no tabla.

## 3. Reglas de otorgamiento

| Quién otorga | Puede delegar | A quién | Límites |
|---|---|---|---|
| **admin** | whitelist (igual que jefe; no `usuario.*`/`admin.*`) | usuarios activos (no a sí mismo para escalar) | — |
| **jefe** | whitelist | usuarios activos no-admin | no ampliar vigencia de una delegación de admin |
| investigador / registrador | — | — | sin módulo |

**Whitelist:** `caso.admitir`, `caso.rechazar`, `caso.asignar`, `caso.traspasar`,
`caso.reabrir`, `caso.ampliar`, `caso.conciliar`, `caso.delegar-evaluacion`,
`caso.reasumir-evaluacion`, `caso.saltar-fase`, `caso.archivar`, `menu.bandeja`,
`menu.reportes`, `reporte.ver`, `reporte.exportar`, `menu.consultar-casos`, `consulta.ver`,
`consulta.codigo`, `archivo.*`, `publicacion.*`, `menu.publicaciones`,
`menu.notificaciones`, `notificacion.ver`.
**Excluidos:** `usuario.*`, `menu.usuarios`, `admin.*`, `denuncia.editar`, `denuncia.eliminar`.

**Presets:**

| Paquete | Contenido |
|---|---|
| **Jefe interino (operación)** | whitelist ∩ permisos de jefe. **No** es `ROLES['jefe']` |
| Bandeja y admisión | `menu.bandeja` + admitir/rechazar/asignar/traspasar/reabrir/conciliar/archivar + `menu.notificaciones` + `notificacion.ver` |
| Reportes | `menu.reportes` + `reporte.ver` + `reporte.exportar` |
| Consulta y códigos | `menu.consultar-casos` + `consulta.ver` + `consulta.codigo` |
| Avisos del portal | `menu.publicaciones` + `publicacion.*` |

El registrador/investigador **conserva** su rol (registro, mis casos). Unión = dos funciones
en una cuenta.

**Revocación:** otorgante o admin. Lógica (`revocado_at`), nunca delete.

**Cascadas (D23):** desactivar o cambiar rol → revoca delegaciones **recibidas**. Las
**otorgadas** siguen (el titular no se desactiva por vacaciones).

## 4. Permisos efectivos y CasoAuth

- `PermisosEfectivos::de($user)` (16.2) suma delegaciones activas.
- **CasoAuth (D19) no se toca:** unidad = cualquier caso; expediente = solo dueño.
  Un investigador con bandeja **no** redacta informes ajenos.
- Varios jefes + un interino = bandeja compartida. Quién admitió = `usuario_id` en bitácora.
  Carreras: `lockForUpdate` de 16.2.
- Dashboard: **no rediseñar en 18C** (D25). Banner de interino sí.

## 5. UI

- `/admin/delegaciones` (admin + jefe): tabs Activas / Programadas / Historial; presets +
  checkboxes; `desde`/`hasta`; motivo; revocar.
- Badge **DELEGACIÓN ACTIVA** / **JEFE INTERINO** (derivado de delegación, no de rol).
- Columna en `/admin/usuarios`: delegaciones activas.
- Banner dashboard: "Funciones delegadas por [Jefe] hasta [fecha] / sin fin".
- Sin avisos automáticos de interinato.

## 6. Tests

- Unit `PermisosEfectivos`: unión; programada no aplica; expirada/revocada no; duplicados
  colapsan; inactivo sin efecto.
- Feature: jefe otorga whitelist OK / `usuario.*` rechazado / a admin rechazado; registrador
  interino admite (200) y **sigue** registrando denuncias; **no** entra a `/admin/usuarios`;
  investigador interino no edita informe ajeno (`CasoAuth`); cascada al desactivar solo
  recibidas; usuario sin delegación → redirect.
- Suite verde + `tsc` + build.

## 7. Fuera de alcance

- Admin/jefe interino como **rol** (se crea usuario en 18A).
- Preset = `ROLES['jefe']` (incluye `usuario.*` — prohibido).
- JIT con solicitud/aprobador — v2.
- Avisos de interinato — iteración posterior.
- Permisos permanentes por usuario — Sprint 25.
- UI forense de delegaciones — Sprint 21.

## 8. Referencias

- `Sprint 16 - Plan (Rename + Roles).md` (`PermisosEfectivos`, `CasoAuth`, D18).
- `Sprint 18A - Plan Panel Usuarios.md` (CI único, cascada).
- Azure PIM / AWS TEAM / NIST RBDM0 — elevación temporal acotada.
