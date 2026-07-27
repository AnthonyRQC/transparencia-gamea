<?php

namespace App\Models;

use App\Helpers\UppercaseText;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notificacion extends Model
{
    use UppercaseText;

    protected $table = 'notificaciones';

    protected $fillable = [
        'usuario_id', 'tipo', 'titulo', 'mensaje', 'ticket',
        'destino_url', 'icono', 'color',
        'leida', 'fecha_leida', 'fecha',
    ];

    protected array $uppercaseFields = [
        'titulo', 'mensaje',
    ];

    protected function casts(): array
    {
        return [
            'leida' => 'boolean',
            'fecha_leida' => 'datetime',
            'fecha' => 'datetime',
        ];
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function getDestinoUrlAttribute($value)
    {
        return $value ? url($value) : null;
    }
}
