# SCHEMA.md — Esquema de base de datos generado desde el codigo

> No editar a mano. Fuente: introspeccion del esquema (`Schema::getTables()` / `Schema::getColumns()`). Se regenera con `composer docs`.

## ampliaciones

| Columna | Tipo | Nullable | Default |
| --- | --- | --- | --- |
| aprobado_por_id | bigint unsigned | si | - |
| archivo_respaldo | varchar(255) | si | - |
| created_at | timestamp | si | - |
| dias | int | no | - |
| entidad_id | bigint unsigned | no | - |
| entidad_type | varchar(255) | no | - |
| fecha | datetime | no | - |
| id | bigint unsigned | no | - |
| justificacion | text | no | - |
| numero | int | si | - |
| solicitado_por | varchar(255) | si | - |
| updated_at | timestamp | si | - |

## bitacora

| Columna | Tipo | Nullable | Default |
| --- | --- | --- | --- |
| accion | varchar(255) | no | - |
| created_at | timestamp | si | - |
| denuncia_id | bigint unsigned | si | - |
| detalle | text | no | - |
| entidad_id | bigint unsigned | si | - |
| entidad_tipo | varchar(50) | si | - |
| fecha | datetime | no | - |
| id | bigint unsigned | no | - |
| updated_at | timestamp | si | - |
| user_agent | varchar(512) | si | - |
| usuario_id | bigint unsigned | no | - |

## cache

| Columna | Tipo | Nullable | Default |
| --- | --- | --- | --- |
| expiration | int | no | - |
| key | varchar(255) | no | - |
| value | mediumtext | no | - |

## cache_locks

| Columna | Tipo | Nullable | Default |
| --- | --- | --- | --- |
| expiration | int | no | - |
| key | varchar(255) | no | - |
| owner | varchar(255) | no | - |

## categorias_denuncia

| Columna | Tipo | Nullable | Default |
| --- | --- | --- | --- |
| activa | tinyint(1) | no | 1 |
| clave | varchar(50) | no | - |
| created_at | timestamp | si | - |
| desactivado_por_id | bigint unsigned | si | - |
| descripcion | text | si | - |
| fecha_desactivacion | datetime | si | - |
| id | bigint unsigned | no | - |
| nombre | varchar(255) | no | - |
| tipo_denuncia | varchar(20) | si | - |
| updated_at | timestamp | si | - |

## cierres

| Columna | Tipo | Nullable | Default |
| --- | --- | --- | --- |
| cerrado_at | datetime | no | - |
| cerrado_por_id | bigint unsigned | si | - |
| concluido_por | varchar(255) | no | - |
| created_at | timestamp | si | - |
| denuncia_id | bigint unsigned | no | - |
| descripcion | text | si | - |
| eliminado | tinyint(1) | no | 0 |
| fecha_eliminacion | datetime | si | - |
| historial_ediciones | json | si | - |
| id | bigint unsigned | no | - |
| no_notificado_motivo | text | si | - |
| notificacion_descripcion | text | si | - |
| notificacion_fecha | datetime | si | - |
| notificacion_medio_id | bigint unsigned | si | - |
| notificado_denunciante | tinyint(1) | no | - |
| updated_at | timestamp | si | - |

## clasificaciones

| Columna | Tipo | Nullable | Default |
| --- | --- | --- | --- |
| activa | tinyint(1) | no | 1 |
| clave | varchar(50) | no | - |
| created_at | timestamp | si | - |
| desactivado_por_id | bigint unsigned | si | - |
| descripcion | text | si | - |
| fecha_desactivacion | datetime | si | - |
| id | bigint unsigned | no | - |
| nombre | varchar(255) | no | - |
| updated_at | timestamp | si | - |

## configuracion_sistema

| Columna | Tipo | Nullable | Default |
| --- | --- | --- | --- |
| actualizado_at | timestamp | si | - |
| actualizado_por_id | bigint unsigned | si | - |
| clave | varchar(100) | no | - |
| created_at | timestamp | si | - |
| descripcion | text | si | - |
| id | bigint unsigned | no | - |
| updated_at | timestamp | si | - |
| valor | text | no | - |

