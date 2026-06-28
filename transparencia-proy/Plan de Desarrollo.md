#transparencia
# 📋 Plan de Desarrollo — Sistema de Gestión de Denuncias (UTLCC)

> **Propósito:** Documentar la hoja de ruta, sprints, decisiones técnicas y arquitectura del proyecto. Este archivo se irá actualizando a medida que avance el desarrollo.

---

## Stack Tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Backend | Laravel | 11.x |
| Bridge | Inertia.js | v2 |
| Frontend | React | 18.x |
| Lenguaje | TypeScript | Latest |
| Estilos | Tailwind CSS | v3 (no v4) |
| Componentes UI | shadcn/ui | 2.3.0 |
| Autenticación | Laravel Breeze (React + TS) | Latest |
| Base de Datos | MySQL (postergada a Fase 1) | Latest |
| Entorno Local | Laragon | Latest |
| Bundler | Vite | Latest |

---

## Estado Actual (Fase 0 — Maqueta Frontend Funcional)

### Ya implementado
- ✅ Laravel 11 + Breeze (autenticación Inertia + React + TypeScript)
- ✅ Tailwind CSS v3 con variables OKLCH (colores institucionales: morado `#690bb2` / amarillo `#fecd2a`)
- ✅ shadcn/ui configurado (New York style)
- ✅ Componentes shadcn instalados: `button`
- ✅ Página `DesignSystem.tsx` — paleta de colores y componentes base
- ✅ Tipografía: Outfit (sans) + Fira Code (mono)
- ✅ Layouts de Breeze (AuthenticatedLayout, GuestLayout)
- ✅ AppLayout personalizado (Header + Sidebar + Footer)
- ✅ Modo oscuro vía CSS variables + localStorage
- ✅ Routing básico: Welcome, Dashboard (vacío), DesignSystem, Auth
- ✅ Archivos de planificación en `transparencia-proy/` (8 documentos de especificación)
- ✅ Sprint 4: Investigación con Solicitudes/Descargos autónomos, Sheet con Tabs, SaltarFaseButton

---

## Estrategia de Datos (Fase 0)

**No hay base de datos.** Los controladores Laravel sirven datos mock (arrays PHP) directamente a React vía Inertia.

```
PHP Controller (mock array) → Inertia → React Page (props)
                                                ↓
                                        Componentes hijos (props)
                                                ↓
                                  Acciones → router.post() → Controller (mock)

app/Data/          ← Clases estáticas con datos de prueba
app/Helpers/       ← Funciones auxiliares (días hábiles)
```

Los datos mock viven en `app/Data/` como clases con métodos estáticos que devuelven colecciones. Cuando se conecte la BD real (Fase 1), solo cambia la fuente de datos en los controladores; los componentes React no se modifican.

---

## Roles (Manejo durante la maqueta)

Durante la Fase 0 **no hay diferenciación por roles en el código**. Todos los usuarios autenticados ven todas las pantallas. El cliente validará verbalmente qué funcionalidad corresponde a cada rol:

- **Recepcionista:** Registrar denuncias
- **Jefe de Unidad:** Kanban general, admisión/rechazo, asignación, reportes, feriados
- **Técnico:** Kanban personal, detalle de caso, solicitudes, descargos, informe, cierre
- **Administrador:** El Jefe de Unidad cumple este rol (gestión de feriados)

Los roles se implementarán formalmente en la Fase 1 (conexión a BD).

---

## Sprints

### Sprint 0 — Imagen Institucional (Sidebar + Header) ✅ COMPLETADO

**Objetivo:** Identidad visual del sistema con marca GAMEA.

| Archivo | Cambio |
|---------|--------|
| `resources/js/Components/Layout/InstitutionalLogo.tsx` (nuevo) | Escudo SVG placeholder con texto GAMEA / UTLCC / EL ALTO |
| `resources/js/Components/Layout/Sidebar.tsx` | Refactor: logo GAMEA, 5 ítems del sistema con iconos lucide-react, navegación con Inertia `<Link>`, active state por ruta |
| `resources/js/Components/Layout/Header.tsx` | Refactor: nombre completo de institución, dropdown de usuario, notificaciones, toggle de tema |
| `resources/js/Components/Layout/AppLayout.tsx` | Simplificado, integra auth desde Inertia, sidebar por defecto expandido |
| `resources/js/Pages/Dashboard.tsx` | Refactor con accesos rápidos + placeholders de KPIs |
| `resources/js/Pages/Denuncias/Kanban.tsx` (nuevo) | Placeholder Sprint 2 |
| `resources/js/Pages/Denuncias/RegistroDenuncia.tsx` (nuevo) | Placeholder Sprint 1 |
| `resources/js/Pages/Reportes/Index.tsx` (nuevo) | Placeholder Sprint 7 |
| `resources/js/Pages/Admin/Feriados.tsx` (nuevo) | Placeholder Sprint 8 |
| `resources/js/Pages/Seguimiento/Buscar.tsx` (nuevo) | Placeholder público Sprint 6 |
| `routes/web.php` | Estructura completa de rutas: públicas, autenticadas, agrupadas por dominio |

