#transparencia
# Sprint 9 — Notificaciones Push + Historial ✅ PLANIFICADO (Julio 2026)

**Objetivo:** Sistema de notificaciones push vía **campana superior** en el navbar de la aplicación, con historial scrolleable tipo notificaciones de Facebook. Click en notificación navega al caso relacionado. Página completa `/notificaciones` con filtros y paginación.

**Origen:** Respuesta del cliente #22 — Sesión de validación, Junio 2026.

---

## 1. Contexto

### 1.1 Problema
Actualmente el sistema no tiene ningún mecanismo para que los usuarios reciban alertas sobre eventos importantes que ocurren en las denuncias. Un técnico no sabe si le traspasaron un caso, si el Jefe le delegó una evaluación, o si un descargo está por vencer, a menos que navegue manualmente al caso. El Jefe no ve un feed de actividad reciente sin abrir cada denuncia.

### 1.2 Solución
Sistema de notificaciones con 3 capas:
1. **Badge en campana** (Header) — contador de no leídas, animación pulse CSS
2. **Panel dropdown** — última 30 notificaciones scrolleables, tipo Facebook
3. **Página completa** `/notificaciones` — historial completo con filtros + paginación (10 items/página)

### 1.3 Diagrama de flujo (generación de notificaciones)

```
[Usuario carga página Inertia]
              │
              ▼
[NotificacionData::generarParaUsuario(userId)]
              │
              ├── 1. Escanea DenunciaData → plazos por vencer (≤3d)
              │                            → traspasos recientes (<7d)
              │                            → ampliaciones recientes (<7d)
              │                            → cambios de estado recientes (<7d)
              │
              ├── 2. Escanea SolicitudData → solicitudes próximas a vencer (≤3d)
              │
              ├── 3. Escanea DescargoData  → descargos próximos a vencer (≤3d)
              │
              └── 4. Fusiona con sesión    → combina con notificaciones persistentes
                   (marcadas como leídas)    (leídas manualmente por usuario)
                                            → retorna lista final
```

---

## 2. Decisiones del Sprint

| # | Decisión | Alternativa descartada | Motivo |
|---|----------|------------------------|--------|
| 1 | **Generación derivada** al cargar página | Eventos en cada controller | Fase 0 sin BD. No toca 5+ controllers. Migrable a observers en Sprint 14. |
| 2 | **Sin WebSockets en Fase 0** | Pusher/Reverb/Socketi | No hay multiusuario real en Fase 0. Endpoint count listo para futuro polling. |
| 3 | **Audiencia = Jefe** (hasta Sprint 15) | Roles reales | Fase 0 es usuario único. Notificaciones filtradas para Jefe. |
| 4 | **Umbral ≤ 3 días** para plazos por vencer | 5/7 días | Coherente con umbral amarillo de PlazoBadge (≤5d→amarillo, ≤3d→notificación). |
| 5 | **Click marca + navega** | Auto-marcar al abrir panel | Más conservador: el usuario decide qué marcar como leído. |
| 6 | **"Denuncia respondida" = feed de actividad** | Eliminar del sprint | Útil como historial de auditoría, aunque el Jefe sea quien respondió. |
| 7 | **Notificar ampliaciones al técnico** | Solo badge en card | El técnico necesita saber que su plazo cambió. |
| 8 | **Página /notificaciones con paginación (10)** | Solo panel emergente | El cliente pidió historial completo. 10 items/página, botones Anterior/Siguiente. |
| 9 | **Pulse CSS al subir contador** | Sin animación / Sonido | Feedback visual sutil sin ser intrusivo. Puro CSS, sin costo. |
| 10 | **Solo autenticados** | Público también | La campana está en AppLayout, solo visible logueado. |

---

## 3. Backend (PHP)

### 3.1 Archivo nuevo: `app/Data/NotificacionData.php`

