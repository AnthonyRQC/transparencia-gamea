> ⚠️ **Histórico — Sprint cerrado Jul 2026 (Laravel 11).** Snapshot al cierre, no refleja refactorización Bloques 0-2 (Sep 2026, Laravel 13). Para estado actual ver AI-CONTEXT.md y Notas Reestructuración - Bloques 0-2 (Sept 2026) - Cierre.md.
# Notas Sprint 11 â€” Panel de CatÃ¡logos (Cierre)

> **PropÃ³sito:** Documentar decisiones tÃ©cnicas, la fuente de verdad de los catÃ¡logos y el estado final de Sprint 11.
> Leer este archivo cuando se trabaje en el panel de administraciÃ³n de catÃ¡logos, en clasificaciones finales o en medios de notificaciÃ³n.

---

## âš ï¸ ActualizaciÃ³n â€” ReestructuraciÃ³n de CatÃ¡logos (Agosto 2026)

Parte de este documento quedÃ³ **desactualizada** tras la reestructuraciÃ³n que migrÃ³ los catÃ¡logos JSON a tablas reales. Resumen de lo que cambiÃ³:

| Tema | Antes (Sprint 11) | Ahora (Agosto 2026) |
|------|-------------------|---------------------|
| Clasificaciones finales | JSON en `configuracion_sistema` (`catalogo_clasificaciones`) | **Tabla `clasificaciones`** con FK `informes_finales.clasificacion_id` |
| Medios de notificaciÃ³n | JSON (`catalogo_medios_notificacion`) | **Tabla `medios_notificacion`** con FK `cierres.notificacion_medio_id` |
| Tipos de prueba | JSON (`catalogo_tipos_prueba`), pestaÃ±a en panel | **Eliminado** (catÃ¡logo huÃ©rfano; `pruebas.tipo` usa `fisica`/`testigo` en cÃ³digo) |
| Dependencias externas | Tabla plana (~13) | **Ãrbol** con `parent_id` + organigrama GAMEA 2026 (185 nodos) |
| EliminaciÃ³n clasificaciones | Hard-delete con count manual | **Soft-deactivate** (`activa=false`); protegidas = no desactivables; en uso = desactivaciÃ³n permitida (preserva histÃ³rico vÃ­a FK) |
| PestaÃ±as del panel | 8 | **7** (se retirÃ³ tipos_prueba) |
| Nuevas columnas | â€” | `informes_finales.clasificado_por_id`, `cierres.cerrado_por_id` (â†’ users) |

**Regla de reportes:** filtrar `users.activo = true` en agregaciones por usuario.

> ðŸ“„ Ver el detalle completo en `Notas ReestructuraciÃ³n BD - CatÃ¡logos y Ãrbol (Cierre).md`
> y el catÃ¡logo de consultas en `Consultas - Dashboard y Reportes.md`.

---

## 1. Resumen Ejecutivo

Sprint 11 construyÃ³ el **Panel de CatÃ¡logos** en `/admin/catalogos` (rol Jefe) para administrar los 8 catÃ¡logos del sistema. Unifica dos orÃ­genes de datos: tablas propias de BD y catÃ¡logos JSON dentro de `configuracion_sistema.valor`.

| MÃ©trica | Valor |
|---------|-------|
| PestaÃ±as en el panel | 8 (CategorÃ­as, Dependencias Externas, Feriados, Medios de NotificaciÃ³n, Clasificaciones Finales, Estados, Tipos de Denuncia, Tipos de Prueba) |
| CatÃ¡logos basados en tablas | 3 (`categorias_denuncia`, `dependencias_externas`, `feriados`) |
| CatÃ¡logos basados en config JSON | 5 (`catalogo_clasificaciones`, `catalogo_tipos_denuncia`, `catalogo_estados`, `catalogo_medios_notificacion`, `catalogo_tipos_prueba`) |
| CatÃ¡logos solo-ediciÃ³n (sin crear/eliminar) | 3 (Tipos de Denuncia, Estados, Tipos de Prueba) |
| Seeders | 1 nuevo (`CatalogosConfigSeeder`, 5 catÃ¡logos JSON) |
| Rutas admin | 4 (`store`, `update`, `destroy`, `reactivar`) |
| Tests del panel | 8 (6 en `CatalogoControllerTest` + 2 de seeders) |
| Suite total | **59 / 59 pasando** |

---

## 2. Decisiones TÃ©cnicas