**shadcn a instalar:** ninguno

**Decisiones técnicas Sprint 0:**
- Sidebar usa `usePage().url` para detectar la ruta activa (sin prop drilling)
- Logo institucional como SVG inline (sin archivo externo, fácil de actualizar)
- Active state del sidebar: exacto para `/dashboard`, `startsWith` para las demás
- User dropdown con `useRef` + click outside para cerrarse
- Rutas agrupadas con `Route::prefix()` y `->name()` para nombres limpios

---

### Sprint 1 — Registro de Denuncia ✅ COMPLETADO

**Objetivo:** Formulario completo de registro con 3 variantes según tipo de denuncia.

#### 1A. Dropdown selector de tipo

La página `RegistroDenuncia.tsx` tiene un dropdown `<Select>` en la parte superior con opciones:
- Corrupción (Plazo: hasta 45 días)
- Negación de Información (Plazo: hasta 20 días)
- Acompañamiento (Resolución en el momento)
- Intervención / Medida Correctiva

Al seleccionar, se renderiza el formulario correspondiente.

#### 1B. Formulario Complejo (Corrupción / Negación de Información)

**Secciones del formulario:**

| Sección | Campos | Componente |
|---------|--------|------------|
| Encabezado | Fecha auto (solo lectura) + texto "N° se generará al enviar" | `SeccionEncabezado.tsx` |
| Confidencialidad | Toggle SÍ/NO + tooltip si SÍ | `SeccionConfidencialidad.tsx` |
| Denunciante | Nombres, CI, Email, Teléfono | `SeccionDenunciante.tsx` |
| Denunciado(s) | Bloque dinámico: switch "¿Conoce identidad?", inputs condicionales, +Añadir, borrar | `BloqueDenunciado.tsx` |
| Detalles Incidente | Categoría (select), Fecha, Hora, Lugar | `SeccionDetalles.tsx` |
| Relación Hechos | Textarea grande con placeholder guía | `SeccionRelacionHechos.tsx` |
| Pruebas/Testigos | Bloque dinámico: tipo (select: Archivo / Prueba Física / Testigo), inputs condicionales, +Añadir | `BloquePrueba.tsx` |
| Pie | Checkbox declaración jurada + Botón Enviar | `PieFormulario.tsx` |

**Lógica del BloqueDenunciado:**
- Switch principal: "¿Conoce la identidad de esta persona?" — SÍ / NO
- SÍ → muestra campos: Nombres y Apellidos + Cargo y/o área de trabajo
- NO → muestra: Descripción física y vestimenta (textarea)
- Botón "+ Añadir otro denunciado" — genera nuevo bloque independiente
- Cada bloque tiene icono de basurero para eliminarlo

**Lógica del BloquePrueba:**
- Select Tipo de Evidencia: Archivo / Prueba Física / Testigo
- Archivo → upload + descripción obligatoria
- Prueba Física → solo descripción (sin upload)
- Testigo → Nombre del Testigo + Teléfono de Contacto
- Botón "+ Añadir otra prueba/testigo"
- Cada bloque tiene icono de basurero

#### 1C. Formulario Acompañamiento

| Campo | Tipo |
|-------|------|
| Nombres y Apellidos | Texto |
| Cédula de Identidad | Texto (opcional) |
| Unidad o Funcionario Involucrado | Texto |
| Motivo del Reclamo | Textarea |
| Resolución / Acuerdo | Textarea |
| Evidencia | Upload (opcional) |

#### 1D. Formulario Intervención / Medida Correctiva

| Campo | Tipo |
|-------|------|
| Unidad Observada o Denunciada | Texto |
| Motivo / Descripción del Patrón | Textarea |
| Archivo Adjunto | Upload (obligatorio) |
| Referencia de la Nota | Texto |

#### Backend mock

| Archivo | Descripción |
|---------|-------------|
| `app/Data/DenunciaData.php` | Colección de denuncias + almacenamiento en sesión mock |
| `app/Http/Controllers/DenunciaController.php` | `create()` → selector, `store()` → guarda mock y devuelve ticket |

**Rutas:**
```
GET  /denuncias/registrar  → RegistroDenuncia.tsx
POST /denuncias            → DenunciaController@store
```

**shadcn a instalar:**
```bash
npx shadcn@2.3.0 add switch radio-group checkbox calendar popover textarea select input label separator sonner
```

---

### Sprint 2 — Bandeja de Admisión + Mis Casos + Mi Resumen ✅ COMPLETADO

**Objetivo:** Reemplazar Kanban por modelo de pestañas por fase. Jefe admite/rechaza, Técnico ve y avanza sus casos.

#### Páginas creadas

