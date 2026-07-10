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
- ✅ Sprint 5: Informe Final + Cierre (6 endpoints, soft delete, historial ediciones)
- ✅ Sprint 6: Seguimiento Público (búsqueda por ticket+token, input plano, stepper visual, resumen_rechazo en ModalRechazo, modal éxito token, tokens determinísticos seed)

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

- **Registrador:** Registrar denuncias
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
| 4 | ~~Plazos en días naturales (Sprint 4)~~ **→ Plazos en días hábiles** (Julio 2026) | Días naturales (descartado) | Decisión Junio 2026 → Sprint 8. **Revisada Julio 2026: TODOS los plazos en días hábiles.** |
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

#### 📝 Actualizaciones post-cierre (Julio 2026)

Tras la reunión con el cliente, se aplican los siguientes cambios retroactivos al Sprint 4:

| Cambio | Detalle |
|--------|---------|
| **Días hábiles** | Todos los plazos pasan de naturales a hábiles (Lun-Vie, sin Sáb/Dom/feriados). |
| **Uploads eliminados** | Se quitan inputs de archivo de: Responder Solicitud, Notificar Descargo, Responder Descargo, Ampliar Solicitud. |
| **Umbrales reducidos** | Justificaciones y descripciones bajan de `min:10/20` a `min:5/10`. |
| **Campos opcionales** | CI, email, teléfono del denunciante (no anónimo) y dependencia del denunciado pasan a opcionales. |
| **Plazo configurable** | `plazo_dias` se mantiene como input configurable (default 10, rango 1-45 hábiles). No se fuerza valor fijo. |
| **Bug fix: max ampliación** | `SolicitudController@ampliar`: `max:45` → `max:5` (consistente con frontend y descargo). |
| **Evidencia Acompañamiento** | Campo `evidencia` eliminado del formulario. |
| **Archivo Intervención** | Campo `archivo` pasa de `required` a `nullable`. |

**Ver detalle completo:** `transparencia-proy/Preguntas para el cliente.md` → #31, #32, #36.

---

### Sprint 5 — Informe Final + Cierre ✅ COMPLETADO (Junio 2026)

**Objetivo:** Concluir el flujo de la denuncia con Informe Final + Cierre formal. Formularios embebidos (no modales) en 4to tab del DenunciaSheet. Backend con 6 endpoints. Soft delete y ediciones con historial.

#### Componentes creados

| Componente | Descripción |
|------------|-------------|
| `Components/Denuncias/ClasificacionBadge.tsx` | Badge reutilizable con 6 colores (Penal/Civil/Administrativo/Sin Indicios/Medida Correctiva/Archivado) |
| `Components/Denuncias/FormInformeFinal.tsx` | Formulario embebido con Select clasificación, Input fojas, Textarea justificación, Input concluido_por. Modo dual: preview + Editar/Eliminar si ya existe, formulario vacío si no. Historial de cambios colapsable. |
| `Components/Denuncias/FormCierre.tsx` | Formulario embebido con Input SITPRECO opcional, Checkbox "¿Se notificó al denunciante?" + condicionales (medio/fecha/descripción o motivo opcional), concluido_por, descripción, archivos mock. Warning si no hay informe previo. |
| `Components/Denuncias/TabInformeCierre.tsx` | Orquesta 2 sub-tabs shadcn (Informe Final / Cierre) + modal confirmar eliminación para informe/cierre |
| `Components/Denuncias/InformeDetailModal.tsx` | Modal read-only: header con clasificación, fojas, fechas, justificación, archivos, cierre expandible con SITPRECO/notificación/descripción/archivos |

#### Componentes modificados

| Componente | Cambio |
|------------|--------|
| `DenunciaSheet.tsx` | +4to tab "Informe y Cierre" (visible si estado ∈ {informe, cerrada}). +props `tecnicoNombre`. +imports y renders `TabInformeCierre`. |
| `DenunciaCard.tsx` | +badge `ClasificacionBadge` para denuncias cerradas + SITPRECO font-mono + fecha `cierre_cerrado_at` formateada |
| `MisCasos.tsx` | +prop `tecnicoNombre` en DenunciaSheet. Estado `informe` cambia de placeholder a "Informe pendiente" con icono ScrollText |
| `Bandeja.tsx` | +prop `tecnicoNombre` en DenunciaSheet |

#### Backend creado/modificado

| Archivo | Cambio |
|---------|--------|
| `app/Data/DenunciaData.php` | +24 campos nuevos (informe_*, cierre_*), +6 métodos (guardarInforme, editarInforme, eliminarInforme, guardarCierre, editarCierre, eliminarCierre), seed actualizado con 2 cerradas (informe+cierre+SITPRECO) |
| `app/Http/Controllers/DenunciaController.php` | +6 métodos: guardarInforme, editarInforme, eliminarInforme, guardarCierre, editarCierre, eliminarCierre con validaciones |

#### Rutas nuevas (6)

