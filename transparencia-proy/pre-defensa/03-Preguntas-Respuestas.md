# 03 — Preguntas y respuestas previsibles (con evidencia y demo)

Respuesta sólida en 2–3 frases + evidencia exacta + qué mostrar en vivo. Las incómodas van al final y se responden con honestidad técnica.

## Quick path

Si solo hay tiempo para 5: Q1 (máquina de estados), Q4 (admin no opera), Q7 (días hábiles), Q14 (archivar), Q18 (despliegue).

## Seguridad

| # | Pregunta | Respuesta + evidencia | Mostrar en vivo |
|---|----------|----------------------|-----------------|
| 1 | ¿Cómo evitan transiciones ilegales? | Rutas con `can:` por transición + guardas `lockForUpdate`/`puedeOperar`. EVIDENCIA `routes/denuncias.php:39-69`; `AdmisionController.php:24,33,78,86` | Intentar admitir sin permiso → 403 |
| 2 | ¿Qué pasa con doble clic / concurrencia? | `lockForUpdate` en admisión/asignación; conteo advisory en saltar-fase. EVIDENCIA `AsignacionController.php:38,104`; saltar-fase `L65-66` | Dos pestañas admitiendo mismo caso |
| 3 | ¿Sesiones de usuarios dados de baja? | `EnsureActive` desactiva la sesión. EVIDENCIA `EnsureActive.php:16-28` | Desactivar usuario y recargar |

## Permisos

| # | Pregunta | Respuesta + evidencia | Mostrar en vivo |
|---|----------|----------------------|-----------------|
| 4 | ¿Por qué el admin no opera casos? | Diseño: admin 17 permisos con cero `caso.*`; opera jefe/investigador. EVIDENCIA `PermisosCatalogo.php:89-204` | Login admin → sin bandeja de casos |
| 5 | ¿Cómo funcionan las delegaciones? | Efectivo = rol ∪ delegaciones activas; 28 delegables, excluye `usuario.*`/`admin.*`. EVIDENCIA `PermisosEfectivos.php:23-46`; `PermisosCatalogo.php:211-240,207-210` | Delegar evaluación y reasumir (`routes/admin.php:50-52`) |
| 6 | ¿Quién ve qué caso? | Dueño `investigador_id` + override supervisor; matrices UNIDAD 14 / SUPERVISOR 9 / EXPEDIENTE 23. EVIDENCIA `CasoAuth.php:23-80,92-102` | Bandeja jefe vs mis-casos investigador |

## Auditoría e integridad

| # | Pregunta | Respuesta + evidencia | Mostrar en vivo |
|---|----------|----------------------|-----------------|
| 7 | ¿Cómo calculan plazos? | Día 1 = mañana hábil (Ley 2341), skip finde/feriado, cache 3600 s. EVIDENCIA `DiasHabiles.php:12,59-74,18-27` | Caso con feriado intermedio |
| 8 | ¿De dónde salen 5/45/20 días? | 5 d en ingresada/evaluación; 45/20 + ampliaciones después. EVIDENCIA `Denuncia.php:80-86,97`. Base legal: admisión 5 d Art.23, info 10 d Art.25, descargo 10+5, máx 45 d (ver RESUMEN LEY 974) | Ficha del caso con semáforo |
| 9 | ¿Trazabilidad? | Bitácora + SoftDeletes + ticket `DEN-%04d-%04d`. EVIDENCIA `BitacoraService`; `Denuncia.php:14,20,144,154`; migración `165000:39` | Eliminar y mostrar lápida `DEL-` (`DenunciaController.php:239`) |
| 10 | ¿Mayúsculas inconsistentes? | `UppercaseText` normaliza en `saving`. EVIDENCIA `Trait:9-19`; campos `Denuncia.php:53-56` | Registrar en minúsculas |
| 11 | ¿Seguimiento ciudadano? | Formato `DEN-AAAA-NNNN-TOKEN`. EVIDENCIA `SeguimientoController.php:26,35` | Consulta pública |

## Escalabilidad y rendimiento

| # | Pregunta | Respuesta + evidencia | Mostrar en vivo |
|---|----------|----------------------|-----------------|
| 12 | ¿Aguanta más casos? | Queries dedicadas por dashboard + paginación (notifs pag 10). EVIDENCIA `app/Queries/` (9); `routes/cuenta.php:21-33` | Dashboard SQL + paginación |
| 13 | ¿N+1? | Plucks compartidos (`HandleInertiaRequests.php:55`) y queries agregadas; PENDIENTE profiling con dataset grande | Query log en bandeja |
| 14 | ¿Tiempo real? | SSE `/notifications/stream`, no websockets. CRITERIO suficiente para volumen UTLCC | Campana en vivo |

## Despliegue

| # | Pregunta | Respuesta + evidencia | Mostrar en vivo |
|---|----------|----------------------|-----------------|
| 15 | ¿Qué BD en producción? | MySQL institucional; sqlite solo tests. EVIDENCIA `phpunit.xml:26-27` | `.env.example` + migraciones 40 |
| 16 | ¿Feriados? | Tabla `feriados` + seed 15 (2026); plantilla es guía manual. EVIDENCIA `CatalogoSeeder.php:196-212`; `config/plantilla_feriados.php` | Admin feriados |
| 17 | ¿Tests? | 21 ficheros (Unit 1 + Feature 19 + TestCase). Reclamo "suite 118" PENDIENTE sin correr tests | Correr 1 test enfocado |

## Incómodas (responder primero, sin rodeos)

| # | Pregunta | Respuesta honesta + evidencia | Mostrar en vivo |
|---|----------|-------------------------------|-----------------|
| 18 | ¿Archivar es estado o subestado? | HALLAZGO: enum trae `ARCHIVADA` (`EstadoDenuncia.php:17`) pero `CierreController.php:178,182-186` conmuta subestado. TODO cliente: definir archivar físico vs lógico | Código lado a lado |
| 19 | ¿Colores institucionales? | Legacy `#690bb2/#fecd2a` NO existen en `resources/`; reales `#4B0090/#F5B400`, sidebar `#1E0A33` (`app.css`). PENDIENTE alinear manual | `app.css` + grep negativo |
| 20 | ¿collision 8.6 o 9.0? | Vale `composer.json:23` (8.6); AI-CONTEXT dice 9.0 por error. PENDIENTE corregir | `composer.json` abierto |
| 21 | ¿sqlite o MySQL? | sqlite `:memory:` solo tests (`phpunit.xml:26-27`); producción MySQL. Sin contradicción si se explica el entorno | Ambos archivos |
| 22 | ¿Conteos que no cuadran? | Migraciones 40 (vs 22 histórico), modelos 25 (vs 20), notif seed 12 = 5 base + 7 (`NotificacionSeeder.php:14-161`, vs 5 reclamado), dependencias 122 planas (`CatalogoSeeder.php:221-343` vs 185 árbol). PENDIENTE conteo DB `parent_id` y rerun suite | Conteos con `ls`/`grep -c` en vivo |

## Checklist

- [ ] Cada respuesta cita ruta:línea, no memoria.
- [ ] Incómodas ensayadas en < 60 segundos cada una.
- [ ] PENDIENTES declarados como tales, sin inventar.

## Siguiente paso

Ver `04-Guion-Exposicion.md` para el orden de la demo.
