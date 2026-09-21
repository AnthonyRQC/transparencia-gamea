<?php

namespace App\Queries\Publicacion;

use App\Models\PrioridadPublicacion;
use App\Models\Publicacion;
use App\Models\TipoPublicacion;

class PublicacionAdminQuery
{
    public static function construir(): array
    {
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

        return [
            'publicaciones' => $publicaciones,
            'tipos' => TipoPublicacion::activas()->orderBy('nombre')->get(['id', 'clave', 'nombre'])->toArray(),
            'prioridades' => PrioridadPublicacion::activas()->orderBy('nombre')->get(['id', 'clave', 'nombre'])->toArray(),
        ];
    }
}
