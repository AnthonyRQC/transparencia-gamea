<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UsuarioMasivoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'exists:users,id'],
            'accion' => ['required', 'in:desactivar,reactivar'],
            'motivo_baja' => ['nullable', 'string', 'max:500'],
            'traspaso_a' => ['nullable', 'integer', 'exists:users,id'],
            'justificacion' => ['nullable', 'string', 'min:5', 'max:2000'],
        ];
    }
}
