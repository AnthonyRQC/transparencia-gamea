# 02 — Tecnologías y justificación (por qué estas y no otras)

Cada tecnología del sistema con versión declarada, motivo de elección y alternativa descartada. Leyenda: EVIDENCIA = verificable en código; CRITERIO = juicio de ingeniería; PENDIENTE = por confirmar.

## Quick path (respuesta de 30 segundos)

Stack monolítico Laravel 13 + Inertia v2 + React 18: un solo despliegue, sin API separada, con permisos calculados en servidor. MySQL como BD institucional. Resto de piezas por productividad y costo de mantenimiento.

## Detalles

| Tecnología | Versión declarada + dónde | Por qué se eligió | Alternativa descartada y por qué |
|------------|---------------------------|-------------------|----------------------------------|
| PHP | 8.3 — EVIDENCIA `composer.json:8` | Requisito de Laravel 13; tipado y enums usados en `EstadoDenuncia` | PHP 8.2: CRITERIO se descartó por quedar sin soporte antes |
| Laravel | 13 — EVIDENCIA `composer.json:11` | Estructura MVC + migraciones/seeders/colas del proyecto; equipo con experiencia | API separada + SPA puro: CRITERIO descartado por doble despliegue y auth duplicada |
| Inertia Laravel | 2.0 — EVIDENCIA `composer.json:10` | Une backend y React sin API REST intermedia; props compartidas de permisos | REST + JWT propio: CRITERIO descartado por superficie de seguridad mayor |
| Inertia React | 2.0 — EVIDENCIA `package.json:10` |Ídem anterior, lado cliente | Next.js: CRITERIO descartado, SSR innecesario en intranet |
| React | 18.2 — EVIDENCIA `package.json:21-22` | Componentes reutilizables (Bandeja, Dashboard, Layout) | Blade puro + jQuery: CRITERIO descartado por UI interactiva (filtros, modales, dashboard) |
| TypeScript | 5.0.2 — EVIDENCIA `package.json:24` | Contratos de props/permisos (`permissions.ts`, `useCan`) | JS sin tipos: CRITERIO descartado por riesgo en matriz de 66 permisos |
| MySQL | Producción institucional (PENDIENTE versión servidor) | BD relacional estándar GAMEA; transacciones + `lockForUpdate` | SQLite: solo test (`phpunit.xml:26-27` sqlite :memory:) — CRITERIO no apto para concurrencia real |
| Tailwind | 3.2.1 — EVIDENCIA `package.json:23` | Utilidades + `darkMode: class`, tokens OKLCH, `--primary #4B0090` | Bootstrap: CRITERIO descartado por CSS global difícil de tematizar |
| shadcn/Radix | 24 comps en `resources/js/components/ui/` — EVIDENCIA conteo dir | Accesibilidad Radix + copia local modificable | MUI: CRITERIO descartado por peso y dependencia externa |
| Vite | 5 — EVIDENCIA `package.json:25` | Build rápido, estándar Laravel 13 | Mix/Webpack: CRITERIO obsoleto |
| Ziggy | 2 — EVIDENCIA `composer.json:15`; uso EVIDENCIA `Dashboard.tsx:16,123` | Rutas Laravel en JS tipadas | URLs hardcodeadas: CRITERIO descartado por rotura ante refactors |
| Breeze | 2.4 dev — EVIDENCIA `composer.json:19` | Auth base (login, perfil) sin reinventar | Jetstream/Fortify: CRITERIO exceso para 4 roles simples |
| Sanctum | 4 — EVIDENCIA `composer.json:12` | Sesiones + SSE `/notifications/stream` | Passport: CRITERIO exceso OAuth innecesario |
| Excel / DomPDF | 4 / 3.1 — EVIDENCIA `composer.json:14,9` | Exportes de reportes exigidos (`reporte.exportar`) | PDF manual: CRITERIO costo de maquetación |
| PHPUnit | 12 — EVIDENCIA `composer.json:24` | Suite estándar Laravel (21 ficheros: Unit 1 + Feature 19 + TestCase) | Pest: CRITERIO cambio de sintaxis sin beneficio |
| collision | 8.6 real — EVIDENCIA `composer.json:23`. OJO: AI-CONTEXT dice 9.0 | Solo mensajes de error bonitos en CLI | Ninguna (dev-only) |
| date-fns / recharts / tiptap / sonner / next-themes 0.4.6 | EVIDENCIA `package.json` | Fechas, gráficos dashboard, editor informe, toasts, tema | Moment/Chartwiki: CRITERIO peso y mantenimiento |

## Discrepancias a declarar (no ocultar)

| # | Tema | Estado |
|---|------|--------|
| 1 | collision 8.6 (`composer.json:23`) vs 9.0 documentado en AI-CONTEXT | PENDIENTE corregir doc, vale lo de `composer.json` |
| 2 | Colores `#690bb2/#fecd2a` NO existen en `resources/` (legacy); reales `--primary #4B0090`, `--secondary #F5B400`, sidebar `#1E0A33` en `app.css` | EVIDENCIA grep negativo + `app.css` |
| 3 | DB por defecto sqlite (tests) vs MySQL producción | EVIDENCIA `phpunit.xml:26-27`; PENDIENTE mostrar `.env.example` y config producción |

## Checklist

- [ ] Cada "por qué" distingue EVIDENCIA de CRITERIO.
- [ ] Muestro `composer.json` y `package.json` en vivo si lo piden.
- [ ] Declaro las 3 discrepancias antes de que las encuentren.

## Siguiente paso

Ver `03-Preguntas-Respuestas.md` para respuestas con evidencia lista.