| Archivo | Descripción |
|---------|-------------|
| `Pages/Denuncias/Bandeja.tsx` | 5 tabs: Por admitir, Por asignar, En curso, Historial, Visión general (6 ContadorCards) |
| `Pages/Denuncias/MisCasos.tsx` | 4 tabs: Bandeja de entrada, Investigación, Informe Final, Cierre + Dropdown "Ver como:" |
| `Pages/Denuncias/MiResumen.tsx` | 4 ContadorCards: Activos, Vencidos, Por vencer, Cerrados + Dropdown "Ver como:" |

#### Componentes creados

| Archivo | Descripción |
|---------|-------------|
| `PlazoBadge.tsx` | Verde (>5d) / Amarillo (≤5d) / Rojo (vencido) |
| `TipoDenunciaBadge.tsx` | Badge por tipo con color distinto |
| `SubestadoBadge.tsx` | Badge "Archivada" |
| `ContadorCard.tsx` | Card con label + número + icono |
| `TabsDenuncias.tsx` | Wrapper de shadcn Tabs con estilos institucionales |
| `ListaVacia.tsx` | Empty state bonito con icono |
| `DenunciaCard.tsx` | Card base con punto de color por plazo, click → Sheet |
| `DenunciaSheet.tsx` | Sheet lateral con detalle completo de la denuncia |
| `ModalAdmision.tsx` | Dialog con justificación opcional |
| `ModalRechazo.tsx` | Dialog con justificación obligatoria (mín 10 caracteres) |

#### Controladores creados

| Archivo | Descripción |
|---------|-------------|
| `app/Http/Controllers/BandejaController.php` | `index()` → denuncias ingresadas, porAsignar (admitidas), rechazadas, contadores |
| `app/Http/Controllers/MisCasosController.php` | `index(tecnico)` → denuncias agrupadas por estado |
| `app/Http/Controllers/MiResumenController.php` | `index(tecnico)` → contadores personales del técnico |

#### Backend modificado

| Archivo | Cambio |
|---------|--------|
| `app/Data/DenunciaData.php` | Añadidos: TECNICOS_MOCK, métodos (getByEstado, getByTecnico, find, admitir, rechazar, iniciarInvestigacion, seedDemoData, getContadores, getContadoresTecnico, getPlazoInfo). Seed de 12 denuncias demo. |
| `app/Http/Controllers/DenunciaController.php` | Añadidos: admitir(), rechazar(), iniciarInvestigacion() |
| `routes/web.php` | Nuevas rutas: /denuncias (GET Bandeja), /{ticket}/admitir, /{ticket}/rechazar, /{ticket}/iniciar, /mis-casos, /mi-resumen |

#### Layout modificado

| Archivo | Cambio |
|---------|--------|
| `Components/Layout/Sidebar.tsx` | Eliminar "Tablero Kanban". Añadir "Bandeja de Admisión", "Mis Casos [Técnico]", "Mi Resumen [Técnico]" |
| `Pages/Dashboard.tsx` | Actualizar link de Kanban → Bandeja de Admisión |
| `Pages/Denuncias/Kanban.tsx` | ELIMINADO (era placeholder) |

**shadcn instalados:** `badge`, `card`, `avatar`, `tabs`, `dialog`, `sheet`

---

### Sprint 3 — Asignación de Técnico + Traspaso + Reapertura + Mejoras Detalle ✅ COMPLETADO

**Objetivo:** Asignación de técnico con carga de trabajo, traspaso entre técnicos, reapertura de denuncias cerradas/rechazadas, y mejoras visuales en detalle.

#### Componentes creados

| Archivo | Descripción |
|---------|-------------|
| `Components/Denuncias/AsignacionModal.tsx` | Modal con lista de técnicos mock y carga de trabajo visible (activos, por vencer, vencidos) |
| `Components/Denuncias/TecnicoCargaCard.tsx` | Card clickeable por técnico con indicadores de carga |
| `Components/Denuncias/TraspasoModal.tsx` | Modal con select de técnico destino + justificación obligatoria (mín 10 chars) |
| `Components/Denuncias/ReabrirModal.tsx` | Modal con datepicker de nueva fecha límite + justificación (mín 20 chars) |

#### Componentes modificados

| Archivo | Cambio |
|---------|--------|
| `DenunciaSheet.tsx` | Nuevas secciones: Admisión (fecha+justificación), Rechazo (fecha+justificación), Técnico Asignado (avatar+fecha+historial traspaso), Reapertura (fecha+justificación). "Bitácora" renombrado a "Historial del caso" (timeline últimas acciones) |
| `DenunciaCard.tsx` | Rediseño 3 filas + acción: categoría en TipoDenunciaBadge, técnico con nombre, fecha contextual por etapa, highlight NUEVO para < 24h, borde izquierdo primario para nuevos, labels explícitos "Denunciante:" / "Asignado a:", badge "Reasignado" en traspasos recientes (< 7 días) |
| `PlazoBadge.tsx` | Tooltip con fecha exacta de vencimiento, textos "Vence hoy" y "Vencida hace Xd" |

