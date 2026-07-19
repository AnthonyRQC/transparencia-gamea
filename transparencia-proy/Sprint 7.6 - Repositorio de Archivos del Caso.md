#transparencia
# Sprint 7.6 — Repositorio de Archivos del Caso (Julio 2026) ✅ CERRADO

**Objetivo:** Repositorio unificado de archivos por denuncia. Los archivos se suben en cualquier momento. Soft delete: archivo "eliminado" desaparece de UI pero archivo físico se preserva para auditoría.

**Estado:** ✅ Completado — implementado y probado con mock data.

**Origen:** Decisión del cliente Julio 2026 — evitar pedir archivos en cada paso del flujo de investigación.

**Estimación real:** ~2 días.

**Dependencias:** Sprint 7.5 cerrado.

---

## 1. Contexto

### 1.1 Situación actual
- En el Sprint 4, cada fase (solicitud, descargo, informe, cierre) tiene su propio sistema de archivos adjuntos (`solicitudes_archivos`, `descargos_documentos`, `informes_archivos`, `cierres_archivos`).
- En la UI, los archivos subidos en cada paso están deshabilitados (`{false && ...}` en `SolicitudDetailModal`, `DescargoDetailModal`).
- El bloque "Archivos subidos en la denuncia" (registro original, `pruebas`) sigue activo.

### 1.2 Problema
- El cliente reportó que pedir archivos en cada paso genera fricción y duplicidades.
- Quiere que los archivos se suban **al final** (en el Informe Final) con un listado consolidado para ver qué ya está subido y evitar duplicar.

### 1.3 Solución
Crear un **repositorio unificado de archivos por denuncia** que convive con los archivos específicos por fase. Comportamiento:
- En cualquier momento del caso, el técnico/Jefe puede subir archivos al repositorio.
- El UI fomenta la subida al final mostrando un listado consolidado en el `DenunciaSheet`.
- Soft delete: archivo "eliminado" desaparece de UI pero archivo físico se preserva.

### 1.4 Diagrama

```
[DenunciaSheet]
  Tab Información
  Tab Solicitudes  ─── archivos de solicitud (solicitudes_archivos)
  Tab Descargos   ─── archivos de descargo (descargos_documentos)
  Tab Informe y Cierre
    └─ Sub-tab Informe Final ─── archivos de informe (informes_archivos)
    └─ Sub-tab Cierre       ─── archivos de cierre (cierres_archivos)
  [NUEVA] Sección "Archivos del caso" ──── archivos libres (denuncias_archivos) ⭐

Cualquier momento del flujo → "Subir archivo al caso" → va a denuncias_archivos
Momento del Informe Final → listado consolidado de TODOS los archivos del caso
```

---

## 2. Backend (PHP)

### 2.1 `app/Data/ArchivoData.php` (nuevo)
Mock data del repositorio unificado. Sesión: clave `archivos_mock`.

```php
class ArchivoData
{
    public static function add(string $ticket, array $archivo, int $usuarioId): array;
    public static function getByTicket(string $ticket, bool $incluirEliminados = false): array;
    public static function find(int $id): ?array;
    public static function update(int $id, array $cambios, int $usuarioId): bool;
    public static function softDelete(int $id, int $usuarioId): bool;  // marca eliminado, preserva archivo físico
    public static function seedDemoData(): void;
}
```

### 2.2 `app/Http/Controllers/ArchivosCasoController.php` (nuevo)
- `store(Request, $ticket)` — sube archivo al caso
- `update(Request, $id)` — actualiza descripción (MAYÚSCULAS)
- `destroy(Request, $id)` — soft delete
- `download(Request, $id)` — descarga archivo (futuro, en Fase 1)

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
- En Fase 0 (mock), el archivo no se "borra" realmente — solo se marca `eliminado: true` en sesión.
- En Fase 1 (Sprint 14, BD), el archivo físico en disco se **mueve** a `archivos_eliminados/` con timestamp en el nombre:
  ```
  storage/app/archivos_eliminados/DEN-2026-0001_acta_2026-07-16_14-30-22.pdf
  ```
- La DB mantiene el registro con `eliminado: true` para auditoría forense.

---

## 3. Frontend (React + TypeScript)

### 3.1 Componentes nuevos

#### `resources/js/Components/Denuncias/ModalArchivosDelCaso.tsx`
Modal para subir/listar/eliminar archivos del caso.

**Estructura:**
- Header: "Archivos del caso [DEN-2026-XXXX]"
- Botón "Subir archivo" (abre input de archivo + textarea descripción)
- Tabla con todos los archivos (no eliminados)
- Cada fila: ícono, nombre, tamaño, descripción, fecha subida, usuario, botón "Ver", botón "Eliminar"
- Footer: "Cerrar"

#### `resources/js/Components/Denuncias/TablaArchivosCaso.tsx`
Tabla shadcn con lista de archivos del caso.

### 3.2 `DenunciaSheet.tsx` (modificar)
- Agregar **nueva sección "Archivos del caso"** al final del tab "Información" (o como sub-tabulación).
- Botón "Ver archivos del caso" abre `ModalArchivosDelCaso`.
- Mostrar contador: "X archivos subidos".
- Comportamiento especial: si el caso está en estado `informe` o `cerrada`, mostrar la sección prominentemente (fomento de subida al final).

### 3.3 `Bandeja.tsx` y `MisCasos.tsx` (sin cambios visibles, heredan Sheet)
- El Sheet ya pasa el `ticket` y los handlers.

---

## 4. Componentes a crear

