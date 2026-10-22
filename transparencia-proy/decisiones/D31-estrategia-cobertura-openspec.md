# D31 — Estrategia de cobertura y backfill formal en OpenSpec

## 1. Contexto

El proyecto Transparencia adoptó OpenSpec como estándar de contratos formales de diseño y especificación técnica, pero solo se cuenta con 2 specs publicadas en `openspec/specs/` (`public-consultation` y `public-portal`). En `openspec/changes/` existen dos propuestas cuyos cambios ya fueron incorporados al código pero cuyas tareas siguen desmarcadas (`fase-a-quick-wins` con 10 tareas y `fase-b-casos-legacy` con 8 tareas pendientes de checklist en `tasks.md`). El resto del sistema crítico opera bajo contratos implícitos en código y tests. Para ordenar la especificación sin frenar la entrega ni descuidar el riesgo normativo, se requiere una estrategia de cobertura priorizada.

## 2. Opciones (con ventajas y desventajas)

- Opción A: Intentar especificar todo el sistema en una sola pasada exhaustiva antes de continuar.
  - Ventaja: Cobertura total teórica.
  - Desventaja: Bloquea el desarrollo por semanas, retrasa la salida a producción y consume recursos en áreas de bajo riesgo.
- Opción B: Dejar el sistema existente en "código + tests" y usar OpenSpec solo para requerimientos nuevos a futuro.
  - Ventaja: Cero esfuerzo inmediato de documentación.
  - Desventaja: Mantiene desprotegido el núcleo legal de la Ley 974 (plazos perentorios y reserva de identidad) frente a refactorizaciones o regresiones.
- Opción C (Elegida): Plan de backfill priorizado por riesgo legal en 5 pasos (sincronización + 4 prioridades).
  - Ventaja: Enfoca el rigor en lo legalmente vinculante (ciclo de vida, RBAC y auditoría), formaliza el archivo ordenado de las Fases A y B, y tolera temporalmente áreas secundarias en "código + tests".
  - Desventaja: Requiere convivencia planificada entre dominios especificados y dominios en transición.

## 3. Decisión

Se aprueba formalmente la siguiente hoja de ruta de cobertura en OpenSpec (2026-10-21):
1. **Sincronización y archivo de Fases A y B:** Verificar cada tarea contra código y tests, marcarla, y archivar en una rama separada `docs/openspec-backfill`. No promover manualmente. El flujo operativo requerido es: ejecutar `openspec validate <change>`, luego `openspec archive <change> --yes`, y al final `openspec validate --archived`. Las tareas incompletas generan warning y no bloquean el comando `archive`, pero `openspec validate --archived` falla si quedan sin marcar, por lo que es mandatorio completarlas previamente. Respecto a la metadata, es recomendable crear `.openspec.yaml` con `schema: spec-driven` y `created` en `fase-b-casos-legacy` para dejar el schema explícito; si falta, OpenSpec no lo considera un error, solo trata el change como sin metadata. Archivar ambos changes agregará 8 specs nuevas (7 de Fase A + 1 de Fase B), elevando el catálogo canónico de 2 a 10 specs.
2. **Prioridad 1 — Ciclo de vida y Plazos (Riesgo Legal Crítico):** Spec de máquina de estados de la denuncia y cálculo de plazos de Ley 974 (5d/45d/20d + ampliaciones).
3. **Prioridad 2 — RBAC y Autorización:** Spec de la matriz de roles (`admin`, `jefe`, `investigador`, `registrador`), doble llave `CasoAuth` y delegación temporal.
4. **Prioridad 3 — Auditoría y Trazabilidad:** Spec del modelo append-only (D29), extractos operativos/técnicos y constancia individual.
5. **Régimen de facto temporal:** Dashboard, reportes y publicaciones permanecen temporalmente bajo el régimen de "código + tests" hasta concluir las prioridades 1 a 3.

## 4. Por qué no las otras

La Opción A es inviable por carga cognitiva y parálisis operativa; la Opción B deja expuesto el núcleo de cumplimiento estatal ante auditorías externas. La priorización por riesgo legal garantiza que los aspectos pasibles de responsabilidad funcionaria queden blindados con especificación formal primero.

## 5. Consecuencias

- Todo cambio que afecte el ciclo de vida, autorización o auditoría requerirá delta spec en OpenSpec.
- Dashboard y reportes pueden evolucionar mediante tareas ODD convencionales hasta su turno de backfill.
- Las especificaciones de Fase A y B pasarán a ser especificaciones canónicas del proyecto cuando se archiven en su rama correspondiente.
- No se archiva ningún cambio en la rama actual `docs/gobierno-documental`.

## Lista de aceptación

- [x] Los 5 campos están completos y son verificables.
- [x] Las opciones incluyen ventajas y desventajas.
- [x] La decisión indica fecha y alcance.
- [x] El documento evita datos no confirmados.
- [x] La fila correspondiente existe en `Indice.md`.
