<?php

namespace App\Http\Middleware;

use App\Data\NotificacionData;
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
        ];

        if ($request->user()) {
            NotificacionData::generarParaUsuario();
            $share['notificaciones'] = [
                'no_leidas' => NotificacionData::getUnreadCount(),
                'recientes' => NotificacionData::getRecientes(5),
            ];
            $share['demo_mode'] = session('demo_mode', false);
        }

        return $share;
    }
}