| Archivo | Descripción |
|---------|-------------|
| `app/Data/ArchivoData.php` | Mock data del repositorio unificado |
| `app/Http/Controllers/ArchivosCasoController.php` | CRUD con soft delete |
| `resources/js/Components/Denuncias/ModalArchivosDelCaso.tsx` | Modal subir/listar/eliminar |
| `resources/js/Components/Denuncias/TablaArchivosCaso.tsx` | Tabla con lista de archivos |

## 5. Componentes a modificar

| Archivo | Cambio |
|---------|--------|
| `resources/js/Components/Denuncias/DenunciaSheet.tsx` | +sección "Archivos del caso" |
| `app/Http/Controllers/BandejaController.php` | Pasar `archivosByTicket` como prop |
| `app/Http/Controllers/MisCasosController.php` | Pasar `archivosByTicket` como prop |
| `routes/web.php` | +rutas para `archivos.store`, `archivos.update`, `archivos.destroy` |

## 6. Rutas nuevas

```
POST   /denuncias/{ticket}/archivos          → ArchivosCasoController@store
PATCH  /archivos/{id}                        → ArchivosCasoController@update
DELETE /archivos/{id}                        → ArchivosCasoController@destroy
```

## 7. Base de datos (Sprint 14)

### Nueva tabla `denuncias_archivos`
Ver detalle completo en `Esquema de Base de Datos.md` → tabla 7.5.

Resumen de campos:
- `id`, `denuncia_id`, `usuario_id`
- `nombre` (respetar case original del archivo)
- `path`, `tamano`, `mime_type`
- `descripcion` (MAYÚSCULAS, Sprint 7.5)
- `contexto` (ENUM: 'registro'|'general'|'informe'|'cierre')
- `contexto_id` (nullable, FK polimórfica lógica)
- `eliminado`, `fecha_eliminacion`, `fecha_subida`

### Índices
- `(denuncia_id, eliminado)` — para listar archivos visibles de un caso
- `contexto` — para filtrar por contexto

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

### Escenario 1: Técnico sube archivo durante la investigación
1. Técnico abre `DenunciaSheet` de un caso en estado `investigacion`
2. Click en "Ver archivos del caso" → `ModalArchivosDelCaso`
3. Click "Subir archivo" → selecciona `acta_notarial.pdf`
4. Llena descripción: "Acta notarial de los hechos"
5. Click "Subir" → archivo guardado con `contexto='general'`
6. La tabla muestra el archivo

### Escenario 2: Listado consolidado al redactar Informe Final
1. Caso en estado `informe`
2. Técnico abre `DenunciaSheet` → tab "Informe y Cierre" → sub-tab "Informe Final"
3. La sección "Archivos del caso" muestra un resumen: "5 archivos subidos al caso"
4. Click "Ver archivos" → ve el listado completo (los de `denuncias_archivos` + los de `pruebas` + los de solicitudes/descargos si los hay)
5. Esto evita duplicar al subir el informe

### Escenario 3: Eliminar archivo (soft delete)
1. Técnico/Jefe abre `ModalArchivosDelCaso`
2. Click en ícono de papelera de un archivo
3. Confirmación: "¿Eliminar este archivo? El archivo se conservará para auditoría."
4. Click "Eliminar" → archivo desaparece de la tabla
5. Backend: `eliminado: true` + mover a `archivos_eliminados/` (en Fase 1)

---

## 10. Decisiones del Sprint

| # | Decisión | Alternativa descartada | Motivo |
|---|----------|------------------------|--------|
| 1 | Repositorio adicional (no reemplazo) | Reemplazar tablas por fase | Mantiene el adjunto formal de cada paso, suma un repositorio libre |
| 2 | Subida en cualquier momento del caso | Solo al final | Flexibilidad; el UI fomenta la subida al final pero no la restringe |
| 3 | Listado consolidado al redactar Informe Final | Listado en cada paso | Evita duplicidades, mejor UX |
| 4 | Soft delete: archivo "eliminado" + preservar físico | Hard delete | Auditoría forense; el cliente es claro: "los auditores buscan por nombre" |
| 5 | Mover archivo a `archivos_eliminados/` con timestamp | Dejar en misma carpeta | Organización; mantiene el archivo identificable |
| 6 | MAYÚSCULAS en `descripcion` | No MAYÚSCULAS | Consistencia con Sprint 7.5 |
| 7 | `nombre` del archivo respeta case original | MAYÚSCULAS | El case original es significativo en muchos sistemas de archivos |

---

## 11. Verificación de cierre

### Pruebas manuales
1. ✅ Subir archivo en estado `ingresada` → aparece en `ModalArchivosDelCaso`
2. ✅ Subir archivo en estado `investigacion` → aparece
3. ✅ Subir archivo en estado `informe` → aparece y se ve en el listado consolidado
4. ✅ Eliminar archivo → desaparece de UI pero el archivo físico sigue en disco
5. ✅ Editar descripción → se guarda en MAYÚSCULAS
6. ✅ Verificar que los archivos de `pruebas` (registro original) NO aparecen en el repositorio (son cosas distintas)
7. ✅ Verificar que el modal es accesible desde Bandeja y MisCasos

### Verificación de docs
- ✅ `Esquema de Base de Datos.md` con tabla `denuncias_archivos` documentada
- ✅ `AI-CONTEXT.md` menciona el repositorio
- ✅ `Plan de Desarrollo.md` con archivos del sprint listados

## 12. Cierre

Al cerrar Sprint 7.6:
- Existe un repositorio unificado de archivos por caso
- El técnico puede subir archivos en cualquier momento
- El UI fomenta la subida al final con un listado consolidado
- Soft delete preserva el archivo físico

**Siguiente sprint urgente:** Sprint 7.7 — Búsqueda y Consulta para Registrador.

---
*Documento creado: Julio 2026. Sprint 7.6 — Repositorio de Archivos del Caso.*
