<?php

namespace App\Http\Requests\Denuncia;

use App\Models\MedioNotificacion;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class GuardarCierreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'notificado_denunciante' => 'required|boolean',
            'notificacion_medio' => ['nullable', 'string', 'max:200', Rule::in($this->mediosValidos())],
            'notificacion_fecha' => 'nullable|date|before_or_equal:today',
            'notificacion_descripcion' => 'nullable|string|min:5|max:2000',
            'no_notificado_motivo' => 'nullable|string|max:500',
            'concluido_por' => 'required|string|min:2|max:100',
            'descripcion' => 'required|string|min:20|max:5000',
        ];
    }

    private function mediosValidos(): array
    {
        $claves = MedioNotificacion::where('activa', true)->pluck('clave')->toArray();
        return !empty($claves) ? $claves : ['whatsapp', 'email', 'presencial', 'otro'];
    }
}
