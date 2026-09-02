> ⚠️ **Referencia histórica — diseño original Fase 0.** No es estado actual. Ver AI-CONTEXT.md.
#transparencia
# ðŸ–¥ï¸ Arquitectura de Vistas y DiseÃ±o de Interfaz (SPA)

> **Â¿QuÃ© es este documento?**
> Describe la estructura visual, la distribuciÃ³n de roles y la experiencia de usuario (UX) del sistema. Detalla cada pantalla, los paneles interactivos, los grÃ¡ficos del dashboard y la interacciÃ³n mediante ventanas modales, estructurado bajo el paradigma de una AplicaciÃ³n de PÃ¡gina Ãšnica (SPA) utilizando **React + Inertia.js + Tailwind CSS + shadcn/ui**.

---

## 1. Enfoque Single Page Application (SPA)

Para garantizar una experiencia premium, fluida e instantÃ¡nea, el sistema se diseÃ±arÃ¡ como una **SPA** utilizando **Inertia.js** como puente de datos:
- **Cero recargas de pÃ¡gina**: La transiciÃ³n entre el tablero Kanban, los detalles de las denuncias y el calendario de feriados es inmediata.
- **Contexto mediante Modales y Slide-overs**: En lugar de navegar a una pÃ¡gina nueva para realizar acciones sencillas (como asignar un tÃ©cnico o registrar un descargo), se abrirÃ¡n ventanas modales animadas o paneles deslizantes (*sheet* de shadcn/ui). Esto evita que el usuario pierda el hilo de lo que estÃ¡ analizando.
- **RetroalimentaciÃ³n en Tiempo Real**: Todo guardado de formulario dispararÃ¡ una notificaciÃ³n flotante (Toast) en la esquina inferior derecha confirmando el Ã©xito de la operaciÃ³n.

---

## 2. Matriz de Acceso a Vistas por Rol

| Vista / Pantalla                                   | Registrador |  TÃ©cnico  | Jefe de Unidad | Administrador | Ciudadano |
| -------------------------------------------------- | :-----------: | :-------: | :------------: | :-----------: | :-------: |
| **Buscador PÃºblico (Seguimiento)**                 |               |           |                |               | ðŸŸ¢ Acceso |
| **Registro de Nueva Denuncia**                     |   ðŸŸ¢ Acceso   |           |                |               |           |
| **Bandeja de AdmisiÃ³n** (4 tabs)                   |               |           |   ðŸŸ¢ Acceso    |               |           |
| **Mis Casos** (TÃ©cnico, 4 tabs)                    |               | ðŸŸ¢ Acceso |                |               |           |
| **Mi Resumen** (TÃ©cnico, contadores)               |               | ðŸŸ¢ Acceso |                |               |           |
| **Panel Detallado del Caso (Sheet lateral)**       |               | ðŸŸ¢ Acceso | ðŸŸ¢ *(Lectura)* |               |           |
| **Dashboard y Reportes GrÃ¡ficos**                  |               |           |   ðŸŸ¢ Acceso    |               |           |
| **Calendario de Feriados (AdministraciÃ³n)**        |               |           |   ðŸŸ¢ Acceso    |   ðŸŸ¢ Acceso   |           |
| **GestiÃ³n de Usuarios y Roles**                    |               |           |                |   ðŸŸ¢ Acceso   |           |

---

## 3. Estructura y DistribuciÃ³n de Vistas

### Layout General de la AplicaciÃ³n (Panel Interno)
Toda la interfaz interna (para funcionarios) compartirÃ¡ un mismo cascarÃ³n visual:
1. **Sidebar Izquierdo (Barra Lateral)**:
   - Logotipo institucional con efecto de desenfoque de fondo (*glassmorphism*).
   - MenÃº de navegaciÃ³n con iconos estilizados (`lucide-react`).
   - Indicador dinÃ¡mico de plazos (ej. un cÃ­rculo rojo con el nÃºmero de denuncias prÃ³ximas a vencer).
2. **Topbar Superior (Barra de Usuario)**:
   - Nombre de la UTLCC y Entidad.
   - Indicador de estado del sistema.
   - MenÃº desplegable del usuario (Perfil / Cerrar SesiÃ³n).
3. **Contenedor Central**: Espacio dinÃ¡mico donde se cargan las pÃ¡ginas de React sin recargar el navegador.

---

### A. Buscador PÃºblico de Seguimiento (Ciudadano)

Una vista minimalista, premium y sumamente clara, accesible sin credenciales.

