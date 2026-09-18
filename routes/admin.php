<?php

use App\Http\Controllers\CatalogoController;
use App\Http\Controllers\PublicacionController;
use App\Http\Controllers\UsuarioController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Rutas de Administración (Sprint 16.2)
|--------------------------------------------------------------------------
| Catálogos, publicaciones/avisos. Sprint 18A suma `/admin/usuarios`,
| 18C suma `/admin/delegaciones`.
*/

Route::prefix('admin')->name('admin.')->group(function () {
    // Catálogos (Sprint 11)
    Route::get('/catalogos', [CatalogoController::class, 'index'])->can('menu.catalogos')->name('catalogos');
    Route::post('/catalogos/{tipo}', [CatalogoController::class, 'store'])->can('admin.catalogo')->name('catalogos.store');
    Route::post('/catalogos/{tipo}/{id}', [CatalogoController::class, 'update'])->can('admin.catalogo')->name('catalogos.update');
    Route::post('/catalogos/{tipo}/{id}/eliminar', [CatalogoController::class, 'destroy'])->can('admin.catalogo')->name('catalogos.destroy');
    Route::post('/catalogos/{tipo}/{id}/reactivar', [CatalogoController::class, 'reactivar'])->can('admin.catalogo')->name('catalogos.reactivar');

    // Publicaciones / Panel informativo (Sprint 13)
    Route::get('/publicaciones', [PublicacionController::class, 'index'])->can('menu.publicaciones')->name('publicaciones.index');
    Route::post('/publicaciones', [PublicacionController::class, 'store'])->can('publicacion.crear')->name('publicaciones.store');
    Route::post('/publicaciones/borrador-desde-caso/{ticket}', [PublicacionController::class, 'borradorDesdeCaso'])->can('publicacion.crear')->name('publicaciones.borrador');
    Route::post('/publicaciones/{id}', [PublicacionController::class, 'update'])->can('publicacion.editar')->name('publicaciones.update');
    Route::post('/publicaciones/{id}/publicar', [PublicacionController::class, 'publicar'])->can('publicacion.publicar')->name('publicaciones.publicar');
    Route::post('/publicaciones/{id}/despublicar', [PublicacionController::class, 'despublicar'])->can('publicacion.publicar')->name('publicaciones.despublicar');
    Route::post('/publicaciones/{id}/fijar', [PublicacionController::class, 'fijar'])->can('publicacion.editar')->name('publicaciones.fijar');
    Route::post('/publicaciones/{id}/desfijar', [PublicacionController::class, 'desfijar'])->can('publicacion.editar')->name('publicaciones.desfijar');
    Route::post('/publicaciones/{id}/mover', [PublicacionController::class, 'mover'])->can('publicacion.editar')->name('publicaciones.mover');
    Route::post('/publicaciones/{id}/eliminar', [PublicacionController::class, 'destroy'])->can('publicacion.eliminar')->name('publicaciones.destroy');
    Route::get('/publicaciones/archivos/{id}/descargar', [PublicacionController::class, 'descargarArchivo'])->can('menu.publicaciones')->name('publicaciones.descargar');
    Route::post('/publicaciones/archivos/{id}/quitar', [PublicacionController::class, 'quitarArchivo'])->can('publicacion.editar')->name('publicaciones.quitar');

    // Usuarios (Sprint 18A)
    Route::get('/usuarios', [UsuarioController::class, 'index'])->can('menu.usuarios')->name('usuarios.index');
    Route::post('/usuarios', [UsuarioController::class, 'store'])->can('usuario.crear')->name('usuarios.store');
    Route::post('/usuarios/masivo', [UsuarioController::class, 'masivo'])->can('usuario.desactivar')->name('usuarios.masivo');
    Route::get('/usuarios/{id}/impacto', [UsuarioController::class, 'impacto'])->can('usuario.desactivar')->name('usuarios.impacto');
    Route::post('/usuarios/{id}', [UsuarioController::class, 'update'])->can('usuario.editar')->name('usuarios.update');
    Route::post('/usuarios/{id}/reset', [UsuarioController::class, 'resetPassword'])->can('usuario.reset-password')->name('usuarios.reset');
    Route::post('/usuarios/{id}/desactivar', [UsuarioController::class, 'desactivar'])->can('usuario.desactivar')->name('usuarios.desactivar');
    Route::post('/usuarios/{id}/reactivar', [UsuarioController::class, 'reactivar'])->can('usuario.desactivar')->name('usuarios.reactivar');
});
