<?php

namespace App\Http\Controllers;

use App\Models\Bitacora;
use App\Models\CategoriaDenuncia;
use App\Models\Clasificacion;
use App\Models\ConfiguracionSistema;
use App\Models\DependenciaExterna;
use App\Models\Feriado;
use App\Models\MedioNotificacion;
use App\Helpers\DiasHabiles;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;

class CatalogoController extends Controller
{
    private const TABLE_BASED = ['categorias', 'unidades', 'feriados', 'clasificaciones', 'medios_notificacion'];
    private const CONFIG_BASED = ['tipos_denuncia', 'estados'];
    private const READ_ONLY_TYPES = ['tipos_denuncia', 'estados'];
    private const PROTECTED_CLASIFICACIONES = ['penal', 'civil', 'administrativo', 'sin_indicios', 'medida_correctiva', 'archivado'];

    public function index()
    {
        $catalogos = [
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
            'feriados' => $this->getFeriadosData(),
            'unidades' => $this->getUnidadesData(),
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
                    'protegido' => in_array($c->clave, self::PROTECTED_CLASIFICACIONES, true),
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
            'estados' => [
                'label' => 'Estados',
                'items' => $this->getConfigArray('catalogo_estados'),
                'columns' => [
                    ['key' => 'nombre', 'label' => 'Nombre', 'type' => 'text'],
                ],
                'editable_only' => true,
            ],
            'tipos_denuncia' => [
                'label' => 'Tipos de Denuncia',
                'items' => $this->getConfigArray('catalogo_tipos_denuncia'),
                'columns' => [
                    ['key' => 'nombre', 'label' => 'Nombre', 'type' => 'text'],
                ],
                'editable_only' => true,
            ],
        ];

        return Inertia::render('Admin/Catalogos', [
            'catalogos' => $catalogos,
        ]);
    }

    public function store(Request $request, string $tipo)
    {
        if (in_array($tipo, self::READ_ONLY_TYPES)) {
            return back()->withErrors(['error' => 'Este catálogo no permite crear nuevos elementos.']);
        }

        $data = $request->validate($this->rulesFor($tipo));

        if (in_array($tipo, self::TABLE_BASED)) {
            DB::beginTransaction();
            try {
                if ($tipo === 'categorias') {
                    $inactiva = CategoriaDenuncia::where('nombre', $data['nombre'])
                        ->where('activa', false)->first();
                    if ($inactiva) {
                        $inactiva->update(['activa' => true, 'fecha_desactivacion' => null, 'desactivado_por_id' => null]);
                        $this->logBitacora('categorias', $inactiva->id, 'reactivar', ['nombre' => $data['nombre']]);
                        DB::commit();
                        return back()->with('success', 'Categoría reactivada correctamente.');
                    }
                    CategoriaDenuncia::create([
                        ...$data,
                        'clave' => Str::slug(Str::upper($data['nombre']), '_'),
                    ]);
                } elseif ($tipo === 'unidades') {
                    $inactiva = DependenciaExterna::where('nombre', $data['nombre'])
                        ->where('activa', false)->first();
                    if ($inactiva) {
                        $inactiva->update(['activa' => true, 'fecha_desactivacion' => null, 'desactivado_por_id' => null]);
                        $this->logBitacora('unidades', $inactiva->id, 'reactivar', ['nombre' => $data['nombre']]);
                        DB::commit();
                        return back()->with('success', 'Dependencia reactivada correctamente.');
                    }
                    DependenciaExterna::create([
                        'nombre' => $data['nombre'],
                        'parent_id' => $data['parent_id'] ?? null,
                        'activa' => $data['activa'] ?? true,
                    ]);
                } elseif ($tipo === 'feriados') {
                    Feriado::create($data);
                    DiasHabiles::olvidarCache();
                } elseif ($tipo === 'clasificaciones') {
                    $inactiva = Clasificacion::where('nombre', $data['nombre'])
                        ->where('activa', false)->first();
                    if ($inactiva) {
                        $inactiva->update(['activa' => true, 'fecha_desactivacion' => null, 'desactivado_por_id' => null]);
                        $this->logBitacora('clasificaciones', $inactiva->id, 'reactivar', ['nombre' => $data['nombre']]);
                        DB::commit();
                        return back()->with('success', 'Clasificación reactivada correctamente.');
                    }
                    Clasificacion::create([
                        ...$data,
                        'clave' => Str::slug(Str::upper($data['nombre']), '_'),
                    ]);
                } elseif ($tipo === 'medios_notificacion') {
                    $inactiva = MedioNotificacion::where('nombre', $data['nombre'])
                        ->where('activa', false)->first();
                    if ($inactiva) {
                        $inactiva->update(['activa' => true, 'fecha_desactivacion' => null, 'desactivado_por_id' => null]);
                        $this->logBitacora('medios_notificacion', $inactiva->id, 'reactivar', ['nombre' => $data['nombre']]);
                        DB::commit();
                        return back()->with('success', 'Medio de notificación reactivado correctamente.');
                    }
                    MedioNotificacion::create([
                        ...$data,
                        'clave' => Str::slug(Str::upper($data['nombre']), '_'),
                    ]);
                }
                DB::commit();
            } catch (\Exception $e) {
                DB::rollBack();
                return back()->withErrors(['error' => 'Error al crear: ' . $e->getMessage()]);
            }
        } else {
            $items = $this->getConfigArray('catalogo_' . $tipo);
            $newId = count($items) > 0 ? max(array_column($items, 'id')) + 1 : 1;
            $data = $this->upperData($data);
            if (empty($data['clave'])) {
                $data['clave'] = Str::slug(Str::upper($data['nombre']), '_');
            }
            $data['id'] = $newId;
            $items[] = $data;
            $this->setConfigArray('catalogo_' . $tipo, $items);
        }

        return back()->with('success', 'Elemento creado correctamente.');
    }

