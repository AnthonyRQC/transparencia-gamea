<?php

namespace App\Http\Controllers;

use App\Http\Requests\PublicacionRequest;
use App\Models\Denuncia;
use App\Models\Publicacion;
use App\Queries\Publicacion\MuroQuery;
use App\Queries\Publicacion\PublicacionAdminQuery;
use App\Services\AvisoCaso;
use App\Services\BitacoraService;
use App\Services\PublicacionArchivoService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PublicacionController extends Controller
{
    public function muroData(Request $request): array
    {
        return MuroQuery::construir($request);
    }

    private function terminoFulltext(string $buscar): string
    {
        return MuroQuery::terminoFulltext($buscar);
    }

    public function muro(Request $request): Response
    {
        return Inertia::render('Welcome', [
            'canLogin' => \Illuminate\Support\Facades\Route::has('login'),
            'laravelVersion' => \Illuminate\Foundation\Application::VERSION,
            'phpVersion' => PHP_VERSION,
            'panel' => $this->muroData($request),
        ]);
    }

    // ============================================================
    // ADMIN (Sprint 13.2) — Jefe + Registrador (formal en Sprint 16)
    // ============================================================

    private function autorizado(): bool
    {
        return \App\Services\PermisosEfectivos::puede(\Illuminate\Support\Facades\Auth::user(), 'menu.publicaciones');
    }

    private function redirigirSinPermiso()
    {
        return redirect()->route('dashboard')->with('error', 'NO TIENES PERMISO PARA ESA SECCIÓN.');
    }

    public function index()
    {
        if (!$this->autorizado()) {
            return $this->redirigirSinPermiso();
        }

        return Inertia::render('Admin/Publicaciones', PublicacionAdminQuery::construir());
    }

    private function validarDuplicadoCaso(?int $denunciaId, ?string $evento, ?int $ignorarId = null): ?string
    {
        if (!$denunciaId || !$evento) {
            return null;
        }

        $existe = Publicacion::where('denuncia_id', $denunciaId)
            ->where('evento', $evento)
            ->when($ignorarId, fn($q) => $q->where('id', '!=', $ignorarId))
            ->exists();

        return $existe ? 'Ya existe un aviso publicado para este caso y evento.' : null;
    }

    private function validarPortada(Publicacion $publicacion, $portadaId): ?string
    {
        if (!$portadaId) {
            return null;
        }
        $valida = $publicacion->archivos()->activos()->whereKey($portadaId)->exists();
        return $valida ? null : 'La portada debe ser una imagen activa de este aviso.';
    }

    public function store(PublicacionRequest $request)
    {
        if (!$this->autorizado()) {
            return $this->redirigirSinPermiso();
        }

        $data = $request->validated();

        if ($error = $this->validarDuplicadoCaso($data['denuncia_id'] ?? null, $data['evento'] ?? null)) {
            return back()->withErrors(['evento' => $error]);
        }

        $data['cuerpo'] = $request->normalizarCuerpo($data['cuerpo'] ?? null);

        if (blank($data['cuerpo']) && !$request->hasFile('archivos')) {
            return back()->withErrors(['cuerpo' => 'Escriba el contenido o adjunte un documento (PDF/imagen).']);
        }

        $publicar = (bool) ($data['publicar'] ?? false);

        $publicacion = Publicacion::create([
            ...collect($data)->except(['publicar', 'archivos', 'portada_archivo_id'])->toArray(),
            'publicado_por_id' => $publicar ? \Illuminate\Support\Facades\Auth::id() : null,
            'publicado_at' => $publicar ? now() : null,
        ]);

        foreach ($request->file('archivos', []) as $file) {
            PublicacionArchivoService::guardarArchivo($publicacion, $file);
        }

        BitacoraService::registrar('App\Models\Publicacion', $publicacion->id, $publicar ? 'publicar' : 'crear-borrador', ['titulo' => $publicacion->ref_titulo]);

        return back()->with('success', $publicar ? 'Aviso publicado correctamente.' : 'Borrador guardado correctamente.');
    }

    public function update(PublicacionRequest $request, int $id)
    {
        if (!$this->autorizado()) {
            return $this->redirigirSinPermiso();
        }

        $publicacion = Publicacion::findOrFail($id);
        $data = $request->validated();
        $data['portada_archivo_id'] = $data['portada_archivo_id'] ?? null;

        $data['cuerpo'] = $request->normalizarCuerpo($data['cuerpo'] ?? null);

        if (blank($data['cuerpo']) && !$request->hasFile('archivos') && $publicacion->archivos()->activos()->count() === 0) {
            return back()->withErrors(['cuerpo' => 'Escriba el contenido o adjunte un documento (PDF/imagen).']);
        }

        if ($error = $this->validarDuplicadoCaso($data['denuncia_id'] ?? null, $data['evento'] ?? null, $publicacion->id)) {
            return back()->withErrors(['evento' => $error]);
        }

        if ($error = $this->validarPortada($publicacion, $data['portada_archivo_id'] ?? null)) {
            return back()->withErrors(['portada_archivo_id' => $error]);
        }

        $nuevos = count($request->file('archivos', []));
        if ($nuevos > 0 && $publicacion->archivos()->activos()->count() + $nuevos > 5) {
            return back()->withErrors(['archivos' => 'Máximo 5 adjuntos por aviso.']);
        }

        $publicar = (bool) ($data['publicar'] ?? false);

        $publicacion->update([
            ...collect($data)->except(['publicar', 'archivos'])->toArray(),
            'publicado_por_id' => $publicar ? (\Illuminate\Support\Facades\Auth::id()) : $publicacion->publicado_por_id,
            'publicado_at' => $publicar ? ($publicacion->publicado_at ?? now()) : null,
        ]);

        foreach ($request->file('archivos', []) as $file) {
            PublicacionArchivoService::guardarArchivo($publicacion, $file);
        }

        BitacoraService::registrar('App\Models\Publicacion', $publicacion->id, 'editar', ['titulo' => $publicacion->ref_titulo]);

        return back()->with('success', 'Aviso actualizado correctamente.');
    }

    public function publicar(int $id)
    {
        if (!$this->autorizado()) {
            return $this->redirigirSinPermiso();
        }

        $publicacion = Publicacion::findOrFail($id);
        $publicacion->update([
            'publicado_por_id' => \Illuminate\Support\Facades\Auth::id(),
            'publicado_at' => $publicacion->publicado_at ?? now(),
        ]);
        BitacoraService::registrar('App\Models\Publicacion', $id, 'publicar', ['titulo' => $publicacion->ref_titulo]);

        return back()->with('success', 'Aviso publicado correctamente.');
    }

    public function despublicar(int $id)
    {
        if (!$this->autorizado()) {
            return $this->redirigirSinPermiso();
        }

        $publicacion = Publicacion::findOrFail($id);
        $publicacion->update(['publicado_at' => null]);
        BitacoraService::registrar('App\Models\Publicacion', $id, 'despublicar', ['titulo' => $publicacion->ref_titulo]);

        return back()->with('success', 'Aviso devuelto a borrador.');
    }

    public function fijar(int $id)
    {
        if (!$this->autorizado()) {
            return $this->redirigirSinPermiso();
        }

        $max = Publicacion::where('fijada', true)->max('orden') ?? 0;
        Publicacion::findOrFail($id)->update(['fijada' => true, 'orden' => $max + 1]);

        return back()->with('success', 'Aviso fijado en el panel.');
    }

    public function desfijar(int $id)
    {
        if (!$this->autorizado()) {
            return $this->redirigirSinPermiso();
        }

        Publicacion::findOrFail($id)->update(['fijada' => false, 'orden' => 0]);

        return back()->with('success', 'Aviso desfijado.');
    }

    public function mover(int $id, Request $request)
    {
        if (!$this->autorizado()) {
            return $this->redirigirSinPermiso();
        }

        $direccion = $request->validate(['direccion' => 'required|in:subir,bajar'])['direccion'];
        $actual = Publicacion::findOrFail($id);

        if (!$actual->fijada) {
            return back()->withErrors(['error' => 'Solo se puede ordenar avisos fijados.']);
        }

        $vecino = Publicacion::where('fijada', true)
            ->when($direccion === 'subir', fn($q) => $q->where('orden', '<', $actual->orden)->orderByDesc('orden'))
            ->when($direccion === 'bajar', fn($q) => $q->where('orden', '>', $actual->orden)->orderBy('orden'))
            ->first();

        if ($vecino) {
            [$actual->orden, $vecino->orden] = [$vecino->orden, $actual->orden];
            $actual->save();
            $vecino->save();
        }

        return back();
    }

    public function destroy(int $id)
    {
        if (!$this->autorizado()) {
            return $this->redirigirSinPermiso();
        }

        $publicacion = Publicacion::findOrFail($id);
        // Los físicos se preservan como historial (auditoría Sprint 17);
        // solo se marcan eliminados. El aviso sí se elimina.
        $nombres = $publicacion->archivos()->activos()->pluck('nombre')->toArray();
        $publicacion->archivos()->activos()->update(['fecha_eliminacion' => now()]);
        $titulo = $publicacion->ref_titulo;
        $publicacion->delete();
        BitacoraService::registrar('App\Models\Publicacion', $id, 'eliminar', ['titulo' => $titulo, 'archivos_preservados' => $nombres]);

        return back()->with('success', 'Aviso eliminado correctamente.');
    }

    public function quitarArchivo(int $id)
    {
        if (!$this->autorizado()) {
            return $this->redirigirSinPermiso();
        }

        return PublicacionArchivoService::quitarArchivo($id);
    }

    public function descargarArchivo(int $id)
    {
        if (!$this->autorizado()) {
            return $this->redirigirSinPermiso();
        }

        return PublicacionArchivoService::descargarArchivo($id);
    }

    public function descargarPublico(int $id)
    {
        return PublicacionArchivoService::descargarPublico($id);
    }

    /**
     * Crea (o reutiliza) el borrador de aviso de un caso final
     * y redirige a Avisos con el form abierto (Sprint 13.3).
     */
    public function borradorDesdeCaso(string $ticket)
    {
        if (!$this->autorizado()) {
            return $this->redirigirSinPermiso();
        }

        $denuncia = Denuncia::where('ticket', $ticket)->firstOrFail();

        $evento = match ($denuncia->estado) {
            'rechazada' => 'rechazada',
            'cerrada' => 'cerrada',
            default => null,
        };

        if (!$evento) {
            return back()->withErrors(['error' => 'Este caso aún no tiene evento publicable (solo rechazadas y cerradas).']);
        }

        $borrador = AvisoCaso::borradorPara($denuncia, $evento);
        if (!$borrador) {
            return back()->withErrors(['error' => 'No se pudo crear el borrador (revise catálogos).']);
        }

        return redirect()
            ->route('admin.publicaciones.index', ['aviso' => $borrador->id])
            ->with('success', "Borrador de aviso listo para {$ticket} (revíselo y publíquelo).");
    }
}
