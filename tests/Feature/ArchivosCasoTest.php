<?php

namespace Tests\Feature;

use App\Models\DenunciaArchivo;
use App\Models\Denuncia;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ArchivosCasoTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Denuncia $denuncia;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create([
            'username' => 'testuser',
            'rol' => 'jefe',
            'activo' => true,
        ]);

        $this->denuncia = Denuncia::factory()->create([
            'ticket' => 'DEN-2026-0001',
            'token_consulta' => '1001',
            'estado' => 'ingresada',
        ]);
    }

    public function test_can_list_active_archivos(): void
    {
        $this->actingAs($this->user);

        DenunciaArchivo::create([
            'denuncia_id' => $this->denuncia->id,
            'usuario_id' => $this->user->id,
            'nombre' => 'test.pdf',
            'path' => 'archivos/test/test.pdf',
            'contexto' => 'general',
            'fecha_subida' => now(),
        ]);

        $response = $this->get("/denuncias/{$this->denuncia->ticket}/archivos");

        $response->assertStatus(200);
        $response->assertJsonCount(1);
    }

    public function test_can_subir_archivo(): void
    {
        $this->actingAs($this->user);

        $response = $this->post("/denuncias/{$this->denuncia->ticket}/archivos", [
            'nombre' => 'test_documento.pdf',
            'descripcion' => 'DOCUMENTO DE PRUEBA',
            'contexto' => 'general',
        ]);

        $response->assertSessionHas('success');

        $this->assertDatabaseHas('denuncias_archivos', [
            'denuncia_id' => $this->denuncia->id,
            'nombre' => 'test_documento.pdf',
            'contexto' => 'general',
        ]);
    }

    public function test_soft_delete_archivo(): void
    {
        $this->actingAs($this->user);

        $archivo = DenunciaArchivo::create([
            'denuncia_id' => $this->denuncia->id,
            'usuario_id' => $this->user->id,
            'nombre' => 'test_eliminar.pdf',
            'path' => 'archivos/test/test_eliminar.pdf',
            'contexto' => 'general',
            'fecha_subida' => now(),
        ]);

        $response = $this->post("/denuncias/archivos/{$archivo->id}/eliminar");

        $response->assertSessionHas('success');

        $archivo->refresh();
        $this->assertNotNull($archivo->fecha_eliminacion);
    }

    public function test_soft_deleted_archivo_not_in_active_list(): void
    {
        $this->actingAs($this->user);

        $archivo = DenunciaArchivo::create([
            'denuncia_id' => $this->denuncia->id,
            'usuario_id' => $this->user->id,
            'nombre' => 'test_oculto.pdf',
            'path' => 'archivos/test/test_oculto.pdf',
            'contexto' => 'general',
            'fecha_subida' => now(),
        ]);

        $archivo->update(['fecha_eliminacion' => now()]);

        $response = $this->get("/denuncias/{$this->denuncia->ticket}/archivos");

        $response->assertStatus(200);
        $response->assertJsonCount(0);
    }
}
