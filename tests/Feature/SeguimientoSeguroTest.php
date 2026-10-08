<?php

namespace Tests\Feature;

use App\Models\Denuncia;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SeguimientoSeguroTest extends TestCase
{
    use RefreshDatabase;

    private function props($response): array
    {
        return $response->viewData('page')['props'] ?? [];
    }

    private function denuncia(string $ticket, string $token, array $over = []): Denuncia
    {
        return Denuncia::factory()->create(array_merge([
            'ticket' => $ticket,
            'token_consulta' => $token,
            'tipo' => 'corrupcion',
            'estado' => 'investigacion',
        ], $over));
    }

    public function test_lookup_legacy_token_resuelve(): void
    {
        $this->denuncia('DEN-2026-0101', '1001');

        $response = $this->get('/seguimiento?ticket=DEN-2026-0101-1001');

        $response->assertOk();
        $props = $this->props($response);
        $this->assertTrue($props['encontrado']);
        $this->assertSame('DEN-2026-0101', $props['denuncia']['ticket']);
        $this->assertNull($props['error']);
    }

    public function test_generar_token_nuevo_formato_y_factory(): void
    {
        $this->assertMatchesRegularExpression('/^[A-Z0-9]{6}$/', Denuncia::generarToken());
        $this->assertMatchesRegularExpression('/^[A-Z0-9]{6}$/', Denuncia::factory()->create()->token_consulta);
    }

    public function test_lookup_nuevo_token_insensible_a_minusculas(): void
    {
        $token = Denuncia::generarToken();
        $this->denuncia('DEN-2026-0102', $token);

        $response = $this->get('/seguimiento?ticket=den-2026-0102-'.strtolower($token));

        $response->assertOk();
        $this->assertTrue($this->props($response)['encontrado']);
    }

    public function test_error_generico_unico_para_malformado_y_desconocido(): void
    {
        $malformado = $this->get('/seguimiento?ticket=XXX');
        $desconocido = $this->get('/seguimiento?ticket=DEN-2026-0199-9999');

        foreach ([$malformado, $desconocido] as $response) {
            $response->assertOk();
            $props = $this->props($response);
            $this->assertFalse($props['encontrado']);
            $this->assertNull($props['denuncia']);
            $this->assertSame('no_encontrado', $props['error']);
        }
    }

    public function test_carga_inicial_sin_parametro_no_es_error(): void
    {
        $response = $this->get('/seguimiento');

        $response->assertOk();
        $props = $this->props($response);
        $this->assertFalse($props['encontrado']);
        $this->assertNull($props['error']);
    }

    public function test_contrato_solo_campos_publicos_y_fechas_solo_fecha(): void
    {
        $denuncia = $this->denuncia('DEN-2026-0103', '1003');
        $denuncia->denunciante()->create(['nombres' => 'JUAN PÉREZ', 'ci' => '1234567']);
        $denuncia->denunciados()->create(['orden' => 0, 'conoce_identidad' => true, 'nombres' => 'ACUSADO X']);
        $denuncia->pruebas()->create(['tipo' => 'testigo', 'descripcion' => 'VIO TODO']);

        $response = $this->get('/seguimiento?ticket=DEN-2026-0103-1003');

        $response->assertOk();
        $denunciaPublica = $this->props($response)['denuncia'];
        $this->assertEqualsCanonicalizing(
            ['ticket', 'tipo', 'tipo_legible', 'estado', 'estado_legible', 'fecha_ingreso',
                'fecha_vencimiento', 'plazo_total_dias', 'mensaje_avance', 'pasos',
                'resumen_rechazo', 'clasificacion', 'fecha_cierre'],
            array_keys($denunciaPublica)
        );
        $this->assertMatchesRegularExpression('/^\d{4}-\d{2}-\d{2}$/', $denunciaPublica['fecha_ingreso']);
        $this->assertNull($denunciaPublica['fecha_vencimiento']);
        $cuerpo = json_encode($denunciaPublica);
        $this->assertStringNotContainsString('JUAN PÉREZ', $cuerpo);
        $this->assertStringNotContainsString('ACUSADO X', $cuerpo);
        $this->assertStringNotContainsString('VIO TODO', $cuerpo);
    }

    public function test_rechazada_incluye_resumen_sin_detalle(): void
    {
        $this->denuncia('DEN-2026-0104', '1004', [
            'estado' => 'rechazada',
            'resumen_rechazo' => 'FALTAN REQUISITOS MÍNIMOS.',
        ]);

        $response = $this->get('/seguimiento?ticket=DEN-2026-0104-1004');

        $response->assertOk();
        $denunciaPublica = $this->props($response)['denuncia'];
        $this->assertSame('rechazada', $denunciaPublica['estado']);
        $this->assertStringContainsString('FALTAN REQUISITOS MÍNIMOS.', $denunciaPublica['mensaje_avance']);
    }

    public function test_throttle_undecima_peticion_responde_429_amable(): void
    {
        for ($i = 0; $i < 10; $i++) {
            $this->get('/seguimiento?ticket=DEN-2026-0199-9999')->assertOk();
        }

        $response = $this->get('/seguimiento?ticket=DEN-2026-0199-9999');

        $response->assertStatus(429);
        $response->assertSee('DEMASIADAS CONSULTAS');
    }
}
