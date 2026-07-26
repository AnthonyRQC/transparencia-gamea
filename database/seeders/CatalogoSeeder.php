<?php

namespace Database\Seeders;

use App\Models\CategoriaDenuncia;
use App\Models\UnidadExterna;
use App\Models\Feriado;
use App\Models\ConfiguracionSistema;
use Illuminate\Database\Seeder;

class CatalogoSeeder extends Seeder
{
    public function run(): void
    {
        $categorias = [
            ['clave' => 'cohecho', 'nombre' => 'COHECHO (SOBORNO)', 'tipo_denuncia' => 'corrupcion'],
            ['clave' => 'concusion', 'nombre' => 'CONCUSIÓN', 'tipo_denuncia' => 'corrupcion'],
            ['clave' => 'malversacion', 'nombre' => 'MALVERSACIÓN', 'tipo_denuncia' => 'corrupcion'],
            ['clave' => 'negociaciones', 'nombre' => 'NEGOCIACIONES INCOMPATIBLES', 'tipo_denuncia' => 'corrupcion'],
            ['clave' => 'enriquecimiento', 'nombre' => 'ENRIQUECIMIENTO ILÍCITO', 'tipo_denuncia' => 'corrupcion'],
            ['clave' => 'trafico', 'nombre' => 'TRÁFICO DE INFLUENCIAS', 'tipo_denuncia' => 'corrupcion'],
            ['clave' => 'peculado', 'nombre' => 'PECULADO', 'tipo_denuncia' => 'corrupcion'],
            ['clave' => 'omision', 'nombre' => 'OMISIÓN DE DENUNCIA', 'tipo_denuncia' => 'corrupcion'],
            ['clave' => 'incumplimiento', 'nombre' => 'INCUMPLIMIENTO DE DEBERES', 'tipo_denuncia' => 'corrupcion'],
            ['clave' => 'otra_corrupcion', 'nombre' => 'OTRA (CORRUPCIÓN)', 'tipo_denuncia' => 'corrupcion'],
            ['clave' => 'negacion_info', 'nombre' => 'NEGACIÓN DE INFORMACIÓN', 'tipo_denuncia' => 'negacion'],
            ['clave' => 'otra_negacion', 'nombre' => 'OTRA (NEGACIÓN)', 'tipo_denuncia' => 'negacion'],
        ];

        foreach ($categorias as $cat) {
            CategoriaDenuncia::create($cat);
        }

        $unidades = [
            ['clave' => 'sistemas', 'nombre' => 'UNIDAD DE SISTEMAS'],
            ['clave' => 'adquisiciones', 'nombre' => 'UNIDAD DE ADQUISICIONES'],
            ['clave' => 'rrhh', 'nombre' => 'RECURSOS HUMANOS'],
            ['clave' => 'transito', 'nombre' => 'TRÁNSITO'],
            ['clave' => 'catastro', 'nombre' => 'CATASTRO'],
            ['clave' => 'obras', 'nombre' => 'OBRAS PÚBLICAS'],
            ['clave' => 'ingresos', 'nombre' => 'INGRESOS'],
            ['clave' => 'secretaria', 'nombre' => 'SECRETARÍA GENERAL'],
            ['clave' => 'contrataciones', 'nombre' => 'CONTRATACIONES'],
            ['clave' => 'hacienda', 'nombre' => 'HACIENDA'],
            ['clave' => 'auditoria', 'nombre' => 'AUDITORÍA INTERNA'],
            ['clave' => 'archivo', 'nombre' => 'ARCHIVO CENTRAL'],
            ['clave' => 'min_justicia', 'nombre' => 'MINISTERIO DE JUSTICIA'],
        ];

        foreach ($unidades as $uni) {
            UnidadExterna::create($uni);
        }

        $feriados = [
            ['fecha' => '2026-01-01', 'nombre' => 'AÑO NUEVO', 'recurrente' => true],
            ['fecha' => '2026-01-22', 'nombre' => 'DÍA DEL ESTADO PLURINACIONAL', 'recurrente' => true],
            ['fecha' => '2026-02-02', 'nombre' => 'DÍA DE LA VIRGEN DE COPACABANA', 'recurrente' => true],
            ['fecha' => '2026-03-03', 'nombre' => 'CARNAVAL', 'recurrente' => true],
            ['fecha' => '2026-04-04', 'nombre' => 'CARNAVAL', 'recurrente' => true],
            ['fecha' => '2026-05-01', 'nombre' => 'DÍA DEL TRABAJO', 'recurrente' => true],
            ['fecha' => '2026-06-21', 'nombre' => 'AÑO NUEVO AYMARA', 'recurrente' => true],
            ['fecha' => '2026-08-06', 'nombre' => 'DÍA DE LA PATRIA', 'recurrente' => true],
            ['fecha' => '2026-11-02', 'nombre' => 'DÍA DE LOS DIFUNTOS', 'recurrente' => true],
            ['fecha' => '2026-12-25', 'nombre' => 'NAVIDAD', 'recurrente' => true],
            ['fecha' => '2026-07-16', 'nombre' => 'DÍA DEL DEPARTAMENTO DE LA PAZ', 'recurrente' => true],
            ['fecha' => '2026-07-24', 'nombre' => 'DÍA DE LA VIRGEN DEL CARMEN', 'recurrente' => true],
            ['fecha' => '2026-01-23', 'nombre' => 'PUENTE ESTADO PLURINACIONAL', 'recurrente' => false],
            ['fecha' => '2026-11-03', 'nombre' => 'PUENTE DIFUNTOS', 'recurrente' => false],
            ['fecha' => '2026-12-24', 'nombre' => 'PUENTE NAVIDAD', 'recurrente' => false],
        ];

        foreach ($feriados as $fer) {
            Feriado::create($fer);
        }

        ConfiguracionSistema::create([
            'clave' => 'siguiente_numero_ticket',
            'valor' => '13',
            'descripcion' => 'SIGUIENTE NÚMERO DE TICKET',
        ]);
        ConfiguracionSistema::create([
            'clave' => 'anio_vigente',
            'valor' => '2026',
            'descripcion' => 'AÑO VIGENTE DEL SISTEMA',
        ]);
    }
}
