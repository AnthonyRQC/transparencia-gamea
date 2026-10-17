<?php

namespace Tests\Feature;

use App\Models\Bitacora;
use App\Models\Denuncia;
use App\Models\DenunciaArchivo;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ArchivosCasoAuditoriaTest extends TestCase
{
    use RefreshDatabase;

    private User $jefe;
    private User $investigador;
    private User $investigadorAjeno;
    private Denuncia $denuncia;
    private DenunciaArchivo $archivo;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('local');

        $this->jefe = User::factory()->create([
            'username' => 'jefe_auditoria',
            'rol' => 'jefe',
            'activo' => true,
        ]);

        $this->investigador = User::factory()->create([
            'username' => 'inv_asignado',
            'rol' => 'investigador',
            'activo' => true,
        ]);

        $this->investigadorAjeno = User::factory()->create([
            'username' => 'inv_ajeno',
            'rol' => 'investigador',
            'activo' => true,
        ]);

        $this->denuncia = Denuncia::factory()->create([
            'ticket' => 'DEN-2026-0600',
            'token_consulta' => '6600',
            'estado' => 'investigacion',
            'investigador_id' => $this->investigador->id,
        ]);

        // Crear archivo físico en fake storage y fila en BD
        $fakeFile = UploadedFile::fake()->create('evidencia_confidencial.pdf', 200, 'application/pdf');
        $path = $fakeFile->storeAs("archivos/{$this->denuncia->ticket}", 'evidencia_confidencial.pdf', 'local');

        $this->archivo = DenunciaArchivo::create([
            'denuncia_id' => $this->denuncia->id,
            'usuario_id' => $this->investigador->id,
            'nombre' => 'evidencia_confidencial.pdf',
            'path' => $path,
            'mime' => 'application/pdf',
            'size' => 204800,
            'contexto' => 'investigacion',
            'fecha_subida' => now(),
        ]);
    }

    public function test_descargar_archivo_registra_bitacora_con_detalle_minimizado(): void
    {
        $response = $this->actingAs($this->investigador)
            ->withHeaders(['User-Agent' => 'AuditoriaAgent/1.0'])
            ->get(route('denuncias.archivos.descargar', $this->archivo->id));

        $response->assertOk();

        $evento = Bitacora::where('accion', 'archivo_descargado')->first();
        $this->assertNotNull($evento);
        $this->assertSame($this->denuncia->id, $evento->denuncia_id);
        $this->assertSame(DenunciaArchivo::class, $evento->entidad_tipo);
        $this->assertSame($this->archivo->id, $evento->entidad_id);
        $this->assertSame("DESCARGA DEL ARCHIVO #{$this->archivo->id} DEL CASO {$this->denuncia->ticket}", $evento->detalle);
        $this->assertSame($this->investigador->id, $evento->usuario_id);
        $this->assertSame('AuditoriaAgent/1.0', $evento->user_agent);
        $this->assertStringNotContainsString('evidencia_confidencial.pdf', $evento->detalle);
    }

    public function test_eliminar_archivo_registra_bitacora_con_detalle_minimizado(): void
    {
        $response = $this->actingAs($this->investigador)
            ->withHeaders(['User-Agent' => 'AuditoriaAgent/2.0'])
            ->post(route('denuncias.archivos.eliminar', $this->archivo->id));

        $response->assertRedirect();

        $this->assertNotNull($this->archivo->fresh()->fecha_eliminacion);

        $evento = Bitacora::where('accion', 'archivo_eliminado')->first();
        $this->assertNotNull($evento);
        $this->assertSame($this->denuncia->id, $evento->denuncia_id);
        $this->assertSame(DenunciaArchivo::class, $evento->entidad_tipo);
        $this->assertSame($this->archivo->id, $evento->entidad_id);
        $this->assertSame("ARCHIVO #{$this->archivo->id} ELIMINADO DEL CASO {$this->denuncia->ticket}", $evento->detalle);
        $this->assertSame($this->investigador->id, $evento->usuario_id);
        $this->assertSame('AuditoriaAgent/2.0', $evento->user_agent);
        $this->assertStringNotContainsString('evidencia_confidencial.pdf', $evento->detalle);
    }

    public function test_fallos_no_generan_eventos_falsos_de_bitacora(): void
    {
        // 1. Denegación de CasoAuth al descargar
        $resDenegado = $this->actingAs($this->investigadorAjeno)
            ->get(route('denuncias.archivos.descargar', $this->archivo->id));
        $resDenegado->assertRedirect();
        $this->assertDatabaseMissing('bitacora', ['accion' => 'archivo_descargado']);

        // 2. Archivo inexistente en storage al descargar
        Storage::disk('local')->delete($this->archivo->path);
        $resMissing = $this->actingAs($this->investigador)
            ->get(route('denuncias.archivos.descargar', $this->archivo->id));
        $resMissing->assertRedirect();
        $this->assertDatabaseMissing('bitacora', ['accion' => 'archivo_descargado']);

        // 3. Archivo soft-deleted al descargar devuelve 404
        $this->archivo->update(['fecha_eliminacion' => now()]);
        $res404 = $this->actingAs($this->investigador)
            ->get(route('denuncias.archivos.descargar', $this->archivo->id));
        $res404->assertNotFound();
        $this->assertDatabaseMissing('bitacora', ['accion' => 'archivo_descargado']);

        // 4. Denegación de CasoAuth al eliminar
        $archivoNuevo = DenunciaArchivo::create([
            'denuncia_id' => $this->denuncia->id,
            'usuario_id' => $this->investigador->id,
            'nombre' => 'otro_archivo.pdf',
            'path' => 'archivos/test.pdf',
            'fecha_subida' => now(),
        ]);

        $resEliminarDenegado = $this->actingAs($this->investigadorAjeno)
            ->post(route('denuncias.archivos.eliminar', $archivoNuevo->id));
        $resEliminarDenegado->assertRedirect();
        $this->assertDatabaseMissing('bitacora', ['accion' => 'archivo_eliminado']);
    }
}
