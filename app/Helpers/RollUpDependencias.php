<?php

namespace App\Helpers;

use App\Models\DependenciaExterna;
use Illuminate\Support\Collection;

class RollUpDependencias
{
    /**
     * Devuelve las dependencias ordenadas por total acumulado (roll-up del árbol),
     * excluyendo las raíces (parent_id = null) para que GAMEA no domine el Top.
     *
     * El total de un nodo = suma de sus solicitudes directas + las de todos sus
     * descendientes (unidad → dirección → secretaría → ...). Fix B2.
     *
     * @param array<int,int> $directos map dependencia_id => conteo directo (solicitudes)
     * @return array<int,array{id:int,nombre:string,total:int}>
     */
    public static function top(array $directos, int $limite = 8): array
    {
        $nodos = DependenciaExterna::where('activa', true)
            ->get(['id', 'parent_id', 'nombre'])
            ->keyBy('id');

        $rollUp = $directos;

        $hijos = [];
        foreach ($nodos as $nodo) {
            $hijos[$nodo->parent_id ?? 0][] = $nodo->id;
        }

        $acumular = function (int $id) use (&$acumular, &$rollUp, $hijos): int {
            $total = $rollUp[$id] ?? 0;
            foreach ($hijos[$id] ?? [] as $hijoId) {
                $total += $acumular($hijoId);
            }
            $rollUp[$id] = $total;

            return $total;
        };

        foreach ($nodos as $nodo) {
            if ($nodo->parent_id === null) {
                $acumular($nodo->id);
            }
        }

        return $nodos
            ->filter(fn ($d) => $d->parent_id !== null)
            ->map(fn ($d) => [
                'id' => $d->id,
                'nombre' => $d->nombre,
                'total' => $rollUp[$d->id] ?? 0,
            ])
            ->filter(fn ($i) => $i['total'] > 0)
            ->sortByDesc('total')
            ->values()
            ->take($limite)
            ->toArray();
    }
}
