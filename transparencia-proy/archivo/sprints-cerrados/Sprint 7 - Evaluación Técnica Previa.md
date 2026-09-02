> ⚠️ **Histórico — Sprint cerrado Jul 2026 (Laravel 11).** Snapshot al cierre, no refleja refactorización Bloques 0-2 (Sep 2026, Laravel 13). Para estado actual ver AI-CONTEXT.md y Notas Reestructuración - Bloques 0-2 (Sept 2026) - Cierre.md.
#transparencia
# Sprint 7 â€” EvaluaciÃ³n TÃ©cnica Previa âœ… CERRADO (Julio 2026)

**Objetivo:** Permitir al Jefe de Unidad delegar la evaluaciÃ³n de una denuncia a un tÃ©cnico antes de admitirla o rechazarla. El tÃ©cnico evalÃºa y devuelve la denuncia con su evaluaciÃ³n resumida. El Jefe decide entonces si admite o rechaza.

**Origen:** Respuesta del cliente #1 (delegaciÃ³n de evaluaciÃ³n), Junio 2026.

> ðŸ†• **ActualizaciÃ³n Julio 2026:** Sprint 7 cerrado a nivel de nÃºcleo funcional. El bloque SITPRECO fue **diferido al Sprint 7.A** con un nuevo lineamiento (SITPRECO solo en informe final + opcional en rechazo; NO se pide al admitir). Ver `Sprint 7.A - Cierre SITPRECO Sprint 7.md` para los ajustes finos.

---

## 1. Contexto

### 1.1 Problema
El flujo actual (Sprint 1-3) tiene al Jefe de Unidad como Ãºnico evaluador antes de la admisiÃ³n. El Jefe tiene carga mÃºltiple y a veces puede beneficiarse de una evaluaciÃ³n tÃ©cnica previa antes de decidir.

### 1.2 SoluciÃ³n
Nuevo sub-estado `evaluacion_tecnica` entre `ingresada` y `admitida/rechazada`. El Jefe puede delegar la evaluaciÃ³n a un tÃ©cnico (cualquiera disponible) o evaluar Ã©l mismo.

### 1.3 Diagrama de flujo

```
[Registrador registra] â†’ ingresada
                              â”‚
                              â”œâ”€â†’ [Jefe evalÃºa directamente] â†’ admitir/rechazar
                              â”‚
                              â””â”€â†’ [Jefe delega a tÃ©cnico X] â†’ evaluacion_tecnica
                                                                       â”‚
                                                                       â””â”€â†’ [TÃ©cnico X evalÃºa y devuelve] â†’ ingresada
                                                                                                              â”‚
                                                                                                              â””â”€â†’ [Jefe admite/rechaza] â†’ ...
```

---

## 2. Backend (PHP)

### 2.1 Archivos nuevos

| Archivo | DescripciÃ³n |
|---------|-------------|
| `app/Data/EvaluacionData.php` | ColecciÃ³n mock de evaluaciones tÃ©cnicas. MÃ©todos: `add()`, `findByDenuncia()`, `getActivasPorTecnico()`. |
| `app/Http/Controllers/EvaluacionController.php` | MÃ©todos: `delegar(Request)` (Jefe delega), `devolver(Request)` (TÃ©cnico devuelve con evaluaciÃ³n). |

### 2.2 Archivos modificados

#### `app/Data/DenunciaData.php`
- **Nuevo sub-estado:** `evaluacion_tecnica`
- **Nuevos campos en `makeDenuncia()`:**
  - `evaluacion_tecnica_texto` (string, nullable)
  - `evaluacion_tecnica_tecnico_id` (int, nullable)
  - `evaluacion_tecnica_devuelta_at` (datetime, nullable)
  - `evaluacion_tecnica_tecnico_nombre` (string, nullable, para historial)
