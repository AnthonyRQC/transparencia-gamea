<?php

namespace App\Helpers;

use App\Models\Feriado;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;

/**
 * Helper de días hábiles (Lun-Vie, sin sáb/dom ni feriados).
 *
 * Día 1 = mañana hábil siguiente a $desde (no cuenta hoy — Ley 2341).
 * Feriado en sáb/dom no descuenta doble: en `agregar()` y `transcurridos()`
 * el filtro de fin de semana (`dayOfWeekIso >= 6`) corre ANTES que el de
 * feriado, así que un feriado que cae sáb/dom nunca suma ni resta dos veces.
 * Cache global `feriados:fechas` (TTL 1h) con todas las fechas activas.
 */
class DiasHabiles
{
    private const CACHE_KEY = 'feriados:fechas';
    private const CACHE_TTL = 3600;

    /** Umbral rojo: ≤ 3 días hábiles (incluye vencidos y "vence hoy"). */
    public const UMBRAL_ROJO = 3;

    /** Umbral amarillo: ≤ 8 días hábiles. */
    public const UMBRAL_AMARILLO = 8;

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

    /**
     * Payload estándar de plazo: días → color → texto → fecha.
     * Fuente única de los accessors `plazo` / `plazo_info` (Denuncia,
     * SolicitudInformacion, Descargo).
     *
     * Incluye el fallback `0 → -1` cuando el vencimiento ya pasó: un cierre
     * caído en fin de semana o feriado no debe reportarse como "Vence hoy"
     * (semáforo amarillo/verde) estando vencido.
     *
     * @param  bool  $femenino  true → "Vencida…" (solicitudes), false → "Vencido…" (denuncias/descargos)
     * @param  array<string,true>|null  $feriadosSet  set inyectable (tests); null → cache global
     * @return array{dias_restantes:int,color:string,texto:string,fecha_vencimiento:string}
     */
    public static function plazoInfo(Carbon $vencimiento, ?Carbon $desde = null, bool $femenino = false, ?array $feriadosSet = null): array
    {
        $ahora = ($desde ?? Carbon::now('America/La_Paz'))->copy()->startOfDay();
        $venc = $vencimiento->copy()->startOfDay();

        $dias = self::diasRestantes($vencimiento, $desde, $feriadosSet);
        if ($dias === 0 && $ahora->gt($venc)) {
            $dias = -1;
        }

        $abs = abs($dias);
        $unidad = $abs === 1 ? 'día hábil' : 'días hábiles';

        if ($dias < 0) {
            $texto = ($femenino ? 'Vencida' : 'Vencido') . " hace {$abs} {$unidad}";
        } elseif ($dias === 0) {
            $texto = 'Vence hoy';
        } else {
            $texto = "Vence en {$dias} {$unidad}";
        }

        return [
            'dias_restantes' => $dias,
            'color' => self::colorPlazo($dias),
            'texto' => $texto,
            'fecha_vencimiento' => $venc->format('Y-m-d'),
        ];
    }

    /**
     * Color semántico del plazo según días hábiles restantes.
     * Fuente única para Denuncia, SolicitudInformacion y Descargo.
     * ≤ UMBRAL_ROJO → red (incluye vencidos), ≤ UMBRAL_AMARILLO → yellow, resto green.
     */
    public static function colorPlazo(int $dias): string
    {
        if ($dias <= self::UMBRAL_ROJO) {
            return 'red';
        }
        if ($dias <= self::UMBRAL_AMARILLO) {
            return 'yellow';
        }
        return 'green';
    }
}
