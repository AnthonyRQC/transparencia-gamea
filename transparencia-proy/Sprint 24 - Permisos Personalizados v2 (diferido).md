#transparencia
# Sprint 24 — Permisos Personalizados (v2) ⏸️ DIFERIDO

**Estado:** ⏸️ **Diferido a v2.** NO se implementa en Fase 0 ni Fase 1.

**Origen:** Duda del cliente Julio 2026 — ¿se necesita un panel de control para dar distintos tipos de permisos a ciertos usuarios o edición de permisos a roles?

**Decisión tomada (Julio 2026):** 3 roles fijos con permisos hardcodeados (Sprint 7.5 + Sprint 15). NO se implementa panel de control de permisos granulares por usuario en Fase 1.

---

## 1. Contexto

### 1.1 Pregunta del cliente (Julio 2026)
> "Opciones de subir casos antiguos al sistema. talvez alguna forma mejor de ordenar por años o algo por el estilo del historial de casos que sea de facil consulta. también si bien hay permisos que son enlazados con ciertos roles talvez podriamos tener un panel de control que pueda dar distintos tipos de permisos a ciertos usuarios o edicion de permisos a roles par tener una mejor organizacion o esto es muy complejo?"

### 1.2 Decisión
El cliente preguntó sobre la complejidad. Tras análisis, se concluyó:
- **En Fase 0/1:** 3 roles fijos (Registrador, Jefe, Técnico) con permisos hardcodeados.
- **Sprint 7.5** introduce el catálogo de permisos y el chequeo por permisos en frontend.
- **Sprint 15** formaliza con BD, Laravel Gates y Policies.
- **Sprint 24 (v2):** si en el futuro se requiere granularidad por usuario, se abordará con librería tipo `spatie/laravel-permission`.

### 1.3 Razón de la decisión
- Mantener el sistema simple y predecible en la primera versión.
- La experiencia ha mostrado que la mayoría de usuarios encajan en uno de los 3 roles.
- La granularidad agrega complejidad significativa:
  - UI de administración de permisos (matriz usuario × permiso)
  - Lógica de "permisos efectivos" (directos + por rol)
  - Auditoría de cambios de permisos
  - Testing más complejo
- Se difiere a v2 para cuando el sistema esté estable.

---

## 2. Estado actual (Fase 0/1)

### 2.1 Sprint 7.5 (catálogo de permisos)
- `app/Data/PermisosCatalogo.php` — array PHP con todos los permisos
- `resources/js/permissions.ts` — espejo en TypeScript
- `useCan()` y `<Can>` para chequeo en frontend
- Mapeo `rol → permisos[]` hardcodeado en `SesionUsuarioData`

### 2.2 Sprint 15 (formal con BD)
- Laravel Gates y Policies
- Tablas `roles`, `permissions`, `role_user`, `permission_role` (o equivalente)
- Middleware de permisos en rutas
- 3 roles fijos con permisos asignados

### 2.3 NO se hace
- ❌ Panel de control para editar permisos por usuario
- ❌ UI para crear/editar roles dinámicamente
- ❌ Permisos granulares que escapen del catálogo de Sprint 7.5
- ❌ Auditoría de cambios de permisos

---

## 3. Funcionalidades diferidas (referencia para v2)

### 3.1 Panel de control de permisos
- Vista `/admin/permisos` solo para Administrador
- Tabla con:
  - Filas: usuarios
  - Columnas: permisos del catálogo
  - Celdas: checkbox
- Permite asignar/remover permisos individuales
- Los permisos efectivos son: (permisos del rol) + (permisos directos del usuario) - (permisos removidos)

### 3.2 Panel de control de roles
- Vista `/admin/roles` solo para Administrador
- CRUD de roles
- Asignación de permisos a cada rol
- Roles custom (no solo los 3 fijos)

### 3.3 Auditoría de cambios de permisos
- Quién cambió qué permiso a quién
- Cuándo
- Por qué (justificación opcional)

---

## 4. Stack técnico sugerido (v2)

### 4.1 Librería: `spatie/laravel-permission`
```bash
composer require spatie/laravel-permission
```

Esta librería provee:
- Modelos `Role` y `Permission`
- Tablas `roles`, `permissions`, `model_has_roles`, `model_has_permissions`, `role_has_permissions`
- Helpers: `$user->givePermissionTo('x')`, `$user->can('x')`
- Blade directives: `@can('x')`, `@role('admin')`

### 4.2 Frontend: extender catálogo
- `app/Data/PermisosCatalogo.php` (extender con permisos custom)
- `resources/js/permissions.ts` (extender)
- Mantener `useCan()` y `<Can>`

### 4.3 UI: panel de administración
- Reusar patrón de `Sprint 10` (Panel Administración Catálogos)
- Tabla con checkbox por permiso

---

## 5. Estimación (referencia v2)

**3-5 días** cuando se reactive. Incluye:
- Instalar y configurar `spatie/laravel-permission`
- Crear UI de administración de roles y permisos
- Refactor de `SesionUsuarioData` para cargar permisos efectivos
- Refactor de todos los chequeos de permisos (no debería cambiar mucho, pero sí la fuente)
- Auditoría de cambios
- Testing

---

## 6. ¿Por qué se difiere a v2 y no se elimina?

- El cliente preguntó, no pidió eliminación. Solo pidió análisis de complejidad.
- La complejidad existe, pero es manejable si en el futuro se requiere.
- Mientras los 3 roles fijos cubran el 95% de los casos, no hay urgencia.
- Si en algún momento se necesita granularidad, Sprint 24 lo provee.

---

## 7. Diferencia con Sprint 7.5 y 15

| Sprint | Alcance |
|---|---|
| 7.5 | Catálogo de permisos hardcodeado, `useCan()` en frontend, sin UI de admin |
| 15 | Laravel Gates/Policies, 3 roles fijos con BD, middleware en rutas |
| 24 (v2) | Permisos granulares por usuario, panel de admin de roles/permisos, `spatie/laravel-permission` |

---

## 8. Decisiones del Sprint

| # | Decisión | Alternativa descartada | Motivo |
|---|----------|------------------------|--------|
| 1 | Sprint 24 es diferido a v2 | Implementar en Fase 1 | Complejidad no justificada para 3 roles |
| 2 | 3 roles fijos en Fase 0/1 | Roles dinámicos | Mantener simplicidad |
| 3 | Catálogo de permisos hardcodeado (Sprint 7.5) | Permisos en BD desde ya | YAGNI, refactor en Sprint 15 |
| 4 | NO se hace panel de admin de permisos en Fase 1 | Hacerlo desde ya | YAGNI, Sprint 24 lo provee si se necesita |
| 5 | Si se reactiva, usar `spatie/laravel-permission` | Implementar propio | Librería probada, menos bugs |

---

## 9. Cierre

Sprint 24 está **diferido**. No hay actividad en Fase 0/1.

Cuando se reactive en v2:
1. Instalar `spatie/laravel-permission`
2. Crear UI de administración de roles
3. Crear UI de administración de permisos por usuario
4. Refactor de carga de permisos
5. Auditoría de cambios
6. Testing exhaustivo

Mientras tanto, Sprint 7.5 (catálogo + `useCan()`) y Sprint 15 (formal con BD) son suficientes.

---
*Documento creado: Julio 2026. Sprint 24 — Permisos Personalizados v2 (diferido).*
