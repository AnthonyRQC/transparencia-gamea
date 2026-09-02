<?php

namespace App\Http\Controllers\Denuncia;

use App\Http\Controllers\Controller;
use App\Models\Denuncia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class AmpliacionController extends Controller
{
    public function aprobarAmpliacion(string $ticket, Request $request)
    {
        $denuncia = Denuncia::where('ticket', $ticket)->firstOrFail();

        if (!in_array($denuncia->estado, ['admitida', 'asignada', 'investigacion', 'informe'])) {
            return redirect()->back()->with('error', 'No se puede ampliar el plazo de esta denuncia.');
        }

        $maxAmpliacionLegal = $denuncia->tipo === 'corrupcion' ? 45 : 10;
        $maxTotalLegal = $denuncia->tipo === 'corrupcion' ? 90 : 30;
        $ampliacionActual = (int) $denuncia->ampliaciones()->sum('dias');
        $restantePermitido = max(0, $maxAmpliacionLegal - $ampliacionActual);

        if ($restantePermitido <= 0) {
            return redirect()->back()->with('error', "La denuncia ya alcanzó el límite legal máximo de ampliación ({$maxTotalLegal} días totales en el proceso).");
        }

        $validated = $request->validate([
            'dias' => "required|integer|min:1|max:{$restantePermitido}",
            'justificacion' => 'required|string|min:10|max:500',
            'solicitado_por' => 'nullable|string|max:100',
        ], [
            'dias.max' => "No se puede ampliar más de {$restantePermitido} días. El límite legal acumulado es {$maxTotalLegal} días totales.",
        ]);

        DB::transaction(function () use ($denuncia, $validated) {
            $numAmpliacion = $denuncia->ampliaciones()->count() + 1;

            $denuncia->ampliaciones()->create([
                'dias' => (int) $validated['dias'],
                'justificacion' => $validated['justificacion'],
                'numero' => $numAmpliacion,
                'aprobado_por_id' => Auth::id(),
                'solicitado_por' => $validated['solicitado_por'] ?? null,
                'fecha' => now(),
            ]);

            $denuncia->bitacora()->create([
                'accion' => 'ampliacion_plazo',
                'detalle' => 'PLAZO AMPLIADO ' . $validated['dias'] . ' DÍAS (AMPLIACIÓN #' . $numAmpliacion . ')',
                'usuario_id' => Auth::id(),
                'fecha' => now(),
            ]);
        });

        return redirect()->back()->with('success', "Plazo ampliado {$validated['dias']} días correctamente para {$ticket}.");
    }
}
