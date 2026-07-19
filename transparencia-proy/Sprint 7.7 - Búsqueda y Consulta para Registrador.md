#transparencia
# Sprint 7.7 — Búsqueda y Consulta para Registrador (Julio 2026) ✅ CERRADO

**Objetivo:** Nueva página `/denuncias/consultar` solo accesible para rol Registrador. 7 filtros esenciales, detalle read-only, consulta de código (ticket + PIN concatenado). Sin bitácora.

**Estado:** ✅ Completado — implementado y probado.

**Origen:** Pedido del cliente Julio 2026 — denunciantes olvidan el código presencialmente.

**Estimación real:** ~2 días.

**Dependencias:** Sprint 7.5 cerrado (catálogo de permisos).

---

## 1. Contexto

### 1.1 Situación actual
- El Registrador solo tiene acceso a `/denuncias/registrar` (per Sprint 6.5).
- Si un denunciante viene presencialmente a preguntar el estado de su caso, el Registrador no tiene cómo consultar.
- Si el denunciante olvidó su código (PIN de 4 dígitos), no hay forma de recuperarlo.

### 1.2 Solución
- Nueva página `/denuncias/consultar` con acceso solo para rol Registrador (chequeado con `useCan('denuncia.buscar')`).
- Búsqueda con 7 filtros esenciales.
- Vista de detalle read-only (`DenunciaSheet` en modo consulta, sin botones de acción).
- Acción "Consultar código" que muestra ticket + PIN en un modal.
- **NO se registra en bitácora** la consulta de código (decisión del cliente).

### 1.3 Filosofía
- "Todo es responsabilidad de los usuarios" — el cliente fue explícito: no poner burocracia extra en las consultas.
- El Registrador es responsable de la información que consulta, no necesita restricciones.
- Sin logs visibles: si en el futuro se requiere auditoría forense, se puede hacer por query directo a la BD.

---

## 2. Backend (PHP)

### 2.1 `app/Http/Controllers/ConsultaCasosController.php` (nuevo)

```php
class ConsultaCasosController extends Controller
{
    /**
     * Página principal con tabla y filtros
     */
    public function index(Request $request): Response;

    /**
     * Consultar código (ticket + PIN)
     * NO se registra en bitácora
     */
    public function consultarCodigo(Request $request, string $ticket): \Illuminate\Http\JsonResponse;
}
```

### 2.2 `index(Request)` — Filtros disponibles

```php
$validated = $request->validate([
    'q' => 'nullable|string|max:200',  // texto libre (búsqueda full-text-like)
    'ticket' => 'nullable|string|max:20',  // ticket exacto
    'estado' => 'nullable|array',
    'estado.*' => 'string|in:ingresada,evaluacion_tecnica,admitida,rechazada,asignada,investigacion,informe,cerrada',
    'tipo' => 'nullable|array',
    'tipo.*' => 'string|in:corrupcion,negacion',
    'escenario' => 'nullable|array',
    'escenario.*' => 'string|in:revelada,anonimo,reservada',
    'fecha_ingreso_desde' => 'nullable|date',
    'fecha_ingreso_hasta' => 'nullable|date|after_or_equal:fecha_ingreso_desde',
    'tecnico_id' => 'nullable|integer|exists:usuarios,id',  // futuro, mock ahora
]);
```

### 2.3 Búsqueda por texto libre (`q`)
Busca en los siguientes campos concatenados con OR:
- `denuncias.ticket`
- `denuncias.hechos`
- `denunciantes.nombres`
- `denunciados.nombres`
- `denunciados.dependencia`
- `denuncias.resumen_rechazo`

**Algoritmo simple (Fase 0 mock):** usar `str_contains()` case-insensitive sobre cada campo.
**Fase 1 (Sprint 14, BD):** usar LIKE con FULLTEXT index si MySQL.

### 2.4 Whitelist de campos devueltos
Por seguridad, la consulta solo devuelve los campos necesarios para la tabla y el detalle. **NO expone:** denunciante completo (solo nombres masked), denunciantes CI, datos de contacto, técnicos password, etc.

```php
$denunciasFiltradas = $denuncias->map(function ($d) {
    return [
        'id' => $d['id'],
        'ticket' => $d['ticket'],
        'tipo' => $d['tipo'],
        'estado' => $d['estado'],
        'fecha_ingreso' => $d['fecha_ingreso'],
        'denunciante_nombre' => $d['escenario'] === 'anonimo' ? 'ANÓNIMO' : ($d['denunciante']['nombres'] ?? 'N/A'),
        'denunciados_resumen' => implode(', ', array_map(fn($x) => $x['nombres'] ?? 'N/A', $d['denunciados'])),
        'tecnico_nombre' => $d['tecnico']['nombre'] ?? null,
        'plazo_restante_dias' => $this->calcularPlazoRestante($d),
    ];
});
```

### 2.5 `consultarCodigo(Request, $ticket)`

