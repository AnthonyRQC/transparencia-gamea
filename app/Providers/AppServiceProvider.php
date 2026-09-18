<?php

namespace App\Providers;

use App\Data\PermisosCatalogo;
use App\Models\User;
use App\Services\PermisosEfectivos;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        // Gates por capacidad desde el catálogo (Sprint 16.2, D18).
        // Sin RoleMiddleware: 18C (interinos) funciona sin retrabajo.
        foreach (array_keys(PermisosCatalogo::PERMISOS) as $permiso) {
            Gate::define($permiso, fn (User $user) => PermisosEfectivos::puede($user, $permiso));
        }
    }
}
