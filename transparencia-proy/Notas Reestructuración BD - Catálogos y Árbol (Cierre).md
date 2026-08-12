# Notas Reestructuración BD — Catálogos y Árbol de Dependencias (Cierre)

> **Propósito:** Documentar la reestructuración de Agosto 2026 que migró los catálogos JSON a
> tablas reales y convirtió `dependencias_externas` en un árbol. Base para Sprint 12 (Dashboard/Reportes).
> Leer este archivo cuando se trabaje en catálogos, informes, dashboard o consultas.

---

## 1. Resumen Ejecutivo

Se reestructuró la base de datos para habilitar **consultas en tiempo real** en el dashboard y
reportes (Sprint 12). Los catálogos que antes vivían como JSON dentro de
`configuracion_sistema.valor` pasaron a tablas propias con claves foráneas, y el catálogo de
dependencias adoptó una estructura jerárquica.

| Métrica | Valor |
|---------|-------|
| Tablas nuevas | 2 (`clasificaciones`, `medios_notificacion`) |
| Columnas FK nuevas | 4 (`informes_finales.clasificacion_id`, `informes_finales.clasificado_por_id`, `cierres.notificacion_medio_id`, `cierres.cerrado_por_id`) |
| Columna de árbol | 1 (`dependencias_externas.parent_id`) |
| Columnas string eliminadas | 2 (`informes_finales.clasificacion`, `cierres.notificacion_medio`) |
| Catálogos JSON retirados | 3 (`catalogo_clasificaciones`, `catalogo_medios_notificacion`, `catalogo_tipos_prueba`) |
| Dependencias sembradas | 185 (árbol organigrama GAMEA 2026) |
| Modelos nuevos | 2 (`Clasificacion`, `MedioNotificacion`) |
| Índices nuevos | 5 (`denuncias.tipo`, `denuncias.created_at`, `informes_finales.redactado_at`, `cierres.cerrado_at`, `dependencias_externas.parent_id`) |
| Suite de tests | **63 / 63 pasando** |

---

## 2. Decisiones Técnicas

### 2.1 Filosofía "minimizar tablas" — por qué solo 2 tablas nuevas

Se evaluó convertir los 5 catálogos JSON en tablas. **Se crearon solo 2** porque son los únicos
**editables por el Jefe, conectados a tablas de negocio y necesarios para KPIs**:

| Catálogo | ¿Tabla? | Razón |
|----------|---------|-------|
| `clasificaciones` | **SÍ** | Crece, admin-editable, alimenta informe final + vista pública + reportes ("casos por clasificación") |
| `medios_notificacion` | **SÍ** | Admin-editable, alimenta reportes ("cierres por medio") |
| `catalogo_estados` | No | Máquina de estados del flujo; `GROUP BY denuncias.estado` es instantáneo (indexado) |
| `catalogo_tipos_denuncia` | No | Vocabulario legal fijo (45/20 días); agregar fila exigiría código de todos modos |
| `catalogo_tipos_prueba` | **Eliminado** | Catálogo huérfano: `pruebas.tipo` usa `fisica`/`testigo` en código, no las claves del catálogo |

### 2.2 Normalización con FKs + accessors de compatibilidad

- `informes_finales.clasificacion` (string) → `clasificacion_id` FK → `clasificaciones`.
- `cierres.notificacion_medio` (string) → `notificacion_medio_id` FK → `medios_notificacion`.
- El frontend **no cambió**: los modelos exponen accessors (`clasificacion` → clave, `notificacion_medio` → clave) incluidos en `toArray()` vía `$appends`. `FormInformeFinal`, `FormCierre`, badges y seguimiento público siguen recibiendo la clave.
- El backend sigue **validando por clave** y resuelve clave → id al guardar (`DenunciaController::guardarInforme/editarInforme/guardarCierre/editarCierre`).

### 2.3 Nuevos FKs para reportes por usuario

- `informes_finales.clasificado_por_id` → users (quién clasificó). Antes solo había el texto libre `concluido_por`.
- `cierres.cerrado_por_id` → users (quién cerró).
- **Regla:** nunca borrar usuarios; desactivar con `activo = false`. Los reportes filtran `activo = true` por defecto.

### 2.4 Soft-deactivate en vez de hard-delete (clasificaciones/medios)

- `destroy()` de clasificaciones/medios ahora **desactiva** (`activa = false` + `fecha_desactivacion` + `desactivado_por_id`), igual que categorías/unidades.
- `PROTECTED_CLASIFICACIONES = ['penal','civil','administrativo','sin_indicios','medida_correctiva','archivado']` **no pueden desactivarse**.
- Las clasificaciones/medios **en uso sí pueden desactivarse** (mejora sobre el bloqueo anterior): el histórico se preserva vía FK y el accessor sigue resolviendo la clave.

