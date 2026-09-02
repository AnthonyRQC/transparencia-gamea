> ⚠️ **Histórico — Sprint cerrado Jul 2026 (Laravel 11).** Snapshot al cierre, no refleja refactorización Bloques 0-2 (Sep 2026, Laravel 13). Para estado actual ver AI-CONTEXT.md y Notas Reestructuración - Bloques 0-2 (Sept 2026) - Cierre.md.
# Sprint 10 â€” Convenciones de Modelos Eloquent

## 1. Nomenclatura

| Concepto | ConvenciÃ³n | Ejemplo |
|----------|-----------|---------|
| Tabla | `snake_case` plural | `solicitudes_informacion` |
| Modelo | `PascalCase` singular | `SolicitudInformacion` |
| PK | `id` (auto-increment) | `$table->id()` |
| FK | `tabla_singular_id` | `denuncia_id` |
| Timestamps | Laravel automÃ¡ticos | `$table->timestamps()` |
| JSON | `json` nativo MySQL | `$table->json('campo')->nullable()` |
| Soft delete | `deleted_at` (solo Denuncia) | `$table->softDeletes()` |

## 2. Casts estÃ¡ndar

```php
// En cada modelo que tenga campos JSON
protected $casts = [
    'historial_ediciones' => 'array',
];

// En Denuncia
protected $casts = [
    'traspaso_json' => 'array',
    'reapertura_json' => 'array',
    'conciliacion_json' => 'array',
    'declaracion_jurada' => 'boolean',
    'es_legacy' => 'boolean',
    'fecha_hechos' => 'date',
    'fecha_admitida' => 'datetime',
    'fecha_rechazada' => 'datetime',
    'fecha_asignada' => 'datetime',
];

// En User
protected $casts = [
    'preferencias' => 'array',
    'activo' => 'boolean',
    'email_verified_at' => 'datetime',
];
```

## 3. Soft deletes

```php
// SOLO en Denuncia
use Illuminate\Database\Eloquent\SoftDeletes;

class Denuncia extends Model
{
    use SoftDeletes;

    // $table->softDeletes() en migration
}
```

**Para el resto de tablas**, el soft delete se maneja con campo `fecha_eliminacion`:
```php
// Scope global para filtrar eliminados
public function scopeActivos(Builder $query): Builder
{
    return $query->whereNull('fecha_eliminacion');
}
```

## 4. Relaciones polimÃ³rficas

### Ampliacion

```php
class Ampliacion extends Model
{
    protected $fillable = [
        'entidad_type', 'entidad_id', 'dias', 'justificacion',
        'numero', 'aprobado_por_id', 'solicitado_por',
        'archivo_respaldo', 'fecha',
    ];

    // morphTo â†’ SolicitudInformacion, Descargo, Denuncia
    public function entidad(): MorphTo
    {
        return $this->morphTo();
    }

    public function aprobadoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'aprobado_por_id');
    }

    // Scopes
    public function scopeDeTipo(Builder $query, string $type): Builder
    {
        return $query->where('entidad_type', $type);
    }
}

// En la entidad que recibe ampliaciones (ej. Denuncia):
class Denuncia extends Model
{
    public function ampliaciones(): MorphMany
    {
        return $this->morphMany(Ampliacion::class, 'entidad');
    }
}
```

### DenunciaArchivo

```php
class DenunciaArchivo extends Model
{
    protected $fillable = [
        'denuncia_id', 'usuario_id', 'nombre', 'path', 'tamano',
        'mime_type', 'descripcion', 'contexto',
        'contexto_entidad_type', 'contexto_entidad_id',
        'fecha_subida', 'fecha_eliminacion',
    ];

    public function denuncia(): BelongsTo
    {
        return $this->belongsTo(Denuncia::class);
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // morphTo â†’ SolicitudInformacion, Descargo, InformeFinal, Cierre
    public function contextoEntidad(): MorphTo
    {
        return $this->morphTo();
    }

    public function scopeActivos(Builder $query): Builder
    {
        return $query->whereNull('fecha_eliminacion');
    }

    public function scopeDeContexto(Builder $query, string $contexto): Builder
    {
        return $query->where('contexto', $contexto);
    }
}
```

## 5. MayÃºsculas en textos libres

**Regla de negocio:** todos los textos libres se almacenan en MAYÃšSCULAS.

**ImplementaciÃ³n:** Usar mutators en los modelos relevantes o trait global.

```php
// Trait UppercaseText (ya existe en app/Helpers/UppercaseText.php)
trait UppercaseText
{
    public static function bootUppercaseText(): void
    {
        static::saving(function ($model) {
            foreach ($model->uppercaseFields ?? [] as $field) {
                if (isset($model->$field) && is_string($model->$field)) {
                    $model->$field = Str::upper($model->$field);
                }
            }
        });
    }
}

// En Denuncia:
class Denuncia extends Model
{
    use UppercaseText;

    protected array $uppercaseFields = [
        'lugar_hechos', 'hechos', 'justificacion_admision',
        'justificacion_rechazo', 'resumen_rechazo',
    ];
}
```

Campos listados en `Esquema BD - Negocio.md` â†’ secciÃ³n MAYÃšSCULAS (lÃ­nea 348+).

## 6. Lista completa de modelos

