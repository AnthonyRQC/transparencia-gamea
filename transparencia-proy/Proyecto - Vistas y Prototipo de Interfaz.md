#transparencia
# 🖥️ Arquitectura de Vistas y Diseño de Interfaz (SPA)

> **¿Qué es este documento?**
> Describe la estructura visual, la distribución de roles y la experiencia de usuario (UX) del sistema. Detalla cada pantalla, los paneles interactivos, los gráficos del dashboard y la interacción mediante ventanas modales, estructurado bajo el paradigma de una Aplicación de Página Única (SPA) utilizando **React + Inertia.js + Tailwind CSS + shadcn/ui**.

---

## 1. Enfoque Single Page Application (SPA)

Para garantizar una experiencia premium, fluida e instantánea, el sistema se diseñará como una **SPA** utilizando **Inertia.js** como puente de datos:
- **Cero recargas de página**: La transición entre el tablero Kanban, los detalles de las denuncias y el calendario de feriados es inmediata.
- **Contexto mediante Modales y Slide-overs**: En lugar de navegar a una página nueva para realizar acciones sencillas (como asignar un técnico o registrar un descargo), se abrirán ventanas modales animadas o paneles deslizantes (*sheet* de shadcn/ui). Esto evita que el usuario pierda el hilo de lo que está analizando.
- **Retroalimentación en Tiempo Real**: Todo guardado de formulario disparará una notificación flotante (Toast) en la esquina inferior derecha confirmando el éxito de la operación.

---

## 2. Matriz de Acceso a Vistas por Rol

| Vista / Pantalla                                   | Registrador |  Técnico  | Jefe de Unidad | Administrador | Ciudadano |
| -------------------------------------------------- | :-----------: | :-------: | :------------: | :-----------: | :-------: |
| **Buscador Público (Seguimiento)**                 |               |           |                |               | 🟢 Acceso |
| **Registro de Nueva Denuncia**                     |   🟢 Acceso   |           |                |               |           |
| **Bandeja de Admisión** (4 tabs)                   |               |           |   🟢 Acceso    |               |           |
| **Mis Casos** (Técnico, 4 tabs)                    |               | 🟢 Acceso |                |               |           |
| **Mi Resumen** (Técnico, contadores)               |               | 🟢 Acceso |                |               |           |
| **Panel Detallado del Caso (Sheet lateral)**       |               | 🟢 Acceso | 🟢 *(Lectura)* |               |           |
| **Dashboard y Reportes Gráficos**                  |               |           |   🟢 Acceso    |               |           |
| **Calendario de Feriados (Administración)**        |               |           |   🟢 Acceso    |   🟢 Acceso   |           |
| **Gestión de Usuarios y Roles**                    |               |           |                |   🟢 Acceso   |           |

---

## 3. Estructura y Distribución de Vistas

### Layout General de la Aplicación (Panel Interno)
Toda la interfaz interna (para funcionarios) compartirá un mismo cascarón visual:
1. **Sidebar Izquierdo (Barra Lateral)**:
   - Logotipo institucional con efecto de desenfoque de fondo (*glassmorphism*).
   - Menú de navegación con iconos estilizados (`lucide-react`).
   - Indicador dinámico de plazos (ej. un círculo rojo con el número de denuncias próximas a vencer).
2. **Topbar Superior (Barra de Usuario)**:
   - Nombre de la UTLCC y Entidad.
   - Indicador de estado del sistema.
   - Menú desplegable del usuario (Perfil / Cerrar Sesión).
3. **Contenedor Central**: Espacio dinámico donde se cargan las páginas de React sin recargar el navegador.

---

### A. Buscador Público de Seguimiento (Ciudadano)

Una vista minimalista, premium y sumamente clara, accesible sin credenciales.

*   **Pantalla de Búsqueda**:
    *   Fondo con gradiente sutil y tipografía moderna (Inter / Outfit).
    *   Un input central grande con icono de lupa para ingresar el **Número de Ticket** (ej. `DEN-2026-0004`).
    *   Botón flotante "Consultar Estado".
