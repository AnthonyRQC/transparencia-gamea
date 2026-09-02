<?php

namespace App\Http\Requests\Denuncia;

use App\Models\Clasificacion;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class GuardarInformeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'clasificacion' => ['required', Rule::in($this->clasificacionesValidas())],
            'fojas' => 'required|integer|min:1|max:9999',
            'justificacion' => 'required|string|min:20|max:5000',
            'concluido_por' => 'required|string|min:2|max:100',
            'sitpreco' => 'nullable|string|min:3|max:50',
        ];
    }

    private function clasificacionesValidas(): array
    {
        $claves = Clasificacion::where('activa', true)->pluck('clave')->toArray();
        return !empty($claves) ? $claves : ['penal', 'civil', 'administrativo', 'sin_indicios', 'medida_correctiva', 'archivado'];
    }
}
