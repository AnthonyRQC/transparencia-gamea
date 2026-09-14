<?php

namespace Tests\Feature;

use App\Models\Denuncia;
use App\Models\PrioridadPublicacion;
use App\Models\Publicacion;
use App\Models\TipoPublicacion;
use App\Models\User;
use App\Services\AvisoCaso;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AvisoCasoTest extends TestCase
{
    use RefreshDatabase;

    private User $jefe;
    private User $tecnico;

    protected function setUp(): void
    {
        parent::setUp();
        foreach (['admitida' => 'ADMITIDA', 'rechazada' => 'RECHAZADA', 'cierre_caso' => 'CIERRE DE CASO'] as $clave => $nombre) {
            TipoPublicacion::create(['clave' => $clave, 'nombre' => $nombre]);
        }
        PrioridadPublicacion::create(['clave' => 'ordinario', 'nombre' => 'ORDINARIO']);
        $this->jefe = User::factory()->create(['rol' => 'jefe']);
        $this->tecnico = User::factory()->create(['rol' => 'tecnico']);
    }

    private function denuncia(string $ticket, string $estado = 'ingresada'): Denuncia
    {
        return Denuncia::factory()->create([
            'ticket' => $ticket,
            'token_consulta' => '1001',
            'tipo' => 'corrupcion',
            'estado' => $estado,
            'escenario' => 'anonimo',
        ]);
    }

    public function test_admitir_con_checkbox_crea_borrador(): void
    {
        $denuncia = $this->denuncia('DEN-2026-0001');

        $this->actingAs($this->jefe)->post("/denuncias/{$denuncia->ticket}/admitir", [
            'justificacion' => 'ADMITIDA POR COMPETENCIA DE LA UNIDAD',
            'crear_aviso' => true,
        ]);

        $borrador = Publicacion::where('denuncia_id', $denuncia->id)->where('evento', 'admitida')->first();
        $this->assertNotNull($borrador);
        $this->assertNull($borrador->publicado_at);
        $this->assertEquals('SEÑOR DE IDENTIDAD ANÓNIMA', $borrador->destinatario_display);
        $this->assertStringContainsString('DEN-2026-0001', $borrador->ref_titulo);
        $this->assertEquals(now()->toDateString(), $borrador->fecha_documento->toDateString());
        $this->assertEquals('ADMITIDA POR COMPETENCIA DE LA UNIDAD', $borrador->resumen);
    }

    public function test_admitir_sin_checkbox_no_crea_borrador(): void
    {
        $denuncia = $this->denuncia('DEN-2026-0001');

        $this->actingAs($this->jefe)->post("/denuncias/{$denuncia->ticket}/admitir", [
            'justificacion' => 'ADMITIDA PARA PRUEBA',
        ]);

        $this->assertEquals(0, Publicacion::where('denuncia_id', $denuncia->id)->count());
    }

    public function test_rechazar_crea_borrador_con_resumen(): void
    {
        $denuncia = $this->denuncia('DEN-2026-0001');

        $this->actingAs($this->jefe)->post("/denuncias/{$denuncia->ticket}/rechazar", [
            'justificacion' => 'JUSTIFICACIÓN DE PRUEBA PARA RECHAZO',
            'resumen_rechazo' => 'FALTAN PRUEBAS SUFICIENTES.',
            'crear_aviso' => true,
        ]);

        $borrador = Publicacion::where('denuncia_id', $denuncia->id)->where('evento', 'rechazada')->first();
        $this->assertNotNull($borrador);
        $this->assertEquals('FALTAN PRUEBAS SUFICIENTES.', $borrador->resumen);
    }

    public function test_cerrar_crea_borrador_automatico(): void
    {
        $denuncia = $this->denuncia('DEN-2026-0001', 'informe');

        $this->actingAs($this->jefe)->post("/denuncias/{$denuncia->ticket}/cierre", [
            'notificado_denunciante' => false,
            'concluido_por' => 'TÉCNICO TEST',
            'descripcion' => 'DESCRIPCIÓN DE CIERRE DE PRUEBA CON MÍNIMO DE VEINTE CARACTERES',
        ]);

        $borrador = Publicacion::where('denuncia_id', $denuncia->id)->where('evento', 'cerrada')->first();
        $this->assertNotNull($borrador);
        $this->assertNull($borrador->publicado_at);
    }

    public function test_borrador_es_idempotente(): void
    {
        $denuncia = $this->denuncia('DEN-2026-0001');

        AvisoCaso::borradorPara($denuncia, 'admitida');
        AvisoCaso::borradorPara($denuncia, 'admitida');

        $this->assertEquals(1, Publicacion::where('denuncia_id', $denuncia->id)->count());
    }

    public function test_bandeja_expone_avisos_por_ticket(): void
    {
        $denuncia = $this->denuncia('DEN-2026-0001', 'cerrada');
        Publicacion::create([
            'tipo_id' => TipoPublicacion::where('clave', 'admitida')->first()->id,
            'prioridad_id' => PrioridadPublicacion::first()->id,
            'ref_titulo' => 'AVISO DE ADMISIÓN',
            'denuncia_id' => $denuncia->id,
            'evento' => 'admitida',
            'publicado_por_id' => $this->jefe->id,
            'publicado_at' => now(),
        ]);

        $this->actingAs($this->jefe)->get('/denuncias')->assertOk()->assertInertia(fn($page) => $page
            ->has('avisosPorTicket.DEN-2026-0001', fn($eventos) => $eventos
                ->where('0', 'admitida')));
    }
}
