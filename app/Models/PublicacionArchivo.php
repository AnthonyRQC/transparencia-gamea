<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PublicacionArchivo extends Model
{
    protected $table = 'publicacion_archivos';

    protected $fillable = [
        'publicacion_id', 'nombre', 'path', 'mime_type', 'tamano', 'hash',
    ];

    public function publicacion(): BelongsTo
    {
        return $this->belongsTo(Publicacion::class, 'publicacion_id');
    }
}