```
POST /denuncias/{ticket}/informe              → DenunciaController@guardarInforme
POST /denuncias/{ticket}/informe/editar       → DenunciaController@editarInforme
POST /denuncias/{ticket}/informe/eliminar     → DenunciaController@eliminarInforme
POST /denuncias/{ticket}/cierre               → DenunciaController@guardarCierre
POST /denuncias/{ticket}/cierre/editar        → DenunciaController@editarCierre
POST /denuncias/{ticket}/cierre/eliminar      → DenunciaController@eliminarCierre
```

---

### Sprint 6 — Seguimiento Público ✅ COMPLETADO (Junio 2026)

**Objetivo:** Página pública sin autenticación para consultar ticket con token de seguridad de 4 dígitos.

#### Componentes creados (6)

| Componente | Descripción |
|------------|-------------|
| `Components/Publico/BuscadorTicket.tsx` | Input plano con regex directo `^DEN-\d{4}-\d{4}-\d{4}$` + auto-uppercase. Submit con `router.get()` vía Inertia. Spinner de carga. `maxLength={19}`, `autoComplete="off"` |
| `Components/Publico/StepperProgreso.tsx` | 4 pasos visuales (Recepción → Evaluación → Investigación → Resolución) con colores y rama roja para rechazada |
| `Components/Publico/ResultadoSeguimiento.tsx` | Card completa: header con badge estado + ticket + tipo, fechas (ingreso/vencimiento/cierre), clasificación (si cerrada), stepper, mensaje de avance, sello legal UTLCC |
| `Components/Publico/EstadoVacio.tsx` | Empty state inicial: icono Search + "Ingresa tu número de ticket y código de seguridad" |
| `Components/Publico/EstadoNoEncontrado.tsx` | Error state: icono AlertCircle + "No se encontró ninguna denuncia con ese ticket y código" + botón "Volver a buscar" |
| `Components/Publico/EsqueletoBusqueda.tsx` | Skeleton animado (animate-pulse) para mostrar mientras se procesa la búsqueda |

#### Componentes modificados (5)

| Componente | Cambio |
|------------|--------|
| `Pages/Seguimiento/Buscar.tsx` | **Refactor completo**: 4 estados (inicial/procesando/encontrado/no-encontrado/formato-inválido) con Inertia `usePage().props`. Integra todos los componentes públicos. Manejo de error de formato inline. |
| `Pages/Welcome.tsx` | Removido buscador mock con MOCK_TICKETS, stepper y resultados. Agregado CTA "Consultar estado de denuncia" → `/seguimiento` en el hero. FAQ y soporte se mantienen. |
| `Components/Denuncias/ModalRechazo.tsx` | +textarea "Resumen breve para el denunciante (opcional, máx 200 chars)" con Separator visual. El texto se envía como `resumen_rechazo` al backend y es visible en la vista pública. |
| `Components/Denuncias/ModalExito.tsx` | +prop `token?: string`. Si existe, muestra el PIN de 4 dígitos debajo del ticket con separador visual. |
| `Pages/Denuncias/RegistroDenuncia.tsx` | +prop `token` desde flash Inertia, setToken state, pasa token a ModalExito. |

#### Backend creado

| Archivo | Descripción |
|---------|-------------|
| `app/Http/Controllers/SeguimientoController.php` | Método `buscar(Request)`: valida regex `^DEN-\d{4}-\d{4}-\d{4}$`, busca con `findByTicketAndToken()`, mapea con whitelist explícita de campos públicos, retorna Inertia. Throttle 30 requests/min por IP. |

#### Backend modificado

| Archivo | Cambio |
|---------|--------|
| `app/Data/DenunciaData.php` | +campo `token_consulta` (4 dígitos, generado en `add()` con `generateToken()`). +campo `resumen_rechazo` (string nullable, máx 200). +método `findByTicketAndToken(ticket, token)`. +método `generateToken()`. Seed: 12 tokens determinísticos (1001-1012). Seed DEN-2026-0005 +resumen_rechazo. `rechazar()` acepta 3er parámetro opcional `?string $resumenRechazo`. `makeDenuncia()` +defaults `token_consulta` y `resumen_rechazo` |
| `app/Http/Controllers/DenunciaController.php` | `rechazar()`: +validación `resumen_rechazo` (nullable, max 200), pasado a `DenunciaData::rechazar()`. `store()`: +token en flash response (para ModalExito). |
| `routes/web.php` | `GET /seguimiento` → `SeguimientoController@buscar` con `->middleware('throttle:30,1')`. +import `SeguimientoController` |

#### Rutas nuevas

```
GET /seguimiento?ticket=DEN-AAAA-NNNN-PPPP  → SeguimientoController@buscar (throttle:30,1)
```

#### Decisiones Sprint 6

