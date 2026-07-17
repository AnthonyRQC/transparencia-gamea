# Sprints Pendientes — Contexto para IA

> **CONVENCIÓN DE LECTURA:** Este archivo contiene el contexto de sprints pendientes (7.A, 7.5, 7.6, 7.7, 10-21) y cerrados referenciales.
> **Solo leer la sección del sprint en el que se está trabajando actualmente.**
> No leer las secciones de sprints futuros para evitar cargar contexto innecesario.

**Sprints urgentes próximos (pre-cliente):** 7.A → 7.5 → 7.6 → 7.7.
**Sprints diferidos a v2:** 22 (Acompañamiento/Intervención), 24 (Permisos Personalizados).
**Sprint diferido (detalle a definir en Sprint 14):** 23 (Migración Casos Legacy).

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

> Estos defaults serán configurables en Sprint 10 (Panel Admin → Preferencias de alerta).

### Patrón de reusabilidad para Sprint 15
Cuando se implementen roles reales (Sprint 15):
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
- Prepárate para Sprint 18 (días hábiles)

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
**Las preferencias de alerta (días antes de notificar) se implementan en Sprint 10, no aquí.** Sprint 9 es solo el motor de notificaciones. Sprint 10 agrega el panel `/admin/preferencias` donde cada usuario configura:
- Días antes del plazo total para alertar (default: 3)
- Días antes del informe final (default: 3)
- Días antes de solicitud (default: 2)
- Días antes de descargo (default: 2)

---

## Sprint 7.A — Cierre SITPRECO Sprint 7 ⏳ URGENTE (Julio 2026)

**Estado:** Pendiente (próximo sprint activo). Urgente pre-cliente.
**Origen:** Decisión del cliente Julio 2026 — el SITPRECO es código del sistema externo que puede tardar; pedirlo al admitir genera burocracia innecesaria.

### Resumen
Ajustar el alcance del bloque SITPRECO del Sprint 7 al nuevo lineamiento. Eliminar toda referencia a "SITPRECO obligatorio al admitir" y "SITPRECO heredado en cierre". Agregar SITPRECO opcional en `ModalRechazo`.

### Cambios
1. **`ModalRechazo.tsx`**: agregar input `sitpreco_rechazo` opcional (sin required, sin hint, max 50).
2. **`DenunciaController@rechazar`**: aceptar `sitpreco` opcional en validación.
3. **`DenunciaData::rechazar`**: guardar `sitpreco_rechazo` en la denuncia.
4. **NO tocar** `ModalAdmision.tsx` (queda como está, sin SITPRECO).
5. **NO tocar** `FormCierre.tsx` (queda como está, sin SITPRECO heredado).

### Archivos a modificar
- `resources/js/Components/Denuncias/ModalRechazo.tsx` (+input SITPRECO opcional)
- `app/Http/Controllers/DenunciaController.php` (`rechazar()` acepta `sitpreco` opcional)
- `app/Data/DenunciaData.php` (`rechazar()` guarda `sitpreco_rechazo`)

### Estimación
1-2 días. Cambios pequeños, sin impacto en otros sprints.

### Detalle completo
Ver `Sprint 7.A - Cierre SITPRECO Sprint 7.md`.

---

## Sprint 7.5 — Ajustes UX Urgentes pre-cliente ⏳ URGENTE (Julio 2026)

**Estado:** Pendiente. Urgente pre-cliente.
**Origen:** Múltiples pedidos del cliente en reunión Julio 2026.

### Resumen
Sprint grande que agrupa 6 bloques de ajustes UX urgentes + 1 refactor arquitectónico (catálogo de permisos).

### Bloques

#### 1. Catálogo de permisos (refactor arquitectónico)
- `app/Data/PermisosCatalogo.php` (nuevo) — array PHP con todos los permisos
- `resources/js/permissions.ts` (nuevo) — espejo en TypeScript con tipos
- `resources/js/hooks/useCan.ts` (nuevo) — hook React
- `resources/js/Components/Can.tsx` (nuevo) — componente render condicional
- Mapeo `rol → permisos[]` en `SesionUsuarioData`
- Compartir permisos via Inertia shared data
- **Refactor de componentes** que hoy chequean por `user.rol` → cambian a `useCan('permiso.x')`

