# Sprint 12.5 — Plan: Refactor de Mantenibilidad Total (opción 2)

> **Estado:** PLANIFICADO (no ejecutado) · **Fecha plan:** 09-sep-2026
> **Origen:** estandarización visual 12.3–12.4 + auditoría de duplicación (2 agentes explore, solo lectura)
> **Alcance:** opción 2 — fase segura R1 + fase estructural R2
> **Reglas:** sin commits de código hasta revisión del usuario · por frente: `tsc` + `vite` + 88 tests + `detect` + visual light/dark 1280×720 · todo reversible

## 0. Decisiones de no-tocar (auditoría previa)
- **63 barrels** en `Components/Denuncias/` raíz: re-exports de 1–2 líneas, compatibilidad. Costo de borrado > beneficio → se quedan.
- **`TabsDenuncias`**: justificado (sticky + counts + render-fn; nadie lo replica a mano). Solo se eliminará su re-export duplicado si aplica.
- **Tablas con fila vacía `colSpan`** (TablaReporte): patrón correcto, no migran a `ListaVacia`.
- **Superficie pública** (`EstadoVacio`, `EstadoNoEncontrado`): tono ciudadano propio, no migran.
- **`daysAgo/isNewHours/fmt`**: mismo nombre, lógica distinta por sitio → no son duplicación real, se quedan.

## R1 — Fase segura (sin tocar lógica)

### R1.1 — `constants/semantica.ts` (nuevo): fuente única de badges (7 dominios)
| Dominio | Implementaciones hoy | Archivos |
|---|---|---|
| Plazo `green/yellow/red` | 5 (2 idénticas) | `Card/PlazoBadge:17`, `Card/PlazoProgress:15`, `Card/DenunciaCard:62`, `Reportes/TablaReporte:21`, `Dashboard/TablaCasosUrgentes:18` |
| Clasificación (6 valores) | 2 idénticas | `Card/ClasificacionBadge:17`, `Publico/ResultadoSeguimiento:32` |
| Solicitud (5 estados) | 2 idénticos | `Solicitud/SolicitudCard:38`, `Solicitud/SolicitudDetailModal:63` |
| Descargo (6 estados) | 2 idénticos | `Descargo/DescargoCard:41`, `Descargo/DescargoDetailModal:83` |
| Escenario (3 valores) | 2 idénticos | `Card/DenunciaCard:68`, `Sheet/DenunciaSheet:162` |
| Recomendación admitir/rechazar | 4 | `Tabs/TabEvaluacionPrevia:29`, `Card/DenunciaCard:188-190`, `Pages/Bandeja:455-461`, `Pages/Evaluaciones:148-152` |
| Etiquetas estado denuncia | 5+ | `Publico/ResultadoSeguimiento:43`, `Pages/ConsultarCasos:24`, `Pages/MisCasos:130`, `Dashboard/TablaCasosUrgentes:7`, `constants/estados:26` |
Incluye mapeo `pink-600` → `destructive` (17 sitios; cierra brecha "magenta solo gráficos"). Migración mecánica: importar el mapa, mismo output visual.

### R1.2 — `formatDate` ×12 → helper directo
Wrappers de 1 línea ya delegando a `helpers/fechas.ts` (5 corta + 7 larga). Se eliminan; llamada directa con `?? ''` / `?? '—'` según fallback actual. Archivos: `Reportes/TablaReporte:33`, `Pages/ConsultarCasos:55`, `Shared/TablaArchivosCaso:30`, `Solicitud/SolicitudCard:46`, `Descargo/DescargoCard:54`, `Card/PlazoBadge:29`, `Descargo/DescargoDetailModal:68`, `Solicitud/SolicitudDetailModal:60`, `Sheet/DenunciaSheet:184`, `Tabs/TabEvaluacionPrevia:34`, `Modales/Flujo/ModalAmpliacionPlazo:47`, `Publico/ResultadoSeguimiento:53`. Aparte: `formatDateTime` diverge entre Descargo/Solicitud DetailModal → unificar a `formatearFechaHora`.

### R1.3 — `Shared/TecnicoAvatar.tsx` (nuevo: `iniciales + color + size xs/sm/md`)
Reemplaza 6 avatares manuales con tamaños inconsistentes: `Layout/Header:120`, `Card/DenunciaCard:213`, `Card/TecnicoCargaCard:32`, `Sheet/DenunciaSheet:513`, `Descargo/DescargoCard:69`, `Descargo/DescargoDetailModal:119`. Elimina `getInitials` duplicado (`DescargoCard:50`, `DescargoDetailModal:79`).

### R1.4 — `Shared/Paginacion.tsx` modo servidor
Agregar `mode="server"` (páginas numeradas, misma API visual). `Pages/Notificaciones/Index:217-262` migra y elimina su paginación inline. Bandeja/MisCasos/Reportes/ConsultarCasos sin cambios (ya la usan en modo cliente).

### R1.5 — `Shared/ConfirmDialog.tsx` (nuevo: `variant=confirm|delete|deactivate`)
Absorbe `Modales/General/ModalConfirmar`, `ModalConfirmarEliminar`, `Admin/ModalConfirmarDesactivar` (mismo esqueleto, distinta severidad; props `itemNombre/dependencias/processing`). Barrels por compatibilidad.

## R2 — Fase estructural (mayor riesgo, mayor ahorro)

### R2.1 — `Shared/FormDialog.tsx` (shell: `title/desc/children/footer/processing`)
~20 modales comparten `Dialog/sm:max-w-md/Header/Footer Cancelar/Confirmar + router.post + toast` (Admisión 2, Flujo 7+, Investigación 9, InformeCierre forms, General). Migración gradual piloto: Admisión/Rechazo/Asignación primero; si alguno diverge, queda fuera sin forzar.

### R2.2 — `Shared/FiltrosCaso.tsx` + `hook useFiltroCasos`
Controles presentacionales (`search`, `tipo`, `técnico`, `categoría`, `clasificación`, `estado`, rango fechas, presets, chips) con `variant=sheet|inline|panel` para `Dashboard/FiltrosDashboard`, `Reportes/FiltrosReporte`, `Pages/ConsultarCasos` (panel 7 filtros). Hook unifica `params/router.get + sort plazo/fecha/técnico` de `Bandeja:filterAndSort:297` y `MisCasos:sortItems:258`; `Select técnico` hoy en 4/5 superficies. Último por riesgo (toca queries), suite verde como red.

## Orden de ejecución
R1.1 → R1.2 → R1.3 → R1.4 → R1.5 → R2.1 (piloto 3 modales) → R2.2

## Criterio de cierre
Cada frente verde en `tsc` + `vite` + 88 tests + `detect` + visual; commit solo tras revisión del usuario; actualizar `DESIGN.md` (§ componentes canónicos), `Deuda Tecnica y Riesgos.md` y nota de cierre 12.5.
