<?php

namespace App\Http\Middleware;

use Carbon\Carbon;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Time Machine (solo entorno local).
 *
 * Si hay fecha simulada en sesión (o ?sim_fecha=YYYY-MM-DD),
 * fija Carbon::setTestNow() para TODO el request: DiasHabiles,
 * Denuncia::calcularVencimiento(), plazo_info de solicitudes/descargos,
 * KPIs del dashboard y AlertasPlazo derivadas responden a la fecha simulada
 * sin tocar la BD.
 */
class SimularFecha
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($q = $request->query('sim_fecha')) {
            if (app()->isLocal()) {
                session(['dev_sim_fecha' => $q]);
            }
        }

        $sim = session('dev_sim_fecha');

        if ($sim && app()->isLocal()) {
            try {
                Carbon::setTestNow(Carbon::parse($sim, 'America/La_Paz'));
            } catch (\Throwable) {
                session()->forget('dev_sim_fecha');
                Carbon::setTestNow(null);
            }
        }

        return $next($request);
    }
}
