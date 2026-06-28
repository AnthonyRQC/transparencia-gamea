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
            'unidad_destino' => 'required|string|in:' . implode(',', array_keys(UnidadData::UNIDADES)),
            'detalle' => 'required|string|min:10|max:2000',
        ]);

        $denuncia = DenunciaData::find($ticket);
        if (!$denuncia) {
            return redirect()->back()->with('error', 'Denuncia no encontrada.');
        }

        if (!in_array($denuncia['estado'] ?? '', ['asignada', 'investigacion', 'informe'])) {
            return redirect()->back()->with('error', 'No se pueden crear solicitudes en el estado actual de la denuncia.');
        }

        $id = SolicitudData::add($ticket, $validated['unidad_destino'], $validated['detalle']);
        $unidadNombre = UnidadData::getNombre($validated['unidad_destino']);

        DenunciaData::registrarAccion($ticket, 'solicitud_creada', "Solicitud de información enviada a {$unidadNombre}: {$validated['detalle']}", 'sistema');

        return redirect()->back()->with('success', "Solicitud creada correctamente para {$unidadNombre}.");
    }

    public function responder(int $id, Request $request)
    {
        $validated = $request->validate([
            'respuesta' => 'required|string|min:10|max:5000',
            'archivos' => 'nullable|array',
        ]);

        $solicitud = SolicitudData::find($id);
        if (!$solicitud) {
            return redirect()->back()->with('error', 'Solicitud no encontrada.');
        }

        if ($solicitud['estado'] === 'respondida') {
            return redirect()->back()->with('error', 'Esta solicitud ya fue respondida.');
        }

        $archivos = array_map(fn($a) => [
            'nombre' => $a['nombre'] ?? 'documento.pdf',
            'tamano' => $a['tamano'] ?? '0 B',
            'fecha_subida' => now()->toDateTimeString(),
        ], $validated['archivos'] ?? []);

        SolicitudData::responder($id, $validated['respuesta'], $archivos);

        DenunciaData::registrarAccion($solicitud['ticket'], 'solicitud_respondida', "Respuesta recibida de {$solicitud['unidad_destino']}", 'sistema');

        return redirect()->back()->with('success', 'Respuesta de solicitud registrada correctamente.');
    }

    public function ampliar(int $id, Request $request)
    {
        $validated = $request->validate([
            'dias' => 'required|integer|min:1|max:5',
            'justificacion' => 'required|string|min:20|max:2000',
            'archivo' => 'nullable|array',
        ]);

        $solicitud = SolicitudData::find($id);
        if (!$solicitud) {
            return redirect()->back()->with('error', 'Solicitud no encontrada.');
        }

        if ($solicitud['estado'] === 'respondida') {
            return redirect()->back()->with('error', 'No se puede ampliar una solicitud ya respondida.');
        }

        $archivo = $validated['archivo'] ?? null;

        SolicitudData::ampliar($id, $validated['dias'], $validated['justificacion'], $archivo);

        DenunciaData::registrarAccion(
            $solicitud['ticket'],
            'solicitud_ampliada',
            "Plazo ampliado {$validated['dias']} días para solicitud a {$solicitud['unidad_destino']}. Justificación: {$validated['justificacion']}",
            'sistema'
        );

        return redirect()->back()->with('success', "Plazo ampliado {$validated['dias']} días correctamente.");
    }
}
