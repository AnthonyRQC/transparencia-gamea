<?php

namespace App\Http\Controllers;

use App\Data\PermisosCatalogo;
use App\Models\Delegacion;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

/**
 * Delegaciones temporales de funciones (Sprint 18C, D23).
 *
 * Misma cuenta, dos funciones: el beneficiario conserva su rol y suma
 * permisos con vigencia. Nunca `usuario.*` ni `admin.*`.
 */
class DelegacionTemporalController extends Controller
{
    public function index()
    {
        $delegaciones = Delegacion::with([
            'beneficiario:id,name,username,rol',
            'otorgante:id,name',
        ])->latest()->get()->map(fn (Delegacion $d) => [
            'id' => $d->id,
            'beneficiario' => $d->beneficiario?->name,
            'beneficiario_username' => $d->beneficiario?->username,
            'beneficiario_rol' => $d->beneficiario?->rol,
            'permisos' => $d->permisos,
            'desde' => $d->desde?->toDateTimeString(),
            'hasta' => $d->hasta?->toDateTimeString(),
            'motivo' => $d->motivo,
            'otorgado_por' => $d->otorgante?->name,
            'revocado_at' => $d->revocado_at?->toDateTimeString(),
            'programada' => $d->desde && $d->desde->isFuture(),
            'vigente' => ! $d->revocado_at
                && $d->desde <= now()
                && ($d->hasta === null || $d->hasta >= now()),
        ])->values();

        $elegibles = User::where('activo', true)
            ->where('rol', '!=', 'admin')
            ->orderBy('name')
            ->get(['id', 'name', 'username', 'rol']);

        return Inertia::render('Admin/Delegaciones', [
            'delegaciones' => $delegaciones,
            'elegibles' => $elegibles,
            'paquetes' => PermisosCatalogo::PAQUETES,
            'delegable' => PermisosCatalogo::DELEGABLE,
        ]);
    }

    public function store(Request $request)
    {
        $actor = $request->user();

        $data = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'permisos' => ['required', 'array', 'min:1'],
            'permisos.*' => ['string', Rule::in(PermisosCatalogo::DELEGABLE)],
            'desde' => ['nullable', 'date'],
            'hasta' => ['nullable', 'date', 'after_or_equal:desde'],
            'motivo' => ['required', 'string', 'min:5', 'max:500'],
        ]);

        $beneficiario = User::findOrFail($data['user_id']);

        if (! $beneficiario->activo) {
            return redirect()->back()->with('error', 'SOLO SE PUEDE DELEGAR A USUARIOS ACTIVOS.');
        }

        if ($beneficiario->esAdmin()) {
            return redirect()->back()->with('error', 'NO SE DELEGA A ADMINISTRADORES.');
        }

        if ($beneficiario->id === $actor->id) {
            return redirect()->back()->with('error', 'NO PUEDES DELEGARTE FUNCIONES A TI MISMO.');
        }

        Delegacion::create([
            'user_id' => $beneficiario->id,
            'permisos' => array_values(array_unique($data['permisos'])),
            'desde' => $data['desde'] ?? now(),
            'hasta' => $data['hasta'] ?? null,
            'motivo' => mb_strtoupper($data['motivo']),
            'otorgado_por_id' => $actor->id,
        ]);

        return redirect()->back()->with('success', "Funciones delegadas a {$beneficiario->name}.");
    }

    public function revocar(int $id)
    {
        $actor = Auth::user();
        $delegacion = Delegacion::findOrFail($id);

        if ($delegacion->otorgado_por_id !== $actor->id && ! $actor->esAdmin()) {
            return redirect()->back()->with('error', 'SOLO EL OTORGANTE O UN ADMIN PUEDE REVOCAR.');
        }

        if ($delegacion->revocado_at) {
            return redirect()->back()->with('error', 'YA ESTABA REVOCADA.');
        }

        DB::transaction(function () use ($delegacion, $actor) {
            $delegacion->update([
                'revocado_at' => now(),
                'revocado_por_id' => $actor->id,
            ]);
        });

        return redirect()->back()->with('success', 'Delegación revocada.');
    }
}
