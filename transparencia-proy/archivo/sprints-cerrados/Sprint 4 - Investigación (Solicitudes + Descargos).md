> ⚠️ **Histórico — Sprint cerrado Jul 2026 (Laravel 11).** Snapshot al cierre, no refleja refactorización Bloques 0-2 (Sep 2026, Laravel 13). Para estado actual ver AI-CONTEXT.md y Notas Reestructuración - Bloques 0-2 (Sept 2026) - Cierre.md.
# Sprint 4 â€” InvestigaciÃ³n (Solicitudes + Descargos + Saltar Fase) âœ… COMPLETADO

> **Plan detallado** â€” Basado en las decisiones tomadas con el cliente.
> Sprint 4 mantiene la Fase 0 (sin BD, mock en sesiÃ³n).

---

## 0. Resumen y Contexto del Sprint

**Problema original**: Al terminar Sprint 3, el TÃ©cnico podÃ­a ver sus casos asignados y el Jefe gestionaba admisiÃ³n/asignaciÃ³n/traspaso, pero:

| Problema | SoluciÃ³n Sprint 4 |
|---|---|
| El Sheet mostraba toda la info de golpe, no habÃ­a espacio de trabajo para el TÃ©cnico | Refactor del Sheet a 3 tabs (InformaciÃ³n / Solicitudes / Descargos) |
| No se podÃ­a solicitar documentaciÃ³n a unidades externas | TabSolicitudes con SolicitudCard + 3 modales (Nueva, Responder, Ampliar) |
| No se gestionaban los descargos de los denunciados | TabDescargos con DescargoCard + 3 modales (Notificar, Responder, Ampliar) |
| No habÃ­a forma de saltar la fase de investigaciÃ³n si la evidencia era suficiente | SaltarFaseButton con justificaciÃ³n obligatoria + warning de pendientes |
| No habÃ­a progreso visual de plazos en solicitudes/descargos | PlazoProgress con barra verde/amarillo/roja |
| No se sabÃ­a cuÃ¡ndo vencÃ­a cada solicitud o descargo | Fechas contextuales + tooltips + orden por vencimiento |

---

## 1. Objetivos del Sprint

- âœ… Refactor del DenunciaSheet a estructura de **3 tabs** (InformaciÃ³n, Solicitudes, Descargos)
- âœ… TÃ©cnico puede **crear solicitudes** a unidades externas (select de unidad + detalle + plazo 10 dÃ­as)
- âœ… TÃ©cnico puede **responder solicitudes** (respuesta + archivos adjuntos)
- âœ… TÃ©cnico puede **ampliar solicitudes** (prÃ³rroga hasta 5 dÃ­as + justificaciÃ³n + archivo)
- âœ… Cada solicitud se gestiona **de forma independiente** (plazo propio, estado propio, respuesta propia)
- âœ… TÃ©cnico puede **notificar descargo** a cada denunciado (fecha + medio + respaldo)
- âœ… TÃ©cnico puede **recibir descargos** (resumen + documentos)
- âœ… TÃ©cnico puede **ampliar descargos** (prÃ³rroga hasta 5 dÃ­as + justificaciÃ³n)
- âœ… Cada descargo se gestiona **de forma independiente** (medio distinto, plazo distinto)
- âœ… **Saltar fase** con justificaciÃ³n obligatoria desde investigaciÃ³n â†’ informe
- âœ… **PlazoProgress** visual en cada card (verde >5d / amarillo 1-5d / rojo â‰¤0)
- âœ… **Bandeja = read-only** en Solicitudes/Descargos (jefe ve progreso, no actÃºa)
- âœ… **MisCasos = con acciones** (tÃ©cnico actÃºa; dropdown "Ver como:" permite al jefe simular)
- âœ… **Cancelar solicitud** con motivo obligatorio (estado `cancelada`, badge gris)
- âœ… **SolicitudDetailModal + DescargoDetailModal** (modal detalle con toda la info + historial de cambios colapsable)
- âœ… **Editar/Eliminar** en todos los estados (pendiente, respondida, cancelada, ampliada, vencida, notificado, etc.)
- âœ… **Modal unificado** (ModalNuevaSolicitud modo dual create/edit; ModalNuevoDescargo modo dual create/edit)
- âœ… **Soft delete** (marca `eliminado: true`, oculta de listas, conserva datos para auditorÃ­a)
- âœ… **Historial interno** (`ediciones[]` con campo + valor anterior + nuevo + fecha, ordenado mÃ¡s reciente â†’ antiguo)
- âœ… **ArchivoAdjunto con botÃ³n papelera** (eliminar archivo local antes de enviar)
- âœ… **Fix overflow horizontal** (break-words en textos largos sin espacios)