*   **Pantalla de BÃºsqueda**:
    *   Fondo con gradiente sutil y tipografÃ­a moderna (Inter / Outfit).
    *   Un input central grande con icono de lupa para ingresar el **NÃºmero de Ticket** (ej. `DEN-2026-0004`).
    *   BotÃ³n flotante "Consultar Estado".
*   **Resultados de BÃºsqueda (SPA Transition)**:
    *   Al ingresar el ticket, se despliega una tarjeta central mediante una animaciÃ³n suave de fundido (*fade-in*).
    *   **LÃ­nea de Tiempo Visual (Steppers de shadcn/ui)**:
        *   `[RecepciÃ³n]` âž” `[EvaluaciÃ³n del Jefe]` âž” `[InvestigaciÃ³n]` âž” `[ResoluciÃ³n / Cierre]`
    *   **Detalle No Sensible visible**:
        *   **CÃ³digo de Denuncia**: `DEN-2026-0004`
        *   **Tipo**: CorrupciÃ³n / NegaciÃ³n de InformaciÃ³n.
        *   **Fase Actual**: En investigaciÃ³n.
        *   **Estado de Avance**: *"Se ha solicitado informaciÃ³n a la DirecciÃ³n Administrativa. Fecha estimada de recepciÃ³n: 02 de Julio de 2026."* (Oculta nombres de tÃ©cnicos, denunciados o detalles del hecho por confidencialidad).

---

### B. Vista de RecepciÃ³n (Registrador)

DiseÃ±ada para registrar denuncias de manera rÃ¡pida mientras el ciudadano estÃ¡ presente en la oficina.

*   **Bandeja de Entrada**:
    *   Listado tipo tabla con las denuncias creadas por el registrador en el dÃ­a, permitiendo verificar que los datos se subieron correctamente.
    *   BotÃ³n superior "âž• Registrar Nueva Denuncia".
*   **Formulario Modal Multi-paso (Nueva Denuncia)**:
    Para no abrumar con un formulario largo, se dividirÃ¡ en 3 pestaÃ±as dinÃ¡micas en el modal:
    1.  **Paso 1: Denunciante**:
        *   Checkbox toggle: "Â¿Es denuncia anÃ³nima?". Si se activa, deshabilita y limpia los campos de nombres, cÃ©dula y telÃ©fono.
        *   Checkbox toggle: "Solicita Reserva de Identidad" (activa un flag de seguridad en la base de datos).
    2.  **Paso 2: Denuncia y RelaciÃ³n de Hechos**:
        *   Dropdown: Tipo de Denuncia (CorrupciÃ³n / NegaciÃ³n de InformaciÃ³n).
        *   Textarea enriquecido: RelaciÃ³n detallada de los hechos.
        *   Datepicker: Periodo o fecha aproximada del hecho.
        *   Input de texto opcional: ID o CÃ³digo de denuncia enlazada (antecedentes).
    3.  **Paso 3: Presuntos Responsables y Pruebas**:
        *   **Repetidor DinÃ¡mico de Denunciados**: BotÃ³n "Agregar Denunciado" que aÃ±ade inputs de Nombre, Cargo y Unidad Organizacional de manera dinÃ¡mica (React state).
        *   **Zona de Carga (Drag & Drop)**: Ãrea de arrastre de archivos con validaciÃ³n en caliente de tamaÃ±o (mÃ¡x 10MB) y formato (`PDF`, `PNG`, `JPG`, `DOCX`).
    *   *AcciÃ³n al finalizar*: Genera un modal secundario de Ã©xito con el ticket en grande y botÃ³n de "Imprimir Comprobante" para el denunciante.

---

### C. Panel del Jefe de Unidad (Dashboard & Control)

El centro de control de la UTLCC.

#### 1. MÃ³dulo de Reportes GrÃ¡ficos (Dashboard)
*   **KPI Cards (Widgets de Resumen)**:
    *   *Denuncias Activas*: NÃºmero total en curso.
    *   *Pendientes de AdmisiÃ³n*: Con fondo amarillo parpadeante si hay casos cerca de cumplir los 5 dÃ­as de plazo lÃ­mite.
    *   *Cumplimiento de Plazo*: Porcentaje de casos resueltos en tiempo.
*   **SecciÃ³n de GrÃ¡ficos (Recharts)**:
    *   **GrÃ¡fico de Barras Relacionales**: Muestra los tÃ©cnicos de la unidad en el eje X y la cantidad de casos asignados en el eje Y. Cada barra estÃ¡ segmentada en colores: Verde (En tiempo), Amarillo (Alerta), Rojo (Vencida).
    *   **GrÃ¡fico de Torta (Pie Chart)**: DistribuciÃ³n del tipo de denuncias recibidas en el periodo seleccionado (CorrupciÃ³n vs. NegaciÃ³n de InformaciÃ³n).
    *   **GrÃ¡fico de LÃ­neas**: Tendencia de denuncias ingresadas por mes en el aÃ±o en curso.

