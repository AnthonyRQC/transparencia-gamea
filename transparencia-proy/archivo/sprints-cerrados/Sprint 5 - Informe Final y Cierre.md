> ⚠️ **Histórico — Sprint cerrado Jul 2026 (Laravel 11).** Snapshot al cierre, no refleja refactorización Bloques 0-2 (Sep 2026, Laravel 13). Para estado actual ver AI-CONTEXT.md y Notas Reestructuración - Bloques 0-2 (Sept 2026) - Cierre.md.
# Sprint 5 â€” Informe Final + Cierre

**PerÃ­odo:** Junio 2026 â€” Semana 4-5 (despuÃ©s de Sprint 4)
**Estado:** âœ… COMPLETADO (build 3896 mÃ³dulos, 4.35s, 0 errores)

> **ActualizaciÃ³n (Junio 2026):** Tras reuniÃ³n con cliente, se resolviÃ³ el flujo de SITPRECO (ahora se asigna al **admitir**, no al cerrar) y notificaciÃ³n de cierre (opcional). Estas decisiones se implementarÃ¡n formalmente en el **Sprint 7 (EvaluaciÃ³n TÃ©cnica Previa)**: `ModalAdmision` requerirÃ¡ SITPRECO obligatorio, `ModalRechazo` lo dejarÃ¡ opcional, y `FormCierre` mostrarÃ¡ el SITPRECO como read-only heredado de admisiÃ³n. Ver `Sprint 7 - EvaluaciÃ³n TÃ©cnica Previa.md` para detalle.

---

## 1. Objetivos

### Logrados

| # | Objetivo | Estado |
|---|----------|--------|
| 1 | Modelar Informe Final con 6 clasificaciones (Penal, Civil, Administrativo, Sin Indicios, Medida Correctiva, Archivado) | âœ… |
| 2 | Formulario embebido para redactar/editar Informe Final con fojas, justificaciÃ³n, archivos, concluido_por | âœ… |
| 3 | Formulario embebido para registrar/editar Cierre con SITPRECO (opcional), notificaciÃ³n al denunciante, descripciÃ³n, archivos | âœ… |
| 4 | NotificaciÃ³n al denunciante con checkbox "se notificÃ³/no se notificÃ³" + motivo opcional si no se notificÃ³ | âœ… |
| 5 | Campos `informe_*` y `cierre_*` en DenunciaData con arrays separados `informe_archivos` y `cierre_archivos` | âœ… |
| 6 | Soft delete (eliminado) y ediciones con historial (`informe_ediciones[]`, `cierre_ediciones[]`) | âœ… |
| 7 | Backend: 6 endpoints nuevos (guardar/editar/eliminar para informe y cierre) | âœ… |
| 8 | Tab "Informe y Cierre" como 4to tab en DenunciaSheet (visible en estados `informe` y `cerrada`) | âœ… |
| 9 | InformeDetailModal read-only (consistente con Sprint 4 SolicitudDetailModal) | âœ… |
| 10 | Cards cerradas enriquecidas con badge clasificaciÃ³n, SITPRECO, fecha cierre | âœ… |
| 11 | Seed demo: DEN-2026-0011 (penal, cerrada, notificado) y DEN-2026-0012 (archivado, no notificado) con informe+cierre | âœ… |
| 12 | Editable en cualquier momento (estados `informe` y `cerrada` permiten editar) | âœ… |
| 13 | `concluido_por` autocompletado con el nombre del tÃ©cnico actual | âœ… |
| 14 | 15 decisiones tÃ©cnicas documentadas en este archivo | âœ… |

### Decisiones validadas con cliente (Junio 2026)

| # | DecisiÃ³n | ImplementaciÃ³n futura |
|---|----------|------------------------|
| 1 | **SITPRECO se obtiene al admitir o rechazar la denuncia**, no al cierre. **Obligatorio al admitir**, **opcional al rechazar**. | Sprint 7 â€” `ModalAdmision` requerirÃ¡ SITPRECO. `FormCierre` mostrarÃ¡ SITPRECO read-only heredado. |
| 2 | **NotificaciÃ³n de cierre es opcional** (casos anÃ³nimos no requieren notificaciÃ³n). El flujo actual con checkbox + motivo opcional es correcto. | Sin cambios necesarios. Sprint 7 confirma el comportamiento. |
| 3 | **Estructura SITPRECO:** texto libre sin hint de formato. Cuando el cliente confirme formato definitivo, se actualizarÃ¡ el input. | Sprint 7 â€” `ModalAdmision`/`ModalRechazo` con input texto libre. |

