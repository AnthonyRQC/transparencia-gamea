<?php

namespace App\Http\Controllers;

use App\Exports\ExtractoExcel;
use App\Http\Requests\AuditoriaRequest;
use App\Models\Bitacora;
use App\Models\Denuncia;
use App\Models\User;
use App\Queries\Auditoria\AuditoriaIndexQuery;
use App\Services\BitacoraService;
use App\Services\ExtractoService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class AuditoriaController extends Controller
{
    /**
     * Panel técnico de auditoría para Administradores / TI.
     * Vista técnica sin contenido de expedientes (Ley 974 Arts. 24/29).
     */
    public function index(AuditoriaRequest $request)
    {
        $filtros = $request->validated();

        $paginador = AuditoriaIndexQuery::paginar($filtros);

        $paginador->through(fn (Bitacora $evento) => [
            'id' => $evento->id,
            'fecha' => $evento->fecha ? $evento->fecha->format('d/m/Y H:i') : '—',
            'actor' => $evento->usuario?->name ?? 'SISTEMA',
            'accion' => $evento->accion,
            'accion_label' => ExtractoService::etiquetaAccion($evento->accion),
            'ticket' => $evento->denuncia?->ticket,
            'user_agent' => $evento->user_agent,
        ]);

        // Se registra huella solo en navegación y filtros, no en paginación pura
        if (! $request->has('page')) {
            BitacoraService::registrarAuditoria('auditoria_panel', [
                'filtros' => array_filter($filtros),
            ]);
        }

        $usuarios = User::orderBy('name')->get(['id', 'name']);

        $acciones = Bitacora::distinct()
            ->pluck('accion')
            ->filter()
            ->sort()
            ->values()
            ->map(fn ($acc) => [
                'value' => $acc,
                'label' => ExtractoService::etiquetaAccion($acc),
            ])
            ->all();

        return Inertia::render('Admin/Auditoria', [
            'eventos' => $paginador,
            'filtros' => $filtros,
            'usuarios' => $usuarios,
            'acciones' => $acciones,
        ]);
    }

    public function extractoTecnico(string $ticket, Request $request)
    {
        $request->validate([
            'formato' => ['nullable', 'in:pdf,xlsx'],
        ]);

        $formato = $request->input('formato', 'pdf');
        $denuncia = Denuncia::withTrashed()->where('ticket', $ticket)->firstOrFail();

        $datos = ExtractoService::tecnicas($denuncia);

        BitacoraService::registrarAuditoria('auditoria_extracto', [
            'ticket' => $ticket,
            'proyeccion' => 'tecnica',
            'formato' => $formato,
        ]);

        $fecha = now()->format('Y-m-d');

        if ($formato === 'xlsx') {
            return Excel::download(
                new ExtractoExcel($datos['headings'], $datos['filas'], $datos['anchos']),
                "extracto-tecnico-{$ticket}-{$fecha}.xlsx"
            );
        }

        return Pdf::loadView('auditoria.extracto', [
            'proyeccion' => 'TÉCNICA',
            'meta' => $datos['meta'],
            'headings' => $datos['headings'],
            'filas' => $datos['filas'],
        ])->download("extracto-tecnico-{$ticket}-{$fecha}.pdf");
    }
}
