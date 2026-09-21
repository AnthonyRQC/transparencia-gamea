<?php

namespace App\Http\Requests;

use App\Services\UsuarioAdminService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UsuarioStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nombres' => ['required', 'string', 'min:2', 'max:100'],
            'apellidos' => ['required', 'string', 'min:2', 'max:100'],
            'ci' => ['required', 'string', 'max:20'],
            'rol' => ['required', Rule::in(UsuarioAdminService::rolesPermitidos($this->user()))],
            'email' => ['nullable', 'email', 'max:255', Rule::unique('users', 'email')],
            'telefono' => ['nullable', 'string', 'max:20'],
            'password' => ['required', ...UsuarioAdminService::passwordRules()],
        ];
    }
}