| # | Modelo | Tabla | PolimÃ³rfico? | Soft delete? |
|---|--------|-------|-------------|-------------|
| 1 | `CategoriaDenuncia` | `categorias_denuncia` | No | No |
| 2 | `UnidadExterna` | `unidades_externas` | No | No |
| 3 | `Feriado` | `feriados` | No | No |
| 4 | `ConfiguracionSistema` | `configuracion_sistema` | No | No |
| 5 | `User` (Breeze) | `users` | No | No (uso activo) |
| 6 | `Denuncia` | `denuncias` | No | SÃ­ (`deleted_at`) |
| 7 | `Denunciante` | `denunciantes` | No | No |
| 8 | `Denunciado` | `denunciados` | No | No |
| 9 | `Prueba` | `pruebas` | No | No |
| 10 | `EvaluacionTecnica` | `evaluaciones_tecnicas` | No | No |
| 11 | `SolicitudInformacion` | `solicitudes_informacion` | No | No |
| 12 | `Descargo` | `descargos` | No | No |
| 13 | `Ampliacion` | `ampliaciones` | **SÃ­** (entidad) | No |
| 14 | `InformeFinal` | `informes_finales` | No | No |
| 15 | `Cierre` | `cierres` | No | No |
| 16 | `DenunciaArchivo` | `denuncias_archivos` | **SÃ­** (contexto_entidad) | `fecha_eliminacion` |
| 17 | `Bitacora` | `bitacora` | No | No |
| 18 | `Notificacion` | `notificaciones` | No | No |

## 7. Relaciones entre modelos

```php
// Denuncia
class Denuncia extends Model {
    public function denunciante(): HasOne     { return $this->hasOne(Denunciante::class); }
    public function denunciados(): HasMany    { return $this->hasMany(Denunciado::class); }
    public function pruebas(): HasMany         { return $this->hasMany(Prueba::class); }
    public function evaluaciones(): HasMany   { return $this->hasMany(EvaluacionTecnica::class); }
    public function solicitudes(): HasMany    { return $this->hasMany(SolicitudInformacion::class); }
    public function descargos(): HasMany      { return $this->hasMany(Descargo::class); }
    public function ampliaciones(): MorphMany { return $this->morphMany(Ampliacion::class, 'entidad'); }
    public function informe(): HasOne         { return $this->hasOne(InformeFinal::class); }
    public function cierre(): HasOne          { return $this->hasOne(Cierre::class); }
    public function archivos(): HasMany       { return $this->hasMany(DenunciaArchivo::class); }
    public function bitacora(): HasMany       { return $this->hasMany(Bitacora::class); }
    public function notificaciones(): HasMany { return $this->hasMany(Notificacion::class); }
    public function tecnico(): BelongsTo      { return $this->belongsTo(User::class, 'tecnico_id'); }
    public function tecnicoAnterior(): BelongsTo { return $this->belongsTo(User::class, 'tecnico_anterior_id'); }
    public function registradoPor(): BelongsTo { return $this->belongsTo(User::class, 'registrado_por_id'); }
    public function categoria(): BelongsTo    { return $this->belongsTo(CategoriaDenuncia::class); }
}

// SolicitudInformacion
class SolicitudInformacion extends Model {
    public function denuncia(): BelongsTo   { return $this->belongsTo(Denuncia::class); }
    public function unidadDestino(): BelongsTo { return $this->belongsTo(UnidadExterna::class, 'unidad_destino_id'); }
    public function ampliaciones(): MorphMany { return $this->morphMany(Ampliacion::class, 'entidad'); }
    public function archivos(): HasMany     { return $this->hasMany(DenunciaArchivo::class, 'contexto_entidad_id')
        ->where('contexto_entidad_type', SolicitudInformacion::class); }
}

// Descargo
class Descargo extends Model {
    public function denuncia(): BelongsTo   { return $this->belongsTo(Denuncia::class); }
    public function denunciado(): BelongsTo { return $this->belongsTo(Denunciado::class); }
    public function ampliaciones(): MorphMany { return $this->morphMany(Ampliacion::class, 'entidad'); }
    public function archivos(): HasMany     { return $this->hasMany(DenunciaArchivo::class, 'contexto_entidad_id')
        ->where('contexto_entidad_type', Descargo::class); }
}

// InformeFinal
class InformeFinal extends Model {
    public function denuncia(): BelongsTo { return $this->belongsTo(Denuncia::class); }
    public function archivos(): HasMany  { return $this->hasMany(DenunciaArchivo::class, 'contexto_entidad_id')
        ->where('contexto_entidad_type', InformeFinal::class); }
}

// Cierre
class Cierre extends Model {
    public function denuncia(): BelongsTo { return $this->belongsTo(Denuncia::class); }
    public function archivos(): HasMany  { return $this->hasMany(DenunciaArchivo::class, 'contexto_entidad_id')
        ->where('contexto_entidad_type', Cierre::class); }
}
```

## 8. ValidaciÃ³n (Form Requests)

Crear Form Requests para validaciÃ³n de entrada:

```php
// app/Http/Requests/StoreDenunciaRequest.php
class StoreDenunciaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return Auth::user()->rol === 'registrador';
    }

    public function rules(): array
    {
        return [
            'tipo' => 'required|in:corrupcion,negacion',
            'escenario' => 'required|in:revelada,anonimo,reservada',
            'hechos' => 'required|string|min:20|max:8000',
            'lugar_hechos' => 'nullable|string|max:500',
            'categoria_id' => 'nullable|exists:categorias_denuncia,id',
            'declaracion_jurada' => 'boolean',
            // ... mÃ¡s campos
        ];
    }
}
```

---

*Documento creado: Julio 2026. Convenciones de modelos para Sprint 10.*