#### 2. MAYÚSCULAS obligatorias en textos libres
- `app/Helpers/UppercaseText.php` (nuevo) — trait Eloquent
- Aplicar en `Str::upper()` antes del `save()` en modelos relevantes
- CSS `text-transform: uppercase` en todos los inputs/textareas de textos libres
- Helper visual: placeholder "Se guardará en MAYÚSCULAS"
- **NO aplicar a:** email, ticket, token_consulta, password, URLs, paths, enum values

#### 3. CRUD denuncia raíz (solo en `ingresada`)
- `ModalEditarDenuncia.tsx` (nuevo) — editar todos los campos editables
- Acción "Eliminar denuncia" (Jefe/Registrador, solo `ingresada`)
- `DenunciaController@editar()`, `eliminar()` (nuevos)
- `DenunciaData::editar()`, `eliminar()` (nuevos)
- En `Bandeja.tsx` y `MisCasos.tsx`: botones en card de `ingresada`

#### 4. `descargos.medio` libre
- `ModalNotificarDescargo.tsx`: cambiar Select → Input con placeholder
- `DescargoData::notificar()`: aceptar texto libre
- `descargos.medio`: ENUM → TEXT(200)
- MAYÚSCULAS aplica

#### 5. Solicitud con date picker manual
- `ModalNuevaSolicitud.tsx`: agregar `<input type="date">` para `fecha_envio` (default hoy, max hoy, min -90 días)
- `ModalResponderSolicitud.tsx`: agregar date picker para `fecha_respuesta`
- `SolicitudData::add()`: aceptar `fecha_envio` opcional (default = hoy)
- `SolicitudData::responder()`: aceptar `fecha_respuesta` opcional
- Paridad con `ModalNotificarDescargo`

#### 6. Eliminar acomp/intervención
- `RegistroDenuncia.tsx`: dropdown de tipo solo con 2 opciones (corrupción, negación)
- Eliminar `FormularioAcompaniamiento.tsx` y `FormularioIntervencion.tsx`
- BD (Sprint 14): enum `denuncias.tipo` solo con `corrupcion`, `negacion`
- Sprint 22 los retoma en v2

#### 7. Hechos 5000 → 8000 chars
- `DenunciaController@store`: `max:5000` → `max:8000`
- `RegistroDenuncia.tsx`: actualizar contador
- `denuncias.hechos` (BD Sprint 14): TEXT, documentar max 8000

### Archivos nuevos
- `app/Data/PermisosCatalogo.php`
- `app/Helpers/UppercaseText.php`
- `resources/js/permissions.ts`
- `resources/js/hooks/useCan.ts`
- `resources/js/Components/Can.tsx`
- `resources/js/Components/Denuncias/ModalEditarDenuncia.tsx`
- `resources/js/Components/Denuncias/ModalConciliarFechas.tsx`

### Archivos a modificar
- `app/Http/Controllers/DenunciaController.php` (+editar, +eliminar, +conciliarFechas, modificar `rechazar`, modificar `store`)
- `app/Data/DenunciaData.php` (+editar, +eliminar, +conciliarFechas, modificar `rechazar`)
- `app/Data/SesionUsuarioData.php` (+permisos[] por usuario)
- `app/Http/Middleware/HandleInertiaRequests.php` (compartir permisos)
- `resources/js/Components/Layout/Sidebar.tsx` (refactor: chequeo por permisos)
- `resources/js/Components/Layout/Header.tsx` (refactor: chequeo por permisos)
- `resources/js/Components/Layout/SelectorUsuarioDemo.tsx` (mostrar permisos al hover)
- `resources/js/Pages/Denuncias/RegistroDenuncia.tsx` (quitar acomp/intervención, 8000 chars)
- `resources/js/Pages/Denuncias/Bandeja.tsx` (+botones editar/eliminar/conciliar en `ingresada`)
- `resources/js/Pages/Denuncias/MisCasos.tsx` (+botón editar en `ingresada`)
- `resources/js/Components/Denuncias/ModalRechazo.tsx` (Sprint 7.A — SITPRECO opcional)
- `resources/js/Components/Denuncias/ModalNotificarDescargo.tsx` (medio libre)
- `resources/js/Components/Denuncias/ModalNuevaSolicitud.tsx` (+date picker `fecha_envio`)
- `resources/js/Components/Denuncias/ModalResponderSolicitud.tsx` (+date picker `fecha_respuesta`)
- `resources/js/Components/Denuncias/FormularioAcompaniamiento.tsx` (ELIMINAR)
- `resources/js/Components/Denuncias/FormularioIntervencion.tsx` (ELIMINAR)
- `app/Http/Controllers/SolicitudController.php` (modificar `store`, `responder`)
- `app/Data/SolicitudData.php` (modificar `add`, `responder`)
- `app/Http/Controllers/DescargoController.php` (modificar `notificar`)
- `app/Data/DescargoData.php` (modificar `notificar`)

