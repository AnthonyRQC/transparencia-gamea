<?php

namespace Tests\Feature;

use App\Models\Denunciante;
use App\Models\Denuncia;
use App\Models\PrioridadPublicacion;
use App\Models\Publicacion;
use App\Models\TipoPublicacion;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

/**
 * Estandarización de mayúsculas: blindaje de inclusiones y exclusiones.
 * - Jurídico/usuarios → MAYÚSCULAS (nombres, hechos, cargos, dependencias, CI, bitácora).
 * - Excepciones: correos (minúsculas), contraseñas (case-sensitive),
 *   cuerpo TipTap de publicaciones (HTML mixto intacto).
 */
class EstandarizacionMayusculasTest extends TestCase
{
    use RefreshDatabase;

    public function test_denunciante_mayuscula_nombres_y_ci_pero_email_intacto(): void
    {
        $denuncia = Denuncia::forceCreate([
            'ticket' => 'DEN-2026-0901',
            'token_consulta' => 'ABC123',
            'tipo' => 'corrupcion',
            'escenario' => 'revelada',
            'estado' => 'ingresada',
            'hechos' => 'HECHOS',
            'declaracion_jurada' => true,
        ]);

        $denunciante = $denuncia->denunciante()->create([
            'nombres' => 'juan pérez',
            'ci' => '1234567-1e',
            'email' => 'Juan.Correo@Ejemplo.com',
            'telefono' => '71234567',
        ]);

        $this->assertSame('JUAN PÉREZ', $denunciante->fresh()->nombres);
        $this->assertSame('1234567-1E', $denunciante->fresh()->ci);
        $this->assertSame('Juan.Correo@Ejemplo.com', $denunciante->fresh()->email);
        $this->assertSame('71234567', $denunciante->fresh()->telefono);
    }

    public function test_publicacion_cuerpo_tiptap_intacto_y_titulo_en_mayusculas(): void
    {
        $user = User::factory()->create(['rol' => 'admin', 'activo' => true]);
        $tipo = TipoPublicacion::create(['clave' => 'comunicado', 'nombre' => 'COMUNICADO', 'activa' => true]);
        $prioridad = PrioridadPublicacion::create(['clave' => 'normal', 'nombre' => 'NORMAL', 'activa' => true]);

        $pub = Publicacion::forceCreate([
            'tipo_id' => $tipo->id,
            'prioridad_id' => $prioridad->id,
            'cite' => 'cite-001',
            'ref_titulo' => 'título mixto del aviso',
            'cuerpo' => '<p>Redacción <strong>Mixta</strong> con tildes: áéíóú</p>',
            'publicado_por_id' => $user->id,
        ]);

        $this->assertSame('<p>Redacción <strong>Mixta</strong> con tildes: áéíóú</p>', $pub->fresh()->cuerpo);
        $this->assertSame('TÍTULO MIXTO DEL AVISO', $pub->fresh()->ref_titulo);
        $this->assertSame('CITE-001', $pub->fresh()->cite);
    }

    public function test_password_case_sensitive_intacto(): void
    {
        $user = User::factory()->create(['password' => Hash::make('Secreta123')]);

        $this->assertTrue(Hash::check('Secreta123', $user->fresh()->password));
        $this->assertFalse(Hash::check('SECRETA123', $user->fresh()->password));
        $this->assertFalse(Hash::check('secreta123', $user->fresh()->password));
    }
}
