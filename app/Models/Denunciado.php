<?php

namespace App\Models;

use App\Helpers\UppercaseText;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Denunciado extends Model
{
    use UppercaseText;

    protected $fillable = [
        'denuncia_id', 'orden', 'conoce_identidad', 'nombres', 'dependencia', 'descripcion',
    ];

    protected array $uppercaseFields = [
        'nombres', 'dependencia', 'descripcion',
    ];

    protected function casts(): array
    {
        return [
            'conoce_identidad' => 'boolean',
        ];
    }

    public function denuncia(): BelongsTo
    {
        return $this->belongsTo(Denuncia::class);
    }

    public function descargos(): HasMany
    {
        return $this->hasMany(Descargo::class);
    }
}
