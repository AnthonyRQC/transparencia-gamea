<?php

use App\Http\Controllers\DevTiempoController;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Rutas Dev (Sprint 12.3 + Dev Tools — solo entorno local)
|--------------------------------------------------------------------------
| En entornos de testing o producción no se registran.
*/

if (app()->isLocal()) {
    // Time Machine (requiere sesión activa previa)
    Route::middleware(['auth'])->group(function () {
        Route::get('/dev/tiempo', [DevTiempoController::class, 'index'])->name('dev.tiempo');
        Route::post('/dev/tiempo', [DevTiempoController::class, 'fijar'])->name('dev.tiempo.fijar');
        Route::post('/dev/tiempo/limpiar', [DevTiempoController::class, 'limpiar'])->name('dev.tiempo.limpiar');
    });

    // Auto-login instantáneo por rol para agilizar desarrollo local
    Route::get('/dev/login/{rol}', function (string $rol) {
        $usuarios = [
            'jefe' => 'PM4864213',
            'registrador' => 'MG7551234',
            'investigador' => 'CQ6123457',
            'admin' => 'AS9000001',
        ];

        $clave = strtolower(trim($rol));
        $username = $usuarios[$clave] ?? null;

        if (! $username) {
            abort(404, "Rol dev desconocido: [{$rol}]. Válidos: jefe, registrador, investigador, admin.");
        }

        $user = User::where('username', $username)->where('activo', true)->firstOrFail();
        Auth::login($user);
        request()->session()->regenerate();

        return redirect()->route('dashboard');
    })->name('dev.login');
}
