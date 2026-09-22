# 06 — Estructura y Arquitectura del proyecto

> Guía de estudio para quien viene de **Django/Python** y conoce Laravel solo a nivel CRUD.
> Explica cómo está ordenado el repositorio, qué hace cada carpeta y cómo viaja una request real.
> Los identificadores de código quedan en inglés tal como están en el repo; el texto es español neutro.

## Cómo usar esta guía

| Documento | Qué responde |
|---|---|
| `01-Examinacion-Sistema.md` | Radiografía factual: qué existe y qué hace |
| `02-Tecnologias-Justificacion.md` | Por qué cada tecnología |
| `03-Preguntas-Respuestas.md` | Respuestas ensayadas |
| `04-Guion-Exposicion.md` | Guion de la exposición |
| `05-Matriz-Perfil-Transparencia.md` | Trazabilidad con el perfil |
| **`06` (este)** | Cómo está armado el código por dentro y por qué |

Ruta sugerida: leer este documento **después de 01** y **antes de 03**; cada ruta y archivo citado es evidencia que podés mostrar en la defensa.

## Quick path — recorrido de ~15 minutos

Seis paradas, en este orden:

| # | Parada | Archivo | Qué mirar |
|---|---|---|---|
| 1 | Rutas | `routes/web.php`, `routes/denuncias.php:39` | prefijos, `->can()` por ruta, sin RoleMiddleware |
| 2 | Arranque y middleware | `bootstrap/app.php:11-53` | orden de middleware y manejo del 403 |
| 3 | Controller | `app/Http/Controllers/Denuncia/AdmisionController.php:15-65` | validación, transacción, bitácora, redirect |
| 4 | Permisos | `app/Providers/AppServiceProvider.php:31-33` → `app/Services/PermisosEfectivos.php` | gates dinámicos desde el catálogo |
| 5 | Datos y dominio | `app/Models/Denuncia.php`, `app/Enums/EstadoDenuncia.php`, `app/Helpers/DiasHabiles.php` | relaciones, enums, plazos |
| 6 | Front | `app/Http/Middleware/HandleInertiaRequests.php:26-85`, `resources/js/Pages/Denuncias/Bandeja.tsx` | props compartidas → React |

## Django ↔ Laravel, traducción honesta

| Django/Python | Laravel/PHP | En este proyecto |
|---|---|---|
| `manage.py` | `artisan` | `php artisan migrate`, `php artisan test` |
| `settings.py` (+ `django-environ`) | `config/*.php` + `.env` | 12 archivos en `config/`; `.env` usa MySQL (`.env:22`) y `config/database.php` tiene default `sqlite` |
| `urls.py` con `include()` | `routes/*.php` con `require` | 8 archivos; `routes/web.php:54-60` incluye las parciales |
| `views.py` | Controllers (`app/Http/Controllers`) | 31 archivos (30 concretos + `Controller.php` abstracto) |
| Forms / serializers de DRF | Form Requests (`app/Http/Requests`) | 11 archivos; 8 cableados y 3 sin uso (ver tabla de detalles) |
| `models.py` + ORM | Eloquent (`app/Models`) | 25 modelos con relaciones, scopes y accessors |
| Migrations | Migrations | 41 en `database/migrations` |
| Fixtures / `factory_boy` | Seeders + Factories | 8 seeders, 2 factories (`User`, `Denuncia`) |
| Templates Django | Blade como shell | `resources/views/app.blade.php` (raíz de Inertia) y `reportes/pdf.blade.php` (PDF) |
| Front server-rendered | React + Inertia | `resources/js/`: 28 páginas `.tsx` y 139 componentes |
| `permission_required`, grupos | Gates + catálogo propio | 66 permisos en `app/Data/PermisosCatalogo.php` |
| Signals (`pre_save`, etc.) | Model events / hooks | `app/Traits/UppercaseText.php:9` (evento `saving`) |
| Selectors / services | `app/Queries` + `app/Services` | 9 Queries + 10 Services (el proyecto ya usa ese patrón) |
| `pytest` | PHPUnit | 23 archivos en `tests/`; SQLite `:memory:` (`phpunit.xml:26-27`) |
| `requirements.txt` / `pyproject.toml` | `composer.json` + `package.json` | Laravel 13 y PHP `^8.3` (`composer.json`) |

