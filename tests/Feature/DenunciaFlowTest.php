<?php

namespace Tests\Feature;

use App\Helpers\DiasHabiles;
use App\Models\CategoriaDenuncia;
use App\Models\Clasificacion;
use App\Models\Denuncia;
use App\Models\MedioNotificacion;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DenunciaFlowTest extends TestCase
{
    use RefreshDatabase;

    private User $jefe;
    private User $registrador;
    private User $investigador;

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

        $this->investigador = User::factory()->create([
            'username' => 'investigador1',
            'rol' => 'investigador',
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

        Clasificacion::create([
            'clave' => 'administrativo',
            'nombre' => 'ADMINISTRATIVO',
            'activa' => true,
        ]);

        MedioNotificacion::create([
            'clave' => 'email',
            'nombre' => 'EMAIL',
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
                'categoria' => 'cohecho',
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
        $this->assertNull($denuncia->subestado);
        $this->assertNotNull($denuncia->plazo);
        $this->assertEquals(
            DiasHabiles::agregar(5, $denuncia->created_at)->toDateString(),
            $denuncia->calcularVencimiento()->toDateString()
        );
    }

    public function test_registro_acepta_ci_alfanumerico_boliviano(): void
    {
        $this->actingAs($this->registrador);

        $response = $this->post('/denuncias', [
            'tipo' => 'corrupcion',
            'escenario' => 'revelada',
            'declaracion_jurada' => true,
            'denunciante' => [
                'nombres' => 'TEST DENUNCIANTE',
                'ci' => '1234567-1E',
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
                'categoria' => 'cohecho',
                'fecha' => now()->subDays(5)->format('Y-m-d'),
                'hora' => '10:00',
                'lugar' => 'OFICINA TEST',
            ],
            'hechos' => 'ESTE ES UN TEST DE CREACIÓN DE DENUNCIA CON TODOS LOS CAMPOS REQUERIDOS',
        ]);

        $response->assertSessionHas('ticket');
        $ticket = session('ticket');
        $denuncia = Denuncia::where('ticket', $ticket)->firstOrFail();
        $this->assertSame('1234567-1E', $denuncia->denunciante->ci);
    }

    public function test_registro_rechaza_ci_mayor_a_20(): void
    {
        $this->actingAs($this->registrador);

        $response = $this->post('/denuncias', [
            'tipo' => 'corrupcion',
            'escenario' => 'revelada',
            'declaracion_jurada' => true,
            'denunciante' => [
                'nombres' => 'TEST DENUNCIANTE',
                'ci' => '123456789012345678901',
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
                'categoria' => 'cohecho',
                'fecha' => now()->subDays(5)->format('Y-m-d'),
                'hora' => '10:00',
                'lugar' => 'OFICINA TEST',
            ],
            'hechos' => 'ESTE ES UN TEST DE CREACIÓN DE DENUNCIA CON TODOS LOS CAMPOS REQUERIDOS',
        ]);

        $response->assertSessionHasErrors('denunciante.ci');
    }

    public function test_registro_persiste_testigo_ci_opcional(): void
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
                'categoria' => 'cohecho',
                'fecha' => now()->subDays(5)->format('Y-m-d'),
                'hora' => '10:00',
                'lugar' => 'OFICINA TEST',
            ],
            'hechos' => 'ESTE ES UN TEST DE CREACIÓN DE DENUNCIA CON TODOS LOS CAMPOS REQUERIDOS',
            'pruebas' => [
                [
                    'tipo' => 'testigo',
                    'descripcion' => 'TESTIGO PRESENCIAL',
                    'testigo_nombre' => 'JUAN TESTIGO',
                    'testigo_telefono' => '71234567',
                    'testigo_ci' => '7654321-2B',
                ],
            ],
        ]);

        $response->assertSessionHas('ticket');
        $ticket = session('ticket');
        $denuncia = Denuncia::where('ticket', $ticket)->firstOrFail();
        $this->assertSame('7654321-2B', $denuncia->pruebas()->firstOrFail()->testigo_ci);
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

    public function test_jefe_puede_delegar_evaluacion_a_investigador(): void
    {
        $denuncia = Denuncia::factory()->create([
            'ticket' => 'DEN-2026-0001',
            'token_consulta' => '1001',
            'tipo' => 'corrupcion',
            'estado' => 'ingresada',
        ]);

        $this->actingAs($this->jefe);

        $response = $this->post("/denuncias/{$denuncia->ticket}/delegar-evaluacion", [
            'investigador_id' => $this->investigador->id,
        ]);

        $response->assertSessionHas('success');
        $denuncia->refresh();
        $this->assertSame('evaluacion_tecnica', $denuncia->estado);

        $evaluacion = $denuncia->evaluaciones()->firstOrFail();
        $this->assertSame($this->investigador->id, $evaluacion->investigador_id);
        $this->assertSame('pendiente', $evaluacion->estado);

        $this->assertNotNull($denuncia->bitacora()->where('accion', 'evaluacion_delegada')->first());

        $this->assertEquals(
            DiasHabiles::agregar(5, $denuncia->created_at)->toDateString(),
            $denuncia->calcularVencimiento()->toDateString()
        );
    }

    public function test_delegar_evaluacion_rechaza_investigador_inactivo(): void
    {
        $inactivo = User::factory()->create([
            'username' => 'investigador_inactivo',
            'rol' => 'investigador',
            'activo' => false,
        ]);

        $denuncia = Denuncia::factory()->create([
            'ticket' => 'DEN-2026-0001',
            'token_consulta' => '1001',
            'tipo' => 'corrupcion',
            'estado' => 'ingresada',
        ]);

        $this->actingAs($this->jefe);

        $response = $this->post("/denuncias/{$denuncia->ticket}/delegar-evaluacion", [
            'investigador_id' => $inactivo->id,
        ]);

        $response->assertSessionHas('error');
        $this->assertSame('ingresada', $denuncia->refresh()->estado);
        $this->assertSame(0, $denuncia->evaluaciones()->count());
    }

    public function test_investigador_puede_devolver_evaluacion_con_recomendacion(): void
    {
        $denuncia = Denuncia::factory()->create([
            'ticket' => 'DEN-2026-0001',
            'token_consulta' => '1001',
            'tipo' => 'corrupcion',
            'estado' => 'ingresada',
        ]);

        $this->actingAs($this->jefe);
        $this->post("/denuncias/{$denuncia->ticket}/delegar-evaluacion", [
            'investigador_id' => $this->investigador->id,
        ]);

        $evaluacion = $denuncia->refresh()->evaluaciones()->firstOrFail();

        $this->actingAs($this->investigador);
        $response = $this->post("/denuncias/evaluaciones/{$evaluacion->id}/devolver", [
            'texto_evaluacion' => 'EVALUACIÓN DE PRUEBA CON RECOMENDACIÓN DE ADMITIR',
            'recomendacion' => 'admitir',
        ]);

        $response->assertSessionHas('success');

        $this->assertSame('devuelta', $evaluacion->fresh()->estado);
        $this->assertSame('admitir', $evaluacion->fresh()->recomendacion);
        $this->assertNotNull($evaluacion->fresh()->texto_evaluacion);

        $denuncia->refresh();
        $this->assertSame('ingresada', $denuncia->estado);

        $this->assertNotNull($denuncia->bitacora()->where('accion', 'evaluacion_devuelta')->first());
    }

    public function test_jefe_puede_reasumir_evaluacion(): void
    {
        $denuncia = Denuncia::factory()->create([
            'ticket' => 'DEN-2026-0001',
            'token_consulta' => '1001',
            'tipo' => 'corrupcion',
            'estado' => 'ingresada',
        ]);

        $this->actingAs($this->jefe);
        $this->post("/denuncias/{$denuncia->ticket}/delegar-evaluacion", [
            'investigador_id' => $this->investigador->id,
        ]);

        $evaluacion = $denuncia->refresh()->evaluaciones()->firstOrFail();

        $response = $this->post("/denuncias/{$denuncia->ticket}/reasumir-evaluacion", []);

        $response->assertSessionHas('success');
        $this->assertSame('ingresada', $denuncia->refresh()->estado);
        $this->assertSame('cancelada', $evaluacion->fresh()->estado);
        $this->assertNotNull($denuncia->bitacora()->where('accion', 'evaluacion_reasumida')->first());
    }

    public function test_jefe_puede_rechazar_denuncia_con_justificacion(): void
    {
        $justificacion = 'JUSTIFICACIÓN VÁLIDA DE RECHAZO PARA LA PRUEBA';
        $denuncia = Denuncia::factory()->create([
            'ticket' => 'DEN-2026-0001',
            'token_consulta' => '1001',
            'tipo' => 'corrupcion',
            'estado' => 'ingresada',
        ]);

        $this->actingAs($this->jefe);

        $response = $this->post("/denuncias/{$denuncia->ticket}/rechazar", [
            'justificacion' => $justificacion,
        ]);

        $response->assertSessionHas('success');

        $denuncia->refresh();
        $this->assertSame('rechazada', $denuncia->estado);
        $this->assertNotNull($denuncia->fecha_rechazada);
        $this->assertNull($denuncia->plazo);
        $this->assertSame($justificacion, $denuncia->justificacion_rechazo);
        $this->assertSame(1, $denuncia->bitacora()->where('accion', 'rechazada')->count());
    }

    public function test_rechazo_requiere_justificacion_minima_cinco_caracteres(): void
    {
        $denuncia = Denuncia::factory()->create([
            'ticket' => 'DEN-2026-0001',
            'token_consulta' => '1001',
            'tipo' => 'corrupcion',
            'estado' => 'ingresada',
        ]);

        $this->actingAs($this->jefe);

        $response = $this->post("/denuncias/{$denuncia->ticket}/rechazar", [
            'justificacion' => 'NO',
        ]);

        $response->assertSessionHasErrors('justificacion');
        $this->assertSame('ingresada', $denuncia->refresh()->estado);
    }

    public function test_admitir_o_rechazar_en_estado_no_ingresada_falla(): void
    {
        $denuncia = Denuncia::factory()->create([
            'ticket' => 'DEN-2026-0001',
            'token_consulta' => '1001',
            'tipo' => 'corrupcion',
            'estado' => 'ingresada',
        ]);

        $this->actingAs($this->jefe);
        $this->post("/denuncias/{$denuncia->ticket}/admitir", [
            'justificacion' => 'ADMITIDA PARA PRUEBA',
        ]);
        $this->assertSame('admitida', $denuncia->refresh()->estado);

        // Doble intento secuencial: admitir y rechazar sobre estado no permitido.
        $this->post("/denuncias/{$denuncia->ticket}/admitir", [
            'justificacion' => 'SEGUNDO INTENTO DE ADMISIÓN',
        ])->assertSessionHas('error');

        $this->post("/denuncias/{$denuncia->ticket}/rechazar", [
            'justificacion' => 'INTENTO DE RECHAZO EN ESTADO ADMITIDA',
        ])->assertSessionHas('error');

        $this->assertSame('admitida', $denuncia->refresh()->estado);
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
            'investigador_id' => $this->investigador->id,
        ]);
        $denuncia->refresh();
        $this->assertEquals('asignada', $denuncia->estado);
        $this->assertEquals($this->investigador->id, $denuncia->investigador_id);
        $this->assertNotNull($denuncia->fecha_asignada);

        // El trabajo de campo lo hace el investigador dueño (16.2 CasoAuth).
        $this->actingAs($this->investigador);

        $this->post("/denuncias/{$denuncia->ticket}/iniciar", []);
        $denuncia->refresh();
        $this->assertEquals('investigacion', $denuncia->estado);

        // El jefe retoma: salta fase y firma informe/cierre (supervisor, D26).
        $this->actingAs($this->jefe);

        $this->post("/denuncias/{$denuncia->ticket}/saltar-fase", [
            'justificacion' => 'JUSTIFICACIÓN DE PRUEBA PARA SALTAR FASE CON MÍNIMO DE 20 CARACTERES',
        ]);
        $denuncia->refresh();
        $this->assertEquals('informe', $denuncia->estado);

        $this->post("/denuncias/{$denuncia->ticket}/informe", [
            'clasificacion' => 'administrativo',
            'fojas' => 10,
            'justificacion' => 'JUSTIFICACIÓN DE PRUEBA PARA EL INFORME FINAL CON MÍNIMO DE 20 CARACTERES',
            'concluido_por' => 'INVESTIGADOR TEST',
        ]);
        $denuncia->refresh();
        $this->assertNotNull($denuncia->informe);
        $this->assertEquals('administrativo', $denuncia->informe->clasificacion);

        $this->post("/denuncias/{$denuncia->ticket}/cierre", [
            'notificado_denunciante' => true,
            'notificacion_medio' => 'email',
            'notificacion_fecha' => now()->format('Y-m-d'),
            'notificacion_descripcion' => 'NOTIFICACIÓN DE PRUEBA COMPLETA CON SUFICIENTES CARACTERES',
            'concluido_por' => 'INVESTIGADOR TEST',
            'descripcion' => 'DESCRIPCIÓN DE CIERRE DE PRUEBA CON MÍNIMO DE VEINTE CARACTERES',
        ]);
        $denuncia->refresh();
        $this->assertEquals('cerrada', $denuncia->estado);
        $this->assertNotNull($denuncia->cierre);

        foreach (['admitida', 'asignada', 'investigacion', 'saltar_fase', 'informe_redactado', 'cierre_registrado'] as $accion) {
            $this->assertNotNull(
                $denuncia->bitacora()->where('accion', $accion)->first(),
                "La bitácora debe registrar la acción {$accion}."
            );
        }
    }

    public function test_jefe_can_approve_ampliacion(): void
    {
        $this->actingAs($this->jefe);

        $fechaAdmitida = now()->subDays(10);

        $denuncia = Denuncia::factory()->create([
            'ticket' => 'DEN-2026-0001',
            'token_consulta' => '1001',
            'tipo' => 'corrupcion',
            'estado' => 'asignada',
            'investigador_id' => $this->investigador->id,
            'fecha_admitida' => $fechaAdmitida,
        ]);

        $response = $this->post("/denuncias/{$denuncia->ticket}/ampliar-plazo", [
            'dias' => 10,
            'justificacion' => 'AMPLIACIÓN DE PRUEBA CON MÍNIMO DE 10 CARÁCTERES',
        ]);

        $response->assertSessionHas('success');
        $this->assertEquals(1, $denuncia->ampliaciones()->count());
        $this->assertEquals(
            DiasHabiles::agregar(55, $denuncia->fresh()->fecha_admitida)->toDateString(),
            $denuncia->fresh()->calcularVencimiento()->toDateString()
        );
        $this->assertNotNull($denuncia->bitacora()->where('accion', 'ampliacion_plazo')->first());
    }

    public function test_ampliacion_rechaza_superar_techo_legal_corrupcion_y_negacion(): void
    {
        $this->actingAs($this->jefe);

        $corrupcion = Denuncia::factory()->create([
            'ticket' => 'DEN-2026-0001',
            'token_consulta' => '1001',
            'tipo' => 'corrupcion',
            'estado' => 'asignada',
            'investigador_id' => $this->investigador->id,
            'fecha_admitida' => now()->subDays(10),
        ]);
        $corrupcion->ampliaciones()->create([
            'dias' => 40,
            'justificacion' => 'AMPLIACIÓN PREVIA QUE DEJA 5 DÍAS DE MARGEN LEGAL',
            'numero' => 1,
            'aprobado_por_id' => $this->jefe->id,
            'fecha' => now(),
        ]);

        $response = $this->post("/denuncias/{$corrupcion->ticket}/ampliar-plazo", [
            'dias' => 10,
            'justificacion' => 'INTENTO QUE SUPERA EL TECHO DE +45 DÍAS EN CORRUPCIÓN',
        ]);

        $response->assertSessionHasErrors('dias');
        $this->assertSame(1, $corrupcion->ampliaciones()->count());

        $negacion = Denuncia::factory()->create([
            'ticket' => 'DEN-2026-0002',
            'token_consulta' => '1002',
            'tipo' => 'negacion',
            'estado' => 'asignada',
            'investigador_id' => $this->investigador->id,
            'fecha_admitida' => now()->subDays(10),
        ]);
        $negacion->ampliaciones()->create([
            'dias' => 10,
            'justificacion' => 'AMPLIACIÓN PREVIA QUE AGOTA EL TECHO DE NEGACIÓN',
            'numero' => 1,
            'aprobado_por_id' => $this->jefe->id,
            'fecha' => now(),
        ]);

        $response = $this->post("/denuncias/{$negacion->ticket}/ampliar-plazo", [
            'dias' => 1,
            'justificacion' => 'INTENTO QUE SUPERA EL TECHO DE +10 DÍAS EN NEGACIÓN',
        ]);

        $response->assertSessionHas('error');
        $this->assertSame(1, $negacion->ampliaciones()->count());
    }

    public function test_informe_acepta_clasificacion_agregada_al_catalogo(): void
    {
        $this->actingAs($this->jefe);

        // Simula una clasificación agregada desde el Panel de Catálogos
        Clasificacion::create([
            'clave' => 'delitos_electorales',
            'nombre' => 'DELITOS ELECTORALES',
            'activa' => true,
        ]);

        $denuncia = Denuncia::factory()->create([
            'ticket' => 'DEN-2026-0001',
            'token_consulta' => '1001',
            'tipo' => 'corrupcion',
            'estado' => 'informe',
        ]);

        $response = $this->post("/denuncias/{$denuncia->ticket}/informe", [
            'clasificacion' => 'delitos_electorales',
            'fojas' => 10,
            'justificacion' => 'JUSTIFICACIÓN DE PRUEBA PARA EL INFORME FINAL CON MÍNIMO DE 20 CARACTERES',
            'concluido_por' => 'INVESTIGADOR TEST',
        ]);

        $response->assertSessionHas('success');
        $denuncia->refresh();
        $this->assertEquals('delitos_electorales', $denuncia->informe->clasificacion);
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

    public function test_ticket_recycling_on_deletion(): void
    {
        $this->actingAs($this->jefe);

        $ticket1 = Denuncia::generarSiguienteTicket();
        $denuncia = Denuncia::factory()->create([
            'ticket' => $ticket1,
            'token_consulta' => '1001',
            'tipo' => 'corrupcion',
            'estado' => 'ingresada',
        ]);

        $response = $this->post("/denuncias/{$ticket1}/eliminar");
        $response->assertSessionHas('success');

        $this->assertSoftDeleted('denuncias', ['id' => $denuncia->id]);

        $nextTicket = Denuncia::generarSiguienteTicket();
        $this::assertEquals($ticket1, $nextTicket);
    }
}
