<?php

namespace App\Http\Controllers;

use App\Data\DenunciaData;
use App\Data\SesionUsuarioData;
use Inertia\Inertia;

class MiResumenController extends Controller
{
    public function index()
    {
        if (empty(DenunciaData::getAll())) {
            DenunciaData::seedDemoData();
        }

        $currentUser = SesionUsuarioData::getCurrent();
        if ($currentUser['rol'] !== 'tecnico') {
            return redirect()->route('dashboard')->with('error', 'Solo los técnicos pueden acceder a Mi Resumen.');
        }
        $tecnicoId = $currentUser['id'];

        $contadores = DenunciaData::getContadoresTecnico($tecnicoId);

        return Inertia::render('Denuncias/MiResumen', [
            'contadores' => $contadores,
            'tecnicoActual' => $tecnicoId,
            'tecnicos' => SesionUsuarioData::getAll(),
        ]);
    }
}
