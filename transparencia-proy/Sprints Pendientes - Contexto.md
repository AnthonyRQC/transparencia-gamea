# Sprints Pendientes — Contexto para IA

> **CONVENCIÓN DE LECTURA:** Este archivo contiene el contexto de sprints pendientes (10-21) y cerrados referenciales.
> **Solo leer la sección del sprint en el que se está trabajando actualmente.**
> No leer las secciones de sprints futuros para evitar cargar contexto innecesario.

**Sprints pendientes (orden 17-sep-2026):** 16 (rename + roles) → 18A (panel usuarios) →
18B (mi cuenta) → 18C (delegaciones temporales) → 19/20 (pulidos) → 21 (cierre Fase 1 + auditoría).
**Sprint 14 (Tiempos entre Fases) APARCADO** (17-sep-2026 — agregado no solicitado por el cliente; ver § Sprint 14).
**Sprints diferidos a v2:** 23 (Acompañamiento/Intervención, era 22), 25 (Permisos Personalizados; 18C adelanta solo delegaciones temporales).
**Sprint diferido (detalle a definir):** 24 (Migración Casos Legacy, era 23).
**Planes vigentes:** `Sprint 16 - Plan (Rename + Roles).md`, `Sprint 18A - Plan Panel Usuarios.md`, `Sprint 18C - Plan Delegaciones.md` (replan D18–D25, 17-sep-2026 tarde).
**Renumeración 17-sep-2026:** Sprint 17 (auditoría) se fusiona en **Sprint 21**; Sprint 18 se divide en **18A** (panel usuarios) y **18B** (mi cuenta).

---

## Sprint 6.5 — Simulación Multi-Rol para Demo ✅ CERRADO (Julio 2026)

**Estado:** Cerrado — implementado.
**Origen:** Reunión con cliente Julio 2026 — necesidad de demo multi-rol realista.

### Resumen
Dropdown en el Header para cambiar entre **5 usuarios demo** (sin BD, sin auth real). Cada rol ve solo su menú. Reemplaza el patrón `?tecnico=tec-X` actual por un mecanismo más realista de simulación de sesión.

### Usuarios demo

| Usuario | Rol | ID | Ve |
|---------|-----|----|----|
| María García | Registrador | `registrador-1` | Solo `/denuncias/registrar` |
| Pedro Mamani | Jefe de Unidad | `jefe-1` | Bandeja, Reportes, Admin/Feriados, Dashboard |
| Carlos Quispe | Técnico | `tec-1` | MisCasos, MiResumen (solo sus casos) |
| Ana Torres | Técnico | `tec-2` | MisCasos, MiResumen (solo sus casos) |
| Luis Mamani | Técnico | `tec-3` | MisCasos, MiResumen (solo sus casos) |

### Implementación

**Mecanismo:**
- Al cambiar de usuario en el dropdown, se hace un `router.post()` al backend
- El backend guarda el usuario activo en `session('demo_user_id')`
- `AppLayout.tsx` envía el usuario activo como Inertia prop
- El Sidebar filtra menú según `user.rol`
- `BandejaController`, `MisCasosController`, `MiResumenController` leen el rol desde la sesión

**Diferencia con el patrón actual:**
- Actual: `?tecnico=tec-X` en URL (solo funciona para técnicos)
- Nuevo: Sesión Laravel con todos los roles, sin URL params

### Archivos a crear
- `app/Data/SesionUsuarioData.php` (5 usuarios mock + current_user en sesión)
- `app/Http/Controllers/SelectorUsuarioController.php` (POST para cambiar usuario)
- `resources/js/Components/Layout/SelectorUsuarioDemo.tsx` (Dropdown en Header)

### Archivos a modificar
- `resources/js/Components/Layout/Header.tsx` (+SelectorUsuarioDemo)
- `resources/js/Components/Layout/Sidebar.tsx` (filtrar menú por `user.rol`)
- `resources/js/Components/Layout/AppLayout.tsx` (enviar currentUser como prop)
- `app/Http/Controllers/BandejaController.php` (leer sesión para determinar Jefe)
- `app/Http/Controllers/MisCasosController.php` (leer sesión para técnico activo)
- `app/Http/Controllers/MiResumenController.php` (leer sesión para técnico activo)
- `app/Http/Middleware/HandleInertiaRequests.php` (compartir currentUser global)

### Notificaciones per-user
Las notificaciones se filtran automáticamente según el rol y los casos asignados al usuario activo:
- `NotificacionData::generarParaUsuario($usuarioId)` genera derivadas solo relevantes al usuario
- Las notificaciones persistentes (asignación, traspaso) se guardan con `usuario_id`
- `getUnreadCount($usuarioId)` y `getRecientes(5, $usuarioId)` filtran por usuario

**Defaults de alerta (hardcoded en Sprint 6.5):**
- Plazo total: 3 días antes
- Informe final: 3 días antes
- Solicitud info: 2 días antes
- Descargo: 2 días antes

> Estos defaults serán configurables en Sprint 11 (Panel Admin → Preferencias de alerta).

### Patrón de reusabilidad para Sprint 16
Cuando se implementen roles reales (Sprint 16):
1. El dropdown se **elimina** del Header
2. `SesionUsuarioData` se **reemplaza** por `Auth::user()`
3. El Sidebar **no cambia** — solo cambia la fuente de datos del `user.rol`
4. Los controllers dejan de leer `session('demo_user_id')` y leen `Auth::user()`
5. **Cero código desechable:** el 100% de la lógica de filtrado por rol se reutiliza

### Dependencias
- Ninguna. No requiere BD ni cambios en sprinks anteriores.
- No afecta a Sprint 7 (Evaluación Técnica) que sigue igual.

---

## Sprint 7 — Evaluación Técnica Previa ✅ CERRADO (Julio 2026)

**Estado:** Cerrado — núcleo implementado. Bloque SITPRECO diferido a **Sprint 7.A**.

### Resumen
El Jefe de Unidad puede **delegar la evaluación de una denuncia** a un técnico antes de admitirla o rechazarla. El técnico evalúa y devuelve la denuncia con su evaluación resumida. El Jefe decide entonces si admite o rechaza.

