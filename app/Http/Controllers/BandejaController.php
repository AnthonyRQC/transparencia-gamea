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

        $enCurso = array_values(array_map($mapPlazo, array_merge(
            DenunciaData::getByEstado('asignada'),
            DenunciaData::getByEstado('investigacion'),
            DenunciaData::getByEstado('informe'),
        )));
        $historial = array_values(array_map($mapPlazo, array_merge(
            DenunciaData::getByEstado('rechazada'),
            DenunciaData::getByEstado('cerrada'),
        )));

        return Inertia::render('Denuncias/Bandeja', [
            'denuncias' => array_values(array_map($mapPlazo, DenunciaData::getByEstado('ingresada'))),
            'porAsignar' => array_values(array_map($mapPlazo, DenunciaData::getByEstado('admitida'))),
            'enCurso' => $enCurso,
            'historial' => $historial,
            'contadores' => DenunciaData::getContadores(),
            'tecnicos' => DenunciaData::TECNICOS_MOCK,
            'cargaTecnicos' => DenunciaData::getCargaTecnicos(),
        ]);
    }
}
