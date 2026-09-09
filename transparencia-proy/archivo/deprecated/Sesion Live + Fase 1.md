# Sesión — Live Impeccable + Fase 1 Batch 1 (Dashboard clarify)

> Estado al corte: live **abandonado** (ver por qué abajo). Pendiente: Fase 1 Batch 1 por iteración clásica.
> SIN commitear (a pedido). Untracked actual: `.impeccable/live/`, `PRODUCT.md`.

## 1. Qué pasó con el live
- Se instaló config (`.impeccable/live/config.json` → `resources/views/app.blade.php`), `PRODUCT.md`, boot OK (helper :8400, Vite :5173 corriendo).
- Problema: el `live-poll` bloquea el turno hasta 10 min esperando el clic en el navegador; cada "continúa" volvía al mismo bloqueo. Sin herramienta de navegador en este entorno, el loop no avanza solo.
- Limpieza hecha: helper detenido (ya no corría), `app.blade.php` restaurado. Quedan como untracked `.impeccable/live/` (journal+config, reutilizable) y `PRODUCT.md` (vale para el futuro).
- Decisión: iteración clásica — variantes propuestas en chat, usuario mira en su navegador y elige. Reintentar live solo si hay herramienta de navegador.

## 2. Fase 1 Batch 1 — Dashboard clarify (PENDIENTE)
Objetivo: que todo se entienda sin memorizar reglas. Archivos:
- `resources/js/Components/Dashboard/FiltrosDashboard.tsx` — chips con nombres reales (usar `opciones.tecnicos/categorias`, no IDs), fechas "7 ago → 5 sep" (helper `formatearFechaCorta` ya existe en `Pages/Dashboard.tsx`; extraer a `helpers/fechas.ts`), texto del aviso de alcance del filtro Estado en plano.
- `TabResultados.tsx` — quitar "subordinadas" (→ "incluye unidades dependientes") y "Sprint 14".
- `KPICards.tsx` / `TablaCasosUrgentes.tsx` — "Días: -12 d" → "Vencido hace 12 días" (helper).
- `ModalExportar.tsx` (`COLUMNAS_EXCEL`) — revisar etiquetas que el Jefe no entienda (SITPRECO con aclaración).
- Verificación: build + tests + repaso visual del usuario. Luego commit.

## 3. Cómo retomar
1. Leer este archivo + `Roadmap Disenio Visual.md` + snapshot `.impeccable/critique/*dashboard*.md`.
2. Ejecutar Fase 1 Batch 1 arriba. Proponer variantes en chat (máx 3 por elemento), usuario elige, implementar la ganadora.
3. Commit + push. Seguir con Batch 2 (Bandeja/MisCasos/Sheet).
