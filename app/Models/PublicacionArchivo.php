<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PublicacionArchivo extends Model
{
    protected $table = 'publicacion_archivos';

    protected $fillable = [
        'publicacion_id', 'nombre', 'path', 'mime_type', 'tamano', 'hash',
        'fecha_eliminacion',
    ];

    protected function casts(): array
    {
        return [
            'fecha_eliminacion' => 'datetime',
        ];
    }

    public function scopeActivos($query)
    {
        return $query->whereNull('fecha_eliminacion');
    }

    public function publicacion(): BelongsTo
    {
        return $this->belongsTo(Publicacion::class, 'publicacion_id');
    }
}