---

## 2. Arquitectura

### 2.1 DenunciaSheet â€” Refactor a Tabs

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ [InformaciÃ³n]  [Solicitudes (3)]  [Descargos (2)] â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ Tab activa renderiza su contenido con scroll propioâ”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Visibilidad de tabs por estado:**

| Estado | InformaciÃ³n | Solicitudes | Descargos |
|--------|:-----------:|:-----------:|:---------:|
| ingresada | âœ… | âŒ | âŒ |
| admitida | âœ… | âŒ | âŒ |
| asignada | âœ… | âœ… (read-only) | âœ… (crear descargo) |
| investigacion | âœ… | âœ… | âœ… |
| informe | âœ… | âœ… | âœ… |
| cerrada | âœ… | âœ… (read-only) | âœ… (read-only) |
| rechazada | âœ… | âŒ | âŒ |

### 2.2 Modelo de Datos

#### SolicitudData â€” estructura por item

```php
[
    'id' => 1,
    'ticket' => 'DEN-2026-0008',
    'unidad_destino' => 'Unidad de Sistemas',          // desde UnidadData
    'detalle' => 'Solicitar grabaciones de video del dÃ­a 15/01...',
    'plazo_dias' => 10,                                  // fijo por ley
    'fecha_envio' => '2026-06-20 10:30:00',
    'fecha_vencimiento' => '2026-06-30 23:59:00',        // fecha_envio + 10 dÃ­as
    'fecha_respuesta' => null,                           // fecha de cuando respondieron
    'respuesta' => null,                                 // texto de la respuesta
    'archivos' => [                                      // archivos recibidos
        ['nombre' => 'informe_grabaciones.pdf', 'tamano' => '1.2 MB', 'fecha_subida' => '...']
    ],
    'estado' => 'pendiente',                             // pendiente|respondida|vencida|ampliada
    'ampliaciones' => [                                  // prÃ³rrogas solicitadas
        ['dias' => 5, 'justificacion' => '...', 'fecha' => '...', 'archivo' => null]
    ],
]
```

#### DescargoData â€” estructura por item

```php
[
    'id' => 1,
    'ticket' => 'DEN-2026-0008',
    'denunciado_idx' => 0,                               // Ã­ndice del denunciado en la denuncia
    'nombres_denunciado' => 'Marcelo Ãlvarez',           // redundante para bÃºsqueda rÃ¡pida
    'dependencia_denunciado' => 'Unidad de Contrataciones',
    'fecha_notificacion' => null,                        // fecha del aviso/alegato
    'medio' => null,                                     // personal|cedula|email|otro
    'respaldo_archivo' => null,                          // {nombre, tamano}
    'fecha_vencimiento' => null,                         // fecha_notificacion + 10 dÃ­as
    'fecha_respuesta' => null,
    'resumen_descargo' => null,
    'documentos' => [],
    'estado' => 'pendiente_notif',                       // pendiente_notif|notificado|respondido|vencido|ampliado
    'ampliaciones' => [],
]
```

### 2.3 UnidadData â€” CatÃ¡logo

```php
[
    'sistemas'       => 'Unidad de Sistemas',
    'adquisiciones'  => 'DirecciÃ³n de Adquisiciones',
    'recursos-humanos' => 'DirecciÃ³n de Recursos Humanos',
    'transito'       => 'DirecciÃ³n de TrÃ¡nsito',
    'catastro'       => 'Unidad de Catastro',
    'obras-publicas' => 'DirecciÃ³n de Obras PÃºblicas',
    'ingresos'       => 'DirecciÃ³n de Ingresos',
    'secretaria-general' => 'SecretarÃ­a General',
    'contrataciones' => 'Unidad de Contrataciones',
    'hacienda'       => 'DirecciÃ³n de Hacienda',
    'auditoria'      => 'Unidad de AuditorÃ­a Interna',
    'archivo'        => 'Archivo Central',
    'ministerio-justicia' => 'Ministerio de Justicia y Transparencia Institucional',
]
```

### 2.4 Bandeja (Jefe) vs MisCasos (TÃ©cnico)

