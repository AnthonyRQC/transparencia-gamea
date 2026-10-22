# PERMISSIONS.md — Permisos y roles generados desde el codigo

> No editar a mano. Fuente: `app/Data/PermisosCatalogo.php`. Se regenera con `composer docs`.

## Catalogo de permisos

| Permiso | Descripcion | Delegable |
| --- | --- | --- |
| admin.catalogo | Administrar catálogos | - |
| admin.feriados | Administrar feriados | - |
| archivo.eliminar | Eliminar archivo del caso | si |
| archivo.subir | Subir archivo al caso | si |
| archivo.ver | Ver archivos del caso | si |
| auditoria.extracto-operativo | Exportar extracto operativo del caso | - |
| auditoria.extracto-tecnico | Exportar extracto técnico del caso | - |
| caso.admitir | Admitir denuncia | si |
| caso.ampliar | Ampliar plazo | si |
| caso.archivar | Archivar caso cerrado | si |
| caso.asignar | Asignar investigador | si |
| caso.avanzar-fase | Pasar a informe final | - |
| caso.conciliar | Conciliar fechas | si |
| caso.delegar-evaluacion | Delegar evaluación previa | si |
| caso.evaluar | Devolver evaluación | - |
| caso.iniciar | Iniciar investigación | - |
| caso.reabrir | Reabrir caso | si |
| caso.reasumir-evaluacion | Reasumir evaluación | si |
| caso.rechazar | Rechazar denuncia | si |
| caso.saltar-fase | Saltar fase a informe final | si |
| caso.traspasar | Traspasar caso | si |
| cierre.crear | Crear cierre | - |
| cierre.editar | Editar cierre | - |
| cierre.eliminar | Eliminar cierre | - |
| constancia.propia | Generar constancia propia de acciones | - |
| consulta.codigo | Consultar código de denuncia | si |
| consulta.ver | Ver página de consulta de casos | si |
| denuncia.cargar-historico | Cargar expediente cerrado de gestiones pasadas (histórico) | - |
| denuncia.cargar-legacy | Cargar expediente preexistente en curso (legacy) | si |
| denuncia.crear | Crear nueva denuncia | - |
| denuncia.editar | Editar denuncia raíz | - |
| denuncia.eliminar | Eliminar denuncia raíz | - |
| descargo.ampliar | Ampliar descargo | - |
| descargo.cancelar | Cancelar descargo | - |
| descargo.crear | Crear descargo | - |
| descargo.editar | Editar descargo | - |
| descargo.eliminar | Eliminar descargo | - |
| descargo.notificar | Notificar descargo | - |
| descargo.responder | Responder descargo | - |
| informe.crear | Crear informe final | - |
| informe.editar | Editar informe | - |
| informe.eliminar | Eliminar informe | - |
| menu.auditoria | Ver panel de auditoría | - |
| menu.bandeja | Ver bandeja de admisión | si |
| menu.catalogos | Ver admin de catálogos | - |
| menu.consultar-casos | Ver búsqueda y consulta de casos (registrador) | si |
| menu.dashboard | Ver inicio/dashboard | - |
| menu.evaluaciones | Ver evaluaciones delegadas (investigador) | - |
| menu.mi-resumen | Ver mi resumen (investigador) | - |
| menu.mis-casos | Ver mis casos (investigador) | - |
| menu.notificaciones | Ver notificaciones | si |
| menu.publicaciones | Ver admin de avisos | si |
| menu.registrar-denuncia | Ver página de registro de denuncia | - |
| menu.reportes | Ver reportes | si |
| menu.usuarios | Ver administración de usuarios | - |
| notificacion.ver | Ver notificaciones | si |
| publicacion.crear | Crear aviso | si |
| publicacion.editar | Editar aviso | si |
| publicacion.eliminar | Eliminar aviso | si |
| publicacion.publicar | Publicar/despublicar aviso | si |
| reporte.exportar | Exportar reportes (PDF/Excel) | si |
| reporte.ver | Ver reportes | si |
| solicitud.ampliar | Ampliar solicitud | - |
| solicitud.cancelar | Cancelar solicitud | - |
| solicitud.crear | Crear solicitud de información | - |
| solicitud.editar | Editar solicitud | - |
| solicitud.eliminar | Eliminar solicitud | - |
| solicitud.responder | Responder solicitud | - |
| usuario.crear | Crear usuarios | - |
| usuario.desactivar | Desactivar/reactivar usuarios | - |
| usuario.editar | Editar usuarios | - |
| usuario.reset-password | Resetear contraseñas | - |

