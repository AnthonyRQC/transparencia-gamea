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
**Sprint 7** (Evaluación Técnica Previa) — Cerrado ✅ (Julio 2026)
**Sprint 7.A** (Cierre SITPRECO en rechazo) — Cerrado ✅ (Julio 2026)
**Sprint 7.5** (Ajustes UX Urgentes pre-cliente) — Cerrado ✅ (Julio 2026)
**Sprint 7.6** (Repositorio de Archivos del Caso) — Cerrado ✅ (Julio 2026)
**Sprint 7.7** (Búsqueda y Consulta para Registrador) — Cerrado ✅ (Julio 2026)
**Sprint 8** (Ampliaciones Múltiples) — Cerrado ✅ (Julio 2026)
**Sprint 9** (Notificaciones Push + Historial) — Cerrado ✅ (Julio 2026)

Sprints pendientes: **10**, **11**, **12**, **13**, **14**, **15+** (BD real).
Ver `Sprints Pendientes - Contexto.md` para detalle de sprints pendientes (10–21).

## Roles (post sesión con cliente, Junio 2026)
- **Registrador** (antes "Recepcionista")
- **Jefe de Unidad**
- **Técnicos**

(Implementación formal de roles será en Sprint 15, una vez la BD esté operativa).

> 🆕 **Importante (Julio 2026):** Aunque los roles aún no están formalizados en BD, el **frontend debe gestionar permisos (no roles)** siguiendo buenas prácticas. El catálogo de permisos y la utilidad `useCan()`/`@can` se introducen en **Sprint 7.5**. Esto desacopla la UI de los nombres de roles y prepara el terreno para Sprint 15.

## Convenciones de lectura para IAs

> **REGLA CRÍTICA:** Antes de leer cualquier archivo, determina en qué sprint estás trabajando.

1. **Siempre al iniciar:** Lee este `AI-CONTEXT.md` completo (~100 líneas).
2. **Para ver roadmap completo:** Lee `Plan de Desarrollo.md` (alto nivel).
3. **Para trabajar en un sprint específico:**
   - **Sprint cerrado (0-9):** Lee `Sprint X - [Nombre].md` solo si es necesario detalle histórico.
   - **Sprint pendiente (10+):** Lee SOLO la sección correspondiente en `Sprints Pendientes - Contexto.md`. **No leas otras secciones** (lazy load).
4. **Para entender el sistema completo:** Lee `Proyecto - Resumen General del Sistema.md` solo si es necesario.
5. **NO LEER por defecto:**
   - `Proyecto - Prototipo y Estrategia de Diseño.md`
   - `Proyecto - Transparencia Stack y Conceptos.md`
   - `Proyecto - Vistas y Prototipo de Interfaz.md`
   - Documentos de sprints cerrados si no estás trabajando en ellos

## Documentación Esencial (LEER SIEMPRE)
1. `transparencia-proy/AI-CONTEXT.md` (este archivo) — Snapshot del estado actual
2. `transparencia-proy/Plan de Desarrollo.md` — Hoja de ruta, sprints, decisiones
3. `transparencia-proy/Sprints Pendientes - Contexto.md` — Contexto de sprints pendientes 10-21 (lazy load)
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

## Esquemas de Base de Datos (LEER SOLO SI NECESARIO)
> Organizados en 3 archivos para no abrumar:

- `transparencia-proy/Esquema BD - Negocio.md` — 22 tablas del dominio (denuncias, solicitudes, descargos, etc.)
- `transparencia-proy/Esquema BD - Catálogos.md` — 4 tablas pequeñas de referencia (categorías, unidades, feriados, config)
- `transparencia-proy/Esquema BD - Librerías.md` — 4-6 tablas generadas por paquetes (Breeze + Auditing)

## Convenciones Vigentes
- Colores institucionales: morado `#690bb2` + gold `#fecd2a` (CSS vars OKLCH)
- Font: Outfit (sans) + Fira Code (mono)
- Modo oscuro: clase `.dark` en `<html>`, persistido en localStorage
- **MAYÚSCULAS obligatorias en todos los campos de texto libre** (convención institucional). Aplica en frontend con `text-transform: uppercase` en inputs/textareas y en backend con `Str::upper()` antes del `save()`. Ver lista completa en `Sprint 7.5`.
- **Frontend por permisos, no por roles** (buenas prácticas). El catálogo de permisos y la utilidad `useCan()` se introducen en Sprint 7.5. Los roles formales (BD) llegan en Sprint 15.
- Rutas via Ziggy `route()`
- Subdirectorio URL: `/transparencia/public/`
- **Stack fijo:** MySQL (Laragon), Eloquent con cast JSON. Sin migración a Postgres.

## Decisiones clave recientes (Junio 2026)
- **Recepcionista → Registrador** (cambio de nombre en toda la documentación)
- **SITPRECO solo en informe final** (opcional — código del sistema nacional de Bolivia). Aplica también opcional al rechazo. NO se pide al admitir (corregido Julio 2026 para evitar burocracia).
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

