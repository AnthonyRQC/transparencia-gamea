<?php

namespace App\Http\Controllers;

use App\Models\Denuncia;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ConsultaCasosController extends Controller
{
    public function index(Request $request)
    {
        if (Auth::user()->rol !== 'registrador') {
            abort(403, 'Acceso denegado. Solo el Registrador puede consultar casos.');
        }

        $query = Denuncia::with(['denunciante', 'denunciados', 'tecnico', 'categoria', 'solicitudes.dependenciaDestino', 'solicitudes.ampliaciones', 'descargos.denunciado', 'descargos.ampliaciones', 'evaluaciones', 'bitacora.usuario'])
            ->whereNull('deleted_at');

        if ($busqueda = $request->input('busqueda')) {
            $q = mb_strtoupper($busqueda);
            $query->where(function ($qry) use ($q) {
                $qry->where('ticket', 'like', "%{$q}%")
                    ->orWhere('hechos', 'like', "%{$q}%")
                    ->orWhereHas('denunciante', fn($sq) => $sq->where('nombres', 'like', "%{$q}%"))
                    ->orWhereHas('denunciados', fn($sq) => $sq->where('nombres', 'like', "%{$q}%"))
                    ->orWhereHas('denunciados', fn($sq) => $sq->where('dependencia', 'like', "%{$q}%"))
                    ->orWhere('resumen_rechazo', 'like', "%{$q}%");
            });
        }

        if ($ticket = $request->input('ticket')) {
            $query->where('ticket', mb_strtoupper(trim($ticket)));
        }

        if ($estados = $request->input('estado')) {
            $estadosArr = is_array($estados) ? $estados : explode(',', $estados);
            $query->whereIn('estado', $estadosArr);
        }

        if ($tipo = $request->input('tipo')) {
            $query->where('tipo', $tipo);
        }

        if ($escenario = $request->input('escenario')) {
            $query->where('escenario', $escenario);
        }

        if ($desde = $request->input('fecha_desde')) {
            $query->whereDate('created_at', '>=', Carbon::parse($desde));
        }

        if ($hasta = $request->input('fecha_hasta')) {
            $query->whereDate('created_at', '<=', Carbon::parse($hasta));
        }

        if ($tecnico = $request->input('tecnico')) {
            $query->where('tecnico_id', (int) $tecnico);
        }

        $denuncias = $query->latest()->get();

        $solicitudesByTicket = [];
        $descargosByTicket = [];
        $evaluacionesByTicket = [];

        $denuncias = $denuncias->map(function ($d) use (&$solicitudesByTicket, &$descargosByTicket, &$evaluacionesByTicket) {
            $escenario = $d->escenario ?? 'revelada';
            if ($escenario !== 'revelada' && $d->denunciante) {
                $nombres = $d->denunciante->nombres ?? '';
                $d->denunciante->setAttribute('nombres_masked', $nombres
                    ? mb_substr($nombres, 0, 1) . '**** ' . mb_substr($nombres, -1)
                    : 'Confidencial');
            }

            $solicitudesByTicket[$d->ticket] = $d->solicitudes;
            $descargosByTicket[$d->ticket] = $d->descargos;
            $evaluacionesByTicket[$d->ticket] = $d->evaluaciones;
            unset($d->solicitudes);
            unset($d->descargos);
            unset($d->evaluaciones);

            return $d;
        });

        return Inertia::render('Denuncias/ConsultarCasos', [
            'denuncias' => $denuncias,
            'tecnicos' => User::where('rol', 'tecnico')->where('activo', true)->get(),
            'solicitudesByTicket' => $solicitudesByTicket,
            'descargosByTicket' => $descargosByTicket,
            'evaluacionesByTicket' => $evaluacionesByTicket,
            'filters' => $request->only([
                'busqueda', 'ticket', 'estado', 'tipo', 'escenario', 'fecha_desde', 'fecha_hasta', 'tecnico'
            ]),
        ]);
    }
}