```php
<?php

namespace App\Data;

use Carbon\Carbon;

class NotificacionData
{
    // ============================================================
    // Sesión persistente (notificaciones marcadas como leídas, etc.)
    // ============================================================

    private const SESSION_KEY = 'notificaciones_mock';

    public static function init(): void
    {
        if (!session()->has(self::SESSION_KEY)) {
            $data = [
                'notificaciones' => [],
                'next_id' => 1,
            ];
            session([self::SESSION_KEY => $data]);
        }
    }

    // ============================================================
    // GENERACIÓN DERIVADA — Se ejecuta en cada página cargada
    // ============================================================

    /**
     * Genera la lista completa de notificaciones para el usuario.
     * Combina notificaciones persistentes (leídas manualmente) con
     * las derivadas del estado actual del sistema.
     */
    public static function generarParaUsuario(?string $userId = 'sistema'): array
    {
        self::init();
        $sessionData = session(self::SESSION_KEY);
        $persistentes = $sessionData['notificaciones'] ?? [];

        $derivadas = [];

        // --- 1. Plazos por vencer (DenunciaData) ---
        $denuncias = DenunciaData::getAll();
        $now = Carbon::now();

        foreach ($denuncias as $d) {
            $plazoInfo = DenunciaData::getPlazoInfo($d);
            $diasRestantes = $plazoInfo['dias_restantes'] ?? 999;

            // Plazo total ≤ 3 días (solo estados activos post-admisión)
            if (in_array($d['estado'], ['admitida', 'asignada', 'investigacion', 'informe', 'evaluacion_tecnica'])) {
                if ($diasRestantes <= 3 && $diasRestantes >= 0) {
                    $derivadas[] = self::makeNotificacion(
                        tipo: 'plazo_por_vencer',
                        titulo: 'Plazo total por vencer',
                        mensaje: "{$d['ticket']} · {$d['tipo']} · {$diasRestantes} día(s) restante(s)",
                        ticket: $d['ticket'],
                        destinoUrl: "/denuncias/{$d['ticket']}",
                        icono: 'Clock',
                        color: 'warning',
                    );
                } elseif ($diasRestantes < 0) {
                    $derivadas[] = self::makeNotificacion(
                        tipo: 'plazo_vencido',
                        titulo: 'Plazo vencido',
                        mensaje: "{$d['ticket']} · Vencido hace " . abs($diasRestantes) . ' día(s)',
                        ticket: $d['ticket'],
                        destinoUrl: "/denuncias/{$d['ticket']}",
                        icono: 'AlertTriangle',
                        color: 'destructive',
                    );
                }

                // Plazo de informe (estado informe)
                if ($d['estado'] === 'informe' && !empty($d['informe_created_at'])) {
                    $fechaInforme = Carbon::parse($d['informe_created_at']);
                    $diasInforme = $now->diffInDays($fechaInforme, false);
                    if ($diasInforme <= 3 && $diasInforme >= 0) {
                        $derivadas[] = self::makeNotificacion(
                            tipo: 'plazo_informe',
                            titulo: 'Informe final por vencer',
                            mensaje: "{$d['ticket']} · {$diasInforme} día(s) para concluir informe",
                            ticket: $d['ticket'],
                            destinoUrl: "/denuncias/{$d['ticket']}",
                            icono: 'FileText',
                            color: 'warning',
                        );
                    }
                }
            }

            // --- Traspasos recientes (últimos 7 días) ---
            if (!empty($d['fecha_traspaso'])) {
                $fechaTraspaso = Carbon::parse($d['fecha_traspaso']);
                if ($now->diffInDays($fechaTraspaso) <= 7) {
                    $tecnicoActual = $d['tecnico_nombre'] ?? 'otro técnico';
                    $derivadas[] = self::makeNotificacion(
                        tipo: 'traspaso',
                        titulo: 'Caso traspasado',
                        mensaje: "{$d['ticket']} fue asignado a {$tecnicoActual}",
                        ticket: $d['ticket'],
                        destinoUrl: "/denuncias/{$d['ticket']}",
                        icono: 'ArrowRightLeft',
                        color: 'info',
                    );
                }
            }

            // --- Ampliaciones recientes (últimos 7 días) ---
            foreach ($d['ampliaciones'] ?? [] as $amp) {
                $fechaAmp = Carbon::parse($amp['fecha']);
                if ($now->diffInDays($fechaAmp) <= 7) {
                    $derivadas[] = self::makeNotificacion(
                        tipo: 'ampliacion',
                        titulo: 'Plazo ampliado',
                        mensaje: "{$d['ticket']} · +{$amp['dias']} día(s) — " . ($amp['justificacion'] ? substr($amp['justificacion'], 0, 60) . '…' : ''),
                        ticket: $d['ticket'],
                        destinoUrl: "/denuncias/{$d['ticket']}",
                        icono: 'CalendarPlus',
                        color: 'success',
                    );
                }
            }

            // --- Cambios de estado recientes (feed de actividad) ---
            $estadosFeed = ['admitida', 'rechazada'];
            if (in_array($d['estado'], $estadosFeed)) {
                $fechaCambio = $d['fecha_' . $d['estado']] ?? ($d['updated_at'] ?? $d['created_at']);
                if ($fechaCambio) {
                    $fechaC = Carbon::parse($fechaCambio);
                    if ($now->diffInDays($fechaC) <= 7) {
                        $esAdmitida = $d['estado'] === 'admitida';
                        $derivadas[] = self::makeNotificacion(
                            tipo: $esAdmitida ? 'denuncia_admitida' : 'denuncia_rechazada',
                            titulo: $esAdmitida ? 'Denuncia admitida' : 'Denuncia rechazada',
                            mensaje: "{$d['ticket']} fue " . ($esAdmitida ? 'admitida' : 'rechazada'),
                            ticket: $d['ticket'],
                            destinoUrl: "/denuncias/{$d['ticket']}",
                            icono: $esAdmitida ? 'CheckCircle' : 'XCircle',
                            color: $esAdmitida ? 'success' : 'destructive',
                        );
                    }
                }
            }
        }

        // --- 2. Solicitudes próximas a vencer ---
        $solicitudes = SolicitudData::getAll();
        foreach ($solicitudes as $s) {
            if (!in_array($s['estado'], ['pendiente', 'ampliada'])) continue;
            $fechaVence = Carbon::parse($s['fecha_vencimiento']);
            $diasRestantes = $now->diffInDays($fechaVence, false);
            if ($diasRestantes >= 0 && $diasRestantes <= 3) {
                $derivadas[] = self::makeNotificacion(
                    tipo: 'solicitud_vence',
                    titulo: 'Solicitud de información por vencer',
                    mensaje: "{$s['ticket']} · {$s['unidad_destino']} · {$diasRestantes} día(s)",
                    ticket: $s['ticket'],
                    destinoUrl: "/denuncias/{$s['ticket']}",
                    icono: 'MailQuestion',
                    color: 'warning',
                );
            }
        }

        // --- 3. Descargos próximos a vencer ---
        $descargos = DescargoData::getAll();
        foreach ($descargos as $desc) {
            if (!in_array($desc['estado'], ['notificado', 'ampliado'])) continue;
            $fechaVence = Carbon::parse($desc['fecha_vencimiento'] ?? $desc['fecha_notificacion'])->addDays(10);
            $diasRestantes = $now->diffInDays($fechaVence, false);
            if ($diasRestantes >= 0 && $diasRestantes <= 3) {
                $derivadas[] = self::makeNotificacion(
                    tipo: 'descargo_vence',
                    titulo: 'Descargo por vencer',
                    mensaje: "{$desc['ticket']} · {$diasRestantes} día(s) para responder",
                    ticket: $desc['ticket'],
                    destinoUrl: "/denuncias/{$desc['ticket']}",
                    icono: 'MessageSquareWarning',
                    color: 'warning',
                );
            }
        }

        // --- Fusionar: derivadas + persistentes (leídas) ---
        // Las leídas persistentes se mantienen; las derivadas nuevas reemplazan
        $todas = self::fusionar($derivadas, $persistentes);
        $todas = self::ordenar($todas);

        // Guardar estado fusionado en sesión
        $sessionData['notificaciones'] = $todas;
        session([self::SESSION_KEY => $sessionData]);

        return $todas;
    }

    /**
     * Fusiona notificaciones derivadas (vivas) con persistentes (marcadas leídas).
     * Una derivada se identifica por tipo+ticket (clave compuesta).
     */
    private static function fusionar(array $derivadas, array $persistentes): array
    {
        $leidas = [];
        foreach ($persistentes as $p) {
            if ($p['leida']) {
                $leidas[self::key($p)] = $p;
            }
        }

        $resultado = [];
        foreach ($derivadas as $d) {
            $k = self::key($d);
            if (isset($leidas[$k])) {
                $d['leida'] = true;
                $d['fecha_leida'] = $leidas[$k]['fecha_leida'];
            }
            $d['id'] = $leidas[$k]['id'] ?? $d['id'];
            $resultado[] = $d;
        }

        return $resultado;
    }

    private static function key(array $n): string
    {
        return $n['tipo'] . '|' . ($n['ticket'] ?? '');
    }

    private static function ordenar(array $items): array
    {
        usort($items, function ($a, $b) {
            return strcmp($b['fecha'], $a['fecha']);
        });
        // Re-indexar
        return array_values($items);
    }

    // ============================================================
    // CRUD
    // ============================================================

    public static function getAll(): array
    {
        self::init();
        return session(self::SESSION_KEY . '.notificaciones', []);
    }

    public static function getNoLeidas(): array
    {
        return array_filter(self::getAll(), fn($n) => !$n['leida']);
    }

    public static function getUnreadCount(): int
    {
        return count(self::getNoLeidas());
    }

    /**
     * Retorna las últimas N notificaciones para el panel dropdown.
     */
    public static function getRecientes(int $limit = 30): array
    {
        $todas = self::getAll();
        return array_slice($todas, 0, $limit);
    }

    /**
     * Retorna página paginada.
     */
    public static function getPaginated(int $page = 1, int $perPage = 10, array $filtros = []): array
    {
        $todas = self::getAll();

        // Aplicar filtros
        if (!empty($filtros['tipo'])) {
            $todas = array_filter($todas, fn($n) => $n['tipo'] === $filtros['tipo']);
        }
        if (isset($filtros['leida'])) {
            $todas = array_filter($todas, fn($n) => $n['leida'] === (bool)$filtros['leida']);
        }
        if (!empty($filtros['fecha_desde'])) {
            $desde = Carbon::parse($filtros['fecha_desde']);
            $todas = array_filter($todas, fn($n) => Carbon::parse($n['fecha']) >= $desde);
        }
        if (!empty($filtros['fecha_hasta'])) {
            $hasta = Carbon::parse($filtros['fecha_hasta']);
            $todas = array_filter($todas, fn($n) => Carbon::parse($n['fecha']) <= $hasta);
        }

        $todas = array_values($todas); // re-indexar
        $total = count($todas);
        $totalPages = max(1, (int)ceil($total / $perPage));
        $offset = ($page - 1) * $perPage;
        $items = array_slice($todas, $offset, $perPage);

        return [
            'items' => $items,
            'total' => $total,
            'page' => $page,
            'per_page' => $perPage,
            'total_pages' => $totalPages,
        ];
    }

    public static function marcarLeida(int $id): bool
    {
        self::init();
        $items = session(self::SESSION_KEY . '.notificaciones', []);
        foreach ($items as &$n) {
            if ($n['id'] === $id) {
                $n['leida'] = true;
                $n['fecha_leida'] = now()->toDateTimeString();
                session([self::SESSION_KEY . '.notificaciones' => $items]);
                return true;
            }
        }
        return false;
    }

    public static function marcarTodasLeidas(): void
    {
        self::init();
        $items = session(self::SESSION_KEY . '.notificaciones', []);
        foreach ($items as &$n) {
            if (!$n['leida']) {
                $n['leida'] = true;
                $n['fecha_leida'] = now()->toDateTimeString();
            }
        }
        session([self::SESSION_KEY . '.notificaciones' => $items]);
    }

    // ============================================================
    // HELPERS
    // ============================================================

    private static function makeNotificacion(
        string $tipo,
        string $titulo,
        string $mensaje,
        ?string $ticket = null,
        string $destinoUrl = '#',
        string $icono = 'Bell',
        string $color = 'primary',
    ): array {
        self::init();
        $sessionData = session(self::SESSION_KEY);
        $id = $sessionData['next_id']++;
        session([self::SESSION_KEY => $sessionData]);

        return [
            'id' => $id,
            'tipo' => $tipo,
            'titulo' => $titulo,
            'mensaje' => $mensaje,
            'ticket' => $ticket,
            'destino_url' => $destinoUrl,
            'leida' => false,
            'fecha_leida' => null,
            'fecha' => now()->toDateTimeString(),
            'icono' => $icono,
            'color' => $color,
        ];
    }

    /**
     * Seed de notificaciones demo para mostrar al inicio.
     */
    public static function seedDemo(): void
    {
        self::init();
        $derivadas = self::generarParaUsuario();

        // Agregar algunas demo si hay menos de 3
        if (count($derivadas) < 3) {
            $demos = [
                self::makeNotificacion(
                    tipo: 'sistema',
                    titulo: 'Bienvenido al sistema',
                    mensaje: 'Sistema de Gestión de Denuncias UTLCC — Ley N° 974',
                    ticket: null,
                    destinoUrl: '/dashboard',
                    icono: 'Bell',
                    color: 'primary',
                ),
                self::makeNotificacion(
                    tipo: 'plazo_por_vencer',
                    titulo: 'Plazo total por vencer',
                    mensaje: 'DEN-2026-0004 · Corrupción · 2 día(s) restante(s)',
                    ticket: 'DEN-2026-0004',
                    destinoUrl: '/denuncias/DEN-2026-0004',
                    icono: 'Clock',
                    color: 'warning',
                ),
            ];

            $sessionData = session(self::SESSION_KEY);
            $sessionData['notificaciones'] = array_merge($demos, $derivadas);
            session([self::SESSION_KEY => $sessionData]);
        }
    }
}
```

