<?php

namespace App\Enums;

enum RolUsuario: string
{
    case JEFE = 'jefe';
    case INVESTIGADOR = 'investigador';
    case REGISTRADOR = 'registrador';

    public static function valores(): array
    {
        return array_column(self::cases(), 'value');
    }
}
