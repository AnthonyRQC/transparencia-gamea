<?php

namespace App\Enums;

enum EstadoDenuncia: string
{
    case INGRESADA = 'ingresada';
    case EVALUACION_TECNICA = 'evaluacion_tecnica';
    case ADMITIDA = 'admitida';
    case RECHAZADA = 'rechazada';
    case ASIGNADA = 'asignada';
    case INVESTIGACION = 'investigacion';
    case INFORME = 'informe';
    case CERRADA = 'cerrada';

    // Subestado
    case ARCHIVADA = 'archivada';

    public static function terminales(): array
    {
        return [self::RECHAZADA, self::CERRADA];
    }

    public static function valores(): array
    {
        return array_column(self::cases(), 'value');
    }

    public function etiqueta(): string
    {
        return match ($this) {
            self::INGRESADA => 'INGRESADA',
            self::EVALUACION_TECNICA => 'EVALUACIÓN TÉCNICA',
            self::ADMITIDA => 'ADMITIDA',
            self::RECHAZADA => 'RECHAZADA',
            self::ASIGNADA => 'ASIGNADA',
            self::INVESTIGACION => 'INVESTIGACIÓN',
            self::INFORME => 'INFORME',
            self::CERRADA => 'CERRADA',
            self::ARCHIVADA => 'CERRADA · ARCHIVADA',
        };
    }
}
