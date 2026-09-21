<?php

namespace App\Queries\Catalogo;

use App\Models\CategoriaDenuncia;
use App\Models\Clasificacion;
use App\Models\DependenciaExterna;
use App\Models\Feriado;
use App\Models\MedioNotificacion;
use App\Models\PrioridadPublicacion;
use App\Models\TipoPublicacion;
use App\Services\CatalogoConfigStore;
use App\Services\CatalogoService;
use Illuminate\Database\Eloquent\Collection;

class CatalogoIndexQuery
{
    public static function construir(): array
    {
        return [
            'categorias' => [
                'label' => 'Categorías',
                'items' => CategoriaDenuncia::withCount('denuncias')->orderBy('nombre')->get()->toArray(),
                'columns' => [
                    ['key' => 'nombre', 'label' => 'Nombre', 'type' => 'text'],
                    ['key' => 'descripcion', 'label' => 'Descripción', 'type' => 'textarea'],
                    ['key' => 'tipo_denuncia', 'label' => 'Tipo Denuncia', 'type' => 'select', 'options' => ['corrupcion' => 'Corrupción', 'negacion' => 'Negación']],
                    ['key' => 'denuncias_count', 'label' => 'Denuncias', 'type' => 'count'],
                    ['key' => 'activa', 'label' => 'Estado', 'type' => 'boolean'],
                ],
            ],
            'feriados' => self::getFeriadosData(),
            'unidades' => self::getUnidadesData(),
            'medios_notificacion' => [
                'label' => 'Medios de Notificación',
                'items' => MedioNotificacion::withCount('cierres')->orderBy('nombre')->get()->map(fn($m) => [
                    'id' => $m->id,
                    'clave' => $m->clave,
                    'nombre' => $m->nombre,
                    'activa' => $m->activa,
                    'usos' => $m->cierres_count,
                ])->toArray(),
                'columns' => [
                    ['key' => 'nombre', 'label' => 'Nombre', 'type' => 'text'],
                    ['key' => 'usos', 'label' => 'Cierres', 'type' => 'count'],
                    ['key' => 'activa', 'label' => 'Estado', 'type' => 'boolean'],
                ],
                'usos_label' => 'cierre(s)',
            ],
            'clasificaciones' => [
                'label' => 'Clasificaciones Finales',
                'items' => Clasificacion::withCount('informes')->orderBy('nombre')->get()->map(fn($c) => [
                    'id' => $c->id,
                    'clave' => $c->clave,
                    'nombre' => $c->nombre,
                    'descripcion' => $c->descripcion,
                    'activa' => $c->activa,
                    'protegido' => in_array($c->clave, CatalogoService::PROTECTED_CLASIFICACIONES, true),
                    'usos' => $c->informes_count,
                ])->toArray(),
                'columns' => [
                    ['key' => 'nombre', 'label' => 'Nombre', 'type' => 'text'],
                    ['key' => 'descripcion', 'label' => 'Descripción', 'type' => 'textarea'],
                    ['key' => 'usos', 'label' => 'Informes', 'type' => 'count'],
                    ['key' => 'activa', 'label' => 'Estado', 'type' => 'boolean'],
                ],
                'usos_label' => 'informe(s)',
            ],
            'tipos_publicacion' => [
                'label' => 'Tipos de Publicación',
                'items' => TipoPublicacion::withCount('publicaciones')->orderBy('nombre')->get()->map(fn($t) => [
                    'id' => $t->id,
                    'clave' => $t->clave,
                    'nombre' => $t->nombre,
                    'descripcion' => $t->descripcion,
                    'activa' => $t->activa,
                    'usos' => $t->publicaciones_count,
                ])->toArray(),
                'columns' => [
                    ['key' => 'nombre', 'label' => 'Nombre', 'type' => 'text'],
                    ['key' => 'descripcion', 'label' => 'Descripción', 'type' => 'textarea'],
                    ['key' => 'usos', 'label' => 'Avisos', 'type' => 'count'],
                    ['key' => 'activa', 'label' => 'Estado', 'type' => 'boolean'],
                ],
                'usos_label' => 'aviso(s)',
            ],
            'prioridades_publicacion' => [
                'label' => 'Prioridades de Publicación',
                'items' => PrioridadPublicacion::withCount('publicaciones')->orderBy('nombre')->get()->map(fn($p) => [
                    'id' => $p->id,
                    'clave' => $p->clave,
                    'nombre' => $p->nombre,
                    'descripcion' => $p->descripcion,
                    'activa' => $p->activa,
                    'protegido' => in_array($p->clave, CatalogoService::PROTECTED_PRIORIDADES, true),
                    'usos' => $p->publicaciones_count,
                ])->toArray(),
                'columns' => [
                    ['key' => 'nombre', 'label' => 'Nombre', 'type' => 'text'],
                    ['key' => 'descripcion', 'label' => 'Descripción', 'type' => 'textarea'],
                    ['key' => 'usos', 'label' => 'Avisos', 'type' => 'count'],
                    ['key' => 'activa', 'label' => 'Estado', 'type' => 'boolean'],
                ],
                'usos_label' => 'aviso(s)',
            ],
            'estados' => [
                'label' => 'Estados',
                'items' => CatalogoConfigStore::getConfigArray('catalogo_estados'),
                'columns' => [
                    ['key' => 'nombre', 'label' => 'Nombre', 'type' => 'text'],
                ],
                'editable_only' => true,
            ],
            'tipos_denuncia' => [
                'label' => 'Tipos de Denuncia',
                'items' => CatalogoConfigStore::getConfigArray('catalogo_tipos_denuncia'),
                'columns' => [
                    ['key' => 'nombre', 'label' => 'Nombre', 'type' => 'text'],
                ],
                'editable_only' => true,
            ],
        ];
    }

