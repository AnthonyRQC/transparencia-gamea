<?php

namespace App\Http\Controllers;

use App\Models\Denuncia;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class BandejaController extends Controller
{
    public function index(Request $request)
    {
        if (Auth::user()->rol !== 'jefe') {
            return redirect()->route('dashboard')->with('error', 'Solo el Jefe de Unidad puede acceder a la Bandeja de Admisión.');
        }

        $with = ['denunciante', 'denunciados', 'pruebas', 'categoria', 'tecnico', 'informe', 'cierre', 'solicitudes.unidadDestino', 'solicitudes.ampliaciones', 'descargos.denunciado', 'descargos.ampliaciones', 'evaluaciones', 'bitacora.usuario'];

        $ingresadas = Denuncia::with($with)->whereIn('estado', ['ingresada', 'evaluacion_tecnica'])->latest()->get();
        $porAsignar = Denuncia::with($with)->where('estado', 'admitida')->latest()->get();
        $enCurso = Denuncia::with($with)->whereIn('estado', ['asignada', 'investigacion', 'informe'])->latest()->get();
        $historial = Denuncia::with($with)->whereIn('estado', ['rechazada', 'cerrada'])->latest()->get();

        $solicitudesByTicket = [];
        $descargosByTicket = [];
        $evaluacionesByTicket = [];
        
        $all = $ingresadas->concat($porAsignar)->concat($enCurso)->concat($historial);
        foreach ($all as $d) {
            $solicitudesByTicket[$d->ticket] = $d->solicitudes;
            $descargosByTicket[$d->ticket] = $d->descargos;
            $evaluacionesByTicket[$d->ticket] = $d->evaluaciones;
            unset($d->solicitudes);
            unset($d->descargos);
            unset($d->evaluaciones);
        }

        $contadores = [
            'ingresadas' => Denuncia::where('estado', 'ingresada')->count(),
            'porAdmitir' => Denuncia::whereIn('estado', ['ingresada', 'evaluacion_tecnica'])->count(),
            'porAsignar' => Denuncia::where('estado', 'admitida')->count(),
            'enCurso' => Denuncia::whereIn('estado', ['asignada', 'investigacion', 'informe'])->count(),
            'historial' => Denuncia::whereIn('estado', ['rechazada', 'cerrada'])->count(),
            'activos' => Denuncia::whereNotIn('estado', ['rechazada', 'cerrada'])->count(),
        ];

        $tecnicos = User::where('rol', 'tecnico')->where('activo', true)->get();

        return Inertia::render('Denuncias/Bandeja', [
            'denuncias' => $ingresadas,
            'porAsignar' => $porAsignar,
            'enCurso' => $enCurso,
            'historial' => $historial,
            'contadores' => $contadores,
            'tecnicos' => $tecnicos,
            'cargaTecnicos' => $tecnicos->map(fn($t) => [
                'id' => $t->id,
                'nombre' => $t->name,
                'iniciales' => $t->iniciales,
                'color' => $t->color,
                'activos' => Denuncia::where('tecnico_id', $t->id)->whereNotIn('estado', ['rechazada', 'cerrada'])->count(),
            ]),
            'solicitudesByTicket' => $solicitudesByTicket,
            'descargosByTicket' => $descargosByTicket,
            'evaluacionesByTicket' => $evaluacionesByTicket,
            'canAct' => true,
            'destacar' => $request->query('destacar'),
        ]);
    }
}
