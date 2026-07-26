<?php

namespace App\Data;

use Carbon\Carbon;
use Illuminate\Support\Str;

class ArchivoData
{
    private const SESSION_KEY = 'archivos_mock';
    private const ID_COUNTER_KEY = 'archivo_id_counter';

    public static function getAll(): array
    {
        return session()->get(self::SESSION_KEY, []);
    }

    public static function getByDenuncia(string $ticket, ?string $contexto = null, ?int $contextoId = null): array
    {
        return array_values(array_filter(self::getAll(), fn($a) =>
            ($a['denuncia_ticket'] ?? '') === $ticket
            && empty($a['fecha_eliminacion'])
            && ($contexto === null || ($a['contexto'] ?? '') === $contexto)
            && ($contextoId === null || ($a['contexto_id'] ?? null) === $contextoId)
        ));
    }

    public static function find(int $id): ?array
    {
        foreach (self::getAll() as $a) {
            if (($a['id'] ?? 0) === $id) return $a;
        }
        return null;
    }

    public static function add(string $ticket, string $nombre, string $descripcion, string $contexto = 'general', ?string $mimeType = null, ?int $contextoId = null): int
    {
        $items = self::getAll();
        $id = session()->get(self::ID_COUNTER_KEY, 0) + 1;
        session()->put(self::ID_COUNTER_KEY, $id);

        $contextosValidos = ['registro', 'general', 'solicitud', 'descargo', 'informe', 'cierre'];
        $items[] = [
            'id' => $id,
            'denuncia_ticket' => $ticket,
            'nombre' => $nombre,
            'mime_type' => $mimeType ?? 'application/octet-stream',
            'tamano' => rand(100, 5000) . ' KB',
            'descripcion' => $descripcion !== '' ? Str::upper($descripcion) : null,
            'contexto' => in_array($contexto, $contextosValidos) ? $contexto : 'general',
            'contexto_id' => $contextoId,
            'fecha_subida' => Carbon::now()->toDateTimeString(),
            'fecha_eliminacion' => null,
        ];

        session()->put(self::SESSION_KEY, $items);
        return $id;
    }

    public static function softDelete(int $id): bool
    {
        $items = self::getAll();
        foreach ($items as $i => $a) {
            if (($a['id'] ?? 0) === $id) {
                if (!empty($a['fecha_eliminacion'])) return false;
                $items[$i]['fecha_eliminacion'] = Carbon::now()->toDateTimeString();
                session()->put(self::SESSION_KEY, $items);
                return true;
            }
        }
        return false;
    }
}
