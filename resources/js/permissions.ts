export type Permiso =
  | 'denuncia.crear'
  | 'denuncia.editar'
  | 'denuncia.eliminar'
  | 'menu.dashboard'
  | 'menu.registrar-denuncia'
  | 'menu.bandeja'
  | 'menu.mis-casos'
  | 'menu.mi-resumen'
  | 'menu.evaluaciones'
  | 'menu.consultar-casos'
  | 'menu.notificaciones'
  | 'menu.reportes'
  | 'menu.feriados'
  | 'caso.admitir'
  | 'caso.rechazar'
  | 'caso.asignar'
  | 'caso.traspasar'
  | 'caso.reabrir'
  | 'caso.ampliar'
  | 'caso.conciliar'
  | 'caso.delegar-evaluacion'
  | 'caso.reasumir-evaluacion'
  | 'caso.saltar-fase'
  | 'caso.evaluar'
  | 'caso.iniciar'
  | 'caso.avanzar-fase'
  | 'solicitud.crear'
  | 'solicitud.editar'
  | 'solicitud.eliminar'
  | 'solicitud.responder'
  | 'solicitud.ampliar'
  | 'solicitud.cancelar'
  | 'descargo.crear'
  | 'descargo.notificar'
  | 'descargo.responder'
  | 'descargo.editar'
  | 'descargo.eliminar'
  | 'descargo.ampliar'
  | 'descargo.cancelar'
  | 'informe.crear'
  | 'informe.editar'
  | 'informe.eliminar'
  | 'cierre.crear'
  | 'cierre.editar'
  | 'cierre.eliminar'
  | 'archivo.ver'
  | 'archivo.subir'
  | 'archivo.eliminar'
  | 'consulta.ver'
  | 'consulta.codigo'
  | 'reporte.ver'
  | 'admin.feriados'
  | 'admin.catalogo'
  | 'notificacion.ver';

export type Rol = 'registrador' | 'jefe' | 'tecnico';

export const PERMISOS_POR_ROL: Record<Rol, Permiso[]> = {
  registrador: [
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
  jefe: [
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
  tecnico: [
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
};

export function permisosPorRol(rol: Rol): Permiso[] {
  return PERMISOS_POR_ROL[rol] ?? [];
}
