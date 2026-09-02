<?php

namespace App\Http\Requests;

use App\Enums\EstadoDenuncia;
use App\Enums\TipoDenuncia;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class DashboardRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'desde' => ['nullable', 'date', 'before_or_equal:hasta'],
            'hasta' => ['nullable', 'date', 'after_or_equal:desde'],
            'tecnico_id' => ['nullable', 'integer', 'exists:users,id'],
            'tipo' => ['nullable', Rule::in(TipoDenuncia::valores())],
            'categoria_id' => ['nullable', 'integer', 'exists:categorias_denuncia,id'],
            'clasificacion_id' => ['nullable', 'integer', 'exists:clasificaciones,id'],
            'estado' => ['nullable', Rule::in([...EstadoDenuncia::valores(), 'archivada'])],
            'incluir_inactivos' => ['nullable', 'boolean'],
            'tab' => ['nullable', Rule::in(['operativo', 'resultados', 'rendimiento'])],
        ];
    }

    public function filtros(): array
    {
        return [
            'desde' => $this->input('desde') ?: null,
            'hasta' => $this->input('hasta') ?: null,
            'tecnico_id' => $this->input('tecnico_id') ? (int) $this->input('tecnico_id') : null,
            'tipo' => $this->input('tipo') ?: null,
            'categoria_id' => $this->input('categoria_id') ? (int) $this->input('categoria_id') : null,
            'clasificacion_id' => $this->input('clasificacion_id') ? (int) $this->input('clasificacion_id') : null,
            'estado' => $this->input('estado') ?: null,
            'incluir_inactivos' => $this->boolean('incluir_inactivos'),
            'tab' => $this->input('tab', 'operativo'),
        ];
    }
}
