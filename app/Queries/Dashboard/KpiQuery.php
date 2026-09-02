<?php

namespace App\Queries\Dashboard;

use App\Models\Denuncia;
use Illuminate\Support\Facades\DB;

class KpiQuery
{
    private const ESTADOS_TERMINALES = ['rechazada', 'cerrada'];

    public static function calcular(array $f): array
    {
        $estadoQuery = DashboardQueryBase::denuncias($f, false);

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

        $rechazadas = Denuncia::whereNull('deleted_at')
            ->where('estado', 'rechazada')
            ->when($f['tipo'], fn ($q, $v) => $q->where('tipo', $v))
            ->when($f['categoria_id'], fn ($q, $v) => $q->where('categoria_id', $v))
            ->when($f['desde'], fn ($q) => $q->whereDate('fecha_rechazada', '>=', $f['desde']))
            ->when($f['hasta'], fn ($q) => $q->whereDate('fecha_rechazada', '<=', $f['hasta']))
            ->count();

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
}
