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
- ✅ Archivos de planificación en `transparencia-proy/` (4 documentos de especificación)

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
| `Pages/Denuncias/Bandeja.tsx` | 4 tabs: Por admitir, Por asignar, Rechazadas, Visión general (6 ContadorCards) |
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

### Sprint 3 — Detalle de Caso + Admisión/Asignación

**Objetivo:** Al hacer clic en una tarjeta del Kanban se abre el detalle completo con acciones del Jefe.

| Componente | Acción |
|------------|--------|
| `AdmisionRechazoModal.tsx` | Modal con detalle + botones Admitir/Rechazar + textarea justificación |
| `AsignacionModal.tsx` | Lista de técnicos mock con carga de trabajo + botón confirmar |
| `TraspasoModal.tsx` | Dropdown con técnicos + textarea justificación |
| `ReabrirModal.tsx` | Reabrir denuncias cerradas o rechazadas |

**Backend:**
```
DenunciaController@admitir    → mock: cambia estado
DenunciaController@rechazar   → mock: cambia estado + justificación
DenunciaController@asignar    → mock: asigna técnico
DenunciaController@traspasar  → mock: cambia técnico
DenunciaController@reabrir    → mock: reactiva denuncia
```

---

### Sprint 4 — Investigación (Solicitudes + Descargos)

**Objetivo:** Pestañas de trabajo dentro del Sheet de detalle.

| Componente | Descripción |
|------------|-------------|
| `TabSolicitudes.tsx` | Lista de solicitudes a unidades externas (To-Do) |
| `ModalNuevaSolicitud.tsx` | Unidad destino + detalle + plazo |
| `ModalResponderSolicitud.tsx` | Respuesta recibida + archivos |
| `ModalAmpliarSolicitud.tsx` | Prórroga: días + justificación + archivo |
| `TabDescargos.tsx` | Lista de denunciados con control individual |
| `ModalNotificarDescargo.tsx` | Fecha aviso + medio + respaldo |
| `ModalResponderDescargo.tsx` | Resumen descargo + documentos |
| `ModalAmpliarDescargo.tsx` | Prórroga: días + justificación |
| `SaltarFaseButton.tsx` | Botón "Saltar" con textarea justificación obligatoria |

**Backend:** `app/Data/SolicitudData.php`, `app/Data/DescargoData.php`

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
  SolicitudData.php         ← Solicitudes de información mock
  DescargoData.php          ← Descargos de denunciados mock
  FeriadoData.php           ← Feriados mock

app/Helpers/
  DiasHabiles.php           ← Algoritmo de cálculo de días hábiles

app/Http/Controllers/
  DenunciaController.php    ← CRUD + flujo de denuncias
  SeguimientoController.php ← Búsqueda pública por ticket
  ReporteController.php     ← Datos agregados para dashboard
  FeriadoController.php     ← CRUD feriados (mock)
```

### Frontend (React + TypeScript)

```
resources/js/Pages/
  Denuncias/Bandeja.tsx             ← 4 tabs (Jefe)
  Denuncias/MisCasos.tsx            ← 4 tabs (Técnico)
  Denuncias/MiResumen.tsx           ← 4 ContadorCards (Técnico)
  Denuncias/RegistroDenuncia.tsx
  Denuncias/DetalleDenuncia.tsx
  Seguimiento/Buscar.tsx
  Reportes/Index.tsx
  Admin/Feriados.tsx

resources/js/Components/
  Denuncias/
    DenunciaCard.tsx                ← Card clickeable con punto de plazo
    DenunciaSheet.tsx               ← Sheet lateral con detalle completo
    PlazoBadge.tsx                  ← Verde/Amarillo/Rojo
    TipoDenunciaBadge.tsx           ← Badge por tipo
    SubestadoBadge.tsx              ← Badge "Archivada"
    ContadorCard.tsx                ← Card con número + icono
    TabsDenuncias.tsx               ← Wrapper shadcn Tabs
    ListaVacia.tsx                  ← Empty state
    ModalAdmision.tsx               ← Admisión con justificación opcional
    ModalRechazo.tsx                ← Rechazo con justificación obligatoria
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

  Publico/
    BuscadorTicket.tsx
    ResultadoSeguimiento.tsx

  Reportes/
    KPICards.tsx
    GraficosDashboard.tsx
```

### Modificados

```
resources/js/Layouts/Sidebar.tsx         → menú del sistema + logo GAMEA
resources/js/Layouts/Header.tsx          → nombre de institución completo
resources/js/Pages/Dashboard.tsx         → KPIs reales (refactor)
resources/js/Pages/Denuncias/Kanban.tsx  → ELIMINADO (reemplazado por Bandeja)
routes/web.php                           → todas las rutas del sistema
```

---

## shadcn Components a Instalar (por sprint)

| Sprint | Componentes |
|--------|-------------|
| 1 | `switch`, `radio-group`, `checkbox`, `calendar`, `popover`, `textarea`, `select`, `input`, `label`, `separator`, `sonner` |
| 2 | `badge`, `card`, `avatar`, `tabs`, `dialog`, `sheet` |
| 3 | `dropdown-menu`, `progress`, `scroll-area` |
| 4 | — (reuso de tabs y sheet) |
| 5 | — |
| 7 | `table` |

---

## Notas

- Los plazos se calculan en días hábiles usando el calendario de feriados y el algoritmo basado en Carbon (ver `app/Helpers/DiasHabiles.php`)
- Las notificaciones al ciudadano son manuales (fuera del sistema). El funcionario registra fecha, medio y respaldo.
- El seguimiento público solo muestra datos no sensibles (fase actual, fechas estimadas).
- Los archivos adjuntos en la maqueta son simulados (no hay almacenamiento real).
