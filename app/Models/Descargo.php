<?php

namespace App\Models;

use App\Helpers\DiasHabiles;
use App\Helpers\UppercaseText;
use Carbon\Carbon;
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

    protected $appends = ['nombres_denunciado', 'dependencia_denunciado', 'denunciado_idx', 'plazo_info'];

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

    public function getPlazoInfoAttribute(): ?array
    {
        if (!$this->fecha_vencimiento || $this->estado === 'pendiente_notif' || in_array($this->estado, ['respondido', 'cancelado'])) {
            return null;
        }
        $venc = $this->fecha_vencimiento instanceof Carbon ? $this->fecha_vencimiento : Carbon::parse($this->fecha_vencimiento);
        $dias = DiasHabiles::diasRestantes($venc);
        $color = $dias < 0 ? 'red' : ($dias <= 5 ? 'yellow' : 'green');
        $texto = $dias < 0 ? "Vencido hace " . abs($dias) . "d" : ($dias === 0 ? "Vence hoy" : "Vence en {$dias}d");
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
        $array['nombres_denunciado'] = $this->nombres_denunciado;
        $array['dependencia_denunciado'] = $this->dependencia_denunciado;
        $array['denunciado_idx'] = $this->denunciado_idx;
        $array['plazo_info'] = $this->plazo_info;
        return $array;
    }
}