*   **Resultados de Búsqueda (SPA Transition)**:
    *   Al ingresar el ticket, se despliega una tarjeta central mediante una animación suave de fundido (*fade-in*).
    *   **Línea de Tiempo Visual (Steppers de shadcn/ui)**:
        *   `[Recepción]` ➔ `[Evaluación del Jefe]` ➔ `[Investigación]` ➔ `[Resolución / Cierre]`
    *   **Detalle No Sensible visible**:
        *   **Código de Denuncia**: `DEN-2026-0004`
        *   **Tipo**: Corrupción / Negación de Información.
        *   **Fase Actual**: En investigación.
        *   **Estado de Avance**: *"Se ha solicitado información a la Dirección Administrativa. Fecha estimada de recepción: 02 de Julio de 2026."* (Oculta nombres de técnicos, denunciados o detalles del hecho por confidencialidad).

---

### B. Vista de Recepción (Registrador)

Diseñada para registrar denuncias de manera rápida mientras el ciudadano está presente en la oficina.

*   **Bandeja de Entrada**:
    *   Listado tipo tabla con las denuncias creadas por el registrador en el día, permitiendo verificar que los datos se subieron correctamente.
    *   Botón superior "➕ Registrar Nueva Denuncia".
*   **Formulario Modal Multi-paso (Nueva Denuncia)**:
    Para no abrumar con un formulario largo, se dividirá en 3 pestañas dinámicas en el modal:
    1.  **Paso 1: Denunciante**:
        *   Checkbox toggle: "¿Es denuncia anónima?". Si se activa, deshabilita y limpia los campos de nombres, cédula y teléfono.
        *   Checkbox toggle: "Solicita Reserva de Identidad" (activa un flag de seguridad en la base de datos).
    2.  **Paso 2: Denuncia y Relación de Hechos**:
        *   Dropdown: Tipo de Denuncia (Corrupción / Negación de Información).
        *   Textarea enriquecido: Relación detallada de los hechos.
        *   Datepicker: Periodo o fecha aproximada del hecho.
        *   Input de texto opcional: ID o Código de denuncia enlazada (antecedentes).
    3.  **Paso 3: Presuntos Responsables y Pruebas**:
        *   **Repetidor Dinámico de Denunciados**: Botón "Agregar Denunciado" que añade inputs de Nombre, Cargo y Unidad Organizacional de manera dinámica (React state).
        *   **Zona de Carga (Drag & Drop)**: Área de arrastre de archivos con validación en caliente de tamaño (máx 10MB) y formato (`PDF`, `PNG`, `JPG`, `DOCX`).
    *   *Acción al finalizar*: Genera un modal secundario de éxito con el ticket en grande y botón de "Imprimir Comprobante" para el denunciante.

---

### C. Panel del Jefe de Unidad (Dashboard & Control)

El centro de control de la UTLCC.

#### 1. Módulo de Reportes Gráficos (Dashboard)
*   **KPI Cards (Widgets de Resumen)**:
    *   *Denuncias Activas*: Número total en curso.
    *   *Pendientes de Admisión*: Con fondo amarillo parpadeante si hay casos cerca de cumplir los 5 días de plazo límite.
    *   *Cumplimiento de Plazo*: Porcentaje de casos resueltos en tiempo.
*   **Sección de Gráficos (Recharts)**:
    *   **Gráfico de Barras Relacionales**: Muestra los técnicos de la unidad en el eje X y la cantidad de casos asignados en el eje Y. Cada barra está segmentada en colores: Verde (En tiempo), Amarillo (Alerta), Rojo (Vencida).
    *   **Gráfico de Torta (Pie Chart)**: Distribución del tipo de denuncias recibidas en el periodo seleccionado (Corrupción vs. Negación de Información).
    *   **Gráfico de Líneas**: Tendencia de denuncias ingresadas por mes en el año en curso.

