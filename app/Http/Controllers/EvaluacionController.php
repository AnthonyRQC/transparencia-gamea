<?php

namespace App\Http\Controllers;

use App\Data\DenunciaData;
use App\Data\EvaluacionData;
use App\Data\NotificacionData;
use App\Data\SesionUsuarioData;
use Illuminate\Http\Request;

class EvaluacionController extends Controller
{
    public function devolver(Request $request, int $id)
    {
        $validated = $request->validate([
            'texto_evaluacion' => 'nullable|string|max:2000',
            'recomendacion' => 'required|in:admitir,rechazar',
        ]);

        $evaluacion = EvaluacionData::find($id);
        if (!$evaluacion || ($evaluacion['estado'] ?? '') !== 'pendiente') {
            return redirect()->back()->with('error', 'Evaluación no encontrada o ya fue devuelta.');
        }

        DenunciaData::devolverEvaluacion($id, $validated['texto_evaluacion'], $validated['recomendacion']);

        $currentUser = SesionUsuarioData::getCurrent();
        $recomendacionLabel = $validated['recomendacion'] === 'admitir' ? 'Admitir' : 'Rechazar';
        NotificacionData::crearParaUsuario(
            tipo: 'evaluacion_devuelta',
            titulo: 'Evaluación técnica devuelta',
            mensaje: "{$evaluacion['ticket']} — Recomendación: {$recomendacionLabel}",
            usuarioId: 'jefe-1',
            ticket: $evaluacion['ticket'],
            destinoUrl: route('denuncias.bandeja', ['destacar' => $evaluacion['ticket']]),
            icono: 'FileSearch',
            color: 'info',
        );

        return redirect()->back()->with('success', "Evaluación devuelta para {$evaluacion['ticket']}.");
    }
}
