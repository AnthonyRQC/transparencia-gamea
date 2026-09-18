# Sprints 16–18C — Guía de Pruebas QA (Roles, Usuarios, Mi Cuenta, Delegaciones)

> **Alcance:** 16.1 rename · 16.2 auth backend · 18A panel usuarios · 18B mi cuenta ·
> 18C delegaciones (+ fix SSE por permiso).
> **Commits:** `1b68fcd` (16.1) · `9e51480` (16.2) · `44c97ca` (18A) ·
> `c41c98a` (18B) · `23cdb14` (18C).
> Al cerrar cada bloque, anotar hallazgos en la tabla final.

## 0. Precondiciones

- `php artisan migrate:fresh --seed` (MySQL de Laragon arriba; 124 casos demo).
- Usuarios (pass `demo123` en todos): `AS9000001` (admin) / `PM4864213` (jefe) /
  `MG7551234` (registrador) / `CQ6123457` (investigador).
- Login case-insensitive: `pm4864213` entra igual.
- Probar en **incógnito sin extensiones**. Ignorar si sale en normal y no en incógnito:
  `reportAllChanges/startTime` (React DevTools).
- Consola limpia de errores SSE en todos los roles (el stream solo conecta con
  `notificacion.ver`; registrador/admin no conectan ni ven campana).

## A. Auth y matriz (16.2)

| # | Caso | Resultado esperado |
|---|---|---|
| A1 | Como registrador: abrir `/denuncias`, `/reportes` a mano | Redirect a `/dashboard` + toast (nunca 403) |
| A2 | Como investigador: POST informe de un caso **ajeno** (URL directa) | Toast "NO TIENES PERMISO", caso intacto |
| A3 | Como jefe: admitir el mismo caso 2 veces | 2.º intento: "ya fue procesada por…" |
| A4 | Como admin: `/denuncias` | Redirect (no opera casos); `/dashboard` y `/reportes` OK |
| A5 | Invitado: `/denuncias` | Va a `/login` |
| A6 | DevTools: `DELETE /profile` | 405 y el usuario sigue existiendo |
| A7 | Como registrador: sidebar + header | Sin Bandeja, Reportes, Notificaciones ni campana |
| A8 | Como jefe/investigador: campana | Visible y sin errores SSE en consola |

## B. Panel Usuarios (18A, admin o jefe)

| # | Caso | Resultado esperado |
|---|---|---|
| B1 | Crear investigador (nombres+apellidos+CI+rol+clave `Temporal123`) | Username auto (`JP…`); modal con credencial **una sola vez** |
| B2 | Repetir CI (activo o inactivo) | Error que pide reactivar, no duplica |
| B3 | Clave débil | Rechaza (mín. 10 + May/min/núm) |
| B4 | Jefe creando `admin` / viendo filas admin | Rechazado / ni las ve |
| B5 | Desactivarse a sí mismo; desactivar al último admin/jefe | Bloqueado en ambos |
| B6 | Desactivar investigador **con casos** sin destino | Pide traspaso; con destino+justificación los casos pasan con bitácora "RELEVO" |
| B7 | Reset de clave | Temporal nueva, sesiones cerradas, pide cambio al entrar |
| B8 | Lote con un usuario con casos | El lote se frena y dice cuál |
| B9 | Header/avatares | Iniciales y colores visibles (paleta oficial) |

## C. Mi Cuenta (18B, entrar como el creado en B1)

| # | Caso | Resultado esperado |
|---|---|---|
| C1 | Primer login | Banner "contraseña temporal" + redirect a Mi Perfil hasta cambiarla |
| C2 | Cambio con clave débil / válida | Rechaza / entra normal y no vuelve a pedir |
| C3 | Editar nombres/apellidos/color | Se guarda; CI/username/rol no cambian (ni por DevTools) |
| C4 | Preferencias: master OFF | Campana sin alertas derivadas |
| C5 | Preferencias: umbral plazo 10 con caso a ~7 días | Aparece alerta; con umbral 3 no |
| C6 | Badges de casos | **No cambian** con C4/C5 (son estado real, no avisos) |

## D. Delegaciones (18C, como jefe)

| # | Caso | Resultado esperado |
|---|---|---|
| D1 | Delegar "Bandeja y admisión" al registrador (motivo + fin) | Badge + banner; admite un caso |
| D2 | Ese registrador: informe/cierre | Denegado (no delegable) |
| D3 | Delegar `usuario.crear` / a un admin / a sí mismo | Rechazado en los tres |
| D4 | Revocar como otro jefe (no otorgante) | Rechazado; como otorgante pierde acceso al instante |
| D5 | Desactivar al interino | Su delegación muere sola |
| D6 | Delegación vencida o futura | No aplica permisos |

## Hallazgos

| Fecha | Bloque/Caso | Severidad (P0-P2) | Descripción | Estado |
|---|---|---|---|---|
| | | | | |