    public function update(Request $request, string $tipo, string $id)
    {
        if (in_array($tipo, self::READ_ONLY_TYPES)) {
            $data = $request->validate(['nombre' => 'required|string|max:255', 'activo' => 'boolean']);
        } else {
            $data = $request->validate($this->rulesFor($tipo, true));
        }

        if (in_array($tipo, self::TABLE_BASED)) {
            DB::beginTransaction();
            try {
                $model = match ($tipo) {
                    'categorias' => CategoriaDenuncia::findOrFail((int) $id),
                    'unidades' => DependenciaExterna::findOrFail((int) $id),
                    'feriados' => Feriado::findOrFail((int) $id),
                    'clasificaciones' => Clasificacion::findOrFail((int) $id),
                    'medios_notificacion' => MedioNotificacion::findOrFail((int) $id),
                };

                if ($tipo === 'categorias' || $tipo === 'clasificaciones' || $tipo === 'medios_notificacion') {
                    $data['clave'] = Str::slug(Str::upper($data['nombre']), '_');
                }

                if ($tipo === 'unidades') {
                    $error = $this->validarParentUnidad($model->id, $data['parent_id'] ?? null);
                    if ($error) {
                        DB::rollBack();
                        return back()->withErrors(['error' => $error]);
                    }
                }

                $oldActiva = $model->activa;
                $model->update($data);

                if ($model instanceof Feriado) {
                    DiasHabiles::olvidarCache();
                }

                if ($oldActiva === false && $data['activa'] === true) {
                    $model->update(['fecha_desactivacion' => null, 'desactivado_por_id' => null]);
                    $this->logBitacora($tipo, (int) $id, 'reactivar', ['nombre' => $data['nombre'] ?? '']);
                }

                DB::commit();
            } catch (\Exception $e) {
                DB::rollBack();
                return back()->withErrors(['error' => 'Error al actualizar: ' . $e->getMessage()]);
            }
        } else {
            $items = $this->getConfigArray('catalogo_' . $tipo);
            $data = $this->upperData($data);
            $found = false;
            foreach ($items as &$item) {
                if ((int) $item['id'] === (int) $id) {
                    foreach ($data as $key => $value) {
                        $item[$key] = $value;
                    }
                    $found = true;
                    break;
                }
            }
            if (!$found) {
                return back()->withErrors(['error' => 'Elemento no encontrado.']);
            }
            $this->setConfigArray('catalogo_' . $tipo, $items);
        }

        return back()->with('success', 'Elemento actualizado correctamente.');
    }

