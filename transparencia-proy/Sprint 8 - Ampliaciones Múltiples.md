#transparencia
# Sprint 8 — Ampliaciones Múltiples ✅ PLANIFICADO (Junio 2026)

**Objetivo:** Permitir al Jefe de Unidad aprobar **múltiples ampliaciones parciales** del plazo total de una denuncia, como eventos independientes, con validación del límite legal y warning visual.

**Origen:** Respuesta del cliente #11 (C6 resuelta) — Sesión de validación, Junio 2026.

---

## 1. Contexto

### 1.1 Problema
Actualmente el sistema **no tiene** ninguna funcionalidad para ampliar el plazo total de la denuncia. Solo existen ampliaciones a nivel de **solicitud** (`ModalAmpliarSolicitud.tsx`) y **descargo** (`ModalAmpliarDescargo.tsx`) implementadas en Sprint 4. El Art. 30 de la Ley 974 permite prorrogar el plazo máximo excepcionalmente de manera justificada por un periodo igual (45+45 corrupción, 20+10 negación de información).

### 1.2 Solución
Agregar campo `ampliaciones[]` en `DenunciaData`, método `aprobarAmpliacion()`, y nuevo modal `ModalAmpliacionPlazo.tsx` para que el Jefe de Unidad gestione las ampliaciones del plazo total.

### 1.3 Diagrama de flujo

```
[Caso activo (admitida/asignada/investigacion/informe)]
             │
             ▼
[Jefe abre DenunciaSheet → botón "Ampliar plazo"]
             │
             ▼
[ModalAmpliacionPlazo muestra estado actual + límite legal]
             │
             ▼
[Jefe ingresa días + justificación + (opcional) solicitante]
             │
             ▼
[Validación: sumaAmpliaciones + nuevosDias ≤ maxAmpliacion?]
        ┌────┴────┐
        │         │
        │ SÍ      │ NO
        │         │
        ▼         ▼
[Se agrega   [Warning visual:
  evento       "Excede máximo legal"]
  a array]
```

---

## 2. Decisiones del Sprint

| # | Decisión | Alternativa descartada | Motivo |
|---|----------|------------------------|--------|
| 1 | Cada ampliación es un evento independiente con `{fecha, dias, justificacion, aprobado_por, solicitado_por?}` | Campo único `dias_prorroga_total` | Permite trazabilidad de cada aprobación |
| 2 | Días corridos (calendario) para el cálculo | Días hábiles | Días hábiles se implementará en Sprint 18 cuando esté el panel feriados |
| 3 | Mostrar límite legal con warning visual (rojo/amarillo) | Sin advertencia | Evita que el Jefe supere el máximo legal sin querer |
| 4 | Jefe puede ampliar sin solicitud previa (decisión directa) | Solo aprobando solicitudes de técnicos | Casos verbales o urgentes, evita burocracia |
| 5 | El plazo **no se congela** durante la aprobación | Se pausa mientras se decide | Refleja la realidad legal: el plazo sigue corriendo |
| 6 | Ampliaciones se borran al reabrir denuncia | Se conservan | Al reabrir es un "nuevo" plazo; las ampliaciones previas pierden sentido |
| 7 | Permitido en cualquier estado activo post-admisión | Solo en investigación | El Jefe necesita la flexibilidad de ampliar incluso al inicio o al final |
| 8 | Modal nuevo desde cero (`ModalAmpliacionPlazo.tsx`) | No existía alternativas | No hay componente similar a nivel de denuncia |
| 9 | El plazo base para validación es el plazo legal original (45/20) | Plazo efectivo actual | Evita que ampliaciones se acumulen más allá del máximo legal |
| 10 | Solicitante opcional con checkbox "Hubo solicitud previa del técnico" | Campo obligatorio | Diferencia ampliaciones solicitadas vs directas del Jefe |

---

## 3. Backend (PHP)

### 3.1 Archivos modificados

