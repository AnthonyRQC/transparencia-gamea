<?php

namespace App\Services;

use App\Models\Denuncia;
use App\Models\Descargo;
use App\Models\SolicitudInformacion;
use App\Models\User;
use Carbon\Carbon;

/**
 * Alertas derivadas (vivas, no persistidas).
 *
 * Replica la generación derivada del Sprint 9 sobre Eloquent + DiasHabiles:
 * cada visita calcula avisos desde el estado actual (respeta fecha simulada
 * del Time Machine vía Carbon::setTestNow). No escribe en BD.
 *
 * Umbrales (defaults Sprint 6.5, configurables en Sprint 18):
 *  - plazo total / informe: ≤3d por vencer, <0 vencido
 *  - solicitud / descargo: ≤2d por vencer, <0 vencido
 */
class AlertasPlazo
{
    public const UMBRAL_PLAZO = 3;
    public const UMBRAL_SOLICITUD = 2;
    public const UMBRAL_DESCARGO = 2;

    /**
     * @return array<int, array{tipo:string,titulo:string,mensaje:string,ticket:string|null,destino_url:string,icono:string,color:string,leida:bool,fecha_leida:null,fecha:string,id:int,efimera:bool}>
     */
    public static function paraUsuario(User $user): array
    {
        if ($user->rol === 'registrador') {
            return [];
        }

        $esJefe = $user->rol === 'jefe';
        $destino = $esJefe ? '/denuncias' : '/denuncias/mis-casos';
        $ahora = Carbon::now('America/La_Paz')->toDateTimeString();
        $alertas = [];

        // --- Plazo total de denuncias activas ---
        $denuncias = Denuncia::whereNotIn('estado', ['rechazada', 'cerrada'])
            ->when(! $esJefe, fn ($q) => $q->where('tecnico_id', $user->id))
            ->with('ampliaciones')
            ->limit(100)
            ->get();

        foreach ($denuncias as $d) {
            $plazo = $d->plazo;
            if (! $plazo) {
                continue;
            }
            $dias = $plazo['dias_restantes'];
            if ($dias < 0) {
                $alertas[] = self::aviso(
                    'plazo_vencido', 'PLAZO VENCIDO',
                    "{$d->ticket} · VENCIDO HACE " . abs($dias) . ' DÍA(S)',
                    $d->ticket, $destino, 'AlertTriangle', 'destructive', $ahora
                );
            } elseif ($dias <= self::UMBRAL_PLAZO) {
                $cuando = $dias === 0 ? 'VENCE HOY' : "VENCE EN {$dias} DÍA(S)";
                $alertas[] = self::aviso(
                    'plazo_por_vencer', 'PLAZO POR VENCER',
                    "{$d->ticket} · {$cuando}",
                    $d->ticket, $destino, 'Clock', 'warning', $ahora
                );
            }

            if ($d->estado === 'informe' && $dias >= 0 && $dias <= self::UMBRAL_PLAZO) {
                $alertas[] = self::aviso(
                    'plazo_informe', 'PLAZO DE INFORME POR VENCER',
                    "{$d->ticket} · PRESENTA EL INFORME, QUEDAN {$dias} DÍA(S)",
                    $d->ticket, $destino, 'FileText', 'warning', $ahora
                );
            }
        }

        // --- Solicitudes pendientes ---
        $solicitudes = SolicitudInformacion::whereIn('estado', ['pendiente', 'ampliada'])
            ->whereNull('fecha_eliminacion')
            ->when(! $esJefe, fn ($q) => $q->whereHas(
                'denuncia',
                fn ($dq) => $dq->where('tecnico_id', $user->id)->whereNotIn('estado', ['rechazada', 'cerrada'])
            ))
            ->with('denuncia:id,ticket')
            ->limit(50)
            ->get();

        foreach ($solicitudes as $s) {
            $info = $s->plazo_info;
            if (! $info) {
                continue;
            }
            $dias = $info['dias_restantes'];
            $ticket = $s->denuncia?->ticket ?? '';
            if ($dias < 0 || ($dias <= self::UMBRAL_SOLICITUD)) {
                $msg = $dias < 0
                    ? "{$ticket} · SOLICITUD VENCIDA HACE " . abs($dias) . ' DÍA(S)'
                    : "{$ticket} · SOLICITUD VENCE EN {$dias} DÍA(S)";
                $alertas[] = self::aviso(
                    'solicitud_vence', 'SOLICITUD POR VENCER', $msg,
                    $ticket ?: null, $destino, 'MailQuestion', $dias < 0 ? 'destructive' : 'warning', $ahora
                );
            }
        }

        // --- Descargos notificados ---
        $descargos = Descargo::whereIn('estado', ['notificado', 'ampliado'])
            ->whereNull('fecha_eliminacion')
            ->when(! $esJefe, fn ($q) => $q->whereHas(
                'denuncia',
                fn ($dq) => $dq->where('tecnico_id', $user->id)->whereNotIn('estado', ['rechazada', 'cerrada'])
            ))
            ->with('denuncia:id,ticket')
            ->limit(50)
            ->get();

        foreach ($descargos as $dc) {
            $info = $dc->plazo_info;
            if (! $info) {
                continue;
            }
            $dias = $info['dias_restantes'];
            $ticket = $dc->denuncia?->ticket ?? '';
            if ($dias < 0 || ($dias <= self::UMBRAL_DESCARGO)) {
                $msg = $dias < 0
                    ? "{$ticket} · DESCARGO VENCIDO HACE " . abs($dias) . ' DÍA(S)'
                    : "{$ticket} · DESCARGO VENCE EN {$dias} DÍA(S)";
                $alertas[] = self::aviso(
                    'descargo_vence', 'DESCARGO POR VENCER', $msg,
                    $ticket ?: null, $destino, 'MessageSquareWarning', $dias < 0 ? 'destructive' : 'warning', $ahora
                );
            }
        }

        return array_slice($alertas, 0, 10);
    }

    private static function aviso(
        string $tipo, string $titulo, string $mensaje, ?string $ticket,
        string $destino, string $icono, string $color, string $fecha
    ): array {
        return [
            'id' => -abs(crc32($tipo . '|' . ($ticket ?? '') . '|' . $mensaje)),
            'tipo' => $tipo,
            'titulo' => $titulo,
            'mensaje' => $mensaje,
            'ticket' => $ticket,
            'destino_url' => $destino . ($ticket ? "?destacar={$ticket}" : ''),
            'icono' => $icono,
            'color' => $color,
            'leida' => false,
            'fecha_leida' => null,
            'fecha' => $fecha,
            'efimera' => true,
        ];
    }
}
