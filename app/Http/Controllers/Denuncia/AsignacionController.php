<?php

namespace App\Http\Controllers\Denuncia;

use App\Http\Controllers\Controller;
use App\Models\Denuncia;
use App\Models\Notificacion;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class AsignacionController extends Controller
{
    public function asignar(string $ticket, Request $request)
    {
        $validated = $request->validate([
            'tecnico_id' => 'required|integer|exists:users,id',
        ]);

        $denuncia = Denuncia::where('ticket', $ticket)->firstOrFail();

        if ($denuncia->estado !== 'admitida') {
            return redirect()->back()->with('error', 'No se puede asignar esta denuncia.');
        }

        DB::transaction(function () use ($denuncia, $validated) {
            $tecnico = User::findOrFail($validated['tecnico_id']);

            $denuncia->update([
                'tecnico_id' => $tecnico->id,
                'fecha_asignada' => now(),
                'estado' => 'asignada',
            ]);

            $denuncia->bitacora()->create([
                'accion' => 'asignada',
                'detalle' => 'DENUNCIA ASIGNADA A ' . $tecnico->name,
                'usuario_id' => Auth::id(),
                'fecha' => now(),
            ]);

            Notificacion::create([
                'usuario_id' => $tecnico->id,
                'tipo' => 'asignacion',
                'titulo' => 'NUEVO CASO ASIGNADO',
                'mensaje' => "{$denuncia->ticket} TE FUE ASIGNADO",
                'ticket' => $denuncia->ticket,
                'destino_url' => '/denuncias',
                'icono' => 'UserPlus',
                'color' => 'info',
                'fecha' => now(),
            ]);
        });

        return redirect()->back()->with('success', "Denuncia {$ticket} asignada correctamente.");
    }

    public function traspasar(string $ticket, Request $request)
    {
        $validated = $request->validate([
            'tecnico_id' => 'required|integer|exists:users,id',
            'justificacion' => 'required|string|min:5|max:2000',
        ]);

        $denuncia = Denuncia::where('ticket', $ticket)->firstOrFail();

        if (!in_array($denuncia->estado, ['asignada', 'investigacion', 'informe'])) {
            return redirect()->back()->with('error', 'No se puede traspasar esta denuncia.');
        }

        if ($denuncia->tecnico_id === (int) $validated['tecnico_id']) {
            return redirect()->back()->with('error', 'No se puede traspasar al mismo técnico.');
        }

        DB::transaction(function () use ($denuncia, $validated) {
            $nuevoTecnico = User::findOrFail($validated['tecnico_id']);
            $nuevoEstado = $denuncia->estado === 'admitida' ? 'asignada' : $denuncia->estado;

            $denuncia->update([
                'estado' => $nuevoEstado,
                'tecnico_anterior_id' => $denuncia->tecnico_id,
                'tecnico_id' => $nuevoTecnico->id,
                'fecha_asignada' => $denuncia->fecha_asignada ?? now()->toDateTimeString(),
                'traspaso_json' => [
                    'fecha' => now()->toDateTimeString(),
                    'justificacion' => $validated['justificacion'],
                ],
            ]);

            $denuncia->bitacora()->create([
                'accion' => 'traspaso',
                'detalle' => 'TRASPASADO A ' . $nuevoTecnico->name . '. JUSTIFICACIÓN: ' . $validated['justificacion'],
                'usuario_id' => Auth::id(),
                'fecha' => now(),
            ]);

            Notificacion::create([
                'usuario_id' => $nuevoTecnico->id,
                'tipo' => 'traspaso',
                'titulo' => 'CASO TRASPASADO A TI',
                'mensaje' => "{$denuncia->ticket} FUE TRASPASADO A TU BANDEJA",
                'ticket' => $denuncia->ticket,
                'destino_url' => '/denuncias/mis-casos',
                'icono' => 'ArrowRightLeft',
                'color' => 'info',
                'fecha' => now(),
            ]);
        });

        return redirect()->back()->with('success', "Denuncia {$ticket} traspasada correctamente.");
    }

    public function cargaTecnicos()
    {
        $tecnicos = User::where('rol', 'tecnico')->where('activo', true)->get()->map(fn($t) => [
            'id' => $t->id,
            'nombre' => $t->name,
            'iniciales' => $t->iniciales,
            'color' => $t->color,
            'activos' => Denuncia::where('tecnico_id', $t->id)->whereNotIn('estado', ['rechazada', 'cerrada'])->count(),
        ]);

        return response()->json($tecnicos);
    }
}
