# Análisis Completo — App Transparencia (Sep 2026)

**Fecha del análisis:** 20-sep-2026
**Método:** mapeo de solo lectura de backend y frontend, sin cambios de código.
**Base:** rama `docs/guia-ampliacion`, commit `db69005`.
**Propósito:** baseline para la tesis y seguimiento de hallazgos, deuda
técnica y trabajo futuro.

Este documento resume el estado verificado de la aplicación: dominio y
ciclo de una denuncia, modelo de autorización, dashboard, plazos,
notificaciones, archivos y bitácora en el backend; layout, permisos,
slices, dashboard, portal público y herramientas dev en el frontend.
Cierra con hallazgos accionables, fortalezas y su mapeo a los sprints
pendientes.

## Resumen

- **Stack:** Laravel con Inertia y React/TypeScript (evidencia:
  `HandleInertiaRequests.php`, `resources/js/**/*.tsx`).
- **Cifras verificadas:** 41 archivos de migración, 25 modelos en
  `app/Models`, 167 pruebas más `tsc` y build en verde (cierre
  17-sep-2026), 124 casos demo con próximo ticket 125.
- **Estado:** aplicación sana. La deuda se concentra en escala
  (cálculo de plazos en memoria) y en pulido (stub de archivos,
  archivos grandes, contratos duplicados).

## Backend

- **Dominio:** `Denuncia` es el agregado central. Ticket `DEN-YYYY-NNNN`
  generado desde `configuracion_sistema`; token para consulta pública;
  casts JSON para traspaso, reapertura y `conciliacion_json`;
  `SoftDeletes`.
- **Ciclo:** ingresada → evaluación técnica → admitida → asignada →
  investigación → informe → cerrada → archivada. Terminales: rechazada
  y cerrada. La reapertura resetea el investigador.
- **Patrón de mutación (todo el ciclo):** guard de estado +
  `DB::transaction` + `lockForUpdate` + bitácora +
  `CasoAuth::mensajeCarrera` para carreras.
- **Autorización en dos capas:**
  - Rutas con `can:<permiso>` respaldado por `PermisosCatalogo` (sin
    `RoleMiddleware`) más `EnsureActive`.
  - A nivel de caso, `CasoAuth`: permisos de unidad ven todo; permisos
    de expediente solo dueño o supervisor. El `403` redirige al
    dashboard.
- **Delegaciones (18C):** tabla `delegaciones` (`user_id`,
  `permisos[]`, `desde`/`hasta`, `otorgado_por`); `PermisosEfectivos` =
  rol ∪ delegaciones vigentes, memoizado; revocación en cascada al
  desactivar o cambiar rol; nunca `usuario.*`/`admin.*`.
- **Dashboard:** `DashboardController` (116 líneas) +
  `Queries/Dashboard/{Kpi,Operativo,Resultados,Rendimiento}Query`;
  scoping en servidor (investigador solo sus casos).
- **Plazos:** `DiasHabiles` (lun-vie sin feriados; caché
  `feriados:fechas` de 1 h; día 1 = siguiente hábil); techos de
  ampliación 45/90 (corrupción) y 10/30 (negación);
  `plantilla_feriados` con 14 referencias neutras.
- **Notificaciones:** se crean al asignar o delegar evaluación; la
  campana solo aparece con `notificacion.ver`; el registrador sin ese
  permiso no ve campana (coherente con el frontend, verificado).
- **Archivos:** expediente en storage local privado; avisos públicos en
  disk public.
- **Bitácora:** polimórfica (`entidad_tipo`/`id`, detalle en
  mayúsculas); auditoría forense planificada para Sprint 21.
- **Seeders:** `Catalogo → User → Denuncia → DenunciaMasiva →
  Publicacion → Notificacion`; 124 casos demo; próximo ticket 125.

## Frontend

- **Layout:** `AppLayout` + `Header` (campana condicional por permiso) +
  `Sidebar` filtrado por permisos `menu.*`; modo oscuro en
  localStorage; tokens OKLCH (sidebar `#1E0A33`, primary `#4B0090`,
  secondary `#F5B400`, destructive `#C6006B`); tipografías Outfit y
  Fira Code; mayúsculas vía `text-transform`.