| # | Decisión | Alternativa descartada | Motivo |
|---|----------|------------------------|--------|
| 1 | Token 4 dígitos numérico + ticket como llave compuesta | Token UUID largo / sin token | Par (ticket, token) = único. 10.000 combinaciones mitigado con rate limit |
| 2 | Token generado al registrar la denuncia (en `add()`) | Al admitir/rechazar | El ciudadano puede consultar desde el día 1 |
| 3 | Campo `token_consulta` en mock data | Generar en cada consulta | Persistencia para todo el ciclo de vida |
| 4 | Input único combinado (sin auto-formato) | Auto-formato con guiones | Bug de formateo detectado post-implementación. Input plano con regex directo + toUpperCase() es más robusto |
| 5 | `only: ['encontrado', 'denuncia', 'error']` en router.get() | Full page reload | Preserva estado del input, solo hidrata las props que cambian |
| 6 | Whitelist explícita de campos públicos en SeguimientoController | Enviar toda la denuncia | Seguridad: nunca exponer denunciante/denunciados/hechos/técnicos/bitácora |
| 7 | Stepper 4 pasos + rama rechazada | 5 pasos o timeline único | Refleja los "gates" legales: Recepción, Evaluación, Investigación, Resolución |
| 8 | Mensaje de avance semi-dinámico desde backend | Texto fijo o detallado | Combina estado + conteo de solicitudes/descargos sin exponer datos sensibles |
| 9 | No mostrar conteo de solicitudes/descargos en mensaje | Mostrar "Se emitieron N solicitudes" | Privacidad: no revelar cuántas dependencias externas están involucradas |
| 10 | Clasificación visible en cerradas + nota "pase por oficina" | Todo el FormCierre | Transparencia sin exponer documentación interna |
| 11 | Resumen_rechazo opcional en ModalRechazo | Obligatorio | El Jefe puede dejarlo vacío; si vacío, texto genérico por defecto |
| 12 | ModalRechazo con dos textareas separadas (justificación + resumen) | Un textarea + switch público/interno | Separación clara de audiencias (interno vs ciudadano) |
| 13 | Solo fecha estimada de cierre (sin días restantes) | Con contador de días | El ciudadano ve la fecha sin generar ansiedad si está por vencer |
| 14 | Welcome mínima: CTA a /seguimiento | Landing con stats o sin cambios | Mantiene hero + FAQ; remueve search mock que duplicaba funcionalidad |

#### Tokens seed determinísticos

```
DEN-2026-0001-1001 (ingresada)
DEN-2026-0002-1002 (ingresada)
DEN-2026-0003-1003 (ingresada)
DEN-2026-0004-1004 (admitida)
DEN-2026-0005-1005 (rechazada — con resumen_rechazo)
DEN-2026-0006-1006 (asignada)
DEN-2026-0007-1007 (asignada)
DEN-2026-0008-1008 (investigacion — con solicitudes)
DEN-2026-0009-1009 (investigacion — con descargos)
DEN-2026-0010-1010 (informe)
DEN-2026-0011-1011 (cerrada)
DEN-2026-0012-1012 (cerrada/archivada)
```

#### Mensajes de avance por estado

| Estado | Mensaje |
|--------|---------|
| `ingresada` | Su denuncia fue recibida y se encuentra en evaluación inicial. La UTLCC tiene un plazo máximo de 5 días hábiles para admitirla o rechazarla. |
| `admitida` | Su denuncia ha sido admitida y está siendo preparada para asignarse a un equipo técnico. |
| `asignada` | Su denuncia ha sido asignada a un equipo técnico. La investigación se iniciará en los próximos días. |
| `investigacion` (sin items) | Su denuncia está siendo investigada por la UTLCC. |
| `investigacion` (con solicitudes) | Su denuncia está siendo investigada. Se realizaron solicitudes de información a unidades externas. |
| `investigacion` (con descargos) | Su denuncia está siendo investigada. Se notificó a las personas denunciadas para que presenten sus descargos. |
| `informe` | La investigación ha concluido. Se está redactando el Informe Final que será remitido a la Máxima Autoridad Institucional. |
| `cerrada` | Su denuncia ha sido cerrada ({clasificación}). Para más información, acérquese a la oficina de la UTLCC. |
| `rechazada` (con resumen) | Su denuncia no fue admitida. {resumen_rechazo} |
| `rechazada` (sin resumen) | Su denuncia no fue admitida por no cumplir los requisitos establecidos en la Ley N° 974. |

#### Bug fix post-implementación

El `BuscadorTicket.tsx` original tenía un auto-formato con `formatTicketInput()` que usaba `if (result === '')` para aceptar solo la primera letra del prefijo `DEN`. Al tipear "DE" se perdía la "E". Al pegar `DEN-2026-0004-1004` el resultado era `D2026-0004-1004` (sin "EN"), lo que no matcheaba el regex `^DEN-...`. Se reemplazó por input plano controlado con `toUpperCase()` + validación regex directa.

#### TODO — Preguntar al cliente

> ⚠️ **TODO — Preguntar al cliente:** ¿La funcionalidad de "archivar casos" debe ser un subestado de `cerrada` (actual: `subestado: 'archivada'`) o un estado/proceso separado con flujo propio? Por el momento se mantiene como subestado sin afectar UX de la vista pública. Agendar consulta con cliente.

---

### Sprint 6.5 — Simulación Multi-Rol para Demo (NUEVO — Julio 2026)

