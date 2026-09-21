<?php

namespace Tests\Feature;

use App\Http\Controllers\ReporteController;
use App\Models\CategoriaDenuncia;
use App\Models\Clasificacion;
use App\Models\Denuncia;
use App\Models\DependenciaExterna;
use App\Models\MedioNotificacion;
use App\Models\User;
use App\Exports\ReporteExcel;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Tests\TestCase;

class ReporteTest extends TestCase
{
    use RefreshDatabase;

    private User $jefe;
    private User $investigador;
    private User $registrador;

    private int $n = 0;

    protected function setUp(): void
    {
        parent::setUp();

        $this->jefe = User::factory()->create(['username' => 'jefe', 'rol' => 'jefe', 'activo' => true]);
        $this->investigador = User::factory()->create(['username' => 'investigador1', 'rol' => 'investigador', 'activo' => true]);
        $this->registrador = User::factory()->create(['username' => 'registrador', 'rol' => 'registrador', 'activo' => true]);

        CategoriaDenuncia::create([
            'clave' => 'cohecho',
            'nombre' => 'COHECHO (SOBORNO)',
            'tipo_denuncia' => 'corrupcion',
            'activa' => true,
        ]);

        Clasificacion::create([
            'clave' => 'administrativo',
            'nombre' => 'ADMINISTRATIVO',
            'activa' => true,
        ]);
    }

    private function denuncia(array $overrides = []): Denuncia
    {
        $this->n++;

        return Denuncia::forceCreate(array_merge([
            'ticket' => 'DEN-2026-REP-' . str_pad((string) $this->n, 3, '0', STR_PAD_LEFT),
            'token_consulta' => str_pad((string) (2000 + $this->n), 4, '0', STR_PAD_LEFT),
            'tipo' => 'corrupcion',
            'escenario' => 'revelada',
            'estado' => 'ingresada',
            'hechos' => 'HECHOS DE PRUEBA DEL REPORTE',
            'declaracion_jurada' => true,
            'categoria_id' => CategoriaDenuncia::first()->id,
            'registrado_por_id' => $this->registrador->id,
            'created_at' => now()->subDays(3),
            'updated_at' => now()->subDays(3),
        ], $overrides));
    }

    public function test_solo_jefe_accede_a_reportes(): void
    {
        $this->denuncia();

        $this->actingAs($this->investigador);
        $this->get('/reportes')->assertRedirect('/dashboard');

        $this->actingAs($this->registrador);
        $this->get('/reportes')->assertRedirect('/dashboard');
    }

