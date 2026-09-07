<?php

namespace Tests\Feature;

use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TimeMachineTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        Carbon::setTestNow(null);
        parent::tearDown();
    }

    public function test_simulacion_ignorada_fuera_de_entorno_local(): void
    {
        $jefe = User::factory()->create(['username' => 'jefe', 'rol' => 'jefe', 'activo' => true]);

        $this->actingAs($jefe)
            ->withSession(['dev_sim_fecha' => '2026-10-01'])
            ->get('/dashboard')
            ->assertOk();

        // En testing (no local) la simulación no debe aplicarse.
        $this->assertNull(Carbon::getTestNow());
    }

    public function test_simulacion_aplica_fecha_en_entorno_local(): void
    {
        $this->app['env'] = 'local';
        $jefe = User::factory()->create(['username' => 'jefe', 'rol' => 'jefe', 'activo' => true]);

        try {
            $this->actingAs($jefe)
                ->withSession(['dev_sim_fecha' => '2026-10-01'])
                ->get('/dashboard')
                ->assertOk()
                ->assertInertia(fn ($page) => $page->where('simFecha', '2026-10-01'));

            $this->assertSame('2026-10-01', Carbon::getTestNow()?->toDateString());
        } finally {
            Carbon::setTestNow(null);
            $this->app['env'] = 'testing';
        }
    }

    public function test_rutas_dev_no_existen_fuera_de_local(): void
    {
        $jefe = User::factory()->create(['username' => 'jefe', 'rol' => 'jefe', 'activo' => true]);

        $this->actingAs($jefe)->get('/dev/tiempo')->assertNotFound();
    }
}
