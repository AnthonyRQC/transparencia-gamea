<?php

namespace App\Models;

use App\Helpers\UppercaseText;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Clasificacion extends Model
{
    use UppercaseText;

    protected $table = 'clasificaciones';

    protected $fillable = [
        'clave', 'nombre', 'descripcion', 'activa',
        'fecha_desactivacion', 'desactivado_por_id',
    ];

    protected array $uppercaseFields = [
        'nombre', 'descripcion',
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

    public function informes(): HasMany
    {
        return $this->hasMany(InformeFinal::class, 'clasificacion_id');
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
