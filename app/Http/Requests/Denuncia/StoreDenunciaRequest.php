<?php

namespace App\Http\Requests\Denuncia;

use Illuminate\Foundation\Http\FormRequest;

class StoreDenunciaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        $rules = [
            'tipo' => 'required|in:corrupcion,negacion',
            'escenario' => 'required|in:revelada,reservada,anonimo',
            'declaracion_jurada' => 'required|boolean|accepted',
        ];

        if (in_array($this->input('tipo'), ['corrupcion', 'negacion'])) {
            if ($this->input('escenario') !== 'anonimo') {
                $rules = array_merge($rules, [
                    'denunciante.nombres' => 'required|string|min:2|max:100',
                    'denunciante.ci' => 'nullable|digits_between:6,9',
                    'denunciante.email' => 'nullable|email',
                    'denunciante.telefono' => 'nullable|digits:8',
                ]);
            } else {
                $rules = array_merge($rules, [
                    'denunciante.email' => 'nullable|email',
                    'denunciante.telefono' => 'nullable|digits:8',
                ]);
            }

            $rules = array_merge($rules, [
                'denunciados' => 'required|array|min:1',
                'denunciados.*.conoce_identidad' => 'required|boolean',
                'denunciados.*.nombres' => 'required_if:denunciados.*.conoce_identidad,true|nullable|string|max:100',
                'denunciados.*.dependencia' => 'nullable|string|max:200',
                'denunciados.*.descripcion' => 'required_if:denunciados.*.conoce_identidad,false|nullable|string',
                'detalles.categoria' => 'required|exists:categorias_denuncia,clave',
                'detalles.fecha' => 'required|date|before_or_equal:today|after_or_equal:' . now()->subYears(5)->format('Y-m-d'),
                'detalles.hora' => 'nullable',
                'detalles.lugar' => 'required|string|max:200',
                'hechos' => 'required|string|min:10|max:8000',
                'pruebas' => 'nullable|array',
                'pruebas.*.tipo' => 'required_with:pruebas.*|in:archivo,fisica,testigo',
                'pruebas.*.descripcion' => 'nullable|string',
                'pruebas.*.testigo_nombre' => 'required_if:pruebas.*.tipo,testigo|nullable|string|max:100',
                'pruebas.*.testigo_telefono' => 'required_if:pruebas.*.tipo,testigo|nullable|digits:8',
            ]);
        }

        return $rules;
    }
}
