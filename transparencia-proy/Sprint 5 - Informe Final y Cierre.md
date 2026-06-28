# Sprint 5 — Informe Final + Cierre

**Período:** Junio 2026 — Semana 4-5 (después de Sprint 4)
**Estado:** ✅ COMPLETADO (build 3896 módulos, 4.35s, 0 errores)

---

## 1. Objetivos

### Logrados

| # | Objetivo | Estado |
|---|----------|--------|
| 1 | Modelar Informe Final con 6 clasificaciones (Penal, Civil, Administrativo, Sin Indicios, Medida Correctiva, Archivado) | ✅ |
| 2 | Formulario embebido para redactar/editar Informe Final con fojas, justificación, archivos, concluido_por | ✅ |
| 3 | Formulario embebido para registrar/editar Cierre con SITPRECO (opcional), notificación al denunciante, descripción, archivos | ✅ |
| 4 | Notificación al denunciante con checkbox "se notificó/no se notificó" + motivo opcional si no se notificó | ✅ |
| 5 | Campos `informe_*` y `cierre_*` en DenunciaData con arrays separados `informe_archivos` y `cierre_archivos` | ✅ |
| 6 | Soft delete (eliminado) y ediciones con historial (`informe_ediciones[]`, `cierre_ediciones[]`) | ✅ |
| 7 | Backend: 6 endpoints nuevos (guardar/editar/eliminar para informe y cierre) | ✅ |
| 8 | Tab "Informe y Cierre" como 4to tab en DenunciaSheet (visible en estados `informe` y `cerrada`) | ✅ |
| 9 | InformeDetailModal read-only (consistente con Sprint 4 SolicitudDetailModal) | ✅ |
| 10 | Cards cerradas enriquecidas con badge clasificación, SITPRECO, fecha cierre | ✅ |
| 11 | Seed demo: DEN-2026-0011 (penal, cerrada, notificado) y DEN-2026-0012 (archivado, no notificado) con informe+cierre | ✅ |
| 12 | Editable en cualquier momento (estados `informe` y `cerrada` permiten editar) | ✅ |
| 13 | `concluido_por` autocompletado con el nombre del técnico actual | ✅ |
| 14 | 15 decisiones técnicas documentadas en este archivo | ✅ |

### Pendientes / Preguntas al cliente

| # | Pregunta | Estado |
|---|----------|--------|
| 1 | **SITPRECO**: ¿En qué punto del flujo se asigna/define el código? Por ahora es opcional. ¿Se requiere validación de formato específico? | ❓ Esperando respuesta |
| 2 | **Notificación de cierre**: confirmar flujo con checkbox "¿Se notificó?" + motivo opcional cuando no. | ❓ Esperando respuesta |
| 3 | **Estructura del código SITPRECO**: longitud/formato esperado. | ❓ Esperando respuesta |

---

## 2. Arquitectura del Sprint

### 2.1 Flujo de estados

