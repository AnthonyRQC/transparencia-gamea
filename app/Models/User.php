<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'username',
        'name',
        'email',
        'password',
        'rol',
        'iniciales',
        'color',
        'activo',
        'telefono',
        'preferencias',
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
        ];
    }

    public function esJefe(): bool
    {
        return $this->rol === 'jefe';
    }

    public function esTecnico(): bool
    {
        return $this->rol === 'tecnico';
    }

    public function esRegistrador(): bool
    {
        return $this->rol === 'registrador';
    }

    public function notificaciones(): HasMany
    {
        return $this->hasMany(Notificacion::class);
    }

    public function denunciasAsignadas(): HasMany
    {
        return $this->hasMany(Denuncia::class, 'tecnico_id');
    }

    public function scopeTecnicos($query)
    {
        return $query->where('rol', 'tecnico')->where('activo', true);
    }

    public function scopeActivos($query)
    {
        return $query->where('activo', true);
    }
}
