<?php

namespace App\Http\Controllers\Denuncia;

use App\Http\Controllers\Controller;
use App\Models\CategoriaDenuncia;
use App\Models\Denuncia;
use App\Models\Notificacion;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DenunciaController extends Controller
{
    public function create()
    {
        return Inertia::render('Denuncias/RegistroDenuncia', [
            'categoriasList' => CategoriaDenuncia::where('activa', true)->get(['clave', 'nombre', 'tipo_denuncia'])->toArray(),
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
                'detalles.categoria' => 'required|exists:categorias_denuncia,clave',
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
            $categoriaId = CategoriaDenuncia::where('clave', $validated['detalles']['categoria'])->value('id');

            $denuncia = Denuncia::create([
                'ticket' => $ticket,
                'token_consulta' => $token,
                'tipo' => $validated['tipo'],
                'escenario' => $validated['escenario'],
                'estado' => 'ingresada',
                'categoria_id' => $categoriaId,
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

            $jefes = User::where('rol', 'jefe')->where('activo', true)->get();
            foreach ($jefes as $jefe) {
                Notificacion::create([
                    'usuario_id' => $jefe->id,
                    'tipo' => 'nueva_denuncia',
                    'titulo' => 'NUEVA DENUNCIA REGISTRADA',
                    'mensaje' => "{$ticket} FUE REGISTRADA Y ESPERA ADMISIÓN",
                    'ticket' => $ticket,
                    'destino_url' => '/denuncias?destacar=' . $ticket,
                    'icono' => 'FileText',
                    'color' => 'info',
                    'fecha' => now(),
                ]);
            }

            return $denuncia;
        });

        return redirect()->back()->with([
            'success' => true,
            'ticket' => $denuncia->ticket,
            'token' => $denuncia->token_consulta,
        ]);
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
            'detalles.categoria' => 'required|exists:categorias_denuncia,clave',
            'detalles.fecha' => 'required|date|before_or_equal:today|after_or_equal:' . now()->subYears(5)->format('Y-m-d'),
            'detalles.hora' => 'nullable',
            'detalles.lugar' => 'required|string|max:200',
            'hechos' => 'required|string|min:10|max:8000',
            'pruebas' => 'nullable|array',
        ]);

        DB::transaction(function () use ($denuncia, $validated) {
            $categoriaId = CategoriaDenuncia::where('clave', $validated['detalles']['categoria'])->value('id');
            $denuncia->update([
                'escenario' => $validated['escenario'],
                'hechos' => $validated['hechos'],
                'fecha_hechos' => $validated['detalles']['fecha'],
                'hora_hechos' => $validated['detalles']['hora'] ?? null,
                'lugar_hechos' => $validated['detalles']['lugar'],
                'categoria_id' => $categoriaId,
            ]);

            if ($denuncia->denunciante) {
                $denuncia->denunciante->update([
                    'nombres' => $validated['denunciante']['nombres'] ?? null,
                    'ci' => $validated['denunciante']['ci'] ?? null,
                    'email' => $validated['denunciante']['email'] ?? null,
                    'telefono' => $validated['denunciante']['telefono'] ?? null,
                ]);
            } elseif (isset($validated['denunciante']) && $validated['escenario'] !== 'anonimo') {
                $denuncia->denunciante()->create([
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

            $denuncia->bitacora()->create([
                'accion' => 'edicion',
                'detalle' => 'DENUNCIA EDITADA POR ' . Auth::user()->name,
                'usuario_id' => Auth::id(),
                'fecha' => now(),
            ]);
        });

        return redirect()->back()->with('success', "Denuncia {$ticket} actualizada correctamente.");
    }

    public function eliminar(string $ticket)
    {
        $denuncia = Denuncia::where('ticket', $ticket)->firstOrFail();

        if ($denuncia->estado !== 'ingresada') {
            return redirect()->back()->with('error', 'Solo se puede eliminar una denuncia en estado Ingresada.');
        }

        DB::transaction(function () use ($denuncia, $ticket) {
            $baseDel = str_replace('DEN-', 'DEL-', $ticket);
            $ticketEliminado = $baseDel;
            $count = 1;
            while (Denuncia::withTrashed()->where('ticket', $ticketEliminado)->where('id', '!=', $denuncia->id)->exists()) {
                $ticketEliminado = $baseDel . '-' . $count;
                $count++;
            }

            $denuncia->update(['ticket' => $ticketEliminado]);

            $denuncia->bitacora()->create([
                'accion' => 'eliminacion',
                'detalle' => "DENUNCIA {$ticket} ELIMINADA POR " . Auth::user()->name . " (NUEVO TICKET INTERNO: {$ticketEliminado})",
                'usuario_id' => Auth::id(),
                'fecha' => now(),
            ]);

            $denuncia->delete();

            Denuncia::reciclarTicketSiEsUltimo($ticket);
        });

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
