# Sprint 13 — Guía de Pruebas QA (Portal Panel Informativo)

> **Alcance:** 13.1 muro + catálogos · 13.2 admin + adjuntos · 13.3 triggers + indicador.
> **Commits:** `8cca773` (13.1) · `45d667c` (13.2 + fix useCan) · 13.3 pendiente de commit.
> Al cerrar cada bloque, anotar hallazgos en la tabla final.

## 0. Precondiciones

- `php artisan migrate:fresh --seed` (124 casos + 5 avisos demo: 1 fijado, 2 ligados a `DEN-2026-0004`/`DEN-2026-0005`).
- Usuarios: `jefe` / `registrador` / `investigador1` (pass `demo123` en los 3).
- Probar en **incógnito sin extensiones**: el error `reportAllChanges/startTime`
  de consola es la extensión React DevTools, no la app (0 coincidencias en
  `resources/js` y `public/build`). Si aparece en normal y no en incógnito → ignorar.
- Throttle público 60 req/min en `/` y descargas: si sale 429 testeando filtros
  sin parar, esperar 1 min (no es bug).

## A. Muro público `/` (sin login, light + dark)

| # | Caso | Resultado esperado |
|---|---|---|
| A1 | Abrir `/` | Panel bajo la consulta (info/preguntas al final). 5 avisos, fijado primero |
| A2 | Filtro radial por tipo (7) | Filtra sin recarga completa; "Todos" muestra total |
| A3 | Buscar `HORARIO` / `GAMEA/UTLCC/COM` / `DEN-2026-0004` / `REG 4521/2026` | Solo el aviso que contenga TODAS las palabras (AND) |
| A3b | Búsqueda avanzada (acordeón): CITE `012/2026`, Ref. externa `REG 4521/2026`, ticket | Solo el suyo aunque `2026` esté en todos; combinada con caja en AND |
| A4 | Fechas Desde/Hasta + clic en el campo | Abre calendario nativo (`showPicker`); filtra rango |
| A5 | Aviso "últimos 12 meses" + Ver historial completo | Por defecto recorta por `publicado_at` (no por fecha del documento); historial muestra todo. Para probarlo: en HeidiSQL/tinker `UPDATE publicaciones SET publicado_at='2024-03-15 10:00:00' WHERE id=2;` → recarga `/` (desaparece) → "Ver historial completo" (reaparece). Restaurar desde admin (despublicar → publicar) o con `publicado_at=NOW()` |
| A6 | Paginación | 10 por página, numerada, sin salto de scroll |
| A7 | Sticky sidebar (desktop) / apilado (móvil) | Filtros visibles al scrollear feed; en móvil arriba |
| A8 | `/seguimiento` → caso → "Consulte si hay avisos" | Muro con `?buscar=` precargado, **sin PIN en la URL** |
| A9 | Descarga de adjunto en incógnito | Descarga OK (requiere aviso con PDF del Bloque B) |
| A10 | Ticket completo visible, sin PIN ni PII | No hay denunciante/denunciados/hechos/token en cards ni HTML |

## B. Admin `/admin/publicaciones` (jefe y registrador)

| # | Caso | Resultado esperado |
|---|---|---|
| B1 | Crear publicado y crear borrador | Publicado sale en muro; borrador no |
| B2 | Sin cuerpo ni archivo | Error de validación, no crea |
| B3 | Título >140 | Error de validación |
| B4 | Publicar sin adjunto | Warning `ConfirmDialog` → confirmar publica / volver cancela |
| B5 | Subir PDF real (probar JPG/webp tambien; >20MB, .txt y .doc dan error; varios a la vez) | Visible en muro + descargable interno y externo; imagenes con thumb que abre completa |
| B6 | Editar + adjuntar 2.º PDF (máx 5) | Ambos listados; al 6.º error |
| B7 | Quitar adjunto | Va a Historial del form, físico intacto, sale del muro y su descarga da 404 |
| B8 | Fijar 2 + flechas orden + desfijar | Muro respeta orden manual; desfijado vuelve a recientes |
| B9 | Publicar/despublicar borrador | Entra/sale del muro |
| B10 | Eliminar aviso con PDF | Aviso fuera; físico preservado |
| B11 | Como investigador | Sin item Avisos; URL redirige a dashboard |
| B12 | Catálogos (9 pestañas) | Crear/desactivar/reactivar tipo; prioridades protegidas no se eliminan |
| B13 | Admin: filtros (texto por botón + avanzada + tipo/estado/fijadas/orden), paginación, móvil | Sin re-render por tecla; cards colapsables en móvil con mismas acciones |

## C. Triggers e indicador (jefe)

| # | Caso | Resultado esperado |
|---|---|---|
| C1 | Admitir CON checkbox | Borrador `admitida` + toast "revíselo en Avisos" |
| C2 | Admitir SIN checkbox | Sin borrador |
| C3 | Rechazar con resumen | Borrador `rechazada` hereda resumen + destinatario por escenario |
| C4 | Cerrar caso | Borrador `cerrada` automático con clasificación |
| C5 | Badge "Sin aviso" solo en rechazadas/cerradas (NO en admitidas en curso) | Aparece donde falta evento; desaparece al publicar |
| C6 | Banner en Sheet + bot�n Crear aviso | Banner solo finales; bot�n crea/reutiliza y abre Avisos con el form |
| C7 | Crear manual mismo caso+evento | Error "Ya existe un aviso..." (unicidad) |
| C4b | Caso viejo sin aviso ? bot�n del banner | Llega a Avisos con el borrador abierto; 2.� clic reutiliza |

## Hallazgos

| Fecha | Bloque/Caso | Severidad (P0-P2) | Descripción | Estado |
|---|---|---|---|---|
| | | | | |