### shadcn a instalar
- `dropdown-menu` (para `useCan` en componentes)

### Estimación
3-4 días.

### Detalle completo
Ver `Sprint 7.5 - Ajustes UX Urgentes pre-cliente.md`.

---

## Sprint 7.6 — Repositorio de Archivos del Caso ⏳ URGENTE (Julio 2026)

**Estado:** Pendiente. Urgente pre-cliente.
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
- `denuncias_archivos` (nuevo, Sprint 14) será el repositorio libre
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

### BD (Sprint 14)
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

## Sprint 7.7 — Búsqueda y Consulta para Registrador ⏳ URGENTE (Julio 2026)

**Estado:** Pendiente. Urgente pre-cliente.
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

## Sprint 10 — Panel Administración Catálogos + Subcategorías

**Estado:** Pendiente.
**Origen:** Respuesta del cliente #18.

### Resumen
Panel administrativo único para **CRUD de todos los catálogos** del sistema. Cada catálogo es editable desde aquí, no hardcodeado en código.

### Catálogos a administrar
- **Clasificaciones finales:** Penal, Civil, Administrativo, Sin Indicios, Medida Correctiva, Archivado
- **Categorías** de denuncia
- **Subcategorías** de denuncia (por tipo, ej. Corrupción → [Soborno, Nepotismo, ...])
- **Tipos de denuncia:** Corrupción, Negación de Información
- **Estados:** ingresada, evaluación técnica, admitida, rechazada, asignada, investigación, informe, cerrada
- **Medios de notificación:** whatsapp, email, presencial, otro
- **Tipos de prueba:** archivo, prueba física, testigo
- **Dependencias/unidades externas**

### Configuración de alertas por usuario (NUEVO — Julio 2026)
Cada usuario (Jefe y Técnicos) podrá configurar los días de anticipación para recibir notificaciones:
- Plazo total del caso: default 3 días
- Informe final: default 3 días
- Solicitud de información: default 2 días
- Descargo de denunciados: default 2 días

**UI:** Sliders/inputs numéricos con preview de simulación. Persistencia en sesión (mock) luego en BD (Sprint 14).

**Archivo adicional:**
- `resources/js/Pages/Admin/PreferenciasAlertas.tsx` (nuevo)

### Subcategorías
- Cada tipo de denuncia tiene sus propias subcategorías
- Definidas en este panel
- Seleccionables en formulario de registro
- Consideración: el gráfico de subcategorías puede tener muchas opciones → manejar con cuidado

### Archivos a crear
- `resources/js/Pages/Admin/Catalogos.tsx`
- `app/Data/CatalogoData.php`
- `app/Http/Controllers/CatalogoController.php`
- `resources/js/Components/Admin/TablaCatalogo.tsx`
- `resources/js/Components/Admin/ModalEditarItem.tsx`

### Archivos a modificar
- `resources/js/Pages/Denuncias/RegistroDenuncia.tsx` (cargar subcategorías del catálogo)

### Nota — Julio 2026
**Feriados ahora también se administran aquí.** Aunque Sprint 18 formaliza el helper `DiasHabiles`, la **UI de administración de feriados** (cuadrícula calendario anual) vive en este panel. El Jefe de Unidad marca/desmarca feriados desde aquí. Esto adelanta parte del Sprint 18 a este sprint.

