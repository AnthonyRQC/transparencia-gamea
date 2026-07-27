<?php

namespace App\Models;

use App\Helpers\UppercaseText;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Descargo extends Model
{
    use UppercaseText;

    protected $fillable = [
        'denuncia_id', 'denunciado_id', 'fecha_notificacion', 'medio',
        'respaldo_archivo_nombre', 'respaldo_archivo_path', 'respaldo_archivo_tamano',
        'fecha_vencimiento', 'fecha_respuesta', 'resumen_descargo',
        'estado', 'motivo_cancelacion', 'fecha_cancelacion',
        'eliminado', 'fecha_eliminacion', 'historial_ediciones',
    ];

    protected array $uppercaseFields = [
        'medio', 'resumen_descargo', 'motivo_cancelacion',
    ];

    protected $appends = ['nombres_denunciado', 'dependencia_denunciado', 'denunciado_idx'];

    public function getNombresDenunciadoAttribute()
    {
        return $this->denunciado ? $this->denunciado->nombres : '';
    }

    public function getDependenciaDenunciadoAttribute()
    {
        return $this->denunciado ? $this->denunciado->dependencia : '';
    }

    public function getDenunciadoIdxAttribute()
    {
        return $this->denunciado ? $this->denunciado->orden : -1;
    }

    protected function casts(): array
    {
        return [
            'fecha_notificacion' => 'datetime',
            'fecha_vencimiento' => 'datetime',
            'fecha_respuesta' => 'datetime',
            'fecha_cancelacion' => 'datetime',
            'fecha_eliminacion' => 'datetime',
            'eliminado' => 'boolean',
            'historial_ediciones' => 'array',
        ];
    }

    public function denuncia(): BelongsTo
    {
        return $this->belongsTo(Denuncia::class);
    }

    public function denunciado(): BelongsTo
    {
        return $this->belongsTo(Denunciado::class);
    }

    public function ampliaciones(): MorphMany
    {
        return $this->morphMany(Ampliacion::class, 'entidad');
    }

    public function scopeActivos($query)
    {
        return $query->whereNull('fecha_eliminacion');
    }

    public function toArray()
    {
        $array = parent::toArray();
        $array['nombres_denunciado'] = $this->nombres_denunciado;
        $array['dependencia_denunciado'] = $this->dependencia_denunciado;
        $array['denunciado_idx'] = $this->denunciado_idx;
        return $array;
    }
}
