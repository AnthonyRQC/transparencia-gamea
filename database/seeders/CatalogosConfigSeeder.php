<?php

namespace Database\Seeders;

use App\Models\ConfiguracionSistema;
use Illuminate\Database\Seeder;

class CatalogosConfigSeeder extends Seeder
{
    public static function run(): void
    {
        $catalogos = [
            'catalogo_tipos_denuncia' => [
                'descripcion' => 'TIPOS DE DENUNCIA',
                'items' => [
                    ['id' => 1, 'clave' => 'corrupcion', 'nombre' => 'CORRUPCIÓN', 'activo' => true],
                    ['id' => 2, 'clave' => 'negacion', 'nombre' => 'NEGACIÓN DE INFORMACIÓN', 'activo' => true],
                ],
            ],
            'catalogo_estados' => [
                'descripcion' => 'ESTADOS DEL PROCESO DE DENUNCIA',
                'items' => [
                    ['id' => 1, 'clave' => 'ingresada', 'nombre' => 'INGRESADA', 'activo' => true],
                    ['id' => 2, 'clave' => 'evaluacion_tecnica', 'nombre' => 'EVALUACIÓN TÉCNICA', 'activo' => true],
                    ['id' => 3, 'clave' => 'admitida', 'nombre' => 'ADMITIDA', 'activo' => true],
                    ['id' => 4, 'clave' => 'rechazada', 'nombre' => 'RECHAZADA', 'activo' => true],
                    ['id' => 5, 'clave' => 'asignada', 'nombre' => 'ASIGNADA', 'activo' => true],
                    ['id' => 6, 'clave' => 'investigacion', 'nombre' => 'INVESTIGACIÓN', 'activo' => true],
                    ['id' => 7, 'clave' => 'informe', 'nombre' => 'INFORME', 'activo' => true],
                    ['id' => 8, 'clave' => 'cerrada', 'nombre' => 'CERRADA', 'activo' => true],
                ],
            ],
        ];

        foreach ($catalogos as $clave => $config) {
            ConfiguracionSistema::updateOrCreate(
                ['clave' => $clave],
                [
                    'valor' => json_encode($config['items']),
                    'descripcion' => $config['descripcion'],
                ]
            );
        }
    }
}
