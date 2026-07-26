<?php

namespace App\Models;

use App\Helpers\UppercaseText;
use Illuminate\Database\Eloquent\Model;

class Feriado extends Model
{
    use UppercaseText;

    protected $fillable = [
        'fecha', 'nombre', 'recurrente',
    ];

    protected array $uppercaseFields = [
        'nombre',
    ];

    protected function casts(): array
    {
        return [
            'fecha' => 'date',
            'recurrente' => 'boolean',
        ];
    }
}
