<?php

namespace Tests\Feature;

use App\Models\CategoriaDenuncia;
use App\Models\Clasificacion;
use App\Models\ConfiguracionSistema;
use App\Models\Denuncia;
use App\Models\User;
use App\Queries\Denuncia\DenunciaListQuery;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * Fase B — carga legacy (en curso) e histórica (cerrada).
 */
class CargaLegacyTest extends TestCase
{
    use RefreshDatabase;

    private User $jefe;

    private User $inv;

    private User $reg;

    private User $admin;

    private Clasificacion $penal;

    protected function setUp(): void
    {
        parent::setUp();

        $this->jefe = User::factory()->create(['username' => 'eljefe', 'rol' => 'jefe', 'activo' => true]);
        $this->inv = User::factory()->create(['username' => 'elinv', 'rol' => 'investigador', 'activo' => true]);
        $this->reg = User::factory()->create(['username' => 'elreg', 'rol' => 'registrador', 'activo' => true]);
        $this->admin = User::factory()->create(['username' => 'eladmin', 'rol' => 'admin', 'activo' => true]);

        CategoriaDenuncia::create(['clave' => 'otra_corrupcion', 'nombre' => 'OTRA (CORRUPCIÓN)', 'tipo_denuncia' => 'corrupcion', 'activa' => true]);
        CategoriaDenuncia::create(['clave' => 'otra_negacion', 'nombre' => 'OTRA (NEGACIÓN)', 'tipo_denuncia' => 'negacion', 'activa' => true]);
        $this->penal = Clasificacion::create(['clave' => 'penal', 'nombre' => 'PENAL', 'activa' => true]);
    }

    private function basePayload(array $overrides = []): array
    {
        return array_merge([
            'modo' => 'en_curso',
            'tipo' => 'corrupcion',
            'hechos' => 'HECHOS DEL EXPEDIENTE FÍSICO ENCONTRADO EN EL ARCHIVO',
            'escenario' => 'revelada',
            'denunciante_nombre' => 'JUAN PÉREZ',
            'denunciados' => [
                ['conoce_identidad' => true, 'nombres' => 'JUAN PÉREZ', 'dependencia' => 'CONTADURÍA'],
                ['conoce_identidad' => true, 'nombres' => 'MARÍA LOZA', 'dependencia' => 'TESORERÍA'],
            ],
            'fecha_recepcion' => '2024-03-10',
            'estado' => 'investigacion',
        ], $overrides);
    }

    public function test_investigador_se_autoasigna_en_modo_en_curso(): void
    {
        $this->actingAs($this->inv)
            ->post('/denuncias/legacy', $this->basePayload())
            ->assertSessionHas('success');

        $denuncia = Denuncia::where('investigador_id', $this->inv->id)->firstOrFail();

        $this->assertTrue($denuncia->es_legacy);
        $this->assertSame('investigacion', $denuncia->estado);
        $this->assertStringStartsWith('DEN-' . now()->year . '-', $denuncia->ticket);
        $this->assertSame('2024-03-10', $denuncia->created_at->format('Y-m-d'));
        $this->assertSame('JUAN PÉREZ', $denuncia->denunciante->nombres);
        $this->assertCount(2, $denuncia->denunciados);
        $this->assertSame('CONTADURÍA', $denuncia->denunciados()->orderBy('orden')->first()->dependencia);
        $this->assertSame('ingreso_legacy', $denuncia->bitacora()->first()->accion);
    }

    public function test_jefe_asigna_investigador_con_selector(): void
    {
        $this->actingAs($this->jefe)
            ->post('/denuncias/legacy', $this->basePayload([
                'investigador_id' => $this->inv->id,
                'estado' => 'informe',
                'clasificacion_id' => $this->penal->id,
            ]))
            ->assertSessionHas('success');

        $denuncia = Denuncia::where('investigador_id', $this->inv->id)->firstOrFail();

        $this->assertSame('informe', $denuncia->estado);
        $this->assertSame($this->penal->id, $denuncia->informe->clasificacion_id);
        $this->assertSame($this->jefe->id, $denuncia->informe->clasificado_por_id);
    }

