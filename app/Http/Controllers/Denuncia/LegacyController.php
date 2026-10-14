<?php

namespace App\Http\Controllers\Denuncia;

use App\Http\Controllers\Controller;
use App\Http\Requests\Denuncia\StoreLegacyDenunciaRequest;
use App\Models\CategoriaDenuncia;
use App\Models\ConfiguracionSistema;
use App\Models\Denuncia;
use App\Models\Notificacion;
use App\Models\User;
use App\Services\PermisosEfectivos;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class LegacyController extends Controller
{
    public function store(StoreLegacyDenunciaRequest $request)
    {
        $user = $request->user();
        $historico = $request->input('modo') === 'historico';
        $puedeLegacy = PermisosEfectivos::puede($user, 'denuncia.cargar-legacy');
        $puedeHistorico = PermisosEfectivos::puede($user, 'denuncia.cargar-historico');

        if (! ($puedeLegacy || $puedeHistorico)) {
            throw new AuthorizationException('NO TIENES PERMISO PARA CARGAR EXPEDIENTES.');
        }

        if ($historico && ! $puedeHistorico) {
            throw new AuthorizationException('NO TIENES PERMISO PARA CARGAR HISTÓRICOS.');
        }

        if (! $historico && ! $puedeLegacy) {
            throw new AuthorizationException('NO TIENES PERMISO PARA CARGAR CASOS EN CURSO.');
        }

        $validated = $request->validated();
        $anonimo = $request->esAnonimo();

        $investigadorId = $this->resolverInvestigador($user, $validated, $historico);

        $denuncia = DB::transaction(function () use ($request, $validated, $user, $historico, $anonimo, $investigadorId) {
            $ticket = $this->resolverTicket($request);

            $categoriaId = CategoriaDenuncia::where(
                'clave',
                $validated['tipo'] === 'corrupcion' ? 'otra_corrupcion' : 'otra_negacion'
            )->value('id');

            $denuncia = Denuncia::create([
                'ticket' => $ticket,
                'token_consulta' => Denuncia::generarToken(),
                'tipo' => $validated['tipo'],
                'escenario' => $validated['escenario'],
                'estado' => $historico ? 'cerrada' : $validated['estado'],
                'categoria_id' => $categoriaId,
                'hechos' => $validated['hechos'],
                'declaracion_jurada' => false,
                'investigador_id' => $investigadorId,
                'investigador_referencia' => $validated['investigador_referencia'] ?? null,
                'fecha_admitida' => $validated['fecha_recepcion'],
                'fecha_asignada' => $historico ? null : now(),
                'registrado_por_id' => $user->id,
                'es_legacy' => true,
            ]);

            $denuncia->forceFill(['created_at' => $validated['fecha_recepcion']])->save();

            if (! $anonimo) {
                $denuncia->denunciante()->create([
                    'nombres' => $validated['denunciante_nombre'],
                    'ci' => $validated['denunciante_ci'] ?? null,
                    'telefono' => $validated['denunciante_telefono'] ?? null,
                ]);
            }

            foreach ($validated['denunciados'] as $i => $dd) {
                $conoce = (bool) ($dd['conoce_identidad'] ?? false);
                $denuncia->denunciados()->create([
                    'orden' => $i,
                    'conoce_identidad' => $conoce,
                    'nombres' => $conoce ? ($dd['nombres'] ?? null) : null,
                    'dependencia' => $dd['dependencia'] ?? null,
                    'descripcion' => $conoce ? null : ($dd['descripcion'] ?? null),
                ]);
            }

            $concluidoPor = mb_substr(
                $validated['investigador_referencia'] ?? $user->name ?? 'CARGA LEGACY',
                0,
                100
            );

            if (! empty($validated['clasificacion_id'])) {
                $denuncia->informe()->create([
                    'clasificacion_id' => $validated['clasificacion_id'],
                    'clasificado_por_id' => $user->id,
                    'concluido_por' => $concluidoPor,
                    'redactado_at' => $validated['fecha_cierre'] ?? now(),
                ]);
            }

            if ($historico) {
                $denuncia->cierre()->create([
                    'notificado_denunciante' => false,
                    'no_notificado_motivo' => 'EXPEDIENTE HISTÓRICO SIN NOTIFICACIÓN REGISTRADA',
                    'concluido_por' => $concluidoPor,
                    'descripcion' => 'CARGA HISTÓRICA DE EXPEDIENTE CERRADO EN GESTIÓN ' . $validated['gestion'],
                    'cerrado_at' => $validated['fecha_cierre'],
                    'cerrado_por_id' => $user->id,
                ]);
            }

            $denuncia->bitacora()->create([
                'accion' => 'ingreso_legacy',
                'detalle' => 'EXPEDIENTE ' . ($historico ? 'HISTÓRICO' : 'EN CURSO')
                    . ' CARGADO CON TICKET ' . $ticket,
                'usuario_id' => $user->id,
                'fecha' => now(),
            ]);

            return $denuncia;
        });

        if (! $historico) {
            $this->notificarCarga($denuncia->ticket);
        }

        $adjuntos = $this->guardarAdjuntos($request, $denuncia);

        $mensaje = "Expediente {$denuncia->ticket} cargado correctamente.";
        if ($adjuntos['fallidos'] > 0) {
            $mensaje .= " {$adjuntos['fallidos']} archivo(s) no pudieron guardarse: súbelos desde el visor del caso.";
        }

        return redirect()->back()->with('success', $mensaje);
    }

    /**
     * Subida post-commit (los físicos no entran a la transacción para no
     * dejar huérfanos en disco ante un rollback). Misma persistencia que
     * ArchivosCasoController::subir con contexto='registro'.
     *
     * @return array{subidos: int, fallidos: int}
     */
    private function guardarAdjuntos(StoreLegacyDenunciaRequest $request, Denuncia $denuncia): array
    {
        $subidos = 0;
        $fallidos = 0;

        foreach ($request->file('archivos', []) as $file) {
            if (! $file->isValid()) {
                $fallidos++;
                continue;
            }

            try {
                $path = $file->store("archivos/{$denuncia->ticket}", 'local');

                $denuncia->archivos()->create([
                    'usuario_id' => $request->user()->id,
                    'nombre' => $file->getClientOriginalName(),
                    'path' => $path,
                    'tamano' => (string) $file->getSize(),
                    'mime_type' => $file->getClientMimeType(),
                    'descripcion' => '',
                    'contexto' => 'registro',
                    'fecha_subida' => now(),
                ]);

                $denuncia->bitacora()->create([
                    'accion' => 'archivo_subido',
                    'detalle' => "ARCHIVO '{$file->getClientOriginalName()}' SUBIDO AL CASO {$denuncia->ticket}",
                    'usuario_id' => $request->user()->id,
                    'fecha' => now(),
                ]);

                $subidos++;
            } catch (\Throwable) {
                $fallidos++;
            }
        }

        return ['subidos' => $subidos, 'fallidos' => $fallidos];
    }

    private function resolverInvestigador(User $user, array $validated, bool $historico): ?int
    {
        if ($historico) {
            return null;
        }

        if ($user->rol === 'investigador') {
            return $user->id;
        }

        $investigador = User::where('id', $validated['investigador_id'] ?? null)
            ->where('activo', true)
            ->first();

        // Selector del jefe: cualquier investigador activo, o uno mismo
        // (autoasignación; MisCasos filtra por Auth::id() sin exigir rol).
        $esYo = $investigador && $investigador->id === $user->id;

        if (! $investigador || (! $esYo && $investigador->rol !== 'investigador')) {
            throw ValidationException::withMessages([
                'investigador_id' => 'Selecciona un investigador activo.',
            ]);
        }

        return $investigador->id;
    }

    private function resolverTicket(StoreLegacyDenunciaRequest $request): string
    {
        if (! $request->tieneNumeroManual()) {
            return Denuncia::generarSiguienteTicket();
        }

        $ticket = $request->ticketManual();

        if (Denuncia::withTrashed()->where('ticket', $ticket)->exists()) {
            throw ValidationException::withMessages([
                'numero_ticket' => 'Ese número de carpeta ya existe en el sistema.',
            ]);
        }

        // High-water mark: el contador nunca queda por debajo de un ticket manual.
        if ((int) $request->input('gestion') === now()->year) {
            $numero = (int) $request->input('numero_ticket');
            $config = ConfiguracionSistema::where('clave', 'siguiente_numero_ticket')
                ->lockForUpdate()
                ->first();

            if ($config && $numero >= (int) $config->valor) {
                $config->update(['valor' => (string) ($numero + 1)]);
            }
        }

        return $ticket;
    }

    private function notificarCarga(string $ticket): void
    {
        $destinatarios = User::where('activo', true)->get()
            ->filter(fn ($u) => PermisosEfectivos::puede($u, 'caso.admitir'));

        foreach ($destinatarios as $destinatario) {
            Notificacion::create([
                'usuario_id' => $destinatario->id,
                'tipo' => 'nueva_denuncia',
                'titulo' => 'EXPEDIENTE LEGACY CARGADO',
                'mensaje' => "{$ticket} FUE CARGADO COMO CASO EN CURSO",
                'ticket' => $ticket,
                'destino_url' => '/denuncias?destacar=' . $ticket,
                'icono' => 'FileText',
                'color' => 'info',
                'fecha' => now(),
            ]);
        }
    }
}
