<?php

namespace App\Http\Controllers;

use App\Models\CategoriaDenuncia;
use App\Models\UnidadExterna;
use App\Models\Feriado;
use App\Models\ConfiguracionSistema;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;

class CatalogoController extends Controller
{
    private const TABLE_BASED = ['categorias', 'unidades', 'feriados'];
    private const CONFIG_BASED = ['clasificaciones', 'tipos_denuncia', 'estados', 'medios_notificacion', 'tipos_prueba'];

    public function index()
    {
        $catalogos = [
            'categorias' => [
                'label' => 'Categorías',
                'items' => CategoriaDenuncia::orderBy('nombre')->get()->toArray(),
                'columns' => [
                    ['key' => 'nombre', 'label' => 'Nombre', 'type' => 'text'],
                    ['key' => 'tipo_denuncia', 'label' => 'Tipo Denuncia', 'type' => 'select', 'options' => ['corrupcion' => 'Corrupción', 'negacion' => 'Negación']],
                    ['key' => 'activa', 'label' => 'Activa', 'type' => 'boolean'],
                ],
            ],
            'unidades' => [
                'label' => 'Unidades Externas',
                'items' => UnidadExterna::orderBy('clave')->get()->toArray(),
                'columns' => [
                    ['key' => 'clave', 'label' => 'Clave', 'type' => 'text'],
                    ['key' => 'nombre', 'label' => 'Nombre', 'type' => 'text'],
                    ['key' => 'activa', 'label' => 'Activa', 'type' => 'boolean'],
                ],
            ],
            'feriados' => [
                'label' => 'Feriados',
                'items' => Feriado::orderBy('fecha')->get()->toArray(),
                'columns' => [
                    ['key' => 'fecha', 'label' => 'Fecha', 'type' => 'date'],
                    ['key' => 'nombre', 'label' => 'Nombre', 'type' => 'text'],
                    ['key' => 'recurrente', 'label' => 'Recurrente', 'type' => 'boolean'],
                ],
            ],
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
                    ['key' => 'clave', 'label' => 'Clave', 'type' => 'text'],
                    ['key' => 'nombre', 'label' => 'Nombre', 'type' => 'text'],
                    ['key' => 'activo', 'label' => 'Activo', 'type' => 'boolean'],
                ],
            ],
            'estados' => [
                'label' => 'Estados',
                'items' => $this->getConfigArray('catalogo_estados'),
                'columns' => [
                    ['key' => 'clave', 'label' => 'Clave', 'type' => 'text'],
                    ['key' => 'nombre', 'label' => 'Nombre', 'type' => 'text'],
                    ['key' => 'activo', 'label' => 'Activo', 'type' => 'boolean'],
                ],
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
        $data = $request->validate($this->rulesFor($tipo));

        if (in_array($tipo, self::TABLE_BASED)) {
            DB::beginTransaction();
            try {
                match ($tipo) {
                    'categorias' => CategoriaDenuncia::create([
                        ...$data,
                        'clave' => Str::slug(Str::upper($data['nombre']), '_'),
                    ]),
                    'unidades' => UnidadExterna::create($data),
                    'feriados' => Feriado::create($data),
                };
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
        $data = $request->validate($this->rulesFor($tipo, true));

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
                $model->update($data);
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
        if (in_array($tipo, self::TABLE_BASED)) {
            match ($tipo) {
                'categorias' => CategoriaDenuncia::findOrFail((int) $id)->delete(),
                'unidades' => UnidadExterna::findOrFail((int) $id)->delete(),
                'feriados' => Feriado::findOrFail((int) $id)->delete(),
            };
        } else {
            $items = $this->getConfigArray('catalogo_' . $tipo);
            $items = array_values(array_filter($items, fn($item) => (int) $item['id'] !== (int) $id));
            $this->setConfigArray('catalogo_' . $tipo, $items);
        }

        return back()->with('success', 'Elemento eliminado correctamente.');
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
