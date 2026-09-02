<?php

namespace App\Http\Controllers\Denuncia;

use App\Http\Controllers\Controller;
use App\Models\Denuncia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class AdmisionController extends Controller
{
    public function admitir(string $ticket, Request $request)
    {
        $validated = $request->validate([
            'justificacion' => 'nullable|string|max:500',
        ]);

        $denuncia = Denuncia::where('ticket', $ticket)->firstOrFail();

        if ($denuncia->estado !== 'ingresada') {
            return redirect()->back()->with('error', 'No se puede admitir esta denuncia.');
        }

        DB::transaction(function () use ($denuncia, $validated) {
            $denuncia->update([
                'estado' => 'admitida',
                'fecha_admitida' => now(),
                'justificacion_admision' => $validated['justificacion'] ?? null,
            ]);

            $denuncia->bitacora()->create([
                'accion' => 'admitida',
                'detalle' => 'DENUNCIA ADMITIDA PARA INVESTIGACIÓN',
                'usuario_id' => Auth::id(),
                'fecha' => now(),
            ]);
        });

        return redirect()->back()->with('success', "Denuncia {$ticket} admitida correctamente.");
    }

    public function rechazar(string $ticket, Request $request)
    {
        $validated = $request->validate([
            'justificacion' => 'required|string|min:5|max:2000',
            'sitpreco' => 'nullable|string|max:50',
            'resumen_rechazo' => 'nullable|string|max:200',
        ]);

        $denuncia = Denuncia::where('ticket', $ticket)->firstOrFail();

        if ($denuncia->estado !== 'ingresada') {
            return redirect()->back()->with('error', 'No se puede rechazar esta denuncia.');
        }

        DB::transaction(function () use ($denuncia, $validated) {
            $denuncia->update([
                'estado' => 'rechazada',
                'fecha_rechazada' => now(),
                'justificacion_rechazo' => $validated['justificacion'],
                'resumen_rechazo' => $validated['resumen_rechazo'] ?? null,
                'sitpreco_rechazo' => $validated['sitpreco'] ?? null,
            ]);

            $denuncia->bitacora()->create([
                'accion' => 'rechazada',
                'detalle' => 'DENUNCIA RECHAZADA. JUSTIFICACIÓN: ' . $validated['justificacion'],
                'usuario_id' => Auth::id(),
                'fecha' => now(),
            ]);
        });

        return redirect()->back()->with('success', "Denuncia {$ticket} rechazada.");
    }
}