    private static function getFeriadosData(): array
    {
        $todos = Feriado::withTrashed()->orderBy('fecha', 'desc')->get();
        $anios = $todos->groupBy(fn($f) => $f->fecha->year)->sortKeysDesc();

        $items = [];
        foreach ($anios as $anio => $feriados) {
            $items[] = [
                'anio' => $anio,
                'items' => $feriados->toArray(),
                'activos' => $feriados->whereNull('deleted_at')->count(),
                'inactivos' => $feriados->whereNotNull('deleted_at')->count(),
            ];
        }

        return [
            'label' => 'Feriados',
            'items' => $items,
            'columns' => [
                ['key' => 'fecha', 'label' => 'Fecha', 'type' => 'date'],
                ['key' => 'nombre', 'label' => 'Nombre', 'type' => 'text'],
                ['key' => 'deleted_at', 'label' => 'Estado', 'type' => 'status'],
            ],
            'agrupado_por_anio' => true,
        ];
    }

    private static function getUnidadesData(): array
    {
        $todas = DependenciaExterna::withCount('solicitudes')->orderBy('nombre')->get();

        return [
            'label' => 'Dependencias Externas',
            'items' => $todas->toArray(),
            'columns' => [
                ['key' => 'nombre', 'label' => 'Nombre', 'type' => 'text'],
                ['key' => 'solicitudes_count', 'label' => 'Solicitudes', 'type' => 'count'],
                ['key' => 'activa', 'label' => 'Estado', 'type' => 'boolean'],
            ],
            'es_arbol' => true,
            'padre_options' => self::buildPadreOptions($todas),
        ];
    }

    private static function buildPadreOptions(Collection $todas): array
    {
        $porParent = [];
        foreach ($todas as $d) {
            $porParent[$d->parent_id ?? 0][] = $d;
        }

        $opciones = [['id' => null, 'nombre' => 'SIN DEPENDENCIA PADRE (RAÍZ)']];

        $walk = function (int $padreId, string $prefijo) use (&$walk, &$opciones, $porParent) {
            foreach (($porParent[$padreId] ?? []) as $d) {
                $ruta = $prefijo === '' ? $d->nombre : $prefijo . ' — ' . $d->nombre;
                $opciones[] = ['id' => $d->id, 'nombre' => $ruta];
                $walk($d->id, $ruta);
            }
        };

        $walk(0, '');

        return $opciones;
    }
}
