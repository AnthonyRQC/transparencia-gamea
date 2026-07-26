<?php

namespace App\Models;

use App\Helpers\UppercaseText;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EvaluacionTecnica extends Model
{
    use UppercaseText;

    protected $table = 'evaluaciones_tecnicas';

    protected $fillable = [
        'denuncia_id', 'tecnico_id', 'delegada_por_id', 'delegada_at',
        'justificacion_delegacion', 'texto_evaluacion', 'recomendacion',
        'devuelta_at', 'devuelta_por_id', 'estado',
    ];

    protected array $uppercaseFields = [
        'texto_evaluacion', 'justificacion_delegacion',
    ];

    protected function casts(): array
    {
        return [
            'delegada_at' => 'datetime',
            'devuelta_at' => 'datetime',
        ];
    }

    public function denuncia(): BelongsTo
    {
        return $this->belongsTo(Denuncia::class);
    }

    public function tecnico(): BelongsTo
    {
        return $this->belongsTo(User::class, 'tecnico_id');
    }

    public function delegadaPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'delegada_por_id');
    }

    public function devueltaPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'devuelta_por_id');
    }
}
