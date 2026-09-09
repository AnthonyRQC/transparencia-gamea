# Sesión Live + Continuación Visual (handoff entre harnesses)

> Objetivo: retomar el rediseño visual con impeccable en otro harness (Claude Code / Antigravity)
> con selecciones visuales en tiempo real. Estado al corte: Sep 2026, rama `main` al día.

## 1. Estado heredado (verificado)
- Boot live OK: helper :8400, `PRODUCT.md` + `DESIGN.md` en raíz, target `resources/js/Pages/Dashboard.tsx`.
- `app.blade.php` limpio (inject revertido). Vite :5173 corriendo al momento del corte.
- Snapshot critique Dashboard: **21/40 Aceptable** (`.impeccable/critique/*dashboard*.md`). Detector CLI limpio.
- Suite 88 tests, build OK. Demo 124 casos (`migrate:fresh --seed`).

## 2. Por qué falló el live aquí (no repetir a ciegas)
- Este harness no expone herramienta de navegador: sin overlay no hay selecciones visuales.
- `live-poll` bloquea el turno hasta 10 min; cada "continúa" volvía al mismo bloqueo.
- En el otro harness verificar ANTES de empezar: herramienta de navegador disponible, terminales/background que no bloqueen el turno, `npm run dev` corriendo, dashboard abierto logueado como Jefe.
- Comandos: `impeccable live --target resources/js/Pages/Dashboard.tsx`, luego `live-poll` en background con notificaciones. Config ya existe en `.impeccable/live/config.json` (target: `resources/views/app.blade.php`).

## 3. Brief fijo (no renegociar)
- Audiencia: Jefe y técnicos, abogados no-técnicos. 15" 1280×720 sin scroll + Full HD, light y dark.
- Paleta: `#4B0090` proceso · `#008F89` positivo · `#F4007A` solo rellenos críticos · `#F5B400` aviso con texto oscuro · `#431377` profundidad. Contrastes verificados en `DESIGN.md`. Destructive botones `#C6006B` (5.81:1).
- Modo: **Operate**. Comandos permitidos: critique, clarify, layout, colorize, distill, polish, adapt, audit, harden, typeset. **No**: bolder, overdrive, delight, animate.
- Reglas: copy plano, color nunca como único canal, ojo-para-ver en tablas, "%" sin base → "—", un batch = commit + build + tests + visto bueno.

## 4. Fase 0 ✅ HECHA
Tokens en `app.css`, `helpers/tema.ts`, PDF/Excel/Welcome/DesignSystem migrados, `DESIGN.md`, contraste AA verificado.

## 5. Fase 1 — clarify (pendiente, en orden)
- **Batch 1 — Dashboard:** chips con nombres reales (resolver vía `opciones.*`, no IDs), fechas "7 ago → 5 sep" (extraer `formatearFechaCorta` de `Pages/Dashboard.tsx` a `helpers/fechas.ts`), quitar jerga ("Sprint 14" ya fuera; "subordinadas" → "unidades dependientes"; "Días: -12 d" → "Vencido hace 12 días"). Archivos: `FiltrosDashboard.tsx`, `TabResultados.tsx`, `KPICards.tsx`, `TablaCasosUrgentes.tsx`, `ModalExportar.tsx` (etiqueta SITPRECO con aclaración).
- **Batch 2 — Bandeja/MisCasos/Sheet:** mismos textos de estado y plazo en cards; unificar "Ticket" vs "Nro de denuncia".
- **Batch 3 — Modales + Seguimiento público:** unificar vacíos y errores (nunca error técnico como "Sin casos").

## 6. Fase 2 — layout + colorize por áreas
Orden de uso diario: Bandeja/MisCasos → Reportes → Público (Welcome/Seguimiento) → Admin → Auth. Headers iguales, tablas, ejes truncados, semántica única de color.

## 7. Fase 3 — distill + polish + cierre
Un sistema de botones (jubilar legacy), un empty state, un formato de fecha (culminar `helpers/fechas.ts`, 25+ calls). Login/Perfil fuera de Breeze legacy. Re-critique para tendencia (meta ≥28/40).

## 8. Deuda visual conocida (del snapshot)
P0 bandas (hecho) · KPIs 5+3 (hecho) · paleta charts (hecho) · clic fantasma parcial (badge focuseable hecho; barras sin tabIndex) · chips crudos (Fase 1) · teclado Recharts · Login/Perfil · 19 páginas.
