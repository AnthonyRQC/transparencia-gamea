<?php

namespace App\Services;

use App\Data\PermisosCatalogo;
use App\Models\Delegacion;
use App\Models\User;

/**
 * Permisos efectivos de un usuario.
 *
 * Hoy = catálogo del rol. Sprint 18C suma aquí las delegaciones
 * temporales activas (rol ∪ delegaciones) sin tocar consumidores.
 */
class PermisosEfectivos
{
    /** @var array<int, array<string>> */
    private static array $memo = [];

    /**
     * @return array<string>
     */
    public static function de(User $user): array
    {
        // Clave id:rol (no solo id): en tests con RefreshDatabase los ids se
        // reciclan entre casos y el static sobreviviría al request.
        $key = $user->id . ':' . $user->rol;

        if (! isset(self::$memo[$key])) {
            $delegados = Delegacion::activasPara($user)
                ->flatMap(fn ($d) => $d->permisos ?? [])
                ->all();

            self::$memo[$key] = array_values(array_unique(array_merge(
                PermisosCatalogo::permisosPorRol($user->rol),
                $delegados
            )));
        }

        return self::$memo[$key];
    }

    public static function puede(User $user, string $permiso): bool
    {
        return in_array($permiso, self::de($user), true);
    }

    public static function limpiar(): void
    {
        self::$memo = [];
    }
}
