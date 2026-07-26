<?php

namespace App\Models;

use App\Helpers\UppercaseText;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class UnidadExterna extends Model
{
    use UppercaseText;

    protected $table = 'unidades_externas';

    protected $fillable = [
        'clave', 'nombre', 'activa',
    ];

    protected array $uppercaseFields = [
        'nombre',
    ];

    protected function casts(): array
    {
        return [
            'activa' => 'boolean',
        ];
    }

    public function solicitudes(): HasMany
    {
        return $this->hasMany(SolicitudInformacion::class, 'unidad_destino_id');
    }
}
