<?php

namespace App\Http\Controllers;

use App\Models\Ampliacion;
use App\Models\Bitacora;
use App\Models\Denuncia;
use App\Models\SolicitudInformacion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SolicitudController extends Controller
{
    public function store(string $ticket, Request $request)
    {
        $validated = $request->validate([
            'unidad_destino_id' => 'required|integer|exists:unidades_externas,id',
            'detalle' => 'required|string|min:5|max:2000',
            'plazo_dias' => 'required|integer|min:1|max:45',
            'fecha_envio' => 'nullable|date|before_or_equal:today',
        ]);

        $denuncia = Denuncia::where('ticket', $ticket)->firstOrFail();

        if (!in_array($denuncia->estado, ['asignada', 'investigacion', 'informe'])) {
            return redirect()->back()->with('error', 'No se pueden crear solicitudes en el estado actual de la denuncia.');
        }

        $solicitud = $denuncia->solicitudes()->create([
            'unidad_destino_id' => $validated['unidad_destino_id'],
            'detalle' => $validated['detalle'],
            'plazo_dias' => (int) $validated['plazo_dias'],
            'fecha_envio' => $validated['fecha_envio'] ?? now(),
            'fecha_vencimiento' => now()->addDays((int) $validated['plazo_dias']),
            'estado' => 'pendiente',
        ]);

        Bitacora::create([
            'denuncia_id' => $denuncia->id,
            'accion' => 'solicitud_creada',
            'detalle' => 'Solicitud de información creada. Plazo: ' . $validated['plazo_dias'] . ' días.',
            'usuario_id' => Auth::id(),
            'fecha' => now(),
        ]);

        return redirect()->back()->with('success', 'Solicitud creada correctamente.');
    }

    public function responder(int $id, Request $request)
    {
        $validated = $request->validate([
            'respuesta' => 'required|string|min:5|max:5000',
            'fecha_respuesta' => 'nullable|date|before_or_equal:today',
        ]);

        $solicitud = SolicitudInformacion::findOrFail($id);

        if ($solicitud->estado === 'respondida') {
            return redirect()->back()->with('error', 'Esta solicitud ya fue respondida.');
        }

        $solicitud->update([
            'respuesta' => $validated['respuesta'],
            'fecha_respuesta' => $validated['fecha_respuesta'] ?? now(),
            'estado' => 'respondida',
        ]);

        Bitacora::create([
            'denuncia_id' => $solicitud->denuncia_id,
            'accion' => 'solicitud_respondida',
            'detalle' => 'Respuesta recibida para solicitud de información.',
            'usuario_id' => Auth::id(),
            'fecha' => now(),
        ]);

        return redirect()->back()->with('success', 'Respuesta de solicitud registrada correctamente.');
    }

    public function cancelar(int $id, Request $request)
    {
        $validated = $request->validate([
            'motivo' => 'required|string|min:5|max:2000',
        ]);

        $solicitud = SolicitudInformacion::findOrFail($id);

        if (!in_array($solicitud->estado, ['pendiente', 'ampliada'])) {
            return redirect()->back()->with('error', 'No se puede cancelar esta solicitud porque ya fue respondida o cancelada.');
        }

        $solicitud->update([
            'motivo_cancelacion' => $validated['motivo'],
            'fecha_cancelacion' => now(),
            'estado' => 'cancelada',
        ]);

        Bitacora::create([
            'denuncia_id' => $solicitud->denuncia_id,
            'accion' => 'solicitud_cancelada',
            'detalle' => 'Solicitud cancelada. Motivo: ' . $validated['motivo'],
            'usuario_id' => Auth::id(),
            'fecha' => now(),
        ]);

        return redirect()->back()->with('success', 'Solicitud cancelada correctamente.');
    }

    public function ampliar(int $id, Request $request)
    {
        $validated = $request->validate([
            'dias' => 'required|integer|min:1|max:5',
            'justificacion' => 'required|string|min:10|max:2000',
        ]);

        $solicitud = SolicitudInformacion::findOrFail($id);

        if (in_array($solicitud->estado, ['respondida', 'cancelada'])) {
            return redirect()->back()->with('error', 'No se puede ampliar una solicitud ya respondida o cancelada.');
        }

        $numAmpliacion = $solicitud->ampliaciones()->count() + 1;

        $solicitud->ampliaciones()->create([
            'dias' => (int) $validated['dias'],
            'justificacion' => $validated['justificacion'],
            'fecha' => now(),
        ]);

        $solicitud->update([
            'estado' => 'ampliada',
            'fecha_vencimiento' => $solicitud->fecha_vencimiento->addDays((int) $validated['dias']),
        ]);

        Bitacora::create([
            'denuncia_id' => $solicitud->denuncia_id,
            'accion' => 'solicitud_ampliada',
            'detalle' => 'Plazo ampliado ' . $validated['dias'] . ' días (ampliación #' . $numAmpliacion . ') para solicitud.',
            'usuario_id' => Auth::id(),
            'fecha' => now(),
        ]);

        return redirect()->back()->with('success', 'Plazo ampliado ' . $validated['dias'] . ' días correctamente (ampliación #' . $numAmpliacion . ').');
    }

    public function editar(int $id, Request $request)
    {
        $validated = $request->validate([
            'detalle' => 'required|string|min:5|max:2000',
            'plazo_dias' => 'required|integer|min:1|max:45',
        ]);

        $solicitud = SolicitudInformacion::findOrFail($id);

        $historial = $solicitud->historial_ediciones ?? [];
        $historial[] = [
            'fecha' => now()->toDateTimeString(),
            'campo' => 'detalle, plazo_dias',
            'anterior' => $solicitud->detalle,
            'nuevo' => $validated['detalle'],
            'usuario_id' => Auth::id(),
        ];

        $solicitud->update([
            'detalle' => $validated['detalle'],
            'plazo_dias' => (int) $validated['plazo_dias'],
            'fecha_vencimiento' => $solicitud->fecha_envio->addDays((int) $validated['plazo_dias']),
            'historial_ediciones' => $historial,
        ]);

        return redirect()->back()->with('success', 'Solicitud actualizada correctamente.');
    }

    public function eliminar(int $id)
    {
        $solicitud = SolicitudInformacion::findOrFail($id);

        $solicitud->update([
            'eliminado' => true,
            'fecha_eliminacion' => now(),
        ]);

        return redirect()->back()->with('success', 'Solicitud eliminada correctamente.');
    }
}
