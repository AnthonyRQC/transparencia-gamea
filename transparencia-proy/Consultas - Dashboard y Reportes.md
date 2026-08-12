# Consultas — Dashboard y Reportes

> **Propósito:** Catálogo de consultas listas para implementar **Sprint 12** (Dashboard + KPIs +
> Reportes PDF/Excel). Asume el esquema reestructurado de Agosto 2026 (tablas `clasificaciones`
> y `medios_notificacion`, FKs, árbol de dependencias, índices).

---

## 1. Regla general — `users.activo`

Toda agregación **por usuario** (técnico, clasificado_por, cerrado_por) debe:
1. **Filtrar `users.activo = true` por defecto** → los usuarios desactivados no aparecen en gráficas/informes.
2. Ofrecer un **toggle "Incluir inactivos"** → sirve de recordatorio al Jefe de qué técnicos ya no
   trabajan en el área y conviene desactivar (aún tienen datos históricos).

```php
User::where('rol', 'tecnico')->where('activo', true); // técnicos activos
```

> Los usuarios **nunca se borran**; se desactivan con `activo = false`. Las FKs
> (`tecnico_id`, `clasificado_por_id`, `cerrado_por_id`) preservan el histórico.

---

## 2. Índices disponibles (ya migrados)

| Tabla | Índices |
|-------|---------|
| `denuncias` | `ticket` (uniq), `estado`, `tecnico_id`, `tipo`, `created_at` |
| `informes_finales` | `denuncia_id` (uniq), `clasificacion_id`, `clasificado_por_id`, `redactado_at` |
| `cierres` | `denuncia_id` (uniq), `notificacion_medio_id`, `cerrado_por_id`, `cerrado_at` |
| `solicitudes_informacion` | `denuncia_id`, `dependencia_destino_id`, `estado` |
| `dependencias_externas` | `parent_id` (árbol) |

Soft-deletes: `denuncias` usa `SoftDeletes` (`deleted_at` — excluidas automáticamente).
`informes_finales`/`cierres`/`solicitudes_informacion` usan bandera `eliminado` → siempre filtrar `eliminado = false`.

---

## 3. KPIs

### 3.1 Denuncias activas
```php
use App\Models\Denuncia;

$activas = Denuncia::whereNotIn('estado', ['rechazada', 'cerrada'])->count();
```

### 3.2 Pendientes de admisión (≤5 días hábiles, Art. 23)
```php
$pendientesAdmision = Denuncia::whereIn('estado', ['ingresada', 'evaluacion_tecnica'])->count();
```

### 3.3 Casos próximos a vencer (≤5 días) y vencidos con mora
> Dependen de **días hábiles** (helper `DiasHabiles`) y de las ampliaciones → se calculan en PHP
> sobre el accessor `plazo` del modelo (no en SQL puro):

```php
$activas = Denuncia::whereNotIn('estado', ['rechazada', 'cerrada'])
    ->with('ampliaciones')
    ->get();

$proximosAVencer = $activas->filter(fn($d) => ($d->plazo['dias_restantes'] ?? 0) <= 5 && ($d->plazo['dias_restantes'] ?? 0) >= 0)->count();
$vencidos = $activas->filter(fn($d) => ($d->plazo['dias_restantes'] ?? 0) < 0)->count();
```

### 3.4 % Cumplimiento de plazos
```php
// Cerradas donde cerrado_at <= vencimiento calculado (días hábiles)
$cerradas = Denuncia::where('estado', 'cerrada')->with(['ampliaciones', 'cierre'])->get();

$cumplidas = $cerradas->filter(function ($d) {
    $vencimiento = \Carbon\Carbon::parse($d->plazo['fecha_vencimiento']);
    return $d->cierre && $d->cierre->cerrado_at->lte($vencimiento);
})->count();

$porcentaje = $cerradas->count() > 0 ? round($cumplidas / $cerradas->count() * 100, 1) : 0;
```

---

## 4. Gráficos (agregaciones en tiempo real)

> Importar `use Illuminate\Support\Facades\DB;` y `use App\Models\...`.

### 4.1 Casos por clasificación final (rango por `redactado_at`)
```php
$porClasificacion = DB::table('informes_finales')
    ->join('clasificaciones', 'informes_finales.clasificacion_id', '=', 'clasificaciones.id')
    ->where('informes_finales.eliminado', false)
    ->when($desde, fn($q) => $q->whereDate('informes_finales.redactado_at', '>=', $desde))
    ->when($hasta, fn($q) => $q->whereDate('informes_finales.redactado_at', '<=', $hasta))
    ->selectRaw('clasificaciones.clave, clasificaciones.nombre, COUNT(*) as total')
    ->groupBy('clasificaciones.id', 'clasificaciones.clave', 'clasificaciones.nombre')
    ->orderByDesc('total')
    ->get();
```

