<?php

namespace App\Http\Controllers;

use App\Http\Requests\DenunciaFilterRequest;
use App\Models\CategoriaDenuncia;
use App\Models\Clasificacion;
use App\Models\Denuncia;
use App\Models\EvaluacionTecnica;
use App\Models\User;
use App\Queries\Denuncia\DenunciaListQuery;
use App\Services\AvisoCaso;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class MisCasosController extends Controller
{
    /**
     * Mis Casos del investigador (Slice 2: filtros + paginado en servidor).
     *
     * Reutiliza `DenunciaFilterRequest` + `DenunciaListQuery::base()` como
     * Bandeja, pero fuerza `investigador_id = Auth::id()` (el param entrante
     * se ignora: un investigador solo ve sus casos) y excluye `rechazada`.
     * Sin `estado` explícito se aplica el scope del tab por defecto
     * (`asignada` + `admitida`, igual que el fold histórico del grouped).
     * `plazo` sigue display-only (orden visual en el cliente).
     */
    public function index(DenunciaFilterRequest $request)
    {
        if (! Auth::user()->puede('menu.mis-casos')) {
            return redirect()->route('dashboard')->with('error', 'NO TIENES PERMISO PARA ESA SECCIÓN.');
        }

        $investigadorId = Auth::id();

        $filtros = $request->filtros();
        // Seguridad: se fuerza el propio id aunque llegue ?investigador_id=X.
        $filtros['investigador_id'] = $investigadorId;

        $query = DenunciaListQuery::base($filtros)
            ->where('denuncias.estado', '!=', 'rechazada');

        if (empty($filtros['estado'])) {
            $query->whereIn('denuncias.estado', ['asignada', 'admitida']);
        }

        $paginador = $query->latest()->paginate(DenunciaListQuery::PER_PAGE)->withQueryString();

        $grouped = [];
        $solicitudesByTicket = [];
        $descargosByTicket = [];
        $evaluacionesByTicket = [];

        foreach ($paginador->getCollection() as $d) {
            $estado = $d->estado === 'admitida' ? 'asignada' : $d->estado;
            if (!isset($grouped[$estado])) $grouped[$estado] = [];
            $grouped[$estado][] = $d;

            $solicitudesByTicket[$d->ticket] = $d->solicitudes;
            $descargosByTicket[$d->ticket] = $d->descargos;
            $evaluacionesByTicket[$d->ticket] = $d->evaluaciones;

            unset($d->solicitudes);
            unset($d->descargos);
            unset($d->evaluaciones);
        }

        // ?destacar=TICKET (campana/notificaciones): carga directa aunque los
        // filtros activos no lo incluyan, siempre acotada al propio investigador.
        $destacarTicket = $request->query('destacar');
        $destacarDenuncia = null;
        if ($destacarTicket) {
            $destacarDenuncia = Denuncia::with(DenunciaListQuery::with())
                ->where('ticket', mb_strtoupper(trim((string) $destacarTicket)))
                ->where('investigador_id', $investigadorId)
                ->first();
            if ($destacarDenuncia) {
                $solicitudesByTicket[$destacarDenuncia->ticket] = $destacarDenuncia->solicitudes;
                $descargosByTicket[$destacarDenuncia->ticket] = $destacarDenuncia->descargos;
                $evaluacionesByTicket[$destacarDenuncia->ticket] = $destacarDenuncia->evaluaciones;
                unset($destacarDenuncia->solicitudes);
                unset($destacarDenuncia->descargos);
                unset($destacarDenuncia->evaluaciones);
            }
        }

        $evaluacionesDelegadas = EvaluacionTecnica::with('denuncia')
            ->where('investigador_id', $investigadorId)
            ->where('estado', 'pendiente')
            ->get();

        $evaluacionesDevueltas = EvaluacionTecnica::with('denuncia')
            ->where('investigador_id', $investigadorId)
            ->where('estado', 'devuelta')
            ->get();

        // Badges de tabs con los mismos filtros EXCEPTO estado (igual que
        // Bandeja), siempre acotados al investigador propio.
        $contadores = DenunciaListQuery::contadores(array_merge($filtros, ['estado' => null]));

        $tickets = $paginador->getCollection()->pluck('ticket')->toArray();
        if ($destacarDenuncia) {
            $tickets[] = $destacarDenuncia->ticket;
        }

        return Inertia::render('Denuncias/MisCasos', [
            'denuncias' => $paginador,
            'contadores' => $contadores,
            'grouped' => $grouped,
            'investigadorActual' => $investigadorId,
            'investigadores' => User::where('rol', 'investigador')->where('activo', true)->get(),
            'solicitudesByTicket' => $solicitudesByTicket,
            'descargosByTicket' => $descargosByTicket,
            'evaluacionesByTicket' => $evaluacionesByTicket,
            'avisosPorTicket' => AvisoCaso::publicadosPorTicket($tickets),
            'opciones' => [
                'categorias' => CategoriaDenuncia::where('activa', true)->orderBy('nombre')->get(['id', 'nombre'])->toArray(),
                'clasificaciones' => Clasificacion::where('activa', true)->orderBy('nombre')->get(['id', 'nombre'])->toArray(),
            ],
            'filters' => $filtros,
            'evaluacionesDelegadas' => $evaluacionesDelegadas,
            'evaluacionesDevueltas' => $evaluacionesDevueltas,
            'canAct' => true,
            'destacar' => $destacarTicket,
            'destacarDenuncia' => $destacarDenuncia,
        ]);
    }

    public function evaluaciones()
    {
        if (! Auth::user()->puede('menu.evaluaciones')) {
            return redirect()->route('dashboard')->with('error', 'NO TIENES PERMISO PARA ESA SECCIÓN.');
        }

        $investigadorId = Auth::id();

        $evaluacionesDelegadas = EvaluacionTecnica::with('denuncia')
            ->where('investigador_id', $investigadorId)
            ->where('estado', 'pendiente')
            ->get();

        $evaluacionesDevueltas = EvaluacionTecnica::with('denuncia')
            ->where('investigador_id', $investigadorId)
            ->where('estado', 'devuelta')
            ->get();

        $with = [
            'denunciante', 'denunciados', 'pruebas', 'categoria', 'investigador',
            'informe.clasificacionRel', 'cierre.medioNotificacion',
            'solicitudes.dependenciaDestino', 'solicitudes.ampliaciones',
            'descargos.denunciado', 'descargos.ampliaciones', 'evaluaciones',
            'bitacora' => fn ($q) => $q->select([
                'id', 'denuncia_id', 'entidad_tipo', 'entidad_id',
                'accion', 'detalle', 'usuario_id', 'fecha', 'created_at', 'updated_at',
            ]),
            'bitacora.usuario:id,name',
        ];

        $denunciaIds = $evaluacionesDelegadas->pluck('denuncia_id')->concat($evaluacionesDevueltas->pluck('denuncia_id'))->filter()->unique();
        $denuncias = Denuncia::with($with)->whereIn('id', $denunciaIds)->get();

        $denunciasByTicket = [];
        foreach ($denuncias as $d) {
            $denunciasByTicket[$d->ticket] = $d;
        }

        return Inertia::render('Denuncias/Evaluaciones', [
            'evaluacionesDelegadas' => $evaluacionesDelegadas,
            'evaluacionesDevueltas' => $evaluacionesDevueltas,
            'denunciasByTicket' => $denunciasByTicket,
            'investigadorActual' => $investigadorId,
            'investigadores' => User::where('rol', 'investigador')->where('activo', true)->get(),
        ]);
    }
}
