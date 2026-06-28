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

        $mapPlazo = fn($d) => array_merge($d, ['plazo' => DenunciaData::getPlazoInfo($d)]);

        return Inertia::render('Denuncias/Bandeja', [
            'denuncias' => array_values(array_map($mapPlazo, DenunciaData::getByEstado('ingresada'))),
            'porAsignar' => array_values(array_map($mapPlazo, DenunciaData::getByEstado('admitida'))),
            'rechazadas' => array_values(array_map($mapPlazo, DenunciaData::getByEstado('rechazada'))),
            'contadores' => DenunciaData::getContadores(),
            'tecnicos' => DenunciaData::TECNICOS_MOCK,
            'cargaTecnicos' => DenunciaData::getCargaTecnicos(),
        ]);
    }
}
