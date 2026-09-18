<?php

namespace Tests\Feature;

use App\Models\CategoriaDenuncia;
use App\Models\Denuncia;
use App\Models\User;
use App\Services\UsernameGenerator;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Sprint 18A — panel de usuarios: matriz, invariantes, CI único, traspaso.
 */
class UsuarioAdminTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private User $jefe;

    private User $inv1;

    private User $inv2;

    private User $reg;

    private int $n = 0;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create(['username' => 'admin', 'rol' => 'admin', 'activo' => true]);
        $this->jefe = User::factory()->create(['username' => 'eljefe', 'rol' => 'jefe', 'activo' => true]);
        $this->inv1 = User::factory()->create(['username' => 'invuno', 'rol' => 'investigador', 'activo' => true]);
        $this->inv2 = User::factory()->create(['username' => 'invdos', 'rol' => 'investigador', 'activo' => true]);
        $this->reg = User::factory()->create(['username' => 'elreg', 'rol' => 'registrador', 'activo' => true]);

        CategoriaDenuncia::create([
            'clave' => 'cohecho',
            'nombre' => 'COHECHO (SOBORNO)',
            'tipo_denuncia' => 'corrupcion',
            'activa' => true,
        ]);
    }

    private function denuncia(array $overrides = []): Denuncia
    {
        $this->n++;

        return Denuncia::forceCreate(array_merge([
            'ticket' => 'DEN-2026-USU-' . str_pad((string) $this->n, 3, '0', STR_PAD_LEFT),
            'token_consulta' => str_pad((string) (4000 + $this->n), 4, '0', STR_PAD_LEFT),
            'tipo' => 'corrupcion',
            'escenario' => 'revelada',
            'estado' => 'asignada',
            'hechos' => 'HECHOS DE PRUEBA DE USUARIOS',
            'declaracion_jurada' => true,
            'categoria_id' => CategoriaDenuncia::first()->id,
            'registrado_por_id' => $this->reg->id,
            'investigador_id' => $this->inv1->id,
        ], $overrides));
    }

    private function payload(array $overrides = []): array
    {
        return array_merge([
            'nombres' => 'JUAN CARLOS',
            'apellidos' => 'PÉREZ',
            'ci' => '9988776',
            'rol' => 'investigador',
            'password' => 'Temporal123',
        ], $overrides);
    }

    public function test_admin_crea_investigador_con_username_formula(): void
    {
        $this->actingAs($this->admin)
            ->post('/admin/usuarios', $this->payload())
            ->assertSessionHasNoErrors();

        $this->assertDatabaseHas('users', [
            'username' => 'JP9988776',
            'name' => 'JUAN CARLOS PÉREZ',
            'ci' => '9988776',
            'rol' => 'investigador',
            'creado_por_id' => $this->admin->id,
            'debe_cambiar_password' => true,
        ]);
    }

    public function test_username_generator(): void
    {
        $this->assertSame('JP123456-1A', UsernameGenerator::para('Juan Carlos', 'Pérez López', '123456-1a'));
        $this->assertSame('MG71234568', UsernameGenerator::para('María', 'García', ' 71234568 '));
        $this->assertSame('123456-1B', UsernameGenerator::normalizarCi(' 123456-1b '));
    }

    public function test_jefe_no_crea_admin(): void
    {
        $this->actingAs($this->jefe)
            ->post('/admin/usuarios', $this->payload(['rol' => 'admin', 'ci' => '1111111']))
            ->assertSessionHasErrors('rol');

        $this->assertDatabaseMissing('users', ['ci' => '1111111']);
    }

    public function test_jefe_no_ve_admins_en_listado(): void
    {
        $this->actingAs($this->jefe)
            ->get('/admin/usuarios')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Usuarios')
                ->has('usuarios', 4)
                ->where('contadores.admins', 1)
                ->where('contadores.jefes', 1)
            );
    }

    public function test_investigador_no_entra_al_panel(): void
    {
        $this->actingAs($this->inv1)->get('/admin/usuarios')->assertRedirect('/dashboard');
    }

    public function test_ci_duplicado_se_rechaza(): void
    {
        $this->actingAs($this->admin)->post('/admin/usuarios', $this->payload());

        $this->actingAs($this->admin)
            ->post('/admin/usuarios', $this->payload(['nombres' => 'OTRO']))
            ->assertSessionHasErrors('ci');
    }

    public function test_ci_inactivo_no_se_duplica(): void
    {
        $this->inv2->update(['activo' => false]);
        $ci = $this->inv2->ci;

        $this->actingAs($this->admin)
            ->post('/admin/usuarios', $this->payload(['ci' => $ci]))
            ->assertSessionHasErrors('ci');
    }

    public function test_password_debil_se_rechaza(): void
    {
        $this->actingAs($this->admin)
            ->post('/admin/usuarios', $this->payload(['ci' => '2222222', 'password' => 'corta']))
            ->assertSessionHasErrors('password');
    }

    public function test_no_auto_baja(): void
    {
        $this->actingAs($this->jefe)
            ->post("/admin/usuarios/{$this->jefe->id}/desactivar", [])
            ->assertSessionHas('error');

        $this->assertTrue($this->jefe->fresh()->activo);
    }

    public function test_ultimo_admin_bloqueado(): void
    {
        $this->actingAs($this->admin)
            ->post("/admin/usuarios/{$this->admin->id}/desactivar", [])
            ->assertSessionHas('error');

        $this->assertTrue($this->admin->fresh()->activo);
    }

    public function test_ultimo_jefe_bloqueado(): void
    {
        $this->actingAs($this->admin)
            ->post("/admin/usuarios/{$this->jefe->id}/desactivar", [])
            ->assertSessionHas('error');

        $this->assertTrue($this->jefe->fresh()->activo);
    }

    public function test_degradar_ultimo_jefe_bloqueado(): void
    {
        $this->actingAs($this->admin)
            ->post("/admin/usuarios/{$this->jefe->id}", [
                'nombres' => $this->jefe->nombres,
                'apellidos' => $this->jefe->apellidos,
                'rol' => 'investigador',
            ])
            ->assertSessionHasErrors('rol');

        $this->assertSame('jefe', $this->jefe->fresh()->rol);
    }

    public function test_desactivar_con_casos_bloquea_sin_traspaso(): void
    {
        $this->denuncia();
        $this->denuncia();

        $this->actingAs($this->jefe)
            ->post("/admin/usuarios/{$this->inv1->id}/desactivar", ['motivo_baja' => 'FIN DE CONTRATO'])
            ->assertSessionHasErrors('traspaso_a');

        $this->assertTrue($this->inv1->fresh()->activo);
    }

    public function test_desactivar_con_traspaso_en_lote(): void
    {
        $d1 = $this->denuncia();
        $d2 = $this->denuncia();

        $this->actingAs($this->jefe)
            ->post("/admin/usuarios/{$this->inv1->id}/desactivar", [
                'motivo_baja' => 'FIN DE CONTRATO',
                'traspaso_a' => $this->inv2->id,
                'justificacion' => 'RELEVO POR FIN DE CONTRATO',
            ])
            ->assertSessionHasNoErrors();

        $this->assertFalse($this->inv1->fresh()->activo);
        $this->assertSame($this->jefe->id, $this->inv1->fresh()->desactivado_por_id);
        $this->assertSame($this->inv2->id, $d1->fresh()->investigador_id);
        $this->assertSame($this->inv2->id, $d2->fresh()->investigador_id);
        $this->assertSame($this->inv1->id, $d1->fresh()->investigador_anterior_id);
        $this->assertDatabaseHas('bitacora', ['denuncia_id' => $d1->id, 'accion' => 'traspaso']);
    }

    public function test_reset_password_revocay_muestra_una_vez(): void
    {
        $viejo = $this->inv1->password;

        $this->actingAs($this->admin)
            ->post("/admin/usuarios/{$this->inv1->id}/reset", [])
            ->assertSessionHasNoErrors()
            ->assertSessionHas('credencialTemporal');

        $this->inv1->refresh();
        $this->assertNotSame($viejo, $this->inv1->password);
        $this->assertTrue((bool) $this->inv1->debe_cambiar_password);
        $this->assertSame($this->inv1->username, session('credencialTemporal')['username']);
    }

    public function test_reset_propio_bloqueado(): void
    {
        $this->actingAs($this->admin)
            ->post("/admin/usuarios/{$this->admin->id}/reset", [])
            ->assertSessionHas('error');
    }

    public function test_masivo_se_detiene_con_casos_pendientes(): void
    {
        $this->denuncia(['investigador_id' => $this->inv1->id]);

        $this->actingAs($this->jefe)
            ->post('/admin/usuarios/masivo', ['ids' => [$this->inv1->id, $this->inv2->id], 'accion' => 'desactivar'])
            ->assertSessionHasErrors('lote');

        $this->assertTrue($this->inv1->fresh()->activo);
        $this->assertTrue($this->inv2->fresh()->activo);
    }

    public function test_reactivar_limpia_flags(): void
    {
        $this->inv2->update([
            'activo' => false,
            'desactivado_at' => now(),
            'desactivado_por_id' => $this->jefe->id,
            'motivo_baja' => 'PRUEBA',
        ]);

        $this->actingAs($this->jefe)
            ->post("/admin/usuarios/{$this->inv2->id}/reactivar", [])
            ->assertSessionHasNoErrors();

        $u = $this->inv2->fresh();
        $this->assertTrue((bool) $u->activo);
        $this->assertNull($u->desactivado_at);
        $this->assertNull($u->motivo_baja);
    }

    public function test_impacto_muestra_casos(): void
    {
        $d = $this->denuncia();

        $this->actingAs($this->jefe)
            ->get("/admin/usuarios/{$this->inv1->id}/impacto")
            ->assertOk()
            ->assertJsonPath('total_casos', 1)
            ->assertJsonPath('casos_activos.0.ticket', $d->ticket);
    }
}
