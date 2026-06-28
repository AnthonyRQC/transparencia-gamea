# Sprint 4 — Investigación (Solicitudes + Descargos + Saltar Fase) ✅ COMPLETADO

> **Plan detallado** — Basado en las decisiones tomadas con el cliente.
> Sprint 4 mantiene la Fase 0 (sin BD, mock en sesión).

---

## 0. Resumen y Contexto del Sprint

**Problema original**: Al terminar Sprint 3, el Técnico podía ver sus casos asignados y el Jefe gestionaba admisión/asignación/traspaso, pero:

| Problema | Solución Sprint 4 |
|---|---|
| El Sheet mostraba toda la info de golpe, no había espacio de trabajo para el Técnico | Refactor del Sheet a 3 tabs (Información / Solicitudes / Descargos) |
| No se podía solicitar documentación a unidades externas | TabSolicitudes con SolicitudCard + 3 modales (Nueva, Responder, Ampliar) |
| No se gestionaban los descargos de los denunciados | TabDescargos con DescargoCard + 3 modales (Notificar, Responder, Ampliar) |
| No había forma de saltar la fase de investigación si la evidencia era suficiente | SaltarFaseButton con justificación obligatoria + warning de pendientes |
| No había progreso visual de plazos en solicitudes/descargos | PlazoProgress con barra verde/amarillo/roja |
| No se sabía cuándo vencía cada solicitud o descargo | Fechas contextuales + tooltips + orden por vencimiento |

---

## 1. Objetivos del Sprint

- ✅ Refactor del DenunciaSheet a estructura de **3 tabs** (Información, Solicitudes, Descargos)
- ✅ Técnico puede **crear solicitudes** a unidades externas (select de unidad + detalle + plazo 10 días)
- ✅ Técnico puede **responder solicitudes** (respuesta + archivos adjuntos)
- ✅ Técnico puede **ampliar solicitudes** (prórroga hasta 5 días + justificación + archivo)
- ✅ Cada solicitud se gestiona **de forma independiente** (plazo propio, estado propio, respuesta propia)
- ✅ Técnico puede **notificar descargo** a cada denunciado (fecha + medio + respaldo)
- ✅ Técnico puede **recibir descargos** (resumen + documentos)
- ✅ Técnico puede **ampliar descargos** (prórroga hasta 5 días + justificación)
- ✅ Cada descargo se gestiona **de forma independiente** (medio distinto, plazo distinto)
- ✅ **Saltar fase** con justificación obligatoria desde investigación → informe
- ✅ **PlazoProgress** visual en cada card (verde >5d / amarillo 1-5d / rojo ≤0)
- ✅ **Bandeja = read-only** en Solicitudes/Descargos (jefe ve progreso, no actúa)
- ✅ **MisCasos = con acciones** (técnico actúa; dropdown "Ver como:" permite al jefe simular)

---

## 2. Arquitectura

### 2.1 DenunciaSheet — Refactor a Tabs

```
┌──────────────────────────────────────────────────┐
│ [Información]  [Solicitudes (3)]  [Descargos (2)] │
├──────────────────────────────────────────────────┤
│ Tab activa renderiza su contenido con scroll propio│
└──────────────────────────────────────────────────┘
```

**Visibilidad de tabs por estado:**

| Estado | Información | Solicitudes | Descargos |
|--------|:-----------:|:-----------:|:---------:|
| ingresada | ✅ | ❌ | ❌ |
| admitida | ✅ | ❌ | ❌ |
| asignada | ✅ | ✅ (read-only) | ✅ (crear descargo) |
| investigacion | ✅ | ✅ | ✅ |
| informe | ✅ | ✅ | ✅ |
| cerrada | ✅ | ✅ (read-only) | ✅ (read-only) |
| rechazada | ✅ | ❌ | ❌ |

### 2.2 Modelo de Datos

#### SolicitudData — estructura por item

