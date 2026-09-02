> ⚠️ **Histórico — Sprint cerrado Jul 2026 (Laravel 11).** Snapshot al cierre, no refleja refactorización Bloques 0-2 (Sep 2026, Laravel 13). Para estado actual ver AI-CONTEXT.md y Notas Reestructuración - Bloques 0-2 (Sept 2026) - Cierre.md.
# Notas ReestructuraciÃ³n BD â€” CatÃ¡logos y Ãrbol de Dependencias (Cierre)

> **PropÃ³sito:** Documentar la reestructuraciÃ³n de Agosto 2026 que migrÃ³ los catÃ¡logos JSON a
> tablas reales y convirtiÃ³ `dependencias_externas` en un Ã¡rbol. Base para Sprint 12 (Dashboard/Reportes).
> Leer este archivo cuando se trabaje en catÃ¡logos, informes, dashboard o consultas.

---

## 1. Resumen Ejecutivo

Se reestructurÃ³ la base de datos para habilitar **consultas en tiempo real** en el dashboard y
reportes (Sprint 12). Los catÃ¡logos que antes vivÃ­an como JSON dentro de
`configuracion_sistema.valor` pasaron a tablas propias con claves forÃ¡neas, y el catÃ¡logo de
dependencias adoptÃ³ una estructura jerÃ¡rquica.

| MÃ©trica | Valor |
|---------|-------|
| Tablas nuevas | 2 (`clasificaciones`, `medios_notificacion`) |
| Columnas FK nuevas | 4 (`informes_finales.clasificacion_id`, `informes_finales.clasificado_por_id`, `cierres.notificacion_medio_id`, `cierres.cerrado_por_id`) |
| Columna de Ã¡rbol | 1 (`dependencias_externas.parent_id`) |
| Columnas string eliminadas | 2 (`informes_finales.clasificacion`, `cierres.notificacion_medio`) |
| CatÃ¡logos JSON retirados | 3 (`catalogo_clasificaciones`, `catalogo_medios_notificacion`, `catalogo_tipos_prueba`) |
| Dependencias sembradas | 185 (Ã¡rbol organigrama GAMEA 2026) |
| Modelos nuevos | 2 (`Clasificacion`, `MedioNotificacion`) |
| Ãndices nuevos | 5 (`denuncias.tipo`, `denuncias.created_at`, `informes_finales.redactado_at`, `cierres.cerrado_at`, `dependencias_externas.parent_id`) |
| Suite de tests | **63 / 63 pasando** |

---

## 2. Decisiones TÃ©cnicas

### 2.1 FilosofÃ­a "minimizar tablas" â€” por quÃ© solo 2 tablas nuevas

Se evaluÃ³ convertir los 5 catÃ¡logos JSON en tablas. **Se crearon solo 2** porque son los Ãºnicos
**editables por el Jefe, conectados a tablas de negocio y necesarios para KPIs**:

| CatÃ¡logo | Â¿Tabla? | RazÃ³n |
|----------|---------|-------|
| `clasificaciones` | **SÃ** | Crece, admin-editable, alimenta informe final + vista pÃºblica + reportes ("casos por clasificaciÃ³n") |
| `medios_notificacion` | **SÃ** | Admin-editable, alimenta reportes ("cierres por medio") |
| `catalogo_estados` | No | MÃ¡quina de estados del flujo; `GROUP BY denuncias.estado` es instantÃ¡neo (indexado) |
| `catalogo_tipos_denuncia` | No | Vocabulario legal fijo (45/20 dÃ­as); agregar fila exigirÃ­a cÃ³digo de todos modos |
| `catalogo_tipos_prueba` | **Eliminado** | CatÃ¡logo huÃ©rfano: `pruebas.tipo` usa `fisica`/`testigo` en cÃ³digo, no las claves del catÃ¡logo |

### 2.2 NormalizaciÃ³n con FKs + accessors de compatibilidad

- `informes_finales.clasificacion` (string) â†’ `clasificacion_id` FK â†’ `clasificaciones`.
- `cierres.notificacion_medio` (string) â†’ `notificacion_medio_id` FK â†’ `medios_notificacion`.
- El frontend **no cambiÃ³**: los modelos exponen accessors (`clasificacion` â†’ clave, `notificacion_medio` â†’ clave) incluidos en `toArray()` vÃ­a `$appends`. `FormInformeFinal`, `FormCierre`, badges y seguimiento pÃºblico siguen recibiendo la clave.
- El backend sigue **validando por clave** y resuelve clave â†’ id al guardar (`DenunciaController::guardarInforme/editarInforme/guardarCierre/editarCierre`).

### 2.3 Nuevos FKs para reportes por usuario

- `informes_finales.clasificado_por_id` â†’ users (quiÃ©n clasificÃ³). Antes solo habÃ­a el texto libre `concluido_por`.
- `cierres.cerrado_por_id` â†’ users (quiÃ©n cerrÃ³).
- **Regla:** nunca borrar usuarios; desactivar con `activo = false`. Los reportes filtran `activo = true` por defecto.

### 2.4 Soft-deactivate en vez de hard-delete (clasificaciones/medios)

- `destroy()` de clasificaciones/medios ahora **desactiva** (`activa = false` + `fecha_desactivacion` + `desactivado_por_id`), igual que categorÃ­as/unidades.
- `PROTECTED_CLASIFICACIONES = ['penal','civil','administrativo','sin_indicios','medida_correctiva','archivado']` **no pueden desactivarse**.
- Las clasificaciones/medios **en uso sÃ­ pueden desactivarse** (mejora sobre el bloqueo anterior): el histÃ³rico se preserva vÃ­a FK y el accessor sigue resolviendo la clave.