### 2.5 Árbol de dependencias

- `dependencias_externas.parent_id` self-FK nullable + índice.
- Relaciones del modelo: `parent()` / `children()`.
- **Validación anti-ciclos** en `update` (`validarParentUnidad`): no puede ser padre de sí misma ni de un descendiente.
- Panel con **vista de árbol** expandible y mover vía select "Dependencia padre".
- `ModalNuevaSolicitud` usa un **select jerárquico** (≈185 opciones planas era inusable).

---

## 3. Estructura del Árbol (Seed — organigrama GAMEA 2026)

```
GOBIERNO AUTÓNOMO MUNICIPAL DE EL ALTO                (raíz, parent_id = null)
└── DESPACHO ALCALDE                                  (renombrado de ALCALDESA)
    ├── UNIDAD DE TRANSPARENCIA Y LUCHA CONTRA LA CORRUPCIÓN
    ├── UNIDAD SUMARIANTE / AUDITORIA INTERNA / RELACIONES PÚBLICAS / GESTIÓN SOCIAL
    ├── DIRECCIÓN GENERAL DE ASESORIA LEGAL → 4 unidades
    ├── DIRECCIÓN DE PLANIFICACIÓN → 5 unidades
    ├── DIRECCIÓN DE COMUNICACIÓN → 3 unidades
    ├── DIRECCIÓN DE RELACIONES INTERNACIONALES
    ├── SECRETARÍA MUNICIPAL DE GESTIÓN INSTITUCIONAL     (ex Secretaría General)
    │   ├── TERMINAL METROPOLITANA DE EL ALTO
    │   ├── DIRECCIÓN DE ATENCIÓN CIUDADANA → 4 unidades
    │   ├── DIRECCIÓN DE ALUMBRADO PÚBLICO → 2 unidades
    │   └── [las demás 9 secretarías → direcciones → unidades]
    └── SUBALCALDÍAS MUNICIPALES
        └── SUBALCALDÍA MUNICIPAL DISTRITO 1 .. 14        (sin unidades internas)
```

**Reglas aplicadas:**
- Gestión Institucional es **padre de las demás secretarías** (decisión del cliente).
- Subalcaldías: solo los 14 nodos padre (sin las 4 unidades estándar); se agregarán en el futuro si aplica.
- Sin entidades externas (se eliminó el Ministerio de Justicia).
- Los nombres almacenados son solo el **nodo hoja** (sin prefijo de ruta `A — B — C`).

---

## 4. Archivos Modificados

**Backend:**
- `database/migrations/2026_08_12_*` (6 migraciones: 2 tablas, parent_id, FKs informes/cierres, índices)
- `app/Models/Clasificacion.php`, `app/Models/MedioNotificacion.php` (nuevos)
- `app/Models/InformeFinal.php`, `app/Models/Cierre.php` (FKs + accessors + `$appends`)
- `app/Models/DependenciaExterna.php` (`parent_id`, `parent()`, `children()`)
- `app/Http/Controllers/CatalogoController.php` (clasificaciones/medios → TABLE_BASED, anti-ciclos, árbol)
- `app/Http/Controllers/DenunciaController.php` (resuelve clave→id, `clasificado_por_id`/`cerrado_por_id`)
- `app/Http/Controllers/SeguimientoController.php`, `BandejaController.php`, `MisCasosController.php` (eager loading)
- `app/Http/Middleware/HandleInertiaRequests.php` (comparte catálogos desde tablas)
- `database/seeders/CatalogoSeeder.php` (árbol + clasificaciones + medios), `CatalogosConfigSeeder.php` (solo estados/tipos), `DenunciaSeeder.php` (resolución por nombre)

**Frontend:**
- `resources/js/Components/Admin/TablaCatalogo.tsx` (árbol, roll-up, protegido)
- `resources/js/Components/Admin/ModalEditarItem.tsx` (select "Dependencia padre")
- `resources/js/Components/Denuncias/ModalNuevaSolicitud.tsx` (select jerárquico)
- `resources/js/Pages/Admin/Catalogos.tsx` (props `es_arbol`/`padre_options`)

---

## 5. Verificación

```bash
php artisan migrate:fresh --seed   # 185 dependencias, 6 clasificaciones, 4 medios
php artisan test                    # 63 / 63 pasando
npm run build                       # sin errores TS/Vite
```

---

## 6. Fuera de Alcance / Próximos Pasos

- **Sprint 12 (Dashboard + Reportes):** usar `Consultas - Dashboard y Reportes.md`.
- `categorias_denuncia.parent_id` (subcategorías jerárquicas): pendiente de confirmación del cliente (entidad distinta).
- Preferencias de alerta por usuario: Sprint 18.
