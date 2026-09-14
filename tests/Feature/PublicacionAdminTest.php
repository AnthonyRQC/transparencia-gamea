<?php

namespace Tests\Feature;

use App\Models\PrioridadPublicacion;
use App\Models\Publicacion;
use App\Models\TipoPublicacion;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PublicacionAdminTest extends TestCase
{
    use RefreshDatabase;

    private User $jefe;
    private User $registrador;
    private User $tecnico;
    private int $tipoId;
    private int $prioId;

    protected function setUp(): void
    {
        parent::setUp();
        TipoPublicacion::create(['clave' => 'comunicado', 'nombre' => 'COMUNICADO']);
        PrioridadPublicacion::create(['clave' => 'ordinario', 'nombre' => 'ORDINARIO']);
        $this->tipoId = TipoPublicacion::first()->id;
        $this->prioId = PrioridadPublicacion::first()->id;
        $this->jefe = User::factory()->create(['rol' => 'jefe']);
        $this->registrador = User::factory()->create(['rol' => 'registrador']);
        $this->tecnico = User::factory()->create(['rol' => 'tecnico']);
    }

    private function payload(array $extra = []): array
    {
        return array_merge([
            'tipo_id' => $this->tipoId,
            'prioridad_id' => $this->prioId,
            'emisor' => 'UTLCC',
            'ref_titulo' => 'AVISO DE PRUEBA',
            'cuerpo' => 'CONTENIDO DEL AVISO.',
            'publicar' => true,
        ], $extra);
    }

    public function test_jefe_y_registrador_gestionan_tecnico_no(): void
    {
        $this->actingAs($this->jefe)->get('/admin/publicaciones')->assertOk();
        $this->actingAs($this->registrador)->get('/admin/publicaciones')->assertOk();
        $this->actingAs($this->tecnico)->get('/admin/publicaciones')->assertRedirect('/dashboard');
        $this->actingAs($this->tecnico)->post('/admin/publicaciones', $this->payload())->assertRedirect('/dashboard');
        $this->assertDatabaseCount('publicaciones', 0);
    }

    public function test_crear_publica_directo(): void
    {
        $this->actingAs($this->jefe)->post('/admin/publicaciones', $this->payload());
        $pub = Publicacion::first();
        $this->assertNotNull($pub);
        $this->assertNotNull($pub->publicado_at);
        $this->assertEquals($this->jefe->id, $pub->publicado_por_id);
        $this->assertEquals('AVISO DE PRUEBA', $pub->ref_titulo); // UppercaseText
    }

    public function test_crear_borrador_y_publicar_despues(): void
    {
        $this->actingAs($this->registrador)->post('/admin/publicaciones', $this->payload(['publicar' => false]));
        $pub = Publicacion::first();
        $this->assertNull($pub->publicado_at);

        $this->actingAs($this->registrador)->post("/admin/publicaciones/{$pub->id}/publicar");
        $this->assertNotNull($pub->fresh()->publicado_at);

        $this->actingAs($this->jefe)->post("/admin/publicaciones/{$pub->id}/despublicar");
        $this->assertNull($pub->fresh()->publicado_at);
    }

    public function test_exige_cuerpo_o_archivo(): void
    {
        Storage::fake('public');

        $this->actingAs($this->jefe)
            ->post('/admin/publicaciones', $this->payload(['cuerpo' => null]))
            ->assertSessionHasErrors('cuerpo');
        $this->assertDatabaseCount('publicaciones', 0);

        $this->actingAs($this->jefe)->post('/admin/publicaciones', array_merge(
            $this->payload(['cuerpo' => null]),
            ['archivos' => [UploadedFile::fake()->create('nota.pdf', 100, 'application/pdf')]]
        ))->assertSessionHasNoErrors();
        $pub = Publicacion::first();
        $this->assertNotNull($pub);
        $this->assertEquals(1, $pub->archivos()->count());
        Storage::disk('public')->assertExists($pub->archivos()->first()->path);
    }

    public function test_fijar_y_ordenar(): void
    {
        foreach (['UNO', 'DOS'] as $titulo) {
            $this->actingAs($this->jefe)->post('/admin/publicaciones', $this->payload(['ref_titulo' => $titulo]));
        }
        [$uno, $dos] = Publicacion::orderBy('id')->get()->all();

        $this->actingAs($this->jefe)->post("/admin/publicaciones/{$uno->id}/fijar");
        $this->actingAs($this->jefe)->post("/admin/publicaciones/{$dos->id}/fijar");
        $this->assertTrue($uno->fresh()->orden < $dos->fresh()->orden);

        $this->actingAs($this->jefe)->post("/admin/publicaciones/{$dos->id}/mover", ['direccion' => 'subir']);
        $this->assertTrue($dos->fresh()->orden < $uno->fresh()->orden);

        $this->actingAs($this->jefe)->post("/admin/publicaciones/{$dos->id}/desfijar");
        $this->assertFalse($dos->fresh()->fijada);
    }

    public function test_eliminar_preserva_fisicos_y_audita(): void
    {
        Storage::fake('public');

        $this->actingAs($this->jefe)->post('/admin/publicaciones', array_merge(
            $this->payload(),
            ['archivos' => [UploadedFile::fake()->create('nota.pdf', 100, 'application/pdf')]]
        ));
        $pub = Publicacion::first();
        $path = $pub->archivos()->first()->path;
        Storage::disk('public')->assertExists($path);

        $this->actingAs($this->jefe)->post("/admin/publicaciones/{$pub->id}/eliminar");
        $this->assertDatabaseCount('publicaciones', 0);
        // El físico se preserva como historial; la Bitácora registra nombres.
        Storage::disk('public')->assertExists($path);
        $this->assertDatabaseHas('bitacora', ['entidad_id' => $pub->id, 'accion' => 'eliminar']);
    }

    public function test_quitar_adjunto_es_soft_y_sale_del_muro(): void
    {
        Storage::fake('public');

        $this->actingAs($this->jefe)->post('/admin/publicaciones', array_merge(
            $this->payload(),
            ['archivos' => [UploadedFile::fake()->create('nota.pdf', 100, 'application/pdf')]]
        ));
        $pub = Publicacion::first();
        $archivo = $pub->archivos()->first();

        $this->actingAs($this->jefe)->post("/admin/publicaciones/archivos/{$archivo->id}/quitar");

        // Fila preservada con fecha, físico intacto, fuera de activos.
        $this->assertNotNull($archivo->fresh()->fecha_eliminacion);
        Storage::disk('public')->assertExists($archivo->path);
        $this->assertEquals(0, $pub->archivos()->activos()->count());
        $this->assertDatabaseHas('bitacora', ['accion' => 'quitar-adjunto']);
    }

    public function test_descarga_publica_solo_publicadas(): void
    {
        Storage::fake('public');

        $this->actingAs($this->jefe)->post('/admin/publicaciones', array_merge(
            $this->payload(),
            ['archivos' => [UploadedFile::fake()->create('nota.pdf', 100, 'application/pdf')]]
        ));
        $archivo = Publicacion::first()->archivos()->first();

        // Externa sin auth: OK en publicada.
        $this->get("/panel/archivos/{$archivo->id}/descargar")->assertOk();

        // Borrador: 404.
        $this->actingAs($this->jefe)->post('/admin/publicaciones', $this->payload([
            'ref_titulo' => 'BORRADOR CON PDF', 'publicar' => false,
            'archivos' => [UploadedFile::fake()->create('borrador.pdf', 100, 'application/pdf')],
        ]));
        $borrador = Publicacion::where('ref_titulo', 'BORRADOR CON PDF')->first();
        $this->get("/panel/archivos/{$borrador->archivos()->first()->id}/descargar")->assertNotFound();

        // Quitado: 404 aunque el aviso siga publicado.
        $this->actingAs($this->jefe)->post("/admin/publicaciones/archivos/{$archivo->id}/quitar");
        $this->get("/panel/archivos/{$archivo->id}/descargar")->assertNotFound();
    }

    public function test_sube_varios_archivos_y_respeta_tope(): void    {
        Storage::fake('public');

        $pdfs = [
            UploadedFile::fake()->create('uno.pdf', 100, 'application/pdf'),
            UploadedFile::fake()->create('dos.pdf', 100, 'application/pdf'),
            UploadedFile::fake()->create('tres.pdf', 100, 'application/pdf'),
        ];
        $this->actingAs($this->jefe)->post('/admin/publicaciones', array_merge(
            $this->payload(),
            ['archivos' => $pdfs]
        ))->assertSessionHasNoErrors();

        $pub = Publicacion::first();
        $this->assertEquals(3, $pub->archivos()->activos()->count());

        $mas = [
            UploadedFile::fake()->create('cuatro.pdf', 100, 'application/pdf'),
            UploadedFile::fake()->create('cinco.pdf', 100, 'application/pdf'),
            UploadedFile::fake()->create('seis.pdf', 100, 'application/pdf'),
        ];
        $this->actingAs($this->jefe)->post("/admin/publicaciones/{$pub->id}", array_merge(
            $this->payload(),
            ['archivos' => $mas]
        ))->assertSessionHasErrors('archivos');
        $this->assertEquals(3, $pub->archivos()->activos()->count());
    }

    public function test_no_duplica_aviso_de_caso(): void
    {
        $denuncia = \App\Models\Denuncia::factory()->create();
        $base = $this->payload(['denuncia_id' => $denuncia->id, 'evento' => 'cerrada']);

        $this->actingAs($this->jefe)->post('/admin/publicaciones', $base)->assertSessionHasNoErrors();
        $this->actingAs($this->jefe)->post('/admin/publicaciones', $base)->assertSessionHasErrors('evento');
        $this->assertEquals(1, Publicacion::count());
    }

    public function test_cuerpo_html_se_guarda_verbatim_y_vacio_no_cuenta(): void
    {
        Storage::fake('public');
        $html = '<p>Texto con <strong>negrita</strong>.</p><ul><li>Uno</li><li>Dos</li></ul>';

        $this->actingAs($this->jefe)->post('/admin/publicaciones', $this->payload(['cuerpo' => $html]))
            ->assertSessionHasNoErrors();
        $pub = Publicacion::first();
        $this->assertEquals($html, $pub->cuerpo);

        // Editor vacío (<p></p>) sin adjunto → error como si no hubiera cuerpo.
        $this->actingAs($this->jefe)->post('/admin/publicaciones', $this->payload([
            'ref_titulo' => 'VACÍO RICO', 'cuerpo' => '<p></p>',
        ]))->assertSessionHasErrors('cuerpo');
        $this->assertEquals(1, Publicacion::count());
    }

    public function test_portada_debe_ser_imagen_propia(): void
    {
        Storage::fake('public');

        $this->actingAs($this->jefe)->post('/admin/publicaciones', array_merge(
            $this->payload(),
            ['archivos' => [
                UploadedFile::fake()->create('foto.jpg', 100, 'image/jpeg'),
                UploadedFile::fake()->create('nota.pdf', 100, 'application/pdf'),
            ]]
        ));
        $pub = Publicacion::first();
        $foto = $pub->archivos()->where('nombre', 'foto.jpg')->first();

        $this->actingAs($this->jefe)->post("/admin/publicaciones/{$pub->id}", array_merge(
            $this->payload(), ['portada_archivo_id' => $foto->id]
        ))->assertSessionHasNoErrors();
        $this->assertEquals($foto->id, $pub->fresh()->portada_archivo_id);

        // Archivo de otro aviso → error.
        $this->actingAs($this->jefe)->post('/admin/publicaciones', $this->payload(['ref_titulo' => 'OTRO AVISO']));
        $otro = Publicacion::where('ref_titulo', 'OTRO AVISO')->first();
        $this->actingAs($this->jefe)->post("/admin/publicaciones/{$otro->id}", array_merge(
            $this->payload(['ref_titulo' => 'OTRO AVISO']),
            ['portada_archivo_id' => $foto->id]
        ))->assertSessionHasErrors('portada_archivo_id');
    }

    public function test_acepta_webp_y_rechaza_office(): void
    {
        Storage::fake('public');

        $this->actingAs($this->jefe)->post('/admin/publicaciones', array_merge(
            $this->payload(),
            ['archivos' => [UploadedFile::fake()->create('foto.webp', 100, 'image/webp')]]
        ))->assertSessionHasNoErrors();
        $pub = Publicacion::first();
        $this->assertEquals('image/webp', $pub->archivos()->first()->mime_type);

        $this->actingAs($this->jefe)->post('/admin/publicaciones', array_merge(
            $this->payload(['ref_titulo' => 'CON WORD']),
            ['archivos' => [UploadedFile::fake()->create('doc.doc', 100, 'application/msword')]]
        ))->assertSessionHasErrors('archivos.0');
        $this->assertEquals(1, Publicacion::count());
    }

    public function test_resubir_misma_imagen_tras_quitar_y_marcar_portada(): void
    {
        Storage::fake('public');

        $this->actingAs($this->jefe)->post('/admin/publicaciones', array_merge(
            $this->payload(),
            ['archivos' => [UploadedFile::fake()->create('foto.jpg', 100, 'image/jpeg')]]
        ))->assertSessionHasNoErrors();
        $pub = Publicacion::first();
        $original = $pub->archivos()->first();

        // Quitar → va a historial, sale del muro.
        $this->actingAs($this->jefe)->post("/admin/publicaciones/archivos/{$original->id}/quitar")
            ->assertSessionHasNoErrors();
        $this->assertNotNull($original->fresh()->fecha_eliminacion);

        // Resubir la MISMA imagen en editar + marcarla portada.
        $this->actingAs($this->jefe)->post("/admin/publicaciones/{$pub->id}", array_merge(
            $this->payload(),
            ['archivos' => [UploadedFile::fake()->create('foto.jpg', 100, 'image/jpeg')]]
        ))->assertSessionHasNoErrors();
        $nueva = $pub->archivos()->activos()->first();
        $this->assertNotNull($nueva);
        $this->assertNotEquals($original->id, $nueva->id);

        $this->actingAs($this->jefe)->post("/admin/publicaciones/{$pub->id}", array_merge(
            $this->payload(), ['portada_archivo_id' => $nueva->id]
        ))->assertSessionHasNoErrors();
        $this->assertEquals($nueva->id, $pub->fresh()->portada_archivo_id);
    }
}
