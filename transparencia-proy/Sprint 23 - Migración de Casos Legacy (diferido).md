#transparencia
# Sprint 23 — Migración de Casos Legacy ⏸️ DIFERIDO

**Estado:** ⏸️ **Diferido.** Detalle a definir en Sprint 14 (BD real). Anotación temprana para no perder el requerimiento.

**Origen:** Duda del cliente Julio 2026 — la UTLCC tiene actualmente **46 denuncias físicas** que necesitan migrarse al sistema nuevo. Casos legacy no tendrán historial (bitácora) pero sí opción de digitalizar archivos.

**Estimación:** 2-3 días (referencia, a refinar cuando se implemente Sprint 14).

---

## 1. Contexto

### 1.1 Situación actual (Julio 2026)
- La UTLCC tiene **46 denuncias físicas** registradas en papel.
- Estas denuncias deben existir también en el sistema nuevo para tener trazabilidad digital.
- Los casos legacy tienen particularidades:
  - Sin historial de bitácora (no se puede reconstruir lo que pasó)
  - Sin plazos computables (la fecha de ingreso al sistema es ahora, no la fecha original)
  - Sin técnicos asignados formalmente (pueden tener referencia del último que lo manejó)
  - Con archivos físicos escaneables

### 1.2 Numeración
- El sistema actualmente usa tickets como `DEN-2026-0001`, `DEN-2026-0002`, ...
- El cliente quiere que el **siguiente ticket** respete la numeración física existente.
- Si la UTLCC tiene 46 denuncias físicas, el primer ticket del sistema debería ser `DEN-2026-0047` (continuación), no `DEN-2026-0001`.
- Esto requiere que el sistema permita **configurar el número de inicio por año**.

### 1.3 Filosofía
- Los casos legacy son un **registro histórico**, no un caso activo.
- El sistema los trata con un flag `es_legacy: true` para diferenciarlos.
- No entran en plazos, alertas, ni seguimiento público.

---

## 2. Funcionalidades planificadas (a detalle en Sprint 14)

### 2.1 Panel administrativo: Configuración de numeración
- Vista `/admin/configuracion` (extender `Sprint 10`)
- Input "Próximo número de ticket" (default 1)
- Botón "Guardar" — solo Jefe puede modificar
- Lee/escribe de tabla `configuracion_sistema` (Sprint 14)

**Comportamiento esperado:**
- Al generar un nuevo ticket, el sistema usa `configuracion_sistema.siguiente_numero_ticket`
- Después de generar, se incrementa en 1
- Se mantiene el formato `DEN-YYYY-NNNN`

### 2.2 Vista de "Importación legacy"
- Página `/admin/importar-legacy`
- Solo Jefe
- Carga masiva desde CSV/Excel
- Columnas esperadas: `numero_legacy, fecha_original, denunciante, denunciado, descripcion, categoria, estado_final, archivos`

**Comportamiento:**
- Vista previa antes de importar
- Validación de campos
- Opción de adjuntar archivos (PDFs escaneados)
- Confirmación con cantidad de casos a importar

### 2.3 Caso legacy en BD
- Tabla `denuncias` con flag `es_legacy: true`
- Sin plazos computables
- Sin bitácora histórica
- Estado final: `cerrada` (con subestado `archivada`) si ya está cerrado, o el estado actual si está activo
- Numeración: usa el número legacy, no se genera DEN-YYYY-NNNN nuevo
  - Ejemplo: `LEGACY-2026-001` (formato distinto para que no se confunda)

### 2.4 Vista de caso legacy
- En `DenunciaSheet`, si `es_legacy: true`:
  - Banner: "CASO LEGACY — Importado al sistema el [fecha_importacion]. Sin historial computable."
  - Sin tabs de Solicitudes/Descargos/Informe/Cierre
  - Solo datos básicos + archivos digitalizados
  - Read-only (no se puede editar, solo ver)

### 2.5 Tabla `denuncias_archivos` (Sprint 7.6) se usa
- Los archivos digitalizados se suben al repositorio con `contexto='general'` y `es_legacy: true`
- O un campo adicional `es_legacy: true` en `denuncias_archivos` (a definir)

---

## 3. Decisiones pendientes

### 3.1 Numeración
- ❓ ¿Los legacy mantienen su numeración original (LEGACY-2026-001) o se renumeran como DEN-2026-0047?
- ❓ ¿La numeración se reinicia cada año o es continua?
- ❓ ¿Qué pasa con los años anteriores? (¿se importan también o solo 2026?)

### 3.2 Fechas
- ❓ ¿Se importa la fecha original o se usa la fecha de importación?
- ❓ Si se importa la fecha original, ¿se permiten fechas pasadas?
- ❓ ¿Los legacy se ordenan por fecha original o por fecha de importación?

### 3.3 Edición
- ❓ ¿Se permite editar legacy o son read-only?
- ❓ ¿Quién puede ver legacy (Jefe, Técnico, Registrador)?

