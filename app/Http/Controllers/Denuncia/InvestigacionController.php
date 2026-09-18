<?php

namespace App\Http\Controllers\Denuncia;

use App\Http\Controllers\Controller;
use App\Models\Denuncia;
use App\Services\CasoAuth;
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

        if (! CasoAuth::puedeOperar(Auth::user(), $denuncia, 'caso.iniciar')) {
            return redirect()->back()->with('error', 'NO TIENES PERMISO PARA OPERAR ESTE CASO.');
        }

        $aplicado = false;
        DB::transaction(function () use ($ticket, &$aplicado) {
            $denuncia = Denuncia::where('ticket', $ticket)->lockForUpdate()->first();

            if (! $denuncia || $denuncia->estado !== 'asignada') {
                return;
            }

            $denuncia->update(['estado' => 'investigacion']);

            $denuncia->bitacora()->create([
                'accion' => 'investigacion',
                'detalle' => 'INVESTIGACIÓN INICIADA',
                'usuario_id' => Auth::id(),
                'fecha' => now(),
            ]);

            $aplicado = true;
        });

        if (! $aplicado) {
            return redirect()->back()->with('error', CasoAuth::mensajeCarrera($ticket));
        }

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

        $aplicado = false;
        DB::transaction(function () use ($ticket, $validated, &$aplicado) {
            $denuncia = Denuncia::where('ticket', $ticket)->lockForUpdate()->first();

            if (! $denuncia || $denuncia->estado !== 'investigacion') {
                return;
            }

            $denuncia->update(['estado' => 'informe']);

            $denuncia->bitacora()->create([
                'accion' => 'saltar_fase',
                'detalle' => 'FASE SALTADA A INFORME FINAL. JUSTIFICACIÓN: ' . $validated['justificacion'],
                'usuario_id' => Auth::id(),
                'fecha' => now(),
            ]);

            $aplicado = true;
        });

        if (! $aplicado) {
            return redirect()->back()->with('error', CasoAuth::mensajeCarrera($ticket));
        }

        $msg = "Denuncia {$ticket} pasó a Informe Final.";
        if ($pendientes > 0) {
            $msg .= " Quedan {$pendientes} item(s) pendiente(s) de solicitudes/descargos.";
        }

        return redirect()->back()->with('success', $msg);
    }
}
