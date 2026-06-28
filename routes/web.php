<?php

use App\Http\Controllers\BandejaController;
use App\Http\Controllers\MisCasosController;
use App\Http\Controllers\MiResumenController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DenunciaController;
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
Route::get('/seguimiento', function () {
    return Inertia::render('Seguimiento/Buscar');
})->name('seguimiento.buscar');

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

    // Carga de técnicos (Sprint 3)
    Route::get('/carga-tecnicos', [DenunciaController::class, 'cargaTecnicos'])->name('carga-tecnicos');

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

// ----- Perfil de usuario -----
Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

require __DIR__.'/auth.php';