### 3.2 Archivo nuevo: `app/Http/Controllers/NotificacionController.php`

```php
<?php

namespace App\Http\Controllers;

use App\Data\NotificacionData;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificacionController extends Controller
{
    /**
     * Página completa de notificaciones (paginada + filtros).
     */
    public function index(Request $request)
    {
        $page = (int) $request->input('page', 1);
        $filtros = [
            'tipo' => $request->input('tipo'),
            'leida' => $request->input('leida'),
            'fecha_desde' => $request->input('fecha_desde'),
            'fecha_hasta' => $request->input('fecha_hasta'),
        ];

        $resultado = NotificacionData::getPaginated(
            page: $page,
            perPage: 10,
            filtros: $filtros,
        );

        return Inertia::render('Notificaciones/Index', [
            'notificaciones' => $resultado,
            'filtros' => $filtros,
        ]);
    }

    /**
     * Marcar una notificación como leída.
     */
    public function marcarLeida(Request $request, int $id)
    {
        NotificacionData::marcarLeida($id);
        return redirect()->back();
    }

    /**
     * Marcar todas las notificaciones como leídas.
     */
    public function marcarTodasLeidas(Request $request)
    {
        NotificacionData::marcarTodasLeidas();
        return redirect()->back();
    }

    /**
     * Endpoint ligero: solo devuelve el contador de no leídas.
     * Preparado para polling futuro (Sprint 14+).
     */
    public function count()
    {
        $count = NotificacionData::getUnreadCount();
        return response()->json(['no_leidas' => $count]);
    }
}
```

