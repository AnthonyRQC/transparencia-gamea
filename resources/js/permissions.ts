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
  | 'menu.catalogos'
  | 'menu.publicaciones'
  | 'menu.usuarios'
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
  | 'caso.archivar'
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
  | 'reporte.exportar'
  | 'admin.feriados'
  | 'admin.catalogo'
  | 'usuario.crear'
  | 'usuario.editar'
  | 'usuario.desactivar'
  | 'usuario.reset-password'
  | 'publicacion.crear'
  | 'publicacion.editar'
  | 'publicacion.eliminar'
  | 'publicacion.publicar'
  | 'notificacion.ver';

export type Rol = 'registrador' | 'jefe' | 'investigador' | 'admin';

export const PERMISOS_POR_ROL: Record<Rol, Permiso[]> = {
  registrador: [
    'menu.dashboard',
    'menu.registrar-denuncia',
    'menu.consultar-casos',
    'denuncia.crear',
    'denuncia.editar',
    'consulta.ver',
    'consulta.codigo',
    'archivo.ver',
    'menu.publicaciones',
    'publicacion.crear',
    'publicacion.editar',
    'publicacion.eliminar',
    'publicacion.publicar',
  ],
  jefe: [
    'menu.dashboard',
    'menu.bandeja',
    'menu.registrar-denuncia',
    'menu.notificaciones',
    'menu.reportes',
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
    'informe.crear',
    'informe.editar',
    'informe.eliminar',
    'cierre.crear',
    'cierre.editar',
    'cierre.eliminar',
    'archivo.ver',
    'archivo.subir',
    'archivo.eliminar',
    'reporte.ver',
    'reporte.exportar',
    'admin.feriados',
    'admin.catalogo',
    'menu.catalogos',
    'notificacion.ver',
    'menu.publicaciones',
    'publicacion.crear',
    'publicacion.editar',
    'publicacion.eliminar',
    'publicacion.publicar',
    'menu.usuarios',
    'usuario.crear',
    'usuario.editar',
    'usuario.desactivar',
    'usuario.reset-password',
  ],
  investigador: [
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
  admin: [
    'menu.dashboard',
    'menu.reportes',
    'reporte.ver',
    'reporte.exportar',
    'menu.usuarios',
    'usuario.crear',
    'usuario.editar',
    'usuario.desactivar',
    'usuario.reset-password',
    'menu.catalogos',
    'admin.catalogo',
    'admin.feriados',
    'menu.publicaciones',
    'publicacion.crear',
    'publicacion.editar',
    'publicacion.eliminar',
    'publicacion.publicar',
  ],
};

export function permisosPorRol(rol: Rol): Permiso[] {
  return PERMISOS_POR_ROL[rol] ?? [];
}
