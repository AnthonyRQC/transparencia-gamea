# Sprint 18C — Plan: Delegaciones Temporales de Funciones

> **Estado:** PLANIFICADO (no ejecutado) · **Fecha plan:** 17-sep-2026 ·
> **Decisiones:** D12, D14, D16 en `Decisiones 12.5 - 13 (Log).md` (bloque Sep-2026).
> **Origen:** necesidad operativa real: el Jefe de Unidad está frecuentemente ocupado y
> necesita que el Registrador (u otra persona) ejerza como "mano derecha" (delegar casos,
> extraer informes, ver dashboard), y para vacaciones/ausencias se necesita un **Jefe
> interino** sin compartir cuentas. Es el mismo problema que resuelven JIT/PIM en Azure y
> TEAM en AWS: elevación temporal, acotada, justificada y auditable.
> **Depende de:** Sprint 16 (`PermisosEfectivos` + Gates + middleware) y 18A (módulo usuarios).
> **Adelanta parcialmente:** Sprint 25 (permisos personalizados, v2) — solo en su forma de
> delegación temporal auditada; el panel granular permanente sigue diferido.

## 1. Principios

1. **Aditivo, nunca sustractivo.** Permisos efectivos = base del rol ∪ delegaciones activas.
   No hay "denials" (quitar permisos) en Fase 1: evita combinaciones raras y es lo que el
   negocio pide.
2. **Toda elevación tiene autor, motivo y (opcional) fecha fin.** No existen permisos
   "directos permanentes" sin trazabilidad.
3. **Cuenta propia, nunca compartida.** El interino opera con SU usuario: la bitácora, el
   `investigador_id` y los `audits` registran a la persona real (cumple confidencialidad
   Ley 974 Art. 29).
4. **Constained delegation.** El jefe solo delega desde una whitelist; nunca `usuario.*`
   ni `admin.*`. Escalar privilegios no es delegación válida.
5. **Caducidad perezosa.** La vigencia se evalúa al consultar (`hasta IS NULL OR hasta >= now()`);
   no requiere cron. `Carbon::setTestNow` del Time Machine la respeta en demo.

## 2. Modelo BD

```
delegaciones
  id                PK
  user_id           FK → users          (beneficiario)
  permisos          JSON                (array de claves del catálogo)
  desde             timestamp           (default now; puede ser futura → "programada")
  hasta             timestamp nullable  (null = vigente hasta revocar)
  motivo            texto               (MAYÚSCULAS, obligatorio)
  otorgado_por_id   FK → users
  revocado_at       timestamp nullable
  revocado_por_id   FK → users nullable

Índice: (user_id, revocado_at, hasta)   ← consulta de activas por usuario
```

> **Sin tabla de paquetes:** los presets son constantes de catálogo
> (`PermisosCatalogo::PAQUETES`), no datos editables por UI.

## 3. Reglas de otorgamiento

| Quién otorga | Puede delegar | A quién | Límites |
|---|---|---|---|
| **admin** | cualquier permiso del catálogo | cualquier usuario activo | no a sí mismo para escalar |
| **jefe** | whitelist delegable | usuarios activos (no admins) | no puede ampliar vigencia de una delegación de admin |
| investigador / registrador | — | — | sin acceso al módulo |

**Whitelist delegable (D12):** `caso.admitir`, `caso.rechazar`, `caso.asignar`, `caso.traspasar`,
`caso.reabrir`, `caso.ampliar`, `caso.conciliar`, `caso.delegar-evaluacion`,
`caso.reasumir-evaluacion`, `caso.saltar-fase`, `caso.archivar`, `menu.bandeja`,
`menu.reportes`, `reporte.ver`, `reporte.exportar`, `menu.consultar-casos`, `consulta.ver`,
`consulta.codigo`, `archivo.*`, `publicacion.*`, `menu.publicaciones`, `notificacion.ver`.
**Excluidos:** `usuario.*`, `menu.usuarios`, `admin.*`, `denuncia.editar`, `denuncia.eliminar`.

