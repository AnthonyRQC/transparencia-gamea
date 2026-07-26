<?php

namespace App\Http\Middleware;

use App\Data\PermisosCatalogo;
use App\Models\CategoriaDenuncia;
use App\Models\Notificacion;
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
            'notificaciones' => $user ? [
                'no_leidas' => Notificacion::where('usuario_id', $user->id)->where('leida', false)->count(),
                'recientes' => Notificacion::where('usuario_id', $user->id)->latest()->take(5)->get(),
            ] : [
                'no_leidas' => 0,
                'recientes' => [],
            ],
        ];

        return $share;
    }
}