#### 2. Bandeja de AdmisiÃ³n (Reemplaza Kanban General)
*   **Modelo de pestaÃ±as (tabs) en lugar de Kanban drag&drop** por ser mobile-friendly y reflejar los "gates" legales.
*   4 tabs principales:
    *   **Por admitir** â€” Denuncias `ingresada`. Listado ordenado por plazo ascendente. Cada card â†’ Sheet lateral con botones [Admitir] [Rechazar].
    *   **Por asignar** â€” Denuncias `admitida` sin tÃ©cnico. BotÃ³n placeholder "Asignar tÃ©cnico (Sprint 3)".
    *   **Rechazadas** â€” Denuncias `rechazada` con justificaciÃ³n visible en la card.
    *   **VisiÃ³n general** â€” 6 ContadorCards: Ingresadas, Admitidas, Asignadas, InvestigaciÃ³n, Informe, Cerradas.
*   **Acciones desde las cards**:
    *   Click en card de **"Por admitir"** â†’ Sheet con detalle completo + [Admitir] (justif. opcional) + [Rechazar] (justif. obligatoria)
    *   Click en card de **"Por asignar"** â†’ Sheet con placeholder "Asignar tÃ©cnico (Sprint 3)"
    *   Click en card de **"Rechazadas"** â†’ Sheet read-only con justificaciÃ³n de rechazo
    *   **Modales**: `ModalAdmision.tsx` (justificaciÃ³n opcional, textarea) y `ModalRechazo.tsx` (justificaciÃ³n obligatoria, textarea con mÃ­nimo 10 caracteres, base legal referenciada)

---

### D. Panel del TÃ©cnico (Mis Casos + Mi Resumen)

Vista enfocada para evitar distracciones.

*   **Mis Casos (4 tabs por fase)**:
    *   **Bandeja de entrada** â€” Denuncias `asignada`. BotÃ³n [Iniciar investigaciÃ³n] cambia estado a `investigacion`.
    *   **InvestigaciÃ³n** â€” Denuncias `investigacion`. Placeholder "Continuar (Sprint 4)".
    *   **Informe Final** â€” Denuncias `informe`. Placeholder "Continuar (Sprint 4)".
    *   **Cierre** â€” Denuncias `cerrada`. Sub-secciÃ³n: Cerradas (cards normales) + Archivadas (Accordion colapsable con subestado `archivada`).
*   **Dropdown "Ver como:"** en el header â€” Permite cambiar de tÃ©cnico mock (tec-1, tec-2, tec-3) para demostraciÃ³n sin autenticaciÃ³n.
*   **Mi Resumen (4 ContadorCards)**:
    *   **Activos** â€” Casos en `investigacion` + `informe` del tÃ©cnico.
    *   **Vencidos** â€” Activos con plazo â‰¤ 0 dÃ­as.
    *   **Por vencer** â€” Activos con plazo entre 1 y 5 dÃ­as.
    *   **Cerrados** â€” Casos en `cerrada`.
    *   Mismo dropdown "Ver como:".
