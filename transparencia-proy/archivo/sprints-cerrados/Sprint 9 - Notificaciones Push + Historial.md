> ⚠️ **Histórico — Sprint cerrado Jul 2026 (Laravel 11).** Snapshot al cierre, no refleja refactorización Bloques 0-2 (Sep 2026, Laravel 13). Para estado actual ver AI-CONTEXT.md y Notas Reestructuración - Bloques 0-2 (Sept 2026) - Cierre.md.
#transparencia
# Sprint 9 â€” Notificaciones Push + Historial âœ… PLANIFICADO (Julio 2026)

**Objetivo:** Sistema de notificaciones push vÃ­a **campana superior** en el navbar de la aplicaciÃ³n, con historial scrolleable tipo notificaciones de Facebook. Click en notificaciÃ³n navega al caso relacionado. PÃ¡gina completa `/notificaciones` con filtros y paginaciÃ³n.

**Origen:** Respuesta del cliente #22 â€” SesiÃ³n de validaciÃ³n, Junio 2026.

---

## 1. Contexto

### 1.1 Problema
Actualmente el sistema no tiene ningÃºn mecanismo para que los usuarios reciban alertas sobre eventos importantes que ocurren en las denuncias. Un tÃ©cnico no sabe si le traspasaron un caso, si el Jefe le delegÃ³ una evaluaciÃ³n, o si un descargo estÃ¡ por vencer, a menos que navegue manualmente al caso. El Jefe no ve un feed de actividad reciente sin abrir cada denuncia.

### 1.2 SoluciÃ³n
Sistema de notificaciones con 3 capas:
1. **Badge en campana** (Header) â€” contador de no leÃ­das, animaciÃ³n pulse CSS
2. **Panel dropdown** â€” Ãºltima 30 notificaciones scrolleables, tipo Facebook
3. **PÃ¡gina completa** `/notificaciones` â€” historial completo con filtros + paginaciÃ³n (10 items/pÃ¡gina)

### 1.3 Diagrama de flujo (generaciÃ³n de notificaciones)

```
[Usuario carga pÃ¡gina Inertia]
              â”‚
              â–¼
[NotificacionData::generarParaUsuario(userId)]
              â”‚
              â”œâ”€â”€ 1. Escanea DenunciaData â†’ plazos por vencer (â‰¤3d)
              â”‚                            â†’ traspasos recientes (<7d)
              â”‚                            â†’ ampliaciones recientes (<7d)
              â”‚                            â†’ cambios de estado recientes (<7d)
              â”‚
              â”œâ”€â”€ 2. Escanea SolicitudData â†’ solicitudes prÃ³ximas a vencer (â‰¤3d)
              â”‚
              â”œâ”€â”€ 3. Escanea DescargoData  â†’ descargos prÃ³ximos a vencer (â‰¤3d)
              â”‚
              â””â”€â”€ 4. Fusiona con sesiÃ³n    â†’ combina con notificaciones persistentes
                   (marcadas como leÃ­das)    (leÃ­das manualmente por usuario)
                                            â†’ retorna lista final
```

---

## 2. Decisiones del Sprint

