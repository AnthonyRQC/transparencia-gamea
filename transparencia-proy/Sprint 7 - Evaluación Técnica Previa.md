#transparencia
# Sprint 7 — Evaluación Técnica Previa ✅ CERRADO (Julio 2026)

**Objetivo:** Permitir al Jefe de Unidad delegar la evaluación de una denuncia a un técnico antes de admitirla o rechazarla. El técnico evalúa y devuelve la denuncia con su evaluación resumida. El Jefe decide entonces si admite o rechaza.

**Origen:** Respuesta del cliente #1 (delegación de evaluación), Junio 2026.

> 🆕 **Actualización Julio 2026:** Sprint 7 cerrado a nivel de núcleo funcional. El bloque SITPRECO fue **diferido al Sprint 7.A** con un nuevo lineamiento (SITPRECO solo en informe final + opcional en rechazo; NO se pide al admitir). Ver `Sprint 7.A - Cierre SITPRECO Sprint 7.md` para los ajustes finos.

---

## 1. Contexto

### 1.1 Problema
El flujo actual (Sprint 1-3) tiene al Jefe de Unidad como único evaluador antes de la admisión. El Jefe tiene carga múltiple y a veces puede beneficiarse de una evaluación técnica previa antes de decidir.

### 1.2 Solución
Nuevo sub-estado `evaluacion_tecnica` entre `ingresada` y `admitida/rechazada`. El Jefe puede delegar la evaluación a un técnico (cualquiera disponible) o evaluar él mismo.

### 1.3 Diagrama de flujo

```
[Registrador registra] → ingresada
                              │
                              ├─→ [Jefe evalúa directamente] → admitir/rechazar
                              │
                              └─→ [Jefe delega a técnico X] → evaluacion_tecnica
                                                                       │
                                                                       └─→ [Técnico X evalúa y devuelve] → ingresada
                                                                                                              │
                                                                                                              └─→ [Jefe admite/rechaza] → ...
```

---

## 2. Backend (PHP)

### 2.1 Archivos nuevos

| Archivo | Descripción |
|---------|-------------|
| `app/Data/EvaluacionData.php` | Colección mock de evaluaciones técnicas. Métodos: `add()`, `findByDenuncia()`, `getActivasPorTecnico()`. |
| `app/Http/Controllers/EvaluacionController.php` | Métodos: `delegar(Request)` (Jefe delega), `devolver(Request)` (Técnico devuelve con evaluación). |

### 2.2 Archivos modificados

#### `app/Data/DenunciaData.php`
- **Nuevo sub-estado:** `evaluacion_tecnica`
- **Nuevos campos en `makeDenuncia()`:**
  - `evaluacion_tecnica_texto` (string, nullable)
  - `evaluacion_tecnica_tecnico_id` (int, nullable)
  - `evaluacion_tecnica_devuelta_at` (datetime, nullable)
  - `evaluacion_tecnica_tecnico_nombre` (string, nullable, para historial)
- **Nuevo método:** `delegarEvaluacion(int $id, int $tecnicoId, string $justificacion)` — cambia estado a `evaluacion_tecnica`.
- **Nuevo método:** `devolverEvaluacion(int $id, string $textoEvaluacion, string $recomendacion)` — guarda evaluación, vuelve a `ingresada` (con flag interno de "evaluación devuelta disponible").
- **Modificar `admitir()`:** agregar parámetro `string $sitpreco` obligatorio.
- **Modificar `rechazar()`:** mantener SITPRECO opcional (actual `?string $sitpreco`).
- **Seed:** actualizar al menos 1 denuncia en estado `evaluacion_tecnica` para testing.

#### `app/Http/Controllers/DenunciaController.php`
- **Nuevos métodos:**
  - `delegarEvaluacion(Request $request, int $id)` — llama `DenunciaData::delegarEvaluacion()`
  - `devolverEvaluacion(Request $request, int $id)` — llama `DenunciaData::devolverEvaluacion()`
