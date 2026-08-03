<?php

namespace App\Models;

use App\Helpers\UppercaseText;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class SolicitudInformacion extends Model
{
    use UppercaseText;

    protected $table = 'solicitudes_informacion';

    protected $fillable = [
        'denuncia_id', 'dependencia_destino_id', 'detalle', 'plazo_dias',
        'fecha_envio', 'fecha_vencimiento', 'fecha_respuesta',
        'respuesta', 'estado', 'motivo_cancelacion', 'fecha_cancelacion',
        'eliminado', 'fecha_eliminacion', 'historial_ediciones',
    ];

    protected array $uppercaseFields = [
        'detalle', 'respuesta', 'motivo_cancelacion',
    ];

    protected $appends = ['dependencia_destino'];

    public function getDependenciaDestinoAttribute()
    {
        if (array_key_exists('dependenciaDestino', $this->relations)) {
            return $this->relations['dependenciaDestino'] ? $this->relations['dependenciaDestino']->nombre : '';
        }
        
        $relacion = $this->dependenciaDestino()->first();
        return $relacion ? $relacion->nombre : '';
    }

    protected function casts(): array
    {
        return [
            'fecha_envio' => 'datetime',
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

    public function dependenciaDestino(): BelongsTo
    {
        return $this->belongsTo(DependenciaExterna::class, 'dependencia_destino_id');
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
        $array['dependencia_destino'] = $this->dependencia_destino;
        return $array;
    }
}