## delegaciones

| Columna | Tipo | Nullable | Default |
| --- | --- | --- | --- |
| created_at | timestamp | si | - |
| desde | timestamp | no | CURRENT_TIMESTAMP |
| hasta | timestamp | si | - |
| id | bigint unsigned | no | - |
| motivo | text | no | - |
| otorgado_por_id | bigint unsigned | no | - |
| permisos | json | no | - |
| revocado_at | timestamp | si | - |
| revocado_por_id | bigint unsigned | si | - |
| updated_at | timestamp | si | - |
| user_id | bigint unsigned | no | - |

## denunciados

| Columna | Tipo | Nullable | Default |
| --- | --- | --- | --- |
| conoce_identidad | tinyint(1) | no | - |
| created_at | timestamp | si | - |
| denuncia_id | bigint unsigned | no | - |
| dependencia | varchar(255) | si | - |
| descripcion | text | si | - |
| id | bigint unsigned | no | - |
| nombres | varchar(255) | si | - |
| orden | int | no | 0 |
| updated_at | timestamp | si | - |

## denunciantes

| Columna | Tipo | Nullable | Default |
| --- | --- | --- | --- |
| ci | varchar(255) | si | - |
| created_at | timestamp | si | - |
| denuncia_id | bigint unsigned | no | - |
| email | varchar(255) | si | - |
| id | bigint unsigned | no | - |
| nombres | varchar(255) | si | - |
| telefono | varchar(255) | si | - |
| updated_at | timestamp | si | - |

## denuncias

| Columna | Tipo | Nullable | Default |
| --- | --- | --- | --- |
| categoria_id | bigint unsigned | si | - |
| conciliacion_json | json | si | - |
| created_at | timestamp | si | - |
| declaracion_jurada | tinyint(1) | no | 1 |
| deleted_at | timestamp | si | - |
| es_legacy | tinyint(1) | no | 0 |
| escenario | varchar(20) | no | revelada |
| estado | varchar(30) | no | ingresada |
| fecha_admitida | datetime | si | - |
| fecha_asignada | datetime | si | - |
| fecha_hechos | date | si | - |
| fecha_rechazada | datetime | si | - |
| hechos | text | no | - |
| hora_hechos | varchar(10) | si | - |
| id | bigint unsigned | no | - |
| investigador_anterior_id | bigint unsigned | si | - |
| investigador_id | bigint unsigned | si | - |
| investigador_referencia | varchar(150) | si | - |
| justificacion_admision | text | si | - |
| justificacion_rechazo | text | si | - |
| lugar_hechos | text | si | - |
| reapertura_json | json | si | - |
| registrado_por_id | bigint unsigned | si | - |
| resumen_rechazo | varchar(200) | si | - |
| sitpreco_rechazo | varchar(50) | si | - |
| subestado | varchar(30) | si | - |
| ticket | varchar(20) | no | - |
| tipo | varchar(20) | no | - |
| token_consulta | varchar(6) | no | - |
| traspaso_json | json | si | - |
| updated_at | timestamp | si | - |

## denuncias_archivos

| Columna | Tipo | Nullable | Default |
| --- | --- | --- | --- |
| contexto | varchar(20) | no | general |
| contexto_entidad_id | bigint unsigned | si | - |
| contexto_entidad_type | varchar(255) | si | - |
| created_at | timestamp | si | - |
| denuncia_id | bigint unsigned | no | - |
| descripcion | text | si | - |
| fecha_eliminacion | datetime | si | - |
| fecha_subida | datetime | no | - |
| id | bigint unsigned | no | - |
| mime_type | varchar(255) | si | - |
| nombre | varchar(255) | no | - |
| path | varchar(255) | no | - |
| tamano | varchar(255) | si | - |
| updated_at | timestamp | si | - |
| usuario_id | bigint unsigned | no | - |