    public function test_jefe_puede_autoasignarse(): void
    {
        $this->actingAs($this->jefe)
            ->post('/denuncias/legacy', $this->basePayload([
                'investigador_id' => $this->jefe->id,
            ]))
            ->assertSessionHas('success');

        $this->assertDatabaseHas('denuncias', [
            'investigador_id' => $this->jefe->id,
            'es_legacy' => true,
        ]);
    }

    public function test_reservada_guarda_ci_y_telefono(): void
    {
        $this->actingAs($this->jefe)
            ->post('/denuncias/legacy', $this->basePayload([
                'escenario' => 'reservada',
                'denunciante_nombre' => 'MARÍA LOZA',
                'denunciante_ci' => '1234567-1E',
                'denunciante_telefono' => '71234567',
                'investigador_id' => $this->inv->id,
            ]))
            ->assertSessionHas('success');

        $denuncia = Denuncia::where('investigador_id', $this->inv->id)->firstOrFail();

        $this->assertSame('reservada', $denuncia->escenario);
        $this->assertSame('MARÍA LOZA', $denuncia->denunciante->nombres);
        $this->assertSame('1234567-1E', $denuncia->denunciante->ci);
        $this->assertSame('71234567', $denuncia->denunciante->telefono);
    }

    public function test_denunciado_sin_identidad_guarda_descripcion(): void
    {
        $this->actingAs($this->jefe)
            ->post('/denuncias/legacy', $this->basePayload([
                'investigador_id' => $this->inv->id,
                'denunciados' => [
                    ['conoce_identidad' => false, 'descripcion' => 'PERSONAL DE VENTANILLA TURNO TARDE', 'dependencia' => 'VENTANILLA ÚNICA'],
                ],
            ]))
            ->assertSessionHas('success');

        $denuncia = Denuncia::where('investigador_id', $this->inv->id)->firstOrFail();
        $dd = $denuncia->denunciados()->firstOrFail();

        $this->assertFalse((bool) $dd->conoce_identidad);
        $this->assertNull($dd->nombres);
        $this->assertSame('PERSONAL DE VENTANILLA TURNO TARDE', $dd->descripcion);
        $this->assertSame('VENTANILLA ÚNICA', $dd->dependencia);
    }

    public function test_adjuntos_se_guardan_con_bitacora(): void
    {
        Storage::fake('local');

        $this->actingAs($this->jefe)
            ->post('/denuncias/legacy', array_merge($this->basePayload([
                'investigador_id' => $this->inv->id,
            ]), [
                'archivos' => [
                    UploadedFile::fake()->create('resolucion.pdf', 100, 'application/pdf'),
                    UploadedFile::fake()->create('foto.jpg', 200, 'image/jpeg'),
                ],
            ]))
            ->assertSessionHas('success');

        $denuncia = Denuncia::where('investigador_id', $this->inv->id)->firstOrFail();

        $this->assertCount(2, $denuncia->archivos);
        $this->assertSame(2, $denuncia->bitacora()->where('accion', 'archivo_subido')->count());
        foreach ($denuncia->archivos as $archivo) {
            Storage::disk('local')->assertExists($archivo->path);
            $this->assertSame('registro', $archivo->contexto);
        }
    }

    public function test_adjunto_invalido_devuelve_422_sin_crear(): void
    {
        $this->actingAs($this->jefe)
            ->post('/denuncias/legacy', array_merge($this->basePayload([
                'investigador_id' => $this->inv->id,
            ]), [
                'archivos' => [UploadedFile::fake()->create('virus.exe', 100, 'application/x-msdownload')],
            ]))
            ->assertSessionHasErrors('archivos.0');

        $this->assertSame(0, Denuncia::count());
    }

    public function test_historico_queda_cerrado_sin_investigador_fantasma(): void
    {
        $this->actingAs($this->jefe)
            ->post('/denuncias/legacy', $this->basePayload([
                'modo' => 'historico',
                'gestion' => 2024,
                'numero_ticket' => 15,
                'fecha_cierre' => '2024-11-20',
                'investigador_referencia' => 'ex abogado pérez',
                'clasificacion_id' => $this->penal->id,
            ]))
            ->assertSessionHas('success');

        $denuncia = Denuncia::where('ticket', 'DEN-2024-0015')->firstOrFail();

        $this->assertSame('cerrada', $denuncia->estado);
        $this->assertNull($denuncia->investigador_id);
        $this->assertNull($denuncia->plazo);
        $this->assertSame('EX ABOGADO PÉREZ', $denuncia->investigador_referencia);
        $this->assertSame('2024-11-20', $denuncia->cierre->cerrado_at->format('Y-m-d'));
        $this->assertSame($this->penal->id, $denuncia->informe->clasificacion_id);
        $this->assertFalse($denuncia->cierre->notificado_denunciante);
    }