- **Nuevo mÃ©todo:** `delegarEvaluacion(int $id, int $tecnicoId, string $justificacion)` â€” cambia estado a `evaluacion_tecnica`.
- **Nuevo mÃ©todo:** `devolverEvaluacion(int $id, string $textoEvaluacion, string $recomendacion)` â€” guarda evaluaciÃ³n, vuelve a `ingresada` (con flag interno de "evaluaciÃ³n devuelta disponible").
- **Modificar `admitir()`:** agregar parÃ¡metro `string $sitpreco` obligatorio.
- **Modificar `rechazar()`:** mantener SITPRECO opcional (actual `?string $sitpreco`).
- **Seed:** actualizar al menos 1 denuncia en estado `evaluacion_tecnica` para testing.

#### `app/Http/Controllers/DenunciaController.php`
- **Nuevos mÃ©todos:**
  - `delegarEvaluacion(Request $request, int $id)` â€” llama `DenunciaData::delegarEvaluacion()`
  - `devolverEvaluacion(Request $request, int $id)` â€” llama `DenunciaData::devolverEvaluacion()`
- **Modificar `admitir()`:** requerir SITPRECO en validaciÃ³n (`required|string|min:3|max:50`)
- **Modificar `rechazar()`:** SITPRECO opcional (sin validaciÃ³n `required`)
- **Modificar `store()`:** flash incluye `successToken` (ya implementado en Sprint 6)

#### `routes/web.php`
- `POST /denuncias/{id}/delegar-evaluacion` â†’ `DenunciaController@delegarEvaluacion`
- `POST /denuncias/{id}/devolver-evaluacion` â†’ `DenunciaController@devolverEvaluacion`

### 2.3 Modelo de datos (mock)

```php
// En DenunciaData.php
[
    'id' => 13,
    'ticket' => 'DEN-2026-0013',
    'estado' => 'evaluacion_tecnica',  // NUEVO estado
    'evaluacion_tecnica_texto' => null,  // hasta que el tÃ©cnico devuelva
    'evaluacion_tecnica_tecnico_id' => 2,  // tÃ©cnico delegado
    'evaluacion_tecnica_tecnico_nombre' => 'Juan PÃ©rez',
    'evaluacion_tecnica_delegada_at' => '2026-06-29 10:00:00',
    'evaluacion_tecnica_devuelta_at' => null,
    'evaluacion_tecnica_justificacion_delegacion' => 'Por carga del Jefe',
    // ... resto de campos
]
```

---

## 3. Frontend (React + TypeScript)

### 3.1 Componentes nuevos (5)

| Componente | DescripciÃ³n |
|------------|-------------|
| `ModalDelegarEvaluacion.tsx` | Modal que muestra lista de tÃ©cnicos disponibles (cards con `TecnicoCargaCard`). Jefe selecciona tÃ©cnico + ingresa justificaciÃ³n opcional. Submit delega y cierra. |
| `ModalDevolverEvaluacion.tsx` | Modal para que el tÃ©cnico ingrese la evaluaciÃ³n. Textarea grande + selector de recomendaciÃ³n (Admitir / Rechazar / Requiere mÃ¡s info). Submit devuelve. |
| `TabEvaluacionPrevia.tsx` | Tab en `DenunciaSheet` que muestra el historial de evaluaciones (delegaciones, devoluciones, quiÃ©n evaluÃ³, quÃ© dijo, recomendaciÃ³n). |
| `Pages/Denuncias/Evaluaciones.tsx` | Vista/bandeja del tÃ©cnico con las evaluaciones que le fueron delegadas. Tabla con cards + filtros (pendientes, devueltas). |

### 3.2 Componentes modificados (5)