```php
public function consultarCodigo(Request $request, string $ticket): JsonResponse
{
    $denuncia = DenunciaData::findByTicket($ticket);
    if (!$denuncia) {
        return response()->json(['error' => 'Denuncia no encontrada'], 404);
    }
    return response()->json([
        'ticket' => $denuncia['ticket'],
        'token_consulta' => $denuncia['token_consulta'],
    ]);
}
```

**Importante:** NO se llama a `BitacoraData::add()` aquí. La consulta es libre.

---

## 3. Frontend (React + TypeScript)

### 3.1 `resources/js/Pages/Denuncias/ConsultarCasos.tsx` (nuevo)
Página principal con tabla + filtros.

**Estructura:**
```
┌─────────────────────────────────────────────────────────┐
│ Consultar casos                                         │
├─────────────────────────────────────────────────────────┤
│ [Panel de filtros]              [Botón: Buscar]        │
│  - Búsqueda libre: [_________________]                 │
│  - Ticket: [____________]                              │
│  - Estado: [☑ingresada ☑admitida ...]                 │
│  - Tipo: [☑corrupcion ☑negacion]                      │
│  - Escenario: [☑revelada ☑anonimo ☑reservada]        │
│  - Fecha ingreso desde/hasta: [_] a [_]                │
│  - Técnico asignado: [Seleccionar...]                  │
├─────────────────────────────────────────────────────────┤
│ [Tabla de resultados]                                   │
│  Ticket | Tipo | Estado | Fecha | Denunciante | ...   │
│  [Ver] [Consultar código]                              │
└─────────────────────────────────────────────────────────┘
```

### 3.2 `resources/js/Components/Denuncias/TablaResultadosConsulta.tsx` (nuevo)
Tabla shadcn con los resultados. Paginada (10 resultados por página).

### 3.3 `resources/js/Components/Denuncias/FiltrosConsulta.tsx` (nuevo)
Panel colapsable con los 7 filtros. Estado controlado, submit con botón "Buscar".

### 3.4 `resources/js/Components/Denuncias/ModalConsultarCodigo.tsx` (nuevo)
Modal con ticket + PIN.

**Estructura:**
```
┌──────────────────────────────────────────────┐
│ Código de consulta                           │
├──────────────────────────────────────────────┤
│ Ticket:    DEN-2026-0042                     │
│ Código:    [1004]                    [Copiar]│
│                                              │
│ El denunciante puede usar este código        │
│ en /seguimiento para consultar el estado     │
│ de su denuncia.                              │
├──────────────────────────────────────────────┤
│                            [Cerrar]          │
└──────────────────────────────────────────────┘
```

- PIN en fuente mono grande
- Botón "Copiar al portapapeles" (usa `navigator.clipboard.writeText`)
- Toast de confirmación "Copiado"

### 3.5 Sidebar

#### `resources/js/Components/Layout/Sidebar.tsx` (modificar)
- Agregar ítem "Consultar casos" solo si `useCan('denuncia.buscar')`
- Ícono: `Search` o `FileSearch`
- Ruta: `/denuncias/consultar`

---

## 4. Rutas nuevas

```
GET /denuncias/consultar                  → ConsultaCasosController@index
GET /denuncias/{ticket}/consultar-codigo  → ConsultaCasosController@consultarCodigo
```

Ambas con middleware de permiso (en Fase 0, chequeo por rol; en Sprint 15, por permiso).

### `routes/web.php` (modificar)
```php
Route::middleware(['can:denuncia.buscar'])->group(function () {
    Route::get('/denuncias/consultar', [ConsultaCasosController::class, 'index'])->name('denuncias.consultar');
    Route::get('/denuncias/{ticket}/consultar-codigo', [ConsultaCasosController::class, 'consultarCodigo'])->name('denuncias.consultar-codigo');
});
```

---

## 5. Filtros esenciales (7)

| # | Filtro | Tipo | Buscar en |
|---|--------|------|-----------|
| 1 | **Búsqueda por texto libre** | input text | ticket, hechos, nombres denunciante, nombres denunciados, dependencia denunciado, resumen rechazo |
| 2 | **Ticket exacto** | input text | `denuncias.ticket` |
| 3 | **Estado** | multi-select chips | 8 estados posibles |
| 4 | **Tipo** | multi-select chips | corrupcion, negacion |
| 5 | **Escenario** | multi-select chips | revelada, anonimo, reservada |
| 6 | **Rango fechas de ingreso** | date picker doble | `denuncias.fecha_ingreso` |
| 7 | **Técnico asignado** | select | `tecnico_id` (FK a usuarios) |

### Filtros NO incluidos (decisión del cliente)
- Rango fechas de hechos
- Categoría de denuncia
- Con archivos / sin archivos
- Con solicitudes pendientes
- Con descargos pendientes
- Con ampliaciones vigentes
- Reservados de identidad (toggle)

Razón: el cliente pidió mantener los filtros al mínimo esencial. Si en el futuro se requieren más, se pueden agregar sin mayor complicación.

---

## 6. Columnas de la tabla

