<?php

namespace Tests\Feature;

use App\Helpers\DiasHabiles;
use App\Models\Feriado;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DiasHabilesCacheTest extends TestCase
{
    use RefreshDatabase;

    public function test_feriados_set_se_cachea_y_se_invalida(): void
    {
        Feriado::create(['fecha' => '2026-09-14', 'nombre' => 'FERIADO DE PRUEBA']);

        $this->assertArrayHasKey('2026-09-14', DiasHabiles::feriadosSet());

        Feriado::create(['fecha' => '2026-09-15', 'nombre' => 'OTRO FERIADO DE PRUEBA']);

        // Segunda lectura sale de cache: el feriado nuevo aún no es visible.
        $this->assertArrayNotHasKey('2026-09-15', DiasHabiles::feriadosSet());

        DiasHabiles::olvidarCache();

        $this->assertArrayHasKey('2026-09-15', DiasHabiles::feriadosSet());
    }
}