#### `app/Data/DenunciaData.php`

**Nuevo campo en `makeDenuncia()`:**
```php
'ampliaciones' => [],
```

**Nuevo método `aprobarAmpliacion()`:**
```php
public static function aprobarAmpliacion(
    int $id,
    int $dias,
    string $justificacion,
    ?string $solicitadoPor = null
): array|false
{
    $items = session('denuncias', []);
    foreach ($items as &$d) {
        if ($d['id'] !== $id) continue;

        $tipo = $d['tipo'] ?? '';
        $plazoBase = self::getPlazoDias($tipo);  // 45 o 20
        $maxAmpliacion = $plazoBase;  // 45 para corrupción, 10 (?) — but wait, per law: Art. 30 says "un periodo igual", so max = base
    
        // Calculate current sum
        $sumaActual = array_sum(array_column($d['ampliaciones'] ?? [], 'dias'));
        
        // Validate max legal limit
        if (($sumaActual + $dias) > $maxAmpliacion) {
            return ['error' => "Excede el máximo legal de {$maxAmpliacion} días adicionales para {$tipo}"];
        }

        // Add new amplification event
        $d['ampliaciones'][] = [
            'id' => count($d['ampliaciones'] ?? []) + 1,
            'fecha' => now()->toDateTimeString(),
            'dias' => $dias,
            'justificacion' => $justificacion,
            'aprobado_por' => 'Jefe de Unidad',  // mock
            'solicitado_por' => $solicitadoPor,
            'archivo_respaldo' => null,
        ];

        session(['denuncias' => $items]);
        return $d;
    }
    return false;
}
```

**Modificar `getPlazoInfo()` para incluir ampliaciones:**
```php
// Reemplazar línea existente:
$plazoTotal = self::getPlazoDias($denuncia['tipo']);

// Por:
$plazoBase = self::getPlazoDias($denuncia['tipo']);
$sumaAmpliaciones = array_sum(array_column($denuncia['ampliaciones'] ?? [], 'dias'));
$plazoTotal = $plazoBase + $sumaAmpliaciones;
```

**Nuevo método auxiliar `getMaxAmpliacion()`:**
```php
public static function getMaxAmpliacion(string $tipo): int
{
    return match ($tipo) {
        'corrupcion' => 45,
        'negacion'   => 10,
        default      => 0,
    };
}
```

#### `app/Http/Controllers/DenunciaController.php`

**Nuevo método `aprobarAmpliacion()`:**
```php
public function aprobarAmpliacion(Request $request, int $id): RedirectResponse
{
    $validated = $request->validate([
        'dias' => 'required|integer|min:1|max:45',
        'justificacion' => 'required|string|min:10|max:500',
        'solicitado_por' => 'nullable|string|max:100',
    ]);

    $result = DenunciaData::aprobarAmpliacion(
        id: $id,
        dias: $validated['dias'],
        justificacion: $validated['justificacion'],
        solicitadoPor: $validated['solicitado_por'] ?? null
    );

    if ($result === false) {
        return redirect()->back()->with('error', 'Denuncia no encontrada');
    }

    if (isset($result['error'])) {
        return redirect()->back()->with('error', $result['error']);
    }

    return redirect()->back()->with('success', "Plazo ampliado {$validated['dias']} días correctamente.");
}
```

**Validación:**
- `dias`: required, integer, min 1, max 45
- `justificacion`: required, string, min 10, max 500
- `solicitado_por`: nullable, string, max 100

#### `routes/web.php`

```php
Route::post('/denuncias/{id}/ampliar-plazo', [DenunciaController::class, 'aprobarAmpliacion'])
    ->middleware(['auth']);
```

### 3.2 Lógica de cálculo

```
plazoBase          = getPlazoDias(tipo)            // 45 o 20
maxAmpliacion      = getMaxAmpliacion(tipo)         // 45 o 10
sumaActual         = sum(ampliaciones[].dias)       // ampliaciones previas
plazoEfectivo      = plazoBase + sumaActual         // plazo total vigente
```

