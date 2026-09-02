> ⚠️ **Histórico — Sprint cerrado Jul 2026 (Laravel 11).** Snapshot al cierre, no refleja refactorización Bloques 0-2 (Sep 2026, Laravel 13). Para estado actual ver AI-CONTEXT.md y Notas Reestructuración - Bloques 0-2 (Sept 2026) - Cierre.md.
#transparencia
# Sprint 8 â€” Ampliaciones MÃºltiples âœ… PLANIFICADO (Junio 2026)

**Objetivo:** Permitir al Jefe de Unidad aprobar **mÃºltiples ampliaciones parciales** del plazo total de una denuncia, como eventos independientes, con validaciÃ³n del lÃ­mite legal y warning visual.

**Origen:** Respuesta del cliente #11 (C6 resuelta) â€” SesiÃ³n de validaciÃ³n, Junio 2026.

---

## 1. Contexto

### 1.1 Problema
Actualmente el sistema **no tiene** ninguna funcionalidad para ampliar el plazo total de la denuncia. Solo existen ampliaciones a nivel de **solicitud** (`ModalAmpliarSolicitud.tsx`) y **descargo** (`ModalAmpliarDescargo.tsx`) implementadas en Sprint 4. El Art. 30 de la Ley 974 permite prorrogar el plazo mÃ¡ximo excepcionalmente de manera justificada por un periodo igual (45+45 corrupciÃ³n, 20+10 negaciÃ³n de informaciÃ³n).

### 1.2 SoluciÃ³n
Agregar campo `ampliaciones[]` en `DenunciaData`, mÃ©todo `aprobarAmpliacion()`, y nuevo modal `ModalAmpliacionPlazo.tsx` para que el Jefe de Unidad gestione las ampliaciones del plazo total.

### 1.3 Diagrama de flujo

```
[Caso activo (admitida/asignada/investigacion/informe)]
             â”‚
             â–¼
[Jefe abre DenunciaSheet â†’ botÃ³n "Ampliar plazo"]
             â”‚
             â–¼
[ModalAmpliacionPlazo muestra estado actual + lÃ­mite legal]
             â”‚
             â–¼
[Jefe ingresa dÃ­as + justificaciÃ³n + (opcional) solicitante]
             â”‚
             â–¼
[ValidaciÃ³n: sumaAmpliaciones + nuevosDias â‰¤ maxAmpliacion?]
        â”Œâ”€â”€â”€â”€â”´â”€â”€â”€â”€â”
        â”‚         â”‚
        â”‚ SÃ      â”‚ NO
        â”‚         â”‚
        â–¼         â–¼
[Se agrega   [Warning visual:
  evento       "Excede mÃ¡ximo legal"]
  a array]
```

---

## 2. Decisiones del Sprint

| # | DecisiÃ³n | Alternativa descartada | Motivo |
|---|----------|------------------------|--------|
| 1 | Cada ampliaciÃ³n es un evento independiente con `{fecha, dias, justificacion, aprobado_por, solicitado_por?}` | Campo Ãºnico `dias_prorroga_total` | Permite trazabilidad de cada aprobaciÃ³n |
| 2 | DÃ­as corridos (calendario) para el cÃ¡lculo | DÃ­as hÃ¡biles | DÃ­as hÃ¡biles se implementarÃ¡ en Sprint 18 cuando estÃ© el panel feriados |
| 3 | Mostrar lÃ­mite legal con warning visual (rojo/amarillo) | Sin advertencia | Evita que el Jefe supere el mÃ¡ximo legal sin querer |
| 4 | Jefe puede ampliar sin solicitud previa (decisiÃ³n directa) | Solo aprobando solicitudes de tÃ©cnicos | Casos verbales o urgentes, evita burocracia |
| 5 | El plazo **no se congela** durante la aprobaciÃ³n | Se pausa mientras se decide | Refleja la realidad legal: el plazo sigue corriendo |
| 6 | Ampliaciones se borran al reabrir denuncia | Se conservan | Al reabrir es un "nuevo" plazo; las ampliaciones previas pierden sentido |
| 7 | Permitido en cualquier estado activo post-admisiÃ³n | Solo en investigaciÃ³n | El Jefe necesita la flexibilidad de ampliar incluso al inicio o al final |
| 8 | Modal nuevo desde cero (`ModalAmpliacionPlazo.tsx`) | No existÃ­a alternativas | No hay componente similar a nivel de denuncia |
| 9 | El plazo base para validaciÃ³n es el plazo legal original (45/20) | Plazo efectivo actual | Evita que ampliaciones se acumulen mÃ¡s allÃ¡ del mÃ¡ximo legal |
| 10 | Solicitante opcional con checkbox "Hubo solicitud previa del tÃ©cnico" | Campo obligatorio | Diferencia ampliaciones solicitadas vs directas del Jefe |

