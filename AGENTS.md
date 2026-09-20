# Transparencia — Instrucciones de trabajo

Este archivo es la fuente normativa de trabajo para agentes. Se carga
automáticamente como instrucciones. `transparencia-proy/AI-CONTEXT.md`
es el índice del proyecto y contiene un puntero hacia aquí; la regla
completa vive en este archivo para evitar duplicación y divergencia.

## 1. Arranque

1. Al iniciar, leer primero `transparencia-proy/AI-CONTEXT.md` completo.
2. Continuar con carga diferida: abrir solamente la sección o el archivo
   que corresponda a la tarea actual. No abrir `archivo/` por defecto.
3. Si la tarea toca base de datos, consultar además el esquema
   correspondiente (`Esquema BD - Negocio.md` o `Esquema BD - Catalogos.md`).
4. Si la tarea puede haberse tratado antes, buscar en Engram
   (`mem_context`, luego `mem_search`) antes de proponer un enfoque nuevo.
5. Antes de concluir, verificar el resultado según la sección 5.

## 2. Desarrollo con documento de tarea

Cada cambio sustancial comienza con un documento en `odd/tasks/<tema>.md`
en inglés, creado antes de cualquier otra escritura, y con una copia de
respaldo en Engram bajo el mismo `topic_key` antes del primer `write`.

| Paso | Acción |
|------|--------|
| Documento | Crear `odd/tasks/<tema>.md` con objetivo, alcance y criterios |
| Respaldo | Registrar el documento en Engram con el mismo `topic_key` |
| Rama | Crear la rama de trabajo antes de modificar archivos |
| Unidad | Un cambio por unidad: código con sus pruebas y su documentación |

Los commits siguen Conventional Commits sin `Co-Authored-By` y sin
atribución a IA. Cada commit representa una unidad revisable: el
repositorio conserva sentido al aplicar solamente ese commit y su
reversión no arrastra trabajo ajeno. Las pruebas pertenecen al mismo
commit que el comportamiento que verifican; la documentación acompaña
al cambio visible que explica. Cada tarea se cierra con al menos un
commit de unidad en su rama de trabajo; si la tarea está en la rama
por defecto, se crea primero la rama y luego se trabaja en ella.
El documento de la tarea registra el SHA y el `diff --stat` como
evidencia antes de dar la tarea por terminada.

## 3. Registro de decisiones

Cuando una decisión de arquitectura o de diseño deba conservarse:

1. Copiar `transparencia-proy/decisiones/PLANTILLA-ADR.md` como
   `transparencia-proy/decisiones/D00-titulo-corto.md` y completar los
   5 campos: Contexto, Opciones, Decisión, Por qué no las otras y
   Consecuencias.
2. Agregar la fila correspondiente en `transparencia-proy/decisiones/Indice.md`.
3. Actualizar en Engram la observación con el mismo `topic_key`.
4. El registro anterior (`Decisiones 12.5 - 13 (Log).md`) se conserva
   solamente como histórico enlazado; no recibe entradas nuevas.

Solo se registra lo que afecta decisiones futuras; los detalles de
implementación quedan en el documento de la tarea correspondiente.

## 4. Plan y cierre

El plan y el cierre de cada tarea viven en su documento de
`odd/tasks/`. La evidencia de respaldo (cierre, notas de verificación)
se archiva en `transparencia-proy/archivo/` cuando corresponda. No se
triplica el contenido entre plan, cierre y registro histórico: cada
pieza conserva solamente su propósito. El cierre indica qué quedó
verificado y qué queda pendiente para la siguiente sesión.

## 5. Verificación por unidad

- [ ] Cada unidad registra `<comando>: <resultado observado>` en su
  documento; si algo falla se indica como parcial con el motivo.
- [ ] Los cambios de documentación se verifican con lectura directa
  del archivo modificado y revisión puntual del diff.
- [ ] Los cambios de código se verifican con la prueba enfocada y el
  resultado exacto antes del commit.
- [ ] Si no existe un límite ejecutable, se declara `N/A` con el motivo.

## Siguiente paso

Ante una tarea nueva, crear su documento en `odd/tasks/` y continuar
con el flujo descrito arriba.