### 3.3 Middleware modificado: `app/Http/Middleware/HandleInertiaRequests.php`

```php
public function share(Request $request): array
{
    $share = [
        ...parent::share($request),
        'auth' => [
            'user' => $request->user(),
        ],
        'logo_url' => asset('LOGO-OFICIAL-EL-ALTO.png'),
        'jacha_url' => asset('jacha.jpg'),
        'success' => session('success'),
        'ticket' => session('ticket'),
    ];

    // Solo inyectar notificaciones si el usuario está autenticado
    if ($request->user()) {
        $notificaciones = NotificacionData::generarParaUsuario('sistema');
        $share['notificaciones'] = [
            'no_leidas' => NotificacionData::getUnreadCount(),
            'recientes' => NotificacionData::getRecientes(5),  // primeras 5 para el badge
        ];
    }

    return $share;
}
```

### 3.4 Rutas nuevas: `routes/web.php`

```php
// Sprint 9 — Notificaciones
Route::prefix('notificaciones')->name('notificaciones.')->group(function () {
    Route::get('/', [NotificacionController::class, 'index'])->name('index');
    Route::post('/{id}/leer', [NotificacionController::class, 'marcarLeida'])->name('marcar-leida');
    Route::post('/leer-todas', [NotificacionController::class, 'marcarTodasLeidas'])->name('marcar-todas');
});

// API — Endpoint ligero para polling futuro
Route::get('/api/notificaciones/count', [NotificacionController::class, 'count'])
    ->middleware('auth');
```

