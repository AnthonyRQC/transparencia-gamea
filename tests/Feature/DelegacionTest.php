<?php

namespace Tests\Feature;

use App\Data\PermisosCatalogo;
use App\Models\CategoriaDenuncia;
use App\Models\Delegacion;
use App\Models\Denuncia;
use App\Models\User;
use App\Services\PermisosEfectivos;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Sprint 18C — delegaciones temporales: misma cuenta, dos funciones.
 */
class DelegacionTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private User $jefe;

    private User $jefe2;

    private User $reg;

    private User $inv;

    private int $n = 0;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create(['username' => 'admin', 'rol' => 'admin', 'activo' => true]);
        $this->jefe = User::factory()->create(['username' => 'eljefe', 'rol' => 'jefe', 'activo' => true]);
        $this->jefe2 = User::factory()->create(['username' => 'eljefe2', 'rol' => 'jefe', 'activo' => true]);
        $this->reg = User::factory()->create(['username' => 'elreg', 'rol' => 'registrador', 'activo' => true]);
        $this->inv = User::factory()->create(['username' => 'elinv', 'rol' => 'investigador', 'activo' => true]);

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
            'ticket' => 'DEN-2026-DEL-' . str_pad((string) $this->n, 3, '0', STR_PAD_LEFT),
            'token_consulta' => str_pad((string) (6000 + $this->n), 4, '0', STR_PAD_LEFT),
            'tipo' => 'corrupcion',
            'escenario' => 'revelada',
            'estado' => 'ingresada',
            'hechos' => 'HECHOS DE PRUEBA DE DELEGACIÓN',
            'declaracion_jurada' => true,
            'categoria_id' => CategoriaDenuncia::first()->id,
            'registrado_por_id' => $this->reg->id,
        ], $overrides));
    }

    private function delegar(User $actor, User $destino, array $permisos, array $extra = []): void
    {
        $this->actingAs($actor)
            ->post('/admin/delegaciones', array_merge([
                'user_id' => $destino->id,
                'permisos' => $permisos,
                'motivo' => 'VACACIONES DEL TITULAR',
            ], $extra))
            ->assertSessionHasNoErrors();
    }

    public function test_jefe_delega_bandeja_a_registrador(): void
    {
        $this->delegar($this->jefe, $this->reg, PermisosCatalogo::PAQUETES['bandeja_admision']);

        $this->assertTrue(PermisosEfectivos::puede($this->reg->fresh(), 'menu.bandeja'));
        $this->assertTrue(PermisosEfectivos::puede($this->reg->fresh(), 'caso.admitir'));
        $this->assertFalse(PermisosEfectivos::puede($this->reg->fresh(), 'informe.crear'));

        $this->actingAs($this->reg)->get('/denuncias')->assertOk();
    }

    public function test_no_delega_usuarios_ni_admin(): void
    {
        foreach (['usuario.crear', 'usuario.editar', 'menu.usuarios', 'admin.catalogo'] as $permiso) {
            $this->actingAs($this->jefe)
                ->post('/admin/delegaciones', [
                    'user_id' => $this->reg->id,
                    'permisos' => [$permiso],
                    'motivo' => 'INTENTO DE ESCALAR',
                ])
                ->assertInvalid(['permisos.0']);
        }

        $this->assertDatabaseCount('delegaciones', 0);
    }

    public function test_no_a_admin_ni_a_si_mismo(): void
    {
        $this->actingAs($this->jefe)
            ->post('/admin/delegaciones', [
                'user_id' => $this->admin->id,
                'permisos' => ['menu.bandeja'],
                'motivo' => 'A UN ADMIN',
            ])
            ->assertSessionHas('error');

        $this->actingAs($this->jefe)
            ->post('/admin/delegaciones', [
                'user_id' => $this->jefe->id,
                'permisos' => ['menu.bandeja'],
                'motivo' => 'A MÍ MISMO',
            ])
            ->assertSessionHas('error');

        $this->assertDatabaseCount('delegaciones', 0);
    }

    public function test_interino_admite_pero_no_informa(): void
    {
        $d = $this->denuncia();
        $this->delegar($this->jefe, $this->reg, PermisosCatalogo::PAQUETES['bandeja_admision']);

        $this->actingAs($this->reg)
            ->post("/denuncias/{$d->ticket}/admitir", [])
            ->assertSessionHasNoErrors();
        $this->assertSame('admitida', $d->fresh()->estado);

        $d2 = $this->denuncia(['estado' => 'informe', 'investigador_id' => $this->inv->id]);
        $this->actingAs($this->reg)
            ->post("/denuncias/{$d2->ticket}/informe", [
                'clasificacion' => 'x',
                'fojas' => 1,
                'justificacion' => 'Y',
                'concluido_por' => 'Z',
            ])
            ->assertRedirect('/dashboard');
    }

    public function test_revoca_otorgante_y_admin_no_otro_jefe(): void
    {
        $this->delegar($this->jefe, $this->reg, ['menu.bandeja']);
        $delegacion = Delegacion::firstOrFail();

        $this->actingAs($this->jefe2)
            ->post("/admin/delegaciones/{$delegacion->id}/revocar", [])
            ->assertSessionHas('error');
        $this->assertNull($delegacion->fresh()->revocado_at);

        $this->actingAs($this->jefe)
            ->post("/admin/delegaciones/{$delegacion->id}/revocar", [])
            ->assertSessionHasNoErrors();
        $this->assertNotNull($delegacion->fresh()->revocado_at);
        $this->assertFalse(PermisosEfectivos::puede($this->reg->fresh(), 'menu.bandeja'));
    }

    public function test_cascada_al_desactivar(): void
    {
        $this->delegar($this->jefe, $this->reg, ['menu.bandeja']);

        $this->actingAs($this->admin)
            ->post("/admin/usuarios/{$this->reg->id}/desactivar", [])
            ->assertSessionHasNoErrors();

        $this->assertNotNull(Delegacion::firstOrFail()->fresh()->revocado_at);
        $this->assertFalse(PermisosEfectivos::puede($this->reg->fresh(), 'menu.bandeja'));
    }

    public function test_expirada_y_programada_no_aplican(): void
    {
        Delegacion::create([
            'user_id' => $this->reg->id,
            'permisos' => ['menu.bandeja'],
            'desde' => now()->subDays(5),
            'hasta' => now()->subDay(),
            'motivo' => 'VENCIDA',
            'otorgado_por_id' => $this->jefe->id,
        ]);
        $this->assertFalse(PermisosEfectivos::puede($this->reg->fresh(), 'menu.bandeja'));

        Delegacion::create([
            'user_id' => $this->reg->id,
            'permisos' => ['menu.reportes'],
            'desde' => now()->addDay(),
            'hasta' => null,
            'motivo' => 'FUTURA',
            'otorgado_por_id' => $this->jefe->id,
        ]);
        $this->assertFalse(PermisosEfectivos::puede($this->reg->fresh(), 'menu.reportes'));
    }

    public function test_paquetes_dentro_de_whitelist_y_catalogo(): void
    {
        foreach (PermisosCatalogo::PAQUETES as $nombre => $permisos) {
            foreach ($permisos as $permiso) {
                $this->assertArrayHasKey($permiso, PermisosCatalogo::PERMISOS, "{$nombre}: {$permiso} no existe");
                $this->assertContains($permiso, PermisosCatalogo::DELEGABLE, "{$nombre}: {$permiso} fuera de whitelist");
            }
        }
    }

    public function test_admin_delega_a_investigador(): void
    {
        $this->delegar($this->admin, $this->inv, PermisosCatalogo::PAQUETES['reportes']);

        $this->assertTrue(PermisosEfectivos::puede($this->inv->fresh(), 'reporte.exportar'));
        $this->actingAs($this->inv)->get('/reportes')->assertOk();
    }
}
