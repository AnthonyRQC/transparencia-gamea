> ⚠️ **Histórico — Sprint cerrado Jul 2026 (Laravel 11).** Snapshot al cierre, no refleja refactorización Bloques 0-2 (Sep 2026, Laravel 13). Para estado actual ver AI-CONTEXT.md y Notas Reestructuración - Bloques 0-2 (Sept 2026) - Cierre.md.
#transparencia
# Sprint 7.6 â€” Repositorio de Archivos del Caso (Julio 2026) âœ… CERRADO

**Objetivo:** Repositorio unificado de archivos por denuncia. Los archivos se suben en cualquier momento. Soft delete: archivo "eliminado" desaparece de UI pero archivo fÃ­sico se preserva para auditorÃ­a.

**Estado:** âœ… Completado â€” implementado y probado con mock data.

**Origen:** DecisiÃ³n del cliente Julio 2026 â€” evitar pedir archivos en cada paso del flujo de investigaciÃ³n.

**EstimaciÃ³n real:** ~2 dÃ­as.

**Dependencias:** Sprint 7.5 cerrado.

---

## 1. Contexto

### 1.1 SituaciÃ³n actual
- En el Sprint 4, cada fase (solicitud, descargo, informe, cierre) tiene su propio sistema de archivos adjuntos (`solicitudes_archivos`, `descargos_documentos`, `informes_archivos`, `cierres_archivos`).
- En la UI, los archivos subidos en cada paso estÃ¡n deshabilitados (`{false && ...}` en `SolicitudDetailModal`, `DescargoDetailModal`).
- El bloque "Archivos subidos en la denuncia" (registro original, `pruebas`) sigue activo.

### 1.2 Problema
- El cliente reportÃ³ que pedir archivos en cada paso genera fricciÃ³n y duplicidades.
- Quiere que los archivos se suban **al final** (en el Informe Final) con un listado consolidado para ver quÃ© ya estÃ¡ subido y evitar duplicar.

### 1.3 SoluciÃ³n
Crear un **repositorio unificado de archivos por denuncia** que convive con los archivos especÃ­ficos por fase. Comportamiento:
- En cualquier momento del caso, el tÃ©cnico/Jefe puede subir archivos al repositorio.
- El UI fomenta la subida al final mostrando un listado consolidado en el `DenunciaSheet`.
- Soft delete: archivo "eliminado" desaparece de UI pero archivo fÃ­sico se preserva.

### 1.4 Diagrama

```
[DenunciaSheet]
  Tab InformaciÃ³n
  Tab Solicitudes  â”€â”€â”€ archivos de solicitud (solicitudes_archivos)
  Tab Descargos   â”€â”€â”€ archivos de descargo (descargos_documentos)
  Tab Informe y Cierre
    â””â”€ Sub-tab Informe Final â”€â”€â”€ archivos de informe (informes_archivos)
    â””â”€ Sub-tab Cierre       â”€â”€â”€ archivos de cierre (cierres_archivos)
  [NUEVA] SecciÃ³n "Archivos del caso" â”€â”€â”€â”€ archivos libres (denuncias_archivos) â­

Cualquier momento del flujo â†’ "Subir archivo al caso" â†’ va a denuncias_archivos
Momento del Informe Final â†’ listado consolidado de TODOS los archivos del caso
```

---

## 2. Backend (PHP)

### 2.1 `app/Data/ArchivoData.php` (nuevo)
Mock data del repositorio unificado. SesiÃ³n: clave `archivos_mock`.

```php
class ArchivoData
{
    public static function add(string $ticket, array $archivo, int $usuarioId): array;
    public static function getByTicket(string $ticket, bool $incluirEliminados = false): array;
    public static function find(int $id): ?array;
    public static function update(int $id, array $cambios, int $usuarioId): bool;
    public static function softDelete(int $id, int $usuarioId): bool;  // marca eliminado, preserva archivo fÃ­sico
    public static function seedDemoData(): void;
}
```