---

## 2. Arquitectura del Sprint

### 2.1 Flujo de estados

```
investigacion â†’ informe     (SaltarFaseButton â€” Sprint 4)
informe â†’ informe           (guardar/editar Informe Final, sin cambio de estado)
informe â†’ cerrada           (guardar Cierre â†’ estado cambia a cerrada)
cerrada â†’ cerrada           (editar Informe/Cierre, sin cambio de estado)
cerrada â†’ informe           (eliminar Cierre â†’ soft delete, estado vuelve a informe)
cerrada â†’ ingresada         (Reabrir â€” Sprint 3, limpia datos previos)
```

### 2.2 Nuevos campos en DenunciaData

```php
// Informe Final
'informe_clasificacion' => null,    // penal|civil|administrativo|sin_indicios|medida_correctiva|archivado
'informe_fojas' => null,            // int
'informe_justificacion' => null,    // string
'informe_archivos' => [],           // array de {nombre, tamano, fecha_subida}
'informe_redactado_at' => null,     // datetime
'informe_concluido_por' => null,    // string
'informe_ediciones' => [],          // [{fecha, cambios[], usuario}]
'informe_eliminado' => false,
'informe_fecha_eliminacion' => null,

// Cierre
'cierre_sitpreco' => null,           // string (opcional)
'cierre_notificado_denunciante' => null,  // bool
'cierre_notificacion_medio' => null,      // whatsapp|email|presencial|otro
'cierre_notificacion_fecha' => null,
'cierre_notificacion_descripcion' => null,
'cierre_no_notificado_motivo' => null,
'cierre_concluido_por' => null,
'cierre_descripcion' => null,
'cierre_archivos' => [],
'cierre_cerrado_at' => null,
'cierre_ediciones' => [],
'cierre_eliminado' => false,
'cierre_fecha_eliminacion' => null,
```

### 2.3 Backend â€” nuevos mÃ©todos

#### `app/Data/DenunciaData.php`

| MÃ©todo | ParÃ¡metros | DescripciÃ³n |
|--------|-----------|-------------|
| `guardarInforme(ticket, data, usuarioId)` | `ticket`, `data[clasificacion, fojas, justificacion, archivos, concluido_por]`, `usuarioId` | Crea/actualiza campos `informe_*`, bitÃ¡cora `informe_redactado`. Estados permitidos: `informe`, `cerrada`. |
| `editarInforme(ticket, data, usuarioId)` | Mismos campos | Actualiza campos, registra cambios en `informe_ediciones[]`, bitÃ¡cora `informe_editado`. |
| `eliminarInforme(ticket, usuarioId)` | â€” | Soft delete: `informe_eliminado=true`, `informe_fecha_eliminacion=now()`. |
| `guardarCierre(ticket, data, usuarioId)` | `ticket`, `data[sitpreco, notificado_denunciante, notificacion_medio, notificacion_fecha, notificacion_descripcion, no_notificado_motivo, concluido_por, descripcion, archivos]`, `usuarioId` | Solo desde `informe`. Cambia estado a `cerrada`. BitÃ¡cora `cierre_registrado`. |
| `editarCierre(ticket, data, usuarioId)` | Mismos campos | Solo desde `cerrada`. Actualiza campos, registra en `cierre_ediciones[]`. |
| `eliminarCierre(ticket, usuarioId)` | â€” | Soft delete, **vuelve estado a `informe`**. |

#### `app/Http/Controllers/DenunciaController.php`

