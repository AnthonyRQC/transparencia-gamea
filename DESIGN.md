# DESIGN.md — Sistema UTLCC / GAMEA

> Fuente de verdad visual. Generado desde el código (Sep 2026). Modo impeccable: **Operate**.
> Audiencia: Jefe de Unidad y técnicos, abogados no-técnicos. hard: 1280×720 sin scroll + Full HD, light y dark.

## Paleta institucional (OKLCH en `resources/css/app.css`)

| Token | Valor | Contraste verificado |
|---|---|---|
| `--primary` | `#4B0090` morado (0.3536 0.1919 297.03) | blanco encima 12.34 ✅ |
| `--primary` dark | `#A855F7` aprox (0.6268 0.2325 303.90) | — |
| `--secondary` | `#F5B400` dorado (0.8088 0.1665 82.31) | texto morado oscuro 7.14 ✅ / blanco 1.84 ❌ prohibido |
| `--sidebar` | `#431377` (0.3299 0.1543 299.09) | blanco 13.14 ✅ |
| `--destructive` | `#C6006B` (0.5363 0.2180 358.88) | blanco 5.81 ✅ |
| teal `#008F89` | solo rellenos (charts), nunca texto blanco encima (3.97) | texto: teal-700 sobre claro |
| magenta `#F4007A` | solo rellenos gráficos (barras vencidos) | botones usan `--destructive` |

Semántica fija: morado = proceso/marca · teal = positivo/en plazo · magenta = alerta/vencido · dorado = aviso (con texto oscuro) · gris = terminal/inactivo.

## Tipografía
Outfit (sans, todo incl. datos; números KPI en semibold, no mono) + Fira Code (código/tickets técnicos). Escala contenida, sin display exagerado.

## Componentes
shadcn/ui New York + `resources/js/helpers/tema.ts` (única fuente de color para Recharts, respeta `.dark`) + `helpers/fechas.ts` (pendiente: unificar 25+ formatos sueltos) + `helpers/presetsFecha.ts`.
Patrones: `PageHeader` icono + título + subtítulo · títulos-pregunta en dashboard · bandas HOY/PERÍODO · `BaseTemporalBadge` (Hoy/Por ingreso/Por cierre/Por informe/Por envío) · `EmptyState` único (pendiente) · un sistema de botones (pendiente: jubilar legacy) · un formato de fecha (pendiente).

## Reglas
- Copy plano para abogados; sin jerga dev en UI.
- Color nunca como único canal (badges llevan texto).
- Ojo-para-ver en tablas (anti-misclick); filas no clicables.
- % y tasas: si no hay base, "—" (compute-or-defer).
- Un batch = un commit + build + tests + visto bueno.