| Aspecto | Bandeja | MisCasos |
|---------|---------|----------|
| **PropÃ³sito** | AdmisiÃ³n, asignaciÃ³n, traspaso, reapertura | GestiÃ³n del caso (solicitudes, descargos, informe) |
| **Solicitudes/Descargos** | Read-only (botones ocultos) | Con acciones (botones visibles) |
| **AcciÃ³n desde sheet** | Admitir, Rechazar, Asignar, Traspasar, Reabrir | Iniciar investigaciÃ³n, Pasar a Informe Final |
| **Dropdown "Ver como:"** | No aplica | SÃ­, permite al Jefe simular ser tÃ©cnico |
| **Texto informativo** | â€” | "Modo lectura â€” use MisCasos con 'Ver como:' para actuar" |

### 2.5 SaltarFaseButton

- Visible solo cuando `estado === 'investigacion'`
- Abre modal con textarea de justificaciÃ³n (mÃ­n 20 caracteres)
- Warning contextual: "âš ï¸ Quedan 2 solicitudes pendientes y 1 descargo sin notificar"
- Al confirmar: `estado â†’ 'informe'`, registro en bitÃ¡cora con acciÃ³n `saltar_fase`
- Cambia estado a `informe` para que el Sprint 5 continÃºe con el Informe Final

---

## 3. Archivos del Sprint

### 3.1 Backend â€” Crear

| Archivo | DescripciÃ³n |
|---|---|
| `app/Data/UnidadData.php` | CatÃ¡logo de 13 unidades externas GAMEA y Ministerio |
| `app/Data/SolicitudData.php` | ColecciÃ³n de solicitudes mock (sesiÃ³n) + CRUD |
| `app/Data/DescargoData.php` | ColecciÃ³n de descargos mock (sesiÃ³n) + CRUD |
| `app/Http/Controllers/SolicitudController.php` | Endpoints: store, responder, ampliar |
| `app/Http/Controllers/DescargoController.php` | Endpoints: store, notificar, responder, ampliar |

### 3.2 Backend â€” Modificar

| Archivo | Cambio |
|---|---|
| `app/Data/DenunciaData.php` | +getSolicitudes(ticket), +getDescargos(ticket), +saltarFase(). BitÃ¡cora ampliada con 7 acciones nuevas. Seed con 3 solicitudes y 2 descargos demo. |
| `app/Http/Controllers/DenunciaController.php` | +mÃ©todo saltarFase() con validaciÃ³n justificaciÃ³n min:20 |
| `app/Http/Controllers/BandejaController.php` | +props: solicitudesByTicket, descargosByTicket |
| `app/Http/Controllers/MisCasosController.php` | +props: solicitudesByTicket, descargosByTicket |
| `app/Data/SolicitudData.php` | +campos `ediciones[]`, `eliminado`, `fecha_eliminacion`. +mÃ©todos `editar()` y `eliminar()` (sin restricciÃ³n de estado, solo bloquea si ya eliminado). `getByTicket()` filtra eliminados. |
| `app/Data/DescargoData.php` | +campos `ediciones[]`, `eliminado`, `fecha_eliminacion`. +mÃ©todos `editar()` y `eliminar()` (sin restricciÃ³n de estado). `getByTicket()` filtra eliminados. |
| `app/Http/Controllers/SolicitudController.php` | +mÃ©todos `editar()` y `eliminar()` con validaciones (no permite editar/eliminar si ya eliminado) |
| `app/Http/Controllers/DescargoController.php` | +mÃ©todos `editar()` y `eliminar()` con validaciones |
| `routes/web.php` | +8 rutas originales + 4 nuevas (solicitudes/descargos editar/eliminar) |

### 3.3 Frontend â€” Crear (ampliaciÃ³n)

| Archivo | DescripciÃ³n |
|---|---|
| `Components/Denuncias/SolicitudDetailModal.tsx` | Dialog con detalle completo: header, fechas, PlazoProgress, detalle, respuesta, motivo cancelaciÃ³n, archivos, ampliaciones, acciones contextuales, historial de cambios colapsable (toggle chevron) |
| `Components/Denuncias/DescargoDetailModal.tsx` | Dialog anÃ¡logo para descargos: notificaciÃ³n, medio, respaldo, resumen descargo, documentos, ampliaciones, acciones, historial colapsable |
| `Components/Denuncias/ModalCancelarSolicitud.tsx` | Dialog para cancelar solicitud pendiente/ampliada con textarea motivo (mÃ­n 10 caracteres) |
| `Components/Denuncias/ModalNuevoDescargo.tsx` | Dialog para crear descargo manual con select de denunciados existentes o switch "persona externa" (campos nombre+dependencia) |
| `Components/Denuncias/ModalConfirmarEliminar.tsx` | Reutilizable: confirmaciÃ³n genÃ©rica de soft-delete con icono alert-triangle + texto informativo |

