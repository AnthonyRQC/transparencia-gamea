<?php

namespace App\Models;

use App\Helpers\UppercaseText;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class DenunciaArchivo extends Model
{
    use UppercaseText;

    protected $table = 'denuncias_archivos';

    protected $fillable = [
        'denuncia_id', 'usuario_id', 'nombre', 'path', 'tamano',
        'mime_type', 'descripcion', 'contexto',
        'contexto_entidad_type', 'contexto_entidad_id',
        'fecha_eliminacion', 'fecha_subida',
    ];

    protected array $uppercaseFields = [
        'descripcion',
    ];

    protected function casts(): array
    {
        return [
            'fecha_eliminacion' => 'datetime',
            'fecha_subida' => 'datetime',
        ];
    }

    public function denuncia(): BelongsTo
    {
        return $this->belongsTo(Denuncia::class);
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

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
