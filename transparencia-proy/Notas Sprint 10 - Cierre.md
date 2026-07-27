# Notas Sprint 10 — Cierre de Base de Datos Real

> **Propósito:** Documentar decisiones técnicas, bugs encontrados y estado final de Sprint 10.
> Leer este archivo cuando se trabaje en bugs post-migración o se necesite contexto de la BD real.

---

## 1. Resumen Ejecutivo

Sprint 10 migró el sistema de `app/Data/*` (mock en sesión) a MySQL + Eloquent.

| Métrica | Valor |
|---------|-------|
| Migraciones | 22 (5 default Laravel + 1 extend users + 4 catálogos + 12 negocio) |
| Modelos Eloquent | 18 (4 catálogos + 1 User extendido + 12 negocio + 1 polimórfico) |
| Seeders | 4 (Catálogos, Users, Denuncias, Notificaciones) |
| Controladores refactorizados | 11 |
| Controladores eliminados | 2 (SelectorUsuario, DemoNotificacion) |
| Archivos `app/Data/*` eliminados | 9 |
| Tests | 23 / 23 pasando (77 assertions) |
| Login | username case-sensitive, password case-sensitive |

---

## 2. Decisiones Técnicas (Ejecutadas)

| Decisión | Valor ejecutado |
|----------|----------------|
| **Auth** | Breeze modificado in-place (no re-scaffold). Login con `username`, case-sensitive. |
| **Email** | Columna `nullable`, sin verificación (sin `MustVerifyEmail`). |
| **Auto-registro** | Deshabilitado (sin ruta `/register`). |
| **Password reset** | Deshabilitado. Jefe gestiona desde Panel Admin (Sprint 11). |
| **Storage archivos** | Disco `local` privado + download controller con `auth` middleware. |
| **Soft delete** | Solo `Denuncia` usa `SoftDeletes` trait. Resto usa `fecha_eliminacion` + scope `activos()`. |
| **Polimorfismo** | `morphTo()` en `Ampliacion` (entidad) y `DenunciaArchivo` (contexto). |
| **Categorías** | Compartidas globalmente vía `HandleInertiaRequests::share()`. Fuente única de verdad: BD. |
| **Tests** | SQLite `:memory:`, aislados de BD de desarrollo vía `phpunit.xml`. |
| **Form Requests** | `LoginRequest` (username case-sensitive). `ProfileUpdateRequest` (name + telefono). |
| **MAYÚSCULAS** | Trait `UppercaseText` con hook `saving`. Se aplica a todos los modelos con textos libres. |

---

## 3. Bugs Encontrados y Corregidos

| # | Bug | Causa | Fix |
|---|-----|-------|-----|
| 1 | Login case-insensitive (usuario confundido por CSS `uppercase`) | Se aplicó `Str::lower()` en LoginRequest para normalizar | Revertido: ahora case-sensitive. Se quitó `uppercase` del input de Login. |
| 2 | Pantalla en blanco en `/denuncias/registrar` al seleccionar tipo | Backend enviaba array de modelos CategoriaDenuncia, frontend esperaba `Record<string, string>` | `get()` → `pluck('nombre', 'clave')` en DenunciaController@create |
| 3 | `SQLSTATE 1366: Incorrect integer value: 'cohecho' for column 'categoria_id'` | Frontend enviaba clave (string), BD esperaba integer | Agregada validación `exists:categorias_denuncia,clave` + lookup `clave→id` en store y editar |
| 4 | Pantalla en blanco en `/notificaciones` | Frontend esperaba `{items, page, total_pages}` pero Laravel paginator devuelve `{data, current_page, last_page}` | Paginador formateado en controlador + respuesta limpia en Inertia |
| 5 | `ExampleTest` fallaba por tabla `categorias_denuncia` inexistente en SQLite | Middleware de categorías globales se ejecutaba antes de migraciones en tests sin `RefreshDatabase` | Agregado `use RefreshDatabase` a ExampleTest |
| 6 | Badges de Plazo (días restantes) no aparecían | Mocks fueron removidos y no existía cálculo dinámico en modelo | Creado `$appends = ['plazo']` y `getPlazoAttribute()` en `Denuncia.php` con días hábiles y colores |
| 7 | Exceso de ampliación de plazos permitía > 90 días | No se validaba la suma acumulada contra el techo legal | Frontend y Backend limitan a máx. 90d totales en Corrupción (+45d máx) y 30d totales en Negación (+10d máx) |
| 8 | Error de Ziggy `notificaciones.demo.toggle` y filtro `leida` fallaba en `0` | Ruta demo eliminada; PHP interpretaba `'0'` como falsy en `if ($leida)` | Eliminado Modo Demo completo; corregido filtro con `$request->has('leida') && $request->input('leida') !== ''` |
| 9 | Edición de denuncia no cargaba categoría/fecha/hora y no guardaba fecha en BD | Objeto frontend buscaba `detalles.categoria` inexistente; backend omitía `fecha_hechos`/`hora_hechos` | `ModalEditarDenuncia` extrae directo de modelo; backend actualiza campos en BD y registra en bitácora |
| 10 | Error SQL `1062` al crear denuncia luego de eliminar la anterior | SoftDelete retenía la clave `DEN-2026-XXXX` en BD y chocaba con el índice `UNIQUE` | Muta ticket a `DEL-2026-XXXX` al eliminar + recicla correlativo si era el último ticket expedido |
| 11 | Panel lateral `DenunciaSheet` no se cerraba tras eliminar denuncia | Falta de reseteo del estado `selectedDenuncia` tras eliminación | Invocado `setSelectedDenuncia(null)` y `router.reload()` |
| 12 | Botón Eliminar presente para Registrador | La regla de negocio indica que solo el Jefe puede eliminar casos | Retirado botón Eliminar en `ConsultarCasos.tsx` (Registrador solo puede Editar denuncias `ingresadas`) |

