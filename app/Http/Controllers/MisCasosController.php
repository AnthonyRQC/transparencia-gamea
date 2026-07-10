<?php

namespace App\Http\Controllers;

use App\Data\DenunciaData;
use App\Data\SesionUsuarioData;
use Inertia\Inertia;

class MisCasosController extends Controller
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

        $denuncias = DenunciaData::getByTecnico($tecnicoId);

        $grouped = [];
        foreach ($denuncias as $d) {
            $estado = $d['estado'] ?? '';
            if (!isset($grouped[$estado])) $grouped[$estado] = [];
            $grouped[$estado][] = array_merge($d, [
                'plazo' => DenunciaData::getPlazoInfo($d),
            ]);
        }

        // Sprint 4 — Solicitudes y Descargos agrupados por ticket
        $allTickets = array_unique(array_merge(
            array_column($denuncias, 'ticket')
        ));

        $solicitudesByTicket = [];
        $descargosByTicket = [];
        foreach ($allTickets as $t) {
            $sols = DenunciaData::getSolicitudes($t);
            $descs = DenunciaData::getDescargos($t);
            if (!empty($sols)) $solicitudesByTicket[$t] = $sols;
            if (!empty($descs)) $descargosByTicket[$t] = $descs;
        }

        return Inertia::render('Denuncias/MisCasos', [
            'grouped' => $grouped,
            'tecnicoActual' => $tecnicoId,
            'tecnicos' => SesionUsuarioData::getAll(),
            'solicitudesByTicket' => $solicitudesByTicket,
            'descargosByTicket' => $descargosByTicket,
            'canAct' => true,
        ]);
    }
}
