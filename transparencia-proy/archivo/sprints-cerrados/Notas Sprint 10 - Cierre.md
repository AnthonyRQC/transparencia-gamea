> ⚠️ **Histórico — Sprint cerrado Jul 2026 (Laravel 11).** Snapshot al cierre, no refleja refactorización Bloques 0-2 (Sep 2026, Laravel 13). Para estado actual ver AI-CONTEXT.md y Notas Reestructuración - Bloques 0-2 (Sept 2026) - Cierre.md.
# Notas Sprint 10 â€” Cierre de Base de Datos Real

> **PropÃ³sito:** Documentar decisiones tÃ©cnicas, bugs encontrados y estado final de Sprint 10.
> Leer este archivo cuando se trabaje en bugs post-migraciÃ³n o se necesite contexto de la BD real.

---

## 1. Resumen Ejecutivo

Sprint 10 migrÃ³ el sistema de `app/Data/*` (mock en sesiÃ³n) a MySQL + Eloquent.

| MÃ©trica | Valor |
|---------|-------|
| Migraciones | 22 (5 default Laravel + 1 extend users + 4 catÃ¡logos + 12 negocio) |
| Modelos Eloquent | 18 (4 catÃ¡logos + 1 User extendido + 12 negocio + 1 polimÃ³rfico) |
| Seeders | 4 (CatÃ¡logos, Users, Denuncias, Notificaciones) |
| Controladores refactorizados | 11 |
| Controladores eliminados | 2 (SelectorUsuario, DemoNotificacion) |
| Archivos `app/Data/*` eliminados | 9 |
| Tests | 23 / 23 pasando (77 assertions) |
| Login | username case-sensitive, password case-sensitive |

---

## 2. Decisiones TÃ©cnicas (Ejecutadas)

| DecisiÃ³n | Valor ejecutado |
|----------|----------------|
| **Auth** | Breeze modificado in-place (no re-scaffold). Login con `username`, case-sensitive. |
| **Email** | Columna `nullable`, sin verificaciÃ³n (sin `MustVerifyEmail`). |
| **Auto-registro** | Deshabilitado (sin ruta `/register`). |
| **Password reset** | Deshabilitado. Jefe gestiona desde Panel Admin (Sprint 11). |
| **Storage archivos** | Disco `local` privado + download controller con `auth` middleware. |
| **Soft delete** | Solo `Denuncia` usa `SoftDeletes` trait. Resto usa `fecha_eliminacion` + scope `activos()`. |
| **Polimorfismo** | `morphTo()` en `Ampliacion` (entidad) y `DenunciaArchivo` (contexto). |
| **CategorÃ­as** | Compartidas globalmente vÃ­a `HandleInertiaRequests::share()`. Fuente Ãºnica de verdad: BD. |
| **Tests** | SQLite `:memory:`, aislados de BD de desarrollo vÃ­a `phpunit.xml`. |
| **Form Requests** | `LoginRequest` (username case-sensitive). `ProfileUpdateRequest` (name + telefono). |
| **MAYÃšSCULAS** | Trait `UppercaseText` con hook `saving`. Se aplica a todos los modelos con textos libres. |

---

## 3. Bugs Encontrados y Corregidos

