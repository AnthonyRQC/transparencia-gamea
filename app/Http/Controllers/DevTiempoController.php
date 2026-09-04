<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Time Machine — página dev solo entorno local.
 * Permite fijar/limpiar la fecha simulada (sesión dev_sim_fecha).
 */
class DevTiempoController extends Controller
{
    private function soloLocal(): void
    {
        abort_unless(app()->isLocal(), 404);
    }

    public function index(): Response
    {
        $this->soloLocal();

        return Inertia::render('Dev/Tiempo', [
            'simFecha' => session('dev_sim_fecha'),
            'hoy' => Carbon::now('America/La_Paz')->toDateString(),
        ]);
    }

    public function fijar(Request $request)
    {
        $this->soloLocal();

        $data = $request->validate([
            'fecha' => ['required', 'date_format:Y-m-d'],
        ]);

        session(['dev_sim_fecha' => $data['fecha']]);

        return redirect()->back()->with('success', 'FECHA SIMULADA: ' . $data['fecha']);
    }

    public function limpiar()
    {
        $this->soloLocal();

        session()->forget('dev_sim_fecha');
        Carbon::setTestNow(null);

        return redirect()->back()->with('success', 'FECHA SIMULADA LIMPIADA — VOLVISTE A HOY');
    }
}
