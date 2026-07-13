# Contexto General del Proyecto

## Proyecto
Sistema web para gestión de denuncias ciudadanas de corrupción
y negación de información para el GAMEA / UTLCC (El Alto, Bolivia).
Cumple con la Ley 974.

## Stack
Laravel 11 · Inertia.js v2 · React 18 · TypeScript ·
Tailwind v3 · shadcn/ui (New York) · Laragon (Windows local)

## Estado Actual
**Fase 0 (Maqueta Frontend)** — Cerrada ✅
**Sprint 0** (Sidebar/Header institucional) — Cerrado ✅
**Sprint 1** (Registro de Denuncia, formulario complejo) — Cerrado ✅
**Sprint 2** (Bandeja de Admisión + Mis Casos + Mi Resumen) — Cerrado ✅
**Sprint 3** (Asignación de Técnico + Traspaso + Reapertura + Mejoras Detalle) — Cerrado ✅
**Sprint 4** (Investigación: Solicitudes + Descargos + Saltar Fase + Mejoras) — Cerrado ✅
**Sprint 5** (Informe Final + Cierre) — Cerrado ✅
**Sprint 6** (Seguimiento Público) — Cerrado ✅ (Junio 2026)
**Sprint 6.5** (Simulación Multi-Rol para Demo) — Cerrado ✅ (Julio 2026)
**Sprint 8** (Ampliaciones Múltiples) — Cerrado ✅ (Julio 2026)
**Sprint 9** (Notificaciones Push + Historial) — Cerrado ✅ (Julio 2026)

Ver `Sprints Pendientes - Contexto.md` para sprints 7, 10-19.

## Roles (post sesión con cliente, Junio 2026)
- **Registrador** (antes "Recepcionista")
- **Jefe de Unidad**
- **Técnicos**

(Implementación formal de roles será en Sprint 15, una vez la BD esté operativa).

## Convenciones de lectura para IAs

> **REGLA CRÍTICA:** Antes de leer cualquier archivo, determina en qué sprint estás trabajando.

1. **Siempre al iniciar:** Lee este `AI-CONTEXT.md` completo (~100 líneas).
2. **Para ver roadmap completo:** Lee `Plan de Desarrollo.md` (alto nivel).
3. **Para trabajar en un sprint específico:**
   - **Sprint cerrado (0-6):** Lee `Sprint X - [Nombre].md` solo si es necesario detalle histórico.
   - **Sprint pendiente (7, 10-19):** Lee SOLO la sección correspondiente en `Sprints Pendientes - Contexto.md`. **No leas otras secciones** (lazy load).
4. **Para entender el sistema completo:** Lee `Proyecto - Resumen General del Sistema.md` solo si es necesario.
5. **NO LEER por defecto:**
   - `Proyecto - Prototipo y Estrategia de Diseño.md`
   - `Proyecto - Transparencia Stack y Conceptos.md`
   - `Proyecto - Vistas y Prototipo de Interfaz.md`
   - Documentos de sprints cerrados si no estás trabajando en ellos

## Documentación Esencial (LEER SIEMPRE)
1. `transparencia-proy/AI-CONTEXT.md` (este archivo) — Snapshot del estado actual
2. `transparencia-proy/Plan de Desarrollo.md` — Hoja de ruta, sprints, decisiones
3. `transparencia-proy/Sprints Pendientes - Contexto.md` — Contexto de sprints 7-19 (lazy load)
4. `transparencia-proy/RESUMEN LEY 974.md` — Marco legal

## Documentación de Referencia (LEER SOLO SI NECESARIO)
> ⚠️ NO leer por defecto. Contienen detalles extensos que saturan la memoria de contexto.

- `transparencia-proy/Sprint 1 - Registro de Denuncia.md` — Detalle Sprint 1
- `transparencia-proy/Sprint 2 - Bandeja de Admisión y Mis Casos.md` — Detalle Sprint 2
- `transparencia-proy/Sprint 3 - Asignación, Traspaso y Reapertura.md` — Detalle Sprint 3
- `transparencia-proy/Sprint 4 - Investigación (Solicitudes + Descargos).md` — Detalle Sprint 4
- `transparencia-proy/Sprint 5 - Informe Final y Cierre.md` — Detalle Sprint 5
- `transparencia-proy/Sprint 6 - Seguimiento Público.md` — Detalle Sprint 6
- `transparencia-proy/Sprint 7 - Evaluación Técnica Previa.md` — Detalle Sprint 7 (próximo)
- `transparencia-proy/Proyecto - Resumen General del Sistema.md` — Overview funcional completo
- `transparencia-proy/Proyecto - Prototipo y Estrategia de Diseño.md` — Decisiones de diseño
- `transparencia-proy/Proyecto - Transparencia Stack y Conceptos.md` — Conceptos del stack
- `transparencia-proy/Proyecto - Vistas y Prototipo de Interfaz.md` — Prototipos de vistas
- `transparencia-proy/Preguntas para el cliente.md` — Estado de preguntas pendientes

## Convenciones Vigentes
- Colores institucionales: morado `#690bb2` + gold `#fecd2a` (CSS vars OKLCH)
- Font: Outfit (sans) + Fira Code (mono)
- Modo oscuro: clase `.dark` en `<html>`, persistido en localStorage
- Sin roles en código (Fase 0/Fase 1 mock) — se implementarán formalmente en Sprint 15
- Rutas via Ziggy `route()`
- Subdirectorio URL: `/transparencia/public/`

