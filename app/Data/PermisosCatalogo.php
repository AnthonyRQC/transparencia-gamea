<?php

namespace App\Data;

class PermisosCatalogo
{
    public const PERMISOS = [
        'denuncia.crear' => 'Crear nueva denuncia',
        'denuncia.editar' => 'Editar denuncia raíz',
        'denuncia.eliminar' => 'Eliminar denuncia raíz',

        'menu.dashboard' => 'Ver inicio/dashboard',
        'menu.registrar-denuncia' => 'Ver página de registro de denuncia',
        'menu.bandeja' => 'Ver bandeja de admisión',
        'menu.mis-casos' => 'Ver mis casos (técnico)',
        'menu.mi-resumen' => 'Ver mi resumen (técnico)',
        'menu.evaluaciones' => 'Ver evaluaciones delegadas (técnico)',
        'menu.consultar-casos' => 'Ver búsqueda y consulta de casos (registrador)',
        'menu.notificaciones' => 'Ver notificaciones',
        'menu.reportes' => 'Ver reportes',
        'menu.feriados' => 'Ver admin de feriados',

        'caso.admitir' => 'Admitir denuncia',
        'caso.rechazar' => 'Rechazar denuncia',
        'caso.asignar' => 'Asignar técnico',
        'caso.traspasar' => 'Traspasar caso',
        'caso.reabrir' => 'Reabrir caso',
        'caso.ampliar' => 'Ampliar plazo',
        'caso.conciliar' => 'Conciliar fechas',
        'caso.delegar-evaluacion' => 'Delegar evaluación previa',
        'caso.reasumir-evaluacion' => 'Reasumir evaluación',
        'caso.saltar-fase' => 'Saltar fase a informe final',

        'caso.evaluar' => 'Devolver evaluación',
        'caso.iniciar' => 'Iniciar investigación',
        'caso.avanzar-fase' => 'Pasar a informe final',

        'solicitud.crear' => 'Crear solicitud de información',
        'solicitud.editar' => 'Editar solicitud',
        'solicitud.eliminar' => 'Eliminar solicitud',
        'solicitud.responder' => 'Responder solicitud',
        'solicitud.ampliar' => 'Ampliar solicitud',
        'solicitud.cancelar' => 'Cancelar solicitud',

        'descargo.crear' => 'Crear descargo',
        'descargo.notificar' => 'Notificar descargo',
        'descargo.responder' => 'Responder descargo',
        'descargo.editar' => 'Editar descargo',
        'descargo.eliminar' => 'Eliminar descargo',
        'descargo.ampliar' => 'Ampliar descargo',
        'descargo.cancelar' => 'Cancelar descargo',

        'informe.crear' => 'Crear informe final',
        'informe.editar' => 'Editar informe',
        'informe.eliminar' => 'Eliminar informe',
        'cierre.crear' => 'Crear cierre',
        'cierre.editar' => 'Editar cierre',
        'cierre.eliminar' => 'Eliminar cierre',

        'archivo.ver' => 'Ver archivos del caso',
        'archivo.subir' => 'Subir archivo al caso',
        'archivo.eliminar' => 'Eliminar archivo del caso',

        'consulta.ver' => 'Ver página de consulta de casos',
        'consulta.codigo' => 'Consultar código de denuncia',

        'reporte.ver' => 'Ver reportes',
        'admin.feriados' => 'Administrar feriados',
        'admin.catalogo' => 'Administrar catálogos',

        'notificacion.ver' => 'Ver notificaciones',
    ];

    public const ROLES = [
        'registrador' => [
            'menu.dashboard',
            'menu.registrar-denuncia',
            'menu.notificaciones',
            'menu.consultar-casos',
            'denuncia.crear',
            'denuncia.editar',
            'denuncia.eliminar',
            'consulta.ver',
            'consulta.codigo',
            'archivo.ver',
            'notificacion.ver',
        ],

        'jefe' => [
            'menu.dashboard',
            'menu.bandeja',
            'menu.notificaciones',
            'menu.reportes',
            'menu.feriados',
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
            'archivo.ver',
            'archivo.subir',
            'archivo.eliminar',
            'reporte.ver',
            'admin.feriados',
            'admin.catalogo',
            'notificacion.ver',
        ],

        'tecnico' => [
            'menu.dashboard',
            'menu.mis-casos',
            'menu.mi-resumen',
            'menu.evaluaciones',
            'menu.notificaciones',
            'caso.evaluar',
            'caso.iniciar',
            'caso.avanzar-fase',
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
            'archivo.ver',
            'archivo.subir',
            'archivo.eliminar',
            'notificacion.ver',
        ],
    ];

    public static function permisosPorRol(string $rol): array
    {
        return self::ROLES[$rol] ?? [];
    }

    public static function tienePermiso(string $rol, string $permiso): bool
    {
        return in_array($permiso, self::permisosPorRol($rol), true);
    }
}
