> ⚠️ **Histórico — Sprint cerrado Jul 2026 (Laravel 11).** Snapshot al cierre, no refleja refactorización Bloques 0-2 (Sep 2026, Laravel 13). Para estado actual ver AI-CONTEXT.md y Notas Reestructuración - Bloques 0-2 (Sept 2026) - Cierre.md.
#transparencia
# Sprint 7.7 â€” BÃºsqueda y Consulta para Registrador (Julio 2026) âœ… CERRADO

**Objetivo:** Nueva pÃ¡gina `/denuncias/consultar` solo accesible para rol Registrador. 7 filtros esenciales, detalle read-only, consulta de cÃ³digo (ticket + PIN concatenado). Sin bitÃ¡cora.

**Estado:** âœ… Completado â€” implementado y probado.

**Origen:** Pedido del cliente Julio 2026 â€” denunciantes olvidan el cÃ³digo presencialmente.

**EstimaciÃ³n real:** ~2 dÃ­as.

**Dependencias:** Sprint 7.5 cerrado (catÃ¡logo de permisos).

---

## 1. Contexto

### 1.1 SituaciÃ³n actual
- El Registrador solo tiene acceso a `/denuncias/registrar` (per Sprint 6.5).
- Si un denunciante viene presencialmente a preguntar el estado de su caso, el Registrador no tiene cÃ³mo consultar.
- Si el denunciante olvidÃ³ su cÃ³digo (PIN de 4 dÃ­gitos), no hay forma de recuperarlo.

### 1.2 SoluciÃ³n
- Nueva pÃ¡gina `/denuncias/consultar` con acceso solo para rol Registrador (chequeado con `useCan('denuncia.buscar')`).
- BÃºsqueda con 7 filtros esenciales.
- Vista de detalle read-only (`DenunciaSheet` en modo consulta, sin botones de acciÃ³n).
- AcciÃ³n "Consultar cÃ³digo" que muestra ticket + PIN en un modal.
- **NO se registra en bitÃ¡cora** la consulta de cÃ³digo (decisiÃ³n del cliente).

### 1.3 FilosofÃ­a
- "Todo es responsabilidad de los usuarios" â€” el cliente fue explÃ­cito: no poner burocracia extra en las consultas.
- El Registrador es responsable de la informaciÃ³n que consulta, no necesita restricciones.
- Sin logs visibles: si en el futuro se requiere auditorÃ­a forense, se puede hacer por query directo a la BD.

---

## 2. Backend (PHP)

### 2.1 `app/Http/Controllers/ConsultaCasosController.php` (nuevo)

```php
class ConsultaCasosController extends Controller
{
    /**
     * PÃ¡gina principal con tabla y filtros
     */
    public function index(Request $request): Response;

    /**
     * Consultar cÃ³digo (ticket + PIN)
     * NO se registra en bitÃ¡cora
     */
    public function consultarCodigo(Request $request, string $ticket): \Illuminate\Http\JsonResponse;
}
```

### 2.2 `index(Request)` â€” Filtros disponibles

