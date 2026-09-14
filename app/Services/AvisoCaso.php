<?php

namespace App\Services;

use App\Models\Denuncia;
use App\Models\PrioridadPublicacion;
use App\Models\Publicacion;
use App\Models\TipoPublicacion;

/**
 * Borradores de avisos ligados a casos (Sprint 13.3).
 * Idempotente por (denuncia_id, evento). Nunca publica: solo borrador.
 */
class AvisoCaso
{
    private const TIPO_POR_EVENTO = [
        'admitida' => 'admitida',
        'rechazada' => 'rechazada',
        'cerrada' => 'cierre_caso',
    ];

    private const TITULO_POR_EVENTO = [
        'admitida' => 'COMUNICA ADMISIÓN DE DENUNCIA',
        'rechazada' => 'COMUNICA NO ADMISIÓN DE DENUNCIA',
        'cerrada' => 'COMUNICA CIERRE DE DENUNCIA',
    ];

    public static function borradorPara(Denuncia $denuncia, string $evento, array $extras = []): ?Publicacion
    {
        if (!in_array($evento, Publicacion::EVENTOS_CASO, true)) {
            return null;
        }

        $existente = Publicacion::where('denuncia_id', $denuncia->id)
            ->where('evento', $evento)
            ->first();
        if ($existente) {
            return $existente;
        }

        $tipo = TipoPublicacion::where('clave', self::TIPO_POR_EVENTO[$evento])->first();
        $prioridad = PrioridadPublicacion::where('clave', 'ordinario')->first();

        if (!$tipo || !$prioridad) {
            return null;
        }

        return Publicacion::create([
            'tipo_id' => $tipo->id,
            'prioridad_id' => $prioridad->id,
            'fecha_documento' => now()->toDateString(),
            'destinatario_display' => self::destinatario($denuncia),
            'ref_titulo' => (self::TITULO_POR_EVENTO[$evento] ?? 'COMUNICA ESTADO DE DENUNCIA') . ' ' . $denuncia->ticket,
            'resumen' => !empty($extras['resumen']) ? $extras['resumen'] : self::resumen($denuncia, $evento),
            'referencia_externa' => $extras['referencia_externa'] ?? null,
            'denuncia_id' => $denuncia->id,
            'evento' => $evento,
            'publicado_por_id' => null,
            'publicado_at' => null,
            'fijada' => false,
            'orden' => 0,
        ]);
    }

    /**
     * Eventos publicados por ticket: ['TICKET' => ['admitida', ...]].
     * Base del indicador "Sin aviso" (banner Sheet + badge cards).
     */
    public static function publicadosPorTicket(array $tickets): array
    {
        if (empty($tickets)) {
            return [];
        }

        return Publicacion::whereIn('denuncia_id', function ($q) use ($tickets) {
                $q->select('id')->from('denuncias')->whereIn('ticket', $tickets);
            })
            ->whereNotNull('publicado_at')
            ->whereNotNull('evento')
            ->join('denuncias', 'denuncias.id', '=', 'publicaciones.denuncia_id')
            ->pluck('publicaciones.evento', 'denuncias.ticket')
            ->groupBy(fn($evento, $ticket) => $ticket)
            ->map(fn($eventos) => $eventos->values()->toArray())
            ->toArray();
    }

    private static function destinatario(Denuncia $denuncia): string
    {
        return match ($denuncia->escenario) {
            'anonimo' => 'SEÑOR DE IDENTIDAD ANÓNIMA',
            'reservada' => 'SEÑOR DE IDENTIDAD RESERVADA',
            default => mb_strtoupper($denuncia->denunciante?->nombres ?? 'SEÑOR DE IDENTIDAD RESERVADA'),
        };
    }

    private static function resumen(Denuncia $denuncia, string $evento): string
    {
        return match ($evento) {
            'admitida' => "SE ADMITIÓ LA DENUNCIA {$denuncia->ticket} POR CUMPLIR REQUISITOS DE ADMISIBILIDAD.",
            'rechazada' => $denuncia->resumen_rechazo
                ?: "NO SE ADMITIÓ LA DENUNCIA {$denuncia->ticket} POR NO CUMPLIR REQUISITOS DE LA LEY N° 974.",
            'cerrada' => 'CASO ' . $denuncia->ticket . ' CERRADO'
                . ($denuncia->informe?->clasificacionRel?->nombre ? ' CON CLASIFICACIÓN ' . $denuncia->informe->clasificacionRel->nombre : '')
                . '.',
            default => "AVISO SOBRE LA DENUNCIA {$denuncia->ticket}.",
        };
    }
}