**Presets (paquetes) de la UI:**

| Paquete | Contenido |
|---|---|
| Jefe de Unidad (completo) | `PermisosCatalogo::ROLES['jefe']` (atajo "rol interino") |
| Bandeja y admisión | `menu.bandeja` + `caso.admitir/rechazar/asignar/traspasar/reabrir/conciliar/archivar` |
| Reportes y dashboard | `menu.reportes` + `reporte.ver` + `reporte.exportar` |
| Consulta y códigos | `menu.consultar-casos` + `consulta.ver` + `consulta.codigo` |
| Avisos del portal | `menu.publicaciones` + `publicacion.*` |

**Revocación:** puede revocar el otorgante original o un admin. La revocación es lógica
(`revocado_at` + `revocado_por_id`), nunca delete.

**Cascadas:** al desactivar un usuario (18A) o cambiarle el rol, sus delegaciones activas se
revocan automáticamente. La delegación no caduca por sí sola si el usuario queda inactivo
(evaluarlo siempre junto a `EnsureActive`).

## 4. Permisos efectivos y scoping

- `PermisosEfectivos::de($user)` (creado en 16.2) suma las delegaciones activas; memoizado
  por request. `HandleInertiaRequests` ya lo consume → Sidebar/`Can` funcionan solos.
- **`modoVista()` en `DashboardController`:** si el usuario tiene `menu.bandeja` +
  `caso.admitir` (por rol o delegación) ve la vista global como jefe; si es investigador,
  personal; registrador, general. El interino ve y opera la **bandeja completa**.
- **Casos del jefe ausente:** no se traspasan automáticamente; el interino puede operarlos
  desde la bandeja. El traspaso puntual usa el flujo existente (preserva historial).

## 5. UI

- **`/admin/delegaciones`** (admin + jefe): listado con tabs Activas / Programadas /
  Historial; form de creación con presets + checkboxes agrupados por área + fechas
  (`desde`/`hasta` opcionales) + motivo obligatorio; acción revocar con confirmación.
- **Badge "JEFE INTERINO" / "DELEGACIÓN ACTIVA":** en Header/Perfil del beneficiario, derivado
  de delegación vigente (no de rol). En `/admin/usuarios` columna "delegaciones activas".
- **Banner en Dashboard del interino:** "Operando con funciones delegadas por [Jefe] hasta
  [fecha] / sin fecha de fin".
- **Sin avisos automáticos por ahora** (decisión D12: notificaciones de interinato quedan
  para una iteración posterior); el listado y el badge son la fuente de verdad.

## 6. Tests

- Unit `PermisosEfectivos`: base ∪ delegación; delegación programada (desde futuro) no aplica;
  expirada no aplica; revocada no aplica; duplicados se colapsan; usuario inactivo sin efecto.
- Feature: jefe otorga desde whitelist (OK) / fuera de whitelist (rechazado) / a admin
  (rechazado); admin otorga cualquiera; revocación por otorgante y por admin; cascada al
  desactivar; interino accede a bandeja y admite caso (200) pero no accede a `/admin/usuarios`;
  usuario sin delegación no accede (redirect).
- Gates: suite verde + `tsc` + build.

## 7. Fuera de alcance

- Flujo de solicitud/aprobación de elevación (JIT con request + aprobador) — posible v2.
- Avisos automáticos de interinato y recordatorio de expiración próxima — iteración posterior.
- Panel granular permanente de permisos por usuario (Sprint 25 sigue diferido).
- UI de auditoría de delegaciones (historial detallado) → Sprint 21 con `owen-it/laravel-auditing`.

## 8. Referencias

- `Sprint 16 - Plan (Rename + Roles).md` (§3.2 `PermisosEfectivos`, §3.3 Gates).
- `Sprint 18A - Plan Panel Usuarios.md` (§3.5 cascada de desactivación).
- Estándares que inspiran el diseño: Azure PIM (eligible/time-bound), AWS TEAM,
  NIST RBDM0 (delegación con duración T) — ver discusión de planificación Sep-2026.
