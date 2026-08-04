<?php

namespace App\Http\Controllers;

use App\Models\Bitacora;
use App\Models\CategoriaDenuncia;
use App\Models\Cierre;
use App\Models\DependenciaExterna;
use App\Models\Feriado;
use App\Models\InformeFinal;
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
    private const READ_ONLY_TYPES = ['tipos_denuncia', 'estados', 'tipos_prueba'];
    private const PROTECTED_CLASIFICACIONES = ['penal', 'civil', 'administrativo', 'sin_indicios', 'medida_correctiva', 'archivado'];

    public function index()
    {
        $catalogos = [
            'categorias' => [
                'label' => 'Categorías',
                'items' => CategoriaDenuncia::withCount('denuncias')->orderBy('nombre')->get()->toArray(),
                'columns' => [
                    ['key' => 'nombre', 'label' => 'Nombre', 'type' => 'text'],
                    ['key' => 'tipo_denuncia', 'label' => 'Tipo Denuncia', 'type' => 'select', 'options' => ['corrupcion' => 'Corrupción', 'negacion' => 'Negación']],
                    ['key' => 'denuncias_count', 'label' => 'Denuncias', 'type' => 'count'],
                    ['key' => 'activa', 'label' => 'Estado', 'type' => 'boolean'],
                ],
            ],
            'feriados' => $this->getFeriadosData(),
            'unidades' => [
                'label' => 'Dependencias Externas',
                'items' => DependenciaExterna::withCount('solicitudes')->orderBy('nombre')->get()->toArray(),
                'columns' => [
                    ['key' => 'nombre', 'label' => 'Nombre', 'type' => 'text'],
                    ['key' => 'solicitudes_count', 'label' => 'Solicitudes', 'type' => 'count'],
                    ['key' => 'fecha_desactivacion', 'label' => 'Desactivada el', 'type' => 'datetime'],
                    ['key' => 'activa', 'label' => 'Estado', 'type' => 'boolean'],
                ],
            ],
            'medios_notificacion' => [
                'label' => 'Medios de Notificación',
                'items' => $this->getMediosNotificacionData(),
                'columns' => [
                    ['key' => 'nombre', 'label' => 'Nombre', 'type' => 'text'],
                ],
                'is_json_based' => true,
                'usos_label' => 'cierre(s)',
            ],
            'clasificaciones' => [
                'label' => 'Clasificaciones Finales',
                'items' => $this->getClasificacionesData(),
                'columns' => [
                    ['key' => 'nombre', 'label' => 'Nombre', 'type' => 'text'],
                ],
                'is_json_based' => true,
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
            'tipos_prueba' => [
                'label' => 'Tipos de Prueba',
                'items' => $this->getConfigArray('catalogo_tipos_prueba'),
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
                    DependenciaExterna::create($data);
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

            if ($tipo === 'clasificaciones') {
                if (in_array($found['clave'] ?? '', self::PROTECTED_CLASIFICACIONES, true)) {
                    return back()->withErrors(['error' => 'Esta clasificación está protegida y no se puede eliminar.']);
                }
                $usos = InformeFinal::where('clasificacion', $found['clave'] ?? '')->count();
                if ($usos > 0) {
                    return back()->withErrors([
                        'error' => "Esta clasificación está en uso en {$usos} informe(s) y no se puede eliminar.",
                    ]);
                }
            }

            if ($tipo === 'medios_notificacion') {
                $usos = Cierre::whereRaw('UPPER(COALESCE(notificacion_medio, \'\')) = ?', [strtoupper($found['clave'] ?? '')])
                    ->where('eliminado', false)
                    ->count();
                if ($usos > 0) {
                    return back()->withErrors([
                        'error' => "Este medio está en uso en {$usos} cierre(s) y no se puede eliminar.",
                    ]);
                }
            }

            $items = array_values(array_filter($items, fn($item) => (int) $item['id'] !== (int) $id));
            $this->setConfigArray('catalogo_' . $tipo, $items);
            $this->logBitacora($tipo, (int) $id, 'eliminar', ['nombre' => $found['nombre'] ?? '']);
            return back()->with('success', 'Elemento eliminado correctamente.');
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
        $unidad = DependenciaExterna::findOrFail($id);
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
                'unidades' => 'DependenciaExterna',
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

    private function getMediosNotificacionData(): array
    {
        $items = ConfiguracionSistema::catalogItems('catalogo_medios_notificacion');
        $claves = array_values(array_filter(array_column($items, 'clave')));
        $usos = [];
        if (!empty($claves)) {
            $usos = Cierre::query()
                ->where(function ($q) use ($claves) {
                    foreach ($claves as $clave) {
                        $q->orWhereRaw('UPPER(COALESCE(notificacion_medio, \'\')) = ?', [strtoupper($clave)]);
                    }
                })
                ->where('eliminado', false)
                ->selectRaw('UPPER(notificacion_medio) as medio, COUNT(*) as total')
                ->groupBy('medio')
                ->pluck('total', 'medio')
                ->all();
        }

        foreach ($items as &$item) {
            $item['usos'] = (int) ($usos[strtoupper($item['clave'] ?? '')] ?? 0);
        }

        return $items;
    }

    private function getClasificacionesData(): array
    {
        $items = ConfiguracionSistema::catalogItems('catalogo_clasificaciones');
        $claves = array_column($items, 'clave');
        $usos = [];
        if (!empty($claves)) {
            $usos = InformeFinal::query()
                ->whereIn('clasificacion', $claves)
                ->selectRaw('clasificacion, COUNT(*) as total')
                ->groupBy('clasificacion')
                ->pluck('total', 'clasificacion')
                ->all();
        }

        foreach ($items as &$item) {
            $item['protegido'] = in_array($item['clave'] ?? '', self::PROTECTED_CLASIFICACIONES, true);
            $item['usos'] = (int) ($usos[$item['clave'] ?? ''] ?? 0);
        }

        return $items;
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
                'activa' => 'boolean',
            ],
            'feriados' => [
                'fecha' => 'required|date',
                'nombre' => 'required|string|max:255',
            ],
            default => [
                'nombre' => 'required|string|max:255',
                'activo' => 'boolean',
            ],
        };
    }
}