### Implementado
- `app/Data/EvaluacionData.php` ✅
- `app/Http/Controllers/EvaluacionController.php` ✅ (solo `devolver`; `delegar` está en `DenunciaController`)
- `app/Data/DenunciaData.php` ✅ (+sub-estado `evaluacion_tecnica`, +7 campos `evaluacion_tecnica_*`, +métodos `delegarEvaluacion/devolverEvaluacion/reasumirEvaluacion`)
- `app/Http/Controllers/DenunciaController.php` ✅ (+delegarEvaluacion, +reasumirEvaluacion)
- `resources/js/Components/Denuncias/ModalDelegarEvaluacion.tsx` ✅
- `resources/js/Components/Denuncias/ModalDevolverEvaluacion.tsx` ✅
- `resources/js/Components/Denuncias/TabEvaluacionPrevia.tsx` ✅
- `resources/js/Pages/Denuncias/Evaluaciones.tsx` ✅
- `resources/js/Pages/Denuncias/Bandeja.tsx` ✅ (+botón "Delegar evaluación", +botón "Reasumir", +banner "En evaluación por [Técnico]")
- `resources/js/Pages/Denuncias/MisCasos.tsx` ✅ (+tab "Evaluaciones delegadas")
- `resources/js/Components/Denuncias/DenunciaSheet.tsx` ✅ (+tab Evaluación Previa, 4to tab)

### Decisiones finales
- El Jefe **puede elegir** si delega o evalúa él mismo
- Cualquier técnico disponible puede ser delegado
- Los 5 días de admisión (Art. 23) **se cuentan desde la recepción** (no se pausan)
- El técnico que evalúa puede ser reasignado o no al caso final (decisión del Jefe)

### Bloque SITPRECO — Diferido a Sprint 7.A
Decisión del cliente (Julio 2026): **SITPRECO solo en informe final** (donde ya estaba) y **opcional al rechazar**. NO se pide al admitir (genera burocracia). Por tanto:
- `ModalAdmision`: NO tendrá input SITPRECO (queda como está)
- `ModalRechazo`: SÍ tendrá input SITPRECO opcional (nuevo en Sprint 7.A)
- `FormCierre`: NO muestra SITPRECO heredado (queda como está, usa su propio `cierre_sitpreco` si existe)

### Detalle completo
Ver `Sprint 7 - Evaluación Técnica Previa.md`.

---

---

## Sprint 8 — Ampliaciones Múltiples ✅ CERRADO (Julio 2026)

**Estado:** Cerrado — implementado.
**Origen:** Respuesta del cliente #11 (C6 resuelta).

### Resumen
El Jefe de Unidad puede aprobar **N ampliaciones parciales** del plazo total de una denuncia como eventos independientes, con validación del límite legal (45+45 corrupción, 20+10 negación info) y warning visual.

### Decisiones clave
- **Cada ampliación es evento independiente:** `{fecha, dias, justificacion, aprobado_por, solicitado_por?}`
- **Días hábiles:** El cálculo de vencimiento usa días hábiles (Lun-Vie, sin Sáb/Dom/feriados). Decisión tomada Julio 2026.
- **Mostrar límite legal** con warning visual (rojo si excede, amarillo si cerca)
- **Jefe puede ampliar sin solicitud previa** (campo `solicitado_por` opcional)
- **Plazo NO se congela** durante aprobación
- **Ampliaciones se borran al reabrir** denuncia (reloj se reinicia)
- **Permitido en cualquier estado activo post-admisión:** `admitida`, `asignada`, `investigacion`, `informe`, `evaluacion_tecnica`
- **NO permitido en:** `ingresada`, `rechazada`, `cerrada`
- **Validación:** `sumaAmpliaciones + nuevosDias ≤ maxAmpliacion` (45 corrupción, 10 negación)

### Flujo
1. Caso activo (admitida/asignada/etc.)
2. Jefe abre DenunciaSheet → botón "Ampliar plazo"
3. Modal muestra estado actual (plazo base, ampliaciones previas, límite legal)
4. Jefe ingresa días + justificación + (opcional) solicitante
5. Validación de límite legal
6. Se agrega evento a `ampliaciones[]` o muestra warning de error

### Cálculo de fecha de vencimiento
```php
$plazoBase = getPlazoDias($tipo);  // 45 o 20
$sumaAmpliaciones = sum(array_column($ampliaciones, 'dias'));
$plazoTotal = $plazoBase + $sumaAmpliaciones;
$fechaVencimiento = Carbon::parse($created_at)->addDays($plazoTotal);
$diasRestantes = $plazoTotal - $diasTranscurridos;
```

### Archivos a crear
- `resources/js/Components/Denuncias/ModalAmpliacionPlazo.tsx` (nuevo, desde cero)

### Archivos a modificar
- `app/Data/DenunciaData.php` (+campo `ampliaciones[]`, +método `aprobarAmpliacion()`, modificar `getPlazoInfo()` para sumar ampliaciones, +método `getMaxAmpliacion()`)
- `app/Http/Controllers/DenunciaController.php` (+método `aprobarAmpliacion(Request)`)
- `routes/web.php` (+ruta `POST /denuncias/{id}/ampliar-plazo`)
- `resources/js/Components/Denuncias/PlazoBadge.tsx` (mostrar plazo total con ampliaciones)
- `resources/js/Components/Denuncias/DenunciaSheet.tsx` (+botón "Ampliar plazo" solo Jefe)
- `resources/js/Components/Denuncias/DenunciaCard.tsx` (badge "Ampliada +Xd")

### Dependencias
- Ninguna externa (reusa shadcn `dialog`, `input`, `textarea`, `button`, `select`, `checkbox`, `badge`)
- Compatible con Sprint 7 (estado `evaluacion_tecnica`)
- Marco para Sprint 9 (notificaciones de ampliación)
- Prepárate para Sprint 20 (días hábiles, era 19)

### Detalle completo
Ver `Sprint 8 - Ampliaciones Múltiples.md`.

---

## Sprint 9 — Notificaciones Push + Historial ✅ CERRADO (Julio 2026)

**Estado:** Cerrado — implementado.
**Origen:** Respuesta del cliente #22.

### Resumen
Sistema de notificaciones push vía **campana superior** en el navbar, con historial scrolleable tipo notificaciones de Facebook. Click en notificación navega al caso relacionado.

### Alertas a implementar
- Delegaciones de evaluación
- Traspasos de casos
- Denuncias respondidas
- Plazos por terminar (informes)
- Plazos total (20/25 días) por vencer
- Solicitudes de información próximas a vencer
- Descargos de denunciados próximos a vencer

### Interacción
- Badge con contador de no leídas
- Marcar individual / marcar todas leídas
- Historial persistente (mock)
- Click navega al caso