#### 2. Bandeja de Admisión (Reemplaza Kanban General)
*   **Modelo de pestañas (tabs) en lugar de Kanban drag&drop** por ser mobile-friendly y reflejar los "gates" legales.
*   4 tabs principales:
    *   **Por admitir** — Denuncias `ingresada`. Listado ordenado por plazo ascendente. Cada card → Sheet lateral con botones [Admitir] [Rechazar].
    *   **Por asignar** — Denuncias `admitida` sin técnico. Botón placeholder "Asignar técnico (Sprint 3)".
    *   **Rechazadas** — Denuncias `rechazada` con justificación visible en la card.
    *   **Visión general** — 6 ContadorCards: Ingresadas, Admitidas, Asignadas, Investigación, Informe, Cerradas.
*   **Acciones desde las cards**:
    *   Click en card de **"Por admitir"** → Sheet con detalle completo + [Admitir] (justif. opcional) + [Rechazar] (justif. obligatoria)
    *   Click en card de **"Por asignar"** → Sheet con placeholder "Asignar técnico (Sprint 3)"
    *   Click en card de **"Rechazadas"** → Sheet read-only con justificación de rechazo
    *   **Modales**: `ModalAdmision.tsx` (justificación opcional, textarea) y `ModalRechazo.tsx` (justificación obligatoria, textarea con mínimo 10 caracteres, base legal referenciada)

---

### D. Panel del Técnico (Mis Casos + Mi Resumen)

Vista enfocada para evitar distracciones.

*   **Mis Casos (4 tabs por fase)**:
    *   **Bandeja de entrada** — Denuncias `asignada`. Botón [Iniciar investigación] cambia estado a `investigacion`.
    *   **Investigación** — Denuncias `investigacion`. Placeholder "Continuar (Sprint 4)".
    *   **Informe Final** — Denuncias `informe`. Placeholder "Continuar (Sprint 4)".
    *   **Cierre** — Denuncias `cerrada`. Sub-sección: Cerradas (cards normales) + Archivadas (Accordion colapsable con subestado `archivada`).
*   **Dropdown "Ver como:"** en el header — Permite cambiar de técnico mock (tec-1, tec-2, tec-3) para demostración sin autenticación.
*   **Mi Resumen (4 ContadorCards)**:
    *   **Activos** — Casos en `investigacion` + `informe` del técnico.
    *   **Vencidos** — Activos con plazo ≤ 0 días.
    *   **Por vencer** — Activos con plazo entre 1 y 5 días.
    *   **Cerrados** — Casos en `cerrada`.
    *   Mismo dropdown "Ver como:".