| # | Bug | Causa | Fix |
|---|-----|-------|-----|
| 1 | Login case-insensitive (usuario confundido por CSS `uppercase`) | Se aplicÃ³ `Str::lower()` en LoginRequest para normalizar | Revertido: ahora case-sensitive. Se quitÃ³ `uppercase` del input de Login. |
| 2 | Pantalla en blanco en `/denuncias/registrar` al seleccionar tipo | Backend enviaba array de modelos CategoriaDenuncia, frontend esperaba `Record<string, string>` | `get()` â†’ `pluck('nombre', 'clave')` en DenunciaController@create |
| 3 | `SQLSTATE 1366: Incorrect integer value: 'cohecho' for column 'categoria_id'` | Frontend enviaba clave (string), BD esperaba integer | Agregada validaciÃ³n `exists:categorias_denuncia,clave` + lookup `claveâ†’id` en store y editar |
| 4 | Pantalla en blanco en `/notificaciones` | Frontend esperaba `{items, page, total_pages}` pero Laravel paginator devuelve `{data, current_page, last_page}` | Paginador formateado en controlador + respuesta limpia en Inertia |
| 5 | `ExampleTest` fallaba por tabla `categorias_denuncia` inexistente en SQLite | Middleware de categorÃ­as globales se ejecutaba antes de migraciones en tests sin `RefreshDatabase` | Agregado `use RefreshDatabase` a ExampleTest |
| 6 | Badges de Plazo (dÃ­as restantes) no aparecÃ­an | Mocks fueron removidos y no existÃ­a cÃ¡lculo dinÃ¡mico en modelo | Creado `$appends = ['plazo']` y `getPlazoAttribute()` en `Denuncia.php` con dÃ­as hÃ¡biles y colores |
| 7 | Exceso de ampliaciÃ³n de plazos permitÃ­a > 90 dÃ­as | No se validaba la suma acumulada contra el techo legal | Frontend y Backend limitan a mÃ¡x. 90d totales en CorrupciÃ³n (+45d mÃ¡x) y 30d totales en NegaciÃ³n (+10d mÃ¡x) |
| 8 | Error de Ziggy `notificaciones.demo.toggle` y filtro `leida` fallaba en `0` | Ruta demo eliminada; PHP interpretaba `'0'` como falsy en `if ($leida)` | Eliminado Modo Demo completo; corregido filtro con `$request->has('leida') && $request->input('leida') !== ''` |
| 9 | EdiciÃ³n de denuncia no cargaba categorÃ­a/fecha/hora y no guardaba fecha en BD | Objeto frontend buscaba `detalles.categoria` inexistente; backend omitÃ­a `fecha_hechos`/`hora_hechos` | `ModalEditarDenuncia` extrae directo de modelo; backend actualiza campos en BD y registra en bitÃ¡cora |
| 10 | Error SQL `1062` al crear denuncia luego de eliminar la anterior | SoftDelete retenÃ­a la clave `DEN-2026-XXXX` en BD y chocaba con el Ã­ndice `UNIQUE` | Muta ticket a `DEL-2026-XXXX` al eliminar + recicla correlativo si era el Ãºltimo ticket expedido |
| 11 | Panel lateral `DenunciaSheet` no se cerraba tras eliminar denuncia | Falta de reseteo del estado `selectedDenuncia` tras eliminaciÃ³n | Invocado `setSelectedDenuncia(null)` y `router.reload()` |
| 12 | BotÃ³n Eliminar presente para Registrador | La regla de negocio indica que solo el Jefe puede eliminar casos | Retirado botÃ³n Eliminar en `ConsultarCasos.tsx` (Registrador solo puede Editar denuncias `ingresadas`) |

---

## 4. Estado de Bugs Post-MigraciÃ³n

Todos los bugs de reconexiÃ³n post-migraciÃ³n reportados han sido corregidos con Ã©xito. **24 / 24 tests automatizados pasados en PHPUnit (80 assertions).**

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

## 6. Archivos Eliminados (Fase 0 â†’ Fase 1)

### app/Data/* (9 archivos)
- `DenunciaData.php`
- `SolicitudData.php`
- `DescargoData.php`
- `EvaluacionData.php`
- `ArchivoData.php`
- `NotificacionData.php`
- `SesionUsuarioData.php`
- `UnidadData.php`
- `PermisosCatalogo.php` (ðŸŸ¡ **MANTENIDO** â€” no depende de BD, es catÃ¡logo de referencia)

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

## 7. RelaciÃ³n de Tablas Creadas (22 migraciones)

| Orden | Tabla | Tipo |
|-------|-------|------|
| 1 | `users` | Default Laravel |
| 2 | `cache` | Default Laravel |
| 3 | `jobs` | Default Laravel |
| 4 | `personal_access_tokens` | Sanctum |
| 5 | `users` (extend) | MigraciÃ³n adicional (username, rol, iniciales, color, activo, telefono, preferencias) |
| 6 | `categorias_denuncia` | CatÃ¡logo |
| 7 | `unidades_externas` | CatÃ¡logo |
| 8 | `feriados` | CatÃ¡logo |
| 9 | `configuracion_sistema` | CatÃ¡logo |
| 10 | `denuncias` | Negocio (SoftDeletes) |
| 11 | `denunciantes` | Negocio |
| 12 | `denunciados` | Negocio |
| 13 | `pruebas` | Negocio |
| 14 | `evaluaciones_tecnicas` | Negocio |
| 15 | `solicitudes_informacion` | Negocio |
| 16 | `descargos` | Negocio |
| 17 | `ampliaciones` | PolimÃ³rfica (morphs) |
| 18 | `informes_finales` | Negocio |
| 19 | `cierres` | Negocio |
| 20 | `denuncias_archivos` | PolimÃ³rfica (nullableMorphs) |
| 21 | `bitacora` | Negocio |
| 22 | `notificaciones` | Negocio |

---

## 8. Usuarios Demo

| Username | Rol | Password | Ve |
|----------|-----|----------|----|
| `jefe` | Jefe | `demo123` | Bandeja, Reportes, Admin/Feriados |
| `registrador` | Registrador | `demo123` | Registrar denuncia, Consultar casos |
| `tecnico1` | TÃ©cnico 1 (Carlos Quispe) | `demo123` | Mis Casos, Mi Resumen |
| `tecnico2` | TÃ©cnico 2 (Ana Torres) | `demo123` | Mis Casos, Mi Resumen |
| `tecnico3` | TÃ©cnico 3 (Luis Mamani) | `demo123` | Mis Casos, Mi Resumen |

---

## 9. Conexiones de Prueba MySQL

```
Host: 127.0.0.1:3306
DB: transparencia
User: root
Pass: (vacÃ­o)
Charset: utf8mb4
```

