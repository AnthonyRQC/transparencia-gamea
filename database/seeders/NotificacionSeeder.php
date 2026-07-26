<?php

namespace Database\Seeders;

use App\Models\Notificacion;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class NotificacionSeeder extends Seeder
{
    public function run(): void
    {
        $notificaciones = [
            [
                'usuario_id' => 3,
                'tipo' => 'traspaso',
                'titulo' => 'CASO TRASPASADO',
                'mensaje' => 'DEN-2026-0006 FUE ASIGNADO A CARLOS QUISPE',
                'ticket' => 'DEN-2026-0006',
                'destino_url' => '/denuncias/mis-casos',
                'icono' => 'Bell',
                'color' => 'primary',
                'fecha' => Carbon::now()->subDays(5),
                'leida' => false,
            ],
            [
                'usuario_id' => 4,
                'tipo' => 'traspaso',
                'titulo' => 'CASO TRASPASADO',
                'mensaje' => 'DEN-2026-0007 FUE ASIGNADO A ANA TORRES',
                'ticket' => 'DEN-2026-0007',
                'destino_url' => '/denuncias/mis-casos',
                'icono' => 'Bell',
                'color' => 'primary',
                'fecha' => Carbon::now()->subDays(4),
                'leida' => false,
            ],
            [
                'usuario_id' => 1,
                'tipo' => 'plazo_por_vencer',
                'titulo' => 'PLAZO POR VENCER',
                'mensaje' => 'EL PLAZO DE ADMISIÓN DE DEN-2026-0003 VENCE EN 2 DÍAS',
                'ticket' => 'DEN-2026-0003',
                'destino_url' => '/denuncias',
                'icono' => 'Timer',
                'color' => 'warning',
                'fecha' => Carbon::now()->subDays(1),
                'leida' => true,
                'fecha_leida' => Carbon::now()->subHours(12),
            ],
            [
                'usuario_id' => 5,
                'tipo' => 'plazo_informe',
                'titulo' => 'PLAZO DE INFORME POR VENCER',
                'mensaje' => 'EL PLAZO PARA PRESENTAR INFORME DE DEN-2026-0010 VENCE EN 3 DÍAS',
                'ticket' => 'DEN-2026-0010',
                'destino_url' => '/denuncias/mis-casos',
                'icono' => 'FileText',
                'color' => 'warning',
                'fecha' => Carbon::now()->subDays(1),
                'leida' => false,
            ],
            [
                'usuario_id' => 3,
                'tipo' => 'sistema',
                'titulo' => 'NUEVO COMENTARIO',
                'mensaje' => 'EL JEFE DE UNIDAD AGREGÓ UN COMENTARIO EN DEN-2026-0001',
                'ticket' => 'DEN-2026-0001',
                'destino_url' => '/denuncias/mis-casos',
                'icono' => 'MessageCircle',
                'color' => 'info',
                'fecha' => Carbon::now()->subDays(2),
                'leida' => true,
                'fecha_leida' => Carbon::now()->subDays(1),
            ],
        ];

        foreach ($notificaciones as $n) {
            Notificacion::create($n);
        }
    }
}
