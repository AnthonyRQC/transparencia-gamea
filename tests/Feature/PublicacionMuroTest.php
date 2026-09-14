<?php

namespace Tests\Feature;

use App\Models\PrioridadPublicacion;
use App\Models\Publicacion;
use App\Models\TipoPublicacion;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicacionMuroTest extends TestCase
{
    use RefreshDatabase;

    private function sembrar(): void
    {
        TipoPublicacion::create(['clave' => 'comunicado', 'nombre' => 'COMUNICADO']);
        TipoPublicacion::create(['clave' => 'admitida', 'nombre' => 'ADMITIDA']);
        PrioridadPublicacion::create(['clave' => 'ordinario', 'nombre' => 'ORDINARIO']);
        $jefe = User::factory()->create(['rol' => 'jefe']);
        $tipo = TipoPublicacion::where('clave', 'comunicado')->first()->id;
        $tipoAdm = TipoPublicacion::where('clave', 'admitida')->first()->id;
        $prio = PrioridadPublicacion::where('clave', 'ordinario')->first()->id;

        Publicacion::create([
            'tipo_id' => $tipo, 'prioridad_id' => $prio,
            'cite' => 'GAMEA/UTLCC/COM/N° 012/2026',
            'ref_titulo' => 'HORARIO DE ATENCIÓN',
            'resumen' => 'HORARIO DE LUNES A VIERNES.',
            'publicado_por_id' => $jefe->id,
            'publicado_at' => now()->subDay(),
            'fijada' => true, 'orden' => 1,
        ]);
        Publicacion::create([
            'tipo_id' => $tipoAdm, 'prioridad_id' => $prio,
            'ref_titulo' => 'COMUNICA ADMISIÓN',
            'publicado_por_id' => $jefe->id,
            'publicado_at' => now(),
        ]);
        // Borrador: no debe salir en el muro
        Publicacion::create([
            'tipo_id' => $tipo, 'prioridad_id' => $prio,
            'ref_titulo' => 'BORRADOR NO PUBLICADO',
            'publicado_por_id' => $jefe->id,
            'publicado_at' => null,
        ]);
        // Antiguo (>12 meses): fuera de la vista por defecto
        Publicacion::create([
            'tipo_id' => $tipo, 'prioridad_id' => $prio,
            'ref_titulo' => 'AVISO ANTIGUO',
            'publicado_por_id' => $jefe->id,
            'publicado_at' => now()->subMonths(13),
        ]);
    }

    public function test_muro_publico_lista_solo_publicadas(): void
    {
        $this->sembrar();

        $this->get('/')->assertOk()->assertInertia(fn($page) => $page
            ->component('Welcome')
            ->where('panel.avisos.total', 2)
            ->where('panel.avisos.data.0.fijada', true)
            ->where('panel.avisos.data.0.titulo', 'HORARIO DE ATENCIÓN')
            ->where('panel.recientes', true)
            ->has('panel.tipos'));
    }

    public function test_muro_no_expone_datos_sensibles(): void
    {
        $this->sembrar();

        $this->get('/')->assertOk()->assertInertia(fn($page) => $page
            ->where('panel.avisos.data.0.titulo', 'HORARIO DE ATENCIÓN')
            ->missing('panel.avisos.data.0.denuncia_id')
            ->missing('panel.avisos.data.0.denunciante')
            ->missing('panel.avisos.data.0.denunciados')
            ->missing('panel.avisos.data.0.hechos')
            ->missing('panel.avisos.data.0.token')
            ->missing('panel.avisos.data.0.publicado_por_id'));
    }

    public function test_muro_filtra_por_tipo_y_busqueda(): void
    {
        $this->sembrar();

        $this->get('/?tipo=admitida')->assertOk()->assertInertia(fn($page) => $page
            ->where('panel.avisos.total', 1)
            ->where('panel.avisos.data.0.tipo', 'admitida'));

        $this->get('/?buscar=HORARIO')->assertOk()->assertInertia(fn($page) => $page
            ->where('panel.avisos.total', 1)
            ->where('panel.avisos.data.0.titulo', 'HORARIO DE ATENCIÓN'));
    }

    public function test_muro_historial_muestra_antiguos(): void
    {
        $this->sembrar();

        $this->get('/?historial=1')->assertOk()->assertInertia(fn($page) => $page
            ->where('panel.avisos.total', 3)
            ->where('panel.recientes', false));
    }

    public function test_termino_fulltext_exige_todas_las_palabras(): void
    {
        $controller = new \App\Http\Controllers\PublicacionController();
        $metodo = new \ReflectionMethod($controller, 'terminoFulltext');

        // El caso reportado: las 3 palabras son requeridas (+w).
        $this->assertEquals('+reg +4521 +2026', $metodo->invoke($controller, 'REG 4521/2026'));
        // Stopwords y cortos se descartan; sin tokens útiles → LIKE.
        $this->assertEquals('', $metodo->invoke($controller, 'de la'));
        $this->assertEquals('+horario', $metodo->invoke($controller, 'horario,'));
    }

    public function test_busqueda_avanzada_por_campo(): void
    {
        $this->sembrar();

        // CITE con 2026 en todos: solo el suyo (aislamiento por campo).
        $this->get('/?cite=012%2F2026')->assertOk()->assertInertia(fn($page) => $page
            ->where('panel.avisos.total', 1)
            ->where('panel.avisos.data.0.titulo', 'HORARIO DE ATENCIÓN'));

        // Combinada general + avanzada en AND.
        $this->get('/?buscar=HORARIO&tipo=comunicado')->assertOk()->assertInertia(fn($page) => $page
            ->where('panel.avisos.total', 1));
        $this->get('/?buscar=HORARIO&tipo=admitida')->assertOk()->assertInertia(fn($page) => $page
            ->where('panel.avisos.total', 0));
    }

    public function test_busqueda_avanzada_por_ticket(): void
    {
        $this->sembrar();
        $denuncia = \App\Models\Denuncia::factory()->create([
            'ticket' => 'DEN-2026-0099',
            'token_consulta' => '1099',
            'tipo' => 'corrupcion',
            'estado' => 'cerrada',
            'escenario' => 'anonimo',
        ]);
        \App\Models\Publicacion::create([
            'tipo_id' => \App\Models\TipoPublicacion::where('clave', 'admitida')->first()->id,
            'prioridad_id' => \App\Models\PrioridadPublicacion::first()->id,
            'ref_titulo' => 'AVISO LIGADO A CASO',
            'denuncia_id' => $denuncia->id,
            'evento' => 'admitida',
            'publicado_por_id' => \App\Models\User::first()->id,
            'publicado_at' => now(),
        ]);

        $this->get('/?ticket=DEN-2026-0099')->assertOk()->assertInertia(fn($page) => $page
            ->where('panel.avisos.total', 1)
            ->where('panel.avisos.data.0.titulo', 'AVISO LIGADO A CASO'));
    }

    public function test_catalogos_incluyen_publicaciones(): void
    {
        $this->sembrar();
        $jefe = User::where('rol', 'jefe')->first();

        $this->actingAs($jefe)->get('/admin/catalogos')->assertOk()->assertInertia(fn($page) => $page
            ->component('Admin/Catalogos')
            ->has('catalogos.tipos_publicacion.items', 2)
            ->has('catalogos.prioridades_publicacion.items', 1));
    }
}