---

## 4. Frontend (React + TypeScript)

### 4.1 Componentes nuevos (5)

#### `CampanaNotificaciones.tsx`

Botón campana en el Header. Props desde Inertia global.

```tsx
interface CampanaNotificacionesProps {
  noLeidas: number;
  recientes: Notificacion[];
}
```

**Estados:**
- `noLeidas = 0` → campana normal, sin badge
- `noLeidas > 0` → badge rojo con contador + animación pulse CSS
- Pulse: `animate-pulse` en el badge cuando el contador sube respecto al render anterior

**Comportamiento:**
- Click → abre `PanelNotificaciones` via shadcn `Popover`
- Click fuera → cierra
- El badge se actualiza al navegar (prop global de Inertia)

#### `ItemNotificacion.tsx`

Una fila en el panel. Props:

```tsx
interface ItemNotificacionProps {
  notificacion: Notificacion;
  onMarcarLeida: (id: number) => void;
  onNavegar: (url: string) => void;
}
```

**Layout por tipo:**

```
┌─────────────────────────────────────────────┐
│ [icono]  Título (bold si no leída)          │
│          Mensaje (1 línea, truncado)        │
│          hace 15 min (timestamp relativo)   │
│                                              │
│          [punto azul] si no leída           │
└─────────────────────────────────────────────┘
```

**Iconos por tipo:**

| Tipo | Icono | Color |
|------|-------|-------|
| `traspaso` | `ArrowRightLeft` | blue (info) |
| `ampliacion` | `CalendarPlus` | green (success) |
| `denuncia_admitida` | `CheckCircle` | green (success) |
| `denuncia_rechazada` | `XCircle` | red (destructive) |
| `plazo_por_vencer` | `Clock` | amber (warning) |
| `plazo_vencido` | `AlertTriangle` | red (destructive) |
| `plazo_informe` | `FileText` | amber (warning) |
| `solicitud_vence` | `MailQuestion` | amber (warning) |
| `descargo_vence` | `MessageSquareWarning` | amber (warning) |
| `sistema` | `Bell` | primary |