| Componente | Cambio |
|------------|--------|
| `ModalAdmision.tsx` | Agregar input SITPRECO **obligatorio** (sin hint, texto libre). ValidaciÃ³n: required, min 3, max 50. Si estado es `evaluacion_tecnica`, mostrar banner arriba: "Esta denuncia fue evaluada por [TÃ©cnico]. RecomendaciÃ³n: [Admitir/Rechazar]". |
| `ModalRechazo.tsx` | Mantener SITPRECO opcional (sin hint, sin required). Mismo banner si hubo evaluaciÃ³n previa. |
| `FormCierre.tsx` | Cambiar campo `cierre_sitpreco` a **read-only** (viene heredado de admisiÃ³n). Mostrar texto: "SITPRECO registrado en admisiÃ³n: [valor]". |
| `Bandeja.tsx` | En tab "Por admitir" (o crear tab "En evaluaciÃ³n"), agregar botÃ³n "Delegar evaluaciÃ³n" en cada card. Si ya estÃ¡ en `evaluacion_tecnica`, mostrar "Esperando evaluaciÃ³n de [TÃ©cnico]". |
| `MisCasos.tsx` | Agregar tab "Evaluaciones delegadas" (mostrar badge con conteo de pendientes). Link a `Pages/Denuncias/Evaluaciones.tsx`. |
| `DetalleDenuncia.tsx` | Agregar `TabEvaluacionPrevia` (4to tab despuÃ©s de Informe/Cierre). |

---

## 4. Sub-estado `evaluacion_tecnica`

### 4.1 Reglas de transiciÃ³n

| Estado origen | AcciÃ³n | Estado destino | QuiÃ©n |
|---------------|--------|----------------|-------|
| `ingresada` | Jefe delega evaluaciÃ³n | `evaluacion_tecnica` | Jefe |
| `evaluacion_tecnica` | TÃ©cnico devuelve | `ingresada` (con flag interno) | TÃ©cnico |
| `ingresada` | Jefe admite (con SITPRECO) | `admitida` | Jefe |
| `ingresada` | Jefe rechaza (SITPRECO opcional) | `rechazada` | Jefe |
| `evaluacion_tecnica` | (no hay admisiÃ³n directa, siempre vuelve a ingresada) | â€” | â€” |

### 4.2 Plazos
- Los 5 dÃ­as de admisiÃ³n (Art. 23) **se cuentan desde la recepciÃ³n**
- **No se pausan** durante la evaluaciÃ³n del tÃ©cnico
- TÃ©cnico y Jefe **comparten el mismo plazo** de 5 dÃ­as
- Si el tÃ©cnico tarda, queda menos tiempo para que el Jefe decida

---

## 5. Decisiones del Sprint

| # | DecisiÃ³n | Estado | Motivo |
|---|----------|--------|--------|
| 1 | Sub-estado `evaluacion_tecnica` (no estado separado) | âœ… Vigente | Es una fase corta, no merece un estado con flujo propio |
| 2 | Cualquier tÃ©cnico disponible puede ser delegado | âœ… Vigente | El cliente no impuso restricciones |
| 3 | El Jefe puede evaluar sin delegar | âœ… Vigente | El Jefe tiene la opciÃ³n; a veces no necesita delegado |
| 4 | Plazos no se pausan | âœ… Vigente | Ley 974 dice "5 dÃ­as desde la recepciÃ³n" sin excepciones |
| 5 | ~~SITPRECO obligatorio al admitir, opcional al rechazar~~ | âŒ **Revocado Julio 2026** | ~~Refleja el proceso real: rechazar no genera cÃ³digo SITPRECO en todos los casos~~ â†’ Ver Sprint 7.A |
| 6 | ~~Input SITPRECO sin hint de formato~~ | âŒ **Revocado Julio 2026** | Ver Sprint 7.A |
| 7 | ~~SITPRECO se almacena al admitir, no al cierre~~ | âŒ **Revocado Julio 2026** | Ver Sprint 7.A |
| 8 | TÃ©cnico que evalÃºa puede ser reasignado o no al caso final | âœ… Vigente | El Jefe decide por carga o expertise |
| 9 | TÃ©cnico ve el caso en su `MisCasos` con tab "Evaluaciones delegadas" | âœ… Vigente | Mantener un solo lugar de trabajo por usuario |
| 10 | EvaluaciÃ³n tiene recomendaciÃ³n (Admitir/Rechazar) | âœ… Vigente (sin "MÃ¡s info") | Facilita la decisiÃ³n del Jefe, pero no la ata |
| 11 | Bandeja del Jefe muestra "Esperando evaluaciÃ³n de [TÃ©cnico]" en cards delegadas | âœ… Vigente | Transparencia del estado para el Jefe |
| 12 | ~~El `FormCierre` muestra SITPRECO read-only heredado~~ | âŒ **Revocado Julio 2026** | Ver Sprint 7.A |

