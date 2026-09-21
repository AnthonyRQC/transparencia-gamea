<?php

namespace App\Services;

use App\Helpers\DiasHabiles;
use App\Models\CategoriaDenuncia;
use App\Models\Clasificacion;
use App\Models\DependenciaExterna;
use App\Models\Feriado;
use App\Models\MedioNotificacion;
use App\Models\PrioridadPublicacion;
use App\Models\TipoPublicacion;
use App\Support\CatalogoRules;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CatalogoService
{
    private const TABLE_BASED = ['categorias', 'unidades', 'feriados', 'clasificaciones', 'medios_notificacion', 'tipos_publicacion', 'prioridades_publicacion'];
    private const CONFIG_BASED = ['tipos_denuncia', 'estados'];
    private const READ_ONLY_TYPES = ['tipos_denuncia', 'estados'];
    public const PROTECTED_CLASIFICACIONES = ['penal', 'civil', 'administrativo', 'sin_indicios', 'medida_correctiva', 'archivado'];
    public const PROTECTED_PRIORIDADES = ['ordinario', 'prioritario', 'urgente'];

    public static function store(Request $request, string $tipo)
    {
        if (in_array($tipo, self::READ_ONLY_TYPES)) {
            return back()->withErrors(['error' => 'Este catálogo no permite crear nuevos elementos.']);
        }

        $data = $request->validate(CatalogoRules::rulesFor($tipo));

        if (in_array($tipo, self::TABLE_BASED)) {
            DB::beginTransaction();
            try {
                if ($tipo === 'categorias') {
                    $inactiva = CategoriaDenuncia::where('nombre', $data['nombre'])
                        ->where('activa', false)->first();
                    if ($inactiva) {
                        $inactiva->update(['activa' => true, 'fecha_desactivacion' => null, 'desactivado_por_id' => null]);
                        BitacoraService::registrarCatalogo('categorias', $inactiva->id, 'reactivar', ['nombre' => $data['nombre']]);
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
                        BitacoraService::registrarCatalogo('unidades', $inactiva->id, 'reactivar', ['nombre' => $data['nombre']]);
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
                        BitacoraService::registrarCatalogo('clasificaciones', $inactiva->id, 'reactivar', ['nombre' => $data['nombre']]);
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
                        BitacoraService::registrarCatalogo('medios_notificacion', $inactiva->id, 'reactivar', ['nombre' => $data['nombre']]);
                        DB::commit();
                        return back()->with('success', 'Medio de notificación reactivado correctamente.');
                    }
                    MedioNotificacion::create([
                        ...$data,
                        'clave' => Str::slug(Str::upper($data['nombre']), '_'),
                    ]);
                } elseif ($tipo === 'tipos_publicacion') {
                    $inactiva = TipoPublicacion::where('nombre', $data['nombre'])
                        ->where('activa', false)->first();
                    if ($inactiva) {
                        $inactiva->update(['activa' => true, 'fecha_desactivacion' => null, 'desactivado_por_id' => null]);
                        BitacoraService::registrarCatalogo('tipos_publicacion', $inactiva->id, 'reactivar', ['nombre' => $data['nombre']]);
                        DB::commit();
                        return back()->with('success', 'Tipo de publicación reactivado correctamente.');
                    }
                    TipoPublicacion::create([
                        ...$data,
                        'clave' => Str::slug(Str::upper($data['nombre']), '_'),
                    ]);
                } elseif ($tipo === 'prioridades_publicacion') {
                    $inactiva = PrioridadPublicacion::where('nombre', $data['nombre'])
                        ->where('activa', false)->first();
                    if ($inactiva) {
                        $inactiva->update(['activa' => true, 'fecha_desactivacion' => null, 'desactivado_por_id' => null]);
                        BitacoraService::registrarCatalogo('prioridades_publicacion', $inactiva->id, 'reactivar', ['nombre' => $data['nombre']]);
                        DB::commit();
                        return back()->with('success', 'Prioridad reactivada correctamente.');
                    }
                    PrioridadPublicacion::create([
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
            $items = CatalogoConfigStore::getConfigArray('catalogo_' . $tipo);
            $newId = count($items) > 0 ? max(array_column($items, 'id')) + 1 : 1;
            $data = self::upperData($data);
            if (empty($data['clave'])) {
                $data['clave'] = Str::slug(Str::upper($data['nombre']), '_');
            }
            $data['id'] = $newId;
            $items[] = $data;
            CatalogoConfigStore::setConfigArray('catalogo_' . $tipo, $items);
        }

        return back()->with('success', 'Elemento creado correctamente.');
    }

    public static function update(Request $request, string $tipo, string $id)
    {
        if (in_array($tipo, self::READ_ONLY_TYPES)) {
            $data = $request->validate(['nombre' => 'required|string|max:255', 'activo' => 'boolean']);
        } else {
            $data = $request->validate(CatalogoRules::rulesFor($tipo, true));
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
                    'tipos_publicacion' => TipoPublicacion::findOrFail((int) $id),
                    'prioridades_publicacion' => PrioridadPublicacion::findOrFail((int) $id),
                };

                if ($tipo === 'categorias' || $tipo === 'clasificaciones' || $tipo === 'medios_notificacion' || $tipo === 'tipos_publicacion' || $tipo === 'prioridades_publicacion') {
                    $data['clave'] = Str::slug(Str::upper($data['nombre']), '_');
                }

                if ($tipo === 'unidades') {
                    $error = self::validarParentUnidad($model->id, $data['parent_id'] ?? null);
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
                    BitacoraService::registrarCatalogo($tipo, (int) $id, 'reactivar', ['nombre' => $data['nombre'] ?? '']);
                }

                DB::commit();
            } catch (\Exception $e) {
                DB::rollBack();
                return back()->withErrors(['error' => 'Error al actualizar: ' . $e->getMessage()]);
            }
        } else {
            $items = CatalogoConfigStore::getConfigArray('catalogo_' . $tipo);
            $data = self::upperData($data);
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
            CatalogoConfigStore::setConfigArray('catalogo_' . $tipo, $items);
        }

        return back()->with('success', 'Elemento actualizado correctamente.');
    }

    public static function destroy(string $tipo, string $id)
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

            if ($tipo === 'prioridades_publicacion') {
                $prioridad = PrioridadPublicacion::findOrFail((int) $id);
                if (in_array($prioridad->clave, self::PROTECTED_PRIORIDADES, true)) {
                    return back()->withErrors(['error' => 'Esta prioridad está protegida y no se puede eliminar.']);
                }
            }

            match ($tipo) {
                'categorias' => self::desactivarCategoria((int) $id),
                'unidades' => self::desactivarUnidad((int) $id),
                'feriados' => self::desactivarFeriado((int) $id),
                'clasificaciones' => self::desactivarClasificacion((int) $id),
                'medios_notificacion' => self::desactivarMedio((int) $id),
                'tipos_publicacion' => self::desactivarTipoPublicacion((int) $id),
                'prioridades_publicacion' => self::desactivarPrioridadPublicacion((int) $id),
            };

            return back()->with('success', 'Elemento desactivado correctamente.');
        }

        return back()->with('success', 'Elemento desactivado correctamente.');
    }

    public static function reactivar(string $tipo, string $id)
    {
        if (in_array($tipo, self::TABLE_BASED)) {
            match ($tipo) {
                'categorias' => self::reactivarCategoria((int) $id),
                'unidades' => self::reactivarUnidad((int) $id),
                'feriados' => self::reactivarFeriado((int) $id),
                'clasificaciones' => self::reactivarClasificacion((int) $id),
                'medios_notificacion' => self::reactivarMedio((int) $id),
                'tipos_publicacion' => self::reactivarTipoPublicacion((int) $id),
                'prioridades_publicacion' => self::reactivarPrioridadPublicacion((int) $id),
            };
        }

        return back()->with('success', 'Elemento reactivado correctamente.');
    }

    private static function validarParentUnidad(int $nodoId, $parentId): ?string
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

    private static function desactivarCategoria(int $id): void
    {
        $categoria = CategoriaDenuncia::findOrFail($id);
        $categoria->update([
            'activa' => false,
            'fecha_desactivacion' => now(),
            'desactivado_por_id' => auth()->id(),
        ]);
        BitacoraService::registrarCatalogo('categorias', $id, 'desactivar', [
            'nombre' => $categoria->nombre,
            'denuncias_asociadas' => $categoria->denuncias()->count(),
        ]);
    }

    private static function desactivarUnidad(int $id): void
    {
        $unidad = DependenciaExterna::findOrFail($id);
        $unidad->update([
            'activa' => false,
            'fecha_desactivacion' => now(),
            'desactivado_por_id' => auth()->id(),
        ]);
        BitacoraService::registrarCatalogo('unidades', $id, 'desactivar', [
            'nombre' => $unidad->nombre,
            'solicitudes_asociadas' => $unidad->solicitudes()->count(),
        ]);
    }

    private static function desactivarClasificacion(int $id): void
    {
        $clasificacion = Clasificacion::findOrFail($id);
        $clasificacion->update([
            'activa' => false,
            'fecha_desactivacion' => now(),
            'desactivado_por_id' => auth()->id(),
        ]);
        BitacoraService::registrarCatalogo('clasificaciones', $id, 'desactivar', [
            'nombre' => $clasificacion->nombre,
            'informes_asociados' => $clasificacion->informes()->count(),
        ]);
    }

    private static function desactivarMedio(int $id): void
    {
        $medio = MedioNotificacion::findOrFail($id);
        $medio->update([
            'activa' => false,
            'fecha_desactivacion' => now(),
            'desactivado_por_id' => auth()->id(),
        ]);
        BitacoraService::registrarCatalogo('medios_notificacion', $id, 'desactivar', [
            'nombre' => $medio->nombre,
            'cierres_asociados' => $medio->cierres()->count(),
        ]);
    }

    private static function reactivarCategoria(int $id): void
    {
        $categoria = CategoriaDenuncia::findOrFail($id);
        $categoria->update(['activa' => true, 'fecha_desactivacion' => null, 'desactivado_por_id' => null]);
        BitacoraService::registrarCatalogo('categorias', $id, 'reactivar', ['nombre' => $categoria->nombre]);
    }

    private static function reactivarUnidad(int $id): void
    {
        $unidad = DependenciaExterna::findOrFail($id);
        $unidad->update(['activa' => true, 'fecha_desactivacion' => null, 'desactivado_por_id' => null]);
        BitacoraService::registrarCatalogo('unidades', $id, 'reactivar', ['nombre' => $unidad->nombre]);
    }

    private static function reactivarClasificacion(int $id): void
    {
        $clasificacion = Clasificacion::findOrFail($id);
        $clasificacion->update(['activa' => true, 'fecha_desactivacion' => null, 'desactivado_por_id' => null]);
        BitacoraService::registrarCatalogo('clasificaciones', $id, 'reactivar', ['nombre' => $clasificacion->nombre]);
    }

    private static function reactivarMedio(int $id): void
    {
        $medio = MedioNotificacion::findOrFail($id);
        $medio->update(['activa' => true, 'fecha_desactivacion' => null, 'desactivado_por_id' => null]);
        BitacoraService::registrarCatalogo('medios_notificacion', $id, 'reactivar', ['nombre' => $medio->nombre]);
    }

    private static function desactivarTipoPublicacion(int $id): void
    {
        $tipo = TipoPublicacion::findOrFail($id);
        $tipo->update([
            'activa' => false,
            'fecha_desactivacion' => now(),
            'desactivado_por_id' => auth()->id(),
        ]);
        BitacoraService::registrarCatalogo('tipos_publicacion', $id, 'desactivar', [
            'nombre' => $tipo->nombre,
            'avisos_asociados' => $tipo->publicaciones()->count(),
        ]);
    }

    private static function reactivarTipoPublicacion(int $id): void
    {
        $tipo = TipoPublicacion::findOrFail($id);
        $tipo->update(['activa' => true, 'fecha_desactivacion' => null, 'desactivado_por_id' => null]);
        BitacoraService::registrarCatalogo('tipos_publicacion', $id, 'reactivar', ['nombre' => $tipo->nombre]);
    }

    private static function desactivarPrioridadPublicacion(int $id): void
    {
        $prioridad = PrioridadPublicacion::findOrFail($id);
        $prioridad->update([
            'activa' => false,
            'fecha_desactivacion' => now(),
            'desactivado_por_id' => auth()->id(),
        ]);
        BitacoraService::registrarCatalogo('prioridades_publicacion', $id, 'desactivar', [
            'nombre' => $prioridad->nombre,
            'avisos_asociados' => $prioridad->publicaciones()->count(),
        ]);
    }

    private static function reactivarPrioridadPublicacion(int $id): void
    {
        $prioridad = PrioridadPublicacion::findOrFail($id);
        $prioridad->update(['activa' => true, 'fecha_desactivacion' => null, 'desactivado_por_id' => null]);
        BitacoraService::registrarCatalogo('prioridades_publicacion', $id, 'reactivar', ['nombre' => $prioridad->nombre]);
    }

    private static function desactivarFeriado(int $id): void
    {
        $feriado = Feriado::findOrFail($id);
        $feriado->delete();
        DiasHabiles::olvidarCache();
        BitacoraService::registrarCatalogo('feriados', $id, 'desactivar', [
            'nombre' => $feriado->nombre,
            'fecha' => $feriado->fecha->format('Y-m-d'),
        ]);
    }

    private static function reactivarFeriado(int $id): void
    {
        $feriado = Feriado::onlyTrashed()->findOrFail($id);
        $feriado->restore();
        DiasHabiles::olvidarCache();
        BitacoraService::registrarCatalogo('feriados', $id, 'reactivar', ['nombre' => $feriado->nombre]);
    }

    private static function upperData(array $data): array
    {
        return array_map(
            fn($value) => is_string($value) ? Str::upper($value) : $value,
            $data
        );
    }
}
