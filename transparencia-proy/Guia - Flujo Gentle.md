# Trabajar con el flujo Gentle sin duplicar documentación

Esta guía explica dónde trabajar, cómo elegir la ruta de cada cambio y dónde registrar cada decisión. Sirve para avanzar por tareas pequeñas con un solo lugar canónico por decisión y sin copiar el mismo contenido en varios archivos.

## Quick path

1. Trabajar en opencode: abrir la sesión y usar los comandos /sdd-* cuando el cambio lo requiera.
2. Usar Warp con gentle-ai/gga solo para instalación y control: `gga init`, `gga install`, `sdd-status`, `review mode status`.
3. Después del mensaje Done o Press Enter, pulsar solo Enter y continuar en opencode.
4. Verificación: el cambio queda en su rama feature con commits por unidad de trabajo y la documentación vive en un solo lugar canónico.

## Detalles

### 1. Dónde trabajar

| Entorno | Uso | Comandos |
|---|---|---|
| opencode | Mesa de trabajo: sesiones, cambios de código, comandos /sdd-* | `/sdd-*` según la fase |
| Warp con gentle-ai/gga | Solo instalación y control del flujo | `gga init`, `gga install`, `sdd-status`, `review mode status` |

La regla práctica es simple: el trabajo diario ocurre en opencode y Warp solo instala y supervisa. Cuando aparezca Done o Press Enter, basta con pulsar Enter.

### 2. Cómo trabajar desde ahora (ODD como ruta por defecto)

Explorar primero, en proporción al tamaño del cambio: un cambio pequeño requiere una lectura acotada y un cambio amplio requiere mapear los símbolos afectados antes de editar.

Elegir una sola ruta por cambio:

| Ruta | Cuándo usarla |
|---|---|
| Directa en línea | Cambio pequeño y bien acotado que usted puede aplicar directamente |
| Directa delegada | Cambio que conviene delegar con instrucciones precisas |
| SDD | Cambio que el usuario pidió gestionar con SDD o con propuesta SDD ya aceptada (ver sección 3) |

Reglas de trabajo:

- Dividir el trabajo en tareas pequeñas, cada una con su checklist.
- Un commit como unidad de trabajo por tarea, en rama feature. Si la sesión está en main, crear la rama primero.
- Tests y documentación junto al código, en el mismo cambio.
- Mensajes con Conventional Commits.
- Las 400 líneas son una heurística de planificación, no un límite: si un cambio crece, se planifica en partes sin dividir de forma artificial un cambio coherente.
- TDD lo define el proyecto y su runner: si el proyecto usa el ciclo RED, GREEN, REFACTOR, se sigue ese ciclo; si no, se aplican las comprobaciones funcionales ordinarias.
- Por tarea se ejecutan las comprobaciones aplicables del proyecto: `npm run dev` o `npm run build` para frontend, `php artisan serve` para servir, `php artisan test` para pruebas y `php artisan migrate:fresh --seed` para reconstruir la base de desarrollo cuando la tarea lo requiera.
- La revisión nativa por commit o por porción se usa solo si el usuario habilitó RDD.

### 3. Cuándo usar SDD

Solo con pedido explícito del usuario o con propuesta aceptada. La secuencia es:

`explore` -> `propose` -> `spec` -> `design` -> `tasks` -> `apply` -> `archive`, con `verify` opcional.

| Tema | Decisión |
|---|---|
| Preflight | Pace, Artifacts y PR, una vez por sesión |
| Tienda de artefactos | `engram`, `openspec` o `hybrid`, según lo acordado |
| Entrega | `ask-on-risk`, `auto-chain`, `single-pr` o `exception-ok`, según el riesgo y lo acordado |
| Tamaño de PR | 400 líneas por PR como guía para revisiones manejables |

### 4. Dónde vive cada cosa

Regla: un solo lugar canónico por decisión; el resto enlaza.

| Contenido | Lugar canónico |
|---|---|
| Documentos de larga vida (LEY 974, esquemas de BD, guía de instalación) | Sus archivos de referencia actuales |
| Decisión canónica | Log de decisiones depurado (D) con espejo en Engram |
| Trabajo diario | `odd/tasks/<feature>.md` con espejo en Engram |
| Artefactos SDD | La tienda acordada (`engram`, `openspec` o `hybrid`) |
| Historial cerrado | `archivo/sprints-cerrados` |

### 5. Mapeo del flujo anterior al nuevo

El flujo anterior copiaba cada decisión tomada a mitad de sprint en planes, cierres, log, Deuda y AI-CONTEXT. Eso generó archivos sobrecargados: AI-CONTEXT de 230 líneas como índice vivo, Plan de Desarrollo monolítico, Sprints Pendientes mezclando pendientes y cerrados, planes 16, 18A, 18C y 13 ejecutados fuera de archivo, sin SSOT y con la disciplina lazy-load rota.

| Antes | Ahora |
|---|---|
| Decisión mid-sprint copiada en varios archivos | Congelar la decisión y registrarla una vez: ADR o depurar el log |
| Plan .md suelto en el nivel superior | Documento ODD de feature, o proposal SDD según el tamaño |
| Historial en .md dispersos | Engram más archivo en sprints-cerrados |
| Cierre duplicado en varios archivos | Checklist más evidencia en el commit |