---

## 3. Backend (PHP)

### 3.1 Archivos modificados

#### `app/Data/DenunciaData.php`

**Nuevo campo en `makeDenuncia()`:**
```php
'ampliaciones' => [],
```

**Nuevo mÃ©todo `aprobarAmpliacion()`:**
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
        $maxAmpliacion = $plazoBase;  // 45 para corrupciÃ³n, 10 (?) â€” but wait, per law: Art. 30 says "un periodo igual", so max = base
    
        // Calculate current sum
        $sumaActual = array_sum(array_column($d['ampliaciones'] ?? [], 'dias'));
        
        // Validate max legal limit
        if (($sumaActual + $dias) > $maxAmpliacion) {
            return ['error' => "Excede el mÃ¡ximo legal de {$maxAmpliacion} dÃ­as adicionales para {$tipo}"];
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
// Reemplazar lÃ­nea existente:
$plazoTotal = self::getPlazoDias($denuncia['tipo']);

// Por:
$plazoBase = self::getPlazoDias($denuncia['tipo']);
$sumaAmpliaciones = array_sum(array_column($denuncia['ampliaciones'] ?? [], 'dias'));
$plazoTotal = $plazoBase + $sumaAmpliaciones;
```

**Nuevo mÃ©todo auxiliar `getMaxAmpliacion()`:**
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

**Nuevo mÃ©todo `aprobarAmpliacion()`:**
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

    return redirect()->back()->with('success', "Plazo ampliado {$validated['dias']} dÃ­as correctamente.");
}
```

**ValidaciÃ³n:**
- `dias`: required, integer, min 1, max 45
- `justificacion`: required, string, min 10, max 500
- `solicitado_por`: nullable, string, max 100

#### `routes/web.php`

```php
Route::post('/denuncias/{id}/ampliar-plazo', [DenunciaController::class, 'aprobarAmpliacion'])
    ->middleware(['auth']);
```

### 3.2 LÃ³gica de cÃ¡lculo

```
plazoBase          = getPlazoDias(tipo)            // 45 o 20
maxAmpliacion      = getMaxAmpliacion(tipo)         // 45 o 10
sumaActual         = sum(ampliaciones[].dias)       // ampliaciones previas
plazoEfectivo      = plazoBase + sumaActual         // plazo total vigente
```

**ValidaciÃ³n de lÃ­mite:**
```php
if (($sumaActual + $nuevosDias) > $maxAmpliacion) {
    // Rechazar: excede mÃ¡ximo legal
}
```

**CÃ¡lculo de fecha de vencimiento (en `getPlazoInfo()`):**
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
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ Ampliar Plazo Total de la Denuncia                      [X] â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ Denuncia: DEN-2026-0004                                     â”‚
â”‚ Tipo: CorrupciÃ³n                                             â”‚
â”‚                                                              â”‚
â”‚ â”Œâ”€ Estado actual â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚
â”‚ â”‚ Plazo base: 45 dÃ­as                                   â”‚   â”‚
â”‚ â”‚ Ampliaciones previas: 2 (total: 30 dÃ­as)             â”‚   â”‚
â”‚ â”‚ Plazo efectivo: 75 dÃ­as                               â”‚   â”‚
â”‚ â”‚ DÃ­as restantes: 12 dÃ­as                              â”‚   â”‚
â”‚ â”‚                                                       â”‚   â”‚
â”‚ â”‚ âš ï¸ MÃ¡ximo legal: 45 dÃ­as adicionales (total: 90 dÃ­as) â”‚   â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚
â”‚                                                              â”‚
â”‚ DÃ­as a ampliar: [  15  ]                                    â”‚
â”‚ Restante hasta lÃ­mite: 30 dÃ­as mÃ¡s (total: 90 dÃ­as)        â”‚
â”‚                                                              â”‚
â”‚ JustificaciÃ³n: [                                            ]â”‚
â”‚ [                                                      ]    â”‚
â”‚ [min 10 caracteres]                                    ]    â”‚
â”‚                                                              â”‚
â”‚ â˜ Hubo solicitud previa del tÃ©cnico  (opcional)             â”‚
â”‚   Solicitado por: [ TÃ©cnico X  â–¼]                          â”‚
â”‚                                                              â”‚
â”‚ [Cancelar]                              [Aprobar ampliaciÃ³n]â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Feature:**
- Input de nÃºmero: `dias` (min 1, max 45, validaciÃ³n en tiempo real)
- Textarea: `justificacion` (min 10 chars, max 500)
- Checkbox opcional: "Hubo solicitud previa del tÃ©cnico" â†’ si se marca, muestra `<Select>` con tÃ©cnicos disponibles
- Mostrar "Restante hasta lÃ­mite" dinÃ¡mico (`maxAmpliacion - sumaActual`)
- Si el restante es 0: botÃ³n "Aprobar ampliaciÃ³n" deshabilitado con tooltip "LÃ­mite legal alcanzado"
- Si el restante < nuevosDias propuestos: warning rojo "Excede el mÃ¡ximo legal"
- Si el restante es bajo (â‰¤ 5 dÃ­as): warning amarillo "AcercÃ¡ndose al lÃ­mite legal"
- Submit: `router.post(route('denuncias.ampliar-plazo', { id: denuncia.id }), data)`