### Archivos a crear
- `app/Data/NotificacionData.php`
- `app/Http/Controllers/NotificacionController.php`
- `resources/js/Components/Layout/CampanaNotificaciones.tsx`
- `resources/js/Components/Layout/PanelNotificaciones.tsx`
- `resources/js/Components/Layout/ItemNotificacion.tsx`

### Archivos a modificar
- `resources/js/Components/Layout/Header.tsx` (+integrar campana)

### Nota — Julio 2026
**Las preferencias de alerta (días antes de notificar) se implementan en Sprint 11 (era 10), no aquí.** Sprint 9 es solo el motor de notificaciones. Sprint 11 agrega el panel `/admin/preferencias` donde cada usuario configura:
- Días antes del plazo total para alertar (default: 3)
- Días antes del informe final (default: 3)
- Días antes de solicitud (default: 2)
- Días antes de descargo (default: 2)

---

## Sprint 9.1 — Simplificación UI Archivos + Mock alineado ✅ CERRADO (Julio 2026)

**Estado:** Cerrado — implementado.
**Origen:** Decisión de diseño para alinear el mock con la nueva arquitectura simplificada (Sprint 9.2).

### Resumen
Simplificación de la UI de archivos y alineación del mock data con el nuevo esquema de BD reducido. Se centralizó toda la subida de archivos en `ModalArchivosDelCaso` y se eliminaron los campos de archivos de formularios específicos.

### Cambios principales
- **`ModalArchivosDelCaso.tsx`**: Ampliado dropdown de contexto a 6 valores + `contexto_id`.
- **`FormInformeFinal.tsx` y `FormCierre.tsx`**: Eliminado bloque de archivos simulados. Botón "Abrir repositorio".
- **`BloquePrueba.tsx`**: Eliminado `tipo='archivo'`. Solo `fisica` y `testigo`.
- **`ArchivosCasoController.php`**: Validación 6 contextos + `contexto_id`.
- **Archivos embebidos eliminados de seed**: `SolicitudData`, `DescargoData`, `DenunciaData` (informe_archivos, cierre_archivos).

### Dependencias
- Sprint 7.6 (Repositorio de Archivos) — cerrado
- Prepara el mock para Sprint 9.2 (BD real)

---

## Sprint 7.6 — Repositorio de Archivos del Caso ✅ CERRADO (Julio 2026, refinado en Sprint 9.1)

**Estado:** Cerrado — implementado y refinado en Sprint 9.1.
**Origen:** Decisión del cliente Julio 2026 — evitar pedir archivos en cada paso del flujo de investigación; preferir subida al final consolidada con listado para evitar duplicidades.

### Resumen
Crear un **repositorio unificado de archivos por denuncia** que convive con los archivos específicos por fase. Los archivos se suben en cualquier momento del caso (no solo al final), pero la UI fomenta la subida al final mostrando un listado consolidado.

### Comportamiento
- Nueva sección "Archivos del caso" en el `DenunciaSheet`
- Lista todos los archivos subidos al caso (independiente de la fase)
- Permite subir nuevos archivos en cualquier momento
- Permite eliminar archivos (soft delete — UI los oculta, archivo físico se preserva)
- El bloque "Archivos subidos en la denuncia" original (`pruebas`) se mantiene intacto

### Convivencia
- `solicitudes_archivos`, `descargos_documentos`, `informes_archivos`, `cierres_archivos` se mantienen (adjuntos formales por fase)
- `denuncias_archivos` (nuevo, Sprint 9.2) será el repositorio libre
- En Fase 0 (mock), conviven en `app/Data/ArchivoData.php` (nuevo) con clave de sesión `archivos_mock`

### Archivos a crear
- `app/Data/ArchivoData.php` (mock, sesión `archivos_mock`)
- `app/Http/Controllers/ArchivosCasoController.php` (CRUD con soft delete)
- `resources/js/Components/Denuncias/ModalArchivosDelCaso.tsx` (subir/listar/eliminar)
- `resources/js/Components/Denuncias/TablaArchivosCaso.tsx` (lista con buscador)

### Archivos a modificar
- `resources/js/Components/Denuncias/DenunciaSheet.tsx` (+sección "Archivos del caso")
- `resources/js/Pages/Denuncias/Bandeja.tsx` (sin cambios visibles, hereda Sheet)
- `resources/js/Pages/Denuncias/MisCasos.tsx` (sin cambios visibles, hereda Sheet)

### BD (Sprint 9.2)
- Nueva tabla `denuncias_archivos` con campos: `id`, `denuncia_id`, `usuario_id`, `nombre`, `path`, `tamano`, `mime_type`, `descripcion` (MAYÚSCULAS), `contexto` (ENUM: 'registro'|'general'|'informe'|'cierre'), `contexto_id` (nullable), `eliminado`, `fecha_eliminacion`, `fecha_subida`

### Comportamiento del soft delete
- Botón "Eliminar archivo" en UI → `eliminado: true`
- Archivo "eliminado" desaparece de la tabla
- **Archivo físico se preserva en disco** (no se borra) — solo se mueve a `archivos_eliminados/` con timestamp para liberar espacio visual
- DB mantiene el registro con `eliminado: true` para auditoría forense

### Estimación
2-3 días.

### Detalle completo
Ver `Sprint 7.6 - Repositorio de Archivos del Caso.md`.

---

## Sprint 7.7 — Búsqueda y Consulta para Registrador ✅ CERRADO (Julio 2026)

**Estado:** Cerrado — implementado.
**Origen:** Pedido del cliente Julio 2026 — los denunciantes vienen presencialmente a preguntar el estado de su caso y a veces olvidan el código. El Registrador necesita ver y consultar.

### Resumen
Nueva página `/denuncias/consultar` solo accesible para rol Registrador. Permite buscar casos con 7 filtros esenciales, ver el detalle (read-only) y consultar el código (ticket + PIN) cuando un denunciante lo solicita presencialmente.

### Filtros esenciales (7)
1. **Búsqueda por texto libre** — busca en: ticket, descripción `hechos`, nombres denunciante, nombres denunciados, dependencia denunciado, resumen rechazo
2. **Ticket exacto** — campo dedicado
3. **Estado** — multi-select: ingresada, evaluacion_tecnica, admitida, rechazada, asignada, investigacion, informe, cerrada
4. **Tipo** — corrupcion, negacion
5. **Escenario** — revelada, anonimo, reservada
6. **Rango fechas de ingreso** — desde / hasta
7. **Técnico asignado** — select con técnicos activos

### Columnas de la tabla
- Ticket | Tipo | Estado | Fecha ingreso | Denunciante (masked si reservada/anonimo) | Denunciado(s) resumido | Técnico | Plazo restante | Acciones

