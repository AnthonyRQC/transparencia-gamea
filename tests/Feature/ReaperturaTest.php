<?php

namespace Tests\Feature;

use App\Models\CategoriaDenuncia;
use App\Models\Clasificacion;
use App\Models\Denuncia;
use App\Models\MedioNotificacion;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReaperturaTest extends TestCase
{
    use RefreshDatabase;

    private User $jefe;

    private User $investigador;

    private User $registrador;

    protected function setUp(): void
    {
        parent::setUp();

        $this->jefe = User::factory()->create([
            'username' => 'jefe',
            'rol' => 'jefe',
            'activo' => true,
        ]);

        $this->investigador = User::factory()->create([
            'username' => 'investigador1',
            'rol' => 'investigador',
            'activo' => true,
            'iniciales' => 'T1',
            'color' => 'bg-blue-500',
        ]);

        $this->registrador = User::factory()->create([
            'username' => 'registrador',
            'rol' => 'registrador',
            'activo' => true,
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

    private function casoCerrado(string $ticket = 'DEN-2026-0001'): Denuncia
    {
        $denuncia = Denuncia::factory()->create([
            'ticket' => $ticket,
            'token_consulta' => '1001',
            'tipo' => 'corrupcion',
            'estado' => 'ingresada',
        ]);

        $this->actingAs($this->jefe);
        $this->post("/denuncias/{$ticket}/admitir", ['justificacion' => 'ADMITIDA PARA PRUEBA']);
        $this->post("/denuncias/{$ticket}/asignar", ['investigador_id' => $this->investigador->id]);

        $this->actingAs($this->investigador);
        $this->post("/denuncias/{$ticket}/iniciar", []);

        $this->actingAs($this->jefe);
        $this->post("/denuncias/{$ticket}/saltar-fase", [
            'justificacion' => 'JUSTIFICACIÓN DE PRUEBA PARA SALTAR FASE CON MÍNIMO DE 20 CARACTERES',
        ]);
        $this->post("/denuncias/{$ticket}/informe", [
            'clasificacion' => 'administrativo',
            'fojas' => 10,
            'justificacion' => 'JUSTIFICACIÓN DE PRUEBA PARA EL INFORME FINAL CON MÍNIMO DE 20 CARACTERES',
            'concluido_por' => 'INVESTIGADOR TEST',
        ]);
        $this->post("/denuncias/{$ticket}/cierre", [
            'notificado_denunciante' => true,
            'notificacion_medio' => 'email',
            'notificacion_fecha' => now()->format('Y-m-d'),
            'notificacion_descripcion' => 'NOTIFICACIÓN DE PRUEBA COMPLETA CON SUFICIENTES CARACTERES',
            'concluido_por' => 'INVESTIGADOR TEST',
            'descripcion' => 'DESCRIPCIÓN DE CIERRE DE PRUEBA CON MÍNIMO DE VEINTE CARACTERES',
        ]);

        return $denuncia->refresh();
    }

    public function test_jefe_puede_reabrir_caso_rechazado_y_caso_cerrado(): void
    {
        $this->actingAs($this->jefe);

        $rechazada = Denuncia::factory()->create([
            'ticket' => 'DEN-2026-0001',
            'token_consulta' => '1001',
            'tipo' => 'corrupcion',
            'estado' => 'ingresada',
        ]);
        $this->post("/denuncias/{$rechazada->ticket}/rechazar", ['justificacion' => 'RECHAZO DE PRUEBA']);
        $fechaRechazadaOriginal = $rechazada->refresh()->fecha_rechazada->toDateString();

        $limiteRechazada = now()->addDays(10)->format('Y-m-d');
        $response = $this->post("/denuncias/{$rechazada->ticket}/reabrir", [
            'justificacion' => 'JUSTIFICACIÓN VÁLIDA DE PRUEBA PARA REABRIR EL CASO',
            'nueva_fecha_limite' => $limiteRechazada,
        ]);

        $response->assertSessionHas('success');
        $rechazada->refresh();
        $this->assertSame('ingresada', $rechazada->estado);
        $this->assertNull($rechazada->subestado);
        $this->assertNull($rechazada->investigador_id);
        $this->assertNull($rechazada->investigador_anterior_id);
        $this->assertSame($limiteRechazada, $rechazada->reapertura_json['plazo']);
        $this->assertSame($fechaRechazadaOriginal, $rechazada->fecha_rechazada->toDateString());
        $this->assertSame($limiteRechazada, $rechazada->calcularVencimiento()->toDateString());
        $this->assertNotNull($rechazada->bitacora()->where('accion', 'reapertura')->first());

        $cerrada = $this->casoCerrado('DEN-2026-0002');
        $this->assertSame('cerrada', $cerrada->estado);
        $this->post("/denuncias/{$cerrada->ticket}/archivar", []);
        $this->assertSame('archivada', $cerrada->refresh()->subestado);

        $limiteCerrada = now()->addDays(15)->format('Y-m-d');
        $response = $this->post("/denuncias/{$cerrada->ticket}/reabrir", [
            'justificacion' => 'JUSTIFICACIÓN VÁLIDA DE PRUEBA PARA REABRIR EL CASO',
            'nueva_fecha_limite' => $limiteCerrada,
        ]);

        $response->assertSessionHas('success');
        $cerrada->refresh();
        $this->assertSame('ingresada', $cerrada->estado);
        $this->assertNull($cerrada->subestado);
        $this->assertNull($cerrada->investigador_id);
        $this->assertNull($cerrada->investigador_anterior_id);
        $this->assertSame($limiteCerrada, $cerrada->reapertura_json['plazo']);
        $this->assertDatabaseHas('cierres', ['denuncia_id' => $cerrada->id, 'eliminado' => false]);
        $this->assertNotNull($cerrada->bitacora()->where('accion', 'reapertura')->first());
    }

    public function test_reapertura_requiere_justificacion_minima_veinte_caracteres(): void
    {
        $denuncia = Denuncia::factory()->create([
            'ticket' => 'DEN-2026-0001',
            'token_consulta' => '1001',
            'tipo' => 'corrupcion',
            'estado' => 'ingresada',
        ]);

        $this->actingAs($this->jefe);
        $this->post("/denuncias/{$denuncia->ticket}/rechazar", ['justificacion' => 'RECHAZO DE PRUEBA']);

        $response = $this->post("/denuncias/{$denuncia->ticket}/reabrir", [
            'justificacion' => 'CORTA',
            'nueva_fecha_limite' => now()->addDays(10)->format('Y-m-d'),
        ]);

        $response->assertSessionHasErrors('justificacion');
        $this->assertSame('rechazada', $denuncia->refresh()->estado);
    }

    public function test_reapertura_denegada_sin_permiso(): void
    {
        $denuncia = Denuncia::factory()->create([
            'ticket' => 'DEN-2026-0001',
            'token_consulta' => '1001',
            'tipo' => 'corrupcion',
            'estado' => 'ingresada',
        ]);

        $this->actingAs($this->jefe);
        $this->post("/denuncias/{$denuncia->ticket}/rechazar", ['justificacion' => 'RECHAZO DE PRUEBA']);

        $this->actingAs($this->registrador);
        $response = $this->post("/denuncias/{$denuncia->ticket}/reabrir", [
            'justificacion' => 'JUSTIFICACIÓN VÁLIDA DE PRUEBA PARA REABRIR EL CASO',
            'nueva_fecha_limite' => now()->addDays(10)->format('Y-m-d'),
        ]);

        $response->assertRedirect('/dashboard');
        $this->assertSame('rechazada', $denuncia->refresh()->estado);
    }

    public function test_reapertura_rechazada_en_casos_activos(): void
    {
        $denuncia = Denuncia::factory()->create([
            'ticket' => 'DEN-2026-0001',
            'token_consulta' => '1001',
            'tipo' => 'corrupcion',
            'estado' => 'ingresada',
        ]);

        $this->actingAs($this->jefe);
        $response = $this->post("/denuncias/{$denuncia->ticket}/reabrir", [
            'justificacion' => 'JUSTIFICACIÓN VÁLIDA DE PRUEBA PARA REABRIR EL CASO',
            'nueva_fecha_limite' => now()->addDays(10)->format('Y-m-d'),
        ]);

        $response->assertSessionHas('error');
        $this->assertSame('ingresada', $denuncia->refresh()->estado);
    }
}
