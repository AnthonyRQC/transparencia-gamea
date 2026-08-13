<?php

namespace App\Http\Controllers;

use App\Models\Notificacion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\StreamedResponse;

class NotificacionStreamController extends Controller
{
    /**
     * Endpoint SSE (Server-Sent Events) para notificaciones en tiempo real.
     *
     * El cliente abre una conexión con EventSource('/notifications/stream').
     * Este loop consulta la BD cada POLL_INTERVAL segundos y emite un evento
     * solo cuando detecta cambios en el conteo de notificaciones no leídas.
     *
     * Diseño:
     * - Máximo MAX_DURATION segundos por conexión (luego el cliente reconecta automáticamente)
     * - Solo una query COUNT(*) por iteración (trivial con índice en usuario_id + leida)
     * - Si el count cambió, trae las últimas 5 notificaciones (segunda query ligera)
     * - ignore_user_abort(false): el loop termina limpiamente si el cliente cierra la pestaña
     */
    private const POLL_INTERVAL = 15;   // segundos entre cada consulta
    private const MAX_DURATION   = 90;  // segundos máximos por conexión SSE

    public function stream(Request $request): StreamedResponse
    {
        $userId = Auth::id();

        return new StreamedResponse(function () use ($userId) {
            // Deshabilitar buffering de salida para que los eventos lleguen inmediatamente
            if (ob_get_level() > 0) {
                ob_end_flush();
            }

            // Detener el loop si el cliente cierra la conexión
            ignore_user_abort(false);

            // Sin límite de tiempo PHP para este script (lo controlamos con MAX_DURATION)
            set_time_limit(0);

            $startTime      = time();
            $lastCount      = -1; // -1 fuerza el envío inicial
            $heartbeatTick  = 0;

            while (true) {
                // Verificar si el cliente desconectó
                if (connection_aborted()) {
                    break;
                }

                // Verificar si se alcanzó el tiempo máximo de la conexión
                if ((time() - $startTime) >= self::MAX_DURATION) {
                    // Enviar evento especial para que el cliente sepa que debe reconectar
                    echo "event: reconnect\n";
                    echo "data: {}\n\n";
                    flush();
                    break;
                }

                // Consulta ligera: solo COUNT(*)
                $currentCount = Notificacion::where('usuario_id', $userId)
                    ->where('leida', false)
                    ->count();

                if ($currentCount !== $lastCount) {
                    // Hay cambio — traer las últimas 5 notificaciones
                    $recientes = Notificacion::where('usuario_id', $userId)
                        ->latest('fecha')
                        ->take(5)
                        ->get(['id', 'tipo', 'titulo', 'mensaje', 'ticket', 'destino_url', 'leida', 'fecha_leida', 'fecha', 'icono', 'color'])
                        ->toArray();

                    $payload = json_encode([
                        'no_leidas' => $currentCount,
                        'recientes' => $recientes,
                        'previo'    => $lastCount, // para que el frontend sepa cuántas son nuevas
                    ]);

                    echo "event: notificaciones\n";
                    echo "data: {$payload}\n\n";
                    flush();

                    $lastCount = $currentCount;
                }

                // Heartbeat cada 30s para mantener la conexión viva (evita timeouts de proxy/nginx)
                $heartbeatTick++;
                if ($heartbeatTick >= (30 / self::POLL_INTERVAL)) {
                    echo ": heartbeat\n\n";
                    flush();
                    $heartbeatTick = 0;
                }

                sleep(self::POLL_INTERVAL);
            }
        }, 200, [
            'Content-Type'      => 'text/event-stream',
            'Cache-Control'     => 'no-cache, no-store, must-revalidate',
            'X-Accel-Buffering' => 'no', // Nginx: deshabilitar buffering
            'Connection'        => 'keep-alive',
        ]);
    }
}
