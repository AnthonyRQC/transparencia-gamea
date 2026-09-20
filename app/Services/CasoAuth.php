<?php

namespace App\Services;

use App\Models\Denuncia;
use App\Models\User;

/**
 * Autorización a nivel de caso (Sprint 16.2, D19).
 *
 * `can:<permiso>` en la ruta responde "¿tiene el permiso?".
 * Esto responde "¿puede operar ESTE caso?":
 *
 * - Familia UNIDAD (admitir, asignar, ...): cualquier caso con el permiso.
 * - Familia EXPEDIENTE (iniciar, solicitud.*, informe.*, ...): solo el dueño
 *   (`investigador_id`). Un investigador-interino (18C) NO redacta informes ajenos:
 *   `caso.admitir` no abre expedientes.
 *
 * Sprint 21: `DenunciaPolicy` delega aquí (una línea por ability).
 */
class CasoAuth
{
    public const PERMISOS_UNIDAD = [
        'denuncia.crear',
        'denuncia.editar',
        'denuncia.eliminar',
        'caso.admitir',
        'caso.rechazar',
        'caso.asignar',
        'caso.traspasar',
        'caso.reabrir',
        'caso.ampliar',
        'caso.conciliar',
        'caso.delegar-evaluacion',
        'caso.reasumir-evaluacion',
        'caso.saltar-fase',
        'caso.archivar',
    ];

    /**
     * Subconjunto de expediente con override de supervisor (D26): quien puede
     * asignar (jefe) firma informe/cierre/archivo de cualquier caso.
     */
    public const PERMISOS_SUPERVISOR = [
        'informe.crear',
        'informe.editar',
        'informe.eliminar',
        'cierre.crear',
        'cierre.editar',
        'cierre.eliminar',
        'archivo.ver',
        'archivo.subir',
        'archivo.eliminar',
    ];

    public const PERMISOS_EXPEDIENTE = [
        'caso.iniciar',
        'caso.evaluar',
        'solicitud.crear',
        'solicitud.editar',
        'solicitud.eliminar',
        'solicitud.responder',
        'solicitud.ampliar',
        'solicitud.cancelar',
        'descargo.crear',
        'descargo.notificar',
        'descargo.responder',
        'descargo.editar',
        'descargo.eliminar',
        'descargo.ampliar',
        'descargo.cancelar',
        'informe.crear',
        'informe.editar',
        'informe.eliminar',
        'cierre.crear',
        'cierre.editar',
        'cierre.eliminar',
        'archivo.subir',
        'archivo.eliminar',
    ];

    public static function puedeOperar(User $user, Denuncia $denuncia, string $permiso): bool
    {
        if (! PermisosEfectivos::puede($user, $permiso)) {
            return false;
        }

        if (in_array($permiso, self::PERMISOS_UNIDAD, true)) {
            return true;
        }

        if ((int) $denuncia->investigador_id === (int) $user->id) {
            return true;
        }

        // Supervisor (D26): quien puede asignar firma informe/cierre/archivo.
        if (
            in_array($permiso, self::PERMISOS_SUPERVISOR, true)
            && PermisosEfectivos::puede($user, 'caso.asignar')
        ) {
            return true;
        }

        return false;
    }

    /**
     * Mensaje para carreras: otro usuario procesó el caso entre la lectura
     * y la escritura (lockForUpdate). La última bitácora es su acción.
     */
    public static function mensajeCarrera(string $ticket): string
    {
        $d = Denuncia::where('ticket', $ticket)->first();
        $actor = $d?->bitacora()->latest('id')->first();
        $nombre = $actor?->usuario?->name ?? 'OTRO USUARIO';

        return "ESTA DENUNCIA YA FUE PROCESADA POR {$nombre}. RECARGA LA PÁGINA E INTENTA DE NUEVO.";
    }
}
