<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PublicacionController;
use App\Http\Controllers\SeguimientoController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes — Sistema de Gestión de Denuncias UTLCC
|--------------------------------------------------------------------------
| Sprint 16.2: entry + públicas aquí; el resto en parciales
| (denuncias, reportes, admin, cuenta) con `can:` por ruta.
*/

// ============================================================
// RUTAS PÚBLICAS
// ============================================================

Route::get('/', [PublicacionController::class, 'muro'])
    ->middleware('throttle:60,1')
    ->name('home');

// Seguimiento público (Sprint 6)
Route::get('/seguimiento', [SeguimientoController::class, 'buscar'])
    ->middleware('throttle:30,1')
    ->name('seguimiento.buscar');

// Descarga pública de adjuntos (solo avisos publicados, sin auth)
Route::get('/panel/archivos/{id}/descargar', [PublicacionController::class, 'descargarPublico'])
    ->middleware('throttle:60,1')
    ->name('panel.descargar');

// ============================================================
// DESIGN SYSTEM (interno, solo local — 404 en producción)
// ============================================================

Route::get('/design-system', function () {
    abort_unless(app()->isLocal(), 404);

    return Inertia::render('DesignSystem');
})->name('design-system');

// ============================================================
// RUTAS AUTENTICADAS — Sistema UTLCC
// ============================================================

Route::middleware('auth')->group(function () {

    // Dashboard / Inicio (Sprint 12)
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    require __DIR__.'/denuncias.php';
    require __DIR__.'/reportes.php';
    require __DIR__.'/admin.php';
    require __DIR__.'/cuenta.php';

    // ----- Time Machine (solo local, ver routes/dev.php) -----
    require __DIR__.'/dev.php';

}); // end auth middleware group

require __DIR__.'/auth.php';
