# Handoff — Rediseño Visual con Impeccable (respaldo)

> Sesión principal continúa en el chat original. Este archivo permite retomar en otro chat desde cero.

## Estado al corte (Sep 2026)
- Sprint 12 pulido cerrado: ver `Sprint 12.1 - Cierre Pulido Dashboard.md`. Suite 88 tests, build OK.
- Paleta en tokens (`app.css`): `--primary #4B0090`, `--secondary #F5B400`, sidebar `#431377`, destructive `#F4007A`, +dark. Charts vía `helpers/tema.ts`. PDF/Excel/Welcome/DesignSystem migrados.
- Skills a nivel proyecto: `.agents/skills/building-dashboards/`, `.agents/skills/impeccable/`.
- Critique Dashboard: **21/40 Aceptable**, snapshot `.impeccable/critique/*dashboard*.md`. Detector CLI limpio.

## Brief de diseño (fijo)
- Audiencia: Jefe de Unidad y técnicos, abogados no-técnicos. Leen gráficos simples, quieren respuestas.
- Hardware: 15" 1280×720 sin scroll en gráficos + Full HD. Light y dark.
- Identidad: morado `#4B0090` primario, teal `#008F89` secundario/positivo, magenta `#F4007A` solo crítico, dorado `#F5B400` aviso con texto oscuro, `#431377` profundidad. **Variante pendiente:** sidebar/navbar negra (página pública la conserva) a evaluar.
- Modo impeccable: **Operate**. Comandos permitidos: critique, clarify, layout, colorize, distill, polish, adapt, audit, harden, typeset. **No**: bolder, overdrive, delight, animate (tono institucional serio).

## Pendiente
1. P2: chips con fechas localizadas ("7 ago → 5 sep"), Reset→Limpiar.
2. Teclado completo en barras Recharts (badge ya focuseable).
3. Login/Perfil fuera de Breeze legacy (tokens + dark).
4. Auditoría + fixes de las 19 páginas (orden: Bandeja/MisCasos → Reportes → Público → Admin → Auth). Ver `Roadmap Disenio Visual.md`.
5. Rediseño PDF con formato cliente + variante sidebar negra.
6. Re-correr critique para tendencia tras cada fix.

## Datos útiles
- Demo: 124 casos (`migrate:fresh --seed`), ~95% en plazo. Siguiente ticket 125.
- Docs: `AI-CONTEXT.md`, `Banco de Preguntas - Dashboard.md` (22 preguntas probadas), `Roadmap Disenio Visual.md`, `Deuda Tecnica y Riesgos.md`.
- Rama `main` en GitHub: `AnthonyRQC/transparencia-gamea`. Un batch = un commit + build + tests + visto bueno visual.