| MÃ©todo | Validaciones | Ruta |
|--------|-------------|------|
| `guardarInforme(ticket, Request)` | `clasificacion: required|in:penal,...`, `fojas: required|integer|min:1`, `justificacion: required|min:20`, `concluido_por: required|min:2` | `POST /denuncias/{ticket}/informe` |
| `editarInforme(ticket, Request)` | Mismas | `POST /denuncias/{ticket}/informe/editar` |
| `eliminarInforme(ticket)` | â€” | `POST /denuncias/{ticket}/informe/eliminar` |
| `guardarCierre(ticket, Request)` | `sitpreco: nullable|min:3|max:50`, `notificado_denunciante: required|boolean`, `notificacion_medio: required_if:notificado...`, `notificacion_fecha: required_if:...|date|before_or_equal:today`, `notificacion_descripcion: required_if|min:10`, `no_notificado_motivo: required_if:notificado_denunciante,false|max:500`, `concluido_por: required|min:2`, `descripcion: required|min:20` | `POST /denuncias/{ticket}/cierre` |
| `editarCierre(ticket, Request)` | Mismas | `POST /denuncias/{ticket}/cierre/editar` |
| `eliminarCierre(ticket)` | â€” | `POST /denuncias/{ticket}/cierre/eliminar` |

### 2.4 Nuevas entradas de bitÃ¡cora

| AcciÃ³n | Detalle |
|--------|---------|
| `informe_redactado` | "Informe Final redactado. ClasificaciÃ³n: {clas}. Fojas: {n}" |
| `informe_editado` | "Informe Final editado. Cambios: {lista}" |
| `informe_eliminado` | "Informe Final eliminado (soft delete)" |
| `cierre_registrado` | "Cierre registrado. SITPRECO: {codigo}. Estado: cerrada" |
| `cierre_editado` | "Cierre editado. Cambios: {lista}" |
| `cierre_eliminado` | "Cierre eliminado (soft delete). Estado vuelve a informe" |

### 2.5 Rutas nuevas (6)

```php
POST /denuncias/{ticket}/informe              â†’ DenunciaController@guardarInforme
POST /denuncias/{ticket}/informe/editar       â†’ DenunciaController@editarInforme
POST /denuncias/{ticket}/informe/eliminar     â†’ DenunciaController@eliminarInforme
POST /denuncias/{ticket}/cierre               â†’ DenunciaController@guardarCierre
POST /denuncias/{ticket}/cierre/editar        â†’ DenunciaController@editarCierre
POST /denuncias/{ticket}/cierre/eliminar      â†’ DenunciaController@eliminarCierre
```

---

## 3. Frontend

### 3.1 Componentes creados (5)

| Componente | Archivo | DescripciÃ³n |
|-----------|---------|-------------|
| `ClasificacionBadge` | `Components/Denuncias/ClasificacionBadge.tsx` | Badge reutilizable con color por clasificaciÃ³n (6 colores: penal/rojo, civil/pÃºrpura, administrativo/azul, sin_indicios/verde, medida_correctiva/Ã¡mbar, archivado/gris). |
| `FormInformeFinal` | `Components/Denuncias/FormInformeFinal.tsx` | Formulario embebido (no modal) con Select clasificaciÃ³n, Input fojas, Textarea justificaciÃ³n, Input concluido_por (autocompletado), manejo de archivos mock. **Modo dual**: si existe informe previo muestra preview + botones Editar/Eliminar; si no, muestra formulario vacÃ­o. Historial de cambios colapsable. |
| `FormCierre` | `Components/Denuncias/FormCierre.tsx` | Formulario embebido: Input SITPRECO (opcional, con nota informativa), Checkbox "Â¿Se notificÃ³ al denunciante?" + condicionales (si sÃ­: medio/fecha/descripciÃ³n; si no: motivo opcional), Input concluido_por, Textarea descripciÃ³n, archivos mock. Historial colapsable. ValidaciÃ³n: si no hay informe previo, muestra warning. |
| `TabInformeCierre` | `Components/Denuncias/TabInformeCierre.tsx` | Orquesta 2 sub-tabs shadcn (Informe Final / Cierre). Renderiza `FormInformeFinal` o `FormCierre` segÃºn sub-tab. Maneja soft delete warning + ModalConfirmarEliminar. |
| `InformeDetailModal` | `Components/Denuncias/InformeDetailModal.tsx` | Modal read-only (consistente con Sprint 4). Muestra: header con clasificaciÃ³n, fojas, fechas, redactado_por, justificaciÃ³n, archivos, cierre expandible con SITPRECO, notificaciÃ³n, descripciÃ³n, archivos. |

### 3.2 Componentes modificados (4)

