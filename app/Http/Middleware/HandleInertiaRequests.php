<?php

namespace App\Http\Middleware;

use App\Data\NotificacionData;
use App\Data\SesionUsuarioData;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $currentUser = SesionUsuarioData::getCurrent();

        $share = [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            'logo_url' => asset('LOGO-OFICIAL-EL-ALTO.png'),
            'jacha_url' => asset('jacha.jpg'),
            'success' => session('success'),
            'ticket' => session('ticket'),
            'token' => session('token'),
            'currentUser' => $currentUser,
            'usuarios' => SesionUsuarioData::getAll(),
        ];

        NotificacionData::generarParaUsuario($currentUser['id']);
        $share['notificaciones'] = [
            'no_leidas' => NotificacionData::getUnreadCount($currentUser['id']),
            'recientes' => NotificacionData::getRecientes(5, $currentUser['id']),
        ];
        $share['demo_mode'] = session('demo_mode', false);

        return $share;
    }
}
