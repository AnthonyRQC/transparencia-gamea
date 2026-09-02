> ⚠️ **Histórico — Sprint cerrado Jul 2026 (Laravel 11).** Snapshot al cierre, no refleja refactorización Bloques 0-2 (Sep 2026, Laravel 13). Para estado actual ver AI-CONTEXT.md y Notas Reestructuración - Bloques 0-2 (Sept 2026) - Cierre.md.
#transparencia
# Sprint 24 â€” Permisos Personalizados (v2) â¸ï¸ DIFERIDO

**Estado:** â¸ï¸ **Diferido a v2.** NO se implementa en Fase 0 ni Fase 1.

**Origen:** Duda del cliente Julio 2026 â€” Â¿se necesita un panel de control para dar distintos tipos de permisos a ciertos usuarios o ediciÃ³n de permisos a roles?

**DecisiÃ³n tomada (Julio 2026):** 3 roles fijos con permisos hardcodeados (Sprint 7.5 + Sprint 16). NO se implementa panel de control de permisos granulares por usuario en Fase 1.

---

## 1. Contexto

### 1.1 Pregunta del cliente (Julio 2026)
> "Opciones de subir casos antiguos al sistema. talvez alguna forma mejor de ordenar por aÃ±os o algo por el estilo del historial de casos que sea de facil consulta. tambiÃ©n si bien hay permisos que son enlazados con ciertos roles talvez podriamos tener un panel de control que pueda dar distintos tipos de permisos a ciertos usuarios o edicion de permisos a roles par tener una mejor organizacion o esto es muy complejo?"

### 1.2 DecisiÃ³n
El cliente preguntÃ³ sobre la complejidad. Tras anÃ¡lisis, se concluyÃ³:
- **En Fase 0/1:** 3 roles fijos (Registrador, Jefe, TÃ©cnico) con permisos hardcodeados.
- **Sprint 7.5** introduce el catÃ¡logo de permisos y el chequeo por permisos en frontend.
- **Sprint 16** formaliza con BD, Laravel Gates y Policies.
- **Sprint 24 (v2):** si en el futuro se requiere granularidad por usuario, se abordarÃ¡ con librerÃ­a tipo `spatie/laravel-permission`.

### 1.3 RazÃ³n de la decisiÃ³n
- Mantener el sistema simple y predecible en la primera versiÃ³n.
- La experiencia ha mostrado que la mayorÃ­a de usuarios encajan en uno de los 3 roles.
- La granularidad agrega complejidad significativa:
  - UI de administraciÃ³n de permisos (matriz usuario Ã— permiso)
  - LÃ³gica de "permisos efectivos" (directos + por rol)
  - AuditorÃ­a de cambios de permisos
  - Testing mÃ¡s complejo
- Se difiere a v2 para cuando el sistema estÃ© estable.

---

## 2. Estado actual (Fase 0/1)

### 2.1 Sprint 7.5 (catÃ¡logo de permisos)
- `app/Data/PermisosCatalogo.php` â€” array PHP con todos los permisos
- `resources/js/permissions.ts` â€” espejo en TypeScript
- `useCan()` y `<Can>` para chequeo en frontend
- Mapeo `rol â†’ permisos[]` hardcodeado en `SesionUsuarioData`

### 2.2 Sprint 16 (formal con BD)
- Laravel Gates y Policies
- Tablas `roles`, `permissions`, `role_user`, `permission_role` (o equivalente)
- Middleware de permisos en rutas
- 3 roles fijos con permisos asignados

### 2.3 NO se hace
- âŒ Panel de control para editar permisos por usuario
- âŒ UI para crear/editar roles dinÃ¡micamente
- âŒ Permisos granulares que escapen del catÃ¡logo de Sprint 7.5
- âŒ AuditorÃ­a de cambios de permisos

---

## 3. Funcionalidades diferidas (referencia para v2)

### 3.1 Panel de control de permisos
- Vista `/admin/permisos` solo para Administrador
- Tabla con:
  - Filas: usuarios
  - Columnas: permisos del catÃ¡logo
  - Celdas: checkbox
- Permite asignar/remover permisos individuales
- Los permisos efectivos son: (permisos del rol) + (permisos directos del usuario) - (permisos removidos)