**Archivo adicional:**
- `resources/js/Pages/Admin/Feriados.tsx` (creado, ver Sprint 0 — ya existe como placeholder)

---

## Sprint 11 — Dashboard + KPIs + Reportes PDF/Excel

**Estado:** Pendiente (será uno de los últimos sprints a reestructurar).
**Origen:** Respuestas del cliente #15, #16, #17, #21.

### Resumen
Dashboard con **KPIs** y **gráficos**, más página de **reportes** con tabla + filtros + **exportación PDF/Excel**.

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

## Sprint 12 — Tablero Público Cerrados

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

## Sprint 13 — Tiempos entre Fases

**Estado:** Pendiente.
**Origen:** Respuesta del cliente #19.

### Resumen
Métricas de **duración promedio entre fases** del proceso. Útil para identificar cuellos de botella.

### Métricas
- Recepción → Admisión (días promedio)
- Admisión → Asignación
- Asignación → Primera solicitud/descargo
- Inicio investigación → Informe Final
- Informe → Cierre

### Complejidad
Baja si los timestamps están en mock data. Sería solo una vista tabular sin gráficos dedicados.

### Archivos a crear
- `resources/js/Components/Dashboard/TiemposEntreFases.tsx`

### Archivos a modificar
- `app/Http/Controllers/ReporteController.php` (+método tiemposEntreFases)

---

## Sprint 14 — Base de datos real (MySQL)

**Estado:** Pendiente (al final del proyecto).
**Origen:** Respuestas del cliente #24, #29.

### Resumen
Migrar de mocks a base de datos MySQL real con migraciones, modelos Eloquent y seeders.

### Actividades
- Diseñar esquema de BD
- Crear migraciones
- Crear modelos Eloquent con relaciones
- Crear seeders (migrar seeds mock)
- Refactorizar controllers (reemplazar `*Data.php` por queries Eloquent)
- Configurar `.env` con MySQL de Laragon

### Tablas principales
denuncias, denunciantes, denunciados, solicitudes, descargos, evaluaciones, informes, cierres, bitácora, usuarios, feriados, notificaciones, catálogos, ampliaciones, subcategorías

### Dependencias
Sprint 15 (Roles) y siguientes dependen de este sprint.

---

## Sprint 15 — Roles y Permisos (Registrador / Jefe / Técnico)

**Estado:** Pendiente (casi al final del proyecto).
**Origen:** Respuesta del cliente #23.

### Resumen
Implementar sistema de roles y permisos usando Laravel middleware y policies. Solo se implementa **una vez que la BD esté operativa** (Sprint 14).

### Roles
- **Registrador** (antes "Recepcionista"): registra denuncias
- **Jefe de Unidad:** ve todo, admite/rechaza, asigna, delega, traspasa, reabre, ve reportes
- **Técnicos:** solo ve sus casos asignados, gestiona investigación e informe

### Actividades
- Definir los 3 roles
- Crear `RoleMiddleware` para rutas
- Crear policies por modelo
- Refactorizar bandejas para restricción por rol

### Nota — Julio 2026
**Reemplaza la simulación del Sprint 6.5.** Cuando se implementen roles reales:
1. Eliminar `SelectorUsuarioDemo.tsx` del Header
2. Reemplazar `session('demo_user_id')` por `Auth::user()`
3. El Sidebar y los controllers **no requieren cambios**: la lógica de filtrado por `user.rol` es la misma
4. Cero código desechable — el patrón de Sprint 6.5 fue diseñado para esto

### Dependencias
Requiere Sprint 14 (BD).

---

## Sprint 16 — Auditoría Backend Detallada

**Estado:** Pendiente (al final del proyecto).
**Origen:** Respuesta del cliente #26.

### Resumen
Auditoría automática de todos los cambios usando **`owen-it/laravel-auditing`**. La auditoría actual (mock) es suficiente; esta es la auditoría formal en backend.

