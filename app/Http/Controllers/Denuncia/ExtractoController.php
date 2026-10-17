<?php

namespace App\Http\Controllers\Denuncia;

use App\Exports\ExtractoExcel;
use App\Http\Controllers\Controller;
use App\Models\Denuncia;
use App\Services\BitacoraService;
use App\Services\ExtractoService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

class ExtractoController extends Controller
{
    /**
     * Exporta el extracto operativo de un caso (para Jefatura).
     * Proyección que incluye qué cambió y excluye detalles técnicos de red.
     */
    public function operativo(string $ticket, Request $request)
    {
        $request->validate([
            'formato' => ['nullable', 'in:pdf,xlsx'],
        ]);

        $formato = $request->input('formato', 'pdf');
        $denuncia = Denuncia::withTrashed()->where('ticket', $ticket)->firstOrFail();

        $datos = ExtractoService::operativas($denuncia);

        BitacoraService::registrarAuditoria('auditoria_extracto', [
            'ticket' => $ticket,
            'proyeccion' => 'operativa',
            'formato' => $formato,
        ]);

        $fecha = now()->format('Y-m-d');

        if ($formato === 'xlsx') {
            return Excel::download(
                new ExtractoExcel($datos['headings'], $datos['filas'], $datos['anchos']),
                "extracto-operativo-{$ticket}-{$fecha}.xlsx"
            );
        }

        return Pdf::loadView('auditoria.extracto', [
            'proyeccion' => 'OPERATIVA',
            'meta' => $datos['meta'],
            'headings' => $datos['headings'],
            'filas' => $datos['filas'],
        ])->download("extracto-operativo-{$ticket}-{$fecha}.pdf");
    }
}