    public function destroy(string $tipo, string $id)
    {
        if (in_array($tipo, self::READ_ONLY_TYPES)) {
            return back()->withErrors(['error' => 'Este catálogo no permite eliminar elementos.']);
        }

        if (in_array($tipo, self::TABLE_BASED)) {
            if ($tipo === 'clasificaciones') {
                $clasificacion = Clasificacion::findOrFail((int) $id);
                if (in_array($clasificacion->clave, self::PROTECTED_CLASIFICACIONES, true)) {
                    return back()->withErrors(['error' => 'Esta clasificación está protegida y no se puede eliminar.']);
                }
            }

            match ($tipo) {
                'categorias' => $this->desactivarCategoria((int) $id),
                'unidades' => $this->desactivarUnidad((int) $id),
                'feriados' => $this->desactivarFeriado((int) $id),
                'clasificaciones' => $this->desactivarClasificacion((int) $id),
                'medios_notificacion' => $this->desactivarMedio((int) $id),
            };

            return back()->with('success', 'Elemento desactivado correctamente.');
        }

        return back()->with('success', 'Elemento desactivado correctamente.');
    }

    public function reactivar(string $tipo, string $id)
    {
        if (in_array($tipo, self::TABLE_BASED)) {
            match ($tipo) {
                'categorias' => $this->reactivarCategoria((int) $id),
                'unidades' => $this->reactivarUnidad((int) $id),
                'feriados' => $this->reactivarFeriado((int) $id),
                'clasificaciones' => $this->reactivarClasificacion((int) $id),
                'medios_notificacion' => $this->reactivarMedio((int) $id),
            };
        }

        return back()->with('success', 'Elemento reactivado correctamente.');
    }

    private function validarParentUnidad(int $nodoId, $parentId): ?string
    {
        if ($parentId === null || $parentId === '' || (int) $parentId === 0) {
            return null;
        }

        $parentId = (int) $parentId;
        if ($parentId === $nodoId) {
            return 'No se puede asignar como padre a sí misma.';
        }

        $candidato = DependenciaExterna::find($parentId);
        while ($candidato) {
            if ($candidato->parent_id === null) {
                break;
            }
            if ((int) $candidato->parent_id === $nodoId) {
                return 'No se puede asignar como padre una dependencia que cuelga de esta.';
            }
            $candidato = DependenciaExterna::find($candidato->parent_id);
        }

        return null;
    }

    private function desactivarCategoria(int $id): void
    {
        $categoria = CategoriaDenuncia::findOrFail($id);
        $categoria->update([
            'activa' => false,
            'fecha_desactivacion' => now(),
            'desactivado_por_id' => auth()->id(),
        ]);
        $this->logBitacora('categorias', $id, 'desactivar', [
            'nombre' => $categoria->nombre,
            'denuncias_asociadas' => $categoria->denuncias()->count(),
        ]);
    }

    private function desactivarUnidad(int $id): void
    {
        $unidad = DependenciaExterna::findOrFail($id);
        $unidad->update([
            'activa' => false,
            'fecha_desactivacion' => now(),
            'desactivado_por_id' => auth()->id(),
        ]);
        $this->logBitacora('unidades', $id, 'desactivar', [
            'nombre' => $unidad->nombre,
            'solicitudes_asociadas' => $unidad->solicitudes()->count(),
        ]);
    }

    private function desactivarClasificacion(int $id): void
    {
        $clasificacion = Clasificacion::findOrFail($id);
        $clasificacion->update([
            'activa' => false,
            'fecha_desactivacion' => now(),
            'desactivado_por_id' => auth()->id(),
        ]);
        $this->logBitacora('clasificaciones', $id, 'desactivar', [
            'nombre' => $clasificacion->nombre,
            'informes_asociados' => $clasificacion->informes()->count(),
        ]);
    }

    private function desactivarMedio(int $id): void
    {
        $medio = MedioNotificacion::findOrFail($id);
        $medio->update([
            'activa' => false,
            'fecha_desactivacion' => now(),
            'desactivado_por_id' => auth()->id(),
        ]);
        $this->logBitacora('medios_notificacion', $id, 'desactivar', [
            'nombre' => $medio->nombre,
            'cierres_asociados' => $medio->cierres()->count(),
        ]);
    }

    private function reactivarCategoria(int $id): void
    {
        $categoria = CategoriaDenuncia::findOrFail($id);
        $categoria->update(['activa' => true, 'fecha_desactivacion' => null, 'desactivado_por_id' => null]);
        $this->logBitacora('categorias', $id, 'reactivar', ['nombre' => $categoria->nombre]);
    }

    private function reactivarUnidad(int $id): void
    {
        $unidad = DependenciaExterna::findOrFail($id);
        $unidad->update(['activa' => true, 'fecha_desactivacion' => null, 'desactivado_por_id' => null]);
        $this->logBitacora('unidades', $id, 'reactivar', ['nombre' => $unidad->nombre]);
    }