### Acciones por fila
- **Ver detalle** (read-only) — abre DenunciaSheet en modo consulta
- **Consultar código** — modal con ticket + PIN + botón "Copiar"
- **Copiar al portapapeles** (botón auxiliar)

### Auditoría — IMPORTANTE
**NO se registra en bitácora** la consulta de código. Decisión del cliente (Julio 2026): "el Registrador es responsable de la información que consulta, puede consultar cuanto quiera". No hay restricción ni log visible.

### Archivos a crear
- `app/Http/Controllers/ConsultaCasosController.php` (`index()` con filtros, `consultarCodigo()`)
- `resources/js/Pages/Denuncias/ConsultarCasos.tsx` (página principal con tabla + filtros)
- `resources/js/Components/Denuncias/TablaResultadosConsulta.tsx` (tabla shadcn)
- `resources/js/Components/Denuncias/ModalConsultarCodigo.tsx` (modal con ticket + PIN + botón copiar)
- `resources/js/Components/Denuncias/FiltrosConsulta.tsx` (panel de 7 filtros)

### Archivos a modificar
- `resources/js/Components/Layout/Sidebar.tsx` (+item "Consultar casos" solo para Registrador)
- `resources/js/Components/Layout/AppLayout.tsx` (ruta `/denuncias/consultar`)
- `routes/web.php` (+ruta `GET /denuncias/consultar` con middleware de rol)

### shadcn a instalar
- `table`

### Estimación
2-3 días.

### Detalle completo
Ver `Sprint 7.7 - Búsqueda y Consulta para Registrador.md`.

---

## Sprint 11 (era 10) — Panel Administración Catálogos ✅ COMPLETADO (Agosto 2026)

**Estado:** ✅ Completado. Ver `Notas Sprint 11 - Panel Catálogos (Cierre).md`.
**Origen:** Respuesta del cliente #18.

### Resumen
Panel administrativo único para **CRUD de todos los catálogos** del sistema. Cada catálogo es editable desde aquí, no hardcodeado en código.

### Implementado (8 pestañas → 7 tras reestructuración)
- **Categorías de denuncia** (tabla BD)
- **Dependencias externas** (tabla BD con **árbol** `parent_id` + organigrama GAMEA 2026)
- **Feriados** (tabla BD con SoftDeletes)
- **Medios de notificación** (**tabla BD** desde Agosto 2026; conectados con Cierre — protección por uso)
- **Clasificaciones finales** (**tabla BD** desde Agosto 2026; fuente de verdad — protegidas + soft-deactivate)
- **Estados** (JSON config, solo-edición)
- **Tipos de denuncia** (JSON config, solo-edición)
- ~~Tipos de prueba~~ **(eliminado en Agosto 2026 — catálogo huérfano)**

> **Reestructuración (Agosto 2026):** clasificaciones y medios migraron de JSON a tablas con
> FKs reales (`informes_finales.clasificacion_id`, `cierres.notificacion_medio_id`).
> `dependencias_externas` ahora es un árbol. Ver `Notas Reestructuración BD - Catálogos y Árbol (Cierre).md`.

### Pendiente
- **Configuración de alertas por usuario:** Sliders/inputs numéricos con preview. Se implementa en Sprint 18 (Panel de Usuario).
- **Subcategorías jerárquicas de Categorías:** `parent_id` en `categorias_denuncia` sigue pendiente de confirmación del cliente (el árbol de dependencias SÍ se implementó, pero es otra entidad).
- **UI de calendario para Feriados:** hoy es tabla agrupada por año; mejora a grid mensual si el cliente lo pide.

### Archivos creados
- `resources/js/Pages/Admin/Catalogos.tsx`
- `app/Http/Controllers/CatalogoController.php`
- `database/seeders/CatalogosConfigSeeder.php` (ahora solo estados + tipos_denuncia)
- `resources/js/Components/Admin/TablaCatalogo.tsx` (con vista de árbol)
- `resources/js/Components/Admin/ModalEditarItem.tsx` (con select "Dependencia padre")
- `resources/js/Components/Admin/ModalConfirmarDesactivar.tsx`
- `resources/js/Components/Denuncias/ModalNuevaSolicitud.tsx` (select jerárquico de dependencias)

---

## Sprint 12 (era 11) — Dashboard + KPIs + Reportes PDF/Excel

**Estado:** Pendiente (será uno de los últimos sprints a reestructurar).
**Origen:** Respuestas del cliente #15, #16, #17, #21.

> 🗂️ **Antes de empezar:** leer `Consultas - Dashboard y Reportes.md`. La reestructuración de
> Agosto 2026 (tablas `clasificaciones`/`medios_notificacion`, FKs, árbol de dependencias,
> `clasificado_por_id`/`cerrado_por_id`, índices) dejó el esquema listo para consultas en tiempo real.

### Reglas de negocio para el dashboard/reportes
- **`users.activo = true` por defecto** en agregaciones por usuario (técnico, clasificado_por, cerrado_por). Toggle "incluir inactivos" como recordatorio de técnicos a desactivar.
- **Roll-up por árbol** de dependencias: unidad → dirección → secretaría → Gestión Institucional → GAMEA (recursión en PHP o CTE).
- Filtros cruzados: rango de fechas libre (por `created_at` o `redactado_at`/`cerrado_at`) + tipo + estado + técnico + clasificación + dependencia.

### KPIs propuestos
1. Denuncias activas
2. Pendientes admisión
3. % Cumplimiento de plazos
4. Casos próximos a vencer (≤5 días)
5. Casos ya vencidos con mora

### Filtros
- Rango de fechas **libre** (selector doble)
- Tipo de denuncia
- Estado
- Clasificación
- Filtros cruzados múltiples

### Exportación
- **PDF** y **Excel** además de vista en pantalla
- Solo para el **Jefe de Unidad** (interno, no público)
- Reportes espontáneos con fechas variables

### Dependencias
- `npm install recharts`
- `composer require maatwebsite/excel barryvdh/laravel-dompdf`
- shadcn: `table` (a instalar)

### Archivos a crear
- `resources/js/Components/Dashboard/KPICards.tsx`
- `resources/js/Components/Dashboard/GraficosDashboard.tsx`
- `resources/js/Pages/Reportes/Index.tsx`
- `resources/js/Components/Reportes/TablaReporte.tsx`
- `resources/js/Components/Reportes/FiltrosReporte.tsx`
- `resources/js/Components/Reportes/BotonExportar.tsx`
- `app/Http/Controllers/ReporteController.php`
- `app/Exports/ReporteExcel.php`
- `resources/views/reportes/pdf.blade.php`