- **Permisos:** `permissions.ts` como única fuente + `useCan` +
  componente `Can`; gating por acción y por menú.
- **Denuncias:** organizadas por slice (`Card`/`Form`/`Sheet`/`Tabs`/
  `Modales`/`Shared`), con re-exports de compatibilidad de una línea en
  el nivel superior del directorio.
- **Dashboard:** `KPICards` + `TabOperativo`/`TabResultados`/
  `TabRendimiento`, gráficos, drill-down y `ModalExportar` (PDF/Excel).
- **Público:** `Seguimiento`/`Buscar` sin `AppLayout`, con stepper.
- **Solo desarrollo:** `/dev/tiempo` (Time Machine + AlertasPlazo) y
  `/design-system`.

## Hallazgos y riesgos

1. **Stub de subida de archivos del caso.** Evidencia:
   `ArchivosCasoController::subir` guarda una ruta demo
   `archivos/demo/{ticket}/{nombre}` con `size`/`mime` en null
   (`app/Http/Controllers/ArchivosCasoController.php`, línea 41).
   Impacto: el flujo de archivos del caso queda incompleto si es
   requisito. Recomendación: auditar antes de cualquier cambio de
   archivos.
2. **Cálculo de plazos en memoria.** Evidencia: `KpiQuery` y
   `RendimientoQuery` hidratan colecciones con ampliaciones y filtran
   por accessor. Impacto: degradación a escala. Recomendación:
   agregados SQL.
3. **`Bandeja.tsx` como orquestador de 1061 líneas.** Impacto: costo de
   testeo y mantenimiento. Recomendación: dividir por tabs y modales.
4. **Duplicación de contratos de exportación.** Evidencia: re-exports
   de compatibilidad duplicados y `COLUMNAS_EXCEL` espejo entre
   `ModalExportar.tsx` y `ReporteController::COLUMNAS_EXCEL`
   (sincronización manual indicada en comentario). Impacto: drift
   silencioso. Recomendación: contrato único.
5. **Controladores extensos restantes.** Evidencia:
   `CatalogoController` 715 líneas, `PublicacionController` 632,
   `UsuarioController` 491. Impacto: mantenimiento. Recomendación:
   extraer queries o servicios, como en dashboard.
6. **Auditoría forense pendiente (Sprint 21).** Hoy solo existe
   `Bitácora`. Recomendación: mantener el plan de Sprint 21.

Menores:

- Gate de rutas dev: el control 404 fuera de local vive en el
  controller (`routes/dev.php`, `DevTiempoController`); toda ruta
  `/dev/*` nueva debe repetir el gate.
- Corrección de verificación: el import de `Hourglass` en
  `TabResultados.tsx` está en uso (placeholder "Próximamente"), no es
  un import muerto.

## Fortalezas

- Patrón transaccional consistente en todo el ciclo.
- Manejo de carreras con `CasoAuth`.
- Autorización en dos capas.
- Catálogo de permisos espejo backend/frontend coherente.
- Delegaciones auditadas con revocación en cascada.
- Controladores delgados + queries separadas en dashboard.
- 167 pruebas más `tsc` y build en verde (cierre 17-sep-2026).

## Trabajo futuro

El conjunto de hallazgos alimenta los Sprints 19/20/21 (pulidos, mora,
cierre de Fase 1 y auditoría forense) y la lista viva
`Deuda Tecnica y Riesgos.md`. Antes de tocar archivos del caso, auditar
el stub del hallazgo 1.

## Referencias

- `odd/tasks/analisis-completo.md` — documento de tarea de este análisis.
- `app/Http/Controllers/ArchivosCasoController.php`
- `app/Queries/Dashboard/KpiQuery.php`, `RendimientoQuery.php`
- `resources/js/Pages/Denuncias/Bandeja.tsx`
- `resources/js/Components/Dashboard/ModalExportar.tsx`
- `app/Http/Controllers/ReporteController.php`
- `resources/js/permissions.ts`
- `routes/dev.php`
- `transparencia-proy/Deuda Tecnica y Riesgos.md`
- `transparencia-proy/Sprints Pendientes - Contexto.md`
- Base del análisis: commit `db69005`.
