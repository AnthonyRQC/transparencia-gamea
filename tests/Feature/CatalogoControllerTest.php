<?php

namespace Tests\Feature;

use App\Models\Bitacora;
use App\Models\CategoriaDenuncia;
use App\Models\ConfiguracionSistema;
use App\Models\Denuncia;
use App\Models\UnidadExterna;
use App\Models\Feriado;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CatalogoControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $jefe;
    private User $registrador;

    protected function setUp(): void
    {
        parent::setUp();

        $this->jefe = User::factory()->create([
            'username' => 'jefe',
            'rol' => 'jefe',
            'activo' => true,
        ]);

        $this->registrador = User::factory()->create([
            'username' => 'registrador',
            'rol' => 'registrador',
            'activo' => true,
        ]);

        ConfiguracionSistema::create([
            'clave' => 'catalogo_clasificaciones',
            'valor' => json_encode([
                ['id' => 1, 'nombre' => 'PENAL', 'activo' => true],
            ]),
            'descripcion' => 'CLASIFICACIONES FINALES',
        ]);
    }

    public function test_jefe_can_view_catalogos_page(): void
    {
        $this->actingAs($this->jefe);

        $response = $this->get('/admin/catalogos');

        $response->assertStatus(200);
        $response->assertInertia(fn($page) => $page->component('Admin/Catalogos'));
    }

    public function test_registrador_can_view_catalogos_page(): void
    {
        $this->actingAs($this->registrador);

        $response = $this->get('/admin/catalogos');

        $response->assertStatus(200);
        $response->assertInertia(fn($page) => $page->component('Admin/Catalogos'));
    }

    public function test_jefe_can_create_categoria(): void
    {
        $this->actingAs($this->jefe);

        $response = $this->post('/admin/catalogos/categorias', [
            'nombre' => 'TEST CATEGORÍA',
            'tipo_denuncia' => 'corrupcion',
            'activa' => true,
        ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('categorias_denuncia', [
            'nombre' => 'TEST CATEGORÍA',
            'clave' => 'test_categoria',
            'tipo_denuncia' => 'corrupcion',
            'activa' => 1,
        ]);
    }

    public function test_jefe_can_update_categoria(): void
    {
        $this->actingAs($this->jefe);

        $cat = CategoriaDenuncia::create([
            'clave' => 'test_cat',
            'nombre' => 'TEST ORIGINAL',
            'tipo_denuncia' => 'corrupcion',
        ]);

        $response = $this->post("/admin/catalogos/categorias/{$cat->id}", [
            'nombre' => 'TEST ACTUALIZADO',
            'tipo_denuncia' => 'corrupcion',
            'activa' => false,
        ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('categorias_denuncia', [
            'id' => $cat->id,
            'nombre' => 'TEST ACTUALIZADO',
            'clave' => 'test_actualizado',
            'activa' => 0,
        ]);
    }

    public function test_categoria_desactivar(): void
    {
        $this->actingAs($this->jefe);

        $cat = CategoriaDenuncia::create([
            'clave' => 'test_cat',
            'nombre' => 'TEST CATEGORÍA',
            'tipo_denuncia' => 'corrupcion',
        ]);

        $response = $this->post("/admin/catalogos/categorias/{$cat->id}/eliminar");

        $response->assertSessionHas('success');
        $cat->refresh();
        $this->assertFalse($cat->activa);
        $this->assertNotNull($cat->fecha_desactivacion);
        $this->assertEquals($this->jefe->id, $cat->desactivado_por_id);

        $this->assertDatabaseHas('bitacora', [
            'entidad_tipo' => 'App\Models\CategoriaDenuncia',
            'entidad_id' => $cat->id,
            'accion' => 'desactivar',
            'usuario_id' => $this->jefe->id,
        ]);
    }

    public function test_categoria_no_hard_delete(): void
    {
        $this->actingAs($this->jefe);

        $cat = CategoriaDenuncia::create([
            'clave' => 'test_cat',
            'nombre' => 'TEST CATEGORÍA',
            'tipo_denuncia' => 'corrupcion',
        ]);

        $this->post("/admin/catalogos/categorias/{$cat->id}/eliminar");

        $this->assertDatabaseHas('categorias_denuncia', [
            'id' => $cat->id,
            'nombre' => 'TEST CATEGORÍA',
        ]);
    }

    public function test_categoria_reactivar(): void
    {
        $this->actingAs($this->jefe);

        $cat = CategoriaDenuncia::create([
            'clave' => 'test_cat',
            'nombre' => 'TEST CATEGORÍA',
            'tipo_denuncia' => 'corrupcion',
            'activa' => false,
            'fecha_desactivacion' => now(),
            'desactivado_por_id' => $this->jefe->id,
        ]);

        $response = $this->post("/admin/catalogos/categorias/{$cat->id}/reactivar");

        $response->assertSessionHas('success');
        $cat->refresh();
        $this->assertTrue($cat->activa);
        $this->assertNull($cat->fecha_desactivacion);
        $this->assertNull($cat->desactivado_por_id);

        $this->assertDatabaseHas('bitacora', [
            'entidad_tipo' => 'App\Models\CategoriaDenuncia',
            'entidad_id' => $cat->id,
            'accion' => 'reactivar',
            'usuario_id' => $this->jefe->id,
        ]);
    }

    public function test_categoria_desactivar_con_denuncias_asociadas(): void
    {
        $this->actingAs($this->jefe);

        $cat = CategoriaDenuncia::create([
            'clave' => 'test_cat',
            'nombre' => 'TEST CATEGORÍA',
            'tipo_denuncia' => 'corrupcion',
        ]);

        $denuncia = Denuncia::factory()->create([
            'categoria_id' => $cat->id,
            'estado' => 'ingresada',
        ]);

        $response = $this->get('/admin/catalogos');
        $response->assertInertia(fn($page) => $page
            ->where('catalogos.categorias.items.0.denuncias_count', 1)
        );
    }

    public function test_tipos_denuncia_no_desactivable(): void
    {
        $this->actingAs($this->jefe);

        $response = $this->post('/admin/catalogos/tipos_denuncia/1/eliminar');

        $response->assertSessionHasErrors(['error']);
    }

    public function test_estados_no_eliminable(): void
    {
        $this->actingAs($this->jefe);

        $response = $this->post('/admin/catalogos/estados/1/eliminar');

        $response->assertSessionHasErrors(['error']);
    }

    public function test_tipos_denuncia_no_creable(): void
    {
        $this->actingAs($this->jefe);

        $response = $this->post('/admin/catalogos/tipos_denuncia', [
            'nombre' => 'TEST TIPO',
            'activo' => true,
        ]);

        $response->assertSessionHasErrors(['error']);
    }

    public function test_unidad_desactivar(): void
    {
        $this->actingAs($this->jefe);

        $unidad = UnidadExterna::create([
            'clave' => 'test_uni',
            'nombre' => 'TEST UNIDAD',
        ]);

        $response = $this->post("/admin/catalogos/unidades/{$unidad->id}/eliminar");

        $response->assertSessionHas('success');
        $unidad->refresh();
        $this->assertFalse($unidad->activa);
        $this->assertNotNull($unidad->fecha_desactivacion);

        $this->assertDatabaseHas('bitacora', [
            'entidad_tipo' => 'App\Models\UnidadExterna',
            'entidad_id' => $unidad->id,
            'accion' => 'desactivar',
        ]);
    }

    public function test_unidad_reactivar(): void
    {
        $this->actingAs($this->jefe);

        $unidad = UnidadExterna::create([
            'clave' => 'test_uni',
            'nombre' => 'TEST UNIDAD',
            'activa' => false,
            'fecha_desactivacion' => now(),
            'desactivado_por_id' => $this->jefe->id,
        ]);

        $response = $this->post("/admin/catalogos/unidades/{$unidad->id}/reactivar");

        $response->assertSessionHas('success');
        $unidad->refresh();
        $this->assertTrue($unidad->activa);
        $this->assertNull($unidad->fecha_desactivacion);
    }

    public function test_feriado_soft_delete(): void
    {
        $this->actingAs($this->jefe);

        $feriado = Feriado::create([
            'fecha' => '2026-12-08',
            'nombre' => 'FERIADO TEST',
            'recurrente' => false,
        ]);

        $response = $this->post("/admin/catalogos/feriados/{$feriado->id}/eliminar");

        $response->assertSessionHas('success');
        $this->assertSoftDeleted($feriado);
    }

    public function test_feriado_reactivar(): void
    {
        $this->actingAs($this->jefe);

        $feriado = Feriado::create([
            'fecha' => '2026-12-08',
            'nombre' => 'FERIADO TEST',
            'recurrente' => false,
        ]);
        $feriado->delete();

        $response = $this->post("/admin/catalogos/feriados/{$feriado->id}/reactivar");

        $response->assertSessionHas('success');
        $this->assertNotSoftDeleted($feriado);
    }

    public function test_categoria_reactivar_con_store(): void
    {
        $this->actingAs($this->jefe);

        CategoriaDenuncia::create([
            'clave' => 'test_react',
            'nombre' => 'REACTIVAR TEST',
            'tipo_denuncia' => 'corrupcion',
            'activa' => false,
            'fecha_desactivacion' => now(),
            'desactivado_por_id' => $this->jefe->id,
        ]);

        $response = $this->post('/admin/catalogos/categorias', [
            'nombre' => 'REACTIVAR TEST',
            'tipo_denuncia' => 'corrupcion',
        ]);

        $response->assertSessionHas('success');
        $cat = CategoriaDenuncia::where('nombre', 'REACTIVAR TEST')->first();
        $this->assertTrue($cat->activa);
        $this->assertNull($cat->fecha_desactivacion);
    }

    public function test_jefe_can_create_feriado(): void
    {
        $this->actingAs($this->jefe);

        $response = $this->post('/admin/catalogos/feriados', [
            'fecha' => '2026-12-08',
            'nombre' => 'FERIADO TEST',
            'recurrente' => false,
        ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('feriados', [
            'nombre' => 'FERIADO TEST',
        ]);
        $feriado = Feriado::where('nombre', 'FERIADO TEST')->first();
        $this->assertNotNull($feriado);
        $this->assertEquals('2026-12-08', $feriado->fecha->format('Y-m-d'));
    }

    public function test_jefe_can_create_unidad(): void
    {
        $this->actingAs($this->jefe);

        $response = $this->post('/admin/catalogos/unidades', [
            'clave' => 'test_unidad',
            'nombre' => 'TEST UNIDAD',
            'activa' => true,
        ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('unidades_externas', [
            'clave' => 'test_unidad',
            'nombre' => 'TEST UNIDAD',
        ]);
    }

    public function test_jefe_can_update_unidad(): void
    {
        $this->actingAs($this->jefe);

        $unidad = UnidadExterna::create([
            'clave' => 'test_uni',
            'nombre' => 'UNIDAD ORIGINAL',
        ]);

        $response = $this->post("/admin/catalogos/unidades/{$unidad->id}", [
            'clave' => 'test_uni',
            'nombre' => 'UNIDAD ACTUALIZADA',
            'activa' => false,
        ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('unidades_externas', [
            'id' => $unidad->id,
            'nombre' => 'UNIDAD ACTUALIZADA',
        ]);
    }

    public function test_jefe_can_add_config_based_item(): void
    {
        $this->actingAs($this->jefe);

        $response = $this->post('/admin/catalogos/clasificaciones', [
            'nombre' => 'TEST CLASIFICACIÓN',
            'activo' => true,
        ]);

        $response->assertSessionHas('success');

        $config = ConfiguracionSistema::where('clave', 'catalogo_clasificaciones')->first();
        $items = json_decode($config->valor, true);
        $this->assertCount(2, $items);
        $this->assertEquals('TEST CLASIFICACIÓN', $items[1]['nombre']);
    }

    public function test_jefe_can_update_config_based_item(): void
    {
        $this->actingAs($this->jefe);

        $response = $this->post('/admin/catalogos/clasificaciones/1', [
            'nombre' => 'PENAL ACTUALIZADO',
            'activo' => true,
        ]);

        $response->assertSessionHas('success');

        $config = ConfiguracionSistema::where('clave', 'catalogo_clasificaciones')->first();
        $items = json_decode($config->valor, true);
        $this->assertEquals('PENAL ACTUALIZADO', $items[0]['nombre']);
    }

    public function test_jefe_can_delete_config_based_item(): void
    {
        $this->actingAs($this->jefe);

        $response = $this->post('/admin/catalogos/clasificaciones/1/eliminar');

        $response->assertSessionHas('success');

        $config = ConfiguracionSistema::where('clave', 'catalogo_clasificaciones')->first();
        $items = json_decode($config->valor, true);
        $this->assertCount(0, $items);
    }

    public function test_categoria_validates_unique_name(): void
    {
        $this->actingAs($this->jefe);

        $response = $this->post('/admin/catalogos/categorias', [
            'nombre' => 'CATEGORÍA ÚNICA',
            'tipo_denuncia' => 'corrupcion',
        ]);
        $response->assertSessionHas('success');

        $response = $this->post('/admin/catalogos/categorias', [
            'nombre' => 'CATEGORÍA ÚNICA',
            'tipo_denuncia' => 'corrupcion',
        ]);
        $response->assertSessionMissing('success');
    }

    public function test_catalogos_page_has_all_types(): void
    {
        $this->actingAs($this->jefe);

        $response = $this->get('/admin/catalogos');

        $response->assertInertia(fn($page) => $page
            ->component('Admin/Catalogos')
            ->has('catalogos.categorias')
            ->has('catalogos.unidades')
            ->has('catalogos.feriados')
            ->has('catalogos.clasificaciones')
            ->has('catalogos.tipos_denuncia')
            ->has('catalogos.estados')
            ->has('catalogos.medios_notificacion')
            ->has('catalogos.tipos_prueba')
        );
    }
}
