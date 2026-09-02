<?php

namespace App\Http\Controllers\Denuncia;

use App\Http\Controllers\Controller;
use App\Models\Clasificacion;
use App\Models\Denuncia;
use App\Models\InformeFinal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class InformeController extends Controller
{
    public function guardarInforme(string $ticket, Request $request)
    {
        $validated = $request->validate([
            'clasificacion' => ['required', Rule::in($this->clasificacionesValidas())],
            'fojas' => 'required|integer|min:1|max:9999',
            'justificacion' => 'required|string|min:20|max:5000',
            'concluido_por' => 'required|string|min:2|max:100',
            'sitpreco' => 'nullable|string|min:3|max:50',
        ]);

        $denuncia = Denuncia::where('ticket', $ticket)->firstOrFail();

        if (!in_array($denuncia->estado, ['informe', 'cerrada'])) {
            return redirect()->back()->with('error', 'No se puede redactar el informe en esta denuncia.');
        }

        $clasificacion = Clasificacion::where('clave', $validated['clasificacion'])->firstOrFail();

        DB::transaction(function () use ($denuncia, $validated, $clasificacion) {
            $informe = new InformeFinal([
                'clasificacion_id' => $clasificacion->id,
                'clasificado_por_id' => Auth::id(),
                'fojas' => $validated['fojas'],
                'justificacion' => $validated['justificacion'],
                'concluido_por' => $validated['concluido_por'],
                'sitpreco' => $validated['sitpreco'] ?? null,
                'redactado_at' => now(),
            ]);

            $denuncia->informe()->save($informe);

            $denuncia->bitacora()->create([
                'accion' => 'informe_redactado',
                'detalle' => 'INFORME FINAL REDACTADO CON CLASIFICACIÓN ' . $validated['clasificacion'],
                'usuario_id' => Auth::id(),
                'fecha' => now(),
            ]);
        });

        return redirect()->back()->with('success', "Informe Final redactado para {$ticket}.");
    }

    public function editarInforme(string $ticket, Request $request)
    {
        $validated = $request->validate([
            'clasificacion' => ['required', Rule::in($this->clasificacionesValidas())],
            'fojas' => 'required|integer|min:1|max:9999',
            'justificacion' => 'required|string|min:20|max:5000',
            'concluido_por' => 'required|string|min:2|max:100',
            'sitpreco' => 'nullable|string|min:3|max:50',
        ]);

        $denuncia = Denuncia::where('ticket', $ticket)->firstOrFail();

        if (!in_array($denuncia->estado, ['informe', 'cerrada'])) {
            return redirect()->back()->with('error', 'No se puede editar el informe de esta denuncia.');
        }

        $clasificacion = Clasificacion::where('clave', $validated['clasificacion'])->firstOrFail();

        DB::transaction(function () use ($denuncia, $validated, $clasificacion) {
            $informe = $denuncia->informe;

            if (!$informe) {
                return redirect()->back()->with('error', 'No hay informe que editar.');
            }

            $historial = $informe->historial_ediciones ?? [];
            $historial[] = [
                'fecha' => now()->toDateTimeString(),
                'cambios' => 'CLASIFICACIÓN: ' . $validated['clasificacion'],
                'usuario_id' => Auth::id(),
            ];

            $informe->update([
                'clasificacion_id' => $clasificacion->id,
                'clasificado_por_id' => Auth::id(),
                'fojas' => $validated['fojas'],
                'justificacion' => $validated['justificacion'],
                'concluido_por' => $validated['concluido_por'],
                'sitpreco' => $validated['sitpreco'] ?? $informe->sitpreco,
                'historial_ediciones' => $historial,
            ]);

            $denuncia->bitacora()->create([
                'accion' => 'informe_editado',
                'detalle' => 'INFORME FINAL EDITADO',
                'usuario_id' => Auth::id(),
                'fecha' => now(),
            ]);
        });

        return redirect()->back()->with('success', "Informe Final actualizado para {$ticket}.");
    }

    public function eliminarInforme(string $ticket)
    {
        $denuncia = Denuncia::where('ticket', $ticket)->firstOrFail();

        if (!in_array($denuncia->estado, ['informe', 'cerrada'])) {
            return redirect()->back()->with('error', 'No se puede eliminar el informe de esta denuncia.');
        }

        DB::transaction(function () use ($denuncia) {
            if ($denuncia->informe) {
                $denuncia->informe->update([
                    'eliminado' => true,
                    'fecha_eliminacion' => now(),
                ]);
            }

            $denuncia->bitacora()->create([
                'accion' => 'informe_eliminado',
                'detalle' => 'INFORME FINAL ELIMINADO',
                'usuario_id' => Auth::id(),
                'fecha' => now(),
            ]);
        });

        return redirect()->back()->with('success', "Informe Final eliminado de {$ticket}.");
    }

    private function clasificacionesValidas(): array
    {
        $claves = Clasificacion::where('activa', true)->pluck('clave')->toArray();

        return !empty($claves)
            ? $claves
            : ['penal', 'civil', 'administrativo', 'sin_indicios', 'medida_correctiva', 'archivado'];
    }
}
