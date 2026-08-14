<?php

namespace App\Http\Controllers;

use App\Helpers\RollUpDependencias;
use App\Models\Denuncia;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    private const ESTADOS_TERMINALES = ['rechazada', 'cerrada'];

    private const ORDEN_EMBUDO = [
        'ingresada', 'evaluacion_tecnica', 'admitida', 'asignada',
        'investigacion', 'informe', 'rechazada', 'cerrada', 'cerrada_archivada',
    ];

    private const ETIQUETAS_ESTADO = [
        'ingresada' => 'INGRESADA',
        'evaluacion_tecnica' => 'EVALUACIÓN TÉCNICA',
        'admitida' => 'ADMITIDA',
        'asignada' => 'ASIGNADA',
        'investigacion' => 'INVESTIGACIÓN',
        'informe' => 'INFORME',
        'rechazada' => 'RECHAZADA',
        'cerrada' => 'CERRADA',
        'cerrada_archivada' => 'CERRADA · ARCHIVADA',
    ];

    public function index(Request $request)
    {
        $usuario = auth()->user();
        $rol = $usuario->rol;
        $esJefe = $rol === 'jefe';
        $esTecnico = $rol === 'tecnico';
        $esRegistrador = $rol === 'registrador';

        $filtros = $this->filtros($request);

        // Regla de seguridad (server-side scoping): un técnico SIEMPRE ve solo sus casos.
        if ($esTecnico) {
            $filtros['tecnico_id'] = $usuario->id;
        } elseif ($esRegistrador) {
            $filtros['tecnico_id'] = null;
        }

        return Inertia::render('Dashboard', [
            'kpis' => $this->kpis($filtros),
            'operativo' => $this->operativo($filtros),
            'resultados' => $this->resultados($filtros),
            'rendimiento' => $this->rendimiento($filtros, $esJefe, $usuario->id),
            'base_temporal' => $this->baseTemporal(),
            'opciones' => [
                'tecnicos' => $esJefe
                    ? User::where('rol', 'tecnico')
                        ->when(!$filtros['incluir_inactivos'], fn ($q) => $q->where('activo', true))
                        ->orderBy('name')
                        ->get(['id', 'name', 'activo'])
                        ->toArray()
                    : [],
                'categorias' => \App\Models\CategoriaDenuncia::where('activa', true)->orderBy('nombre')->get(['id', 'nombre'])->toArray(),
                'clasificaciones' => \App\Models\Clasificacion::where('activa', true)->orderBy('nombre')->get(['id', 'nombre'])->toArray(),
                'estados' => $this->estadosOpciones(),
            ],
            'esJefe' => $esJefe,
            'esTecnico' => $esTecnico,
            'esRegistrador' => $esRegistrador,
            'filtros' => $filtros,
        ]);
    }

    // ============================================================
    // FILTROS
    // ============================================================

    private function filtros(Request $request): array
    {
        return [
            'desde' => $request->input('desde') ?: null,
            'hasta' => $request->input('hasta') ?: null,
            'tecnico_id' => $request->input('tecnico_id') ? (int) $request->input('tecnico_id') : null,
            'tipo' => $request->input('tipo') ?: null,
            'categoria_id' => $request->input('categoria_id') ? (int) $request->input('categoria_id') : null,
            'clasificacion_id' => $request->input('clasificacion_id') ? (int) $request->input('clasificacion_id') : null,
            'estado' => $request->input('estado') ?: null,
            'incluir_inactivos' => $request->boolean('incluir_inactivos'),
            'tab' => $request->input('tab', 'operativo'),
        ];
    }

    /**
     * Query base de denuncias con los filtros de entidad (técnico, tipo, categoría,
     * clasificación, estado). NO aplica fechas (cada elemento usa su campo natural).
     */
    private function queryDenuncias(array $f, bool $conEstado = true): Builder
    {
        return Denuncia::query()
            ->whereNull('deleted_at')
            ->when($f['tecnico_id'], fn ($q, $v) => $q->where('tecnico_id', $v))
            ->when($f['tipo'], fn ($q, $v) => $q->where('tipo', $v))
            ->when($f['categoria_id'], fn ($q, $v) => $q->where('categoria_id', $v))
            ->when($conEstado && $f['estado'], function ($q) use ($f) {
                if ($f['estado'] === 'archivada') {
                    $q->where('estado', 'cerrada')->where('subestado', 'archivada');
                } elseif ($f['estado'] === 'cerrada') {
                    $q->where('estado', 'cerrada')->whereNull('subestado');
                } else {
                    $q->where('estado', $f['estado']);
                }
            })
            ->when($f['clasificacion_id'], function ($q) use ($f) {
                $q->whereExists(function ($sub) use ($f) {
                    $sub->selectRaw('1')->from('informes_finales')
                        ->whereColumn('informes_finales.denuncia_id', 'denuncias.id')
                        ->where('informes_finales.eliminado', false)
                        ->where('informes_finales.clasificacion_id', $f['clasificacion_id']);
                });
            });
    }

    // ============================================================
    // KPIs (8 tarjetas)
    // ============================================================

    private function kpis(array $f): array
    {
        // --- Zona 📌 ESTADO ACTUAL (sin fechas, sin filtro de estado) ---
        $estadoQuery = $this->queryDenuncias($f, false);

        $activos = (clone $estadoQuery)->whereNotIn('estado', self::ESTADOS_TERMINALES)->count();
        $pendientesAdmision = (clone $estadoQuery)->whereIn('estado', ['ingresada', 'evaluacion_tecnica'])->count();
        $sinAsignar = (clone $estadoQuery)->where('estado', 'admitida')->whereNull('tecnico_id')->count();

        $activasColeccion = (clone $estadoQuery)
            ->whereNotIn('estado', self::ESTADOS_TERMINALES)
            ->with('ampliaciones')
            ->get();

        $proximosAVencer = $activasColeccion
            ->filter(fn ($d) => ($d->plazo['dias_restantes'] ?? 99) >= 0 && ($d->plazo['dias_restantes'] ?? 99) <= 5)
            ->count();

        $vencidos = $activasColeccion
            ->filter(fn ($d) => ($d->plazo['dias_restantes'] ?? 99) < 0)
            ->count();

        // --- KPI 5: % Cumplimiento (cierres.cerrado_at en rango) ---
        $cerradas = Denuncia::where('estado', 'cerrada')->whereNull('deleted_at')
            ->when($f['tecnico_id'], fn ($q, $v) => $q->where('tecnico_id', $v))
            ->when($f['tipo'], fn ($q, $v) => $q->where('tipo', $v))
            ->when($f['categoria_id'], fn ($q, $v) => $q->where('categoria_id', $v))
            ->when($f['clasificacion_id'], function ($q) use ($f) {
                $q->whereExists(function ($sub) use ($f) {
                    $sub->selectRaw('1')->from('informes_finales')
                        ->whereColumn('informes_finales.denuncia_id', 'denuncias.id')
                        ->where('informes_finales.eliminado', false)
                        ->where('informes_finales.clasificacion_id', $f['clasificacion_id']);
                });
            })
            ->when($f['desde'], fn ($q) => $q->whereHas('cierre', fn ($c) => $c->where('eliminado', false)->whereDate('cerrado_at', '>=', $f['desde'])))
            ->when($f['hasta'], fn ($q) => $q->whereHas('cierre', fn ($c) => $c->where('eliminado', false)->whereDate('cerrado_at', '<=', $f['hasta'])))
            ->with(['ampliaciones', 'cierre'])
            ->get();

        $cumplidas = $cerradas->filter(function ($d) {
            $cierre = $d->cierre;
            if (! $cierre || $cierre->eliminado) {
                return false;
            }

            return $cierre->cerrado_at->lte($d->calcularVencimiento());
        })->count();

        $cumplimiento = $cerradas->count() > 0 ? round($cumplidas / $cerradas->count() * 100, 1) : 0;

        // --- KPI 6: Rechazadas del período (fecha_rechazada en rango) ---
        $rechazadas = Denuncia::whereNull('deleted_at')
            ->where('estado', 'rechazada')
            ->when($f['tipo'], fn ($q, $v) => $q->where('tipo', $v))
            ->when($f['categoria_id'], fn ($q, $v) => $q->where('categoria_id', $v))
            ->when($f['desde'], fn ($q) => $q->whereDate('fecha_rechazada', '>=', $f['desde']))
            ->when($f['hasta'], fn ($q) => $q->whereDate('fecha_rechazada', '<=', $f['hasta']))
            ->count();

        // --- KPI 8: Split tipo (intake del período por created_at) ---
        $splitBase = (clone $estadoQuery)
            ->when($f['desde'], fn ($q, $v) => $q->whereDate('created_at', '>=', $v))
            ->when($f['hasta'], fn ($q, $v) => $q->whereDate('created_at', '<=', $v));

        $corrupcion = (clone $splitBase)->where('tipo', 'corrupcion')->count();
        $negacion = (clone $splitBase)->where('tipo', 'negacion')->count();

        return [
            'activos' => $activos,
            'pendientesAdmision' => $pendientesAdmision,
            'proximosAVencer' => $proximosAVencer,
            'vencidos' => $vencidos,
            'cumplimiento' => $cumplimiento,
            'rechazadas' => $rechazadas,
            'sinAsignar' => $sinAsignar,
            'split' => ['corrupcion' => $corrupcion, 'negacion' => $negacion],
        ];
    }

    // ============================================================
    // Tab Operativo: Embudo (estado actual) + Evolución (período)
    // ============================================================

    private function operativo(array $f): array
    {
        $embudoRows = $this->queryDenuncias($f)
            ->selectRaw('estado, subestado, COUNT(*) as total')
            ->groupBy('estado', 'subestado')
            ->get();

        $porEstado = [];
        foreach ($embudoRows as $r) {
            $clave = $r->estado;
            if ($r->estado === 'cerrada' && $r->subestado === 'archivada') {
                $clave = 'cerrada_archivada';
            }
            $porEstado[$clave] = ($porEstado[$clave] ?? 0) + (int) $r->total;
        }

        $embudo = [];
        foreach (self::ORDEN_EMBUDO as $estado) {
            if (! isset($porEstado[$estado])) {
                $porEstado[$estado] = 0;
            }
            $embudo[] = [
                'estado' => $estado,
                'label' => self::ETIQUETAS_ESTADO[$estado],
                'total' => $porEstado[$estado],
                'esTerminal' => in_array($estado, ['rechazada', 'cerrada', 'cerrada_archivada'], true),
            ];
        }

        return [
            'embudo' => $embudo,
            'evolucion' => $this->evolucion($f),
            'granularidad' => $this->granularidad($f),
        ];
    }

    private function evolucion(array $f): array
    {
        $desde = $f['desde'] ? Carbon::parse($f['desde'])->startOfDay() : Carbon::now()->subMonth()->startOfDay();
        $hasta = $f['hasta'] ? Carbon::parse($f['hasta'])->endOfDay() : Carbon::now()->endOfDay();

        if ($desde->gt($hasta)) {
            [$desde, $hasta] = [$hasta, $desde];
        }

        $dias = $desde->diffInDays($hasta) + 1;
        $granularidad = $dias <= 14 ? 'day' : ($dias <= 90 ? 'week' : 'month');

        $periodos = $this->construirPeriodos($desde, $hasta, $granularidad);

        // Clave de período por fecha (compatible MySQL/SQLite — agrupación en PHP)
        $clavePorFecha = function (string $fecha) use ($granularidad): string {
            if ($granularidad === 'day') {
                return $fecha;
            }
            if ($granularidad === 'week') {
                $d = Carbon::parse($fecha);

                return sprintf('%04d-W%02d', $d->isoWeekYear, $d->isoWeek);
            }

            return substr($fecha, 0, 7);
        };

        // Línea Ingresadas (created_at)
        $ingresadas = $this->queryDenuncias($f)
            ->whereDate('created_at', '>=', $desde->toDateString())
            ->whereDate('created_at', '<=', $hasta->toDateString())
            ->selectRaw('DATE(created_at) as fecha, COUNT(*) as total')
            ->groupBy('fecha')
            ->get()
            ->mapWithKeys(fn ($r) => [$clavePorFecha($r->fecha) => (int) $r->total]);

        // Línea Cerradas (cierres.cerrado_at)
        $cerradas = DB::table('cierres')
            ->join('denuncias', 'cierres.denuncia_id', '=', 'denuncias.id')
            ->whereNull('denuncias.deleted_at')
            ->where('cierres.eliminado', false)
            ->whereDate('cierres.cerrado_at', '>=', $desde->toDateString())
            ->whereDate('cierres.cerrado_at', '<=', $hasta->toDateString())
            ->when($f['tecnico_id'], fn ($q, $v) => $q->where('denuncias.tecnico_id', $v))
            ->when($f['tipo'], fn ($q, $v) => $q->where('denuncias.tipo', $v))
            ->when($f['categoria_id'], fn ($q, $v) => $q->where('denuncias.categoria_id', $v))
            ->when($f['estado'], fn ($q) => $q->where('denuncias.estado', $f['estado']))
            ->selectRaw('DATE(cierres.cerrado_at) as fecha, COUNT(*) as total')
            ->groupBy('fecha')
            ->get()
            ->mapWithKeys(fn ($r) => [$clavePorFecha($r->fecha) => (int) $r->total]);

        // Línea Rechazadas (denuncias.fecha_rechazada)
        $rechazadas = Denuncia::whereNull('deleted_at')
            ->where('estado', 'rechazada')
            ->whereNotNull('fecha_rechazada')
            ->whereDate('fecha_rechazada', '>=', $desde->toDateString())
            ->whereDate('fecha_rechazada', '<=', $hasta->toDateString())
            ->when($f['tipo'], fn ($q, $v) => $q->where('tipo', $v))
            ->when($f['categoria_id'], fn ($q, $v) => $q->where('categoria_id', $v))
            ->selectRaw('DATE(fecha_rechazada) as fecha, COUNT(*) as total')
            ->groupBy('fecha')
            ->get()
            ->mapWithKeys(fn ($r) => [$clavePorFecha($r->fecha) => (int) $r->total]);

        return array_map(fn ($p) => [
            'periodo' => $p['periodo'],
            'ingresadas' => $ingresadas[$p['clave']] ?? 0,
            'cerradas' => $cerradas[$p['clave']] ?? 0,
            'rechazadas' => $rechazadas[$p['clave']] ?? 0,
        ], array_values($periodos));
    }

    private function construirPeriodos(Carbon $desde, Carbon $hasta, string $granularidad): array
    {
        $periodos = [];

        if ($granularidad === 'day') {
            $d = $desde->copy();
            while ($d->lte($hasta)) {
                $clave = $d->format('Y-m-d');
                $periodos[] = ['clave' => $clave, 'periodo' => $d->format('d/m')];
                $d->addDay();
            }

            return $periodos;
        }

        if ($granularidad === 'week') {
            $d = $desde->copy()->startOfWeek();
            while ($d->lte($hasta)) {
                $clave = sprintf('%04d-W%02d', $d->isoWeekYear, $d->isoWeek);
                $periodos[] = ['clave' => $clave, 'periodo' => 'Sem ' . $d->format('d/m')];
                $d->addWeek();
            }

            return $periodos;
        }

        $d = $desde->copy()->startOfMonth();
        while ($d->lte($hasta)) {
            $clave = $d->format('Y-m');
            $periodos[] = ['clave' => $clave, 'periodo' => $d->isoFormat('MMM YYYY')];
            $d->addMonth();
        }

        return $periodos;
    }

    private function granularidad(array $f): string
    {
        $desde = $f['desde'] ? Carbon::parse($f['desde']) : Carbon::now()->subMonth();
        $hasta = $f['hasta'] ? Carbon::parse($f['hasta']) : Carbon::now();
        $dias = $desde->diffInDays($hasta) + 1;

        return $dias <= 14 ? 'day' : ($dias <= 90 ? 'week' : 'month');
    }

    // ============================================================
    // Tab Resultados: Clasificaciones + Medios + Dependencias
    // ============================================================

    private function resultados(array $f): array
    {
        // Casos por clasificación final (redactado_at)
        $clasificaciones = DB::table('informes_finales')
            ->join('clasificaciones', 'informes_finales.clasificacion_id', '=', 'clasificaciones.id')
            ->join('denuncias', 'informes_finales.denuncia_id', '=', 'denuncias.id')
            ->where('informes_finales.eliminado', false)
            ->whereNull('denuncias.deleted_at')
            ->when($f['desde'], fn ($q) => $q->whereDate('informes_finales.redactado_at', '>=', $f['desde']))
            ->when($f['hasta'], fn ($q) => $q->whereDate('informes_finales.redactado_at', '<=', $f['hasta']))
            ->when($f['tecnico_id'], fn ($q, $v) => $q->where('denuncias.tecnico_id', $v))
            ->when($f['tipo'], fn ($q, $v) => $q->where('denuncias.tipo', $v))
            ->when($f['categoria_id'], fn ($q, $v) => $q->where('denuncias.categoria_id', $v))
            ->when($f['clasificacion_id'], fn ($q, $v) => $q->where('informes_finales.clasificacion_id', $v))
            ->selectRaw('clasificaciones.nombre as label, COUNT(*) as value')
            ->groupBy('clasificaciones.id', 'clasificaciones.nombre')
            ->orderByDesc('value')
            ->get()
            ->map(fn ($r) => ['label' => $r->label, 'value' => (int) $r->value])
            ->toArray();

        // Cierres por medio de notificación (cerrado_at)
        $medios = DB::table('cierres')
            ->join('medios_notificacion', 'cierres.notificacion_medio_id', '=', 'medios_notificacion.id')
            ->join('denuncias', 'cierres.denuncia_id', '=', 'denuncias.id')
            ->where('cierres.eliminado', false)
            ->whereNull('denuncias.deleted_at')
            ->when($f['desde'], fn ($q) => $q->whereDate('cierres.cerrado_at', '>=', $f['desde']))
            ->when($f['hasta'], fn ($q) => $q->whereDate('cierres.cerrado_at', '<=', $f['hasta']))
            ->when($f['tecnico_id'], fn ($q, $v) => $q->where('denuncias.tecnico_id', $v))
            ->when($f['tipo'], fn ($q, $v) => $q->where('denuncias.tipo', $v))
            ->when($f['categoria_id'], fn ($q, $v) => $q->where('denuncias.categoria_id', $v))
            ->selectRaw('medios_notificacion.nombre as label, COUNT(*) as value')
            ->groupBy('medios_notificacion.id', 'medios_notificacion.nombre')
            ->orderByDesc('value')
            ->get()
            ->map(fn ($r) => ['label' => $r->label, 'value' => (int) $r->value])
            ->toArray();

        // Top dependencias GAMEA con roll-up (fecha_envio), sin raíz
        $cuentas = DB::table('solicitudes_informacion')
            ->join('denuncias', 'solicitudes_informacion.denuncia_id', '=', 'denuncias.id')
            ->whereNull('denuncias.deleted_at')
            ->where('solicitudes_informacion.eliminado', false)
            ->when($f['desde'], fn ($q) => $q->whereDate('solicitudes_informacion.fecha_envio', '>=', $f['desde']))
            ->when($f['hasta'], fn ($q) => $q->whereDate('solicitudes_informacion.fecha_envio', '<=', $f['hasta']))
            ->when($f['tecnico_id'], fn ($q, $v) => $q->where('denuncias.tecnico_id', $v))
            ->when($f['categoria_id'], fn ($q, $v) => $q->where('denuncias.categoria_id', $v))
            ->selectRaw('solicitudes_informacion.dependencia_destino_id as dep_id, COUNT(*) as total')
            ->groupBy('dep_id')
            ->pluck('total', 'dep_id')
            ->map(fn ($v) => (int) $v)
            ->toArray();

        $dependencias = array_map(fn ($d) => [
            'label' => $d['nombre'],
            'value' => $d['total'],
        ], RollUpDependencias::top($cuentas, 8));

        return [
            'clasificaciones' => $clasificaciones,
            'medios' => $medios,
            'dependencias' => $dependencias,
        ];
    }

    // ============================================================
    // Tab Rendimiento: Carga (Jefe) / Productividad (Técnico) + Urgentes
    // ============================================================

    private function rendimiento(array $f, bool $esJefe, int $userId): array
    {
        $urgentes = $esJefe
            ? $this->casosUrgentes($f, $f['tecnico_id'])
            : $this->casosUrgentes($f, $userId);

        if ($esJefe) {
            $tecnicos = User::where('rol', 'tecnico')
                ->when(! $f['incluir_inactivos'], fn ($q) => $q->where('activo', true))
                ->orderBy('name')
                ->get(['id', 'name', 'activo']);

            $activas = Denuncia::whereNull('deleted_at')
                ->whereNotIn('estado', self::ESTADOS_TERMINALES)
                ->whereNotNull('tecnico_id')
                ->when($f['tipo'], fn ($q, $v) => $q->where('tipo', $v))
                ->when($f['categoria_id'], fn ($q, $v) => $q->where('categoria_id', $v))
                ->with('ampliaciones')
                ->get();

            $carga = $tecnicos->map(function ($t) use ($activas) {
                $casos = $activas->where('tecnico_id', $t->id);

                return [
                    'tecnico' => $t->name,
                    'enPlazo' => $casos->filter(fn ($d) => ($d->plazo['dias_restantes'] ?? 99) > 5)->count(),
                    'proximos' => $casos->filter(fn ($d) => ($d->plazo['dias_restantes'] ?? 99) >= 0 && ($d->plazo['dias_restantes'] ?? 99) <= 5)->count(),
                    'vencidos' => $casos->filter(fn ($d) => ($d->plazo['dias_restantes'] ?? 99) < 0)->count(),
                ];
            })
                ->filter(fn ($c) => ($c['enPlazo'] + $c['proximos'] + $c['vencidos']) > 0)
                ->values();

            return [
                'modo' => 'jefe',
                'cargaTecnicos' => $carga,
                'urgentes' => $urgentes,
            ];
        }

        return [
            'modo' => 'tecnico',
            'productividad' => $this->productividad($f, $userId),
            'urgentes' => $urgentes,
        ];
    }

    private function casosUrgentes(array $f, ?int $tecnicoId): array
    {
        $activas = Denuncia::whereNull('deleted_at')
            ->whereNotIn('estado', self::ESTADOS_TERMINALES)
            ->when($tecnicoId, fn ($q, $v) => $q->where('tecnico_id', $v))
            ->when($f['tipo'], fn ($q, $v) => $q->where('tipo', $v))
            ->when($f['categoria_id'], fn ($q, $v) => $q->where('categoria_id', $v))
            ->when($f['clasificacion_id'], function ($q) use ($f) {
                $q->whereExists(function ($sub) use ($f) {
                    $sub->selectRaw('1')->from('informes_finales')
                        ->whereColumn('informes_finales.denuncia_id', 'denuncias.id')
                        ->where('informes_finales.eliminado', false)
                        ->where('informes_finales.clasificacion_id', $f['clasificacion_id']);
                });
            })
            ->with(['tecnico', 'ampliaciones'])
            ->get();

        return $activas
            ->map(fn ($d) => [
                'ticket' => $d->ticket,
                'tecnico' => $d->tecnico?->name ?? 'SIN ASIGNAR',
                'diasRestantes' => $d->plazo['dias_restantes'] ?? 0,
                'color' => $d->plazo['color'] ?? 'gray',
                'estado' => $d->estado,
            ])
            ->sortBy('diasRestantes')
            ->take(10)
            ->values()
            ->toArray();
    }

    private function productividad(array $f, int $userId): array
    {
        $desde = $f['desde'] ? Carbon::parse($f['desde'])->startOfMonth() : Carbon::now()->subYear()->startOfMonth();
        $hasta = $f['hasta'] ? Carbon::parse($f['hasta'])->endOfMonth() : Carbon::now()->endOfMonth();

        $rows = DB::table('cierres')
            ->join('denuncias', 'cierres.denuncia_id', '=', 'denuncias.id')
            ->whereNull('denuncias.deleted_at')
            ->where('cierres.eliminado', false)
            ->where('denuncias.tecnico_id', $userId)
            ->whereDate('cierres.cerrado_at', '>=', $desde->toDateString())
            ->whereDate('cierres.cerrado_at', '<=', $hasta->toDateString())
            ->selectRaw('DATE(cierres.cerrado_at) as fecha, COUNT(*) as total')
            ->groupBy('fecha')
            ->orderBy('fecha')
            ->get()
            ->mapWithKeys(fn ($r) => [substr($r->fecha, 0, 7) => (int) $r->total]);

        $resultado = [];
        $d = $desde->copy()->startOfMonth();
        while ($d->lte($hasta)) {
            $clave = $d->format('Y-m');
            $resultado[] = ['mes' => $d->isoFormat('MMM YYYY'), 'cerrados' => (int) ($rows[$clave] ?? 0)];
            $d->addMonth();
        }

        return $resultado;
    }

    // ============================================================
    // Badges de base temporal (Zonas 📌/📅)
    // ============================================================

    private function estadosOpciones(): array
    {
        return [
            ['clave' => 'ingresada', 'nombre' => 'INGRESADA'],
            ['clave' => 'evaluacion_tecnica', 'nombre' => 'EVALUACIÓN TÉCNICA'],
            ['clave' => 'admitida', 'nombre' => 'ADMITIDA'],
            ['clave' => 'rechazada', 'nombre' => 'RECHAZADA'],
            ['clave' => 'asignada', 'nombre' => 'ASIGNADA'],
            ['clave' => 'investigacion', 'nombre' => 'INVESTIGACIÓN'],
            ['clave' => 'informe', 'nombre' => 'INFORME'],
            ['clave' => 'cerrada', 'nombre' => 'CERRADA'],
            ['clave' => 'archivada', 'nombre' => 'CERRADA · ARCHIVADA'],
        ];
    }

    private function baseTemporal(): array
    {
        return [
            'kpis.activos' => 'estado_actual',
            'kpis.pendientesAdmision' => 'estado_actual',
            'kpis.proximosAVencer' => 'estado_actual',
            'kpis.vencidos' => 'estado_actual',
            'kpis.sinAsignar' => 'estado_actual',
            'kpis.cumplimiento' => 'cerrado_at',
            'kpis.rechazadas' => 'fecha_rechazada',
            'kpis.split' => 'created_at',
            'operativo.embudo' => 'estado_actual',
            'operativo.evolucion' => 'created_at',
            'resultados.clasificaciones' => 'redactado_at',
            'resultados.medios' => 'cerrado_at',
            'resultados.dependencias' => 'fecha_envio',
            'rendimiento.urgentes' => 'estado_actual',
            'rendimiento.cargaTecnicos' => 'estado_actual',
            'rendimiento.productividad' => 'cerrado_at',
        ];
    }
}
