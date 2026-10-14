<?php

namespace App\Http\Requests\Denuncia;

use App\Services\PermisosEfectivos;
use Illuminate\Foundation\Http\FormRequest;

class StoreLegacyDenunciaRequest extends FormRequest
{
    public function authorize(): bool
    {
        // La autorización fina vive en el controller con `abort(403)` para
        // que la negación responda redirect + toast en web (bootstrap/app.php)
        // en lugar del 403 crudo del FormRequest.
        return $this->user() !== null;
    }

    protected function prepareForValidation(): void
    {
        // Sin normalización: los denunciados llegan estructurados.
    }

    public function rules(): array
    {
        $rules = [
            'modo' => 'required|in:en_curso,historico',
            'tipo' => 'required|in:corrupcion,negacion',
            'hechos' => 'required|string|min:10|max:8000',
            'escenario' => 'required|in:revelada,reservada,anonimo',
            'denunciante_nombre' => 'required_unless:escenario,anonimo|nullable|string|min:2|max:100',
            'denunciante_ci' => 'nullable|string|max:20',
            'denunciante_telefono' => 'nullable|digits:8',
            'denunciados' => 'required|array|min:1|max:20',
            'denunciados.*.conoce_identidad' => 'required|boolean',
            'denunciados.*.nombres' => 'required_if:denunciados.*.conoce_identidad,true|nullable|string|max:100',
            'denunciados.*.dependencia' => 'nullable|string|max:200',
            'denunciados.*.descripcion' => 'required_if:denunciados.*.conoce_identidad,false|nullable|string|max:2000',
            'fecha_recepcion' => 'required|date|before_or_equal:today',
            'gestion' => 'nullable|integer|min:2016|max:' . now()->year,
            'numero_ticket' => 'nullable|integer|min:1|max:9999',
            'investigador_id' => 'nullable|integer|exists:users,id',
            'clasificacion_id' => 'nullable|integer|exists:clasificaciones,id',
            'investigador_referencia' => 'nullable|string|max:150',
            'fecha_cierre' => 'nullable|date|after_or_equal:fecha_recepcion|before_or_equal:today',
            'archivos' => 'nullable|array|max:5',
            'archivos.*' => 'file|mimes:pdf,jpg,jpeg,png,docx|max:51200',
        ];

        if ($this->input('modo') === 'historico') {
            $rules['gestion'] = 'required|integer|min:2016|max:' . now()->year;
            $rules['numero_ticket'] = 'required|integer|min:1|max:9999';
            $rules['fecha_cierre'] = 'required|date|after_or_equal:fecha_recepcion|before_or_equal:today';
        } else {
            $rules['estado'] = 'required|in:investigacion,informe';
        }

        return $rules;
    }

    public function esAnonimo(): bool
    {
        return $this->input('escenario') === 'anonimo';
    }

    public function tieneNumeroManual(): bool
    {
        return $this->filled('gestion') && $this->filled('numero_ticket');
    }

    public function ticketManual(): string
    {
        return sprintf('DEN-%04d-%04d', $this->input('gestion'), $this->input('numero_ticket'));
    }
}
