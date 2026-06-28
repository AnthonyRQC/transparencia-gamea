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
**Sprint 1** (Registro de Denuncia, formulario complejo) — Cerrado ✅ (Barra de progreso fija bajo header, modal de éxito vinculado mediante Inertia flash y panel temporal de autocompletado ficticio)
**Sprint 2** (Bandeja de Admisión + Mis Casos + Mi Resumen) — Cerrado ✅ (Tabs en lugar de Kanban, Sheet lateral para detalle, modales Admisión/Rechazo con justificación, 4 tabs en Mis Casos, 4 ContadorCards en Mi Resumen, 12 seed items con técnicos, Dropdown "Ver como:" de técnico)
**Sprint 3** (Asignación de Técnico + Traspaso + Reapertura + Mejoras Detalle) — Cerrado ✅
**Sprint 4** (Investigación: Solicitudes + Descargos + Saltar Fase) — Cerrado ✅ (Sheet refactorizado con 3 tabs: Información, Solicitudes, Descargos. TabSolicitudes con SolicitudCard + PlazoProgress + 3 modales (Nueva, Responder, Ampliar). TabDescargos con DescargoCard + 3 modales (Notificar, Responder, Ampliar). SaltarFaseButton con justificación obligatoria + warning items pendientes. Datos mock en SolicitudData, DescargoData, UnidadData. Bandeja read-only en tabs de trabajo, MisCasos con acciones completas + dropdown "Ver como:" permite al Jefe actuar. Seed de 3 solicitudes + 2 descargos demo).

## Documentación Esencial (LEER SIEMPRE)
> Este archivo + los 2 siguientes son el snapshot del estado del proyecto.
> Leerlos SIEMPRE al iniciar una conversación o antes de trabajar.
1. `transparencia-proy/AI-CONTEXT.md` (este archivo) — Snapshot del estado actual
2. `transparencia-proy/Plan de Desarrollo.md` — Hoja de ruta, sprints, decisiones
3. `transparencia-proy/RESUMEN LEY 974.md` — Marco legal

## Documentación de Referencia (LEER SOLO SI NECESARIO)
> ⚠️ NO leer por defecto. Contienen detalles extensos que saturan la memoria de contexto.
> Solo consultar si el usuario pide trabajar en un sprint específico o necesitas
> contexto histórico detallado de un componente/flujo concreto.

- `transparencia-proy/Sprint 1 - Registro de Denuncia.md` — Detalle Sprint 1
- `transparencia-proy/Sprint 2 - Bandeja de Admisión y Mis Casos.md` — Detalle Sprint 2
- `transparencia-proy/Sprint 3 - Asignación, Traspaso y Reapertura.md` — Detalle Sprint 3
- `transparencia-proy/Sprint 4 - Investigación (Solicitudes + Descargos).md` — Detalle Sprint 4
- `transparencia-proy/Proyecto - Resumen General del Sistema.md` — Overview funcional completo
- `transparencia-proy/Proyecto - Prototipo y Estrategia de Diseño.md` — Decisiones de diseño
- `transparencia-proy/Proyecto - Transparencia Stack y Conceptos.md` — Conceptos del stack

## Convenciones Vigentes
- Colores institucionales: morado `#690bb2` + gold `#fecd2a` (CSS vars OKLCH)
- Font: Outfit (sans) + Fira Code (mono)
- Modo oscuro: clase `.dark` en `<html>`, persistido en localStorage
- Sin roles en código (Fase 0) — se validan verbalmente con cliente
- Rutas via Ziggy `route()`
- Subdirectorio URL: `/transparencia/public/`

## Arquitectura Clave
- `app/Data/DenunciaData.php` — Mock data estática (sesión, no DB)
- `app/Data/SolicitudData.php` — Solicitudes a unidades externas (Sprint 4)
- `app/Data/DescargoData.php` — Descargos de denunciados (Sprint 4)
- `app/Data/UnidadData.php` — Catálogo de unidades externas (Sprint 4)
- `app/Http/Controllers/DenunciaController.php` — Create + Store + admitir/rechazar/iniciar + saltarFase
- `app/Http/Controllers/SolicitudController.php` — CRUD Solicitudes (Sprint 4)
- `app/Http/Controllers/DescargoController.php` — CRUD Descargos (Sprint 4)
- `app/Http/Controllers/BandejaController.php` — Bandeja de Admisión (Jefe, envia solicitudes/descargos read-only)
- `app/Http/Controllers/MisCasosController.php` — Mis Casos (Técnico, filtrado por técnico + solicitudes/descargos con acciones)
- `resources/js/Components/Layout/AppLayout.tsx` — Layout root
- `resources/js/Components/Denuncias/` — Componentes de denuncias (Card, Sheet, Badges, Modales, AsignacionModal, TraspasoModal, ReabrirModal, TecnicoCargaCard, TabSolicitudes, TabDescargos, SolicitudCard, DescargoCard, PlazoProgress, ArchivoAdjunto, SaltarFaseButton, modales solicitud/descargo)
- `resources/js/Pages/Denuncias/RegistroDenuncia.tsx` — Formulario de registro
- `resources/js/Pages/Denuncias/Bandeja.tsx` — Bandeja del Jefe (5 tabs: Por admitir, Por asignar, En curso, Historial, Visión general)
- `resources/js/Pages/Denuncias/MisCasos.tsx` — Mis Casos del Técnico (4 tabs)
- `resources/js/Pages/Denuncias/MiResumen.tsx` — Resumen del Técnico (4 cards)
- `resources/js/Components/ui/` — shadcn components (tooltip, progress, scroll-area agregados Sprint 3)

## Comandos
- `npm run dev` / `npm run build` — Vite
- `php artisan serve` — Laravel server
- `php artisan migrate:fresh --seed` — Reset DB

## Próximo Sprint
**Sprint 5 — Informe Final + Cierre**
- TabInformeCierre con dos sub-secciones (Informe Final + Cierre)
- FormInformeFinal con clasificación (Penal/Civil/Administrativo/Sin Indicios/Medida Correctiva/Archivado)
- FormCierre con SITPRECO, notificación de cierre
