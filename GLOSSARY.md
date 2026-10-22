# Sistema de Transparencia — UTLCC / GAMEA

Glosario canónico de términos del dominio del sistema informático de gestión de denuncias bajo el marco de la Ley N° 974.

## Trazabilidad y Auditoría

**Acción de bitácora**:
Registro inmutable y cronológico de una operación ejecutada en el sistema, persistido en la tabla `bitacora` (append-only).
_Avoid_: Evento, Evento del sistema, Evento Laravel, Listener.

**Extracto operativo**:
Documento exportable (PDF/Excel) emitido para la Jefatura que expone las acciones y el contenido fáctico de lo actuado en un expediente (`auditoria.extracto-operativo`).
_Avoid_: Reporte de auditoría, Resumen del caso.

**Extracto técnico**:
Documento exportable (PDF/Excel) emitido exclusivamente para TI/Administración que expone metadatos de red y navegador (`user_agent`) excluyendo el detalle fáctico del expediente (`auditoria.extracto-tecnico`).
_Avoid_: Log del sistema, Exportación de auditoría general.

**Constancia individual de actuaciones**:
Certificación oficial descargable en PDF que acredita únicamente las intervenciones registradas por el servidor público solicitante en un expediente específico (`constancia.propia`).
_Avoid_: Historial de usuario, Registro de actividad personal, Certificado.

**Doble llave (Proyección de auditoría)**:
Separación arquitectónica de vistas que garantiza que el personal técnico/TI audite accesos sin vulnerar la reserva de identidad ni el contenido del expediente (Arts. 24 y 29, Ley 974).
_Avoid_: Filtro de permisos, Vista restringida.

## Dominio y Expediente

**Investigador**:
Servidor público de la UTLCC con facultades para evaluar denuncias, sustanciar la investigación, requerir información y emitir informes finales.
_Avoid_: Técnico, Abogado de caso.

**Expediente preexistente (Legacy)**:
Denuncia física tramitada con anterioridad al despliegue del sistema informático, cargada con fecha retroactiva (`created_at` backdateado) y referencia al investigador original para control de plazos vigentes.
_Avoid_: Caso antiguo, Caso migrado.

**High-Water Mark**:
Mecanismo de ajuste en `configuracion_sistema` que actualiza el correlativo de tickets solo si el número ingresado manualmente es mayor o igual al actual durante la gestión en curso.
_Avoid_: Salto de secuencia, Autoincremento manual.

**Escenario de confidencialidad**:
Condición legal del denunciante ante la Ley 974, clasificada estrictamente en `revelada`, `reservada` o `anonimo`.
_Avoid_: Tipo de anonimato, Flag de reserva.