### 3.4 Frontend â€” Modificar (ampliaciÃ³n)

| Archivo | Cambio |
|---|---|
| `ArchivoAdjunto.tsx` | +prop `onEliminar?: () => void` con botÃ³n Trash2 rojo para remover archivo antes de enviar |
| `SolicitudCard.tsx` | +onClick para abrir SolicitudDetailModal. Botones Editar/Eliminar disponibles en TODOS los estados. |
| `DescargoCard.tsx` | +onClick para abrir DescargoDetailModal. Botones Editar/Eliminar disponibles en TODOS los estados. |
| `ModalNuevaSolicitud.tsx` | **Refactor mayor**: modo dual con prop `solicitudToEdit?` â†’ pre-rellena campos, switch libre automÃ¡tico si unidad no estÃ¡ en catÃ¡logo. TÃ­tulo/botÃ³n cambian segÃºn modo. |
| `ModalNuevoDescargo.tsx` | **Refactor mayor**: modo dual con prop `descargoToEdit?` â†’ pre-rellena campos, auto-detecta si externo o denunciado existente. |
| `DenunciaSheet.tsx` | +4 props (onEditarSolicitud, onEliminarSolicitud, onEditarDescargo, onEliminarDescargo). +break-words en hechos (fix overflow). |
| `TabSolicitudes.tsx` | +estado `detailSolicitudId`, renderiza SolicitudDetailModal, pasa callbacks de editar/eliminar |
| `TabDescargos.tsx` | +estado `detailDescargoId`, renderiza DescargoDetailModal, pasa callbacks |
| `Bandeja.tsx` | +estados modales de editar/eliminar, router.post para delete, toast success/error |
| `MisCasos.tsx` | Ãdem Bandeja: +estados modales, router.post, toast |
| `SolicitudDetailModal.tsx` | +break-words en detalle, respuesta, motivo cancelaciÃ³n (fix overflow) |
| `DescargoDetailModal.tsx` | +break-words en resumen descargo (fix overflow) |

### 3.5 Archivos eliminados

| Archivo | Motivo |
|---|---|
| ~~`Components/Denuncias/ModalEditarSolicitud.tsx`~~ | Sustituido por ModalNuevaSolicitud (modo dual con prop `solicitudToEdit`) |
| ~~`Components/Denuncias/ModalEditarDescargo.tsx`~~ | Sustituido por ModalNuevoDescargo (modo dual con prop `descargoToEdit`) |

### 3.6 Rutas nuevas (Sprint 4 â€” total)

```php
POST /denuncias/{ticket}/solicitudes              â†’ SolicitudController@store          (crear solicitud)
POST /solicitudes/{id}/responder                  â†’ SolicitudController@responder      (responder solicitud)
POST /solicitudes/{id}/ampliar                    â†’ SolicitudController@ampliar        (ampliar solicitud)
POST /solicitudes/{id}/editar                     â†’ SolicitudController@editar         (editar solicitud)
POST /solicitudes/{id}/eliminar                   â†’ SolicitudController@eliminar       (eliminar solicitud)

POST /denuncias/{ticket}/descargos                â†’ DescargoController@store           (crear descargo)
POST /descargos/{id}/notificar                    â†’ DescargoController@notificar       (notificar descargo)
POST /descargos/{id}/responder                    â†’ DescargoController@responder       (responder descargo)
POST /descargos/{id}/ampliar                      â†’ DescargoController@ampliar         (ampliar descargo)
POST /descargos/{id}/editar                       â†’ DescargoController@editar          (editar descargo)
POST /descargos/{id}/eliminar                     â†’ DescargoController@eliminar        (eliminar descargo)

POST /denuncias/{ticket}/saltar-fase              â†’ DenunciaController@saltarFase      (saltar a informe)
```

---

## 4. Milestones

### M4.1 â€” Foundation Backend âœ…