#### Backend creado/modificado

| Archivo | Cambio |
|---------|--------|
| `app/Data/DenunciaData.php` | Nuevos campos: `justificacion_traspaso`, `fecha_traspaso`, `tecnico_anterior`, `fecha_reapertura`, `justificacion_reapertura`, `plazo_reapertura`, `fecha_rechazada`, `bitacora[]`. Nuevos métodos: `asignarTecnico()`, `traspasar()`, `reabrir()`, `getCargaTecnicos()`, `getBitacora()`. Todas las acciones registran en historial automáticamente. |
| `app/Http/Controllers/DenunciaController.php` | Nuevos métodos: `asignar()`, `traspasar()`, `reabrir()`, `cargaTecnicos()` |
| `BandejaController.php` | Envía `cargaTecnicos` como prop para AsignacionModal |

#### Rutas nuevas
```
POST /denuncias/{ticket}/asignar    → asignar()
POST /denuncias/{ticket}/traspasar  → traspasar()
POST /denuncias/{ticket}/reabrir    → reabrir()
GET  /denuncias/carga-tecnicos      → cargaTecnicos()
```

#### shadcn instalados
```bash
npx shadcn@2.3.0 add tooltip progress scroll-area
```

#### Páginas modificadas
| Archivo | Cambio |
|---------|--------|
| `Pages/Denuncias/Bandeja.tsx` | Tab "Por asignar" funcional: botón [Asignar técnico] abre AsignacionModal. Sheet con acciones contextuales (traspaso en asignada/investigacion/informe, reapertura en rechazada/cerrada). Nuevos estados modales. + Filtros (buscar ticket + tipo) + Sort (plazo/fecha/técnico) + Highlight NUEVO (< 24h en ingresada). |
| `Pages/Denuncias/MisCasos.tsx` | Pasa `tecnicos` a DenunciaCard (avatar). Badge Reasignado en cards traspasadas. + Sort (plazo/fecha/técnico) + Highlight NUEVO (< 24h en asignada). |

#### Decisiones del Sprint
| Decisión | Opción elegida |
|----------|---------------|
| Reapertura → estado destino | `ingresada` (pasa por admisión de nuevo) |
| Plazo al reabrir | Jefe define fecha manual (DatePicker) |
| Traspaso: historial | Técnico B ve todo el historial |
| Historial del caso visible en | Sección al pie del Sheet (últimas acciones) |
| Carga de técnicos | Prop inline desde BandejaController |
| Badge "Reasignado" | Visible 7 días desde el traspaso |

---

### Sprint 4 — Investigación (Solicitudes + Descargos + Saltar Fase + Mejoras) ✅ COMPLETADO (Junio 2026)

**Objetivo:** Refactor del Sheet a 3 tabs (Información/Solicitudes/Descargos). Gestión independiente de solicitudes a unidades externas y descargos de denunciados. Saltar fase con justificación. + **Mejoras**: Cancelar solicitud, Nuevo descargo manual, Detail modals con historial, CRUD editar/eliminar en todos los estados, Modal unificado create/edit, Soft delete.

#### Componentes creados

| Componente | Descripción |
|------------|-------------|
| `Components/Denuncias/TabSolicitudes.tsx` | Contenedor con lista única de solicitudes a unidades externas, ordenada por fecha_vencimiento asc |
| `Components/Denuncias/SolicitudCard.tsx` | Card con badge estado + unidad destino + PlazoProgress + botones contextuales |
| `Components/Denuncias/ModalNuevaSolicitud.tsx` | Select unidad (UnidadData) + textarea detalle + plazo legal 10 días informativo. **Modo dual**: prop `solicitudToEdit?` → edición. |
| `Components/Denuncias/ModalResponderSolicitud.tsx` | Textarea respuesta + mock upload archivos con ArchivoAdjunto |
| `Components/Denuncias/ModalAmpliarSolicitud.tsx` | Input días (max 5) + textarea justificación (mín 20) + mock archivo |
| `Components/Denuncias/ModalCancelarSolicitud.tsx` | Dialog cancelar solicitud pendiente/ampliada con motivo obligatorio (mín 10) |
| `Components/Denuncias/TabDescargos.tsx` | Contenedor con lista única de denunciados, ordenada por fecha_vencimiento asc |
| `Components/Denuncias/DescargoCard.tsx` | Card con avatar/iniciales denunciado + badge estado + PlazoProgress + botones |
| `Components/Denuncias/ModalNotificarDescargo.tsx` | DatePicker fecha notificación + select medio (Personal/Cédula/Email/Otro) + mock respaldo |
| `Components/Denuncias/ModalResponderDescargo.tsx` | Textarea resumen descargo + mock upload documentos |
| `Components/Denuncias/ModalAmpliarDescargo.tsx` | Input días (max 5) + textarea justificación (mín 20) |
| `Components/Denuncias/ModalNuevoDescargo.tsx` | Dialog crear descargo manual con select denunciados + switch "persona externa". **Modo dual**: prop `descargoToEdit?` → edición. |
| `Components/Denuncias/SaltarFaseButton.tsx` | Botón "Pasar a Informe Final" + modal justificación (mín 20) + warning items pendientes |
| `Components/Denuncias/PlazoProgress.tsx` | Progress bar shadcn con colores verde/amarillo/rojo + texto contextual |
| `Components/Denuncias/ArchivoAdjunto.tsx` | Visual ícono + nombre + tamaño simulado + botón "Ver". +prop `onEliminar?` con botón Trash2. |
| `Components/Denuncias/SolicitudDetailModal.tsx` | Dialog detalle completo: header, fechas, PlazoProgress, detalle, respuesta, motivo cancelación, archivos, ampliaciones, acciones, historial de cambios colapsable |
| `Components/Denuncias/DescargoDetailModal.tsx` | Dialog detalle descargo: notificación, medio, respaldo, resumen, documentos, ampliaciones, acciones, historial colapsable |
| `Components/Denuncias/ModalConfirmarEliminar.tsx` | Reusable: confirmación genérica soft-delete con alert-triangle + texto informativo |

