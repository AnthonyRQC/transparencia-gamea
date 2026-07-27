<?php

namespace App\Http\Controllers;

use App\Models\Denuncia;
use App\Models\EvaluacionTecnica;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class MisCasosController extends Controller
{
    public function index()
    {
        if (Auth::user()->rol !== 'tecnico') {
            return redirect()->route('dashboard')->with('error', 'Solo los técnicos pueden acceder a Mis Casos.');
        }

        $tecnicoId = Auth::id();

        $with = ['denunciante', 'denunciados', 'categoria', 'tecnico', 'informe', 'cierre', 'solicitudes.unidadDestino', 'solicitudes.ampliaciones', 'descargos.denunciado', 'descargos.ampliaciones', 'evaluaciones', 'bitacora.usuario'];

        $denuncias = Denuncia::with($with)
            ->where('tecnico_id', $tecnicoId)
            ->where('estado', '!=', 'rechazada')
            ->latest()
            ->get();

        $grouped = [];
        $solicitudesByTicket = [];
        $descargosByTicket = [];
        $evaluacionesByTicket = [];

        foreach ($denuncias as $d) {
            $estado = $d->estado;
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
            ->where('tecnico_id', $tecnicoId)
            ->where('estado', 'pendiente')
            ->get();

        $evaluacionesDevueltas = EvaluacionTecnica::with('denuncia')
            ->where('tecnico_id', $tecnicoId)
            ->where('estado', 'devuelta')
            ->get();

        return Inertia::render('Denuncias/MisCasos', [
            'grouped' => $grouped,
            'tecnicoActual' => $tecnicoId,
            'tecnicos' => User::where('rol', 'tecnico')->where('activo', true)->get(),
            'solicitudesByTicket' => $solicitudesByTicket,
            'descargosByTicket' => $descargosByTicket,
            'evaluacionesByTicket' => $evaluacionesByTicket,
            'evaluacionesDelegadas' => $evaluacionesDelegadas,
            'evaluacionesDevueltas' => $evaluacionesDevueltas,
            'canAct' => true,
            'destacar' => request()->query('destacar'),
        ]);
    }

    public function evaluaciones()
    {
        if (Auth::user()->rol !== 'tecnico') {
            return redirect()->route('dashboard')->with('error', 'Solo los técnicos pueden acceder a las evaluaciones.');
        }

        $tecnicoId = Auth::id();

        $evaluacionesDelegadas = EvaluacionTecnica::with('denuncia')
            ->where('tecnico_id', $tecnicoId)
            ->where('estado', 'pendiente')
            ->get();

        $evaluacionesDevueltas = EvaluacionTecnica::with('denuncia')
            ->where('tecnico_id', $tecnicoId)
            ->where('estado', 'devuelta')
            ->get();

        return Inertia::render('Denuncias/Evaluaciones', [
            'evaluacionesDelegadas' => $evaluacionesDelegadas,
            'evaluacionesDevueltas' => $evaluacionesDevueltas,
            'denunciasByTicket' => [],
            'tecnicoActual' => $tecnicoId,
            'tecnicos' => User::where('rol', 'tecnico')->where('activo', true)->get(),
        ]);
    }
}
