<?php

namespace App\Http\Controllers;

use App\Models\Notificacion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class NotificacionController extends Controller
{
    public function index(Request $request)
    {
        $page = (int) $request->input('page', 1);

        $query = Notificacion::where('usuario_id', Auth::id())->latest('fecha');

        if ($tipo = $request->input('tipo')) {
            $query->where('tipo', $tipo);
        }
        if ($leida = $request->input('leida')) {
            $query->where('leida', $leida === 'true');
        }
        if ($fechaDesde = $request->input('fecha_desde')) {
            $query->where('fecha', '>=', $fechaDesde);
        }
        if ($fechaHasta = $request->input('fecha_hasta')) {
            $query->where('fecha', '<=', $fechaHasta . ' 23:59:59');
        }

        $notificaciones = $query->paginate(10, ['*'], 'page', $page);

        return Inertia::render('Notificaciones/Index', [
            'notificaciones' => [
                'items' => $notificaciones->items(),
                'total' => $notificaciones->total(),
                'page' => $notificaciones->currentPage(),
                'per_page' => $notificaciones->perPage(),
                'total_pages' => $notificaciones->lastPage(),
            ],
            'filtros' => [
                'tipo' => $request->input('tipo'),
                'leida' => $request->input('leida'),
                'fecha_desde' => $request->input('fecha_desde'),
                'fecha_hasta' => $request->input('fecha_hasta'),
            ],
        ]);
    }

    public function marcarLeida(int $id)
    {
        Notificacion::where('usuario_id', Auth::id())->where('id', $id)->update([
            'leida' => true,
            'fecha_leida' => now(),
        ]);
        return redirect()->back();
    }

    public function marcarTodasLeidas()
    {
        Notificacion::where('usuario_id', Auth::id())->where('leida', false)->update([
            'leida' => true,
            'fecha_leida' => now(),
        ]);
        return redirect()->back();
    }

    public function count()
    {
        $count = Notificacion::where('usuario_id', Auth::id())->where('leida', false)->count();
        return response()->json(['no_leidas' => $count]);
    }
}