Aclaraciones que conviene tener presentes:

- **Laravel no tiene "apps" por dominio** como `INSTALLED_APPS` de Django. Todo cuelga del namespace `App\` y el dominio se separa por subcarpeta (`app/Http/Controllers/Denuncia/`, `app/Models/`). Los archivos parciales de `routes/` cumplen el rol de "módulos".
- **Inertia no tiene equivalente en Django.** No es un compilador ni un motor de templates: es un **protocolo**. En la primera visita la URL responde el shell HTML (`resources/views/app.blade.php`); en las siguientes, la misma URL responde un JSON con `{component, props}` y React reemplaza la página sin recargar. El "template" real es el componente `resources/js/Pages/...`.
- **No hay API REST**: no existe `routes/api.php`. El panel usa sesión + rutas web; las dos únicas rutas tipo API viven en `routes/cuenta.php:28-34`.

## El ciclo de una request: "admitir denuncia"

Flujo real, con archivos y líneas para reconstruirlo en la defensa:

| # | Paso | Evidencia |
|---|---|---|
| 1 | Front controller: autoload + arranque | `public/index.php:13-17` |
| 2 | Registro de rutas y middleware | `bootstrap/app.php:11-16` (web, commands, health `/up`) |
| 3 | Middleware web (el orden importa) | `bootstrap/app.php:20-23`: `HandleInertiaRequests` + preload de assets; `:29-35`: `SimularFecha` → `EnsureActive` → `ForzarCambioPassword` (comentarios en `:25-28`, `:31`, `:33`) |
| 4 | Match de ruta | `routes/web.php:49` (grupo `auth`) → `routes/denuncias.php:30` (`prefix denuncias.`) → `:39` `POST /{ticket}/admitir` con `->can('caso.admitir')` |
| 5 | Autorización | Gate definido en loop en `AppServiceProvider::boot()` (`app/Providers/AppServiceProvider.php:31-33`) → `PermisosEfectivos::puede()` (`app/Services/PermisosEfectivos.php`) = permisos del rol ∪ delegaciones vigentes |
| 6 | Si niega | `bootstrap/app.php:43-53`: 403 JSON `"NO TIENES PERMISO PARA ESA SECCIÓN."`, o redirect a dashboard con toast, o a login |
| 7 | Controller | `app/Http/Controllers/Denuncia/AdmisionController.php:15-65`: `$request->validate()` inline (`:17-20`), `firstOrFail` (`:22`), chequeo de estado (`:24`) |
| 8 | Escritura atómica | `DB::transaction` + `lockForUpdate` (`:30-31`): dos jefes no admiten el mismo caso (D24); update de estado (`:37-41`) + bitácora por relación (`:43-48`) |
| 9 | Carrera perdida | `CasoAuth::mensajeCarrera()` (`:54`) |
| 10 | Efecto lateral opcional | `AvisoCaso::borradorPara()` si viene `crear_aviso` (`:58-60`) |
| 11 | Respuesta | `redirect()->back()->with('success', ...)` (`:64`): flash en sesión |
| 12 | Re-render | El GET siguiente entra a `BandejaController::index` (`app/Http/Controllers/BandejaController.php:14-89`) → `Inertia::render('Denuncias/Bandeja', [...])` (`:68`) → `resources/js/Pages/Denuncias/Bandeja.tsx` |

Puntos finos que conviene saber:

- `admitir` **no usa Form Request**: valida inline. Es una inconsistencia real (ver deuda al final).
- La **bitácora** de este flujo se escribe por la relación `$d->bitacora()->create(...)`; `BitacoraService` (`app/Services/BitacoraService.php`) existe y se usa, por ejemplo, en catálogos.
- `BandejaController` **repite** el chequeo `Auth::user()->puede('menu.bandeja')` (`:16`) aunque la ruta ya tiene `->can(...)`: refuerzo con redirect y toast propios.
- No hay respuesta JSON manual: el contrato con React es la prop `component` + `props` de Inertia.

## Carpeta por carpeta

### Raíz

| Carpeta/archivo | Qué es | Equivalente Django | Evidencia |
|---|---|---|---|
| `app/` | Código de la aplicación (11 subcarpetas) | Los "apps" del proyecto | ver tabla siguiente |
| `bootstrap/` | Arranque estilo Laravel 11+: `app.php` + `providers.php` | `manage.py` + parte de `settings.py` | `bootstrap/providers.php:3-5` (solo `AppServiceProvider`) |
| `config/` | Configuración: 12 archivos | `settings.py` partido por tema | incluye `config/plantilla_feriados.php` (propio); no hay `inertia.php` |
| `database/` | Migraciones, seeders, factories | `migrations/` + fixtures | 41 + 8 + 2 |
| `public/` | Document root: `index.php`, `build/`, logos | WSGI + archivos estáticos | `public/index.php` |
| `resources/` | Vistas Blade shell + front React | `templates/` + `static/` | `resources/views/app.blade.php`, `resources/js/` |
| `routes/` | Definición de URLs (8 archivos) | `urls.py` | `web`, `auth`, `denuncias`, `reportes`, `admin`, `cuenta`, `dev`, `console` |
| `storage/` | Runtime: `app/`, `framework/`, `logs/` | `media/` + logs | `public/index.php:8` usa `storage/framework/maintenance.php` |
| `tests/` | Pruebas PHPUnit (23 archivos) | `tests/` con pytest | SQLite `:memory:` en `phpunit.xml:26-27` |
| `vendor/`, `node_modules/` | Dependencias instaladas | `site-packages/` | no se editan a mano |

Directorios no estándar presentes en la raíz: `odd/` (documentos de tarea), `transparencia-proy/` (documentación y ADRs), `.agents/` (skills de agentes), `lang/` (traducciones de Laravel). No forman parte del runtime.

### `app/` — las 11 subcarpetas

| Carpeta | Qué hace | Equivalente Django | Ejemplos reales |
|---|---|---|---|
| `Data/` | Catálogo de permisos y presets | Constantes en `settings` | `PermisosCatalogo.php` (317 líneas: `PERMISOS` con 66 claves, `ROLES`, `DELEGABLE`, `PAQUETES`) |
| `Enums/` | Enums string-backed del dominio | `TextChoices` | `EstadoDenuncia.php` (9 casos), `TipoDenuncia.php` (plazos 45/20), `EscenarioDenuncia.php` (3), `RolUsuario.php` (4) |
| `Exports/` | Exportación a Excel | `openpyxl` / `xlsxwriter` | `ReporteExcel.php` (maatwebsite/excel; columnas desde `ReporteController::COLUMNAS_EXCEL`; anonimiza denunciante, `:78-90`) |
| `Helpers/` | Utilidades sin estado | `utils.py` | `DiasHabiles.php` (181 líneas, umbrales 3/8, caché de feriados), `RollUpDependencias.php` (roll-up del árbol) |
| `Http/` | Capa web: controllers, middleware, requests | `views` + middleware + forms | ver desglose |
| `Models/` | Eloquent: relaciones, accessors, scopes | `models.py` | 25 modelos; `Denuncia.php`, `User.php`, `Bitacora.php` |
| `Providers/` | Registro de servicios y gates | `AppConfig.ready()` + inyección | `AppServiceProvider.php` (gates en loop, `Vite::prefetch(3)`) |
| `Queries/` | Clases de lectura (selectors) | Selectors / managers custom | 9: `Dashboard/{Kpi,Rendimiento,Resultados,Operativo,DashboardQueryBase}`, `Publicacion/{Muro,PublicacionAdmin}`, `Catalogo/CatalogoIndex`, `Usuario/UsuarioIndex` |
| `Services/` | Lógica de escritura y negocio | `services.py` | 10: `UsuarioAdminService`, `PermisosEfectivos`, `CasoAuth`, `AvisoCaso`, `BitacoraService`, `AlertasPlazo`, `CatalogoService`, `CatalogoConfigStore`, `PublicacionArchivoService`, `UsernameGenerator` |
| `Support/` | Reglas auxiliares | validators / forms | `CatalogoRules.php::rulesFor($tipo)` |
| `Traits/` | Comportamiento reutilizable de modelos | Mixin / signals | `UppercaseText.php` (hook `saving`; lo usan 22 modelos) |

Desglose de `app/Http/`:

| Subcarpeta | Cantidad | Ejemplos |
|---|---|---|
| `Controllers/` | 31 (30 concretos + abstract) | 9 en `Denuncia/` (`Admision`, `Cierre`, `Informe`, `Asignacion`, ...), 2 en `Auth/`, 19 sueltos (`BandejaController`, `DashboardController`, ...) |
| `Middleware/` | 4 | `HandleInertiaRequests` (props compartidas), `SimularFecha` (Time Machine), `EnsureActive` (mata sesión de desactivados), `ForzarCambioPassword` |
| `Requests/` | 11 | `UsuarioStoreRequest`, `PublicacionRequest`, `Auth/LoginRequest`; 3 de `Denuncia/` sin uso |

## Los 5 patrones del proyecto

### (a) Controller delgado + Form Request + Service/Query

La intención: el controller orquesta y el trabajo pesado vive afuera.

| Archivo | Líneas | Patrón |
|---|---|---|
| `DashboardController.php` | 116 | usa 4 Queries (`KpiQuery`, `OperativoQuery`, `ResultadosQuery`, `RendimientoQuery`) |
| `CatalogoController.php` | 38 | delega en `CatalogoService` + `CatalogoIndexQuery` |
| `UsuarioController.php` | 126 | 4 Form Requests + `UsuarioIndexQuery` + `UsuarioAdminService` |

Honestidad: **no es uniforme**. `BandejaController.php` (90 líneas) y `MisCasosController.php` (110) resuelven lectura directa con Eloquent (agrupan, cuentan, precargan relaciones), y `AdmisionController::admitir` valida inline. Son los candidatos naturales a refactor si querés contarlo como deuda consciente.

### (b) Permisos: catálogo → gates dinámicos → efectivos

1. **Catálogo único**: `app/Data/PermisosCatalogo.php` define 66 permisos (`PERMISOS`), los conjuntos por rol (`ROLES`), la whitelist delegable (`DELEGABLE`) y presets de UI (`PAQUETES`, por ejemplo `jefe_interino`).
2. **Gates dinámicos**: `AppServiceProvider::boot()` recorre el catálogo y define un Gate por permiso (`app/Providers/AppServiceProvider.php:31-33`). Agregar un permiso es una línea en el catálogo.
3. **Efectivos**: `PermisosEfectivos::puede()` combina los permisos del rol con las delegaciones temporales (18C); por eso **no hay RoleMiddleware**. Las rutas usan `->can('...')` (`routes/denuncias.php:39-40`).
4. **Permiso por caso**: `CasoAuth` (`app/Services/CasoAuth.php`, 119 líneas) decide sobre el caso concreto (unidad / supervisor / expediente) y expone `mensajeCarrera()` para el caso ya tomado por otro.

### (c) Dominio: enums sin casts + accessors de plazo

- Los 4 enums (`app/Enums/`) son `string`-backed y **no** se castean en los modelos (D27): se comparan por `->value` (ver `app/Models/User.php:95-110`). Ventaja: los valores viajan como strings a la base y al front sin sorpresas.
- `EstadoDenuncia` tiene 9 casos; `ARCHIVADA` es un **subestado** guardado en otra columna, no un estado principal (`app/Enums/EstadoDenuncia.php:17`).
- Los plazos no se repiten por modelo: `Denuncia` (`app/Models/Denuncia.php:100`), `SolicitudInformacion` (`:75`) y `Descargo` (`:78`) exponen accessors que llaman a `DiasHabiles::plazoInfo()` (`app/Helpers/DiasHabiles.php:137`) y `colorPlazo()` (`:171`). Umbrales únicos: rojo ≤ 3 días hábiles, amarillo ≤ 8 (D28).

### (d) Traits y hooks de modelo

`app/Traits/UppercaseText.php` aplica `Str::upper()` a los campos declarados en `$uppercaseFields` dentro del evento `saving`. Es el equivalente a un `pre_save` de Django, pero declarativo y reutilizable: lo usan 22 modelos. Regla práctica: si un modelo necesita normalizar texto, se agrega el trait y la lista de campos; no se duplica lógica en controllers.

### (e) Props compartidas de Inertia (y su costo)

`HandleInertiaRequests::share()` (`app/Http/Middleware/HandleInertiaRequests.php:26-85`) inyecta en **cada** request: usuario + permisos (`:42`), delegación activa (`:46`, `:87-99`), catálogos activos (`:55-58`), notificaciones con alertas derivadas (`:59-71`) y flags de entorno (`:77-81`). Por eso React nunca pide "quién soy" ni los catálogos: ya vienen en `props`. Es también el **hotspot** de consultas del proyecto; si algo se ralentiza, se mide acá primero.

## Cómo estudiar este repo

Ruta recomendada (de afuera hacia adentro), con el test que respalda cada tramo:

| Paso | Leer | Test asociado |
|---|---|---|
| 1 | `routes/web.php` y una parcial (`routes/denuncias.php`) | `tests/Feature/RolesAccesoTest.php` |
| 2 | `bootstrap/app.php` | `tests/Feature/TimeMachineTest.php` |
| 3 | `AdmisionController`, `CierreController`, `InformeController` | `tests/Feature/DenunciaFlowTest.php` |
| 4 | `app/Services/PermisosEfectivos.php`, `app/Services/CasoAuth.php`, `app/Data/PermisosCatalogo.php` | `tests/Feature/RolesAccesoTest.php`, `tests/Feature/DelegacionTest.php` |
| 5 | `app/Enums/` + `app/Helpers/DiasHabiles.php` | `tests/Feature/EnumsParidadTest.php`, `tests/Unit/DiasHabilesTest.php`, `tests/Feature/DashboardPlazosSqlTest.php` |
| 6 | `app/Queries/` + `DashboardController` | `tests/Feature/DashboardTest.php` |
| 7 | `HandleInertiaRequests` + una página React | `tests/Feature/CatalogoControllerTest.php` |

Regla de trabajo: **cambiás un archivo, leés el test que lo cubre**. La suite completa se registró en 191 pruebas / 1369 aserciones (22-sep-2026); para el estado actual, corré `php artisan test`.

## Detalles no estándar y por qué

| Detalle | Por qué conviene saberlo |
|---|---|
| **Laravel 13** y PHP `^8.3` (`composer.json`) | Es más nuevo que la mayoría de tutoriales; Laravel 11+ eliminó `app/Http/Kernel.php` |
| **No hay `app/Http/Kernel.php` ni `app/Console/Kernel.php`** | El middleware se registra en `bootstrap/app.php`; el **orden** es la configuración (comentarios en `:25-28`) |
| **No hay `routes/api.php`** | Todo es web con sesión; el contador y el stream de notificaciones viven en `routes/cuenta.php:28-34` |
| `trustProxies(at: '*')` (`bootstrap/app.php:18`) | Detrás de proxy/LAN de desarrollo; en producción conviene acotarlo |
| **Time Machine** solo local | `SimularFecha` (sesión `dev_sim_fecha`) + `routes/dev.php`; el controller corta con `abort_unless(app()->isLocal(), 404)` (`app/Http/Controllers/DevTiempoController.php:18`) |
| **Gates en loop** | Se registran desde el catálogo, no a mano: 66 definiciones equivalentes |
| `app/Queries/` no es de stock | Es un patrón de selectors propio; no lo vas a encontrar en la documentación oficial de Laravel |
| `DiasHabiles` **autoloaded por `composer.json`** (`autoload.files`) | Se usa como `DiasHabiles::...` sin `use` porque composer lo carga siempre; no es facade ni service provider |
| `HandleInertiaRequests::share()` consulta DB por request | Costo aceptado a cambio de props siempre listas; es el hotspot a medir |
| `config/plantilla_feriados.php` | Config propia: plantilla **de referencia** de feriados GAMEA (no inserta sola; guía la UI de catálogos) |
| Defaults de base distintos | `config/database.php` default `sqlite`; `.env` usa `mysql` (`.env:22`); los tests usan `sqlite :memory:` (`phpunit.xml:26-27`) |
| `vite.config.js` con alias `ziggy-js` y HMR LAN | Permite abrir el dev server desde otro dispositivo de la red (`:36-45`) |
| Tailwind escanea `resources/js/**/*.{ts,tsx}` | Las clases de React deben ser literales o no se generan (`tailwind.config.js:12`) |
| **3 Form Requests de `Denuncia/` sin cablear** | `StoreDenunciaRequest`, `GuardarCierreRequest` y `GuardarInformeRequest` existen, pero los controllers validan inline — deuda conocida |

## Mini-glosario

| Término | Qué es en este proyecto |
|---|---|
| **Inertia** | Protocolo de páginas: la misma URL devuelve HTML shell o JSON `{component, props}`; React pinta la página |
| **Gate** | Autorización nombrada (`can:caso.admitir`) registrada en loop desde el catálogo de permisos |
| **Policy** | Autorización por modelo; acá el rol equivalente es `CasoAuth` (permiso sobre un caso concreto) |
| **Middleware** | Capa que envuelve cada request: sesión, Inertia, fecha simulada, cuenta activa, password temporal |
| **Provider** | Punto de arranque de servicios (`AppServiceProvider`): gates y Vite |
| **Facade** | Acceso estático a servicios del framework (`DB::`, `Auth::`, `Gate::`); en Python se parece a un singleton a nivel de módulo |
| **Eloquent** | ORM: modelos, relaciones, accessors, scopes |
| **Migration / Seeder / Factory** | Esquema versionado / datos iniciales / datos de prueba |
| **Form Request** | Clase de validación autorizada; equivale a un form o serializer de DRF |
| **Query class** | Selector de lectura (`app/Queries`) |
| **SSE** | Server-Sent Events: `/notifications/stream` empuja notificaciones al navegador (`routes/cuenta.php:32-34`) |

## Tres frases listas para la defensa

1. "El backend es **Laravel 13** con **Inertia**: no hay API REST ni una template por página; el servidor devuelve `props` y React renderiza, con permisos y catálogos compartidos en cada request."
2. "La autorización se apoya en **un catálogo único de capacidades**; los gates se registran en un loop y `PermisosEfectivos` combina rol + **delegaciones temporales**, por eso no existe un RoleMiddleware."
3. "La lógica de escritura vive en **`app/Services`** y la lectura compleja en **`app/Queries`**; los controllers orquestan, transaccionan y responden `redirect` o `Inertia::render`, y las pruebas cubren el flujo completo."

## Cierre

- Índice y hechos: `01-Examinacion-Sistema.md`
- Tecnologías y por qué: `02-Tecnologias-Justificacion.md`
- Preguntas ensayadas: `03-Preguntas-Respuestas.md`
- Guion: `04-Guion-Exposicion.md`
- Matriz con el perfil: `05-Matriz-Perfil-Transparencia.md`

Convención de conteos: verificados sobre el repo el 22-sep-2026 (`git ls-files` / `Get-ChildItem`) y sobre el código citado. Si un número no cierra, gana el archivo: la ruta está en la fila.
