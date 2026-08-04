<?php

namespace Database\Seeders;

use App\Models\ConfiguracionSistema;
use Illuminate\Database\Seeder;

class CatalogosConfigSeeder extends Seeder
{
    public static function run(): void
    {
        $catalogos = [
            'catalogo_clasificaciones' => [
                'descripcion' => 'CLASIFICACIONES FINALES PARA INFORME',
                'items' => [
                    ['id' => 1, 'clave' => 'penal', 'nombre' => 'PENAL', 'activo' => true],
                    ['id' => 2, 'clave' => 'civil', 'nombre' => 'CIVIL', 'activo' => true],
                    ['id' => 3, 'clave' => 'administrativo', 'nombre' => 'ADMINISTRATIVO', 'activo' => true],
                    ['id' => 4, 'clave' => 'sin_indicios', 'nombre' => 'SIN INDICIOS', 'activo' => true],
                    ['id' => 5, 'clave' => 'medida_correctiva', 'nombre' => 'MEDIDA CORRECTIVA', 'activo' => true],
                    ['id' => 6, 'clave' => 'archivado', 'nombre' => 'ARCHIVADO', 'activo' => true],
                ],
            ],
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
            'catalogo_medios_notificacion' => [
                'descripcion' => 'MEDIOS DE NOTIFICACIÓN DE DESCARGOS',
                'items' => [
                    ['id' => 1, 'clave' => 'whatsapp', 'nombre' => 'WHATSAPP', 'activo' => true],
                    ['id' => 2, 'clave' => 'email', 'nombre' => 'EMAIL', 'activo' => true],
                    ['id' => 3, 'clave' => 'presencial', 'nombre' => 'PRESENCIAL', 'activo' => true],
                    ['id' => 4, 'clave' => 'otro', 'nombre' => 'OTRO', 'activo' => true],
                ],
            ],
            'catalogo_tipos_prueba' => [
                'descripcion' => 'TIPOS DE PRUEBA EN DENUNCIAS',
                'items' => [
                    ['id' => 1, 'nombre' => 'ARCHIVO', 'activo' => true],
                    ['id' => 2, 'nombre' => 'PRUEBA FÍSICA', 'activo' => true],
                    ['id' => 3, 'nombre' => 'TESTIGO', 'activo' => true],
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
