<?php

namespace App\Services;

/**
 * Username convencional (Sprint 18A, D21): 1ª letra del 1er nombre +
 * 1ª del 1er apellido + CI. Autogenerado e inmutable.
 * Ej: ANTHONY QUISPE + 997788878 → AQ997788878.
 */
class UsernameGenerator
{
    public static function normalizarCi(string $ci): string
    {
        return mb_strtoupper(preg_replace('/\s+/', '', trim($ci)) ?? '');
    }

    public static function normalizarNombre(string $valor): string
    {
        return mb_strtoupper(preg_replace('/\s+/', ' ', trim($valor)) ?? '');
    }

    public static function para(string $nombres, string $apellidos, string $ci): string
    {
        $n = preg_split('/\s+/', self::normalizarNombre($nombres));
        $a = preg_split('/\s+/', self::normalizarNombre($apellidos));

        $i1 = mb_substr($n[0] ?? '', 0, 1);
        $i2 = mb_substr($a[0] ?? '', 0, 1);

        return $i1 . $i2 . self::normalizarCi($ci);
    }
}
