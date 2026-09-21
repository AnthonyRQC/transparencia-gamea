<?php

namespace App\Services;

use App\Models\ConfiguracionSistema;

class CatalogoConfigStore
{
    public static function getConfigArray(string $clave): array
    {
        return ConfiguracionSistema::catalogItems($clave);
    }

    public static function setConfigArray(string $clave, array $items): void
    {
        $config = ConfiguracionSistema::where('clave', $clave)->first();
        if ($config) {
            $config->update(['valor' => json_encode($items)]);
        } else {
            ConfiguracionSistema::create([
                'clave' => $clave,
                'valor' => json_encode($items),
                'descripcion' => 'CATÁLOGO: ' . str_replace('_', ' ', $clave),
            ]);
        }
    }
}
