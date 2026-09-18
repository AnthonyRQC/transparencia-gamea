<?php

namespace Database\Seeders;

use App\Models\Denuncia;
use App\Models\PrioridadPublicacion;
use App\Models\Publicacion;
use App\Models\TipoPublicacion;
use App\Models\User;
use Illuminate\Database\Seeder;

class PublicacionSeeder extends Seeder
{
    public function run(): void
    {
        $jefe = User::where('rol', 'jefe')->where('activo', true)->orderBy('id')->first();
        $tipos = TipoPublicacion::pluck('id', 'clave');
        $prioridades = PrioridadPublicacion::pluck('id', 'clave');

        if ($tipos->isEmpty() || $prioridades->isEmpty()) {
            return;
        }

        $ahora = now();
        $muestras = [
            [
                'tipo' => 'comunicado',
                'prioridad' => 'prioritario',
                'cite' => 'GAMEA/UTLCC/COM/N° 012/2026',
                'fecha_documento' => $ahora->copy()->subDays(2)->toDateString(),
                'emisor' => 'UTLCC',
                'destinatario_display' => 'POBLACIÓN EN GENERAL',
                'ref_titulo' => 'HORARIO DE ATENCIÓN AL PÚBLICO DE LA UTLCC',
                'resumen' => 'SE COMUNICA EL HORARIO DE ATENCIÓN DE LUNES A VIERNES DE 08:00 A 16:30.',
                'referencia_externa' => null,
                'denuncia_ticket' => null,
                'evento' => null,
                'fijada' => true,
                'orden' => 1,
                'publicado_hace_dias' => 2,
            ],
            [
                'tipo' => 'instructivo',
                'prioridad' => 'ordinario',
                'cite' => 'GAMEA/MAE/INST/NRO 087/2026',
                'fecha_documento' => $ahora->copy()->subDays(9)->toDateString(),
                'emisor' => 'DESPACHO ALCALDE',
                'destinatario_display' => 'TODAS LAS UNIDADES MUNICIPALES',
                'ref_titulo' => 'INSTRUCTIVO DE REMISIÓN DE INFORMACIÓN A LA UTLCC',
                'resumen' => 'PLAZO DE 10 DÍAS HÁBILES PARA RESPONDER SOLICITUDES DE INFORMACIÓN.',
                'referencia_externa' => null,
                'denuncia_ticket' => null,
                'evento' => null,
                'fijada' => false,
                'orden' => 0,
                'publicado_hace_dias' => 9,
            ],
            [
                'tipo' => 'respuesta_nota',
                'prioridad' => 'ordinario',
                'cite' => 'GAMEA/UTLCC/NE/NRO 161/2026',
                'fecha_documento' => $ahora->copy()->subDays(5)->toDateString(),
                'emisor' => 'UTLCC',
                'destinatario_display' => 'DIRECCIÓN DE TRÁNSITO',
                'ref_titulo' => 'RESPUESTA A NOTA CON REG 4521/2026',
                'resumen' => 'SE REMITE LA INFORMACIÓN SOLICITADA SOBRE EL CASO EN CURSO.',
                'referencia_externa' => 'REG 4521/2026',
                'denuncia_ticket' => null,
                'evento' => null,
                'fijada' => false,
                'orden' => 0,
                'publicado_hace_dias' => 5,
            ],
            [
                'tipo' => 'admitida',
                'prioridad' => 'ordinario',
                'cite' => 'GAMEA/UTLCC/DTR/N° 108/2026',
                'fecha_documento' => $ahora->copy()->subDays(4)->toDateString(),
                'emisor' => 'UTLCC',
                'destinatario_display' => 'SEÑOR DE IDENTIDAD RESERVADA',
                'ref_titulo' => 'COMUNICA ADMISIÓN DE DENUNCIA',
                'resumen' => 'SE ADMITIÓ LA DENUNCIA POR CUMPLIR REQUISITOS DE ADMISIBILIDAD.',
                'referencia_externa' => 'HOJA DE RUTA N° 0167/26',
                'denuncia_ticket' => 'DEN-2026-0004',
                'evento' => 'admitida',
                'fijada' => false,
                'orden' => 0,
                'publicado_hace_dias' => 4,
            ],
            [
                'tipo' => 'rechazada',
                'prioridad' => 'ordinario',
                'cite' => 'GAMEA/UTLCC/N° 075/2026',
                'fecha_documento' => $ahora->copy()->subDays(7)->toDateString(),
                'emisor' => 'UTLCC',
                'destinatario_display' => 'SEÑOR DE IDENTIDAD ANÓNIMA',
                'ref_titulo' => 'COMUNICA NO ADMISIÓN DE DENUNCIA',
                'resumen' => 'NO SE ADMITIÓ POR NO CUMPLIR REQUISITOS DE LA LEY N° 974.',
                'referencia_externa' => null,
                'denuncia_ticket' => 'DEN-2026-0005',
                'evento' => 'rechazada',
                'fijada' => false,
                'orden' => 0,
                'publicado_hace_dias' => 7,
            ],
        ];

        foreach ($muestras as $m) {
            $denuncia = $m['denuncia_ticket']
                ? Denuncia::where('ticket', $m['denuncia_ticket'])->first()
                : null;

            Publicacion::create([
                'tipo_id' => $tipos[$m['tipo']] ?? $tipos['otro'],
                'prioridad_id' => $prioridades[$m['prioridad']] ?? $prioridades['ordinario'],
                'cite' => $m['cite'],
                'fecha_documento' => $m['fecha_documento'],
                'emisor' => $m['emisor'],
                'destinatario_display' => $m['destinatario_display'],
                'ref_titulo' => $m['ref_titulo'],
                'resumen' => $m['resumen'],
                'referencia_externa' => $m['referencia_externa'],
                'denuncia_id' => $denuncia?->id,
                'evento' => $m['evento'],
                'publicado_por_id' => $jefe?->id,
                'publicado_at' => $ahora->copy()->subDays($m['publicado_hace_dias']),
                'fijada' => $m['fijada'],
                'orden' => $m['orden'],
            ]);
        }
    }
}