**Interacción:**
- Click → `router.get(destinoUrl)` + `onMarcarLeida(id)`
- Hover → bg `muted`
- No leída → bg `muted/30` + borde izquierdo primary

#### `PanelNotificaciones.tsx`

Panel dropdown anidado dentro del Popover de la campana.

```tsx
interface PanelNotificacionesProps {
  notificaciones: Notificacion[];
  noLeidas: number;
  onCerrar: () => void;
}
```

**Layout:**
```
┌─── Panel (380px, max-h-[560px]) ───────────────┐
│ Header: "Notificaciones"   [✓ Marcar todas]    │
├─────────────────────────────────────────────────┤
│ [ScrollArea (max-h-[460px])]                    │
│                                                  │
│ ● ItemNotificacion (no leída, fondo destacado)  │
│ ● ItemNotificacion (no leída)                   │
│ ───── separador "Leídas" ─────                  │
│ ○ ItemNotificacion (leída, opaca)               │
│ ○ ItemNotificacion (leída)                      │
│                                                  │
│ [Fin del scroll]                                │
├─────────────────────────────────────────────────┤
│ Footer: "Ver todas las notificaciones →"       │
└─────────────────────────────────────────────────┘
```

**Comportamiento:**
- Separar leídas y no leídas visualmente
- Si no hay notificaciones: empty state "No hay notificaciones" con icono `Bell`
- "Marcar todas" → `router.post(route('notificaciones.marcar-todas'))`
- "Ver todas" → `router.get(route('notificaciones.index'))`
- Footer solo visible si hay más de 5 notificaciones

#### `Pages/Notificaciones/Index.tsx`

Página completa con filtros + tabla/paginación.

```tsx
interface PageProps {
  notificaciones: {
    items: Notificacion[];
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
  };
  filtros: {
    tipo?: string;
    leida?: string;
    fecha_desde?: string;
    fecha_hasta?: string;
  };
}
```

**Layout:**
```
┌─── Página /notificaciones ────────────────────────────────┐
│                                                            │
│ Título: "Notificaciones"    [✓ Marcar todas]              │
│                                                            │
│ ┌── Filtros ──────────────────────────────────────────┐   │
│ │ Tipo: [Select ▼]   Leída: [Select ▼]   Fecha: [...]│   │
│ │ [Aplicar] [Limpiar]                                 │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                            │
│ ┌── Lista ─────────────────────────────────────────────┐   │
│ │ x 10 items por página                                 │   │
│ │ ● ItemNotificacion (con padding, sin scroll)          │   │
│ │ ...                                                    │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                            │
│ Paginación: [< Anterior]  1  2  3  ... 5  [Siguiente >]  │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

**Comportamiento:**
- Filtros: tipo (select con todas las opciones), leída (Select: Todos / No leídas / Leídas), rango fechas (date inputs)
- Paginación shadcn con botones Anterior/Siguiente
- Click en item: redirige al caso + marca leída
- Vacío: "No se encontraron notificaciones con esos filtros"

### 4.2 Componente modificado (1)

#### `Header.tsx`

```tsx
// Reemplazar:

{/* Notifications Bell */}
<button
    className="relative p-2 rounded-lg hover:bg-sidebar-muted transition-colors cursor-pointer text-sidebar-foreground/60 hover:text-sidebar-foreground focus:outline-none focus:ring-2 focus:ring-sidebar-ring/40"
    aria-label="Notificaciones"
    title="Notificaciones"
>
    <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
    <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
</button>

// Por:

<CampanaNotificaciones
    noLeidas={noLeidas}
    recientes={recientes}
