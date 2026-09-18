<?php

namespace App\Http\Controllers\Denuncia;

use App\Http\Controllers\Controller;
use App\Models\Denuncia;
use App\Models\Notificacion;
use App\Models\User;
use App\Services\CasoAuth;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class AsignacionController extends Controller
{
    public function asignar(string $ticket, Request $request)
    {
        $validated = $request->validate([
            'investigador_id' => 'required|integer|exists:users,id',
        ]);

        $denuncia = Denuncia::where('ticket', $ticket)->firstOrFail();

        if ($denuncia->estado !== 'admitida') {
            return redirect()->back()->with('error', 'No se puede asignar esta denuncia.');
        }

        $investigador = User::findOrFail($validated['investigador_id']);

        if (! $investigador->activo || ! in_array($investigador->rol, ['investigador', 'jefe'], true)) {
            return redirect()->back()->with('error', 'SOLO SE PUEDE ASIGNAR A UN INVESTIGADOR O JEFE ACTIVO.');
        }

        $aplicado = false;
        DB::transaction(function () use ($ticket, $investigador, &$aplicado) {
            $d = Denuncia::where('ticket', $ticket)->lockForUpdate()->first();

            if (! $d || $d->estado !== 'admitida') {
                return;
            }

            $d->update([
                'investigador_id' => $investigador->id,
                'fecha_asignada' => now(),
                'estado' => 'asignada',
            ]);

            $d->bitacora()->create([
                'accion' => 'asignada',
                'detalle' => 'DENUNCIA ASIGNADA A ' . $investigador->name,
                'usuario_id' => Auth::id(),
                'fecha' => now(),
            ]);

            Notificacion::create([
                'usuario_id' => $investigador->id,
                'tipo' => 'asignacion',
                'titulo' => 'NUEVO CASO ASIGNADO',
                'mensaje' => "{$d->ticket} TE FUE ASIGNADO",
                'ticket' => $d->ticket,
                'destino_url' => '/denuncias/mis-casos',
                'icono' => 'UserPlus',
                'color' => 'info',
                'fecha' => now(),
            ]);

            $aplicado = true;
        });

        if (! $aplicado) {
            return redirect()->back()->with('error', CasoAuth::mensajeCarrera($ticket));
        }

        return redirect()->back()->with('success', "Denuncia {$ticket} asignada correctamente.");
    }

    public function traspasar(string $ticket, Request $request)
    {
        $validated = $request->validate([
            'investigador_id' => 'required|integer|exists:users,id',
            'justificacion' => 'required|string|min:5|max:2000',
        ]);

        $denuncia = Denuncia::where('ticket', $ticket)->firstOrFail();

        if (!in_array($denuncia->estado, ['asignada', 'investigacion', 'informe'])) {
            return redirect()->back()->with('error', 'No se puede traspasar esta denuncia.');
        }

        if ($denuncia->investigador_id === (int) $validated['investigador_id']) {
            return redirect()->back()->with('error', 'No se puede traspasar al mismo investigador.');
        }

        $nuevoInvestigador = User::findOrFail($validated['investigador_id']);

        if (! $nuevoInvestigador->activo || ! in_array($nuevoInvestigador->rol, ['investigador', 'jefe'], true)) {
            return redirect()->back()->with('error', 'SOLO SE PUEDE TRASPASAR A UN INVESTIGADOR O JEFE ACTIVO.');
        }

        $aplicado = false;
        DB::transaction(function () use ($ticket, $validated, $nuevoInvestigador, &$aplicado) {
            $d = Denuncia::where('ticket', $ticket)->lockForUpdate()->first();

            if (! $d || ! in_array($d->estado, ['asignada', 'investigacion', 'informe'])) {
                return;
            }

            $nuevoEstado = $d->estado === 'admitida' ? 'asignada' : $d->estado;

            $d->update([
                'estado' => $nuevoEstado,
                'investigador_anterior_id' => $d->investigador_id,
                'investigador_id' => $nuevoInvestigador->id,
                'fecha_asignada' => $d->fecha_asignada ?? now()->toDateTimeString(),
                'traspaso_json' => [
                    'fecha' => now()->toDateTimeString(),
                    'justificacion' => $validated['justificacion'],
                ],
            ]);

            $d->bitacora()->create([
                'accion' => 'traspaso',
                'detalle' => 'TRASPASADO A ' . $nuevoInvestigador->name . '. JUSTIFICACIÓN: ' . $validated['justificacion'],
                'usuario_id' => Auth::id(),
                'fecha' => now(),
            ]);

            Notificacion::create([
                'usuario_id' => $nuevoInvestigador->id,
                'tipo' => 'traspaso',
                'titulo' => 'CASO TRASPASADO A TI',
                'mensaje' => "{$d->ticket} FUE TRASPASADO A TU BANDEJA",
                'ticket' => $d->ticket,
                'destino_url' => '/denuncias/mis-casos',
                'icono' => 'ArrowRightLeft',
                'color' => 'info',
                'fecha' => now(),
            ]);

            $aplicado = true;
        });

        if (! $aplicado) {
            return redirect()->back()->with('error', CasoAuth::mensajeCarrera($ticket));
        }

        return redirect()->back()->with('success', "Denuncia {$ticket} traspasada correctamente.");
    }

    public function cargaInvestigadores()
    {
        $investigadores = User::where('rol', 'investigador')->where('activo', true)->get()->map(fn($t) => [
            'id' => $t->id,
            'nombre' => $t->name,
            'iniciales' => $t->iniciales,
            'color' => $t->color,
            'activos' => Denuncia::where('investigador_id', $t->id)->whereNotIn('estado', ['rechazada', 'cerrada'])->count(),
        ]);

        return response()->json($investigadores);
    }
}