## Matriz de roles

| Permiso | admin | investigador | jefe | registrador |
| --- | --- | --- | --- | --- |
| admin.catalogo | x |  | x |  |
| admin.feriados | x |  | x |  |
| archivo.eliminar |  | x | x |  |
| archivo.subir |  | x | x |  |
| archivo.ver |  | x | x | x |
| auditoria.extracto-operativo |  |  | x |  |
| auditoria.extracto-tecnico | x |  |  |  |
| caso.admitir |  |  | x |  |
| caso.ampliar |  |  | x |  |
| caso.archivar |  |  | x |  |
| caso.asignar |  |  | x |  |
| caso.avanzar-fase |  | x |  |  |
| caso.conciliar |  |  | x |  |
| caso.delegar-evaluacion |  |  | x |  |
| caso.evaluar |  | x |  |  |
| caso.iniciar |  | x |  |  |
| caso.reabrir |  |  | x |  |
| caso.reasumir-evaluacion |  |  | x |  |
| caso.rechazar |  |  | x |  |
| caso.saltar-fase |  |  | x |  |
| caso.traspasar |  |  | x |  |
| cierre.crear |  | x | x |  |
| cierre.editar |  | x | x |  |
| cierre.eliminar |  | x | x |  |
| constancia.propia |  | x | x | x |
| consulta.codigo |  |  |  | x |
| consulta.ver |  |  |  | x |
| denuncia.cargar-historico |  |  | x | x |
| denuncia.cargar-legacy |  | x | x |  |
| denuncia.crear |  |  | x | x |
| denuncia.editar |  |  | x | x |
| denuncia.eliminar |  |  | x |  |
| descargo.ampliar |  | x |  |  |
| descargo.cancelar |  | x |  |  |
| descargo.crear |  | x |  |  |
| descargo.editar |  | x |  |  |
| descargo.eliminar |  | x |  |  |
| descargo.notificar |  | x |  |  |
| descargo.responder |  | x |  |  |
| informe.crear |  | x | x |  |
| informe.editar |  | x | x |  |
| informe.eliminar |  | x | x |  |
| menu.auditoria | x |  |  |  |
| menu.bandeja |  |  | x |  |
| menu.catalogos | x |  | x |  |
| menu.consultar-casos |  |  |  | x |
| menu.dashboard | x | x | x | x |
| menu.evaluaciones |  | x |  |  |
| menu.mi-resumen |  | x |  |  |
| menu.mis-casos |  | x |  |  |
| menu.notificaciones |  | x | x |  |
| menu.publicaciones | x |  | x | x |
| menu.registrar-denuncia |  |  | x | x |
| menu.reportes | x |  | x |  |
| menu.usuarios | x |  | x |  |
| notificacion.ver |  | x | x |  |
| publicacion.crear | x |  | x | x |
| publicacion.editar | x |  | x | x |
| publicacion.eliminar | x |  | x | x |
| publicacion.publicar | x |  | x | x |
| reporte.exportar | x |  | x |  |
| reporte.ver | x |  | x |  |
| solicitud.ampliar |  | x |  |  |
| solicitud.cancelar |  | x |  |  |
| solicitud.crear |  | x |  |  |
| solicitud.editar |  | x |  |  |
| solicitud.eliminar |  | x |  |  |
| solicitud.responder |  | x |  |  |
| usuario.crear | x |  | x |  |
| usuario.desactivar | x |  | x |  |
| usuario.editar | x |  | x |  |
| usuario.reset-password | x |  | x |  |
