# Contexto General del Proyecto

## Proyecto
Sistema web para gestión de denuncias ciudadanas de corrupción
y negación de información para el GAMEA / UTLCC (El Alto, Bolivia).
Cumple con la Ley 974.

## Stack
Laravel 11 · Inertia.js v2 · React 18 · TypeScript ·
Tailwind v3 · shadcn/ui (New York) · Laragon (Windows local)

## Estado Actual (Julio 2026)

**Fase 0 (Maqueta Frontend)** — Cerrada ✅
**Sprint 0 al 9.1** (funcionalidades frontend + mock data) — Cerrados ✅
**Sprint 10 (Base de Datos Real)** — Cerrado ✅ (Julio 2026)

> Sprint 10 completó la migración del sistema de mocks en sesión a MySQL + Eloquent.
> Se crearon 22 migraciones, 18 modelos, 4 seeders, y se refactorizaron 11 controllers.
> Login ahora usa `username` (case-sensitive), auto-registro y reset deshabilitados.
> Categorías se comparten globalmente vía `HandleInertiaRequests` (fuente única de verdad).
> Tests con SQLite `:memory:`, aislados de la BD de desarrollo.

**Estado actual:** Corrección de bugs post-migración (Sprint 10). Muchos componentes frontend que funcionaban con mock data están siendo reconectados al backend real. Ver `Notas Sprint 10 - Cierre.md`.

Sprints pendientes: **11**, **12**, **13**, **14**, **15**, **16+**.
Ver `Sprints Pendientes - Contexto.md` para detalle de sprints pendientes (11–25).

## Roles (post sesión con cliente, Junio 2026)
- **Registrador** (antes "Recepcionista")
- **Jefe de Unidad**
- **Técnicos**

(Implementación formal de roles será en Sprint 16, ver `Esquema BD - Librerías.md`).

## Convenciones de lectura para IAs

> **REGLA CRÍTICA:** Antes de leer cualquier archivo, determina en qué sprint estás trabajando.

1. **Siempre al iniciar:** Lee este `AI-CONTEXT.md` completo (~100 líneas).
2. **Para ver roadmap completo:** Lee `Plan de Desarrollo.md` (alto nivel).
3. **Para trabajar en un sprint específico:**
   - **Sprint cerrado (0-10):** Lee `Sprint X - [Nombre].md` solo si es necesario detalle histórico.
   - **Sprint pendiente (11+):** Lee SOLO la sección correspondiente en `Sprints Pendientes - Contexto.md`. **No leas otras secciones** (lazy load).
4. **Para entender el sistema completo:** Lee `Proyecto - Resumen General del Sistema.md` solo si es necesario.
5. **NO LEER por defecto:**
   - `Proyecto - Prototipo y Estrategia de Diseño.md`
   - `Proyecto - Transparencia Stack y Conceptos.md`
   - `Proyecto - Vistas y Prototipo de Interface.md`
   - Documentos de sprints cerrados si no estás trabajando en ellos
6. **Bitácora de cambios recientes:** Si necesitas el detalle de lo que cambió en Sprint 10, lee `Notas Sprint 10 - Cierre.md`.

## Documentación Esencial (LEER SIEMPRE)
1. `transparencia-proy/AI-CONTEXT.md` (este archivo) — Snapshot del estado actual
2. `transparencia-proy/Plan de Desarrollo.md` — Hoja de ruta, sprints, decisiones
3. `transparencia-proy/Sprints Pendientes - Contexto.md` — Contexto de sprints pendientes 11-25 (lazy load)
4. `transparencia-proy/RESUMEN LEY 974.md` — Marco legal
5. `transparencia-proy/Notas Sprint 10 - Cierre.md` — Decisiones técnicas, bugs y estado de Sprint 10

## Documentación de Referencia (LEER SOLO SI NECESARIO)
> ⚠️ NO leer por defecto. Contienen detalles extensos que saturan la memoria de contexto.

- `transparencia-proy/Sprint 1 - Registro de Denuncia.md` al `Sprint 9.1 - Simplificación UI Archivos.md`
- `transparencia-proy/Proyecto - Resumen General del Sistema.md`
- `transparencia-proy/Proyecto - Prototipo y Estrategia de Diseño.md`
- `transparencia-proy/Proyecto - Transparencia Stack y Conceptos.md`
- `transparencia-proy/Proyecto - Vistas y Prototipo de Interfaz.md`
- `transparencia-proy/Preguntas para el cliente.md`

## Esquemas de Base de Datos (LEER SOLO SI NECESARIO)
> Organizados en 3 archivos para no abrumar. Implementados en Sprint 10.

- `transparencia-proy/Esquema BD - Negocio.md` — 22 tablas del dominio (denuncias, solicitudes, descargos, etc.)
- `transparencia-proy/Esquema BD - Catálogos.md` — 4 tablas pequeñas de referencia (categorías, unidades, feriados, config)
- `transparencia-proy/Esquema BD - Librerías.md` — 4-6 tablas generadas por paquetes (Breeze + Auditing)

## Convenciones Vigentes (Julio 2026)
- Colores institucionales: morado `#690bb2` + gold `#fecd2a` (CSS vars OKLCH)
- Font: Outfit (sans) + Fira Code (mono)
- Modo oscuro: clase `.dark` en `<html>`, persistido en localStorage
- **MAYÚSCULAS obligatorias en todos los textos libres** (convención institucional). Se aplica en backend vía trait `UppercaseText` (hook `saving` en modelos). Frontend usa `text-transform: uppercase`.
- **Frontend por permisos, no por roles.** Catálogo `useCan()/Can` (Sprint 7.5). Los roles formales (BD) llegan en Sprint 16.
- **Stack fijo:** MySQL (Laragon), Eloquent con cast JSON.
- **Login:** username case-sensitive, password case-sensitive. Sin auto-registro ni password reset (Jefe lo hará desde Panel Admin en Sprint 11).
- **Categorías:** fuente única de verdad = BD, compartidas globalmente vía `HandleInertiaRequests`.
- **Tests:** SQLite `:memory:` aislados de BD de desarrollo (`phpunit.xml` configurado).

