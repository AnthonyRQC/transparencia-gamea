<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

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
        ]);

        //
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
