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
**Sprint 1** (Registro de Denuncia, formulario complejo) —
Completado — bugs críticos de estado corregidos (closure stale en BloquePrueba)

## Documentación Esencial (LEER EN ORDEN)
1. `transparencia-proy/Plan de Desarrollo.md` — Hoja de ruta
2. `transparencia-proy/RESUMEN LEY 974.md` — Marco legal
3. `transparencia-proy/Sprint 1 - Registro de Denuncia.md` — Detalle sprint actual
4. `transparencia-proy/Proyecto - Resumen General del Sistema.md` — Overview funcional
5. `transparencia-proy/Proyecto - Prototipo y Estrategia de Diseño.md` — Diseño

## Convenciones Vigentes
- Colores institucionales: morado `#690bb2` + gold `#fecd2a` (CSS vars OKLCH)
- Font: Outfit (sans) + Fira Code (mono)
- Modo oscuro: clase `.dark` en `<html>`, persistido en localStorage
- Sin roles en código (Fase 0) — se validan verbalmente con cliente
- Rutas via Ziggy `route()`
- Subdirectorio URL: `/transparencia/public/`

## Arquitectura Clave
- `app/Data/DenunciaData.php` — Mock data estática (sesión, no DB)
- `app/Http/Controllers/DenunciaController.php` — Create + Store
- `resources/js/Components/Layout/AppLayout.tsx` — Layout root
- `resources/js/Components/Denuncias/` — Componentes del formulario
- `resources/js/Pages/Denuncias/RegistroDenuncia.tsx` — Página principal
- `resources/js/Components/ui/` — shadcn components

## Comandos
- `npm run dev` / `npm run build` — Vite
- `php artisan serve` — Laravel server
- `php artisan migrate:fresh --seed` — Reset DB

## Próximo Sprint
**Sprint 2 — Tablero Kanban** con 5 columnas:
Ingresadas → Admitidas → Investigación → Informe → Cerradas