## Arquitectura Clave (post Sprint 10)

### Backend (MySQL + Eloquent)
- `app/Models/` — 18 modelos Eloquent con relations, casts, UppercaseText
  - Catálogos: `CategoriaDenuncia`, `UnidadExterna`, `Feriado`, `ConfiguracionSistema`
  - Auth: `User` (extendido con username, rol, iniciales, color, activo, telefono, preferencias)
  - Negocio: `Denuncia` (SoftDeletes), `Denunciante`, `Denunciado`, `Prueba`, `DenunciaArchivo` (polimórfico), `EvaluacionTecnica`, `SolicitudInformacion`, `Descargo`, `Ampliacion` (polimórfico), `InformeFinal`, `Cierre`, `Bitacora`, `Notificacion`
- `app/Helpers/UppercaseText.php` — Trait que aplica `Str::upper()` en `saving` hook
- `app/Helpers/DiasHabiles.php` — Helper de días hábiles (Sprint 4+)
- `app/Data/PermisosCatalogo.php` — Catálogo de permisos (se mantiene, no depende de BD)
- **NO existe** `app/Data/DenunciaData.php`, `SolicitudData.php`, `DescargoData.php`, etc. (eliminados en Sprint 10)

### Controladores (11 refactorizados a Eloquent)
- `DenunciaController` — CRUD + flujo completo (admitir/rechazar/asignar/traspasar/reabrir/saltarFase/informe×3/cierre×3/ampliar/delegarEvaluacion/reasumir/conciliar/editar/eliminar)
- `SolicitudController` — CRUD solicitudes + ampliaciones polimórficas
- `DescargoController` — CRUD descargos + ampliaciones polimórficas
- `BandejaController` — Bandeja Jefe (solo lectura)
- `MisCasosController` — Mis Casos (técnico, solo lectura)
- `MiResumenController` — Contadores del técnico
- `ArchivosCasoController` — CRUD archivos (storage local privado)
- `NotificacionController` — CRUD notificaciones
- `EvaluacionController` — Devolver evaluación
- `ConsultaCasosController` — 7 filtros de búsqueda
- `SeguimientoController` — Público (token + ticket)

### Controladores eliminados
- `SelectorUsuarioController` (era demo multi-rol)
- `DemoNotificacionController` (era demo de notificaciones)

### Frontend
- `resources/js/Components/Layout/` — AppLayout, Header (sin SelectorUsuarioDemo), Sidebar (permisos por rol), CampanaNotificaciones, PanelNotificaciones, ItemNotificacion
- `resources/js/Components/Denuncias/` — ~35 componentes (Card, Sheet, Badges, Modales, formularios, etc.)
- `resources/js/Pages/` — Bandeja, MisCasos, MiResumen, RegistroDenuncia, ConsultarCasos, Evaluaciones, Notificaciones/Index, Perfil, Seguimiento/Buscar, Admin/Feriados, Reportes, Dashboard
- `resources/js/permissions.ts` + `resources/js/hooks/useCan.ts` + `resources/js/Components/Can.tsx`
- `resources/js/types/index.d.ts` — Tipos globales (User, PageProps con `categorias`)

### Seeders
- `CatalogoSeeder` — 12 categorías, 13 unidades, 15 feriados, 2 config
- `UserSeeder` — 5 usuarios (jefe, registrador, tecnico1/2/3, todas `demo123`)
- `DenunciaSeeder` — 12 denuncias demo (DEN-2026-0001 a 0012)
- `NotificacionSeeder` — 5 notificaciones demo

## Comandos
- `npm run dev` / `npm run build` — Vite
- `php artisan serve` — Laravel server
- `php artisan migrate:fresh --seed` — Reset DB + seed (BD de desarrollo)
- `php artisan test` — Tests aislados (SQLite :memory:)
- `php artisan cache:clear` — Limpia configuración (necesario después de cambios en modelos/middleware)

## Próximo Sprint

1. **Sprint 11** (era 10) — Panel Administración Catálogos + Subcategorías
2. **Sprint 12** (era 11) — Dashboard + KPIs + Reportes PDF/Excel
3. **Sprint 13** (era 12) — Tablero Público Cerrados
4. **Sprint 14** (era 13) — Tiempos entre Fases

**Estado inmediato:** Corrección de bugs post-migración Sprint 10. Muchos componentes frontend requieren reconexión al backend real (categorías, notificaciones, archivos, etc.).

Ver detalle completo en `Sprints Pendientes - Contexto.md`.

## Notas / Pendientes

> ⏸️ **TODO — Preguntar al cliente:** ¿La funcionalidad de "archivar casos" debe ser
> un subestado de `cerrada` (actual: `subestado: 'archivada'`) o un estado/proceso
> separado con flujo propio? Por el momento se mantiene como subestado sin afectar
> UX de la vista pública.

> ⏸️ **Otros pendientes con el cliente:**
> - C7: Destino del expediente al remitirse al Ministerio
> - C8: Reglas del plazo al reabrir una denuncia
> - Panel de administración de usuarios (Jefe crea/edita/resetea passwords) → Sprint 11

> ⏸️ **Funcionalidades diferidas a v2 (no implementar en Fase 1):**
> - Acompañamiento/Intervención → Sprint 23
> - Permisos personalizados por usuario (granulares) → Sprint 25
> - Migración de casos legacy → Sprint 24