## dependencias_externas

| Columna | Tipo | Nullable | Default |
| --- | --- | --- | --- |
| activa | tinyint(1) | no | 1 |
| created_at | timestamp | si | - |
| desactivado_por_id | bigint unsigned | si | - |
| fecha_desactivacion | datetime | si | - |
| id | bigint unsigned | no | - |
| nombre | varchar(255) | no | - |
| parent_id | bigint unsigned | si | - |
| updated_at | timestamp | si | - |

## descargos

| Columna | Tipo | Nullable | Default |
| --- | --- | --- | --- |
| created_at | timestamp | si | - |
| denuncia_id | bigint unsigned | no | - |
| denunciado_id | bigint unsigned | no | - |
| eliminado | tinyint(1) | no | 0 |
| estado | varchar(20) | no | pendiente_notif |
| fecha_cancelacion | datetime | si | - |
| fecha_eliminacion | datetime | si | - |
| fecha_notificacion | datetime | si | - |
| fecha_respuesta | datetime | si | - |
| fecha_vencimiento | datetime | si | - |
| historial_ediciones | json | si | - |
| id | bigint unsigned | no | - |
| medio | varchar(200) | si | - |
| motivo_cancelacion | text | si | - |
| respaldo_archivo_nombre | varchar(255) | si | - |
| respaldo_archivo_path | varchar(255) | si | - |
| respaldo_archivo_tamano | varchar(255) | si | - |
| resumen_descargo | text | si | - |
| updated_at | timestamp | si | - |

## evaluaciones_tecnicas

| Columna | Tipo | Nullable | Default |
| --- | --- | --- | --- |
| created_at | timestamp | si | - |
| delegada_at | datetime | no | - |
| delegada_por_id | bigint unsigned | no | - |
| denuncia_id | bigint unsigned | no | - |
| devuelta_at | datetime | si | - |
| devuelta_por_id | bigint unsigned | si | - |
| estado | varchar(20) | no | pendiente |
| id | bigint unsigned | no | - |
| investigador_id | bigint unsigned | no | - |
| justificacion_delegacion | text | si | - |
| recomendacion | varchar(20) | si | - |
| texto_evaluacion | text | si | - |
| updated_at | timestamp | si | - |

## failed_jobs

| Columna | Tipo | Nullable | Default |
| --- | --- | --- | --- |
| connection | text | no | - |
| exception | longtext | no | - |
| failed_at | timestamp | no | CURRENT_TIMESTAMP |
| id | bigint unsigned | no | - |
| payload | longtext | no | - |
| queue | text | no | - |
| uuid | varchar(255) | no | - |

## feriados

| Columna | Tipo | Nullable | Default |
| --- | --- | --- | --- |
| created_at | timestamp | si | - |
| deleted_at | timestamp | si | - |
| fecha | date | no | - |
| id | bigint unsigned | no | - |
| nombre | varchar(255) | no | - |
| updated_at | timestamp | si | - |

## informes_finales

| Columna | Tipo | Nullable | Default |
| --- | --- | --- | --- |
| clasificacion_id | bigint unsigned | si | - |
| clasificado_por_id | bigint unsigned | si | - |
| concluido_por | varchar(255) | no | - |
| created_at | timestamp | si | - |
| denuncia_id | bigint unsigned | no | - |
| eliminado | tinyint(1) | no | 0 |
| fecha_eliminacion | datetime | si | - |
| fojas | int | si | - |
| historial_ediciones | json | si | - |
| id | bigint unsigned | no | - |
| justificacion | text | si | - |
| redactado_at | datetime | no | - |
| sitpreco | varchar(50) | si | - |
| updated_at | timestamp | si | - |

## job_batches

| Columna | Tipo | Nullable | Default |
| --- | --- | --- | --- |
| cancelled_at | int | si | - |
| created_at | int | no | - |
| failed_job_ids | longtext | no | - |
| failed_jobs | int | no | - |
| finished_at | int | si | - |
| id | varchar(255) | no | - |
| name | varchar(255) | no | - |
| options | mediumtext | si | - |
| pending_jobs | int | no | - |
| total_jobs | int | no | - |

