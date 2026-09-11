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