/>
```

Props `noLeidas` y `recientes` vienen de `usePage().props.notificaciones`.

#### Sidebar.tsx

Agregar menú item:

```tsx
{
    key: 'notificaciones',
    label: 'Notificaciones',
    href: route('notificaciones.index'),
    routeName: 'notificaciones.*',
    icon: <Bell className="w-5 h-5 shrink-0" />,
    badge: noLeidas,  // contador de no leídas
},
```

El badge se actualiza dinámicamente según la prop global `notificaciones.no_leidas`.

### 4.3 Interface Notificacion (compartida)

```tsx
interface Notificacion {
  id: number;
  tipo: 'traspaso' | 'ampliacion' | 'denuncia_admitida' | 'denuncia_rechazada'
      | 'plazo_por_vencer' | 'plazo_vencido' | 'plazo_informe'
      | 'solicitud_vence' | 'descargo_vence' | 'sistema';
  titulo: string;
  mensaje: string;
  ticket: string | null;
  destino_url: string;
  leida: boolean;
  fecha_leida: string | null;
  fecha: string;
  icono: string;
  color: string;
}
```

---

## 5. Modelo de datos (mock)

### 5.1 Notificación (sesión)

```php
[
    'id' => 1,
    'tipo' => 'traspaso',
    'titulo' => 'Caso traspasado',
    'mensaje' => 'DEN-2026-0007 fue asignado a Carlos Mendoza',
    'ticket' => 'DEN-2026-0007',
    'destino_url' => '/denuncias/DEN-2026-0007',
    'leida' => false,
    'fecha_leida' => null,
    'fecha' => '2026-07-01 10:30:00',
    'icono' => 'ArrowRightLeft',
    'color' => 'info',
]
```

### 5.2 Seed esperado

Con el seed actual de 12 denuncias, se esperan **6-10 notificaciones generadas automáticamente**:
- 1-2 traspasos recientes (< 7d)
- 1-2 ampliaciones recientes (< 7d)
- 1 plazo total por vencer (≤ 3d)
- 1-2 solicitudes próximas a vencer
- 1-2 descargos próximos a vencer
- 1-2 cambios de estado recientes (admitida/rechazada)

Total estimado: **7-12 notificaciones** al cargar la página por primera vez.

---

## 6. UI/UX

### 6.1 Campana (Header)

```
                          ╔══╗
                          ║🔔║  ← botón con hover bg-sidebar-muted
                          ║  ║
                          ║ 3║  ← badge rojo con contador + animate-pulse
                          ╚══╝
