<?php

namespace App\Models;

use App\Helpers\UppercaseText;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MedioNotificacion extends Model
{
    use UppercaseText;

    protected $table = 'medios_notificacion';

    protected $fillable = [
        'clave', 'nombre', 'activa',
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

    public function cierres(): HasMany
    {
        return $this->hasMany(Cierre::class, 'notificacion_medio_id');
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