### 4.2 Casos por tipo de denuncia (rango por `created_at`)
```php
$porTipo = Denuncia::whereNull('deleted_at')
    ->when($desde, fn($q) => $q->whereDate('created_at', '>=', $desde))
    ->when($hasta, fn($q) => $q->whereDate('created_at', '<=', $hasta))
    ->selectRaw('tipo, COUNT(*) as total')
    ->groupBy('tipo')
    ->get();
// Etiquetas: corrupcion => CORRUPCIÓN, negacion => NEGACIÓN DE INFORMACIÓN
```

### 4.3 Casos por estado (order del flujo)
```php
$ordenEstado = ['ingresada', 'evaluacion_tecnica', 'admitida', 'rechazada', 'asignada', 'investigacion', 'informe', 'cerrada'];

$porEstado = Denuncia::whereNull('deleted_at')
    ->when($desde, fn($q) => $q->whereDate('created_at', '>=', $desde))
    ->when($hasta, fn($q) => $q->whereDate('created_at', '<=', $hasta))
    ->selectRaw('estado, COUNT(*) as total')
    ->groupBy('estado')
    ->get()
    ->sortBy(fn($r) => array_search($r->estado, $ordenEstado, true))
    ->values();
```

### 4.4 Casos por técnico asignado (solo activos por defecto)
```php
$porTecnico = DB::table('denuncias')
    ->join('users', 'denuncias.tecnico_id', '=', 'users.id')
    ->whereNull('denuncias.deleted_at')
    ->when($incluirInactivos ?? false, fn($q) => $q, fn($q) => $q->where('users.activo', true))
    ->selectRaw('users.id, users.name, COUNT(*) as total')
    ->groupBy('users.id', 'users.name')
    ->orderByDesc('total')
    ->get();
```

### 4.5 Casos clasificados por usuario y tipo de clasificación
```php
$porClasificador = DB::table('informes_finales')
    ->join('users', 'informes_finales.clasificado_por_id', '=', 'users.id')
    ->join('clasificaciones', 'informes_finales.clasificacion_id', '=', 'clasificaciones.id')
    ->where('informes_finales.eliminado', false)
    ->when($incluirInactivos ?? false, fn($q) => $q, fn($q) => $q->where('users.activo', true))
    ->when($desde, fn($q) => $q->whereDate('informes_finales.redactado_at', '>=', $desde))
    ->when($hasta, fn($q) => $q->whereDate('informes_finales.redactado_at', '<=', $hasta))
    ->selectRaw('users.name as usuario, clasificaciones.nombre as clasificacion, COUNT(*) as total')
    ->groupBy('users.id', 'users.name', 'clasificaciones.id', 'clasificaciones.nombre')
    ->orderBy('users.name')
    ->get();
```

### 4.6 Cierres por medio de notificación
```php
$porMedio = DB::table('cierres')
    ->join('medios_notificacion', 'cierres.notificacion_medio_id', '=', 'medios_notificacion.id')
    ->where('cierres.eliminado', false)
    ->when($desde, fn($q) => $q->whereDate('cierres.cerrado_at', '>=', $desde))
    ->when($hasta, fn($q) => $q->whereDate('cierres.cerrado_at', '<=', $hasta))
    ->selectRaw('medios_notificacion.clave, medios_notificacion.nombre, COUNT(*) as total')
    ->groupBy('medios_notificacion.id', 'medios_notificacion.clave', 'medios_notificacion.nombre')
    ->orderByDesc('total')
    ->get();
```

### 4.7 Evolución temporal (línea)
```php
// Denuncias por día (ingreso)
$porDia = Denuncia::whereNull('deleted_at')
    ->when($desde, fn($q) => $q->whereDate('created_at', '>=', $desde))
    ->when($hasta, fn($q) => $q->whereDate('created_at', '<=', $hasta))
    ->selectRaw('DATE(created_at) as fecha, COUNT(*) as total')
    ->groupBy('fecha')
    ->orderBy('fecha')
    ->get();

// Clasificados por día (informe)
$clasificadosPorDia = DB::table('informes_finales')
    ->where('eliminado', false)
    ->when($desde, fn($q) => $q->whereDate('redactado_at', '>=', $desde))
    ->when($hasta, fn($q) => $q->whereDate('redactado_at', '<=', $hasta))
    ->selectRaw('DATE(redactado_at) as fecha, COUNT(*) as total')
    ->groupBy('fecha')
    ->orderBy('fecha')
    ->get();
```

---

## 5. Reportes por dependencia (roll-up por árbol)

`denuncias` no referencia dependencias directamente; la relación va vía **solicitudes de
información** (`solicitudes_informacion.dependencia_destino_id`). Para "qué direcciones tienen
más solicitudes" se usa el árbol de `dependencias_externas` con **roll-up**: la cuenta de un nodo
padre = suma de sus descendientes.