### 4.2 Componentes modificados (3)

#### `PlazoBadge.tsx`
- No requiere cambios visuales (ya muestra verde/amarillo/rojo)
- La lÃ³gica del cÃ¡lculo se actualiza en `DenunciaData::getPlazoInfo()`
- **Opcional:** mostrar texto adicional como "75/90 dÃ­as" si hay ampliaciones

#### `DenunciaSheet.tsx`
- En estados activos (`admitida`, `asignada`, `investigacion`, `informe`, `evaluacion_tecnica`):
  - Agregar botÃ³n "Ampliar plazo" en el panel de informaciÃ³n
  - Si hay ampliaciones previas: mostrar badge "Ampliada X veces" + botÃ³n "Ver ampliaciones" (opcional)

#### `Bandeja.tsx` / `DenunciaCard.tsx`
- Si la denuncia tiene ampliaciones: mostrar badge "Ampliada +Xd" en la card
- Esto ayuda al Jefe a identificar rÃ¡pidamente quÃ© casos ya fueron ampliados

---

## 5. Mock data

### Seed de ejemplo (una denuncia con ampliaciones previas)

```php
// En DenunciaData.php â†’ seed(), agregar o modificar DEN-2026-0011 existente:
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
            'justificacion' => 'Unidad externa de AuditorÃ­a Interna solicitÃ³ tiempo adicional para recopilar documentaciÃ³n.',
            'aprobado_por' => 'Jefe de Unidad',
            'solicitado_por' => 'TÃ©cnico Carlos Mendoza',
        ],
        [
            'id' => 2,
            'fecha' => '2026-06-15 09:00:00',
            'dias' => 15,
            'justificacion' => 'Denunciado presentÃ³ solicitud de ampliaciÃ³n de plazo para descargo con justificaciÃ³n vÃ¡lida.',
            'aprobado_por' => 'Jefe de Unidad',
            'solicitado_por' => 'TÃ©cnico Carlos Mendoza',
        ],
    ],
    // created_at = 2026-05-15, plazoBase = 45, plazoEfectivo = 45+15+15 = 75
    // Plazo vencimiento: 2026-05-15 + 75d = 2026-07-29
    // Para testing: cambiar created_at para que queden pocos dÃ­as restantes
]
```

### Variantes en seed:
- DEN-2026-0004 (admitida, sin ampliaciones): para Jefe amplÃ­e desde cero
- DEN-2026-0011 (investigacion, con 2 ampliaciones): para visualizar estado con ampliaciones
- DEN-2026-0008 (investigacion, sin ampliaciones pero prÃ³xima a vencer): para ver warning

---

## 6. UI/UX

### 6.1 Vista del Jefe (DenunciaSheet)

