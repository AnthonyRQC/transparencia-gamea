<?php

namespace App\Http\Controllers;

use App\Models\Bitacora;
use App\Models\CategoriaDenuncia;
use App\Models\UnidadExterna;
use App\Models\Feriado;
use App\Models\ConfiguracionSistema;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;

class CatalogoController extends Controller
{
    private const TABLE_BASED = ['categorias', 'unidades', 'feriados'];
    private const CONFIG_BASED = ['clasificaciones', 'tipos_denuncia', 'estados', 'medios_notificacion', 'tipos_prueba'];
    private const READ_ONLY_TYPES = ['tipos_denuncia', 'estados'];

    public function index()
    {
        $catalogos = [
            'categorias' => [
                'label' => 'Categorías',
                'items' => CategoriaDenuncia::withCount('denuncias')->orderBy('nombre')->get()->toArray(),
                'columns' => [
                    ['key' => 'nombre', 'label' => 'Nombre', 'type' => 'text'],
                    ['key' => 'tipo_denuncia', 'label' => 'Tipo Denuncia', 'type' => 'select', 'options' => ['corrupcion' => 'Corrupción', 'negacion' => 'Negación']],
                    ['key' => 'activa', 'label' => 'Activa', 'type' => 'boolean'],
                    ['key' => 'fecha_desactivacion', 'label' => 'Desactivada el', 'type' => 'datetime'],
                    ['key' => 'denuncias_count', 'label' => 'Denuncias', 'type' => 'count'],
                ],
            ],
            'unidades' => [
                'label' => 'Unidades Externas',
                'items' => UnidadExterna::withCount('solicitudes')->orderBy('nombre')->get()->toArray(),
                'columns' => [
                    ['key' => 'clave', 'label' => 'Clave', 'type' => 'text'],
                    ['key' => 'nombre', 'label' => 'Nombre', 'type' => 'text'],
                    ['key' => 'activa', 'label' => 'Activa', 'type' => 'boolean'],
                    ['key' => 'fecha_desactivacion', 'label' => 'Desactivada el', 'type' => 'datetime'],
                    ['key' => 'solicitudes_count', 'label' => 'Solicitudes', 'type' => 'count'],
                ],
            ],
            'feriados' => $this->getFeriadosData(),
            'clasificaciones' => [
                'label' => 'Clasificaciones Finales',
                'items' => $this->getConfigArray('catalogo_clasificaciones'),
                'columns' => [
                    ['key' => 'nombre', 'label' => 'Nombre', 'type' => 'text'],
                    ['key' => 'activo', 'label' => 'Activo', 'type' => 'boolean'],
                ],
            ],
            'tipos_denuncia' => [
                'label' => 'Tipos de Denuncia',
                'items' => $this->getConfigArray('catalogo_tipos_denuncia'),
                'columns' => [
                    ['key' => 'clave', 'label' => 'Clave', 'type' => 'text', 'readonly' => true],
                    ['key' => 'nombre', 'label' => 'Nombre', 'type' => 'text'],
                    ['key' => 'activo', 'label' => 'Activo', 'type' => 'boolean'],
                ],
                'readonly' => true,
            ],
            'estados' => [
                'label' => 'Estados',
                'items' => $this->getConfigArray('catalogo_estados'),
                'columns' => [
                    ['key' => 'clave', 'label' => 'Clave', 'type' => 'text', 'readonly' => true],
                    ['key' => 'nombre', 'label' => 'Nombre', 'type' => 'text'],
                    ['key' => 'activo', 'label' => 'Activo', 'type' => 'boolean'],
                ],
                'readonly' => true,
            ],
            'medios_notificacion' => [
                'label' => 'Medios de Notificación',
                'items' => $this->getConfigArray('catalogo_medios_notificacion'),
                'columns' => [
                    ['key' => 'nombre', 'label' => 'Nombre', 'type' => 'text'],
                    ['key' => 'activo', 'label' => 'Activo', 'type' => 'boolean'],
                ],
            ],
            'tipos_prueba' => [
                'label' => 'Tipos de Prueba',
                'items' => $this->getConfigArray('catalogo_tipos_prueba'),
                'columns' => [
                    ['key' => 'nombre', 'label' => 'Nombre', 'type' => 'text'],
                    ['key' => 'activo', 'label' => 'Activo', 'type' => 'boolean'],
                ],
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
                    $inactiva = UnidadExterna::where('clave', $data['clave'])
                        ->where('activa', false)->first();
                    if ($inactiva) {
                        $inactiva->update(['activa' => true, 'fecha_desactivacion' => null, 'desactivado_por_id' => null]);
                        $this->logBitacora('unidades', $inactiva->id, 'reactivar', ['nombre' => $data['nombre']]);
                        DB::commit();
                        return back()->with('success', 'Unidad reactivada correctamente.');
                    }
                    UnidadExterna::create($data);
                } elseif ($tipo === 'feriados') {
                    Feriado::create($data);
                }
                DB::commit();
            } catch (\Exception $e) {
                DB::rollBack();
                return back()->withErrors(['error' => 'Error al crear: ' . $e->getMessage()]);
            }
        } else {
            $items = $this->getConfigArray('catalogo_' . $tipo);
            $newId = count($items) > 0 ? max(array_column($items, 'id')) + 1 : 1;
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
                    'unidades' => UnidadExterna::findOrFail((int) $id),
                    'feriados' => Feriado::findOrFail((int) $id),
                };

