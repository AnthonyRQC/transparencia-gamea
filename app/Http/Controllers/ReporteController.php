<?php

namespace App\Http\Controllers;

use App\Exports\ReporteExcel;
use App\Models\CategoriaDenuncia;
use App\Models\Clasificacion;
use App\Models\Denuncia;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class ReporteController extends Controller
{
    private const ESTADOS = [
        'ingresada' => 'INGRESADA',
        'evaluacion_tecnica' => 'EVALUACIÓN TÉCNICA',
        'admitida' => 'ADMITIDA',
        'rechazada' => 'RECHAZADA',
        'asignada' => 'ASIGNADA',
        'investigacion' => 'INVESTIGACIÓN',
        'informe' => 'INFORME',
        'cerrada' => 'CERRADA',
        'archivada' => 'CERRADA · ARCHIVADA',
    ];

    private function autorizarJefe(): void
    {
        abort_unless(auth()->user()->rol === 'jefe', 403, 'NO AUTORIZADO.');
    }

    public function index(Request $request)
    {
        $this->autorizarJefe();

        $denuncias = $this->queryBase($request)->paginate(20)->withQueryString();

        return Inertia::render('Reportes/Index', [
            'denuncias' => $denuncias,
            'opciones' => $this->opciones(),
            'filtros' => $this->filtrosEntrada($request),
        ]);
    }

    public function preview(Request $request)
    {
        $this->autorizarJefe();

        $total = $this->queryBase($request)->count();
        $rows = $this->queryBase($request)->take(10)->get();

        return response()->json([
            'total' => $total,
            'rows' => $rows->map(fn ($d) => [
                'ticket' => $d->ticket,
                'tipo' => $d->tipo,
                'categoria' => $d->categoria?->nombre ?? '',
                'tecnico' => $d->tecnico?->name ?? '',
                'estado' => self::ESTADOS[$d->estado] ?? strtoupper($d->estado),
                'created_at' => $d->created_at?->format('d/m/Y'),
            ]),
        ]);
    }

    public function exportar(Request $request)
    {
        $this->autorizarJefe();

        $formato = $request->input('formato', 'excel');
        $rows = $this->queryBase($request)->get();
        $fecha = now()->format('Y-m-d');

        if ($formato === 'pdf') {
            $pdf = Pdf::loadView('reportes.pdf', [
                'denuncias' => $rows,
                'filtros' => $this->filtrosEntrada($request),
                'resumen' => $this->resumen($rows),
                'generado' => now()->format('d/m/Y H:i'),
            ]);

            return $pdf->download("reporte-denuncias-{$fecha}.pdf");
        }

        return Excel::download(new ReporteExcel($rows), "reporte-denuncias-{$fecha}.xlsx");
    }

    /**
     * Misma query base para pantalla, preview y exportación (Sprint 12 §9.3).
     * El rango de fechas usa `created_at` (fecha de ingreso del caso).
     */
    private function queryBase(Request $request)
    {
        return Denuncia::with(['tecnico', 'categoria', 'ampliaciones'])
            ->whereNull('deleted_at')
            ->when($request->input('desde'), fn ($q, $v) => $q->whereDate('created_at', '>=', $v))
            ->when($request->input('hasta'), fn ($q, $v) => $q->whereDate('created_at', '<=', $v))
            ->when($request->input('tipo'), fn ($q, $v) => $q->where('tipo', $v))
            ->when($request->input('estado'), fn ($q, $v) => $this->aplicarEstado($q, $v))
            ->when($request->input('tecnico_id'), fn ($q, $v) => $q->where('tecnico_id', (int) $v))
            ->when($request->input('categoria_id'), fn ($q, $v) => $q->where('categoria_id', (int) $v))
            ->when($request->input('clasificacion_id'), function ($q) use ($request) {
                $q->whereExists(function ($sub) use ($request) {
                    $sub->selectRaw('1')->from('informes_finales')
                        ->whereColumn('informes_finales.denuncia_id', 'denuncias.id')
                        ->where('informes_finales.eliminado', false)
                        ->where('informes_finales.clasificacion_id', (int) $request->input('clasificacion_id'));
                });
            })
            ->when($request->input('busqueda'), function ($q) use ($request) {
                $v = $request->input('busqueda');
                $q->where(fn ($w) => $w->where('ticket', 'like', "%{$v}%")
                    ->orWhere('hechos', 'like', "%{$v}%"));
            })
            ->orderByDesc('created_at');
    }

    private function aplicarEstado($q, string $estado)
    {
        if ($estado === 'archivada') {
            return $q->where('estado', 'cerrada')->where('subestado', 'archivada');
        }

        if ($estado === 'cerrada') {
            return $q->where('estado', 'cerrada')->whereNull('subestado');
        }

        return $q->where('estado', $estado);
    }

    private function opciones(): array
    {
        return [
            'tecnicos' => User::where('rol', 'tecnico')
                ->where('activo', true)
                ->orderBy('name')
                ->get(['id', 'name']),
            'categorias' => CategoriaDenuncia::where('activa', true)->orderBy('nombre')->get(['id', 'nombre']),
            'clasificaciones' => Clasificacion::where('activa', true)->orderBy('nombre')->get(['id', 'nombre']),
            'estados' => self::ESTADOS,
        ];
    }

    private function filtrosEntrada(Request $request): array
    {
        return [
            'desde' => $request->input('desde') ?: null,
            'hasta' => $request->input('hasta') ?: null,
            'tipo' => $request->input('tipo') ?: null,
            'estado' => $request->input('estado') ?: null,
            'tecnico_id' => $request->input('tecnico_id') ? (int) $request->input('tecnico_id') : null,
            'categoria_id' => $request->input('categoria_id') ? (int) $request->input('categoria_id') : null,
            'clasificacion_id' => $request->input('clasificacion_id') ? (int) $request->input('clasificacion_id') : null,
            'busqueda' => $request->input('busqueda') ?: null,
        ];
    }

    private function resumen($rows): array
    {
        $total = $rows->count();
        $activas = $rows->whereNotIn('estado', ['rechazada', 'cerrada'])->count();
        $cerradas = $rows->where('estado', 'cerrada')->count();
        $rechazadas = $rows->where('estado', 'rechazada')->count();
        $corrupcion = $rows->where('tipo', 'corrupcion')->count();

        return [
            'total' => $total,
            'activas' => $activas,
            'cerradas' => $cerradas,
            'rechazadas' => $rechazadas,
            'corrupcion' => $corrupcion,
            'negacion' => $total - $corrupcion,
        ];
    }
}
