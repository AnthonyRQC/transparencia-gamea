<?php

namespace App\Data;

use Illuminate\Support\Str;

class EvaluacionData
{
    private const SESSION_KEY = 'evaluaciones_mock';
    private const ID_COUNTER_KEY = 'evaluacion_id_counter';

    public static function getAll(): array
    {
        return session()->get(self::SESSION_KEY, []);
    }

    public static function getByTicket(string $ticket): array
    {
        return array_values(array_filter(self::getAll(), fn($e) => ($e['ticket'] ?? '') === $ticket));
    }

    public static function find(int $id): ?array
    {
        foreach (self::getAll() as $e) {
            if (($e['id'] ?? 0) === $id) return $e;
        }
        return null;
    }

    public static function getActivasPorTecnico(string $tecnicoId): array
    {
        return array_values(array_filter(self::getAll(), fn($e) =>
            ($e['tecnico_id'] ?? '') === $tecnicoId && ($e['estado'] ?? '') === 'pendiente'
        ));
    }

    public static function getDevueltas(string $ticket): array
    {
        return array_values(array_filter(self::getAll(), fn($e) =>
            ($e['ticket'] ?? '') === $ticket && ($e['estado'] ?? '') === 'devuelta'
        ));
    }

    public static function findActivaByDenuncia(string $ticket): ?array
    {
        foreach (self::getAll() as $e) {
            if (($e['ticket'] ?? '') === $ticket && ($e['estado'] ?? '') === 'pendiente') {
                return $e;
            }
        }
        return null;
    }

    public static function add(array $data): int
    {
        $items = self::getAll();
        $id = session()->get(self::ID_COUNTER_KEY, 0) + 1;
        session()->put(self::ID_COUNTER_KEY, $id);

        $data['id'] = $id;
        $items[] = $data;
        session()->put(self::SESSION_KEY, $items);

        return $id;
    }

    public static function marcarDevuelta(int $id, string $texto, string $recomendacion, string $usuarioId): bool
    {
        $texto = $texto !== '' ? Str::upper($texto) : $texto;
        $items = self::getAll();
        foreach ($items as $i => $e) {
            if (($e['id'] ?? 0) === $id) {
                $items[$i]['texto_evaluacion'] = $texto;
                $items[$i]['recomendacion'] = $recomendacion;
                $items[$i]['devuelta_at'] = now()->toDateTimeString();
                $items[$i]['devuelta_por'] = $usuarioId;
                $items[$i]['estado'] = 'devuelta';
                session()->put(self::SESSION_KEY, $items);
                return true;
            }
        }
        return false;
    }

    public static function eliminarPorTicket(string $ticket): void
    {
        $items = self::getAll();
        $items = array_values(array_filter($items, fn($e) => ($e['ticket'] ?? '') !== $ticket));
        session()->put(self::SESSION_KEY, $items);
    }

    public static function seedDemoData(): void
    {
        $now = now();

        // DEN-2026-0013: en evaluacion_tecnica, pendiente de devolución
        self::add([
            'ticket' => 'DEN-2026-0013',
            'tecnico_id' => 'tec-2',
            'tecnico_nombre' => 'Ana Torres',
            'delegada_por' => 'jefe-1',
            'delegada_at' => (clone $now)->subDays(3)->toDateTimeString(),
            'justificacion_delegacion' => 'Denuncia compleja que requiere evaluación técnica especializada.',
            'texto_evaluacion' => null,
            'recomendacion' => null,
            'devuelta_at' => null,
            'devuelta_por' => null,
            'estado' => 'pendiente',
        ]);

        // DEN-2026-0014: ingresada con evaluación devuelta (recomendación: admitir)
        self::add([
            'ticket' => 'DEN-2026-0014',
            'tecnico_id' => 'tec-1',
            'tecnico_nombre' => 'Carlos Quispe',
            'delegada_por' => 'jefe-1',
            'delegada_at' => (clone $now)->subDays(5)->toDateTimeString(),
            'justificacion_delegacion' => 'Evaluación preliminar solicitada por el Jefe.',
            'texto_evaluacion' => 'La denuncia presenta elementos suficientes para ser admitida. Los hechos descritos coinciden con el patrón de cohecho reportado en otras denuncias similares. La documentación adjunta es consistente y los testigos están identificados. Se recomienda admitir la denuncia para investigación formal.',
            'recomendacion' => 'admitir',
            'devuelta_at' => (clone $now)->subDays(3)->toDateTimeString(),
            'devuelta_por' => 'tec-1',
            'estado' => 'devuelta',
        ]);
    }
}
