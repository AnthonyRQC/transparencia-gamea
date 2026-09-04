<?php

namespace App\Http\Middleware;

use App\Data\PermisosCatalogo;
use App\Models\CategoriaDenuncia;
use App\Models\Clasificacion;
use App\Models\DependenciaExterna;
use App\Models\MedioNotificacion;
use App\Models\Notificacion;
use App\Services\AlertasPlazo;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $user = $request->user();

        $share = [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'username' => $user->username,
                    'rol' => $user->rol,
                    'iniciales' => $user->iniciales,
                    'color' => $user->color,
                    'preferencias' => $user->preferencias,
                    'permisos' => PermisosCatalogo::permisosPorRol($user->rol),
                ] : null,
            ],
            'logo_url' => asset('LOGO-OFICIAL-EL-ALTO.png'),
            'jacha_url' => asset('jacha.jpg'),
            'success' => session('success'),
            'ticket' => session('ticket'),
            'token' => session('token'),
            'categorias' => CategoriaDenuncia::where('activa', true)->pluck('nombre', 'clave')->toArray(),
            'dependencias' => DependenciaExterna::where('activa', true)->orderBy('nombre')->get(['id', 'nombre', 'parent_id'])->toArray(),
            'clasificaciones' => Clasificacion::where('activa', true)->orderBy('nombre')->get(['id', 'clave', 'nombre'])->toArray(),
            'medios_notificacion' => MedioNotificacion::where('activa', true)->orderBy('nombre')->get(['id', 'clave', 'nombre'])->toArray(),
            'notificaciones' => $user ? (function () use ($user) {
                $persistentes = Notificacion::where('usuario_id', $user->id)->latest()->take(5)->get()->toArray();
                // Alertas derivadas (vivas): no se persisten, respetan fecha simulada.
                try {
                    $derivadas = AlertasPlazo::paraUsuario($user);
                } catch (\Throwable) {
                    $derivadas = [];
                }
                $recientes = array_slice(array_merge($derivadas, $persistentes), 0, 5);
                $noLeidas = Notificacion::where('usuario_id', $user->id)->where('leida', false)->count()
                    + count($derivadas);

                return ['no_leidas' => $noLeidas, 'recientes' => $recientes];
            })() : [
                'no_leidas' => 0,
                'recientes' => [],
            ],
            // Time Machine: fecha simulada (solo local). El banner la muestra.
            'simFecha' => app()->isLocal() ? session('dev_sim_fecha') : null,
        ];

        return $share;
    }
}
