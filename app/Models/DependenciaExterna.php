<?php

namespace App\Models;

use App\Traits\UppercaseText;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DependenciaExterna extends Model
{
    use UppercaseText;

    protected $table = 'dependencias_externas';

    protected $fillable = [
        'nombre', 'parent_id', 'activa',
        'fecha_desactivacion', 'desactivado_por_id',
    ];

    protected array $uppercaseFields = [
        'nombre',
    ];

    protected function casts(): array
    {
        return [
            'activa' => 'boolean',
            'fecha_desactivacion' => 'datetime',
        ];
    }

    public function desactivadoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'desactivado_por_id');
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id')->orderBy('nombre');
    }

    public function solicitudes(): HasMany
    {
        return $this->hasMany(SolicitudInformacion::class, 'dependencia_destino_id');
    }

    public function scopeActivas($query)
    {
        return $query->where('activa', true);
    }

    public function scopeInactivas($query)
    {
        return $query->where('activa', false);
    }
}
