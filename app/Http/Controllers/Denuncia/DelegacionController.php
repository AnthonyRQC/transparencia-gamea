<?php

namespace App\Http\Controllers\Denuncia;

use App\Http\Controllers\Controller;
use App\Models\Denuncia;
use App\Models\Notificacion;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class DelegacionController extends Controller
{
    public function delegarEvaluacion(string $ticket, Request $request)
    {
        $validated = $request->validate([
            'tecnico_id' => 'required|integer|exists:users,id',
            'justificacion' => 'nullable|string|max:500',
        ]);

        $denuncia = Denuncia::where('ticket', $ticket)->firstOrFail();

        if ($denuncia->estado !== 'ingresada') {
            return redirect()->back()->with('error', 'No se puede delegar la evaluación de esta denuncia.');
        }

        DB::transaction(function () use ($denuncia, $validated) {
            $tecnico = User::findOrFail($validated['tecnico_id']);

            $denuncia->evaluaciones()->create([
                'tecnico_id' => $tecnico->id,
                'delegada_por_id' => Auth::id(),
                'delegada_at' => now(),
                'justificacion_delegacion' => $validated['justificacion'] ?? null,
                'estado' => 'pendiente',
            ]);

            $denuncia->update(['estado' => 'evaluacion_tecnica']);

            $denuncia->bitacora()->create([
                'accion' => 'evaluacion_delegada',
                'detalle' => 'EVALUACIÓN DELEGADA A ' . $tecnico->name,
                'usuario_id' => Auth::id(),
                'fecha' => now(),
            ]);

            Notificacion::create([
                'usuario_id' => $tecnico->id,
                'tipo' => 'evaluacion_delegada',
                'titulo' => 'EVALUACIÓN TÉCNICA ASIGNADA',
                'mensaje' => "{$denuncia->ticket} TE FUE DELEGADA PARA EVALUACIÓN",
                'ticket' => $denuncia->ticket,
                'destino_url' => '/denuncias/evaluaciones',
                'icono' => 'FileSearch',
                'color' => 'info',
                'fecha' => now(),
            ]);
        });

        return redirect()->back()->with('success', "Evaluación delegada correctamente para {$ticket}.");
    }

    public function reasumirEvaluacion(string $ticket)
    {
        $denuncia = Denuncia::where('ticket', $ticket)->firstOrFail();

        if ($denuncia->estado !== 'evaluacion_tecnica') {
            return redirect()->back()->with('error', 'No se puede reasumir la evaluación de esta denuncia.');
        }

        DB::transaction(function () use ($denuncia) {
            $evaluacionPendiente = $denuncia->evaluaciones()->where('estado', 'pendiente')->latest()->first();

            $denuncia->update(['estado' => 'ingresada']);

            $denuncia->bitacora()->create([
                'accion' => 'evaluacion_reasumida',
                'detalle' => 'EVALUACIÓN REASUMIDA POR EL JEFE',
                'usuario_id' => Auth::id(),
                'fecha' => now(),
            ]);

            if ($evaluacionPendiente && $evaluacionPendiente->tecnico_id) {
                Notificacion::create([
                    'usuario_id' => $evaluacionPendiente->tecnico_id,
                    'tipo' => 'evaluacion_reasumida',
                    'titulo' => 'EVALUACIÓN REASUMIDA',
                    'mensaje' => "{$denuncia->ticket} — EL JEFE REASUMIÓ LA EVALUACIÓN",
                    'ticket' => $denuncia->ticket,
                    'destino_url' => '/denuncias/mis-casos',
                    'icono' => 'Undo2',
                    'color' => 'warning',
                    'fecha' => now(),
                ]);
            }
        });

        return redirect()->back()->with('success', "Evaluación reasumida para {$ticket}.");
    }
}
