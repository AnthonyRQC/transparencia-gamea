<?php

namespace App\Models;

use App\Helpers\UppercaseText;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Prueba extends Model
{
    use UppercaseText;

    protected $fillable = [
        'denuncia_id', 'tipo', 'descripcion', 'testigo_nombre', 'testigo_telefono',
    ];

    protected array $uppercaseFields = [
        'descripcion',
    ];

    public function denuncia(): BelongsTo
    {
        return $this->belongsTo(Denuncia::class);
    }
}