| # | Tarea | Archivo |
|---|---|---|
| 1 | Crear UnidadData con catÃ¡logo de 13 unidades | `app/Data/UnidadData.php` |
| 2 | Crear SolicitudData con CRUD + estructura de datos | `app/Data/SolicitudData.php` |
| 3 | Crear DescargoData con CRUD + estructura de datos | `app/Data/DescargoData.php` |
| 4 | Modificar DenunciaData: getSolicitudes, getDescargos, saltarFase, bitÃ¡cora ampliada | `app/Data/DenunciaData.php` |
| 5 | Crear SolicitudController con store/responder/ampliar | `app/Http/Controllers/SolicitudController.php` |
| 6 | Crear DescargoController con store/notificar/responder/ampliar | `app/Http/Controllers/DescargoController.php` |
| 7 | Modificar DenunciaController con saltarFase | `app/Http/Controllers/DenunciaController.php` |
| 8 | Modificar BandejaController (solicitudesByTicket, descargosByTicket) | `app/Http/Controllers/BandejaController.php` |
| 9 | Modificar MisCasosController (Ã­dem) | `app/Http/Controllers/MisCasosController.php` |
| 10 | Registrar 8 rutas nuevas | `routes/web.php` |

### M4.2 â€” PlazoProgress + ArchivoAdjunto âœ…

| # | Tarea | Archivo |
|---|---|---|
| 11 | Crear PlazoProgress (progress bar + colores + texto contextual) | `Components/Denuncias/PlazoProgress.tsx` |
| 12 | Crear ArchivoAdjunto (Ã­cono + nombre + tamaÃ±o + botÃ³n Ver) | `Components/Denuncias/ArchivoAdjunto.tsx` |

### M4.3 â€” Tab Solicitudes completa âœ…

| # | Tarea | Archivo |
|---|---|---|
| 13 | Crear SolicitudCard | `Components/Denuncias/SolicitudCard.tsx` |
| 14 | Crear ModalNuevaSolicitud | `Components/Denuncias/ModalNuevaSolicitud.tsx` |
| 15 | Crear ModalResponderSolicitud | `Components/Denuncias/ModalResponderSolicitud.tsx` |
| 16 | Crear ModalAmpliarSolicitud | `Components/Denuncias/ModalAmpliarSolicitud.tsx` |
| 17 | Crear TabSolicitudes | `Components/Denuncias/TabSolicitudes.tsx` |

### M4.4 â€” Tab Descargos completa âœ…

| # | Tarea | Archivo |
|---|---|---|
| 18 | Crear DescargoCard | `Components/Denuncias/DescargoCard.tsx` |
| 19 | Crear ModalNotificarDescargo | `Components/Denuncias/ModalNotificarDescargo.tsx` |
| 20 | Crear ModalResponderDescargo | `Components/Denuncias/ModalResponderDescargo.tsx` |
| 21 | Crear ModalAmpliarDescargo | `Components/Denuncias/ModalAmpliarDescargo.tsx` |
| 22 | Crear TabDescargos | `Components/Denuncias/TabDescargos.tsx` |

### M4.5 â€” Refactor DenunciaSheet âœ…

| # | Tarea | Archivo |
|---|---|---|
| 23 | Convertir DenunciaSheet a estructura Tabs (InformaciÃ³n / Solicitudes / Descargos) | `DenunciaSheet.tsx` |
| 24 | Tab InformaciÃ³n conserva secciones actuales | `DenunciaSheet.tsx` |
| 25 | Tabs Solicitudes y Descargos con badge de count | `DenunciaSheet.tsx` |
| 26 | Visibilidad condicional por estado | `DenunciaSheet.tsx` |
| 27 | Modo read-only vs acciones segÃºn canAct | `DenunciaSheet.tsx` |

### M4.6 â€” Saltar Fase âœ…

| # | Tarea | Archivo |
|---|---|---|
| 28 | Crear SaltarFaseButton + modal | `Components/Denuncias/SaltarFaseButton.tsx` |
| 29 | Warning de items pendientes | `Components/Denuncias/SaltarFaseButton.tsx` |

### M4.7 â€” IntegraciÃ³n Bandeja y MisCasos âœ…

| # | Tarea | Archivo |
|---|---|---|
| 30 | Modales y props en Bandeja | `Bandeja.tsx` |
| 31 | Modales y props en MisCasos + reemplazar placeholder | `MisCasos.tsx` |

### M4.8 â€” Seed + Polish âœ…

