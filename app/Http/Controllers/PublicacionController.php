<?php

namespace App\Http\Controllers;

use App\Models\Publicacion;
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
            'desde' => 'nullable|date',
            'hasta' => 'nullable|date|after_or_equal:desde',
            'historial' => 'nullable|boolean',
        ]);

        // Por defecto se muestran los últimos 12 meses para no acumular
        // años en el panel; el historial completo sigue buscable.
        $recientes = false;
        if (empty($filtros['desde']) && empty($filtros['hasta']) && empty($filtros['historial'])) {
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
            'referencia_externa' => $p->referencia_externa,
            'ticket' => $p->denuncia?->ticket,
            'evento' => $p->evento,
            'fijada' => $p->fijada,
            'publicado_at' => $p->publicado_at?->format('Y-m-d H:i'),
            'archivos' => $p->archivos->map(fn($a) => [
                'nombre' => $a->nombre,
                'tamano' => $a->tamano,
            ])->toArray(),
        ]));

        return [
            'avisos' => $paginado,
            'tipos' => TipoPublicacion::activas()->orderBy('nombre')->get(['id', 'clave', 'nombre'])->toArray(),
            'recientes' => $recientes,
            'filtros' => [
                'tipo' => $filtros['tipo'] ?? '',
                'buscar' => $request->input('buscar', ''),
                'desde' => $request->input('desde', ''),
                'hasta' => $request->input('hasta', ''),
                'historial' => (bool) ($filtros['historial'] ?? false),
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
                'archivos:id,publicacion_id,nombre,tamano,mime_type',
                'denuncia:id,ticket,tipo',
            ]);

        if (!empty($filtros['tipo'])) {
            $query->whereHas('tipo', fn($q) => $q->where('clave', $filtros['tipo']));
        }

        if (!empty($filtros['buscar'])) {
            $buscar = mb_strtoupper(trim($filtros['buscar']));
            $query->where(function ($q) use ($buscar) {
                if ($this->usaFulltext($buscar)) {
                    $q->whereFullText(
                        ['cite', 'ref_titulo', 'resumen', 'referencia_externa', 'destinatario_display'],
                        $this->terminoFulltext($buscar),
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

        if (!empty($filtros['desde'])) {
            $query->whereDate('publicado_at', '>=', $filtros['desde']);
        }

        if (!empty($filtros['hasta'])) {
            $query->whereDate('publicado_at', '<=', $filtros['hasta']);
        }

        return $query;
    }

    /**
     * FULLTEXT solo en MySQL y términos de 3+ caracteres (SQLite de tests
     * y términos cortos usan LIKE). Evita el %texto% sobre todo el historial.
     */
    private function usaFulltext(string $buscar): bool
    {
        return \Illuminate\Support\Facades\Schema::getConnection()->getDriverName() === 'mysql'
            && mb_strlen($buscar) >= 3;
    }

    /**
     * Limpia operadores booleanos del input para no romper el MATCH.
     */
    private function terminoFulltext(string $buscar): string
    {
        return trim((string) preg_replace('/[+\-><\(\)~*\"@]+/u', ' ', $buscar));
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
}
