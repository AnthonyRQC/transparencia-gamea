<?php

namespace App\Services;

use App\Models\Bitacora;
use Illuminate\Support\Facades\Log;

class BitacoraService
{
    public static function registrar(string $entidadTipo, int $entidadId, string $accion, array $detalle): void
    {
        Bitacora::create([
            'entidad_tipo' => $entidadTipo,
            'entidad_id' => $entidadId,
            'accion' => $accion,
            'detalle' => json_encode($detalle),
            'usuario_id' => auth()->id(),
            'fecha' => now(),
        ]);
    }

    public static function registrarCatalogo(string $tipo, int $id, string $accion, array $detalle): void
    {
        self::registrar('App\Models\\' . match ($tipo) {
            'categorias' => 'CategoriaDenuncia',
            'unidades' => 'DependenciaExterna',
            'feriados' => 'Feriado',
            'clasificaciones' => 'Clasificacion',
            'medios_notificacion' => 'MedioNotificacion',
            'tipos_publicacion' => 'TipoPublicacion',
            'prioridades_publicacion' => 'PrioridadPublicacion',
            default => ucfirst($tipo),
        }, $id, $accion, $detalle);

        Log::info("CATALOGO_{$accion}", [
            'tipo' => $tipo,
            'id' => $id,
            'detalle' => $detalle,
            'usuario_id' => auth()->id(),
        ]);
    }
}
