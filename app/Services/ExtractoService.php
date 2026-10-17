<?php

namespace App\Services;

use App\Models\Denuncia;
use Carbon\Carbon;

class ExtractoService
{
    public const MAPA_ACCIONES = [
        'archivo_subido' => 'ARCHIVO SUBIDO',
        'archivo_descargado' => 'ARCHIVO DESCARGADO',
        'archivo_eliminado' => 'ARCHIVO ELIMINADO',
        'ingreso_legacy' => 'INGRESO LEGACY',
        'eliminacion' => 'ELIMINACIÓN',
    ];

    public static function etiquetaAccion(string $accion): string
    {
        return self::MAPA_ACCIONES[$accion] ?? mb_strtoupper(str_replace(['_', '-'], ' ', $accion));
    }

    /**
     * Devuelve la lista de acciones únicas disponibles con sus etiquetas para filtros.
     */
    public static function listadoAcciones(): array
    {
        return [
            ['value' => 'archivo_descargado', 'label' => 'ARCHIVO DESCARGADO'],
            ['value' => 'archivo_subido', 'label' => 'ARCHIVO SUBIDO'],
            ['value' => 'archivo_eliminado', 'label' => 'ARCHIVO ELIMINADO'],
            ['value' => 'ingreso_legacy', 'label' => 'INGRESO LEGACY'],
            ['value' => 'eliminacion', 'label' => 'ELIMINACIÓN'],
            ['value' => 'auditoria_panel', 'label' => 'CONSULTA PANEL AUDITORÍA'],
            ['value' => 'auditoria_extracto', 'label' => 'EXPORTACIÓN EXTRACTO'],
            ['value' => 'constancia_generada', 'label' => 'CONSTANCIA GENERADA'],
        ];
    }
}
