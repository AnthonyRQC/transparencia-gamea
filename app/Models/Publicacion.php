<?php

namespace App\Models;

use App\Traits\UppercaseText;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Publicacion extends Model
{
    use UppercaseText;

    protected $table = 'publicaciones';

    public const EVENTOS_CASO = ['admitida', 'rechazada', 'cerrada'];

    protected $fillable = [
        'tipo_id', 'prioridad_id', 'cite', 'fecha_documento', 'emisor',
        'destinatario_display', 'ref_titulo', 'resumen', 'cuerpo',
        'referencia_externa', 'denuncia_id', 'evento',
        'publicado_por_id', 'publicado_at', 'fijada', 'orden',
        'portada_archivo_id',
    ];

    // NOTA: 'cuerpo' NO va en uppercaseFields — desde 13.x guarda HTML del
    // editor rico y Str::upper rompería el markup. El resto sigue en MAYÚSCULAS.
    protected array $uppercaseFields = [
        'cite', 'emisor', 'destinatario_display', 'ref_titulo',
        'resumen', 'referencia_externa',
    ];

    protected function casts(): array
    {
        return [
            'fecha_documento' => 'date',
            'publicado_at' => 'datetime',
            'fijada' => 'boolean',
            'orden' => 'integer',
        ];
    }

    public function tipo(): BelongsTo
    {
        return $this->belongsTo(TipoPublicacion::class, 'tipo_id');
    }

    public function prioridad(): BelongsTo
    {
        return $this->belongsTo(PrioridadPublicacion::class, 'prioridad_id');
    }

    public function denuncia(): BelongsTo
    {
        return $this->belongsTo(Denuncia::class, 'denuncia_id');
    }

    public function publicadoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'publicado_por_id');
    }

    public function archivos(): HasMany
    {
        return $this->hasMany(PublicacionArchivo::class, 'publicacion_id');
    }

    public function portada(): BelongsTo
    {
        return $this->belongsTo(PublicacionArchivo::class, 'portada_archivo_id');
    }

    public function scopePublicadas($query)
    {
        return $query->whereNotNull('publicado_at');
    }

    public function scopeMuro($query)
    {
        return $query->publicadas()
            ->orderByDesc('fijada')
            ->orderBy('orden')
            ->orderByDesc('publicado_at');
    }
}