    public function test_listado_paginado_con_datos(): void
    {
        foreach (range(1, 5) as $i) {
            $this->denuncia();
        }

        $this->actingAs($this->jefe);

        $response = $this->get('/reportes');

        $response->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Reportes/Index')
                ->where('denuncias.total', 5));
    }

    public function test_filtros_cruzados(): void
    {
        $this->denuncia(['tipo' => 'corrupcion', 'estado' => 'admitida']);
        $this->denuncia(['tipo' => 'negacion', 'estado' => 'ingresada']);

        $this->actingAs($this->jefe);

        $response = $this->get('/reportes?tipo=corrupcion&estado=admitida');

        $response->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('denuncias.total', 1)
                ->where('denuncias.data.0.ticket', 'DEN-2026-REP-001'));
    }

    public function test_busqueda_por_ticket(): void
    {
        $d = $this->denuncia();

        $this->actingAs($this->jefe);

        $response = $this->get('/reportes?busqueda=' . $d->ticket);

        $response->assertOk()
            ->assertInertia(fn ($page) => $page->where('denuncias.total', 1));
    }

    public function test_preview_devuelve_json(): void
    {
        $this->denuncia();

        $this->actingAs($this->jefe);

        $response = $this->get('/reportes/preview');

        $response->assertOk()
            ->assertJsonStructure(['total', 'rows'])
            ->assertJsonPath('total', 1);
    }

    public function test_preview_expone_contrato_unico_de_columnas(): void
    {
        $this->denuncia();

        $this->actingAs($this->jefe);

        $response = $this->get('/reportes/preview')->assertOk();

        $columnas = $response->json('columnas');

        $this->assertSame(array_keys(ReporteController::COLUMNAS_EXCEL), array_column($columnas, 'key'));
        $this->assertSame(array_values(ReporteController::COLUMNAS_EXCEL), array_column($columnas, 'label'));

        foreach ($columnas as $columna) {
            $this->assertSame(
                in_array($columna['key'], ReporteController::COLUMNAS_FIJAS, true),
                $columna['fija']
            );
        }

        $this->assertSame(ReporteController::COLUMNAS_DEFAULT, $response->json('columnas_default'));
    }

    public function test_columnas_pedidas_filtra_desconocidas_y_usa_default(): void
    {
        $request = fn (array $input) => Request::create('/reportes/exportar', 'GET', $input);

        $this->assertSame(
            ['ticket', 'estado'],
            ReporteController::columnasPedidas($request(['columnas' => ['ticket', 'invalida', 'estado']]))
        );

        $this->assertSame(ReporteController::COLUMNAS_DEFAULT, ReporteController::columnasPedidas($request([])));
        $this->assertSame(
            ReporteController::COLUMNAS_DEFAULT,
            ReporteController::columnasPedidas($request(['columnas' => ['invalida']]))
        );
    }

    public function test_exportar_excel(): void
    {
        $this->denuncia();

        $this->actingAs($this->jefe);

        $response = $this->get('/reportes/exportar?formato=excel');

        $response->assertOk();
        $this->assertStringContainsString(
            'spreadsheetml',
            $response->headers->get('content-type') ?? ''
        );
    }

    public function test_exportar_pdf(): void
    {
        $this->denuncia();

        $this->actingAs($this->jefe);

        $response = $this->get('/reportes/exportar?formato=pdf');

        $response->assertOk();
        $this->assertStringContainsString(
            'application/pdf',
            $response->headers->get('content-type') ?? ''
        );
    }

    public function test_investigador_no_puede_exportar(): void
    {
        $this->denuncia();

        $this->actingAs($this->investigador);

        $this->get('/reportes/exportar?formato=excel')->assertRedirect('/dashboard');
        $this->get('/reportes/exportar?formato=pdf')->assertRedirect('/dashboard');
    }

    public function test_preview_filtra_por_medio_notificacion(): void
    {
        $medioEmail = MedioNotificacion::create(['clave' => 'email', 'nombre' => 'EMAIL']);
        $medioOtro = MedioNotificacion::create(['clave' => 'otro', 'nombre' => 'OTRO']);

        $conEmail = $this->denuncia(['estado' => 'cerrada']);
        $conEmail->cierre()->create([
            'notificado_denunciante' => true,
            'notificacion_medio_id' => $medioEmail->id,
            'concluido_por' => 'INVESTIGADOR UNO',
            'cerrado_at' => now(),
        ]);

        $conOtro = $this->denuncia(['estado' => 'cerrada']);
        $conOtro->cierre()->create([
            'notificado_denunciante' => true,
            'notificacion_medio_id' => $medioOtro->id,
            'concluido_por' => 'INVESTIGADOR UNO',
            'cerrado_at' => now(),
        ]);

        $this->actingAs($this->jefe);

        $this->get('/reportes/preview?medio_id=' . $medioEmail->id)
            ->assertOk()
            ->assertJsonPath('total', 1)
            ->assertJsonPath('rows.0.ticket', $conEmail->ticket);
    }

    public function test_preview_paginado(): void
    {
        foreach (range(1, 15) as $i) {
            $this->denuncia();
        }

        $this->actingAs($this->jefe);

        $this->get('/reportes/preview?page=2')
            ->assertOk()
            ->assertJsonPath('total', 15)
            ->assertJsonPath('current_page', 2)
            ->assertJsonPath('last_page', 2)
            ->assertJsonCount(5, 'rows');
    }

    public function test_exportar_excel_con_columnas_elegidas(): void
    {
        $this->denuncia();

        $this->actingAs($this->jefe);

        $response = $this->get('/reportes/exportar?formato=excel&columnas[]=ticket&columnas[]=estado&columnas[]=invalida');

        $response->assertOk();
        $this->assertStringContainsString(
            'spreadsheetml',
            $response->headers->get('content-type') ?? ''
        );
    }

    public function test_exportar_excel_columnas_cliente_por_defecto(): void
    {
        $d = $this->denuncia(['estado' => 'informe', 'escenario' => 'revelada']);
        $d->denunciante()->create(['nombres' => 'JUAN PEREZ']);
        $d->denunciados()->create([
            'orden' => 0, 'conoce_identidad' => true,
            'nombres' => 'PEDRO GOMEZ', 'dependencia' => 'CONTRATACIONES',
        ]);
        $d->informe()->create([
            'clasificacion_id' => Clasificacion::first()->id,
            'sitpreco' => 'SIT-2026-001',
            'justificacion' => 'SE VERIFICO EL SOBREPRECIO.',
            'concluido_por' => 'INVESTIGADOR UNO',
            'redactado_at' => now()->subDays(2),
        ]);

        $export = new ReporteExcel(
            Denuncia::with(['investigador', 'categoria', 'denunciante', 'denunciados', 'informe.clasificacionRel'])->get()
        );

        $this->assertSame(
            ['FECHA DE INGRESO', 'NRO DE DENUNCIA', 'TIPO DE DENUNCIA', 'DATOS DEL DENUNCIANTE', 'DATOS DE LOS DENUNCIADOS', 'NRO SITPRECO', 'INVESTIGADOR ENCARGADO', 'FECHA DE CONCLUSIÓN', 'RESUMEN DE CONCLUSIÓN DEL CASO', 'CLASIFICACIÓN FINAL DEL CASO'],
            $export->headings()
        );

        $fila = $export->collection()->firstWhere(fn ($r) => $r[1] === $d->ticket);
        $this->assertSame('JUAN PEREZ', $fila[3]);
        $this->assertSame('PEDRO GOMEZ (CONTRATACIONES)', $fila[4]);
        $this->assertSame('SIT-2026-001', $fila[5]);
        $this->assertSame('SE VERIFICO EL SOBREPRECIO.', $fila[8]);
    }

    public function test_exportar_excel_denunciante_anonimo_enmascarado(): void
    {
        $d = $this->denuncia(['escenario' => 'anonimo']);
        $d->denunciados()->create(['orden' => 0, 'conoce_identidad' => false]);

        $export = new ReporteExcel(
            Denuncia::with(['denunciante', 'denunciados'])->get(),
            ['denunciante', 'denunciados']
        );

        $fila = $export->collection()->first();
        $this->assertSame('ANÓNIMO', $fila[0]);
        $this->assertSame('NO IDENTIFICADO', $fila[1]);
    }

    public function test_preview_clasificacion_usa_fecha_informe(): void
    {
        // Informe reciente de un caso ingresado hace 60 días: el gráfico lo
        // cuenta en el último mes, el modal debe listarlo también.
        $viejo = $this->denuncia(['estado' => 'informe', 'created_at' => now()->subDays(60), 'updated_at' => now()->subDays(60)]);
        $viejo->informe()->create([
            'clasificacion_id' => Clasificacion::first()->id,
            'concluido_por' => 'INVESTIGADOR UNO',
            'redactado_at' => now()->subDays(5),
        ]);

        $this->actingAs($this->jefe);

        $desde = now()->subDays(30)->toDateString();
        $hasta = now()->toDateString();

        // Base informe (la que usa el drill-down): sí aparece.
        $this->get("/reportes/preview?clasificacion_id=" . Clasificacion::first()->id . "&desde={$desde}&hasta={$hasta}")
            ->assertOk()
            ->assertJsonPath('total', 1);

        // Base ingreso explícita: no aparece (ingresó hace 60 días).
        $this->get("/reportes/preview?clasificacion_id=" . Clasificacion::first()->id . "&desde={$desde}&hasta={$hasta}&fecha_base=ingreso")
            ->assertOk()
            ->assertJsonPath('total', 0);
    }

    public function test_preview_filtra_por_dependencia_con_subarbol(): void
    {
        $padre = DependenciaExterna::create(['nombre' => 'SECRETARIA PRUEBA', 'activa' => true]);
        $hija = DependenciaExterna::create(['nombre' => 'UNIDAD PRUEBA', 'parent_id' => $padre->id, 'activa' => true]);

        $d = $this->denuncia(['estado' => 'investigacion']);
        $d->solicitudes()->create([
            'dependencia_destino_id' => $hija->id,
            'detalle' => 'SOLICITUD DE PRUEBA',
            'plazo_dias' => 10,
            'fecha_envio' => now(),
            'fecha_vencimiento' => now()->addDays(10),
        ]);
        $this->denuncia(['estado' => 'investigacion']);

        $this->actingAs($this->jefe);

        // Filtrar por el padre trae el caso de la hija (roll-up).
        $this->get('/reportes/preview?dependencia_id=' . $padre->id)
            ->assertOk()
            ->assertJsonPath('total', 1)
            ->assertJsonPath('rows.0.ticket', $d->ticket);
    }
}
