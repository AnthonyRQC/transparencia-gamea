<?php

namespace Tests\Feature;

use App\Models\CategoriaDenuncia;
use App\Models\Denuncia;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DenunciaFlowTest extends TestCase
{
    use RefreshDatabase;

    private User $jefe;
    private User $registrador;
    private User $tecnico;

    protected function setUp(): void
    {
        parent::setUp();

        $this->jefe = User::factory()->create([
            'username' => 'jefe',
            'rol' => 'jefe',
            'activo' => true,
        ]);

        $this->registrador = User::factory()->create([
            'username' => 'registrador',
            'rol' => 'registrador',
            'activo' => true,
        ]);

        $this->tecnico = User::factory()->create([
            'username' => 'tecnico1',
            'rol' => 'tecnico',
            'activo' => true,
            'iniciales' => 'T1',
            'color' => 'bg-blue-500',
        ]);

        CategoriaDenuncia::create([
            'clave' => 'cohecho',
            'nombre' => 'COHECHO (SOBORNO)',
            'tipo_denuncia' => 'corrupcion',
            'activa' => true,
        ]);
    }

    public function test_registrador_can_create_denuncia(): void
    {
        $this->actingAs($this->registrador);

        $response = $this->post('/denuncias', [
            'tipo' => 'corrupcion',
            'escenario' => 'revelada',
            'declaracion_jurada' => true,
            'denunciante' => [
                'nombres' => 'TEST DENUNCIANTE',
                'ci' => '1234567',
                'email' => 'test@email.com',
                'telefono' => '71234567',
            ],
            'denunciados' => [
                [
                    'conoce_identidad' => true,
                    'nombres' => 'TEST DENUNCIADO',
                    'dependencia' => 'OFICINA TEST',
                ],
            ],
            'detalles' => [
                'categoria' => 1,
                'fecha' => now()->subDays(5)->format('Y-m-d'),
                'hora' => '10:00',
                'lugar' => 'OFICINA TEST',
            ],
            'hechos' => 'ESTE ES UN TEST DE CREACIÓN DE DENUNCIA CON TODOS LOS CAMPOS REQUERIDOS',
            'pruebas' => [
                [
                    'tipo' => 'fisica',
                    'descripcion' => 'PRUEBA FÍSICA DE TEST',
                ],
            ],
        ]);

        $response->assertSessionHas('ticket');

        $ticket = session('ticket');
        $this->assertNotNull($ticket);
        $this->assertStringStartsWith('DEN-', $ticket);

        $denuncia = Denuncia::where('ticket', $ticket)->first();
        $this->assertNotNull($denuncia);
        $this->assertEquals('ingresada', $denuncia->estado);
        $this->assertEquals($this->registrador->id, $denuncia->registrado_por_id);
    }

    public function test_jefe_can_admit_denuncia(): void
    {
        $denuncia = Denuncia::factory()->create([
            'ticket' => 'DEN-2026-0001',
            'token_consulta' => '1001',
            'tipo' => 'corrupcion',
            'estado' => 'ingresada',
        ]);

        $this->actingAs($this->jefe);

        $response = $this->post("/denuncias/{$denuncia->ticket}/admitir", [
            'justificacion' => 'JUSTIFICACIÓN DE PRUEBA',
        ]);

        $response->assertSessionHas('success');

        $denuncia->refresh();
        $this->assertEquals('admitida', $denuncia->estado);
        $this->assertNotNull($denuncia->fecha_admitida);
    }

    public function test_denuncia_full_flow(): void
    {
        $this->actingAs($this->jefe);

        $denuncia = Denuncia::factory()->create([
            'ticket' => 'DEN-2026-0001',
            'token_consulta' => '1001',
            'tipo' => 'corrupcion',
            'estado' => 'ingresada',
        ]);

        $this->post("/denuncias/{$denuncia->ticket}/admitir", [
            'justificacion' => 'ADMITIDA PARA PRUEBA',
        ]);
        $denuncia->refresh();
        $this->assertEquals('admitida', $denuncia->estado);

        $this->post("/denuncias/{$denuncia->ticket}/asignar", [
            'tecnico_id' => $this->tecnico->id,
        ]);
        $denuncia->refresh();
        $this->assertEquals('asignada', $denuncia->estado);
        $this->assertEquals($this->tecnico->id, $denuncia->tecnico_id);

        $this->post("/denuncias/{$denuncia->ticket}/iniciar", []);
        $denuncia->refresh();
        $this->assertEquals('investigacion', $denuncia->estado);

        $this->post("/denuncias/{$denuncia->ticket}/saltar-fase", [
            'justificacion' => 'JUSTIFICACIÓN DE PRUEBA PARA SALTAR FASE CON MÍNIMO DE 20 CARACTERES',
        ]);
        $denuncia->refresh();
        $this->assertEquals('informe', $denuncia->estado);

        $this->post("/denuncias/{$denuncia->ticket}/informe", [
            'clasificacion' => 'administrativo',
            'fojas' => 10,
            'justificacion' => 'JUSTIFICACIÓN DE PRUEBA PARA EL INFORME FINAL CON MÍNIMO DE 20 CARACTERES',
            'concluido_por' => 'TÉCNICO TEST',
        ]);
        $denuncia->refresh();
        $this->assertNotNull($denuncia->informe);
        $this->assertEquals('administrativo', $denuncia->informe->clasificacion);

        $this->post("/denuncias/{$denuncia->ticket}/cierre", [
            'notificado_denunciante' => true,
            'notificacion_medio' => 'EMAIL TEST',
            'notificacion_fecha' => now()->format('Y-m-d'),
            'notificacion_descripcion' => 'NOTIFICACIÓN DE PRUEBA COMPLETA CON SUFICIENTES CARACTERES',
            'concluido_por' => 'TÉCNICO TEST',
            'descripcion' => 'DESCRIPCIÓN DE CIERRE DE PRUEBA CON MÍNIMO DE VEINTE CARACTERES',
        ]);
        $denuncia->refresh();
        $this->assertEquals('cerrada', $denuncia->estado);
        $this->assertNotNull($denuncia->cierre);
    }

    public function test_jefe_can_approve_ampliacion(): void
    {
        $this->actingAs($this->jefe);

        $denuncia = Denuncia::factory()->create([
            'ticket' => 'DEN-2026-0001',
            'token_consulta' => '1001',
            'tipo' => 'corrupcion',
            'estado' => 'asignada',
            'tecnico_id' => $this->tecnico->id,
        ]);

        $response = $this->post("/denuncias/{$denuncia->ticket}/ampliar-plazo", [
            'dias' => 10,
            'justificacion' => 'AMPLIACIÓN DE PRUEBA CON MÍNIMO DE 10 CARÁCTERES',
        ]);

        $response->assertSessionHas('success');
        $this->assertEquals(1, $denuncia->ampliaciones()->count());
    }

    public function test_seguimiento_publico_returns_public_data(): void
    {
        Denuncia::factory()->create([
            'ticket' => 'DEN-2026-0001',
            'token_consulta' => '1001',
            'tipo' => 'corrupcion',
            'estado' => 'ingresada',
        ]);

        $response = $this->get('/seguimiento?ticket=DEN-2026-0001-1001');

        $response->assertStatus(200);
        $response->assertInertia(fn($page) => $page
            ->where('encontrado', true)
            ->has('denuncia')
        );
    }
}
