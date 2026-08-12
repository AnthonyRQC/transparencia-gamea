<?php

namespace App\Models;

use App\Helpers\UppercaseText;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Cierre extends Model
{
    use UppercaseText;

    protected $appends = ['notificacion_medio'];

    protected $fillable = [
        'denuncia_id',
        'notificado_denunciante',
        'notificacion_medio_id', 'notificacion_fecha', 'notificacion_descripcion',
        'no_notificado_motivo',
        'concluido_por', 'descripcion', 'cerrado_at',
        'cerrado_por_id', 'eliminado', 'fecha_eliminacion', 'historial_ediciones',
    ];

    protected array $uppercaseFields = [
        'descripcion', 'notificacion_descripcion',
        'no_notificado_motivo', 'concluido_por',
    ];

    protected function casts(): array
    {
        return [
            'notificado_denunciante' => 'boolean',
            'notificacion_fecha' => 'datetime',
            'cerrado_at' => 'datetime',
            'fecha_eliminacion' => 'datetime',
            'eliminado' => 'boolean',
            'historial_ediciones' => 'array',
        ];
    }

    public function denuncia(): BelongsTo
    {
        return $this->belongsTo(Denuncia::class);
    }

    public function medioNotificacion(): BelongsTo
    {
        return $this->belongsTo(MedioNotificacion::class, 'notificacion_medio_id');
    }

    public function cerradoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cerrado_por_id');
    }

    public function getNotificacionMedioAttribute(): ?string
    {
        if ($this->relationLoaded('medioNotificacion')) {
            return $this->medioNotificacion?->clave;
        }

        return MedioNotificacion::whereKey($this->notificacion_medio_id)->value('clave');
    }
}