- **Modificar `admitir()`:** requerir SITPRECO en validación (`required|string|min:3|max:50`)
- **Modificar `rechazar()`:** SITPRECO opcional (sin validación `required`)
- **Modificar `store()`:** flash incluye `successToken` (ya implementado en Sprint 6)

#### `routes/web.php`
- `POST /denuncias/{id}/delegar-evaluacion` → `DenunciaController@delegarEvaluacion`
- `POST /denuncias/{id}/devolver-evaluacion` → `DenunciaController@devolverEvaluacion`

### 2.3 Modelo de datos (mock)

```php
// En DenunciaData.php
[
    'id' => 13,
    'ticket' => 'DEN-2026-0013',
    'estado' => 'evaluacion_tecnica',  // NUEVO estado
    'evaluacion_tecnica_texto' => null,  // hasta que el técnico devuelva
    'evaluacion_tecnica_tecnico_id' => 2,  // técnico delegado
    'evaluacion_tecnica_tecnico_nombre' => 'Juan Pérez',
    'evaluacion_tecnica_delegada_at' => '2026-06-29 10:00:00',
    'evaluacion_tecnica_devuelta_at' => null,
    'evaluacion_tecnica_justificacion_delegacion' => 'Por carga del Jefe',
    // ... resto de campos
]
```

---

## 3. Frontend (React + TypeScript)

### 3.1 Componentes nuevos (5)

| Componente | Descripción |
|------------|-------------|
| `ModalDelegarEvaluacion.tsx` | Modal que muestra lista de técnicos disponibles (cards con `TecnicoCargaCard`). Jefe selecciona técnico + ingresa justificación opcional. Submit delega y cierra. |
| `ModalDevolverEvaluacion.tsx` | Modal para que el técnico ingrese la evaluación. Textarea grande + selector de recomendación (Admitir / Rechazar / Requiere más info). Submit devuelve. |
| `TabEvaluacionPrevia.tsx` | Tab en `DenunciaSheet` que muestra el historial de evaluaciones (delegaciones, devoluciones, quién evaluó, qué dijo, recomendación). |
| `Pages/Denuncias/Evaluaciones.tsx` | Vista/bandeja del técnico con las evaluaciones que le fueron delegadas. Tabla con cards + filtros (pendientes, devueltas). |

### 3.2 Componentes modificados (5)

| Componente | Cambio |
|------------|--------|
| `ModalAdmision.tsx` | Agregar input SITPRECO **obligatorio** (sin hint, texto libre). Validación: required, min 3, max 50. Si estado es `evaluacion_tecnica`, mostrar banner arriba: "Esta denuncia fue evaluada por [Técnico]. Recomendación: [Admitir/Rechazar]". |
| `ModalRechazo.tsx` | Mantener SITPRECO opcional (sin hint, sin required). Mismo banner si hubo evaluación previa. |
| `FormCierre.tsx` | Cambiar campo `cierre_sitpreco` a **read-only** (viene heredado de admisión). Mostrar texto: "SITPRECO registrado en admisión: [valor]". |
| `Bandeja.tsx` | En tab "Por admitir" (o crear tab "En evaluación"), agregar botón "Delegar evaluación" en cada card. Si ya está en `evaluacion_tecnica`, mostrar "Esperando evaluación de [Técnico]". |
| `MisCasos.tsx` | Agregar tab "Evaluaciones delegadas" (mostrar badge con conteo de pendientes). Link a `Pages/Denuncias/Evaluaciones.tsx`. |
| `DetalleDenuncia.tsx` | Agregar `TabEvaluacionPrevia` (4to tab después de Informe/Cierre). |

---

## 4. Sub-estado `evaluacion_tecnica`

### 4.1 Reglas de transición

| Estado origen | Acción | Estado destino | Quién |
|---------------|--------|----------------|-------|
| `ingresada` | Jefe delega evaluación | `evaluacion_tecnica` | Jefe |
| `evaluacion_tecnica` | Técnico devuelve | `ingresada` (con flag interno) | Técnico |
| `ingresada` | Jefe admite (con SITPRECO) | `admitida` | Jefe |
| `ingresada` | Jefe rechaza (SITPRECO opcional) | `rechazada` | Jefe |
| `evaluacion_tecnica` | (no hay admisión directa, siempre vuelve a ingresada) | — | — |

