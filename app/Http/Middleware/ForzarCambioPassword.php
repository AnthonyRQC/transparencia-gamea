<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Cambio forzado de contraseña temporal (Sprint 18B).
 * Usuarios creados/reseteados por panel deben estrenar clave propia
 * antes de operar. Solo perfil, cambio de clave y logout están libres.
 */
class ForzarCambioPassword
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (
            $user && $user->debe_cambiar_password
            && ! $request->routeIs('profile.edit', 'profile.update', 'profile.preferencias', 'password.update', 'logout')
        ) {
            return redirect()->route('profile.edit')
                ->with('error', 'DEBES CAMBIAR TU CONTRASEÑA TEMPORAL ANTES DE CONTINUAR.');
        }

        return $next($request);
    }
}