### Actividades
- Instalar `composer require owen-it/laravel-auditing`
- Aplicar trait `Auditable` a modelos relevantes
- Configurar qué campos auditar
- Crear vista de auditoría (consulta por caso o por usuario)

### Modelos a auditar
Denuncia, Solicitud, Descargo, Evaluación, Informe, Cierre

### Dependencias
Requiere Sprint 14 (BD).

---

## Sprint 17 — Panel de Usuario (Perfil + Seguridad + Preferencias + Apariencia) (NUEVO — Julio 2026)

**Estado:** Pendiente (post-Sprint 16).
**Origen:** Decisión #40 (reunión Julio 2026).

### Resumen
Panel completo de usuario con secciones de perfil, seguridad, preferencias de notificación y apariencia. Estilo Laravel Breeze pero en mock (sin BD real, usando sesión).

Se implementa después de tener la BD (Sprint 14), los roles (Sprint 15) y la auditoría (Sprint 16) — porque depende de ellos para persistencia real.

### Secciones

#### 1. Perfil
- Avatar/iniciales (read-only)
- Nombre completo (editable)
- Email de contacto (editable)
- Teléfono (editable)
- Botón "Guardar cambios"

#### 2. Seguridad
- Cambiar contraseña: 3 campos (actual, nueva, confirmar)
- Validación de fortaleza
- Mock: no verifica la actual, solo simula
- Botón "Actualizar contraseña"

#### 3. Preferencias de notificación
| Tipo de alerta | Default | Rango |
|---|---|---|
| Plazo total del caso por vencer | 3 días | 0-10 |
| Informe final por vencer | 3 días | 0-10 |
| Solicitud de información por vencer | 2 días | 0-10 |
| Descargo de denunciados por vencer | 2 días | 0-10 |

- Switch master: ¿Recibir notificaciones?
- Switch individual por tipo
- Sliders/inputs numéricos

#### 4. Apariencia
- Modo oscuro/claro (ya funciona vía localStorage)
- Idioma (mock: solo español, selector visible)

### Archivos a crear
- `app/Data/PreferenciasUsuarioData.php` (mock data layer)
- `app/Http/Controllers/UserPanelController.php` (CRUD perfil + preferencias)
- `app/Helpers/NotificacionesConfig.php` (aplica preferencias al filtrado)
- `resources/js/Pages/User/Perfil.tsx`
- `resources/js/Pages/User/Seguridad.tsx`
- `resources/js/Pages/User/Preferencias.tsx`
- `resources/js/Pages/User/Apariencia.tsx`
- `resources/js/Layouts/UserPanelLayout.tsx`

### Archivos a modificar
- `app/Http/Controllers/NotificacionController.php` (usar preferencias)
- `routes/web.php` (rutas del panel)
- `app/Http/Middleware/HandleInertiaRequests.php` (compartir preferencias)
- `resources/js/Components/Layout/Sidebar.tsx` (+ item "Mi Cuenta")
- `resources/js/Components/Layout/Header.tsx` (avatar → link al panel)

### Dependencias
- Sprint 14 (BD) para persistencia real
- Sprint 15 (Roles) para asociar preferencias a usuarios
- Sprint 16 (Auditoría) para registrar cambios

---

## Sprint 18 — Lógica de Mora Explícita

**Estado:** Pendiente.
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
Sprint 14 (BD) si se persiste, opcional si solo se calcula on-the-fly.

---

## Sprint 19 — Calendario Feriados + Días Hábiles

**Estado:** Pendiente (sprint formal de cierre del sistema de plazos).
**Origen:** Pregunta #6 (C1) — **decisión tomada en Julio 2026**.

### ⚠️ Decisión: Días hábiles UNIVERSAL
La reunión de Julio 2026 resolvió definitivamente la pregunta #6:
- **Todos los plazos del sistema en días hábiles** (lunes a viernes, sin sábados, domingos ni feriados)
- El Jefe de Unidad administra los feriados desde el panel (UI adelantada a Sprint 10)
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
- Sprint 10 (Feriados UI — ya adelantada la interfaz)
- No requiere BD para mock (feriados en sesión igual que otras Data classes)
- Sprint 14 (BD) para persistencia formal

---