### 4.2 Plazos
- Los 5 días de admisión (Art. 23) **se cuentan desde la recepción**
- **No se pausan** durante la evaluación del técnico
- Técnico y Jefe **comparten el mismo plazo** de 5 días
- Si el técnico tarda, queda menos tiempo para que el Jefe decida

---

## 5. Decisiones del Sprint

| # | Decisión | Estado | Motivo |
|---|----------|--------|--------|
| 1 | Sub-estado `evaluacion_tecnica` (no estado separado) | ✅ Vigente | Es una fase corta, no merece un estado con flujo propio |
| 2 | Cualquier técnico disponible puede ser delegado | ✅ Vigente | El cliente no impuso restricciones |
| 3 | El Jefe puede evaluar sin delegar | ✅ Vigente | El Jefe tiene la opción; a veces no necesita delegado |
| 4 | Plazos no se pausan | ✅ Vigente | Ley 974 dice "5 días desde la recepción" sin excepciones |
| 5 | ~~SITPRECO obligatorio al admitir, opcional al rechazar~~ | ❌ **Revocado Julio 2026** | ~~Refleja el proceso real: rechazar no genera código SITPRECO en todos los casos~~ → Ver Sprint 7.A |
| 6 | ~~Input SITPRECO sin hint de formato~~ | ❌ **Revocado Julio 2026** | Ver Sprint 7.A |
| 7 | ~~SITPRECO se almacena al admitir, no al cierre~~ | ❌ **Revocado Julio 2026** | Ver Sprint 7.A |
| 8 | Técnico que evalúa puede ser reasignado o no al caso final | ✅ Vigente | El Jefe decide por carga o expertise |
| 9 | Técnico ve el caso en su `MisCasos` con tab "Evaluaciones delegadas" | ✅ Vigente | Mantener un solo lugar de trabajo por usuario |
| 10 | Evaluación tiene recomendación (Admitir/Rechazar) | ✅ Vigente (sin "Más info") | Facilita la decisión del Jefe, pero no la ata |
| 11 | Bandeja del Jefe muestra "Esperando evaluación de [Técnico]" en cards delegadas | ✅ Vigente | Transparencia del estado para el Jefe |
| 12 | ~~El `FormCierre` muestra SITPRECO read-only heredado~~ | ❌ **Revocado Julio 2026** | Ver Sprint 7.A |

### 🆕 Nuevo lineamiento SITPRECO (Julio 2026)

**Decisión revisada con el cliente:** el SITPRECO es un código del sistema externo SITPRECO que puede tardar. Pedirlo al admitir genera burocracia innecesaria.

**Comportamiento definitivo (aplicado en Sprint 7.A):**
- **Admisión:** NO se pide SITPRECO. `ModalAdmision` queda como está.
- **Rechazo:** SITPRECO opcional. `ModalRechazo` agrega un input opcional (sin required, sin hint, max 50).
- **Cierre:** NO hereda SITPRECO de admisión (porque no se pidió). `FormCierre` queda como está (usa su propio `cierre_sitpreco` si existe, en el `informe_final`).
- **Informe final:** SITPRECO se mantiene (ya estaba en `FormInformeFinal` desde Sprint 5). Es la única instancia formal del código.

**Ver detalle de los cambios finos:** `Sprint 7.A - Cierre SITPRECO Sprint 7.md`.

---

## 6. Mock data: denuncia ejemplo