**Validación de límite:**
```php
if (($sumaActual + $nuevosDias) > $maxAmpliacion) {
    // Rechazar: excede máximo legal
}
```

**Cálculo de fecha de vencimiento (en `getPlazoInfo()`):**
```php
$plazoBase = self::getPlazoDias($denuncia['tipo']);
$sumaAmpliaciones = array_sum(array_column($denuncia['ampliaciones'] ?? [], 'dias'));
$plazoTotal = $plazoBase + $sumaAmpliaciones;

// Si la denuncia fue reabierta y tiene nuevo plazo manual:
if (!empty($denuncia['plazo_reapertura'])) {
    $fechaLimite = Carbon::parse($denuncia['plazo_reapertura']);
    $diasRestantes = (int) now()->diffInDays($fechaLimite, false);
} else {
    $created = Carbon::parse($denuncia['created_at']);
    $diasTranscurridos = (int) $created->diffInDays(now(), false);
    $diasRestantes = $plazoTotal - $diasTranscurridos;
}

$fechaVencimiento = !empty($denuncia['plazo_reapertura'])
    ? Carbon::parse($denuncia['plazo_reapertura'])->format('Y-m-d')
    : Carbon::parse($denuncia['created_at'])->addDays($plazoTotal)->format('Y-m-d');
```

---

## 4. Frontend (React + TypeScript)

### 4.1 Componentes nuevos (1)

#### `ModalAmpliacionPlazo.tsx`

```tsx
interface Ampliacion {
  id: number;
  fecha: string;
  dias: number;
  justificacion: string;
  aprobado_por: string;
  solicitado_por: string | null;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  denuncia: {
    ticket: string;
    tipo: string;
    created_at: string;
    ampliaciones?: Ampliacion[];
    plazo: any;
  };
}
```

**Layout del modal:**

```
┌──────────────────────────────────────────────────────────────┐
│ Ampliar Plazo Total de la Denuncia                      [X] │
├──────────────────────────────────────────────────────────────┤
│ Denuncia: DEN-2026-0004                                     │
│ Tipo: Corrupción                                             │
│                                                              │
│ ┌─ Estado actual ───────────────────────────────────────┐   │
│ │ Plazo base: 45 días                                   │   │
│ │ Ampliaciones previas: 2 (total: 30 días)             │   │
│ │ Plazo efectivo: 75 días                               │   │
│ │ Días restantes: 12 días                              │   │
│ │                                                       │   │
│ │ ⚠️ Máximo legal: 45 días adicionales (total: 90 días) │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                              │
│ Días a ampliar: [  15  ]                                    │
│ Restante hasta límite: 30 días más (total: 90 días)        │
│                                                              │
│ Justificación: [                                            ]│
│ [                                                      ]    │
│ [min 10 caracteres]                                    ]    │
│                                                              │
│ ☐ Hubo solicitud previa del técnico  (opcional)             │
│   Solicitado por: [ Técnico X  ▼]                          │
│                                                              │
│ [Cancelar]                              [Aprobar ampliación]│
└──────────────────────────────────────────────────────────────┘
```

**Feature:**
- Input de número: `dias` (min 1, max 45, validación en tiempo real)
- Textarea: `justificacion` (min 10 chars, max 500)
- Checkbox opcional: "Hubo solicitud previa del técnico" → si se marca, muestra `<Select>` con técnicos disponibles
- Mostrar "Restante hasta límite" dinámico (`maxAmpliacion - sumaActual`)
- Si el restante es 0: botón "Aprobar ampliación" deshabilitado con tooltip "Límite legal alcanzado"
- Si el restante < nuevosDias propuestos: warning rojo "Excede el máximo legal"
- Si el restante es bajo (≤ 5 días): warning amarillo "Acercándose al límite legal"
- Submit: `router.post(route('denuncias.ampliar-plazo', { id: denuncia.id }), data)`