### 2.2 `app/Http/Controllers/ArchivosCasoController.php` (nuevo)
- `store(Request, $ticket)` â€” sube archivo al caso
- `update(Request, $id)` â€” actualiza descripciÃ³n (MAYÃšSCULAS)
- `destroy(Request, $id)` â€” soft delete
- `download(Request, $id)` â€” descarga archivo (futuro, en Fase 1)

### 2.3 Validaciones
```php
// store
'archivo' => 'required|file|max:51200',  // 50MB
'descripcion' => 'nullable|string|max:500',
'contexto' => 'required|in:registro,general,informe,cierre',
'contexto_id' => 'nullable|integer',

// update
'descripcion' => 'nullable|string|max:500',
```

### 2.4 Comportamiento del soft delete
- En Fase 0 (mock), el archivo no se "borra" realmente â€” solo se marca `eliminado: true` en sesiÃ³n.
- En Fase 1 (Sprint 10, BD), el archivo fÃ­sico en disco se **mueve** a `archivos_eliminados/` con timestamp en el nombre:
  ```
  storage/app/archivos_eliminados/DEN-2026-0001_acta_2026-07-16_14-30-22.pdf
  ```
- La DB mantiene el registro con `eliminado: true` para auditorÃ­a forense.

---

## 3. Frontend (React + TypeScript)

### 3.1 Componentes nuevos

#### `resources/js/Components/Denuncias/ModalArchivosDelCaso.tsx`
Modal para subir/listar/eliminar archivos del caso.

**Estructura:**
- Header: "Archivos del caso [DEN-2026-XXXX]"
- BotÃ³n "Subir archivo" (abre input de archivo + textarea descripciÃ³n)
- Tabla con todos los archivos (no eliminados)
- Cada fila: Ã­cono, nombre, tamaÃ±o, descripciÃ³n, fecha subida, usuario, botÃ³n "Ver", botÃ³n "Eliminar"
- Footer: "Cerrar"

#### `resources/js/Components/Denuncias/TablaArchivosCaso.tsx`
Tabla shadcn con lista de archivos del caso.

### 3.2 `DenunciaSheet.tsx` (modificar)
- Agregar **nueva secciÃ³n "Archivos del caso"** al final del tab "InformaciÃ³n" (o como sub-tabulaciÃ³n).
- BotÃ³n "Ver archivos del caso" abre `ModalArchivosDelCaso`.
- Mostrar contador: "X archivos subidos".
- Comportamiento especial: si el caso estÃ¡ en estado `informe` o `cerrada`, mostrar la secciÃ³n prominentemente (fomento de subida al final).

### 3.3 `Bandeja.tsx` y `MisCasos.tsx` (sin cambios visibles, heredan Sheet)
- El Sheet ya pasa el `ticket` y los handlers.

---

## 4. Componentes a crear

| Archivo | DescripciÃ³n |
|---------|-------------|
| `app/Data/ArchivoData.php` | Mock data del repositorio unificado |
| `app/Http/Controllers/ArchivosCasoController.php` | CRUD con soft delete |
| `resources/js/Components/Denuncias/ModalArchivosDelCaso.tsx` | Modal subir/listar/eliminar |
| `resources/js/Components/Denuncias/TablaArchivosCaso.tsx` | Tabla con lista de archivos |

## 5. Componentes a modificar

| Archivo | Cambio |
|---------|--------|
| `resources/js/Components/Denuncias/DenunciaSheet.tsx` | +secciÃ³n "Archivos del caso" |
| `app/Http/Controllers/BandejaController.php` | Pasar `archivosByTicket` como prop |
| `app/Http/Controllers/MisCasosController.php` | Pasar `archivosByTicket` como prop |
| `routes/web.php` | +rutas para `archivos.store`, `archivos.update`, `archivos.destroy` |

## 6. Rutas nuevas

```
POST   /denuncias/{ticket}/archivos          â†’ ArchivosCasoController@store
PATCH  /archivos/{id}                        â†’ ArchivosCasoController@update
DELETE /archivos/{id}                        â†’ ArchivosCasoController@destroy
```

## 7. Base de datos (Sprint 10)

### Nueva tabla `denuncias_archivos`
Ver detalle completo en `Esquema de Base de Datos.md` â†’ tabla 7.5.