**SecciÃ³n de plazo en el detalle:**
```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ Plazo total: 45 dÃ­as                      â”‚
â”‚ Ampliaciones: +15 dÃ­as (1: 2026-06-01)   â”‚
â”‚              +15 dÃ­as (2: 2026-06-15)    â”‚
â”‚ Plazo efectivo: 75 dÃ­as                   â”‚
â”‚ DÃ­as transcurridos: 45                    â”‚
â”‚ DÃ­as restantes: 30 dÃ­as ðŸŸ¢               â”‚
â”‚                                           â”‚
â”‚ [ Ampliar plazo ]  (solo Jefe)           â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 6.2 Vista en DenunciaCard (Bandeja)

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ DEN-2026-0011 Â· CorrupciÃ³n         â”‚
â”‚ InvestigaciÃ³n Â· Carlos Mendoza     â”‚
â”‚ Denunciante: Persona X             â”‚
â”‚ Plazo: ðŸŸ¡ 12 dÃ­as restantes (75/90)â”‚
â”‚ Badge: Ampliada (+30d)             â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 6.3 Notificaciones de ampliaciÃ³n (Sprint 9)

Cuando se implemente Sprint 9, la ampliaciÃ³n del plazo deberÃ­a generar una notificaciÃ³n:
- Si es directa del Jefe: notificar al tÃ©cnico del caso "Se ampliÃ³ el plazo de DEN-2026-0011 en 15 dÃ­as"
- Si fue solicitada por el tÃ©cnico: notificar al tÃ©cnico "Tu solicitud de ampliaciÃ³n de plazo fue aprobada"

---

## 7. Pruebas manuales sugeridas

| Caso | Pasos | Resultado esperado |
|------|-------|---------------------|
| 1. Ampliar denuncia sin ampliaciones previas | Login como Jefe â†’ Bandeja â†’ Card en admitida â†’ Sheet â†’ "Ampliar plazo" â†’ 15 dÃ­as + justificaciÃ³n â†’ aprobar | 1 evento en `ampliaciones[]`. PlazoBadge muestra nuevo total. |
| 2. Ampliar denuncia con ampliaciones previas | Mismo caso, denuncia con 2 ampliaciones â†’ agregar 3ra | 3 eventos totales. Suma ampliaciones = 30+15. PlazoBadge muestra 75+15=90. |
| 3. Exceder lÃ­mite legal | Ampliar 46 dÃ­as en corrupciÃ³n (max=45) â†’ falla validaciÃ³n | Modal muestra warning rojo "Excede el mÃ¡ximo legal de 45 dÃ­as adicionales". No se guarda. |
| 4. AmpliaciÃ³n sin solicitud previa | Jefe amplÃ­a sin marcar checkbox | `solicitado_por = null`. Se guarda correctamente. |
| 5. AmpliaciÃ³n con solicitud previa | Jefe marca checkbox + selecciona tÃ©cnico | `solicitado_por = "TÃ©cnico X"`. Se guarda. |
| 6. Reapertura: ampliaciones se borran | Reabrir una denuncia que tenÃ­a ampliaciones â†’ ver detalle | `ampliaciones[]` queda vacÃ­o. Plazo vuelve a base. |
| 7. Card muestra badge ampliaciones | Bandeja â†’ denuncia con ampliaciones | Card muestra "Ampliada +30d" en badge. |

---

## 8. Notas tÃ©cnicas

- **shadcn:** No se requieren componentes nuevos. Se reusan `dialog`, `input`, `textarea`, `button`, `select`, `checkbox`, `badge`.
- **ValidaciÃ³n frontend:** `dias` min 1, max 45. `justificacion` min 10, max 500. Ambos con feedback visual.
- **ValidaciÃ³n backend:** Misma + verificar lÃ­mite legal en `DenunciaData::aprobarAmpliacion()`.
- **Estado activo del botÃ³n:** Solo en estados post-admisiÃ³n. No mostrar en `ingresada`, `rechazada`, `cerrada`.
- **Compatibilidad con Sprint 7:** Si la denuncia estÃ¡ en `evaluacion_tecnica`, tÃ©cnicamente no hay "plazo activo" porque aÃºn no se admitiÃ³. **DecisiÃ³n:** permitir ampliaciÃ³n aÃºn en `evaluacion_tecnica` ya que el plazo corre desde la recepciÃ³n.
- **Compatibilidad con Sprint 9:** Las ampliaciones generarÃ¡n eventos de notificaciÃ³n cuando se implemente el sistema de notificaciones.
- **Compatibilidad con Sprint 18:** El cÃ¡lculo de plazo se actualizarÃ¡ a dÃ­as hÃ¡biles cuando se implemente el panel feriados.

---

## 9. TODO / Pendientes

> â¸ï¸ **Pendiente con Sprint 18:** Migrar cÃ¡lculo de dÃ­as corridos â†’ dÃ­as hÃ¡biles cuando se implemente el panel de feriados.

> â¸ï¸ **Pendiente con Sprint 9:** Integrar notificaciones de ampliaciÃ³n aprobada/solicitada.

> â¸ï¸ **Pendiente con cliente:** Pregunta #6 (C1) â€” confirmar si dÃ­as son hÃ¡biles o calendario.

---

## 10. Referencias

- **Archivo padre:** `Sprint 2 - Bandeja de AdmisiÃ³n y Mis Casos.md` (secciÃ³n 10.4 â€” diseÃ±o original de ampliaciones)
- **DecisiÃ³n cliente:** `Plan de Desarrollo.md` Sprint 8, y `Preguntas para el cliente.md` #11
- **PatrÃ³n de cÃ³digo:** `SolicitudData.php` / `DescargoData.php` para el array `ampliaciones[]` (Sprint 4)
- **Documento de contexto:** `Sprints Pendientes - Contexto.md` secciÃ³n Sprint 8

---
*Documento creado: Junio 2026. Pendiente de implementaciÃ³n.*