### 4.2 Componentes modificados (3)

#### `PlazoBadge.tsx`
- No requiere cambios visuales (ya muestra verde/amarillo/rojo)
- La lógica del cálculo se actualiza en `DenunciaData::getPlazoInfo()`
- **Opcional:** mostrar texto adicional como "75/90 días" si hay ampliaciones

#### `DenunciaSheet.tsx`
- En estados activos (`admitida`, `asignada`, `investigacion`, `informe`, `evaluacion_tecnica`):
  - Agregar botón "Ampliar plazo" en el panel de información
  - Si hay ampliaciones previas: mostrar badge "Ampliada X veces" + botón "Ver ampliaciones" (opcional)

#### `Bandeja.tsx` / `DenunciaCard.tsx`
- Si la denuncia tiene ampliaciones: mostrar badge "Ampliada +Xd" en la card
- Esto ayuda al Jefe a identificar rápidamente qué casos ya fueron ampliados

---

## 5. Mock data

### Seed de ejemplo (una denuncia con ampliaciones previas)

```php
// En DenunciaData.php → seed(), agregar o modificar DEN-2026-0011 existente:
[
    'id' => 11,
    'ticket' => 'DEN-2026-0011',
    'tipo' => 'corrupcion',
    'estado' => 'investigacion',
    'created_at' => '2026-05-15 10:00:00',
    'denunciante' => [...],
    'denunciados' => [...],
    'ampliaciones' => [
        [
            'id' => 1,
            'fecha' => '2026-06-01 14:30:00',
            'dias' => 15,
            'justificacion' => 'Unidad externa de Auditoría Interna solicitó tiempo adicional para recopilar documentación.',
            'aprobado_por' => 'Jefe de Unidad',
            'solicitado_por' => 'Técnico Carlos Mendoza',
        ],
        [
            'id' => 2,
            'fecha' => '2026-06-15 09:00:00',
            'dias' => 15,
            'justificacion' => 'Denunciado presentó solicitud de ampliación de plazo para descargo con justificación válida.',
            'aprobado_por' => 'Jefe de Unidad',
            'solicitado_por' => 'Técnico Carlos Mendoza',
        ],
    ],
    // created_at = 2026-05-15, plazoBase = 45, plazoEfectivo = 45+15+15 = 75
    // Plazo vencimiento: 2026-05-15 + 75d = 2026-07-29
    // Para testing: cambiar created_at para que queden pocos días restantes
]
```

### Variantes en seed:
- DEN-2026-0004 (admitida, sin ampliaciones): para Jefe amplíe desde cero
- DEN-2026-0011 (investigacion, con 2 ampliaciones): para visualizar estado con ampliaciones
- DEN-2026-0008 (investigacion, sin ampliaciones pero próxima a vencer): para ver warning

---

## 6. UI/UX

### 6.1 Vista del Jefe (DenunciaSheet)

**Sección de plazo en el detalle:**
```
┌───────────────────────────────────────────┐
│ Plazo total: 45 días                      │
│ Ampliaciones: +15 días (1: 2026-06-01)   │
│              +15 días (2: 2026-06-15)    │
│ Plazo efectivo: 75 días                   │
│ Días transcurridos: 45                    │
│ Días restantes: 30 días 🟢               │
│                                           │
│ [ Ampliar plazo ]  (solo Jefe)           │
└───────────────────────────────────────────┘
```

### 6.2 Vista en DenunciaCard (Bandeja)

```
┌─────────────────────────────────────┐
│ DEN-2026-0011 · Corrupción         │
│ Investigación · Carlos Mendoza     │
│ Denunciante: Persona X             │
│ Plazo: 🟡 12 días restantes (75/90)│
│ Badge: Ampliada (+30d)             │
└─────────────────────────────────────┘
```

### 6.3 Notificaciones de ampliación (Sprint 9)

