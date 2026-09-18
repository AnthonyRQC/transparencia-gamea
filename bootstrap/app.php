<?php

use App\Http\Middleware\EnsureActive;
use App\Http\Middleware\ForzarCambioPassword;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->trustProxies(at: '*');

        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        // Time Machine: corre DENTRO del grupo web DESPUÉS de la sesión
        // (append, no prepend: antes de StartSession no hay session() disponible
        // y la fecha simulada se perdía en silencio). Sigue antes que los
        // controllers, así Carbon::setTestNow() aplica a todo el request.
        $middleware->web(append: [
            \App\Http\Middleware\SimularFecha::class,
            // Sesiones de desactivados mueren aquí (D18). Corre tras Authenticate.
            EnsureActive::class,
            // Clave temporal: solo perfil/cambio/logout hasta estrenarla (18B).
            ForzarCambioPassword::class,
        ]);

        //
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // `can:` niega con 403. Laravel mapea AuthorizationException a
        // AccessDeniedHttpException antes de los callbacks: se captura esa.
        // La app responde redirect + toast (D18), no página de error.
        $exceptions->render(function (AccessDeniedHttpException $e, Request $request) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'NO TIENES PERMISO PARA ESA SECCIÓN.'], 403);
            }

            if ($request->user()) {
                return redirect()->route('dashboard')->with('error', 'NO TIENES PERMISO PARA ESA SECCIÓN.');
            }

            return redirect()->route('login');
        });
    })->create();
