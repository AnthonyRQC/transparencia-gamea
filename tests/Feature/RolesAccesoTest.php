<?php

namespace Tests\Feature;

use App\Data\PermisosCatalogo;
use App\Models\CategoriaDenuncia;
use App\Models\Clasificacion;
use App\Models\Denuncia;
use App\Models\User;
use App\Services\AlertasPlazo;
use App\Services\CasoAuth;
use App\Services\PermisosEfectivos;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

/**
 * Sprint 16.2 — matriz de acceso, CasoAuth, carreras, EnsureActive.
 */
class RolesAccesoTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private User $jefe;

    private User $registrador;

    private User $inv1;

    private User $inv2;

    private int $n = 0;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create(['username' => 'admin', 'rol' => 'admin', 'activo' => true]);
        $this->jefe = User::factory()->create(['username' => 'jefe', 'rol' => 'jefe', 'activo' => true, 'password' => Hash::make('demo123')]);
        $this->registrador = User::factory()->create(['username' => 'registrador', 'rol' => 'registrador', 'activo' => true]);
        $this->inv1 = User::factory()->create(['username' => 'investigador1', 'rol' => 'investigador', 'activo' => true]);
        $this->inv2 = User::factory()->create(['username' => 'investigador2', 'rol' => 'investigador', 'activo' => true]);

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
    }

    private function denuncia(array $overrides = []): Denuncia
    {
        $this->n++;

        return Denuncia::forceCreate(array_merge([
            'ticket' => 'DEN-2026-ACC-' . str_pad((string) $this->n, 3, '0', STR_PAD_LEFT),
            'token_consulta' => str_pad((string) (3000 + $this->n), 4, '0', STR_PAD_LEFT),
            'tipo' => 'corrupcion',
            'escenario' => 'revelada',
            'estado' => 'ingresada',
            'hechos' => 'HECHOS DE PRUEBA DE ACCESO',
            'declaracion_jurada' => true,
            'categoria_id' => CategoriaDenuncia::first()->id,
            'registrado_por_id' => $this->registrador->id,
        ], $overrides));
    }

    public function test_jefe_admite_denuncia_ingresada(): void
    {
        $d = $this->denuncia();

        $this->actingAs($this->jefe)
            ->post("/denuncias/{$d->ticket}/admitir", [])
            ->assertSessionHasNoErrors();

        $this->assertSame('admitida', $d->fresh()->estado);
        $this->assertDatabaseHas('bitacora', [
            'denuncia_id' => $d->id,
            'accion' => 'admitida',
            'usuario_id' => $this->jefe->id,
        ]);
    }

    public function test_investigador_no_entra_a_bandeja(): void
    {
        $this->actingAs($this->inv1)
            ->get('/denuncias')
            ->assertRedirect('/dashboard');
    }

    public function test_registrador_no_admite(): void
    {
        $d = $this->denuncia();

        $this->actingAs($this->registrador)
            ->post("/denuncias/{$d->ticket}/admitir", [])
            ->assertRedirect('/dashboard');

        $this->assertSame('ingresada', $d->fresh()->estado);
    }

    public function test_invitado_va_a_login(): void
    {
        $this->get('/denuncias')->assertRedirect('/login');
    }

    public function test_investigador_no_crea_informe_en_caso_ajeno(): void
    {
        $d = $this->denuncia(['estado' => 'asignada', 'investigador_id' => $this->inv1->id]);

        $this->actingAs($this->inv2)
            ->post("/denuncias/{$d->ticket}/informe", [
                'clasificacion' => 'administrativo',
                'fojas' => 10,
                'justificacion' => 'JUSTIFICACIÓN SUFICIENTEMENTE LARGA PARA PASAR VALIDACIÓN',
                'concluido_por' => 'INVESTIGADOR DOS',
            ])
            ->assertSessionHas('error', 'NO TIENES PERMISO PARA OPERAR ESTE CASO.');

        $this->assertSame('asignada', $d->fresh()->estado);
        $this->assertDatabaseMissing('informes_finales', ['denuncia_id' => $d->id]);
    }

    public function test_investigador_inicia_su_propio_caso(): void
    {
        $d = $this->denuncia(['estado' => 'asignada', 'investigador_id' => $this->inv1->id]);

        $this->actingAs($this->inv1)
            ->post("/denuncias/{$d->ticket}/iniciar", [])
            ->assertSessionHasNoErrors();

        $this->assertSame('investigacion', $d->fresh()->estado);
    }

    public function test_admitir_doble_vez_da_error(): void
    {
        $d = $this->denuncia();

        $this->actingAs($this->jefe)->post("/denuncias/{$d->ticket}/admitir", []);
        $this->assertSame('admitida', $d->fresh()->estado);

        // Secuencial: lo frena el fast-path. En carrera real lo frena el lock
        // y el mensaje nombra a quien procesó (ver mensajeCarrera abajo).
        $this->actingAs($this->jefe)
            ->post("/denuncias/{$d->ticket}/admitir", [])
            ->assertSessionHas('error', 'No se puede admitir esta denuncia.');

        $mensaje = CasoAuth::mensajeCarrera($d->ticket);
        $this->assertStringContainsString('YA FUE PROCESADA POR', $mensaje);
        $this->assertStringContainsString($this->jefe->name, $mensaje);
    }

    public function test_desactivado_pierde_sesion(): void
    {
        $this->actingAs($this->jefe);

        $this->jefe->update(['activo' => false]);

        $this->get('/dashboard')->assertRedirect('/login');
        $this->assertGuest();
    }

    public function test_403_redirige_a_dashboard(): void
    {
        $this->actingAs($this->inv1)
            ->get('/reportes')
            ->assertRedirect('/dashboard');
    }

    public function test_delete_profile_no_existe(): void
    {
        $this->actingAs($this->jefe)
            ->delete('/profile')
            ->assertStatus(405);

        $this->assertDatabaseHas('users', ['id' => $this->jefe->id]);
    }

    public function test_login_case_insensitive(): void
    {
        $this->post('/login', ['username' => 'JEFE', 'password' => 'demo123']);

        $this->assertAuthenticatedAs($this->jefe);
    }

    public function test_catalogo_sincronizado_con_ts(): void
    {
        $ts = file_get_contents(base_path('resources/js/permissions.ts'));
        $this->assertNotFalse($ts);

        foreach (array_keys(PermisosCatalogo::PERMISOS) as $permiso) {
            $this->assertStringContainsString("'{$permiso}'", $ts, "Falta {$permiso} en permissions.ts");
            $this->assertTrue(Gate::has($permiso), "Falta Gate {$permiso}");
        }

        preg_match_all("/'([a-z]+\.[a-z-]+)'/", $ts, $m);
        foreach (array_unique($m[1]) as $permisoTs) {
            $this->assertArrayHasKey($permisoTs, PermisosCatalogo::PERMISOS, "Sobra {$permisoTs} en permissions.ts");
        }
    }

    public function test_gates_por_rol(): void
    {
        $this->assertTrue(Gate::forUser($this->jefe)->allows('caso.admitir'));
        $this->assertFalse(Gate::forUser($this->registrador)->allows('caso.admitir'));
        $this->assertFalse(Gate::forUser($this->inv1)->allows('menu.bandeja'));
        $this->assertTrue(Gate::forUser($this->admin)->allows('usuario.crear'));
        $this->assertFalse(Gate::forUser($this->jefe)->allows('menu.mis-casos'));
    }

    public function test_registrador_sin_campana(): void
    {
        $permisos = PermisosEfectivos::de($this->registrador);

        $this->assertNotContains('menu.notificaciones', $permisos);
        $this->assertNotContains('notificacion.ver', $permisos);
        $this->assertSame([], AlertasPlazo::paraUsuario($this->registrador));
    }

    public function test_admin_no_opera_casos(): void
    {
        $this->actingAs($this->admin)->get('/denuncias')->assertRedirect('/dashboard');
        $this->actingAs($this->admin)->get('/dashboard')->assertOk();
        $this->actingAs($this->admin)->get('/reportes')->assertOk();
    }

    public function test_caso_auth_unidad_vs_expediente(): void
    {
        $propio = $this->denuncia(['estado' => 'asignada', 'investigador_id' => $this->inv1->id]);
        $ajeno = $this->denuncia(['estado' => 'asignada', 'investigador_id' => $this->inv2->id]);

        // Unidad: jefe opera cualquiera.
        $this->assertTrue(CasoAuth::puedeOperar($this->jefe, $ajeno, 'caso.admitir'));
        // Expediente: dueño sí, otro no.
        $this->assertTrue(CasoAuth::puedeOperar($this->inv1, $propio, 'informe.crear'));
        $this->assertFalse(CasoAuth::puedeOperar($this->inv1, $ajeno, 'informe.crear'));
        // Sin permiso base: ni el dueño.
        $this->assertFalse(CasoAuth::puedeOperar($this->registrador, $propio, 'informe.crear'));
        // Archivos: dueño o poder de asignación.
        $this->assertTrue(CasoAuth::puedeOperar($this->jefe, $ajeno, 'archivo.subir'));
        $this->assertTrue(CasoAuth::puedeOperar($this->inv1, $propio, 'archivo.subir'));
        $this->assertFalse(CasoAuth::puedeOperar($this->inv1, $ajeno, 'archivo.subir'));
        // Supervisor (D26): el jefe firma informe/cierre de cualquier caso.
        $this->assertTrue(CasoAuth::puedeOperar($this->jefe, $ajeno, 'informe.crear'));
        $this->assertTrue(CasoAuth::puedeOperar($this->jefe, $ajeno, 'cierre.crear'));
        // Campo (solicitud/descargo/iniciar): solo el dueño, ni el jefe.
        $this->assertFalse(CasoAuth::puedeOperar($this->jefe, $ajeno, 'solicitud.crear'));
        $this->assertFalse(CasoAuth::puedeOperar($this->jefe, $ajeno, 'caso.iniciar'));
    }
}
