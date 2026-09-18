<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function edit(Request $request): Response
    {
        return Inertia::render('Profile/Edit', [
            'status' => session('status'),
        ]);
    }

    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();
        $data = $request->validated();

        $user->nombres = \App\Services\UsernameGenerator::normalizarNombre($data['nombres']);
        $user->apellidos = \App\Services\UsernameGenerator::normalizarNombre($data['apellidos']);
        $user->name = "{$user->nombres} {$user->apellidos}";
        $user->email = ! empty($data['email']) ? $data['email'] : null;
        $user->telefono = $data['telefono'] ?? null;

        if (! empty($data['color'])) {
            $user->color = $data['color'];
        }

        $user->save();

        return Redirect::route('profile.edit');
    }

    /**
     * Preferencias de notificación (18B): master + 4 umbrales (0-10).
     */
    public function preferencias(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'notificaciones' => ['required', 'boolean'],
            'umbral_plazo' => ['required', 'integer', 'min:0', 'max:10'],
            'umbral_informe' => ['required', 'integer', 'min:0', 'max:10'],
            'umbral_solicitud' => ['required', 'integer', 'min:0', 'max:10'],
            'umbral_descargo' => ['required', 'integer', 'min:0', 'max:10'],
        ]);

        $user = $request->user();
        $pref = $user->preferencias ?? [];
        $pref['notificaciones'] = (bool) $data['notificaciones'];
        $pref['umbrales'] = [
            'plazo' => (int) $data['umbral_plazo'],
            'informe' => (int) $data['umbral_informe'],
            'solicitud' => (int) $data['umbral_solicitud'],
            'descargo' => (int) $data['umbral_descargo'],
        ];
        $user->update(['preferencias' => $pref]);

        return Redirect::route('profile.edit');
    }

    // Sin destroy: nunca delete físico de usuarios (D16/D20). Altas/bajas en 18A.
}