**Objetivo:** Simulación de 5 usuarios con roles sin base de datos. Dropdown en Header para cambiar entre Registrador, Jefe y 3 Técnicos. Sidebar filtra menú según rol.

**Origen:** Reunión con cliente Julio 2026 — necesidad de demo realista con roles.

| Archivo | Descripción |
|---------|-------------|
| `app/Data/SesionUsuarioData.php` (nuevo) | 5 usuarios mock + current_user en sesión |
| `app/Http/Controllers/SelectorUsuarioController.php` (nuevo) | POST para cambiar de usuario demo |
| `resources/js/Components/Layout/SelectorUsuarioDemo.tsx` (nuevo) | Dropdown en Header con los 5 usuarios |
| `resources/js/Components/Layout/Header.tsx` (modificado) | +SelectorUsuarioDemo en la barra superior |
| `resources/js/Components/Layout/Sidebar.tsx` (modificado) | Filtrar menú por `user.rol` (registrador/jefe/tecnico) |
| `resources/js/Components/Layout/AppLayout.tsx` (modificado) | Enviar currentUser como prop Inertia |
| `resources/js/Components/Denuncias/Bandeja.tsx` (modificado) | Bandeja solo accesible para Jefe |
| `resources/js/Components/Denuncias/MisCasos.tsx` (modificado) | MisCasos solo accesible para Técnicos |
| `resources/js/Components/Denuncias/MiResumen.tsx` (modificado) | MiResumen solo accesible para Técnicos |

**Usuarios demo:**
- Registrador: María García (solo `/denuncias/registrar`)
- Jefe: Pedro Mamani (Bandeja, Reportes, Admin/Feriados)
- Técnicos: Carlos Quispe, Ana Torres, Luis Mamani (MisCasos, MiResumen)

**Patrón de reusabilidad — Sprint 15:**
Cuando se implementen roles reales (Sprint 15), el dropdown se elimina y se reemplaza por `Auth::user()`. La lógica de filtrado del Sidebar y controllers NO cambia — solo cambia la fuente de datos. Cero código desechable.

**Ver detalle:** `Sprints Pendientes - Contexto.md` → Sprint 6.5.

---

### Sprint 7 — Evaluación Técnica Previa (NUEVO — Junio 2026)

**Objetivo:** Permitir al Jefe de Unidad delegar la evaluación de una denuncia a un técnico antes de admitirla o rechazarla. El técnico evalúa y devuelve la denuncia con su evaluación resumida.

**Origen:** Respuesta del cliente #1 (SITPRECO + nuevo flujo de evaluación).

| Archivo | Descripción |
|---------|-------------|
| `app/Data/EvaluacionData.php` (nuevo) | Mock data de evaluaciones técnicas previas |
| `app/Http/Controllers/EvaluacionController.php` (nuevo) | delegar + devolver evaluación |
| `app/Data/DenunciaData.php` (modificado) | +sub-estado `evaluacion_tecnica`, +campos `evaluacion_tecnica_texto/tecnico_id/fecha` |
| `app/Http/Controllers/DenunciaController.php` (modificado) | +delegarEvaluacion(), +devolverEvaluacion() |
| `resources/js/Components/Denuncias/ModalDelegarEvaluacion.tsx` (nuevo) | Jefe elige técnico disponible para evaluar |
| `resources/js/Components/Denuncias/ModalDevolverEvaluacion.tsx` (nuevo) | Técnico ingresa evaluación resumida + devuelve al Jefe |
| `resources/js/Components/Denuncias/ModalAdmision.tsx` (modificado) | SITPRECO obligatorio al admitir |
| `resources/js/Components/Denuncias/ModalRechazo.tsx` (modificado) | SITPRECO opcional al rechazar (sin hint) |
| `resources/js/Components/Denuncias/FormCierre.tsx` (modificado) | SITPRECO read-only (viene heredado de admisión) |
| `resources/js/Components/Denuncias/TabEvaluacionPrevia.tsx` (nuevo) | Tab en DetalleDenuncia para ver historial de evaluación |
| `resources/js/Pages/Denuncias/Evaluaciones.tsx` (nuevo) | Bandeja de evaluaciones delegadas para el técnico |
| `resources/js/Pages/Denuncias/Bandeja.tsx` (modificado) | +botón "Delegar evaluación" en tab Por admitir |
| `resources/js/Pages/Denuncias/MisCasos.tsx` (modificado) | +tab "Evaluaciones delegadas" |

**Decisiones clave:**
- El Jefe **puede elegir** si delega o evalúa él mismo
- Cualquier técnico disponible puede ser delegado
- Los 5 días de admisión (Art. 23) **se cuentan desde la recepción** (no se pausan)
- El técnico que evalúa puede ser reasignado o no al caso final (decisión del Jefe)
- SITPRECO obligatorio al admitir, opcional al rechazar

Ver detalle: `Sprint 7 - Evaluación Técnica Previa.md`

---

### Sprint 8 — Ampliaciones Múltiples

**Objetivo:** Permitir al Jefe de Unidad aprobar múltiples ampliaciones parciales del plazo total (no solo una prórroga por el máximo legal).

