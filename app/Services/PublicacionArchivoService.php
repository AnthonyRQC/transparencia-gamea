<?php

namespace App\Services;

use App\Models\Publicacion;
use App\Models\PublicacionArchivo;

class PublicacionArchivoService
{
    public static function guardarArchivo(Publicacion $publicacion, $file): void
    {
        $path = $file->store('publicaciones', 'public');
        $bytes = $file->getSize() ?: 0;

        $publicacion->archivos()->create([
            'nombre' => $file->getClientOriginalName(),
            'path' => $path,
            'mime_type' => $file->getMimeType(),
            'tamano' => self::tamanoLegible($bytes),
            'hash' => hash_file('sha256', $file->getRealPath()),
        ]);
    }

    private static function tamanoLegible(int $bytes): string
    {
        if ($bytes >= 1048576) {
            return number_format($bytes / 1048576, 1) . ' MB';
        }
        if ($bytes >= 1024) {
            return number_format($bytes / 1024, 0) . ' KB';
        }
        return $bytes . ' B';
    }

    /**
     * Quita un adjunto del muro sin borrar el físico (historial + auditoría).
     */
    public static function quitarArchivo(int $id)
    {
        $archivo = PublicacionArchivo::activos()->findOrFail($id);
        $archivo->update(['fecha_eliminacion' => now()]);
        BitacoraService::registrar('App\Models\Publicacion', $archivo->publicacion_id, 'quitar-adjunto', ['archivo' => $archivo->nombre]);

        return back()->with('success', "Adjunto '{$archivo->nombre}' quitado del muro (se conserva en historial).");
    }

    public static function descargarArchivo(int $id)
    {
        $archivo = PublicacionArchivo::activos()->findOrFail($id);

        if (!\Illuminate\Support\Facades\Storage::disk('public')->exists($archivo->path)) {
            return back()->with('error', 'Archivo no encontrado en el almacenamiento.');
        }

        return \Illuminate\Support\Facades\Storage::disk('public')->download($archivo->path, $archivo->nombre);
    }

    /**
     * Descarga pública para usuarios externos (Sprint 13.1): solo adjuntos
     * activos de avisos publicados. Sin auth.
     */
    public static function descargarPublico(int $id)
    {
        $archivo = PublicacionArchivo::activos()->findOrFail($id);
        $publicacion = $archivo->publicacion;

        if (!$publicacion || $publicacion->publicado_at === null) {
            abort(404);
        }

        if (!\Illuminate\Support\Facades\Storage::disk('public')->exists($archivo->path)) {
            abort(404);
        }

        return \Illuminate\Support\Facades\Storage::disk('public')->download($archivo->path, $archivo->nombre);
    }
}
