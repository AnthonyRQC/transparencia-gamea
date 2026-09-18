<?php

namespace Tests\Feature;

use App\Models\CategoriaDenuncia;
use App\Models\Denuncia;
use App\Models\User;
use App\Services\AlertasPlazo;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

/**
 * Sprint 18B — Mi Cuenta: force-password, perfil, preferencias.
 */
class MiCuentaTest extends TestCase
{
    use RefreshDatabase;

    private User $inv;

    protected function setUp(): void
    {
        parent::setUp();

        $this->inv = User::factory()->create([
            'username' => 'miinv',
            'rol' => 'investigador',
            'activo' => true,
            'password' => Hash::make('demo123'),
        ]);

        CategoriaDenuncia::create([
            'clave' => 'cohecho',
            'nombre' => 'COHECHO (SOBORNO)',
            'tipo_denuncia' => 'corrupcion',
            'activa' => true,
        ]);
    }

    public function test_clave_temporal_fuerza_perfil(): void
    {
        $this->inv->update(['debe_cambiar_password' => true]);

        $this->actingAs($this->inv)->get('/dashboard')->assertRedirect('/profile');
        $this->actingAs($this->inv)->get('/profile')->assertOk();

        $this->actingAs($this->inv)
            ->put('/password', [
                'current_password' => 'demo123',
                'password' => 'corta',
                'password_confirmation' => 'corta',
            ])
            ->assertSessionHasErrors('password');

        $this->actingAs($this->inv)->post('/logout')->assertRedirect('/');
    }

    public function test_cambio_clave_limpia_flag(): void
    {
        $this->inv->update(['debe_cambiar_password' => true]);

        $this->actingAs($this->inv)
            ->put('/password', [
                'current_password' => 'demo123',
                'password' => 'NuevaClave123',
                'password_confirmation' => 'NuevaClave123',
            ])
            ->assertSessionHasNoErrors();

        $this->assertFalse((bool) $this->inv->fresh()->debe_cambiar_password);
        $this->actingAs($this->inv)->get('/dashboard')->assertOk();
    }

    public function test_perfil_recompone_nombre_y_blinda_identidad(): void
    {
        $ciOriginal = $this->inv->ci;

        $this->actingAs($this->inv)
            ->patch('/profile', [
                'nombres' => 'juan carlos',
                'apellidos' => 'perez lopez',
                'email' => 'juan@example.bo',
                'telefono' => '70000001',
                'color' => 'bg-teal-600',
                'ci' => '0000000',
                'username' => 'hack',
                'rol' => 'admin',
            ])
            ->assertSessionHasNoErrors()
            ->assertRedirect('/profile');

        $u = $this->inv->fresh();
        $this->assertSame('JUAN CARLOS', $u->nombres);
        $this->assertSame('PEREZ LOPEZ', $u->apellidos);
        $this->assertSame('JUAN CARLOS PEREZ LOPEZ', $u->name);
        $this->assertSame('bg-teal-600', $u->color);
        $this->assertSame($ciOriginal, $u->ci);
        $this->assertSame('miinv', $u->username);
        $this->assertSame('investigador', $u->rol);
    }

    public function test_perfil_color_invalido(): void
    {
        $this->actingAs($this->inv)
            ->patch('/profile', [
                'nombres' => $this->inv->nombres,
                'apellidos' => $this->inv->apellidos,
                'color' => 'bg-red-999',
            ])
            ->assertSessionHasErrors('color');
    }

    public function test_preferencias_master_off_apaga_alertas(): void
    {
        $this->actingAs($this->inv)
            ->patch('/profile/preferencias', [
                'notificaciones' => false,
                'umbral_plazo' => 3,
                'umbral_informe' => 3,
                'umbral_solicitud' => 2,
                'umbral_descargo' => 2,
            ])
            ->assertSessionHasNoErrors();

        $this->assertFalse($this->inv->fresh()->preferencias['notificaciones']);
        $this->assertSame([], AlertasPlazo::paraUsuario($this->inv->fresh()));
    }

    public function test_preferencias_umbral_custom(): void
    {
        Denuncia::forceCreate([
            'ticket' => 'DEN-2026-MC-001',
            'token_consulta' => '5001',
            'tipo' => 'corrupcion',
            'escenario' => 'revelada',
            'estado' => 'investigacion',
            'hechos' => 'HECHOS DE PRUEBA DE UMBRAL',
            'declaracion_jurada' => true,
            'categoria_id' => CategoriaDenuncia::first()->id,
            'investigador_id' => $this->inv->id,
        ]);

        // Caso fresco: 45d restantes. Umbral 0 → sin alerta; umbral 45 → con alerta.
        $this->inv->update(['preferencias' => [
            'notificaciones' => true,
            'umbrales' => ['plazo' => 0, 'informe' => 0, 'solicitud' => 0, 'descargo' => 0],
        ]]);
        $this->assertSame([], AlertasPlazo::paraUsuario($this->inv->fresh()));

        $this->inv->update(['preferencias' => [
            'notificaciones' => true,
            'umbrales' => ['plazo' => 45, 'informe' => 45, 'solicitud' => 2, 'descargo' => 2],
        ]]);

        $alertas = AlertasPlazo::paraUsuario($this->inv->fresh());
        $this->assertNotEmpty($alertas);
        $this->assertSame('DEN-2026-MC-001', $alertas[0]['ticket']);
    }
}
