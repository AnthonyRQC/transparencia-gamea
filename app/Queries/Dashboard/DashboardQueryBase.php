<?php

namespace App\Queries\Dashboard;

use App\Models\Denuncia;
use Illuminate\Database\Eloquent\Builder;

class DashboardQueryBase
{
    public static function denuncias(array $f, bool $conEstado = true): Builder
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
}
