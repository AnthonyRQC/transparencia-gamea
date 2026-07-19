<?php

namespace App\Helpers;

use Illuminate\Support\Str;

class UppercaseText
{
    /**
     * Convierte a MAYÚSCULAS los campos de texto libre indicados.
     * Convención institucional: todos los textos libres se almacenan en mayúsculas.
     *
     * Excluir del listado: email, ticket, token_consulta, password, URLs, paths, enum values.
     */
    public static function apply(array $data, array $fields): array
    {
        foreach ($fields as $field) {
            if (isset($data[$field]) && is_string($data[$field]) && $data[$field] !== '') {
                $data[$field] = Str::upper($data[$field]);
            }
        }
        return $data;
    }

    /**
     * Convierte un único string a MAYÚSCULAS si no es null.
     */
    public static function value(?string $text): ?string
    {
        return $text === null ? null : Str::upper($text);
    }
}
