<?php

namespace App\Http\Controllers;

use App\Models\Bitacora;
use App\Models\Denuncia;
use App\Models\Descargo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DescargoController extends Controller
{
    public function store(string $ticket, Request $request)
    {
        $validated = $request->validate([
            'denunciado_id' => 'required|integer|exists:denunciados,id',
            'nombres' => 'required|string|max:200',
            'dependencia' => 'nullable|string|max:200',
        ]);

        $denuncia = Denuncia::where('ticket', $ticket)->firstOrFail();

        $descargo = $denuncia->descargos()->create([
            'denunciado_id' => $validated['denunciado_id'],
            'estado' => 'pendiente_notif',
        ]);

        Bitacora::create([
            'denuncia_id' => $denuncia->id,
            'accion' => 'descargo_creado',
            'detalle' => 'Registro de descargo iniciado para ' . $validated['nombres'],
            'usuario_id' => Auth::id(),
            'fecha' => now(),
        ]);

        return redirect()->back()->with('success', 'Descargo registrado para ' . $validated['nombres'] . '.');
    }

    public function notificar(int $id, Request $request)
    {
        $validated = $request->validate([
            'fecha_notificacion' => 'required|date|before_or_equal:today',
            'medio' => 'required|string|max:200',
            'plazo_dias' => 'required|integer|min:1|max:365',
        ]);

        $descargo = Descargo::findOrFail($id);

        if ($descargo->estado !== 'pendiente_notif') {
            return redirect()->back()->with('error', 'Este descargo ya fue notificado.');
        }

        $descargo->update([
            'fecha_notificacion' => $validated['fecha_notificacion'],
            'medio' => $validated['medio'],
            'fecha_vencimiento' => now()->addDays((int) $validated['plazo_dias']),
            'estado' => 'notificado',
        ]);

        Bitacora::create([
            'denuncia_id' => $descargo->denuncia_id,
            'accion' => 'descargo_notificado',
            'detalle' => 'Descargo notificado mediante ' . $validated['medio'],
            'usuario_id' => Auth::id(),
            'fecha' => now(),
        ]);

        return redirect()->back()->with('success', 'Notificación de descargo registrada correctamente.');
    }

    public function responder(int $id, Request $request)
    {
        $validated = $request->validate([
            'resumen_descargo' => 'required|string|min:5|max:5000',
            'fecha_respuesta' => 'nullable|date|before_or_equal:today',
        ]);

        $descargo = Descargo::findOrFail($id);

        if ($descargo->estado === 'respondido') {
            return redirect()->back()->with('error', 'Este descargo ya fue respondido.');
        }

        if ($descargo->estado === 'pendiente_notif') {
            return redirect()->back()->with('error', 'Primero debe notificar el descargo antes de registrar la respuesta.');
        }

        $descargo->update([
            'resumen_descargo' => $validated['resumen_descargo'],
            'fecha_respuesta' => $validated['fecha_respuesta'] ?? now(),
            'estado' => 'respondido',
        ]);

        Bitacora::create([
            'denuncia_id' => $descargo->denuncia_id,
            'accion' => 'descargo_respondido',
            'detalle' => 'Descargo respondido.',
            'usuario_id' => Auth::id(),
            'fecha' => now(),
        ]);

        return redirect()->back()->with('success', 'Descargo registrado correctamente.');
    }

    public function ampliar(int $id, Request $request)
    {
        $validated = $request->validate([
            'dias' => 'required|integer|min:1|max:5',
            'justificacion' => 'required|string|min:10|max:2000',
        ]);

        $descargo = Descargo::findOrFail($id);

        if ($descargo->estado === 'respondido') {
            return redirect()->back()->with('error', 'No se puede ampliar un descargo ya respondido.');
        }

        if ($descargo->estado === 'pendiente_notif') {
            return redirect()->back()->with('error', 'Primero debe notificar el descargo antes de ampliar el plazo.');
        }

        $numAmpliacion = $descargo->ampliaciones()->count() + 1;

        $descargo->ampliaciones()->create([
            'dias' => (int) $validated['dias'],
            'justificacion' => $validated['justificacion'],
            'fecha' => now(),
        ]);

        $descargo->update([
            'estado' => 'ampliado',
            'fecha_vencimiento' => $descargo->fecha_vencimiento->addDays((int) $validated['dias']),
        ]);

        Bitacora::create([
            'denuncia_id' => $descargo->denuncia_id,
            'accion' => 'descargo_ampliado',
            'detalle' => 'Plazo ampliado ' . $validated['dias'] . ' días (ampliación #' . $numAmpliacion . ') para descargo.',
            'usuario_id' => Auth::id(),
            'fecha' => now(),
        ]);

        return redirect()->back()->with('success', 'Plazo ampliado ' . $validated['dias'] . ' días correctamente (ampliación #' . $numAmpliacion . ').');
    }

    public function cancelar(int $id, Request $request)
    {
        $validated = $request->validate([
            'motivo' => 'required|string|min:5|max:2000',
        ]);

        $descargo = Descargo::findOrFail($id);

        if (in_array($descargo->estado, ['respondido', 'cancelado'])) {
            return redirect()->back()->with('error', 'No se puede cancelar este descargo.');
        }

        $descargo->update([
            'motivo_cancelacion' => $validated['motivo'],
            'fecha_cancelacion' => now(),
            'estado' => 'cancelado',
        ]);

        Bitacora::create([
            'denuncia_id' => $descargo->denuncia_id,
            'accion' => 'descargo_cancelado',
            'detalle' => 'Descargo cancelado. Motivo: ' . $validated['motivo'],
            'usuario_id' => Auth::id(),
            'fecha' => now(),
        ]);

        return redirect()->back()->with('success', 'Descargo cancelado correctamente.');
    }

    public function editar(int $id, Request $request)
    {
        $validated = $request->validate([
            'resumen_descargo' => 'required|string|max:5000',
            'medio' => 'nullable|string|max:200',
        ]);

        $descargo = Descargo::findOrFail($id);

        $historial = $descargo->historial_ediciones ?? [];
        $historial[] = [
            'fecha' => now()->toDateTimeString(),
            'campo' => 'resumen_descargo',
            'anterior' => $descargo->resumen_descargo,
            'nuevo' => $validated['resumen_descargo'],
            'usuario_id' => Auth::id(),
        ];

        $descargo->update([
            'resumen_descargo' => $validated['resumen_descargo'],
            'medio' => $validated['medio'] ?? $descargo->medio,
            'historial_ediciones' => $historial,
        ]);

        return redirect()->back()->with('success', 'Descargo actualizado correctamente.');
    }

    public function eliminar(int $id)
    {
        $descargo = Descargo::findOrFail($id);

        $descargo->update([
            'eliminado' => true,
            'fecha_eliminacion' => now(),
        ]);

        return redirect()->back()->with('success', 'Descargo eliminado correctamente.');
    }
}
