<?php

namespace App\Http\Controllers;

use App\Models\Denuncia;
use App\Models\User;
use App\Services\UsernameGenerator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
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

    public function index(Request $request)
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

        return Inertia::render('Admin/Usuarios', [
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
            'roles_creables' => self::rolesPermitidos($actor),
        ]);
    }

    public function store(Request $request)
    {
        $actor = $request->user();

        $data = $request->validate([
            'nombres' => ['required', 'string', 'min:2', 'max:100'],
            'apellidos' => ['required', 'string', 'min:2', 'max:100'],
            'ci' => ['required', 'string', 'max:20'],
            'rol' => ['required', Rule::in(self::rolesPermitidos($actor))],
            'email' => ['nullable', 'email', 'max:255', Rule::unique('users', 'email')],
            'telefono' => ['nullable', 'string', 'max:20'],
            'password' => ['required', ...self::passwordRules()],
        ]);

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

    public function update(Request $request, int $id)
    {
        $actor = $request->user();
        $target = User::findOrFail($id);

        if ($target->esAdmin() && ! $actor->esAdmin()) {
            return redirect()->back()->with('error', 'NO PUEDES ADMINISTRAR UNA CUENTA DE NIVEL SUPERIOR.');
        }

        $data = $request->validate([
            'nombres' => ['required', 'string', 'min:2', 'max:100'],
            'apellidos' => ['required', 'string', 'min:2', 'max:100'],
            'email' => ['nullable', 'email', 'max:255', Rule::unique('users', 'email')->ignore($target->id)],
            'telefono' => ['nullable', 'string', 'max:20'],
            'rol' => ['required', Rule::in(self::rolesPermitidos($actor))],
        ]);

        if ($target->id === $actor->id && $data['rol'] !== $target->rol) {
            return redirect()->back()->with('error', 'NO PUEDES CAMBIAR TU PROPIO ROL.');
        }

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

    public function desactivar(Request $request, int $id)
    {
        $actor = $request->user();

        $data = $request->validate([
            'motivo_baja' => ['nullable', 'string', 'max:500'],
            'traspaso_a' => ['nullable', 'integer', 'exists:users,id'],
            'justificacion' => ['nullable', 'string', 'min:5', 'max:2000'],
        ]);

        return DB::transaction(function () use ($actor, $id, $data) {
            $t = User::whereKey($id)->lockForUpdate()->firstOrFail();

            if ($error = $this->motivoBloqueo($actor, $t)) {
                return redirect()->back()->with('error', $error);
            }

            $casos = $this->casosActivosDe($t);

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

                $this->traspasarLote($t, $dest, $data['justificacion']);
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

    public function reactivar(int $id)
    {
        $actor = Auth::user();
        $target = User::findOrFail($id);

        if ($target->esAdmin() && ! $actor->esAdmin()) {
            return redirect()->back()->with('error', 'NO PUEDES ADMINISTRAR UNA CUENTA DE NIVEL SUPERIOR.');
        }

        DB::transaction(function () use ($target) {
            $t = User::whereKey($target->id)->lockForUpdate()->firstOrFail();
            $t->update([
                'activo' => true,
                'desactivado_at' => null,
                'desactivado_por_id' => null,
                'motivo_baja' => null,
            ]);
        });

        return redirect()->back()->with('success', "Usuario {$target->username} reactivado.");
    }

    public function masivo(Request $request)
    {
        $actor = $request->user();

        $data = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'exists:users,id'],
            'accion' => ['required', 'in:desactivar,reactivar'],
            'motivo_baja' => ['nullable', 'string', 'max:500'],
            'traspaso_a' => ['nullable', 'integer', 'exists:users,id'],
            'justificacion' => ['nullable', 'string', 'min:5', 'max:2000'],
        ]);

        return DB::transaction(function () use ($actor, $data) {
            $usuarios = User::whereIn('id', $data['ids'])->orderBy('id')->lockForUpdate()->get();
            $bloqueados = [];

            foreach ($usuarios as $t) {
                if ($error = $this->motivoBloqueo($actor, $t, $data['accion'])) {
                    $bloqueados[] = "{$t->username}: {$error}";
                    continue;
                }

                if ($data['accion'] === 'desactivar' && $this->casosActivosDe($t)->isNotEmpty() && empty($data['traspaso_a'])) {
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
                        $this->traspasarLote($t, $dest, $data['justificacion'] ?? 'RELEVO DE PERSONAL');
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

    public function impacto(int $id)
    {
        $actor = Auth::user();
        $target = User::findOrFail($id);

        if ($target->esAdmin() && ! $actor->esAdmin()) {
            abort(403, 'NO PUEDES ADMINISTRAR UNA CUENTA DE NIVEL SUPERIOR.');
        }

        $casos = $this->casosActivosDe($target)->map(fn ($d) => [
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

    // ============================================================
    // Internos
    // ============================================================

    /**
     * Motivo por el que el actor NO puede desactivar (o degradar) al usuario.
     */
    private function motivoBloqueo(User $actor, User $t, string $accion = 'desactivar'): ?string
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

    private function casosActivosDe(User $u)
    {
        return Denuncia::where('investigador_id', $u->id)
            ->whereNotIn('estado', ['rechazada', 'cerrada'])
            ->orderBy('ticket')
            ->get();
    }

    private function traspasarLote(User $origen, User $dest, string $justificacion): void
    {
        foreach ($this->casosActivosDe($origen) as $c) {
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
