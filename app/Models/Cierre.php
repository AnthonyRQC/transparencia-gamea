<?php

namespace App\Models;

use App\Helpers\UppercaseText;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Cierre extends Model
{
    use UppercaseText;

    protected $fillable = [
        'denuncia_id',
        'notificado_denunciante',
        'notificacion_medio', 'notificacion_fecha', 'notificacion_descripcion',
        'no_notificado_motivo',
        'concluido_por', 'descripcion', 'cerrado_at',
        'eliminado', 'fecha_eliminacion', 'historial_ediciones',
    ];

    protected array $uppercaseFields = [
        'descripcion', 'notificacion_medio', 'notificacion_descripcion',
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
}
