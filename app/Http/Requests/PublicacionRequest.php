<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PublicacionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'tipo_id' => 'required|exists:tipos_publicacion,id',
            'prioridad_id' => 'required|exists:prioridades_publicacion,id',
            'cite' => 'nullable|string|max:255',
            'fecha_documento' => 'nullable|date',
            'emisor' => 'required|string|max:255',
            'destinatario_display' => 'nullable|string|max:255',
            'ref_titulo' => 'required|string|max:140',
            'resumen' => 'nullable|string|max:2000',
            'cuerpo' => 'nullable|string',
            'referencia_externa' => 'nullable|string|max:255',
            'denuncia_id' => 'nullable|exists:denuncias,id',
            'evento' => 'nullable|in:admitida,rechazada,cerrada',
            'publicar' => 'boolean',
            'portada_archivo_id' => 'nullable|exists:publicacion_archivos,id',
            'archivos' => 'nullable|array|max:5',
            'archivos.*' => 'file|mimes:pdf,jpg,jpeg,png,webp|max:20480',
        ];
    }

    /**
     * El editor rico manda '<p></p>' vacío: se normaliza a null para que la
     * regla cuerpo-o-archivo funcione.
     */
    public function normalizarCuerpo(?string $cuerpo): ?string
    {
        if ($cuerpo === null) {
            return null;
        }
        $texto = trim(strip_tags($cuerpo));
        return $texto === '' ? null : $cuerpo;
    }
}
