<?php

namespace App\Http\Controllers;

use App\Models\Clasificacion;
use App\Models\Descargo;
use App\Models\SolicitudInformacion;
use App\Models\Denuncia;
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

        $denuncia = Denuncia::where('ticket', $ticket)
            ->where('token_consulta', $token)
            ->with(['informe.clasificacionRel', 'cierre.medioNotificacion'])
            ->first();

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

    private static function mapPublicData(Denuncia $d): array
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

        $estado = $d->estado ?? '';

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

        $tieneSolicitudes = $d->solicitudes()->whereNull('fecha_eliminacion')->count() > 0;
        $tieneDescargos = $d->descargos()->whereNull('fecha_eliminacion')->whereIn('estado', ['notificado', 'respondido', 'ampliado'])->count() > 0;

        return [
            'ticket' => $d->ticket ?? '',
            'tipo' => $d->tipo ?? '',
            'tipo_legible' => $d->tipo === 'corrupcion' ? 'Corrupción' : ($d->tipo === 'negacion' ? 'Negación de Información' : ($d->tipo ?? '')),
            'estado' => $estado,
            'estado_legible' => $estadoLegible[$estado] ?? $estado,
            'fecha_ingreso' => $d->created_at?->toDateTimeString(),
            'fecha_vencimiento' => null,
            'plazo_total_dias' => $d->tipo === 'corrupcion' ? 45 : 20,
            'mensaje_avance' => self::getMensajeAvance($d, $tieneSolicitudes, $tieneDescargos),
            'pasos' => $pasos,
            'resumen_rechazo' => $d->resumen_rechazo ?? null,
            'clasificacion' => $d->informe?->clasificacion ?? null,
            'fecha_cierre' => $d->cierre?->cerrado_at?->toDateTimeString(),
        ];
    }

    private static function getMensajeAvance(Denuncia $d, bool $tieneSolicitudes, bool $tieneDescargos): string
    {
        $estado = $d->estado ?? '';

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
            if ($tieneSolicitudes) {
                return 'Su denuncia está siendo investigada. Se realizaron solicitudes de información a unidades externas.';
            }
            if ($tieneDescargos) {
                return 'Su denuncia está siendo investigada. Se notificó a las personas denunciadas para que presenten sus descargos.';
            }
            return 'Su denuncia está siendo investigada por la UTLCC.';
        }

        if ($estado === 'cerrada') {
            $clasif = $d->informe?->clasificacion ?? '';
            $label = self::clasificacionLabel($clasif);
            $clasifStr = $label ? " ({$label})" : '';
            return "Su denuncia ha sido cerrada{$clasifStr}. Para más información, acérquese a la oficina de la UTLCC.";
        }

        if ($estado === 'rechazada') {
            $resumen = $d->resumen_rechazo ?? null;
            if ($resumen) {
                return "Su denuncia no fue admitida. {$resumen}";
            }
            return 'Su denuncia no fue admitida por no cumplir los requisitos establecidos en la Ley N° 974.';
        }

        return 'Su denuncia se encuentra en proceso.';
    }

    private static function clasificacionLabel(string $clave): string
    {
        if ($clave === '') {
            return '';
        }

        $clasificacion = Clasificacion::where('clave', $clave)->first();
        if ($clasificacion) {
            return $clasificacion->nombre;
        }

        $fallback = [
            'penal' => 'Penal',
            'civil' => 'Civil',
            'administrativo' => 'Administrativo',
            'sin_indicios' => 'Sin Indicios',
            'medida_correctiva' => 'Medida Correctiva',
            'archivado' => 'Archivado',
        ];

        return $fallback[$clave] ?? $clave;
    }
}
