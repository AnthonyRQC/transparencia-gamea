<?php

namespace App\Services;

use App\Models\Denuncia;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class UsuarioAdminService
{
    public static function passwordRules(): array
    {
        return ['string', 'min:10', 'regex:/[A-Z]/', 'regex:/[a-z]/', 'regex:/[0-9]/'];
    }

    /**
     * @return array<string>
     */
    public static function rolesPermitidos(User $actor): array
    {
        if ($actor->esAdmin()) {
            return ['admin', 'jefe', 'investigador', 'registrador'];
        }

        return ['jefe', 'investigador', 'registrador'];
    }

    public static function store(array $data, User $actor)
    {
        $nombres = UsernameGenerator::normalizarNombre($data['nombres']);
        $apellidos = UsernameGenerator::normalizarNombre($data['apellidos']);
        $ci = UsernameGenerator::normalizarCi($data['ci']);

        if (User::where('ci', $ci)->exists()) {
            throw ValidationException::withMessages([
                'ci' => 'ESTE CI YA ESTÁ REGISTRADO. REACTIVA AL USUARIO EN VEZ DE CREAR OTRO.',
            ]);
        }

        $username = UsernameGenerator::para($nombres, $apellidos, $ci);

        if (User::whereRaw('LOWER(username) = ?', [mb_strtolower($username)])->exists()) {
            throw ValidationException::withMessages([
                'ci' => 'COLISIÓN DE USERNAME GENERADO. REVISA LOS DATOS.',
            ]);
        }

        $user = DB::transaction(fn () => User::create([
            'username' => $username,
            'name' => "{$nombres} {$apellidos}",
            'nombres' => $nombres,
            'apellidos' => $apellidos,
            'ci' => $ci,
            'email' => ! empty($data['email']) ? $data['email'] : null,
            'telefono' => $data['telefono'] ?? null,
            'password' => Hash::make($data['password']),
            'rol' => $data['rol'],
            'activo' => true,
            'creado_por_id' => $actor->id,
            'debe_cambiar_password' => true,
        ]));

        return redirect()->back()->with('credencialTemporal', [
            'username' => $username,
            'password' => $data['password'],
            'nombre' => $user->name,
        ]);
    }

    public static function update(User $target, array $data, User $actor)
    {
        $nombres = UsernameGenerator::normalizarNombre($data['nombres']);
        $apellidos = UsernameGenerator::normalizarNombre($data['apellidos']);

        DB::transaction(function () use ($target, $data, $nombres, $apellidos, $actor) {
            $t = User::whereKey($target->id)->lockForUpdate()->firstOrFail();

            if ($data['rol'] !== $t->rol && ! self::hayOtroActivo($t->rol, $t->id)) {
                throw ValidationException::withMessages([
                    'rol' => 'NO PUEDES DEGRADAR AL ÚLTIMO ' . mb_strtoupper($t->rol) . ' ACTIVO.',
                ]);
            }

            $rolCambia = $data['rol'] !== $t->rol;

            $t->update([
                'nombres' => $nombres,
                'apellidos' => $apellidos,
                'name' => "{$nombres} {$apellidos}",
                'email' => ! empty($data['email']) ? $data['email'] : null,
                'telefono' => $data['telefono'] ?? null,
                'rol' => $data['rol'],
            ]);

            if ($rolCambia) {
                \App\Models\Delegacion::revocarRecibidas($t->id, $actor->id);
            }
        });

        return redirect()->back()->with('success', "Usuario {$target->username} actualizado.");
    }

    public static function resetPassword(User $target)
    {
        $temporal = 'UTLCC-' . Str::upper(Str::random(4)) . Str::lower(Str::random(2)) . random_int(10, 99);

        DB::transaction(function () use ($target, $temporal) {
            $t = User::whereKey($target->id)->lockForUpdate()->firstOrFail();
            $t->update([
                'password' => Hash::make($temporal),
                'debe_cambiar_password' => true,
                'remember_token' => null,
            ]);
            DB::table('sessions')->where('user_id', $t->id)->delete();
        });

        return redirect()->back()->with('credencialTemporal', [
            'username' => $target->username,
            'password' => $temporal,
            'nombre' => $target->name,
        ]);
    }

    public static function desactivar(array $data, User $actor, int $id)
    {
        return DB::transaction(function () use ($actor, $id, $data) {
            $t = User::whereKey($id)->lockForUpdate()->firstOrFail();

            if ($error = self::motivoBloqueo($actor, $t)) {
                return redirect()->back()->with('error', $error);
            }

            $casos = self::casosActivosDe($t);

            if ($casos->isNotEmpty() && empty($data['traspaso_a'])) {
                throw ValidationException::withMessages([
                    'traspaso_a' => "TIENE {$casos->count()} CASO(S) ACTIVO(S). ELIGE DESTINO DE TRASPASO.",
                ]);
            }

            if (! empty($data['traspaso_a'])) {
                $dest = User::findOrFail($data['traspaso_a']);

                if (! $dest->activo || ! in_array($dest->rol, ['investigador', 'jefe'], true) || $dest->id === $t->id) {
                    throw ValidationException::withMessages([
                        'traspaso_a' => 'DESTINO INVÁLIDO: INVESTIGADOR O JEFE ACTIVO, DISTINTO DEL USUARIO.',
                    ]);
                }

                if (empty($data['justificacion'])) {
                    throw ValidationException::withMessages([
                        'justificacion' => 'EL TRASPASO EN LOTE REQUIERE JUSTIFICACIÓN.',
                    ]);
                }

                self::traspasarLote($t, $dest, $data['justificacion']);
            }

            $t->update([
                'activo' => false,
                'desactivado_at' => now(),
                'desactivado_por_id' => $actor->id,
                'motivo_baja' => ! empty($data['motivo_baja']) ? mb_strtoupper($data['motivo_baja']) : null,
                'remember_token' => null,
            ]);
            DB::table('sessions')->where('user_id', $t->id)->delete();
            \App\Models\Delegacion::revocarRecibidas($t->id, $actor->id);

            return redirect()->back()->with('success', "Usuario {$t->username} desactivado.");
        });
    }

    public static function reactivar(User $target): void
    {
        DB::transaction(function () use ($target) {
            $t = User::whereKey($target->id)->lockForUpdate()->firstOrFail();
            $t->update([
                'activo' => true,
                'desactivado_at' => null,
                'desactivado_por_id' => null,
                'motivo_baja' => null,
            ]);
        });
    }

    public static function masivo(array $data, User $actor)
    {
        return DB::transaction(function () use ($actor, $data) {
            $usuarios = User::whereIn('id', $data['ids'])->orderBy('id')->lockForUpdate()->get();
            $bloqueados = [];

            foreach ($usuarios as $t) {
                if ($error = self::motivoBloqueo($actor, $t, $data['accion'])) {
                    $bloqueados[] = "{$t->username}: {$error}";
                    continue;
                }

                if ($data['accion'] === 'desactivar' && self::casosActivosDe($t)->isNotEmpty() && empty($data['traspaso_a'])) {
                    $bloqueados[] = "{$t->username}: TIENE CASOS ACTIVOS, REQUIERE TRASPASO.";
                }
            }

            if ($bloqueados !== []) {
                throw ValidationException::withMessages(['lote' => $bloqueados]);
            }

            $dest = ! empty($data['traspaso_a']) ? User::findOrFail($data['traspaso_a']) : null;

            if ($dest && (! $dest->activo || ! in_array($dest->rol, ['investigador', 'jefe'], true))) {
                throw ValidationException::withMessages(['traspaso_a' => 'DESTINO INVÁLIDO.']);
            }

            foreach ($usuarios as $t) {
                if ($data['accion'] === 'desactivar') {
                    \App\Models\Delegacion::revocarRecibidas($t->id, $actor->id);

                    if ($dest) {
                        self::traspasarLote($t, $dest, $data['justificacion'] ?? 'RELEVO DE PERSONAL');
                    }
                    $t->update([
                        'activo' => false,
                        'desactivado_at' => now(),
                        'desactivado_por_id' => $actor->id,
                        'motivo_baja' => ! empty($data['motivo_baja']) ? mb_strtoupper($data['motivo_baja']) : null,
                        'remember_token' => null,
                    ]);
                    DB::table('sessions')->where('user_id', $t->id)->delete();
                } else {
                    $t->update([
                        'activo' => true,
                        'desactivado_at' => null,
                        'desactivado_por_id' => null,
                        'motivo_baja' => null,
                    ]);
                }
            }

            return redirect()->back()->with('success', count($usuarios) . ' USUARIO(S) PROCESADOS.');
        });
    }

    /**
     * Motivo por el que el actor NO puede desactivar (o degradar) al usuario.
     */
    private static function motivoBloqueo(User $actor, User $t, string $accion = 'desactivar'): ?string
    {
        if ($t->esAdmin() && ! $actor->esAdmin()) {
            return 'NO PUEDES ADMINISTRAR UNA CUENTA DE NIVEL SUPERIOR.';
        }

        if ($t->id === $actor->id) {
            return $accion === 'desactivar'
                ? 'NO PUEDES DESACTIVARTE A TI MISMO.'
                : 'NO PUEDES APLICAR ESTA ACCIÓN SOBRE TI MISMO.';
        }

        if ($t->rol === 'admin' && ! self::hayOtroActivo('admin', $t->id)) {
            return 'NO PUEDES DEJAR AL SISTEMA SIN ADMINISTRADOR ACTIVO.';
        }

        if ($t->rol === 'jefe' && ! self::hayOtroActivo('jefe', $t->id)) {
            return 'NO PUEDES DEJAR A LA UNIDAD SIN JEFE ACTIVO.';
        }

        return null;
    }

    private static function hayOtroActivo(string $rol, int $exceptoId): bool
    {
        return User::where('rol', $rol)
            ->where('activo', true)
            ->where('id', '!=', $exceptoId)
            ->exists();
    }

    public static function casosActivosDe(User $u)
    {
        return Denuncia::where('investigador_id', $u->id)
            ->whereNotIn('estado', ['rechazada', 'cerrada'])
            ->orderBy('ticket')
            ->get();
    }

    private static function traspasarLote(User $origen, User $dest, string $justificacion): void
    {
        foreach (self::casosActivosDe($origen) as $c) {
            $c->update([
                'investigador_anterior_id' => $c->investigador_id,
                'investigador_id' => $dest->id,
                'fecha_asignada' => $c->fecha_asignada ?? now()->toDateTimeString(),
                'traspaso_json' => [
                    'fecha' => now()->toDateTimeString(),
                    'justificacion' => $justificacion,
                ],
            ]);

            $c->bitacora()->create([
                'accion' => 'traspaso',
                'detalle' => 'TRASPASADO A ' . $dest->name . ' POR RELEVO DE PERSONAL. JUSTIFICACIÓN: ' . $justificacion,
                'usuario_id' => Auth::id(),
                'fecha' => now(),
            ]);
        }
    }
}
