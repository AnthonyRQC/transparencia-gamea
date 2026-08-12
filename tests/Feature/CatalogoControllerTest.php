<?php

namespace Tests\Feature;

use App\Models\Bitacora;
use App\Models\CategoriaDenuncia;
use App\Models\Cierre;
use App\Models\Clasificacion;
use App\Models\Denuncia;
use App\Models\DependenciaExterna;
use App\Models\Feriado;
use App\Models\InformeFinal;
use App\Models\MedioNotificacion;
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

        Clasificacion::create([
            'clave' => 'penal',
            'nombre' => 'PENAL',
            'activa' => true,
        ]);

        MedioNotificacion::create([
            'clave' => 'whatsapp',
            'nombre' => 'WHATSAPP',
            'activa' => true,
        ]);

        MedioNotificacion::create([
            'clave' => 'email',
            'nombre' => 'EMAIL',
            'activa' => true,
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

        $unidad = DependenciaExterna::create([
            'nombre' => 'TEST UNIDAD',
        ]);

        $response = $this->post("/admin/catalogos/unidades/{$unidad->id}/eliminar");

        $response->assertSessionHas('success');
        $unidad->refresh();
        $this->assertFalse($unidad->activa);
        $this->assertNotNull($unidad->fecha_desactivacion);

        $this->assertDatabaseHas('bitacora', [
            'entidad_tipo' => 'App\Models\DependenciaExterna',
            'entidad_id' => $unidad->id,
            'accion' => 'desactivar',
        ]);
    }

    public function test_unidad_reactivar(): void
    {
        $this->actingAs($this->jefe);

        $unidad = DependenciaExterna::create([
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

    public function test_unidad_se_puede_mover_de_padre(): void
    {
        $this->actingAs($this->jefe);

        $padre = DependenciaExterna::create(['nombre' => 'PADRE TEST']);
        $hijo = DependenciaExterna::create(['nombre' => 'HIJO TEST']);

        $response = $this->post("/admin/catalogos/unidades/{$hijo->id}", [
            'nombre' => 'HIJO TEST',
            'parent_id' => $padre->id,
            'activa' => true,
        ]);

        $response->assertSessionHas('success');
        $hijo->refresh();
        $this->assertEquals($padre->id, $hijo->parent_id);
    }

    public function test_unidad_no_acepta_self_parent(): void
    {
        $this->actingAs($this->jefe);

        $unidad = DependenciaExterna::create(['nombre' => 'NODO TEST']);

        $response = $this->post("/admin/catalogos/unidades/{$unidad->id}", [
            'nombre' => 'NODO TEST',
            'parent_id' => $unidad->id,
            'activa' => true,
        ]);

        $response->assertSessionHasErrors(['error']);
        $unidad->refresh();
        $this->assertNull($unidad->parent_id);
    }

    public function test_unidad_no_acepta_descendiente_como_padre(): void
    {
        $this->actingAs($this->jefe);

        $a = DependenciaExterna::create(['nombre' => 'NIVEL A']);
        $b = DependenciaExterna::create(['nombre' => 'NIVEL B', 'parent_id' => $a->id]);
        $c = DependenciaExterna::create(['nombre' => 'NIVEL C', 'parent_id' => $b->id]);

        $response = $this->post("/admin/catalogos/unidades/{$a->id}", [
            'nombre' => 'NIVEL A',
            'parent_id' => $c->id,
            'activa' => true,
        ]);

        $response->assertSessionHasErrors(['error']);
        $a->refresh();
        $this->assertNull($a->parent_id);
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
            'nombre' => 'TEST UNIDAD',
            'activa' => true,
        ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('dependencias_externas', [
            'nombre' => 'TEST UNIDAD',
        ]);
    }

    public function test_jefe_can_update_unidad(): void
    {
        $this->actingAs($this->jefe);

        $unidad = DependenciaExterna::create([
            'nombre' => 'UNIDAD ORIGINAL',
        ]);

        $response = $this->post("/admin/catalogos/unidades/{$unidad->id}", [
            'nombre' => 'UNIDAD ACTUALIZADA',
            'activa' => false,
        ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('dependencias_externas', [
            'id' => $unidad->id,
            'nombre' => 'UNIDAD ACTUALIZADA',
        ]);
    }

    public function test_jefe_can_add_clasificacion(): void
    {
        $this->actingAs($this->jefe);

        $response = $this->post('/admin/catalogos/clasificaciones', [
            'nombre' => 'TEST CLASIFICACIÓN',
            'activa' => true,
        ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('clasificaciones', [
            'nombre' => 'TEST CLASIFICACIÓN',
            'clave' => 'test_clasificacion',
            'activa' => 1,
        ]);
    }

    public function test_jefe_can_update_clasificacion(): void
    {
        $this->actingAs($this->jefe);

        $clas = Clasificacion::create(['clave' => 'test', 'nombre' => 'TEST ORIGINAL']);

        $response = $this->post("/admin/catalogos/clasificaciones/{$clas->id}", [
            'nombre' => 'TEST ACTUALIZADO',
            'activa' => true,
        ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('clasificaciones', [
            'id' => $clas->id,
            'nombre' => 'TEST ACTUALIZADO',
            'clave' => 'test_actualizado',
        ]);
    }

    public function test_clasificacion_store_genera_clave(): void
    {
        $this->actingAs($this->jefe);

        $response = $this->post('/admin/catalogos/clasificaciones', [
            'nombre' => 'OTRO TIPO',
        ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('clasificaciones', [
            'nombre' => 'OTRO TIPO',
            'clave' => 'otro_tipo',
        ]);
    }

    public function test_clasificacion_is_uppercased_on_store(): void
    {
        $this->actingAs($this->jefe);

        $this->post('/admin/catalogos/clasificaciones', [
            'nombre' => 'test minúsculas',
        ])->assertSessionHas('success');

        $this->assertDatabaseHas('clasificaciones', [
            'nombre' => 'TEST MINÚSCULAS',
        ]);
    }

    public function test_clasificacion_is_uppercased_on_update(): void
    {
        $this->actingAs($this->jefe);

        $clas = Clasificacion::where('clave', 'penal')->first();

        $this->post("/admin/catalogos/clasificaciones/{$clas->id}", [
            'nombre' => 'penal actualizado',
        ])->assertSessionHas('success');

        $this->assertDatabaseHas('clasificaciones', [
            'id' => $clas->id,
            'nombre' => 'PENAL ACTUALIZADO',
        ]);
    }

    public function test_clasificacion_desactivar(): void
    {
        $this->actingAs($this->jefe);

        $clas = Clasificacion::create(['clave' => 'test_borrable', 'nombre' => 'TEST BORRABLE']);

        $response = $this->post("/admin/catalogos/clasificaciones/{$clas->id}/eliminar");

        $response->assertSessionHas('success');
        $clas->refresh();
        $this->assertFalse($clas->activa);
        $this->assertNotNull($clas->fecha_desactivacion);
    }

    public function test_protected_clasificacion_no_deactivatable(): void
    {
        $this->actingAs($this->jefe);

        $clas = Clasificacion::create(['clave' => 'archivado', 'nombre' => 'ARCHIVADO']);

        $response = $this->post("/admin/catalogos/clasificaciones/{$clas->id}/eliminar");

        $response->assertSessionHasErrors(['error']);
        $clas->refresh();
        $this->assertTrue($clas->activa);
    }

    public function test_clasificacion_in_use_can_be_deactivated(): void
    {
        $this->actingAs($this->jefe);

        $clas = Clasificacion::create(['clave' => 'test_uso', 'nombre' => 'TEST EN USO']);

        $denuncia = Denuncia::factory()->create([
            'ticket' => 'DEN-2026-0099',
            'token_consulta' => '9901',
            'tipo' => 'corrupcion',
            'estado' => 'cerrada',
        ]);
        $informe = InformeFinal::create([
            'denuncia_id' => $denuncia->id,
            'clasificacion_id' => $clas->id,
            'fojas' => 5,
            'justificacion' => 'JUSTIFICACIÓN DE PRUEBA LARGA',
            'concluido_por' => 'TEST',
            'redactado_at' => now(),
        ]);

        $response = $this->post("/admin/catalogos/clasificaciones/{$clas->id}/eliminar");

        $response->assertSessionHas('success');
        $clas->refresh();
        $this->assertFalse($clas->activa);
        $this->assertEquals($clas->id, $informe->refresh()->clasificacion_id);
    }

    public function test_clasificacion_index_marks_protected_and_usos(): void
    {
        $this->actingAs($this->jefe);

        $clas = Clasificacion::where('clave', 'penal')->first();

        $denuncia = Denuncia::factory()->create([
            'ticket' => 'DEN-2026-0098',
            'token_consulta' => '9801',
            'tipo' => 'corrupcion',
            'estado' => 'cerrada',
        ]);
        InformeFinal::create([
            'denuncia_id' => $denuncia->id,
            'clasificacion_id' => $clas->id,
            'fojas' => 5,
            'justificacion' => 'JUSTIFICACIÓN DE PRUEBA LARGA',
            'concluido_por' => 'TEST',
            'redactado_at' => now(),
        ]);

        $response = $this->get('/admin/catalogos');

        $response->assertInertia(fn($page) => $page
            ->where('catalogos.clasificaciones.items.0.clave', 'penal')
            ->where('catalogos.clasificaciones.items.0.protegido', true)
            ->where('catalogos.clasificaciones.items.0.usos', 1)
        );
    }

    public function test_jefe_can_add_medio_notificacion(): void
    {
        $this->actingAs($this->jefe);

        $response = $this->post('/admin/catalogos/medios_notificacion', [
            'nombre' => 'CORREO INTERNO',
            'activa' => true,
        ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('medios_notificacion', [
            'nombre' => 'CORREO INTERNO',
            'clave' => 'correo_interno',
            'activa' => 1,
        ]);
    }

    public function test_medio_notificacion_store_genera_clave(): void
    {
        $this->actingAs($this->jefe);

        $response = $this->post('/admin/catalogos/medios_notificacion', [
            'nombre' => 'CORREO INTERNO',
        ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('medios_notificacion', [
            'nombre' => 'CORREO INTERNO',
            'clave' => 'correo_interno',
        ]);
    }

    public function test_medio_notificacion_desactivar(): void
    {
        $this->actingAs($this->jefe);

        $medio = MedioNotificacion::create(['clave' => 'test_medio', 'nombre' => 'TEST MEDIO']);

        $response = $this->post("/admin/catalogos/medios_notificacion/{$medio->id}/eliminar");

        $response->assertSessionHas('success');
        $medio->refresh();
        $this->assertFalse($medio->activa);
        $this->assertNotNull($medio->fecha_desactivacion);
    }

    public function test_medio_notificacion_in_use_can_be_deactivated(): void
    {
        $this->actingAs($this->jefe);

        $medio = MedioNotificacion::create(['clave' => 'test_medio', 'nombre' => 'TEST MEDIO']);

        $denuncia = Denuncia::factory()->create([
            'ticket' => 'DEN-2026-0097',
            'token_consulta' => '9701',
            'tipo' => 'corrupcion',
            'estado' => 'cerrada',
        ]);
        $cierre = Cierre::create([
            'denuncia_id' => $denuncia->id,
            'notificado_denunciante' => true,
            'notificacion_medio_id' => $medio->id,
            'notificacion_fecha' => now(),
            'notificacion_descripcion' => 'NOTIFICACIÓN DE PRUEBA COMPLETA',
            'concluido_por' => 'TEST',
            'descripcion' => 'DESCRIPCIÓN DE CIERRE DE PRUEBA LARGA',
            'cerrado_at' => now(),
            'eliminado' => false,
        ]);

        $response = $this->post("/admin/catalogos/medios_notificacion/{$medio->id}/eliminar");

        $response->assertSessionHas('success');
        $medio->refresh();
        $this->assertFalse($medio->activa);
        $this->assertEquals($medio->id, $cierre->refresh()->notificacion_medio_id);
    }

    public function test_medio_notificacion_index_marks_usos(): void
    {
        $this->actingAs($this->jefe);

        $email = MedioNotificacion::where('clave', 'email')->first();

        $denuncia = Denuncia::factory()->create([
            'ticket' => 'DEN-2026-0096',
            'token_consulta' => '9601',
            'tipo' => 'corrupcion',
            'estado' => 'cerrada',
        ]);
        Cierre::create([
            'denuncia_id' => $denuncia->id,
            'notificado_denunciante' => true,
            'notificacion_medio_id' => $email->id,
            'notificacion_fecha' => now(),
            'notificacion_descripcion' => 'NOTIFICACIÓN DE PRUEBA COMPLETA',
            'concluido_por' => 'TEST',
            'descripcion' => 'DESCRIPCIÓN DE CIERRE DE PRUEBA LARGA',
            'cerrado_at' => now(),
            'eliminado' => false,
        ]);

        $response = $this->get('/admin/catalogos');

        $response->assertInertia(fn($page) => $page
            ->where('catalogos.medios_notificacion.items.0.clave', 'email')
            ->where('catalogos.medios_notificacion.items.0.usos', 1)
        );
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
        );
    }
}
