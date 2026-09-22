<?php

namespace Tests\Unit;

use App\Helpers\DiasHabiles;
use Carbon\Carbon;
use PHPUnit\Framework\TestCase;

/**
 * Límites de color de plazo (fuente única DiasHabiles::colorPlazo) y payload
 * estándar DiasHabiles::plazoInfo.
 * Sin base de datos: el set de feriados se inyecta vacío.
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

    /** plazoInfo con feriados inyectados: aísla el cálculo de BD/cache. */
    private function plazoInfo(string $vencimiento, string $desde, bool $femenino = false, array $feriados = []): array
    {
        return DiasHabiles::plazoInfo(
            Carbon::parse($vencimiento),
            Carbon::parse($desde),
            $femenino,
            $feriados
        );
    }

    public function test_plazo_info_limites_de_color_y_texto(): void
    {
        // Septiembre 2026: lun 14, vie 18, lun 21 son hábiles.
        $casos = [
            // vencimiento, desde, días, color, texto
            ['2026-09-14', '2026-09-14', 0, 'red', 'Vence hoy'],
            ['2026-09-14', '2026-09-11', 1, 'red', 'Vence en 1 día hábil'],
            ['2026-09-14', '2026-09-10', 2, 'red', 'Vence en 2 días hábiles'],
            ['2026-09-14', '2026-09-09', 3, 'red', 'Vence en 3 días hábiles'],
            ['2026-09-14', '2026-09-08', 4, 'yellow', 'Vence en 4 días hábiles'],
            ['2026-09-18', '2026-09-08', 8, 'yellow', 'Vence en 8 días hábiles'],
            ['2026-09-21', '2026-09-08', 9, 'green', 'Vence en 9 días hábiles'],
        ];

        foreach ($casos as [$vencimiento, $desde, $dias, $color, $texto]) {
            $info = $this->plazoInfo($vencimiento, $desde);
            $contexto = "{$vencimiento} desde {$desde}";
            $this->assertSame($dias, $info['dias_restantes'], $contexto);
            $this->assertSame($color, $info['color'], $contexto);
            $this->assertSame($texto, $info['texto'], $contexto);
            $this->assertSame($vencimiento, $info['fecha_vencimiento'], $contexto);
        }
    }

    public function test_plazo_info_vencido_en_fin_de_semana_no_retorna_cero(): void
    {
        // Vie 18 vencido, consultado sáb 19: transcurridos() = 0 → fallback -1.
        // Antes (solicitud/descargo) se reportaba "Vence hoy" amarillo.
        $sabado = $this->plazoInfo('2026-09-18', '2026-09-19');
        $this->assertSame(-1, $sabado['dias_restantes']);
        $this->assertSame('red', $sabado['color']);
        $this->assertSame('Vencido hace 1 día hábil', $sabado['texto']);

        // Lunes 21 hábil: mismo resultado que el fin de semana.
        $lunes = $this->plazoInfo('2026-09-18', '2026-09-21');
        $this->assertSame(-1, $lunes['dias_restantes']);
        $this->assertSame('red', $lunes['color']);
        $this->assertSame('Vencido hace 1 día hábil', $lunes['texto']);

        // Dos días hábiles vencido (vie 18 → mar 22).
        $martes = $this->plazoInfo('2026-09-18', '2026-09-22');
        $this->assertSame(-2, $martes['dias_restantes']);
        $this->assertSame('Vencido hace 2 días hábiles', $martes['texto']);
    }

    public function test_plazo_info_femenino_y_feriados(): void
    {
        // Solicitudes usan "Vencida…"; denuncias/descargos "Vencido…".
        $femenino = $this->plazoInfo('2026-09-18', '2026-09-22', true);
        $this->assertSame('Vencida hace 2 días hábiles', $femenino['texto']);
        $this->assertSame('red', $femenino['color']);

        // Feriado lun 14 no descuenta: sin feriado el plazo sería 2 días.
        $conFeriado = $this->plazoInfo('2026-09-15', '2026-09-11', false, ['2026-09-14' => true]);
        $this->assertSame(1, $conFeriado['dias_restantes']);
        $this->assertSame('Vence en 1 día hábil', $conFeriado['texto']);

        $sinFeriado = $this->plazoInfo('2026-09-15', '2026-09-11');
        $this->assertSame(2, $sinFeriado['dias_restantes']);
    }

    public function test_plazo_info_estructura_y_formato_de_fecha(): void
    {
        $info = $this->plazoInfo('2026-09-15', '2026-09-14');
        $this->assertSame(
            ['dias_restantes', 'color', 'texto', 'fecha_vencimiento'],
            array_keys($info)
        );
        $this->assertSame('2026-09-15', $info['fecha_vencimiento']);
        $this->assertMatchesRegularExpression('/^\d{4}-\d{2}-\d{2}$/', $info['fecha_vencimiento']);
    }
}