### ðŸ†• Nuevo lineamiento SITPRECO (Julio 2026)

**DecisiÃ³n revisada con el cliente:** el SITPRECO es un cÃ³digo del sistema externo SITPRECO que puede tardar. Pedirlo al admitir genera burocracia innecesaria.

**Comportamiento definitivo (aplicado en Sprint 7.A):**
- **AdmisiÃ³n:** NO se pide SITPRECO. `ModalAdmision` queda como estÃ¡.
- **Rechazo:** SITPRECO opcional. `ModalRechazo` agrega un input opcional (sin required, sin hint, max 50).
- **Cierre:** NO hereda SITPRECO de admisiÃ³n (porque no se pidiÃ³). `FormCierre` queda como estÃ¡ (usa su propio `cierre_sitpreco` si existe, en el `informe_final`).
- **Informe final:** SITPRECO se mantiene (ya estaba en `FormInformeFinal` desde Sprint 5). Es la Ãºnica instancia formal del cÃ³digo.

**Ver detalle de los cambios finos:** `Sprint 7.A - Cierre SITPRECO Sprint 7.md`.

---

## 6. Mock data: denuncia ejemplo

```php
// app/Data/DenunciaData.php â†’ seed()
[
    'id' => 13,
    'ticket' => 'DEN-2026-0013',
    'tipo' => 'corrupcion',
    'estado' => 'evaluacion_tecnica',
    'fecha_ingreso' => '2026-06-29',
    'denunciante' => [...],
    'denunciados' => [...],
    'hechos' => '...',
    'tecnico' => null,  // aÃºn no asignado
    'evaluacion_tecnica_tecnico_id' => 2,  // Juan PÃ©rez delegado
    'evaluacion_tecnica_tecnico_nombre' => 'Juan PÃ©rez',
    'evaluacion_tecnica_delegada_at' => '2026-06-29 10:00:00',
    'evaluacion_tecnica_justificacion_delegacion' => 'Por carga del Jefe esta semana',
    // El tÃ©cnico aÃºn no devolviÃ³, asÃ­ que:
    'evaluacion_tecnica_texto' => null,
    'evaluacion_tecnica_devuelta_at' => null,
]
```

### Variantes en seed (1-2 denuncias):
- 1 en `evaluacion_tecnica` (pendiente de devoluciÃ³n)
- 1 en `ingresada` con evaluaciÃ³n devuelta disponible (para que el Jefe vea la recomendaciÃ³n antes de decidir)
- 1 en `admitida` que pasÃ³ por evaluaciÃ³n tÃ©cnica previa (para historial)

---

## 7. UI/UX

### 7.1 Vista del Jefe (Bandeja)

**Tab "Por admitir":**
- Si la denuncia estÃ¡ en `ingresada` y NO fue delegada:
  - Botones: "Admitir" / "Rechazar" / "Delegar evaluaciÃ³n" (nuevo)
- Si la denuncia estÃ¡ en `evaluacion_tecnica`:
  - Estado: "Esperando evaluaciÃ³n de [TÃ©cnico] (delegado el [fecha])"
  - BotÃ³n disabled: "AcciÃ³n no disponible hasta que el tÃ©cnico devuelva"

