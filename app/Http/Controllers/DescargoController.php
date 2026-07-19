<?php

namespace App\Http\Controllers;

use App\Data\DenunciaData;
use App\Data\DescargoData;
use Illuminate\Http\Request;

class DescargoController extends Controller
{
    public function store(string $ticket, Request $request)
    {
        $validated = $request->validate([
            'denunciado_idx' => 'required|integer|min:-1',
            'nombres' => 'required|string|max:200',
            'dependencia' => 'nullable|string|max:200',
        ]);

        $denuncia = DenunciaData::find($ticket);
        if (!$denuncia) {
            return redirect()->back()->with('error', 'Denuncia no encontrada.');
        }

        $id = DescargoData::add($ticket, (int) $validated['denunciado_idx'], $validated['nombres'], $validated['dependencia'] ?? '');

        DenunciaData::registrarAccion($ticket, 'descargo_creado', "Registro de descargo iniciado para {$validated['nombres']}", 'sistema');

        return redirect()->back()->with('success', "Descargo registrado para {$validated['nombres']}.");
    }

    public function notificar(int $id, Request $request)
    {
        $validated = $request->validate([
            'fecha_notificacion' => 'required|date|before_or_equal:today',
            'medio' => 'required|string|max:200',
            'plazo_dias' => 'required|integer|min:1|max:365',
        ]);

        $descargo = DescargoData::find($id);
        if (!$descargo) {
            return redirect()->back()->with('error', 'Descargo no encontrado.');
        }

        if ($descargo['estado'] !== 'pendiente_notif') {
            return redirect()->back()->with('error', 'Este descargo ya fue notificado.');
        }

        $plazoDias = (int) $validated['plazo_dias'];

        DescargoData::notificar($id, $validated['fecha_notificacion'], $validated['medio'], null, $plazoDias);

        $medioLabel = DescargoData::getMedioLabel($validated['medio']);

        DenunciaData::registrarAccion(
            $descargo['ticket'],
            'descargo_notificado',
            "Descargo notificado a {$descargo['nombres_denunciado']} mediante {$medioLabel}",
            'sistema'
        );

        return redirect()->back()->with('success', "Notificación de descargo registrada para {$descargo['nombres_denunciado']}.");
    }

    public function responder(int $id, Request $request)
    {
        $validated = $request->validate([
            'resumen_descargo' => 'required|string|min:5|max:5000',
        ]);

        $descargo = DescargoData::find($id);
        if (!$descargo) {
            return redirect()->back()->with('error', 'Descargo no encontrado.');
        }

        if ($descargo['estado'] === 'respondido') {
            return redirect()->back()->with('error', 'Este descargo ya fue respondido.');
        }

        if ($descargo['estado'] === 'pendiente_notif') {
            return redirect()->back()->with('error', 'Primero debe notificar el descargo antes de registrar la respuesta.');
        }

        DescargoData::responder($id, $validated['resumen_descargo']);

        DenunciaData::registrarAccion($descargo['ticket'], 'descargo_respondido', "Descargo recibido de {$descargo['nombres_denunciado']}", 'sistema');

        return redirect()->back()->with('success', "Descargo de {$descargo['nombres_denunciado']} registrado correctamente.");
    }

    public function ampliar(int $id, Request $request)
    {
        $validated = $request->validate([
            'dias' => 'required|integer|min:1|max:5',
            'justificacion' => 'required|string|min:10|max:2000',
        ]);

        $descargo = DescargoData::find($id);
        if (!$descargo) {
            return redirect()->back()->with('error', 'Descargo no encontrado.');
        }

        if ($descargo['estado'] === 'respondido') {
            return redirect()->back()->with('error', 'No se puede ampliar un descargo ya respondido.');
        }

        if ($descargo['estado'] === 'pendiente_notif') {
            return redirect()->back()->with('error', 'Primero debe notificar el descargo antes de ampliar el plazo.');
        }

        DescargoData::ampliar($id, $validated['dias'], $validated['justificacion']);

        DenunciaData::registrarAccion(
            $descargo['ticket'],
            'descargo_ampliado',
            "Plazo ampliado {$validated['dias']} días para descargo de {$descargo['nombres_denunciado']}. Justificación: {$validated['justificacion']}",
            'sistema'
        );

        return redirect()->back()->with('success', "Plazo ampliado {$validated['dias']} días para el descargo de {$descargo['nombres_denunciado']}.");
    }

    public function cancelar(int $id, Request $request)
    {
        $validated = $request->validate([
            'motivo' => 'required|string|min:5|max:2000',
        ]);

        $descargo = DescargoData::find($id);
        if (!$descargo) {
            return redirect()->back()->with('error', 'Descargo no encontrado.');
        }

        if (in_array($descargo['estado'], ['respondido', 'cancelado'])) {
            return redirect()->back()->with('error', 'No se puede cancelar este descargo.');
        }

        DescargoData::cancelar($id, $validated['motivo']);

        DenunciaData::registrarAccion(
            $descargo['ticket'],
            'descargo_cancelado',
            "Se canceló el requerimiento de descargo para {$descargo['nombres_denunciado']}. Motivo: {$validated['motivo']}",
            'sistema'
        );

        return redirect()->back()->with('success', "Descargo de {$descargo['nombres_denunciado']} cancelado.");
    }

    public function editar(int $id, Request $request)
    {
        $validated = $request->validate([
            'nombres' => 'required|string|max:200',
            'dependencia' => 'nullable|string|max:200',
        ]);

        $descargo = DescargoData::find($id);
        if (!$descargo) {
            return redirect()->back()->with('error', 'Descargo no encontrado.');
        }

        DescargoData::editar($id, [
            'nombres_denunciado' => $validated['nombres'],
            'dependencia_denunciado' => $validated['dependencia'] ?? '',
        ]);

        return redirect()->back()->with('success', "Descargo de {$validated['nombres']} actualizado correctamente.");
    }

    public function eliminar(int $id, Request $request)
    {
        $descargo = DescargoData::find($id);
        if (!$descargo) {
            return redirect()->back()->with('error', 'Descargo no encontrado.');
        }

        DescargoData::eliminar($id);

        return redirect()->back()->with('success', "Descargo de {$descargo['nombres_denunciado']} eliminado correctamente.");
    }
}
