<?php

namespace App\Models;

use App\Helpers\UppercaseText;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CategoriaDenuncia extends Model
{
    use UppercaseText;

    protected $table = 'categorias_denuncia';

    protected $fillable = [
        'clave', 'nombre', 'descripcion', 'tipo_denuncia', 'activa',
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

    public function scopeActivas($query)
    {
        return $query->where('activa', true);
    }

    public function scopeInactivas($query)
    {
        return $query->where('activa', false);
    }

    public function denuncias(): HasMany
    {
        return $this->hasMany(Denuncia::class, 'categoria_id');
    }
}
