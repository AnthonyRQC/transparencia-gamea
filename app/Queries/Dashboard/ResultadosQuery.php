<?php

namespace App\Queries\Dashboard;

use App\Helpers\RollUpDependencias;
use Illuminate\Support\Facades\DB;

class ResultadosQuery
{
    public static function calcular(array $f): array
    {
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
}