```php
// app/Data/DenunciaData.php → seed()
[
    'id' => 13,
    'ticket' => 'DEN-2026-0013',
    'tipo' => 'corrupcion',
    'estado' => 'evaluacion_tecnica',
    'fecha_ingreso' => '2026-06-29',
    'denunciante' => [...],
    'denunciados' => [...],
    'hechos' => '...',
    'tecnico' => null,  // aún no asignado
    'evaluacion_tecnica_tecnico_id' => 2,  // Juan Pérez delegado
    'evaluacion_tecnica_tecnico_nombre' => 'Juan Pérez',
    'evaluacion_tecnica_delegada_at' => '2026-06-29 10:00:00',
    'evaluacion_tecnica_justificacion_delegacion' => 'Por carga del Jefe esta semana',
    // El técnico aún no devolvió, así que:
    'evaluacion_tecnica_texto' => null,
    'evaluacion_tecnica_devuelta_at' => null,
]
```

### Variantes en seed (1-2 denuncias):
- 1 en `evaluacion_tecnica` (pendiente de devolución)
- 1 en `ingresada` con evaluación devuelta disponible (para que el Jefe vea la recomendación antes de decidir)
- 1 en `admitida` que pasó por evaluación técnica previa (para historial)

---

## 7. UI/UX

### 7.1 Vista del Jefe (Bandeja)

**Tab "Por admitir":**
- Si la denuncia está en `ingresada` y NO fue delegada:
  - Botones: "Admitir" / "Rechazar" / "Delegar evaluación" (nuevo)
- Si la denuncia está en `evaluacion_tecnica`:
  - Estado: "Esperando evaluación de [Técnico] (delegado el [fecha])"
  - Botón disabled: "Acción no disponible hasta que el técnico devuelva"

**ModalDelegarEvaluacion:**
- Título: "Delegar evaluación a un técnico"
- Lista de técnicos disponibles (cards con carga)
- Textarea opcional: "Justificación de la delegación" (ej. "Por carga esta semana")
- Botón "Delegar"

### 7.2 Vista del Técnico (MisCasos / Evaluaciones)

**Tab "Evaluaciones delegadas" (en MisCasos):**
- Lista de denuncias con evaluación pendiente
- Card muestra: ticket, tipo, fecha delegación, quién delegó
- Botón "Evaluar y devolver" → abre `ModalDevolverEvaluacion`

**ModalDevolverEvaluacion:**
- Título: "Devolver evaluación de la denuncia"
- Info arriba: ticket, hechos (preview), denunciante (no editable)
- Textarea grande: "Evaluación técnica resumida" (min 50 chars, max 2000)
- Selector: "Recomendación" (Admitir / Rechazar / Requiere más info)
- Botón "Devolver al Jefe"

### 7.3 Vista del detalle (DenunciaSheet)

**Nuevo tab "Evaluación previa" (4to tab):**
- Si NO hubo evaluación previa: empty state "Esta denuncia no pasó por evaluación técnica"
- Si hubo: lista cronológica de:
  - "Delegada a [Técnico] el [fecha] por [Jefe]. Justificación: [texto]"
  - "Devuelta por [Técnico] el [fecha]. Recomendación: [Admitir/Rechazar/Más info]. Texto: [evaluación]"

---

## 8. Pruebas manuales sugeridas (actualizadas Julio 2026)

| Caso | Pasos | Resultado esperado |
|------|-------|---------------------|
| 1. Delegar evaluación | Bandeja → Por admitir → Card → "Delegar evaluación" → Seleccionar técnico → Justificación → "Delegar" | Card cambia a "Esperando evaluación de [Técnico]" |
| 2. Técnico ve delegación | Login como técnico delegado → MisCasos → Tab "Evaluaciones delegadas" | Ve la denuncia con botón "Evaluar y devolver" |
| 3. Devolver evaluación | Click "Evaluar y devolver" → Llenar textarea + recomendación → "Devolver" | Desaparece del tab "Evaluaciones delegadas", aparece en "Evaluaciones devueltas" (historial) |
| 4. Jefe ve recomendación | Bandeja → Por admitir → Card ahora muestra banner "Evaluación devuelta por [Técnico]. Recomendación: Admitir" | Jefe puede decidir con más información |
| 5. Admitir (sin SITPRECO) | Click "Admitir" → NO aparece input SITPRECO → Justificación opcional → "Admitir" | Denuncia pasa a `admitida` |
| 6. ~~Rechazar con SITPRECO opcional~~ | _(cubierto por Sprint 7.A)_ | _(cubierto por Sprint 7.A)_ |
| 7. ~~Ver SITPRECO en cierre~~ | _(revocado — FormCierre ya no muestra SITPRECO heredado)_ | _(N/A)_ |