#### Componentes eliminados

| Componente | Motivo |
|------------|--------|
| ~~`Components/Denuncias/ModalEditarSolicitud.tsx`~~ | Sustituido por ModalNuevaSolicitud (modo dual con prop `solicitudToEdit`) |
| ~~`Components/Denuncias/ModalEditarDescargo.tsx`~~ | Sustituido por ModalNuevoDescargo (modo dual con prop `descargoToEdit`) |

#### Componentes modificados

| Componente | Cambio |
|------------|--------|
| `DenunciaSheet.tsx` | **Refactor mayor**: Tabs shadcn (Información default, Solicitudes, Descargos). Tab Información = contenido actual completo. Tabs visibles solo si estado ∈ {asignada, investigacion, informe, cerrada}. Modo read-only en Bandeja. Badge de count en tabs. +4 props editar/eliminar. +break-words en hechos. |
| `SolicitudCard.tsx` | +onClick abre SolicitudDetailModal. Editar/Eliminar en TODOS los estados. |
| `DescargoCard.tsx` | +onClick abre DescargoDetailModal. Editar/Eliminar en TODOS los estados. |
| `ArchivoAdjunto.tsx` | +prop `onEliminar?: () => void` con botón Trash2 rojo |
| `TabSolicitudes.tsx` | +estado `detailSolicitudId`, renderiza SolicitudDetailModal, pasa callbacks editar/eliminar |
| `TabDescargos.tsx` | +estado `detailDescargoId`, renderiza DescargoDetailModal, pasa callbacks |
| `Bandeja.tsx` | +estados modales editar/eliminar, router.post para delete, toast |
| `MisCasos.tsx` | +estados modales editar/eliminar, router.post para delete, toast |

#### Backend creado

| Archivo | Descripción |
|---------|-------------|
| `app/Data/UnidadData.php` | Catálogo de 12 unidades GAMEA + Ministerio de Justicia |
| `app/Data/SolicitudData.php` | Sesión `solicitudes_mock`. CRUD: add, responder, ampliar, getByTicket, getById, editar, eliminar. Campos: ediciones[], eliminado, fecha_eliminacion. |
| `app/Data/DescargoData.php` | Sesión `descargos_mock`. CRUD: add, notificar, responder, ampliar, getByTicket, getById, editar, eliminar. Campos: ediciones[], eliminado, fecha_eliminacion. |
| `app/Http/Controllers/SolicitudController.php` | store, responder, ampliar, editar, eliminar con validaciones |
| `app/Http/Controllers/DescargoController.php` | store, notificar, responder, ampliar, editar, eliminar con validaciones |

#### Backend modificado

| Archivo | Cambio |
|---------|--------|
| `app/Data/DenunciaData.php` | Nuevos métodos: getSolicitudes(ticket), getDescargos(ticket), saltarFase(ticket, justificacion). Bitácora ampliada con acciones: solicitud_creada, solicitud_respondida, solicitud_ampliada, descargo_notificado, descargo_respondido, descargo_ampliado, saltar_fase. Seed actualizado con 3 solicitudes + 2 descargos demo. |
| `app/Http/Controllers/DenunciaController.php` | Nuevo método: saltarFase (justificación min 20, max 2000). Estado cambia de investigacion a informe. |
| `app/Http/Controllers/BandejaController.php` | Envía `solicitudesByTicket` y `descargosByTicket` (read-only, canAct=false) |
| `app/Http/Controllers/MisCasosController.php` | Envía `solicitudesByTicket` y `descargosByTicket` (con acciones, canAct=true) |

#### Rutas nuevas