```php
[
    'id' => 1,
    'ticket' => 'DEN-2026-0008',
    'unidad_destino' => 'Unidad de Sistemas',          // desde UnidadData
    'detalle' => 'Solicitar grabaciones de video del día 15/01...',
    'plazo_dias' => 10,                                  // fijo por ley
    'fecha_envio' => '2026-06-20 10:30:00',
    'fecha_vencimiento' => '2026-06-30 23:59:00',        // fecha_envio + 10 días
    'fecha_respuesta' => null,                           // fecha de cuando respondieron
    'respuesta' => null,                                 // texto de la respuesta
    'archivos' => [                                      // archivos recibidos
        ['nombre' => 'informe_grabaciones.pdf', 'tamano' => '1.2 MB', 'fecha_subida' => '...']
    ],
    'estado' => 'pendiente',                             // pendiente|respondida|vencida|ampliada
    'ampliaciones' => [                                  // prórrogas solicitadas
        ['dias' => 5, 'justificacion' => '...', 'fecha' => '...', 'archivo' => null]
    ],
]
```

#### DescargoData — estructura por item

```php
[
    'id' => 1,
    'ticket' => 'DEN-2026-0008',
    'denunciado_idx' => 0,                               // índice del denunciado en la denuncia
    'nombres_denunciado' => 'Marcelo Álvarez',           // redundante para búsqueda rápida
    'dependencia_denunciado' => 'Unidad de Contrataciones',
    'fecha_notificacion' => null,                        // fecha del aviso/alegato
    'medio' => null,                                     // personal|cedula|email|otro
    'respaldo_archivo' => null,                          // {nombre, tamano}
    'fecha_vencimiento' => null,                         // fecha_notificacion + 10 días
    'fecha_respuesta' => null,
    'resumen_descargo' => null,
    'documentos' => [],
    'estado' => 'pendiente_notif',                       // pendiente_notif|notificado|respondido|vencido|ampliado
    'ampliaciones' => [],
]
```

### 2.3 UnidadData — Catálogo

```php
[
    'sistemas'       => 'Unidad de Sistemas',
    'adquisiciones'  => 'Dirección de Adquisiciones',
    'recursos-humanos' => 'Dirección de Recursos Humanos',
    'transito'       => 'Dirección de Tránsito',
    'catastro'       => 'Unidad de Catastro',
    'obras-publicas' => 'Dirección de Obras Públicas',
    'ingresos'       => 'Dirección de Ingresos',
    'secretaria-general' => 'Secretaría General',
    'contrataciones' => 'Unidad de Contrataciones',
    'hacienda'       => 'Dirección de Hacienda',
    'auditoria'      => 'Unidad de Auditoría Interna',
    'archivo'        => 'Archivo Central',
    'ministerio-justicia' => 'Ministerio de Justicia y Transparencia Institucional',
]
```

### 2.4 Bandeja (Jefe) vs MisCasos (Técnico)

| Aspecto | Bandeja | MisCasos |
|---------|---------|----------|
| **Propósito** | Admisión, asignación, traspaso, reapertura | Gestión del caso (solicitudes, descargos, informe) |
| **Solicitudes/Descargos** | Read-only (botones ocultos) | Con acciones (botones visibles) |
| **Acción desde sheet** | Admitir, Rechazar, Asignar, Traspasar, Reabrir | Iniciar investigación, Pasar a Informe Final |
| **Dropdown "Ver como:"** | No aplica | Sí, permite al Jefe simular ser técnico |
| **Texto informativo** | — | "Modo lectura — use MisCasos con 'Ver como:' para actuar" |

### 2.5 SaltarFaseButton

- Visible solo cuando `estado === 'investigacion'`
- Abre modal con textarea de justificación (mín 20 caracteres)
- Warning contextual: "⚠️ Quedan 2 solicitudes pendientes y 1 descargo sin notificar"
- Al confirmar: `estado → 'informe'`, registro en bitácora con acción `saltar_fase`
- Cambia estado a `informe` para que el Sprint 5 continúe con el Informe Final

