<?php

namespace App\Http\Controllers;

use App\Data\DenunciaData;
use App\Data\SesionUsuarioData;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ConsultaCasosController extends Controller
{
    public function index(Request $request)
    {
        $currentUser = SesionUsuarioData::getCurrent();
        if ($currentUser['rol'] !== 'registrador') {
            abort(403, 'Acceso denegado. Solo el Registrador puede consultar casos.');
        }

        $denuncias = DenunciaData::getAllActivos();

        // 1. Texto libre
        if ($busqueda = $request->input('busqueda')) {
            $q = mb_strtoupper($busqueda);
            $denuncias = array_values(array_filter($denuncias, fn($d) =>
                stripos($d['ticket'] ?? '', $q) !== false
                || stripos($d['hechos'] ?? '', $q) !== false
                || stripos(($d['denunciante']['nombres'] ?? ''), $q) !== false
                || stripos(implode(' ', array_column($d['denunciados'] ?? [], 'nombres')), $q) !== false
                || stripos(implode(' ', array_column($d['denunciados'] ?? [], 'dependencia')), $q) !== false
                || stripos($d['resumen_rechazo'] ?? '', $q) !== false
            ));
        }

        // 2. Ticket exacto
        if ($ticket = $request->input('ticket')) {
            $ticket = mb_strtoupper(trim($ticket));
            $denuncias = array_values(array_filter($denuncias, fn($d) => ($d['ticket'] ?? '') === $ticket));
        }

        // 3. Estado (multi-select)
        if ($estados = $request->input('estado')) {
            $estadosArr = is_array($estados) ? $estados : explode(',', $estados);
            $denuncias = array_values(array_filter($denuncias, fn($d) => in_array($d['estado'] ?? '', $estadosArr)));
        }

        // 4. Tipo
        if ($tipo = $request->input('tipo')) {
            $denuncias = array_values(array_filter($denuncias, fn($d) => ($d['tipo'] ?? '') === $tipo));
        }

        // 5. Escenario
        if ($escenario = $request->input('escenario')) {
            $denuncias = array_values(array_filter($denuncias, fn($d) => ($d['escenario'] ?? '') === $escenario));
        }

        // 6. Rango fechas ingreso
        if ($desde = $request->input('fecha_desde')) {
            $desdeDate = Carbon::parse($desde)->startOfDay();
            $denuncias = array_values(array_filter($denuncias, fn($d) =>
                isset($d['created_at']) && Carbon::parse($d['created_at']) >= $desdeDate
            ));
        }
        if ($hasta = $request->input('fecha_hasta')) {
            $hastaDate = Carbon::parse($hasta)->endOfDay();
            $denuncias = array_values(array_filter($denuncias, fn($d) =>
                isset($d['created_at']) && Carbon::parse($d['created_at']) <= $hastaDate
            ));
        }

        // 7. Técnico asignado
        if ($tecnico = $request->input('tecnico')) {
            $denuncias = array_values(array_filter($denuncias, fn($d) => ($d['tecnico'] ?? '') === $tecnico));
        }

        // Enriquecer con plazo info y denunciante masked
        $denuncias = array_map(function ($d) {
            $d['plazo'] = DenunciaData::getPlazoInfo($d);
            $escenario = $d['escenario'] ?? 'revelada';
            $denombres = $d['denunciante']['nombres'] ?? '';
            if ($escenario !== 'revelada') {
                $d['denunciante'] = array_merge($d['denunciante'] ?? [], [
                    'nombres' => $denombres ? mb_substr($denombres, 0, 1) . '**** ' . mb_substr($denombres, -1) : 'Confidencial',
                ]);
            }
            return $d;
        }, $denuncias);

        return Inertia::render('Denuncias/ConsultarCasos', [
            'denuncias' => $denuncias,
            'tecnicos' => DenunciaData::TECNICOS_MOCK,
            'filters' => $request->only([
                'busqueda', 'ticket', 'estado', 'tipo', 'escenario', 'fecha_desde', 'fecha_hasta', 'tecnico'
            ]),
        ]);
    }
}
