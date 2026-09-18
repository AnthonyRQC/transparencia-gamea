<?php

namespace App\Http\Controllers;

use App\Models\Denuncia;
use App\Models\User;
use App\Services\AvisoCaso;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class BandejaController extends Controller
{
    public function index(Request $request)
    {
        if (! Auth::user()->puede('menu.bandeja')) {
            return redirect()->route('dashboard')->with('error', 'NO TIENES PERMISO PARA ESA SECCIÓN.');
        }

        $with = ['denunciante', 'denunciados', 'pruebas', 'categoria', 'investigador', 'informe.clasificacionRel', 'cierre.medioNotificacion', 'solicitudes.dependenciaDestino', 'solicitudes.ampliaciones', 'descargos.denunciado', 'descargos.ampliaciones', 'evaluaciones', 'bitacora.usuario'];

        $ingresadas = Denuncia::with($with)->whereIn('estado', ['ingresada', 'evaluacion_tecnica'])->latest()->get();
        $porAsignar = Denuncia::with($with)->where('estado', 'admitida')->latest()->get();
        $enCurso = Denuncia::with($with)->whereIn('estado', ['asignada', 'investigacion', 'informe'])->latest()->get();
        $historial = Denuncia::with($with)->whereIn('estado', ['rechazada', 'cerrada'])->latest()->get();

        $solicitudesByTicket = [];
        $descargosByTicket = [];
        $evaluacionesByTicket = [];
        
        $all = $ingresadas->concat($porAsignar)->concat($enCurso)->concat($historial);
        foreach ($all as $d) {
            if (!$d->evaluacion_tecnica_recomendacion && $d->evaluaciones && $d->evaluaciones->count() > 0) {
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

        $contadores = [
            'ingresada' => Denuncia::where('estado', 'ingresada')->count(),
            'evaluacion_tecnica' => Denuncia::where('estado', 'evaluacion_tecnica')->count(),
            'admitida' => Denuncia::where('estado', 'admitida')->count(),
            'asignada' => Denuncia::where('estado', 'asignada')->count(),
            'investigacion' => Denuncia::where('estado', 'investigacion')->count(),
            'informe' => Denuncia::where('estado', 'informe')->count(),
            'rechazada' => Denuncia::where('estado', 'rechazada')->count(),
            'cerrada' => Denuncia::where('estado', 'cerrada')->count(),
            'ingresadas' => Denuncia::where('estado', 'ingresada')->count(),
            'porAdmitir' => Denuncia::whereIn('estado', ['ingresada', 'evaluacion_tecnica'])->count(),
            'porAsignar' => Denuncia::where('estado', 'admitida')->count(),
            'enCurso' => Denuncia::whereIn('estado', ['asignada', 'investigacion', 'informe'])->count(),
            'historial' => Denuncia::whereIn('estado', ['rechazada', 'cerrada'])->count(),
            'activos' => Denuncia::whereNotIn('estado', ['rechazada', 'cerrada'])->count(),
        ];

        $investigadores = User::where('rol', 'investigador')->where('activo', true)->get();

        return Inertia::render('Denuncias/Bandeja', [
            'denuncias' => $ingresadas,
            'porAsignar' => $porAsignar,
            'enCurso' => $enCurso,
            'historial' => $historial,
            'contadores' => $contadores,
            'investigadores' => $investigadores,
            'cargaInvestigadores' => $investigadores->map(fn($t) => [
                'id' => $t->id,
                'nombre' => $t->name,
                'iniciales' => $t->iniciales,
                'color' => $t->color,
                'activos' => Denuncia::where('investigador_id', $t->id)->whereNotIn('estado', ['rechazada', 'cerrada'])->count(),
            ]),
            'solicitudesByTicket' => $solicitudesByTicket,
            'descargosByTicket' => $descargosByTicket,
            'evaluacionesByTicket' => $evaluacionesByTicket,
            'avisosPorTicket' => AvisoCaso::publicadosPorTicket($all->pluck('ticket')->toArray()),
            'canAct' => true,
            'destacar' => $request->query('destacar'),
        ]);
    }
}