### Archivos a modificar
- `resources/js/Pages/Dashboard.tsx` (refactor)

---

## Sprint 13 (era 12) — Tablero Público Cerrados ⚠️ DEPRECATED (09-sep-2026)

> **Reemplazado por:** `Sprint 13 - Portal Panel Informativo (Plan).md`
> (portal del panel físico: 13.1 muro / 13.2 generales email / 13.3 casos vinculados).
> Decisiones en `Decisiones 12.5 - 13 (Log).md`. Se conserva esta sección por historia.

**Estado:** Pendiente.
**Origen:** Respuesta del cliente #27.

### Resumen
Sección en la página **Welcome pública** mostrando **casos cerrados recientes** (anonimizados) para aumentar transparencia. Similar al tablero informativo físico que la UTLCC tiene fuera de la oficina.

### Datos mostrados (anonimizados)
- Ticket parcial (ej. DEN-2026-XXXX)
- Tipo de denuncia
- Clasificación final
- Fecha de cierre
- **NO** denunciante ni denunciados

### Complejidad
Baja. Solo vista + endpoint. Se puede hacer tempranamente.

### Archivos a crear
- `resources/js/Components/Publico/TableroCasosCerrados.tsx`

### Archivos a modificar
- `resources/js/Pages/Welcome.tsx` (+sección)
- `app/Http/Controllers/SeguimientoController.php` (+casosCerrados)
- (posible) `app/Http/Controllers/HomeController.php` (nuevo)

---

## Sprint 14 — Tiempos entre Fases ⏸️ APARCADO (17-sep-2026)

**Estado:** ⏸️ **Aparcado.** Era un agregado propio (no solicitado por el cliente) para el dashboard.

### Por qué se aparcó
- El cliente nunca lo pidió; las prioridades actuales son roles, panel de usuarios y delegaciones.
- Se analizó la factibilidad: los 5 tramos se pueden calcular **sin migración** (fechas de
  dominio + `bitacora.accion='investigacion'` para Inicio→Informe + `DiasHabiles::transcurridos`).
- Si se retoma: `TiemposQuery` en `app/Queries/Dashboard/` + `GraficoTiempos` en
  `TabResultados.tsx` (hoy placeholder `Hourglass`), solo visual, sin export.
- Nota técnica registrada: no existe columna `fecha_investigacion` (única vía: bitácora);
  evaluar columna + backfill solo si se retoma con requisito de exactitud.

### Referencia
Discusión de planificación 17-sep-2026 (misma sesión que D11–D17 en `Decisiones 12.5 - 13 (Log).md`).

---

## Sprint 10 (era 9.2, antigua 14) — Base de datos real (MySQL + Eloquent) ✅ CERRADO

**Estado:** ✅ Cerrado (Julio 2026). Implementado en su totalidad.
**Aceptación:** `migrate:fresh --seed` corre sin errores, login con username funcional, 23 tests pasando.

**Ver detalle de cierre:** `Notas Sprint 10 - Cierre.md` y `Sprint 10 - Base de Datos Real (Eloquent + MySQL).md`.

**Resumen:** Sprint 10 migró el sistema de `app/Data/*` (mock en sesión) a MySQL + Eloquent. Se crearon 22 migraciones, 18 modelos, 4 seeders, y se refactorizaron 11 controllers. Las categorías se comparten globalmente vía middleware (fuente única de verdad).
**Origen:** Respuestas del cliente #24, #29. Esquema BD diseñado y aprobado en Sprint 9.1.

### Documentos de referencia
- **`Sprint 10 - Base de Datos Real (Eloquent + MySQL).md`** — Plan detallado, fases, migraciones
- **`Sprint 10 - Convenciones de Modelos Eloquent.md`** — Convenciones, relaciones, casts
- **`Sprint 10 - Mapa de Migración Mock a BD.md`** — Mapa mock→BD por cada entidad
- **`Sprint 10 - Seeders Iniciales.md`** — Datos demo (usuarios, catálogos, denuncias)

### Decisiones técnicas
- **Auth:** Breeze con `username` (5 usuarios: jefe, registrador, tecnico1/2/3, pasword: `demo123`)
- **Polimorfismo:** `morphTo()` en `Ampliacion` (entidad) y `DenunciaArchivo` (contexto_entidad)
- **Soft delete:** Solo `Denuncia` usa `SoftDeletes`. Resto usa `fecha_eliminacion`
- **Storage:** Local `storage/app/archivos/`
- **Auditoría:** Diferida a Sprint 17
- **Estrategia migración:** Reemplazo total de `app/Data/*` por Eloquent (sin legacy adapter)

### Fases
1. **Fase 1 — Cimientos** (2-3 días): Migraciones + modelos base + seeders catálogos
2. **Fase 2 — Entidades núcleo** (3-4 días): Denuncia, Solicitud, Descargo, Informe, Cierre
3. **Fase 3 — Polimórficas** (2 días): Ampliacion + DenunciaArchivo + storage
4. **Fase 4 — Auth y refactor** (2-3 días): Breeze con username, refactor de controllers
5. **Fase 5 — Testing** (2 días): Feature tests completos con `RefreshDatabase`

### Dependencias
Sprint 16 (Roles) y siguientes dependen de este sprint.

---

## Sprint 16 (era 15) — Rename + Roles y Permisos ✅ PLANIFICADO (17-sep-2026)

**Estado:** Planificado, no ejecutado. **Plan completo:** `Sprint 16 - Plan (Rename + Roles).md`.
**Replan:** D18–D25 (sin `RoleMiddleware`; `CasoAuth`; `lockForUpdate`; quitar `DELETE /profile`).

### Fases
1. **16.1 Rename** `técnico` → `investigador` (persona, incl. `evaluaciones_tecnicas.investigador_id`).
   Proceso «evaluación técnica» se conserva. Docs al cierre.
2. **16.2 Roles y protección:**
   - Rol **admin** (Sistemas; no opera casos). 4 `usuario.*` + `menu.usuarios`.
   - `PermisosEfectivos` / `User::puede()` (hoy = rol; 18C suma delegaciones).
   - Gates + `can:` por ruta. **Sin** `RoleMiddleware`. `EnsureActive`.
   - `AuthorizationException` → `/dashboard` + toast.
   - Split `routes/web.php` + `panel.descargar` a públicas.
   - `CasoAuth`: unidad (cualquier caso) vs expediente (dueño).
   - Carreras: `lockForUpdate` en admitir/asignar/traspasar/rechazar.
   - Registrador sin campana. Notif. URL fija al crear. Quitar `DeleteUserForm`.
   - Dashboard **no** se rediseña en 16 (D25).

