<?php

namespace App\Models;

use App\Helpers\UppercaseText;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InformeFinal extends Model
{
    use UppercaseText;

    protected $table = 'informes_finales';

    protected $appends = ['clasificacion'];

    protected $fillable = [
        'denuncia_id', 'clasificacion_id', 'clasificado_por_id', 'sitpreco', 'fojas',
        'justificacion', 'concluido_por', 'redactado_at',
        'eliminado', 'fecha_eliminacion', 'historial_ediciones',
    ];

    protected array $uppercaseFields = [
        'justificacion', 'concluido_por',
    ];

    protected function casts(): array
    {
        return [
            'redactado_at' => 'datetime',
            'fecha_eliminacion' => 'datetime',
            'eliminado' => 'boolean',
            'historial_ediciones' => 'array',
        ];
    }

    public function denuncia(): BelongsTo
    {
        return $this->belongsTo(Denuncia::class);
    }

    public function clasificacionRel(): BelongsTo
    {
        return $this->belongsTo(Clasificacion::class, 'clasificacion_id');
    }

    public function clasificadoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'clasificado_por_id');
    }

    public function getClasificacionAttribute(): ?string
    {
        if ($this->relationLoaded('clasificacionRel')) {
            return $this->clasificacionRel?->clave;
        }

        return Clasificacion::whereKey($this->clasificacion_id)->value('clave');
    }
}
