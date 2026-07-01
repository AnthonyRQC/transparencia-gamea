<?php

namespace App\Http\Controllers;

use App\Data\NotificacionData;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificacionController extends Controller
{
    public function index(Request $request)
    {
        $page = (int) $request->input('page', 1);
        $filtros = [
            'tipo' => $request->input('tipo'),
            'leida' => $request->input('leida'),
            'fecha_desde' => $request->input('fecha_desde'),
            'fecha_hasta' => $request->input('fecha_hasta'),
        ];

        $resultado = NotificacionData::getPaginated(
            page: $page,
            perPage: 10,
            filtros: $filtros,
        );

        return Inertia::render('Notificaciones/Index', [
            'notificaciones' => $resultado,
            'filtros' => $filtros,
        ]);
    }

    public function marcarLeida(Request $request, int $id)
    {
        NotificacionData::marcarLeida($id);
        return redirect()->back();
    }

    public function marcarTodasLeidas(Request $request)
    {
        NotificacionData::marcarTodasLeidas();
        return redirect()->back();
    }

    public function count()
    {
        $count = NotificacionData::getUnreadCount();
        return response()->json(['no_leidas' => $count]);
    }
}
