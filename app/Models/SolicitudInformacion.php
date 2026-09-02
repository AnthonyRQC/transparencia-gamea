<?php

namespace App\Models;

use App\Helpers\DiasHabiles;
use App\Helpers\UppercaseText;
use Carbon\Carbon;
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

    protected $appends = ['dependencia_destino', 'plazo_info'];

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

    public function getPlazoInfoAttribute(): ?array
    {
        if (!$this->fecha_vencimiento || in_array($this->estado, ['respondida', 'cancelada'])) {
            return null;
        }
        $venc = $this->fecha_vencimiento instanceof Carbon ? $this->fecha_vencimiento : Carbon::parse($this->fecha_vencimiento);
        $dias = DiasHabiles::diasRestantes($venc);
        $color = $dias < 0 ? 'red' : ($dias <= 5 ? 'yellow' : 'green');
        $texto = $dias < 0 ? "Vencida hace " . abs($dias) . "d" : ($dias === 0 ? "Vence hoy" : "Vence en {$dias}d");
        return [
            'dias_restantes' => $dias,
            'color' => $color,
            'texto' => $texto,
            'fecha_vencimiento' => $venc->format('Y-m-d'),
        ];
    }

    public function toArray()
    {
        $array = parent::toArray();
        $array['dependencia_destino'] = $this->dependencia_destino;
        $array['plazo_info'] = $this->plazo_info;
        return $array;
    }
}