---

## 3. Archivos del Sprint

### 3.1 Backend — Crear

| Archivo | Descripción |
|---|---|
| `app/Data/UnidadData.php` | Catálogo de 13 unidades externas GAMEA y Ministerio |
| `app/Data/SolicitudData.php` | Colección de solicitudes mock (sesión) + CRUD |
| `app/Data/DescargoData.php` | Colección de descargos mock (sesión) + CRUD |
| `app/Http/Controllers/SolicitudController.php` | Endpoints: store, responder, ampliar |
| `app/Http/Controllers/DescargoController.php` | Endpoints: store, notificar, responder, ampliar |

### 3.2 Backend — Modificar

| Archivo | Cambio |
|---|---|
| `app/Data/DenunciaData.php` | +getSolicitudes(ticket), +getDescargos(ticket), +saltarFase(). Bitácora ampliada con 7 acciones nuevas. Seed con 3 solicitudes y 2 descargos demo. |
| `app/Http/Controllers/DenunciaController.php` | +método saltarFase() con validación justificación min:20 |
| `app/Http/Controllers/BandejaController.php` | +props: solicitudesByTicket, descargosByTicket |
| `app/Http/Controllers/MisCasosController.php` | +props: solicitudesByTicket, descargosByTicket |
| `routes/web.php` | +8 rutas nuevas |

### 3.3 Frontend — Crear

| Archivo | Descripción |
|---|---|
| `Components/Denuncias/PlazoProgress.tsx` | Progress bar reutilizable con color+texto contextual |
| `Components/Denuncias/ArchivoAdjunto.tsx` | Visual ícono+nombre+tamaño+botón Ver |
| `Components/Denuncias/SolicitudCard.tsx` | Card con unidad destino + badge estado + PlazoProgress + acciones |
| `Components/Denuncias/DescargoCard.tsx` | Card con avatar/iniciales + badge estado + PlazoProgress + acciones |
| `Components/Denuncias/TabSolicitudes.tsx` | Lista única ordenada por vencimiento, botón "Nueva solicitud", empty state |
| `Components/Denuncias/TabDescargos.tsx` | Lista única ordenada por vencimiento, botón "Notificar a todos", empty state |
| `Components/Denuncias/ModalNuevaSolicitud.tsx` | Select unidad + textarea detalle |
| `Components/Denuncias/ModalResponderSolicitud.tsx` | Textarea respuesta + mock upload archivos |
| `Components/Denuncias/ModalAmpliarSolicitud.tsx` | Input días + textarea justificación + mock archivo |
| `Components/Denuncias/ModalNotificarDescargo.tsx` | DatePicker + select medio + mock respaldo |
| `Components/Denuncias/ModalResponderDescargo.tsx` | Textarea resumen + mock upload documentos |
| `Components/Denuncias/ModalAmpliarDescargo.tsx` | Input días + textarea justificación |
| `Components/Denuncias/SaltarFaseButton.tsx` | Botón + modal con justificación + warning pendientes |

### 3.4 Frontend — Modificar

| Archivo | Cambio |
|---|---|
| `DenunciaSheet.tsx` | **Refactor mayor**: Tabs shadcn (Información/Solicitudes/Descargos). Tab Información = secciones actuales. Tabs Solicitudes/Descargos con badged count y visibilidad condicional. Modo Bandeja (canAct=false) vs MisCasos (canAct=true). |
| `Bandeja.tsx` | +modal states (nuevaSolicitud, responderSolicitud, ampliarSolicitud, notificarDescargo, responderDescargo, ampliarDescargo, saltarFase). Pasar props solicitudesByTicket + descargosByTicket. Modales renderizados pero acciones ocultas. |
| `MisCasos.tsx` | Reemplazar placeholder "Continuar (Sprint 4)" por SaltarFaseButton. Modal states + handlers. Dropdown "Ver como:" integrado. |

### 3.5 Rutas nuevas (Sprint 4)

