<?php

namespace App\Helpers;

use App\Models\Feriado;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;

/**
 * Helper de días hábiles (Lun-Vie, sin sáb/dom ni feriados).
 *
 * Día 1 = mañana hábil siguiente a $desde (no cuenta hoy — Ley 2341).
 * Feriado en sáb/dom no descuenta doble: primero se filtra finde.
 * Cache global `feriados:fechas` (TTL 1h) con todas las fechas activas.
 */
class DiasHabiles
{
    private const CACHE_KEY = 'feriados:fechas';
    private const CACHE_TTL = 3600;

    /**
     * Set de feriados Y-m-d (solo días activos). Cache global.
     * @return array<string,true>
     */
    public static function feriadosSet(): array
    {
        $fechas = Cache::remember(self::CACHE_KEY, self::CACHE_TTL, function () {
            return Feriado::whereNull('deleted_at')->pluck('fecha')->map(function ($f) {
                return $f instanceof Carbon ? $f->format('Y-m-d') : substr((string) $f, 0, 10);
            })->toArray();
        });

        $set = [];
        foreach ($fechas as $f) {
            $set[$f] = true;
        }
        return $set;
    }

    public static function olvidarCache(): void
    {
        Cache::forget(self::CACHE_KEY);
    }

    public static function esHabil(Carbon $fecha, ?array $feriadosSet = null): bool
    {
        if ($fecha->dayOfWeekIso >= 6) {
            return false;
        }
        $set = $feriadosSet ?? self::feriadosSet();
        return !isset($set[$fecha->format('Y-m-d')]);
    }

    public static function esFeriadoEnFinDeSemana(Carbon $fecha): bool
    {
        return $fecha->dayOfWeekIso >= 6;
    }

    public static function agregar(int $dias, ?Carbon $desde = null, ?array $feriadosSet = null): Carbon
    {
        $fecha = ($desde ?? Carbon::now('America/La_Paz'))->copy()->startOfDay();
        $agregados = 0;
        $set = $feriadosSet ?? self::feriadosSet();

        while ($agregados < $dias) {
            $fecha->addDay();
            if ($fecha->dayOfWeekIso >= 6) {
                continue;
            }
            if (isset($set[$fecha->format('Y-m-d')])) {
                continue;
            }
            $agregados++;
        }

        return $fecha;
    }

    public static function agregarDiasFin(int $dias, ?Carbon $desde = null, ?array $feriadosSet = null): string
    {
        return self::agregar($dias, $desde, $feriadosSet)->endOfDay()->toDateTimeString();
    }

    public static function transcurridos(Carbon $inicio, Carbon $fin, ?array $feriadosSet = null): int
    {
        $count = 0;
        $actual = $inicio->copy()->startOfDay();
        $hasta = $fin->copy()->startOfDay();
        $set = $feriadosSet ?? self::feriadosSet();

        while ($actual->lt($hasta)) {
            $actual->addDay();
            if ($actual->dayOfWeekIso >= 6) {
                continue;
            }
            if (isset($set[$actual->format('Y-m-d')])) {
                continue;
            }
            $count++;
        }

        return $count;
    }

    /**
     * Días hábiles restantes desde ahora hasta vencimiento (negativo si vencido).
     */
    public static function diasRestantes(Carbon $vencimiento, ?Carbon $desde = null, ?array $feriadosSet = null): int
    {
        $ahora = ($desde ?? Carbon::now('America/La_Paz'))->copy()->startOfDay();
        $venc = $vencimiento->copy()->startOfDay();
        if ($ahora->equalTo($venc)) {
            return 0;
        }
        if ($ahora->gt($venc)) {
            return -self::transcurridos($venc, $ahora, $feriadosSet);
        }
        return self::transcurridos($ahora, $venc, $feriadosSet);
    }
}