```
POST /denuncias/{ticket}/solicitudes          → SolicitudController@store
POST /solicitudes/{id}/responder              → SolicitudController@responder
POST /solicitudes/{id}/ampliar                → SolicitudController@ampliar
POST /solicitudes/{id}/editar                 → SolicitudController@editar
POST /solicitudes/{id}/eliminar               → SolicitudController@eliminar
POST /denuncias/{ticket}/descargos            → DescargoController@store
POST /descargos/{id}/notificar                → DescargoController@notificar
POST /descargos/{id}/responder                → DescargoController@responder
POST /descargos/{id}/ampliar                  → DescargoController@ampliar
POST /descargos/{id}/editar                   → DescargoController@editar
POST /descargos/{id}/eliminar                 → DescargoController@eliminar
POST /denuncias/{ticket}/saltar-fase          → DenunciaController@saltarFase
```

#### Decisiones Sprint 4

| # | Decisión | Alternativa descartada | Motivo |
|---|----------|------------------------|--------|
| 1 | Sheet con Tabs (Información/Solicitudes/Descargos) | Mantener scroll único | 3 areas de trabajo, cada una con scroll propio |
| 2 | Solicitudes y Descargos independientes (una entrada por item) | Agrupar por denunciado | Cada trámite es independiente (plazos distintos, respuestas distintas) |
| 3 | Lista única con orden por fecha_vencimiento asc + PlazoProgress | Sub-tabs internos | Menos clics, progreso visual directo |
| 4 | Plazos en días naturales (Sprint 4) | Días hábiles | Sprint 8 ajustará con calendario feriados |
| 5 | Bandeja = read-only en Solicitudes/Descargos | Ocultar tabs en Bandeja | Jefe debe ver progreso; usa MisCasos + "Ver como:" para actuar |
| 6 | MisCasos = con acciones (canAct=true) | Sin acciones | El técnico asignado es quien gestiona |
| 7 | SaltarFase siempre pide justificación (mín 20 chars) | Solo si hay items pendientes | La ley exige justificación excepcional |
| 8 | Plazo legal solicitud = 10 días naturales | 15 o 30 | Art. 25 §I y III de Ley 974 |
| 9 | Plazo legal descargo = 10 días + 5 prórroga | 15 días fijo | Art. 25 §IV de Ley 974 |
| 10 | "Notificar a todos" en Descargos = atajo que abre modal único | Bucle automático | Cada denunciado puede tener medio distinto |
| 11 | Archivos: ícono + nombre + tamaño simulado + botón "Ver" | Solo texto | Mejor experiencia visual |
| 12 | Seed demo incluido en DenunciaData | Sin seed | Testing inmediato |
| 13 | Modal unificado create/edit en ModalNuevaSolicitud | 2 modales separados | DRY, mismo formulario pre-rellenado |
| 14 | SolicitudDetailModal muestra toda la info con acciones | SPA-like con "Volver" | No pierde contexto, consistente con otros modales |
| 15 | Soft delete (eliminado: true) | Hard delete | Preserva datos para auditoría futura con BD real |
| 16 | Editar/Eliminar en TODOS los estados | Solo pendiente | Permite corregir errores humanos en cualquier etapa |
| 17 | ediciones[] con campo + anterior + nuevo + fecha | Solo flag "editado" | Trazabilidad completa para auditoría |
| 18 | ArchivoAdjunto con onEliminar opcional | Componente separado | Reusabilidad, mismo look en todos los formularios |
| 19 | Botón papelera Trash2 (no checkbox) | Checkbox "quitar archivo" | UX clara, ícono universalmente reconocido |
| 20 | break-words (Tailwind, word-wrap: break-word) | break-all | Solo rompe cuando necesario, no en medio de palabras |
| 21 | Botones Editar/Eliminar en cards y detail modals | Solo en cards | Consistencia, dos formas de acceder al CRUD |

#### Nota a futuro — Dropdown "Ver como:" y auditoría

Cuando se implemente la BD real, las acciones realizadas en MisCasos con el dropdown "Ver como:" activo deben registrar el `usuario_id` real del actor (Jefe o Técnico), NO del técnico simulado por el dropdown.

Esto requiere modificar SolicitudData, DescargoData y los Controllers para aceptar y propagar el `usuario_id` desde la sesión autenticada de Laravel, no desde el parámetro `?tecnico=` de la URL.

En Fase 0 (mock, sin sesión real de usuarios individuales) esta diferenciación no es posible porque no hay autenticación granular. Todos los usuarios autenticados comparten la misma sesión. La bitácora de mock usa 'sistema' como usuario genérico.

---

### Sprint 5 — Informe Final + Cierre

**Objetivo:** Concluir el flujo de la denuncia.

| Componente | Descripción |
|------------|-------------|
| `TabInformeCierre.tsx` | Pestaña unificada con dos sub-secciones |
| `FormInformeFinal.tsx` | Clasificación (select: Penal/Civil/Administrativo/Sin Indicios/Medida Correctiva/Archivado), fojas, upload |
| `FormCierre.tsx` | SITPRECO, concluido por, descripción, notificación cierre |

---

### Sprint 6 — Seguimiento Público

