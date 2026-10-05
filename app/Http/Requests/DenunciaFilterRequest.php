<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Filtros server-side de la Bandeja (Slice 1).
 *
 * Fusiona el contrato de `ConsultaCasos` (busqueda LIKE + ticket exacto +
 * multi-estado + tipo/escenario + rango de fechas + investigador) con la
 * normalización de `DashboardRequest::filtros()`, y suma
 * `categoria_id` / `clasificacion_id`.
 *
 * Diferencias intencionales con `ConsultaCasos`:
 * - El parámetro de búsqueda libre se llama `search` (no `busqueda`),
 *   para igualar el estado del frontend de Bandeja.
 * - `filters` se devuelve normalizado (estado como array, ids como int),
 *   no el `only()` crudo.
 */
class DenunciaFilterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    protected function prepareForValidation(): void
    {
        // Acepta estado como "a,b" (estilo ConsultarCasos) o como array.
        if ($this->has('estado') && is_string($this->input('estado'))) {
            $partes = array_values(array_filter(array_map('trim', explode(',', $this->input('estado') ?? ''))));
            $this->merge(['estado' => $partes]);
        }

        // Alias heredado de ConsultarCasos: ?investigador=ID equivale a investigador_id.
        if (! $this->input('investigador_id') && $this->input('investigador')) {
            $this->merge(['investigador_id' => $this->input('investigador')]);
        }
    }

    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:255'],
            'ticket' => ['nullable', 'string', 'max:50'],
            'estado' => ['nullable', 'array'],
            'estado.*' => ['string', Rule::in([
                'ingresada', 'evaluacion_tecnica', 'admitida', 'rechazada',
                'asignada', 'investigacion', 'informe', 'cerrada',
            ])],
            'tipo' => ['nullable', Rule::in(['corrupcion', 'negacion'])],
            'escenario' => ['nullable', Rule::in(['revelada', 'reservada', 'anonimo'])],
            'fecha_desde' => ['nullable', 'date', 'before_or_equal:today'],
            'fecha_hasta' => ['nullable', 'date', 'before_or_equal:today'],
            'investigador_id' => ['nullable', 'integer', 'exists:users,id'],
            'categoria_id' => ['nullable', 'integer', 'exists:categorias_denuncia,id'],
            'clasificacion_id' => ['nullable', 'integer', 'exists:clasificaciones,id'],
            'tab' => ['nullable', Rule::in(['por-admitir', 'por-asignar', 'en-curso', 'historial', 'vision-general'])],
        ];
    }

    public function filtros(): array
    {
        $estado = $this->input('estado');

        return [
            'search' => trim((string) $this->input('search', '')) ?: null,
            'ticket' => $this->input('ticket') ? mb_strtoupper(trim((string) $this->input('ticket'))) : null,
            'estado' => is_array($estado) && count($estado) > 0 ? array_values($estado) : null,
            'tipo' => $this->input('tipo') ?: null,
            'escenario' => $this->input('escenario') ?: null,
            'fecha_desde' => $this->input('fecha_desde') ?: null,
            'fecha_hasta' => $this->input('fecha_hasta') ?: null,
            'investigador_id' => $this->input('investigador_id') ? (int) $this->input('investigador_id') : null,
            'categoria_id' => $this->input('categoria_id') ? (int) $this->input('categoria_id') : null,
            'clasificacion_id' => $this->input('clasificacion_id') ? (int) $this->input('clasificacion_id') : null,
            'tab' => $this->input('tab', 'por-admitir'),
        ];
    }
}
