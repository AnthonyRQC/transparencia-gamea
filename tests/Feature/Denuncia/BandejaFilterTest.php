<?php

namespace Tests\Feature\Denuncia;

use App\Models\CategoriaDenuncia;
use App\Models\Clasificacion;
use App\Models\Denuncia;
use App\Models\Denunciante;
use App\Models\Denunciado;
use App\Models\InformeFinal;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BandejaFilterTest extends TestCase
{
    use RefreshDatabase;

    private User $jefe;
    private User $registrador;
    private User $investigador1;
    private User $investigador2;

    private int $n = 0;

    protected function setUp(): void
    {
        parent::setUp();

        $this->jefe = User::factory()->create(['username' => 'jefe', 'rol' => 'jefe', 'activo' => true]);
        $this->registrador = User::factory()->create(['username' => 'registrador', 'rol' => 'registrador', 'activo' => true]);
        $this->investigador1 = User::factory()->create(['username' => 'investigador1', 'rol' => 'investigador', 'activo' => true]);
        $this->investigador2 = User::factory()->create(['username' => 'investigador2', 'rol' => 'investigador', 'activo' => true]);
    }

    private function categoria(string $clave = 'cohecho', string $nombre = 'COHECHO (SOBORNO)'): CategoriaDenuncia
    {
        return CategoriaDenuncia::firstOrCreate(
            ['clave' => $clave],
            ['nombre' => $nombre, 'tipo_denuncia' => 'corrupcion', 'activa' => true]
        );
    }

    private function clasificacion(): Clasificacion
    {
        return Clasificacion::firstOrCreate(
            ['clave' => 'administrativo'],
            ['nombre' => 'ADMINISTRATIVO', 'activa' => true]
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
            'estado' => 'ingresada',
            'hechos' => 'HECHOS DE PRUEBA DE LA BANDEJA',
            'declaracion_jurada' => true,
            'categoria_id' => $this->categoria()->id,
            'registrado_por_id' => $this->registrador->id,
            'created_at' => now()->subDays(3),
            'updated_at' => now()->subDays(3),
        ], $overrides));
    }

    private function informe(Denuncia $d): InformeFinal
    {
        return InformeFinal::create([
            'denuncia_id' => $d->id,
            'clasificacion_id' => $this->clasificacion()->id,
            'clasificado_por_id' => $this->investigador1->id,
            'concluido_por' => 'INVESTIGADOR UNO',
            'redactado_at' => now()->subDays(3),
            'eliminado' => false,
        ]);
    }

    /** Tickets de la página actual de la respuesta Inertia. */
    private function ticketsEnPagina(mixed $response): array
    {
        $props = $response->viewData('page')['props'] ?? [];

        return collect($props['denuncias']['data'] ?? [])->pluck('ticket')->all();
    }

    public function test_search_cubre_ticket_hechos_denunciante_denunciados_y_dependencia(): void
    {
        $porHechos = $this->denuncia(['hechos' => 'SOBORNO EN LICITACIÓN MARCADORZZZ']);
        $d2 = $this->denuncia([]);
        Denunciante::create(['denuncia_id' => $d2->id, 'nombres' => 'MARTA MARCADORZZZ QUISPE']);
        $d3 = $this->denuncia([]);
        Denunciado::create(['denuncia_id' => $d3->id, 'conoce_identidad' => true, 'nombres' => 'FUNCIONARIO MARCADORZZZ']);
        $d4 = $this->denuncia([]);
        Denunciado::create(['denuncia_id' => $d4->id, 'conoce_identidad' => true, 'dependencia' => 'SUBALCALDÍA MARCADORZZZ']);
        $ajena = $this->denuncia(['hechos' => 'HECHOS DE UN CASO COMÚN SIN COINCIDENCIA']);

        $response = $this->actingAs($this->jefe)->get('/denuncias?search=marcadorzzz');

        $response->assertOk();
        $tickets = $this->ticketsEnPagina($response);

        $this->assertContains($porHechos->ticket, $tickets);
        $this->assertContains($d2->ticket, $tickets);
        $this->assertContains($d3->ticket, $tickets);
        $this->assertContains($d4->ticket, $tickets);
        $this->assertNotContains($ajena->ticket, $tickets);
        $response->assertInertia(fn ($page) => $page
            ->component('Denuncias/Bandeja')
            ->where('denuncias.total', 4)
            ->where('filters.search', 'marcadorzzz'));
    }

    public function test_ticket_exacto_ignora_minusculas_y_espacios(): void
    {
        $d = $this->denuncia(['ticket' => 'DEN-2026-9001']);
        $this->denuncia(['ticket' => 'DEN-2026-9002']);

        $response = $this->actingAs($this->jefe)->get('/denuncias?ticket=' . urlencode('  den-2026-9001  '));

        $response->assertOk();
        $this->assertSame([$d->ticket], $this->ticketsEnPagina($response));
        $response->assertInertia(fn ($page) => $page
            ->where('denuncias.total', 1)
            ->where('filters.ticket', 'DEN-2026-9001'));
    }

    public function test_multi_estado_refina_dentro_del_tab(): void
    {
        $ingresada = $this->denuncia(['estado' => 'ingresada']);
        $enEvaluacion = $this->denuncia(['estado' => 'evaluacion_tecnica']);
        $admitida = $this->denuncia(['estado' => 'admitida']);
        $cerrada = $this->denuncia(['estado' => 'cerrada']);

        $response = $this->actingAs($this->jefe)->get('/denuncias?estado=ingresada,evaluacion_tecnica');

        $response->assertOk();
        $tickets = $this->ticketsEnPagina($response);

        $this->assertContains($ingresada->ticket, $tickets);
        $this->assertContains($enEvaluacion->ticket, $tickets);
        $this->assertNotContains($admitida->ticket, $tickets);
        $this->assertNotContains($cerrada->ticket, $tickets);
        $response->assertInertia(fn ($page) => $page
            ->where('denuncias.total', 2)
            ->where('filters.estado', ['ingresada', 'evaluacion_tecnica']));
    }

    public function test_fechas_desde_hasta_filtran_por_created_at(): void
    {
        $antigua = $this->denuncia(['created_at' => now()->subDays(10), 'updated_at' => now()->subDays(10)]);
        $reciente = $this->denuncia(['created_at' => now()->subDay(), 'updated_at' => now()->subDay()]);

        $desde = now()->subDays(5)->toDateString();
        $hasta = now()->toDateString();

        $response = $this->actingAs($this->jefe)->get("/denuncias?fecha_desde={$desde}&fecha_hasta={$hasta}");

        $response->assertOk();
        $this->assertSame([$reciente->ticket], $this->ticketsEnPagina($response));
        $this->assertNotContains($antigua->ticket, $this->ticketsEnPagina($response));
    }

    public function test_investigador_id_filtra_en_su_tab(): void
    {
        $mia = $this->denuncia(['estado' => 'asignada', 'investigador_id' => $this->investigador1->id]);
        $otra = $this->denuncia(['estado' => 'asignada', 'investigador_id' => $this->investigador2->id]);

        $response = $this->actingAs($this->jefe)
            ->get("/denuncias?tab=en-curso&investigador_id={$this->investigador1->id}");

        $response->assertOk();
        $this->assertSame([$mia->ticket], $this->ticketsEnPagina($response));
        $this->assertNotContains($otra->ticket, $this->ticketsEnPagina($response));
        $response->assertInertia(fn ($page) => $page
            ->where('tab', 'en-curso')
            ->where('filters.investigador_id', $this->investigador1->id));
    }

    public function test_categoria_id_filtra(): void
    {
        $otraCategoria = $this->categoria('negacion-info', 'NEGACIÓN DE INFORMACIÓN');
        $enCategoria = $this->denuncia(['categoria_id' => $this->categoria()->id]);
        $fuera = $this->denuncia(['categoria_id' => $otraCategoria->id]);

        $response = $this->actingAs($this->jefe)
            ->get('/denuncias?categoria_id=' . $this->categoria()->id);

        $response->assertOk();
        $tickets = $this->ticketsEnPagina($response);

        $this->assertContains($enCategoria->ticket, $tickets);
        $this->assertNotContains($fuera->ticket, $tickets);
    }

    public function test_clasificacion_id_filtra_por_informe(): void
    {
        $conInforme = $this->denuncia(['estado' => 'informe', 'investigador_id' => $this->investigador1->id]);
        $this->informe($conInforme);
        $sinInforme = $this->denuncia(['estado' => 'informe', 'investigador_id' => $this->investigador1->id]);

        $response = $this->actingAs($this->jefe)
            ->get('/denuncias?tab=en-curso&clasificacion_id=' . $this->clasificacion()->id);

        $response->assertOk();
        $tickets = $this->ticketsEnPagina($response);

        $this->assertContains($conInforme->ticket, $tickets);
        $this->assertNotContains($sinInforme->ticket, $tickets);
    }

    public function test_respuesta_paginada_con_filters_echo(): void
    {
        for ($i = 0; $i < 12; $i++) {
            $this->denuncia([]);
        }

        $pagina1 = $this->actingAs($this->jefe)->get('/denuncias');
        $pagina1->assertOk()->assertInertia(fn ($page) => $page
            ->component('Denuncias/Bandeja')
            ->has('denuncias.data', 10)
            ->where('denuncias.total', 12)
            ->where('denuncias.current_page', 1)
            ->where('denuncias.last_page', 2)
            ->has('contadores')
            ->has('filters')
            ->where('filters.tab', 'por-admitir')
            ->where('tab', 'por-admitir'));

        $pagina2 = $this->actingAs($this->jefe)->get('/denuncias?page=2');
        $pagina2->assertOk()->assertInertia(fn ($page) => $page
            ->has('denuncias.data', 2)
            ->where('denuncias.current_page', 2)
            ->where('denuncias.total', 12));
    }
}
