<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProfileUpdateRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            // CI, username y rol NO se editan aquí (solo 18A). Si llegan, se ignoran.
            'nombres' => ['required', 'string', 'min:2', 'max:100'],
            'apellidos' => ['required', 'string', 'min:2', 'max:100'],
            'telefono' => ['nullable', 'string', 'max:20'],
            'email' => [
                'nullable',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique(User::class)->ignore($this->user()->id),
            ],
            'color' => ['nullable', 'string', Rule::in(User::COLORES_AVATAR)],
        ];
    }
}
