<?php

namespace App\Models;

use App\Helpers\UppercaseText;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InformeFinal extends Model
{
    use UppercaseText;

    protected $table = 'informes_finales';

    protected $fillable = [
        'denuncia_id', 'clasificacion', 'sitpreco', 'fojas',
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
}
