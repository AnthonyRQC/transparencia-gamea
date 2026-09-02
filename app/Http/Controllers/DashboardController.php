<?php

namespace App\Http\Controllers;

use App\Http\Requests\DashboardRequest;
use App\Models\User;
use App\Queries\Dashboard\KpiQuery;
use App\Queries\Dashboard\OperativoQuery;
use App\Queries\Dashboard\ResultadosQuery;
use App\Queries\Dashboard\RendimientoQuery;
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

    public function index(DashboardRequest $request)
    {
        $usuario = $request->user();
        $rol = $usuario->rol;
        $esJefe = $rol === 'jefe';
        $esTecnico = $rol === 'tecnico';
        $esRegistrador = $rol === 'registrador';

        $filtros = $request->filtros();

        // Regla de seguridad (server-side scoping): un técnico SIEMPRE ve solo sus casos.
        if ($esTecnico) {
            $filtros['tecnico_id'] = $usuario->id;
        } elseif ($esRegistrador) {
            $filtros['tecnico_id'] = null;
        }

        return Inertia::render('Dashboard', [
            'kpis' => KpiQuery::calcular($filtros),
            'operativo' => OperativoQuery::calcular($filtros),
            'resultados' => ResultadosQuery::calcular($filtros),
            'rendimiento' => RendimientoQuery::calcular($filtros, $esJefe, $usuario->id),
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