**Origen:** Respuesta del cliente #11 (C6 resuelta).

| Archivo | Descripción |
|---------|-------------|
| `resources/js/Components/Denuncias/ModalAmpliacionPlazo.tsx` (refactor) | Permitir N ampliaciones en lugar de una sola |
| `app/Data/DenunciaData.php` (modificado) | +array `ampliaciones[]` con `{fecha, dias_concedidos, justificacion, aprobado_por}` |
| `app/Http/Controllers/DenunciaController.php` (modificado) | +aprobarAmpliacion() permite múltiples |
| `resources/js/Components/Denuncias/PlazoBadge.tsx` (modificado) | Mostrar plazo total acumulado con todas las ampliaciones |

---

### Sprint 9 — Notificaciones Push + Historial

**Objetivo:** Sistema de notificaciones push vía campana superior en el navbar, con historial tipo notificaciones de Facebook.

**Origen:** Respuesta del cliente #22.

| Archivo | Descripción |
|---------|-------------|
| `app/Data/NotificacionData.php` (nuevo) | Mock de notificaciones |
| `app/Http/Controllers/NotificacionController.php` (nuevo) | index, marcarLeida, marcarTodasLeidas |
| `resources/js/Components/Layout/CampanaNotificaciones.tsx` (nuevo) | Campana en Header con badge de no leídas |
| `resources/js/Components/Layout/PanelNotificaciones.tsx` (nuevo) | Panel con historial scrolleable |
| `resources/js/Components/Layout/ItemNotificacion.tsx` (nuevo) | Item individual con timestamp, mensaje, acción |

**Alertas implementadas:**
- Delegaciones de evaluación
- Traspasos de casos
- Denuncias respondidas
- Plazos por terminar (informes)
- Plazos total (20/25 días) por vencer
- Solicitudes de información próximas a vencer
- Descargos de denunciados próximos a vencer

**Interacción:**
- Click en notificación navega al caso relacionado
- Marcar individual / marcar todas leídas
- Historial persistente (mock)
- Badge con contador de no leídas

---

### Sprint 10 — Panel Administración Catálogos + Subcategorías

**Objetivo:** Panel administrativo único para CRUD de todos los catálogos del sistema (clasificaciones, categorías, subcategorías, tipos, estados, medios notificación, etc.).

**Origen:** Respuesta del cliente #18.

| Archivo | Descripción |
|---------|-------------|
| `resources/js/Pages/Admin/Catalogos.tsx` (nuevo) | Vista con tabs por tipo de catálogo |
| `app/Data/CatalogoData.php` (nuevo) | Catálogos dinámicos (clasificaciones, categorías, subcategorías, etc.) |
| `app/Http/Controllers/CatalogoController.php` (nuevo) | CRUD genérico por tipo de catálogo |
| `resources/js/Components/Admin/TablaCatalogo.tsx` (nuevo) | Tabla editable con acciones (crear, editar, eliminar) |
| `resources/js/Components/Admin/ModalEditarItem.tsx` (nuevo) | Modal de edición de un item del catálogo |

**Catálogos a administrar:**
- Clasificaciones finales: Penal, Civil, Administrativo, Sin Indicios, Medida Correctiva, Archivado
- Categorías de denuncia (por tipo)
- Subcategorías de denuncia (por tipo)
- Tipos de denuncia: Corrupción, Negación de Información
- Estados: ingresada, evaluación técnica, admitida, rechazada, asignada, investigación, informe, cerrada
- Medios de notificación: whatsapp, email, presencial, otro
- Tipos de prueba: archivo, prueba física, testigo
- Dependencias/unidades externas

**Subcategorías:**
- Cada tipo de denuncia (corrupción / negación) tiene sus propias subcategorías
- Definidas en este panel
- Seleccionables en formulario de registro (Sprint 1)
- Consideración: el gráfico de subcategorías puede tener muchas opciones, manejar con cuidado

---

### Sprint 11 — Dashboard + KPIs + Reportes PDF/Excel

**Objetivo:** Dashboard con KPIs, gráficos y página de reportes con tabla + filtros + exportación PDF/Excel.

**Origen:** Respuestas del cliente #15, #16, #17, #21.

| Archivo | Descripción |
|---------|-------------|
| `resources/js/Pages/Dashboard.tsx` (refactor) | Dashboard completo con KPIs + gráficos |
| `resources/js/Components/Dashboard/KPICards.tsx` (nuevo) | 3+ cards: Denuncias activas, Pendientes admisión, % Cumplimiento, +próximas a vencer, +vencidas |
| `resources/js/Components/Dashboard/GraficosDashboard.tsx` (nuevo) | 3+ gráficos con Recharts |
| `resources/js/Pages/Reportes/Index.tsx` (nuevo) | Tabla con filtros (fechas libres, tipo, estado, clasificación) |
| `resources/js/Components/Reportes/TablaReporte.tsx` (nuevo) | Tabla con shadcn table |
| `resources/js/Components/Reportes/FiltrosReporte.tsx` (nuevo) | Rango de fechas libre + filtros cruzados |
| `app/Http/Controllers/ReporteController.php` (nuevo) | Datos agregados desde mocks |
| `app/Exports/ReporteExcel.php` (nuevo) | Exportación Excel con maatwebsite/excel |
| `resources/views/reportes/pdf.blade.php` (nuevo) | Vista PDF con barryvdh/laravel-dompdf |
| `resources/js/Components/Reportes/BotonExportar.tsx` (nuevo) | Dropdown con opciones PDF / Excel |

