<?php

namespace App\Models;

use App\Helpers\UppercaseText;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Denunciante extends Model
{
    use UppercaseText;

    protected $fillable = [
        'denuncia_id', 'nombres', 'ci', 'email', 'telefono',
    ];

    protected array $uppercaseFields = [
        'nombres', 'ci',
    ];

    public function denuncia(): BelongsTo
    {
        return $this->belongsTo(Denuncia::class);
    }
}
