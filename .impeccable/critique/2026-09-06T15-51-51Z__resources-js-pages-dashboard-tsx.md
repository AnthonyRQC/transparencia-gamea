---
target: Dashboard UTLCC
total_score: 21
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 3
target_identity: "file:C:\\laragon\\www\\transparencia\\resources\\js\\Pages\\Dashboard.tsx"
target_fingerprint: "sha256:40c98fb7f9df510ed21fa03e4a05472206351ce2945a1b869973dede8da8e658"
target_path: "C:\\laragon\\www\\transparencia\\resources\\js\\Pages\\Dashboard.tsx"
timestamp: 2026-09-06T15-51-51Z
slug: resources-js-pages-dashboard-tsx
---
# Critique — Dashboard UTLCC (impeccable, run 1)

Target: resources/js/Pages/Dashboard.tsx + Components/Dashboard/*.
Modo: Operate (abogados, Jefe/Técnicos, 1280x720 sin scroll).
Paleta vigente en código: #690bb2 + #fecd2a (migración a #4B0090/#431377/#F4007A/#008F89/#F5B400 pendiente).

## Heurísticos (Nielsen 0-4)
| # | Heurístico | Pts | Issue clave |
|---|---|---|---|
| 1 | Visibilidad del estado | 1 | Auto-aplica "Último mes" sin aviso; chip dice período pero KPIs/embudo muestran hoy |
| 2 | Mundo real | 3 | Títulos-pregunta excelentes; fugas: embudo, SITPRECO, "Del período", fechas Y-m-d crudas |
| 3 | Control y libertad | 2 | Chips con X + Reset bien; Reset vs Restablecer duplicados; Todo parece no hacer nada |
| 4 | Consistencia | 2 | Solo "Sin técnico" es clicable; clic en barras solo Jefe con mouse; Reset en inglés |
| 5 | Prevención de errores | 1 | Mezcla silenciosa de bases (ingreso/cierre/informe); error de red se lee como "Sin casos" |
| 6 | Reconocimiento | 2 | 5 bases colapsadas en un "Del período"; regla del filtro Estado hay que memorizarla |
| 7 | Flexibilidad | 2 | Presets bien; sin vistas guardadas; tab se resetea al abrir el Sheet |
| 8 | Minimalismo | 2 | 8 KPIs + badges + chips en 720p; 4 grises compiten con el dato |
| 9 | Recuperación de errores | 2 | Buenos empty states; errores de red indistinguibles de "vacío" |
| 10 | Ayuda | 3 | Mejor punto: subtítulos contextuales (plazo 5 días, ≤5 días, ordenados...) |
| **Total** | | **21/40** | **Aceptable (52%)** |

## Especificidad
Copy de producto (preguntas, Ley 974, drill-down honesto) sobre cuerpo shadcn genérico: 8 cards idénticas, Tooltip/Legend Recharts por defecto, paleta arcoíris, números mono que rompen Outfit. Morado/gold como acentos sueltos, no sistema.

## Detector
CLI `impeccable detect --json` sobre Dashboard + helpers: 0 hallazgos mecánicos (exit 0). Todo lo anterior es nivel diseño, no mecánico. Sin automatización de navegador en este entorno: sin overlays; evidencia = código + detector.

## Carga cognitiva: ALTA (6/8 fallos)
Falla: foco único (8 KPIs), una base por pantalla (6 bases conviviendo), jerarquía (4 grises vs dato), color=significado (verde×3, gris×3), memoria (regla del filtro Estado), affordance de clic, densidad 720p. Pasa: títulos responden 1 pregunta.

## Issues prioritarios
- **[P0] Mentira temporal**: chip dice período, mitad de la pantalla dice hoy. Bandas HOY vs PERÍODO + badge con base real (Ingreso/Cierre/Informe/Envío) + toast al auto-aplicar preset. (clarify)
- **[P1] 8 KPIs ilegibles en 720p**: reducir a 5, Outfit sin truncate, split con conteos. (layout, typeset)
- **[P1] Arcoíris sin código**: sistema de 4 colores institucionales con semántica única + contraste AA; LabelList en foreground. (colorize)
- **[P1] Clic fantasma**: affordance visible solo si onSelect + alternativa teclado (Recharts onClick no es accesible); mismos Links en Vencidos/Por vencer. (polish)
- **[P2] Chips en IDs y fechas crudas**: "Últimos 30 días: 7 ago → 5 sep", nombres siempre, Reset→Limpiar, conteo en Aplicar. (distill)

## Personas
- **Jordan (no-técnico)**: "Todo el período" ¿de cuándo a cuándo; regla del filtro Estado críptica; "Sprint 14" y "subordinadas" son jerga dev; "Días: -12 d" ambiguo.
- **Sam (accesibilidad)**: gold #fecd2a sobre blanco y muted 10-11px bajo AA; barras sin tabIndex/role; badge-tooltip solo hover; gráficos sin alternativa tabular; error de red = "Sin casos".

## Menores
Icono RefreshCw en tab Operativo; Reset vs Restablecer; YAxis width trunca etiquetas; tab se fuerza a operativo al abrir Sheet.

## Preguntas
1. Si el Jefe tuviera 10 segundos antes de audiencia, ¿qué número único defendería y por qué hoy compite con otros 7?
2. Si el color fuera el único canal prohibido (fotocopia B/N), ¿qué gráfico sobreviviría?