## Decisiones clave recientes (Junio 2026)
- **Recepcionista → Registrador** (cambio de nombre en toda la documentación)
- **SITPRECO solo en informe final** (opcional — código del sistema nacional de Bolivia)
- **Múltiples ampliaciones permitidas** (no solo una)
- **Traspaso incluye historial completo** del técnico anterior (nada privado)
- **Reaperturas sin límite** (manejo manual)
- **Permitir registro fuera de plazo** con marca visible de mora
- **Mensajes genéricos en seguimiento público** (no mostrar nombres de unidades externas)
- **Reserva de identidad:** visible para todos con acceso al caso
- **Subcategorías por tipo de denuncia** (definidas en panel administrativo)
- **Notificaciones push vía campana** con historial tipo Facebook
- **Reportes:** PDF + Excel + pantalla, con rango de fechas libre
- **Reportes internos solo para Jefe** (no público)

## Notas / Pendientes

> ⏸️ **TODO — Preguntar al cliente:** ¿La funcionalidad de "archivar casos" debe ser
> un subestado de `cerrada` (actual: `subestado: 'archivada'`) o un estado/proceso
> separado con flujo propio? Por el momento se mantiene como subestado sin afectar
> UX de la vista pública.

> ⏸️ **Otros pendientes con el cliente:**
> - C1: Días hábiles vs calendario (Sprint 18)
> - C7: Destino del expediente al remitirse al Ministerio
> - C8: Reglas del plazo al reabrir una denuncia

## Arquitectura Clave
- `app/Data/DenunciaData.php` — Mock data estática (sesión, no DB)
- `app/Data/SolicitudData.php` — Solicitudes a unidades externas (Sprint 4)
- `app/Data/DescargoData.php` — Descargos de denunciados (Sprint 4)
- `app/Data/UnidadData.php` — Catálogo de unidades externas (Sprint 4)
- `app/Data/SesionUsuarioData.php` — 5 usuarios mock con roles (Sprint 6.5)
- `app/Data/NotificacionData.php` — Notificaciones generadas por derivación (Sprint 9)
- `app/Http/Controllers/DenunciaController.php` — Create + Store + admitir/rechazar/iniciar + saltarFase + aprobarAmpliacion
- `app/Http/Controllers/SolicitudController.php` — CRUD Solicitudes (Sprint 4)
- `app/Http/Controllers/DescargoController.php` — CRUD Descargos (Sprint 4)
- `app/Http/Controllers/BandejaController.php` — Bandeja de Admisión (Jefe, envia solicitudes/descargos read-only)
- `app/Http/Controllers/MisCasosController.php` — Mis Casos (Técnico, filtrado por técnico + solicitudes/descargos con acciones)
- `app/Http/Controllers/SeguimientoController.php` — Búsqueda pública por ticket (Sprint 6)
- `app/Http/Controllers/SelectorUsuarioController.php` — Cambio de usuario demo (Sprint 6.5)
- `app/Http/Controllers/NotificacionController.php` — CRUD notificaciones + paginación (Sprint 9)
- `app/Http/Controllers/DemoNotificacionController.php` — Simulaciones demo de notificaciones (Sprint 9)
- `resources/js/Components/Layout/AppLayout.tsx` — Layout root
- `resources/js/Components/Layout/SelectorUsuarioDemo.tsx` — Dropdown de simulación de usuario (Sprint 6.5)
- `resources/js/Components/Layout/CampanaNotificaciones.tsx` — Campana con badge + Popover (Sprint 9)
- `resources/js/Components/Layout/PanelNotificaciones.tsx` — Panel dropdown scrolleable (Sprint 9)
- `resources/js/Components/Layout/ItemNotificacion.tsx` — Item individual con icono, timestamp, color (Sprint 9)
- `resources/js/Components/Denuncias/` — Componentes de denuncias (Card, Sheet, Badges, Modales, AsignacionModal, TraspasoModal, ReabrirModal, TecnicoCargaCard, TabSolicitudes, TabDescargos, SolicitudCard, DescargoCard, PlazoProgress, ArchivoAdjunto, SaltarFaseButton, modales solicitud/descargo, SolicitudDetailModal, DescargoDetailModal, ModalCancelarSolicitud, ModalNuevoDescargo, ModalConfirmarEliminar, ClasificacionBadge, FormInformeFinal, FormCierre, TabInformeCierre, InformeDetailModal, ModalAmpliacionPlazo)
- `resources/js/Pages/Denuncias/RegistroDenuncia.tsx` — Formulario de registro
- `resources/js/Pages/Denuncias/Bandeja.tsx` — Bandeja del Jefe (5 tabs: Por admitir, Por asignar, En curso, Historial, Visión general)
- `resources/js/Pages/Denuncias/MisCasos.tsx` — Mis Casos del Técnico (4 tabs)
- `resources/js/Pages/Denuncias/MiResumen.tsx` — Resumen del Técnico (4 cards)
- `resources/js/Pages/Notificaciones/Index.tsx` — Página completa de notificaciones con filtros + paginación (Sprint 9)
- `resources/js/Components/Publico/` — Componentes públicos de seguimiento (BuscadorTicket, StepperProgreso, ResultadoSeguimiento, EstadoVacio, EstadoNoEncontrado, EsqueletoBusqueda) (Sprint 6)
- `resources/js/Components/ui/` — shadcn components (tooltip, progress, scroll-area, popover, separator agregados)

## Comandos
- `npm run dev` / `npm run build` — Vite
- `php artisan serve` — Laravel server
- `php artisan migrate:fresh --seed` — Reset DB

## Próximo Sprint
**Sprint 7 — Evaluación Técnica Previa** (NUEVO)
- Flujo: Recepción → Jefe delega (opcional) → Técnico evalúa → Devuelve → Jefe admite/rechaza
- SITPRECO solo en informe final (no en admisión ni en cierre)
- Plazo de 5 días no se pausa durante evaluación

Ver detalle en `Sprints Pendientes - Contexto.md` y `Sprint 7 - Evaluación Técnica Previa.md`.