| # | Tarea | Archivo |
|---|---|---|
| 32 | Seed de 3 solicitudes demo + 2 descargos demo | `DenunciaData.php` |
| 33 | Reset de state en modales | Todos los modales |
| 34 | Tooltips de fechas exactas | PlazoProgress + SolicitudCard + DescargoCard |
| 35 | Validaciones frontend (min/max chars) | Todos los modales |
| 36 | Toast de Ã©xito/error en cada acciÃ³n | Controllers + modales |
| 37 | Actualizar AI-CONTEXT.md | DocumentaciÃ³n |
| 38 | Actualizar Plan de Desarrollo.md | DocumentaciÃ³n |
| 39 | Crear este documento | DocumentaciÃ³n |

### M4.9 â€” Detail Modals + CRUD + Modal Unificado + Cancelar âœ…

| # | Tarea | Archivo |
|---|---|---|
| 40 | Crear ModalCancelarSolicitud (motivo obligatorio min 10) | `Components/Denuncias/ModalCancelarSolicitud.tsx` |
| 41 | Crear ModalNuevoDescargo (select denunciados + switch externo) | `Components/Denuncias/ModalNuevoDescargo.tsx` |
| 42 | Crear SolicitudDetailModal (detalle completo + historial colapsable) | `Components/Denuncias/SolicitudDetailModal.tsx` |
| 43 | Crear DescargoDetailModal (detalle completo + historial colapsable) | `Components/Denuncias/DescargoDetailModal.tsx` |
| 44 | Crear ModalConfirmarEliminar (reusable soft-delete) | `Components/Denuncias/ModalConfirmarEliminar.tsx` |
| 45 | Backend: +campos ediciones[], eliminado, fecha_eliminacion en SolicitudData/DescargoData | `app/Data/SolicitudData.php`, `app/Data/DescargoData.php` |
| 46 | Backend: editar() y eliminar() en SolicitudData y DescargoData (sin restricciÃ³n estado) | `app/Data/SolicitudData.php`, `app/Data/DescargoData.php` |
| 47 | Backend: SolicitudController.editar() y eliminar() | `app/Http/Controllers/SolicitudController.php` |
| 48 | Backend: DescargoController.editar() y eliminar() | `app/Http/Controllers/DescargoController.php` |
| 49 | Frontend: ArchivoAdjunto +prop onEliminar (botÃ³n Trash2) | `Components/Denuncias/ArchivoAdjunto.tsx` |
| 50 | Frontend: Refactor ModalNuevaSolicitud â†’ modo dual (create/edit) | `Components/Denuncias/ModalNuevaSolicitud.tsx` |
| 51 | Frontend: Refactor ModalNuevoDescargo â†’ modo dual (create/edit) | `Components/Denuncias/ModalNuevoDescargo.tsx` |
| 52 | Frontend: Editar/Eliminar en cards + detail modals (todos los estados) | SolicitudCard, DescargoCard, DetailModals |
| 53 | Frontend: TabSolicitudes + TabDescargos con detail state y callbacks | `TabSolicitudes.tsx`, `TabDescargos.tsx` |
| 54 | Frontend: DenunciaSheet +4 props (editar/eliminar) + break-words en hechos | `DenunciaSheet.tsx` |
| 55 | Frontend: Bandeja + MisCasos â€” modales edit/delete + router.post | `Bandeja.tsx`, `MisCasos.tsx` |
| 56 | Frontend: break-words en detail modals (detalle, respuesta, motivo cancelaciÃ³n, resumen) | SolicitudDetailModal, DescargoDetailModal |
| 57 | Eliminar ModalEditarSolicitud (absorbido por ModalNuevaSolicitud) | Archivo removido |
| 58 | Eliminar ModalEditarDescargo (absorbido por ModalNuevoDescargo) | Archivo removido |
| 59 | Build: compilaciÃ³n exitosa (3892 mÃ³dulos, 0 errores) | â€” |

---

## 5. Decisiones del Sprint

