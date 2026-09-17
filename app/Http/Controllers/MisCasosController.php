<?php

namespace App\Http\Controllers;

use App\Models\Denuncia;
use App\Models\EvaluacionTecnica;
use App\Models\User;
use App\Services\AvisoCaso;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class MisCasosController extends Controller
{
    public function index()
    {
        if (Auth::user()->rol !== 'investigador') {
            return redirect()->route('dashboard')->with('error', 'Solo los investigadores pueden acceder a Mis Casos.');
        }

        $investigadorId = Auth::id();

        $with = ['denunciante', 'denunciados', 'categoria', 'investigador', 'informe.clasificacionRel', 'cierre.medioNotificacion', 'solicitudes.dependenciaDestino', 'solicitudes.ampliaciones', 'descargos.denunciado', 'descargos.ampliaciones', 'evaluaciones', 'bitacora.usuario'];

        $denuncias = Denuncia::with($with)
            ->where('investigador_id', $investigadorId)
            ->where('estado', '!=', 'rechazada')
            ->latest()
            ->get();

        $grouped = [];
        $solicitudesByTicket = [];
        $descargosByTicket = [];
        $evaluacionesByTicket = [];

        foreach ($denuncias as $d) {
            $estado = $d->estado === 'admitida' ? 'asignada' : $d->estado;
            if (!isset($grouped[$estado])) $grouped[$estado] = [];
            $grouped[$estado][] = $d;

            $solicitudesByTicket[$d->ticket] = $d->solicitudes;
            $descargosByTicket[$d->ticket] = $d->descargos;
            $evaluacionesByTicket[$d->ticket] = $d->evaluaciones;

            unset($d->solicitudes);
            unset($d->descargos);
            unset($d->evaluaciones);
        }

        $evaluacionesDelegadas = EvaluacionTecnica::with('denuncia')
            ->where('investigador_id', $investigadorId)
            ->where('estado', 'pendiente')
            ->get();

        $evaluacionesDevueltas = EvaluacionTecnica::with('denuncia')
            ->where('investigador_id', $investigadorId)
            ->where('estado', 'devuelta')
            ->get();

        return Inertia::render('Denuncias/MisCasos', [
            'grouped' => $grouped,
            'investigadorActual' => $investigadorId,
            'investigadores' => User::where('rol', 'investigador')->where('activo', true)->get(),
            'solicitudesByTicket' => $solicitudesByTicket,
            'descargosByTicket' => $descargosByTicket,
            'evaluacionesByTicket' => $evaluacionesByTicket,
            'avisosPorTicket' => AvisoCaso::publicadosPorTicket($denuncias->pluck('ticket')->toArray()),
            'evaluacionesDelegadas' => $evaluacionesDelegadas,
            'evaluacionesDevueltas' => $evaluacionesDevueltas,
            'canAct' => true,
            'destacar' => request()->query('destacar'),
        ]);
    }

    public function evaluaciones()
    {
        if (Auth::user()->rol !== 'investigador') {
            return redirect()->route('dashboard')->with('error', 'Solo los investigadores pueden acceder a las evaluaciones.');
        }

        $investigadorId = Auth::id();

        $evaluacionesDelegadas = EvaluacionTecnica::with('denuncia')
            ->where('investigador_id', $investigadorId)
            ->where('estado', 'pendiente')
            ->get();

        $evaluacionesDevueltas = EvaluacionTecnica::with('denuncia')
            ->where('investigador_id', $investigadorId)
            ->where('estado', 'devuelta')
            ->get();

        $with = ['denunciante', 'denunciados', 'pruebas', 'categoria', 'investigador', 'informe.clasificacionRel', 'cierre.medioNotificacion', 'solicitudes.dependenciaDestino', 'solicitudes.ampliaciones', 'descargos.denunciado', 'descargos.ampliaciones', 'evaluaciones', 'bitacora.usuario'];

        $denunciaIds = $evaluacionesDelegadas->pluck('denuncia_id')->concat($evaluacionesDevueltas->pluck('denuncia_id'))->filter()->unique();
        $denuncias = Denuncia::with($with)->whereIn('id', $denunciaIds)->get();

        $denunciasByTicket = [];
        foreach ($denuncias as $d) {
            $denunciasByTicket[$d->ticket] = $d;
        }

        return Inertia::render('Denuncias/Evaluaciones', [
            'evaluacionesDelegadas' => $evaluacionesDelegadas,
            'evaluacionesDevueltas' => $evaluacionesDevueltas,
            'denunciasByTicket' => $denunciasByTicket,
            'investigadorActual' => $investigadorId,
            'investigadores' => User::where('rol', 'investigador')->where('activo', true)->get(),
        ]);
    }
}