### 2.5 Ãrbol de dependencias

- `dependencias_externas.parent_id` self-FK nullable + Ã­ndice.
- Relaciones del modelo: `parent()` / `children()`.
- **ValidaciÃ³n anti-ciclos** en `update` (`validarParentUnidad`): no puede ser padre de sÃ­ misma ni de un descendiente.
- Panel con **vista de Ã¡rbol** expandible y mover vÃ­a select "Dependencia padre".
- `ModalNuevaSolicitud` usa un **select jerÃ¡rquico** (â‰ˆ185 opciones planas era inusable).

---

## 3. Estructura del Ãrbol (Seed â€” organigrama GAMEA 2026)

```
GOBIERNO AUTÃ“NOMO MUNICIPAL DE EL ALTO                (raÃ­z, parent_id = null)
â””â”€â”€ DESPACHO ALCALDE                                  (renombrado de ALCALDESA)
    â”œâ”€â”€ UNIDAD DE TRANSPARENCIA Y LUCHA CONTRA LA CORRUPCIÃ“N
    â”œâ”€â”€ UNIDAD SUMARIANTE / AUDITORIA INTERNA / RELACIONES PÃšBLICAS / GESTIÃ“N SOCIAL
    â”œâ”€â”€ DIRECCIÃ“N GENERAL DE ASESORIA LEGAL â†’ 4 unidades
    â”œâ”€â”€ DIRECCIÃ“N DE PLANIFICACIÃ“N â†’ 5 unidades
    â”œâ”€â”€ DIRECCIÃ“N DE COMUNICACIÃ“N â†’ 3 unidades
    â”œâ”€â”€ DIRECCIÃ“N DE RELACIONES INTERNACIONALES
    â”œâ”€â”€ SECRETARÃA MUNICIPAL DE GESTIÃ“N INSTITUCIONAL     (ex SecretarÃ­a General)
    â”‚   â”œâ”€â”€ TERMINAL METROPOLITANA DE EL ALTO
    â”‚   â”œâ”€â”€ DIRECCIÃ“N DE ATENCIÃ“N CIUDADANA â†’ 4 unidades
    â”‚   â”œâ”€â”€ DIRECCIÃ“N DE ALUMBRADO PÃšBLICO â†’ 2 unidades
    â”‚   â””â”€â”€ [las demÃ¡s 9 secretarÃ­as â†’ direcciones â†’ unidades]
    â””â”€â”€ SUBALCALDÃAS MUNICIPALES
        â””â”€â”€ SUBALCALDÃA MUNICIPAL DISTRITO 1 .. 14        (sin unidades internas)
```

**Reglas aplicadas:**
- GestiÃ³n Institucional es **padre de las demÃ¡s secretarÃ­as** (decisiÃ³n del cliente).
- SubalcaldÃ­as: solo los 14 nodos padre (sin las 4 unidades estÃ¡ndar); se agregarÃ¡n en el futuro si aplica.
- Sin entidades externas (se eliminÃ³ el Ministerio de Justicia).
- Los nombres almacenados son solo el **nodo hoja** (sin prefijo de ruta `A â€” B â€” C`).

---

## 4. Archivos Modificados

**Backend:**
- `database/migrations/2026_08_12_*` (6 migraciones: 2 tablas, parent_id, FKs informes/cierres, Ã­ndices)
- `app/Models/Clasificacion.php`, `app/Models/MedioNotificacion.php` (nuevos)
- `app/Models/InformeFinal.php`, `app/Models/Cierre.php` (FKs + accessors + `$appends`)
- `app/Models/DependenciaExterna.php` (`parent_id`, `parent()`, `children()`)
- `app/Http/Controllers/CatalogoController.php` (clasificaciones/medios â†’ TABLE_BASED, anti-ciclos, Ã¡rbol)
- `app/Http/Controllers/DenunciaController.php` (resuelve claveâ†’id, `clasificado_por_id`/`cerrado_por_id`)
- `app/Http/Controllers/SeguimientoController.php`, `BandejaController.php`, `MisCasosController.php` (eager loading)
- `app/Http/Middleware/HandleInertiaRequests.php` (comparte catÃ¡logos desde tablas)
- `database/seeders/CatalogoSeeder.php` (Ã¡rbol + clasificaciones + medios), `CatalogosConfigSeeder.php` (solo estados/tipos), `DenunciaSeeder.php` (resoluciÃ³n por nombre)

**Frontend:**
- `resources/js/Components/Admin/TablaCatalogo.tsx` (Ã¡rbol, roll-up, protegido)
- `resources/js/Components/Admin/ModalEditarItem.tsx` (select "Dependencia padre")
- `resources/js/Components/Denuncias/ModalNuevaSolicitud.tsx` (select jerÃ¡rquico)
- `resources/js/Pages/Admin/Catalogos.tsx` (props `es_arbol`/`padre_options`)

---

## 5. VerificaciÃ³n

```bash
php artisan migrate:fresh --seed   # 185 dependencias, 6 clasificaciones, 4 medios
php artisan test                    # 63 / 63 pasando
npm run build                       # sin errores TS/Vite
```

---

## 6. Fuera de Alcance / PrÃ³ximos Pasos

- **Sprint 12 (Dashboard + Reportes):** usar `Consultas - Dashboard y Reportes.md`.
- `categorias_denuncia.parent_id` (subcategorÃ­as jerÃ¡rquicas): pendiente de confirmaciÃ³n del cliente (entidad distinta).
- Preferencias de alerta por usuario: Sprint 18.

