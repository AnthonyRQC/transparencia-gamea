<?php

namespace App\Data;

class UnidadData
{
    public const UNIDADES = [
        'sistemas'            => 'Unidad de Sistemas',
        'adquisiciones'       => 'Dirección de Adquisiciones',
        'recursos-humanos'    => 'Dirección de Recursos Humanos',
        'transito'            => 'Dirección de Tránsito',
        'catastro'            => 'Unidad de Catastro',
        'obras-publicas'      => 'Dirección de Obras Públicas',
        'ingresos'            => 'Dirección de Ingresos',
        'secretaria-general'  => 'Secretaría General',
        'contrataciones'      => 'Unidad de Contrataciones',
        'hacienda'            => 'Dirección de Hacienda',
        'auditoria'           => 'Unidad de Auditoría Interna',
        'archivo'             => 'Archivo Central',
        'ministerio-justicia' => 'Ministerio de Justicia y Transparencia Institucional',
        'otro'                => 'Otra (especificar)',
    ];

    public static function getAll(): array
    {
        return self::UNIDADES;
    }

    public static function getNombre(string $key): string
    {
        return self::UNIDADES[$key] ?? $key;
    }
}