Resumen de campos:
- `id`, `denuncia_id`, `usuario_id`
- `nombre` (respetar case original del archivo)
- `path`, `tamano`, `mime_type`
- `descripcion` (MAYÃšSCULAS, Sprint 7.5)
- `contexto` (ENUM: 'registro'|'general'|'informe'|'cierre')
- `contexto_id` (nullable, FK polimÃ³rfica lÃ³gica)
- `eliminado`, `fecha_eliminacion`, `fecha_subida`

### Ãndices
- `(denuncia_id, eliminado)` â€” para listar archivos visibles de un caso
- `contexto` â€” para filtrar por contexto

---

## 8. Convivencia con tablas existentes

| Tabla | Uso | Sprint |
|---|---|---|
| `pruebas` (con `archivo_path`) | Archivos del registro original | Sprint 1 |
| `solicitudes_archivos` | Adjuntos formales de respuesta de solicitud | Sprint 4 |
| `descargos_documentos` | Adjuntos formales del descargo | Sprint 4 |
| `informes_archivos` | Adjuntos del Informe Final | Sprint 5 |
| `cierres_archivos` | Adjuntos del acta de cierre | Sprint 5 |
| `denuncias_archivos` (NUEVA) | **Repositorio libre del caso** | **Sprint 7.6** |

Las 5 primeras tablas se mantienen como adjunto formal de su fase. `denuncias_archivos` es el repositorio libre donde se suben PDFs, fotos, etc. en cualquier momento.

---

## 9. Comportamiento esperado

### Escenario 1: TÃ©cnico sube archivo durante la investigaciÃ³n
1. TÃ©cnico abre `DenunciaSheet` de un caso en estado `investigacion`
2. Click en "Ver archivos del caso" â†’ `ModalArchivosDelCaso`
3. Click "Subir archivo" â†’ selecciona `acta_notarial.pdf`
4. Llena descripciÃ³n: "Acta notarial de los hechos"
5. Click "Subir" â†’ archivo guardado con `contexto='general'`
6. La tabla muestra el archivo

### Escenario 2: Listado consolidado al redactar Informe Final
1. Caso en estado `informe`
2. TÃ©cnico abre `DenunciaSheet` â†’ tab "Informe y Cierre" â†’ sub-tab "Informe Final"
3. La secciÃ³n "Archivos del caso" muestra un resumen: "5 archivos subidos al caso"
4. Click "Ver archivos" â†’ ve el listado completo (los de `denuncias_archivos` + los de `pruebas` + los de solicitudes/descargos si los hay)
5. Esto evita duplicar al subir el informe

### Escenario 3: Eliminar archivo (soft delete)
1. TÃ©cnico/Jefe abre `ModalArchivosDelCaso`
2. Click en Ã­cono de papelera de un archivo
3. ConfirmaciÃ³n: "Â¿Eliminar este archivo? El archivo se conservarÃ¡ para auditorÃ­a."
4. Click "Eliminar" â†’ archivo desaparece de la tabla
5. Backend: `eliminado: true` + mover a `archivos_eliminados/` (en Fase 1)

---

## 10. Decisiones del Sprint

| # | DecisiÃ³n | Alternativa descartada | Motivo |
|---|----------|------------------------|--------|
| 1 | Repositorio adicional (no reemplazo) | Reemplazar tablas por fase | Mantiene el adjunto formal de cada paso, suma un repositorio libre |
| 2 | Subida en cualquier momento del caso | Solo al final | Flexibilidad; el UI fomenta la subida al final pero no la restringe |
| 3 | Listado consolidado al redactar Informe Final | Listado en cada paso | Evita duplicidades, mejor UX |
| 4 | Soft delete: archivo "eliminado" + preservar fÃ­sico | Hard delete | AuditorÃ­a forense; el cliente es claro: "los auditores buscan por nombre" |
| 5 | Mover archivo a `archivos_eliminados/` con timestamp | Dejar en misma carpeta | OrganizaciÃ³n; mantiene el archivo identificable |
| 6 | MAYÃšSCULAS en `descripcion` | No MAYÃšSCULAS | Consistencia con Sprint 7.5 |
| 7 | `nombre` del archivo respeta case original | MAYÃšSCULAS | El case original es significativo en muchos sistemas de archivos |

