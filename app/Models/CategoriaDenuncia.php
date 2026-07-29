<?php

namespace App\Models;

use App\Helpers\UppercaseText;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CategoriaDenuncia extends Model
{
    use UppercaseText;

    protected $table = 'categorias_denuncia';

    protected $fillable = [
        'clave', 'nombre', 'descripcion', 'tipo_denuncia', 'activa',
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

    public function denuncias(): HasMany
    {
        return $this->hasMany(Denuncia::class);
    }
}
