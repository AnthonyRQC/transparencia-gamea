<?php

namespace App\Http\Controllers;

use App\Http\Requests\AuditoriaRequest;
use App\Models\Bitacora;
use App\Models\User;
use App\Queries\Auditoria\AuditoriaIndexQuery;
use App\Services\BitacoraService;
use App\Services\ExtractoService;
use Illuminate\Http\Request;
use Inertia\Inertia;

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
        abort(501, 'Implementado en U4');
    }
}