```
investigacion → informe     (SaltarFaseButton — Sprint 4)
informe → informe           (guardar/editar Informe Final, sin cambio de estado)
informe → cerrada           (guardar Cierre → estado cambia a cerrada)
cerrada → cerrada           (editar Informe/Cierre, sin cambio de estado)
cerrada → informe           (eliminar Cierre → soft delete, estado vuelve a informe)
cerrada → ingresada         (Reabrir — Sprint 3, limpia datos previos)
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

### 2.3 Backend — nuevos métodos

#### `app/Data/DenunciaData.php`

| Método | Parámetros | Descripción |
|--------|-----------|-------------|
| `guardarInforme(ticket, data, usuarioId)` | `ticket`, `data[clasificacion, fojas, justificacion, archivos, concluido_por]`, `usuarioId` | Crea/actualiza campos `informe_*`, bitácora `informe_redactado`. Estados permitidos: `informe`, `cerrada`. |
| `editarInforme(ticket, data, usuarioId)` | Mismos campos | Actualiza campos, registra cambios en `informe_ediciones[]`, bitácora `informe_editado`. |
| `eliminarInforme(ticket, usuarioId)` | — | Soft delete: `informe_eliminado=true`, `informe_fecha_eliminacion=now()`. |
| `guardarCierre(ticket, data, usuarioId)` | `ticket`, `data[sitpreco, notificado_denunciante, notificacion_medio, notificacion_fecha, notificacion_descripcion, no_notificado_motivo, concluido_por, descripcion, archivos]`, `usuarioId` | Solo desde `informe`. Cambia estado a `cerrada`. Bitácora `cierre_registrado`. |
| `editarCierre(ticket, data, usuarioId)` | Mismos campos | Solo desde `cerrada`. Actualiza campos, registra en `cierre_ediciones[]`. |
| `eliminarCierre(ticket, usuarioId)` | — | Soft delete, **vuelve estado a `informe`**. |

#### `app/Http/Controllers/DenunciaController.php`

| Método | Validaciones | Ruta |
|--------|-------------|------|
| `guardarInforme(ticket, Request)` | `clasificacion: required|in:penal,...`, `fojas: required|integer|min:1`, `justificacion: required|min:20`, `concluido_por: required|min:2` | `POST /denuncias/{ticket}/informe` |
| `editarInforme(ticket, Request)` | Mismas | `POST /denuncias/{ticket}/informe/editar` |
| `eliminarInforme(ticket)` | — | `POST /denuncias/{ticket}/informe/eliminar` |
| `guardarCierre(ticket, Request)` | `sitpreco: nullable|min:3|max:50`, `notificado_denunciante: required|boolean`, `notificacion_medio: required_if:notificado...`, `notificacion_fecha: required_if:...|date|before_or_equal:today`, `notificacion_descripcion: required_if|min:10`, `no_notificado_motivo: required_if:notificado_denunciante,false|max:500`, `concluido_por: required|min:2`, `descripcion: required|min:20` | `POST /denuncias/{ticket}/cierre` |
| `editarCierre(ticket, Request)` | Mismas | `POST /denuncias/{ticket}/cierre/editar` |
| `eliminarCierre(ticket)` | — | `POST /denuncias/{ticket}/cierre/eliminar` |

### 2.4 Nuevas entradas de bitácora

| Acción | Detalle |
|--------|---------|
| `informe_redactado` | "Informe Final redactado. Clasificación: {clas}. Fojas: {n}" |
| `informe_editado` | "Informe Final editado. Cambios: {lista}" |
| `informe_eliminado` | "Informe Final eliminado (soft delete)" |
| `cierre_registrado` | "Cierre registrado. SITPRECO: {codigo}. Estado: cerrada" |
| `cierre_editado` | "Cierre editado. Cambios: {lista}" |
| `cierre_eliminado` | "Cierre eliminado (soft delete). Estado vuelve a informe" |

### 2.5 Rutas nuevas (6)

```php
POST /denuncias/{ticket}/informe              → DenunciaController@guardarInforme
POST /denuncias/{ticket}/informe/editar       → DenunciaController@editarInforme
POST /denuncias/{ticket}/informe/eliminar     → DenunciaController@eliminarInforme
POST /denuncias/{ticket}/cierre               → DenunciaController@guardarCierre
POST /denuncias/{ticket}/cierre/editar        → DenunciaController@editarCierre
POST /denuncias/{ticket}/cierre/eliminar      → DenunciaController@eliminarCierre
```

---

## 3. Frontend

### 3.1 Componentes creados (5)

| Componente | Archivo | Descripción |
|-----------|---------|-------------|
| `ClasificacionBadge` | `Components/Denuncias/ClasificacionBadge.tsx` | Badge reutilizable con color por clasificación (6 colores: penal/rojo, civil/púrpura, administrativo/azul, sin_indicios/verde, medida_correctiva/ámbar, archivado/gris). |
| `FormInformeFinal` | `Components/Denuncias/FormInformeFinal.tsx` | Formulario embebido (no modal) con Select clasificación, Input fojas, Textarea justificación, Input concluido_por (autocompletado), manejo de archivos mock. **Modo dual**: si existe informe previo muestra preview + botones Editar/Eliminar; si no, muestra formulario vacío. Historial de cambios colapsable. |
| `FormCierre` | `Components/Denuncias/FormCierre.tsx` | Formulario embebido: Input SITPRECO (opcional, con nota informativa), Checkbox "¿Se notificó al denunciante?" + condicionales (si sí: medio/fecha/descripción; si no: motivo opcional), Input concluido_por, Textarea descripción, archivos mock. Historial colapsable. Validación: si no hay informe previo, muestra warning. |
| `TabInformeCierre` | `Components/Denuncias/TabInformeCierre.tsx` | Orquesta 2 sub-tabs shadcn (Informe Final / Cierre). Renderiza `FormInformeFinal` o `FormCierre` según sub-tab. Maneja soft delete warning + ModalConfirmarEliminar. |
| `InformeDetailModal` | `Components/Denuncias/InformeDetailModal.tsx` | Modal read-only (consistente con Sprint 4). Muestra: header con clasificación, fojas, fechas, redactado_por, justificación, archivos, cierre expandible con SITPRECO, notificación, descripción, archivos. |

### 3.2 Componentes modificados (4)

| Componente | Cambio |
|-----------|--------|
| `DenunciaSheet.tsx` | +4to tab "Informe y Cierre" (visible solo si `estado ∈ {informe, cerrada}`). +props `tecnicoNombre`. +imports `TabInformeCierre`, `ScrollText`. |
| `DenunciaCard.tsx` | +badge `ClasificacionBadge` para `cerrada`. +SITPRECO en font-mono pequeño. +fecha cierre formateada con `cierre_cerrado_at`. |
| `MisCasos.tsx` | +prop `tecnicoNombre` en `DenunciaSheet` (derivado de `tecnicos[tecnicoActual].nombre`). Estado `informe` cambiado de placeholder a "Informe pendiente" con icono `ScrollText`. |
| `Bandeja.tsx` | +prop `tecnicoNombre` en `DenunciaSheet` (derivado de `tecnicos[selectedDenuncia.tecnico]?.nombre`). |

### 3.3 UI de la pestaña Informe y Cierre

```
┌──────────────────────────────────────────────────────┐
│ [Informe Final]  [Cierre]                            │ ← Sub-tabs shadcn
├──────────────────────────────────────────────────────┤
│                                                      │
│  ── Sub-tab: Informe Final ──                        │
│  ┌────────────────────────────────────────────┐      │
│  │ FormInformeFinal (si no redactado)         │      │
│  │  o Preview del informe (si ya redactado)   │      │
│  │  + botones [Editar] [Eliminar]             │      │
│  │  + historial colapsable                    │      │
│  └────────────────────────────────────────────┘      │
│                                                      │
│  ── Sub-tab: Cierre ──                               │
│  ┌────────────────────────────────────────────┐      │
│  │ [Si no hay informe] ⚠️ mensaje warning     │      │
│  │ FormCierre (si no cerrado)                 │      │
│  │  o Preview del cierre (si cerrado)         │      │
│  │  + botones [Editar] [Eliminar]             │      │
│  │  + historial colapsable                    │      │
│  └────────────────────────────────────────────┘      │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### 3.4 UX de notificación al denunciante

