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
**Sprint 3** (Asignación de Técnico + Traspaso + Reapertura + Mejoras Detalle) — Cerrado ✅ (AsignacionModal con carga de trabajo visible, TraspasoModal con justificación obligatoria, ReabrirModal con nueva fecha límite manual, bitácora en Sheet, tooltip en PlazoBadge, secciones Admisión/Rechazo/Asignación en Sheet, avatar de técnico en cards, badge Reasignado en traspasos recientes)

## Documentación Esencial (LEER EN ORDEN)
1. `transparencia-proy/Plan de Desarrollo.md` — Hoja de ruta
2. `transparencia-proy/RESUMEN LEY 974.md` — Marco legal
3. `transparencia-proy/Sprint 1 - Registro de Denuncia.md` — Detalle Sprint 1
4. `transparencia-proy/Sprint 2 - Bandeja de Admisión y Mis Casos.md` — Detalle Sprint 2
5. `transparencia-proy/Proyecto - Resumen General del Sistema.md` — Overview funcional
6. `transparencia-proy/Proyecto - Prototipo y Estrategia de Diseño.md` — Diseño

## Convenciones Vigentes
- Colores institucionales: morado `#690bb2` + gold `#fecd2a` (CSS vars OKLCH)
- Font: Outfit (sans) + Fira Code (mono)
- Modo oscuro: clase `.dark` en `<html>`, persistido en localStorage
- Sin roles en código (Fase 0) — se validan verbalmente con cliente
- Rutas via Ziggy `route()`
- Subdirectorio URL: `/transparencia/public/`

## Arquitectura Clave
- `app/Data/DenunciaData.php` — Mock data estática (sesión, no DB)
- `app/Http/Controllers/DenunciaController.php` — Create + Store + admitir/rechazar/iniciar
- `app/Http/Controllers/BandejaController.php` — Bandeja de Admisión (Jefe)
- `app/Http/Controllers/MisCasosController.php` — Mis Casos (Técnico, filtrado por técnico)
- `app/Http/Controllers/MiResumenController.php` — Mi Resumen (Técnico, contadores)
- `resources/js/Components/Layout/AppLayout.tsx` — Layout root
- `resources/js/Components/Denuncias/` — Componentes de denuncias (Card, Sheet, Badges, Modales, AsignacionModal, TraspasoModal, ReabrirModal, TecnicoCargaCard)
- `resources/js/Pages/Denuncias/RegistroDenuncia.tsx` — Formulario de registro
- `resources/js/Pages/Denuncias/Bandeja.tsx` — Bandeja del Jefe (4 tabs)
- `resources/js/Pages/Denuncias/MisCasos.tsx` — Mis Casos del Técnico (4 tabs)
- `resources/js/Pages/Denuncias/MiResumen.tsx` — Resumen del Técnico (4 cards)
- `resources/js/Components/ui/` — shadcn components (tooltip added Sprint 3)
- `resources/js/Components/ui/tooltip.tsx` — Tooltip shadcn para PlazoBadge

## Comandos
- `npm run dev` / `npm run build` — Vite
- `php artisan serve` — Laravel server
- `php artisan migrate:fresh --seed` — Reset DB

## Próximo Sprint
**Sprint 4 — Investigación (Solicitudes + Descargos)**
- Pestañas de trabajo dentro del Sheet de detalle (Solicitudes, Descargos)
- TabSolicitudes con lista de solicitudes a unidades externas
- ModalNuevaSolicitud (unidad destino + detalle + plazo)
- ModalResponderSolicitud (respuesta recibida + archivos)
- ModalAmpliarSolicitud (prórroga: días + justificación + archivo)
- TabDescargos con lista de denunciados con control individual
- ModalNotificarDescargo (fecha aviso + medio + respaldo)
- ModalResponderDescargo (resumen descargo + documentos)
- ModalAmpliarDescargo (prórroga: días + justificación)
- SaltarFaseButton con justificación obligatoria
