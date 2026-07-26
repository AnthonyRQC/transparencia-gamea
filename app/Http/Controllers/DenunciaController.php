<?php

namespace App\Http\Controllers;

use App\Models\Ampliacion;
use App\Models\Bitacora;
use App\Models\CategoriaDenuncia;
use App\Models\Cierre;
use App\Models\Denuncia;
use App\Models\EvaluacionTecnica;
use App\Models\InformeFinal;
use App\Models\Notificacion;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DenunciaController extends Controller
{
    public function create()
    {
        return Inertia::render('Denuncias/RegistroDenuncia', [
            'categorias' => CategoriaDenuncia::where('activa', true)->get(),
        ]);
    }

    public function store(Request $request)
    {
        $rules = [
            'tipo' => 'required|in:corrupcion,negacion',
            'escenario' => 'required|in:revelada,reservada,anonimo',
            'declaracion_jurada' => 'required|boolean|accepted',
        ];

        if (in_array($request->tipo, ['corrupcion', 'negacion'])) {
            if ($request->escenario !== 'anonimo') {
                $rules = array_merge($rules, [
                    'denunciante.nombres' => 'required|string|min:2|max:100',
                    'denunciante.ci' => 'nullable|digits_between:6,9',
                    'denunciante.email' => 'nullable|email',
                    'denunciante.telefono' => 'nullable|digits:8',
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
                'denunciados.*.dependencia' => 'nullable|string|max:200',
                'denunciados.*.descripcion' => 'required_if:denunciados.*.conoce_identidad,false|nullable|string',
                'detalles.categoria' => 'required',
                'detalles.fecha' => 'required|date|before_or_equal:today|after_or_equal:' . now()->subYears(5)->format('Y-m-d'),
                'detalles.hora' => 'nullable',
                'detalles.lugar' => 'required|string|max:200',
                'hechos' => 'required|string|min:10|max:8000',
                'pruebas' => 'nullable|array',
                'pruebas.*.tipo' => 'required_with:pruebas.*|in:archivo,fisica,testigo',
                'pruebas.*.descripcion' => 'nullable|string',
                'pruebas.*.testigo_nombre' => 'required_if:pruebas.*.tipo,testigo|nullable|string|max:100',
                'pruebas.*.testigo_telefono' => 'required_if:pruebas.*.tipo,testigo|nullable|digits:8',
            ]);
        }

        $validated = $request->validate($rules);

        $denuncia = DB::transaction(function () use ($validated) {
            $ticket = Denuncia::generarSiguienteTicket();
            $token = Denuncia::generarToken();

            $denuncia = Denuncia::create([
                'ticket' => $ticket,
                'token_consulta' => $token,
                'tipo' => $validated['tipo'],
                'escenario' => $validated['escenario'],
                'estado' => 'ingresada',
                'categoria_id' => $validated['detalles']['categoria'],
                'fecha_hechos' => $validated['detalles']['fecha'],
                'hora_hechos' => $validated['detalles']['hora'] ?? null,
                'lugar_hechos' => $validated['detalles']['lugar'],
                'hechos' => $validated['hechos'],
                'declaracion_jurada' => true,
                'registrado_por_id' => Auth::id(),
            ]);

            if (isset($validated['denunciante'])) {
                $denuncia->denunciante()->create([
                    'nombres' => $validated['denunciante']['nombres'] ?? null,
                    'ci' => $validated['denunciante']['ci'] ?? null,
                    'email' => $validated['denunciante']['email'] ?? null,
                    'telefono' => $validated['denunciante']['telefono'] ?? null,
                ]);
            }

            if (isset($validated['denunciados'])) {
                foreach ($validated['denunciados'] as $i => $dd) {
                    $denuncia->denunciados()->create([
                        'orden' => $i,
                        'conoce_identidad' => (bool) ($dd['conoce_identidad'] ?? false),
                        'nombres' => ($dd['conoce_identidad'] ?? false) ? ($dd['nombres'] ?? '') : null,
                        'dependencia' => $dd['dependencia'] ?? null,
                        'descripcion' => !($dd['conoce_identidad'] ?? false) ? ($dd['descripcion'] ?? '') : null,
                    ]);
                }
            }

            if (isset($validated['pruebas'])) {
                foreach ($validated['pruebas'] as $p) {
                    $denuncia->pruebas()->create([
                        'tipo' => $p['tipo'],
                        'descripcion' => $p['descripcion'] ?? '',
                        'testigo_nombre' => $p['testigo_nombre'] ?? null,
                        'testigo_telefono' => $p['testigo_telefono'] ?? null,
                    ]);
                }
            }

            $denuncia->bitacora()->create([
                'accion' => 'ingresada',
                'detalle' => 'DENUNCIA REGISTRADA CON TICKET ' . $ticket,
                'usuario_id' => Auth::id(),
                'fecha' => now(),
            ]);

            return $denuncia;
        });

        return redirect()->back()->with([
            'success' => true,
            'ticket' => $denuncia->ticket,
            'token' => $denuncia->token_consulta,
        ]);
    }

    public function admitir(string $ticket, Request $request)
    {
        $validated = $request->validate([
            'justificacion' => 'nullable|string|max:500',
        ]);

        $denuncia = Denuncia::where('ticket', $ticket)->firstOrFail();

        if ($denuncia->estado !== 'ingresada') {
            return redirect()->back()->with('error', 'No se puede admitir esta denuncia.');
        }

        DB::transaction(function () use ($denuncia, $validated) {
            $denuncia->update([
                'estado' => 'admitida',
                'fecha_admitida' => now(),
                'justificacion_admision' => $validated['justificacion'] ?? null,
            ]);

            $denuncia->bitacora()->create([
                'accion' => 'admitida',
                'detalle' => 'DENUNCIA ADMITIDA PARA INVESTIGACIÓN',
                'usuario_id' => Auth::id(),
                'fecha' => now(),
            ]);
        });

        return redirect()->back()->with('success', "Denuncia {$ticket} admitida correctamente.");
    }

    public function rechazar(string $ticket, Request $request)
    {
        $validated = $request->validate([
            'justificacion' => 'required|string|min:5|max:2000',
            'sitpreco' => 'nullable|string|max:50',
            'resumen_rechazo' => 'nullable|string|max:200',
        ]);

        $denuncia = Denuncia::where('ticket', $ticket)->firstOrFail();

        if ($denuncia->estado !== 'ingresada') {
            return redirect()->back()->with('error', 'No se puede rechazar esta denuncia.');
        }

        DB::transaction(function () use ($denuncia, $validated) {
            $denuncia->update([
                'estado' => 'rechazada',
                'fecha_rechazada' => now(),
                'justificacion_rechazo' => $validated['justificacion'],
                'resumen_rechazo' => $validated['resumen_rechazo'] ?? null,
                'sitpreco_rechazo' => $validated['sitpreco'] ?? null,
            ]);

            $denuncia->bitacora()->create([
                'accion' => 'rechazada',
                'detalle' => 'DENUNCIA RECHAZADA. JUSTIFICACIÓN: ' . $validated['justificacion'],
                'usuario_id' => Auth::id(),
                'fecha' => now(),
            ]);
        });

        return redirect()->back()->with('success', "Denuncia {$ticket} rechazada.");
    }

    public function iniciarInvestigacion(string $ticket)
    {
        $denuncia = Denuncia::where('ticket', $ticket)->firstOrFail();

        if ($denuncia->estado !== 'asignada') {
            return redirect()->back()->with('error', 'No se puede iniciar investigación.');
        }

        DB::transaction(function () use ($denuncia) {
            $denuncia->update(['estado' => 'investigacion']);

            $denuncia->bitacora()->create([
                'accion' => 'investigacion',
                'detalle' => 'INVESTIGACIÓN INICIADA',
                'usuario_id' => Auth::id(),
                'fecha' => now(),
            ]);
        });

        return redirect()->back()->with('success', "Investigación iniciada para {$ticket}.");
    }

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

            $denuncia->update([
                'tecnico_anterior_id' => $denuncia->tecnico_id,
                'tecnico_id' => $nuevoTecnico->id,
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
                'destino_url' => '/denuncias',
                'icono' => 'ArrowRightLeft',
                'color' => 'info',
                'fecha' => now(),
            ]);
        });

        return redirect()->back()->with('success', "Denuncia {$ticket} traspasada correctamente.");
    }

    public function reabrir(string $ticket, Request $request)
    {
        $validated = $request->validate([
            'justificacion' => 'required|string|min:20|max:2000',
            'nueva_fecha_limite' => 'required|date|after_or_equal:today',
        ]);

        $denuncia = Denuncia::where('ticket', $ticket)->firstOrFail();

        if (!in_array($denuncia->estado, ['rechazada', 'cerrada'])) {
            return redirect()->back()->with('error', 'No se puede reabrir esta denuncia.');
        }

        DB::transaction(function () use ($denuncia, $validated) {
            $denuncia->update([
                'estado' => 'ingresada',
                'subestado' => null,
                'tecnico_id' => null,
                'tecnico_anterior_id' => null,
                'reapertura_json' => [
                    'fecha' => now()->toDateTimeString(),
                    'justificacion' => $validated['justificacion'],
                    'plazo' => $validated['nueva_fecha_limite'],
                ],
            ]);

            $denuncia->bitacora()->create([
                'accion' => 'reapertura',
                'detalle' => 'DENUNCIA REABIERTA. JUSTIFICACIÓN: ' . $validated['justificacion'],
                'usuario_id' => Auth::id(),
                'fecha' => now(),
            ]);
        });

        return redirect()->back()->with('success', "Denuncia {$ticket} reabierta correctamente.");
    }

    public function saltarFase(string $ticket, Request $request)
    {
        $validated = $request->validate([
            'justificacion' => 'required|string|min:20|max:2000',
        ]);

        $denuncia = Denuncia::where('ticket', $ticket)->firstOrFail();

        if ($denuncia->estado !== 'investigacion') {
            return redirect()->back()->with('error', 'No se puede saltar la fase de esta denuncia.');
        }

        $pendientes = $denuncia->solicitudes()->where('estado', 'pendiente')->count()
            + $denuncia->descargos()->whereIn('estado', ['pendiente_notif', 'notificado'])->count();

        DB::transaction(function () use ($denuncia, $validated) {
            $denuncia->update(['estado' => 'informe']);

            $denuncia->bitacora()->create([
                'accion' => 'saltar_fase',
                'detalle' => 'FASE SALTADA A INFORME FINAL. JUSTIFICACIÓN: ' . $validated['justificacion'],
                'usuario_id' => Auth::id(),
                'fecha' => now(),
            ]);
        });

        $msg = "Denuncia {$ticket} pasó a Informe Final.";
        if ($pendientes > 0) {
            $msg .= " Quedan {$pendientes} item(s) pendiente(s) de solicitudes/descargos.";
        }

        return redirect()->back()->with('success', $msg);
    }

    public function guardarInforme(string $ticket, Request $request)
    {
        $validated = $request->validate([
            'clasificacion' => 'required|in:penal,civil,administrativo,sin_indicios,medida_correctiva,archivado',
            'fojas' => 'required|integer|min:1|max:9999',
            'justificacion' => 'required|string|min:20|max:5000',
            'concluido_por' => 'required|string|min:2|max:100',
            'sitpreco' => 'nullable|string|min:3|max:50',
        ]);

        $denuncia = Denuncia::where('ticket', $ticket)->firstOrFail();

        if (!in_array($denuncia->estado, ['informe', 'cerrada'])) {
            return redirect()->back()->with('error', 'No se puede redactar el informe en esta denuncia.');
        }

        DB::transaction(function () use ($denuncia, $validated) {
            $informe = new InformeFinal([
                'clasificacion' => $validated['clasificacion'],
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
            'clasificacion' => 'required|in:penal,civil,administrativo,sin_indicios,medida_correctiva,archivado',
            'fojas' => 'required|integer|min:1|max:9999',
            'justificacion' => 'required|string|min:20|max:5000',
            'concluido_por' => 'required|string|min:2|max:100',
            'sitpreco' => 'nullable|string|min:3|max:50',
        ]);

        $denuncia = Denuncia::where('ticket', $ticket)->firstOrFail();

        if (!in_array($denuncia->estado, ['informe', 'cerrada'])) {
            return redirect()->back()->with('error', 'No se puede editar el informe de esta denuncia.');
        }

        DB::transaction(function () use ($denuncia, $validated) {
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
                'clasificacion' => $validated['clasificacion'],
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

    public function guardarCierre(string $ticket, Request $request)
    {
        $validated = $request->validate([
            'notificado_denunciante' => 'required|boolean',
            'notificacion_medio' => 'nullable|string|max:200',
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

        DB::transaction(function () use ($denuncia, $validated) {
            $cierre = new Cierre([
                'notificado_denunciante' => (bool) $validated['notificado_denunciante'],
                'notificacion_medio' => $validated['notificacion_medio'] ?? null,
                'notificacion_fecha' => $validated['notificacion_fecha'] ?? null,
                'notificacion_descripcion' => $validated['notificacion_descripcion'] ?? null,
                'no_notificado_motivo' => $validated['no_notificado_motivo'] ?? null,
                'concluido_por' => $validated['concluido_por'],
                'descripcion' => $validated['descripcion'],
                'cerrado_at' => now(),
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
            'notificacion_medio' => 'nullable|string|max:200',
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

        DB::transaction(function () use ($denuncia, $validated, $ticket) {
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
                'notificacion_medio' => $validated['notificacion_medio'] ?? null,
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

    public function delegarEvaluacion(string $ticket, Request $request)
    {
        $validated = $request->validate([
            'tecnico_id' => 'required|integer|exists:users,id',
            'justificacion' => 'nullable|string|max:500',
        ]);

        $denuncia = Denuncia::where('ticket', $ticket)->firstOrFail();

        if ($denuncia->estado !== 'ingresada') {
            return redirect()->back()->with('error', 'No se puede delegar la evaluación de esta denuncia.');
        }

        DB::transaction(function () use ($denuncia, $validated) {
            $tecnico = User::findOrFail($validated['tecnico_id']);

            $denuncia->evaluaciones()->create([
                'tecnico_id' => $tecnico->id,
                'delegada_por_id' => Auth::id(),
                'delegada_at' => now(),
                'justificacion_delegacion' => $validated['justificacion'] ?? null,
                'estado' => 'pendiente',
            ]);

            $denuncia->update(['estado' => 'evaluacion_tecnica']);

            $denuncia->bitacora()->create([
                'accion' => 'evaluacion_delegada',
                'detalle' => 'EVALUACIÓN DELEGADA A ' . $tecnico->name,
                'usuario_id' => Auth::id(),
                'fecha' => now(),
            ]);

            Notificacion::create([
                'usuario_id' => $tecnico->id,
                'tipo' => 'evaluacion_delegada',
                'titulo' => 'EVALUACIÓN TÉCNICA ASIGNADA',
                'mensaje' => "{$denuncia->ticket} TE FUE DELEGADA PARA EVALUACIÓN",
                'ticket' => $denuncia->ticket,
                'destino_url' => '/denuncias/evaluaciones',
                'icono' => 'FileSearch',
                'color' => 'info',
                'fecha' => now(),
            ]);
        });

        return redirect()->back()->with('success', "Evaluación delegada correctamente para {$ticket}.");
    }

    public function reasumirEvaluacion(string $ticket)
    {
        $denuncia = Denuncia::where('ticket', $ticket)->firstOrFail();

        if ($denuncia->estado !== 'evaluacion_tecnica') {
            return redirect()->back()->with('error', 'No se puede reasumir la evaluación de esta denuncia.');
        }

        DB::transaction(function () use ($denuncia) {
            $evaluacionPendiente = $denuncia->evaluaciones()->where('estado', 'pendiente')->latest()->first();

            $denuncia->update(['estado' => 'ingresada']);

            $denuncia->bitacora()->create([
                'accion' => 'evaluacion_reasumida',
                'detalle' => 'EVALUACIÓN REASUMIDA POR EL JEFE',
                'usuario_id' => Auth::id(),
                'fecha' => now(),
            ]);

            if ($evaluacionPendiente && $evaluacionPendiente->tecnico_id) {
                Notificacion::create([
                    'usuario_id' => $evaluacionPendiente->tecnico_id,
                    'tipo' => 'evaluacion_reasumida',
                    'titulo' => 'EVALUACIÓN REASUMIDA',
                    'mensaje' => "{$denuncia->ticket} — EL JEFE REASUMIÓ LA EVALUACIÓN",
                    'ticket' => $denuncia->ticket,
                    'destino_url' => '/denuncias/mis-casos',
                    'icono' => 'Undo2',
                    'color' => 'warning',
                    'fecha' => now(),
                ]);
            }
        });

        return redirect()->back()->with('success', "Evaluación reasumida para {$ticket}.");
    }

    public function aprobarAmpliacion(string $ticket, Request $request)
    {
        $validated = $request->validate([
            'dias' => 'required|integer|min:1|max:45',
            'justificacion' => 'required|string|min:10|max:500',
            'solicitado_por' => 'nullable|string|max:100',
        ]);

        $denuncia = Denuncia::where('ticket', $ticket)->firstOrFail();

        if (!in_array($denuncia->estado, ['admitida', 'asignada', 'investigacion', 'informe'])) {
            return redirect()->back()->with('error', 'No se puede ampliar el plazo de esta denuncia.');
        }

        DB::transaction(function () use ($denuncia, $validated) {
            $numAmpliacion = $denuncia->ampliaciones()->count() + 1;

            $denuncia->ampliaciones()->create([
                'dias' => (int) $validated['dias'],
                'justificacion' => $validated['justificacion'],
                'numero' => $numAmpliacion,
                'aprobado_por_id' => Auth::id(),
                'solicitado_por' => $validated['solicitado_por'] ?? null,
                'fecha' => now(),
            ]);

            $denuncia->bitacora()->create([
                'accion' => 'ampliacion_plazo',
                'detalle' => 'PLAZO AMPLIADO ' . $validated['dias'] . ' DÍAS (AMPLIACIÓN #' . $numAmpliacion . ')',
                'usuario_id' => Auth::id(),
                'fecha' => now(),
            ]);
        });

        return redirect()->back()->with('success', "Plazo ampliado {$validated['dias']} días correctamente para {$ticket}.");
    }

    public function editar(string $ticket, Request $request)
    {
        $denuncia = Denuncia::where('ticket', $ticket)->firstOrFail();

        if ($denuncia->estado !== 'ingresada') {
            return redirect()->back()->with('error', 'Solo se puede editar una denuncia en estado Ingresada.');
        }

        $validated = $request->validate([
            'escenario' => 'required|in:revelada,reservada,anonimo',
            'denunciante.nombres' => 'nullable|string|max:100',
            'denunciante.ci' => 'nullable|digits_between:6,9',
            'denunciante.email' => 'nullable|email',
            'denunciante.telefono' => 'nullable|digits:8',
            'denunciados' => 'required|array|min:1',
            'denunciados.*.conoce_identidad' => 'required|boolean',
            'denunciados.*.nombres' => 'nullable|string|max:100',
            'denunciados.*.dependencia' => 'nullable|string|max:200',
            'denunciados.*.descripcion' => 'nullable|string',
            'detalles.categoria' => 'required',
            'detalles.fecha' => 'required|date|before_or_equal:today|after_or_equal:' . now()->subYears(5)->format('Y-m-d'),
            'detalles.hora' => 'nullable',
            'detalles.lugar' => 'required|string|max:200',
            'hechos' => 'required|string|min:10|max:8000',
            'pruebas' => 'nullable|array',
        ]);

        DB::transaction(function () use ($denuncia, $validated) {
            $denuncia->update([
                'escenario' => $validated['escenario'],
                'hechos' => $validated['hechos'],
                'lugar_hechos' => $validated['detalles']['lugar'],
                'categoria_id' => $validated['detalles']['categoria'],
            ]);

            if ($denuncia->denunciante) {
                $denuncia->denunciante->update([
                    'nombres' => $validated['denunciante']['nombres'] ?? null,
                    'ci' => $validated['denunciante']['ci'] ?? null,
                    'email' => $validated['denunciante']['email'] ?? null,
                    'telefono' => $validated['denunciante']['telefono'] ?? null,
                ]);
            }

            $denuncia->denunciados()->delete();
            foreach ($validated['denunciados'] as $i => $dd) {
                $denuncia->denunciados()->create([
                    'orden' => $i,
                    'conoce_identidad' => (bool) ($dd['conoce_identidad'] ?? false),
                    'nombres' => ($dd['conoce_identidad'] ?? false) ? ($dd['nombres'] ?? '') : null,
                    'dependencia' => $dd['dependencia'] ?? null,
                    'descripcion' => !($dd['conoce_identidad'] ?? false) ? ($dd['descripcion'] ?? '') : null,
                ]);
            }
        });

        return redirect()->back()->with('success', "Denuncia {$ticket} actualizada correctamente.");
    }

    public function eliminar(string $ticket)
    {
        $denuncia = Denuncia::where('ticket', $ticket)->firstOrFail();

        if ($denuncia->estado !== 'ingresada') {
            return redirect()->back()->with('error', 'Solo se puede eliminar una denuncia en estado Ingresada.');
        }

        $denuncia->delete();

        return redirect()->back()->with('success', "Denuncia {$ticket} eliminada correctamente.");
    }

    public function conciliarFechas(string $ticket, Request $request)
    {
        $validated = $request->validate([
            'created_at' => 'nullable|date',
            'fecha_admitida' => 'nullable|date',
            'fecha_asignada' => 'nullable|date',
            'fecha_rechazada' => 'nullable|date',
            'justificacion' => 'required|string|min:20|max:2000',
        ]);

        $denuncia = Denuncia::where('ticket', $ticket)->firstOrFail();

        DB::transaction(function () use ($denuncia, $validated) {
            $updates = [];
            if ($validated['created_at']) $updates['created_at'] = $validated['created_at'];
            if ($validated['fecha_admitida']) $updates['fecha_admitida'] = $validated['fecha_admitida'];
            if ($validated['fecha_asignada']) $updates['fecha_asignada'] = $validated['fecha_asignada'];
            if ($validated['fecha_rechazada']) $updates['fecha_rechazada'] = $validated['fecha_rechazada'];

            if (!empty($updates)) {
                $denuncia->update($updates);
            }

            $denuncia->update([
                'conciliacion_json' => [
                    'conciliado_por_id' => Auth::id(),
                    'motivo' => $validated['justificacion'],
                    'fecha' => now()->toDateTimeString(),
                ],
            ]);

            $denuncia->bitacora()->create([
                'accion' => 'conciliacion_fechas',
                'detalle' => 'FECHAS CONCILIADAS POR ' . Auth::user()->name . '. MOTIVO: ' . $validated['justificacion'],
                'usuario_id' => Auth::id(),
                'fecha' => now(),
            ]);
        });

        return redirect()->back()->with('success', "Fechas conciliadas para {$ticket}.");
    }
}
