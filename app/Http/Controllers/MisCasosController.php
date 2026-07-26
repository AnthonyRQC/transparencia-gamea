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

        $with = ['denunciante', 'denunciados', 'categoria', 'tecnico', 'informe', 'cierre'];

        $denuncias = Denuncia::with($with)
            ->where('tecnico_id', $tecnicoId)
            ->whereNotIn('estado', ['rechazada', 'cerrada'])
            ->latest()
            ->get();

        $grouped = [];
        foreach ($denuncias as $d) {
            $estado = $d->estado;
            if (!isset($grouped[$estado])) $grouped[$estado] = [];
            $grouped[$estado][] = $d;
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
            'solicitudesByTicket' => [],
            'descargosByTicket' => [],
            'evaluacionesByTicket' => [],
            'evaluacionesDelegadas' => $evaluacionesDelegadas,
            'evaluacionesDevueltas' => $evaluacionesDevueltas,
            'canAct' => true,
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
