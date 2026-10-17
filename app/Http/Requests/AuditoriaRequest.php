<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AuditoriaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('menu.auditoria') ?? false;
    }

    public function rules(): array
    {
        return [
            'desde' => ['nullable', 'date'],
            'hasta' => ['nullable', 'date'],
            'usuario_id' => ['nullable', 'integer', 'exists:users,id'],
            'accion' => ['nullable', 'string', 'max:50'],
            'ticket' => ['nullable', 'string', 'max:20'],
            'tipo' => ['nullable', Rule::in(['descargas'])],
        ];
    }
}