### 3.2 Panel de control de roles
- Vista `/admin/roles` solo para Administrador
- CRUD de roles
- AsignaciÃ³n de permisos a cada rol
- Roles custom (no solo los 3 fijos)

### 3.3 AuditorÃ­a de cambios de permisos
- QuiÃ©n cambiÃ³ quÃ© permiso a quiÃ©n
- CuÃ¡ndo
- Por quÃ© (justificaciÃ³n opcional)

---

## 4. Stack tÃ©cnico sugerido (v2)

### 4.1 LibrerÃ­a: `spatie/laravel-permission`
```bash
composer require spatie/laravel-permission
```

Esta librerÃ­a provee:
- Modelos `Role` y `Permission`
- Tablas `roles`, `permissions`, `model_has_roles`, `model_has_permissions`, `role_has_permissions`
- Helpers: `$user->givePermissionTo('x')`, `$user->can('x')`
- Blade directives: `@can('x')`, `@role('admin')`

### 4.2 Frontend: extender catÃ¡logo
- `app/Data/PermisosCatalogo.php` (extender con permisos custom)
- `resources/js/permissions.ts` (extender)
- Mantener `useCan()` y `<Can>`

### 4.3 UI: panel de administraciÃ³n
- Reusar patrÃ³n de `Sprint 10` (Panel AdministraciÃ³n CatÃ¡logos)
- Tabla con checkbox por permiso

---

## 5. EstimaciÃ³n (referencia v2)

**3-5 dÃ­as** cuando se reactive. Incluye:
- Instalar y configurar `spatie/laravel-permission`
- Crear UI de administraciÃ³n de roles y permisos
- Refactor de `SesionUsuarioData` para cargar permisos efectivos
- Refactor de todos los chequeos de permisos (no deberÃ­a cambiar mucho, pero sÃ­ la fuente)
- AuditorÃ­a de cambios
- Testing

---

## 6. Â¿Por quÃ© se difiere a v2 y no se elimina?

- El cliente preguntÃ³, no pidiÃ³ eliminaciÃ³n. Solo pidiÃ³ anÃ¡lisis de complejidad.
- La complejidad existe, pero es manejable si en el futuro se requiere.
- Mientras los 3 roles fijos cubran el 95% de los casos, no hay urgencia.
- Si en algÃºn momento se necesita granularidad, Sprint 24 lo provee.

---

## 7. Diferencia con Sprint 7.5 y 15

| Sprint | Alcance |
|---|---|
| 7.5 | CatÃ¡logo de permisos hardcodeado, `useCan()` en frontend, sin UI de admin |
| 15 | Laravel Gates/Policies, 3 roles fijos con BD, middleware en rutas |
| 24 (v2) | Permisos granulares por usuario, panel de admin de roles/permisos, `spatie/laravel-permission` |

---

## 8. Decisiones del Sprint

| # | DecisiÃ³n | Alternativa descartada | Motivo |
|---|----------|------------------------|--------|
| 1 | Sprint 24 es diferido a v2 | Implementar en Fase 1 | Complejidad no justificada para 3 roles |
| 2 | 3 roles fijos en Fase 0/1 | Roles dinÃ¡micos | Mantener simplicidad |
| 3 | CatÃ¡logo de permisos hardcodeado (Sprint 7.5) | Permisos en BD desde ya | YAGNI, refactor en Sprint 16 |
| 4 | NO se hace panel de admin de permisos en Fase 1 | Hacerlo desde ya | YAGNI, Sprint 24 lo provee si se necesita |
| 5 | Si se reactiva, usar `spatie/laravel-permission` | Implementar propio | LibrerÃ­a probada, menos bugs |

---

## 9. Cierre

Sprint 24 estÃ¡ **diferido**. No hay actividad en Fase 0/1.

Cuando se reactive en v2:
1. Instalar `spatie/laravel-permission`
2. Crear UI de administraciÃ³n de roles
3. Crear UI de administraciÃ³n de permisos por usuario
4. Refactor de carga de permisos
5. AuditorÃ­a de cambios
6. Testing exhaustivo

Mientras tanto, Sprint 7.5 (catÃ¡logo + `useCan()`) y Sprint 16 (formal con BD) son suficientes.

---
*Documento creado: Julio 2026. Sprint 24 â€” Permisos Personalizados v2 (diferido).*

