# Roadmap Diseño Visual — Sistema UTLCC

> Plan por partes (un batch = un commit reversible + build + tests + visto bueno visual).
> Skill: `impeccable` a nivel proyecto (`.agents/skills/impeccable/`).
> Paleta nueva: `#4B0090` (primario) · `#431377` (profundidad) · `#F4007A` (alerta) · `#008F89` (secundario/positivo) · `#F5B400` (aviso).
> Auditoría base: `.impeccable/critique/*dashboard*.md` (21/40 Aceptable).

## Cómo revisar sin saber diseño
1. **¿Entiendo qué dice?** Lee la pantalla en voz alta como si se la explicaras al Jefe. Donde te trabes, hay que reescribirlo.
2. **¿Se lo mostraría al Jefe mañana?** Si sí, el batch pasa. Si no, se anota qué falla.
3. Comparar antes/después lado a lado en tu monitor 15" (light y dark).

## Fase 0 — Base (1 batch)
- [ ] `DESIGN.md` desde el código (`document`): tokens OKLCH, Outfit/Fira Code, dark mode, shadcn New York.
- [ ] Migrar tokens: `--primary` → `#4B0090`, `--secondary` → dorado `#F5B400`, sidebar/header → `#431377`, semánticas a `#008F89`/`#F5B400`/`#F4007A` con contraste AA light+dark.
- [ ] Arrastrar: `pdf.blade.php`, estilos del Excel, glows de Welcome, hex hardcodeados en gráficos → tokens.
- Archivos: `resources/css/app.css`, `tailwind.config.js`, `pdf.blade.php`, `ReporteExcel.php`, `Grafico*.tsx`, `Welcome.tsx`.

## Fase 1 — `clarify`: que se entienda (3 batches)
- [ ] **Batch 1 — Dashboard:** chips con nombres reales ("Carlos Quispe", no "técnico 5"), fechas "7 ago → 5 sep", quitar jerga ("Sprint 14", "subordinadas", "Días: -12 d" → "Vencido hace 12 días").
- [ ] **Batch 2 — Bandeja/MisCasos/Sheet:** mismos textos de estado y plazo en todas las cards; unificar "Ticket" vs "Nro de denuncia".
- [ ] **Batch 3 — Modales + Seguimiento público:** unificar mensajes vacíos y de error (nunca un error técnico disfrazado de "Sin casos").

## Fase 2 — `layout` + `colorize` (2 batches)
- [ ] **Batch 4 — Jerarquía y ritmo:** headers iguales en las 19 páginas, KPIs, tablas, ejes truncados (`YAxis width`), espaciados.
- [ ] **Batch 5 — Paleta con semántica única:** morado proceso, teal positivo, magenta alerta, dorado aviso con texto oscuro; contraste AA verificado.

## Fase 3 — `distill` + `polish` (2 batches)
- [ ] **Batch 6 — Quitar ruido:** un solo sistema de botones (jubilar `PrimaryButton/SecondaryButton/DangerButton` legacy), un empty state (`ListaVacia`), un formato de fecha (helper único).
- [ ] **Batch 7 — Cierre:** Login/Perfil fuera de Breeze legacy (tokens + dark mode), pasada `polish`, detector limpio, re-critique para tendencia.

## Reglas
- Un batch = un commit + build + suite verde + visto bueno visual. Nada de mezclar copy con colores.
- Todo reversible con `git revert`.
- Issues P0-P3 del snapshot mandan si hay duda de prioridad.
