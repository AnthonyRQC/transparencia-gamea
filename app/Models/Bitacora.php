<?php

namespace App\Models;

use App\Helpers\UppercaseText;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Bitacora extends Model
{
    use UppercaseText;

    protected $table = 'bitacora';

    protected $fillable = [
        'denuncia_id', 'entidad_tipo', 'entidad_id',
        'accion', 'detalle', 'usuario_id', 'fecha',
    ];

    protected array $uppercaseFields = [
        'detalle',
    ];

    protected function casts(): array
    {
        return [
            'fecha' => 'datetime',
        ];
    }

    public function denuncia(): BelongsTo
    {
        return $this->belongsTo(Denuncia::class);
    }

    public function entidad(): MorphTo
    {
        return $this->morphTo();
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function toArray()
    {
        $array = parent::toArray();
        $array['usuario'] = $this->usuario ? $this->usuario->name : 'sistema';
        return $array;
    }
}
