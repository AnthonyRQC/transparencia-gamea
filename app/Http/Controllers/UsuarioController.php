<?php

namespace App\Http\Controllers;

use App\Http\Requests\UsuarioDesactivarRequest;
use App\Http\Requests\UsuarioMasivoRequest;
use App\Http\Requests\UsuarioStoreRequest;
use App\Http\Requests\UsuarioUpdateRequest;
use App\Models\User;
use App\Queries\Usuario\UsuarioIndexQuery;
use App\Services\UsuarioAdminService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

/**
 * Panel de administración de usuarios (Sprint 18A, D21/D22).
 *
 * Matriz: admin → todos (incl. otros admins); jefe → jefes, investigadores y
 * registradores (nunca admins, ni verlos). Un humano = un CI = una cuenta.
 * Nunca delete físico.
 */
class UsuarioController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('Admin/Usuarios', UsuarioIndexQuery::construir($request));
    }

    public function store(UsuarioStoreRequest $request)
    {
        return UsuarioAdminService::store($request->validated(), $request->user());
    }

    public function update(UsuarioUpdateRequest $request, int $id)
    {
        $actor = $request->user();
        $target = User::findOrFail($id);

        if ($target->esAdmin() && ! $actor->esAdmin()) {
            return redirect()->back()->with('error', 'NO PUEDES ADMINISTRAR UNA CUENTA DE NIVEL SUPERIOR.');
        }

        $data = $request->validated();

        if ($target->id === $actor->id && $data['rol'] !== $target->rol) {
            return redirect()->back()->with('error', 'NO PUEDES CAMBIAR TU PROPIO ROL.');
        }

        return UsuarioAdminService::update($target, $data, $actor);
    }

    public function resetPassword(Request $request, int $id)
    {
        $actor = $request->user();
        $target = User::findOrFail($id);

        if ($target->esAdmin() && ! $actor->esAdmin()) {
            return redirect()->back()->with('error', 'NO PUEDES ADMINISTRAR UNA CUENTA DE NIVEL SUPERIOR.');
        }

        if ($target->id === $actor->id) {
            return redirect()->back()->with('error', 'CAMBIA TU CONTRASEÑA DESDE MI CUENTA.');
        }

        return UsuarioAdminService::resetPassword($target);
    }

    public function desactivar(UsuarioDesactivarRequest $request, int $id)
    {
        return UsuarioAdminService::desactivar($request->validated(), $request->user(), $id);
    }

    public function reactivar(int $id)
    {
        $actor = Auth::user();
        $target = User::findOrFail($id);

        if ($target->esAdmin() && ! $actor->esAdmin()) {
            return redirect()->back()->with('error', 'NO PUEDES ADMINISTRAR UNA CUENTA DE NIVEL SUPERIOR.');
        }

        UsuarioAdminService::reactivar($target);

        return redirect()->back()->with('success', "Usuario {$target->username} reactivado.");
    }

    public function masivo(UsuarioMasivoRequest $request)
    {
        return UsuarioAdminService::masivo($request->validated(), $request->user());
    }

    public function impacto(int $id)
    {
        $actor = Auth::user();
        $target = User::findOrFail($id);

        if ($target->esAdmin() && ! $actor->esAdmin()) {
            abort(403, 'NO PUEDES ADMINISTRAR UNA CUENTA DE NIVEL SUPERIOR.');
        }

        $casos = UsuarioAdminService::casosActivosDe($target)->map(fn ($d) => [
            'ticket' => $d->ticket,
            'estado' => $d->estado,
        ])->values();

        $delegaciones = \App\Models\Delegacion::where('user_id', $target->id)
            ->whereNull('revocado_at')
            ->with('otorgante:id,name')
            ->orderByDesc('id')
            ->get()
            ->map(fn ($d) => [
                'permisos' => $d->permisos,
                'desde' => $d->desde?->toDateTimeString(),
                'hasta' => $d->hasta?->toDateTimeString(),
                'otorgado_por' => $d->otorgante?->name,
            ])->values();

        return response()->json([
            'usuario' => ['id' => $target->id, 'name' => $target->name, 'username' => $target->username, 'rol' => $target->rol],
            'casos_activos' => $casos,
            'total_casos' => $casos->count(),
            'delegaciones_activas' => $delegaciones,
        ]);
    }
}