---

## 11. VerificaciÃ³n de cierre

### Pruebas manuales
1. âœ… Subir archivo en estado `ingresada` â†’ aparece en `ModalArchivosDelCaso`
2. âœ… Subir archivo en estado `investigacion` â†’ aparece
3. âœ… Subir archivo en estado `informe` â†’ aparece y se ve en el listado consolidado
4. âœ… Eliminar archivo â†’ desaparece de UI pero el archivo fÃ­sico sigue en disco
5. âœ… Editar descripciÃ³n â†’ se guarda en MAYÃšSCULAS
6. âœ… Verificar que los archivos de `pruebas` (registro original) NO aparecen en el repositorio (son cosas distintas)
7. âœ… Verificar que el modal es accesible desde Bandeja y MisCasos

### VerificaciÃ³n de docs
- âœ… `Esquema de Base de Datos.md` con tabla `denuncias_archivos` documentada
- âœ… `AI-CONTEXT.md` menciona el repositorio
- âœ… `Plan de Desarrollo.md` con archivos del sprint listados

## 12. Cierre

Al cerrar Sprint 7.6:
- Existe un repositorio unificado de archivos por caso
- El tÃ©cnico puede subir archivos en cualquier momento
- El UI fomenta la subida al final con un listado consolidado
- Soft delete preserva el archivo fÃ­sico

**Siguiente sprint urgente:** Sprint 7.7 â€” BÃºsqueda y Consulta para Registrador.

---

## 13. Refinamientos en Sprint 9.1

### Contexto ampliado a 6 valores
El enum `denuncias_archivos.contexto` se expandiÃ³ de 4 a 6 valores:
- `registro` â€” archivos del registro inicial de la denuncia (antes `pruebas.tipo='archivo'`)
- `general` â€” repositorio libre (default)
- `solicitud` â€” archivos de respuestas a solicitudes de informaciÃ³n
- `descargo` â€” documentos de respaldo de descargos
- `informe` â€” archivos adjuntos al Informe Final
- `cierre` â€” archivos adjuntos al acta de cierre

### EliminaciÃ³n de `eliminado` booleano
Se eliminÃ³ la columna `eliminado` (booleano) de la tabla `denuncias_archivos`. Ahora solo se usa `fecha_eliminacion`:
- `fecha_eliminacion IS NULL` â†’ archivo activo
- `fecha_eliminacion IS NOT NULL` â†’ archivo eliminado

### VinculaciÃ³n polimÃ³rfica con `contexto_id`
Se agregÃ³ el campo `contexto_id` (nullable FK polimÃ³rfica lÃ³gica). Cuando se sube un archivo desde un formulario especÃ­fico (solicitud, descargo, informe, cierre), el `contexto_id` se llena automÃ¡ticamente con el ID de la entidad relacionada.

### UI simplificada
Se eliminaron los campos de subida de archivos de `FormInformeFinal` y `FormCierre`. Todo archivo se sube exclusivamente vÃ­a `ModalArchivosDelCaso` con dropdown de contexto.

### `pruebas.tipo='archivo'` eliminado
Las pruebas de tipo `archivo` en el registro inicial ahora se suben directamente a `denuncias_archivos` con `contexto='registro'`. La tabla `pruebas` solo maneja `fisica` y `testigo`.

### Tablas antiguas completamente reemplazadas
Las tablas que originalmente "convivÃ­an" con `denuncias_archivos` ahora han sido eliminadas del esquema:
- `solicitudes_archivos` â†’ `denuncias_archivos` con `contexto='solicitud'`
- `descargos_documentos` â†’ `denuncias_archivos` con `contexto='descargo'`
- `informes_archivos` â†’ `denuncias_archivos` con `contexto='informe'`
- `cierres_archivos` â†’ `denuncias_archivos` con `contexto='cierre'`

### Dependencias
- Sprint 9.1 se implementÃ³ despuÃ©s de Sprint 7.6, alineando el mock con el diseÃ±o final de BD (Sprint 9.2).

---
*Documento actualizado: Julio 2026. Sprint 7.6 refinado en Sprint 9.1.*