```php
POST /denuncias/{ticket}/solicitudes              → SolicitudController@store          (crear solicitud)
POST /solicitudes/{id}/responder                  → SolicitudController@responder      (responder solicitud)
POST /solicitudes/{id}/ampliar                    → SolicitudController@ampliar        (ampliar solicitud)

POST /denuncias/{ticket}/descargos                → DescargoController@store           (crear descargo)
POST /descargos/{id}/notificar                    → DescargoController@notificar       (notificar descargo)
POST /descargos/{id}/responder                    → DescargoController@responder       (responder descargo)
POST /descargos/{id}/ampliar                      → DescargoController@ampliar         (ampliar descargo)

POST /denuncias/{ticket}/saltar-fase              → DenunciaController@saltarFase      (saltar a informe)
```

---

## 4. Milestones

### M4.1 — Foundation Backend ✅

| # | Tarea | Archivo |
|---|---|---|
| 1 | Crear UnidadData con catálogo de 13 unidades | `app/Data/UnidadData.php` |
| 2 | Crear SolicitudData con CRUD + estructura de datos | `app/Data/SolicitudData.php` |
| 3 | Crear DescargoData con CRUD + estructura de datos | `app/Data/DescargoData.php` |
| 4 | Modificar DenunciaData: getSolicitudes, getDescargos, saltarFase, bitácora ampliada | `app/Data/DenunciaData.php` |
| 5 | Crear SolicitudController con store/responder/ampliar | `app/Http/Controllers/SolicitudController.php` |
| 6 | Crear DescargoController con store/notificar/responder/ampliar | `app/Http/Controllers/DescargoController.php` |
| 7 | Modificar DenunciaController con saltarFase | `app/Http/Controllers/DenunciaController.php` |
| 8 | Modificar BandejaController (solicitudesByTicket, descargosByTicket) | `app/Http/Controllers/BandejaController.php` |
| 9 | Modificar MisCasosController (ídem) | `app/Http/Controllers/MisCasosController.php` |
| 10 | Registrar 8 rutas nuevas | `routes/web.php` |

### M4.2 — PlazoProgress + ArchivoAdjunto ✅

| # | Tarea | Archivo |
|---|---|---|
| 11 | Crear PlazoProgress (progress bar + colores + texto contextual) | `Components/Denuncias/PlazoProgress.tsx` |
| 12 | Crear ArchivoAdjunto (ícono + nombre + tamaño + botón Ver) | `Components/Denuncias/ArchivoAdjunto.tsx` |

### M4.3 — Tab Solicitudes completa ✅

| # | Tarea | Archivo |
|---|---|---|
| 13 | Crear SolicitudCard | `Components/Denuncias/SolicitudCard.tsx` |
| 14 | Crear ModalNuevaSolicitud | `Components/Denuncias/ModalNuevaSolicitud.tsx` |
| 15 | Crear ModalResponderSolicitud | `Components/Denuncias/ModalResponderSolicitud.tsx` |
| 16 | Crear ModalAmpliarSolicitud | `Components/Denuncias/ModalAmpliarSolicitud.tsx` |
| 17 | Crear TabSolicitudes | `Components/Denuncias/TabSolicitudes.tsx` |

### M4.4 — Tab Descargos completa ✅

| # | Tarea | Archivo |
|---|---|---|
| 18 | Crear DescargoCard | `Components/Denuncias/DescargoCard.tsx` |
| 19 | Crear ModalNotificarDescargo | `Components/Denuncias/ModalNotificarDescargo.tsx` |
| 20 | Crear ModalResponderDescargo | `Components/Denuncias/ModalResponderDescargo.tsx` |
| 21 | Crear ModalAmpliarDescargo | `Components/Denuncias/ModalAmpliarDescargo.tsx` |
| 22 | Crear TabDescargos | `Components/Denuncias/TabDescargos.tsx` |

### M4.5 — Refactor DenunciaSheet ✅

