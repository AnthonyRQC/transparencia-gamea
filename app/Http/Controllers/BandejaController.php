<?php

namespace App\Http\Controllers;

use App\Data\DenunciaData;
use Inertia\Inertia;

class BandejaController extends Controller
{
    public function index(\Illuminate\Http\Request $request)
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

        // Sprint 4 — Solicitudes y Descargos agrupados por ticket
        $allTickets = array_unique(array_merge(
            array_column(DenunciaData::getAll(), 'ticket')
        ));

        $solicitudesByTicket = [];
        $descargosByTicket = [];
        foreach ($allTickets as $t) {
            $sols = DenunciaData::getSolicitudes($t);
            $descs = DenunciaData::getDescargos($t);
            if (!empty($sols)) $solicitudesByTicket[$t] = $sols;
            if (!empty($descs)) $descargosByTicket[$t] = $descs;
        }

        return Inertia::render('Denuncias/Bandeja', [
            'denuncias' => array_values(array_map($mapPlazo, DenunciaData::getByEstado('ingresada'))),
            'porAsignar' => array_values(array_map($mapPlazo, DenunciaData::getByEstado('admitida'))),
            'enCurso' => $enCurso,
            'historial' => $historial,
            'contadores' => DenunciaData::getContadores(),
            'tecnicos' => DenunciaData::TECNICOS_MOCK,
            'cargaTecnicos' => DenunciaData::getCargaTecnicos(),
            'solicitudesByTicket' => $solicitudesByTicket,
            'descargosByTicket' => $descargosByTicket,
            'canAct' => false,
            'destacar' => $request->query('destacar'),
        ]);
    }
}