## Decisiones clave recientes (Julio 2026)
- **Acompañamiento/Intervención eliminadas del MVP.** Diferidas a **Sprint 22 (v2)**. Se mantienen como apuntes en `Sprints Pendientes - Contexto.md`.
- **MAYÚSCULAS obligatorias en todos los textos libres** (convención institucional, no configurable).
- **`descargos.medio` pasa de ENUM a texto libre** (Sprint 7.5). La opción cerrada limitaba la realidad operativa.
- **Solicitudes con date picker manual** de `fecha_envio` y `fecha_respuesta` (paridad con descargos, Sprint 7.5).
- **Edición/eliminación libre de la denuncia raíz solo en estado `ingresada`** (Sprint 7.5). Después de admisión, solo acciones formales (traspaso, reapertura, ampliación, conciliación).
- **Conciliación de fechas por el Jefe** (Sprint 7.5): puede ajustar fechas retroactivas en cualquier estado con justificación, registrado en `bitacora` con acción `conciliacion_fechas`. Notificación visible al técnico.
- **Consulta de código (ticket + PIN) por Registrador sin bitácora** (Sprint 7.7). Sin restricción, sin log: el responsable de la información es el Registrador.
- **Repositorio unificado de archivos del caso** (Sprint 7.6): nueva tabla `denuncias_archivos` conviviendo con archivos por fase. Soft delete: archivo "eliminado" desaparece de UI pero archivo físico se preserva.
- **Hechos del registro:** 5000 → **8000 caracteres** (Sprint 7.5).
- **Filosofía "minimizar tablas":** en BD real (Sprint 14), las 4 tablas puramente históricas de ediciones se fusionan como **campos JSON** en su tabla padre (`solicitudes_ediciones` → JSON en `solicitudes_informacion`, etc.). Stack fijo: MySQL con `JSON` + Eloquent cast `array`, portable a `JSONB` (Postgres) si en el futuro se requiere.
- **Frontend por permisos, no por roles.** Catálogo de permisos y utilidad `useCan()` introducidos en Sprint 7.5. Sprint 15 formaliza con BD, Gates y Policies.
- **Archivos del caso (Sprint 7.6):** En Fase 0 (mock) Jefe y Técnico ven completo (subir/eliminar). En Sprint 15 se restringirá: **Jefe solo `archivo.ver`** (lectura), **Técnico mantiene `archivo.subir` y `archivo.eliminar`** (CRUD completo). No implementar la restricción antes de Sprint 15 para mantener simplicidad en Fase 0.
- **MAYÚSCULAS sin helpers redundantes:** Se eliminaron los textos "Se guardará en MAYÚSCULAS" y "· MAYÚSCULAS" de todos los inputs (22 archivos). El usuario ve el texto en mayúsculas vía `text-transform: uppercase`, no necesita texto adicional.
- **Botón copiar con fallback robusto:** `ModalExito` y `ModalConsultarCodigo` usan `navigator.clipboard.writeText()` con fallback a `document.execCommand('copy')` para entornos HTTP. El código se muestra como un solo string `TICKET-PIN` concatenado.

## Notas / Pendientes

> ⏸️ **TODO — Preguntar al cliente:** ¿La funcionalidad de "archivar casos" debe ser
> un subestado de `cerrada` (actual: `subestado: 'archivada'`) o un estado/proceso
> separado con flujo propio? Por el momento se mantiene como subestado sin afectar
> UX de la vista pública.

> ⏸️ **Otros pendientes con el cliente:**
> - C7: Destino del expediente al remitirse al Ministerio
> - C8: Reglas del plazo al reabrir una denuncia

> ⏸️ **Funcionalidades diferidas a v2 (no implementar en Fase 1):**
> - Acompañamiento/Intervención → **Sprint 22**
> - Permisos personalizados por usuario (granulares) → **Sprint 24**
> - Migración de casos legacy → **Sprint 23** (detalle cuando se implemente BD)