**ModalDelegarEvaluacion:**
- TÃ­tulo: "Delegar evaluaciÃ³n a un tÃ©cnico"
- Lista de tÃ©cnicos disponibles (cards con carga)
- Textarea opcional: "JustificaciÃ³n de la delegaciÃ³n" (ej. "Por carga esta semana")
- BotÃ³n "Delegar"

### 7.2 Vista del TÃ©cnico (MisCasos / Evaluaciones)

**Tab "Evaluaciones delegadas" (en MisCasos):**
- Lista de denuncias con evaluaciÃ³n pendiente
- Card muestra: ticket, tipo, fecha delegaciÃ³n, quiÃ©n delegÃ³
- BotÃ³n "Evaluar y devolver" â†’ abre `ModalDevolverEvaluacion`

**ModalDevolverEvaluacion:**
- TÃ­tulo: "Devolver evaluaciÃ³n de la denuncia"
- Info arriba: ticket, hechos (preview), denunciante (no editable)
- Textarea grande: "EvaluaciÃ³n tÃ©cnica resumida" (min 50 chars, max 2000)
- Selector: "RecomendaciÃ³n" (Admitir / Rechazar / Requiere mÃ¡s info)
- BotÃ³n "Devolver al Jefe"

### 7.3 Vista del detalle (DenunciaSheet)

**Nuevo tab "EvaluaciÃ³n previa" (4to tab):**
- Si NO hubo evaluaciÃ³n previa: empty state "Esta denuncia no pasÃ³ por evaluaciÃ³n tÃ©cnica"
- Si hubo: lista cronolÃ³gica de:
  - "Delegada a [TÃ©cnico] el [fecha] por [Jefe]. JustificaciÃ³n: [texto]"
  - "Devuelta por [TÃ©cnico] el [fecha]. RecomendaciÃ³n: [Admitir/Rechazar/MÃ¡s info]. Texto: [evaluaciÃ³n]"

---

## 8. Pruebas manuales sugeridas (actualizadas Julio 2026)

| Caso | Pasos | Resultado esperado |
|------|-------|---------------------|
| 1. Delegar evaluaciÃ³n | Bandeja â†’ Por admitir â†’ Card â†’ "Delegar evaluaciÃ³n" â†’ Seleccionar tÃ©cnico â†’ JustificaciÃ³n â†’ "Delegar" | Card cambia a "Esperando evaluaciÃ³n de [TÃ©cnico]" |
| 2. TÃ©cnico ve delegaciÃ³n | Login como tÃ©cnico delegado â†’ MisCasos â†’ Tab "Evaluaciones delegadas" | Ve la denuncia con botÃ³n "Evaluar y devolver" |
| 3. Devolver evaluaciÃ³n | Click "Evaluar y devolver" â†’ Llenar textarea + recomendaciÃ³n â†’ "Devolver" | Desaparece del tab "Evaluaciones delegadas", aparece en "Evaluaciones devueltas" (historial) |
| 4. Jefe ve recomendaciÃ³n | Bandeja â†’ Por admitir â†’ Card ahora muestra banner "EvaluaciÃ³n devuelta por [TÃ©cnico]. RecomendaciÃ³n: Admitir" | Jefe puede decidir con mÃ¡s informaciÃ³n |
| 5. Admitir (sin SITPRECO) | Click "Admitir" â†’ NO aparece input SITPRECO â†’ JustificaciÃ³n opcional â†’ "Admitir" | Denuncia pasa a `admitida` |
| 6. ~~Rechazar con SITPRECO opcional~~ | _(cubierto por Sprint 7.A)_ | _(cubierto por Sprint 7.A)_ |
| 7. ~~Ver SITPRECO en cierre~~ | _(revocado â€” FormCierre ya no muestra SITPRECO heredado)_ | _(N/A)_ |

---

## 9. TODO / Pendientes

> â¸ï¸ **Pendiente con cliente:** Formato SITPRECO definitivo. Por ahora se mantiene como texto libre sin hint (solo en rechazo opcional y en informe final).