*   **Vista Detalle del Expediente (Split-Screen)**:
    Al hacer clic en una tarjeta, en lugar de navegar, se abre un panel lateral expandible (*Slide-over / Sheet*) que divide la pantalla en dos columnas:

    #### Columna Izquierda: Datos del Expediente
    *   Resumen del caso, documentos originales y lista de presuntos responsables (denunciados).
    *   *Seguridad*: Si el denunciante solicitÃ³ "Reserva de Identidad", los datos personales del mismo aparecen encriptados o pixelados, con un botÃ³n *"Ver Identidad"* que sÃ³lo se activa si el Jefe de Unidad autorizÃ³ el acceso, registrando dicha visualizaciÃ³n en la bitÃ¡cora de auditorÃ­a.

    #### Columna Derecha: Panel de Trabajo e InvestigaciÃ³n (PestaÃ±as DinÃ¡micas)
    Para estructurar el flujo paralelo, se implementan 3 pestaÃ±as interactivas:

    1.  **PestaÃ±a: Solicitudes de InformaciÃ³n (To-Do List)**:
        *   BotÃ³n: "âž• Nueva Solicitud". Abre modal para indicar: *Entidad/Unidad Destino*, *Detalle de lo solicitado*, y *Plazo lÃ­mite* (dÃ­as hÃ¡biles).
        *   Listado de solicitudes enviadas. Cada fila muestra:
            *   Unidad y Plazo.
            *   Badge de Estado: `Pendiente` (Naranja) / `Recibida` (Verde).
            *   **Modal: Registrar PrÃ³rroga de Solicitud**: Permite registrar si la unidad externa pidiÃ³ mÃ¡s tiempo (aÃ±ade dÃ­as hÃ¡biles, guarda descripciÃ³n y permite adjuntar la carta de solicitud recibida).
            *   **Modal: Registrar Respuesta**: Abre un formulario para ingresar el detalle de lo recibido y subir los archivos de prueba correspondientes, cambiando el estado a `Recibida`.

    2.  **PestaÃ±a: Descargo de Denunciados (Lista Individual)**:
        *   Lista de los denunciados del caso. Cada uno tiene su propia tarjeta de control:
            *   **AcciÃ³n 1: Registrar NotificaciÃ³n (Modal)**: Formulario manual para registrar la fecha del aviso de cargo, el medio (nota fÃ­sica, WhatsApp, etc.), y adjuntar captura o documento de respaldo. Esto inicia automÃ¡ticamente el temporizador de 10 dÃ­as hÃ¡biles para este denunciado.
            *   **AcciÃ³n 2: Registrar PrÃ³rroga de Descargo (Modal)**: Registra la ampliaciÃ³n excepcional de hasta 5 dÃ­as hÃ¡biles a solicitud del denunciado, adjuntando su justificaciÃ³n.
            *   **AcciÃ³n 3: Registrar Descargo Presentado (Modal)**: Formulario para redactar un resumen del descargo y subir los documentos presentados por el presunto responsable.

    3.  **PestaÃ±a: Informe Final e Hito de Cierre**:
        *   **Formulario de Informe Final**:
            *   Dropdown: ClasificaciÃ³n de Responsabilidad (Penal, Civil, Administrativo, Sin Indicios, Medida Correctiva, Archivado).
            *   Input numÃ©rico: NÃºmero de Fojas.
            *   Upload: Documento digital del Informe Final escaneado dirigido a la MAE.
        *   **Formulario de Cierre de Caso**:
            *   Input de texto: CÃ³digo oficial de control devuelto por el **SITPRECO**.
            *   Formulario manual de notificaciÃ³n de cierre al denunciante (medio, fecha y carga de acuse).
            *   BotÃ³n final: `Cerrar Expediente`.

---

### E. MÃ³dulo de AdministraciÃ³n (Calendario e Infraestructura)

*   **Calendario de Feriados DinÃ¡mico**:
    *   Una interfaz de calendario anual (vista de cuadrÃ­cula de meses).
    *   El administrador selecciona el mes y aÃ±o. Puede hacer clic sobre cualquier dÃ­a para **marcar/desmarcar como no laborable** (feriados nacionales, departamentales o asuetos decretados de Ãºltima hora).
    *   Al guardar, los dÃ­as marcados se insertan en la tabla `holidays` de MySQL de manera inmediata, recalculando en segundo plano los plazos de todas las alertas activas en el sistema sin retrasos.
*   **GestiÃ³n de Usuarios**:
    *   Formulario simple para agregar tÃ©cnicos y registradores, asignarles contraseÃ±as y activar/desactivar sus cuentas.

---

## 4. EstÃ©tica y Experiencia Premium (UI/UX)

*   **Paleta de Colores (DiseÃ±o Limpio e Institucional)**:
    *   *Fondo*: Gris ultra-claro (variables de oklch) con tarjetas de fondo blanco.
    *   *Primario (Institucional)*: Morado (`#690bb2`) para elementos de realce, marcas del menÃº activo, logo y acentos del dashboard.
    *   *Secundario (Institucional)*: Amarillo (`#fecd2a`) para llamadas de atenciÃ³n, alertas secundarias y detalles de foco de contraste.
*   **AnimaciÃ³n en TransiciÃ³n de Tarjetas**:
    *   El paso de tarjetas en el Kanban del Jefe se realiza mediante efectos de arrastrar y soltar (*drag and drop* fluidos utilizando `@hello-pangea/dnd` o `dnd-kit`), con animaciones de reordenamiento sutiles.
*   **Micro-interacciones en Botones**:
    *   Efectos de hover con elevaciÃ³n sutil de sombra y cambios de escala mÃ­nimos (`scale-98` en clics).
    *   Uso intensivo de esqueletos de carga (*Skeleton screens* de shadcn/ui) en lugar de molestos spinners de carga generales, para dar una sensaciÃ³n de velocidad instantÃ¡nea.