    public function test_registrador_puede_cargar_historico(): void
    {
        $this->actingAs($this->reg)
            ->post('/denuncias/legacy', $this->basePayload([
                'modo' => 'historico',
                'gestion' => 2023,
                'numero_ticket' => 7,
                'fecha_recepcion' => '2023-01-10',
                'fecha_cierre' => '2023-12-01',
                'escenario' => 'anonimo',
            ]))
            ->assertSessionHas('success');

        $this->assertDatabaseHas('denuncias', ['ticket' => 'DEN-2023-0007', 'estado' => 'cerrada']);
    }

    public function test_numero_duplicado_devuelve_422_sin_crear(): void
    {
        $payload = $this->basePayload([
            'modo' => 'historico',
            'gestion' => 2024,
            'numero_ticket' => 15,
            'fecha_cierre' => '2024-11-20',
        ]);

        $this->actingAs($this->jefe)->post('/denuncias/legacy', $payload)->assertSessionHas('success');
        $this->actingAs($this->jefe)->post('/denuncias/legacy', $payload)->assertSessionHasErrors('numero_ticket');

        $this->assertSame(1, Denuncia::where('ticket', 'DEN-2024-0015')->count());
    }

    public function test_numero_manual_avanza_contador_high_water_mark(): void
    {
        ConfiguracionSistema::create([
            'clave' => 'siguiente_numero_ticket',
            'valor' => '125',
            'descripcion' => 'SIGUIENTE NÚMERO DE TICKET',
        ]);

        $this->actingAs($this->jefe)
            ->post('/denuncias/legacy', $this->basePayload([
                'modo' => 'historico',
                'gestion' => now()->year,
                'numero_ticket' => 200,
                'fecha_cierre' => now()->format('Y-m-d'),
            ]))
            ->assertSessionHas('success');

        $this->assertSame('201', ConfiguracionSistema::where('clave', 'siguiente_numero_ticket')->value('valor'));
    }

    public function test_listado_hidrata_trazabilidad_legacy(): void
    {
        $this->assertContains('registradoPor:id,name', DenunciaListQuery::with());

        $this->actingAs($this->jefe)
            ->post('/denuncias/legacy', $this->basePayload([
                'modo' => 'historico',
                'gestion' => 2024,
                'numero_ticket' => 15,
                'fecha_cierre' => '2024-11-20',
                'investigador_referencia' => 'ex abogado pérez',
            ]))
            ->assertSessionHas('success');

        $this->actingAs($this->jefe)
            ->get('/denuncias?tab=historial')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('denuncias.data.0.ticket', 'DEN-2024-0015')
                ->where('denuncias.data.0.es_legacy', true)
                ->where('denuncias.data.0.investigador_referencia', 'EX ABOGADO PÉREZ')
                ->where('denuncias.data.0.registrado_por.name', $this->jefe->name));
    }

    public function test_sin_permiso_redirige_a_dashboard(): void
    {
        // Registrador intentando modo en curso.
        $this->actingAs($this->reg)
            ->post('/denuncias/legacy', $this->basePayload())
            ->assertRedirect('/dashboard');

        // Investigador intentando modo histórico.
        $this->actingAs($this->inv)
            ->post('/denuncias/legacy', $this->basePayload([
                'modo' => 'historico',
                'gestion' => 2024,
                'numero_ticket' => 99,
                'fecha_cierre' => '2024-11-20',
            ]))
            ->assertRedirect('/dashboard');

        // Admin excluido de la carga (menor privilegio).
        $this->actingAs($this->admin)
            ->post('/denuncias/legacy', $this->basePayload([
                'modo' => 'historico',
                'gestion' => 2024,
                'numero_ticket' => 98,
                'fecha_cierre' => '2024-11-20',
            ]))
            ->assertRedirect('/dashboard');

        $this->assertSame(0, Denuncia::count());
    }
}