### 5.1 Cuenta directa por dependencia (hojas)
```php
use App\Models\DependenciaExterna;
use Illuminate\Support\Facades\DB;

$cuentas = DB::table('solicitudes_informacion')
    ->whereNull('fecha_eliminacion')
    ->when($desde, fn($q) => $q->whereDate('fecha_envio', '>=', $desde))
    ->when($hasta, fn($q) => $q->whereDate('fecha_envio', '<=', $hasta))
    ->selectRaw('dependencia_destino_id, COUNT(*) as total')
    ->groupBy('dependencia_destino_id')
    ->pluck('total', 'dependencia_destino_id');
```

### 5.2 Roll-up en PHP (todas las dependencias + suma a padres)
```php
$arbol = DependenciaExterna::where('activa', true)->get(['id', 'parent_id', 'nombre']);

$directos = $arbol->mapWithKeys(fn($d) => [$d->id => (int) ($cuentas[$d->id] ?? 0)]);

$rollUp = $directos->toArray(); // copia
$calcular = function (int $id) use (&$calcular, &$rollUp, $arbol) {
    $hijos = $arbol->where('parent_id', $id);
    foreach ($hijos as $hijo) {
        $rollUp[$id] = ($rollUp[$id] ?? 0) + $calcular($hijo->id);
    }
    return $rollUp[$id] ?? 0;
};

// Suma desde la raíz para propagar a todos los padres
$rollUpFinal = $calcular(0);
$calcular(0);

// Resultado: map id => total acumulado (unidad + sus hijas)
```

> Alternativa MySQL 8 con CTE recursivo si se prefiere SQL. A escala institucional, la recursión
> en PHP sobre ~185 nodos es instantánea y más mantenible.

---

## 6. Filtros cruzados (Reportes)

Todos los filtros se combinan con `when()` sobre la misma query base. Ejemplo completo de reporte
de denuncias filtrable:

```php
$query = Denuncia::with(['tecnico', 'categoria'])
    ->whereNull('deleted_at')
    ->when($desde, fn($q) => $q->whereDate('created_at', '>=', $desde))
    ->when($hasta, fn($q) => $q->whereDate('created_at', '<=', $hasta))
    ->when($tipo, fn($q, $v) => $q->where('tipo', $v))
    ->when($estado, fn($q, $v) => $q->where('estado', $v))
    ->when($tecnicoId, fn($q, $v) => $q->where('tecnico_id', $v))
    ->when($categoriaId, fn($q, $v) => $q->where('categoria_id', $v))
    ->when($busqueda, fn($q, $v) => $q->where(function ($q) use ($v) {
        $q->where('ticket', 'like', "%{$v}%")
          ->orWhere('hechos', 'like', "%{$v}%");
    }))
    ->orderByDesc('created_at')
    ->paginate(20); // o ->get() para exportar
```

Reporte de informes (para clasificación):

```php
$query = DB::table('informes_finales')
    ->join('denuncias', 'informes_finales.denuncia_id', '=', 'denuncias.id')
    ->join('clasificaciones', 'informes_finales.clasificacion_id', '=', 'clasificaciones.id')
    ->whereNull('denuncias.deleted_at')
    ->where('informes_finales.eliminado', false)
    ->when($desde, fn($q) => $q->whereDate('informes_finales.redactado_at', '>=', $desde))
    ->when($hasta, fn($q) => $q->whereDate('informes_finales.redactado_at', '<=', $hasta))
    ->when($clasificacionId, fn($q, $v) => $q->where('informes_finales.clasificacion_id', $v))
    ->when($tecnicoId, fn($q, $v) => $q->where('informes_finales.clasificado_por_id', $v))
    ->selectRaw('denuncias.ticket, denuncias.tipo, clasificaciones.nombre as clasificacion, informes_finales.redactado_at, informes_finales.sitpreco, informes_finales.fojas')
    ->orderByDesc('informes_finales.redactado_at')
    ->get();
```

---

## 7. Exportación PDF / Excel (Sprint 12)

- **Misma query filtrada** se reutiliza para pantalla, Excel (`maatwebsite/excel`) y PDF (`barryvdh/laravel-dompdf`).
- El `ReporteController` recibe los filtros por query string y devuelve:
  - `GET /reportes` → Inertia con datos agregados (gráficos) + tabla paginada.
  - `GET /reportes/exportar?formato=excel|pdf&<filtros>` → respuesta de descarga.
- **Solo Jefe de Unidad** (permiso existente). En los informes por usuario aplicar la regla de §1.
- Para KPIs con días hábiles (próximas a vencer, mora, % cumplimiento), calcular en PHP como en §3.

---

## 8. Notas de implementación (frontend)

- `npm install recharts` para gráficos (barras, torta, línea).
- Los endpoints del dashboard devuelven arrays `[{ label, value }]` listos para Recharts.
- `Reportes/Index.tsx` usa shadcn `table` + `FiltrosReporte.tsx` (rango de fechas doble + selects de tipo/estado/clasificación/dependencia).
- El select de dependencia en reportes debe usar el **árbol** (mismo patrón que `ModalNuevaSolicitud`).