**KPIs propuestos:**
1. Denuncias activas
2. Pendientes admisión
3. % Cumplimiento de plazos
4. Casos próximos a vencer (≤5 días)
5. Casos ya vencidos con mora

**Filtros:**
- Rango de fechas **libre** (selector doble)
- Tipo de denuncia
- Estado
- Clasificación
- Filtros cruzados múltiples

**Exportación:**
- **PDF** y **Excel** además de vista en pantalla
- Solo para el Jefe de Unidad (interno)

**Dependencia:** `npm install recharts`, `composer require maatwebsite/excel barryvdh/laravel-dompdf`

**shadcn a instalar:** `table`, `dropdown-menu` (ya existe), `date-picker` (o alternativa), `select` (ya existe)

---

### Sprint 12 — Tablero Público Cerrados

**Objetivo:** Sección en la página Welcome pública mostrando casos cerrados recientes (anonimizados) para aumentar transparencia.

**Origen:** Respuesta del cliente #27.

| Archivo | Descripción |
|---------|-------------|
| `resources/js/Pages/Welcome.tsx` (modificado) | +sección "Casos cerrados recientemente" |
| `resources/js/Components/Publico/TableroCasosCerrados.tsx` (nuevo) | Cards con casos cerrados anonimizados |
| `app/Http/Controllers/HomeController.php` (nuevo o extendido) | +casosCerradosRecientes() para la vista pública |
| `app/Http/Controllers/SeguimientoController.php` (modificado) | +método para casos cerrados públicos |

**Datos mostrados (anonimizados):**
- Ticket (parcial, ej. DEN-2026-XXXX)
- Tipo de denuncia
- Clasificación final
- Fecha de cierre
- Sin denunciante ni denunciados

**Complejidad:** Baja. Solo vista + endpoint.

---

### Sprint 13 — Tiempos entre Fases

**Objetivo:** Métricas de duración promedio entre fases del proceso (recepción → admisión, admisión → asignación, etc.).

**Origen:** Respuesta del cliente #19.

| Archivo | Descripción |
|---------|-------------|
| `resources/js/Components/Dashboard/TiemposEntreFases.tsx` (nuevo) | Tabla/vista con tiempos promedio |
| `app/Http/Controllers/ReporteController.php` (modificado) | +método tiemposEntreFases() |

**Complejidad:** Baja si los timestamps están en mock data.

---

### Sprint 14 — Base de datos real (MySQL)

**Objetivo:** Migrar de mocks a base de datos MySQL real con migraciones, modelos Eloquent y seeders.

**Origen:** Respuestas #24, #29.

| Actividad | Descripción |
|-----------|-------------|
| Diseñar esquema de BD | Tablas: denuncias, denunciantes, denunciados, solicitudes, descargos, evaluaciones, informes, cierres, bitácora, usuarios, feriados, notificaciones, catálogos |
| Crear migraciones | Todas las tablas con sus relaciones |
| Crear modelos Eloquent | Con relaciones, fillable, casts |
| Crear seeders | Migrar seeds mock a seeders reales |
| Refactorizar controllers | Reemplazar acceso a `*Data.php` por queries a Eloquent |
| Configurar conexión | `.env` con MySQL de Laragon |

**Dependencias:** Requiere Sprint 15 (Roles) posterior.

---

### Sprint 15 — Roles y Permisos (Registrador / Jefe / Técnico)

**Objetivo:** Implementar sistema de roles y permisos usando Laravel middleware y policies.

**Origen:** Respuesta del cliente #23.

| Actividad | Descripción |
|-----------|-------------|
| Definir los 3 roles | Registrador, Jefe de Unidad, Técnicos |
| Crear middleware | `RoleMiddleware` para verificar rol en rutas |
| Crear policies | Policies por modelo (DenunciaPolicy, SolicitudPolicy, etc.) |
| Implementar guards | Proteger rutas según rol |
| Refactorizar bandejas | Bandeja solo para Jefe, MisCasos solo para Técnico, etc. |

**Dependencias:** Requiere Sprint 14 (BD).

---

### Sprint 16 — Auditoría Backend Detallada

**Objetivo:** Auditoría automática de todos los cambios usando `owen-it/laravel-auditing`.

**Origen:** Respuesta del cliente #26.

| Actividad | Descripción |
|-----------|-------------|
| Instalar `owen-it/laravel-auditing` | Composer |
| Aplicar trait `Auditable` | A modelos: Denuncia, Solicitud, Descargo, Evaluacion, Informe, Cierre |
| Configurar | Qué campos auditar, qué usuario registra, IP |
| Crear vista de auditoría | Para consultar log por caso o por usuario |

