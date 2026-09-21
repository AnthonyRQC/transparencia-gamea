# 04 — Guion de exposición técnica (30–40 min)

Propuesta 35 min: 5 contexto + 20 demo + 10 preguntas. Cada bloque termina en checkpoint verificable. Plan B incluido.

## Quick path (esqueleto)

Contexto (5) → Bandeja y ciclo (8) → Plazos y permisos (6) → Notificaciones y dashboard (6) → Archivos y cierre (5) → Preguntas (10).

| Min | Bloque | Hacer en vivo | Checkpoint | Transición |
|-----|--------|---------------|------------|------------|
| 0-5 | Contexto y alcance | Diagrama módulos; enum `EstadoDenuncia.php:7-17` | Tribunal ubica 9 estados | "Con el mapa claro, veamos el ciclo real…" |
| 5-13 | Demo ciclo | Bandeja → admitir → asignar → investigar → informe → cierre; rutas `denuncias.php:39-69` | Caso cambia de estado con `can:` | "El ciclo vive de plazos; veamos cómo se calculan…" |
| 13-19 | Plazos + permisos | Semáforo (`Denuncia.php:100-116`); login por rol; delegar/reasumir (`admin.php:50-52`) | Amarillo/rojo correcto; admin sin `caso.*` | "Con permisos claros, veamos avisos y datos…" |
| 19-25 | Notifs + dashboard | Campana (registrador excluido `Header.tsx:96-98`); SSE `/notifications/stream`; dashboard SQL | Notificación llega; gráfico cuadra | "Cerramos con evidencia documental…" |
| 25-30 | Archivos y cierre | Subir/ver archivo; archivar-subestado (`CierreController.php:178-186`) declarado como hallazgo | Archivo visible; TODO archivar anotado | "Dejo el hallazgo sobre la mesa y abro preguntas…" |
| 30-40 | Preguntas | Usar `03-Preguntas-Respuestas.md` Q1/Q4/Q7/Q14/Q18 | Cada respuesta con ruta:línea | — |

## Checkpoints demo (qué debe verse sí o sí)

- [ ] Bandeja filtra y abre caso.
- [ ] admitir → asignar → investigar → informe → cierre en orden.
- [ ] Plazo con feriado intermedio mantiene día 1 = mañana hábil.
- [ ] Admin NO ve operar casos; jefe sí.
- [ ] Campana oculta para registrador.
- [ ] Dashboard SQL coincide con conteos.

## Plan B (si algo falla)

| Falla | Plan B (30 s) |
|-------|---------------|
| Sin red/SSE | Capturas + `NotificacionSeeder.php:14-161` abierto |
| 403 inesperado | Mostrar `can:` en `denuncias.php:39-69` como explicación, no bug |
| Plazo no cuadra | Abrir `DiasHabiles.php:59-74` + tabla feriados seed |
| Pregunta de conteos | Contar en vivo (`ls`, `grep -c`); declarar PENDIENTE lo no verificado |
| Archivar incómodo | Frase: "Subestado hoy, enum reservado; falta decisión del cliente, aquí el TODO" |

## Frases de transición (cortas)

- "Esto no lo afirmo yo, lo dice esta línea…"
- "Lo que sí es criterio de diseño es…; lo demás es evidencia."
- "Este dato queda PENDIENTE y lo declaro como tal."

## Cierre (1 min)

"Eficiencia con garantías: máquina de estados con permisos, plazos legales auditables y hallazgos declarados. Quedo a sus preguntas con el código abierto."

## Siguiente paso

Ensayar una vez con cronómetro; archivar evidencia en `transparencia-proy/archivo/` si aplica.