## jobs

| Columna | Tipo | Nullable | Default |
| --- | --- | --- | --- |
| attempts | tinyint unsigned | no | - |
| available_at | int unsigned | no | - |
| created_at | int unsigned | no | - |
| id | bigint unsigned | no | - |
| payload | longtext | no | - |
| queue | varchar(255) | no | - |
| reserved_at | int unsigned | si | - |

## medios_notificacion

| Columna | Tipo | Nullable | Default |
| --- | --- | --- | --- |
| activa | tinyint(1) | no | 1 |
| clave | varchar(50) | no | - |
| created_at | timestamp | si | - |
| desactivado_por_id | bigint unsigned | si | - |
| fecha_desactivacion | datetime | si | - |
| id | bigint unsigned | no | - |
| nombre | varchar(255) | no | - |
| updated_at | timestamp | si | - |

## migrations

| Columna | Tipo | Nullable | Default |
| --- | --- | --- | --- |
| batch | int | no | - |
| id | int unsigned | no | - |
| migration | varchar(255) | no | - |

## notificaciones

| Columna | Tipo | Nullable | Default |
| --- | --- | --- | --- |
| color | varchar(20) | no | primary |
| created_at | timestamp | si | - |
| destino_url | varchar(255) | no | - |
| fecha | datetime | no | - |
| fecha_leida | datetime | si | - |
| icono | varchar(50) | no | Bell |
| id | bigint unsigned | no | - |
| leida | tinyint(1) | no | 0 |
| mensaje | text | no | - |
| ticket | varchar(255) | si | - |
| tipo | varchar(255) | no | - |
| titulo | varchar(255) | no | - |
| updated_at | timestamp | si | - |
| usuario_id | bigint unsigned | no | - |

## password_reset_tokens

| Columna | Tipo | Nullable | Default |
| --- | --- | --- | --- |
| created_at | timestamp | si | - |
| email | varchar(255) | no | - |
| token | varchar(255) | no | - |

## personal_access_tokens

| Columna | Tipo | Nullable | Default |
| --- | --- | --- | --- |
| abilities | text | si | - |
| created_at | timestamp | si | - |
| expires_at | timestamp | si | - |
| id | bigint unsigned | no | - |
| last_used_at | timestamp | si | - |
| name | text | no | - |
| token | varchar(64) | no | - |
| tokenable_id | bigint unsigned | no | - |
| tokenable_type | varchar(255) | no | - |
| updated_at | timestamp | si | - |

## prioridades_publicacion

| Columna | Tipo | Nullable | Default |
| --- | --- | --- | --- |
| activa | tinyint(1) | no | 1 |
| clave | varchar(50) | no | - |
| created_at | timestamp | si | - |
| desactivado_por_id | bigint unsigned | si | - |
| descripcion | text | si | - |
| fecha_desactivacion | datetime | si | - |
| id | bigint unsigned | no | - |
| nombre | varchar(255) | no | - |
| updated_at | timestamp | si | - |

## pruebas

| Columna | Tipo | Nullable | Default |
| --- | --- | --- | --- |
| created_at | timestamp | si | - |
| denuncia_id | bigint unsigned | no | - |
| descripcion | text | no | - |
| id | bigint unsigned | no | - |
| testigo_ci | varchar(20) | si | - |
| testigo_nombre | varchar(255) | si | - |
| testigo_telefono | varchar(255) | si | - |
| tipo | varchar(20) | no | - |
| updated_at | timestamp | si | - |

## publicacion_archivos

| Columna | Tipo | Nullable | Default |
| --- | --- | --- | --- |
| created_at | timestamp | si | - |
| fecha_eliminacion | datetime | si | - |
| hash | varchar(64) | si | - |
| id | bigint unsigned | no | - |
| mime_type | varchar(100) | si | - |
| nombre | varchar(255) | no | - |
| path | varchar(500) | no | - |
| publicacion_id | bigint unsigned | no | - |
| tamano | varchar(50) | si | - |
| updated_at | timestamp | si | - |