```php
$validated = $request->validate([
    'q' => 'nullable|string|max:200',  // texto libre (bÃºsqueda full-text-like)
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

### 2.3 BÃºsqueda por texto libre (`q`)
Busca en los siguientes campos concatenados con OR:
- `denuncias.ticket`
- `denuncias.hechos`
- `denunciantes.nombres`
- `denunciados.nombres`
- `denunciados.dependencia`
- `denuncias.resumen_rechazo`

**Algoritmo simple (Fase 0 mock):** usar `str_contains()` case-insensitive sobre cada campo.
**Fase 1 (Sprint 10, BD):** usar LIKE con FULLTEXT index si MySQL.

### 2.4 Whitelist de campos devueltos
Por seguridad, la consulta solo devuelve los campos necesarios para la tabla y el detalle. **NO expone:** denunciante completo (solo nombres masked), denunciantes CI, datos de contacto, tÃ©cnicos password, etc.

```php
$denunciasFiltradas = $denuncias->map(function ($d) {
    return [
        'id' => $d['id'],
        'ticket' => $d['ticket'],
        'tipo' => $d['tipo'],
        'estado' => $d['estado'],
        'fecha_ingreso' => $d['fecha_ingreso'],
        'denunciante_nombre' => $d['escenario'] === 'anonimo' ? 'ANÃ“NIMO' : ($d['denunciante']['nombres'] ?? 'N/A'),
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

**Importante:** NO se llama a `BitacoraData::add()` aquÃ­. La consulta es libre.

---

## 3. Frontend (React + TypeScript)

### 3.1 `resources/js/Pages/Denuncias/ConsultarCasos.tsx` (nuevo)
PÃ¡gina principal con tabla + filtros.

**Estructura:**
```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ Consultar casos                                         â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ [Panel de filtros]              [BotÃ³n: Buscar]        â”‚
â”‚  - BÃºsqueda libre: [_________________]                 â”‚
â”‚  - Ticket: [____________]                              â”‚
â”‚  - Estado: [â˜‘ingresada â˜‘admitida ...]                 â”‚
â”‚  - Tipo: [â˜‘corrupcion â˜‘negacion]                      â”‚
â”‚  - Escenario: [â˜‘revelada â˜‘anonimo â˜‘reservada]        â”‚
â”‚  - Fecha ingreso desde/hasta: [_] a [_]                â”‚
â”‚  - TÃ©cnico asignado: [Seleccionar...]                  â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ [Tabla de resultados]                                   â”‚
â”‚  Ticket | Tipo | Estado | Fecha | Denunciante | ...   â”‚
â”‚  [Ver] [Consultar cÃ³digo]                              â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 3.2 `resources/js/Components/Denuncias/TablaResultadosConsulta.tsx` (nuevo)
Tabla shadcn con los resultados. Paginada (10 resultados por pÃ¡gina).

### 3.3 `resources/js/Components/Denuncias/FiltrosConsulta.tsx` (nuevo)
Panel colapsable con los 7 filtros. Estado controlado, submit con botÃ³n "Buscar".

### 3.4 `resources/js/Components/Denuncias/ModalConsultarCodigo.tsx` (nuevo)
Modal con ticket + PIN.

**Estructura:**
```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ CÃ³digo de consulta                           â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ Ticket:    DEN-2026-0042                     â”‚
â”‚ CÃ³digo:    [1004]                    [Copiar]â”‚
â”‚                                              â”‚
â”‚ El denunciante puede usar este cÃ³digo        â”‚
â”‚ en /seguimiento para consultar el estado     â”‚
â”‚ de su denuncia.                              â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                            [Cerrar]          â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

- PIN en fuente mono grande
- BotÃ³n "Copiar al portapapeles" (usa `navigator.clipboard.writeText`)
- Toast de confirmaciÃ³n "Copiado"

### 3.5 Sidebar

#### `resources/js/Components/Layout/Sidebar.tsx` (modificar)
- Agregar Ã­tem "Consultar casos" solo si `useCan('denuncia.buscar')`
- Ãcono: `Search` o `FileSearch`
- Ruta: `/denuncias/consultar`

---

## 4. Rutas nuevas

```
GET /denuncias/consultar                  â†’ ConsultaCasosController@index
GET /denuncias/{ticket}/consultar-codigo  â†’ ConsultaCasosController@consultarCodigo
```

Ambas con middleware de permiso (en Fase 0, chequeo por rol; en Sprint 16, por permiso).

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
| 1 | **BÃºsqueda por texto libre** | input text | ticket, hechos, nombres denunciante, nombres denunciados, dependencia denunciado, resumen rechazo |
| 2 | **Ticket exacto** | input text | `denuncias.ticket` |
| 3 | **Estado** | multi-select chips | 8 estados posibles |
| 4 | **Tipo** | multi-select chips | corrupcion, negacion |
| 5 | **Escenario** | multi-select chips | revelada, anonimo, reservada |
| 6 | **Rango fechas de ingreso** | date picker doble | `denuncias.fecha_ingreso` |
| 7 | **TÃ©cnico asignado** | select | `tecnico_id` (FK a usuarios) |

### Filtros NO incluidos (decisiÃ³n del cliente)
- Rango fechas de hechos
- CategorÃ­a de denuncia
- Con archivos / sin archivos
- Con solicitudes pendientes
- Con descargos pendientes
- Con ampliaciones vigentes
- Reservados de identidad (toggle)

RazÃ³n: el cliente pidiÃ³ mantener los filtros al mÃ­nimo esencial. Si en el futuro se requieren mÃ¡s, se pueden agregar sin mayor complicaciÃ³n.

---

## 6. Columnas de la tabla

| Columna | Fuente | Comportamiento |
|---------|--------|----------------|
| Ticket | `denuncias.ticket` | Mono font, copiar al click |
| Tipo | `denuncias.tipo` | Badge con color (corrupcion=morado, negacion=gold) |
| Estado | `denuncias.estado` | Badge con color por estado |
| Fecha ingreso | `denuncias.fecha_ingreso` | Formato local |
| Denunciante | `denunciantes.nombres` | Si `escenario=anonimo`: "ANÃ“NIMO". Si `reservada`: nombres del tÃ©cnico actual solo |
| Denunciado(s) | `denunciados[].nombres` | Lista resumida (primeros 2 + "...y N mÃ¡s") |
| TÃ©cnico | `tecnico.nombre` | Avatar + nombre |
| Plazo restante | calculado | Verde/amarillo/rojo + nÃºmero de dÃ­as |
| Acciones | â€” | [Ver] [Consultar cÃ³digo] |

---

## 7. Acciones por fila

### 7.1 "Ver" detalle
- Abre `DenunciaSheet` en modo **consulta** (read-only total).
- El componente `DenunciaSheet` debe recibir un prop `modo: 'consulta'` que oculta todos los botones de acciÃ³n.
- Solo se ven los datos del caso, sin tabs de ediciÃ³n.

### 7.2 "Consultar cÃ³digo"
- Abre `ModalConsultarCodigo`.
- Hace fetch a `GET /denuncias/{ticket}/consultar-codigo`.
- Muestra ticket + PIN.
- **NO se registra en bitÃ¡cora** (decisiÃ³n del cliente).

### 7.3 "Copiar al portapapeles" (dentro del modal)
- Copia el PIN al portapapeles del usuario.
- Toast de confirmaciÃ³n.
- Sin registro.

---

## 8. Decisiones del Sprint

| # | DecisiÃ³n | Alternativa descartada | Motivo |
|---|----------|------------------------|--------|
| 1 | PÃ¡gina nueva `/denuncias/consultar` | Tab en Bandeja existente | El Registrador no tiene acceso a Bandeja (es de Jefe); interfaz limpia separada |
| 2 | 7 filtros esenciales | 14 filtros | El cliente pidiÃ³ mantener al mÃ­nimo; si se necesitan mÃ¡s, se agregan |
| 3 | Detalle read-only en `DenunciaSheet` con prop `modo=consulta` | Nueva vista separada | Reusar componente; menos cÃ³digo |
| 4 | **NO se registra en bitÃ¡cora** la consulta de cÃ³digo | Registrar siempre o condicionalmente | DecisiÃ³n explÃ­cita del cliente: "el Registrador es responsable, puede consultar cuanto quiera" |
| 5 | PIN visible con botÃ³n "Copiar" | Solo visible, sin copiar | Mejor UX para el Registrador |
| 6 | PaginaciÃ³n 10 resultados por pÃ¡gina | Mostrar todos | Performance con miles de casos |
| 7 | Whitelist explÃ­cita de campos devueltos | Devolver denuncia completa | Seguridad; no exponer datos sensibles |
| 8 | Solo acceso para rol Registrador (vÃ­a permiso) | Cualquier usuario autenticado | Privacidad; el Registrador es el Ãºnico que necesita esta funciÃ³n |

---

## 9. shadcn a instalar
- `table`

## 10. VerificaciÃ³n de cierre

### Pruebas manuales
1. âœ… Login como Registrador â†’ aparece Ã­tem "Consultar casos" en sidebar
2. âœ… Login como TÃ©cnico o Jefe â†’ NO aparece el Ã­tem (solo Registrador)
3. âœ… BÃºsqueda con texto libre "robo" â†’ encuentra denuncias con esa palabra en hechos
4. âœ… BÃºsqueda con ticket exacto "DEN-2026-0005" â†’ encuentra esa denuncia
5. âœ… Filtrar por estado "admitida" â†’ solo ve admitidas
6. âœ… Filtrar por rango de fechas â†’ respeta el rango
7. âœ… Click "Ver" â†’ abre detalle en modo consulta (sin botones de acciÃ³n)
8. âœ… Click "Consultar cÃ³digo" â†’ muestra ticket + PIN
9. âœ… Click "Copiar" â†’ copia al portapapeles con toast
10. âœ… Verificar que la bitÃ¡cora del caso NO tiene una nueva entrada "consulta_codigo"

### VerificaciÃ³n de seguridad
- âœ… Intentar acceder a `/denuncias/consultar` como TÃ©cnico â†’ redirige o 403
- âœ… Intentar `GET /denuncias/DEN-2026-0005/consultar-codigo` como anÃ³nimo â†’ 403
- âœ… La respuesta del backend NO incluye denunciantes CI, emails, telÃ©fonos, etc.

### VerificaciÃ³n de docs
- âœ… `Esquema de Base de Datos.md` â€” acciÃ³n `consulta_codigo` quitada del enum `bitacora.accion`
- âœ… `AI-CONTEXT.md` menciona la pÃ¡gina
- âœ… `Plan de Desarrollo.md` con archivos del sprint

## 11. Cierre

Al cerrar Sprint 7.7:
- El Registrador tiene una pÃ¡gina dedicada para buscar y consultar casos
- Puede consultar el cÃ³digo de un caso sin burocracia
- Sin logs visibles (decisiÃ³n del cliente)
- Cumple con la Ley 974 (privacidad, reserva de identidad, etc.)

**Siguiente sprint:** Sprint 10 â€” Panel AdministraciÃ³n CatÃ¡logos + SubcategorÃ­as.

---
*Documento creado: Julio 2026. Sprint 7.7 â€” BÃºsqueda y Consulta para Registrador.*

