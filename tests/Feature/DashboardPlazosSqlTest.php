<?php

namespace Tests\Feature;

use App\Helpers\DiasHabiles;
use App\Models\Ampliacion;
use App\Models\CategoriaDenuncia;
use App\Models\Cierre;
use App\Models\Denuncia;
use App\Models\MedioNotificacion;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class DashboardPlazosSqlTest extends TestCase
{
    use RefreshDatabase;

    private User $jefe;
    private User $registrador;
    private User $investigador;

    private int $n = 0;

    protected function setUp(): void
    {
        parent::setUp();

        $this->jefe = User::factory()->create(['username' => 'jefe', 'rol' => 'jefe', 'activo' => true]);
        $this->registrador = User::factory()->create(['username' => 'registrador', 'rol' => 'registrador', 'activo' => true]);
        $this->investigador = User::factory()->create(['username' => 'investigador1', 'rol' => 'investigador', 'activo' => true, 'name' => 'INVESTIGADOR UNO']);
    }

    private function categoria(): CategoriaDenuncia
    {
        return CategoriaDenuncia::firstOrCreate(
            ['clave' => 'cohecho'],
            ['nombre' => 'COHECHO (SOBORNO)', 'tipo_denuncia' => 'corrupcion', 'activa' => true]
        );
    }

    private function medio(): MedioNotificacion
    {
        return MedioNotificacion::firstOrCreate(
            ['clave' => 'email'],
            ['nombre' => 'EMAIL', 'activa' => true]
        );
    }

    private function denuncia(array $overrides = []): Denuncia
    {
        $this->n++;

        return Denuncia::forceCreate(array_merge([
            'ticket' => 'DEN-2026-SQL-' . str_pad((string) $this->n, 3, '0', STR_PAD_LEFT),
            'token_consulta' => str_pad((string) (2000 + $this->n), 4, '0', STR_PAD_LEFT),
            'tipo' => 'corrupcion',
            'escenario' => 'revelada',
            'estado' => 'ingresada',
            'hechos' => 'HECHOS DE PRUEBA DE PLAZOS',
            'declaracion_jurada' => true,
            'categoria_id' => $this->categoria()->id,
            'registrado_por_id' => $this->registrador->id,
            'created_at' => now()->subDays(3),
            'updated_at' => now()->subDays(3),
        ], $overrides));
    }

    private function denunciaActiva(string $tipo, Carbon $createdAt, ?int $ampliacionDias = null): Denuncia
    {
        $denuncia = $this->denuncia([
            'tipo' => $tipo,
            'estado' => 'investigacion',
            'created_at' => $createdAt,
        ]);

        if ($ampliacionDias !== null) {
            $this->ampliacion($denuncia, $ampliacionDias);
        }

        return $denuncia;
    }

    private function ampliacion(Denuncia $d, int $dias): Ampliacion
    {
        return $d->ampliaciones()->create([
            'dias' => $dias,
            'justificacion' => 'AMPLIACION DE PRUEBA',
            'fecha' => now(),
        ]);
    }

    private function cierre(Denuncia $d, Carbon $cerradoAt): Cierre
    {
        return Cierre::create([
            'denuncia_id' => $d->id,
            'notificado_denunciante' => true,
            'concluido_por' => 'INVESTIGADOR UNO',
            'cerrado_at' => $cerradoAt,
            'notificacion_medio_id' => $this->medio()->id,
            'cerrado_por_id' => $this->investigador->id,
            'eliminado' => false,
        ]);
    }

    public function test_numero_de_consultas_constante_entre_5_y_40_activas(): void
    {
        $this->denunciaActiva('corrupcion', now()->subDays(3), 10);
        $this->denunciaActiva('corrupcion', now()->subDays(3));
        $this->denunciaActiva('negacion', now()->subDays(120), 120);
        $this->denunciaActiva('negacion', now()->subDays(120));
        // Ingresada con 5 dias habiles de base: cae en "proximos" (3 a 5 dias).
        $this->denuncia(['estado' => 'ingresada', 'tipo' => 'corrupcion', 'created_at' => now()->subDays(2)]);

        $consultas = 0;
        DB::listen(function () use (&$consultas) {
            $consultas++;
        });

        $this->actingAs($this->jefe);

        // Warm-up: absorbe consultas unicas (cache de feriados, arranque de sesion).
        $this->get('/dashboard')->assertOk();
        $consultas = 0;

        $this->get('/dashboard')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('kpis.activos', 5)
                ->where('kpis.pendientesAdmision', 1)
                ->where('kpis.proximosAVencer', 1)
                ->where('kpis.vencidos', 1));
        $consultasCon5 = $consultas;

        for ($i = 0; $i < 35; $i++) {
            $this->denunciaActiva('corrupcion', now()->subDays(3), $i % 5 === 0 ? 7 : null);
        }

        $consultas = 0;

        $this->get('/dashboard')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('kpis.activos', 40)
                ->where('kpis.pendientesAdmision', 1)
                ->where('kpis.proximosAVencer', 1)
                ->where('kpis.vencidos', 1));
        $consultasCon40 = $consultas;

        $this->assertSame(
            $consultasCon5,
            $consultasCon40,
            "El dashboard debe ejecutar la misma cantidad de consultas con 5 y con 40 activas (5: {$consultasCon5}, 40: {$consultasCon40})."
        );
    }

    public function test_carga_y_urgentes_conservan_forma_y_orden(): void
    {
        $investigadorDos = User::factory()->create(['username' => 'investigador2', 'rol' => 'investigador', 'activo' => true, 'name' => 'INVESTIGADOR DOS']);
        User::factory()->create(['username' => 'investigador3', 'rol' => 'investigador', 'activo' => true, 'name' => 'INVESTIGADOR TRES']);

        // INVESTIGADOR UNO: un caso en plazo, uno proximo y uno vencido.
        $this->denunciaActivaAsignada($this->investigador, 'corrupcion', now()->subDays(3));
        $this->denunciaActivaAsignada($this->investigador, 'negacion', now()->subDays(2), 'ingresada');
        $this->denunciaActivaAsignada($this->investigador, 'negacion', now()->subDays(120));
        // INVESTIGADOR DOS: un vencido.
        $this->denunciaActivaAsignada($investigadorDos, 'negacion', now()->subDays(150));
        // INVESTIGADOR TRES queda sin casos y debe desaparecer de la carga.
        // Sin asignar: el mas urgente (300 dias) y relleno para superar el top 10.
        $masUrgente = $this->denunciaActivaAsignada(null, 'negacion', now()->subDays(300));
        foreach ([280, 260, 240, 220, 200, 180, 160] as $dias) {
            $this->denunciaActivaAsignada(null, 'negacion', now()->subDays($dias));
        }

        $this->actingAs($this->jefe);

        $this->get('/dashboard')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('rendimiento.modo', 'jefe')
                ->where('rendimiento.cargaInvestigadores', function ($carga) {
                    return count($carga) === 2
                        && $carga[0]['investigador'] === 'INVESTIGADOR DOS'
                        && $carga[0]['enPlazo'] === 0
                        && $carga[0]['proximos'] === 0
                        && $carga[0]['vencidos'] === 1
                        && $carga[1]['investigador'] === 'INVESTIGADOR UNO'
                        && $carga[1]['enPlazo'] === 1
                        && $carga[1]['proximos'] === 1
                        && $carga[1]['vencidos'] === 1;
                })
                ->where('rendimiento.urgentes', function ($urgentes) {
                    $dias = $urgentes->pluck('diasRestantes')->all();

                    return $urgentes->count() === 10 && $dias === collect($dias)->sort()->values()->all();
                })
                ->where('rendimiento.urgentes.0.ticket', $masUrgente->ticket)
                ->where('rendimiento.urgentes.0.investigador', 'SIN ASIGNAR')
                ->where('rendimiento.urgentes.0.color', 'red')
                ->where('rendimiento.urgentes.0.estado', 'investigacion'));
    }

    private function denunciaActivaAsignada(?User $investigador, string $tipo, Carbon $createdAt, string $estado = 'investigacion'): Denuncia
    {
        return $this->denuncia([
            'tipo' => $tipo,
            'estado' => $estado,
            'investigador_id' => $investigador?->id,
            'created_at' => $createdAt,
        ]);
    }

    public function test_ampliaciones_del_agregado_sql_clasifican_y_cumplen(): void
    {
        // Activas: misma base; la ampliacion mueve la clasificacion de vencida a en plazo.
        $this->denunciaActiva('negacion', now()->subDays(120));
        $this->denunciaActiva('negacion', now()->subDays(120), 120);

        // Cerradas: cierre despues del vencimiento base; la ampliacion lo cubre.
        $base = now()->subDays(90);
        $vencimientoBase = DiasHabiles::agregar(20, $base);
        $cerradaSin = $this->denuncia(['tipo' => 'negacion', 'estado' => 'cerrada', 'created_at' => $base]);
        $cerradaCon = $this->denuncia(['tipo' => 'negacion', 'estado' => 'cerrada', 'created_at' => $base]);
        $this->ampliacion($cerradaCon, 60);
        $this->cierre($cerradaSin, $vencimientoBase->copy()->addDay());
        $this->cierre($cerradaCon, $vencimientoBase->copy()->addDay());

        $this->actingAs($this->jefe);

        $this->get('/dashboard')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('kpis.activos', 2)
                ->where('kpis.proximosAVencer', 0)
                ->where('kpis.vencidos', 1)
                ->where('kpis.cumplimiento', fn ($v) => (float) $v === 50.0));
    }
}