| # | Tarea | Archivo |
|---|---|---|
| 23 | Convertir DenunciaSheet a estructura Tabs (Información / Solicitudes / Descargos) | `DenunciaSheet.tsx` |
| 24 | Tab Información conserva secciones actuales | `DenunciaSheet.tsx` |
| 25 | Tabs Solicitudes y Descargos con badge de count | `DenunciaSheet.tsx` |
| 26 | Visibilidad condicional por estado | `DenunciaSheet.tsx` |
| 27 | Modo read-only vs acciones según canAct | `DenunciaSheet.tsx` |

### M4.6 — Saltar Fase ✅

| # | Tarea | Archivo |
|---|---|---|
| 28 | Crear SaltarFaseButton + modal | `Components/Denuncias/SaltarFaseButton.tsx` |
| 29 | Warning de items pendientes | `Components/Denuncias/SaltarFaseButton.tsx` |

### M4.7 — Integración Bandeja y MisCasos ✅

| # | Tarea | Archivo |
|---|---|---|
| 30 | Modales y props en Bandeja | `Bandeja.tsx` |
| 31 | Modales y props en MisCasos + reemplazar placeholder | `MisCasos.tsx` |

### M4.8 — Seed + Polish ✅

| # | Tarea | Archivo |
|---|---|---|
| 32 | Seed de 3 solicitudes demo + 2 descargos demo | `DenunciaData.php` |
| 33 | Reset de state en modales | Todos los modales |
| 34 | Tooltips de fechas exactas | PlazoProgress + SolicitudCard + DescargoCard |
| 35 | Validaciones frontend (min/max chars) | Todos los modales |
| 36 | Toast de éxito/error en cada acción | Controllers + modales |
| 37 | Actualizar AI-CONTEXT.md | Documentación |
| 38 | Actualizar Plan de Desarrollo.md | Documentación |
| 39 | Crear este documento | Documentación |

---

## 5. Decisiones del Sprint

| # | Decisión | Alternativa descartada | Motivo |
|---|---|---|---|
| 1 | **Sheet con Tabs arriba** | Scroll único o modales separados | 3 áreas de trabajo independientes, cada una con scroll propio |
| 2 | **Solicitudes/Descargos independientes** | Agrupados por denunciado | Plazos legales independientes, respuestas en momentos distintos |
| 3 | **Lista única + PlazoProgress** | Sub-tabs por estado | Menos clics, progreso visual inmediato, orden inteligente |
| 4 | **Plazos en días naturales** | Días hábiles | Sprint 8 implementará el calendario de feriados |
| 5 | **Bandeja read-only en Solicitudes/Descargos** | Ocultar tabs | El Jefe debe monitorear el progreso de todos los técnicos |
| 6 | **MisCasos con acciones completas** | Sin acciones en tabs | El técnico asignado es quien gestiona el caso |
| 7 | **Dropdown "Ver como:" permite al Jefe actuar** | Separar roles estrictamente | El Jefe supervisa y puede intervenir en casos urgentes |
| 8 | **SaltarFase SIEMPRE pide justificación** | Solo si hay pendientes | La ley exige justificación excepcional para cualquier omisión de fase (Art. 30) |
| 9 | **Plazo solicitud = 10 días** | 5, 15 o 30 | Art. 25 §I y III de Ley 974 |
| 10 | **Plazo descargo = 10 días + 5 prórroga** | 15 fijo | Art. 25 §IV de Ley 974 |
| 11 | **Archivos visuales (ícono + nombre + tamaño + Ver)** | Solo texto | Mejor experiencia de usuario, feedback visual inmediato |
| 12 | **Seed demo incluido** | Sin seed | El técnico necesita ver datos realistas para testear |

---

## 6. Fuera de Alcance (Sprint 5+)

