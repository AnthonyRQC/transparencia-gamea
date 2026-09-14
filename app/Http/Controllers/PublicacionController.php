<?php

namespace App\Http\Controllers;

use App\Models\Bitacora;
use App\Models\PrioridadPublicacion;
use App\Models\Publicacion;
use App\Models\PublicacionArchivo;
use App\Models\TipoPublicacion;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PublicacionController extends Controller
{
    /**
     * Datos del muro para Welcome (Sprint 13.1). Todo anonimizado:
     * ticket completo sin PIN, sin denunciante/denunciados/hechos.
     *
     * @return array{avisos: array, tipos: array}
     */
    public function muroData(Request $request): array
    {
        $filtros = $request->validate([
            'tipo' => 'nullable|string|max:50',
            'buscar' => 'nullable|string|max:140',
            'cite' => 'nullable|string|max:255',
            'ref' => 'nullable|string|max:140',
            'destinatario' => 'nullable|string|max:255',
            'ref_externa' => 'nullable|string|max:255',
            'ticket' => 'nullable|string|max:50',
            'emisor' => 'nullable|string|max:255',
            'desde' => 'nullable|date',
            'hasta' => 'nullable|date|after_or_equal:desde',
            'historial' => 'nullable',
        ]);

        // $request->boolean() acepta 1/true/on/yes (la regla boolean es estricta).
        $verHistorial = $request->boolean('historial');

        // Por defecto se muestran los últimos 12 meses para no acumular
        // años en el panel; el historial completo sigue buscable.
        $recientes = false;
        if (empty($filtros['desde']) && empty($filtros['hasta']) && !$verHistorial) {
            $filtros['desde'] = now()->subMonths(12)->toDateString();
            $recientes = true;
        }

        $query = $this->baseQuery($filtros);

        $paginado = $query->paginate(10);
        $paginado->setCollection($paginado->getCollection()->map(fn(Publicacion $p) => [
            'id' => $p->id,
            'tipo' => $p->tipo?->clave,
            'tipo_nombre' => $p->tipo?->nombre,
            'prioridad' => $p->prioridad?->clave,
            'cite' => $p->cite,
            'fecha_documento' => $p->fecha_documento?->format('Y-m-d'),
            'emisor' => $p->emisor,
            'destinatario' => $p->destinatario_display,
            'titulo' => $p->ref_titulo,
            'resumen' => $p->resumen,
            'cuerpo' => $p->cuerpo,
            'referencia_externa' => $p->referencia_externa,
            'ticket' => $p->denuncia?->ticket,
            'evento' => $p->evento,
            'fijada' => $p->fijada,
            'portada_archivo_id' => $p->portada_archivo_id,
            'publicado_at' => $p->publicado_at?->format('Y-m-d H:i'),
            'archivos' => $p->archivos->map(fn($a) => [
                'id' => $a->id,
                'nombre' => $a->nombre,
                'tamano' => $a->tamano,
                'mime' => $a->mime_type,
            ])->toArray(),
        ]));

        return [
            'avisos' => $paginado,
            'tipos' => TipoPublicacion::activas()->orderBy('nombre')->get(['id', 'clave', 'nombre'])->toArray(),
            'recientes' => $recientes,
            'filtros' => [
                'tipo' => $filtros['tipo'] ?? '',
                'buscar' => $request->input('buscar', ''),
                'cite' => $request->input('cite', ''),
                'ref' => $request->input('ref', ''),
                'destinatario' => $request->input('destinatario', ''),
                'ref_externa' => $request->input('ref_externa', ''),
                'ticket' => $request->input('ticket', ''),
                'emisor' => $request->input('emisor', ''),
                'desde' => $request->input('desde', ''),
                'hasta' => $request->input('hasta', ''),
                'historial' => $verHistorial,
            ],
        ];
    }

    /**
     * Base filtrada del muro (fijadas primero por orden manual, resto recientes).
     */
    private function baseQuery(array $filtros)
    {
        $query = Publicacion::muro()
            ->with([
                'tipo:id,clave,nombre',
                'prioridad:id,clave,nombre',
                'archivos' => fn($q) => $q->activos()->select('id', 'publicacion_id', 'nombre', 'tamano', 'mime_type'),
                'denuncia:id,ticket,tipo',
            ]);

        if (!empty($filtros['tipo'])) {
            $query->whereHas('tipo', fn($q) => $q->where('clave', $filtros['tipo']));
        }

        if (!empty($filtros['buscar'])) {
            $termino = $this->terminoFulltext(mb_strtoupper(trim($filtros['buscar'])));
            $query->where(function ($q) use ($filtros, $termino) {
                $buscar = mb_strtoupper(trim($filtros['buscar']));
                if ($termino !== '' && $this->usaFulltext()) {
                    $q->whereFullText(
                        ['cite', 'ref_titulo', 'resumen', 'referencia_externa', 'destinatario_display'],
                        $termino,
                        ['mode' => 'boolean']
                    );
                } else {
                    $q->where('cite', 'like', "%{$buscar}%")
                        ->orWhere('ref_titulo', 'like', "%{$buscar}%")
                        ->orWhere('resumen', 'like', "%{$buscar}%")
                        ->orWhere('referencia_externa', 'like', "%{$buscar}%")
                        ->orWhere('destinatario_display', 'like', "%{$buscar}%");
                }
                $q->orWhereHas('denuncia', fn($dq) => $dq->where('ticket', 'like', "%{$buscar}%"));
            });
        }

        // Búsqueda avanzada por campo (AND entre sí y con la caja general).
        foreach ([
            'cite' => 'cite',
            'ref' => 'ref_titulo',
            'destinatario' => 'destinatario_display',
            'ref_externa' => 'referencia_externa',
            'emisor' => 'emisor',
        ] as $param => $columna) {
            if (!empty($filtros[$param])) {
                $valor = mb_strtoupper(trim($filtros[$param]));
                $query->where($columna, 'like', "%{$valor}%");
            }
        }

        if (!empty($filtros['ticket'])) {
            $ticket = mb_strtoupper(trim($filtros['ticket']));
            $query->whereHas('denuncia', fn($dq) => $dq->where('ticket', 'like', "%{$ticket}%"));
        }

        if (!empty($filtros['desde'])) {
            $query->whereDate('publicado_at', '>=', $filtros['desde']);
        }

        if (!empty($filtros['hasta'])) {
            $query->whereDate('publicado_at', '<=', $filtros['hasta']);
        }

        return $query;
    }

    /**
     * FULLTEXT solo en MySQL (SQLite de tests usa LIKE).
     */
    private function usaFulltext(): bool
    {
        return \Illuminate\Support\Facades\Schema::getConnection()->getDriverName() === 'mysql';
    }

    /**
     * Semántica AND: cada palabra es requerida (+w1 +w2). Descarta tokens
     * cortos y stopwords ES; si no queda nada, se usa LIKE.
     */
    private function terminoFulltext(string $buscar): string
    {
        $limpio = trim((string) preg_replace('/[^\p{L}\p{N}]+/u', ' ', $buscar));
        if ($limpio === '') {
            return '';
        }

        $stopwords = ['de', 'la', 'el', 'en', 'y', 'a', 'los', 'las', 'del', 'se', 'con', 'por', 'para', 'al', 'una', 'uno', 'que', 'su', 'sus', 'lo', 'le', 'les', 'un'];
        $tokens = [];
        foreach (preg_split('/\s+/u', mb_strtolower($limpio)) ?: [] as $token) {
            if (mb_strlen($token) < 3 || in_array($token, $stopwords, true)) {
                continue;
            }
            $tokens[] = '+' . $token;
        }

        return implode(' ', array_unique($tokens));
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
        return in_array(\Illuminate\Support\Facades\Auth::user()->rol, ['jefe', 'registrador'], true);
    }

    private function redirigirSinPermiso()
    {
        return redirect()->route('dashboard')->with('error', 'Solo el Jefe de Unidad o el Registrador pueden gestionar avisos.');
    }

    public function index()
    {
        if (!$this->autorizado()) {
            return $this->redirigirSinPermiso();
        }

        $publicaciones = Publicacion::with(['tipo:id,clave,nombre', 'prioridad:id,clave,nombre', 'denuncia:id,ticket'])
            ->with(['archivos:id,publicacion_id,nombre,tamano,fecha_eliminacion'])
            ->withCount(['archivos as archivos_count' => fn($q) => $q->activos()])
            ->orderByRaw('publicado_at IS NULL DESC')
            ->orderByDesc('fijada')
            ->orderBy('orden')
            ->orderByDesc('publicado_at')
            ->get()
            ->map(fn(Publicacion $p) => [
                'id' => $p->id,
                'tipo_id' => $p->tipo_id,
                'tipo' => $p->tipo?->clave,
                'tipo_nombre' => $p->tipo?->nombre,
                'prioridad_id' => $p->prioridad_id,
                'prioridad' => $p->prioridad?->clave,
                'cite' => $p->cite,
                'fecha_documento' => $p->fecha_documento?->format('Y-m-d'),
                'emisor' => $p->emisor,
                'destinatario_display' => $p->destinatario_display,
                'ref_titulo' => $p->ref_titulo,
                'resumen' => $p->resumen,
                'cuerpo' => $p->cuerpo,
                'referencia_externa' => $p->referencia_externa,
                'denuncia_id' => $p->denuncia_id,
                'evento' => $p->evento,
                'ticket' => $p->denuncia?->ticket,
                'publicado' => $p->publicado_at !== null,
                'publicado_at' => $p->publicado_at?->format('Y-m-d H:i'),
                'fijada' => $p->fijada,
                'orden' => $p->orden,
                'portada_archivo_id' => $p->portada_archivo_id,
                'archivos_count' => $p->archivos_count,
                'archivos' => $p->archivos->map(fn($a) => [
                    'id' => $a->id,
                    'nombre' => $a->nombre,
                    'tamano' => $a->tamano,
                    'eliminado' => $a->fecha_eliminacion !== null,
                    'fecha_eliminacion' => $a->fecha_eliminacion?->format('Y-m-d H:i'),
                ])->toArray(),
            ])->toArray();

        return Inertia::render('Admin/Publicaciones', [
            'publicaciones' => $publicaciones,
            'tipos' => TipoPublicacion::activas()->orderBy('nombre')->get(['id', 'clave', 'nombre'])->toArray(),
            'prioridades' => PrioridadPublicacion::activas()->orderBy('nombre')->get(['id', 'clave', 'nombre'])->toArray(),
        ]);
    }

    private function reglas(): array
    {
        return [
            'tipo_id' => 'required|exists:tipos_publicacion,id',
            'prioridad_id' => 'required|exists:prioridades_publicacion,id',
            'cite' => 'nullable|string|max:255',
            'fecha_documento' => 'nullable|date',
            'emisor' => 'required|string|max:255',
            'destinatario_display' => 'nullable|string|max:255',
            'ref_titulo' => 'required|string|max:140',
            'resumen' => 'nullable|string|max:2000',
            'cuerpo' => 'nullable|string',
            'referencia_externa' => 'nullable|string|max:255',
            'denuncia_id' => 'nullable|exists:denuncias,id',
            'evento' => 'nullable|in:admitida,rechazada,cerrada',
            'publicar' => 'boolean',
            'portada_archivo_id' => 'nullable|exists:publicacion_archivos,id',
            'archivos' => 'nullable|array|max:5',
            'archivos.*' => 'file|mimes:pdf,jpg,jpeg,png,webp|max:20480',
        ];
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

    /**
     * El editor rico manda '<p></p>' vacío: se normaliza a null para que la
     * regla cuerpo-o-archivo funcione.
     */
    private function normalizarCuerpo(?string $cuerpo): ?string
    {
        if ($cuerpo === null) {
            return null;
        }
        $texto = trim(strip_tags($cuerpo));
        return $texto === '' ? null : $cuerpo;
    }

    private function validarPortada(Publicacion $publicacion, $portadaId): ?string
    {
        if (!$portadaId) {
            return null;
        }
        $valida = $publicacion->archivos()->activos()->whereKey($portadaId)->exists();
        return $valida ? null : 'La portada debe ser una imagen activa de este aviso.';
    }

    private function guardarArchivo(Publicacion $publicacion, $file): void
    {
        $path = $file->store('publicaciones', 'public');
        $bytes = $file->getSize() ?: 0;

        $publicacion->archivos()->create([
            'nombre' => $file->getClientOriginalName(),
            'path' => $path,
            'mime_type' => $file->getMimeType(),
            'tamano' => $this->tamanoLegible($bytes),
            'hash' => hash_file('sha256', $file->getRealPath()),
        ]);
    }

    private function tamanoLegible(int $bytes): string
    {
        if ($bytes >= 1048576) {
            return number_format($bytes / 1048576, 1) . ' MB';
        }
        if ($bytes >= 1024) {
            return number_format($bytes / 1024, 0) . ' KB';
        }
        return $bytes . ' B';
    }

    public function store(Request $request)
    {
        if (!$this->autorizado()) {
            return $this->redirigirSinPermiso();
        }

        $data = $request->validate($this->reglas());

        if ($error = $this->validarDuplicadoCaso($data['denuncia_id'] ?? null, $data['evento'] ?? null)) {
            return back()->withErrors(['evento' => $error]);
        }

        $data['cuerpo'] = $this->normalizarCuerpo($data['cuerpo'] ?? null);

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
            $this->guardarArchivo($publicacion, $file);
        }

        $this->logBitacora($publicacion->id, $publicar ? 'publicar' : 'crear-borrador', ['titulo' => $publicacion->ref_titulo]);

        return back()->with('success', $publicar ? 'Aviso publicado correctamente.' : 'Borrador guardado correctamente.');
    }

    public function update(Request $request, int $id)
    {
        if (!$this->autorizado()) {
            return $this->redirigirSinPermiso();
        }

        $publicacion = Publicacion::findOrFail($id);
        $data = $request->validate($this->reglas());
        $data['portada_archivo_id'] = $data['portada_archivo_id'] ?? null;

        $data['cuerpo'] = $this->normalizarCuerpo($data['cuerpo'] ?? null);

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
            $this->guardarArchivo($publicacion, $file);
        }

        $this->logBitacora($publicacion->id, 'editar', ['titulo' => $publicacion->ref_titulo]);

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
        $this->logBitacora($id, 'publicar', ['titulo' => $publicacion->ref_titulo]);

        return back()->with('success', 'Aviso publicado correctamente.');
    }

    public function despublicar(int $id)
    {
        if (!$this->autorizado()) {
            return $this->redirigirSinPermiso();
        }

        $publicacion = Publicacion::findOrFail($id);
        $publicacion->update(['publicado_at' => null]);
        $this->logBitacora($id, 'despublicar', ['titulo' => $publicacion->ref_titulo]);

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
        $this->logBitacora($id, 'eliminar', ['titulo' => $titulo, 'archivos_preservados' => $nombres]);

        return back()->with('success', 'Aviso eliminado correctamente.');
    }

    /**
     * Quita un adjunto del muro sin borrar el físico (historial + auditoría).
     */
    public function quitarArchivo(int $id)
    {
        if (!$this->autorizado()) {
            return $this->redirigirSinPermiso();
        }

        $archivo = PublicacionArchivo::activos()->findOrFail($id);
        $archivo->update(['fecha_eliminacion' => now()]);
        $this->logBitacora($archivo->publicacion_id, 'quitar-adjunto', ['archivo' => $archivo->nombre]);

        return back()->with('success', "Adjunto '{$archivo->nombre}' quitado del muro (se conserva en historial).");
    }

    public function descargarArchivo(int $id)
    {
        if (!$this->autorizado()) {
            return $this->redirigirSinPermiso();
        }

        $archivo = PublicacionArchivo::activos()->findOrFail($id);

        if (!\Illuminate\Support\Facades\Storage::disk('public')->exists($archivo->path)) {
            return back()->with('error', 'Archivo no encontrado en el almacenamiento.');
        }

        return \Illuminate\Support\Facades\Storage::disk('public')->download($archivo->path, $archivo->nombre);
    }

    /**
     * Descarga pública para usuarios externos (Sprint 13.1): solo adjuntos
     * activos de avisos publicados. Sin auth.
     */
    public function descargarPublico(int $id)
    {
        $archivo = PublicacionArchivo::activos()->findOrFail($id);
        $publicacion = $archivo->publicacion;

        if (!$publicacion || $publicacion->publicado_at === null) {
            abort(404);
        }

        if (!\Illuminate\Support\Facades\Storage::disk('public')->exists($archivo->path)) {
            abort(404);
        }

        return \Illuminate\Support\Facades\Storage::disk('public')->download($archivo->path, $archivo->nombre);
    }

    private function logBitacora(int $id, string $accion, array $detalle): void
    {
        Bitacora::create([
            'entidad_tipo' => 'App\Models\Publicacion',
            'entidad_id' => $id,
            'accion' => $accion,
            'detalle' => json_encode($detalle),
            'usuario_id' => \Illuminate\Support\Facades\Auth::id(),
            'fecha' => now(),
        ]);
    }
}
