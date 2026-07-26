<?php

namespace App\Http\Controllers;

use App\Models\Bitacora;
use App\Models\EvaluacionTecnica;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class EvaluacionController extends Controller
{
    public function devolver(int $id, Request $request)
    {
        $validated = $request->validate([
            'texto_evaluacion' => 'required|string|min:10|max:5000',
            'recomendacion' => 'required|in:admitir,rechazar',
        ]);

        $evaluacion = EvaluacionTecnica::findOrFail($id);

        if ($evaluacion->estado !== 'pendiente') {
            return redirect()->back()->with('error', 'Esta evaluación ya fue devuelta.');
        }

        if ($evaluacion->tecnico_id !== Auth::id()) {
            return redirect()->back()->with('error', 'No eres el técnico asignado a esta evaluación.');
        }

        $evaluacion->update([
            'texto_evaluacion' => $validated['texto_evaluacion'],
            'recomendacion' => $validated['recomendacion'],
            'devuelta_at' => now(),
            'devuelta_por_id' => Auth::id(),
            'estado' => 'devuelta',
        ]);

        Bitacora::create([
            'denuncia_id' => $evaluacion->denuncia_id,
            'accion' => 'evaluacion_devuelta',
            'detalle' => 'Evaluación técnica devuelta por ' . Auth::user()->name . '. Recomendación: ' . $validated['recomendacion'],
            'usuario_id' => Auth::id(),
            'fecha' => now(),
        ]);

        return redirect()->back()->with('success', 'Evaluación devuelta correctamente.');
    }
}
