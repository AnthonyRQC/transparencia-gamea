<?php

namespace App\Support;

use App\Enums\TipoDenuncia;
use Illuminate\Validation\Rule;

class CatalogoRules
{
    public static function rulesFor(string $tipo, bool $isUpdate = false): array
    {
        return match ($tipo) {
            'categorias' => [
                'nombre' => 'required|string|max:255',
                'descripcion' => 'nullable|string',
                'tipo_denuncia' => ['required', Rule::enum(TipoDenuncia::class)],
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
            'tipos_publicacion' => [
                'nombre' => 'required|string|max:255',
                'descripcion' => 'nullable|string',
                'activa' => 'boolean',
            ],
            'prioridades_publicacion' => [
                'nombre' => 'required|string|max:255',
                'descripcion' => 'nullable|string',
                'activa' => 'boolean',
            ],
            default => [
                'nombre' => 'required|string|max:255',
                'activo' => 'boolean',
            ],
        };
    }
}
