<?php

namespace Tests\Feature;

use App\Models\Denuncia;
use App\Models\DenunciaArchivo;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ArchivosCasoSubidaTest extends TestCase
{
    use RefreshDatabase;

    private User $jefe;
    private User $investigador;
    private Denuncia $denuncia;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('local');

        $this->jefe = User::factory()->create([
            'username' => 'jefearchivos',
            'rol' => 'jefe',
            'activo' => true,
        ]);

        $this->investigador = User::factory()->create([
            'username' => 'invarchivos',
            'rol' => 'investigador',
            'activo' => true,
        ]);

        $this->denuncia = Denuncia::factory()->create([
            'ticket' => 'DEN-2026-0100',
            'token_consulta' => '1100',
            'estado' => 'ingresada',
        ]);
    }

    private function crearArchivo(string $path, array $extra = []): DenunciaArchivo
    {
        return DenunciaArchivo::create(array_merge([
            'denuncia_id' => $this->denuncia->id,
            'usuario_id' => $this->investigador->id,
            'nombre' => basename($path),
            'path' => $path,
            'contexto' => 'general',
            'fecha_subida' => now(),
        ], $extra));
    }

    public function test_subir_guarda_el_archivo_real(): void
    {
        $this->actingAs($this->jefe);

        $response = $this->post("/denuncias/{$this->denuncia->ticket}/archivos", [
            'archivo' => UploadedFile::fake()->create('informe.pdf', 100, 'application/pdf'),
            'nombre' => 'INFORME REAL',
            'descripcion' => 'DOCUMENTO DE PRUEBA',
            'contexto' => 'general',
        ]);

        $response->assertSessionHas('success');

        $archivo = DenunciaArchivo::where('denuncia_id', $this->denuncia->id)->firstOrFail();

        $this->assertStringStartsWith("archivos/{$this->denuncia->ticket}/", $archivo->path);
        $this->assertSame(102400, (int) $archivo->tamano);
        $this->assertSame('application/pdf', $archivo->mime_type);
        Storage::disk('local')->assertExists($archivo->path);
    }

    public function test_subir_rechaza_un_mime_no_permitido(): void
    {
        $this->actingAs($this->jefe);

        $response = $this->post("/denuncias/{$this->denuncia->ticket}/archivos", [
            'archivo' => UploadedFile::fake()->create('programa.exe', 10, 'application/x-msdownload'),
            'nombre' => 'EJECUTABLE',
            'contexto' => 'general',
        ]);

        $response->assertSessionHasErrors('archivo');
        $this->assertDatabaseCount('denuncias_archivos', 0);
    }

    public function test_subir_rechaza_un_archivo_mayor_a_50mb(): void
    {
        $this->actingAs($this->jefe);

        $response = $this->post("/denuncias/{$this->denuncia->ticket}/archivos", [
            'archivo' => UploadedFile::fake()->create('grande.pdf', 51201, 'application/pdf'),
            'nombre' => 'ARCHIVO GRANDE',
            'contexto' => 'general',
        ]);

        $response->assertSessionHasErrors('archivo');
        $this->assertDatabaseCount('denuncias_archivos', 0);
    }

    public function test_descargar_devuelve_el_archivo_almacenado(): void
    {
        Storage::disk('local')->put('archivos/test/real.pdf', 'CONTENIDO');
        $this->denuncia->update(['investigador_id' => $this->investigador->id]);
        $archivo = $this->crearArchivo('archivos/test/real.pdf');

        $this->actingAs($this->investigador)
            ->get("/denuncias/archivos/{$archivo->id}/descargar")
            ->assertOk()
            ->assertDownload('real.pdf');
    }

    public function test_descargar_sin_archivo_en_disco_redirige_con_error(): void
    {
        $this->denuncia->update(['investigador_id' => $this->investigador->id]);
        $archivo = $this->crearArchivo('archivos/test/inexistente.pdf');

        $this->actingAs($this->investigador)
            ->get("/denuncias/archivos/{$archivo->id}/descargar")
            ->assertRedirect()
            ->assertSessionHas('error');
    }

    public function test_descargar_un_caso_ajeno_redirige_con_error(): void
    {
        $otro = User::factory()->create([
            'username' => 'otroinv',
            'rol' => 'investigador',
            'activo' => true,
        ]);

        Storage::disk('local')->put('archivos/test/ajeno.pdf', 'CONTENIDO');
        $this->denuncia->update(['investigador_id' => $otro->id]);
        $archivo = $this->crearArchivo('archivos/test/ajeno.pdf');

        $this->actingAs($this->investigador)
            ->get("/denuncias/archivos/{$archivo->id}/descargar")
            ->assertRedirect()
            ->assertSessionHas('error');
    }

    public function test_jefe_descarga_archivo_de_caso_ajeno(): void
    {
        $otro = User::factory()->create([
            'username' => 'otroinv2',
            'rol' => 'investigador',
            'activo' => true,
        ]);

        Storage::disk('local')->put('archivos/test/jefe.pdf', 'CONTENIDO');
        $this->denuncia->update(['investigador_id' => $otro->id]);
        $archivo = $this->crearArchivo('archivos/test/jefe.pdf');

        $this->actingAs($this->jefe)
            ->get("/denuncias/archivos/{$archivo->id}/descargar")
            ->assertOk()
            ->assertDownload('jefe.pdf');
    }

    public function test_un_archivo_eliminado_no_aparece_en_el_listado(): void
    {
        $this->actingAs($this->jefe);

        $activo = $this->crearArchivo('archivos/test/activo.pdf');
        $this->crearArchivo('archivos/test/eliminado.pdf', [
            'fecha_subida' => now()->subDay(),
            'fecha_eliminacion' => now(),
        ]);

        $response = $this->get("/denuncias/{$this->denuncia->ticket}/archivos");

        $response->assertOk();
        $response->assertJsonCount(1);
        $this->assertSame($activo->id, $response->json('0.id'));
    }
}
