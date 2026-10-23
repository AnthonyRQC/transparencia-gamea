<?php

namespace Tests\Feature;

use App\Models\Bitacora;
use App\Models\CategoriaDenuncia;
use App\Models\Denuncia;
use App\Models\User;
use App\Services\BitacoraService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;
use Inertia\Testing\AssertableInertia as Assert;
use LogicException;
use Tests\TestCase;

class BitacoraEnriquecidaTest extends TestCase
{
    use RefreshDatabase;

    private User $jefe;
    private User $investigador;
    private User $registrador;
    private Denuncia $denuncia;

    protected function setUp(): void
    {
        parent::setUp();

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
            'ticket' => 'DEN-2026-0500',
            'token_consulta' => '5500',
            'estado' => 'asignada',
            'investigador_id' => $this->investigador->id,
        ]);
    }

    public function test_user_agent_se_captura_en_los_tres_caminos_de_escritura_via_http(): void
    {
        Route::middleware(['web', 'auth'])->group(function () {
            Route::post('/_test/bitacora/relation', function () {
                $denuncia = Denuncia::firstOrFail();
                $bitacora = $denuncia->bitacora()->create([
                    'accion' => 'test_relation',
                    'detalle' => 'DETALLE RELATION',
                    'usuario_id' => auth()->id(),
                    'fecha' => now(),
                ]);
                return response()->json(['id' => $bitacora->id]);
            });

            Route::post('/_test/bitacora/direct', function () {
                $denuncia = Denuncia::firstOrFail();
                $bitacora = Bitacora::create([
                    'denuncia_id' => $denuncia->id,
                    'accion' => 'test_direct',
                    'detalle' => 'DETALLE DIRECT',
                    'usuario_id' => auth()->id(),
                    'fecha' => now(),
                ]);
                return response()->json(['id' => $bitacora->id]);
            });

            Route::post('/_test/bitacora/service', function () {
                $denuncia = Denuncia::firstOrFail();
                BitacoraService::registrar(
                    entidadTipo: 'denuncia',
                    entidadId: $denuncia->id,
                    accion: 'test_service',
                    detalle: ['mensaje' => 'DETALLE SERVICE']
                );
                $bitacora = Bitacora::where('accion', 'test_service')->firstOrFail();
                return response()->json(['id' => $bitacora->id]);
            });
        });

        $ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) TestBrowser/1.0';

        // Camino 1: Relación
        $res1 = $this->actingAs($this->jefe)
            ->withHeaders(['User-Agent' => $ua])
            ->postJson('/_test/bitacora/relation');
        $res1->assertOk();
        $b1 = Bitacora::find($res1->json('id'));
        $this->assertNotNull($b1);
        $this->assertSame($ua, $b1->user_agent);

        // Camino 2: Directo
        $res2 = $this->actingAs($this->jefe)
            ->withHeaders(['User-Agent' => $ua])
            ->postJson('/_test/bitacora/direct');
        $res2->assertOk();
        $b2 = Bitacora::find($res2->json('id'));
        $this->assertNotNull($b2);
        $this->assertSame($ua, $b2->user_agent);

        // Camino 3: Servicio
        $res3 = $this->actingAs($this->jefe)
            ->withHeaders(['User-Agent' => $ua])
            ->postJson('/_test/bitacora/service');
        $res3->assertOk();
        $b3 = Bitacora::find($res3->json('id'));
        $this->assertNotNull($b3);
        $this->assertSame($ua, $b3->user_agent);
    }

    public function test_user_agent_largo_se_trunca_a_512_caracteres(): void
    {
        Route::middleware(['web', 'auth'])->post('/_test/bitacora/truncate', function () {
            $denuncia = Denuncia::firstOrFail();
            $b = $denuncia->bitacora()->create([
                'accion' => 'test_truncate',
                'detalle' => 'TRUNCATE TEST',
                'usuario_id' => auth()->id(),
                'fecha' => now(),
            ]);
            return response()->json(['id' => $b->id, 'ua' => $b->user_agent]);
        });

        $longUa = str_repeat('A', 700);

        $res = $this->actingAs($this->jefe)
            ->withHeaders(['User-Agent' => $longUa])
            ->postJson('/_test/bitacora/truncate');

        $res->assertOk();
        $b = Bitacora::find($res->json('id'));
        $this->assertSame(512, mb_strlen($b->user_agent));
        $this->assertSame(str_repeat('A', 512), $b->user_agent);
    }

    public function test_user_agent_explicito_no_se_sobrescribe(): void
    {
        Route::middleware(['web', 'auth'])->post('/_test/bitacora/explicit', function () {
            $denuncia = Denuncia::firstOrFail();
            $b = $denuncia->bitacora()->create([
                'accion' => 'test_explicit',
                'detalle' => 'EXPLICIT TEST',
                'usuario_id' => auth()->id(),
                'fecha' => now(),
                'user_agent' => 'CustomExplicitUA/3.0',
            ]);
            return response()->json(['id' => $b->id]);
        });

        $res = $this->actingAs($this->jefe)
            ->withHeaders(['User-Agent' => 'RequestUA/1.0'])
            ->postJson('/_test/bitacora/explicit');

        $res->assertOk();
        $b = Bitacora::find($res->json('id'));
        $this->assertSame('CustomExplicitUA/3.0', $b->user_agent);
    }

    public function test_bitacora_es_append_only_y_lanza_excepcion_al_actualizar(): void
    {
        $b = Bitacora::create([
            'denuncia_id' => $this->denuncia->id,
            'accion' => 'creacion',
            'detalle' => 'DETALLE ORIGINAL',
            'usuario_id' => $this->jefe->id,
            'fecha' => now(),
        ]);

        $this->expectException(LogicException::class);
        $this->expectExceptionMessage('La bitácora es append-only: no admite edición ni borrado.');

        $b->update(['detalle' => 'DETALLE MODIFICADO']);
    }

    public function test_bitacora_es_append_only_y_lanza_excepcion_al_borrar(): void
    {
        $b = Bitacora::create([
            'denuncia_id' => $this->denuncia->id,
            'accion' => 'creacion',
            'detalle' => 'DETALLE ORIGINAL',
            'usuario_id' => $this->jefe->id,
            'fecha' => now(),
        ]);

        $this->expectException(LogicException::class);
        $this->expectExceptionMessage('La bitácora es append-only: no admite edición ni borrado.');

        $b->delete();
    }

    public function test_bitacora_no_persiste_ip_address(): void
    {
        $this->assertFalse(Schema::hasColumn('bitacora', 'ip_address'));

        $bitacora = new Bitacora();
        $this->assertNotContains('ip_address', $bitacora->getFillable());
        $this->assertArrayNotHasKey('ip_address', $bitacora->toArray());
    }

    public function test_rechazo_y_reapertura_registran_bitacora(): void
    {
        CategoriaDenuncia::create([
            'clave' => 'cohecho',
            'nombre' => 'COHECHO (SOBORNO)',
            'tipo_denuncia' => 'corrupcion',
            'activa' => true,
        ]);

        $denuncia = Denuncia::factory()->create([
            'ticket' => 'DEN-2026-0600',
            'token_consulta' => '5600',
            'tipo' => 'corrupcion',
            'estado' => 'ingresada',
        ]);

        $this->actingAs($this->jefe);
        $this->post("/denuncias/{$denuncia->ticket}/rechazar", [
            'justificacion' => 'RECHAZO DE PRUEBA PARA AUDITORÍA',
        ]);

        $this->assertNotNull($denuncia->bitacora()->where('accion', 'rechazada')->first());

        $this->post("/denuncias/{$denuncia->ticket}/reabrir", [
            'justificacion' => 'JUSTIFICACIÓN VÁLIDA DE PRUEBA PARA REABRIR EL CASO',
            'nueva_fecha_limite' => now()->addDays(10)->format('Y-m-d'),
        ]);

        $this->assertNotNull($denuncia->bitacora()->where('accion', 'reapertura')->first());
    }

    public function test_proyeccion_operativa_no_expone_user_agent_en_bandeja_mis_casos_y_consultar(): void
    {
        // Creamos una entrada con user_agent
        Bitacora::create([
            'denuncia_id' => $this->denuncia->id,
            'accion' => 'ingreso',
            'detalle' => 'INGRESO INICIAL',
            'usuario_id' => $this->jefe->id,
            'fecha' => now(),
            'user_agent' => 'TopSecretUA/9.9',
        ]);

        // 1. Bandeja (/denuncias) - Jefe (tab en-curso para caso 'asignada')
        $responseBandeja = $this->actingAs($this->jefe)->get(route('denuncias.bandeja', ['tab' => 'en-curso']));
        $responseBandeja->assertOk();
        $responseBandeja->assertInertia(function (Assert $page) {
            $page->component('Denuncias/Bandeja')
                ->has('denuncias.data.0.bitacora');
            $props = $page->toArray()['props'];
            $bitacoras = $props['denuncias']['data'][0]['bitacora'];
            $this->assertNotEmpty($bitacoras);
            foreach ($bitacoras as $item) {
                $this->assertArrayNotHasKey('user_agent', $item);
            }
        });
        $responseBandeja->assertDontSee('TopSecretUA/9.9');

        // 2. Mis Casos (/denuncias/mis-casos) - Investigador
        $responseMisCasos = $this->actingAs($this->investigador)->get(route('denuncias.mis-casos'));
        $responseMisCasos->assertOk();
        $responseMisCasos->assertInertia(function (Assert $page) {
            $page->component('Denuncias/MisCasos')
                ->has('denuncias.data.0.bitacora');
            $props = $page->toArray()['props'];
            $bitacoras = $props['denuncias']['data'][0]['bitacora'];
            $this->assertNotEmpty($bitacoras);
            foreach ($bitacoras as $item) {
                $this->assertArrayNotHasKey('user_agent', $item);
            }
        });
        $responseMisCasos->assertDontSee('TopSecretUA/9.9');

        // 3. Consultar Casos (/denuncias/consultar) - Registrador
        $responseConsultar = $this->actingAs($this->registrador)->get(route('denuncias.consultar'));
        $responseConsultar->assertOk();
        $responseConsultar->assertInertia(function (Assert $page) {
            $page->component('Denuncias/ConsultarCasos')
                ->has('denuncias.0.bitacora');
            $props = $page->toArray()['props'];
            $bitacoras = $props['denuncias'][0]['bitacora'];
            $this->assertNotEmpty($bitacoras);
            foreach ($bitacoras as $item) {
                $this->assertArrayNotHasKey('user_agent', $item);
            }
        });
        $responseConsultar->assertDontSee('TopSecretUA/9.9');
    }
}
