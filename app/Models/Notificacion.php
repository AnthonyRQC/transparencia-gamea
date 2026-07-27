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
        if (!$value) return null;

        $user = auth()->user();
        $targetPath = $value;

        if ($user && $user->rol === 'tecnico' && ($targetPath === '/denuncias' || str_starts_with($targetPath, '/denuncias?'))) {
            $targetPath = '/denuncias/mis-casos';
        } elseif ($user && $user->rol === 'jefe' && ($targetPath === '/denuncias/mis-casos' || str_starts_with($targetPath, '/denuncias/mis-casos?'))) {
            $targetPath = '/denuncias';
        }

        $url = url($targetPath);
        if ($this->ticket && !str_contains($url, 'destacar=')) {
            $separator = str_contains($url, '?') ? '&' : '?';
            $url .= "{$separator}destacar={$this->ticket}";
        }

        return $url;
    }
}