                if ($tipo === 'categorias') {
                    $data['clave'] = Str::slug(Str::upper($data['nombre']), '_');
                }

                $oldActiva = $model->activa;
                $model->update($data);

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
            match ($tipo) {
                'categorias' => $this->desactivarCategoria((int) $id),
                'unidades' => $this->desactivarUnidad((int) $id),
                'feriados' => $this->desactivarFeriado((int) $id),
            };
        } else {
            $items = $this->getConfigArray('catalogo_' . $tipo);
            $found = null;
            foreach ($items as $item) {
                if ((int) $item['id'] === (int) $id) {
                    $found = $item;
                    break;
                }
            }
            if (!$found) {
                return back()->withErrors(['error' => 'Elemento no encontrado.']);
            }
            $items = array_values(array_filter($items, fn($item) => (int) $item['id'] !== (int) $id));
            $this->setConfigArray('catalogo_' . $tipo, $items);
            $this->logBitacora($tipo, (int) $id, 'desactivar', ['nombre' => $found['nombre'] ?? '']);
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
            };
        }

        return back()->with('success', 'Elemento reactivado correctamente.');
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
        $unidad = UnidadExterna::findOrFail($id);
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

    private function desactivarFeriado(int $id): void
    {
        $feriado = Feriado::findOrFail($id);
        $feriado->delete();
        $this->logBitacora('feriados', $id, 'desactivar', [
            'nombre' => $feriado->nombre,
            'fecha' => $feriado->fecha->format('Y-m-d'),
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
        $unidad = UnidadExterna::findOrFail($id);
        $unidad->update(['activa' => true, 'fecha_desactivacion' => null, 'desactivado_por_id' => null]);
        $this->logBitacora('unidades', $id, 'reactivar', ['nombre' => $unidad->nombre]);
    }

    private function reactivarFeriado(int $id): void
    {
        $feriado = Feriado::onlyTrashed()->findOrFail($id);
        $feriado->restore();
        $this->logBitacora('feriados', $id, 'reactivar', ['nombre' => $feriado->nombre]);
    }

    private function logBitacora(string $tipo, int $id, string $accion, array $detalle): void
    {
        Bitacora::create([
            'entidad_tipo' => 'App\Models\\' . match ($tipo) {
                'categorias' => 'CategoriaDenuncia',
                'unidades' => 'UnidadExterna',
                'feriados' => 'Feriado',
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
                ['key' => 'recurrente', 'label' => 'Recurrente', 'type' => 'boolean'],
                ['key' => 'deleted_at', 'label' => 'Estado', 'type' => 'status'],
            ],
            'agrupado_por_anio' => true,
        ];
    }

    private function getConfigArray(string $clave): array
    {
        $config = ConfiguracionSistema::where('clave', $clave)->first();
        if (!$config || !$config->valor) {
            return [];
        }
        $decoded = json_decode($config->valor, true);
        return is_array($decoded) ? $decoded : [];
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
                'clave' => 'required|string|max:50' . ($isUpdate ? '' : '|unique:unidades_externas,clave'),
                'nombre' => 'required|string|max:255',
                'activa' => 'boolean',
            ],
            'feriados' => [
                'fecha' => 'required|date',
                'nombre' => 'required|string|max:255',
                'recurrente' => 'boolean',
            ],
            default => [
                'nombre' => 'required|string|max:255',
                'activo' => 'boolean',
            ],
        };
    }
}