    private function reactivarClasificacion(int $id): void
    {
        $clasificacion = Clasificacion::findOrFail($id);
        $clasificacion->update(['activa' => true, 'fecha_desactivacion' => null, 'desactivado_por_id' => null]);
        $this->logBitacora('clasificaciones', $id, 'reactivar', ['nombre' => $clasificacion->nombre]);
    }

    private function reactivarMedio(int $id): void
    {
        $medio = MedioNotificacion::findOrFail($id);
        $medio->update(['activa' => true, 'fecha_desactivacion' => null, 'desactivado_por_id' => null]);
        $this->logBitacora('medios_notificacion', $id, 'reactivar', ['nombre' => $medio->nombre]);
    }

    private function desactivarFeriado(int $id): void
    {
        $feriado = Feriado::findOrFail($id);
        $feriado->delete();
        DiasHabiles::olvidarCache();
        $this->logBitacora('feriados', $id, 'desactivar', [
            'nombre' => $feriado->nombre,
            'fecha' => $feriado->fecha->format('Y-m-d'),
        ]);
    }

    private function reactivarFeriado(int $id): void
    {
        $feriado = Feriado::onlyTrashed()->findOrFail($id);
        $feriado->restore();
        DiasHabiles::olvidarCache();
        $this->logBitacora('feriados', $id, 'reactivar', ['nombre' => $feriado->nombre]);
    }

    private function logBitacora(string $tipo, int $id, string $accion, array $detalle): void
    {
        Bitacora::create([
            'entidad_tipo' => 'App\Models\\' . match ($tipo) {
                'categorias' => 'CategoriaDenuncia',
                'unidades' => 'DependenciaExterna',
                'feriados' => 'Feriado',
                'clasificaciones' => 'Clasificacion',
                'medios_notificacion' => 'MedioNotificacion',
                default => ucfirst($tipo),
            },
            'entidad_id' => $id,
            'accion' => $accion,
            'detalle' => json_encode($detalle),
            'usuario_id' => auth()->id(),
            'fecha' => now(),
        ]);

        Log::info("CATALOGO_{$accion}", [
            'tipo' => $tipo,
            'id' => $id,
            'detalle' => $detalle,
            'usuario_id' => auth()->id(),
        ]);
    }

    private function getFeriadosData(): array
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

    private function getUnidadesData(): array
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
            'padre_options' => $this->buildPadreOptions($todas),
        ];
    }

    private function buildPadreOptions(Collection $todas): array
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

    private function getConfigArray(string $clave): array
    {
        return ConfiguracionSistema::catalogItems($clave);
    }

    private function setConfigArray(string $clave, array $items): void
    {
        $config = ConfiguracionSistema::where('clave', $clave)->first();
        if ($config) {
            $config->update(['valor' => json_encode($items)]);
        } else {
            ConfiguracionSistema::create([
                'clave' => $clave,
                'valor' => json_encode($items),
                'descripcion' => 'CATÁLOGO: ' . str_replace('_', ' ', $clave),
            ]);
        }
    }

    private function upperData(array $data): array
    {
        return array_map(
            fn($value) => is_string($value) ? Str::upper($value) : $value,
            $data
        );
    }

    private function rulesFor(string $tipo, bool $isUpdate = false): array
    {
        return match ($tipo) {
            'categorias' => [
                'nombre' => 'required|string|max:255',
                'descripcion' => 'nullable|string',
                'tipo_denuncia' => 'required|in:corrupcion,negacion',
                'activa' => 'boolean',
            ],
            'unidades' => [
                'nombre' => 'required|string|max:255' . ($isUpdate ? '' : '|unique:dependencias_externas,nombre'),
                'parent_id' => 'nullable|integer|exists:dependencias_externas,id',
                'activa' => 'boolean',
            ],
            'feriados' => [
                'fecha' => 'required|date',
                'nombre' => 'required|string|max:255',
            ],
            'clasificaciones' => [
                'nombre' => 'required|string|max:255',
                'descripcion' => 'nullable|string',
                'activa' => 'boolean',
            ],
            'medios_notificacion' => [
                'nombre' => 'required|string|max:255',
                'activa' => 'boolean',
            ],
            default => [
                'nombre' => 'required|string|max:255',
                'activo' => 'boolean',
            ],
        };
    }
}
