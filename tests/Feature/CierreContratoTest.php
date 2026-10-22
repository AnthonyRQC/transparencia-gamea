<?php

namespace Tests\Feature;

use App\Helpers\DiasHabiles;
use App\Models\CategoriaDenuncia;
use App\Models\Cierre;
use App\Models\Clasificacion;
use App\Models\Denuncia;
use App\Models\MedioNotificacion;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CierreContratoTest extends TestCase
{
    use RefreshDatabase;

    private User $jefe;

    private User $investigador;

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

    private function casoEnInforme(string $ticket = 'DEN-2026-0001'): Denuncia
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

        return $denuncia->refresh();
    }

    private function cerrarCaso(string $ticket): void
    {
        $this->actingAs($this->jefe);
        $this->post("/denuncias/{$ticket}/cierre", [
            'notificado_denunciante' => true,
            'notificacion_medio' => 'email',
            'notificacion_fecha' => now()->format('Y-m-d'),
            'notificacion_descripcion' => 'NOTIFICACIÓN DE PRUEBA COMPLETA CON SUFICIENTES CARACTERES',
            'concluido_por' => 'INVESTIGADOR TEST',
            'descripcion' => 'DESCRIPCIÓN DE CIERRE DE PRUEBA CON MÍNIMO DE VEINTE CARACTERES',
        ]);
    }

    public function test_eliminar_cierre_requiere_justificacion(): void
    {
        $denuncia = $this->casoEnInforme();
        $this->cerrarCaso($denuncia->ticket);

        $response = $this->post("/denuncias/{$denuncia->ticket}/cierre/eliminar", []);

        $response->assertSessionHasErrors('justificacion');
        $this->assertEquals('cerrada', $denuncia->refresh()->estado);
    }

    public function test_eliminar_cierre_justificacion_corta_rechazada(): void
    {
        $denuncia = $this->casoEnInforme();
        $this->cerrarCaso($denuncia->ticket);

        $response = $this->post("/denuncias/{$denuncia->ticket}/cierre/eliminar", [
            'justificacion' => 'CORTA',
        ]);

        $response->assertSessionHasErrors('justificacion');
        $this->assertEquals('cerrada', $denuncia->refresh()->estado);
    }

    public function test_eliminar_cierre_revierte_a_informe_con_auditoria(): void
    {
        $denuncia = $this->casoEnInforme();
        $this->cerrarCaso($denuncia->ticket);
        $justificacion = 'JUSTIFICACIÓN VÁLIDA DE PRUEBA PARA ELIMINAR EL CIERRE';

        $response = $this->post("/denuncias/{$denuncia->ticket}/cierre/eliminar", [
            'justificacion' => $justificacion,
        ]);

        $response->assertSessionHas('success');
        $this->assertEquals('informe', $denuncia->refresh()->estado);

        $entry = $denuncia->bitacora()->where('accion', 'cierre_eliminado')->firstOrFail();
        $this->assertStringContainsString($justificacion, $entry->detalle);
    }

    public function test_eliminar_cierre_archivada_no_reversible(): void
    {
        $denuncia = $this->casoEnInforme();
        $this->cerrarCaso($denuncia->ticket);

        $this->post("/denuncias/{$denuncia->ticket}/archivar", []);
        $this->assertEquals('archivada', $denuncia->refresh()->subestado);

        $response = $this->post("/denuncias/{$denuncia->ticket}/cierre/eliminar", [
            'justificacion' => 'JUSTIFICACIÓN VÁLIDA DE PRUEBA PARA ELIMINAR EL CIERRE',
        ]);

        $response->assertSessionHas('error');
        $denuncia->refresh();
        $this->assertEquals('cerrada', $denuncia->estado);
        $this->assertEquals('archivada', $denuncia->subestado);
    }

    public function test_guardar_cierre_duplicado_rechazado(): void
    {
        $denuncia = $this->casoEnInforme();
        $this->cerrarCaso($denuncia->ticket);

        $this->actingAs($this->jefe);
        $response = $this->post("/denuncias/{$denuncia->ticket}/cierre", [
            'notificado_denunciante' => true,
            'concluido_por' => 'INVESTIGADOR TEST',
            'descripcion' => 'DESCRIPCIÓN DE CIERRE DE PRUEBA CON MÍNIMO DE VEINTE CARACTERES',
        ]);

        $response->assertSessionHas('error');
        $this->assertEquals('cerrada', $denuncia->refresh()->estado);
        $this->assertEquals(1, Cierre::where('denuncia_id', $denuncia->id)->count());
    }

    public function test_toggle_archivar_requiere_cerrada(): void
    {
        $denuncia = $this->casoEnInforme();

        $response = $this->post("/denuncias/{$denuncia->ticket}/archivar", []);

        $response->assertSessionHas('error');
        $this->assertNull($denuncia->refresh()->subestado);
    }

    public function test_toggle_archivar_alterna_con_auditoria(): void
    {
        $denuncia = $this->casoEnInforme();
        $this->cerrarCaso($denuncia->ticket);

        $this->post("/denuncias/{$denuncia->ticket}/archivar", []);
        $this->assertEquals('archivada', $denuncia->refresh()->subestado);
        $this->assertNotNull($denuncia->bitacora()->where('accion', 'denuncia_archivada')->first());

        $this->post("/denuncias/{$denuncia->ticket}/archivar", []);
        $this->assertNull($denuncia->refresh()->subestado);
        $this->assertNotNull($denuncia->bitacora()->where('accion', 'denuncia_desarchivada')->first());
    }

    public function test_conciliar_fechas_activa_ok(): void
    {
        $denuncia = Denuncia::factory()->create([
            'ticket' => 'DEN-2026-0001',
            'token_consulta' => '1001',
            'tipo' => 'corrupcion',
            'estado' => 'ingresada',
        ]);

        $this->actingAs($this->jefe);
        $this->post("/denuncias/{$denuncia->ticket}/admitir", ['justificacion' => 'ADMITIDA PARA PRUEBA']);

        $response = $this->post("/denuncias/{$denuncia->ticket}/conciliar-fechas", [
            'fecha_admitida' => '2026-01-15',
            'justificacion' => 'JUSTIFICACIÓN DE PRUEBA PARA CONCILIAR FECHAS CON MÍNIMO DE 20 CARACTERES',
        ]);

        $response->assertSessionHas('success');
        $denuncia->refresh();
        $this->assertEquals('2026-01-15', $denuncia->fecha_admitida->toDateString());
        $this->assertNotNull($denuncia->conciliacion_json);
        $this->assertNotNull($denuncia->bitacora()->where('accion', 'conciliacion_fechas')->first());
    }

    public function test_conciliar_rechazada_rechazada(): void
    {
        $denuncia = Denuncia::factory()->create([
            'ticket' => 'DEN-2026-0001',
            'token_consulta' => '1001',
            'tipo' => 'corrupcion',
            'estado' => 'ingresada',
        ]);

        $this->actingAs($this->jefe);
        $this->post("/denuncias/{$denuncia->ticket}/rechazar", ['justificacion' => 'RECHAZO DE PRUEBA']);

        $response = $this->post("/denuncias/{$denuncia->ticket}/conciliar-fechas", [
            'fecha_admitida' => '2026-01-15',
            'justificacion' => 'JUSTIFICACIÓN DE PRUEBA PARA CONCILIAR FECHAS CON MÍNIMO DE 20 CARACTERES',
        ]);

        $response->assertSessionHas('error');
        $this->assertEquals('rechazada', $denuncia->refresh()->estado);
        $this->assertNull($denuncia->bitacora()->where('accion', 'conciliacion_fechas')->first());
    }

    public function test_conciliar_cerrada_rechazada(): void
    {
        $denuncia = $this->casoEnInforme();
        $this->cerrarCaso($denuncia->ticket);

        $response = $this->post("/denuncias/{$denuncia->ticket}/conciliar-fechas", [
            'fecha_admitida' => '2026-01-15',
            'justificacion' => 'JUSTIFICACIÓN DE PRUEBA PARA CONCILIAR FECHAS CON MÍNIMO DE 20 CARACTERES',
        ]);

        $response->assertSessionHas('error');
        $this->assertEquals('cerrada', $denuncia->refresh()->estado);
        $this->assertNull($denuncia->bitacora()->where('accion', 'conciliacion_fechas')->first());
    }

    public function test_conciliar_fecha_rechazada_rechazada(): void
    {
        $denuncia = Denuncia::factory()->create([
            'ticket' => 'DEN-2026-0001',
            'token_consulta' => '1001',
            'tipo' => 'corrupcion',
            'estado' => 'ingresada',
        ]);

        $this->actingAs($this->jefe);
        $this->post("/denuncias/{$denuncia->ticket}/admitir", ['justificacion' => 'ADMITIDA PARA PRUEBA']);

        $response = $this->post("/denuncias/{$denuncia->ticket}/conciliar-fechas", [
            'fecha_rechazada' => '2026-01-20',
            'justificacion' => 'JUSTIFICACIÓN DE PRUEBA PARA CONCILIAR FECHAS CON MÍNIMO DE 20 CARACTERES',
        ]);

        $response->assertSessionHas('error');
        $this->assertNull($denuncia->refresh()->fecha_rechazada);
    }

    public function test_conciliar_justificacion_corta_rechazada(): void
    {
        $denuncia = Denuncia::factory()->create([
            'ticket' => 'DEN-2026-0001',
            'token_consulta' => '1001',
            'tipo' => 'corrupcion',
            'estado' => 'ingresada',
        ]);

        $this->actingAs($this->jefe);

        $response = $this->post("/denuncias/{$denuncia->ticket}/conciliar-fechas", [
            'fecha_admitida' => '2026-01-15',
            'justificacion' => 'CORTA',
        ]);

        $response->assertSessionHasErrors('justificacion');
    }

    public function test_reapertura_calcular_vencimiento_regression(): void
    {
        $denuncia = Denuncia::factory()->create([
            'ticket' => 'DEN-2026-0001',
            'token_consulta' => '1001',
            'tipo' => 'corrupcion',
            'estado' => 'ingresada',
        ]);

        $this->actingAs($this->jefe);
        $this->post("/denuncias/{$denuncia->ticket}/rechazar", ['justificacion' => 'RECHAZO DE PRUEBA']);

        $limite = now()->addDays(10)->format('Y-m-d');
        $this->post("/denuncias/{$denuncia->ticket}/reabrir", [
            'justificacion' => 'JUSTIFICACIÓN VÁLIDA DE PRUEBA PARA REABRIR EL CASO',
            'nueva_fecha_limite' => $limite,
        ]);

        $denuncia->refresh();
        $this->assertEquals('ingresada', $denuncia->estado);
        $this->assertEquals($limite, $denuncia->calcularVencimiento()->toDateString());

        $this->post("/denuncias/{$denuncia->ticket}/admitir", ['justificacion' => 'ADMITIDA PARA PRUEBA']);

        $denuncia->refresh();
        $this->assertEquals('admitida', $denuncia->estado);
        $esperado = DiasHabiles::agregar(45, Carbon::parse($denuncia->fecha_admitida))->toDateString();
        $this->assertEquals($esperado, $denuncia->calcularVencimiento()->toDateString());
    }
}
