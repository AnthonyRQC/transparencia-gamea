# Sprints 16–18C — Guía de Pruebas QA (Roles, Usuarios, Mi Cuenta, Delegaciones)

> **Alcance:** 16.1 rename · 16.2 auth backend · 18A panel usuarios · 18B mi cuenta ·
> 18C delegaciones + fix SSE por permiso + fix orden seeders (admin al final: ids
> 1=jefe, 2=registrador, 3+=investigadores, 13=admin).
> **Commits:** `1b68fcd` (16.1) · `9e51480` (16.2) · `44c97ca` (18A) ·
> `c41c98a` (18B) · `23cdb14` (18C).
> Al cerrar cada bloque, anotar hallazgos en la tabla final.

## 0. Precondiciones

- `php artisan migrate:fresh --seed` (MySQL de Laragon arriba; 124 casos demo).
- Usuarios (pass `demo123` en todos): `AS9000001` (admin) / `PM4864213` (jefe) /
  `MG7551234` (registrador) / `CQ6123457` (investigador; también `AT6123458`, `LM6123459`).
- Login case-insensitive: `pm4864213` entra igual.
- Mapa rápido del seed: `0001,0002,0013,0014,0017` ingresadas · `0003,0004,0015,0019`
  admitidas · `0006`(CQ),`0007`(AT),`0021`(AT),`0023`(CQ),`0034`(CQ) asignadas ·
  `0008`(CQ),`0009`(AT),`0033`(CQ) investigación · `0010`(LM),`0035`(CQ) informe ·
  `0005` rechazada · `0011`(LM) cerrada · `0012`(CQ) archivada.
- Probar en **incógnito sin extensiones**. Ignorar si sale en normal y no en incógnito:
  `reportAllChanges/startTime` (React DevTools).
- Consola limpia de errores SSE en todos los roles (el stream solo conecta con
  `notificacion.ver`; registrador/admin no conectan ni ven campana).
- Time Machine: `/dev/tiempo` (link en sidebar, solo local). Volver con "Hoy" al terminar C5.

### Taladro (POST/DELETE manual)

En `/profile`, DevTools → Console, pegar una vez por sesión:

```js
const xsrf = decodeURIComponent(document.cookie.split('; ').find(c => c.startsWith('XSRF-TOKEN='))?.split('=')[1] ?? '');
const post = async (url, body = {}) => {
  const r = await fetch(url, { method: 'POST', credentials: 'same-origin',
    headers: { 'X-XSRF-TOKEN': xsrf, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  console.log('status:', r.status, '| final:', r.url);
};
const del = async (url) => {
  const r = await fetch(url, { method: 'DELETE', credentials: 'same-origin',
    headers: { 'X-XSRF-TOKEN': xsrf } });
  console.log('status:', r.status);
};
```

Oráculo: denegado termina en `/dashboard`; aplicado vuelve a `/profile`.

## A. Auth y matriz (16.2)

| # | Pasos | Esperado |
|---|---|---|
| A1 | Como registrador, visitar `/denuncias`, `/reportes`, `/reportes/exportar?formato=excel` | Las 3 caen a `/dashboard` + toast (nunca 403) |
| A2 | Jefe: abrir `DEN-2026-0010`, anotar que es informe de LM. Entrar como `AT6123458`, ir a `/profile`, taladro: `await post('/denuncias/DEN-2026-0010/informe', { clasificacion: 'administrativo', fojas: 10, justificacion: 'PRUEBA DE TALADRO SUFICIENTEMENTE LARGA PARA VALIDAR', concluido_por: 'TALADRO' })` | Final en `/dashboard` (denegado). Como jefe: sin informe de AT ni bitácora nueva |
| A2b | Mismo taladro como `PM4864213` (jefe, supervisor D26) | Final en `/profile` (aplicado); en Bandeja aparece el informe. Re-seed para limpiar |
| A3 | Como jefe, admitir `DEN-2026-0001` en UI; luego en `/profile` taladro `await post('/denuncias/DEN-2026-0001/admitir', {})` | Toast "No se puede admitir…", estado sigue admitida, una sola bitácora `admitida` |
| A4 | Como `AS9000001`: `/denuncias` | Redirect (no opera casos); `/dashboard` y `/reportes` OK |
| A5 | Invitado: `/denuncias` | Va a `/login` |
| A6 | Logueado, taladro `await del('/profile')` | status 405; el usuario existe |
| A7 | Como registrador: sidebar + header | Sin Bandeja, Reportes, Notificaciones ni campana |
| A8 | Como jefe/investigador | Campana visible, consola sin errores SSE |

