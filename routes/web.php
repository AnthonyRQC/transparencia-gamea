<?php

use App\Http\Controllers\BandejaController;
use App\Http\Controllers\MisCasosController;
use App\Http\Controllers\MiResumenController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DenunciaController;
use App\Http\Controllers\SolicitudController;
use App\Http\Controllers\DescargoController;
use App\Http\Controllers\SeguimientoController;
use App\Http\Controllers\NotificacionController;
use App\Http\Controllers\DemoNotificacionController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes — Sistema de Gestión de Denuncias UTLCC
|--------------------------------------------------------------------------
| Sprint 0: Estructura base de navegación. Las páginas son placeholders
| que se reemplazarán en los siguientes sprints con la lógica real.
*/

// ============================================================
// RUTAS PÚBLICAS
// ============================================================

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
})->name('home');

// Seguimiento público (Sprint 6)
Route::get('/seguimiento', [SeguimientoController::class, 'buscar'])
    ->middleware('throttle:30,1')
    ->name('seguimiento.buscar');

// ============================================================
// DESIGN SYSTEM (interno, sin auth para poder revisar tema)
// ============================================================

Route::get('/design-system', function () {
    return Inertia::render('DesignSystem');
})->name('design-system');

// ============================================================
// RUTAS AUTENTICADAS — Sistema UTLCC
// ============================================================

// Dashboard / Inicio
Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->name('dashboard');

// ----- Denuncias -----
Route::prefix('denuncias')->name('denuncias.')->group(function () {
    // Bandeja de Admisión (Sprint 2)
    Route::get('/', [BandejaController::class, 'index'])->name('bandeja');

    // Registro de nueva denuncia (Sprint 1)
    Route::get('/registrar', [DenunciaController::class, 'create'])->name('registrar');
    Route::post('/', [DenunciaController::class, 'store'])->name('store');

    // Acciones (Sprint 2)
    Route::post('/{ticket}/admitir', [DenunciaController::class, 'admitir'])->name('admitir');
    Route::post('/{ticket}/rechazar', [DenunciaController::class, 'rechazar'])->name('rechazar');
    Route::post('/{ticket}/iniciar', [DenunciaController::class, 'iniciarInvestigacion'])->name('iniciar');

    // Sprint 3 — Asignación, Traspaso, Reapertura
    Route::post('/{ticket}/asignar', [DenunciaController::class, 'asignar'])->name('asignar');
    Route::post('/{ticket}/traspasar', [DenunciaController::class, 'traspasar'])->name('traspasar');
    Route::post('/{ticket}/reabrir', [DenunciaController::class, 'reabrir'])->name('reabrir');

    // Sprint 4 — Saltar fase
    Route::post('/{ticket}/saltar-fase', [DenunciaController::class, 'saltarFase'])->name('saltar-fase');

    // Sprint 5 — Informe Final y Cierre
    Route::post('/{ticket}/informe', [DenunciaController::class, 'guardarInforme'])->name('informe.guardar');
    Route::post('/{ticket}/informe/editar', [DenunciaController::class, 'editarInforme'])->name('informe.editar');
    Route::post('/{ticket}/informe/eliminar', [DenunciaController::class, 'eliminarInforme'])->name('informe.eliminar');
    Route::post('/{ticket}/cierre', [DenunciaController::class, 'guardarCierre'])->name('cierre.guardar');
    Route::post('/{ticket}/cierre/editar', [DenunciaController::class, 'editarCierre'])->name('cierre.editar');
    Route::post('/{ticket}/cierre/eliminar', [DenunciaController::class, 'eliminarCierre'])->name('cierre.eliminar');

    // Carga de técnicos (Sprint 3)
    Route::get('/carga-tecnicos', [DenunciaController::class, 'cargaTecnicos'])->name('carga-tecnicos');

    // Sprint 8 — Ampliaciones Múltiples
    Route::post('/{ticket}/ampliar-plazo', [DenunciaController::class, 'aprobarAmpliacion'])->name('ampliar-plazo');

    // Sprint 4 — Solicitudes
    Route::post('/{ticket}/solicitudes', [SolicitudController::class, 'store'])->name('solicitudes.store');
    Route::post('/solicitudes/{id}/responder', [SolicitudController::class, 'responder'])->name('solicitudes.responder');
    Route::post('/solicitudes/{id}/ampliar', [SolicitudController::class, 'ampliar'])->name('solicitudes.ampliar');
    Route::post('/solicitudes/{id}/cancelar', [SolicitudController::class, 'cancelar'])->name('solicitudes.cancelar');
    Route::post('/solicitudes/{id}/editar', [SolicitudController::class, 'editar'])->name('solicitudes.editar');
    Route::post('/solicitudes/{id}/eliminar', [SolicitudController::class, 'eliminar'])->name('solicitudes.eliminar');

    // Sprint 4 — Descargos
    Route::post('/{ticket}/descargos', [DescargoController::class, 'store'])->name('descargos.store');
    Route::post('/descargos/{id}/notificar', [DescargoController::class, 'notificar'])->name('descargos.notificar');
    Route::post('/descargos/{id}/responder', [DescargoController::class, 'responder'])->name('descargos.responder');
    Route::post('/descargos/{id}/ampliar', [DescargoController::class, 'ampliar'])->name('descargos.ampliar');
    Route::post('/descargos/{id}/cancelar', [DescargoController::class, 'cancelar'])->name('descargos.cancelar');
    Route::post('/descargos/{id}/editar', [DescargoController::class, 'editar'])->name('descargos.editar');
    Route::post('/descargos/{id}/eliminar', [DescargoController::class, 'eliminar'])->name('descargos.eliminar');

    // Mis Casos + Mi Resumen (Sprint 2)
    Route::get('/mis-casos', [MisCasosController::class, 'index'])->name('mis-casos');
    Route::get('/mi-resumen', [MiResumenController::class, 'index'])->name('mi-resumen');

    // Detalle de denuncia (placeholder — el detalle real se implementa con Sheet)
    Route::get('/{id}', function ($id) {
        return Inertia::render('Denuncias/DetalleDenuncia', ['id' => $id]);
    })->name('detalle');
});

// ----- Reportes (Sprint 7) -----
Route::get('/reportes', function () {
    return Inertia::render('Reportes/Index');
})->name('reportes.index');

// ----- Administración (Sprint 8) -----
Route::prefix('admin')->name('admin.')->group(function () {
    Route::get('/feriados', function () {
        return Inertia::render('Admin/Feriados');
    })->name('feriados');
});

// Sprint 9 — Notificaciones
Route::middleware('auth')->prefix('notificaciones')->name('notificaciones.')->group(function () {
    Route::get('/', [NotificacionController::class, 'index'])->name('index');
    Route::post('/{id}/leer', [NotificacionController::class, 'marcarLeida'])->name('marcar-leida');
    Route::post('/leer-todas', [NotificacionController::class, 'marcarTodasLeidas'])->name('marcar-todas');

    // Demo routes (simulación, solo en Fase 0)
    Route::post('/demo/toggle', [DemoNotificacionController::class, 'toggle'])->name('demo.toggle');
    Route::post('/demo/simular', [DemoNotificacionController::class, 'simular'])->name('demo.simular');
    Route::post('/demo/reset', [DemoNotificacionController::class, 'reset'])->name('demo.reset');
});

// API — Endpoint ligero para polling futuro
Route::get('/api/notificaciones/count', [NotificacionController::class, 'count'])
    ->middleware('auth');

// ----- Perfil de usuario -----
Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

require __DIR__.'/auth.php';
