<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UsuarioDesactivarRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'motivo_baja' => ['nullable', 'string', 'max:500'],
            'traspaso_a' => ['nullable', 'integer', 'exists:users,id'],
            'justificacion' => ['nullable', 'string', 'min:5', 'max:2000'],
        ];
    }
}
