> ⚠️ **Histórico — Sprint cerrado Jul 2026 (Laravel 11).** Snapshot al cierre, no refleja refactorización Bloques 0-2 (Sep 2026, Laravel 13). Para estado actual ver AI-CONTEXT.md y Notas Reestructuración - Bloques 0-2 (Sept 2026) - Cierre.md.
#transparencia
# Sprint 23 â€” MigraciÃ³n de Casos Legacy â¸ï¸ DIFERIDO

**Estado:** â¸ï¸ **Diferido.** Detalle a definir en Sprint 10 (BD real). AnotaciÃ³n temprana para no perder el requerimiento.

**Origen:** Duda del cliente Julio 2026 â€” la UTLCC tiene actualmente **46 denuncias fÃ­sicas** que necesitan migrarse al sistema nuevo. Casos legacy no tendrÃ¡n historial (bitÃ¡cora) pero sÃ­ opciÃ³n de digitalizar archivos.

**EstimaciÃ³n:** 2-3 dÃ­as (referencia, a refinar cuando se implemente Sprint 10).

---

## 1. Contexto

### 1.1 SituaciÃ³n actual (Julio 2026)
- La UTLCC tiene **46 denuncias fÃ­sicas** registradas en papel.
- Estas denuncias deben existir tambiÃ©n en el sistema nuevo para tener trazabilidad digital.
- Los casos legacy tienen particularidades:
  - Sin historial de bitÃ¡cora (no se puede reconstruir lo que pasÃ³)
  - Sin plazos computables (la fecha de ingreso al sistema es ahora, no la fecha original)
  - Sin tÃ©cnicos asignados formalmente (pueden tener referencia del Ãºltimo que lo manejÃ³)
  - Con archivos fÃ­sicos escaneables

### 1.2 NumeraciÃ³n
- El sistema actualmente usa tickets como `DEN-2026-0001`, `DEN-2026-0002`, ...
- El cliente quiere que el **siguiente ticket** respete la numeraciÃ³n fÃ­sica existente.
- Si la UTLCC tiene 46 denuncias fÃ­sicas, el primer ticket del sistema deberÃ­a ser `DEN-2026-0047` (continuaciÃ³n), no `DEN-2026-0001`.
- Esto requiere que el sistema permita **configurar el nÃºmero de inicio por aÃ±o**.

### 1.3 FilosofÃ­a
- Los casos legacy son un **registro histÃ³rico**, no un caso activo.
- El sistema los trata con un flag `es_legacy: true` para diferenciarlos.
- No entran en plazos, alertas, ni seguimiento pÃºblico.

---

## 2. Funcionalidades planificadas (a detalle en Sprint 10)

### 2.1 Panel administrativo: ConfiguraciÃ³n de numeraciÃ³n
- Vista `/admin/configuracion` (extender `Sprint 10`)
- Input "PrÃ³ximo nÃºmero de ticket" (default 1)
- BotÃ³n "Guardar" â€” solo Jefe puede modificar
- Lee/escribe de tabla `configuracion_sistema` (Sprint 10)

**Comportamiento esperado:**
- Al generar un nuevo ticket, el sistema usa `configuracion_sistema.siguiente_numero_ticket`
- DespuÃ©s de generar, se incrementa en 1
- Se mantiene el formato `DEN-YYYY-NNNN`

### 2.2 Vista de "ImportaciÃ³n legacy"
- PÃ¡gina `/admin/importar-legacy`
- Solo Jefe
- Carga masiva desde CSV/Excel
- Columnas esperadas: `numero_legacy, fecha_original, denunciante, denunciado, descripcion, categoria, estado_final, archivos`

**Comportamiento:**
- Vista previa antes de importar
- ValidaciÃ³n de campos
- OpciÃ³n de adjuntar archivos (PDFs escaneados)
- ConfirmaciÃ³n con cantidad de casos a importar

### 2.3 Caso legacy en BD
- Tabla `denuncias` con flag `es_legacy: true`
- Sin plazos computables
- Sin bitÃ¡cora histÃ³rica
- Estado final: `cerrada` (con subestado `archivada`) si ya estÃ¡ cerrado, o el estado actual si estÃ¡ activo
- NumeraciÃ³n: usa el nÃºmero legacy, no se genera DEN-YYYY-NNNN nuevo
  - Ejemplo: `LEGACY-2026-001` (formato distinto para que no se confunda)

### 2.4 Vista de caso legacy
- En `DenunciaSheet`, si `es_legacy: true`:
  - Banner: "CASO LEGACY â€” Importado al sistema el [fecha_importacion]. Sin historial computable."
  - Sin tabs de Solicitudes/Descargos/Informe/Cierre
  - Solo datos bÃ¡sicos + archivos digitalizados
  - Read-only (no se puede editar, solo ver)

### 2.5 Tabla `denuncias_archivos` (Sprint 7.6) se usa
- Los archivos digitalizados se suben al repositorio con `contexto='general'` y `es_legacy: true`
- O un campo adicional `es_legacy: true` en `denuncias_archivos` (a definir)

---

## 3. Decisiones pendientes

### 3.1 NumeraciÃ³n
- â“ Â¿Los legacy mantienen su numeraciÃ³n original (LEGACY-2026-001) o se renumeran como DEN-2026-0047?
- â“ Â¿La numeraciÃ³n se reinicia cada aÃ±o o es continua?
- â“ Â¿QuÃ© pasa con los aÃ±os anteriores? (Â¿se importan tambiÃ©n o solo 2026?)

