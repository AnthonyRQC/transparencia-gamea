<?php

namespace App\Queries\Publicacion;

use App\Models\Publicacion;
use App\Models\TipoPublicacion;
use Illuminate\Http\Request;

class MuroQuery
{
    /**
     * Datos del muro para Welcome (Sprint 13.1). Todo anonimizado:
     * ticket completo sin PIN, sin denunciante/denunciados/hechos.
     *
     * @return array{avisos: array, tipos: array}
     */
    public static function construir(Request $request): array
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

        $query = self::baseQuery($filtros);

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
    private static function baseQuery(array $filtros)
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
            $termino = self::terminoFulltext(mb_strtoupper(trim($filtros['buscar'])));
            $query->where(function ($q) use ($filtros, $termino) {
                $buscar = mb_strtoupper(trim($filtros['buscar']));
                if ($termino !== '' && self::usaFulltext()) {
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
    private static function usaFulltext(): bool
    {
        return \Illuminate\Support\Facades\Schema::getConnection()->getDriverName() === 'mysql';
    }

    /**
     * Semántica AND: cada palabra es requerida (+w1 +w2). Descarta tokens
     * cortos y stopwords ES; si no queda nada, se usa LIKE.
     */
    public static function terminoFulltext(string $buscar): string
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
}
