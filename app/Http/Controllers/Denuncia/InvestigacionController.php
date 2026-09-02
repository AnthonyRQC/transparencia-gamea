<?php

namespace App\Http\Controllers\Denuncia;

use App\Http\Controllers\Controller;
use App\Models\Denuncia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class InvestigacionController extends Controller
{
    public function iniciarInvestigacion(string $ticket)
    {
        $denuncia = Denuncia::where('ticket', $ticket)->firstOrFail();

        if ($denuncia->estado !== 'asignada') {
            return redirect()->back()->with('error', 'No se puede iniciar investigación.');
        }

        DB::transaction(function () use ($denuncia) {
            $denuncia->update(['estado' => 'investigacion']);

            $denuncia->bitacora()->create([
                'accion' => 'investigacion',
                'detalle' => 'INVESTIGACIÓN INICIADA',
                'usuario_id' => Auth::id(),
                'fecha' => now(),
            ]);
        });

        return redirect()->back()->with('success', "Investigación iniciada para {$ticket}.");
    }

    public function saltarFase(string $ticket, Request $request)
    {
        $validated = $request->validate([
            'justificacion' => 'required|string|min:20|max:2000',
        ]);

        $denuncia = Denuncia::where('ticket', $ticket)->firstOrFail();

        if ($denuncia->estado !== 'investigacion') {
            return redirect()->back()->with('error', 'No se puede saltar la fase de esta denuncia.');
        }

        $pendientes = $denuncia->solicitudes()->where('estado', 'pendiente')->count()
            + $denuncia->descargos()->whereIn('estado', ['pendiente_notif', 'notificado'])->count();

        DB::transaction(function () use ($denuncia, $validated) {
            $denuncia->update(['estado' => 'informe']);

            $denuncia->bitacora()->create([
                'accion' => 'saltar_fase',
                'detalle' => 'FASE SALTADA A INFORME FINAL. JUSTIFICACIÓN: ' . $validated['justificacion'],
                'usuario_id' => Auth::id(),
                'fecha' => now(),
            ]);
        });

        $msg = "Denuncia {$ticket} pasó a Informe Final.";
        if ($pendientes > 0) {
            $msg .= " Quedan {$pendientes} item(s) pendiente(s) de solicitudes/descargos.";
        }

        return redirect()->back()->with('success', $msg);
    }
}
