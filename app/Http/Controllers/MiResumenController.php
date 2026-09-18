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
        if (! Auth::user()->puede('menu.mi-resumen')) {
            return redirect()->route('dashboard')->with('error', 'NO TIENES PERMISO PARA ESA SECCIÓN.');
        }

        $investigadorId = Auth::id();

        $contadores = [
            'activos' => Denuncia::where('investigador_id', $investigadorId)->whereNotIn('estado', ['rechazada', 'cerrada'])->count(),
            'vencidos' => Denuncia::where('investigador_id', $investigadorId)->whereNotIn('estado', ['rechazada', 'cerrada'])->count(),
            'porVencer' => 0,
            'cerrados' => Denuncia::where('investigador_id', $investigadorId)->whereIn('estado', ['cerrada'])->count(),
        ];

        return Inertia::render('Denuncias/MiResumen', [
            'contadores' => $contadores,
            'investigadorActual' => $investigadorId,
            'investigadores' => User::where('rol', 'investigador')->where('activo', true)->get(),
        ]);
    }
}
