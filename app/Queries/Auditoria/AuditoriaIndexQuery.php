<?php

namespace App\Queries\Auditoria;

use App\Models\Bitacora;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class AuditoriaIndexQuery
{
    /**
     * Feed del panel técnico de auditoría.
     *
     * REGLA DE PROYECCIÓN: Por directriz de arquitectura y cumplimiento
     * de la Ley 974 (Arts. 24/29), la proyección técnica excluye el campo 'detalle'
     * a nivel de consulta en el backend para nunca exponer contenido de expedientes a TI/admin.
     */
    public static function paginar(array $filtros): LengthAwarePaginator
    {
        $query = Bitacora::query()
            ->select([
                'id', 'denuncia_id', 'entidad_tipo', 'entidad_id',
                'usuario_id', 'accion', 'fecha', 'user_agent',
            ])
            ->with([
                'usuario:id,name',
                'denuncia' => fn ($q) => $q->withTrashed()->select('id', 'ticket'),
            ]);

        if (! empty($filtros['desde'])) {
            $query->where('fecha', '>=', Carbon::parse($filtros['desde'])->startOfDay());
        }

        if (! empty($filtros['hasta'])) {
            $query->where('fecha', '<=', Carbon::parse($filtros['hasta'])->endOfDay());
        }

        if (! empty($filtros['usuario_id'])) {
            $query->where('usuario_id', (int) $filtros['usuario_id']);
        }

        if (! empty($filtros['accion'])) {
            $query->where('accion', $filtros['accion']);
        }

        if (! empty($filtros['ticket'])) {
            $ticket = mb_strtoupper(trim((string) $filtros['ticket']));
            $query->whereHas('denuncia', fn ($q) => $q->withTrashed()->where('ticket', 'like', "%{$ticket}%"));
        }

        if (($filtros['tipo'] ?? null) === 'descargas') {
            $query->where('accion', 'archivo_descargado');
        }

        return $query->orderByDesc('fecha')
            ->orderByDesc('id')
            ->paginate(50)
            ->withQueryString();
    }
}
