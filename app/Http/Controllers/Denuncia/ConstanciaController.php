<?php

namespace App\Http\Controllers\Denuncia;

use App\Http\Controllers\Controller;
use App\Models\Bitacora;
use App\Models\Denuncia;
use App\Services\BitacoraService;
use App\Services\ExtractoService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;

class ConstanciaController extends Controller
{
    /**
     * Genera la constancia personal de intervenciones en un caso.
     * Solo incluye las filas de bitácora generadas por el usuario autenticado (own-rows).
     */
    public function propia(string $ticket, Request $request)
    {
        $denuncia = Denuncia::withTrashed()->where('ticket', $ticket)->firstOrFail();
        $user = auth()->user();

        $filasRaw = $denuncia->bitacora()
            ->where('usuario_id', $user->id)
            ->with('usuario:id,name')
            ->orderBy('id')
            ->get(['id', 'accion', 'detalle', 'usuario_id', 'fecha']);

        BitacoraService::registrarAuditoria('constancia_generada', [
            'ticket' => $ticket,
        ]);

        $filas = $filasRaw->map(fn (Bitacora $b) => [
            'id' => $b->id,
            'fecha' => $b->fecha ? $b->fecha->format('d/m/Y H:i') : '—',
            'accion' => ExtractoService::etiquetaAccion($b->accion),
            'detalle' => $b->detalle ?? '—',
        ]);

        $meta = [
            'caso_id' => $denuncia->id,
            'ticket' => $denuncia->ticket,
            'tipo' => mb_strtoupper(str_replace('_', ' ', $denuncia->tipo ?? '')),
            'estado' => mb_strtoupper(str_replace('_', ' ', $denuncia->estado ?? '')),
            'generado' => now()->format('d/m/Y H:i'),
            'generado_por' => $user->name,
            'username' => $user->username,
            'registros' => $filasRaw->count(),
            'rango' => $filasRaw->isNotEmpty() ? "{$filasRaw->first()->id}–{$filasRaw->last()->id}" : null,
        ];

        $fecha = now()->format('Y-m-d');
        $username = $user->username;

        return Pdf::loadView('auditoria.constancia', [
            'meta' => $meta,
            'filas' => $filas,
        ])->download("constancia-{$ticket}-{$username}-{$fecha}.pdf");
    }
}
