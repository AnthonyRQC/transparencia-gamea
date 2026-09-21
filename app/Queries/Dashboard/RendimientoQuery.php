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
            ? self::casosUrgentes($f, $f['investigador_id'])
            : self::casosUrgentes($f, $userId);

        if ($esJefe) {
            $investigadores = User::where('rol', 'investigador')
                ->when(! $f['incluir_inactivos'], fn ($q) => $q->where('activo', true))
                ->orderBy('name')
                ->get(['id', 'name', 'activo']);

            // Mismo set de filtros que casosUrgentes (investigador/tipo/categoría/
            // clasificación, sin fechas ni estado: foto de hoy). Antes la carga
            // ignoraba investigador y clasificación y no cuadraba con Urgentes.
            $activas = DashboardQueryBase::denuncias($f, false)
                ->whereNotIn('estado', self::ESTADOS_TERMINALES)
                ->whereNotNull('investigador_id')
                ->select(['id', 'investigador_id', 'estado', 'tipo', 'fecha_admitida', 'created_at'])
                ->withSum('ampliaciones', 'dias')
                ->get();

            $conteos = [];
            foreach ($activas as $d) {
                $diasRestantes = $d->plazo['dias_restantes'] ?? 99;
                $investigadorId = (int) $d->investigador_id;
                $conteos[$investigadorId] ??= ['enPlazo' => 0, 'proximos' => 0, 'vencidos' => 0];

                if ($diasRestantes > 5) {
                    $conteos[$investigadorId]['enPlazo']++;
                } elseif ($diasRestantes >= 0) {
                    $conteos[$investigadorId]['proximos']++;
                } else {
                    $conteos[$investigadorId]['vencidos']++;
                }
            }

            $carga = $investigadores->map(function ($t) use ($conteos) {
                $c = $conteos[$t->id] ?? ['enPlazo' => 0, 'proximos' => 0, 'vencidos' => 0];

                return [
                    'investigador' => $t->name,
                    'enPlazo' => $c['enPlazo'],
                    'proximos' => $c['proximos'],
                    'vencidos' => $c['vencidos'],
                ];
            })
                ->filter(fn ($c) => ($c['enPlazo'] + $c['proximos'] + $c['vencidos']) > 0)
                ->values();

            return [
                'modo' => 'jefe',
                'cargaInvestigadores' => $carga,
                'urgentes' => $urgentes,
            ];
        }

        return [
            'modo' => 'investigador',
            'productividad' => self::productividad($f, $userId),
            'urgentes' => $urgentes,
        ];
    }

    private static function casosUrgentes(array $f, ?int $investigadorId): array
    {
        $activas = Denuncia::whereNull('deleted_at')
            ->whereNotIn('estado', self::ESTADOS_TERMINALES)
            ->when($investigadorId, fn ($q, $v) => $q->where('investigador_id', $v))
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
            ->select(['id', 'ticket', 'estado', 'tipo', 'fecha_admitida', 'created_at', 'investigador_id'])
            ->withSum('ampliaciones', 'dias')
            ->with('investigador:id,name')
            ->get();

        return $activas
            ->map(function ($d) {
                $plazo = $d->plazo;

                return [
                    'ticket' => $d->ticket,
                    'investigador' => $d->investigador?->name ?? 'SIN ASIGNAR',
                    'diasRestantes' => $plazo['dias_restantes'] ?? 0,
                    'color' => $plazo['color'] ?? 'gray',
                    'estado' => $d->estado,
                ];
            })
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
            ->where('denuncias.investigador_id', $userId)
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
