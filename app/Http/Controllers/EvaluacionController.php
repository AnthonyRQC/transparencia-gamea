<?php

namespace App\Http\Controllers;

use App\Models\Bitacora;
use App\Models\EvaluacionTecnica;
use App\Models\Notificacion;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class EvaluacionController extends Controller
{
    public function devolver(int $id, Request $request)
    {
        $validated = $request->validate([
            'texto_evaluacion' => 'nullable|string|max:5000',
            'recomendacion' => 'required|in:admitir,rechazar',
        ]);

        $evaluacion = EvaluacionTecnica::with('denuncia')->findOrFail($id);

        if ($evaluacion->estado !== 'pendiente') {
            return redirect()->back()->with('error', 'Esta evaluación ya fue devuelta.');
        }

        if ($evaluacion->tecnico_id !== Auth::id()) {
            return redirect()->back()->with('error', 'No eres el técnico asignado a esta evaluación.');
        }

        DB::transaction(function () use ($evaluacion, $validated) {
            $evaluacion->update([
                'texto_evaluacion' => $validated['texto_evaluacion'],
                'recomendacion' => $validated['recomendacion'],
                'devuelta_at' => now(),
                'devuelta_por_id' => Auth::id(),
                'estado' => 'devuelta',
            ]);

            $denuncia = $evaluacion->denuncia;
            if ($denuncia) {
                $denuncia->update([
                    'estado' => 'ingresada',
                    'evaluacion_tecnica_texto' => $validated['texto_evaluacion'],
                    'evaluacion_tecnica_recomendacion' => $validated['recomendacion'],
                    'evaluacion_tecnica_tecnico_nombre' => Auth::user()->name,
                ]);

                $denuncia->bitacora()->create([
                    'accion' => 'evaluacion_devuelta',
                    'detalle' => 'EVALUACIÓN TÉCNICA DEVUELTA POR ' . Auth::user()->name . '. RECOMENDACIÓN: ' . strtoupper($validated['recomendacion']),
                    'usuario_id' => Auth::id(),
                    'fecha' => now(),
                ]);

                $jefeId = $evaluacion->delegada_por_id ?? User::where('rol', 'jefe')->value('id');
                if ($jefeId) {
                    Notificacion::create([
                        'usuario_id' => $jefeId,
                        'tipo' => 'evaluacion_devuelta',
                        'titulo' => 'EVALUACIÓN DEVUELTA POR TÉCNICO',
                        'mensaje' => "{$denuncia->ticket} — EVALUADA POR " . Auth::user()->name . " (" . strtoupper($validated['recomendacion']) . ")",
                        'ticket' => $denuncia->ticket,
                        'destino_url' => '/denuncias/bandeja?destacar=' . $denuncia->ticket,
                        'icono' => 'FileSearch',
                        'color' => $validated['recomendacion'] === 'admitir' ? 'success' : 'danger',
                        'fecha' => now(),
                    ]);
                }
            }
        });

        return redirect()->back()->with('success', 'Evaluación devuelta correctamente al Jefe de Unidad.');
    }
}
