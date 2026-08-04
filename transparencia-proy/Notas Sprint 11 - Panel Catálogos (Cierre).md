# Notas Sprint 11 — Panel de Catálogos (Cierre)

> **Propósito:** Documentar decisiones técnicas, la fuente de verdad de los catálogos y el estado final de Sprint 11.
> Leer este archivo cuando se trabaje en el panel de administración de catálogos, en clasificaciones finales o en medios de notificación.

---

## 1. Resumen Ejecutivo

Sprint 11 construyó el **Panel de Catálogos** en `/admin/catalogos` (rol Jefe) para administrar los 8 catálogos del sistema. Unifica dos orígenes de datos: tablas propias de BD y catálogos JSON dentro de `configuracion_sistema.valor`.

| Métrica | Valor |
|---------|-------|
| Pestañas en el panel | 8 (Categorías, Dependencias Externas, Feriados, Medios de Notificación, Clasificaciones Finales, Estados, Tipos de Denuncia, Tipos de Prueba) |
| Catálogos basados en tablas | 3 (`categorias_denuncia`, `dependencias_externas`, `feriados`) |
| Catálogos basados en config JSON | 5 (`catalogo_clasificaciones`, `catalogo_tipos_denuncia`, `catalogo_estados`, `catalogo_medios_notificacion`, `catalogo_tipos_prueba`) |
| Catálogos solo-edición (sin crear/eliminar) | 3 (Tipos de Denuncia, Estados, Tipos de Prueba) |
| Seeders | 1 nuevo (`CatalogosConfigSeeder`, 5 catálogos JSON) |
| Rutas admin | 4 (`store`, `update`, `destroy`, `reactivar`) |
| Tests del panel | 8 (6 en `CatalogoControllerTest` + 2 de seeders) |
| Suite total | **59 / 59 pasando** |

---

## 2. Decisiones Técnicas

| Decisión | Valor ejecutado |
|----------|----------------|
| **Almacenamiento de catálogos** | Los catálogos se alojan como **JSON dentro de `configuracion_sistema.valor`** (columna `TEXT`). Helper `ConfiguracionSistema::catalogItems($clave)` deserializa y `setConfigArray()` persiste. |
| **Constantes del controlador** | `TABLE_BASED = ['categorias','unidades','feriados']` → operan sobre modelos Eloquent. `CONFIG_BASED = ['clasificaciones','tipos_denuncia','estados','medios_notificacion','tipos_prueba']` → operan sobre JSON. |
| **Catálogos read-only** | `READ_ONLY_TYPES = ['tipos_denuncia','estados','tipos_prueba']` no permiten crear/eliminar (solo editar nombre), porque son referencia interna del flujo. |
| **Eliminación en tablas** | Soft-delete: `categorias` y `unidades` marcan `activa=false` + `fecha_desactivacion` + `desactivado_por_id`; `feriados` usa trait `SoftDeletes` (`delete()`/`restore()`). |
| **Clave generada automáticamente** | En `store()` de catálogos config-based: si no se envía `clave`, se genera con `Str::slug(Str::upper($nombre), '_')`. Aplica también a Categorías (tabla). |
| **MAYÚSCULAS** | `upperData()` normaliza strings a mayúsculas antes de guardar en config JSON (consistente con el trait `UppercaseText`). |
| **Validación de medios usados** | `getMediosNotificacionData()` cuenta usos en `cierres.notificacion_medio` con `UPPER(COALESCE(notificacion_medio,'')) = UPPER(clave)` (insensible a mayúsculas) y `where('eliminado', false)`. `destroy()` bloquea eliminar un medio en uso. |
| **Bitácora** | `logBitacora()` registra en `bitacora` + `Log::info("CATALOGO_{accion}")` para crear, actualizar, desactivar, reactivar y eliminar. |
| **Props compartidas** | `HandleInertiaRequests` comparte `clasificaciones` y `medios_notificacion` (id/clave/nombre) para formularios y badge. |
| **Frontend** | `FormCierre` y `FormInformeFinal` leen el catálogo compartido con **fallback hardcodeado** si el array llega vacío (no rompe si la BD no está sembrada). |

---

## 3. Clasificaciones Finales — Fuente de Verdad

`catalogo_clasificaciones` es la única fuente de verdad del dropdown de clasificación del Informe Final:

| Capa | Comportamiento |
|------|----------------|
| **Controlador (backend)** | `DenunciaController::clasificacionesValidas()` valida con `Rule::in($claves)` (claves del catálogo). Fallback: `['penal','civil','administrativo','sin_indicios','medida_correctiva','archivado']`. |
| **Badge** | `ClasificacionBadge.tsx` y `ResultadoSeguimiento.tsx` (público) resuelven nombre desde el catálogo compartido. |
| **SeguimientoController** | `clasificacionLabel()` busca en catálogo con fallback hardcodeado (mismas 6 claves). |
| **Frontend formulario** | `FormInformeFinal.tsx` usa `props.clasificaciones` con fallback `FALLBACK_CLASIFICACIONES`. |

