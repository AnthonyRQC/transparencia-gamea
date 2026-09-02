<?php

namespace App\Http\Controllers\Denuncia;

use App\Http\Controllers\Controller;
use App\Models\Denuncia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ReaperturaController extends Controller
{
    public function reabrir(string $ticket, Request $request)
    {
        $validated = $request->validate([
            'justificacion' => 'required|string|min:20|max:2000',
            'nueva_fecha_limite' => 'required|date|after_or_equal:today',
        ]);

        $denuncia = Denuncia::where('ticket', $ticket)->firstOrFail();

        if (!in_array($denuncia->estado, ['rechazada', 'cerrada'])) {
            return redirect()->back()->with('error', 'No se puede reabrir esta denuncia.');
        }

        DB::transaction(function () use ($denuncia, $validated) {
            $denuncia->update([
                'estado' => 'ingresada',
                'subestado' => null,
                'tecnico_id' => null,
                'tecnico_anterior_id' => null,
                'reapertura_json' => [
                    'fecha' => now()->toDateTimeString(),
                    'justificacion' => $validated['justificacion'],
                    'plazo' => $validated['nueva_fecha_limite'],
                ],
            ]);

            $denuncia->bitacora()->create([
                'accion' => 'reapertura',
                'detalle' => 'DENUNCIA REABIERTA. JUSTIFICACIÓN: ' . $validated['justificacion'],
                'usuario_id' => Auth::id(),
                'fecha' => now(),
            ]);
        });

        return redirect()->back()->with('success', "Denuncia {$ticket} reabierta correctamente.");
    }
}