---

## 9. TODO / Pendientes

> ⏸️ **Pendiente con cliente:** Formato SITPRECO definitivo. Por ahora se mantiene como texto libre sin hint (solo en rechazo opcional y en informe final).

> ⏸️ **Pendiente con cliente:** Pregunta #5 — ¿Archivar casos debe ser subestado de `cerrada` o estado separado? (no afecta este sprint, pero está en cola).

> ✅ **Resuelto Julio 2026:** Bloque SITPRECO del Sprint 7 diferenciado. Ver `Sprint 7.A - Cierre SITPRECO Sprint 7.md`.

---

## 10. Notas técnicas

- **Mock data:** Se agrega 1-2 denuncias en seed en estado `evaluacion_tecnica` para testing
- **shadcn:** No se requieren componentes nuevos (se reusan `dialog`, `select`, `textarea`, `button`, `card`, `badge`)
- **Validación SITPRECO (post-Sprint 7.A):** rechazo acepta `nullable|string|max:50`, sin required. Admisión y cierre no piden SITPRECO.
- **Re-render:** `useRef` en modales, optimistic updates con Inertia
- **Performance:** Solo cargar técnicos disponibles al abrir el modal (lazy fetch)
- **Compatibilidad:** Mantener todos los estados existentes (`ingresada`, `admitida`, `rechazada`, etc.)
- **Sprint 6 — Bug fix similar:** El input SITPRECO debe ser texto plano sin auto-formato, siguiendo la lección aprendida en Sprint 6 con el ticket del denunciante

---

## 11. Cambios en otros archivos .md

- `AI-CONTEXT.md`: ✅ actualizado
- `Plan de Desarrollo.md`: ✅ actualizado con sprint 7 cerrado
- `Sprints Pendientes - Contexto.md`: ✅ actualizado (Sprint 7 cerrado, agregado 7.A, 7.5, 7.6, 7.7, 22, 23, 24)
- `Esquema de Base de Datos.md`: ✅ actualizado (SITPRECO en `denuncias.sitpreco_rechazo`)
- `Preguntas para el cliente.md`: ⏸️ pendiente actualización
- `Proyecto - Resumen General del Sistema.md`: ⏸️ pendiente actualización

---

## 12. Cierre (Julio 2026)

**Estado final:** Sprint 7 **cerrado a nivel de núcleo funcional**. Implementación realizada:
- ✅ `EvaluacionData.php` y `EvaluacionController.php` con método `devolver`
- ✅ `DenunciaData` con sub-estado `evaluacion_tecnica`, 7 campos `evaluacion_tecnica_*` y métodos `delegarEvaluacion/devolverEvaluacion/reasumirEvaluacion`
- ✅ `DenunciaController` con métodos `delegarEvaluacion` y `reasumirEvaluacion`
- ✅ `ModalDelegarEvaluacion` y `ModalDevolverEvaluacion`
- ✅ `TabEvaluacionPrevia` en `DenunciaSheet`
- ✅ `Pages/Denuncias/Evaluaciones.tsx` con tabs "Pendientes" y "Devueltas"
- ✅ `Bandeja.tsx` con botón "Delegar evaluación", botón "Reasumir", banner "En evaluación por [Técnico]"
- ✅ `MisCasos.tsx` con tab "Evaluaciones delegadas" + badge
- ✅ Seed con `DEN-2026-0013` (pendiente de devolución) y `DEN-2026-0014` (devuelta con recomendación)

**Pendiente para Sprint 7.A:** Ajuste del bloque SITPRECO al nuevo lineamiento. Ver `Sprint 7.A - Cierre SITPRECO Sprint 7.md`.

---
*Documento creado: Junio 2026. Cerrado: Julio 2026. Bloque SITPRECO refinado en Sprint 7.A.*
