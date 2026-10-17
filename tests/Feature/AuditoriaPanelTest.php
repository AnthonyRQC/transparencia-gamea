<?php

namespace Tests\Feature;

use App\Models\Bitacora;
use App\Models\Denuncia;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AuditoriaPanelTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $jefe;
    private User $investigador;
    private User $registrador;
    private Denuncia $denuncia;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create([
            'username' => 'admin_auditoria',
            'rol' => 'admin',
            'activo' => true,
        ]);

        $this->jefe = User::factory()->create([
            'username' => 'jefe_auditoria',
            'rol' => 'jefe',
            'activo' => true,
        ]);

        $this->investigador = User::factory()->create([
            'username' => 'inv_auditoria',
            'rol' => 'investigador',
            'activo' => true,
        ]);

        $this->registrador = User::factory()->create([
            'username' => 'reg_auditoria',
            'rol' => 'registrador',
            'activo' => true,
        ]);

        $this->denuncia = Denuncia::factory()->create([
            'ticket' => 'DEN-2026-0700',
            'token_consulta' => '7700',
            'estado' => 'investigacion',
            'investigador_id' => $this->investigador->id,
        ]);
    }

    public function test_solo_admin_accede_al_panel_de_auditoria_otros_roles_redirigen(): void
    {
        // Invitado -> login
        $this->get(route('admin.auditoria.index'))->assertRedirect(route('login'));

        // Investigador -> dashboard + error
        $this->actingAs($this->investigador)
            ->get(route('admin.auditoria.index'))
            ->assertRedirect(route('dashboard'));

        // Registrador -> dashboard + error
        $this->actingAs($this->registrador)
            ->get(route('admin.auditoria.index'))
            ->assertRedirect(route('dashboard'));

        // Jefe -> dashboard + error
        $this->actingAs($this->jefe)
            ->get(route('admin.auditoria.index'))
            ->assertRedirect(route('dashboard'));

        // Admin -> 200 OK
        $this->actingAs($this->admin)
            ->get(route('admin.auditoria.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Admin/Auditoria'));
    }

    public function test_proyeccion_tecnica_no_expone_detalle_y_expone_user_agent(): void
    {
        Bitacora::create([
            'denuncia_id' => $this->denuncia->id,
            'accion' => 'hecho_delictivo',
            'detalle' => 'ESTE ES UN DETALLE ULTRA SECRETO DEL CASO',
            'usuario_id' => $this->investigador->id,
            'fecha' => now(),
            'user_agent' => 'AdminAuditUA/1.0',
        ]);

        $response = $this->actingAs($this->admin)->get(route('admin.auditoria.index'));

        $response->assertOk();

        // 1. Props-level check: eventos.data rows do NOT contain detalle
        $response->assertInertia(function (Assert $page) {
            $page->component('Admin/Auditoria');
            $props = $page->toArray()['props'];
            $eventos = $props['eventos']['data'];
            $this->assertNotEmpty($eventos);
            foreach ($eventos as $ev) {
                $this->assertArrayNotHasKey('detalle', $ev);
                $this->assertArrayHasKey('user_agent', $ev);
            }
        });

        // 2. Response level assertDontSee
        $response->assertDontSee('ESTE ES UN DETALLE ULTRA SECRETO DEL CASO');
        $response->assertDontSee('"detalle"');
        $response->assertSee('AdminAuditUA');
        $response->assertInertia(fn (Assert $page) => $page->where('eventos.data.0.user_agent', 'AdminAuditUA/1.0'));
    }

    public function test_auditoria_panel_se_registra_en_navegacion_y_filtros_pero_no_en_paginacion_pura(): void
    {
        // 1. Navegación inicial (sin ?page) -> registra auditoria_panel
        $this->actingAs($this->admin)->get(route('admin.auditoria.index'))->assertOk();

        $this->assertDatabaseHas('bitacora', [
            'accion' => 'auditoria_panel',
            'usuario_id' => $this->admin->id,
            'denuncia_id' => null,
        ]);

        $conteoInicial = Bitacora::where('accion', 'auditoria_panel')->count();
        $this->assertSame(1, $conteoInicial);

        // 2. Filtro (sin ?page) -> registra nueva huella
        $this->actingAs($this->admin)->get(route('admin.auditoria.index', ['ticket' => 'DEN-2026-0700']))->assertOk();
        $this->assertSame(2, Bitacora::where('accion', 'auditoria_panel')->count());

        // 3. Paginación pura (?page=2) -> NO agrega nueva fila de huella
        $this->actingAs($this->admin)->get(route('admin.auditoria.index', ['page' => 2]))->assertOk();
        $this->assertSame(2, Bitacora::where('accion', 'auditoria_panel')->count());
    }

    public function test_filtro_rango_fechas_es_boundary_inclusive(): void
    {
        $inicioDia = Carbon::parse('2026-10-15 00:00:00');
        $finDia = Carbon::parse('2026-10-15 23:59:59');
        $otroDia = Carbon::parse('2026-10-16 00:00:01');

        Bitacora::create([
            'denuncia_id' => $this->denuncia->id,
            'accion' => 'accion_inicio',
            'detalle' => 'INICIO',
            'usuario_id' => $this->investigador->id,
            'fecha' => $inicioDia,
        ]);

        Bitacora::create([
            'denuncia_id' => $this->denuncia->id,
            'accion' => 'accion_fin',
            'detalle' => 'FIN',
            'usuario_id' => $this->investigador->id,
            'fecha' => $finDia,
        ]);

        Bitacora::create([
            'denuncia_id' => $this->denuncia->id,
            'accion' => 'accion_fuera',
            'detalle' => 'FUERA',
            'usuario_id' => $this->investigador->id,
            'fecha' => $otroDia,
        ]);

        $response = $this->actingAs($this->admin)->get(route('admin.auditoria.index', [
            'desde' => '2026-10-15',
            'hasta' => '2026-10-15',
        ]));

        $response->assertOk();
        $response->assertInertia(function (Assert $page) {
            $props = $page->toArray()['props'];
            $acciones = array_column($props['eventos']['data'], 'accion');
            $this->assertContains('accion_inicio', $acciones);
            $this->assertContains('accion_fin', $acciones);
            $this->assertNotContains('accion_fuera', $acciones);
        });
    }

    public function test_filtro_accion_desconocida_devuelve_lista_vacia_sin_error(): void
    {
        $response = $this->actingAs($this->admin)->get(route('admin.auditoria.index', [
            'accion' => 'accion_inexistente_xyz',
        ]));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->where('eventos.total', 0)
            ->where('eventos.data', [])
        );
    }

    public function test_filtro_tipo_descargas_con_y_sin_datos(): void
    {
        // Sin descargas
        Bitacora::create([
            'denuncia_id' => $this->denuncia->id,
            'accion' => 'otra_accion',
            'detalle' => 'OTRO',
            'usuario_id' => $this->investigador->id,
            'fecha' => now(),
        ]);

        $res1 = $this->actingAs($this->admin)->get(route('admin.auditoria.index', ['tipo' => 'descargas']));
        $res1->assertOk();
        $res1->assertInertia(fn (Assert $page) => $page->where('eventos.total', 0));

        // Con descarga
        Bitacora::create([
            'denuncia_id' => $this->denuncia->id,
            'accion' => 'archivo_descargado',
            'detalle' => 'DESCARGA ARCHIVO #1',
            'usuario_id' => $this->jefe->id,
            'fecha' => now(),
        ]);

        $res2 = $this->actingAs($this->admin)->get(route('admin.auditoria.index', ['tipo' => 'descargas']));
        $res2->assertOk();
        $res2->assertInertia(function (Assert $page) {
            $props = $page->toArray()['props'];
            $this->assertGreaterThanOrEqual(1, $props['eventos']['total']);
            $this->assertSame('archivo_descargado', $props['eventos']['data'][0]['accion']);
        });
    }

    public function test_fila_de_caso_eliminado_conserva_su_ticket_actual(): void
    {
        Bitacora::create([
            'denuncia_id' => $this->denuncia->id,
            'accion' => 'eliminacion',
            'detalle' => 'ELIMINACION DEL CASO',
            'usuario_id' => $this->jefe->id,
            'fecha' => now(),
        ]);

        // Simular eliminación soft-delete con cambio de ticket a DEL-
        $this->denuncia->ticket = 'DEL-2026-0700-1';
        $this->denuncia->save();
        $this->denuncia->delete();

        $response = $this->actingAs($this->admin)->get(route('admin.auditoria.index', [
            'ticket' => 'DEL-2026-0700-1',
        ]));

        $response->assertOk();
        $response->assertInertia(function (Assert $page) {
            $props = $page->toArray()['props'];
            $this->assertGreaterThanOrEqual(1, $props['eventos']['total']);
            $this->assertSame('DEL-2026-0700-1', $props['eventos']['data'][0]['ticket']);
        });
    }
}
