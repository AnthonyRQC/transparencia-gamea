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
        $tecnicoId = $currentUser['id'];

        if ($currentUser['rol'] !== 'tecnico') {
            $tecnicoId = 'tec-1';
        }

        $contadores = DenunciaData::getContadoresTecnico($tecnicoId);

        return Inertia::render('Denuncias/MiResumen', [
            'contadores' => $contadores,
            'tecnicoActual' => $tecnicoId,
            'tecnicos' => SesionUsuarioData::getAll(),
        ]);
    }
}
