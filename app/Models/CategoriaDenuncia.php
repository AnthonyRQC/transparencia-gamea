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
        'clave', 'nombre', 'descripcion', 'parent_id', 'tipo_denuncia', 'activa',
    ];

    protected array $uppercaseFields = [
        'nombre', 'descripcion',
    ];

    protected function casts(): array
    {
        return [
            'activa' => 'boolean',
        ];
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id');
    }

    public function denuncias(): HasMany
    {
        return $this->hasMany(Denuncia::class);
    }
}