| # | DecisiÃ³n | Alternativa descartada | Motivo |
|---|---|---|---|
| 1 | **Sheet con Tabs arriba** | Scroll Ãºnico o modales separados | 3 Ã¡reas de trabajo independientes, cada una con scroll propio |
| 2 | **Solicitudes/Descargos independientes** | Agrupados por denunciado | Plazos legales independientes, respuestas en momentos distintos |
| 3 | **Lista Ãºnica + PlazoProgress** | Sub-tabs por estado | Menos clics, progreso visual inmediato, orden inteligente |
| 4 | **Plazos en dÃ­as naturales** | DÃ­as hÃ¡biles | Sprint 8 implementarÃ¡ el calendario de feriados |
| 5 | **Bandeja read-only en Solicitudes/Descargos** | Ocultar tabs | El Jefe debe monitorear el progreso de todos los tÃ©cnicos |
| 6 | **MisCasos con acciones completas** | Sin acciones en tabs | El tÃ©cnico asignado es quien gestiona el caso |
| 7 | **Dropdown "Ver como:" permite al Jefe actuar** | Separar roles estrictamente | El Jefe supervisa y puede intervenir en casos urgentes |
| 8 | **SaltarFase SIEMPRE pide justificaciÃ³n** | Solo si hay pendientes | La ley exige justificaciÃ³n excepcional para cualquier omisiÃ³n de fase (Art. 30) |
| 9 | **Plazo solicitud = 10 dÃ­as** | 5, 15 o 30 | Art. 25 Â§I y III de Ley 974 |
| 10 | **Plazo descargo = 10 dÃ­as + 5 prÃ³rroga** | 15 fijo | Art. 25 Â§IV de Ley 974 |
| 11 | **Archivos visuales (Ã­cono + nombre + tamaÃ±o + Ver)** | Solo texto | Mejor experiencia de usuario, feedback visual inmediato |
| 12 | **Seed demo incluido** | Sin seed | El tÃ©cnico necesita ver datos realistas para testear |
| 13 | **Modal unificado create/edit** en ModalNuevaSolicitud | 2 modales separados (Nueva + Editar) | DRY, mismo formulario pre-rellenado, menos cÃ³digo a mantener |
| 14 | **SolicitudDetailModal muestra toda la info** con acciones | SPA-like con "Volver" a la lista | No pierde contexto, consistente con otros modales del sistema |
| 15 | **Soft delete (eliminado: true)** | Hard delete | Preserva datos para auditorÃ­a futura con BD real |
| 16 | **Editar/Eliminar en TODOS los estados** | Solo pendiente | Permite corregir errores humanos en cualquier etapa del flujo |
| 17 | **ediciones[] con campo + anterior + nuevo + fecha** | Solo flag "editado" | Trazabilidad completa para auditorÃ­a |
| 18 | **ArchivoAdjunto con onEliminar opcional** | Componente separado para eliminar | Reusabilidad, mismo look en todos los formularios |
| 19 | **BotÃ³n papelera Trash2** | Checkbox "quitar archivo" | UX clara, Ã­cono universalmente reconocido |
| 20 | **break-words (word-wrap: break-word)** | break-all | Solo rompe cuando es necesario, no en medio de palabras normales |
| 21 | **Botones Editar/Eliminar en cards y detail modals** | Solo en cards | Consistencia, dos formas de acceder al CRUD |

---

## 6. Fuera de Alcance (Sprint 5+)

| Funcionalidad | Sprint |
|---|---|
| Informe Final con clasificaciÃ³n (Penal/Civil/Administrativo/Sin Indicios/Medida Correctiva/Archivado) | Sprint 5 |
| Cierre con SITPRECO + notificaciÃ³n | Sprint 5 |
| Seguimiento pÃºblico (consulta por ticket) | Sprint 6 |
| Dashboard + Reportes (Recharts) | Sprint 7 |
| DÃ­as hÃ¡biles + Calendario feriados | Sprint 8 |
| Notificaciones automÃ¡ticas a unidades/denunciados | Futuro |
| Subida de archivos real (no mock) | Futuro |
| AuditorÃ­a real de quiÃ©n actuÃ³ (jefe vs tÃ©cnico en el dropdown) | Futuro (con BD) |

---

## 7. Notas para Sprint 5+ (Perspectiva TÃ©cnica)

### Dropdown "Ver como:" y auditorÃ­a

Cuando se implemente la BD real, las acciones realizadas en MisCasos con el dropdown "Ver como:" activo deben registrar el `usuario_id` real del actor (Jefe o TÃ©cnico), NO del tÃ©cnico simulado por el parÃ¡metro `?tecnico=` de la URL.

Esto requiere:
1. Modificar `SolicitudData.php` y `DescargoData.php` para aceptar un parÃ¡metro `usuario_actor` en cada mÃ©todo de acciÃ³n
2. Modificar los Controllers para propagar `auth()->id()` en lugar del parÃ¡metro `?tecnico=`
3. La bitÃ¡cora de la denuncia tambiÃ©n debe usar `usuario_actor` real
4. En Fase 0 (mock, sin usuarios individuales en sesiÃ³n) esto NO es posible, por lo que se usa 'sistema' genÃ©rico

