<?php

namespace App\Services;

use App\Models\Bitacora;
use App\Models\Denuncia;
use Illuminate\Support\Collection;

class ExtractoService
{
    public const MAPA_ACCIONES = [
        'archivo_subido' => 'ARCHIVO SUBIDO',
        'archivo_descargado' => 'ARCHIVO DESCARGADO',
        'archivo_eliminado' => 'ARCHIVO ELIMINADO',
        'ingreso_legacy' => 'INGRESO LEGACY',
        'eliminacion' => 'ELIMINACIÓN',
        'auditoria_panel' => 'CONSULTA PANEL AUDITORÍA',
        'auditoria_extracto' => 'EXPORTACIÓN EXTRACTO',
        'constancia_generada' => 'CONSTANCIA GENERADA',
    ];

    public static function etiquetaAccion(string $accion): string
    {
        return self::MAPA_ACCIONES[$accion] ?? mb_strtoupper(str_replace(['_', '-'], ' ', $accion));
    }

    /**
     * Construye los datos del extracto operativo (para Jefatura / Operativa).
     * Incluye qué cambió (detalle) y excluye user_agent.
     *
     * @return array{meta: array, headings: array, anchos: array, filas: Collection}
     */
    public static function operativas(Denuncia $denuncia): array
    {
        $rawRows = $denuncia->bitacora()
            ->with('usuario:id,name')
            ->orderBy('id')
            ->get(['id', 'accion', 'detalle', 'usuario_id', 'fecha']);

        $meta = self::meta($denuncia, $rawRows);
        $headings = ['N°', 'FECHA', 'ACTOR', 'ACCIÓN', 'QUÉ CAMBIÓ'];
        $anchos = [6, 18, 26, 24, 70];

        $filas = $rawRows->map(fn (Bitacora $b) => [
            'id' => $b->id,
            'fecha' => $b->fecha ? $b->fecha->format('d/m/Y H:i') : '—',
            'actor' => $b->usuario?->name ?? 'SISTEMA',
            'accion' => self::etiquetaAccion($b->accion),
            'detalle' => $b->detalle ?? '—',
        ]);

        return [
            'meta' => $meta,
            'headings' => $headings,
            'anchos' => $anchos,
            'filas' => $filas,
        ];
    }

    /**
     * Construye los datos del extracto técnico (para TI / Admin).
     * Incluye navegador (user_agent) y excluye detalle a nivel de consulta.
     *
     * @return array{meta: array, headings: array, anchos: array, filas: Collection}
     */
    public static function tecnicas(Denuncia $denuncia): array
    {
        $rawRows = $denuncia->bitacora()
            ->with('usuario:id,name')
            ->orderBy('id')
            ->get(['id', 'accion', 'usuario_id', 'fecha', 'user_agent']);

        $meta = self::meta($denuncia, $rawRows);
        $headings = ['N°', 'FECHA', 'ACTOR', 'ACCIÓN', 'DESCARGA', 'NAVEGADOR'];
        $anchos = [6, 18, 26, 24, 10, 60];

        $filas = $rawRows->map(fn (Bitacora $b) => [
            'id' => $b->id,
            'fecha' => $b->fecha ? $b->fecha->format('d/m/Y H:i') : '—',
            'actor' => $b->usuario?->name ?? 'SISTEMA',
            'accion' => self::etiquetaAccion($b->accion),
            'descarga' => $b->accion === 'archivo_descargado' ? 'SÍ' : '—',
            'user_agent' => $b->user_agent ?? '—',
        ]);

        return [
            'meta' => $meta,
            'headings' => $headings,
            'anchos' => $anchos,
            'filas' => $filas,
        ];
    }

    /**
     * Metadata de caso para cotejo y trazabilidad institucional.
     */
    public static function meta(Denuncia $denuncia, Collection $rawRows): array
    {
        return [
            'ticket' => $denuncia->ticket,
            'caso_id' => $denuncia->id,
            'tipo' => mb_strtoupper(str_replace('_', ' ', $denuncia->tipo ?? '')),
            'estado' => mb_strtoupper(str_replace('_', ' ', $denuncia->estado ?? '')),
            'fecha_ingreso' => $denuncia->created_at ? $denuncia->created_at->format('d/m/Y H:i') : '—',
            'generado' => now()->format('d/m/Y H:i'),
            'generado_por' => auth()->user()?->name ?? 'SISTEMA',
            'registros' => $rawRows->count(),
            'rango' => $rawRows->isNotEmpty() ? "{$rawRows->first()->id}–{$rawRows->last()->id}" : null,
        ];
    }
}