*   **Vista Detalle del Expediente (Split-Screen)**:
    Al hacer clic en una tarjeta, en lugar de navegar, se abre un panel lateral expandible (*Slide-over / Sheet*) que divide la pantalla en dos columnas:

    #### Columna Izquierda: Datos del Expediente
    *   Resumen del caso, documentos originales y lista de presuntos responsables (denunciados).
    *   *Seguridad*: Si el denunciante solicitó "Reserva de Identidad", los datos personales del mismo aparecen encriptados o pixelados, con un botón *"Ver Identidad"* que sólo se activa si el Jefe de Unidad autorizó el acceso, registrando dicha visualización en la bitácora de auditoría.

    #### Columna Derecha: Panel de Trabajo e Investigación (Pestañas Dinámicas)
    Para estructurar el flujo paralelo, se implementan 3 pestañas interactivas:

    1.  **Pestaña: Solicitudes de Información (To-Do List)**:
        *   Botón: "➕ Nueva Solicitud". Abre modal para indicar: *Entidad/Unidad Destino*, *Detalle de lo solicitado*, y *Plazo límite* (días hábiles).
        *   Listado de solicitudes enviadas. Cada fila muestra:
            *   Unidad y Plazo.
            *   Badge de Estado: `Pendiente` (Naranja) / `Recibida` (Verde).
            *   **Modal: Registrar Prórroga de Solicitud**: Permite registrar si la unidad externa pidió más tiempo (añade días hábiles, guarda descripción y permite adjuntar la carta de solicitud recibida).
            *   **Modal: Registrar Respuesta**: Abre un formulario para ingresar el detalle de lo recibido y subir los archivos de prueba correspondientes, cambiando el estado a `Recibida`.

    2.  **Pestaña: Descargo de Denunciados (Lista Individual)**:
        *   Lista de los denunciados del caso. Cada uno tiene su propia tarjeta de control:
            *   **Acción 1: Registrar Notificación (Modal)**: Formulario manual para registrar la fecha del aviso de cargo, el medio (nota física, WhatsApp, etc.), y adjuntar captura o documento de respaldo. Esto inicia automáticamente el temporizador de 10 días hábiles para este denunciado.
            *   **Acción 2: Registrar Prórroga de Descargo (Modal)**: Registra la ampliación excepcional de hasta 5 días hábiles a solicitud del denunciado, adjuntando su justificación.
            *   **Acción 3: Registrar Descargo Presentado (Modal)**: Formulario para redactar un resumen del descargo y subir los documentos presentados por el presunto responsable.

    3.  **Pestaña: Informe Final e Hito de Cierre**:
        *   **Formulario de Informe Final**:
            *   Dropdown: Clasificación de Responsabilidad (Penal, Civil, Administrativo, Sin Indicios, Medida Correctiva, Archivado).
            *   Input numérico: Número de Fojas.
            *   Upload: Documento digital del Informe Final escaneado dirigido a la MAE.
        *   **Formulario de Cierre de Caso**:
            *   Input de texto: Código oficial de control devuelto por el **SITPRECO**.
            *   Formulario manual de notificación de cierre al denunciante (medio, fecha y carga de acuse).
            *   Botón final: `Cerrar Expediente`.

---

### E. Módulo de Administración (Calendario e Infraestructura)

*   **Calendario de Feriados Dinámico**:
    *   Una interfaz de calendario anual (vista de cuadrícula de meses).
    *   El administrador selecciona el mes y año. Puede hacer clic sobre cualquier día para **marcar/desmarcar como no laborable** (feriados nacionales, departamentales o asuetos decretados de última hora).
    *   Al guardar, los días marcados se insertan en la tabla `holidays` de MySQL de manera inmediata, recalculando en segundo plano los plazos de todas las alertas activas en el sistema sin retrasos.
*   **Gestión de Usuarios**:
    *   Formulario simple para agregar técnicos y registradores, asignarles contraseñas y activar/desactivar sus cuentas.

---

## 4. Estética y Experiencia Premium (UI/UX)

*   **Paleta de Colores (Diseño Limpio e Institucional)**:
    *   *Fondo*: Gris ultra-claro (variables de oklch) con tarjetas de fondo blanco.
    *   *Primario (Institucional)*: Morado (`#690bb2`) para elementos de realce, marcas del menú activo, logo y acentos del dashboard.
    *   *Secundario (Institucional)*: Amarillo (`#fecd2a`) para llamadas de atención, alertas secundarias y detalles de foco de contraste.
*   **Animación en Transición de Tarjetas**:
    *   El paso de tarjetas en el Kanban del Jefe se realiza mediante efectos de arrastrar y soltar (*drag and drop* fluidos utilizando `@hello-pangea/dnd` o `dnd-kit`), con animaciones de reordenamiento sutiles.
*   **Micro-interacciones en Botones**:
    *   Efectos de hover con elevación sutil de sombra y cambios de escala mínimos (`scale-98` en clics).
    *   Uso intensivo de esqueletos de carga (*Skeleton screens* de shadcn/ui) en lugar de molestos spinners de carga generales, para dar una sensación de velocidad instantánea.