### 3.2 Fechas
- â“ Â¿Se importa la fecha original o se usa la fecha de importaciÃ³n?
- â“ Si se importa la fecha original, Â¿se permiten fechas pasadas?
- â“ Â¿Los legacy se ordenan por fecha original o por fecha de importaciÃ³n?

### 3.3 EdiciÃ³n
- â“ Â¿Se permite editar legacy o son read-only?
- â“ Â¿QuiÃ©n puede ver legacy (Jefe, TÃ©cnico, Registrador)?

### 3.4 Reportes
- â“ Â¿Los legacy aparecen en reportes como un caso mÃ¡s o se filtran?
- â“ Â¿Hay reportes especÃ­ficos de legacy (ej. cuÃ¡ntos casos fÃ­sicos se han digitalizado)?

### 3.5 Archivos
- â“ Â¿Los archivos digitalizados se suben al nuevo sistema o solo se referencian?
- â“ Â¿Se respeta el formato original (PDF, JPG) o se normaliza?

---

## 4. Cambios en BD (Sprint 10, referencia)

### Tabla `denuncias` (modificar)
- Agregar `es_legacy` (BOOLEAN, default false)
- Agregar `numero_legacy` (VARCHAR 20, nullable) â€” para el ID legacy si se mantiene
- Agregar `fecha_original` (DATE, nullable) â€” fecha original del caso fÃ­sico
- Agregar `fecha_importacion` (TIMESTAMP, nullable) â€” cuÃ¡ndo se importÃ³ al sistema
- Agregar `importado_por_id` (FK a usuarios, nullable)

### Tabla `configuracion_sistema` (nueva, ver `Esquema de Base de Datos.md`)
- `clave` (UNIQUE): 'siguiente_numero_ticket', etc.
- `valor` (TEXT)
- `descripcion` (TEXT, MAYÃšSCULAS)
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
- `resources/js/Pages/Admin/Configuracion.tsx` (nuevo) â€” incluye "PrÃ³ximo nÃºmero de ticket"
- `resources/js/Components/Admin/TablaVistaPreviaImportacion.tsx` (nuevo)

### Componentes modificados
- `DenunciaSheet.tsx`: detectar `es_legacy: true` y mostrar banner
- `Sidebar.tsx`: agregar item "ConfiguraciÃ³n" (extender Sprint 10)

---

## 6. Casos de uso esperados

### 6.1 Jefe importa 46 casos legacy
1. Jefe va a `/admin/importar-legacy`
2. Carga CSV con 46 filas
3. Vista previa muestra: "46 casos a importar. CategorÃ­as detectadas: ..."
4. Click "Importar"
5. Sistema crea 46 denuncias con `es_legacy: true`
6. Tickets: `LEGACY-2026-001` a `LEGACY-2026-046` (formato distinto)
7. Aparece mensaje: "ImportaciÃ³n completa. 46 casos legacy creados."

### 6.2 Jefe configura numeraciÃ³n
1. Jefe va a `/admin/configuracion`
2. Input "PrÃ³ximo nÃºmero de ticket": 47
3. Click "Guardar"
4. Sistema actualiza `configuracion_sistema.siguiente_numero_ticket = 47`
5. El prÃ³ximo caso nuevo tendrÃ¡ ticket `DEN-2026-0047`

### 6.3 TÃ©cnico ve caso legacy
1. TÃ©cnico busca un caso `LEGACY-2026-005`
2. Abre DenunciaSheet
3. Ve banner: "CASO LEGACY â€” Importado el 2026-07-16. Sin historial computable."
4. Solo ve datos bÃ¡sicos + archivos digitalizados
5. Sin tabs de Solicitudes/Descargos/Informe/Cierre

---

## 7. EstimaciÃ³n (referencia)

**2-3 dÃ­as** cuando se implemente Sprint 10. Incluye:
- Tabla `configuracion_sistema` (BD + CRUD)
- Flag `es_legacy` en `denuncias`
- Panel de configuraciÃ³n
- Vista de importaciÃ³n con CSV
- DetecciÃ³n de legacy en `DenunciaSheet`
- Testing con casos reales

---

## 8. Dependencias

- **Sprint 10 (BD):** necesario para crear `configuracion_sistema` y campos en `denuncias`
- **Sprint 10 (Panel Admin):** base para el panel de configuraciÃ³n
- **Sprint 7.6 (Archivos):** provee `denuncias_archivos` para digitalizar

---

## 9. Â¿Por quÃ© se difiere y no se hace ya?

- La implementaciÃ³n depende de Sprint 10 (BD real), que viene despuÃ©s.
- En Fase 0 (mock), no tiene sentido porque no hay persistencia real.
- Las decisiones pendientes (numeraciÃ³n legacy vs nueva, fechas, etc.) requieren conversaciÃ³n con el cliente.
- Se anota ahora para no perder el requerimiento.

---

## 10. Cierre

Sprint 23 estÃ¡ **diferido**. No hay actividad en Fase 0/1 hasta que se implemente Sprint 10.

Cuando se reactive:
1. Resolver decisiones pendientes con el cliente
2. Crear tabla `configuracion_sistema`
3. Crear panel de configuraciÃ³n
4. Crear vista de importaciÃ³n legacy
5. Modificar `DenunciaSheet` para detectar legacy
6. Testing con 46 casos reales
7. Documentar el proceso de migraciÃ³n

---
*Documento creado: Julio 2026. Sprint 23 â€” MigraciÃ³n de Casos Legacy (diferido).*

