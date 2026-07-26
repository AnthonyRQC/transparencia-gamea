<?php

namespace App\Http\Controllers;

use App\Models\Denuncia;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class MiResumenController extends Controller
{
    public function index()
    {
        if (Auth::user()->rol !== 'tecnico') {
            return redirect()->route('dashboard')->with('error', 'Solo los técnicos pueden acceder a Mi Resumen.');
        }

        $tecnicoId = Auth::id();

        $contadores = [
            'activos' => Denuncia::where('tecnico_id', $tecnicoId)->whereNotIn('estado', ['rechazada', 'cerrada'])->count(),
            'vencidos' => Denuncia::where('tecnico_id', $tecnicoId)->whereNotIn('estado', ['rechazada', 'cerrada'])->count(),
            'porVencer' => 0,
            'cerrados' => Denuncia::where('tecnico_id', $tecnicoId)->whereIn('estado', ['cerrada'])->count(),
        ];

        return Inertia::render('Denuncias/MiResumen', [
            'contadores' => $contadores,
            'tecnicoActual' => $tecnicoId,
            'tecnicos' => User::where('rol', 'tecnico')->where('activo', true)->get(),
        ]);
    }
}
