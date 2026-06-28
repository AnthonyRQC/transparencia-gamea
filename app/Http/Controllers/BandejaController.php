<?php

namespace App\Http\Controllers;

use App\Data\DenunciaData;
use Inertia\Inertia;

class BandejaController extends Controller
{
    public function index()
    {
        if (empty(DenunciaData::getAll())) {
            DenunciaData::seedDemoData();
        }

        $denuncias = array_map(fn($d) => array_merge($d, [
            'plazo' => DenunciaData::getPlazoInfo($d),
        ]), DenunciaData::getByEstado('ingresada'));

        return Inertia::render('Denuncias/Bandeja', [
            'denuncias' => array_values($denuncias),
            'contadores' => DenunciaData::getContadores(),
            'tecnicos' => DenunciaData::TECNICOS_MOCK,
        ]);
    }
}