| DecisiÃ³n | Valor ejecutado |
|----------|----------------|
| **Almacenamiento de catÃ¡logos** | Los catÃ¡logos se alojan como **JSON dentro de `configuracion_sistema.valor`** (columna `TEXT`). Helper `ConfiguracionSistema::catalogItems($clave)` deserializa y `setConfigArray()` persiste. |
| **Constantes del controlador** | `TABLE_BASED = ['categorias','unidades','feriados']` â†’ operan sobre modelos Eloquent. `CONFIG_BASED = ['clasificaciones','tipos_denuncia','estados','medios_notificacion','tipos_prueba']` â†’ operan sobre JSON. |
| **CatÃ¡logos read-only** | `READ_ONLY_TYPES = ['tipos_denuncia','estados','tipos_prueba']` no permiten crear/eliminar (solo editar nombre), porque son referencia interna del flujo. |
| **EliminaciÃ³n en tablas** | Soft-delete: `categorias` y `unidades` marcan `activa=false` + `fecha_desactivacion` + `desactivado_por_id`; `feriados` usa trait `SoftDeletes` (`delete()`/`restore()`). |
| **Clave generada automÃ¡ticamente** | En `store()` de catÃ¡logos config-based: si no se envÃ­a `clave`, se genera con `Str::slug(Str::upper($nombre), '_')`. Aplica tambiÃ©n a CategorÃ­as (tabla). |
| **MAYÃšSCULAS** | `upperData()` normaliza strings a mayÃºsculas antes de guardar en config JSON (consistente con el trait `UppercaseText`). |
| **ValidaciÃ³n de medios usados** | `getMediosNotificacionData()` cuenta usos en `cierres.notificacion_medio` con `UPPER(COALESCE(notificacion_medio,'')) = UPPER(clave)` (insensible a mayÃºsculas) y `where('eliminado', false)`. `destroy()` bloquea eliminar un medio en uso. |
| **BitÃ¡cora** | `logBitacora()` registra en `bitacora` + `Log::info("CATALOGO_{accion}")` para crear, actualizar, desactivar, reactivar y eliminar. |
| **Props compartidas** | `HandleInertiaRequests` comparte `clasificaciones` y `medios_notificacion` (id/clave/nombre) para formularios y badge. |
| **Frontend** | `FormCierre` y `FormInformeFinal` leen el catÃ¡logo compartido con **fallback hardcodeado** si el array llega vacÃ­o (no rompe si la BD no estÃ¡ sembrada). |

---

## 3. Clasificaciones Finales â€” Fuente de Verdad

`catalogo_clasificaciones` es la Ãºnica fuente de verdad del dropdown de clasificaciÃ³n del Informe Final:

| Capa | Comportamiento |
|------|----------------|
| **Controlador (backend)** | `DenunciaController::clasificacionesValidas()` valida con `Rule::in($claves)` (claves del catÃ¡logo). Fallback: `['penal','civil','administrativo','sin_indicios','medida_correctiva','archivado']`. |
| **Badge** | `ClasificacionBadge.tsx` y `ResultadoSeguimiento.tsx` (pÃºblico) resuelven nombre desde el catÃ¡logo compartido. |
| **SeguimientoController** | `clasificacionLabel()` busca en catÃ¡logo con fallback hardcodeado (mismas 6 claves). |
| **Frontend formulario** | `FormInformeFinal.tsx` usa `props.clasificaciones` con fallback `FALLBACK_CLASIFICACIONES`. |

**ProtecciÃ³n:** `PROTECTED_CLASIFICACIONES = ['penal','civil','administrativo','sin_indicios','medida_correctiva','archivado']` no pueden eliminarse. AdemÃ¡s, una clasificaciÃ³n en uso en â‰¥1 `informes_finales` no se puede eliminar (`destroy()` devuelve error con contador).

---

## 4. Medios de NotificaciÃ³n â€” ConexiÃ³n con el Cierre

El flujo de cierre (`FormCierre.tsx`) usa `catalogo_medios_notificacion` como catÃ¡logo de medios:

- `HandleInertiaRequests` comparte `medios_notificacion` (id/clave/nombre).
- `FormCierre.tsx` filtra Ã­tems con `clave` y `nombre`, con fallback `FALLBACK_MEDIOS_NOTIFICACION` (`whatsapp`, `email`, `presencial`, `otro`).
- **NormalizaciÃ³n a minÃºsculas:** `notificacion_medio` en BD se guarda en MAYÃšSCULAS (trait `UppercaseText`), mientras el catÃ¡logo usa claves en minÃºsculas (`whatsapp`, `email`, ...). El frontend aplica `.toLowerCase()` en estado inicial y en `useEffect` para que la opciÃ³n seleccionada coincida con la clave del catÃ¡logo.
- **ProtecciÃ³n por uso:** el contador de usos se calcula con `UPPER(...) = UPPER(clave)`; no se puede eliminar un medio usado en â‰¥1 cierre activo.

---

## 5. Semilla de CatÃ¡logos (CatalogosConfigSeeder)

`CatalogosConfigSeeder::run()` hace `updateOrCreate` sobre `configuracion_sistema` para 5 claves:

| Clave de config | Items sembrados |
|-----------------|-----------------|
| `catalogo_clasificaciones` | 6 (penal, civil, administrativo, sin_indicios, medida_correctiva, archivado) |
| `catalogo_tipos_denuncia` | 2 (corrupcion, negacion) |
| `catalogo_estados` | 8 (ingresada â†’ cerrada) |
| `catalogo_medios_notificacion` | 4 (whatsapp, email, presencial, otro) |
| `catalogo_tipos_prueba` | 3 (ARCHIVO, PRUEBA FÃSICA, TESTIGO) |

> **Nota:** `catalogo_tipos_prueba` **no tiene clave** (solo id + nombre); por eso su columna en el panel es solo `Nombre`. `CatalogosConfigSeeder` es **idempotente** (puede re-ejecutarse).

---

## 6. Config Eliminada: `anio_vigente`

- Se eliminÃ³ la clave de config `anio_vigente` porque el sistema no la utiliza (el aÃ±o se deriva de las fechas reales).
- Quitada de `CatalogoSeeder.php`, eliminada la fila huÃ©rfana de la BD (vÃ­a tinker) y actualizada la documentaciÃ³n de esquema y seeders.
- âš ï¸ El backup fue regenerado el 2026-08-04 (`backup-transparencia-2026-08-04.sql`) y ya no incluye `anio_vigente`. El backup viejo (07-31) fue eliminado.

---

## 7. Rutas del Panel (rol Jefe)

```
GET   /admin/catalogos                      â†’ admin.catalogos
POST  /admin/catalogos/{tipo}               â†’ admin.catalogos.store
POST  /admin/catalogos/{tipo}/{id}          â†’ admin.catalogos.update
POST  /admin/catalogos/{tipo}/{id}/eliminar â†’ admin.catalogos.destroy
POST  /admin/catalogos/{tipo}/{id}/reactivarâ†’ admin.catalogos.reactivar
```

El acceso estÃ¡ protegido por el middleware de permisos (solo Jefe).

---

## 8. Tests

| # | Test | Resultado |
|---|------|-----------|
| 1 | `test_clasificacion_in_use_not_deletable` | ClasificaciÃ³n usada en un informe NO se elimina |
| 2 | `test_clasificacion_store_genera_clave` | `store()` genera `clave` automÃ¡ticamente desde el nombre |
| 3 | `test_medio_notificacion_in_use_not_deletable` | Medio usado en un cierre NO se elimina |
| 4 | `test_medio_notificacion_unused_deletable` | Medio sin uso SÃ se elimina |
| 5 | `test_medio_notificacion_store_genera_clave` | `store()` de medios genera clave |
| 6 | `test_medio_notificacion_index_marks_usos` | `index()` marca `usos` por medio |
| +2 | Tests de `CatalogosConfigSeeder` (sembrado idempotente) | Pasan |

Suite completa: **59 / 59 verdes** (`php artisan test`, PHP 8.3.30). `npm run build` sin errores.

---

## 9. Pendientes del Sprint 11

- **SubcategorÃ­as jerÃ¡rquicas:** el campo `parent_id` planificado para `categorias_denuncia` **no se implementÃ³** (la migraciÃ³n real no lo tiene). Debatir si se requiere para CategorÃ­as anidadas.
- **Preferencias de alerta por usuario:** definir almacenamiento (JSON en `users.preferencias`) y UI de configuraciÃ³n.
- **UI de calendario para Feriados:** hoy se muestra agrupado por aÃ±o en tabla; mejorar con grid mensual si el cliente lo pide.
- **RegistroDenuncia con subcategorÃ­as:** al implementarse subcategorÃ­as, el formulario pÃºblico debe usar el catÃ¡logo.