```

### 6.2 Panel desplegado (425x560px)

```
┌──────────────────────────────────────┐
│ Notificaciones          [Marcar]     │ ← header fijo
├──────────────────────────────────────┤
│                                      │
│ ● Caso traspasado                    │ ← item no leído (fondo muted/30)
│   DEN-2026-0007 fue asignado a...    │    borde izquierdo primary
│   hace 15 min                        │
│                                      │
│ ● Plazo total por vencer             │
│   DEN-2026-0004 · Corrupción · 2d    │
│   hace 1h                            │
│                                      │
│ ───── Leídas ─────                   │ ← separador
│                                      │
│ ○ Solicitud ampliada                 │ ← item leído (opacidad 60%)
│   DEN-2026-0008                      │    sin borde
│   ayer a las 14:30                   │
│                                      │
│ ○ Denuncia admitida                  │
│   DEN-2026-0004 fue admitida         │
│   ayer a las 10:00                   │
│                                      │
├──────────────────────────────────────┤
│ Ver todas las notificaciones →       │ ← footer, solo si total > 5
└──────────────────────────────────────┘
```

### 6.3 Página completa

```
┌────────────────────────────────────────────────────────────┐
│ Notificaciones                               [Marcar todas]│
├────────────────────────────────────────────────────────────┤
│ [Tipo: Todos ▼] [Leída: Todos ▼] [Desde: 01/06] [Hasta: ] │
│ [Aplicar filtros] [Limpiar]                                │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ ● Caso traspasado                                          │
│   DEN-2026-0007 fue asignado a Carlos Mendoza              │
│   01/07/2026 10:30                                          │
│ ──────────────────────────────────────                     │
│ ● Plazo total por vencer                                    │
│   DEN-2026-0004 · 2 día(s) restante(s)                     │
│   01/07/2026 09:15                                          │
│ ──────────────────────────────────────                     │
│ ... (más items)                                            │
│                                                            │
├────────────────────────────────────────────────────────────┤
│ [< Anterior]  1  2  3  ...  5  [Siguiente >]              │
└────────────────────────────────────────────────────────────┘
```

### 6.4 Timestamp relativo

| Diferencia | Display |
|------------|---------|
| < 1 min | "Ahora" |
| < 60 min | "hace X min" |
| < 24 h | "hace X h" |
| < 7 d | "hace X día(s)" |
| ≥ 7 d | "dd/mm/aaaa hh:mm" |

---

## 7. shadcn a instalar

```bash
npx shadcn@2.3.0 add popover scroll-area separator
```

- `popover` — posicionar el panel dropdown
- `scroll-area` — scroll interno del panel (ya existe, verificar)
- `separator` — línea de separación visual (ya existe? sino, instalarlo)

**Componentes ya existentes:** `badge`, `button`, `card`, `dialog`, `select`, `input`, `label`

---

## 8. Pruebas manuales sugeridas

| # | Caso | Pasos | Resultado esperado |
|---|------|-------|---------------------|
| 1 | Badge muestra contador | Login → ver Header | Badge con número de no leídas (> 0 con seed) |
| 2 | Pulse animation | Recargar página con notificaciones | Badge rojo tiene `animate-pulse` (sin sonido) |
| 3 | Abrir panel | Click en campana | Panel se despliega con items scrolleables |
| 4 | Separar leídas/no leídas | Tener ambas → abrir panel | Leídas abajo con separador, opacas |
| 5 | Marcar individual | Click en item no leído | Navega al caso. Al volver, item ya no aparece en no leídas |
| 6 | Marcar todas | Click "Marcar todas" en panel | Badge se vuelve 0. Todos los items aparecen como leídos |
| 7 | Página completa | Sidebar → Notificaciones | Página con filtros + paginación |
| 8 | Filtro por tipo | Seleccionar "Traspaso" → "Aplicar" | Solo muestra traspasos |
| 9 | Filtro por leída | Seleccionar "No leídas" | Solo no leídas |
| 10 | Paginación | Tener > 10 notificaciones → navegar páginas | Función Anterior/Siguiente |
| 11 | Empty state sin notificaciones | Marcar todas + recargar | Badge oculto (0). Panel muestra "No hay notificaciones" |
| 12 | Endpoint count | GET /api/notificaciones/count | JSON `{"no_leidas": N}` |
| 13 | Navegar desde notificación | Click en item → destino correcto | Redirige al caso o página correspondiente |
| 14 | Confirmar timestamps relativos | Notificación de hace 2 min → panel | "hace 2 min" |

---

## 9. Notas técnicas

- **Compatibilidad con Sprint 7 (Evaluación):** Las delegaciones y devoluciones de evaluación NO se incluyen como tipos porque no hay `EvaluacionData.php` aún. Se añadirán cuando Sprint 7 se implemente (o se agrega el tipo ahora para que funcione sin data? Decisión: **no incluir**, dejar el tipo reservado.)
- **Compatibilidad con Sprint 10+:** Cuando se implemente la BD real, `NotificacionData` se migrará a tabla `notificaciones` con Eloquent. El método `generarParaUsuario()` se reemplaza por Eloquent observers + scheduled jobs.
- **Compatibilidad con Sprint 15 (Roles):** Las notificaciones se filtrarán por `user_id` real. Se añadirá columna `user_id` en la tabla.
- **Compatibilidad con Sprint 18 (Días hábiles):** Si cambia el cálculo de plazos, se actualiza `generarParaUsuario()` automáticamente porque lee de `getPlazoInfo()`.
- **Validaciones backend:** `marcarLeida()` valida que `id` exista. `getPaginated()` filtra y pagina correctamente incluso si no hay notificaciones.
- **Sin polling en Fase 0:** El endpoint `/api/notificaciones/count` está listo. Para habilitar polling en Sprint 14: `setInterval(fetchCount, 30000)` en `CampanaNotificaciones.tsx`.
- **Animación pulse:** CSS `@keyframes pulse` de Tailwind `animate-pulse` aplicado al badge del contador. Se dispara solo cuando `noLeidas` cambia (comparar con `useRef` del valor anterior).
- **Uso de `usePage().props`:** Las notificaciones se pasan como props globales desde `HandleInertiaRequests`, disponibles en cualquier página sin prop drilling.

---

## 10. TODO / Pendientes

> ⏸️ **Pendiente con Sprint 14:** Migrar de sesión mock a tabla MySQL `notificaciones` con Eloquent + observers para generación por evento.

> ⏸️ **Pendiente con Sprint 14:** Implementar polling 30s con endpoint count, o Reverb para tiempo real.

> ⏸️ **Pendiente con Sprint 15:** Filtrar notificaciones por `user_id` real según roles.

> ⏸️ **Pendiente con cliente:** Pregunta #6 (C1) — días hábiles afecta cálculo de plazos por vencer.

---

## 11. Referencias

- **Decisión cliente:** `Preguntas para el cliente.md` #22
- **Documento de contexto:** `Sprints Pendientes - Contexto.md` sección Sprint 9
- **Plan de ruta:** `Plan de Desarrollo.md` Sprint 9
- **Patrón de código:** `SolicitudData.php` / `DescargoData.php` para sesión mock
- **Iconos:** lucide-react (`Bell`, `Clock`, `CheckCircle`, `XCircle`, `ArrowRightLeft`, `CalendarPlus`, `AlertTriangle`, `FileText`, `MailQuestion`, `MessageSquareWarning`)
- **Colores:** `primary`, `warning`, `destructive`, `success`, `info` — variables OKLCH institucionales

---

*Documento creado: Julio 2026. Pendiente de implementación.*
