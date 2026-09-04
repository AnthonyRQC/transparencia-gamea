<?php

namespace Tests\Feature;

use App\Models\CategoriaDenuncia;
use App\Models\Clasificacion;
use App\Models\Denuncia;
use App\Models\MedioNotificacion;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReporteTest extends TestCase
{
    use RefreshDatabase;

    private User $jefe;
    private User $tecnico;
    private User $registrador;

    private int $n = 0;

    protected function setUp(): void
    {
        parent::setUp();

        $this->jefe = User::factory()->create(['username' => 'jefe', 'rol' => 'jefe', 'activo' => true]);
        $this->tecnico = User::factory()->create(['username' => 'tecnico1', 'rol' => 'tecnico', 'activo' => true]);
        $this->registrador = User::factory()->create(['username' => 'registrador', 'rol' => 'registrador', 'activo' => true]);

        CategoriaDenuncia::create([
            'clave' => 'cohecho',
            'nombre' => 'COHECHO (SOBORNO)',
            'tipo_denuncia' => 'corrupcion',
            'activa' => true,
        ]);

        Clasificacion::create([
            'clave' => 'administrativo',
            'nombre' => 'ADMINISTRATIVO',
            'activa' => true,
        ]);
    }

    private function denuncia(array $overrides = []): Denuncia
    {
        $this->n++;

        return Denuncia::forceCreate(array_merge([
            'ticket' => 'DEN-2026-REP-' . str_pad((string) $this->n, 3, '0', STR_PAD_LEFT),
            'token_consulta' => str_pad((string) (2000 + $this->n), 4, '0', STR_PAD_LEFT),
            'tipo' => 'corrupcion',
            'escenario' => 'revelada',
            'estado' => 'ingresada',
            'hechos' => 'HECHOS DE PRUEBA DEL REPORTE',
            'declaracion_jurada' => true,
            'categoria_id' => CategoriaDenuncia::first()->id,
            'registrado_por_id' => $this->registrador->id,
            'created_at' => now()->subDays(3),
            'updated_at' => now()->subDays(3),
        ], $overrides));
    }

    public function test_solo_jefe_accede_a_reportes(): void
    {
        $this->denuncia();

        $this->actingAs($this->tecnico);
        $this->get('/reportes')->assertForbidden();

        $this->actingAs($this->registrador);
        $this->get('/reportes')->assertForbidden();
    }

    public function test_listado_paginado_con_datos(): void
    {
        foreach (range(1, 5) as $i) {
            $this->denuncia();
        }

        $this->actingAs($this->jefe);

        $response = $this->get('/reportes');

        $response->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Reportes/Index')
                ->where('denuncias.total', 5));
    }

    public function test_filtros_cruzados(): void
    {
        $this->denuncia(['tipo' => 'corrupcion', 'estado' => 'admitida']);
        $this->denuncia(['tipo' => 'negacion', 'estado' => 'ingresada']);

        $this->actingAs($this->jefe);

        $response = $this->get('/reportes?tipo=corrupcion&estado=admitida');

        $response->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('denuncias.total', 1)
                ->where('denuncias.data.0.ticket', 'DEN-2026-REP-001'));
    }

    public function test_busqueda_por_ticket(): void
    {
        $d = $this->denuncia();

        $this->actingAs($this->jefe);

        $response = $this->get('/reportes?busqueda=' . $d->ticket);

        $response->assertOk()
            ->assertInertia(fn ($page) => $page->where('denuncias.total', 1));
    }

    public function test_preview_devuelve_json(): void
    {
        $this->denuncia();

        $this->actingAs($this->jefe);

        $response = $this->get('/reportes/preview');

        $response->assertOk()
            ->assertJsonStructure(['total', 'rows'])
            ->assertJsonPath('total', 1);
    }

    public function test_exportar_excel(): void
    {
        $this->denuncia();

        $this->actingAs($this->jefe);

        $response = $this->get('/reportes/exportar?formato=excel');

        $response->assertOk();
        $this->assertStringContainsString(
            'spreadsheetml',
            $response->headers->get('content-type') ?? ''
        );
    }

    public function test_exportar_pdf(): void
    {
        $this->denuncia();

        $this->actingAs($this->jefe);

        $response = $this->get('/reportes/exportar?formato=pdf');

        $response->assertOk();
        $this->assertStringContainsString(
            'application/pdf',
            $response->headers->get('content-type') ?? ''
        );
    }

    public function test_tecnico_no_puede_exportar(): void
    {
        $this->denuncia();

        $this->actingAs($this->tecnico);

        $this->get('/reportes/exportar?formato=excel')->assertForbidden();
        $this->get('/reportes/exportar?formato=pdf')->assertForbidden();
    }

    public function test_preview_filtra_por_medio_notificacion(): void
    {
        $medioEmail = MedioNotificacion::create(['clave' => 'email', 'nombre' => 'EMAIL']);
        $medioOtro = MedioNotificacion::create(['clave' => 'otro', 'nombre' => 'OTRO']);

        $conEmail = $this->denuncia(['estado' => 'cerrada']);
        $conEmail->cierre()->create([
            'notificado_denunciante' => true,
            'notificacion_medio_id' => $medioEmail->id,
            'concluido_por' => 'TECNICO UNO',
            'cerrado_at' => now(),
        ]);

        $conOtro = $this->denuncia(['estado' => 'cerrada']);
        $conOtro->cierre()->create([
            'notificado_denunciante' => true,
            'notificacion_medio_id' => $medioOtro->id,
            'concluido_por' => 'TECNICO UNO',
            'cerrado_at' => now(),
        ]);

        $this->actingAs($this->jefe);

        $this->get('/reportes/preview?medio_id=' . $medioEmail->id)
            ->assertOk()
            ->assertJsonPath('total', 1)
            ->assertJsonPath('rows.0.ticket', $conEmail->ticket);
    }

    public function test_preview_paginado(): void
    {
        foreach (range(1, 15) as $i) {
            $this->denuncia();
        }

        $this->actingAs($this->jefe);

        $this->get('/reportes/preview?page=2')
            ->assertOk()
            ->assertJsonPath('total', 15)
            ->assertJsonPath('current_page', 2)
            ->assertJsonPath('last_page', 2)
            ->assertJsonCount(5, 'rows');
    }

    public function test_exportar_excel_con_columnas_elegidas(): void
    {
        $this->denuncia();

        $this->actingAs($this->jefe);

        $response = $this->get('/reportes/exportar?formato=excel&columnas[]=ticket&columnas[]=estado&columnas[]=invalida');

        $response->assertOk();
        $this->assertStringContainsString(
            'spreadsheetml',
            $response->headers->get('content-type') ?? ''
        );
    }
}
