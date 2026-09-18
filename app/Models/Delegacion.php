<?php

namespace App\Models;

use App\Services\PermisosEfectivos;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Delegacion extends Model
{
    protected $table = 'delegaciones';

    protected $fillable = [
        'user_id',
        'permisos',
        'desde',
        'hasta',
        'motivo',
        'otorgado_por_id',
        'revocado_at',
        'revocado_por_id',
    ];

    protected function casts(): array
    {
        return [
            'permisos' => 'array',
            'desde' => 'datetime',
            'hasta' => 'datetime',
            'revocado_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        // Los efectivos se memoizan por request: cualquier cambio invalida.
        static::saved(fn () => PermisosEfectivos::limpiar());
        static::deleted(fn () => PermisosEfectivos::limpiar());
    }

    public function beneficiario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function otorgante(): BelongsTo
    {
        return $this->belongsTo(User::class, 'otorgado_por_id');
    }

    public function revocador(): BelongsTo
    {
        return $this->belongsTo(User::class, 'revocado_por_id');
    }

    public function scopeVigentes($query)
    {
        $ahora = now();

        return $query->whereNull('revocado_at')
            ->where('desde', '<=', $ahora)
            ->where(fn ($q) => $q->whereNull('hasta')->orWhere('hasta', '>=', $ahora));
    }

    /**
     * @return \Illuminate\Support\Collection<int, Delegacion>
     */
    public static function activasPara(User $user)
    {
        return static::with('otorgante:id,name')
            ->where('user_id', $user->id)
            ->vigentes()
            ->get();
    }

    /**
     * Cascada 18A/18C (D23): al desactivar o cambiar rol se revocan las
     * RECIBIDAS. Las otorgadas por el usuario siguen vigentes.
     */
    public static function revocarRecibidas(int $userId, int $porId): void
    {
        static::where('user_id', $userId)
            ->whereNull('revocado_at')
            ->update([
                'revocado_at' => now(),
                'revocado_por_id' => $porId,
            ]);

        PermisosEfectivos::limpiar();
    }
}
