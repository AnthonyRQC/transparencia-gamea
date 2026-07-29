<?php

namespace Tests\Feature;

use App\Models\CategoriaDenuncia;
use App\Models\ConfiguracionSistema;
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

    public function test_jefe_can_delete_categoria(): void
    {
        $this->actingAs($this->jefe);

        $cat = CategoriaDenuncia::create([
            'clave' => 'test_cat_del',
            'nombre' => 'TEST ELIMINAR',
            'tipo_denuncia' => 'corrupcion',
        ]);

        $response = $this->post("/admin/catalogos/categorias/{$cat->id}/eliminar");

        $response->assertSessionHas('success');
        $this->assertDatabaseMissing('categorias_denuncia', [
            'id' => $cat->id,
        ]);
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

    public function test_jefe_can_delete_unidad(): void
    {
        $this->actingAs($this->jefe);

        $unidad = UnidadExterna::create([
            'clave' => 'test_uni_del',
            'nombre' => 'UNIDAD ELIMINAR',
        ]);

        $response = $this->post("/admin/catalogos/unidades/{$unidad->id}/eliminar");

        $response->assertSessionHas('success');
        $this->assertDatabaseMissing('unidades_externas', [
            'id' => $unidad->id,
        ]);
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

    public function test_jefe_can_delete_feriado(): void
    {
        $this->actingAs($this->jefe);

        $feriado = Feriado::create([
            'fecha' => '2026-12-08',
            'nombre' => 'FERIADO TEST',
            'recurrente' => false,
        ]);

        $response = $this->post("/admin/catalogos/feriados/{$feriado->id}/eliminar");

        $response->assertSessionHas('success');
        $this->assertModelMissing($feriado);
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