### Decisiones
D11–D25. Policies por modelo → 21 (`DenunciaPolicy` delega a `CasoAuth`).

---

## Sprint 17 (era 16) — Auditoría Backend Detallada 🔀 FUSIONADO EN SPRINT 21 (17-sep-2026)

**Estado:** 🔀 **Fusionado en Sprint 21** (cierre Fase 1). Ya no es sprint propio.
**Razón:** la auditoría es transversal al sistema completo (roles, usuarios, delegaciones);
hacerla antes de 16/18A/18C obligaría a re-auditar. Se instala y aplica al final, junto al
hardening y al posible panel administrativo de auditoría pedido por Sistemas (sin confirmar).

### Alcance cuando se ejecute (en Sprint 21)
- `composer require owen-it/laravel-auditing` + trait `Auditable` (Denuncia, Solicitud,
  Descargo, Evaluación, Informe, Cierre, **User, Delegacion**).
- UI de consulta: por caso, por usuario y por evento administrativo (alta/edición/baja de
  usuarios y delegaciones) — pendiente confirmar alcance con Sistemas GAMEA.
- Trazabilidad básica ya existe en columnas (`creado_por_id`, `desactivado_*`, `delegaciones.*`);
  `audits` da el detalle fino campo→campo.

---

## Sprint 18A — Panel de Administración de Usuarios ✅ PLANIFICADO (17-sep-2026)

**Estado:** Planificado, no ejecutado. **Plan completo:** `Sprint 18A - Plan Panel Usuarios.md`.
**Replan D21–D22:** identidad CI + username fórmula; jefe administra otros jefes.

### Alcance
- `/admin/usuarios`: crear, editar, desactivar/reactivar, reset, masivo.
- Matriz: admin → todos (incl. otros admins, nunca login compartido); jefe → jefes +
  investigadores + registradores (no admins, ni verlos).
- Identidad: `nombres` + `apellidos` (obligatorios); `ci` único varchar(20) alfanumérico
  (también inactivos); username autogenerado inmutable (iniciales+CI); email/tel opcionales
  (email único si existe). Un CI inactivo → reactivar.
- Desactivación con casos: bloqueo + traspaso en lote. Invariantes ≥1 admin y ≥1 jefe.
- `debe_cambiar_password` se **persiste** aquí; el force-change en login es **18B**.
- Trazabilidad: `creado_por_id`, `desactivado_*`, `motivo_baja` opcional.

### Pendiente Sistemas (no bloquea)
Panel auditoría (D17) e impersonation (`Notas - Admin simulacion (futuro).md`).

---

## Sprint 18B — Mi Cuenta (Perfil + Seguridad + Preferencias + Apariencia)

**Estado:** Pendiente (post-18A). **Spec:** `Sprints Pendientes - Contexto.md` (esta sección) +
D7 en `Decisiones 12.5 - 13 (Log).md`. Ya NO es mock: la BD existe (Sprint 10) y
`users.preferencias` (JSON) ya está migrado.

### Secciones
- **Perfil:** nombres/apellidos, email, teléfono editables (CI y username **no**; los
  cambia 18A). **Picker de color** D7; avatar vía `InvestigadorAvatar`.
- **Seguridad:** cambio de contraseña real + middleware `debe_cambiar_password` (force
  primer login / post-reset). `DeleteUserForm` se elimina **en 16.2**, no aquí.
- **Preferencias de notificación:** master switch + 4 umbrales (3/3/2/2 por defecto, rango
  0-10) persistidos en `users.preferencias` y **cableados a `AlertasPlazo`** (hoy ignora
  preferencias).
- **Apariencia:** modo oscuro/claro (ya funciona), idioma solo-español (selector informativo).

### Archivos
- `resources/js/Pages/Profile/*` (extender Breeze) + `ProfileController` (update) ·
  `Notificacion`/`AlertasPlazo` (leer preferencias) · Sidebar/Header (link "Mi Cuenta").

---

## Sprint 18C — Delegaciones Temporales de Funciones ✅ PLANIFICADO (17-sep-2026)

**Estado:** Planificado, recortado (D23). **Plan completo:** `Sprint 18C - Plan Delegaciones.md`.
**Origen:** un CI = una cuenta. Ausencia de una semana sin segundo jefe: el registrador o
investigador cubre bandeja **sin subir de rol** (subir a `jefe` daría `usuario.*`).

### Alcance
- Aditivo: rol ∪ delegaciones. Misma cuenta, dos funciones. Titular **sigue activo**.
- Preset **`jefe_interino`** = whitelist (jefe menos `usuario.*`/`admin.*`). **No**
  `ROLES['jefe']`.
- Paquete bandeja incluye campana (`notificacion.ver`). Registrador de base no la tiene.
- Cascada al desactivar: solo delegaciones **recibidas**.
- `CasoAuth` de 16.2 no se toca (expediente = dueño).
- Sin admin/jefe interino como rol. 2–3 jefes cubren lo normal.

### Relación con Sprint 25
25 (permanentes) sigue en v2. 18C adelanta solo la elevación temporal.

### Dependencias
Sprint 16 + 18A.

---

## Sprint 19 (era 18) — Lógica de Mora Explícita

**Estado:** Pendiente (D25: no entra en 16; pulido posterior).
**Origen:** Respuesta del cliente #7.

### Resumen
Implementar lógica explícita de **mora** para fechas vencidas: texto "+Xd de retraso", badge "Vencido" en cards, filtro de "casos morosos" en Bandeja y MisCasos.

### Decisión ya implementada (parcialmente)
`PlazoBadge.tsx` ya muestra verde/amarillo/rojo. Este sprint agrega **texto explícito "+Xd"** y filtro dedicado.

### Actividades
- Agregar campo `mora_dias` (calculado on-the-fly o persistido)
- Mostrar texto "+Xd" en cards
- Filtro de "casos morosos" en Bandeja y MisCasos

### Dependencias
Sprint 9.2 (BD) si se persiste, opcional si solo se calcula on-the-fly.

---

## Sprint 20 (era 19) — Calendario Feriados + Días Hábiles