| Componente | Cambio |
|-----------|--------|
| `DenunciaSheet.tsx` | +4to tab "Informe y Cierre" (visible solo si `estado âˆˆ {informe, cerrada}`). +props `tecnicoNombre`. +imports `TabInformeCierre`, `ScrollText`. |
| `DenunciaCard.tsx` | +badge `ClasificacionBadge` para `cerrada`. +SITPRECO en font-mono pequeÃ±o. +fecha cierre formateada con `cierre_cerrado_at`. |
| `MisCasos.tsx` | +prop `tecnicoNombre` en `DenunciaSheet` (derivado de `tecnicos[tecnicoActual].nombre`). Estado `informe` cambiado de placeholder a "Informe pendiente" con icono `ScrollText`. |
| `Bandeja.tsx` | +prop `tecnicoNombre` en `DenunciaSheet` (derivado de `tecnicos[selectedDenuncia.tecnico]?.nombre`). |

### 3.3 UI de la pestaÃ±a Informe y Cierre

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ [Informe Final]  [Cierre]                            â”‚ â† Sub-tabs shadcn
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                                      â”‚
â”‚  â”€â”€ Sub-tab: Informe Final â”€â”€                        â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”      â”‚
â”‚  â”‚ FormInformeFinal (si no redactado)         â”‚      â”‚
â”‚  â”‚  o Preview del informe (si ya redactado)   â”‚      â”‚
â”‚  â”‚  + botones [Editar] [Eliminar]             â”‚      â”‚
â”‚  â”‚  + historial colapsable                    â”‚      â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜      â”‚
â”‚                                                      â”‚
â”‚  â”€â”€ Sub-tab: Cierre â”€â”€                               â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”      â”‚
â”‚  â”‚ [Si no hay informe] âš ï¸ mensaje warning     â”‚      â”‚
â”‚  â”‚ FormCierre (si no cerrado)                 â”‚      â”‚
â”‚  â”‚  o Preview del cierre (si cerrado)         â”‚      â”‚
â”‚  â”‚  + botones [Editar] [Eliminar]             â”‚      â”‚
â”‚  â”‚  + historial colapsable                    â”‚      â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜      â”‚
â”‚                                                      â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 3.4 UX de notificaciÃ³n al denunciante

```
â˜ Â¿Se notificÃ³ al denunciante?  [Checkbox]
  â”€ Si marcado â†’ [Medio â–¼] [Fecha ðŸ“…] [DescripciÃ³n textarea]
  â”€ Si NO marcado â†’ [Motivo textarea opcional, mÃ¡x 500]
```

---

## 4. Archivos del Sprint

### 4.1 Creados (5 frontend)

```
resources/js/Components/Denuncias/ClasificacionBadge.tsx
resources/js/Components/Denuncias/FormInformeFinal.tsx
resources/js/Components/Denuncias/FormCierre.tsx
resources/js/Components/Denuncias/TabInformeCierre.tsx
resources/js/Components/Denuncias/InformeDetailModal.tsx
```

### 4.2 Modificados (7)

```
app/Data/DenunciaData.php                        â†’ +24 campos, +6 mÃ©todos, +seed
app/Http/Controllers/DenunciaController.php      â†’ +6 mÃ©todos (6 validaciones)
routes/web.php                                   â†’ +6 rutas
resources/js/Components/Denuncias/DenunciaSheet.tsx â†’ +4to tab, +tecnicoNombre prop
resources/js/Components/Denuncias/DenunciaCard.tsx  â†’ +badges clasificaciÃ³n/SITPRECO/fecha
resources/js/Pages/Denuncias/MisCasos.tsx        â†’ +tecnicoNombre, +ScrollText para informe
resources/js/Pages/Denuncias/Bandeja.tsx         â†’ +tecnicoNombre
```

---

## 5. Decisiones tÃ©cnicas

