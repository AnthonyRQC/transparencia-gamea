# Critique — Dashboard (+ Bandeja) — Sprint 12.3 Batch B

> Fecha: 2026-09-09 · Targets: `resources/js/Pages/Dashboard.tsx`, `resources/js/Pages/Denuncias/Bandeja.tsx`, `Components/Layout/Sidebar.tsx`, `Header.tsx`
> Método: dual (Assessment A diseño + Assessment B detector), no degradado.

## Assessment B — Detector + mecánico
- `impeccable detect --json` (4 targets): exit 0, **0 findings**.
- `toLocaleDateString`: 0 en los 4 targets; 20 restantes fuera (mayoría en `Modales/InformeCierre`, `FormCierre/FormInformeFinal`, `InformeDetailModal`, `DenunciaCard`, `TablaCatalogo`, `calendar.tsx` shadcn). No son de los targets, quedan como higiene futura.
- Hardcoded `bg-white/text-gray-*/border-gray-`: 0 en targets; 16 restantes en Breeze legacy (`AuthenticatedLayout:8`, `Modal:1`, `Dropdown:2`, `NavLink:2`, `ResponsiveNavLink:1`, `Welcome:204`, `TipoDenunciaBadge:27`). Batch A elimina 9 de esos.
- Wrappers `Primary/Secondary/DangerButton`: 0 imports vivos (solo sus propios archivos). Inglés UI: 0.
- Assets: `LOGO-UTLCC.svg` 32636 B sin base64 (vector real ✅), `LOGO-UTLCC.png` 73523 B.

## Assessment A — Diseño (Operate)
- Score Nielsen: **25/40** (H1:3 H2:2 H3:3 H4:2 H5:3 H6:3 H7:2 H8:2 H9:3 H10:2).
- Fortalezas: bandas HOY/PERÍODO + `fechas.ts`, higiene tokens dark/light, `ListaVacia` único.
- P0: (1) card clicable contradice anti-misclick + copy jurídico; (2) 5 tabs + 7 contadores con 3 morados idénticos.
- P1: deriva sistema (0 `PageHeader`, `<button>` crudos en Bandeja, `pink-600` vs `destructive`), auto-preset + sortBy ignorado + drill solo-jefe sin señal.
- Red flags persona: `[Técnico]` en sidebar, `Negación` sin objeto, avatar con color arbitrario, badge oculto en colapsado, `Time Machine` como nav.

## Score oficial post-12.2
- **25/40 "Aceptable"** (diseño), detector **limpio**. Por debajo del ~34/40 estimado en cierre 12.2: el gap es consistencia/densidad/copy, no paleta ni dark mode (sólidos AAA).
- P0/P1 quedan en backlog (fuera del alcance 12.3 pactado: B→A→D→C). Cerrar P0+P1 devolvería a ~31-33/40 sin rediseño.