**Estado:** Pendiente como cierre formal. **D25:** no entra en 16. `DiasHabiles.php`,
feriados en catálogos y seed relativo **ya existen**; esta spec está vieja (`DenunciaData`).
Delta real: recorte, no reescritura.
**Origen:** Pregunta #6 (C1) — **decisión tomada en Julio 2026**.

### ⚠️ Decisión: Días hábiles UNIVERSAL
La reunión de Julio 2026 resolvió definitivamente la pregunta #6:
- **Todos los plazos del sistema en días hábiles** (lunes a viernes, sin sábados, domingos ni feriados)
- El Jefe de Unidad administra los feriados desde el panel (UI adelantada a Sprint 11)
- No hay pausa por recesos institucionales (enero, carnaval) — si son feriados oficiales, se marcan en el calendario
- Aplica a TODOS los plazos: admisión, solicitudes, descargos, plazo total, ampliaciones

### Resumen
Este sprint **formaliza** el helper y la UI del sistema de días hábiles que YA está activo desde Sprint 4 (por decisión retroactiva).

**Este sprint NO es para decidir** (ya está decidido). **Es para implementar el código formal.**

### Actividades

#### 1. Helper DiasHabiles.php (formal)
```php
/**
 * Calcula la diferencia en días hábiles entre dos fechas
 * Cuenta Lun-Vie, excluye Sáb/Dom y feriados
 */
function diasHabilesTranscurridos(Carbon $inicio, Carbon $fin, array $feriados): int

/**
 * Suma N días hábiles a una fecha (salta feriados)
 * Ej: agregarDiasHabiles('2026-01-02', 10, ['2026-01-06', ...])
 */
function agregarDiasHabiles(Carbon $fecha, int $dias, array $feriados): Carbon
```

#### 2. FeriadoData.php + FeriadoController.php
- CRUD completo de feriados (nacional + departamental La Paz)
- La UI de administración (cuadrícula calendario) se implementó en Sprint 10
- Este sprint solo conecta el CRUD con la data y el helper

#### 3. Recálculo retroactivo de seed demo
- Todas las denuncias de seed se regeneran con plazos calculados en días hábiles
- `getPlazoInfo()` en DenunciaData, SolicitudData, DescargoData usan el helper

#### 4. Integración en PlazoBadge / PlazoProgress
- La barra de progreso cuenta solo días hábiles
- Los textos de "+Xd de retraso" también usan el helper

### Archivos a crear
- `app/Helpers/DiasHabiles.php` (formal)
- `app/Data/FeriadoData.php` (catálogo con CRUD)
- `app/Http/Controllers/FeriadoController.php` (CRUD)

### Archivos a modificar
- `resources/js/Pages/Admin/Feriados.tsx` (conectar con CRUD real, ya existe placeholder)
- `app/Data/DenunciaData.php` (usar helper en `getPlazoInfo()` y seed)
- `app/Data/SolicitudData.php` (usar helper en `getPlazoInfo()`)
- `app/Data/DescargoData.php` (usar helper en `getPlazoInfo()`)
- `resources/js/Components/Denuncias/PlazoBadge.tsx` (integrar helper backend)
- `resources/js/Components/Denuncias/PlazoProgress.tsx` (integrar helper backend)

### Dependencias
- Sprint 11 (Feriados UI — ya adelantada la interfaz)
- No requiere BD para mock (feriados en sesión igual que otras Data classes)
- Sprint 9.2 (BD) para persistencia formal

---

## Sprint 21 (era 20) — Cierre Fase 1 / Ajustes Finales

**Estado:** Pendiente (último sprint de Fase 1).
**Origen:** Decisión general de cierre.

### Resumen
Sprint dedicado a **testing integral, limpieza técnica, documentación de usuario y deploy a producción**. **No incluye funcionalidad nueva.**

### ⚠️ CONVENCIÓN PARA IA
**Esta sección es solo roadmap. No leerla a menos que se esté trabajando explícitamente en el Sprint 20.**

### Actividades
- **Testing end-to-end** de todos los flujos
- **Optimización de performance** (queries, render, bundle)
- **Limpieza de código** (remover mocks/debug, renombrar, documentar)
- **Refactor de deuda técnica** detectada durante desarrollo
- **Auditoría de seguridad** (sanitización, CSRF, rate limits, exposición de datos)
- **Refactor diferido 12.5 R2** (decisión 09-sep-2026, ver `Decisiones 12.5 - 13 (Log).md`):
  `Shared/FormDialog` (~20 modales) + `Shared/FiltrosCaso` + hook `useFiltroCasos`
  (post-16, para no churnear con Roles).
- **Deuda backend diferida** (ver `Deuda Tecnica y Riesgos.md`): N+1 en
  `Queries/Dashboard/*`, índices (`users.activo`, `publicaciones.estado/cerrado_at`),
  `CatalogoController:527` + seeders god, `43× as any` resto, split `routes/web.php`,
  auditorías `technical-debt` + `database-optimization` + `owasp-security` +
  `e2e-playwright-testing` como revisores.
- **Documentación final:**
  - Manual de usuario para UTLCC
  - Manual técnico
  - README de instalación
- **Capacitación** al Jefe y técnicos
- **Deploy a producción** (servidor, DNS, SSL, backups)
- **Criterio "done" final** (checklist de requisitos de Fase 1)

### Dependencias
Requiere Sprints 14-19 completos.

---

## Sprint 22 (era 21) — Archivos Grandes + Conectividad Inestable (Julio 2026)

**Estado:** Post-Fase 1 (sprint de diseño/planificación, NO se implementa en Fase 0 ni Fase 1).
**Origen:** Reunión con cliente Julio 2026 — preocupación por subida de archivos de 1000+ páginas en entornos con internet inestable.

### Problema
Los servidores institucionales presentan:
- Latencia variable
- Cortes momentáneos de conexión
- Internet lento en ciertas horas
- Señal variable

Los archivos pueden tener hasta **1000+ páginas escaneadas** (>100MB), lo que hace inviable una subida HTTP directa.

### Estrategia propuesta

| Técnica | Propósito | Librería sugerida |
|---------|-----------|-------------------|
| **Chunked uploads** | Dividir archivo grande en pedazos de 5-10MB | `tus.io` protocol + `Uppy` cliente |
| **Resumable uploads** | Reanudar desde último chunk tras corte | `tus-php` servidor |
| **Retry con backoff exponencial** | Reintentos automáticos 1s→2s→4s→... | Custom + Laravel Queue |
| **Hash dedup SHA256** | No resubir archivo ya existente | Custom |
| **Queue asíncrona** | Subida no bloquea UI, procesa en background | Laravel Jobs |
| **Compresión cliente** | Reducir tamaño antes de subir (PDFs escaneados) | Browser-side (opcional) |
| **Storage alternativo** | S3-compatible (MinIO local) en lugar de disco | `league/flysystem-aws-s3-v3` |

