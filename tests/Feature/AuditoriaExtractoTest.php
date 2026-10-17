<?php

namespace Tests\Feature;

use App\Exports\ExtractoExcel;
use App\Models\Bitacora;
use App\Models\Denuncia;
use App\Models\User;
use App\Services\ExtractoService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Maatwebsite\Excel\Facades\Excel;
use Tests\TestCase;

class AuditoriaExtractoTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $jefe;
    private User $investigador;
    private User $registrador;
    private Denuncia $denuncia;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create([
            'username' => 'admin_extracto',
            'name' => 'ADMIN AUDITOR',
            'rol' => 'admin',
            'activo' => true,
        ]);

        $this->jefe = User::factory()->create([
            'username' => 'jefe_extracto',
            'name' => 'JEFE OPERATIVO',
            'rol' => 'jefe',
            'activo' => true,
        ]);

        $this->investigador = User::factory()->create([
            'username' => 'inv_extracto',
            'name' => 'INVESTIGADOR UNO',
            'rol' => 'investigador',
            'activo' => true,
        ]);

        $this->registrador = User::factory()->create([
            'username' => 'reg_extracto',
            'name' => 'REGISTRADOR UNO',
            'rol' => 'registrador',
            'activo' => true,
        ]);

        $this->denuncia = Denuncia::factory()->create([
            'ticket' => 'DEN-2026-0800',
            'token_consulta' => '8800',
            'estado' => 'investigacion',
            'tipo' => 'corrupcion',
            'investigador_id' => $this->investigador->id,
        ]);
    }

    public function test_autorizacion_y_redireccion_por_rol(): void
    {
        // Invitado -> login
        $this->get(route('admin.auditoria.extracto', $this->denuncia->ticket))
            ->assertRedirect(route('login'));
        $this->get(route('denuncias.extracto.operativo', $this->denuncia->ticket))
            ->assertRedirect(route('login'));

        // Investigador sin permisos de extracto -> dashboard
        $this->actingAs($this->investigador)
            ->get(route('admin.auditoria.extracto', $this->denuncia->ticket))
            ->assertRedirect(route('dashboard'));
        $this->actingAs($this->investigador)
            ->get(route('denuncias.extracto.operativo', $this->denuncia->ticket))
            ->assertRedirect(route('dashboard'));

        // Jefe accede al operativo pero NO al técnico
        $this->actingAs($this->jefe)
            ->get(route('admin.auditoria.extracto', $this->denuncia->ticket))
            ->assertRedirect(route('dashboard'));

        $this->actingAs($this->jefe)
            ->get(route('denuncias.extracto.operativo', $this->denuncia->ticket))
            ->assertOk();

        // Admin accede al técnico pero NO al operativo
        $this->actingAs($this->admin)
            ->get(route('denuncias.extracto.operativo', $this->denuncia->ticket))
            ->assertRedirect(route('dashboard'));

        $this->actingAs($this->admin)
            ->get(route('admin.auditoria.extracto', $this->denuncia->ticket))
            ->assertOk();
    }

    public function test_ticket_inexistente_retorna_404_y_no_registra_evento(): void
    {
        $conteoInicial = Bitacora::where('accion', 'auditoria_extracto')->count();

        $this->actingAs($this->admin)
            ->get(route('admin.auditoria.extracto', 'TICKET-INEXISTENTE'))
            ->assertNotFound();

        $this->actingAs($this->jefe)
            ->get(route('denuncias.extracto.operativo', 'TICKET-INEXISTENTE'))
            ->assertNotFound();

        $this->assertSame($conteoInicial, Bitacora::where('accion', 'auditoria_extracto')->count());
    }

    public function test_formato_invalido_es_rechazado(): void
    {
        $this->actingAs($this->admin)
            ->get(route('admin.auditoria.extracto', ['ticket' => $this->denuncia->ticket, 'formato' => 'exe']))
            ->assertSessionHasErrors('formato');

        $this->actingAs($this->jefe)
            ->get(route('denuncias.extracto.operativo', ['ticket' => $this->denuncia->ticket, 'formato' => 'doc']))
            ->assertSessionHasErrors('formato');
    }

    public function test_ambas_proyecciones_exponen_secuencias_identicas_de_id_cotejo(): void
    {
        $b1 = Bitacora::create([
            'denuncia_id' => $this->denuncia->id,
            'accion' => 'admitida',
            'detalle' => 'DETALLE ADMISIÓN',
            'usuario_id' => $this->jefe->id,
            'fecha' => now()->subHours(2),
            'user_agent' => 'JefeBrowser/1.0',
        ]);

        $b2 = Bitacora::create([
            'denuncia_id' => $this->denuncia->id,
            'accion' => 'archivo_descargado',
            'detalle' => 'DESCARGA DE ARCHIVO #5',
            'usuario_id' => $this->investigador->id,
            'fecha' => now()->subHour(),
            'user_agent' => 'InvBrowser/2.0',
        ]);

        $operativas = ExtractoService::operativas($this->denuncia);
        $tecnicas = ExtractoService::tecnicas($this->denuncia);

        // Mismo número de filas
        $this->assertCount(2, $operativas['filas']);
        $this->assertCount(2, $tecnicas['filas']);

        // Secuencia idéntica de N° (bitacora.id)
        $idsOperativos = $operativas['filas']->pluck('id')->all();
        $idsTecnicos = $tecnicas['filas']->pluck('id')->all();

        $this->assertSame([$b1->id, $b2->id], $idsOperativos);
        $this->assertSame($idsOperativos, $idsTecnicos);
    }

    public function test_proyeccion_tecnica_tiene_user_agent_y_no_detalle(): void
    {
        Bitacora::create([
            'denuncia_id' => $this->denuncia->id,
            'accion' => 'admitida',
            'detalle' => 'TEXTO SECRETO DEL CASO',
            'usuario_id' => $this->jefe->id,
            'fecha' => now(),
            'user_agent' => 'Mozilla/5.0 TechnicalAgent',
        ]);

        $tecnicas = ExtractoService::tecnicas($this->denuncia);
        $fila = $tecnicas['filas']->first();

        $this->assertArrayHasKey('user_agent', $fila);
        $this->assertSame('Mozilla/5.0 TechnicalAgent', $fila['user_agent']);
        $this->assertArrayNotHasKey('detalle', $fila);
        $this->assertContains('NAVEGADOR', $tecnicas['headings']);
        $this->assertNotContains('QUÉ CAMBIÓ', $tecnicas['headings']);
    }

    public function test_proyeccion_operativa_tiene_detalle_y_no_user_agent(): void
    {
        Bitacora::create([
            'denuncia_id' => $this->denuncia->id,
            'accion' => 'admitida',
            'detalle' => 'SE ADMITIÓ LA DENUNCIA CON ÉXITO',
            'usuario_id' => $this->jefe->id,
            'fecha' => now(),
            'user_agent' => 'Mozilla/5.0 OperativeAgent',
        ]);

        $operativas = ExtractoService::operativas($this->denuncia);
        $fila = $operativas['filas']->first();

        $this->assertArrayHasKey('detalle', $fila);
        $this->assertSame('SE ADMITIÓ LA DENUNCIA CON ÉXITO', $fila['detalle']);
        $this->assertArrayNotHasKey('user_agent', $fila);
        $this->assertContains('QUÉ CAMBIÓ', $operativas['headings']);
        $this->assertNotContains('NAVEGADOR', $operativas['headings']);
    }

    public function test_caso_sin_eventos_retorna_200_con_sin_eventos_registrados(): void
    {
        // Caso sin bitácora
        $casoVacio = Denuncia::factory()->create([
            'ticket' => 'DEN-2026-0801',
            'token_consulta' => '8801',
            'estado' => 'ingresada',
        ]);

        $resOp = $this->actingAs($this->jefe)
            ->get(route('denuncias.extracto.operativo', $casoVacio->ticket));

        $resOp->assertOk();
        $this->assertStringContainsString('application/pdf', $resOp->headers->get('content-type') ?? '');

        $resTec = $this->actingAs($this->admin)
            ->get(route('admin.auditoria.extracto', $casoVacio->ticket));

        $resTec->assertOk();
        $this->assertStringContainsString('application/pdf', $resTec->headers->get('content-type') ?? '');
    }

    public function test_extracto_funciona_en_caso_cerrado_y_en_caso_soft_deleted(): void
    {
        // Caso cerrado
        $casoCerrado = Denuncia::factory()->create([
            'ticket' => 'DEN-2026-0802',
            'token_consulta' => '8802',
            'estado' => 'cerrada',
        ]);

        Bitacora::create([
            'denuncia_id' => $casoCerrado->id,
            'accion' => 'cierre',
            'detalle' => 'CASO CONCLUIDO Y NOTIFICADO',
            'usuario_id' => $this->investigador->id,
            'fecha' => now(),
        ]);

        $this->actingAs($this->jefe)
            ->get(route('denuncias.extracto.operativo', $casoCerrado->ticket))
            ->assertOk();

        // Caso eliminado (soft-deleted)
        $casoBorrado = Denuncia::factory()->create([
            'ticket' => 'DEL-2026-0803',
            'token_consulta' => '8803',
            'estado' => 'ingresada',
        ]);
        $casoBorrado->delete();

        Bitacora::create([
            'denuncia_id' => $casoBorrado->id,
            'accion' => 'eliminacion',
            'detalle' => 'ELIMINACIÓN ADMINISTRATIVA',
            'usuario_id' => $this->admin->id,
            'fecha' => now(),
        ]);

        $this->actingAs($this->admin)
            ->get(route('admin.auditoria.extracto', $casoBorrado->ticket))
            ->assertOk();

        $this->actingAs($this->jefe)
            ->get(route('denuncias.extracto.operativo', $casoBorrado->ticket))
            ->assertOk();
    }

    public function test_metadatos_incluyen_caso_id_generado_por_registros_y_rango(): void
    {
        $b1 = Bitacora::create([
            'denuncia_id' => $this->denuncia->id,
            'accion' => 'admitida',
            'detalle' => 'ADMISIÓN',
            'usuario_id' => $this->jefe->id,
            'fecha' => now()->subDay(),
        ]);

        $b2 = Bitacora::create([
            'denuncia_id' => $this->denuncia->id,
            'accion' => 'asignada',
            'detalle' => 'ASIGNACIÓN',
            'usuario_id' => $this->jefe->id,
            'fecha' => now(),
        ]);

        $this->actingAs($this->jefe);
        $datos = ExtractoService::operativas($this->denuncia);
        $meta = $datos['meta'];

        $this->assertSame($this->denuncia->id, $meta['caso_id']);
        $this->assertSame('DEN-2026-0800', $meta['ticket']);
        $this->assertSame('JEFE OPERATIVO', $meta['generado_por']);
        $this->assertSame(2, $meta['registros']);
        $this->assertSame("{$b1->id}–{$b2->id}", $meta['rango']);
    }

    public function test_auditoria_extracto_se_registra_en_cada_exportacion(): void
    {
        $this->actingAs($this->jefe)
            ->get(route('denuncias.extracto.operativo', $this->denuncia->ticket))
            ->assertOk();

        $logOperativo = Bitacora::where('accion', 'auditoria_extracto')
            ->where('usuario_id', $this->jefe->id)
            ->latest('id')
            ->first();

        $this->assertNotNull($logOperativo);
        $this->assertNull($logOperativo->denuncia_id); // Bitácora de auditoría pura
        $detalleOp = array_change_key_case(json_decode($logOperativo->detalle, true) ?? [], CASE_LOWER);
        $this->assertSame('operativa', strtolower($detalleOp['proyeccion'] ?? ''));
        $this->assertSame($this->denuncia->ticket, strtoupper($detalleOp['ticket'] ?? ''));
        $this->assertSame('pdf', strtolower($detalleOp['formato'] ?? ''));

        $this->actingAs($this->admin)
            ->get(route('admin.auditoria.extracto', ['ticket' => $this->denuncia->ticket, 'formato' => 'xlsx']))
            ->assertOk();

        $logTecnico = Bitacora::where('accion', 'auditoria_extracto')
            ->where('usuario_id', $this->admin->id)
            ->latest('id')
            ->first();

        $this->assertNotNull($logTecnico);
        $detalleTec = array_change_key_case(json_decode($logTecnico->detalle, true) ?? [], CASE_LOWER);
        $this->assertSame('tecnica', strtolower($detalleTec['proyeccion'] ?? ''));
        $this->assertSame($this->denuncia->ticket, strtoupper($detalleTec['ticket'] ?? ''));
        $this->assertSame('xlsx', strtolower($detalleTec['formato'] ?? ''));
    }

    public function test_excel_export_sanitiza_formula_injection_y_define_encabezados(): void
    {
        Excel::fake();

        $this->actingAs($this->jefe)
            ->get(route('denuncias.extracto.operativo', ['ticket' => $this->denuncia->ticket, 'formato' => 'xlsx']))
            ->assertOk();

        $fecha = now()->format('Y-m-d');
        Excel::assertDownloaded("extracto-operativo-{$this->denuncia->ticket}-{$fecha}.xlsx");

        // Inspección directa de colección y sanitización
        $maliciousRows = collect([
            ['1', '17/10/2026', 'Hacker', '=CMD|"/C calc"!A0', 'Normal'],
            ['2', '17/10/2026', 'Hacker', '+SUM(1,2)', '-ALERT(1)'],
            ['3', '17/10/2026', 'Hacker', '@SUM(A1:A2)', 'TEXTO SEGURO'],
        ]);

        $export = new ExtractoExcel(['N°', 'FECHA', 'ACTOR', 'ACCIÓN', 'QUÉ CAMBIÓ'], $maliciousRows, [6, 18, 26, 24, 70]);
        $collection = $export->collection();

        $this->assertSame("'=CMD|\"/C calc\"!A0", $collection[0][3]);
        $this->assertSame("'+SUM(1,2)", $collection[1][3]);
        $this->assertSame("'-ALERT(1)", $collection[1][4]);
        $this->assertSame("'@SUM(A1:A2)", $collection[2][3]);
        $this->assertSame("TEXTO SEGURO", $collection[2][4]);
    }

    public function test_smoke_volumen_caso_con_200_eventos_genera_pdf_y_excel(): void
    {
        Excel::fake();

        // 200 eventos en la bitácora
        $eventos = [];
        for ($i = 1; $i <= 200; $i++) {
            $eventos[] = [
                'denuncia_id' => $this->denuncia->id,
                'accion' => $i % 2 === 0 ? 'investigacion' : 'archivo_descargado',
                'detalle' => "ACCIÓN DE PRUEBA DE VOLUMEN NÚMERO {$i}",
                'usuario_id' => $this->investigador->id,
                'fecha' => now()->subMinutes(200 - $i),
                'user_agent' => "SmokeVolumeUA/{$i}.0",
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }
        Bitacora::insert($eventos);

        // Operativo PDF (render real de DomPDF)
        $resPdf = $this->actingAs($this->jefe)
            ->get(route('denuncias.extracto.operativo', $this->denuncia->ticket));
        $resPdf->assertOk();
        $this->assertStringContainsString('application/pdf', $resPdf->headers->get('content-type') ?? '');

        // Técnico Excel
        $resExcel = $this->actingAs($this->admin)
            ->get(route('admin.auditoria.extracto', ['ticket' => $this->denuncia->ticket, 'formato' => 'xlsx']));
        $resExcel->assertOk();

        $fecha = now()->format('Y-m-d');
        Excel::assertDownloaded("extracto-tecnico-{$this->denuncia->ticket}-{$fecha}.xlsx");
    }
}
