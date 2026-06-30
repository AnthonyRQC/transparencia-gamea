<?php

namespace App\Http\Controllers;

use App\Data\DenunciaData;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DenunciaController extends Controller
{
    public function create()
    {
        return Inertia::render('Denuncias/RegistroDenuncia', [
            'categorias' => DenunciaData::getCategorias(),
        ]);
    }

    public function store(Request $request)
    {
        $rules = [
            'tipo' => 'required|in:corrupcion,negacion,acompaniamiento,intervencion',
            'escenario' => 'required|in:revelada,reservada,anonimo',
            'declaracion_jurada' => 'required|boolean|accepted',
        ];

        if (in_array($request->tipo, ['corrupcion', 'negacion'])) {
            if ($request->escenario !== 'anonimo') {
                $rules = array_merge($rules, [
                    'denunciante.nombres' => 'required|string|min:2|max:100',
                    'denunciante.ci' => 'required|digits_between:6,9',
                    'denunciante.email' => 'required|email',
                    'denunciante.telefono' => 'required|digits:8',
                ]);
            } else {
                $rules = array_merge($rules, [
                    'denunciante.email' => 'nullable|email',
                    'denunciante.telefono' => 'nullable|digits:8',
                ]);
            }

            $rules = array_merge($rules, [
                'denunciados' => 'required|array|min:1',
                'denunciados.*.conoce_identidad' => 'required|boolean',
                'denunciados.*.nombres' => 'required_if:denunciados.*.conoce_identidad,true|nullable|string|max:100',
                'denunciados.*.dependencia' => 'required_if:denunciados.*.conoce_identidad,true|nullable|string|max:200',
                'denunciados.*.descripcion' => 'required_if:denunciados.*.conoce_identidad,false|nullable|string',

                'detalles.categoria' => 'required|string',
                'detalles.fecha' => 'required|date|before_or_equal:today|after_or_equal:' . now()->subYears(5)->format('Y-m-d'),
                'detalles.hora' => 'nullable',
                'detalles.lugar' => 'required|string|max:200',

                'hechos' => 'required|string|min:20|max:5000',

                'pruebas' => 'nullable|array',
                'pruebas.*.tipo' => 'required_with:pruebas.*|in:archivo,fisica,testigo',
                'pruebas.*.descripcion' => 'required_with:pruebas.*|string',
                'pruebas.*.testigo_nombre' => 'required_if:pruebas.*.tipo,testigo|nullable|string|max:100',
                'pruebas.*.testigo_telefono' => 'required_if:pruebas.*.tipo,testigo|nullable|digits:8',
            ]);
        }

        if ($request->tipo === 'acompaniamiento') {
            $rules = array_merge($rules, [
                'nombres' => 'required|string|min:2|max:100',
                'ci' => 'nullable|digits_between:6,9',
                'dependencia_funcionario' => 'required|string|max:200',
                'motivo' => 'required|string|min:20|max:5000',
                'resolucion' => 'required|string|min:10|max:5000',
                'evidencia' => 'nullable',
            ]);
        }

        if ($request->tipo === 'intervencion') {
            $rules = array_merge($rules, [
                'dependencia_observada' => 'required|string|max:200',
                'motivo' => 'required|string|min:20|max:5000',
                'archivo' => 'required',
                'referencia_nota' => 'required|string|max:200',
            ]);
        }

        $validated = $request->validate($rules);

        $ticket = DenunciaData::add($validated);
        $denuncia = DenunciaData::find($ticket);
        $token = $denuncia['token_consulta'] ?? '';

        return redirect()->back()->with([
            'success' => true,
            'ticket' => $ticket,
            'token' => $token,
        ]);
    }

    public function admitir(string $ticket, Request $request)
    {
        $validated = $request->validate([
            'justificacion' => 'nullable|string|max:500',
        ]);

        $denuncia = DenunciaData::find($ticket);
        if (!$denuncia || $denuncia['estado'] !== 'ingresada') {
            return redirect()->back()->with('error', 'No se puede admitir esta denuncia.');
        }

        DenunciaData::admitir($ticket, $validated['justificacion'] ?? null);

        return redirect()->back()->with('success', "Denuncia {$ticket} admitida correctamente.");
    }

    public function rechazar(string $ticket, Request $request)
    {
        $validated = $request->validate([
            'justificacion' => 'required|string|min:10|max:2000',
            'resumen_rechazo' => 'nullable|string|max:200',
        ]);

        $denuncia = DenunciaData::find($ticket);
        if (!$denuncia || $denuncia['estado'] !== 'ingresada') {
            return redirect()->back()->with('error', 'No se puede rechazar esta denuncia.');
        }

        DenunciaData::rechazar($ticket, $validated['justificacion'], $validated['resumen_rechazo'] ?? null);

        return redirect()->back()->with('success', "Denuncia {$ticket} rechazada.");
    }

    public function iniciarInvestigacion(string $ticket)
    {
        $denuncia = DenunciaData::find($ticket);
        if (!$denuncia || $denuncia['estado'] !== 'asignada') {
            return redirect()->back()->with('error', 'No se puede iniciar investigación.');
        }

        DenunciaData::iniciarInvestigacion($ticket);

        return redirect()->back()->with('success', "Investigación iniciada para {$ticket}.");
    }

    // ──────────────────────────────────────────────
    //  SPRINT 3 — NUEVAS ACCIONES
    // ──────────────────────────────────────────────

    public function asignar(string $ticket, Request $request)
    {
        $validated = $request->validate([
            'tecnico_id' => 'required|string|in:tec-1,tec-2,tec-3',
        ]);

        $denuncia = DenunciaData::find($ticket);
        if (!$denuncia || $denuncia['estado'] !== 'admitida') {
            return redirect()->back()->with('error', 'No se puede asignar esta denuncia.');
        }

        DenunciaData::asignarTecnico($ticket, $validated['tecnico_id']);

        return redirect()->back()->with('success', "Denuncia {$ticket} asignada correctamente.");
    }

    public function traspasar(string $ticket, Request $request)
    {
        $validated = $request->validate([
            'tecnico_id' => 'required|string|in:tec-1,tec-2,tec-3',
            'justificacion' => 'required|string|min:10|max:2000',
        ]);

        $denuncia = DenunciaData::find($ticket);

        if (!$denuncia || !in_array($denuncia['estado'] ?? '', ['asignada', 'investigacion', 'informe'])) {
            return redirect()->back()->with('error', 'No se puede traspasar esta denuncia.');
        }

        if (($denuncia['tecnico'] ?? '') === $validated['tecnico_id']) {
            return redirect()->back()->with('error', 'No se puede traspasar al mismo técnico.');
        }

        DenunciaData::traspasar($ticket, $validated['tecnico_id'], $validated['justificacion']);

        return redirect()->back()->with('success', "Denuncia {$ticket} traspasada correctamente.");
    }

    public function reabrir(string $ticket, Request $request)
    {
        $validated = $request->validate([
            'justificacion' => 'required|string|min:20|max:2000',
            'nueva_fecha_limite' => 'required|date|after_or_equal:today',
        ]);

        $denuncia = DenunciaData::find($ticket);
        if (!$denuncia || !in_array($denuncia['estado'] ?? '', ['rechazada', 'cerrada'])) {
            return redirect()->back()->with('error', 'No se puede reabrir esta denuncia.');
        }

        DenunciaData::reabrir($ticket, $validated['justificacion'], $validated['nueva_fecha_limite']);

        return redirect()->back()->with('success', "Denuncia {$ticket} reabierta correctamente. Volvió a la bandeja 'Por admitir'.");
    }

    public function cargaTecnicos()
    {
        return response()->json(DenunciaData::getCargaTecnicos());
    }

    // ──────────────────────────────────────────────
    //  SPRINT 4 — Saltar Fase
    // ──────────────────────────────────────────────

    public function saltarFase(string $ticket, Request $request)
    {
        $validated = $request->validate([
            'justificacion' => 'required|string|min:20|max:2000',
        ]);

        $denuncia = DenunciaData::find($ticket);
        if (!$denuncia || $denuncia['estado'] !== 'investigacion') {
            return redirect()->back()->with('error', 'No se puede saltar la fase de esta denuncia.');
        }

        $solicitudes = DenunciaData::getSolicitudes($ticket);
        $descargos = DenunciaData::getDescargos($ticket);
        $pendientes = collect($solicitudes)->filter(fn($s) => $s['estado'] === 'pendiente')->count()
            + collect($descargos)->filter(fn($d) => in_array($d['estado'], ['pendiente_notif', 'notificado']))->count();

        DenunciaData::saltarFase($ticket, $validated['justificacion']);

        $msg = "Denuncia {$ticket} pasó a Informe Final.";
        if ($pendientes > 0) {
            $msg .= " Quedan {$pendientes} item(s) pendiente(s) de solicitudes/descargos.";
        }

        return redirect()->back()->with('success', $msg);
    }

    // ──────────────────────────────────────────────
    //  SPRINT 5 — Informe Final y Cierre
    // ──────────────────────────────────────────────

    public function guardarInforme(string $ticket, Request $request)
    {
        $validated = $request->validate([
            'clasificacion' => 'required|in:penal,civil,administrativo,sin_indicios,medida_correctiva,archivado',
            'fojas' => 'required|integer|min:1|max:9999',
            'justificacion' => 'required|string|min:20|max:5000',
            'archivos' => 'nullable|array',
            'concluido_por' => 'required|string|min:2|max:100',
        ]);

        $denuncia = DenunciaData::find($ticket);
        if (!$denuncia || !in_array($denuncia['estado'] ?? '', ['informe', 'cerrada'])) {
            return redirect()->back()->with('error', 'No se puede redactar el informe en esta denuncia.');
        }

        DenunciaData::guardarInforme($ticket, $validated);

        return redirect()->back()->with('success', "Informe Final redactado para {$ticket}.");
    }

    public function editarInforme(string $ticket, Request $request)
    {
        $validated = $request->validate([
            'clasificacion' => 'required|in:penal,civil,administrativo,sin_indicios,medida_correctiva,archivado',
            'fojas' => 'required|integer|min:1|max:9999',
            'justificacion' => 'required|string|min:20|max:5000',
            'archivos' => 'nullable|array',
            'concluido_por' => 'required|string|min:2|max:100',
        ]);

        $denuncia = DenunciaData::find($ticket);
        if (!$denuncia || !in_array($denuncia['estado'] ?? '', ['informe', 'cerrada'])) {
            return redirect()->back()->with('error', 'No se puede editar el informe de esta denuncia.');
        }

        DenunciaData::editarInforme($ticket, $validated);

        return redirect()->back()->with('success', "Informe Final actualizado para {$ticket}.");
    }

    public function eliminarInforme(string $ticket)
    {
        $denuncia = DenunciaData::find($ticket);
        if (!$denuncia || !in_array($denuncia['estado'] ?? '', ['informe', 'cerrada'])) {
            return redirect()->back()->with('error', 'No se puede eliminar el informe de esta denuncia.');
        }

        DenunciaData::eliminarInforme($ticket);

        return redirect()->back()->with('success', "Informe Final eliminado de {$ticket}.");
    }

    public function guardarCierre(string $ticket, Request $request)
    {
        $validated = $request->validate([
            'sitpreco' => 'nullable|string|min:3|max:50',
            'notificado_denunciante' => 'required|boolean',
            'notificacion_medio' => 'required_if:notificado_denunciante,true|nullable|in:whatsapp,email,presencial,otro',
            'notificacion_fecha' => 'required_if:notificado_denunciante,true|nullable|date|before_or_equal:today',
            'notificacion_descripcion' => 'required_if:notificado_denunciante,true|nullable|string|min:10|max:2000',
            'no_notificado_motivo' => 'required_if:notificado_denunciante,false|nullable|string|max:500',
            'concluido_por' => 'required|string|min:2|max:100',
            'descripcion' => 'required|string|min:20|max:5000',
            'archivos' => 'nullable|array',
        ]);

        $denuncia = DenunciaData::find($ticket);
        if (!$denuncia || $denuncia['estado'] !== 'informe') {
            return redirect()->back()->with('error', 'No se puede cerrar esta denuncia.');
        }

        DenunciaData::guardarCierre($ticket, $validated);

        $cod = $validated['sitpreco'] ?? '—';
        return redirect()->back()->with('success', "Denuncia {$ticket} cerrada. SITPRECO: {$cod}");
    }

    public function editarCierre(string $ticket, Request $request)
    {
        $validated = $request->validate([
            'sitpreco' => 'nullable|string|min:3|max:50',
            'notificado_denunciante' => 'required|boolean',
            'notificacion_medio' => 'required_if:notificado_denunciante,true|nullable|in:whatsapp,email,presencial,otro',
            'notificacion_fecha' => 'required_if:notificado_denunciante,true|nullable|date|before_or_equal:today',
            'notificacion_descripcion' => 'required_if:notificado_denunciante,true|nullable|string|min:10|max:2000',
            'no_notificado_motivo' => 'required_if:notificado_denunciante,false|nullable|string|max:500',
            'concluido_por' => 'required|string|min:2|max:100',
            'descripcion' => 'required|string|min:20|max:5000',
            'archivos' => 'nullable|array',
        ]);

        $denuncia = DenunciaData::find($ticket);
        if (!$denuncia || $denuncia['estado'] !== 'cerrada') {
            return redirect()->back()->with('error', 'No se puede editar el cierre de esta denuncia.');
        }

        DenunciaData::editarCierre($ticket, $validated);

        return redirect()->back()->with('success', "Cierre actualizado para {$ticket}.");
    }

    public function eliminarCierre(string $ticket)
    {
        $denuncia = DenunciaData::find($ticket);
        if (!$denuncia || $denuncia['estado'] !== 'cerrada') {
            return redirect()->back()->with('error', 'No se puede eliminar el cierre de esta denuncia.');
        }

        DenunciaData::eliminarCierre($ticket);

        return redirect()->back()->with('success', "Cierre eliminado. Denuncia {$ticket} vuelve a Informe Final.");
    }

    // ──────────────────────────────────────────────
    //  SPRINT 8 — Ampliaciones Múltiples
    // ──────────────────────────────────────────────

    public function aprobarAmpliacion(string $ticket, Request $request)
    {
        $validated = $request->validate([
            'dias' => 'required|integer|min:1|max:45',
            'justificacion' => 'required|string|min:10|max:500',
            'solicitado_por' => 'nullable|string|max:100',
        ]);

        $denuncia = DenunciaData::find($ticket);
        if (!$denuncia || !in_array($denuncia['estado'] ?? '', ['admitida', 'asignada', 'investigacion', 'informe'])) {
            return redirect()->back()->with('error', 'No se puede ampliar el plazo de esta denuncia.');
        }

        $result = DenunciaData::aprobarAmpliacion(
            ticket: $ticket,
            dias: $validated['dias'],
            justificacion: $validated['justificacion'],
            solicitadoPor: $validated['solicitado_por'] ?? null
        );

        if ($result === false) {
            return redirect()->back()->with('error', 'Denuncia no encontrada.');
        }

        if (isset($result['error'])) {
            return redirect()->back()->with('error', $result['error']);
        }

        return redirect()->back()->with('success', "Plazo ampliado {$validated['dias']} días correctamente para {$ticket}.");
    }
}
