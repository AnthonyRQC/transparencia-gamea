<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    /**
     * Paleta oficial de avatares (D7). Clases literales + safelist en
     * tailwind.config.js (el CSS no se generaría desde PHP).
     */
    public const COLORES_AVATAR = [
        'bg-primary',
        'bg-teal-600',
        'bg-amber-500',
        'bg-[#431377]',
        'bg-secondary',
        'bg-slate-500',
    ];

    protected $fillable = [
        'username',
        'name',
        'nombres',
        'apellidos',
        'ci',
        'email',
        'password',
        'rol',
        'iniciales',
        'color',
        'activo',
        'telefono',
        'preferencias',
        'creado_por_id',
        'desactivado_por_id',
        'desactivado_at',
        'motivo_baja',
        'debe_cambiar_password',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'activo' => 'boolean',
            'preferencias' => 'array',
            'desactivado_at' => 'datetime',
            'debe_cambiar_password' => 'boolean',
        ];
    }

    protected static function booted(): void
    {
        // Identidad compuesta (18A): name/iniciales/color/ci se derivan si faltan.
        static::creating(function (User $user) {
            if (! empty($user->nombres) && ! empty($user->apellidos)) {
                $user->nombres = \App\Services\UsernameGenerator::normalizarNombre($user->nombres);
                $user->apellidos = \App\Services\UsernameGenerator::normalizarNombre($user->apellidos);

                if (empty($user->name)) {
                    $user->name = $user->nombres . ' ' . $user->apellidos;
                }

                if (empty($user->iniciales)) {
                    $user->iniciales = mb_substr($user->nombres, 0, 1) . mb_substr($user->apellidos, 0, 1);
                }
            }

            if (empty($user->color)) {
                $user->color = self::COLORES_AVATAR[array_rand(self::COLORES_AVATAR)];
            }

            if (! empty($user->ci)) {
                $user->ci = \App\Services\UsernameGenerator::normalizarCi($user->ci);
            }
        });
    }

    public function esJefe(): bool
    {
        return $this->rol === 'jefe';
    }

    public function esInvestigador(): bool
    {
        return $this->rol === 'investigador';
    }

    public function esRegistrador(): bool
    {
        return $this->rol === 'registrador';
    }

    public function esAdmin(): bool
    {
        return $this->rol === 'admin';
    }

    public function puede(string $permiso): bool
    {
        return \App\Services\PermisosEfectivos::puede($this, $permiso);
    }

    public function notificaciones(): HasMany
    {
        return $this->hasMany(Notificacion::class);
    }

    public function denunciasAsignadas(): HasMany
    {
        return $this->hasMany(Denuncia::class, 'investigador_id');
    }

    public function scopeInvestigadores($query)
    {
        return $query->where('rol', 'investigador')->where('activo', true);
    }

    public function scopeActivos($query)
    {
        return $query->where('activo', true);
    }
}
