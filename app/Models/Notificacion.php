<?php

namespace App\Models;

use App\Traits\UppercaseText;
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
        // URL fija al crear (D24). No se reescribe por privilegio: un
        // investigador-interino no debe caer siempre en la bandeja.
        if (!$value) return null;

        $url = url($value);
        if ($this->ticket && !str_contains($url, 'destacar=')) {
            $separator = str_contains($url, '?') ? '&' : '?';
            $url .= "{$separator}destacar={$this->ticket}";
        }

        return $url;
    }
}
