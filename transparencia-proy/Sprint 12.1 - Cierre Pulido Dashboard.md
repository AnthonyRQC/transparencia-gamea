# Sprint 12.1 — Cierre Pulido Dashboard y Reportes

**Período:** Septiembre 2026 · **Stack:** Laravel 13 / PHP 8.3
**Origen:** pulido pendiente del Sprint 12 (presets + drill-down) ampliado con auditoría de preguntas del usuario (banco de 22), bugs reportados y rediseño amigable.
**Estado:** ✅ Cerrado. Suite: **88 tests** · Build OK.

## 1. Datos demo frescos (base de todo)
- Seeders con fechas relativas a hoy: **124 casos** (85 activos: 72 en plazo + 9 próximos + 4 en mora intencional; 31 cerradas, 29 cumplidas ≈94%). Siguiente ticket: 125.
- `DenunciaMasivaSeeder`: fixes `anonimo`, fuera `prueba archivo`, `mt_srand(2026)`, negación más reciente que corrupción + `crearCasosVolumen()` (40 casos realistas, **sin lorem ipsum** por decisión explícita: rompería buscadores y filtros).
- Backup: `backup-transparencia-2026-09-06.sql` (0.6 MB).
- Decisión: la fuente son los seeders, no los `.sql`.

## 2. Time Machine (solo local) + Alertas derivadas
- `/dev/tiempo` (`SimularFecha` + `Carbon::setTestNow`) + enlace dev-only en Sidebar con badge + banner ámbar.
- **Bug encontrado por el usuario:** middleware con `prepend` corría antes de `StartSession` y la fecha se perdía en silencio → cambiado a `append`. Tests `TimeMachineTest` (3).
- `AlertasPlazo`: avisos vivos no persistidos (plazo ≤3d, solicitud/descargo ≤2d), scoping por rol, fusionadas en campana. Respetan fecha simulada.

## 3. Presets de fecha (Sprint 12 §6 Q3)
- Hoy / 7 días / Último mes / Trimestre / Año / Todo + personalizado (`presetsFecha.ts`); default Último mes al entrar (con toast avisando); chip con etiqueta ("Fecha: Último mes (…→…)").

## 4. Drill-down (Sprint 12 §11, extendido)
- Clic en: Embudo (estado, sin rango), Clasificaciones, Medios, barra de técnico, líneas y puntos de Evolución (rango por granularidad día/semana/mes), Dependencias (filtro subárbol `dependencia_id`), tarjetas Rechazadas / Qué ingresó.
- **Bug reportado por el usuario (penal 4→1, whatsapp vacío):** el gráfico contaba por `redactado_at`/`cerrado_at` y el modal filtraba por `created_at` → nuevo `fecha_base` (`ingreso|informe|cierre|rechazo`, con inferencia) en `preview`/`queryBase`/`exportar`. Modal honesto + "Abrir en Reportes" prominente + ojo por fila (anti-misclick, a pedido).
- `medio_id` y `dependencia_id` agregados a `queryBase`/`filtrosEntrada` (con tests).

## 5. Exportación inteligente
- Modal con total ("N denuncias → saldrán todas"), preview paginado, **columnas elegibles solo en Excel** (13, whitelist, default = formato cliente/MAE).
- **Columnas del cliente por defecto:** fecha ingreso, nro denuncia, tipo, denunciante (solo nombres; ANÓNIMO si aplica, Ley 974 Art. 24/29), denunciados por coma (`NOMBRE (DEPENDENCIA)`; NO IDENTIFICADO), SITPRECO, técnico, conclusión del informe (fecha + resumen, por decisión), clasificación. Descarga real verificada: 84 filas entonces.
- Modal unificado en página Reportes. PDF intacto a propósito (% fuera del PDF: es gestión interna, no cifra de informe).

## 6. Rediseño amigable (building-dashboards + banco de preguntas)
- Títulos-pregunta + subtítulos de una línea por panel; bandas HOY / PERÍODO con rango dinámico; badge con base real (Hoy/Por ingreso/Por cierre/Por informe/Por envío).
- KPIs 5+3 en Outfit; **reorden por reactividad (idea del usuario):** fila 1 foto de hoy (+Sin técnico), fila 2 período; cumplimiento "—" sin cierres; Sin técnico/Por vencer/Vencidos clicables.
- Carga horizontal; Urgentes con total; filtro Estado con aviso de alcance.
- Skills: `building-dashboards` (axiomhq) y `impeccable` (pbakaus) instalados a nivel proyecto. Critique impeccable al Dashboard: **21/40 Aceptable**, snapshot en `.impeccable/critique/`.

## 7. Sistema de color (Fase 0 visual)
- Tokens migrados a paleta institucional: `--primary #4B0090`, `--secondary #F5B400`, sidebar `#431377`, destructive → magenta `#F4007A` (+ variantes dark). PDF/Excel/Welcome/DesignSystem actualizados.
- `helpers/tema.ts`: fuente única para Recharts (lee tokens, respeta dark, fallback hex). Semántica: morado proceso, teal `#008F89` positivo, magenta alerta, dorado aviso, gris terminal.
- Nota: evaluar variante sidebar negra con impeccable (página pública la conserva).

## 8. Banco de preguntas
- `Banco de Preguntas - Dashboard.md`: 22 preguntas con Dónde + Pasos verificados + Escenario + casilla de prueba. Todas probadas por el usuario salvo nuevas mejoras anotadas.

## Pendiente (no de este sprint)
- P2: chips con fechas localizadas, Reset→Limpiar.
- Teclado completo en Recharts (badge focuseable hecho; barras sin tabIndex).
- Login/Perfil legacy, 19 páginas con impeccable, rediseño PDF con formato cliente.
- Siguiente: **Sprint 13 — Tablero Público Cerrados**.