| Columna | Fuente | Comportamiento |
|---------|--------|----------------|
| Ticket | `denuncias.ticket` | Mono font, copiar al click |
| Tipo | `denuncias.tipo` | Badge con color (corrupcion=morado, negacion=gold) |
| Estado | `denuncias.estado` | Badge con color por estado |
| Fecha ingreso | `denuncias.fecha_ingreso` | Formato local |
| Denunciante | `denunciantes.nombres` | Si `escenario=anonimo`: "ANÓNIMO". Si `reservada`: nombres del técnico actual solo |
| Denunciado(s) | `denunciados[].nombres` | Lista resumida (primeros 2 + "...y N más") |
| Técnico | `tecnico.nombre` | Avatar + nombre |
| Plazo restante | calculado | Verde/amarillo/rojo + número de días |
| Acciones | — | [Ver] [Consultar código] |

---

## 7. Acciones por fila

### 7.1 "Ver" detalle
- Abre `DenunciaSheet` en modo **consulta** (read-only total).
- El componente `DenunciaSheet` debe recibir un prop `modo: 'consulta'` que oculta todos los botones de acción.
- Solo se ven los datos del caso, sin tabs de edición.

### 7.2 "Consultar código"
- Abre `ModalConsultarCodigo`.
- Hace fetch a `GET /denuncias/{ticket}/consultar-codigo`.
- Muestra ticket + PIN.
- **NO se registra en bitácora** (decisión del cliente).

### 7.3 "Copiar al portapapeles" (dentro del modal)
- Copia el PIN al portapapeles del usuario.
- Toast de confirmación.
- Sin registro.

---

## 8. Decisiones del Sprint

| # | Decisión | Alternativa descartada | Motivo |
|---|----------|------------------------|--------|
| 1 | Página nueva `/denuncias/consultar` | Tab en Bandeja existente | El Registrador no tiene acceso a Bandeja (es de Jefe); interfaz limpia separada |
| 2 | 7 filtros esenciales | 14 filtros | El cliente pidió mantener al mínimo; si se necesitan más, se agregan |
| 3 | Detalle read-only en `DenunciaSheet` con prop `modo=consulta` | Nueva vista separada | Reusar componente; menos código |
| 4 | **NO se registra en bitácora** la consulta de código | Registrar siempre o condicionalmente | Decisión explícita del cliente: "el Registrador es responsable, puede consultar cuanto quiera" |
| 5 | PIN visible con botón "Copiar" | Solo visible, sin copiar | Mejor UX para el Registrador |
| 6 | Paginación 10 resultados por página | Mostrar todos | Performance con miles de casos |
| 7 | Whitelist explícita de campos devueltos | Devolver denuncia completa | Seguridad; no exponer datos sensibles |
| 8 | Solo acceso para rol Registrador (vía permiso) | Cualquier usuario autenticado | Privacidad; el Registrador es el único que necesita esta función |

---

## 9. shadcn a instalar
- `table`

## 10. Verificación de cierre

### Pruebas manuales
1. ✅ Login como Registrador → aparece ítem "Consultar casos" en sidebar
2. ✅ Login como Técnico o Jefe → NO aparece el ítem (solo Registrador)
3. ✅ Búsqueda con texto libre "robo" → encuentra denuncias con esa palabra en hechos
4. ✅ Búsqueda con ticket exacto "DEN-2026-0005" → encuentra esa denuncia
5. ✅ Filtrar por estado "admitida" → solo ve admitidas
6. ✅ Filtrar por rango de fechas → respeta el rango
7. ✅ Click "Ver" → abre detalle en modo consulta (sin botones de acción)
8. ✅ Click "Consultar código" → muestra ticket + PIN
9. ✅ Click "Copiar" → copia al portapapeles con toast
10. ✅ Verificar que la bitácora del caso NO tiene una nueva entrada "consulta_codigo"

### Verificación de seguridad
- ✅ Intentar acceder a `/denuncias/consultar` como Técnico → redirige o 403
- ✅ Intentar `GET /denuncias/DEN-2026-0005/consultar-codigo` como anónimo → 403
- ✅ La respuesta del backend NO incluye denunciantes CI, emails, teléfonos, etc.

### Verificación de docs
- ✅ `Esquema de Base de Datos.md` — acción `consulta_codigo` quitada del enum `bitacora.accion`
- ✅ `AI-CONTEXT.md` menciona la página
- ✅ `Plan de Desarrollo.md` con archivos del sprint

## 11. Cierre

Al cerrar Sprint 7.7:
- El Registrador tiene una página dedicada para buscar y consultar casos
- Puede consultar el código de un caso sin burocracia
- Sin logs visibles (decisión del cliente)
- Cumple con la Ley 974 (privacidad, reserva de identidad, etc.)

**Siguiente sprint:** Sprint 10 — Panel Administración Catálogos + Subcategorías.

---
*Documento creado: Julio 2026. Sprint 7.7 — Búsqueda y Consulta para Registrador.*
