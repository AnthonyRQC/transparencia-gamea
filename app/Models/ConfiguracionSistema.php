<?php

namespace App\Models;

use App\Helpers\UppercaseText;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ConfiguracionSistema extends Model
{
    use UppercaseText;

    protected $table = 'configuracion_sistema';

    protected $fillable = [
        'clave', 'valor', 'descripcion', 'actualizado_por_id', 'actualizado_at',
    ];

    protected array $uppercaseFields = [
        'descripcion',
    ];

    public function actualizadoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actualizado_por_id');
    }
}