## Sprint 20 — Cierre Fase 1 / Ajustes Finales

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

## Sprint 21 — Archivos Grandes + Conectividad Inestable (NUEVO — Julio 2026)

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
- Sprint 14 (BD) para persistencia de referencias a archivos
- Sprint 15 (Auth) para asociar subidas a usuarios
- Sprint 19 (Cierre) completado antes de empezar

### Fuera de alcance
- Subida WebSocket en tiempo real
- CDN externo (decisión institucional)
- Almacenamiento en blockchain

---

## Sprint 22 — Acompañamiento e Intervención (v2) ⏸️ DIFERIDO

**Estado:** ⏸️ **Diferido a v2.** NO se implementa en Fase 0/1.

**Origen:** Decisión del cliente Julio 2026 — estas funcionalidades son extras opcionales, no son núcleo del objetivo del sistema (Ley 974 = denuncias de corrupción y negación de información). Se retomarán en una v2 cuando el MVP esté consolidado.

### Funcionalidades diferidas
- **Acompañamiento:** formulario propio con campos `nombres`, `ci`, `unidad_involucrada`, `motivo_reclamo`, `resolucion_acuerdo`.
- **Intervención / Medida Correctiva:** formulario propio con `unidad_observada`, `motivo_patron`, `referencia_nota`, `archivo`.

### Estado actual (Fase 0)
- El dropdown selector de tipo (`RegistroDenuncia.tsx`) actualmente tiene 2 opciones (corrupción, negación). En v2 se reagregan 2 opciones.
- Los archivos `FormularioAcompaniamiento.tsx` y `FormularioIntervencion.tsx` se eliminan en Sprint 7.5.
- El enum `denuncias.tipo` en BD (Sprint 14) actualmente solo tiene `corrupcion`, `negacion`. En v2 se agregan `acompaniamiento`, `intervencion`.

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

## Sprint 23 — Migración de Casos Legacy ⏸️ DIFERIDO

**Estado:** ⏸️ **Diferido.** Detalle a definir en Sprint 14 (BD real). Anotación temprana para no perder el requerimiento.

**Origen:** Duda del cliente Julio 2026 — la UTLCC tiene actualmente **46 denuncias físicas** que necesitan migrarse al sistema nuevo. Casos legacy no tendrán historial (bitácora) pero sí opción de digitalizar archivos.

### Funcionalidades planificadas (a detalle en Sprint 14)
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
- Sprint 14 (BD) para crear tabla y campo
- Sprint 10 (Panel Admin) para configurar `siguiente_numero`

### Estimación (referencia)
2-3 días. A refinar cuando se defina Sprint 14.

### Detalle completo
Ver `Sprint 23 - Migración de Casos Legacy (diferido).md`.

---

## Sprint 24 — Permisos Personalizados (v2) ⏸️ DIFERIDO

**Estado:** ⏸️ **Diferido a v2.** NO se implementa en Fase 0/1.

**Origen:** Duda del cliente Julio 2026 — ¿se necesita un panel de control para dar distintos tipos de permisos a ciertos usuarios o edición de permisos a roles?

### Decisión tomada (Julio 2026)
- **Fase 0/1:** 3 roles fijos (Registrador, Jefe, Técnico) con permisos hardcodeados en el catálogo (Sprint 7.5) y formalizados en Sprint 15.
- **NO se implementa** un panel de control de permisos granulares por usuario.
- Si en el futuro se requiere granularidad, Sprint 24+ (v2) lo abordará con librería tipo `spatie/laravel-permission`.

### Razón
Mantener el sistema simple y predecible en la primera versión. La experiencia ha mostrado que la mayoría de usuarios encajan en uno de los 3 roles.

### Cambios en v2 (cuando se reactive)
- Instalar `spatie/laravel-permission` u otro similar
- Crear UI de administración de permisos
- Refactor de `SesionUsuarioData` para cargar permisos por usuario
- Refactor de todos los chequeos de permisos

### Estimación (referencia v2)
3-5 días.

### Detalle completo
Ver `Sprint 24 - Permisos Personalizados v2 (diferido).md`.

---

*Última actualización: Julio 2026.*
