<?php

use App\Http\Controllers\ReporteController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Rutas de Reportes (Sprint 16.2)
|--------------------------------------------------------------------------
| Ver y previsualizar: `reporte.ver`. Exportar: `reporte.exportar`.
*/

Route::get('/reportes', [ReporteController::class, 'index'])->can('reporte.ver')->name('reportes.index');
Route::get('/reportes/preview', [ReporteController::class, 'preview'])->can('reporte.ver')->name('reportes.preview');
Route::get('/reportes/exportar', [ReporteController::class, 'exportar'])->can('reporte.exportar')->name('reportes.exportar');