## Arquitectura Clave
- `app/Data/DenunciaData.php` — Mock data estática (sesión, no DB)
- `app/Data/SolicitudData.php` — Solicitudes a unidades externas (Sprint 4)
- `app/Data/DescargoData.php` — Descargos de denunciados (Sprint 4)
- `app/Data/UnidadData.php` — Catálogo de unidades externas (Sprint 4)
- `app/Data/SesionUsuarioData.php` — 5 usuarios mock con roles (Sprint 6.5)
- `app/Data/NotificacionData.php` — Notificaciones generadas por derivación (Sprint 9)
- `app/Data/EvaluacionData.php` — Evaluaciones técnicas previas (Sprint 7)
- `app/Data/PermisosCatalogo.php` — Catálogo de permisos del sistema (Sprint 7.5)
- `app/Helpers/UppercaseText.php` — Trait para transformar textos libres a MAYÚSCULAS (Sprint 7.5)
- `app/Http/Controllers/DenunciaController.php` — Create + Store + admitir/rechazar/iniciar + saltarFase + aprobarAmpliacion + delegarEvaluacion + reasumirEvaluacion + conciliarFechas
- `app/Http/Controllers/SolicitudController.php` — CRUD Solicitudes (Sprint 4)
- `app/Http/Controllers/DescargoController.php` — CRUD Descargos (Sprint 4)
- `app/Http/Controllers/BandejaController.php` — Bandeja de Admisión (Jefe, envia solicitudes/descargos read-only)
- `app/Http/Controllers/MisCasosController.php` — Mis Casos (Técnico, filtrado por técnico + solicitudes/descargos con acciones)
- `app/Http/Controllers/SeguimientoController.php` — Búsqueda pública por ticket (Sprint 6)
- `app/Http/Controllers/SelectorUsuarioController.php` — Cambio de usuario demo (Sprint 6.5)
- `app/Http/Controllers/NotificacionController.php` — CRUD notificaciones + paginación (Sprint 9)
- `app/Http/Controllers/DemoNotificacionController.php` — Simulaciones demo de notificaciones (Sprint 9)
- `app/Http/Controllers/EvaluacionController.php` — Devolver evaluación (Sprint 7)
- `app/Http/Controllers/ConsultaCasosController.php` — Búsqueda de casos para Registrador (Sprint 7.7)
- `app/Http/Controllers/ArchivosCasoController.php` — CRUD del repositorio de archivos del caso (Sprint 7.6)
- `resources/js/Components/Layout/AppLayout.tsx` — Layout root
- `resources/js/Components/Layout/SelectorUsuarioDemo.tsx` — Dropdown de simulación de usuario (Sprint 6.5)
- `resources/js/Components/Layout/CampanaNotificaciones.tsx` — Campana con badge + Popover (Sprint 9)
- `resources/js/Components/Layout/PanelNotificaciones.tsx` — Panel dropdown scrolleable (Sprint 9)
- `resources/js/Components/Layout/ItemNotificacion.tsx` — Item individual con icono, timestamp, color (Sprint 9)
- `resources/js/permissions.ts` — Catálogo de permisos TypeScript + tipos (Sprint 7.5)
- `resources/js/hooks/useCan.ts` — Hook React para chequeo de permisos (Sprint 7.5)
- `resources/js/Components/Can.tsx` — Componente para render condicional por permiso (Sprint 7.5)
- `resources/js/Components/Denuncias/` — Componentes de denuncias (Card, Sheet, Badges, Modales, AsignacionModal, TraspasoModal, ReabrirModal, TecnicoCargaCard, TabSolicitudes, TabDescargos, SolicitudCard, DescargoCard, PlazoProgress, ArchivoAdjunto, SaltarFaseButton, modales solicitud/descargo, SolicitudDetailModal, DescargoDetailModal, ModalCancelarSolicitud, ModalNuevoDescargo, ModalConfirmarEliminar, ClasificacionBadge, FormInformeFinal, FormCierre, TabInformeCierre, InformeDetailModal, ModalAmpliacionPlazo, ModalDelegarEvaluacion, ModalDevolverEvaluacion, TabEvaluacionPrevia, ModalEditarDenuncia, ModalConciliarFechas, ModalArchivosDelCaso)
- `resources/js/Pages/Denuncias/RegistroDenuncia.tsx` — Formulario de registro
- `resources/js/Pages/Denuncias/Bandeja.tsx` — Bandeja del Jefe (5 tabs: Por admitir, Por asignar, En curso, Historial, Visión general)
- `resources/js/Pages/Denuncias/MisCasos.tsx` — Mis Casos del Técnico (4 tabs)
- `resources/js/Pages/Denuncias/MiResumen.tsx` — Resumen del Técnico (4 cards)
- `resources/js/Pages/Denuncias/Evaluaciones.tsx` — Bandeja de evaluaciones delegadas para el técnico (Sprint 7)
- `resources/js/Pages/Denuncias/ConsultarCasos.tsx` — Búsqueda y consulta de casos para Registrador (Sprint 7.7)
- `resources/js/Pages/Notificaciones/Index.tsx` — Página completa de notificaciones con filtros + paginación (Sprint 9)
- `resources/js/Components/Publico/` — Componentes públicos de seguimiento (BuscadorTicket, StepperProgreso, ResultadoSeguimiento, EstadoVacio, EstadoNoEncontrado, EsqueletoBusqueda) (Sprint 6)
- `resources/js/Components/ui/` — shadcn components (tooltip, progress, scroll-area, popover, separator, table agregados)

## Comandos
- `npm run dev` / `npm run build` — Vite
- `php artisan serve` — Laravel server
- `php artisan migrate:fresh --seed` — Reset DB

## Próximo Sprint (por definir en planificación)

Los sprints urgentes pre-cliente **7.A → 7.5 → 7.6 → 7.7** están completos. Los próximos sprints en el roadmap son:

1. **Sprint 10** — Panel Administración Catálogos + Subcategorías
2. **Sprint 11** — Dashboard + KPIs + Reportes PDF/Excel
3. **Sprint 12** — Tablero Público Cerrados
4. **Sprint 13** — Tiempos entre Fases
5. **Sprint 14+** — Base de datos real, Roles, Auditoría, etc.

Ver detalle en `Sprints Pendientes - Contexto.md`.
