<?php

use App\Http\Controllers\DevTiempoController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Rutas Dev/Time Machine (Sprint 12.3 — extraído de web.php)
|--------------------------------------------------------------------------
| Solo local: el controller hace abort 404 si no es local.
| Se cargan dentro del grupo auth desde web.php.
*/

Route::get('/dev/tiempo', [DevTiempoController::class, 'index'])->name('dev.tiempo');
Route::post('/dev/tiempo', [DevTiempoController::class, 'fijar'])->name('dev.tiempo.fijar');
Route::post('/dev/tiempo/limpiar', [DevTiempoController::class, 'limpiar'])->name('dev.tiempo.limpiar');