---

## 4. Estado de Bugs Post-Migración

Todos los bugs de reconexión post-migración reportados han sido corregidos con éxito. **24 / 24 tests automatizados pasados en PHPUnit (80 assertions).**

---

## 5. Arquitectura Final de Middleware (HandleInertiaRequests)

```php
// app/Http/Middleware/HandleInertiaRequests.php (share)
[
    'auth' => [
        'user' => [
            'id' => $user->id,
            'name' => $user->name,
            'username' => $user->username,
            'rol' => $user->rol,
            'iniciales' => $user->iniciales,
            'color' => $user->color,
            'preferencias' => $user->preferencias,
            'permisos' => PermisosCatalogo::permisosPorRol($user->rol),
        ],
    ],
    'categorias' => CategoriaDenuncia::where('activa', true)->pluck('nombre', 'clave')->toArray(),
    'notificaciones' => [
        'no_leidas' => Notificacion::where('usuario_id', $user->id)->where('leida', false)->count(),
        'recientes' => Notificacion::where('usuario_id', $user->id)->latest()->take(5)->get(),
    ],
    'logo_url' => asset('LOGO-OFICIAL-EL-ALTO.png'),
    'jacha_url' => asset('jacha.jpg'),
]
```

---

## 6. Archivos Eliminados (Fase 0 → Fase 1)

### app/Data/* (9 archivos)
- `DenunciaData.php`
- `SolicitudData.php`
- `DescargoData.php`
- `EvaluacionData.php`
- `ArchivoData.php`
- `NotificacionData.php`
- `SesionUsuarioData.php`
- `UnidadData.php`
- `PermisosCatalogo.php` (🟡 **MANTENIDO** — no depende de BD, es catálogo de referencia)

### Controladores (2)
- `SelectorUsuarioController.php`
- `DemoNotificacionController.php`

### Rutas (4)
- `POST /cambiar-usuario`
- `POST /notificaciones/demo/toggle`
- `POST /notificaciones/demo/simular`
- `POST /notificaciones/demo/reset`

### Frontend (1)
- `resources/js/Components/Layout/SelectorUsuarioDemo.tsx`

---

## 7. Relación de Tablas Creadas (22 migraciones)

| Orden | Tabla | Tipo |
|-------|-------|------|
| 1 | `users` | Default Laravel |
| 2 | `cache` | Default Laravel |
| 3 | `jobs` | Default Laravel |
| 4 | `personal_access_tokens` | Sanctum |
| 5 | `users` (extend) | Migración adicional (username, rol, iniciales, color, activo, telefono, preferencias) |
| 6 | `categorias_denuncia` | Catálogo |
| 7 | `unidades_externas` | Catálogo |
| 8 | `feriados` | Catálogo |
| 9 | `configuracion_sistema` | Catálogo |
| 10 | `denuncias` | Negocio (SoftDeletes) |
| 11 | `denunciantes` | Negocio |
| 12 | `denunciados` | Negocio |
| 13 | `pruebas` | Negocio |
| 14 | `evaluaciones_tecnicas` | Negocio |
| 15 | `solicitudes_informacion` | Negocio |
| 16 | `descargos` | Negocio |
| 17 | `ampliaciones` | Polimórfica (morphs) |
| 18 | `informes_finales` | Negocio |
| 19 | `cierres` | Negocio |
| 20 | `denuncias_archivos` | Polimórfica (nullableMorphs) |
| 21 | `bitacora` | Negocio |
| 22 | `notificaciones` | Negocio |

---

## 8. Usuarios Demo

| Username | Rol | Password | Ve |
|----------|-----|----------|----|
| `jefe` | Jefe | `demo123` | Bandeja, Reportes, Admin/Feriados |
| `registrador` | Registrador | `demo123` | Registrar denuncia, Consultar casos |
| `tecnico1` | Técnico 1 (Carlos Quispe) | `demo123` | Mis Casos, Mi Resumen |
| `tecnico2` | Técnico 2 (Ana Torres) | `demo123` | Mis Casos, Mi Resumen |
| `tecnico3` | Técnico 3 (Luis Mamani) | `demo123` | Mis Casos, Mi Resumen |

---

## 9. Conexiones de Prueba MySQL

```
Host: 127.0.0.1:3306
DB: transparencia
User: root
Pass: (vacío)
Charset: utf8mb4
```
