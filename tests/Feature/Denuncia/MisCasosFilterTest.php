<?php

namespace Tests\Feature\Denuncia;

use App\Models\CategoriaDenuncia;
use App\Models\Denuncia;
use App\Models\Denunciante;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MisCasosFilterTest extends TestCase
{
    use RefreshDatabase;

    private User $registrador;
    private User $investigadorA;
    private User $investigadorB;

    private int $n = 0;

    protected function setUp(): void
    {
        parent::setUp();

        $this->registrador = User::factory()->create(['username' => 'registrador', 'rol' => 'registrador', 'activo' => true]);
        $this->investigadorA = User::factory()->create(['username' => 'investigadora', 'rol' => 'investigador', 'activo' => true]);
        $this->investigadorB = User::factory()->create(['username' => 'investigadorb', 'rol' => 'investigador', 'activo' => true]);
    }

    private function categoria(): CategoriaDenuncia
    {
        return CategoriaDenuncia::firstOrCreate(
            ['clave' => 'cohecho'],
            ['nombre' => 'COHECHO (SOBORNO)', 'tipo_denuncia' => 'corrupcion', 'activa' => true]
        );
    }

    private function denuncia(array $overrides = []): Denuncia
    {
        $this->n++;

        return Denuncia::forceCreate(array_merge([
            'ticket' => 'DEN-2026-TEST-' . str_pad((string) $this->n, 3, '0', STR_PAD_LEFT),
            'token_consulta' => str_pad((string) (1000 + $this->n), 4, '0', STR_PAD_LEFT),
            'tipo' => 'corrupcion',
            'escenario' => 'revelada',
            'estado' => 'asignada',
            'hechos' => 'HECHOS DE PRUEBA DE MIS CASOS',
            'declaracion_jurada' => true,
            'categoria_id' => $this->categoria()->id,
            'registrado_por_id' => $this->registrador->id,
            'investigador_id' => $this->investigadorA->id,
            'created_at' => now()->subDays(3),
            'updated_at' => now()->subDays(3),
        ], $overrides));
    }

    /** Tickets de la página actual de la respuesta Inertia. */
    private function ticketsEnPagina(mixed $response): array
    {
        $props = $response->viewData('page')['props'] ?? [];

        return collect($props['denuncias']['data'] ?? [])->pluck('ticket')->all();
    }

    public function test_search_encuentra_por_hechos_solo_en_casos_propios(): void
    {
        $mio = $this->denuncia(['hechos' => 'SOBORNO EN LICITACIÓN FAROLITO']);
        $ajeno = $this->denuncia(['hechos' => 'OTRO SOBORNO EN LICITACIÓN FAROLITO', 'investigador_id' => $this->investigadorB->id]);

        $response = $this->actingAs($this->investigadorA)->get('/denuncias/mis-casos?search=farolito');

        $response->assertOk();
        $tickets = $this->ticketsEnPagina($response);

        $this->assertContains($mio->ticket, $tickets);
        $this->assertNotContains($ajeno->ticket, $tickets);
        $response->assertInertia(fn ($page) => $page
            ->component('Denuncias/MisCasos')
            ->where('filters.search', 'farolito')
            ->where('filters.investigador_id', $this->investigadorA->id));
    }

    public function test_ticket_exacto_ignora_minusculas_y_espacios(): void
    {
        $d = $this->denuncia(['ticket' => 'DEN-2026-9101']);
        $this->denuncia(['ticket' => 'DEN-2026-9102']);

        $response = $this->actingAs($this->investigadorA)
            ->get('/denuncias/mis-casos?ticket=' . urlencode('  den-2026-9101  '));

        $response->assertOk();
        $this->assertSame([$d->ticket], $this->ticketsEnPagina($response));
        $response->assertInertia(fn ($page) => $page
            ->where('denuncias.total', 1)
            ->where('filters.ticket', 'DEN-2026-9101'));
    }

    public function test_fechas_desde_hasta_acotan_casos_propios(): void
    {
        $antigua = $this->denuncia(['created_at' => now()->subDays(10), 'updated_at' => now()->subDays(10)]);
        $reciente = $this->denuncia(['created_at' => now()->subDay(), 'updated_at' => now()->subDay()]);

        $desde = now()->subDays(5)->toDateString();
        $hasta = now()->toDateString();

        $response = $this->actingAs($this->investigadorA)
            ->get("/denuncias/mis-casos?fecha_desde={$desde}&fecha_hasta={$hasta}");

        $response->assertOk();
        $this->assertSame([$reciente->ticket], $this->ticketsEnPagina($response));
        $this->assertNotContains($antigua->ticket, $this->ticketsEnPagina($response));
    }

    public function test_pagina_dos_pagina_casos_propios(): void
    {
        for ($i = 0; $i < 11; $i++) {
            $this->denuncia([]);
        }

        $pagina1 = $this->actingAs($this->investigadorA)->get('/denuncias/mis-casos');
        $pagina1->assertOk()->assertInertia(fn ($page) => $page
            ->component('Denuncias/MisCasos')
            ->has('denuncias.data', 10)
            ->where('denuncias.total', 11)
            ->where('denuncias.current_page', 1)
            ->where('denuncias.last_page', 2)
            ->has('contadores')
            ->has('filters'));

        $pagina2 = $this->actingAs($this->investigadorA)->get('/denuncias/mis-casos?page=2');
        $pagina2->assertOk()->assertInertia(fn ($page) => $page
            ->has('denuncias.data', 1)
            ->where('denuncias.current_page', 2)
            ->where('denuncias.total', 11));
    }

    public function test_investigador_forzado_ignora_param_ajeno_sin_fuga(): void
    {
        $mio = $this->denuncia([]);
        $delOtro = $this->denuncia(['investigador_id' => $this->investigadorB->id]);

        // B pide explícitamente los casos de A: recibe solo los suyos.
        $response = $this->actingAs($this->investigadorB)
            ->get('/denuncias/mis-casos?investigador_id=' . $this->investigadorA->id);

        $response->assertOk();
        $tickets = $this->ticketsEnPagina($response);

        $this->assertContains($delOtro->ticket, $tickets);
        $this->assertNotContains($mio->ticket, $tickets);
        $response->assertInertia(fn ($page) => $page
            ->where('filters.investigador_id', $this->investigadorB->id));

        // Alias heredado ?investigador=ID: también se ignora y se fuerza el propio.
        $alias = $this->actingAs($this->investigadorB)
            ->get('/denuncias/mis-casos?investigador=' . $this->investigadorA->id);

        $alias->assertOk();
        $this->assertNotContains($mio->ticket, $this->ticketsEnPagina($alias));
    }

    public function test_scope_por_defecto_solo_asignada_y_estado_explicito_abre_otros(): void
    {
        $asignada = $this->denuncia(['estado' => 'asignada']);
        $admitida = $this->denuncia(['estado' => 'admitida']);
        $cerrada = $this->denuncia(['estado' => 'cerrada']);
        $rechazada = $this->denuncia(['estado' => 'rechazada']);

        $defecto = $this->actingAs($this->investigadorA)->get('/denuncias/mis-casos');

        $defecto->assertOk();
        $tickets = $this->ticketsEnPagina($defecto);

        $this->assertContains($asignada->ticket, $tickets);
        $this->assertContains($admitida->ticket, $tickets);
        $this->assertNotContains($cerrada->ticket, $tickets);
        $this->assertNotContains($rechazada->ticket, $tickets);
        $defecto->assertInertia(fn ($page) => $page
            ->where('contadores.cerrada', 1));

        $cierre = $this->actingAs($this->investigadorA)->get('/denuncias/mis-casos?estado=cerrada');

        $cierre->assertOk();
        $this->assertSame([$cerrada->ticket], $this->ticketsEnPagina($cierre));
        $cierre->assertInertia(fn ($page) => $page
            ->where('filters.estado', ['cerrada']));
    }

    public function test_denunciante_tambien_buscable_en_casos_propios(): void
    {
        $d = $this->denuncia([]);
        Denunciante::create(['denuncia_id' => $d->id, 'nombres' => 'MARTA FAROLITO QUISPE']);

        $response = $this->actingAs($this->investigadorA)->get('/denuncias/mis-casos?search=farolito');

        $response->assertOk();
        $this->assertContains($d->ticket, $this->ticketsEnPagina($response));
    }
}
