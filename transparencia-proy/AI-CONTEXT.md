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
- `resources/js/Components/Denuncias/` — Componentes de denuncias (Card, Sheet, Badges, Modales)
- `resources/js/Pages/Denuncias/RegistroDenuncia.tsx` — Formulario de registro
- `resources/js/Pages/Denuncias/Bandeja.tsx` — Bandeja del Jefe (4 tabs)
- `resources/js/Pages/Denuncias/MisCasos.tsx` — Mis Casos del Técnico (4 tabs)
- `resources/js/Pages/Denuncias/MiResumen.tsx` — Resumen del Técnico (4 cards)
- `resources/js/Components/ui/` — shadcn components

## Comandos
- `npm run dev` / `npm run build` — Vite
- `php artisan serve` — Laravel server
- `php artisan migrate:fresh --seed` — Reset DB

## Próximo Sprint
**Sprint 3 — Asignación de Técnico + Detalle de Caso**
- Modal de Asignación de técnico con carga de trabajo visible
- Traspaso de caso entre técnicos
- Reapertura de denuncias cerradas/rechazadas
- Tooltip en PlazoBadge con fecha exacta de vencimiento
- Visualización de Admisión (fecha, justificación) en Sheet
