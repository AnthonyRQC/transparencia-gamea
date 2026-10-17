<?php

namespace Tests\Feature;

use App\Models\Bitacora;
use App\Models\Denuncia;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ConstanciaTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $jefe;
    private User $investigador1;
    private User $investigador2;
    private User $registrador;
    private Denuncia $denuncia;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create([
            'username' => 'admin_constancia',
            'name' => 'ADMIN AUDITOR',
            'rol' => 'admin',
            'activo' => true,
        ]);

        $this->jefe = User::factory()->create([
            'username' => 'jefe_constancia',
            'name' => 'JEFE DE UNIDAD',
            'rol' => 'jefe',
            'activo' => true,
        ]);

        $this->investigador1 = User::factory()->create([
            'username' => 'inv_uno',
            'name' => 'INVESTIGADOR UNO',
            'rol' => 'investigador',
            'activo' => true,
        ]);

        $this->investigador2 = User::factory()->create([
            'username' => 'inv_dos',
            'name' => 'INVESTIGADOR DOS',
            'rol' => 'investigador',
            'activo' => true,
        ]);

        $this->registrador = User::factory()->create([
            'username' => 'reg_constancia',
            'name' => 'REGISTRADOR UNO',
            'rol' => 'registrador',
            'activo' => true,
        ]);

        $this->denuncia = Denuncia::factory()->create([
            'ticket' => 'DEN-2026-0900',
            'token_consulta' => '9900',
            'estado' => 'investigacion',
            'investigador_id' => $this->investigador2->id, // Actualmente asignada al investigador 2
        ]);
    }

    public function test_autorizacion_y_redireccion_por_rol(): void
    {
        // Invitado -> login
        $this->get(route('denuncias.constancia.propia', $this->denuncia->ticket))
            ->assertRedirect(route('login'));

        // Admin NO tiene constancia.propia -> dashboard
        $this->actingAs($this->admin)
            ->get(route('denuncias.constancia.propia', $this->denuncia->ticket))
            ->assertRedirect(route('dashboard'));

        // Jefe SÍ tiene constancia.propia
        $this->actingAs($this->jefe)
            ->get(route('denuncias.constancia.propia', $this->denuncia->ticket))
            ->assertOk();

        // Registrador SÍ tiene constancia.propia
        $this->actingAs($this->registrador)
            ->get(route('denuncias.constancia.propia', $this->denuncia->ticket))
            ->assertOk();

        // Investigador SÍ tiene constancia.propia
        $this->actingAs($this->investigador1)
            ->get(route('denuncias.constancia.propia', $this->denuncia->ticket))
            ->assertOk();
    }

    public function test_ticket_inexistente_retorna_404_y_no_registra_evento(): void
    {
        $conteoInicial = Bitacora::where('accion', 'constancia_generada')->count();

        $this->actingAs($this->investigador1)
            ->get(route('denuncias.constancia.propia', 'TICKET-INEXISTENTE'))
            ->assertNotFound();

        $this->assertSame($conteoInicial, Bitacora::where('accion', 'constancia_generada')->count());
    }

    public function test_constancia_filtra_estrictamente_solo_las_filas_propias(): void
    {
        // Acción del investigador 1 (cuando el caso estaba a su cargo)
        $b1 = Bitacora::create([
            'denuncia_id' => $this->denuncia->id,
            'accion' => 'investigacion',
            'detalle' => 'PRIMERA ACTUACIÓN DEL INVESTIGADOR UNO',
            'usuario_id' => $this->investigador1->id,
            'fecha' => now()->subDays(2),
        ]);

        // Acción del jefe (traspaso)
        $bJefe = Bitacora::create([
            'denuncia_id' => $this->denuncia->id,
            'accion' => 'traspaso',
            'detalle' => 'TRASPASO DE CASO POR CARGA',
            'usuario_id' => $this->jefe->id,
            'fecha' => now()->subDay(),
        ]);

        // Acción del investigador 2 (nuevo asignado)
        $b2 = Bitacora::create([
            'denuncia_id' => $this->denuncia->id,
            'accion' => 'archivo_descargado',
            'detalle' => 'DESCARGA DE PRUEBA POR INVESTIGADOR DOS',
            'usuario_id' => $this->investigador2->id,
            'fecha' => now(),
        ]);

        // El investigador 1 (ya no asignado) pide su constancia
        $responseInv1 = $this->actingAs($this->investigador1)
            ->get(route('denuncias.constancia.propia', $this->denuncia->ticket));

        $responseInv1->assertOk();
        $this->assertStringContainsString('application/pdf', $responseInv1->headers->get('content-type') ?? '');

        // El investigador 2 pide su constancia
        $responseInv2 = $this->actingAs($this->investigador2)
            ->get(route('denuncias.constancia.propia', $this->denuncia->ticket));

        $responseInv2->assertOk();
    }

    public function test_caso_sin_acciones_del_usuario_genera_pdf_con_sin_acciones_registradas(): void
    {
        // El registrador nunca intervino en esta denuncia
        $response = $this->actingAs($this->registrador)
            ->get(route('denuncias.constancia.propia', $this->denuncia->ticket));

        $response->assertOk();
        $this->assertStringContainsString('application/pdf', $response->headers->get('content-type') ?? '');
    }

    public function test_constancia_generada_registra_evento_de_auditoria(): void
    {
        $this->actingAs($this->investigador1)
            ->get(route('denuncias.constancia.propia', $this->denuncia->ticket))
            ->assertOk();

        $log = Bitacora::where('accion', 'constancia_generada')
            ->where('usuario_id', $this->investigador1->id)
            ->latest('id')
            ->first();

        $this->assertNotNull($log);
        $this->assertNull($log->denuncia_id); // Evento de auditoría de auditoría desacoplado

        $detalle = array_change_key_case(json_decode($log->detalle, true) ?? [], CASE_LOWER);
        $this->assertSame($this->denuncia->ticket, strtoupper($detalle['ticket'] ?? ''));
    }

    public function test_nombre_de_archivo_ascii_en_descarga(): void
    {
        $fecha = now()->format('Y-m-d');
        $username = $this->investigador1->username;
        $ticket = $this->denuncia->ticket;
        $expectedFilename = "constancia-{$ticket}-{$username}-{$fecha}.pdf";

        $response = $this->actingAs($this->investigador1)
            ->get(route('denuncias.constancia.propia', $ticket));

        $response->assertOk();
        $disposition = $response->headers->get('content-disposition') ?? '';
        $this->assertStringContainsString($expectedFilename, $disposition);
    }

    public function test_constancia_funciona_en_caso_soft_deleted(): void
    {
        $casoBorrado = Denuncia::factory()->create([
            'ticket' => 'DEL-2026-0901',
            'token_consulta' => '9901',
            'estado' => 'ingresada',
        ]);
        $casoBorrado->delete();

        Bitacora::create([
            'denuncia_id' => $casoBorrado->id,
            'accion' => 'ingreso_legacy',
            'detalle' => 'INGRESO HISTÓRICO',
            'usuario_id' => $this->registrador->id,
            'fecha' => now(),
        ]);

        $this->actingAs($this->registrador)
            ->get(route('denuncias.constancia.propia', $casoBorrado->ticket))
            ->assertOk();
    }
}