```
☐ ¿Se notificó al denunciante?  [Checkbox]
  ─ Si marcado → [Medio ▼] [Fecha 📅] [Descripción textarea]
  ─ Si NO marcado → [Motivo textarea opcional, máx 500]
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
app/Data/DenunciaData.php                        → +24 campos, +6 métodos, +seed
app/Http/Controllers/DenunciaController.php      → +6 métodos (6 validaciones)
routes/web.php                                   → +6 rutas
resources/js/Components/Denuncias/DenunciaSheet.tsx → +4to tab, +tecnicoNombre prop
resources/js/Components/Denuncias/DenunciaCard.tsx  → +badges clasificación/SITPRECO/fecha
resources/js/Pages/Denuncias/MisCasos.tsx        → +tecnicoNombre, +ScrollText para informe
resources/js/Pages/Denuncias/Bandeja.tsx         → +tecnicoNombre
```

---

## 5. Decisiones técnicas

| # | Decisión | Alternativa descartada | Motivo |
|---|----------|------------------------|--------|
| 1 | Informe y Cierre como 2 sub-tabs dentro del 4to tab "Informe y Cierre" | 2 tabs separados en el sheet | Reduce clutter, agrupa acciones de cierre |
| 2 | Formularios embebidos (no Dialog) | Dialog modal | Permite ver historial sin perder contexto |
| 3 | Informe se redacta antes que Cierre (orden lógico) | Independientes | Sin Cierre no hay estado `cerrada` |
| 4 | 6 clasificaciones: Penal, Civil, Administrativo, Sin Indicios, Medida Correctiva, Archivado | 4 o 5 | Ley 974 Art. 27 |
| 5 | `informe_archivos` y `cierre_archivos` separados | Array único | Auditoría clara por fase |
| 6 | SITPRECO opcional (mín 3, máx 50 chars) — provisional | Obligatorio | Cliente confirmará formato |
| 7 | Checkbox "se notificó/no se notificó" + motivo opcional si no | Solo "se notificó" obligatorio | Anónimos sin contacto no deben bloquear cierre |
| 8 | `concluido_por` autocompletado con técnico actual (editable) | Campo vacío | Reduce errores, mantiene trazabilidad del dropdown |
| 9 | Informe y Cierre editables en cualquier momento (incluso en `cerrada`) | Bloqueado al guardar | Permite correcciones; auditoría en `*_ediciones[]` |
| 10 | Soft delete con `*_eliminado` flag | Hard delete | Consistencia con Sprint 4 |
| 11 | `ediciones[]` con cambios+usuario+fecha | Solo flag "editado" | Trazabilidad completa |
| 12 | Reapertura (Sprint 3) preserva campos (los datos limpios se definen en `reabrir()`) | Limpia todo | Datos útiles en bitácora |
| 13 | `InformeDetailModal` opcional para preview read-only | Solo embebido | Consistencia con Sprint 4 DetailModals |
| 14 | Cards cerradas muestran badge clasificación + SITPRECO + fecha cierre | Mantener cards simples | Info clave sin abrir sheet |
| 15 | DenunciaSheet gana 4to tab solo en `informe` y `cerrada` | Siempre visible | No tiene sentido en otros estados |