**Objetivo:** Página pública sin autenticación para consultar ticket.

| Archivo | Descripción |
|---------|-------------|
| `Pages/Seguimiento/Buscar.tsx` | Página minimalista con input + botón |
| `BuscadorTicket.tsx` | Input grande + lupa |
| `ResultadoSeguimiento.tsx` | Timeline visual con datos no sensibles (fase actual, fechas estimadas) |
| `SeguimientoController.php` | Busca ticket en mock data |

**Ruta:** `GET /seguimiento` (sin middleware auth)

---

### Sprint 7 — Dashboard + Reportes

**Objetivo:** KPIs y gráficos.

| Archivo | Descripción |
|---------|-------------|
| `Pages/Dashboard.tsx` | Refactor completo con KPIs + gráficos |
| `KPICards.tsx` | 3 cards: Denuncias activas, Pendientes admisión, % Cumplimiento |
| `GraficosDashboard.tsx` | 3 gráficos con Recharts (barras, torta, líneas) |
| `Pages/Reportes/Index.tsx` | Tabla con filtros |
| `ReporteController.php` | Mock aggregated data |

**Dependencia:** `npm install recharts`

---

### Sprint 8 — Calendario Feriados + Plazos

**Objetivo:** Administrar feriados y visualizar cálculo de plazos legales.

| Archivo | Descripción |
|---------|-------------|
| `Pages/Admin/Feriados.tsx` | Cuadrícula de calendario anual, click para marcar/desmarcar feriados |
| `app/Data/FeriadoData.php` | Feriados mock |
| `app/Helpers/DiasHabiles.php` | Algoritmo de cálculo de días hábiles (Carbon + feriados) |
| `FeriadoController.php` | Mock CRUD feriados |
| Actualizar `PlazoBadge.tsx` | Integrar helper de días hábiles |

---

## Archivos del Proyecto

### Backend (PHP)

```
app/Data/
  DenunciaData.php          ← Colección de denuncias mock
  UsuarioData.php           ← Técnicos, jefe y recepcionista mock
  SolicitudData.php         ← Solicitudes de información mock (Sprint 4)
  DescargoData.php          ← Descargos de denunciados mock (Sprint 4)
  UnidadData.php            ← Catálogo de unidades externas (Sprint 4)
  FeriadoData.php           ← Feriados mock

app/Helpers/
  DiasHabiles.php           ← Algoritmo de cálculo de días hábiles

app/Http/Controllers/
  DenunciaController.php    ← CRUD + flujo de denuncias + saltarFase (Sprint 4)
  SolicitudController.php   ← CRUD Solicitudes (Sprint 4) + editar/eliminar (Mejoras)
  DescargoController.php    ← CRUD Descargos (Sprint 4) + editar/eliminar (Mejoras)
  SeguimientoController.php ← Búsqueda pública por ticket
  ReporteController.php     ← Datos agregados para dashboard
  FeriadoController.php     ← CRUD feriados (mock)
```

### Frontend (React + TypeScript)