**Dependencias:** Requiere Sprint 14 (BD).

---

### Sprint 17 — Lógica de Mora Explícita

**Objetivo:** Implementar lógica explícita de mora para fechas vencidas (texto "+Xd de retraso", badge "Vencido" en cards).

**Origen:** Respuesta del cliente #7.

| Actividad | Descripción |
|-----------|-------------|
| Agregar campo `mora_dias` | A solicitud, descargo, informe, cierre |
| Calcular mora al guardar | Si la fecha actual > fecha límite, calcular días |
| Mostrar texto "+Xd" en cards | Reemplazar o complementar `PlazoBadge.tsx` |
| Filtro de "casos morosos" | En Bandeja y MisCasos |

**Dependencias:** Sprint 14 (BD) si se persiste, opcional si solo se calcula on-the-fly.

---

### Sprint 18 — Calendario Feriados + Días Hábiles (FINAL)

**Objetivo:** Cierre formal del sistema de días hábiles. Helper unificado `DiasHabiles.php` + UI de administración + recálculo retroactivo del seed demo.

**Origen:** Pregunta #6 (C1) — **decisión tomada en Julio 2026: días hábiles UNIVERSAL.**

**Nota importante:** El sistema YA usa días hábiles desde Sprint 4 (decisión retroactiva tomada en Julio 2026). Este sprint **formaliza** el helper, la integración con feriados persistentes y el recálculo del seed. No cambia la lógica actual.

| Archivo | Descripción |
|---------|-------------|
| `app/Helpers/DiasHabiles.php` (nuevo, formal) | `diasHabilesTranscurridos()` y `agregarDiasHabiles()` con feriados |
| `app/Data/FeriadoData.php` (nuevo) | Catálogo de feriados (nacional + departamental La Paz) |
| `app/Http/Controllers/FeriadoController.php` (nuevo) | CRUD feriados (backend) |
| `resources/js/Pages/Admin/Feriados.tsx` (refactor) | Conectar UI existente con el CRUD real |
| `app/Data/DenunciaData.php` (modificado) | `getPlazoInfo()` usa helper. Seed recalculado. |
| `app/Data/SolicitudData.php` (modificado) | `getPlazoInfo()` usa helper |
| `app/Data/DescargoData.php` (modificado) | `getPlazoInfo()` usa helper |
| `resources/js/Components/Denuncias/PlazoBadge.tsx` (modificado) | Integrar backend de días hábiles |
| `resources/js/Components/Denuncias/PlazoProgress.tsx` (modificado) | Integrar backend de días hábiles |

**Comportamiento esperado:**
- Todos los plazos se calculan en Lun-Vie, saltando Sáb/Dom y feriados
- El Jefe administra feriados desde `/admin/feriados`
- El seed demo regenera las 12 denuncias con plazos hábiles

**Decisión:** ✅ Días hábiles confirmado (Julio 2026). Ver `Preguntas para el cliente.md` → #6 y #30.

**Dependencias:** Sprint 14 (BD) para persistencia.

---

### Sprint 19 — Cierre Fase 1 / Ajustes Finales

**Objetivo:** Testing integral, limpieza técnica, documentación de usuario y deploy a producción. **No incluye funcionalidad nueva.**

**Actividades:**
- **Testing end-to-end** de todos los flujos del sistema
- **Optimización de performance** (queries, render, bundle)
- **Limpieza de código** (remover mocks/debug, renombrar, documentar funciones complejas)
- **Refactor de deuda técnica** detectada durante desarrollo
- **Auditoría de seguridad** (sanitización, CSRF, rate limits, exposición de datos)
- **Documentación final:**
  - Manual de usuario para UTLCC
  - Manual técnico
  - README de instalación
- **Capacitación:** sesión al Jefe y técnicos
- **Deploy a producción:** servidor, DNS, SSL, backups
- **Criterio "done" final:** checklist de requisitos de Fase 1

**Nota para IAs:** Esta sección es solo roadmap. **No leerla** a menos que se esté trabajando explícitamente en el Sprint 19.

---

### Sprint 20 — Archivos Grandes + Conectividad Inestable (NUEVO — Post-Fase 1)

**Objetivo:** Estrategia técnica para subida robusta de archivos de hasta 1000+ páginas (>100MB) en entornos con internet inestable (latencia variable, cortes momentáneos, señal baja).

**Origen:** Reunión Julio 2026 — preocupación del cliente sobre infraestructura de red institucional.

> ⚠️ **NO se implementa en Fase 0 ni Fase 1.** Es diseño y planificación para post-lanzamiento.

**Estrategia propuesta:**