### Persistencia de filtros

- Los filtros de Bandeja (bÃºsqueda, tipo, sort) se pierden al recargar la pÃ¡gina.
- OpciÃ³n: almacenar en `localStorage` o como query params en la URL para compartir/enlazar.

### DÃ­as hÃ¡biles

- Sprint 4 usa dÃ­as naturales para plazos de solicitudes y descargos.
- Sprint 8 implementarÃ¡ el calendario de feriados y los helpers de cÃ¡lculo de dÃ­as hÃ¡biles (Carbon + feriados).
- En ese momento, `SolicitudData.getPlazoInfo()` y `DescargoData.getPlazoInfo()` deberÃ¡n actualizarse para usar el helper.

---

## 8. Actualizaciones a Otros Documentos

âœ… Completadas. Ver estado actual en cada documento.

| Documento | Cambio |
|---|---|
| `AI-CONTEXT.md` | Sprint 4 actualizado con M4.9 (detail modals, CRUD, modal unificado). Arquitectura Clave ampliada con nuevos componentes y archivos. |
| `Plan de Desarrollo.md` | Sprint 4 ampliado con M4.9: nuevos componentes, archivos eliminados, decisiones #13-21, rutas +4. |
| Este documento | Addendum M4.9 agregado con detalle completo de las mejoras. |

---

## 9. Decisiones de Arquitectura TÃ©cnica

| Aspecto | DecisiÃ³n |
|---|---|
| **URLs POST** | Siempre Ziggy `route()` para respetar subdirectorio `/transparencia/public/` |
| **BitÃ¡cora** | Array dentro de cada denuncia en sesiÃ³n. Cada acciÃ³n de solicitud/descargo registra automÃ¡ticamente entrada en bitÃ¡cora con ticket de la denuncia. |
| **PlazoProgress** | Componente reutilizable con progress bar shadcn + color segÃºn dÃ­as restantes + texto contextual. Verde >5d, Amarillo 1-5d, Rojo â‰¤0. |
| **Estado vencido** | Se calcula al leer (no se persiste). Si `fecha_vencimiento < now()` y `estado !== 'respondida'`, se muestra como vencido. |
| **Ordenamiento** | Cliente-side. Default: fecha_vencimiento ascendente. Los items con `fecha_vencimiento < now()` y no respondidos van al final con estilo destacado. |
| **canAct** | Flag booleano. `false` en Bandeja (read-only), `true` en MisCasos (con acciones). El Sheet lo recibe como prop y oculta/muestra botones segÃºn corresponda. |
| **Modal state** | `useState` con ticket/id en Bandeja/MisCasos. `useEffect` resetea campos al abrir (patrÃ³n Sprint 3). |
| **Seed** | 3 solicitudes (1 pendiente, 1 respondida, 1 vencida) + 2 descargos (1 notificado, 1 respondido). Asociados a DEN-2026-0008 (investigacion) y DEN-2026-0010 (informe). |
| **ediciones[]** | Array dentro de Solicitud/Descargo. Cada `editar()` agrega entrada con `{campo, valor_anterior, valor_nuevo, fecha}`. Ordenado mÃ¡s reciente â†’ mÃ¡s antiguo. NO registra en bitÃ¡cora de la denuncia. |
| **eliminado** | Campo booleano `eliminado`. `getByTicket()` filtra con `empty($eliminado)`. `editar()` y `eliminar()` bloquean si ya estÃ¡ eliminado. |
| **Modal dual** | `ModalNuevaSolicitud` y `ModalNuevoDescargo` aceptan props opcionales `solicitudToEdit` / `descargoToEdit`. Si existen â†’ modo ediciÃ³n (pre-rellena campos, cambia tÃ­tulo y endpoint). Si no â†’ modo creaciÃ³n. |
| **Soft delete UI** | `ModalConfirmarEliminar` es genÃ©rico: recibe `tipo` (solicitud/descargo), `identificador` y callback `onConfirmar`. Muestra icono alert-triangle + texto "Se marcarÃ¡ como eliminado..." |
| **Overflow fix** | Tailwind `break-words` en textos largos sin espacios. Aplicado en detail modals (detalle, respuesta, motivo, resumen) y DenunciaSheet (hechos). |

