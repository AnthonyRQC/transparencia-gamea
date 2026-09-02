<?php

namespace App\Enums;

enum TipoDenuncia: string
{
    case CORRUPCION = 'corrupcion';
    case NEGACION = 'negacion';

    public static function valores(): array
    {
        return array_column(self::cases(), 'value');
    }

    public function etiqueta(): string
    {
        return match ($this) {
            self::CORRUPCION => 'CORRUPCIÓN',
            self::NEGACION => 'NEGACIÓN DE INFORMACIÓN',
        };
    }

    public function diasBase(): int
    {
        return match ($this) {
            self::CORRUPCION => 45,
            self::NEGACION => 20,
        };
    }
}