| Técnica | Propósito | Librería sugerida |
|---------|-----------|-------------------|
| **Chunked uploads** | Dividir archivo grande en pedazos 5-10MB | `tus.io` protocol + `Uppy` cliente |
| **Resumable uploads** | Reanudar desde último chunk tras corte | `tus-php` servidor |
| **Retry con backoff exponencial** | Reintentos automáticos 1s→2s→4s→8s→... | Custom + Laravel Queue |
| **Hash dedup SHA256** | No resubir archivo ya existente en el sistema | Custom |
| **Queue asíncrona** | Subida en background, no bloquea la UI | Laravel Jobs |
| **Compresión cliente** | Reducir tamaño de PDF escaneado antes de subir | Browser-side (opcional) |
| **Storage alternativo** | S3-compat (MinIO) en lugar de disco local | `league/flysystem-aws-s3-v3` |

**Mock en Fase 0:** Solo barra de progreso animada + botón de retry visual. Sin chunking real hasta Fase 1 o Sprint 20.

**Dependencias:** Sprint 14 (BD), Sprint 15 (Auth).

**Ver detalle:** `Sprints Pendientes - Contexto.md` → Sprint 20.

---

## Archivos del Proyecto

### Backend (PHP)

```
app/Data/
  DenunciaData.php          ← Colección de denuncias mock
  UsuarioData.php           ← Técnicos, jefe y registrador mock
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

    Sprint 5 — Nuevos:
    ClasificacionBadge.tsx          ← Badge clasificación (6 colores)
    FormInformeFinal.tsx            ← Formulario embebido Informe Final (modo dual)
    FormCierre.tsx                  ← Formulario embebido Cierre (notificación condicional)
    TabInformeCierre.tsx            ← Orquesta 2 sub-tabs Informe + Cierre
    InformeDetailModal.tsx          ← Modal detalle informe + cierre read-only

  Publico/                                     ← Sprint 6 — Nuevos:
    BuscadorTicket.tsx                          ← Input plano con validación regex
    StepperProgreso.tsx                         ← 4 pasos visuales + rama rechazo
    ResultadoSeguimiento.tsx                    ← Card completa con stepper + datos
    EstadoVacio.tsx                             ← Empty state inicial
    EstadoNoEncontrado.tsx                      ← Estado ticket no encontrado
    EsqueletoBusqueda.tsx                       ← Skeleton de carga

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

--- Sprint 5 — Informe Final + Cierre:
resources/js/Components/Denuncias/DenunciaSheet.tsx          → +4to tab "Informe y Cierre", +prop tecnicoNombre
resources/js/Components/Denuncias/DenunciaCard.tsx           → +badge ClasificacionBadge, +SITPRECO, +fecha cierre
resources/js/Pages/Denuncias/MisCasos.tsx                   → +prop tecnicoNombre, +ScrollText "Informe pendiente"
resources/js/Pages/Denuncias/Bandeja.tsx                    → +prop tecnicoNombre
app/Data/DenunciaData.php                                   → +24 campos informe_*/cierre_*, +6 métodos, +seed
app/Http/Controllers/DenunciaController.php                 → +6 métodos (guardar/editar/eliminar para informe y cierre)
routes/web.php                                              → +6 rutas

--- Sprint 6 — Seguimiento Público:
resources/js/Components/Publico/BuscadorTicket.tsx           → NUEVO (input plano con regex directo)
resources/js/Components/Publico/StepperProgreso.tsx          → NUEVO (stepper 4 pasos)
resources/js/Components/Publico/ResultadoSeguimiento.tsx     → NUEVO (card resultado)
resources/js/Components/Publico/EstadoVacio.tsx              → NUEVO (empty state)
resources/js/Components/Publico/EstadoNoEncontrado.tsx       → NUEVO (not found state)
resources/js/Components/Publico/EsqueletoBusqueda.tsx        → NUEVO (loading skeleton)
resources/js/Pages/Seguimiento/Buscar.tsx                    → REFACTOR (4 estados Inertia)
resources/js/Pages/Welcome.tsx                               → REFACTOR (removido search mock, +CTA)
resources/js/Components/Denuncias/ModalRechazo.tsx           → +textarea resumen_rechazo
resources/js/Components/Denuncias/ModalExito.tsx             → +prop token (muestra PIN)
resources/js/Pages/Denuncias/RegistroDenuncia.tsx            → +token a ModalExito
app/Data/DenunciaData.php                                    → +token_consulta, +resumen_rechazo, +findByTicketAndToken
app/Http/Controllers/DenunciaController.php                  → rechazar() +resumen_rechazo, store() +token flash
app/Http/Controllers/SeguimientoController.php               → NUEVO (búsqueda con whitelist)
routes/web.php                                               → GET /seguimiento con throttle:30,1
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
| 6 | — (reuso de input, card, badge, button, separator, sonner, dialog) |
| 7 | `table` |

---

## Notas

- Los plazos se calculan en días hábiles usando el calendario de feriados y el algoritmo basado en Carbon (ver `app/Helpers/DiasHabiles.php`)
- Las notificaciones al ciudadano son manuales (fuera del sistema). El funcionario registra fecha, medio y respaldo.
- El seguimiento público solo muestra datos no sensibles (fase actual, fechas estimadas).
- Los archivos adjuntos en la maqueta son simulados (no hay almacenamiento real).
