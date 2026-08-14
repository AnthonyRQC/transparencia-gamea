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
                'mensaje' => 'EL JEFE DE UNIDAD AGREGO UN COMENTARIO EN DEN-2026-0001',
                'ticket' => 'DEN-2026-0001',
                'destino_url' => '/denuncias/mis-casos',
                'icono' => 'MessageCircle',
                'color' => 'info',
                'fecha' => Carbon::now()->subDays(2),
                'leida' => true,
                'fecha_leida' => Carbon::now()->subDays(1),
            ],
            // Notificaciones para nuevos tecnicos
            [
                'usuario_id' => 6,
                'tipo' => 'traspaso',
                'titulo' => 'CASO ASIGNADO',
                'mensaje' => 'DEN-2026-0044 FUE ASIGNADO A JORGE APAZA',
                'ticket' => 'DEN-2026-0044',
                'destino_url' => '/denuncias/mis-casos',
                'icono' => 'Bell',
                'color' => 'primary',
                'fecha' => Carbon::now()->subDays(2),
                'leida' => false,
            ],
            [
                'usuario_id' => 7,
                'tipo' => 'traspaso',
                'titulo' => 'CASO ASIGNADO',
                'mensaje' => 'DEN-2026-0050 FUE ASIGNADO A KARINA VILLCA',
                'ticket' => 'DEN-2026-0050',
                'destino_url' => '/denuncias/mis-casos',
                'icono' => 'Bell',
                'color' => 'primary',
                'fecha' => Carbon::now()->subDays(3),
                'leida' => false,
            ],
            [
                'usuario_id' => 8,
                'tipo' => 'traspaso',
                'titulo' => 'CASO ASIGNADO',
                'mensaje' => 'DEN-2026-0056 FUE ASIGNADO A MIGUEL CONDORI',
                'ticket' => 'DEN-2026-0056',
                'destino_url' => '/denuncias/mis-casos',
                'icono' => 'Bell',
                'color' => 'primary',
                'fecha' => Carbon::now()->subDays(1),
                'leida' => false,
            ],
            [
                'usuario_id' => 9,
                'tipo' => 'traspaso',
                'titulo' => 'CASO ASIGNADO',
                'mensaje' => 'DEN-2026-0061 FUE ASIGNADO A VERONICA MAMANI',
                'ticket' => 'DEN-2026-0061',
                'destino_url' => '/denuncias/mis-casos',
                'icono' => 'Bell',
                'color' => 'primary',
                'fecha' => Carbon::now()->subDays(4),
                'leida' => false,
            ],
            [
                'usuario_id' => 10,
                'tipo' => 'traspaso',
                'titulo' => 'CASO ASIGNADO',
                'mensaje' => 'DEN-2026-0067 FUE ASIGNADO A RODRIGO HUANCA',
                'ticket' => 'DEN-2026-0067',
                'destino_url' => '/denuncias/mis-casos',
                'icono' => 'Bell',
                'color' => 'primary',
                'fecha' => Carbon::now()->subDays(2),
                'leida' => false,
            ],
            [
                'usuario_id' => 11,
                'tipo' => 'traspaso',
                'titulo' => 'CASO ASIGNADO',
                'mensaje' => 'DEN-2026-0073 FUE ASIGNADO A CINDY LIMACHI',
                'ticket' => 'DEN-2026-0073',
                'destino_url' => '/denuncias/mis-casos',
                'icono' => 'Bell',
                'color' => 'primary',
                'fecha' => Carbon::now()->subDays(3),
                'leida' => false,
            ],
            [
                'usuario_id' => 12,
                'tipo' => 'traspaso',
                'titulo' => 'CASO ASIGNADO',
                'mensaje' => 'DEN-2026-0079 FUE ASIGNADO A PABLO SILES',
                'ticket' => 'DEN-2026-0079',
                'destino_url' => '/denuncias/mis-casos',
                'icono' => 'Bell',
                'color' => 'primary',
                'fecha' => Carbon::now()->subDays(1),
                'leida' => false,
            ],
        ];

        foreach ($notificaciones as $n) {
            Notificacion::create($n);
        }
    }
}
