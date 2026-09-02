<?php

namespace App\Enums;

enum EscenarioDenuncia: string
{
    case REVELADA = 'revelada';
    case RESERVADA = 'reservada';
    case ANONIMO = 'anonimo';

    public static function valores(): array
    {
        return array_column(self::cases(), 'value');
    }

    public function etiqueta(): string
    {
        return match ($this) {
            self::REVELADA => 'IDENTIDAD REVELADA',
            self::RESERVADA => 'IDENTIDAD RESERVADA',
            self::ANONIMO => 'ANÓNIMO',
        };
    }
}