---

## 6. Seed demo

La seed demo ahora incluye datos reales de informe y cierre para:

| Ticket | Estado | Clasificación | SITPRECO | Notificado | Bitácora |
|--------|--------|---------------|----------|------------|----------|
| DEN-2026-0011 | cerrada | Penal | SIT-UML-CC1-2026-0501 | Sí (email) | informe_redactado + cierre_registrado |
| DEN-2026-0012 | cerrada (archivada) | Archivado | SIT-UML-CC1-2026-0302 | No (anónimo sin contacto) | informe_redactado + cierre_registrado |

---

## 7. Verificación

- ✅ `npm run build` → 3896 módulos, 4.35s, 0 errores TypeScript+Vite
- ✅ Flujo: crear denuncia → admitir → asignar → investigar → saltar fase → redactar informe (informe) → cerrar (cerrada) → editar cierre → eliminar cierre (vuelve a informe)
- ✅ Seed data visible con badges clasificación, SITPRECO, fecha en cards cerradas
- ✅ Tab "Informe y Cierre" visible en MisCasos (con acciones) y Bandeja (read-only)
- ✅ Historial de cambios colapsable con ediciones
- ✅ Soft delete con warning visual
- ✅ 15 decisiones documentadas

---

## 8. Notas

- Sprint 5 no creó nuevos Data/Controllers independientes; todo se integró en `DenunciaData` y `DenunciaController` (a diferencia de Sprint 4 que creó `SolicitudData`, `DescargoData`, `SolicitudController`, `DescargoController`). Esto es porque informe y cierre son propios de la denuncia, no entidades externas.
- El patrón `ediciones[]` con campo+anterior+nuevo+fecha+usuario se mantiene del Sprint 4.
- Componente `ArchivoAdjunto` se reutiliza sin cambios.
- Los archivos mock no se envían al backend (solo se mantienen en estado local del frontend). Cuando haya BD real, se implementará subida real.
- SITPRECO queda como opcional hasta que el cliente confirme estructura/formato. Ver sección "Preguntas al cliente".
