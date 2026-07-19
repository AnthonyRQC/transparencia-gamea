<?php

namespace App\Http\Controllers;

use App\Data\DenunciaData;
use App\Data\SolicitudData;
use App\Data\UnidadData;
use Illuminate\Http\Request;

class SolicitudController extends Controller
{
    public function store(string $ticket, Request $request)
    {
        $validated = $request->validate([
            'unidad_destino' => 'required|string|min:2|max:200',
            'detalle' => 'required|string|min:5|max:2000',
            'plazo_dias' => 'required|integer|min:1|max:45',
            'fecha_envio' => 'nullable|date|before_or_equal:today',
        ]);

        $denuncia = DenunciaData::find($ticket);
        if (!$denuncia) {
            return redirect()->back()->with('error', 'Denuncia no encontrada.');
        }

        if (!in_array($denuncia['estado'] ?? '', ['asignada', 'investigacion', 'informe'])) {
            return redirect()->back()->with('error', 'No se pueden crear solicitudes en el estado actual de la denuncia.');
        }

        $id = SolicitudData::add($ticket, $validated['unidad_destino'], $validated['detalle'], (int) $validated['plazo_dias'], $validated['fecha_envio'] ?? null);

        DenunciaData::registrarAccion($ticket, 'solicitud_creada', "Solicitud de información enviada a {$validated['unidad_destino']}: {$validated['detalle']}. Plazo: {$validated['plazo_dias']} días.", 'sistema');

        return redirect()->back()->with('success', "Solicitud creada correctamente para {$validated['unidad_destino']}.");
    }

    public function responder(int $id, Request $request)
    {
        $validated = $request->validate([
            'respuesta' => 'required|string|min:5|max:5000',
            'fecha_respuesta' => 'nullable|date|before_or_equal:today',
        ]);

        $solicitud = SolicitudData::find($id);
        if (!$solicitud) {
            return redirect()->back()->with('error', 'Solicitud no encontrada.');
        }

        if ($solicitud['estado'] === 'respondida') {
            return redirect()->back()->with('error', 'Esta solicitud ya fue respondida.');
        }

        SolicitudData::responder($id, $validated['respuesta'], [], $validated['fecha_respuesta'] ?? null);

        DenunciaData::registrarAccion($solicitud['ticket'], 'solicitud_respondida', "Respuesta recibida de {$solicitud['unidad_destino']}", 'sistema');

        return redirect()->back()->with('success', 'Respuesta de solicitud registrada correctamente.');
    }

    public function cancelar(int $id, Request $request)
    {
        $validated = $request->validate([
            'motivo' => 'required|string|min:5|max:2000',
        ]);

        $solicitud = SolicitudData::find($id);
        if (!$solicitud) {
            return redirect()->back()->with('error', 'Solicitud no encontrada.');
        }

        if (!in_array($solicitud['estado'] ?? '', ['pendiente', 'ampliada'])) {
            return redirect()->back()->with('error', 'No se puede cancelar esta solicitud porque ya fue respondida o cancelada.');
        }

        SolicitudData::cancelar($id, $validated['motivo']);

        DenunciaData::registrarAccion(
            $solicitud['ticket'],
            'solicitud_cancelada',
            "Solicitud a {$solicitud['unidad_destino']} cancelada. Motivo: {$validated['motivo']}",
            'sistema'
        );

        return redirect()->back()->with('success', "Solicitud a {$solicitud['unidad_destino']} cancelada.");
    }

    public function ampliar(int $id, Request $request)
    {
        $validated = $request->validate([
            'dias' => 'required|integer|min:1|max:5',
            'justificacion' => 'required|string|min:10|max:2000',
        ]);

        $solicitud = SolicitudData::find($id);
        if (!$solicitud) {
            return redirect()->back()->with('error', 'Solicitud no encontrada.');
        }

        if (in_array($solicitud['estado'] ?? '', ['respondida', 'cancelada'])) {
            return redirect()->back()->with('error', 'No se puede ampliar una solicitud ya respondida o cancelada.');
        }

        SolicitudData::ampliar($id, $validated['dias'], $validated['justificacion']);

        $numAmpliaciones = count($solicitud['ampliaciones']) + 1;

        DenunciaData::registrarAccion(
            $solicitud['ticket'],
            'solicitud_ampliada',
            "Plazo ampliado {$validated['dias']} días (ampliación #{$numAmpliaciones}) para solicitud a {$solicitud['unidad_destino']}. Justificación: {$validated['justificacion']}",
            'sistema'
        );

        return redirect()->back()->with('success', "Plazo ampliado {$validated['dias']} días correctamente (ampliación #{$numAmpliaciones}).");
    }

    public function editar(int $id, Request $request)
    {
        $validated = $request->validate([
            'unidad_destino' => 'required|string|min:2|max:200',
            'detalle' => 'required|string|min:5|max:2000',
            'plazo_dias' => 'required|integer|min:1|max:45',
        ]);

        $solicitud = SolicitudData::find($id);
        if (!$solicitud) {
            return redirect()->back()->with('error', 'Solicitud no encontrada.');
        }

        SolicitudData::editar($id, $validated);

        return redirect()->back()->with('success', "Solicitud a {$validated['unidad_destino']} actualizada correctamente.");
    }

    public function eliminar(int $id, Request $request)
    {
        $solicitud = SolicitudData::find($id);
        if (!$solicitud) {
            return redirect()->back()->with('error', 'Solicitud no encontrada.');
        }

        SolicitudData::eliminar($id);

        return redirect()->back()->with('success', "Solicitud a {$solicitud['unidad_destino']} eliminada correctamente.");
    }
}
