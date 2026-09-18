<?php

use App\Http\Controllers\NotificacionController;
use App\Http\Controllers\NotificacionStreamController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Rutas de Cuenta propia (Sprint 16.2)
|--------------------------------------------------------------------------
| Perfil, notificaciones y stream. Sin `DELETE /profile`
| (nunca delete físico de usuarios, D16/D20).
*/

Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
Route::patch('/profile/preferencias', [ProfileController::class, 'preferencias'])->name('profile.preferencias');

// Sprint 9 — Notificaciones
Route::prefix('notificaciones')->name('notificaciones.')->group(function () {
    Route::get('/', [NotificacionController::class, 'index'])->can('menu.notificaciones')->name('index');
    Route::post('/{id}/leer', [NotificacionController::class, 'marcarLeida'])->can('notificacion.ver')->name('marcar-leida');
    Route::post('/leer-todas', [NotificacionController::class, 'marcarTodasLeidas'])->can('notificacion.ver')->name('marcar-todas');
});

// API — Notificaciones
Route::get('/api/notificaciones/count', [NotificacionController::class, 'count'])
    ->can('notificacion.ver');

// SSE — Stream de notificaciones en tiempo real (Server-Sent Events)
Route::get('/notifications/stream', [NotificacionStreamController::class, 'stream'])
    ->can('notificacion.ver')
    ->name('notifications.stream');