### 6. Comandos slash: automáticos y manuales

Hable con naturalidad: el orquestador dirige cada pedido a la habilidad
correspondiente. Use un comando manual solo para control explícito.

| Comando | Tipo | Uso |
|---|---|---|
| `/sdd-init` | Automático (skill) | Inicializar el contexto SDD del repositorio |
| `/sdd-explore` | Automático (skill) | Explorar antes de proponer un cambio SDD |
| `/sdd-status` | Automático (skill) | Inspeccionar el estado del flujo |
| `/sdd-apply` | Automático (skill) | Implementar tareas SDD ya planificadas |
| `/sdd-verify` | Automático (skill) | Diagnósticos opcionales del cambio |
| `/sdd-archive` | Automático (skill) | Archivar el cambio con honestidad |
| `/sdd-onboard` | Automático (skill) | Recorrido guiado del ciclo SDD |
| `/sdd-new` | Manual (al orquestador) | Declarar un cambio nuevo |
| `/sdd-continue` | Manual (al orquestador) | Retomar el cambio en curso |
| `/sdd-ff` | Manual (al orquestador) | Avance rápido al siguiente paso |

Reglas:

- Los comandos manuales nunca se invocan como skills.
- Uso manual para control explícito: `/sdd-status` inspecciona, `/sdd-onboard` guía el recorrido, `/sdd-verify` ejecuta diagnósticos.
- Preflight (Pace, Artifacts y PR) una vez por sesión.
- Nunca `/sdd-apply` sin preflight ni artefactos.

### 7. Checklist del primer día

- [ ] Claves y accesos configurados.
- [ ] `gga init` e `install` ejecutados en cada repositorio.
- [ ] opencode reiniciado después de cada cambio de configuración.
- [ ] Rama de trabajo creada antes de modificar archivos.
- [ ] Estado de `review mode` comprobado (`review mode status`).

### 8. Glosario mínimo

| Término | Significado en una línea |
|---|---|
| ODD | Desarrollo guiado por documentos de tarea pequeños (`odd/tasks/`). |
| SDD | Desarrollo guiado por especificación, solo con pedido explícito. |
| RDD | Revisión guiada por hitos nativos de commit o porción. |
| Engram | Memoria persistente entre sesiones con espejo de decisiones. |
| CodeGraph | Grafo de símbolos del código para mapear cambios amplios. |

### 9. Warp: solución de problemas frecuentes

| Síntoma | Acción |
|---|---|
| Aparece Done o Press Enter | Pulse solo Enter y continúe en opencode. |
| Menús que no avanzan | Use flechas para moverse, Espacio para elegir y Enter para confirmar. |
| Cambios de configuración sin efecto | Reinicie opencode y repita la comprobación. |

### 10. Mapa de dónde mirar primero

1. `transparencia-proy/AI-CONTEXT.md`: índice del proyecto.
2. `transparencia-proy/decisiones/Indice.md`: decisiones canónicas.
3. `odd/tasks/`: trabajo diario en curso.
4. `transparencia-proy/archivo/`: historial cerrado.

Fuentes para la tesis:

| Fuente | Aporte |
|---|---|
| LEY 974 | Marco normativo. |
| Esquemas de BD (Negocio, Catálogos) | Estructura de datos. |
| Guía de instalación | Entorno reproducible. |
| Decisiones (Indice + ADR) | Decisiones canónicas. |
| Archivo (evidencia) | Respaldo de cierres. |
| Deuda | Limitaciones declaradas. |

Normativa completa: `AGENTS.md` (§§ arranque, documento de tarea,
registro decisiones, plan/cierre, verificación). Plantilla y registro:
`transparencia-proy/decisiones/PLANTILLA-ADR.md` e `Indice.md`.

## Checklist

- [ ] Puedo confirmar dónde trabajar: opencode para sesiones y Warp con gga solo para instalación y control.
- [ ] Puedo confirmar que ODD es la ruta por defecto y que cada cambio usa una sola ruta.
- [ ] Puedo confirmar que cada tarea pequeña cierra con un commit como unidad de trabajo en rama feature, con tests y docs junto al código.
- [ ] Puedo confirmar que SDD se usa solo con pedido explícito o propuesta aceptada, siguiendo explore, propose, spec, design, tasks, apply y archive.
- [ ] Puedo confirmar que cada decisión vive en un solo lugar canónico y el resto enlaza.
- [ ] Puedo confirmar el mapeo del flujo anterior al nuevo para decisiones, planes, historial y cierres.
- [ ] Puedo confirmar qué comandos slash son automáticos y cuáles se escriben al orquestador.
- [ ] Puedo confirmar el checklist del primer día y el glosario mínimo.
- [ ] Puedo confirmar qué hacer ante Done, menús de Warp y cambios de configuración.
- [ ] Puedo confirmar el mapa de dónde mirar primero y las fuentes para la tesis.

## Next step

Congelar AI-CONTEXT como índice, archivar los planes 13, 16, 18A y 18C en sprints-cerrados, renombrar el log a D1-D25 y luego ejecutar el análisis completo de la aplicación.
