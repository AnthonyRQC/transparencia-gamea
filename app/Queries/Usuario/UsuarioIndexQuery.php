<?php

namespace App\Queries\Usuario;

use App\Models\Denuncia;
use App\Models\User;
use App\Services\UsuarioAdminService;
use Illuminate\Http\Request;

class UsuarioIndexQuery
{
    public static function construir(Request $request): array
    {
        $actor = $request->user();

        $query = User::query()->orderBy('activo', 'desc')->orderBy('name');

        if (! $actor->esAdmin()) {
            $query->where('rol', '!=', 'admin');
        }

        if ($rol = $request->input('rol')) {
            $query->where('rol', $rol);
        }

        $estado = $request->input('estado', 'activos');
        if ($estado === 'activos') {
            $query->where('activo', true);
        } elseif ($estado === 'inactivos') {
            $query->where('activo', false);
        }

        if ($busqueda = trim((string) $request->input('q', ''))) {
            $query->where(function ($w) use ($busqueda) {
                $w->where('name', 'like', "%{$busqueda}%")
                    ->orWhere('username', 'like', "%{$busqueda}%")
                    ->orWhere('ci', 'like', "%{$busqueda}%");
            });
        }

        $usuarios = $query->get()->map(fn (User $u) => [
            'id' => $u->id,
            'name' => $u->name,
            'username' => $u->username,
            'ci' => $u->ci,
            'rol' => $u->rol,
            'email' => $u->email,
            'telefono' => $u->telefono,
            'iniciales' => $u->iniciales,
            'color' => $u->color,
            'activo' => (bool) $u->activo,
            'desactivado_at' => $u->desactivado_at?->toDateTimeString(),
            'casos_activos' => Denuncia::where('investigador_id', $u->id)
                ->whereNotIn('estado', ['rechazada', 'cerrada'])->count(),
            'delegaciones_activas' => \App\Models\Delegacion::where('user_id', $u->id)
                ->whereNull('revocado_at')
                ->count(),
        ])->values();

        return [
            'usuarios' => $usuarios,
            'filtros' => [
                'q' => $request->input('q', ''),
                'rol' => $request->input('rol', ''),
                'estado' => $estado,
            ],
            'contadores' => [
                'admins' => User::where('rol', 'admin')->where('activo', true)->count(),
                'jefes' => User::where('rol', 'jefe')->where('activo', true)->count(),
            ],
            'roles_creables' => UsuarioAdminService::rolesPermitidos($actor),
        ];
    }
}