```
resources/js/Pages/
  Denuncias/Bandeja.tsx             ← 5 tabs (Jefe) + props solicitudes/descargos
  Denuncias/MisCasos.tsx            ← 4 tabs (Técnico) + SaltarFaseButton
  Denuncias/MiResumen.tsx           ← 4 ContadorCards (Técnico)
  Denuncias/RegistroDenuncia.tsx
  Denuncias/DetalleDenuncia.tsx
  Seguimiento/Buscar.tsx
  Reportes/Index.tsx
  Admin/Feriados.tsx

resources/js/Components/
  Denuncias/
    DenunciaCard.tsx                ← Card clickeable con punto de plazo
    DenunciaSheet.tsx               ← Sheet con Tabs (Info/Solicitudes/Descargos)
    PlazoBadge.tsx                  ← Verde/Amarillo/Rojo
    TipoDenunciaBadge.tsx           ← Badge por tipo
    SubestadoBadge.tsx              ← Badge "Archivada"
    ContadorCard.tsx                ← Card con número + icono
    TabsDenuncias.tsx               ← Wrapper shadcn Tabs
    ListaVacia.tsx                  ← Empty state
    ModalAdmision.tsx               ← Admisión con justificación opcional
    ModalRechazo.tsx                ← Rechazo con justificación obligatoria
    AsignacionModal.tsx             ← Asignación con carga de trabajo (Sprint 3)
    TecnicoCargaCard.tsx            ← Card de técnico con indicadores (Sprint 3)
    TraspasoModal.tsx               ← Traspaso con justificación (Sprint 3)
    ReabrirModal.tsx                ← Reapertura con fecha manual (Sprint 3)
    FormularioComplejo.tsx          ← Formulario de Corrupción/Negación
    SeccionEncabezado.tsx
    SeccionConfidencialidad.tsx
    SeccionDenunciante.tsx
    BloqueDenunciado.tsx            ← Repetible: switch identidad conocido/no
    SeccionDetalles.tsx             ← Categoría, fecha, hora, lugar
    SeccionRelacionHechos.tsx
    BloquePrueba.tsx                ← Repetible: archivo/física/testigo
    PieFormulario.tsx
    ModalExito.tsx                  ← Confirmación con ticket
    FormularioAcompaniamiento.tsx
    FormularioIntervencion.tsx

    Sprint 4 — Nuevos:
    TabSolicitudes.tsx              ← Lista de solicitudes a unidades externas
    SolicitudCard.tsx               ← Card individual de solicitud (clickeable → detail modal)
    TabDescargos.tsx                ← Lista de descargos de denunciados
    DescargoCard.tsx                ← Card individual de descargo (clickeable → detail modal)
    PlazoProgress.tsx               ← Progress bar visual de plazo
    ArchivoAdjunto.tsx              ← Visual de archivo (ícono+nombre+tamaño+botón papelera)
    ModalNuevaSolicitud.tsx         ← Crear/Editar solicitud a unidad externa (modo dual)
    ModalResponderSolicitud.tsx     ← Responder solicitud recibida
    ModalAmpliarSolicitud.tsx       ← Ampliar plazo de solicitud
    ModalCancelarSolicitud.tsx      ← Cancelar solicitud con motivo obligatorio
    ModalNotificarDescargo.tsx      ← Notificar descargo a denunciado
    ModalResponderDescargo.tsx      ← Recibir descargo del denunciado
    ModalAmpliarDescargo.tsx        ← Ampliar plazo de descargo
    ModalNuevoDescargo.tsx          ← Crear/Editar descargo manual (modo dual)
    SaltarFaseButton.tsx            ← Botón "Pasar a Informe Final"
    SolicitudDetailModal.tsx        ← Modal detalle solicitud + historial colapsable
    DescargoDetailModal.tsx         ← Modal detalle descargo + historial colapsable
    ModalConfirmarEliminar.tsx      ← Confirmación genérica soft-delete

  Publico/
    BuscadorTicket.tsx
    ResultadoSeguimiento.tsx

  Reportes/
    KPICards.tsx
    GraficosDashboard.tsx
```

### Modificados

```
resources/js/Layouts/Sidebar.tsx                    → menú del sistema + logo GAMEA
resources/js/Layouts/Header.tsx                     → nombre de institución completo
resources/js/Pages/Dashboard.tsx                    → KPIs reales (refactor)
resources/js/Pages/Denuncias/Kanban.tsx             → ELIMINADO (reemplazado por Bandeja)
routes/web.php                                      → todas las rutas del sistema

--- Sprint 4 — Mejoras:
resources/js/Components/Denuncias/ModalEditarSolicitud.tsx  → ELIMINADO (absorbido por ModalNuevaSolicitud)
resources/js/Components/Denuncias/ModalEditarDescargo.tsx   → ELIMINADO (absorbido por ModalNuevoDescargo)
resources/js/Components/Denuncias/SolicitudCard.tsx          → +onClick detail modal, Editar/Eliminar todos estados
resources/js/Components/Denuncias/DescargoCard.tsx           → +onClick detail modal, Editar/Eliminar todos estados
resources/js/Components/Denuncias/ArchivoAdjunto.tsx         → +prop onEliminar (botón Trash2)
resources/js/Components/Denuncias/TabSolicitudes.tsx         → +detailSolicitudId, +callbacks editar/eliminar
resources/js/Components/Denuncias/TabDescargos.tsx           → +detailDescargoId, +callbacks editar/eliminar
resources/js/Components/Denuncias/DenunciaSheet.tsx          → +4 props (editar/eliminar), +break-words hechos
resources/js/Pages/Denuncias/Bandeja.tsx                     → +modales editar/eliminar, router.post, toast
resources/js/Pages/Denuncias/MisCasos.tsx                    → +modales editar/eliminar, router.post, toast
```

---

## shadcn Components a Instalar (por sprint)

| Sprint | Componentes |
|--------|-------------|
| 1 | `switch`, `radio-group`, `checkbox`, `calendar`, `popover`, `textarea`, `select`, `input`, `label`, `separator`, `sonner` |
| 2 | `badge`, `card`, `avatar`, `tabs`, `dialog`, `sheet` |
| 3 | `tooltip`, `progress`, `scroll-area` |
| 4 | — (reuso de tabs, sonner, dialog, sheet, select, textarea, input, label, badge, card, avatar, progress, calendar, popover, button, separator) |
| 5 | — |
| 7 | `table` |

---

## Notas

- Los plazos se calculan en días hábiles usando el calendario de feriados y el algoritmo basado en Carbon (ver `app/Helpers/DiasHabiles.php`)
- Las notificaciones al ciudadano son manuales (fuera del sistema). El funcionario registra fecha, medio y respaldo.
- El seguimiento público solo muestra datos no sensibles (fase actual, fechas estimadas).
- Los archivos adjuntos en la maqueta son simulados (no hay almacenamiento real).
