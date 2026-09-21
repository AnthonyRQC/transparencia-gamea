# 01 — Examinación del sistema (qué responder ante el tribunal)

Sistema de gestión de denuncias de la Unidad de Transparencia: registro, admisión, investigación e informe/cierre con plazos en días hábiles, permisos por rol y notificaciones. Este documento resume qué hace cada pieza y dónde verificarla en código.

## Quick path (ruta de examinación en 5 minutos)

1. Ciclo de denuncia: `app/Enums/EstadoDenuncia.php:7-17` + rutas `routes/denuncias.php:39-69`.
2. Plazos: `app/Helpers/DiasHabiles.php:59-74` + `app/Models/Denuncia.php:80-86,97`.
3. Permisos: `app/Data/PermisosCatalogo.php:7-86` + `app/Services/CasoAuth.php:23-80`.
4. Notificaciones: `app/Http/Controllers/NotificacionController.php:12,66,75,84` + `routes/cuenta.php:21-33`.
5. BD y seeders: 40 migraciones, 25 modelos, 8 seeders (ver §6).

## 1. Módulos y ciclo de denuncia

| Tema | Afirmación | Evidencia |
|------|------------|-----------|
| Estados | 9 casos: ingresada, evaluacion_tecnica, admitida, rechazada, asignada, investigacion, informe, cerrada + archivada (subestado) | EVIDENCIA `app/Enums/EstadoDenuncia.php:7-17` |
| Terminales | Solo rechazada y cerrada son terminales | EVIDENCIA `app/Enums/EstadoDenuncia.php:19-22` |
| Orden canónico | ingresada ↔ evaluacion_tecnica → admitida/rechazada → asignada → investigacion → informe → cerrada (→ subestado archivada) | EVIDENCIA enum + rutas abajo; CRITERIO el ↔ inicial es devolución para subsanar |
| Reapertura | rechazada/cerrada → ingresada | EVIDENCIA `app/Http/Controllers/ReaperturaController.php:23,36` |
| Rutas con `can:` | admitir (`caso.admitir` L39), rechazar (L40), iniciar (`caso.iniciar` L41), asignar L44, traspasar L45, reabrir L46, saltar-fase L49, informe/* L52-54, cierre/* L55-57, archivar (`caso.archivar` L58), delegar/reasumir L64-65, devolver L66, ampliar-plazo L69 | EVIDENCIA `routes/denuncias.php:39-69` |
| Controllers | 9 controllers Denuncia / 23 métodos: Admision 2, Ampliacion 1, Asignacion 3, Cierre 4, Delegacion 2, Denuncia 5, Informe 3, Investigacion 2, Reapertura 1 | EVIDENCIA conteo directorios `app/Http/Controllers/` |
| Guardas concurrencia | `lockForUpdate` en admisión y asignación; `puedeOperar` en investigación; conteo advisory en saltar-fase | EVIDENCIA `AdmisionController.php:24,33,78,86`; `AsignacionController.php:38,104`; `InvestigacionController.php:18,22,34`; saltar-fase `L65-66` |
| HALLAZGO archivar | Cierre archivar conmuta subestado, no el enum ARCHIVADA | EVIDENCIA `CierreController.php:178,182-186` — CONTRADICE `EstadoDenuncia.php:17`. TODO cliente: definir archivar físico vs lógico |

## 2. Plazos y días hábiles

| Tema | Afirmación | Evidencia |
|------|------------|-----------|
| Día 1 | Día 1 = mañana hábil siguiente a `$desde` (no cuenta hoy, Ley 2341) | EVIDENCIA `app/Helpers/DiasHabiles.php:12,59-74` |
| Skip | Omite sáb/dom y feriados | EVIDENCIA `DiasHabiles.php:47-48,67-71` |
| Cache feriados | Clave `feriados:fechas`, TTL 3600 s | EVIDENCIA `DiasHabiles.php:18-19,27,42` |
| Stub | `esFeriadoEnFinDeSemana` solo mira fin de semana, no BD | EVIDENCIA `DiasHabiles.php:54-57` |
| Plantilla | `config/plantilla_feriados.php` es guía manual, NO inserta (7 fijos + 4 móviles + 1 dptal + 1 mun) | EVIDENCIA config citado |
| Reglas caso | 5 d si ingresada/evaluacion_tecnica, si no 45/20 d + ampliaciones | EVIDENCIA `app/Models/Denuncia.php:80-86,97` |
| Otros plazos | Solicitudes y descargos usan el mismo helper | EVIDENCIA `SolicitudController.php:51,160,199`; `DescargoController.php:90,170` |
| Semáforo | `plazo_info`: rojo < 0, amarillo ≤ 5, verde resto | EVIDENCIA `SolicitudInformacion.php:75-90`; `Descargo.php:78-93`; `Denuncia.php:100-116` |

## 3. Permisos y delegaciones

| Tema | Afirmación | Evidencia |
|------|------------|-----------|
| Catálogo | 66 permisos | EVIDENCIA `app/Data/PermisosCatalogo.php:7-86` |
| Delegables | 28 delegables; excluye `usuario.*`, `menu.usuarios`, `admin.*` | EVIDENCIA `PermisosCatalogo.php:211-240,207-210` |
| Roles | registrador 13 (sin notif/caso.*), jefe 44, investigador 31, admin 17 con cero `caso.*` (admin NO opera casos) | EVIDENCIA `PermisosCatalogo.php:89-204` |
| Efectivos | Permiso efectivo = rol ∪ delegaciones activas | EVIDENCIA `PermisosEfectivos.php:23-46`; `Delegacion::activasPara L30` |
| CasoAuth | UNIDAD 14 / SUPERVISOR 9 / EXPEDIENTE 23; dueño = `investigador_id`; supervisor con override | EVIDENCIA `app/Services/CasoAuth.php:23-80,92-94,97-102` |
| Sesión | `EnsureActive` desactiva sesión de usuario dado de baja | EVIDENCIA `EnsureActive.php:16-28` |
| Rutas admin | index exige `menu.usuarios`; store/revocar exigen `usuario.editar` | EVIDENCIA `routes/admin.php:50-52` |

## 4. Notificaciones

| Tema | Afirmación | Evidencia |
|------|------------|-----------|
| Controller | 89 líneas: index, marcarLeida/Todas, count | EVIDENCIA `NotificacionController.php:12,66,75,84` |
| Rutas | index paginado 10, gates `menu.notificaciones`/`notificacion.ver`, SSE `/notifications/stream` | EVIDENCIA `routes/cuenta.php:21-33` |
| Modelo | 53 líneas | EVIDENCIA `app/Models/Notificacion.php:15-19,39-50` |
| Campana excluida | Registrador NO ve campana (sin `notificacion.ver`) | EVIDENCIA `Header.tsx:33,96-98`; `permissions.ts:72-86` |

## 5. Arquitectura backend + frontend

| Capa | Afirmación | Evidencia |
|------|------------|-----------|
| Controllers delgados | Dashboard 116 L, Catálogo 38 L; lógica en Queries/Services/Requests | EVIDENCIA `DashboardController`, `CatalogoController` |
| Queries (9) | Dashboard Base/Kpi/Operativo/Resultados/Rendimiento, CatalogoIndex, Publicacion Muro/Admin, UsuarioIndex | EVIDENCIA `app/Queries/` |
| Services (10) | CasoAuth, PermisosEfectivos, AlertasPlazo, AvisoCaso, Catalogo ConfigStore/Service, BitacoraService, UsuarioAdminService, UsernameGenerator, PublicacionArchivoService | EVIDENCIA `app/Services/` |
| Requests (11) | Denuncia Store/GuardarInforme/GuardarCierre, Usuario Store/Update/Masivo/Desactivar, Publicacion, ProfileUpdate, Dashboard, Auth/Login | EVIDENCIA `app/Http/Requests/` |
| Frontend | React 18.2, Inertia React 2.0, Tailwind 3.2.1, Vite 5, TS 5.0.2 | EVIDENCIA `package.json:10,21-25` |
| Inertia shared | `auth.user` con permisos = PermisosEfectivos; categorías por pluck | EVIDENCIA `HandleInertiaRequests.php:26-82` (permisos L42, categorías L55) |
| Entrada | `@routes` + `@vite`, `createInertiaApp`, progress `#4B0090` | EVIDENCIA `app.blade.php:16-18`; `app.tsx:4-16,24` |
| UI | 24 componentes shadcn en `ui/`, cero barrels (`export *`), `permissions.ts:1-67`, `useCan.ts:16`, `Can.tsx:11` | EVIDENCIA rutas citadas |

## 6. Base de datos

| Tema | Afirmación | Evidencia |
|------|------------|-----------|
| Migraciones | 40 ficheros; dominio ~13 (denuncias 165000 … notificaciones 185000 + delegaciones); catálogos ~10; librerías 4 | EVIDENCIA conteo `database/migrations/` |
| Modelos | 25 modelos | EVIDENCIA conteo `app/Models/` (PENDIENTE listar en anexo si el tribunal lo pide) |
| Seeders (8) | Database, Catalogo, CatalogosConfig, User, Denuncia, DenunciaMasiva, Publicacion, Notificacion | EVIDENCIA `database/seeders/` |
| Catálogos seed | categorías 12, clasificaciones 6, medios 4, tipos pub 7 / prioridades 3, feriados 2026 15, dependencias 122 filas planas | EVIDENCIA `CatalogoSeeder.php:38-51,60-66,76-80,196-212,221-343` |
| PENDIENTE dependencias | Reclamo "185 árbol" vs 122 filas planas contadas | PENDIENTE conteo DB por `parent_id` |
| Usuarios/denuncias | 13 users (1 jefe/1 registrador/10 investigador/1 admin); 12 demo DEN-2026-0001…0012; masiva ~112, total ~124, `siguiente_ticket` 125 | EVIDENCIA `UserSeeder.php:20-202`; `CatalogoSeeder.php:27-31,474` |
| Ticket | Formato `DEN-%04d-%04d`; `DEL-` solo lápida al eliminar/reciclar | EVIDENCIA `Denuncia.php:144,154`; `DenunciaController.php:239,152-165` |
| Trazas | SoftDeletes + `UppercaseText` (mayúsculas en boot `saving`) + seguimiento `DEN-AAAA-NNNN-TOKEN` | EVIDENCIA `Denuncia.php:14,20,53-56`; migración `165000:39`; `Trait UppercaseText:9-19`; `SeguimientoController.php:26,35` |

## Checklist de examinación

- [ ] Muestro enum y terminales sin dudar.
- [ ] Explico archivar-subestado como hallazgo honesto, no como error oculto.
- [ ] Justifico día 1 = mañana hábil con Ley 2341.
- [ ] Demuestro que admin NO opera casos.
- [ ] Reconozco PENDIENTES sin inventar cifras.

## Siguiente paso

Continuar con `02-Tecnologias-Justificacion.md` para el porqué de cada tecnología.