| Funcionalidad | Sprint |
|---|---|
| Informe Final con clasificación (Penal/Civil/Administrativo/Sin Indicios/Medida Correctiva/Archivado) | Sprint 5 |
| Cierre con SITPRECO + notificación | Sprint 5 |
| Seguimiento público (consulta por ticket) | Sprint 6 |
| Dashboard + Reportes (Recharts) | Sprint 7 |
| Días hábiles + Calendario feriados | Sprint 8 |
| Notificaciones automáticas a unidades/denunciados | Futuro |
| Subida de archivos real (no mock) | Futuro |
| Auditoría real de quién actuó (jefe vs técnico en el dropdown) | Futuro (con BD) |

---

## 7. Notas para Sprint 5+ (Perspectiva Técnica)

### Dropdown "Ver como:" y auditoría

Cuando se implemente la BD real, las acciones realizadas en MisCasos con el dropdown "Ver como:" activo deben registrar el `usuario_id` real del actor (Jefe o Técnico), NO del técnico simulado por el parámetro `?tecnico=` de la URL.

Esto requiere:
1. Modificar `SolicitudData.php` y `DescargoData.php` para aceptar un parámetro `usuario_actor` en cada método de acción
2. Modificar los Controllers para propagar `auth()->id()` en lugar del parámetro `?tecnico=`
3. La bitácora de la denuncia también debe usar `usuario_actor` real
4. En Fase 0 (mock, sin usuarios individuales en sesión) esto NO es posible, por lo que se usa 'sistema' genérico

### Persistencia de filtros

- Los filtros de Bandeja (búsqueda, tipo, sort) se pierden al recargar la página.
- Opción: almacenar en `localStorage` o como query params en la URL para compartir/enlazar.

### Días hábiles

- Sprint 4 usa días naturales para plazos de solicitudes y descargos.
- Sprint 8 implementará el calendario de feriados y los helpers de cálculo de días hábiles (Carbon + feriados).
- En ese momento, `SolicitudData.getPlazoInfo()` y `DescargoData.getPlazoInfo()` deberán actualizarse para usar el helper.

---

## 8. Actualizaciones a Otros Documentos

✅ Completadas. Ver estado actual en cada documento.

| Documento | Cambio |
|---|---|
| `AI-CONTEXT.md` | Sprint 4 → **EN EJECUCIÓN 🔄**. Sección "Arquitectura Clave" ampliada. "Próximo Sprint" → Sprint 5. |
| `Plan de Desarrollo.md` | Sprint 4 detallado con componentes, backend, decisiones. Nota a futuro sobre dropdown + auditoría. |
| Este documento | Creado con detalle completo del Sprint 4. |

---

## 9. Decisiones de Arquitectura Técnica

| Aspecto | Decisión |
|---|---|
| **URLs POST** | Siempre Ziggy `route()` para respetar subdirectorio `/transparencia/public/` |
| **Bitácora** | Array dentro de cada denuncia en sesión. Cada acción de solicitud/descargo registra automáticamente entrada en bitácora con ticket de la denuncia. |
| **PlazoProgress** | Componente reutilizable con progress bar shadcn + color según días restantes + texto contextual. Verde >5d, Amarillo 1-5d, Rojo ≤0. |
| **Estado vencido** | Se calcula al leer (no se persiste). Si `fecha_vencimiento < now()` y `estado !== 'respondida'`, se muestra como vencido. |
| **Ordenamiento** | Cliente-side. Default: fecha_vencimiento ascendente. Los items con `fecha_vencimiento < now()` y no respondidos van al final con estilo destacado. |
| **canAct** | Flag booleano. `false` en Bandeja (read-only), `true` en MisCasos (con acciones). El Sheet lo recibe como prop y oculta/muestra botones según corresponda. |
| **Modal state** | `useState` con ticket/id en Bandeja/MisCasos. `useEffect` resetea campos al abrir (patrón Sprint 3). |
| **Seed** | 3 solicitudes (1 pendiente, 1 respondida, 1 vencida) + 2 descargos (1 notificado, 1 respondido). Asociados a DEN-2026-0008 (investigacion) y DEN-2026-0010 (informe). |