Cuando se implemente Sprint 9, la ampliación del plazo debería generar una notificación:
- Si es directa del Jefe: notificar al técnico del caso "Se amplió el plazo de DEN-2026-0011 en 15 días"
- Si fue solicitada por el técnico: notificar al técnico "Tu solicitud de ampliación de plazo fue aprobada"

---

## 7. Pruebas manuales sugeridas

| Caso | Pasos | Resultado esperado |
|------|-------|---------------------|
| 1. Ampliar denuncia sin ampliaciones previas | Login como Jefe → Bandeja → Card en admitida → Sheet → "Ampliar plazo" → 15 días + justificación → aprobar | 1 evento en `ampliaciones[]`. PlazoBadge muestra nuevo total. |
| 2. Ampliar denuncia con ampliaciones previas | Mismo caso, denuncia con 2 ampliaciones → agregar 3ra | 3 eventos totales. Suma ampliaciones = 30+15. PlazoBadge muestra 75+15=90. |
| 3. Exceder límite legal | Ampliar 46 días en corrupción (max=45) → falla validación | Modal muestra warning rojo "Excede el máximo legal de 45 días adicionales". No se guarda. |
| 4. Ampliación sin solicitud previa | Jefe amplía sin marcar checkbox | `solicitado_por = null`. Se guarda correctamente. |
| 5. Ampliación con solicitud previa | Jefe marca checkbox + selecciona técnico | `solicitado_por = "Técnico X"`. Se guarda. |
| 6. Reapertura: ampliaciones se borran | Reabrir una denuncia que tenía ampliaciones → ver detalle | `ampliaciones[]` queda vacío. Plazo vuelve a base. |
| 7. Card muestra badge ampliaciones | Bandeja → denuncia con ampliaciones | Card muestra "Ampliada +30d" en badge. |

---

## 8. Notas técnicas

- **shadcn:** No se requieren componentes nuevos. Se reusan `dialog`, `input`, `textarea`, `button`, `select`, `checkbox`, `badge`.
- **Validación frontend:** `dias` min 1, max 45. `justificacion` min 10, max 500. Ambos con feedback visual.
- **Validación backend:** Misma + verificar límite legal en `DenunciaData::aprobarAmpliacion()`.
- **Estado activo del botón:** Solo en estados post-admisión. No mostrar en `ingresada`, `rechazada`, `cerrada`.
- **Compatibilidad con Sprint 7:** Si la denuncia está en `evaluacion_tecnica`, técnicamente no hay "plazo activo" porque aún no se admitió. **Decisión:** permitir ampliación aún en `evaluacion_tecnica` ya que el plazo corre desde la recepción.
- **Compatibilidad con Sprint 9:** Las ampliaciones generarán eventos de notificación cuando se implemente el sistema de notificaciones.
- **Compatibilidad con Sprint 18:** El cálculo de plazo se actualizará a días hábiles cuando se implemente el panel feriados.

---

## 9. TODO / Pendientes

> ⏸️ **Pendiente con Sprint 18:** Migrar cálculo de días corridos → días hábiles cuando se implemente el panel de feriados.

> ⏸️ **Pendiente con Sprint 9:** Integrar notificaciones de ampliación aprobada/solicitada.

> ⏸️ **Pendiente con cliente:** Pregunta #6 (C1) — confirmar si días son hábiles o calendario.

---

## 10. Referencias

- **Archivo padre:** `Sprint 2 - Bandeja de Admisión y Mis Casos.md` (sección 10.4 — diseño original de ampliaciones)
- **Decisión cliente:** `Plan de Desarrollo.md` Sprint 8, y `Preguntas para el cliente.md` #11
- **Patrón de código:** `SolicitudData.php` / `DescargoData.php` para el array `ampliaciones[]` (Sprint 4)
- **Documento de contexto:** `Sprints Pendientes - Contexto.md` sección Sprint 8

---
*Documento creado: Junio 2026. Pendiente de implementación.*
