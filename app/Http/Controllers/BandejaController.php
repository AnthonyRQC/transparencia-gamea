<?php

namespace App\Http\Controllers;

use App\Http\Requests\DenunciaFilterRequest;
use App\Models\CategoriaDenuncia;
use App\Models\Clasificacion;
use App\Models\Denuncia;
use App\Models\User;
use App\Queries\Denuncia\DenunciaListQuery;
use App\Services\AvisoCaso;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class BandejaController extends Controller
{
    public function index(DenunciaFilterRequest $request)
    {
        if (! Auth::user()->puede('menu.bandeja')) {
            return redirect()->route('dashboard')->with('error', 'NO TIENES PERMISO PARA ESA SECCIÓN.');
        }

        $filtros = $request->filtros();
        $tab = $filtros['tab'];

        // ?destacar=TICKET (campana/notificaciones): si no se pidió un tab
        // explícito, se resuelve el tab del caso para que la página lo contenga.
        $destacarTicket = $request->query('destacar');
        if ($destacarTicket && ! $request->query('tab')) {
            $sonda = Denuncia::where('ticket', mb_strtoupper(trim((string) $destacarTicket)))->first(['id', 'ticket', 'estado']);
            if ($sonda) {
                foreach (DenunciaListQuery::TAB_ESTADOS as $candidato => $estados) {
                    if (in_array($sonda->estado, $estados, true)) {
                        $tab = $candidato;
                        break;
                    }
                }
            }
        }
        $filtros['tab'] = $tab;

        $paginador = DenunciaListQuery::paginar($filtros, $tab);

        $solicitudesByTicket = [];
        $descargosByTicket = [];
        $evaluacionesByTicket = [];

        foreach ($paginador->getCollection() as $d) {
            self::enriquecer($d, $solicitudesByTicket, $descargosByTicket, $evaluacionesByTicket);
        }

        // El caso destacado se carga directo (aunque los filtros activos no
        // lo incluyan) para que el Sheet pueda abrirse desde la notificación.
        $destacarDenuncia = null;
        if ($destacarTicket) {
            $destacarDenuncia = Denuncia::with(DenunciaListQuery::with())
                ->where('ticket', mb_strtoupper(trim((string) $destacarTicket)))
                ->first();
            if ($destacarDenuncia) {
                self::enriquecer($destacarDenuncia, $solicitudesByTicket, $descargosByTicket, $evaluacionesByTicket);
            }
        }

        $tickets = $paginador->getCollection()->pluck('ticket')->toArray();
        if ($destacarDenuncia) {
            $tickets[] = $destacarDenuncia->ticket;
        }

        $investigadores = User::where('rol', 'investigador')->where('activo', true)->get();

        return Inertia::render('Denuncias/Bandeja', [
            'denuncias' => $paginador,
            'contadores' => DenunciaListQuery::contadores($filtros),
            'investigadores' => $investigadores,
            'cargaInvestigadores' => $investigadores->map(fn ($t) => [
                'id' => $t->id,
                'nombre' => $t->name,
                'iniciales' => $t->iniciales,
                'color' => $t->color,
                'activos' => Denuncia::where('investigador_id', $t->id)->whereNotIn('estado', ['rechazada', 'cerrada'])->count(),
            ]),
            'solicitudesByTicket' => $solicitudesByTicket,
            'descargosByTicket' => $descargosByTicket,
            'evaluacionesByTicket' => $evaluacionesByTicket,
            'avisosPorTicket' => AvisoCaso::publicadosPorTicket($tickets),
            'opciones' => [
                'categorias' => CategoriaDenuncia::where('activa', true)->orderBy('nombre')->get(['id', 'nombre'])->toArray(),
                'clasificaciones' => Clasificacion::where('activa', true)->orderBy('nombre')->get(['id', 'nombre'])->toArray(),
            ],
            'filters' => $filtros,
            'tab' => $tab,
            'canAct' => true,
            'destacar' => $destacarTicket,
            'destacarDenuncia' => $destacarDenuncia,
        ]);
    }

    /**
     * Replica el enriquecimiento histórico: recomendación de evaluación
     * devuelta + mapas por ticket (las relaciones se retiran del modelo
     * para no duplicar el payload).
     */
    private static function enriquecer(Denuncia $d, array &$solicitudesByTicket, array &$descargosByTicket, array &$evaluacionesByTicket): void
    {
        if (! $d->evaluacion_tecnica_recomendacion && $d->evaluaciones && $d->evaluaciones->count() > 0) {
            $evalDev = $d->evaluaciones->where('estado', 'devuelta')->last();
            if ($evalDev) {
                $d->evaluacion_tecnica_recomendacion = $evalDev->recomendacion;
                $d->evaluacion_tecnica_texto = $evalDev->texto_evaluacion;
                $d->evaluacion_tecnica_investigador_nombre = $evalDev->investigador?->name ?? 'investigador';
            }
        }
        $solicitudesByTicket[$d->ticket] = $d->solicitudes;
        $descargosByTicket[$d->ticket] = $d->descargos;
        $evaluacionesByTicket[$d->ticket] = $d->evaluaciones;
        unset($d->solicitudes);
        unset($d->descargos);
        unset($d->evaluaciones);
    }
}
