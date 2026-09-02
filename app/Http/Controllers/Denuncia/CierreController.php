<?php

namespace App\Http\Controllers\Denuncia;

use App\Http\Controllers\Controller;
use App\Models\Cierre;
use App\Models\Denuncia;
use App\Models\MedioNotificacion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class CierreController extends Controller
{
    public function guardarCierre(string $ticket, Request $request)
    {
        $validated = $request->validate([
            'notificado_denunciante' => 'required|boolean',
            'notificacion_medio' => ['nullable', 'string', 'max:200', Rule::in($this->mediosNotificacionValidos())],
            'notificacion_fecha' => 'nullable|date|before_or_equal:today',
            'notificacion_descripcion' => 'nullable|string|min:5|max:2000',
            'no_notificado_motivo' => 'nullable|string|max:500',
            'concluido_por' => 'required|string|min:2|max:100',
            'descripcion' => 'required|string|min:20|max:5000',
        ]);

        $denuncia = Denuncia::where('ticket', $ticket)->firstOrFail();

        if ($denuncia->estado !== 'informe') {
            return redirect()->back()->with('error', 'No se puede cerrar esta denuncia.');
        }

        $medioId = null;
        if (!empty($validated['notificacion_medio'])) {
            $medio = MedioNotificacion::where('clave', mb_strtolower($validated['notificacion_medio']))->first();
            $medioId = $medio?->id;
        }

        DB::transaction(function () use ($denuncia, $validated, $medioId) {
            $cierre = new Cierre([
                'notificado_denunciante' => (bool) $validated['notificado_denunciante'],
                'notificacion_medio_id' => $medioId,
                'notificacion_fecha' => $validated['notificacion_fecha'] ?? null,
                'notificacion_descripcion' => $validated['notificacion_descripcion'] ?? null,
                'no_notificado_motivo' => $validated['no_notificado_motivo'] ?? null,
                'concluido_por' => $validated['concluido_por'],
                'descripcion' => $validated['descripcion'],
                'cerrado_at' => now(),
                'cerrado_por_id' => Auth::id(),
            ]);

            $denuncia->cierre()->save($cierre);
            $denuncia->update(['estado' => 'cerrada']);

            $denuncia->bitacora()->create([
                'accion' => 'cierre_registrado',
                'detalle' => 'CIERRE REGISTRADO POR ' . $validated['concluido_por'],
                'usuario_id' => Auth::id(),
                'fecha' => now(),
            ]);
        });

        return redirect()->back()->with('success', "Denuncia {$ticket} cerrada correctamente.");
    }

    public function editarCierre(string $ticket, Request $request)
    {
        $validated = $request->validate([
            'notificado_denunciante' => 'required|boolean',
            'notificacion_medio' => ['nullable', 'string', 'max:200', Rule::in($this->mediosNotificacionValidos())],
            'notificacion_fecha' => 'nullable|date|before_or_equal:today',
            'notificacion_descripcion' => 'nullable|string|min:5|max:2000',
            'no_notificado_motivo' => 'nullable|string|max:500',
            'concluido_por' => 'required|string|min:2|max:100',
            'descripcion' => 'required|string|min:20|max:5000',
        ]);

        $denuncia = Denuncia::where('ticket', $ticket)->firstOrFail();

        if ($denuncia->estado !== 'cerrada') {
            return redirect()->back()->with('error', 'No se puede editar el cierre de esta denuncia.');
        }

        $medioId = null;
        if (!empty($validated['notificacion_medio'])) {
            $medio = MedioNotificacion::where('clave', mb_strtolower($validated['notificacion_medio']))->first();
            $medioId = $medio?->id;
        }

        DB::transaction(function () use ($denuncia, $validated, $ticket, $medioId) {
            $cierre = $denuncia->cierre;

            if (!$cierre) {
                return;
            }

            $historial = $cierre->historial_ediciones ?? [];
            $historial[] = [
                'fecha' => now()->toDateTimeString(),
                'cambios' => 'CIERRE EDITADO',
                'usuario_id' => Auth::id(),
            ];

            $cierre->update([
                'notificado_denunciante' => (bool) $validated['notificado_denunciante'],
                'notificacion_medio_id' => $medioId,
                'notificacion_fecha' => $validated['notificacion_fecha'] ?? null,
                'notificacion_descripcion' => $validated['notificacion_descripcion'] ?? null,
                'no_notificado_motivo' => $validated['no_notificado_motivo'] ?? null,
                'concluido_por' => $validated['concluido_por'],
                'descripcion' => $validated['descripcion'],
                'historial_ediciones' => $historial,
            ]);

            $denuncia->bitacora()->create([
                'accion' => 'cierre_editado',
                'detalle' => 'CIERRE EDITADO',
                'usuario_id' => Auth::id(),
                'fecha' => now(),
            ]);
        });

        return redirect()->back()->with('success', "Cierre actualizado para {$ticket}.");
    }

    public function eliminarCierre(string $ticket)
    {
        $denuncia = Denuncia::where('ticket', $ticket)->firstOrFail();

        if ($denuncia->estado !== 'cerrada') {
            return redirect()->back()->with('error', 'No se puede eliminar el cierre de esta denuncia.');
        }

        DB::transaction(function () use ($denuncia) {
            if ($denuncia->cierre) {
                $denuncia->cierre->update([
                    'eliminado' => true,
                    'fecha_eliminacion' => now(),
                ]);
            }

            $denuncia->update(['estado' => 'informe']);

            $denuncia->bitacora()->create([
                'accion' => 'cierre_eliminado',
                'detalle' => 'CIERRE ELIMINADO. DENUNCIA VUELVE A INFORME FINAL',
                'usuario_id' => Auth::id(),
                'fecha' => now(),
            ]);
        });

        return redirect()->back()->with('success', "Cierre eliminado. Denuncia {$ticket} vuelve a Informe Final.");
    }

    public function toggleArchivar(string $ticket)
    {
        $denuncia = Denuncia::where('ticket', $ticket)->firstOrFail();

        if ($denuncia->estado !== 'cerrada') {
            return redirect()->back()->with('error', 'Solo se pueden archivar denuncias cerradas.');
        }

        $nuevoSubestado = $denuncia->subestado === 'archivada' ? null : 'archivada';
        $denuncia->update(['subestado' => $nuevoSubestado]);

        $accion = $nuevoSubestado === 'archivada' ? 'denuncia_archivada' : 'denuncia_desarchivada';
        $detalle = $nuevoSubestado === 'archivada' ? 'CASO ARCHIVADO EN CIERRE' : 'CASO DESARCHIVADO EN CIERRE';

        $denuncia->bitacora()->create([
            'accion' => $accion,
            'detalle' => $detalle,
            'usuario_id' => Auth::id(),
            'fecha' => now(),
        ]);

        $msg = $nuevoSubestado === 'archivada' ? "Caso {$ticket} archivado correctamente." : "Caso {$ticket} desarchivado correctamente.";
        return redirect()->back()->with('success', $msg);
    }

    private function mediosNotificacionValidos(): array
    {
        $claves = MedioNotificacion::where('activa', true)->pluck('clave')->toArray();

        return !empty($claves)
            ? $claves
            : ['whatsapp', 'email', 'presencial', 'otro'];
    }
}
