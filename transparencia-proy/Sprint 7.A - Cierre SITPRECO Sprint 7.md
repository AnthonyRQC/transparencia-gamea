#transparencia
# Sprint 7.A — Cierre SITPRECO Sprint 7 (NUEVO — Julio 2026) ⏳ URGENTE

**Objetivo:** Ajustar el bloque SITPRECO del Sprint 7 al nuevo lineamiento del cliente. Eliminar toda referencia a "SITPRECO obligatorio al admitir" y "SITPRECO heredado en cierre". Agregar SITPRECO opcional en `ModalRechazo`.

**Origen:** Decisión del cliente Julio 2026 — el SITPRECO es un código del sistema externo SITPRECO que puede tardar; pedirlo al admitir genera burocracia innecesaria.

**Estimación:** 1-2 días. Cambios pequeños.

---

## 1. Contexto

### 1.1 Situación actual (post-Sprint 7 cerrado)
- El Sprint 7 planificó SITPRECO **obligatorio al admitir**, **opcional al rechazar**, y **read-only heredado en cierre**.
- Sin embargo, en la práctica operativa del UTLCC, el código SITPRECO del sistema externo puede tardar varios días.
- Pedirlo en admisión bloquea el flujo del caso.

### 1.2 Nueva decisión (Julio 2026)
- **SITPRECO NO se pide al admitir.** El caso puede pasar a `admitida` sin SITPRECO.
- **SITPRECO se mantiene en el informe final** (donde ya estaba desde Sprint 5), con su propio campo.
- **SITPRECO se agrega opcional al rechazar** (única instancia en la que se puede capturar fuera del informe).

### 1.3 Diagrama del nuevo flujo SITPRECO

```
[Registrador registra] → ingresada
                              │
                              ├─→ [Jefe admite] → admitida  (NO pide SITPRECO)
                              │
                              └─→ [Jefe rechaza] → rechazada (SITPRECO opcional)
                                                                  │
                                                                  └─→ si hay SITPRECO, se guarda en `denuncias.sitpreco_rechazo`

(...)
                              │
                              └─→ [Técnico redacta Informe Final] → informe
                                                                       │
                                                                       └─→ SITPRECO se captura en FormInformeFinal (única instancia formal)
```

---

## 2. Cambios a realizar

### 2.1 Frontend

#### `resources/js/Components/Denuncias/ModalRechazo.tsx` (modificar)
- **Agregar** input opcional `sitpreco_rechazo` después del textarea de justificación interna.
- Comportamiento:
  - Label: "SITPRECO (opcional)"
  - Sin required, sin hint de formato
  - Texto libre, max 50 caracteres
  - Helper text: "Código del sistema SITPRECO si está disponible al momento del rechazo"
- **Estilo:** MAYÚSCULAS con `text-transform: uppercase` (consistente con Sprint 7.5)
- **NO cambiar** el resto del modal (justificación obligatoria, resumen público opcional)

#### `resources/js/Components/Denuncias/ModalAdmision.tsx` (NO TOCAR)
- Queda como está. Sin input SITPRECO.

#### `resources/js/Components/Denuncias/FormCierre.tsx` (NO TOCAR)
- Queda como está. Sin SITPRECO heredado de admisión.

### 2.2 Backend

#### `app/Http/Controllers/DenunciaController.php` (modificar `rechazar`)
- Agregar validación:
  ```php
  'sitpreco' => 'nullable|string|max:50',
  ```
- Pasar `sitpreco` al método `DenunciaData::rechazar()`.

#### `app/Data/DenunciaData.php` (modificar `rechazar`)
- Agregar parámetro opcional `?string $sitpreco = null`.
- Si viene, guardar en `denuncia.sitpreco_rechazo`.

#### `app/Http/Controllers/DenunciaController.php` (`admitir`) (NO TOCAR)
- Queda como está. Sin SITPRECO.

### 2.3 Base de datos (Sprint 14)

#### `denuncias` (modificar tabla)
- Agregar columna `sitpreco_rechazo` (TEXT 50, NULLABLE).
- Ver `Esquema de Base de Datos.md` → tabla `denuncias` → campo `sitpreco_rechazo`.

---

## 3. Verificación de cierre

### 3.1 Casos de prueba manuales

| Caso | Pasos | Resultado esperado |
|------|-------|---------------------|
| 1. Rechazar con SITPRECO | Click "Rechazar" → Llenar justificación → Llenar SITPRECO → "Rechazar" | Denuncia pasa a `rechazada`, `sitpreco_rechazo` guardado |
| 2. Rechazar sin SITPRECO | Click "Rechazar" → Llenar justificación → Dejar SITPRECO vacío → "Rechazar" | Denuncia pasa a `rechazada`, `sitpreco_rechazo = null` |
| 3. Admitir (sin SITPRECO) | Click "Admitir" → Justificación opcional → "Admitir" | Denuncia pasa a `admitida`, ningún campo SITPRECO tocado |
| 4. Cierre (sin SITPRECO heredado) | Caso avanzado a cierre → Abrir FormCierre | NO aparece SITPRECO heredado; usa su propio `cierre_sitpreco` si existe |
| 5. Informe Final (SITPRECO formal) | Caso en `informe` → Redactar Informe Final | Aparece input SITPRECO como siempre (Sprint 5) |

### 3.2 Verificación de docs
- ✅ `Sprint 7 - Evaluación Técnica Previa.md` — decisiones 5, 6, 7, 12 revocadas, nueva sección "Nuevo lineamiento SITPRECO"
- ✅ `AI-CONTEXT.md` — Sprint 7 marcado cerrado
- ✅ `Plan de Desarrollo.md` — Sprint 7 cerrado, Sprint 7.A documentado
- ✅ `Sprints Pendientes - Contexto.md` — Sprint 7.A creado
- ✅ `Esquema de Base de Datos.md` — campo `sitpreco_rechazo` agregado

---

## 4. Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `resources/js/Components/Denuncias/ModalRechazo.tsx` | +input SITPRECO opcional |
| `app/Http/Controllers/DenunciaController.php` | `rechazar()` acepta `sitpreco` opcional |
| `app/Data/DenunciaData.php` | `rechazar()` guarda `sitpreco_rechazo` |

**NO se tocan:** `ModalAdmision.tsx`, `FormCierre.tsx`, ningún otro.

---

## 5. Decisiones del Sprint

| # | Decisión | Alternativa descartada | Motivo |
|---|----------|------------------------|--------|
| 1 | SITPRECO NO se pide al admitir | Mantener obligatorio | El sistema externo puede tardar; pedirlo genera bloqueo |
| 2 | SITPRECO opcional al rechazar | Siempre opcional o siempre obligatorio | El rechazo puede o no tener SITPRECO disponible |
| 3 | SITPRECO se mantiene en Informe Final (Sprint 5) | Quitarlo | Es la única instancia formal del código |
| 4 | NO hay SITPRECO heredado en cierre | Heredar de admisión | Ya no se pide al admitir, no hay qué heredar |
| 5 | Input SITPRECO en rechazo: max 50, sin hint | Mostrar placeholder | Consistencia con Sprint 5 y Sprint 7 original |

---

## 6. Cierre

Al cerrar Sprint 7.A, Sprint 7 queda **completamente cerrado al 100%** y se puede proceder con los siguientes sprints urgentes:
1. **Sprint 7.5** — Ajustes UX Urgentes pre-cliente
2. **Sprint 7.6** — Repositorio de Archivos del Caso
3. **Sprint 7.7** — Búsqueda y Consulta para Registrador

---
*Documento creado: Julio 2026. Sprint 7.A del Sprint 7.*