## B. Panel Usuarios (18A, `AS9000001` o `PM4864213` → `/admin/usuarios`)

| # | Pasos | Esperado |
|---|---|---|
| B1 | Nuevo: nombres `JUAN CARLOS`, apellidos `PÉREZ`, CI `9988776`, rol investigador, clave `Temporal123` | Username `JP9988776`; modal con credencial **una sola vez** (cópiala) |
| B2 | Repetir CI `9988776` (y luego desactivarlo e intentarlo de nuevo) | Error que pide reactivar, no duplica |
| B3 | Clave `corta` / `sinmayusculas1` | Rechaza con mensaje de política |
| B4 | Como jefe: crear con rol `admin`; buscar `AS9000001` en el listado | Rechazado / no aparece |
| B5 | Jefe: desactivarse a sí mismo; admin: desactivar a `AS9000001`; degradar a `PM4864213`→investigador | Los tres bloqueados con toast |
| B6 | Desactivar `CQ6123457` sin destino → con destino `AT6123458` + justificación | Primero pide traspaso; luego sus casos (0006,0008,0012,0033…) pasan a AT con bitácora "RELEVO" |
| B7 | Reset a `AT6123458` | Temporal nueva, sesiones cerradas, pide cambio al entrar |
| B8 | Lote: `CQ6123457`+`LM6123459` sin destino | Se frena y nombra al que tiene casos |
| B9 | Avatares del listado | Iniciales + colores, sin grises rotos |

## C. Mi Cuenta (18B, entrar como `JP9988776`/`Temporal123`)

| # | Pasos | Esperado |
|---|---|---|
| C1 | Primer login | Banner "contraseña temporal" + redirect a Mi Perfil hasta cambiarla |
| C2 | `corta` / `NuevaClave123` | Rechaza / entra normal y no vuelve a pedir |
| C3 | Cambiar nombres/apellidos/color; intentar CI/username/rol por DevTools | Se guarda lo válido; lo otro se ignora |
| C4 | Preferencias: master OFF → campana | Sin alertas derivadas |
| C5 | Registrador crea denuncia (45d) → `/dev/tiempo` +38d → como dueño: umbral 10 → alerta; umbral 3 → nada → "Hoy" | Umbrales mandan; luego resetear fecha |
| C6 | Badges del caso en C5 | Iguales con cualquier preferencia (estado real, no avisos) |

## D. Delegaciones (18C, como `PM4864213` → `/admin/delegaciones`)

| # | Pasos | Esperado |
|---|---|---|
| D1 | Paquete "Bandeja y admisión" a `MG7551234`, motivo, fin +7d | Como registrador: badge + banner; admite `DEN-2026-0013` |
| D2 | Ese registrador: taladro informe sobre `DEN-2026-0010` (A2) | Denegado |
| D3 | Marcar `usuario.crear` / elegir admin / auto-delegarse | Rechazado en los tres |
| D4 | Revocar como otro jefe (no otorgante) | Rechazado; como otorgante o admin pierde acceso al instante |
| D5 | Desactivar al interino en `/admin/usuarios` | Su fila pasa a Historial (revocada sola) |
| D6 | Crear con `hasta` ayer / `desde` mañana | No aplican (Historial/Programadas) |

## Hallazgos

| Fecha | Bloque/Caso | Severidad (P0-P2) | Descripción | Estado |
|---|---|---|---|---|
| | | | | |
