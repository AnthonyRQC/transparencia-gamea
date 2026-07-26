<?php

namespace App\Models;

use App\Helpers\UppercaseText;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Ampliacion extends Model
{
    use UppercaseText;

    protected $table = 'ampliaciones';

    protected $fillable = [
        'entidad_type', 'entidad_id', 'dias', 'justificacion',
        'numero', 'aprobado_por_id', 'solicitado_por',
        'archivo_respaldo', 'fecha',
    ];

    protected array $uppercaseFields = [
        'justificacion', 'solicitado_por',
    ];

    protected function casts(): array
    {
        return [
            'fecha' => 'datetime',
        ];
    }

    public function entidad(): MorphTo
    {
        return $this->morphTo();
    }

    public function aprobadoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'aprobado_por_id');
    }
}
