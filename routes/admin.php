<?php

use App\Http\Controllers\CatalogoController;
use App\Http\Controllers\PublicacionController;
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
});