## publicaciones

| Columna | Tipo | Nullable | Default |
| --- | --- | --- | --- |
| cite | varchar(255) | si | - |
| created_at | timestamp | si | - |
| cuerpo | text | si | - |
| denuncia_id | bigint unsigned | si | - |
| destinatario_display | varchar(255) | si | - |
| emisor | varchar(255) | no | UTLCC |
| evento | varchar(30) | si | - |
| fecha_documento | date | si | - |
| fijada | tinyint(1) | no | 0 |
| id | bigint unsigned | no | - |
| orden | int unsigned | no | 0 |
| portada_archivo_id | bigint unsigned | si | - |
| prioridad_id | bigint unsigned | no | - |
| publicado_at | datetime | si | - |
| publicado_por_id | bigint unsigned | si | - |
| ref_titulo | varchar(140) | no | - |
| referencia_externa | varchar(255) | si | - |
| resumen | text | si | - |
| tipo_id | bigint unsigned | no | - |
| updated_at | timestamp | si | - |

## sessions

| Columna | Tipo | Nullable | Default |
| --- | --- | --- | --- |
| id | varchar(255) | no | - |
| ip_address | varchar(45) | si | - |
| last_activity | int | no | - |
| payload | longtext | no | - |
| user_agent | text | si | - |
| user_id | bigint unsigned | si | - |

## solicitudes_informacion

| Columna | Tipo | Nullable | Default |
| --- | --- | --- | --- |
| created_at | timestamp | si | - |
| denuncia_id | bigint unsigned | no | - |
| dependencia_destino_id | bigint unsigned | no | - |
| detalle | text | no | - |
| eliminado | tinyint(1) | no | 0 |
| estado | varchar(20) | no | pendiente |
| fecha_cancelacion | datetime | si | - |
| fecha_eliminacion | datetime | si | - |
| fecha_envio | datetime | no | - |
| fecha_respuesta | datetime | si | - |
| fecha_vencimiento | datetime | no | - |
| historial_ediciones | json | si | - |
| id | bigint unsigned | no | - |
| motivo_cancelacion | text | si | - |
| plazo_dias | int | no | 10 |
| respuesta | text | si | - |
| updated_at | timestamp | si | - |

## tipos_publicacion

| Columna | Tipo | Nullable | Default |
| --- | --- | --- | --- |
| activa | tinyint(1) | no | 1 |
| clave | varchar(50) | no | - |
| created_at | timestamp | si | - |
| desactivado_por_id | bigint unsigned | si | - |
| descripcion | text | si | - |
| fecha_desactivacion | datetime | si | - |
| id | bigint unsigned | no | - |
| nombre | varchar(255) | no | - |
| updated_at | timestamp | si | - |

## users

| Columna | Tipo | Nullable | Default |
| --- | --- | --- | --- |
| activo | tinyint(1) | no | 1 |
| apellidos | varchar(100) | no | - |
| ci | varchar(20) | no | - |
| color | varchar(20) | si | - |
| creado_por_id | bigint unsigned | si | - |
| created_at | timestamp | si | - |
| debe_cambiar_password | tinyint(1) | no | 0 |
| desactivado_at | timestamp | si | - |
| desactivado_por_id | bigint unsigned | si | - |
| email | varchar(255) | si | - |
| email_verified_at | timestamp | si | - |
| id | bigint unsigned | no | - |
| iniciales | varchar(2) | si | - |
| motivo_baja | text | si | - |
| name | varchar(255) | no | - |
| nombres | varchar(100) | no | - |
| password | varchar(255) | no | - |
| preferencias | json | si | - |
| remember_token | varchar(100) | si | - |
| rol | varchar(20) | no | - |
| telefono | varchar(20) | si | - |
| updated_at | timestamp | si | - |
| username | varchar(50) | no | - |

