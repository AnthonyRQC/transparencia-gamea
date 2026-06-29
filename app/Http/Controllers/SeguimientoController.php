<?php

namespace App\Http\Controllers;

use App\Data\DenunciaData;
use App\Data\SolicitudData;
use App\Data\DescargoData;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SeguimientoController extends Controller
{
    public function buscar(Request $request)
    {
        $query = $request->query('ticket', '');

        if (empty($query)) {
            return Inertia::render('Seguimiento/Buscar', [
                'encontrado' => false,
                'denuncia' => null,
                'error' => null,
            ]);
        }

        if (!preg_match('/^DEN-\d{4}-\d{4}-\d{4}$/', $query)) {
            return Inertia::render('Seguimiento/Buscar', [
                'encontrado' => false,
                'denuncia' => null,
                'error' => 'invalido',
            ]);
        }

        $parts = explode('-', $query);
        $ticket = 'DEN-' . $parts[1] . '-' . $parts[2];
        $token = $parts[3];

        $denuncia = DenunciaData::findByTicketAndToken($ticket, $token);

        if (!$denuncia) {
            return Inertia::render('Seguimiento/Buscar', [
                'encontrado' => false,
                'denuncia' => null,
                'error' => 'no_encontrado',
            ]);
        }

        return Inertia::render('Seguimiento/Buscar', [
            'encontrado' => true,
            'denuncia' => self::mapPublicData($denuncia),
            'error' => null,
        ]);
    }

    private static function mapPublicData(array $d): array
    {
        $estadoLegible = [
            'ingresada' => 'En evaluación inicial',
            'admitida' => 'Admitida',
            'asignada' => 'En investigación',
            'investigacion' => 'En investigación',
            'informe' => 'Informe Final',
            'cerrada' => 'Cerrada',
            'rechazada' => 'Rechazada',
        ];

        $estado = $d['estado'] ?? '';

        $pasos = [
            'recepcion' => false,
            'evaluacion' => false,
            'investigacion' => false,
            'resolucion' => false,
            'rechazada' => false,
        ];

        if ($estado === 'rechazada') {
            $pasos['recepcion'] = true;
            $pasos['rechazada'] = true;
        } else {
            $pasos['recepcion'] = true;
            if (in_array($estado, ['admitida', 'asignada', 'investigacion', 'informe', 'cerrada'])) {
                $pasos['evaluacion'] = true;
            }
            if (in_array($estado, ['investigacion', 'informe', 'cerrada'])) {
                $pasos['investigacion'] = true;
            }
            if ($estado === 'cerrada') {
                $pasos['resolucion'] = true;
            }
        }

        $plazoInfo = DenunciaData::getPlazoInfo($d);
        $fechaEstimada = null;
        $plazoTotal = null;
        if ($plazoInfo) {
            $fechaEstimada = $plazoInfo['fecha_vencimiento'] ?? null;
            $plazoTotal = DenunciaData::getPlazoDias($d['tipo'] ?? '');
        }

        return [
            'ticket' => $d['ticket'] ?? '',
            'tipo' => $d['tipo'] ?? '',
            'tipo_legible' => $d['tipo'] === 'corrupcion' ? 'Corrupción' : ($d['tipo'] === 'negacion' ? 'Negación de Información' : ($d['tipo'] ?? '')),
            'estado' => $estado,
            'estado_legible' => $estadoLegible[$estado] ?? $estado,
            'fecha_ingreso' => $d['created_at'] ?? null,
            'fecha_vencimiento' => $fechaEstimada,
            'plazo_total_dias' => $plazoTotal,
            'mensaje_avance' => self::getMensajeAvance($d),
            'pasos' => $pasos,
            'resumen_rechazo' => $d['resumen_rechazo'] ?? null,
            'clasificacion' => $d['informe_clasificacion'] ?? null,
            'fecha_cierre' => $d['cierre_cerrado_at'] ?? null,
        ];
    }

    private static function getMensajeAvance(array $d): string
    {
        $estado = $d['estado'] ?? '';

        $mensajes = [
            'ingresada' => 'Su denuncia fue recibida y se encuentra en evaluación inicial. La UTLCC tiene un plazo máximo de 5 días hábiles para admitirla o rechazarla.',
            'admitida' => 'Su denuncia ha sido admitida y está siendo preparada para asignarse a un equipo técnico.',
            'asignada' => 'Su denuncia ha sido asignada a un equipo técnico. La investigación se iniciará en los próximos días.',
            'informe' => 'La investigación ha concluido. Se está redactando el Informe Final que será remitido a la Máxima Autoridad Institucional.',
        ];

        if (isset($mensajes[$estado])) {
            return $mensajes[$estado];
        }

        if ($estado === 'investigacion') {
            $ticket = $d['ticket'] ?? '';
            $solicitudes = SolicitudData::getByTicket($ticket);
            $descargos = DescargoData::getByTicket($ticket);

            $tieneSolicitudes = collect($solicitudes)->filter(fn($s) => !($s['eliminado'] ?? false))->count() > 0;
            $tieneDescargosNotificados = collect($descargos)->filter(fn($d2) => !($d2['eliminado'] ?? false) && in_array($d2['estado'] ?? '', ['notificado', 'respondido', 'ampliado']))->count() > 0;

            if ($tieneSolicitudes) {
                return 'Su denuncia está siendo investigada. Se realizaron solicitudes de información a unidades externas.';
            }
            if ($tieneDescargosNotificados) {
                return 'Su denuncia está siendo investigada. Se notificó a las personas denunciadas para que presenten sus descargos.';
            }
            return 'Su denuncia está siendo investigada por la UTLCC.';
        }

        if ($estado === 'cerrada') {
            $clasificacionLabels = [
                'penal' => 'Penal',
                'civil' => 'Civil',
                'administrativo' => 'Administrativo',
                'sin_indicios' => 'Sin Indicios',
                'medida_correctiva' => 'Medida Correctiva',
                'archivado' => 'Archivado',
            ];
            $clasif = $d['informe_clasificacion'] ?? '';
            $label = $clasificacionLabels[$clasif] ?? '';
            $clasifStr = $label ? " ({$label})" : '';
            return "Su denuncia ha sido cerrada{$clasifStr}. Para más información, acérquese a la oficina de la UTLCC.";
        }

        if ($estado === 'rechazada') {
            $resumen = $d['resumen_rechazo'] ?? null;
            if ($resumen) {
                return "Su denuncia no fue admitida. {$resumen}";
            }
            return 'Su denuncia no fue admitida por no cumplir los requisitos establecidos en la Ley N° 974.';
        }

        return 'Su denuncia se encuentra en proceso.';
    }
}