### 3.4 Reportes
- ❓ ¿Los legacy aparecen en reportes como un caso más o se filtran?
- ❓ ¿Hay reportes específicos de legacy (ej. cuántos casos físicos se han digitalizado)?

### 3.5 Archivos
- ❓ ¿Los archivos digitalizados se suben al nuevo sistema o solo se referencian?
- ❓ ¿Se respeta el formato original (PDF, JPG) o se normaliza?

---

## 4. Cambios en BD (Sprint 14, referencia)

### Tabla `denuncias` (modificar)
- Agregar `es_legacy` (BOOLEAN, default false)
- Agregar `numero_legacy` (VARCHAR 20, nullable) — para el ID legacy si se mantiene
- Agregar `fecha_original` (DATE, nullable) — fecha original del caso físico
- Agregar `fecha_importacion` (TIMESTAMP, nullable) — cuándo se importó al sistema
- Agregar `importado_por_id` (FK a usuarios, nullable)

### Tabla `configuracion_sistema` (nueva, ver `Esquema de Base de Datos.md`)
- `clave` (UNIQUE): 'siguiente_numero_ticket', 'anio_vigente', etc.
- `valor` (TEXT)
- `descripcion` (TEXT, MAYÚSCULAS)
- `actualizado_por_id` (FK a usuarios)
- `actualizado_at` (TIMESTAMP)

### Tabla `denuncias_archivos` (Sprint 7.6)
- Ya soporta subir archivos al caso.
- El flag `es_legacy` en la denuncia controla si los archivos son legacy o no.

### Vistas
- `v_denuncias_legacy` (opcional): JOIN con archivos, solo flag `es_legacy: true`

---

## 5. Cambios en frontend (referencia v1)

### Nuevos componentes
- `resources/js/Pages/Admin/ImportarLegacy.tsx` (nuevo)
- `resources/js/Pages/Admin/Configuracion.tsx` (nuevo) — incluye "Próximo número de ticket"
- `resources/js/Components/Admin/TablaVistaPreviaImportacion.tsx` (nuevo)

### Componentes modificados
- `DenunciaSheet.tsx`: detectar `es_legacy: true` y mostrar banner
- `Sidebar.tsx`: agregar item "Configuración" (extender Sprint 10)

---

## 6. Casos de uso esperados

### 6.1 Jefe importa 46 casos legacy
1. Jefe va a `/admin/importar-legacy`
2. Carga CSV con 46 filas
3. Vista previa muestra: "46 casos a importar. Categorías detectadas: ..."
4. Click "Importar"
5. Sistema crea 46 denuncias con `es_legacy: true`
6. Tickets: `LEGACY-2026-001` a `LEGACY-2026-046` (formato distinto)
7. Aparece mensaje: "Importación completa. 46 casos legacy creados."

### 6.2 Jefe configura numeración
1. Jefe va a `/admin/configuracion`
2. Input "Próximo número de ticket": 47
3. Click "Guardar"
4. Sistema actualiza `configuracion_sistema.siguiente_numero_ticket = 47`
5. El próximo caso nuevo tendrá ticket `DEN-2026-0047`

### 6.3 Técnico ve caso legacy
1. Técnico busca un caso `LEGACY-2026-005`
2. Abre DenunciaSheet
3. Ve banner: "CASO LEGACY — Importado el 2026-07-16. Sin historial computable."
4. Solo ve datos básicos + archivos digitalizados
5. Sin tabs de Solicitudes/Descargos/Informe/Cierre

---

## 7. Estimación (referencia)

**2-3 días** cuando se implemente Sprint 14. Incluye:
- Tabla `configuracion_sistema` (BD + CRUD)
- Flag `es_legacy` en `denuncias`
- Panel de configuración
- Vista de importación con CSV
- Detección de legacy en `DenunciaSheet`
- Testing con casos reales

---

## 8. Dependencias

- **Sprint 14 (BD):** necesario para crear `configuracion_sistema` y campos en `denuncias`
- **Sprint 10 (Panel Admin):** base para el panel de configuración
- **Sprint 7.6 (Archivos):** provee `denuncias_archivos` para digitalizar

---

## 9. ¿Por qué se difiere y no se hace ya?

- La implementación depende de Sprint 14 (BD real), que viene después.
- En Fase 0 (mock), no tiene sentido porque no hay persistencia real.
- Las decisiones pendientes (numeración legacy vs nueva, fechas, etc.) requieren conversación con el cliente.
- Se anota ahora para no perder el requerimiento.

---

## 10. Cierre

Sprint 23 está **diferido**. No hay actividad en Fase 0/1 hasta que se implemente Sprint 14.

Cuando se reactive:
1. Resolver decisiones pendientes con el cliente
2. Crear tabla `configuracion_sistema`
3. Crear panel de configuración
4. Crear vista de importación legacy
5. Modificar `DenunciaSheet` para detectar legacy
6. Testing con 46 casos reales
7. Documentar el proceso de migración

---
*Documento creado: Julio 2026. Sprint 23 — Migración de Casos Legacy (diferido).*