### Implementación en Fase 0
No se implementa. Solo se simula una barra de progreso visual + retry animado como placeholder en formularios de subida. Sin chunking real hasta Fase 1.

### Dependencias
- Sprint 9.2 (BD) para persistencia de referencias a archivos
- Sprint 16 (Auth) para asociar subidas a usuarios
- Sprint 21 (Cierre, era 20) completado antes de empezar

### Fuera de alcance
- Subida WebSocket en tiempo real
- CDN externo (decisión institucional)
- Almacenamiento en blockchain

---

## Sprint 23 (era 22) — Acompañamiento e Intervención (v2) ⏸️ DIFERIDO

**Estado:** ⏸️ **Diferido a v2.** NO se implementa en Fase 0/1.

**Origen:** Decisión del cliente Julio 2026 — estas funcionalidades son extras opcionales, no son núcleo del objetivo del sistema (Ley 974 = denuncias de corrupción y negación de información). Se retomarán en una v2 cuando el MVP esté consolidado.

### Funcionalidades diferidas
- **Acompañamiento:** formulario propio con campos `nombres`, `ci`, `unidad_involucrada`, `motivo_reclamo`, `resolucion_acuerdo`.
- **Intervención / Medida Correctiva:** formulario propio con `unidad_observada`, `motivo_patron`, `referencia_nota`, `archivo`.

### Estado actual (Fase 0)
- El dropdown selector de tipo (`RegistroDenuncia.tsx`) actualmente tiene 2 opciones (corrupción, negación). En v2 se reagregan 2 opciones.
- Los archivos `FormularioAcompaniamiento.tsx` y `FormularioIntervencion.tsx` se eliminan en Sprint 7.5.
- El enum `denuncias.tipo` en BD (Sprint 9.2) actualmente solo tiene `corrupcion`, `negacion`. En v2 se agregan `acompaniamiento`, `intervencion`.

### Cambios en v2 (cuando se reactive)
- Reactivar las 2 opciones en el dropdown
- Restaurar `FormularioAcompaniamiento.tsx` y `FormularioIntervencion.tsx` (o reescribir)
- `ALTER TABLE denuncias MODIFY tipo ENUM('corrupcion', 'negacion', 'acompaniamiento', 'intervencion')`
- Mantener plazo "sin límite" para estos 2 tipos
- Sin implicación mayor en otros módulos

### Estimación (referencia v2)
1-2 días.

### Detalle completo
Ver `Sprint 22 - Acompañamiento e Intervención v2 (diferido).md`.

---

## Sprint 24 (era 23) — Migración de Casos Legacy ⏸️ DIFERIDO

**Estado:** ⏸️ **Diferido.** Detalle a definir en Sprint 9.2 (BD real). Anotación temprana para no perder el requerimiento.

**Origen:** Duda del cliente Julio 2026 — la UTLCC tiene actualmente **46 denuncias físicas** que necesitan migrarse al sistema nuevo. Casos legacy no tendrán historial (bitácora) pero sí opción de digitalizar archivos.

### Funcionalidades planificadas (a detalle en Sprint 9.2)
- **Panel administrativo** para configurar número de inicio de tickets por año (ej. "Comenzar DEN-2026 desde 0047", continuando los 46 legacy).
- **Vista de "Importación legacy"** con carga masiva (CSV/Excel).
- Cada caso legacy tiene flag `es_legacy: true`, sin historial completo, sin plazos automáticos.
- Opción de **digitalizar archivos** (subir PDFs escaneados al repositorio).
- **Numeración:** el sistema respeta el `siguiente_numero` configurado por el Jefe; no se reinicia cada año automáticamente.

### Decisiones pendientes
- ¿Los legacy mantienen su numeración original o se renumeran?
- ¿Se importa la fecha original o se usa la fecha de importación?
- ¿Se permite editar legacy o son read-only?

### Dependencias
- Sprint 9.2 (BD) para crear tabla y campo
- Sprint 11 (Panel Admin) para configurar `siguiente_numero`

### Estimación (referencia)
2-3 días. A refinar cuando se implemente.

### Detalle completo
Ver `Sprint 23 - Migración de Casos Legacy (diferido).md`.

---

## Sprint 25 (era 24) — Permisos Personalizados (v2) ⏸️ DIFERIDO

**Estado:** ⏸️ **Diferido a v2.** NO se implementa en Fase 0/1.
**Revisión 17-sep-2026:** el rol admin (Sprint 16), el panel de usuarios (18A) y las
**delegaciones temporales (18C)** cubren la necesidad operativa real detectada por el cliente
(mano derecha del Jefe + jefe interino por vacaciones). Lo que sigue diferido es el panel
granular **permanente** de permisos por usuario.

**Origen:** Duda del cliente Julio 2026 — ¿se necesita un panel de control para dar distintos tipos de permisos a ciertos usuarios o edición de permisos a roles?

### Decisión tomada (Julio 2026, revisada 17-sep-2026)
- **Fase 0/1:** 4 roles fijos (Admin, Jefe, Investigador, Registrador) con permisos en el catálogo (Sprint 7.5) y formalizados en Sprint 16; **delegaciones temporales auditadas en 18C** (adelanto parcial).
- **NO se implementa** un panel de control de permisos granulares **permanentes** por usuario.
- Si en el futuro se requiere granularidad permanente, Sprint 25 (v2) lo abordará con librería tipo `spatie/laravel-permission` (el pivot estándar no soporta vigencia, por eso 18C usa tabla propia).

### Razón
Mantener el sistema simple y predecible en la primera versión. La experiencia ha mostrado que la mayoría de usuarios encajan en uno de los 4 roles.

### Cambios en v2 (cuando se reactive)
- Instalar `spatie/laravel-permission` u otro similar
- Crear UI de administración de permisos
- Refactor de `PermisosEfectivos` (hoy: rol ∪ delegaciones) para cargar permisos por usuario
- Refactor de todos los chequeos de permisos

### Estimación (referencia v2)
3-5 días.

### Detalle completo
Ver `Sprint 24 - Permisos Personalizados v2 (diferido).md`.

---

*Última actualización: 17-sep-2026 (replan D18–D25: can:/CasoAuth, identidad CI, 18C recortado).*
