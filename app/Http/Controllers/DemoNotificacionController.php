<?php

namespace App\Http\Controllers;

use App\Data\NotificacionData;
use Illuminate\Http\Request;

class DemoNotificacionController extends Controller
{
    public function toggle(Request $request)
    {
        $active = $request->input('active', false);
        session(['demo_mode' => (bool) $active]);
        return redirect()->back();
    }

    public function simular(Request $request)
    {
        $tipo = $request->input('tipo', 'sistema');
        NotificacionData::simular($tipo);
        return redirect()->back()->with('success', "Notificación simulada: {$tipo}");
    }

    public function reset()
    {
        NotificacionData::reset();
        return redirect()->back()->with('success', 'Todos los datos fueron restaurados al estado seed inicial.');
    }
}
