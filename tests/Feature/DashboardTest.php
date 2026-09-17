<?php

namespace Tests\Feature;

use App\Models\CategoriaDenuncia;
use App\Models\Cierre;
use App\Models\Clasificacion;
use App\Models\Denuncia;
use App\Models\InformeFinal;
use App\Models\MedioNotificacion;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class DashboardTest extends TestCase
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
        $this->investigador1 = User::factory()->create(['username' => 'investigador1', 'rol' => 'investigador', 'activo' => true, 'name' => 'INVESTIGADOR UNO']);
        $this->investigador2 = User::factory()->create(['username' => 'investigador2', 'rol' => 'investigador', 'activo' => true, 'name' => 'INVESTIGADOR DOS']);
    }

    private function categoria(): CategoriaDenuncia
    {
        return CategoriaDenuncia::firstOrCreate(
            ['clave' => 'cohecho'],
            ['nombre' => 'COHECHO (SOBORNO)', 'tipo_denuncia' => 'corrupcion', 'activa' => true]
        );
    }

    private function clasificacion(): Clasificacion
    {
        return Clasificacion::firstOrCreate(
            ['clave' => 'administrativo'],
            ['nombre' => 'ADMINISTRATIVO', 'activa' => true]
        );
    }

    private function medio(): MedioNotificacion
    {
        return MedioNotificacion::firstOrCreate(
            ['clave' => 'email'],
            ['nombre' => 'EMAIL', 'activa' => true]
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
            'hechos' => 'HECHOS DE PRUEBA DEL DASHBOARD',
            'declaracion_jurada' => true,
            'categoria_id' => $this->categoria()->id,
            'registrado_por_id' => $this->registrador->id,
            'created_at' => now()->subDays(3),
            'updated_at' => now()->subDays(3),
        ], $overrides));
    }

    private function cierre(Denuncia $d, ?Carbon $cerradoAt = null): Cierre
    {
        return Cierre::create([
            'denuncia_id' => $d->id,
            'notificado_denunciante' => true,
            'concluido_por' => 'INVESTIGADOR UNO',
            'cerrado_at' => $cerradoAt ?? now()->subDays(2),
            'notificacion_medio_id' => $this->medio()->id,
            'cerrado_por_id' => $this->investigador1->id,
            'eliminado' => false,
        ]);
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

    public function test_dashboard_requiere_autenticacion(): void
    {
        $this->get('/dashboard')->assertRedirect(route('login'));
    }

    public function test_jefe_ve_metricas_globales(): void
    {
        $this->denuncia(['tipo' => 'corrupcion', 'estado' => 'ingresada']);
        $this->denuncia(['tipo' => 'corrupcion', 'estado' => 'admitida', 'investigador_id' => null]);

        $dInvestigacion = $this->denuncia([
            'tipo' => 'corrupcion',
            'estado' => 'investigacion',
            'investigador_id' => $this->investigador1->id,
        ]);

        $dCerrada = $this->denuncia([
            'tipo' => 'corrupcion',
            'estado' => 'cerrada',
            'investigador_id' => $this->investigador1->id,
            'fecha_admitida' => now()->subDays(10),
        ]);
        $this->informe($dCerrada);
        $this->cierre($dCerrada);

        $this->denuncia([
            'tipo' => 'negacion',
            'estado' => 'rechazada',
            'fecha_rechazada' => now()->subDay(),
            'justificacion_rechazo' => 'NO CONSTITUYE ACTO DE CORRUPCIÓN',
            'resumen_rechazo' => 'SIN MERITOS',
        ]);

        $this->actingAs($this->jefe);

        $response = $this->get('/dashboard');

        $response->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Dashboard')
                ->where('esJefe', true)
                ->where('kpis.activos', 3)
                ->where('kpis.pendientesAdmision', 1)
                ->where('kpis.sinAsignar', 1)
                ->where('kpis.rechazadas', 1)
                ->where('kpis.cumplimiento', 100)
                ->where('kpis.split.corrupcion', 4)
                ->where('kpis.split.negacion', 1)
                ->where('operativo.embudo.0.total', 1)
                ->where('operativo.embudo.4.total', 1)
                ->where('rendimiento.modo', 'jefe'));
    }

    public function test_investigador_no_puede_ver_metricas_de_otros(): void
    {
        $this->denuncia(['estado' => 'asignada', 'investigador_id' => $this->investigador1->id]);
        $propia = $this->denuncia(['estado' => 'asignada', 'investigador_id' => $this->investigador2->id]);

        $this->actingAs($this->investigador2);

        // Intenta leer las métricas de otro investigador manipulando la URL
        $response = $this->get('/dashboard?investigador_id=' . $this->investigador1->id);

        $response->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('esInvestigador', true)
                ->where('esJefe', false)
                ->where('kpis.activos', 1)
                ->where('rendimiento.modo', 'investigador')
                ->where('rendimiento.urgentes.0.ticket', $propia->ticket)
                ->where('opciones.investigadores', []));
    }

    public function test_jefe_puede_filtrar_por_investigador(): void
    {
        $this->denuncia(['estado' => 'asignada', 'investigador_id' => $this->investigador1->id]);
        $this->denuncia(['estado' => 'asignada', 'investigador_id' => $this->investigador2->id]);

        $this->actingAs($this->jefe);

        $response = $this->get('/dashboard?investigador_id=' . $this->investigador1->id);

        $response->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('kpis.activos', 1)
                ->where('opciones.investigadores', fn ($investigadores) => count($investigadores) === 2));
    }

    public function test_embudo_muestra_estado_actual_independiente_del_rango(): void
    {
        $this->denuncia(['estado' => 'ingresada', 'created_at' => now()->subMonths(2)]);
        $this->denuncia([
            'estado' => 'investigacion',
            'created_at' => now()->subMonths(2),
            'investigador_id' => $this->investigador1->id,
        ]);

        $this->actingAs($this->jefe);

        $response = $this->get('/dashboard?desde=' . now()->subMonth()->toDateString() . '&hasta=' . now()->toDateString());

        $response->assertOk()
            ->assertInertia(fn ($page) => $page
                // Casos de hace 2 meses siguen apareciendo en el embudo (estado actual HOY)
                ->where('operativo.embudo.0.total', 1)
                ->where('operativo.embudo.4.total', 1)
                // Pero no en la evolución del período
                ->where('operativo.evolucion', fn ($evolucion) => collect($evolucion)->sum('ingresadas') === 0));
    }

    public function test_registrador_ve_dashboard_global_sin_exportar(): void
    {
        $this->denuncia(['estado' => 'ingresada']);

        $this->actingAs($this->registrador);

        $response = $this->get('/dashboard');

        $response->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('esRegistrador', true)
                ->where('esJefe', false)
                ->where('kpis.activos', 1)
                ->where('opciones.investigadores', []));
    }

    public function test_carga_respeta_filtro_investigador_como_urgentes(): void
    {
        $this->denuncia(['estado' => 'asignada', 'investigador_id' => $this->investigador1->id]);
        $this->denuncia(['estado' => 'asignada', 'investigador_id' => $this->investigador2->id]);

        $this->actingAs($this->jefe);

        $response = $this->get('/dashboard?investigador_id=' . $this->investigador1->id);

        $response->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('rendimiento.modo', 'jefe')
                ->where('rendimiento.cargaInvestigadores', fn ($carga) => count($carga) === 1)
                ->where('rendimiento.cargaInvestigadores.0.investigador', $this->investigador1->name));
    }
}