**Protección:** `PROTECTED_CLASIFICACIONES = ['penal','civil','administrativo','sin_indicios','medida_correctiva','archivado']` no pueden eliminarse. Además, una clasificación en uso en ≥1 `informes_finales` no se puede eliminar (`destroy()` devuelve error con contador).

---

## 4. Medios de Notificación — Conexión con el Cierre

El flujo de cierre (`FormCierre.tsx`) usa `catalogo_medios_notificacion` como catálogo de medios:

- `HandleInertiaRequests` comparte `medios_notificacion` (id/clave/nombre).
- `FormCierre.tsx` filtra ítems con `clave` y `nombre`, con fallback `FALLBACK_MEDIOS_NOTIFICACION` (`whatsapp`, `email`, `presencial`, `otro`).
- **Normalización a minúsculas:** `notificacion_medio` en BD se guarda en MAYÚSCULAS (trait `UppercaseText`), mientras el catálogo usa claves en minúsculas (`whatsapp`, `email`, ...). El frontend aplica `.toLowerCase()` en estado inicial y en `useEffect` para que la opción seleccionada coincida con la clave del catálogo.
- **Protección por uso:** el contador de usos se calcula con `UPPER(...) = UPPER(clave)`; no se puede eliminar un medio usado en ≥1 cierre activo.

---

## 5. Semilla de Catálogos (CatalogosConfigSeeder)

`CatalogosConfigSeeder::run()` hace `updateOrCreate` sobre `configuracion_sistema` para 5 claves:

| Clave de config | Items sembrados |
|-----------------|-----------------|
| `catalogo_clasificaciones` | 6 (penal, civil, administrativo, sin_indicios, medida_correctiva, archivado) |
| `catalogo_tipos_denuncia` | 2 (corrupcion, negacion) |
| `catalogo_estados` | 8 (ingresada → cerrada) |
| `catalogo_medios_notificacion` | 4 (whatsapp, email, presencial, otro) |
| `catalogo_tipos_prueba` | 3 (ARCHIVO, PRUEBA FÍSICA, TESTIGO) |

> **Nota:** `catalogo_tipos_prueba` **no tiene clave** (solo id + nombre); por eso su columna en el panel es solo `Nombre`. `CatalogosConfigSeeder` es **idempotente** (puede re-ejecutarse).

---

## 6. Config Eliminada: `anio_vigente`

- Se eliminó la clave de config `anio_vigente` porque el sistema no la utiliza (el año se deriva de las fechas reales).
- Quitada de `CatalogoSeeder.php`, eliminada la fila huérfana de la BD (vía tinker) y actualizada la documentación de esquema y seeders.
- ⚠️ El backup `backup-transparencia-2026-07-31.sql` conserva la fila (se dejó intacto por decisión del usuario); se eliminará en un respaldo futuro.

---

## 7. Rutas del Panel (rol Jefe)

```
GET   /admin/catalogos                      → admin.catalogos
POST  /admin/catalogos/{tipo}               → admin.catalogos.store
POST  /admin/catalogos/{tipo}/{id}          → admin.catalogos.update
POST  /admin/catalogos/{tipo}/{id}/eliminar → admin.catalogos.destroy
POST  /admin/catalogos/{tipo}/{id}/reactivar→ admin.catalogos.reactivar
```

El acceso está protegido por el middleware de permisos (solo Jefe).

---

## 8. Tests

| # | Test | Resultado |
|---|------|-----------|
| 1 | `test_clasificacion_in_use_not_deletable` | Clasificación usada en un informe NO se elimina |
| 2 | `test_clasificacion_store_genera_clave` | `store()` genera `clave` automáticamente desde el nombre |
| 3 | `test_medio_notificacion_in_use_not_deletable` | Medio usado en un cierre NO se elimina |
| 4 | `test_medio_notificacion_unused_deletable` | Medio sin uso SÍ se elimina |
| 5 | `test_medio_notificacion_store_genera_clave` | `store()` de medios genera clave |
| 6 | `test_medio_notificacion_index_marks_usos` | `index()` marca `usos` por medio |
| +2 | Tests de `CatalogosConfigSeeder` (sembrado idempotente) | Pasan |

Suite completa: **59 / 59 verdes** (`php artisan test`, PHP 8.3.30). `npm run build` sin errores.

---

## 9. Pendientes del Sprint 11

- **Subcategorías jerárquicas:** el campo `parent_id` planificado para `categorias_denuncia` **no se implementó** (la migración real no lo tiene). Debatir si se requiere para Categorías anidadas.
- **Preferencias de alerta por usuario:** definir almacenamiento (JSON en `users.preferencias`) y UI de configuración.
- **UI de calendario para Feriados:** hoy se muestra agrupado por año en tabla; mejorar con grid mensual si el cliente lo pide.
- **RegistroDenuncia con subcategorías:** al implementarse subcategorías, el formulario público debe usar el catálogo.
