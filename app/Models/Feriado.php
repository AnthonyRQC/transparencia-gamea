<?php

namespace App\Models;

use App\Helpers\UppercaseText;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Feriado extends Model
{
    use SoftDeletes, UppercaseText;

    protected $fillable = [
        'fecha', 'nombre',
    ];

    protected array $uppercaseFields = [
        'nombre',
    ];

    protected function casts(): array
    {
        return [
            'fecha' => 'date',
        ];
    }

    public function scopeActivos($query)
    {
        return $query->whereNull('deleted_at');
    }

    public function scopeDelAnio($query, int $year)
    {
        return $query->whereYear('fecha', $year);
    }

    public function scopeEnRango($query, string $inicio, string $fin)
    {
        return $query->whereBetween('fecha', [$inicio, $fin]);
    }

    public static function aniosDisponibles(): array
    {
        return self::selectRaw('YEAR(fecha) as anio')
            ->distinct()
            ->orderBy('anio', 'desc')
            ->pluck('anio')
            ->toArray();
    }
}