| # | DecisiÃ³n | Alternativa descartada | Motivo |
|---|----------|------------------------|--------|
| 1 | **GeneraciÃ³n derivada** al cargar pÃ¡gina | Eventos en cada controller | Fase 0 sin BD. No toca 5+ controllers. Migrable a observers en Sprint 10. |
| 2 | **Sin WebSockets en Fase 0** | Pusher/Reverb/Socketi | No hay multiusuario real en Fase 0. Endpoint count listo para futuro polling. |
| 3 | **Audiencia = Jefe** (hasta Sprint 16) | Roles reales | Fase 0 es usuario Ãºnico. Notificaciones filtradas para Jefe. |
| 4 | **Umbral â‰¤ 3 dÃ­as** para plazos por vencer | 5/7 dÃ­as | Coherente con umbral amarillo de PlazoBadge (â‰¤5dâ†’amarillo, â‰¤3dâ†’notificaciÃ³n). |
| 5 | **Click marca + navega** | Auto-marcar al abrir panel | MÃ¡s conservador: el usuario decide quÃ© marcar como leÃ­do. |
| 6 | **"Denuncia respondida" = feed de actividad** | Eliminar del sprint | Ãštil como historial de auditorÃ­a, aunque el Jefe sea quien respondiÃ³. |
| 7 | **Notificar ampliaciones al tÃ©cnico** | Solo badge en card | El tÃ©cnico necesita saber que su plazo cambiÃ³. |
| 8 | **PÃ¡gina /notificaciones con paginaciÃ³n (10)** | Solo panel emergente | El cliente pidiÃ³ historial completo. 10 items/pÃ¡gina, botones Anterior/Siguiente. |
| 9 | **Pulse CSS al subir contador** | Sin animaciÃ³n / Sonido | Feedback visual sutil sin ser intrusivo. Puro CSS, sin costo. |
| 10 | **Solo autenticados** | PÃºblico tambiÃ©n | La campana estÃ¡ en AppLayout, solo visible logueado. |

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
    // SesiÃ³n persistente (notificaciones marcadas como leÃ­das, etc.)
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
    // GENERACIÃ“N DERIVADA â€” Se ejecuta en cada pÃ¡gina cargada
    // ============================================================

    /**
     * Genera la lista completa de notificaciones para el usuario.
     * Combina notificaciones persistentes (leÃ­das manualmente) con
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

            // Plazo total â‰¤ 3 dÃ­as (solo estados activos post-admisiÃ³n)
            if (in_array($d['estado'], ['admitida', 'asignada', 'investigacion', 'informe', 'evaluacion_tecnica'])) {
                if ($diasRestantes <= 3 && $diasRestantes >= 0) {
                    $derivadas[] = self::makeNotificacion(
                        tipo: 'plazo_por_vencer',
                        titulo: 'Plazo total por vencer',
                        mensaje: "{$d['ticket']} Â· {$d['tipo']} Â· {$diasRestantes} dÃ­a(s) restante(s)",
                        ticket: $d['ticket'],
                        destinoUrl: "/denuncias/{$d['ticket']}",
                        icono: 'Clock',
                        color: 'warning',
                    );
                } elseif ($diasRestantes < 0) {
                    $derivadas[] = self::makeNotificacion(
                        tipo: 'plazo_vencido',
                        titulo: 'Plazo vencido',
                        mensaje: "{$d['ticket']} Â· Vencido hace " . abs($diasRestantes) . ' dÃ­a(s)',
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
                            mensaje: "{$d['ticket']} Â· {$diasInforme} dÃ­a(s) para concluir informe",
                            ticket: $d['ticket'],
                            destinoUrl: "/denuncias/{$d['ticket']}",
                            icono: 'FileText',
                            color: 'warning',
                        );
                    }
                }
            }

            // --- Traspasos recientes (Ãºltimos 7 dÃ­as) ---
            if (!empty($d['fecha_traspaso'])) {
                $fechaTraspaso = Carbon::parse($d['fecha_traspaso']);
                if ($now->diffInDays($fechaTraspaso) <= 7) {
                    $tecnicoActual = $d['tecnico_nombre'] ?? 'otro tÃ©cnico';
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

            // --- Ampliaciones recientes (Ãºltimos 7 dÃ­as) ---
            foreach ($d['ampliaciones'] ?? [] as $amp) {
                $fechaAmp = Carbon::parse($amp['fecha']);
                if ($now->diffInDays($fechaAmp) <= 7) {
                    $derivadas[] = self::makeNotificacion(
                        tipo: 'ampliacion',
                        titulo: 'Plazo ampliado',
                        mensaje: "{$d['ticket']} Â· +{$amp['dias']} dÃ­a(s) â€” " . ($amp['justificacion'] ? substr($amp['justificacion'], 0, 60) . 'â€¦' : ''),
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

        // --- 2. Solicitudes prÃ³ximas a vencer ---
        $solicitudes = SolicitudData::getAll();
        foreach ($solicitudes as $s) {
            if (!in_array($s['estado'], ['pendiente', 'ampliada'])) continue;
            $fechaVence = Carbon::parse($s['fecha_vencimiento']);
            $diasRestantes = $now->diffInDays($fechaVence, false);
            if ($diasRestantes >= 0 && $diasRestantes <= 3) {
                $derivadas[] = self::makeNotificacion(
                    tipo: 'solicitud_vence',
                    titulo: 'Solicitud de informaciÃ³n por vencer',
                    mensaje: "{$s['ticket']} Â· {$s['unidad_destino']} Â· {$diasRestantes} dÃ­a(s)",
                    ticket: $s['ticket'],
                    destinoUrl: "/denuncias/{$s['ticket']}",
                    icono: 'MailQuestion',
                    color: 'warning',
                );
            }
        }

        // --- 3. Descargos prÃ³ximos a vencer ---
        $descargos = DescargoData::getAll();
        foreach ($descargos as $desc) {
            if (!in_array($desc['estado'], ['notificado', 'ampliado'])) continue;
            $fechaVence = Carbon::parse($desc['fecha_vencimiento'] ?? $desc['fecha_notificacion'])->addDays(10);
            $diasRestantes = $now->diffInDays($fechaVence, false);
            if ($diasRestantes >= 0 && $diasRestantes <= 3) {
                $derivadas[] = self::makeNotificacion(
                    tipo: 'descargo_vence',
                    titulo: 'Descargo por vencer',
                    mensaje: "{$desc['ticket']} Â· {$diasRestantes} dÃ­a(s) para responder",
                    ticket: $desc['ticket'],
                    destinoUrl: "/denuncias/{$desc['ticket']}",
                    icono: 'MessageSquareWarning',
                    color: 'warning',
                );
            }
        }

        // --- Fusionar: derivadas + persistentes (leÃ­das) ---
        // Las leÃ­das persistentes se mantienen; las derivadas nuevas reemplazan
        $todas = self::fusionar($derivadas, $persistentes);
        $todas = self::ordenar($todas);

        // Guardar estado fusionado en sesiÃ³n
        $sessionData['notificaciones'] = $todas;
        session([self::SESSION_KEY => $sessionData]);

        return $todas;
    }

    /**
     * Fusiona notificaciones derivadas (vivas) con persistentes (marcadas leÃ­das).
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
     * Retorna las Ãºltimas N notificaciones para el panel dropdown.
     */
    public static function getRecientes(int $limit = 30): array
    {
        $todas = self::getAll();
        return array_slice($todas, 0, $limit);
    }

    /**
     * Retorna pÃ¡gina paginada.
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
                    mensaje: 'Sistema de GestiÃ³n de Denuncias UTLCC â€” Ley NÂ° 974',
                    ticket: null,
                    destinoUrl: '/dashboard',
                    icono: 'Bell',
                    color: 'primary',
                ),
                self::makeNotificacion(
                    tipo: 'plazo_por_vencer',
                    titulo: 'Plazo total por vencer',
                    mensaje: 'DEN-2026-0004 Â· CorrupciÃ³n Â· 2 dÃ­a(s) restante(s)',
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
     * PÃ¡gina completa de notificaciones (paginada + filtros).
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
     * Marcar una notificaciÃ³n como leÃ­da.
     */
    public function marcarLeida(Request $request, int $id)
    {
        NotificacionData::marcarLeida($id);
        return redirect()->back();
    }

    /**
     * Marcar todas las notificaciones como leÃ­das.
     */
    public function marcarTodasLeidas(Request $request)
    {
        NotificacionData::marcarTodasLeidas();
        return redirect()->back();
    }

    /**
     * Endpoint ligero: solo devuelve el contador de no leÃ­das.
     * Preparado para polling futuro (Sprint 10+).
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

    // Solo inyectar notificaciones si el usuario estÃ¡ autenticado
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
// Sprint 9 â€” Notificaciones
Route::prefix('notificaciones')->name('notificaciones.')->group(function () {
    Route::get('/', [NotificacionController::class, 'index'])->name('index');
    Route::post('/{id}/leer', [NotificacionController::class, 'marcarLeida'])->name('marcar-leida');
    Route::post('/leer-todas', [NotificacionController::class, 'marcarTodasLeidas'])->name('marcar-todas');
});

// API â€” Endpoint ligero para polling futuro
Route::get('/api/notificaciones/count', [NotificacionController::class, 'count'])
    ->middleware('auth');
```

---

## 4. Frontend (React + TypeScript)

### 4.1 Componentes nuevos (5)

#### `CampanaNotificaciones.tsx`

BotÃ³n campana en el Header. Props desde Inertia global.

```tsx
interface CampanaNotificacionesProps {
  noLeidas: number;
  recientes: Notificacion[];
}
```

**Estados:**
- `noLeidas = 0` â†’ campana normal, sin badge
- `noLeidas > 0` â†’ badge rojo con contador + animaciÃ³n pulse CSS
- Pulse: `animate-pulse` en el badge cuando el contador sube respecto al render anterior

**Comportamiento:**
- Click â†’ abre `PanelNotificaciones` via shadcn `Popover`
- Click fuera â†’ cierra
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
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ [icono]  TÃ­tulo (bold si no leÃ­da)          â”‚
â”‚          Mensaje (1 lÃ­nea, truncado)        â”‚
â”‚          hace 15 min (timestamp relativo)   â”‚
â”‚                                              â”‚
â”‚          [punto azul] si no leÃ­da           â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
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

**InteracciÃ³n:**
- Click â†’ `router.get(destinoUrl)` + `onMarcarLeida(id)`
- Hover â†’ bg `muted`
- No leÃ­da â†’ bg `muted/30` + borde izquierdo primary

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
â”Œâ”€â”€â”€ Panel (380px, max-h-[560px]) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ Header: "Notificaciones"   [âœ“ Marcar todas]    â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ [ScrollArea (max-h-[460px])]                    â”‚
â”‚                                                  â”‚
â”‚ â— ItemNotificacion (no leÃ­da, fondo destacado)  â”‚
â”‚ â— ItemNotificacion (no leÃ­da)                   â”‚
â”‚ â”€â”€â”€â”€â”€ separador "LeÃ­das" â”€â”€â”€â”€â”€                  â”‚
â”‚ â—‹ ItemNotificacion (leÃ­da, opaca)               â”‚
â”‚ â—‹ ItemNotificacion (leÃ­da)                      â”‚
â”‚                                                  â”‚
â”‚ [Fin del scroll]                                â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ Footer: "Ver todas las notificaciones â†’"       â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Comportamiento:**
- Separar leÃ­das y no leÃ­das visualmente
- Si no hay notificaciones: empty state "No hay notificaciones" con icono `Bell`
- "Marcar todas" â†’ `router.post(route('notificaciones.marcar-todas'))`
- "Ver todas" â†’ `router.get(route('notificaciones.index'))`
- Footer solo visible si hay mÃ¡s de 5 notificaciones

#### `Pages/Notificaciones/Index.tsx`

PÃ¡gina completa con filtros + tabla/paginaciÃ³n.

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
â”Œâ”€â”€â”€ PÃ¡gina /notificaciones â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                                                            â”‚
â”‚ TÃ­tulo: "Notificaciones"    [âœ“ Marcar todas]              â”‚
â”‚                                                            â”‚
â”‚ â”Œâ”€â”€ Filtros â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚
â”‚ â”‚ Tipo: [Select â–¼]   LeÃ­da: [Select â–¼]   Fecha: [...]â”‚   â”‚
â”‚ â”‚ [Aplicar] [Limpiar]                                 â”‚   â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚
â”‚                                                            â”‚
â”‚ â”Œâ”€â”€ Lista â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚
â”‚ â”‚ x 10 items por pÃ¡gina                                 â”‚   â”‚
â”‚ â”‚ â— ItemNotificacion (con padding, sin scroll)          â”‚   â”‚
â”‚ â”‚ ...                                                    â”‚   â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚
â”‚                                                            â”‚
â”‚ PaginaciÃ³n: [< Anterior]  1  2  3  ... 5  [Siguiente >]  â”‚
â”‚                                                            â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Comportamiento:**
- Filtros: tipo (select con todas las opciones), leÃ­da (Select: Todos / No leÃ­das / LeÃ­das), rango fechas (date inputs)
- PaginaciÃ³n shadcn con botones Anterior/Siguiente
- Click en item: redirige al caso + marca leÃ­da
- VacÃ­o: "No se encontraron notificaciones con esos filtros"

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

Agregar menÃº item:

```tsx
{
    key: 'notificaciones',
    label: 'Notificaciones',
    href: route('notificaciones.index'),
    routeName: 'notificaciones.*',
    icon: <Bell className="w-5 h-5 shrink-0" />,
    badge: noLeidas,  // contador de no leÃ­das
},
```

El badge se actualiza dinÃ¡micamente segÃºn la prop global `notificaciones.no_leidas`.

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

### 5.1 NotificaciÃ³n (sesiÃ³n)

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

Con el seed actual de 12 denuncias, se esperan **6-10 notificaciones generadas automÃ¡ticamente**:
- 1-2 traspasos recientes (< 7d)
- 1-2 ampliaciones recientes (< 7d)
- 1 plazo total por vencer (â‰¤ 3d)
- 1-2 solicitudes prÃ³ximas a vencer
- 1-2 descargos prÃ³ximos a vencer
- 1-2 cambios de estado recientes (admitida/rechazada)

Total estimado: **7-12 notificaciones** al cargar la pÃ¡gina por primera vez.

---

## 6. UI/UX

### 6.1 Campana (Header)

```
                          â•”â•â•â•—
                          â•‘ðŸ””â•‘  â† botÃ³n con hover bg-sidebar-muted
                          â•‘  â•‘
                          â•‘ 3â•‘  â† badge rojo con contador + animate-pulse
                          â•šâ•â•â•
```

### 6.2 Panel desplegado (425x560px)

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ Notificaciones          [Marcar]     â”‚ â† header fijo
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                      â”‚
â”‚ â— Caso traspasado                    â”‚ â† item no leÃ­do (fondo muted/30)
â”‚   DEN-2026-0007 fue asignado a...    â”‚    borde izquierdo primary
â”‚   hace 15 min                        â”‚
â”‚                                      â”‚
â”‚ â— Plazo total por vencer             â”‚
â”‚   DEN-2026-0004 Â· CorrupciÃ³n Â· 2d    â”‚
â”‚   hace 1h                            â”‚
â”‚                                      â”‚
â”‚ â”€â”€â”€â”€â”€ LeÃ­das â”€â”€â”€â”€â”€                   â”‚ â† separador
â”‚                                      â”‚
â”‚ â—‹ Solicitud ampliada                 â”‚ â† item leÃ­do (opacidad 60%)
â”‚   DEN-2026-0008                      â”‚    sin borde
â”‚   ayer a las 14:30                   â”‚
â”‚                                      â”‚
â”‚ â—‹ Denuncia admitida                  â”‚
â”‚   DEN-2026-0004 fue admitida         â”‚
â”‚   ayer a las 10:00                   â”‚
â”‚                                      â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ Ver todas las notificaciones â†’       â”‚ â† footer, solo si total > 5
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 6.3 PÃ¡gina completa

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ Notificaciones                               [Marcar todas]â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ [Tipo: Todos â–¼] [LeÃ­da: Todos â–¼] [Desde: 01/06] [Hasta: ] â”‚
â”‚ [Aplicar filtros] [Limpiar]                                â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                                            â”‚
â”‚ â— Caso traspasado                                          â”‚
â”‚   DEN-2026-0007 fue asignado a Carlos Mendoza              â”‚
â”‚   01/07/2026 10:30                                          â”‚
â”‚ â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€                     â”‚
â”‚ â— Plazo total por vencer                                    â”‚
â”‚   DEN-2026-0004 Â· 2 dÃ­a(s) restante(s)                     â”‚
â”‚   01/07/2026 09:15                                          â”‚
â”‚ â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€                     â”‚
â”‚ ... (mÃ¡s items)                                            â”‚
â”‚                                                            â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ [< Anterior]  1  2  3  ...  5  [Siguiente >]              â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 6.4 Timestamp relativo

| Diferencia | Display |
|------------|---------|
| < 1 min | "Ahora" |
| < 60 min | "hace X min" |
| < 24 h | "hace X h" |
| < 7 d | "hace X dÃ­a(s)" |
| â‰¥ 7 d | "dd/mm/aaaa hh:mm" |

---

## 7. shadcn a instalar

```bash
npx shadcn@2.3.0 add popover scroll-area separator
```

- `popover` â€” posicionar el panel dropdown
- `scroll-area` â€” scroll interno del panel (ya existe, verificar)
- `separator` â€” lÃ­nea de separaciÃ³n visual (ya existe? sino, instalarlo)

**Componentes ya existentes:** `badge`, `button`, `card`, `dialog`, `select`, `input`, `label`

---

## 8. Pruebas manuales sugeridas

| # | Caso | Pasos | Resultado esperado |
|---|------|-------|---------------------|
| 1 | Badge muestra contador | Login â†’ ver Header | Badge con nÃºmero de no leÃ­das (> 0 con seed) |
| 2 | Pulse animation | Recargar pÃ¡gina con notificaciones | Badge rojo tiene `animate-pulse` (sin sonido) |
| 3 | Abrir panel | Click en campana | Panel se despliega con items scrolleables |
| 4 | Separar leÃ­das/no leÃ­das | Tener ambas â†’ abrir panel | LeÃ­das abajo con separador, opacas |
| 5 | Marcar individual | Click en item no leÃ­do | Navega al caso. Al volver, item ya no aparece en no leÃ­das |
| 6 | Marcar todas | Click "Marcar todas" en panel | Badge se vuelve 0. Todos los items aparecen como leÃ­dos |
| 7 | PÃ¡gina completa | Sidebar â†’ Notificaciones | PÃ¡gina con filtros + paginaciÃ³n |
| 8 | Filtro por tipo | Seleccionar "Traspaso" â†’ "Aplicar" | Solo muestra traspasos |
| 9 | Filtro por leÃ­da | Seleccionar "No leÃ­das" | Solo no leÃ­das |
| 10 | PaginaciÃ³n | Tener > 10 notificaciones â†’ navegar pÃ¡ginas | FunciÃ³n Anterior/Siguiente |
| 11 | Empty state sin notificaciones | Marcar todas + recargar | Badge oculto (0). Panel muestra "No hay notificaciones" |
| 12 | Endpoint count | GET /api/notificaciones/count | JSON `{"no_leidas": N}` |
| 13 | Navegar desde notificaciÃ³n | Click en item â†’ destino correcto | Redirige al caso o pÃ¡gina correspondiente |
| 14 | Confirmar timestamps relativos | NotificaciÃ³n de hace 2 min â†’ panel | "hace 2 min" |

---

## 9. Notas tÃ©cnicas

- **Compatibilidad con Sprint 7 (EvaluaciÃ³n):** Las delegaciones y devoluciones de evaluaciÃ³n NO se incluyen como tipos porque no hay `EvaluacionData.php` aÃºn. Se aÃ±adirÃ¡n cuando Sprint 7 se implemente (o se agrega el tipo ahora para que funcione sin data? DecisiÃ³n: **no incluir**, dejar el tipo reservado.)
- **Compatibilidad con Sprint 10+:** Cuando se implemente la BD real, `NotificacionData` se migrarÃ¡ a tabla `notificaciones` con Eloquent. El mÃ©todo `generarParaUsuario()` se reemplaza por Eloquent observers + scheduled jobs.
- **Compatibilidad con Sprint 16 (Roles):** Las notificaciones se filtrarÃ¡n por `user_id` real. Se aÃ±adirÃ¡ columna `user_id` en la tabla.
- **Compatibilidad con Sprint 18 (DÃ­as hÃ¡biles):** Si cambia el cÃ¡lculo de plazos, se actualiza `generarParaUsuario()` automÃ¡ticamente porque lee de `getPlazoInfo()`.
- **Validaciones backend:** `marcarLeida()` valida que `id` exista. `getPaginated()` filtra y pagina correctamente incluso si no hay notificaciones.
- **Sin polling en Fase 0:** El endpoint `/api/notificaciones/count` estÃ¡ listo. Para habilitar polling en Sprint 10: `setInterval(fetchCount, 30000)` en `CampanaNotificaciones.tsx`.
- **AnimaciÃ³n pulse:** CSS `@keyframes pulse` de Tailwind `animate-pulse` aplicado al badge del contador. Se dispara solo cuando `noLeidas` cambia (comparar con `useRef` del valor anterior).
- **Uso de `usePage().props`:** Las notificaciones se pasan como props globales desde `HandleInertiaRequests`, disponibles en cualquier pÃ¡gina sin prop drilling.

---

## 10. TODO / Pendientes

> âœ… **Completado (Agosto 2026):** Notificaciones en tiempo real vÃ­a Server-Sent Events (SSE) sin F5 ni recargas de pÃ¡gina. Ver SecciÃ³n 12.

> â¸ï¸ **Pendiente con Sprint 16:** Filtrar notificaciones por `user_id` real segÃºn roles formales en BD.

> â¸ï¸ **Pendiente con cliente:** Pregunta #6 (C1) â€” dÃ­as hÃ¡biles afecta cÃ¡lculo de plazos por vencer.

---

## 11. Referencias

- **DecisiÃ³n cliente:** `Preguntas para el cliente.md` #22
- **Documento de contexto:** `Sprints Pendientes - Contexto.md` secciÃ³n Sprint 9
- **Plan de ruta:** `Plan de Desarrollo.md` Sprint 9
- **PatrÃ³n de cÃ³digo:** `NotificacionController.php` y `NotificacionStreamController.php`
- **Iconos:** lucide-react (`Bell`, `Clock`, `CheckCircle`, `XCircle`, `ArrowRightLeft`, `CalendarPlus`, `AlertTriangle`, `FileText`, `MailQuestion`, `MessageSquareWarning`)
- **Colores:** `primary`, `warning`, `destructive`, `success`, `info` â€” variables OKLCH institucionales

---

## 12. Notificaciones en Tiempo Real â€” Server-Sent Events (SSE) âœ… IMPLEMENTADO (Agosto 2026)

### 12.1 JustificaciÃ³n TÃ©cnica
Para evitar que el usuario tenga que presionar F5 o refrescar la pÃ¡gina para enterarse de nuevas asignaciones o eventos, y descartando WebSockets por la sobrecarga de infraestructura (servidor Node/Soketi o Reverb), se implementÃ³ **SSE (Server-Sent Events)** con HTTP estÃ¡ndar.

- **Sin procesos externos:** Funciona nativamente sobre Apache + PHP en Laragon.
- **Carga mÃ­nima en BD:** Loop ligero de 15s con `COUNT(*)` indexado.
- **Auto-reconexiÃ³n:** `EventSource` nativo en el navegador se reconecta automÃ¡ticamente en caso de micro-cortes.

### 12.2 Arquitectura y Componentes Creados

```
[Frontend React: useNotificacionesSSE hook]
    â”‚  EventSource(route('notifications.stream'))
    â–¼
[Backend: NotificacionStreamController.php]
    â”‚  StreamedResponse (loop de 15s, mÃ¡x 90s por conexiÃ³n)
    â”‚  Query: COUNT(*) notificaciones no leÃ­das para Auth::id()
    â”‚  Si cambia â†’ emite evento 'notificaciones' con JSON (Ãºltimas 5)
    â–¼
[Toasts Sonner: LÃ³gica UX Top-Center]
    â”œâ”€â”€ 1 notificaciÃ³n  â†’ Toast individual con tÃ­tulo, resumen y botÃ³n "Ver"
    â”œâ”€â”€ 2-3 notifs      â†’ Toasts secuenciales (delay de 900ms)
    â”œâ”€â”€ 4-5 notifs      â†’ 2 primeras + toast resumen "...y X mÃ¡s"
    â””â”€â”€ 6+ notifs       â†’ Toast Ãºnico: "Tienes X notificaciones sin leer"
```

### 12.3 Archivos Involucrados
- **`app/Http/Controllers/NotificacionStreamController.php`**: Controller con `StreamedResponse`, `set_time_limit(0)`, `ignore_user_abort(false)` y headers `text/event-stream`.
- **`resources/js/hooks/useNotificacionesSSE.ts`**: Custom hook React que abre la conexiÃ³n SSE usando `route('notifications.stream')` de Ziggy y gestiona las alertas visuales.
- **`resources/js/Components/Layout/AppLayout.tsx`**: Inicializa el hook SSE cuando el usuario estÃ¡ autenticado y renderiza `<Toaster position="top-center" />`.
- **`resources/js/Components/Layout/Header.tsx`**: Recibe las notificaciones reactivas SSE y actualiza la campana y el badge sin parpadeos.
- **`routes/web.php`**: Ruta `GET /notifications/stream` protegida con middleware `auth`.

---

*Documento actualizado: Agosto 2026.*


