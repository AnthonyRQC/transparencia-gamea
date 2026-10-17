<?php

namespace App\Models;

use App\Traits\UppercaseText;
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
        'user_agent',
    ];

    protected static function booted(): void
    {
        static::creating(function (Bitacora $b) {
            $consolaReal = app()->runningInConsole() && ! app()->runningUnitTests();
            if (empty($b->user_agent) && ! $consolaReal) {
                $ua = request()->userAgent();
                $b->user_agent = $ua ? mb_substr($ua, 0, 512) : null;
            }
        });

        static::updating(function () {
            throw new \LogicException('La bitácora es append-only: no admite edición ni borrado.');
        });

        static::deleting(function () {
            throw new \LogicException('La bitácora es append-only: no admite edición ni borrado.');
        });
    }

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