| # | DecisiÃ³n | Alternativa descartada | Motivo |
|---|----------|------------------------|--------|
| 1 | Informe y Cierre como 2 sub-tabs dentro del 4to tab "Informe y Cierre" | 2 tabs separados en el sheet | Reduce clutter, agrupa acciones de cierre |
| 2 | Formularios embebidos (no Dialog) | Dialog modal | Permite ver historial sin perder contexto |
| 3 | Informe se redacta antes que Cierre (orden lÃ³gico) | Independientes | Sin Cierre no hay estado `cerrada` |
| 4 | 6 clasificaciones: Penal, Civil, Administrativo, Sin Indicios, Medida Correctiva, Archivado | 4 o 5 | Ley 974 Art. 27 |
| 5 | `informe_archivos` y `cierre_archivos` separados | Array Ãºnico | AuditorÃ­a clara por fase |
| 6 | SITPRECO opcional (mÃ­n 3, mÃ¡x 50 chars) â€” provisional | Obligatorio | Cliente confirmarÃ¡ formato |
| 7 | Checkbox "se notificÃ³/no se notificÃ³" + motivo opcional si no | Solo "se notificÃ³" obligatorio | AnÃ³nimos sin contacto no deben bloquear cierre |
| 8 | `concluido_por` autocompletado con tÃ©cnico actual (editable) | Campo vacÃ­o | Reduce errores, mantiene trazabilidad del dropdown |
| 9 | Informe y Cierre editables en cualquier momento (incluso en `cerrada`) | Bloqueado al guardar | Permite correcciones; auditorÃ­a en `*_ediciones[]` |
| 10 | Soft delete con `*_eliminado` flag | Hard delete | Consistencia con Sprint 4 |
| 11 | `ediciones[]` con cambios+usuario+fecha | Solo flag "editado" | Trazabilidad completa |
| 12 | Reapertura (Sprint 3) preserva campos (los datos limpios se definen en `reabrir()`) | Limpia todo | Datos Ãºtiles en bitÃ¡cora |
| 13 | `InformeDetailModal` opcional para preview read-only | Solo embebido | Consistencia con Sprint 4 DetailModals |
| 14 | Cards cerradas muestran badge clasificaciÃ³n + SITPRECO + fecha cierre | Mantener cards simples | Info clave sin abrir sheet |
| 15 | DenunciaSheet gana 4to tab solo en `informe` y `cerrada` | Siempre visible | No tiene sentido en otros estados |

---

## 6. Seed demo

La seed demo ahora incluye datos reales de informe y cierre para:

| Ticket | Estado | ClasificaciÃ³n | SITPRECO | Notificado | BitÃ¡cora |
|--------|--------|---------------|----------|------------|----------|
| DEN-2026-0011 | cerrada | Penal | SIT-UML-CC1-2026-0501 | SÃ­ (email) | informe_redactado + cierre_registrado |
| DEN-2026-0012 | cerrada (archivada) | Archivado | SIT-UML-CC1-2026-0302 | No (anÃ³nimo sin contacto) | informe_redactado + cierre_registrado |

---

## 7. VerificaciÃ³n

- âœ… `npm run build` â†’ 3896 mÃ³dulos, 4.35s, 0 errores TypeScript+Vite
- âœ… Flujo: crear denuncia â†’ admitir â†’ asignar â†’ investigar â†’ saltar fase â†’ redactar informe (informe) â†’ cerrar (cerrada) â†’ editar cierre â†’ eliminar cierre (vuelve a informe)
- âœ… Seed data visible con badges clasificaciÃ³n, SITPRECO, fecha en cards cerradas
- âœ… Tab "Informe y Cierre" visible en MisCasos (con acciones) y Bandeja (read-only)
- âœ… Historial de cambios colapsable con ediciones
- âœ… Soft delete con warning visual
- âœ… 15 decisiones documentadas

---

## 8. Notas

- Sprint 5 no creÃ³ nuevos Data/Controllers independientes; todo se integrÃ³ en `DenunciaData` y `DenunciaController` (a diferencia de Sprint 4 que creÃ³ `SolicitudData`, `DescargoData`, `SolicitudController`, `DescargoController`). Esto es porque informe y cierre son propios de la denuncia, no entidades externas.
- El patrÃ³n `ediciones[]` con campo+anterior+nuevo+fecha+usuario se mantiene del Sprint 4.
- Componente `ArchivoAdjunto` se reutiliza sin cambios.
- Los archivos mock no se envÃ­an al backend (solo se mantienen en estado local del frontend). Cuando haya BD real, se implementarÃ¡ subida real.
- SITPRECO actualmente se muestra en `FormCierre` como opcional. **Tras Sprint 7**, el SITPRECO se capturarÃ¡ en admisiÃ³n (obligatorio al admitir, opcional al rechazar) y `FormCierre` lo mostrarÃ¡ como read-only heredado. Ver `Sprint 7 - EvaluaciÃ³n TÃ©cnica Previa.md`.

