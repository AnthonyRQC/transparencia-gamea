<?php

namespace App\Http\Controllers;

use App\Data\DenunciaData;
use Inertia\Inertia;

class MiResumenController extends Controller
{
    public function index()
    {
        if (empty(DenunciaData::getAll())) {
            DenunciaData::seedDemoData();
        }

        $tecnicoId = request('tecnico', 'tec-1');
        $contadores = DenunciaData::getContadoresTecnico($tecnicoId);

        return Inertia::render('Denuncias/MiResumen', [
            'contadores' => $contadores,
            'tecnicoActual' => $tecnicoId,
            'tecnicos' => DenunciaData::TECNICOS_MOCK,
        ]);
    }
}