> â¸ï¸ **Pendiente con cliente:** Pregunta #5 â€” Â¿Archivar casos debe ser subestado de `cerrada` o estado separado? (no afecta este sprint, pero estÃ¡ en cola).

> âœ… **Resuelto Julio 2026:** Bloque SITPRECO del Sprint 7 diferenciado. Ver `Sprint 7.A - Cierre SITPRECO Sprint 7.md`.

---

## 10. Notas tÃ©cnicas

- **Mock data:** Se agrega 1-2 denuncias en seed en estado `evaluacion_tecnica` para testing
- **shadcn:** No se requieren componentes nuevos (se reusan `dialog`, `select`, `textarea`, `button`, `card`, `badge`)
- **ValidaciÃ³n SITPRECO (post-Sprint 7.A):** rechazo acepta `nullable|string|max:50`, sin required. AdmisiÃ³n y cierre no piden SITPRECO.
- **Re-render:** `useRef` en modales, optimistic updates con Inertia
- **Performance:** Solo cargar tÃ©cnicos disponibles al abrir el modal (lazy fetch)
- **Compatibilidad:** Mantener todos los estados existentes (`ingresada`, `admitida`, `rechazada`, etc.)
- **Sprint 6 â€” Bug fix similar:** El input SITPRECO debe ser texto plano sin auto-formato, siguiendo la lecciÃ³n aprendida en Sprint 6 con el ticket del denunciante

---

## 11. Cambios en otros archivos .md

- `AI-CONTEXT.md`: âœ… actualizado
- `Plan de Desarrollo.md`: âœ… actualizado con sprint 7 cerrado
- `Sprints Pendientes - Contexto.md`: âœ… actualizado (Sprint 7 cerrado, agregado 7.A, 7.5, 7.6, 7.7, 22, 23, 24)
- `Esquema de Base de Datos.md`: âœ… actualizado (SITPRECO en `denuncias.sitpreco_rechazo`)
- `Preguntas para el cliente.md`: â¸ï¸ pendiente actualizaciÃ³n
- `Proyecto - Resumen General del Sistema.md`: â¸ï¸ pendiente actualizaciÃ³n

---

## 12. Cierre (Julio 2026)

**Estado final:** Sprint 7 **cerrado a nivel de nÃºcleo funcional**. ImplementaciÃ³n realizada:
- âœ… `EvaluacionData.php` y `EvaluacionController.php` con mÃ©todo `devolver`
- âœ… `DenunciaData` con sub-estado `evaluacion_tecnica`, 7 campos `evaluacion_tecnica_*` y mÃ©todos `delegarEvaluacion/devolverEvaluacion/reasumirEvaluacion`
- âœ… `DenunciaController` con mÃ©todos `delegarEvaluacion` y `reasumirEvaluacion`
- âœ… `ModalDelegarEvaluacion` y `ModalDevolverEvaluacion`
- âœ… `TabEvaluacionPrevia` en `DenunciaSheet`
- âœ… `Pages/Denuncias/Evaluaciones.tsx` con tabs "Pendientes" y "Devueltas"
- âœ… `Bandeja.tsx` con botÃ³n "Delegar evaluaciÃ³n", botÃ³n "Reasumir", banner "En evaluaciÃ³n por [TÃ©cnico]"
- âœ… `MisCasos.tsx` con tab "Evaluaciones delegadas" + badge
- âœ… Seed con `DEN-2026-0013` (pendiente de devoluciÃ³n) y `DEN-2026-0014` (devuelta con recomendaciÃ³n)

**Pendiente para Sprint 7.A:** Ajuste del bloque SITPRECO al nuevo lineamiento. Ver `Sprint 7.A - Cierre SITPRECO Sprint 7.md`.

---
*Documento creado: Junio 2026. Cerrado: Julio 2026. Bloque SITPRECO refinado en Sprint 7.A.*

