<?php

namespace App\Helpers;

use Carbon\Carbon;

class DiasHabiles
{
    public static function agregar(int $dias, ?Carbon $desde = null): Carbon
    {
        $fecha = ($desde ?? Carbon::now())->copy()->startOfDay();
        $agregados = 0;

        while ($agregados < $dias) {
            $fecha->addDay();
            if ($fecha->dayOfWeekIso >= 1 && $fecha->dayOfWeekIso <= 5) {
                $agregados++;
            }
        }

        return $fecha;
    }

    public static function agregarDiasFin(int $dias, ?Carbon $desde = null): string
    {
        return self::agregar($dias, $desde)->endOfDay()->toDateTimeString();
    }

    public static function transcurridos(Carbon $inicio, Carbon $fin): int
    {
        $count = 0;
        $actual = $inicio->copy()->startOfDay();
        $hasta = $fin->copy()->startOfDay();

        while ($actual->lt($hasta)) {
            $actual->addDay();
            if ($actual->dayOfWeekIso >= 1 && $actual->dayOfWeekIso <= 5) {
                $count++;
            }
        }

        return $count;
    }
}
