<?php

namespace Tests\Unit;

use App\Helpers\DiasHabiles;
use PHPUnit\Framework\TestCase;

/**
 * Límites de color de plazo (fuente única DiasHabiles::colorPlazo).
 * Sin base de datos: el helper de color es puro.
 */
class DiasHabilesTest extends TestCase
{
    public function test_limites_de_color_plazo(): void
    {
        $casos = [
            -30 => 'red',
            -1 => 'red',
            0 => 'red',
            1 => 'red',
            3 => 'red',
            4 => 'yellow',
            5 => 'yellow',
            8 => 'yellow',
            9 => 'green',
            45 => 'green',
        ];

        foreach ($casos as $dias => $esperado) {
            $this->assertSame(
                $esperado,
                DiasHabiles::colorPlazo($dias),
                "colorPlazo({$dias}) debe ser '{$esperado}'"
            );
        }
    }

    public function test_umbrales_publicos(): void
    {
        $this->assertSame(3, DiasHabiles::UMBRAL_ROJO);
        $this->assertSame(8, DiasHabiles::UMBRAL_AMARILLO);
    }
}
