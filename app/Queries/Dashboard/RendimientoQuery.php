<?php

namespace App\Queries\Dashboard;

use App\Models\Denuncia;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class RendimientoQuery
{
    private const ESTADOS_TERMINALES = ['rechazada', 'cerrada'];

    public static function calcular(array $f, bool $esJefe, int $userId): array
    {
        $urgentes = $esJefe
            ? self::casosUrgentes($f, $f['tecnico_id'])
            : self::casosUrgentes($f, $userId);

        if ($esJefe) {
            $tecnicos = User::where('rol', 'tecnico')
                ->when(! $f['incluir_inactivos'], fn ($q) => $q->where('activo', true))
                ->orderBy('name')
                ->get(['id', 'name', 'activo']);

            $activas = Denuncia::whereNull('deleted_at')
                ->whereNotIn('estado', self::ESTADOS_TERMINALES)
                ->whereNotNull('tecnico_id')
                ->when($f['tipo'], fn ($q, $v) => $q->where('tipo', $v))
                ->when($f['categoria_id'], fn ($q, $v) => $q->where('categoria_id', $v))
                ->with('ampliaciones')
                ->get();

            $carga = $tecnicos->map(function ($t) use ($activas) {
                $casos = $activas->where('tecnico_id', $t->id);

                return [
                    'tecnico' => $t->name,
                    'enPlazo' => $casos->filter(fn ($d) => ($d->plazo['dias_restantes'] ?? 99) > 5)->count(),
                    'proximos' => $casos->filter(fn ($d) => ($d->plazo['dias_restantes'] ?? 99) >= 0 && ($d->plazo['dias_restantes'] ?? 99) <= 5)->count(),
                    'vencidos' => $casos->filter(fn ($d) => ($d->plazo['dias_restantes'] ?? 99) < 0)->count(),
                ];
            })
                ->filter(fn ($c) => ($c['enPlazo'] + $c['proximos'] + $c['vencidos']) > 0)
                ->values();

            return [
                'modo' => 'jefe',
                'cargaTecnicos' => $carga,
                'urgentes' => $urgentes,
            ];
        }

        return [
            'modo' => 'tecnico',
            'productividad' => self::productividad($f, $userId),
            'urgentes' => $urgentes,
        ];
    }

    private static function casosUrgentes(array $f, ?int $tecnicoId): array
    {
        $activas = Denuncia::whereNull('deleted_at')
            ->whereNotIn('estado', self::ESTADOS_TERMINALES)
            ->when($tecnicoId, fn ($q, $v) => $q->where('tecnico_id', $v))
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
            ->with(['tecnico', 'ampliaciones'])
            ->get();

        return $activas
            ->map(fn ($d) => [
                'ticket' => $d->ticket,
                'tecnico' => $d->tecnico?->name ?? 'SIN ASIGNAR',
                'diasRestantes' => $d->plazo['dias_restantes'] ?? 0,
                'color' => $d->plazo['color'] ?? 'gray',
                'estado' => $d->estado,
            ])
            ->sortBy('diasRestantes')
            ->take(10)
            ->values()
            ->toArray();
    }

    private static function productividad(array $f, int $userId): array
    {
        $desde = $f['desde'] ? Carbon::parse($f['desde'])->startOfMonth() : Carbon::now()->subYear()->startOfMonth();
        $hasta = $f['hasta'] ? Carbon::parse($f['hasta'])->endOfMonth() : Carbon::now()->endOfMonth();

        $rows = DB::table('cierres')
            ->join('denuncias', 'cierres.denuncia_id', '=', 'denuncias.id')
            ->whereNull('denuncias.deleted_at')
            ->where('cierres.eliminado', false)
            ->where('denuncias.tecnico_id', $userId)
            ->whereDate('cierres.cerrado_at', '>=', $desde->toDateString())
            ->whereDate('cierres.cerrado_at', '<=', $hasta->toDateString())
            ->selectRaw('DATE(cierres.cerrado_at) as fecha, COUNT(*) as total')
            ->groupBy('fecha')
            ->orderBy('fecha')
            ->get()
            ->mapWithKeys(fn ($r) => [substr($r->fecha, 0, 7) => (int) $r->total]);

        $resultado = [];
        $d = $desde->copy()->startOfMonth();
        while ($d->lte($hasta)) {
            $clave = $d->format('Y-m');
            $resultado[] = ['mes' => $d->isoFormat('MMM YYYY'), 'cerrados' => (int) ($rows[$clave] ?? 0)];
            $d->addMonth();
        }

        return $resultado;
    }
}
