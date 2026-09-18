<?php

use App\Http\Controllers\ArchivosCasoController;
use App\Http\Controllers\BandejaController;
use App\Http\Controllers\ConsultaCasosController;
use App\Http\Controllers\Denuncia\AdmisionController;
use App\Http\Controllers\Denuncia\AmpliacionController;
use App\Http\Controllers\Denuncia\AsignacionController;
use App\Http\Controllers\Denuncia\CierreController;
use App\Http\Controllers\Denuncia\DelegacionController;
use App\Http\Controllers\Denuncia\DenunciaController;
use App\Http\Controllers\Denuncia\InformeController;
use App\Http\Controllers\Denuncia\InvestigacionController;
use App\Http\Controllers\Denuncia\ReaperturaController;
use App\Http\Controllers\DescargoController;
use App\Http\Controllers\EvaluacionController;
use App\Http\Controllers\MisCasosController;
use App\Http\Controllers\MiResumenController;
use App\Http\Controllers\SolicitudController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Rutas de Denuncias (Sprint 16.2)
|--------------------------------------------------------------------------
| Cada ruta mutante lleva `can:<permiso>`. Sin RoleMiddleware (D18):
| 403 → redirect /dashboard + toast (bootstrap/app.php).
*/

Route::prefix('denuncias')->name('denuncias.')->group(function () {
    // Bandeja de Admisión (Sprint 2)
    Route::get('/', [BandejaController::class, 'index'])->can('menu.bandeja')->name('bandeja');

    // Registro de nueva denuncia (Sprint 1)
    Route::get('/registrar', [DenunciaController::class, 'create'])->can('denuncia.crear')->name('registrar');
    Route::post('/', [DenunciaController::class, 'store'])->can('denuncia.crear')->name('store');

    // Acciones (Sprint 2) — AdmisionController
    Route::post('/{ticket}/admitir', [AdmisionController::class, 'admitir'])->can('caso.admitir')->name('admitir');
    Route::post('/{ticket}/rechazar', [AdmisionController::class, 'rechazar'])->can('caso.rechazar')->name('rechazar');
    Route::post('/{ticket}/iniciar', [InvestigacionController::class, 'iniciarInvestigacion'])->can('caso.iniciar')->name('iniciar');

    // Sprint 3 — Asignación, Traspaso, Reapertura
    Route::post('/{ticket}/asignar', [AsignacionController::class, 'asignar'])->can('caso.asignar')->name('asignar');
    Route::post('/{ticket}/traspasar', [AsignacionController::class, 'traspasar'])->can('caso.traspasar')->name('traspasar');
    Route::post('/{ticket}/reabrir', [ReaperturaController::class, 'reabrir'])->can('caso.reabrir')->name('reabrir');

    // Sprint 4 — Saltar fase
    Route::post('/{ticket}/saltar-fase', [InvestigacionController::class, 'saltarFase'])->can('caso.saltar-fase')->name('saltar-fase');

    // Sprint 5 — Informe Final y Cierre
    Route::post('/{ticket}/informe', [InformeController::class, 'guardarInforme'])->can('informe.crear')->name('informe.guardar');
    Route::post('/{ticket}/informe/editar', [InformeController::class, 'editarInforme'])->can('informe.editar')->name('informe.editar');
    Route::post('/{ticket}/informe/eliminar', [InformeController::class, 'eliminarInforme'])->can('informe.eliminar')->name('informe.eliminar');
    Route::post('/{ticket}/cierre', [CierreController::class, 'guardarCierre'])->can('cierre.crear')->name('cierre.guardar');
    Route::post('/{ticket}/cierre/editar', [CierreController::class, 'editarCierre'])->can('cierre.editar')->name('cierre.editar');
    Route::post('/{ticket}/cierre/eliminar', [CierreController::class, 'eliminarCierre'])->can('cierre.eliminar')->name('cierre.eliminar');
    Route::post('/{ticket}/archivar', [CierreController::class, 'toggleArchivar'])->can('caso.archivar')->name('archivar');

    // Carga de investigadores (Sprint 3)
    Route::get('/carga-investigadores', [AsignacionController::class, 'cargaInvestigadores'])->can('caso.asignar')->name('carga-investigadores');

    // Sprint 7 — Evaluación Técnica Previa
    Route::post('/{ticket}/delegar-evaluacion', [DelegacionController::class, 'delegarEvaluacion'])->can('caso.delegar-evaluacion')->name('delegar-evaluacion');
    Route::post('/{ticket}/reasumir-evaluacion', [DelegacionController::class, 'reasumirEvaluacion'])->can('caso.reasumir-evaluacion')->name('reasumir-evaluacion');
    Route::post('/evaluaciones/{id}/devolver', [EvaluacionController::class, 'devolver'])->can('caso.evaluar')->name('evaluaciones.devolver');

    // Sprint 8 — Ampliaciones Múltiples
    Route::post('/{ticket}/ampliar-plazo', [AmpliacionController::class, 'aprobarAmpliacion'])->can('caso.ampliar')->name('ampliar-plazo');

    // Sprint 7.5 — Editar/Eliminar denuncia raíz (solo ingresada)
    Route::post('/{ticket}/editar', [DenunciaController::class, 'editar'])->can('denuncia.editar')->name('editar');
    Route::post('/{ticket}/eliminar', [DenunciaController::class, 'eliminar'])->can('denuncia.eliminar')->name('eliminar');

    // Sprint 7.5 — Conciliación de Fechas
    Route::post('/{ticket}/conciliar-fechas', [DenunciaController::class, 'conciliarFechas'])->can('caso.conciliar')->name('conciliar-fechas');

    // Sprint 7.7 — Consulta de Casos (Registrador)
    Route::get('/consultar', [ConsultaCasosController::class, 'index'])->can('consulta.ver')->name('consultar');

    // Sprint 7.6 — Archivos del caso
    Route::get('/{ticket}/archivos', [ArchivosCasoController::class, 'listar'])->can('archivo.ver')->name('archivos.listar');
    Route::post('/{ticket}/archivos', [ArchivosCasoController::class, 'subir'])->can('archivo.subir')->name('archivos.subir');
    Route::post('/archivos/{id}/eliminar', [ArchivosCasoController::class, 'eliminar'])->can('archivo.eliminar')->name('archivos.eliminar');

    // Sprint 4 — Solicitudes
    Route::post('/{ticket}/solicitudes', [SolicitudController::class, 'store'])->can('solicitud.crear')->name('solicitudes.store');
    Route::post('/solicitudes/{id}/responder', [SolicitudController::class, 'responder'])->can('solicitud.responder')->name('solicitudes.responder');
    Route::post('/solicitudes/{id}/ampliar', [SolicitudController::class, 'ampliar'])->can('solicitud.ampliar')->name('solicitudes.ampliar');
    Route::post('/solicitudes/{id}/cancelar', [SolicitudController::class, 'cancelar'])->can('solicitud.cancelar')->name('solicitudes.cancelar');
    Route::post('/solicitudes/{id}/editar', [SolicitudController::class, 'editar'])->can('solicitud.editar')->name('solicitudes.editar');
    Route::post('/solicitudes/{id}/eliminar', [SolicitudController::class, 'eliminar'])->can('solicitud.eliminar')->name('solicitudes.eliminar');

    // Sprint 4 — Descargos
    Route::post('/{ticket}/descargos', [DescargoController::class, 'store'])->can('descargo.crear')->name('descargos.store');
    Route::post('/descargos/{id}/notificar', [DescargoController::class, 'notificar'])->can('descargo.notificar')->name('descargos.notificar');
    Route::post('/descargos/{id}/responder', [DescargoController::class, 'responder'])->can('descargo.responder')->name('descargos.responder');
    Route::post('/descargos/{id}/ampliar', [DescargoController::class, 'ampliar'])->can('descargo.ampliar')->name('descargos.ampliar');
    Route::post('/descargos/{id}/cancelar', [DescargoController::class, 'cancelar'])->can('descargo.cancelar')->name('descargos.cancelar');
    Route::post('/descargos/{id}/editar', [DescargoController::class, 'editar'])->can('descargo.editar')->name('descargos.editar');
    Route::post('/descargos/{id}/eliminar', [DescargoController::class, 'eliminar'])->can('descargo.eliminar')->name('descargos.eliminar');

    // Mis Casos + Mi Resumen (Sprint 2)
    Route::get('/mis-casos', [MisCasosController::class, 'index'])->can('menu.mis-casos')->name('mis-casos');
    Route::get('/mi-resumen', [MiResumenController::class, 'index'])->can('menu.mi-resumen')->name('mi-resumen');

    // Evaluaciones Delegadas — Bandeja del Investigador (Sprint 7)
    Route::get('/evaluaciones', [MisCasosController::class, 'evaluaciones'])->can('menu.evaluaciones')->name('evaluaciones');
});
